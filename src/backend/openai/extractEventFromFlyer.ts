import { requireEnv } from '@/backend/env';
import { coerceExtractedDateToYyyyMmDd } from '@/lib/eventTiming';
import { logger } from '@/lib/logger';

export type FoodCategory =
  | 'pizza'
  | 'dessert'
  | 'snacks'
  | 'refreshments'
  | 'drinks'
  | 'meal'
  | 'other';

/**
 * This is the minimal JSON we want back for MVP validation.
 * We keep it close to what we'll later store in Firestore.
 */
export type ExtractedEvent = {
  title: string | null;
  host: string | null; // organizer / club / department
  /** Student club or society name when stated (plain text; optional). */
  society: string | null;
  campus: string | null; // e.g. "BYU"
  date: string | null; // YYYY-MM-DD (local campus date)
  startTime: string | null; // HH:MM (24h) local campus time
  endTime: string | null; // HH:MM (24h) local campus time
  place: string | null; // e.g. "TMCB 210" or "JFSB Lobby"
  food: string | null; // e.g. "treats", "pizza", "refreshments"
  foodCategory: FoodCategory | null;
  details: string | null; // any extra helpful info (club name, agenda, notes)
  /** Sign-up URL, mailing list, Handshake, Linktree, or "QR on flyer" if no URL — null if not stated */
  clubSignupLink: string | null;
  /** What hosts expect beyond grabbing food: stay for full program, dress code, networking, capacity caps, etc. */
  participationExpectations: string | null;
  other: Record<string, unknown> | null; // optional extra extracted fields
  /** Single display emoji for food (Slack text posts, optional elsewhere) */
  foodEmoji?: string | null;
};

type ExtractResult = {
  event: ExtractedEvent;
  rawModelOutput: string;
};

function stripCodeFences(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (fenced?.[1] ?? text).trim();
}

function safeJsonParse<T>(text: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown JSON parse error' };
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

export function normalizeExtractedEvent(input: unknown): ExtractedEvent {
  const obj = asRecord(input);
  const fc = obj?.foodCategory;
  const allowed: Set<string> = new Set([
    'pizza',
    'dessert',
    'snacks',
    'refreshments',
    'drinks',
    'meal',
    'other',
  ]);

  const rawDate = typeof obj?.date === 'string' ? obj.date.trim() : null;
  const date =
    rawDate != null ? (coerceExtractedDateToYyyyMmDd(rawDate) ?? rawDate) : null;

  const fe = obj?.foodEmoji;
  const linkRaw = typeof obj?.clubSignupLink === 'string' ? obj.clubSignupLink.trim().slice(0, 2048) : '';
  const partRaw =
    typeof obj?.participationExpectations === 'string' ? obj.participationExpectations.trim().slice(0, 2000) : '';
  const societyRaw = typeof obj?.society === 'string' ? obj.society.trim().slice(0, 200) : '';
  return {
    title: typeof obj?.title === 'string' ? obj.title : null,
    host: typeof obj?.host === 'string' ? obj.host : null,
    society: societyRaw.length > 0 ? societyRaw : null,
    campus: typeof obj?.campus === 'string' ? obj.campus : null,
    date,
    startTime: typeof obj?.startTime === 'string' ? obj.startTime : null,
    endTime: typeof obj?.endTime === 'string' ? obj.endTime : null,
    place: typeof obj?.place === 'string' ? obj.place : null,
    food: typeof obj?.food === 'string' ? obj.food : null,
    foodCategory: typeof fc === 'string' && allowed.has(fc) ? (fc as FoodCategory) : null,
    details: typeof obj?.details === 'string' ? obj.details : null,
    clubSignupLink: linkRaw.length > 0 ? linkRaw : null,
    participationExpectations: partRaw.length > 0 ? partRaw : null,
    other: obj?.other && typeof obj.other === 'object' ? (obj.other as Record<string, unknown>) : null,
    foodEmoji: typeof fe === 'string' && fe.trim() ? fe.trim().slice(0, 8) : null,
  };
}

function getRawModelOutput(payload: unknown): string {
  const p = asRecord(payload);
  const direct = p?.output_text;
  if (typeof direct === 'string') return direct;

  const out = p?.output;
  if (!Array.isArray(out) || out.length === 0) return '';

  const first = asRecord(out[0]);
  const content = first?.content;
  if (!Array.isArray(content)) return '';

  const texts: string[] = [];
  for (const item of content) {
    const c = asRecord(item);
    const t = c?.text;
    if (typeof t === 'string') texts.push(t);
  }
  return texts.join('\n');
}

/**
 * Uses OpenAI vision (ChatGPT) to extract event fields from a flyer image.
 *
 * Requires:
 * - OPENAI_API_KEY
 */
export async function extractEventFromFlyerWithOpenAI(args: {
  imageBytes: Uint8Array;
  mimeType: string;
  campusTimezone?: string;
}): Promise<ExtractResult> {
  const { imageBytes, mimeType, campusTimezone = 'America/Denver' } = args;

  const apiKey = requireEnv('OPENAI_API_KEY');
  logger.info('openai-extract-start', { type: 'image', mimeType });
  const dataUrl = `data:${mimeType};base64,${Buffer.from(imageBytes).toString('base64')}`;

  const prompt = [
    `Extract the event information from this flyer image.`,
    `Return ONLY valid JSON (no markdown, no extra text).`,
    ``,
    `Prioritize these four details whenever visible on the flyer: date (calendar day), time (start/end), place (building/room), and food or refreshments (including "free food", treats, meals, drinks).`,
    `Food is often an incentive to attend — also capture how hosts want people to engage: club signup/landing URLs, QR mentions, and expectations (e.g. stay for the full session, business casual, networking expected, first N students only).`,
    `If something is unclear, set it to null (do not guess).`,
    `Use campus timezone: ${campusTimezone}.`,
    ``,
    `Return these keys EXACTLY:`,
    `title, host, society, campus, date, startTime, endTime, place, food, foodCategory, details, clubSignupLink, participationExpectations, other, foodEmoji`,
    `- foodEmoji: one emoji for the food type (e.g. 🍕) or null if unclear.`,
    ``,
    `Formatting rules:`,
    `- date: "YYYY-MM-DD"`,
    `- startTime/endTime: "HH:MM" in 24-hour time`,
    `- foodCategory must be one of: pizza, dessert, snacks, refreshments, drinks, meal, other (or null)`,
    `- If flyer says "treats" or "refreshments", put that in food and use foodCategory "refreshments".`,
    `- host: club/org/department hosting the event (if shown).`,
    `- society: student club or society name only if clearly stated (e.g. "Women in AIS", "BYU ACM"); null if unknown or redundant with host alone.`,
    `- campus: campus name or abbreviation (e.g. "BYU") if obvious; else null.`,
    `- clubSignupLink: full https URL if shown; otherwise a short note like "QR code on flyer" or "link in Instagram bio"; null if absent.`,
    `- participationExpectations: one concise line or sentence combining dress code, stay-for-duration, networking, or capacity rules; null if absent.`,
    ``,
    `Example:`,
    `{"title":"MIBS Community Service Night","host":"MIBS","society":"MIBS","campus":"BYU","date":"2026-02-11","startTime":"19:00","endTime":"20:30","place":"TNRB 170","food":"treats","foodCategory":"refreshments","details":"Treats will be provided. Come join MIBS and The Policy Project!","clubSignupLink":null,"participationExpectations":"Please stay for the full presentation.","other":null,"foodEmoji":"🍪"}`,
  ].join('\n');

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: dataUrl },
          ],
        },
      ],
      temperature: 0,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    logger.error('openai-extract-failure', { status: res.status, error: errText || res.statusText });
    throw new Error(`OpenAI error (${res.status}): ${errText || res.statusText}`);
  }

  const payload: unknown = await res.json();
  logger.info('openai-extract-success', { type: 'image' });
  const rawModelOutput = getRawModelOutput(payload);

  const jsonText = stripCodeFences(String(rawModelOutput || '').trim());
  const parsed = safeJsonParse<unknown>(jsonText);
  if (!parsed.ok) {
    return {
      rawModelOutput: String(rawModelOutput || ''),
      event: {
        title: null,
        host: null,
        society: null,
        campus: null,
        date: null,
        startTime: null,
        endTime: null,
        place: null,
        food: null,
        foodCategory: null,
        details: `Failed to parse JSON: ${parsed.error}`,
        clubSignupLink: null,
        participationExpectations: null,
        other: null,
        foodEmoji: null,
      },
    };
  }

  return { rawModelOutput: String(rawModelOutput || ''), event: normalizeExtractedEvent(parsed.value) };
}

