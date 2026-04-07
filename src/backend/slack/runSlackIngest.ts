import type { SlackIngestWorkspace } from '@/lib/slackIngestEnv';
import { slackOldestUnixString } from '@/lib/slackIngestEnv';
import { ingestFlyerImageBytes } from '@/backend/flyers/ingestFlyerImageBytes';
import { persistSlackTextFlyer } from '@/backend/flyers/persistSlackTextFlyer';
import { extractEventsFromSlackMessageText } from '@/backend/openai/extractEventsFromSlackText';
import {
  downloadSlackPrivateFile,
  isSlackImageFile,
  slackAuthTest,
  slackConversationsHistory,
  type SlackFile,
} from '@/backend/slack/slackClient';
import {
  isSlackFileSeen,
  isSlackTextMessageSeen,
  markSlackFileSeen,
  markSlackTextMessageSeen,
} from '@/backend/slack/slackDedupe';
import { validateSlackTextExtractedEvent } from '@/lib/validateFlyerExtraction';
import { logger } from '@/lib/logger';

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

function pickMime(file: SlackFile, downloadContentType: string): string {
  const fromFile = (file.mimetype || '').trim();
  if (fromFile.startsWith('image/')) return fromFile;
  const ct = downloadContentType.split(';')[0]?.trim() || '';
  if (ct.startsWith('image/')) return ct;
  return 'image/jpeg';
}

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
            const files = msg.files || [];
            const imageFiles = files.filter((f: SlackFile) => isSlackImageFile(f) && Boolean(f.id));

            for (const file of files) {
              if (!isSlackImageFile(file)) {
                summary.skippedNotImage += 1;
                continue;
              }
              if (!file.id) continue;
              const size = typeof file.size === 'number' ? file.size : 0;
              if (size > MAX_IMAGE_BYTES) {
                summary.skippedTooLarge += 1;
                continue;
              }

              summary.imageFilesConsidered += 1;

              if (await isSlackFileSeen(teamId, file.id)) {
                summary.skippedAlreadySeen += 1;
                continue;
              }

              const url = file.url_private_download;
              if (!url) {
                summary.failed += 1;
                summary.errors.push(`[${ws.label}] file ${file.id}: no url_private_download`);
                continue;
              }

              try {
                const { bytes, contentType } = await downloadSlackPrivateFile(ws.botToken, url);
                if (bytes.byteLength > MAX_IMAGE_BYTES) {
                  summary.skippedTooLarge += 1;
                  continue;
                }

                const name = file.name || `slack_${file.id}.jpg`;
                const mime = pickMime(file, contentType);

                const result = await ingestFlyerImageBytes({
                  bytes,
                  originalFilename: name,
                  mimeType: mime,
                  meta: {
                    slackTeamId: teamId,
                    slackChannelId: channelId,
                    slackFileId: file.id,
                    slackMessageTs: msg.ts,
                    slackWorkspaceName,
                    slackWorkspaceLabel: ws.label,
                  },
                });

                const seenMeta: Record<string, string | number | null | undefined> = {
                  workspaceLabel: ws.label,
                  channelId,
                  messageTs: msg.ts ?? '',
                };

                if (!result.ok) {
                  seenMeta.rejectedReason = result.reason;
                  await markSlackFileSeen(teamId, file.id, seenMeta);
                  summary.failed += 1;
                  summary.errors.push(`[${ws.label}] ${file.id} ${name}: ${result.reason}`);
                  continue;
                }

                seenMeta.flyerId = result.mode === 'firebase' ? result.flyerId : result.recordId;
                await markSlackFileSeen(teamId, file.id, seenMeta);

                summary.ingested += 1;
              } catch (e) {
                summary.failed += 1;
                const errMsg = e instanceof Error ? e.message : String(e);
                summary.errors.push(`[${ws.label}] file ${file.id}: ${errMsg}`);
              }
            }

            /* Text-only messages: extract structured events without a flyer image */
            if (imageFiles.length === 0 && msg.ts) {
              const subtype = msg.subtype;
              if (
                subtype &&
                ['channel_join', 'channel_leave', 'group_join', 'channel_topic', 'pinned_item'].includes(subtype)
              ) {
                continue;
              }
              const rawText = typeof msg.text === 'string' ? msg.text.trim() : '';
              if (rawText.length < 40) continue;

              summary.textMessagesConsidered += 1;

              if (await isSlackTextMessageSeen(teamId, channelId, msg.ts)) {
                summary.textMessagesSkippedSeen += 1;
                continue;
              }

              try {
                const year = new Date().getFullYear();
                const { events, rawModelOutput } = await extractEventsFromSlackMessageText({
                  messageText: rawText,
                  nowYearHint: year,
                });

                let saved = 0;
                for (let i = 0; i < events.length; i++) {
                  const ev = events[i];
                  const v = validateSlackTextExtractedEvent(ev);
                  if (!v.ok) continue;

                  const persisted = await persistSlackTextFlyer({
                    extractedEvent: ev,
                    rawModelOutput,
                    slackChannelId: channelId,
                    slackTeamId: teamId,
                    slackMessageTs: msg.ts!,
                    slackWorkspaceName,
                    slackWorkspaceLabel: ws.label,
                    eventIndex: i,
                  });
                  if (persisted.mode === 'firebase' && 'flyerId' in persisted) {
                    saved += 1;
                    summary.textEventsIngested += 1;
                  }
                }

                await markSlackTextMessageSeen(teamId, channelId, msg.ts, {
                  workspaceLabel: ws.label,
                  channelId,
                  messageTs: msg.ts ?? '',
                  eventsExtracted: saved,
                });
              } catch (e) {
                summary.failed += 1;
                const errMsg = e instanceof Error ? e.message : String(e);
                summary.errors.push(`[${ws.label}] text msg ${msg.ts}: ${errMsg}`);
              }
            }
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
