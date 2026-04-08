import { requireEnv } from '@/backend/env';
import { normalizeExtractedEvent, type ExtractedEvent } from '@/backend/openai/extractEventFromFlyer';
import { applySlackTbaPlaceFallback } from '@/lib/validateFlyerExtraction';
import { inferFoodEmoji } from '@/lib/foodEmoji';
import { logger } from '@/lib/logger';

function stripCodeFences(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (fenced?.[1] ?? text).trim();
}

function safeJsonParse(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'parse error' };
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
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
 * Parses one Slack message that may list several campus activities (with or without images).
 * Returns structured events for storage as flyer-equivalent rows without an image.
 */
export async function extractEventsFromSlackMessageText(args: {
  messageText: string;
  nowYearHint: number;
}): Promise<{ events: ExtractedEvent[]; rawModelOutput: string }> {
  const { messageText, nowYearHint } = args;
  logger.info('openai-extract-start', { type: 'slack-text', textLength: messageText.length });
  const apiKey = requireEnv('OPENAI_API_KEY');

  const prompt = [
    `You read announcements posted in a university Slack channel or forwarded email bodies (plain text; may include nested "From:/Sent:/Subject:" headers — read past those for the real invitation).`,
    `Extract every distinct upcoming food-related or social event mentioned. Skip pure admin notices with no event.`,
    `For each event you MUST fill the four actionable fields whenever the source mentions them: (1) date — calendar day, (2) time — start and/or end, (3) place — building/room, (4) food or refreshments — what is served (if it says "free food", "pizza", "Zupas", "light refreshments", etc., put that in food).`,
    `Food is often an incentive to attend, not the only point — whenever the post mentions how to join the org (signup URL, mailing list, Handshake, QR, Instagram link) put that in clubSignupLink (URL or short note). If it states expectations (stay for full event, business casual, networking required, first 100 students, etc.) put a concise summary in participationExpectations; otherwise null.`,
    `Return ONLY valid JSON (no markdown). Shape:`,
    `{"events":[{...}, ...]}`,
    `Each object must use these keys exactly: title, host, society, campus, date, startTime, endTime, place, food, foodCategory, details, clubSignupLink, participationExpectations, foodEmoji, other`,
    `- society: student club or society name if clearly stated; null if unknown.`,
    `- date: "YYYY-MM-DD" for the primary day of the event (if a range is given, use the first day people should show up, or the single day).`,
    `- startTime/endTime: "HH:MM" 24h local time. If only "7 PM" is given, set startTime to 19:00 and endTime null unless an end is stated.`,
    `- If the post gives a date range spanning multiple days with one time, set date to the first relevant day and describe the range in details.`,
    `- place: room/building text. If the location is TBA / to be announced / TBD, set place to "TBA" (we will replace it later).`,
    `- food: short phrase (e.g. "Popcorn", "Light refreshments"). If unknown say "TBD" or describe from context.`,
    `- foodCategory: one of pizza, dessert, snacks, refreshments, drinks, meal, other (or null).`,
    `- foodEmoji: exactly one Unicode emoji summarizing the food (e.g. pizza → 🍕). If food is unknown, use 🍽️.`,
    `- details: extra lines (agenda, speaker, context).`,
    `- clubSignupLink: https URL or short note (e.g. "QR on poster"); null if not mentioned.`,
    `- participationExpectations: one line summarizing attendance/dress/networking/capacity rules; null if none.`,
    `- other: null or a small object for quirks.`,
    `Assume campus timezone America/Denver. Year hint for ambiguous dates: ${nowYearHint}.`,
    `If there are zero events, return {"events":[]}.`,
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
          content: [{ type: 'input_text', text: `${prompt}\n\n---\nMESSAGE:\n${messageText}\n---` }],
        },
      ],
      temperature: 0,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`OpenAI error (${res.status}): ${errText || res.statusText}`);
  }

  const payload: unknown = await res.json();
  const rawModelOutput = getRawModelOutput(payload);
  const jsonText = stripCodeFences(String(rawModelOutput || '').trim());
  const parsed = safeJsonParse(jsonText);
  if (!parsed.ok) {
    return { events: [], rawModelOutput: String(rawModelOutput || '') };
  }

  const root = asRecord(parsed.value);
  const arr = root?.events;
  if (!Array.isArray(arr)) {
    return { events: [], rawModelOutput: String(rawModelOutput || '') };
  }

  const events: ExtractedEvent[] = [];
  for (const item of arr) {
    const ev = normalizeExtractedEvent(item);
    const place = applySlackTbaPlaceFallback(ev.place);
    const emoji =
      ev.foodEmoji && ev.foodEmoji.length > 0 ? ev.foodEmoji : inferFoodEmoji(ev.food, ev.foodCategory);
    events.push({
      ...ev,
      place,
      foodEmoji: emoji,
    });
  }

  return { events, rawModelOutput: String(rawModelOutput || '') };
}
