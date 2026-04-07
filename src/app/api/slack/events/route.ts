import { after } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';

import { logSlackEventIngest, processSlackChannelMessage } from '@/backend/slack/processSlackChannelMessage';
import { resolveWorkspaceForSlackTeam } from '@/backend/slack/resolveSlackWorkspace';
import type { SlackFile, SlackMessage } from '@/backend/slack/slackClient';
import { verifySlackRequestSignature } from '@/lib/slackVerifySignature';
import { logger } from '@/lib/logger';

/**
 * Slack Events API — instant ingest when someone posts in a watched channel.
 *
 * Slack app setup:
 * 1. api.slack.com/apps → your app → Event Subscriptions → On
 * 2. Request URL: https://YOUR_DOMAIN/api/slack/events (must respond to URL challenge)
 * 3. Subscribe to bot events: message.channels (and message.groups for private channels)
 * 4. Reinstall the app to the workspace after adding scopes
 * 5. Env: SLACK_SIGNING_SECRET (Basic Information → Signing Secret)
 *
 * Bot must be in each channel in SLACK_CHANNEL_IDS. Thread replies are ignored (same as “top-level post only”).
 * Cron (/api/cron/slack-ingest) can stay as a backup catch-up.
 */
export const maxDuration = 60;

type SlackEventCallbackBody = {
    type?: string;
    challenge?: string;
    team_id?: string;
    authorizations?: Array<{ team_id?: string }>;
    event?: Record<string, unknown>;
    event_id?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
    return v != null && typeof v === 'object' && !Array.isArray(v);
}

function toSlackMessage(ev: Record<string, unknown>): SlackMessage {
    return {
        ts: typeof ev.ts === 'string' ? ev.ts : undefined,
        text: typeof ev.text === 'string' ? ev.text : undefined,
        subtype: typeof ev.subtype === 'string' ? ev.subtype : undefined,
        thread_ts: typeof ev.thread_ts === 'string' ? ev.thread_ts : undefined,
        files: Array.isArray(ev.files) ? (ev.files as SlackFile[]) : undefined,
    };
}

function teamIdFromCallback(body: SlackEventCallbackBody): string {
    const direct = typeof body.team_id === 'string' ? body.team_id.trim() : '';
    if (direct) return direct;
    const a0 = body.authorizations?.[0];
    const fromAuth = typeof a0?.team_id === 'string' ? a0.team_id.trim() : '';
    return fromAuth;
}

async function handleEventCallback(body: SlackEventCallbackBody): Promise<void> {
    const teamId = teamIdFromCallback(body);
    if (!teamId) {
        logger.warn('slack-events-no-team-id', { eventId: body.event_id });
        return;
    }

    const evRaw = body.event;
    if (!isRecord(evRaw)) return;
    if (evRaw.type !== 'message') return;

    const channel = typeof evRaw.channel === 'string' ? evRaw.channel.trim() : '';
    if (!channel || (!channel.startsWith('C') && !channel.startsWith('G'))) return;

    const resolved = await resolveWorkspaceForSlackTeam(teamId);
    if (!resolved) {
        logger.info('slack-events-team-not-configured', { teamId, channel });
        return;
    }
    if (!resolved.ws.channelIds.includes(channel)) {
        return;
    }

    const msg = toSlackMessage(evRaw);
    const part = await processSlackChannelMessage({
        ws: resolved.ws,
        teamId: resolved.teamId,
        slackWorkspaceName: resolved.slackWorkspaceName,
        channelId: channel,
        msg,
    });
    logSlackEventIngest(teamId, channel, part);
    if (part.errors.length > 0) {
        logger.error('slack-events-ingest-errors', { errors: part.errors.slice(0, 5) });
    }
}

export async function POST(request: NextRequest) {
    const signingSecret = process.env.SLACK_SIGNING_SECRET?.trim();
    const rawBody = await request.text();
    const slackSig = request.headers.get('x-slack-signature') || '';
    const slackTs = request.headers.get('x-slack-request-timestamp') || '';

    let parsed: unknown;
    try {
        parsed = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const body = parsed as SlackEventCallbackBody;

    /** URL verification: respond first so Slack can show a green check (enables Save). Signature checked when secret is set. */
    if (body.type === 'url_verification' && typeof body.challenge === 'string') {
        if (
            signingSecret &&
            !verifySlackRequestSignature({
                signingSecret,
                slackSignature: slackSig,
                requestTimestamp: slackTs,
                rawBody,
            })
        ) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
        return NextResponse.json({ challenge: body.challenge });
    }

    if (!signingSecret) {
        return NextResponse.json({ error: 'SLACK_SIGNING_SECRET is not set' }, { status: 503 });
    }

    if (!verifySlackRequestSignature({ signingSecret, slackSignature: slackSig, requestTimestamp: slackTs, rawBody })) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (body.type === 'event_callback') {
        after(() =>
            handleEventCallback(body).catch((e) => {
                const msg = e instanceof Error ? e.message : String(e);
                logger.error('slack-events-handler-error', { message: msg });
            })
        );
        return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
}
