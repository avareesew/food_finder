import { createHash } from 'node:crypto';

import type { ExtractedEvent } from '@/backend/openai/extractEventFromFlyer';
import { coerceExtractedDateToYyyyMmDd } from '@/lib/eventTiming';

/**
 * Stable fingerprint for cross-source dedupe (Slack, Gmail, uploads) when date/time/place/title align.
 */
export function computeEventDedupeKey(ev: ExtractedEvent): string {
    const title = (ev.title ?? '').trim().toLowerCase().slice(0, 120);
    const date = coerceExtractedDateToYyyyMmDd((ev.date ?? '').trim()) || '';
    const place = (ev.place ?? '').trim().toLowerCase().slice(0, 160);
    const t1 = (ev.startTime ?? '').trim();
    const t2 = (ev.endTime ?? '').trim();
    const raw = `${date}|${t1}|${t2}|${place}|${title}`;
    return createHash('sha256').update(raw, 'utf8').digest('hex').slice(0, 40);
}
