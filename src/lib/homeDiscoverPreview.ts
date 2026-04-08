import type { ExtractedEvent, FoodCategory } from '@/backend/openai/extractEventFromFlyer';
import type { Flyer } from '@/services/flyers';
import {
  coerceExtractedDateToYyyyMmDd,
  isCampusEventEnded,
  resolveCampusEventYyyyMmDd,
} from '@/lib/eventTiming';

/** Shape used by the home “Discover Events” preview cards. */
export type HomeDiscoverPreviewRecord = {
  id: string;
  createdAtIso: string;
  imageUrl?: string | null;
  event: {
    title: string | null;
    host: string | null;
    society?: string | null;
    campus: string | null;
    date: string | null;
    startTime: string | null;
    endTime: string | null;
    place: string | null;
    food: string | null;
    foodCategory: string | null;
    details: string | null;
    clubSignupLink?: string | null;
    participationExpectations?: string | null;
    foodEmoji?: string | null;
  };
};

const FOOD_CATEGORIES: readonly FoodCategory[] = [
  'pizza',
  'dessert',
  'snacks',
  'refreshments',
  'drinks',
  'meal',
  'other',
] as const;

function coerceFoodCategory(value: string | null): FoodCategory | null {
  if (!value) return null;
  return FOOD_CATEGORIES.includes(value as FoodCategory) ? (value as FoodCategory) : null;
}

/** Build a `Flyer` for the detail modal when data already lives in JSON preview (local / home). */
export function homePreviewRecordToFlyer(r: HomeDiscoverPreviewRecord): Flyer {
  const sec = Math.floor(new Date(r.createdAtIso).getTime() / 1000);
  const ev: ExtractedEvent = {
    title: r.event.title,
    host: r.event.host,
    society: r.event.society ?? null,
    campus: r.event.campus,
    date: r.event.date,
    startTime: r.event.startTime,
    endTime: r.event.endTime,
    place: r.event.place,
    food: r.event.food,
    foodCategory: coerceFoodCategory(r.event.foodCategory),
    details: r.event.details,
    clubSignupLink: r.event.clubSignupLink ?? null,
    participationExpectations: r.event.participationExpectations ?? null,
    other: null,
    foodEmoji: r.event.foodEmoji ?? null,
  };
  return {
    id: r.id,
    createdAt: { seconds: Number.isFinite(sec) ? sec : Math.floor(Date.now() / 1000) },
    originalFilename: r.event.title?.trim() || 'Event',
    storagePath: '',
    downloadURL: r.imageUrl ?? '',
    status: 'available',
    extractedEvent: ev,
  };
}

function sortInstantMs(date: string, startTime: string | null): number {
  const t = startTime && /^\d{2}:\d{2}$/.test(startTime) ? `${startTime}:00` : '00:00:00';
  const ms = new Date(`${date}T${t}`).getTime();
  return Number.isNaN(ms) ? Number.POSITIVE_INFINITY : ms;
}

export function flyerToHomeDiscoverPreview(f: Flyer): HomeDiscoverPreviewRecord | null {
  const id = f.id;
  if (!id) return null;
  const ev = f.extractedEvent;
  const raw = typeof ev?.date === 'string' ? ev.date.trim() : '';
  const coerced = coerceExtractedDateToYyyyMmDd(raw);
  if (!coerced) return null;
  const date = resolveCampusEventYyyyMmDd(coerced) ?? coerced;
  if (
    isCampusEventEnded({
      eventDate: date,
      endTime: typeof ev?.endTime === 'string' ? ev.endTime : null,
      startTime: typeof ev?.startTime === 'string' ? ev.startTime : null,
    })
  ) {
    return null;
  }

  const ca = f.createdAt;
  const sec = ca && typeof ca === 'object' && 'seconds' in ca ? (ca as { seconds: number }).seconds : 0;

  return {
    id,
    createdAtIso: new Date(sec * 1000).toISOString(),
    imageUrl: f.downloadURL ?? null,
    event: {
      title: typeof ev?.title === 'string' ? ev.title : null,
      host: typeof ev?.host === 'string' ? ev.host : null,
      society: typeof ev?.society === 'string' ? ev.society : null,
      campus: null,
      date,
      startTime: typeof ev?.startTime === 'string' ? ev.startTime : null,
      endTime: typeof ev?.endTime === 'string' ? ev.endTime : null,
      place: typeof ev?.place === 'string' ? ev.place : null,
      food: typeof ev?.food === 'string' ? ev.food : null,
      foodCategory: ev?.foodCategory != null ? String(ev.foodCategory) : null,
      details: typeof ev?.details === 'string' ? ev.details : null,
      clubSignupLink: typeof ev?.clubSignupLink === 'string' ? ev.clubSignupLink : null,
      participationExpectations:
        typeof ev?.participationExpectations === 'string' ? ev.participationExpectations : null,
      foodEmoji: typeof ev?.foodEmoji === 'string' ? ev.foodEmoji : null,
    },
  };
}

/** Short line for feed cards when hosts list expectations or sign-up (beyond food). */
export function eventEngagementCardPreview(
  ev: { participationExpectations?: string | null; clubSignupLink?: string | null } | null | undefined
): string | null {
  if (!ev) return null;
  const part =
    typeof ev.participationExpectations === 'string' ? ev.participationExpectations.trim() : '';
  const link = typeof ev.clubSignupLink === 'string' ? ev.clubSignupLink.trim() : '';
  if (part) {
    return part.length > 100 ? `${part.slice(0, 99)}…` : part;
  }
  if (link) {
    if (/^https?:\/\//i.test(link)) {
      return 'Sign-up link in details →';
    }
    return link.length > 100 ? `${link.slice(0, 99)}…` : link;
  }
  return null;
}

/** Next `limit` events that are not ended yet, soonest first (by calendar date + start time). */
export function pickClosestUpcomingFromFlyers(flyers: Flyer[], limit: number): HomeDiscoverPreviewRecord[] {
  const rows = flyers.map(flyerToHomeDiscoverPreview).filter((x): x is HomeDiscoverPreviewRecord => x != null);
  rows.sort((a, b) => {
    const da = a.event.date;
    const db = b.event.date;
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    const ca = sortInstantMs(da, a.event.startTime);
    const cb = sortInstantMs(db, b.event.startTime);
    return ca - cb;
  });
  return rows.slice(0, limit);
}
