/**
 * Gmail → Firebase flyer ingest.
 *
 * Triggered automatically by Vercel Cron (GET /api/cron/gmail-ingest) when env is set.
 * Polls the inbox with users.messages.list; each message is processed once (Firestore
 * collection `gmailIngestMarks`). Not true push: for sub-minute latency use Gmail API
 * users.watch + Google Cloud Pub/Sub (advanced).
 */
import * as admin from 'firebase-admin';
import type { gmail_v1 } from 'googleapis';

import {
  persistGmailTextFlyer,
  type GmailDocumentAttachment,
} from '@/backend/flyers/persistSlackTextFlyer';
import { createGmailClientFromEnv } from '@/backend/gmail/gmailOAuthClient';
import { processUploadedFlyer } from '@/backend/flyers/processUploadedFlyer';
import {
  deleteStorageObjectAtPath,
  ensureFirebaseAdminInitialized,
  uploadBytesToStorage,
} from '@/backend/flyers/storageAdminUpload';
import { extractEventsFromSlackMessageText } from '@/backend/openai/extractEventsFromSlackText';
import { gmailInboxQuery, gmailListMaxResults } from '@/lib/gmailIngestEnv';
import { validateSlackTextExtractedEvent } from '@/lib/validateFlyerExtraction';
import { logger } from '@/lib/logger';

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_PDF_BYTES = 12 * 1024 * 1024;
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

/** Minimal HTML → text for Gmail bodies that only expose text/html or short plain. */
function htmlToPlainText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+\n/g, '\n')
    .replace(/\n\s+/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** Prefer the longest text/plain part; if still short, try text/html. */
function bestPlainFromGmailParts(parts: gmail_v1.Schema$MessagePart[]): string {
  let best = '';
  for (const part of parts) {
    const mt = (part.mimeType || '').toLowerCase();
    if (!mt.startsWith('text/plain') || !part.body?.data) continue;
    const t = decodeGmailData(part.body.data).toString('utf8').trim();
    if (t.length > best.length) best = t;
  }
  if (best.length >= 40) return best;

  for (const part of parts) {
    const mt = (part.mimeType || '').toLowerCase();
    if (!mt.startsWith('text/html') || !part.body?.data) continue;
    const html = decodeGmailData(part.body.data).toString('utf8');
    const t = htmlToPlainText(html).trim();
    if (t.length > best.length) best = t;
  }
  return best;
}

function findPdfAttachmentPart(parts: gmail_v1.Schema$MessagePart[]): gmail_v1.Schema$MessagePart | null {
  for (const p of parts) {
    const mt = (p.mimeType || '').toLowerCase().split(';')[0].trim();
    const fn = typeof p.filename === 'string' ? p.filename.toLowerCase() : '';
    const looksPdf = mt === 'application/pdf' || fn.endsWith('.pdf');
    if (!looksPdf) continue;
    if (p.body?.attachmentId || p.body?.data) return p;
  }
  return null;
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

export async function clearGmailIngestMarksForMessages(messageIds: string[]): Promise<void> {
  const ids = messageIds.map((x) => (typeof x === 'string' ? x.trim() : '')).filter(Boolean);
  if (ids.length === 0) return;
  ensureFirebaseAdminInitialized();
  const batch = admin.firestore().batch();
  for (const id of ids) {
    batch.delete(admin.firestore().collection(GMAIL_MARKS).doc(id));
  }
  await batch.commit();
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

export type GmailAdminDebugRow = {
  messageId: string;
  subject?: string;
  outcome: string;
  plainLength?: number;
  /** First ~600 chars of body text used for extraction (admin testing only). */
  plainPreview?: string;
  hasImage?: boolean;
  hasPdf?: boolean;
  textEventsSaved?: number;
  imageSaved?: boolean;
  pdfUploaded?: boolean;
};

export type GmailIngestOptions = {
  /** When true, summary includes `adminDebug` rows (do not use from public cron). */
  adminDebug?: boolean;
};

export type GmailIngestSummary = {
  ok: boolean;
  disabled?: boolean;
  message?: string;
  messagesListed: number;
  skippedAlreadyProcessed: number;
  imagesAttempted: number;
  imagesIngested: number;
  textEventsIngested: number;
  /** Text rows not created because the same date/time/place already exists (e.g. from Slack). */
  textEventsSkippedDuplicate: number;
  /** PDF attachments uploaded and linked to at least one text-derived flyer this run */
  gmailDocumentsUploaded: number;
  failed: number;
  errors: string[];
  adminDebug?: GmailAdminDebugRow[];
};

export async function runGmailIngest(options?: GmailIngestOptions): Promise<GmailIngestSummary> {
  const summary: GmailIngestSummary = {
    ok: true,
    messagesListed: 0,
    skippedAlreadyProcessed: 0,
    imagesAttempted: 0,
    imagesIngested: 0,
    textEventsIngested: 0,
    textEventsSkippedDuplicate: 0,
    gmailDocumentsUploaded: 0,
    failed: 0,
    errors: [],
  };

  const adminDebug = options?.adminDebug === true;
  const debugRows: GmailAdminDebugRow[] = [];
  const pushDebug = (row: GmailAdminDebugRow) => {
    if (adminDebug) debugRows.push(row);
  };

  const gmailAuth = createGmailClientFromEnv(true);
  if (!gmailAuth.ok) {
    summary.disabled = true;
    summary.message = gmailAuth.message;
    logger.info('gmail-ingest-skip', { reason: gmailAuth.reason });
    return summary;
  }
  const gmail = gmailAuth.gmail;

  const q = gmailInboxQuery();
  const maxResults = gmailListMaxResults();
  logger.info('gmail-ingest-start', { query: q, maxResults });

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
  logger.info('gmail-ingest-listed', { count: messages.length });

  for (const m of messages) {
    const id = typeof m.id === 'string' ? m.id : '';
    if (!id) continue;

    if (await isGmailMessageMarked(id)) {
      summary.skippedAlreadyProcessed += 1;
      pushDebug({ messageId: id, outcome: 'skipped_already_marked' });
      continue;
    }

    let full;
    try {
      full = await gmail.users.messages.get({ userId: 'me', id, format: 'full' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      summary.errors.push(`get ${id}: ${msg}`);
      summary.failed += 1;
      pushDebug({ messageId: id, outcome: `get_failed:${msg.slice(0, 120)}` });
      continue;
    }

    const dbg: GmailAdminDebugRow = {
      messageId: id,
      outcome: 'processing',
      hasImage: false,
      hasPdf: false,
    };

    const payload = full.data.payload;
    if (!payload) {
      await markGmailMessageHandled(id, 'no_payload').catch(() => {});
      dbg.outcome = 'no_payload';
      pushDebug(dbg);
      continue;
    }

    const headers = headerMap(payload.headers);
    const rfcId = headers['message-id'];
    dbg.subject = headers['subject'];

    const parts = flattenParts(payload);
    const pdfPart = findPdfAttachmentPart(parts);
    dbg.hasPdf = Boolean(pdfPart);

    const imageParts = parts.filter((p) => {
      const mt = (p.mimeType || '').toLowerCase();
      if (!mt.startsWith('image/')) return false;
      return /jpeg|jpg|png|webp|gif/.test(mt);
    });

    const hasImage = imageParts.length > 0;
    dbg.hasImage = hasImage;

    if (hasImage) {
      const dedupeSlot = `gmail:${id}:img`;
      if (await flyerSlotExists(dedupeSlot)) {
        await markGmailMessageHandled(id, 'image_slot_exists').catch(() => {});
        summary.skippedAlreadyProcessed += 1;
        dbg.outcome = 'image_slot_exists';
        pushDebug(dbg);
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
        /* fall through: body text may still yield events */
      } else {
        summary.imagesAttempted += 1;
        const mimeType = (picked.mimeType || 'image/jpeg').split(';')[0].trim();
        const filename =
          typeof picked.filename === 'string' && picked.filename.trim()
            ? picked.filename.trim()
            : `gmail_${id}.jpg`;

        let imageIngested = false;
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
            imageIngested = true;
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          summary.failed += 1;
          summary.errors.push(`message ${id} image: ${msg}`);
        }

        if (imageIngested) {
          dbg.outcome = 'image_saved';
          dbg.imageSaved = true;
          pushDebug(dbg);
          await markGmailMessageHandled(id, 'image_branch').catch(() => {});
          continue;
        }
        /* image present but not saved — try text body below */
      }
    }

    const plain = bestPlainFromGmailParts(parts);
    dbg.plainLength = plain.length;
    if (adminDebug) {
      dbg.plainPreview = plain.slice(0, 600);
    }

    if (plain.length < 40) {
      await markGmailMessageHandled(id, 'short_or_no_plain_text').catch(() => {});
      dbg.outcome = 'short_or_no_plain_text';
      pushDebug(dbg);
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
      dbg.outcome = 'text_extract_failed';
      pushDebug(dbg);
      continue;
    }

    const validIdx: number[] = [];
    for (let i = 0; i < events.length; i++) {
      if (validateSlackTextExtractedEvent(events[i]).ok) validIdx.push(i);
    }

    let docAttach: GmailDocumentAttachment | null = null;
    let pdfUploadedPath: string | null = null;
    if (validIdx.length > 0 && pdfPart) {
      try {
        const pdfBytes = await getPartBytes(gmail, 'me', id, pdfPart);
        if (pdfBytes && pdfBytes.byteLength > 0 && pdfBytes.byteLength <= MAX_PDF_BYTES) {
          const pdfName =
            typeof pdfPart.filename === 'string' && pdfPart.filename.trim()
              ? pdfPart.filename.trim()
              : `gmail_${id}.pdf`;
          const ts = Date.now();
          const safePdf = pdfName.replace(/[^a-zA-Z0-9.-]/g, '_');
          const pdfPath = `flyers/gmail_${id}_${ts}_${safePdf || 'attachment.pdf'}`;
          const { downloadURL } = await uploadBytesToStorage({
            bytes: new Uint8Array(pdfBytes),
            storagePath: pdfPath,
            contentType: 'application/pdf',
          });
          docAttach = {
            downloadURL,
            storagePath: pdfPath,
            originalFilename: pdfName,
            mimeType: 'application/pdf',
          };
          pdfUploadedPath = pdfPath;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        summary.failed += 1;
        summary.errors.push(`message ${id} pdf: ${msg}`);
      }
    }

    let savedFromMessage = 0;
    for (const i of validIdx) {
      const ev = events[i];
      const dedupeSlot = `gmail:${id}:text:${i}`;
      try {
        const persisted = await persistGmailTextFlyer({
          extractedEvent: ev,
          rawModelOutput,
          gmailMessageId: id,
          gmailEventDedupe: dedupeSlot,
          emailRFCMessageId: rfcId,
          eventIndex: i,
          documentAttachment: docAttach,
        });
        if (persisted.mode === 'firebase' && 'flyerId' in persisted) {
          summary.textEventsIngested += 1;
          savedFromMessage += 1;
        } else if (
          persisted.mode === 'firebase' &&
          persisted.skippedDuplicate &&
          persisted.reason === 'event_already_exists'
        ) {
          summary.textEventsSkippedDuplicate += 1;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        summary.failed += 1;
        summary.errors.push(`message ${id} text evt ${i}: ${msg}`);
      }
    }

    if (pdfUploadedPath && savedFromMessage === 0) {
      await deleteStorageObjectAtPath(pdfUploadedPath).catch(() => {});
      docAttach = null;
    } else if (pdfUploadedPath && savedFromMessage > 0) {
      summary.gmailDocumentsUploaded += 1;
    }

    dbg.textEventsSaved = savedFromMessage;
    const pdfKept = Boolean(pdfUploadedPath && savedFromMessage > 0);
    dbg.pdfUploaded = pdfKept;
    dbg.outcome =
      savedFromMessage > 0
        ? pdfKept
          ? 'text_saved_with_pdf'
          : 'text_saved'
        : 'text_no_valid_events_saved';
    pushDebug(dbg);

    await markGmailMessageHandled(id, 'text_branch').catch(() => {});
  }

  if (adminDebug) {
    summary.adminDebug = debugRows;
  }

  logger.info('gmail-ingest-done', {
    imagesIngested: summary.imagesIngested,
    textEventsIngested: summary.textEventsIngested,
    textEventsSkippedDuplicate: summary.textEventsSkippedDuplicate,
    gmailDocumentsUploaded: summary.gmailDocumentsUploaded,
    skippedAlreadyProcessed: summary.skippedAlreadyProcessed,
    failed: summary.failed,
  });
  return summary;
}
