import * as admin from 'firebase-admin';

import { appendExtractionRecord } from '@/backend/local/eventsJsonStore';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';
import type { ExtractedEvent } from '@/backend/openai/extractEventFromFlyer';
import { computeEventDedupeKey } from '@/lib/eventDedupe';
import { inferFoodEmoji } from '@/lib/foodEmoji';
import { logger } from '@/lib/logger';

export type PersistSlackTextFlyerArgs = {
  extractedEvent: ExtractedEvent;
  rawModelOutput: string;
  slackChannelId: string;
  slackTeamId: string;
  slackMessageTs: string;
  slackWorkspaceName: string;
  slackWorkspaceLabel: string;
  eventIndex: number;
};

function safeFilenamePart(s: string): string {
  return s.replace(/[^\w\s.-]/g, '_').slice(0, 80);
}

export type PersistSlackTextFlyerResult =
  | { mode: 'firebase'; flyerId: string }
  | { mode: 'firebase'; skippedDuplicate: true }
  | { mode: 'local'; recordId: string };

export async function persistSlackTextFlyer(args: PersistSlackTextFlyerArgs): Promise<PersistSlackTextFlyerResult> {
  const firebaseBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  const idSuffix = `${args.slackMessageTs.replace(/\./g, '_')}_${args.eventIndex}`;
  const titleBit = safeFilenamePart(args.extractedEvent.title ?? 'activity');
  logger.info('slack-text-persist', { title: args.extractedEvent.title, mode: firebaseBucket ? 'firebase' : 'local' });

  if (firebaseBucket) {
    ensureFirebaseAdminInitialized();
    const extractedEvent: ExtractedEvent = {
      ...args.extractedEvent,
      foodEmoji:
        args.extractedEvent.foodEmoji ??
        inferFoodEmoji(args.extractedEvent.food, args.extractedEvent.foodCategory),
    };
    const dedupeKey = computeEventDedupeKey(extractedEvent);
    const dupSnap = await admin
      .firestore()
      .collection('flyers')
      .where('eventDedupeKey', '==', dedupeKey)
      .limit(1)
      .get();
    if (!dupSnap.empty) {
      return { mode: 'firebase', skippedDuplicate: true };
    }
    const ref = await admin.firestore().collection('flyers').add({
      originalFilename: `slack_text_${idSuffix}_${titleBit}.txt`,
      storagePath: `slack_text/${idSuffix}`,
      downloadURL: '',
      status: 'extracted',
      uploader: 'slack_text',
      sourceType: 'slack_text',
      extractedEvent,
      rawModelOutput: args.rawModelOutput,
      extractionError: null,
      eventDedupeKey: dedupeKey,
      slackTeamId: args.slackTeamId,
      slackChannelId: args.slackChannelId,
      slackMessageTs: args.slackMessageTs,
      slackWorkspaceName: args.slackWorkspaceName,
      slackWorkspaceLabel: args.slackWorkspaceLabel,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { mode: 'firebase', flyerId: ref.id };
  }

  const recordId = `slack_txt_${idSuffix}`;
  await appendExtractionRecord({
    id: recordId,
    createdAtIso: new Date().toISOString(),
    source: {
      originalFilename: `slack_text_${idSuffix}.txt`,
      mimeType: 'text/plain',
      sizeBytes: 0,
      sourceType: 'slack_text',
      slackChannelId: args.slackChannelId,
      slackTeamId: args.slackTeamId,
      slackMessageTs: args.slackMessageTs,
      slackWorkspaceName: args.slackWorkspaceName,
      slackWorkspaceLabel: args.slackWorkspaceLabel,
    },
    imageUrl: null,
    event: args.extractedEvent,
    rawModelOutput: args.rawModelOutput,
  });

  return { mode: 'local', recordId };
}

export async function persistGmailTextFlyer(args: {
  extractedEvent: ExtractedEvent;
  rawModelOutput: string;
  gmailMessageId: string;
  gmailEventDedupe: string;
  emailRFCMessageId?: string;
  eventIndex: number;
}): Promise<PersistSlackTextFlyerResult> {
  const firebaseBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  const idSafe = args.gmailMessageId.replace(/[^\w-]+/g, '_');
  const idSuffix = `${idSafe}_${args.eventIndex}`;
  const titleBit = safeFilenamePart(args.extractedEvent.title ?? 'activity');

  if (firebaseBucket) {
    ensureFirebaseAdminInitialized();
    const slotDup = await admin
      .firestore()
      .collection('flyers')
      .where('gmailEventDedupe', '==', args.gmailEventDedupe)
      .limit(1)
      .get();
    if (!slotDup.empty) {
      return { mode: 'firebase', skippedDuplicate: true };
    }
    const extractedEvent: ExtractedEvent = {
      ...args.extractedEvent,
      foodEmoji:
        args.extractedEvent.foodEmoji ??
        inferFoodEmoji(args.extractedEvent.food, args.extractedEvent.foodCategory),
    };
    const dedupeKey = computeEventDedupeKey(extractedEvent);
    const dupSnap = await admin
      .firestore()
      .collection('flyers')
      .where('eventDedupeKey', '==', dedupeKey)
      .limit(1)
      .get();
    if (!dupSnap.empty) {
      return { mode: 'firebase', skippedDuplicate: true };
    }
    const doc: Record<string, unknown> = {
      originalFilename: `gmail_text_${idSuffix}_${titleBit}.txt`,
      storagePath: `gmail_text/${idSuffix}`,
      downloadURL: '',
      status: 'extracted',
      uploader: 'gmail_text',
      sourceType: 'gmail_text',
      extractedEvent,
      rawModelOutput: args.rawModelOutput,
      extractionError: null,
      eventDedupeKey: dedupeKey,
      gmailMessageId: args.gmailMessageId,
      gmailEventDedupe: args.gmailEventDedupe,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (args.emailRFCMessageId) {
      doc.emailRFCMessageId = args.emailRFCMessageId;
    }
    const ref = await admin.firestore().collection('flyers').add(doc);
    return { mode: 'firebase', flyerId: ref.id };
  }

  const recordId = `gmail_txt_${idSuffix}`;
  await appendExtractionRecord({
    id: recordId,
    createdAtIso: new Date().toISOString(),
    source: {
      originalFilename: `gmail_text_${idSuffix}.txt`,
      mimeType: 'text/plain',
      sizeBytes: 0,
      sourceType: 'gmail_text',
    },
    imageUrl: null,
    event: args.extractedEvent,
    rawModelOutput: args.rawModelOutput,
  });

  return { mode: 'local', recordId };
}
