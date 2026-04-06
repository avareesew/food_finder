'use server';

import { getSlackIngestWorkspaces } from '@/lib/slackIngestEnv';
import { runSlackIngest, type SlackIngestSummary } from '@/backend/slack/runSlackIngest';

export type SlackSyncResult =
  | { ok: true; disabled: true; message: string }
  | { ok: true; summary: SlackIngestSummary }
  | { ok: false; error: string };

/**
 * Runs the same ingest as GET /api/cron/slack-ingest, without exposing CRON_SECRET to the browser.
 * Set SLACK_ALLOW_UI_SYNC=false in production if you only want cron (or curl) to trigger ingest.
 */
export async function syncFlyersFromSlack(): Promise<SlackSyncResult> {
  if (process.env.SLACK_ALLOW_UI_SYNC === 'false') {
    return {
      ok: false,
      error: 'Slack sync from this page is turned off (SLACK_ALLOW_UI_SYNC=false). Use the cron route or curl with CRON_SECRET.',
    };
  }

  const workspaces = getSlackIngestWorkspaces();
  if (workspaces.length === 0) {
    return {
      ok: true,
      disabled: true,
      message:
        'Slack is not configured. Set SLACK_BOT_TOKEN and SLACK_CHANNEL_IDS in your .env file (channels listed there are the only ones scanned).',
    };
  }

  try {
    const summary = await runSlackIngest(workspaces);
    return { ok: true, summary };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Slack sync failed.',
    };
  }
}
