import type { DocumentData } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Plain JSON for browser consumption (Timestamps → { seconds, nanoseconds }).
 */
export function flyerDocToClientJson(id: string, data: DocumentData): Record<string, unknown> {
  const out: Record<string, unknown> = { ...data, id };
  const ca = data.createdAt;
  if (ca instanceof Timestamp) {
    out.createdAt = { seconds: ca.seconds, nanoseconds: ca.nanoseconds };
  } else if (ca && typeof ca === 'object' && '_seconds' in ca) {
    const s = ca as { _seconds: number; _nanoseconds?: number };
    out.createdAt = { seconds: s._seconds, nanoseconds: s._nanoseconds ?? 0 };
  } else {
    out.createdAt = { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 };
  }
  return out;
}
