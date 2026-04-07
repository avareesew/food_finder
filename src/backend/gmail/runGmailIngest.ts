import * as admin from 'firebase-admin';
import { google } from 'googleapis';
import type { gmail_v1 } from 'googleapis';

import { persistGmailTextFlyer } from '@/backend/flyers/persistSlackTextFlyer';
import { processUploadedFlyer } from '@/backend/flyers/processUploadedFlyer';
import { ensureFirebaseAdminInitialized, uploadBytesToStorage } from '@/backend/flyers/storageAdminUpload';
import { extractEventsFromSlackMessageText } from '@/backend/openai/extractEventsFromSlackText';
import { gmailInboxQuery, gmailListMaxResults } from '@/lib/gmailIngestEnv';
import { validateSlackTextExtractedEvent } from '@/lib/validateFlyerExtraction';

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const GMAIL_MARKS = 'gmailIngestMarks';

function decodeGmailData(data: string): Buffer {
  const pad = data.length % 4 === 0 ? '' : '='.repeat(4 - (data.length % 4));
  const b64 = data.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(b64, 'base64');
}

function flattenParts(part: gmail_v1.Schema$MessagePart | null | undefined): gmail_v1.Schema$MessagePart[] {
  if (!part) return [];
  const out: gmail_v1.Schema$MessagePart[] = [part];
  const subs = part.parts;
  if (Array.isArray(subs)) {
    for (const p of subs) {
      out.push(...flattenParts(p));
    }
  }
  return out;
}

function headerMap(headers: gmail_v1.Schema$MessagePartHeader[] | undefined): Record<string, string> {
  const m: Record<string, string> = {};
  if (!Array.isArray(headers)) return m;
  for (const h of headers) {
    const name = typeof h.name === 'string' ? h.name.toLowerCase() : '';
    const val = typeof h.value === 'string' ? h.value : '';
    if (name && val) m[name] = val;
  }
  return m;
}

async function getPartBytes(
  gmail: gmail_v1.Gmail,
  userId: string,
  messageId: string,
  part: gmail_v1.Schema$MessagePart
): Promise<Buffer | null> {
  if (part.body?.data) {
    return decodeGmailData(part.body.data);
  }
  const attId = part.body?.attachmentId;
  if (typeof attId === 'string' && attId) {
    const res = await gmail.users.messages.attachments.get({ userId, messageId, id: attId });
    const d = res.data.data;
    if (!d) return null;
    return decodeGmailData(d);
  }
  return null;
}

async function flyerSlotExists(gmailEventDedupe: string): Promise<boolean> {
  ensureFirebaseAdminInitialized();
  const q = await admin
    .firestore()
    .collection('flyers')
    .where('gmailEventDedupe', '==', gmailEventDedupe)
    .limit(1)
    .get();
  return !q.empty;
}

async function isGmailMessageMarked(messageId: string): Promise<boolean> {
  ensureFirebaseAdminInitialized();
  const s = await admin.firestore().collection(GMAIL_MARKS).doc(messageId).get();
  return s.exists;
}

async function markGmailMessageHandled(messageId: string, detail: string): Promise<void> {
  ensureFirebaseAdminInitialized();
  await admin
    .firestore()
    .collection(GMAIL_MARKS)
    .doc(messageId)
    .set(
      {
        handledAt: admin.firestore.FieldValue.serverTimestamp(),
        detail: detail.slice(0, 500),
      },
      { merge: true }
    );
}

export type GmailIngestSummary = {
  ok: boolean;
  disabled?: boolean;
  message?: string;
  messagesListed: number;
  skippedAlreadyProcessed: number;
  imagesAttempted: number;
  imagesIngested: number;
  textEventsIngested: number;
  failed: number;
  errors: string[];
};

export async function runGmailIngest(): Promise<GmailIngestSummary> {
  const summary: GmailIngestSummary = {
    ok: true,
    messagesListed: 0,
    skippedAlreadyProcessed: 0,
    imagesAttempted: 0,
    imagesIngested: 0,
    textEventsIngested: 0,
    failed: 0,
    errors: [],
  };

  const clientId = process.env.GMAIL_CLIENT_ID?.trim();
  const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();
  const firebaseBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

  if (!clientId || !clientSecret || !refreshToken) {
    summary.disabled = true;
    summary.message = 'Gmail ingest not configured (set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN).';
    return summary;
  }
  if (!firebaseBucket) {
    summary.disabled = true;
    summary.message = 'Gmail ingest requires NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.';
    return summary;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'urn:ietf:wg:oauth:2.0:oob');
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const q = gmailInboxQuery();
  const maxResults = gmailListMaxResults();

  let listRes;
  try {
    listRes = await gmail.users.messages.list({ userId: 'me', q, maxResults });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    summary.ok = false;
    summary.errors.push(`list: ${msg}`);
    summary.failed += 1;
    return summary;
  }

  const messages = listRes.data.messages || [];
  summary.messagesListed = messages.length;

  for (const m of messages) {
    const id = typeof m.id === 'string' ? m.id : '';
    if (!id) continue;

    if (await isGmailMessageMarked(id)) {
      summary.skippedAlreadyProcessed += 1;
      continue;
    }

    let full;
    try {
      full = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      summary.errors.push(`get ${id}: ${msg}`);
      summary.failed += 1;
      continue;
    }

    const payload = full.data.payload;
    if (!payload) {
      await markGmailMessageHandled(id, 'no_payload').catch(() => {});
      continue;
    }

    const headers = headerMap(payload.headers);
    const rfcId = headers['message-id'];

    const parts = flattenParts(payload);
    const imageParts = parts.filter((p) => {
      const mt = (p.mimeType || '').toLowerCase();
      if (!mt.startsWith('image/')) return false;
      return /jpeg|jpg|png|webp|gif/.test(mt);
    });

    const hasImage = imageParts.length > 0;

    if (hasImage) {
      const dedupeSlot = `gmail:${id}:img`;
      if (await flyerSlotExists(dedupeSlot)) {
        await markGmailMessageHandled(id, 'image_slot_exists').catch(() => {});
        summary.skippedAlreadyProcessed += 1;
        continue;
      }

      let bytes: Buffer | null = null;
      let picked: gmail_v1.Schema$MessagePart | null = null;
      for (const part of imageParts) {
        try {
          const b = await getPartBytes(gmail, 'me', id, part);
          if (b && b.byteLength > 0 && b.byteLength <= MAX_IMAGE_BYTES) {
            picked = part;
            bytes = b;
            break;
          }
        } catch {
          /* try next */
        }
      }

      if (!picked || !bytes) {
        summary.failed += 1;
        summary.errors.push(`message ${id}: could not read image attachment`);
        await markGmailMessageHandled(id, 'image_read_failed').catch(() => {});
        continue;
      }

      summary.imagesAttempted += 1;
      const mimeType = (picked.mimeType || 'image/jpeg').split(';')[0].trim();
      const filename =
        typeof picked.filename === 'string' && picked.filename.trim()
          ? picked.filename.trim()
          : `gmail_${id}.jpg`;

      try {
        const timestamp = Date.now();
        const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `flyers/gmail_${id}_${timestamp}_${safeFilename || 'flyer'}`;

        const { downloadURL } = await uploadBytesToStorage({
          bytes: new Uint8Array(bytes),
          storagePath,
          contentType: mimeType,
        });

        const result = await processUploadedFlyer({
          downloadURL,
          storagePath,
          originalFilename: filename,
          mimeType,
          imageBytes: new Uint8Array(bytes),
          ingestMeta: {
            sourceType: 'gmail_image',
            gmailMessageId: id,
            gmailEventDedupe: dedupeSlot,
            ...(rfcId ? { emailRFCMessageId: rfcId } : {}),
          },
        });

        if (!result.flyerId) {
          summary.failed += 1;
          summary.errors.push(`message ${id} image: ${result.rejectedReason || 'rejected'}`);
        } else {
          summary.imagesIngested += 1;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        summary.failed += 1;
        summary.errors.push(`message ${id} image: ${msg}`);
      } finally {
        await markGmailMessageHandled(id, 'image_branch').catch(() => {});
      }
      continue;
    }

    let plain = '';
    for (const part of parts) {
      const mt = (part.mimeType || '').toLowerCase();
      if (mt.startsWith('text/plain') && part.body?.data) {
        plain = decodeGmailData(part.body.data).toString('utf8').trim();
        if (plain.length >= 40) break;
      }
    }

    if (plain.length < 40) {
      await markGmailMessageHandled(id, 'short_or_no_plain_text').catch(() => {});
      continue;
    }

    const year = new Date().getFullYear();
    let events: Awaited<ReturnType<typeof extractEventsFromSlackMessageText>>['events'];
    let rawModelOutput: string;
    try {
      const ext = await extractEventsFromSlackMessageText({ messageText: plain, nowYearHint: year });
      events = ext.events;
      rawModelOutput = ext.rawModelOutput;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      summary.failed += 1;
      summary.errors.push(`message ${id} text: ${msg}`);
      await markGmailMessageHandled(id, 'text_extract_failed').catch(() => {});
      continue;
    }

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      const v = validateSlackTextExtractedEvent(ev);
      if (!v.ok) continue;

      const dedupeSlot = `gmail:${id}:text:${i}`;
      try {
        const persisted = await persistGmailTextFlyer({
          extractedEvent: ev,
          rawModelOutput,
          gmailMessageId: id,
          gmailEventDedupe: dedupeSlot,
          emailRFCMessageId: rfcId,
          eventIndex: i,
        });
        if (persisted.mode === 'firebase' && 'flyerId' in persisted) {
          summary.textEventsIngested += 1;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        summary.failed += 1;
        summary.errors.push(`message ${id} text evt ${i}: ${msg}`);
      }
    }

    await markGmailMessageHandled(id, 'text_branch').catch(() => {});
  }

  return summary;
}
