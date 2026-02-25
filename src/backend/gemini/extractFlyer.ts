import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireEnv } from '@/backend/env';

export type FlyerExtraction = {
  title: string | null;
  building: string | null;
  room: string | null;
  startIso: string | null; // ISO 8601 string (timezone included if known)
  endIso: string | null;   // ISO 8601 string (timezone included if known)
  foodDescription: string | null;
  estimatedPortions: number | null;
  notes: string | null;
};

type ExtractFlyerResult = {
  extraction: FlyerExtraction;
  rawText: string;
};

function stripCodeFences(text: string): string {
  // Handles ```json ... ``` or ``` ... ```
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

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function getString(obj: Record<string, unknown> | null, key: string): string | null {
  if (!obj) return null;
  const v = obj[key];
  return typeof v === 'string' ? v : null;
}

function normalizeExtraction(input: unknown): FlyerExtraction {
  const obj = asRecord(input);
  return {
    title: getString(obj, 'title'),
    building: getString(obj, 'building'),
    room: getString(obj, 'room'),
    startIso: getString(obj, 'startIso'),
    endIso: getString(obj, 'endIso'),
    foodDescription: getString(obj, 'foodDescription'),
    estimatedPortions: coerceNumber(obj?.estimatedPortions),
    notes: getString(obj, 'notes'),
  };
}

export async function extractFlyerFromImageBytes(args: {
  imageBytes: Uint8Array;
  mimeType: string;
  campusTimezone?: string; // default: America/Denver (BYU)
}): Promise<ExtractFlyerResult> {
  const { imageBytes, mimeType, campusTimezone = 'America/Denver' } = args;

  const genAI = new GoogleGenerativeAI(requireEnv('GEMINI_API_KEY'));
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = [
    `You are extracting structured event data from a university flyer image.`,
    `Return ONLY valid JSON. Do not include any markdown or commentary.`,
    ``,
    `Rules:`,
    `- If a field is missing/unclear, set it to null (do not guess).`,
    `- Times must be ISO 8601 strings in the campus timezone: ${campusTimezone}.`,
    `- Use these JSON keys exactly: title, building, room, startIso, endIso, foodDescription, estimatedPortions, notes`,
    `- estimatedPortions must be a number or null.`,
    ``,
    `Example JSON:`,
    `{"title":"Pizza Social","building":"TMCB","room":"210","startIso":"2026-02-17T17:00:00-07:00","endIso":"2026-02-17T19:00:00-07:00","foodDescription":"Pizza and soda","estimatedPortions":20,"notes":null}`,
  ].join('\n');

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        data: Buffer.from(imageBytes).toString('base64'),
        mimeType,
      },
    },
  ]);

  const rawText = result.response.text();
  const jsonText = stripCodeFences(rawText);
  const parsed = safeJsonParse<unknown>(jsonText);
  if (!parsed.ok) {
    // Fall back: return null-ish extraction but preserve rawText for debugging.
    return {
      rawText,
      extraction: {
        title: null,
        building: null,
        room: null,
        startIso: null,
        endIso: null,
        foodDescription: null,
        estimatedPortions: null,
        notes: `Failed to parse JSON: ${parsed.error}`,
      },
    };
  }

  return { rawText, extraction: normalizeExtraction(parsed.value) };
}

