import * as admin from 'firebase-admin';
import type { gmail_v1 } from 'googleapis';

import { createGmailClientFromEnv } from '@/backend/gmail/gmailOAuthClient';
import { gmailInboxQuery, gmailListMaxResults } from '@/lib/gmailIngestEnv';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';

const GMAIL_MARKS = 'gmailIngestMarks';

export type GmailInboxPreviewRow = {
  id: string;
  threadId?: string;
  snippet: string;
  subject: string;
  from: string;
  internalDateMs: number | null;
  ingestMarkDetail: string | null;
};

export type GmailInboxPreviewResult =
  | { ok: true; query: string; maxResults: number; messages: GmailInboxPreviewRow[] }
  | { ok: false; reason: string; message: string };

/**
 * Admin-only: list recent inbox messages with snippet + whether ingest already marked them.
 */
export async function listGmailInboxPreviews(): Promise<GmailInboxPreviewResult> {
  const auth = createGmailClientFromEnv(false);
  if (!auth.ok) {
    return { ok: false, reason: auth.reason, message: auth.message };
  }
  const gmail = auth.gmail;
  const q = gmailInboxQuery();
  const maxResults = gmailListMaxResults();

  let listRes;
  try {
    listRes = await gmail.users.messages.list({ userId: 'me', q, maxResults });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, reason: 'list_failed', message: msg };
  }

  const listed = listRes.data.messages || [];
  const rows: GmailInboxPreviewRow[] = [];

  for (const m of listed) {
    const id = typeof m.id === 'string' ? m.id : '';
    if (!id) continue;

    let msgRes: { data: gmail_v1.Schema$Message };
    try {
      msgRes = await gmail.users.messages.get({
        userId: 'me',
        id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      });
    } catch {
      continue;
    }

    const d = msgRes.data;
    let subject = '';
    let from = '';
    const headers = d.payload?.headers;
    if (Array.isArray(headers)) {
      for (const h of headers) {
        const name = typeof h.name === 'string' ? h.name.toLowerCase() : '';
        const val = typeof h.value === 'string' ? h.value : '';
        if (name === 'subject') subject = val;
        if (name === 'from') from = val;
      }
    }

    const internalDateMs =
      typeof d.internalDate === 'string' && /^\d+$/.test(d.internalDate)
        ? Number(d.internalDate)
        : null;

    let ingestMarkDetail: string | null = null;
    try {
      ensureFirebaseAdminInitialized();
      const snap = await admin.firestore().collection(GMAIL_MARKS).doc(id).get();
      if (snap.exists) {
        const data = snap.data();
        const det = data?.detail;
        ingestMarkDetail = typeof det === 'string' ? det : 'marked';
      }
    } catch {
      ingestMarkDetail = null;
    }

    rows.push({
      id,
      threadId: typeof d.threadId === 'string' ? d.threadId : undefined,
      snippet: typeof d.snippet === 'string' ? d.snippet : '',
      subject,
      from,
      internalDateMs,
      ingestMarkDetail,
    });
  }

  return { ok: true, query: q, maxResults, messages: rows };
}
