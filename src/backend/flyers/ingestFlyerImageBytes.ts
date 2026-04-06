import { unlink } from 'node:fs/promises';
import path from 'node:path';

import { appendExtractionRecord } from '@/backend/local/eventsJsonStore';
import { saveFlyerToPublicUploads } from '@/backend/local/publicUploads';
import { extractEventFromFlyerWithOpenAI } from '@/backend/openai/extractEventFromFlyer';
import { processUploadedFlyer } from '@/backend/flyers/processUploadedFlyer';
import { uploadBytesToStorage } from '@/backend/flyers/storageAdminUpload';
import type { FlyerRequiredMissing } from '@/lib/validateFlyerExtraction';
import { validateExtractedEventRequired } from '@/lib/validateFlyerExtraction';
import { inferFoodEmoji } from '@/lib/foodEmoji';

export type IngestFlyerFromBytesMeta = {
  slackTeamId?: string;
  slackChannelId?: string;
  slackFileId?: string;
  slackMessageTs?: string;
  /** From Slack auth.test `team` or env label fallback */
  slackWorkspaceName?: string;
  /** Env slot label, e.g. primary / secondary */
  slackWorkspaceLabel?: string;
};

export type IngestFlyerImageBytesResult =
  | { ok: true; mode: 'firebase'; flyerId: string }
  | { ok: true; mode: 'local'; recordId: string }
  | { ok: false; reason: string; missingFields?: FlyerRequiredMissing[] };

/**
 * Same validation and persistence rules as browser upload / local extract:
 * Firebase when `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is set; otherwise local `events.json` + `public/uploads`.
 */
export async function ingestFlyerImageBytes(args: {
  bytes: Uint8Array;
  originalFilename: string;
  mimeType: string;
  meta?: IngestFlyerFromBytesMeta;
}): Promise<IngestFlyerImageBytesResult> {
  const firebaseBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  const safeFilename = (args.originalFilename || 'flyer').replace(/[^a-zA-Z0-9.-]/g, '_');
  const mimeType = args.mimeType || 'image/jpeg';

  if (firebaseBucket) {
    const timestamp = Date.now();
    const suffix = args.meta?.slackFileId ? `_${args.meta.slackFileId}` : '';
    const storagePath = `flyers/slack${suffix}_${timestamp}_${safeFilename || 'flyer'}`;

    const { downloadURL } = await uploadBytesToStorage({
      bytes: args.bytes,
      storagePath,
      contentType: mimeType,
    });

    const m = args.meta;
    const result = await processUploadedFlyer({
      downloadURL,
      storagePath,
      originalFilename: args.originalFilename,
      mimeType,
      imageBytes: args.bytes,
      slackSource:
        m?.slackTeamId != null
          ? {
              teamId: m.slackTeamId,
              channelId: m.slackChannelId,
              fileId: m.slackFileId,
              workspaceName: m.slackWorkspaceName,
              workspaceLabel: m.slackWorkspaceLabel,
            }
          : undefined,
    });

    if (!result.flyerId) {
      return {
        ok: false,
        reason: result.rejectedReason ?? 'Missing required event details.',
        missingFields: result.missingFields,
      };
    }

    return { ok: true, mode: 'firebase', flyerId: result.flyerId };
  }

  const { publicUrl: imageUrl, relativePath } = await saveFlyerToPublicUploads({
    originalFilename: args.originalFilename,
    bytes: args.bytes,
  });

  const { event, rawModelOutput } = await extractEventFromFlyerWithOpenAI({
    imageBytes: args.bytes,
    mimeType,
    campusTimezone: 'America/Denver',
  });

  const validation = validateExtractedEventRequired(event);
  if (!validation.ok) {
    await unlink(path.join(process.cwd(), relativePath)).catch(() => {});
    return {
      ok: false,
      reason: validation.message,
      missingFields: validation.missing,
    };
  }

  const eventWithEmoji = {
    ...event,
    foodEmoji: event.foodEmoji ?? inferFoodEmoji(event.food, event.foodCategory),
  };

  const m = args.meta;
  const record = await appendExtractionRecord({
    id: m?.slackFileId ? `slack_${m.slackFileId}` : `slack_${Date.now()}`,
    createdAtIso: new Date().toISOString(),
    source: {
      originalFilename: args.originalFilename,
      mimeType,
      sizeBytes: args.bytes.byteLength,
      ...(m?.slackFileId && { slackFileId: m.slackFileId }),
      ...(m?.slackChannelId && { slackChannelId: m.slackChannelId }),
      ...(m?.slackTeamId && { slackTeamId: m.slackTeamId }),
      ...(m?.slackWorkspaceName && { slackWorkspaceName: m.slackWorkspaceName }),
      ...(m?.slackWorkspaceLabel && { slackWorkspaceLabel: m.slackWorkspaceLabel }),
    },
    imageUrl,
    event: eventWithEmoji,
    rawModelOutput,
  });

  return { ok: true, mode: 'local', recordId: record.id };
}
