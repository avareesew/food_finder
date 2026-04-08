import { createHash } from 'node:crypto';

import type { ExtractedEvent } from '@/backend/openai/extractEventFromFlyer';
import { coerceExtractedDateToYyyyMmDd } from '@/lib/eventTiming';

/**
 * Normalize wall-clock times for dedupe (24h HH:MM). Empty if missing.
 * Pads hours and minutes so "7:00" and "07:00" align.
 */
export function normalizeTimeForDedupe(t: string | null | undefined): string {
  if (t == null || typeof t !== 'string') return '';
  const s = t.trim();
  if (!s) return '';
  const m = /^([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(s);
  if (!m) {
    return s.replace(/\s+/g, '').toLowerCase();
  }
  let h = parseInt(m[1], 10);
  let min = parseInt(m[2], 10);
  if (h < 0) h = 0;
  if (h > 23) h = 23;
  if (min < 0) min = 0;
  if (min > 59) min = 59;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/**
 * Normalize location: lowercase, collapse whitespace, soften punctuation so
 * "TNRB 284", "tnrb  284", and "TNRB-284" match for dedupe.
 * Title is not used here — wording differences should not split the same happening.
 */
export function normalizePlaceForDedupe(place: string | null | undefined): string {
  let s = (place ?? '').trim().toLowerCase();
  if (!s) return '';
  s = s.replace(/[\u00a0\t\n\r]+/g, ' ');
  s = s.replace(/[.,|/#]+/g, ' ');
  s = s.replace(/\s*-\s*/g, ' ');
  s = s.replace(/-+/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s.slice(0, 200);
}

/**
 * Cross-source fingerprint (Slack, Gmail, uploads): same calendar day + normalized **start**
 * time + normalized place. **Title is excluded** so Slack vs email wording ("CPG Sales" vs
 * "CPG Sales with Just Ingredients") does not create a second row for the same slot.
 *
 * We use **start time**, or **end time** if start is missing (validated posts have at least one).
 * End time is not a separate key field so "7–8 PM" vs "7 PM" alone does not split one activity
 * across sources. Different wall-clock anchors still produce different keys.
 *
 * Hash input is versioned (`v2|`) so keys do not collide with the legacy title-inclusive scheme.
 */
export function computeEventDedupeKey(ev: ExtractedEvent): string {
  const date = coerceExtractedDateToYyyyMmDd((ev.date ?? '').trim()) || '';
  const start =
    normalizeTimeForDedupe(ev.startTime) || normalizeTimeForDedupe(ev.endTime);
  const place = normalizePlaceForDedupe(ev.place);
  const raw = `v2|${date}|${start}|${place}`;
  return createHash('sha256').update(raw, 'utf8').digest('hex').slice(0, 40);
}
