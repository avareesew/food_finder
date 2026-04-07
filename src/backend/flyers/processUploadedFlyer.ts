import * as admin from 'firebase-admin';
import {
  extractEventFromFlyerWithOpenAI,
  type ExtractedEvent,
} from '@/backend/openai/extractEventFromFlyer';
import {
  deleteStorageObjectAtPath,
  ensureFirebaseAdminInitialized,
} from '@/backend/flyers/storageAdminUpload';
import {
  validateExtractedEventRequired,
  type FlyerRequiredMissing,
} from '@/lib/validateFlyerExtraction';
import { computeEventDedupeKey } from '@/lib/eventDedupe';
import { inferFoodEmoji } from '@/lib/foodEmoji';
import { logger } from '@/lib/logger';

async function fetchBytesFromDownloadUrl(downloadURL: string): Promise<Uint8Array> {
  const res = await fetch(downloadURL, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) {
    throw new Error(`Failed to fetch uploaded file from Storage (${res.status})`);
  }
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

async function createFlyerAdminDoc(data: {
  originalFilename: string;
  storagePath: string;
  downloadURL: string;
  status: string;
  uploader?: string;
  extractedEvent?: ExtractedEvent | null;
  rawModelOutput?: string | null;
  extractionError?: string | null;
  slackTeamId?: string;
  slackChannelId?: string;
  slackFileId?: string;
  slackWorkspaceName?: string;
  slackWorkspaceLabel?: string;
  eventDedupeKey?: string;
  sourceType?: string;
  gmailMessageId?: string;
  gmailEventDedupe?: string;
  emailRFCMessageId?: string;
}): Promise<string> {
  ensureFirebaseAdminInitialized();
  const sanitized = JSON.parse(JSON.stringify(data)) as typeof data;
  const ref = await admin.firestore().collection('flyers').add({
    ...sanitized,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export type ProcessUploadedFlyerInput = {
  downloadURL: string;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  /** When set (same bytes just uploaded), skips a redundant download from Storage — faster and avoids hangs. */
  imageBytes?: Uint8Array;
  /** Set when ingesting from Slack (cron / sync). */
  slackSource?: {
    teamId: string;
    channelId?: string;
    fileId?: string;
    workspaceName?: string;
    workspaceLabel?: string;
  };
  /** Optional Gmail / dedupe metadata (Slack cron may omit). */
  ingestMeta?: {
    eventDedupeKey?: string;
    sourceType?: string;
    gmailMessageId?: string;
    gmailEventDedupe?: string;
    emailRFCMessageId?: string;
  };
};

export type ProcessUploadedFlyerResult = {
  flyerId: string | null;
  downloadURL: string;
  storagePath: string;
  event: ExtractedEvent;
  rawModelOutput: string;
  extractionError: string | null;
  rejectedReason: string | null;
  missingFields?: FlyerRequiredMissing[];
};

/**
 * After the server uploads to Firebase Storage, runs OpenAI extraction and writes Firestore via Admin SDK.
 * Pass `imageBytes` when you already have the file in memory to avoid re-fetching the signed URL from Node.
 */
export async function processUploadedFlyer(args: ProcessUploadedFlyerInput): Promise<ProcessUploadedFlyerResult> {
  const {
    downloadURL,
    storagePath,
    originalFilename,
    mimeType,
    imageBytes: providedBytes,
    slackSource,
    ingestMeta,
  } = args;
  logger.info('flyer-processing-start', { originalFilename, hasProvidedBytes: Boolean(providedBytes?.length) });

  let imageBytes: Uint8Array;
  if (providedBytes && providedBytes.length > 0) {
    imageBytes = providedBytes;
  } else {
    try {
      imageBytes = await fetchBytesFromDownloadUrl(downloadURL);
    } catch (e) {
      throw new Error(
        `Could not read back the uploaded file from Storage: ${e instanceof Error ? e.message : 'unknown'}`
      );
    }
  }

  let extractedEvent: Awaited<ReturnType<typeof extractEventFromFlyerWithOpenAI>>['event'];
  let rawModelOutput: string;
  let extractionError: string | null = null;

  try {
    const result = await extractEventFromFlyerWithOpenAI({
      imageBytes,
      mimeType: mimeType || 'image/jpeg',
      campusTimezone: 'America/Denver',
    });
    extractedEvent = result.event;
    rawModelOutput = result.rawModelOutput;
  } catch (e) {
    extractionError = e instanceof Error ? e.message : 'Extraction failed';
    extractedEvent = {
      title: null,
      host: null,
      campus: null,
      date: null,
      startTime: null,
      endTime: null,
      place: null,
      food: null,
      foodCategory: null,
      details: extractionError,
      other: null,
      foodEmoji: null,
    };
    rawModelOutput = '';
  }

  const validation = validateExtractedEventRequired(extractedEvent);
  const rejectedReason = extractionError
    ? `Could not read the flyer: ${extractionError}`
    : validation.ok
      ? null
      : validation.message;

  if (rejectedReason) {
    logger.warn('flyer-rejected', { originalFilename, reason: rejectedReason, missingFields: validation.ok ? undefined : validation.missing });
    await deleteStorageObjectAtPath(storagePath).catch(() => {});
    return {
      flyerId: null,
      downloadURL,
      storagePath,
      event: extractedEvent,
      rawModelOutput,
      extractionError,
      rejectedReason,
      missingFields: validation.ok ? undefined : validation.missing,
    };
  }

  const extractedEventWithEmoji: ExtractedEvent = {
    ...extractedEvent,
    foodEmoji: extractedEvent.foodEmoji ?? inferFoodEmoji(extractedEvent.food, extractedEvent.foodCategory),
  };

  logger.info('flyer-extraction-success', { originalFilename, title: extractedEventWithEmoji.title });

  const dedupeKey = ingestMeta?.eventDedupeKey ?? computeEventDedupeKey(extractedEventWithEmoji);
  ensureFirebaseAdminInitialized();
  const dupSnap = await admin
    .firestore()
    .collection('flyers')
    .where('eventDedupeKey', '==', dedupeKey)
    .limit(1)
    .get();
  if (!dupSnap.empty) {
    await deleteStorageObjectAtPath(storagePath).catch(() => {});
    return {
      flyerId: null,
      downloadURL,
      storagePath,
      event: extractedEventWithEmoji,
      rawModelOutput,
      extractionError: null,
      rejectedReason: 'This event is already on the calendar (duplicate).',
      missingFields: undefined,
    };
  }

  const meta = ingestMeta;
  const flyerId = await createFlyerAdminDoc({
    originalFilename,
    storagePath,
    downloadURL,
    status: 'extracted',
    uploader: slackSource?.teamId ? 'slack' : meta?.gmailMessageId ? 'gmail' : 'anonymous',
    extractedEvent: extractedEventWithEmoji,
    rawModelOutput,
    extractionError: null,
    eventDedupeKey: dedupeKey,
    ...(slackSource?.teamId && { slackTeamId: slackSource.teamId }),
    ...(slackSource?.channelId && { slackChannelId: slackSource.channelId }),
    ...(slackSource?.fileId && { slackFileId: slackSource.fileId }),
    ...(slackSource?.workspaceName && { slackWorkspaceName: slackSource.workspaceName }),
    ...(slackSource?.workspaceLabel && { slackWorkspaceLabel: slackSource.workspaceLabel }),
    ...(meta?.sourceType && { sourceType: meta.sourceType }),
    ...(meta?.gmailMessageId && { gmailMessageId: meta.gmailMessageId }),
    ...(meta?.gmailEventDedupe && { gmailEventDedupe: meta.gmailEventDedupe }),
    ...(meta?.emailRFCMessageId && { emailRFCMessageId: meta.emailRFCMessageId }),
  });

  return {
    flyerId,
    downloadURL,
    storagePath,
    event: extractedEventWithEmoji,
    rawModelOutput,
    extractionError: null,
    rejectedReason: null,
    missingFields: undefined,
  };
}
