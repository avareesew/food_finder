import type { SlackIngestWorkspace } from '@/lib/slackIngestEnv';
import { slackOldestUnixString } from '@/lib/slackIngestEnv';
import { slackAuthTest, slackConversationsHistory } from '@/backend/slack/slackClient';
import { mergeProcessResult, processSlackChannelMessage } from '@/backend/slack/processSlackChannelMessage';
import { logger } from '@/lib/logger';

export type SlackWorkspaceSummary = {
    /** Env slot, e.g. primary / secondary */
    label: string;
    /** Slack workspace display name from auth.test, or label fallback */
    teamName: string;
    teamId: string;
};

export type SlackIngestSummary = {
    workspaces: number;
    /** One entry per configured workspace that authenticated */
    workspaceSummaries: SlackWorkspaceSummary[];
    channelsScanned: number;
    imageFilesConsidered: number;
    ingested: number;
    skippedAlreadySeen: number;
    skippedTooLarge: number;
    skippedNotImage: number;
    /** Plain-text Slack messages processed for multi-event extraction */
    textMessagesConsidered: number;
    textMessagesSkippedSeen: number;
    textEventsIngested: number;
    failed: number;
    errors: string[];
};

export async function runSlackIngest(workspaces: SlackIngestWorkspace[]): Promise<SlackIngestSummary> {
    const summary: SlackIngestSummary = {
        workspaces: workspaces.length,
        workspaceSummaries: [],
        channelsScanned: 0,
        imageFilesConsidered: 0,
        ingested: 0,
        skippedAlreadySeen: 0,
        skippedTooLarge: 0,
        skippedNotImage: 0,
        textMessagesConsidered: 0,
        textMessagesSkippedSeen: 0,
        textEventsIngested: 0,
        failed: 0,
        errors: [],
    };

    const oldest = slackOldestUnixString();

    for (const ws of workspaces) {
        logger.info('slack-ingest-workspace-start', { label: ws.label, channelCount: ws.channelIds.length });
        let teamId: string;
        let slackWorkspaceName = ws.label;
        try {
            const auth = await slackAuthTest(ws.botToken);
            teamId = auth.team_id;
            const t = auth.team;
            if (typeof t === 'string' && t.trim()) {
                slackWorkspaceName = t.trim();
            }
            summary.workspaceSummaries.push({
                label: ws.label,
                teamName: slackWorkspaceName,
                teamId,
            });
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            summary.errors.push(`[${ws.label}] auth: ${msg}`);
            summary.failed += 1;
            continue;
        }

        for (const channelId of ws.channelIds) {
            summary.channelsScanned += 1;
            let cursor: string | undefined;
            try {
                do {
                    const page = await slackConversationsHistory({
                        token: ws.botToken,
                        channel: channelId,
                        oldest,
                        cursor,
                    });

                    for (const msg of page.messages || []) {
                        const part = await processSlackChannelMessage({
                            ws,
                            teamId,
                            slackWorkspaceName,
                            channelId,
                            msg,
                        });
                        mergeProcessResult(summary, part);
                    }

                    cursor = page.response_metadata?.next_cursor?.trim() || undefined;
                } while (cursor);
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                summary.errors.push(`[${ws.label}] channel ${channelId}: ${msg}`);
                summary.failed += 1;
            }
        }
    }

    logger.info('slack-ingest-summary', {
        ingested: summary.ingested,
        textEventsIngested: summary.textEventsIngested,
        failed: summary.failed,
        skippedAlreadySeen: summary.skippedAlreadySeen,
    });
    return summary;
}
