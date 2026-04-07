import * as admin from 'firebase-admin';

import { appendExtractionRecord } from '@/backend/local/eventsJsonStore';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';
import type { ExtractedEvent } from '@/backend/openai/extractEventFromFlyer';
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

export async function persistSlackTextFlyer(args: PersistSlackTextFlyerArgs): Promise<{ mode: 'firebase'; flyerId: string } | { mode: 'local'; recordId: string }> {
  const firebaseBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  const idSuffix = `${args.slackMessageTs.replace(/\./g, '_')}_${args.eventIndex}`;
  const titleBit = safeFilenamePart(args.extractedEvent.title ?? 'activity');
  logger.info('slack-text-persist', { title: args.extractedEvent.title, mode: firebaseBucket ? 'firebase' : 'local' });

  if (firebaseBucket) {
    ensureFirebaseAdminInitialized();
    const ref = await admin.firestore().collection('flyers').add({
      originalFilename: `slack_text_${idSuffix}_${titleBit}.txt`,
      storagePath: `slack_text/${idSuffix}`,
      downloadURL: '',
      status: 'extracted',
      uploader: 'slack_text',
      sourceType: 'slack_text',
      extractedEvent: args.extractedEvent,
      rawModelOutput: args.rawModelOutput,
      extractionError: null,
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
