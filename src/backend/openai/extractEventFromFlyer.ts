import { requireEnv } from '@/backend/env';

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
  campus: string | null; // e.g. "BYU"
  date: string | null; // YYYY-MM-DD (local campus date)
  startTime: string | null; // HH:MM (24h) local campus time
  endTime: string | null; // HH:MM (24h) local campus time
  place: string | null; // e.g. "TMCB 210" or "JFSB Lobby"
  food: string | null; // e.g. "treats", "pizza", "refreshments"
  foodCategory: FoodCategory | null;
  details: string | null; // any extra helpful info (club name, agenda, notes)
  other: Record<string, unknown> | null; // optional extra extracted fields
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

function normalize(input: unknown): ExtractedEvent {
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

  return {
    title: typeof obj?.title === 'string' ? obj.title : null,
    host: typeof obj?.host === 'string' ? obj.host : null,
    campus: typeof obj?.campus === 'string' ? obj.campus : null,
    date: typeof obj?.date === 'string' ? obj.date : null,
    startTime: typeof obj?.startTime === 'string' ? obj.startTime : null,
    endTime: typeof obj?.endTime === 'string' ? obj.endTime : null,
    place: typeof obj?.place === 'string' ? obj.place : null,
    food: typeof obj?.food === 'string' ? obj.food : null,
    foodCategory: typeof fc === 'string' && allowed.has(fc) ? (fc as FoodCategory) : null,
    details: typeof obj?.details === 'string' ? obj.details : null,
    other: obj?.other && typeof obj.other === 'object' ? (obj.other as Record<string, unknown>) : null,
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
  const dataUrl = `data:${mimeType};base64,${Buffer.from(imageBytes).toString('base64')}`;

  const prompt = [
    `Extract the event information from this flyer image.`,
    `Return ONLY valid JSON (no markdown, no extra text).`,
    ``,
    `If something is unclear, set it to null (do not guess).`,
    `Use campus timezone: ${campusTimezone}.`,
    ``,
    `Return these keys EXACTLY:`,
    `title, host, campus, date, startTime, endTime, place, food, foodCategory, details, other`,
    ``,
    `Formatting rules:`,
    `- date: "YYYY-MM-DD"`,
    `- startTime/endTime: "HH:MM" in 24-hour time`,
    `- foodCategory must be one of: pizza, dessert, snacks, refreshments, drinks, meal, other (or null)`,
    `- If flyer says "treats" or "refreshments", put that in food and use foodCategory "refreshments".`,
    `- host: club/org/department hosting the event (if shown).`,
    `- campus: campus name or abbreviation (e.g. "BYU") if obvious; else null.`,
    ``,
    `Example:`,
    `{"title":"MIBS Community Service Night","host":"MIBS","campus":"BYU","date":"2026-02-11","startTime":"19:00","endTime":"20:30","place":"TNRB 170","food":"treats","foodCategory":"refreshments","details":"Treats will be provided. Come join MIBS and The Policy Project!","other":null}`,
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
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OpenAI error (${res.status}): ${errText || res.statusText}`);
  }

  const payload: unknown = await res.json();
  const rawModelOutput = getRawModelOutput(payload);

  const jsonText = stripCodeFences(String(rawModelOutput || '').trim());
  const parsed = safeJsonParse<unknown>(jsonText);
  if (!parsed.ok) {
    return {
      rawModelOutput: String(rawModelOutput || ''),
      event: {
        title: null,
        host: null,
        campus: null,
        date: null,
        startTime: null,
        endTime: null,
        place: null,
        food: null,
        foodCategory: null,
        details: `Failed to parse JSON: ${parsed.error}`,
        other: null,
      },
    };
  }

  return { rawModelOutput: String(rawModelOutput || ''), event: normalize(parsed.value) };
}

