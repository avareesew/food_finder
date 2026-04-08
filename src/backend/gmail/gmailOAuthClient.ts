import { google } from 'googleapis';
import type { gmail_v1 } from 'googleapis';

export type GmailClientResult =
  | { ok: true; gmail: gmail_v1.Gmail }
  | { ok: false; reason: 'missing_oauth' | 'missing_bucket'; message: string };

/**
 * Shared OAuth client for Gmail API (ingest + admin preview). Same env as cron ingest.
 * @param requireStorageBucket — set true for ingest paths that write to Firebase Storage.
 */
export function createGmailClientFromEnv(requireStorageBucket = false): GmailClientResult {
  const clientId = process.env.GMAIL_CLIENT_ID?.trim();
  const clientSecret = process.env.GMAIL_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.trim();
  const firebaseBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();

  if (!clientId || !clientSecret || !refreshToken) {
    return {
      ok: false,
      reason: 'missing_oauth',
      message: 'Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN.',
    };
  }
  if (requireStorageBucket && !firebaseBucket) {
    return {
      ok: false,
      reason: 'missing_bucket',
      message: 'Gmail ingest requires NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET.',
    };
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'urn:ietf:wg:oauth:2.0:oob');
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  return { ok: true, gmail };
}
