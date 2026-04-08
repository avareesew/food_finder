import { NextRequest, NextResponse } from 'next/server';

import { requireAdminSession, respondAdminRouteError } from '@/backend/auth/requireAdmin';
import { runSlackIngest } from '@/backend/slack/runSlackIngest';
import { getSlackIngestWorkspaces } from '@/lib/slackIngestEnv';
import { logger } from '@/lib/logger';

/** Same work as cron; admin-only. Ignores SLACK_ALLOW_UI_SYNC (that flag applied only to the old upload-page action). */
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession(request);
  } catch (error) {
    return respondAdminRouteError(error);
  }

  const workspaces = getSlackIngestWorkspaces();
  if (workspaces.length === 0) {
    return NextResponse.json({
      ok: true,
      disabled: true,
      message:
        'Slack is not configured. Set SLACK_BOT_TOKEN and SLACK_CHANNEL_IDS (and optional _2 variants). Only those channel IDs are scanned.',
    });
  }

  logger.info('admin-slack-ingest-start', { workspaceCount: workspaces.length });
  try {
    const summary = await runSlackIngest(workspaces);
    logger.info('admin-slack-ingest-complete', { ingested: summary.ingested });
    return NextResponse.json({ ok: true, summary });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Slack ingest failed';
    logger.error('admin-slack-ingest-error', { message: msg });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
