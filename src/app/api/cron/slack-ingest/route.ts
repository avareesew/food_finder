import { NextRequest, NextResponse } from 'next/server';

import { getSlackIngestWorkspaces } from '@/lib/slackIngestEnv';
import { runSlackIngest } from '@/backend/slack/runSlackIngest';
import { logger } from '@/lib/logger';

/** Slack history + OpenAI can exceed default Vercel timeout; raise in the dashboard if you hit limits. */
export const maxDuration = 60;

function authorizeCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV === 'development';
  }
  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  const q = request.nextUrl.searchParams.get('secret');
  return q === secret;
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaces = getSlackIngestWorkspaces();
  if (workspaces.length === 0) {
    return NextResponse.json({
      ok: true,
      disabled: true,
      message:
        'No Slack workspaces configured. Set SLACK_BOT_TOKEN + SLACK_CHANNEL_IDS (and optionally SLACK_BOT_TOKEN_2 + SLACK_CHANNEL_IDS_2).',
    });
  }

  logger.info('slack-ingest-start', { workspaceCount: workspaces.length });
  try {
    const summary = await runSlackIngest(workspaces);
    logger.info('slack-ingest-complete', { summary });
    return NextResponse.json({ ok: true, ...summary });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Slack ingest failed';
    logger.error('slack-ingest-error', { message: msg });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
