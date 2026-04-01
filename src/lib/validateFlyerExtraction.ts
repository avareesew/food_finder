import type { ExtractedEvent } from '@/backend/openai/extractEventFromFlyer';
import type { OpenAIExtraction } from '@/backend/openai/extractFlyer';
import { coerceExtractedDateToYyyyMmDd } from '@/lib/eventTiming';

export type FlyerRequiredMissing = 'date' | 'time' | 'place';

const HM = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function isValidHm(t: string | null | undefined): boolean {
  if (!t || typeof t !== 'string') return false;
  return HM.test(t.trim());
}

function parseableIso(iso: string | null | undefined): boolean {
  if (!iso || typeof iso !== 'string') return false;
  const ms = Date.parse(iso.trim());
  return !Number.isNaN(ms);
}

/**
 * Flyers must include a calendar date, at least one wall-clock time (start and/or end),
 * and a location string so events are actionable on campus.
 */
export function validateExtractedEventRequired(ev: ExtractedEvent): {
  ok: true;
} | { ok: false; message: string; missing: FlyerRequiredMissing[] } {
  const missing: FlyerRequiredMissing[] = [];

  const rawDate = typeof ev.date === 'string' ? ev.date.trim() : '';
  if (!coerceExtractedDateToYyyyMmDd(rawDate)) {
    missing.push('date');
  }

  const hasTime = isValidHm(ev.startTime) || isValidHm(ev.endTime);
  if (!hasTime) {
    missing.push('time');
  }

  const place = typeof ev.place === 'string' ? ev.place.trim() : '';
  if (place.length < 2) {
    missing.push('place');
  }

  if (missing.length === 0) return { ok: true };

  const hint: Record<FlyerRequiredMissing, string> = {
    date: 'a clear event date (calendar day)',
    time: 'start and/or end time (e.g. 18:30)',
    place: 'where it happens (building / room)',
  };
  const message = `This flyer was not saved. The image must show ${missing.map((k) => hint[k]).join(', ')}. Please upload a flyer that includes all of them, or fix the text and try again.`;

  return { ok: false, message, missing };
}

/** Legacy local `events.json` shape from `extractFlyerWithOpenAI`. */
export function validateOpenAIExtractionRequired(ex: OpenAIExtraction): {
  ok: true;
} | { ok: false; message: string; missing: FlyerRequiredMissing[] } {
  const missing: FlyerRequiredMissing[] = [];

  const hasWhen = parseableIso(ex.startIso) || parseableIso(ex.endIso);
  if (!hasWhen) {
    missing.push('date');
    missing.push('time');
  }

  const place = [ex.building, ex.room]
    .filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    .join(' ')
    .trim();
  if (place.length < 2) {
    missing.push('place');
  }

  const uniq = Array.from(new Set(missing));
  if (uniq.length === 0) return { ok: true };

  const needsWhen = uniq.includes('date') || uniq.includes('time');
  const needsPlace = uniq.includes('place');
  const parts: string[] = [];
  if (needsWhen) parts.push('a clear date and time on the flyer');
  if (needsPlace) parts.push('building and/or room');
  const message = `This flyer was not saved. We need ${parts.join(' and ')}. Try a sharper photo or a flyer that lists when and where the activity is.`;

  return { ok: false, message, missing: uniq };
}
