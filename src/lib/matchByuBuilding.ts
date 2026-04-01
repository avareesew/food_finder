import { BYU_BUILDINGS } from '@/data/byuBuildings';

function normalizePlace(place: string): string {
  return ` ${place
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

function tokensFromPlace(place: string): string[] {
  const raw = place.toLowerCase().match(/[a-z0-9]+/g);
  return raw ?? [];
}

/**
 * Match flyer `place` to a BYU building. Longest phrase alias wins (e.g. "kimball tower" before "kimball").
 */
export function matchByuBuildingId(place: string | null | undefined): string | null {
  if (!place || typeof place !== 'string') return null;
  const trimmed = place.trim();
  if (trimmed.length < 2) return null;

  const n = normalizePlace(trimmed);
  if (n.length < 3) return null;

  let bestPhrase: { id: string; len: number } | null = null;
  for (const b of BYU_BUILDINGS) {
    for (const a of b.aliases) {
      const inner = a.trim().toLowerCase().replace(/\s+/g, ' ');
      if (inner.length < 2) continue;
      const needle = ` ${inner} `;
      if (n.includes(needle)) {
        const len = inner.length;
        if (!bestPhrase || len > bestPhrase.len) bestPhrase = { id: b.id, len };
      }
    }
  }
  if (bestPhrase) return bestPhrase.id;

  const tokens = tokensFromPlace(trimmed);
  for (const t of tokens) {
    if (t === 'cb') return 'cb';
  }
  for (const t of tokens) {
    for (const b of BYU_BUILDINGS) {
      if (b.id === 'cb') continue;
      for (const c of b.codes) {
        if (t === c) return b.id;
        if (c.length >= 3 && t.startsWith(c)) {
          const rest = t.slice(c.length);
          if (rest.length === 0 || /^\d/.test(rest)) return b.id;
        }
      }
    }
  }

  return null;
}
