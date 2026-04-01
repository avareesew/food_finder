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
  const { downloadURL, storagePath, originalFilename, mimeType, imageBytes: providedBytes } = args;

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

  const flyerId = await createFlyerAdminDoc({
    originalFilename,
    storagePath,
    downloadURL,
    status: 'extracted',
    uploader: 'anonymous',
    extractedEvent,
    rawModelOutput,
    extractionError: null,
  });

  return {
    flyerId,
    downloadURL,
    storagePath,
    event: extractedEvent,
    rawModelOutput,
    extractionError: null,
    rejectedReason: null,
    missingFields: undefined,
  };
}
