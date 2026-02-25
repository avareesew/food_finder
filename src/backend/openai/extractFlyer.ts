import { requireEnv } from '@/backend/env';

export type OpenAIExtraction = {
  title: string | null;
  building: string | null;
  room: string | null;
  startIso: string | null;
  endIso: string | null;
  foodDescription: string | null;
  estimatedPortions: number | null;
  notes: string | null;
};

type ExtractResult = {
  extraction: OpenAIExtraction;
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

function normalize(input: unknown): OpenAIExtraction {
  const obj = asRecord(input);
  return {
    title: typeof obj?.title === 'string' ? obj.title : null,
    building: typeof obj?.building === 'string' ? obj.building : null,
    room: typeof obj?.room === 'string' ? obj.room : null,
    startIso: typeof obj?.startIso === 'string' ? obj.startIso : null,
    endIso: typeof obj?.endIso === 'string' ? obj.endIso : null,
    foodDescription: typeof obj?.foodDescription === 'string' ? obj.foodDescription : null,
    estimatedPortions: coerceNumber(obj?.estimatedPortions),
    notes: typeof obj?.notes === 'string' ? obj.notes : null,
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
export async function extractFlyerWithOpenAI(args: {
  imageBytes: Uint8Array;
  mimeType: string;
  campusTimezone?: string;
}): Promise<ExtractResult> {
  const { imageBytes, mimeType, campusTimezone = 'America/Denver' } = args;

  const apiKey = requireEnv('OPENAI_API_KEY');
  const dataUrl = `data:${mimeType};base64,${Buffer.from(imageBytes).toString('base64')}`;

  const prompt = [
    `Extract structured event data from this university flyer image.`,
    `Return ONLY valid JSON (no markdown).`,
    ``,
    `If unknown/unclear, set the field to null. Do not guess.`,
    `Times must be ISO 8601 strings in the campus timezone: ${campusTimezone}.`,
    ``,
    `Return these keys exactly:`,
    `title, building, room, startIso, endIso, foodDescription, estimatedPortions, notes`,
    ``,
    `estimatedPortions must be a number or null.`,
  ].join('\n');

  // Using Responses API (no SDK dependency)
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      // Use a capable multimodal model; can be adjusted later
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

  return { rawModelOutput: String(rawModelOutput || ''), extraction: normalize(parsed.value) };
}

