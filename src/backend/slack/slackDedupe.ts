import * as admin from 'firebase-admin';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';

const COLLECTION = 'slack_ingest_seen';
const repoRoot = process.cwd();
const localSeenFile = path.join(repoRoot, 'data', 'slack-ingest-seen.json');

type LocalSeenFile = { ids: string[] };

function docId(teamId: string, fileId: string): string {
  return `${teamId}_${fileId}`;
}

/** Synthetic file id for text-only Slack messages (per channel + message ts). */
export function slackTextMessageFileId(channelId: string, messageTs: string): string {
  const safeTs = messageTs.replace(/\./g, '_');
  return `slackmsg_${channelId}_${safeTs}`;
}

async function readLocalSeen(): Promise<Set<string>> {
  try {
    const text = await fs.readFile(localSeenFile, 'utf8');
    const parsed = JSON.parse(text) as LocalSeenFile;
    const ids = Array.isArray(parsed.ids) ? parsed.ids : [];
    return new Set(ids.map(String));
  } catch {
    return new Set();
  }
}

async function writeLocalSeen(set: Set<string>) {
  await fs.mkdir(path.dirname(localSeenFile), { recursive: true });
  await fs.writeFile(
    localSeenFile,
    JSON.stringify({ ids: Array.from(set).sort() }, null, 2) + '\n',
    'utf8'
  );
}

function useFirestoreDedupe(): boolean {
  return process.env.NEXT_PUBLIC_BACKEND_MODE === 'firebase';
}

export async function isSlackFileSeen(teamId: string, fileId: string): Promise<boolean> {
  const id = docId(teamId, fileId);
  if (useFirestoreDedupe()) {
    try {
      ensureFirebaseAdminInitialized();
      const snap = await admin.firestore().collection(COLLECTION).doc(id).get();
      return snap.exists;
    } catch {
      // Firebase not configured — fall back to local file so dev still dedupes on disk
      const set = await readLocalSeen();
      return set.has(id);
    }
  }
  const set = await readLocalSeen();
  return set.has(id);
}

function withoutUndefined(meta: Record<string, string | number | null | undefined>): Record<string, string | number | null> {
  const out: Record<string, string | number | null> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

export async function isSlackTextMessageSeen(teamId: string, channelId: string, messageTs: string): Promise<boolean> {
  return isSlackFileSeen(teamId, slackTextMessageFileId(channelId, messageTs));
}

export async function markSlackTextMessageSeen(
  teamId: string,
  channelId: string,
  messageTs: string,
  meta: Record<string, string | number | null | undefined>
): Promise<void> {
  return markSlackFileSeen(teamId, slackTextMessageFileId(channelId, messageTs), meta);
}

export async function markSlackFileSeen(
  teamId: string,
  fileId: string,
  meta: Record<string, string | number | null | undefined>
): Promise<void> {
  const id = docId(teamId, fileId);
  const payload = withoutUndefined(meta);
  if (useFirestoreDedupe()) {
    try {
      ensureFirebaseAdminInitialized();
      await admin
        .firestore()
        .collection(COLLECTION)
        .doc(id)
        .set({
          ...payload,
          seenAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      return;
    } catch {
      // fall through to local file
    }
  }
  const set = await readLocalSeen();
  set.add(id);
  await writeLocalSeen(set);
}
