/** Gmail API (read inbox) — same Google Cloud OAuth client as you use to obtain a refresh token. */

export function isGmailIngestConfigured(): boolean {
  return Boolean(
    process.env.GMAIL_CLIENT_ID?.trim() &&
      process.env.GMAIL_CLIENT_SECRET?.trim() &&
      process.env.GMAIL_REFRESH_TOKEN?.trim()
  );
}

export function gmailInboxQuery(): string {
  const raw = process.env.GMAIL_INGEST_QUERY?.trim();
  if (raw) return raw;
  return 'in:inbox newer_than:2d';
}

export function gmailListMaxResults(): number {
  const raw = process.env.GMAIL_INGEST_MAX_RESULTS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 25;
  if (!Number.isFinite(n) || n < 1) return 25;
  return Math.min(n, 50);
}
