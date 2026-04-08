import type { SlackIngestWorkspace } from '@/lib/slackIngestEnv';
import { ingestFlyerImageBytes } from '@/backend/flyers/ingestFlyerImageBytes';
import { persistSlackTextFlyer } from '@/backend/flyers/persistSlackTextFlyer';
import { extractEventsFromSlackMessageText } from '@/backend/openai/extractEventsFromSlackText';
import { downloadSlackPrivateFile, isSlackImageFile, type SlackFile, type SlackMessage } from '@/backend/slack/slackClient';
import {
    isSlackFileSeen,
    isSlackTextMessageSeen,
    markSlackFileSeen,
    markSlackTextMessageSeen,
} from '@/backend/slack/slackDedupe';
import { validateSlackTextExtractedEvent } from '@/lib/validateFlyerExtraction';
import { logger } from '@/lib/logger';

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

const SKIP_TEXT_SUBTYPES = [
    'channel_join',
    'channel_leave',
    'group_join',
    'channel_topic',
    'pinned_item',
];

function pickMime(file: SlackFile, downloadContentType: string): string {
    const fromFile = (file.mimetype || '').trim();
    if (fromFile.startsWith('image/')) return fromFile;
    const ct = downloadContentType.split(';')[0]?.trim() || '';
    if (ct.startsWith('image/')) return ct;
    return 'image/jpeg';
}

export type ProcessSlackMessageResult = {
    imageFilesConsidered: number;
    ingested: number;
    skippedAlreadySeen: number;
    skippedTooLarge: number;
    skippedNotImage: number;
    textMessagesConsidered: number;
    textMessagesSkippedSeen: number;
    textEventsIngested: number;
    /** Same date/time/place as an existing flyer (e.g. already ingested from Gmail). */
    textEventsSkippedDuplicate: number;
    failed: number;
    errors: string[];
};

const emptyResult = (): ProcessSlackMessageResult => ({
    imageFilesConsidered: 0,
    ingested: 0,
    skippedAlreadySeen: 0,
    skippedTooLarge: 0,
    skippedNotImage: 0,
    textMessagesConsidered: 0,
    textMessagesSkippedSeen: 0,
    textEventsIngested: 0,
    textEventsSkippedDuplicate: 0,
    failed: 0,
    errors: [],
});

/**
 * Ingest logic for a single channel message (cron history or Events API).
 * Skips thread replies: `thread_ts` present and different from `ts`.
 */
export async function processSlackChannelMessage(args: {
    ws: SlackIngestWorkspace;
    teamId: string;
    slackWorkspaceName: string;
    channelId: string;
    msg: SlackMessage;
}): Promise<ProcessSlackMessageResult> {
    const r = emptyResult();
    const { ws, teamId, slackWorkspaceName, channelId, msg } = args;

    const ts = msg.ts;
    const threadTs = msg.thread_ts;
    if (ts && threadTs && threadTs !== ts) {
        return r;
    }

    const st = msg.subtype;
    if (st === 'message_deleted' || st === 'message_changed') {
        return r;
    }

    const files = msg.files || [];
    const imageFiles = files.filter((f: SlackFile) => isSlackImageFile(f) && Boolean(f.id));

    for (const file of files) {
        if (!isSlackImageFile(file)) {
            r.skippedNotImage += 1;
            continue;
        }
        if (!file.id) continue;
        const size = typeof file.size === 'number' ? file.size : 0;
        if (size > MAX_IMAGE_BYTES) {
            r.skippedTooLarge += 1;
            continue;
        }

        r.imageFilesConsidered += 1;

        if (await isSlackFileSeen(teamId, file.id)) {
            r.skippedAlreadySeen += 1;
            continue;
        }

        const url = file.url_private_download;
        if (!url) {
            r.failed += 1;
            r.errors.push(`[${ws.label}] file ${file.id}: no url_private_download`);
            continue;
        }

        try {
            const { bytes, contentType } = await downloadSlackPrivateFile(ws.botToken, url);
            if (bytes.byteLength > MAX_IMAGE_BYTES) {
                r.skippedTooLarge += 1;
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
                r.failed += 1;
                r.errors.push(`[${ws.label}] ${file.id} ${name}: ${result.reason}`);
                continue;
            }

            seenMeta.flyerId = result.mode === 'firebase' ? result.flyerId : result.recordId;
            await markSlackFileSeen(teamId, file.id, seenMeta);

            r.ingested += 1;
        } catch (e) {
            r.failed += 1;
            const errMsg = e instanceof Error ? e.message : String(e);
            r.errors.push(`[${ws.label}] file ${file.id}: ${errMsg}`);
        }
    }

    if (imageFiles.length === 0 && msg.ts) {
        const subtype = msg.subtype;
        if (subtype && SKIP_TEXT_SUBTYPES.includes(subtype)) {
            return r;
        }
        const rawText = typeof msg.text === 'string' ? msg.text.trim() : '';
        if (rawText.length < 40) return r;

        r.textMessagesConsidered += 1;

        if (await isSlackTextMessageSeen(teamId, channelId, msg.ts)) {
            r.textMessagesSkippedSeen += 1;
            return r;
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
                    r.textEventsIngested += 1;
                } else if (
                    persisted.mode === 'firebase' &&
                    persisted.skippedDuplicate &&
                    persisted.reason === 'event_already_exists'
                ) {
                    r.textEventsSkippedDuplicate += 1;
                }
            }

            await markSlackTextMessageSeen(teamId, channelId, msg.ts, {
                workspaceLabel: ws.label,
                channelId,
                messageTs: msg.ts ?? '',
                eventsExtracted: saved,
            });
        } catch (e) {
            r.failed += 1;
            const errMsg = e instanceof Error ? e.message : String(e);
            r.errors.push(`[${ws.label}] text msg ${msg.ts}: ${errMsg}`);
        }
    }

    return r;
}

/** Merge per-message results into running ingest summary (cron). */
export function mergeProcessResult(
    summary: {
        imageFilesConsidered: number;
        ingested: number;
        skippedAlreadySeen: number;
        skippedTooLarge: number;
        skippedNotImage: number;
        textMessagesConsidered: number;
        textMessagesSkippedSeen: number;
        textEventsIngested: number;
        textEventsSkippedDuplicate: number;
        failed: number;
        errors: string[];
    },
    part: ProcessSlackMessageResult
): void {
    summary.imageFilesConsidered += part.imageFilesConsidered;
    summary.ingested += part.ingested;
    summary.skippedAlreadySeen += part.skippedAlreadySeen;
    summary.skippedTooLarge += part.skippedTooLarge;
    summary.skippedNotImage += part.skippedNotImage;
    summary.textMessagesConsidered += part.textMessagesConsidered;
    summary.textMessagesSkippedSeen += part.textMessagesSkippedSeen;
    summary.textEventsIngested += part.textEventsIngested;
    summary.textEventsSkippedDuplicate += part.textEventsSkippedDuplicate;
    summary.failed += part.failed;
    summary.errors.push(...part.errors);
}

export function logSlackEventIngest(teamId: string, channelId: string, part: ProcessSlackMessageResult): void {
    if (
        part.ingested === 0 &&
        part.textEventsIngested === 0 &&
        part.textEventsSkippedDuplicate === 0 &&
        part.failed === 0 &&
        part.skippedAlreadySeen === 0 &&
        part.textMessagesSkippedSeen === 0 &&
        part.imageFilesConsidered === 0 &&
        part.textMessagesConsidered === 0
    ) {
        return;
    }
    logger.info('slack-event-ingest', {
        teamId,
        channelId,
        ingested: part.ingested,
        textEventsIngested: part.textEventsIngested,
        textEventsSkippedDuplicate: part.textEventsSkippedDuplicate,
        failed: part.failed,
        skippedAlreadySeen: part.skippedAlreadySeen,
        imageFilesConsidered: part.imageFilesConsidered,
        textMessagesConsidered: part.textMessagesConsidered,
    });
}
