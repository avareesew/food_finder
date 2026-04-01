/**
 * Campus-focused date/time helpers (BYU area uses America/Denver in extraction).
 */

const CAMPUS_TZ = 'America/Denver';

function todayYyyyMmDdInCampus(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: CAMPUS_TZ });
}

/** Today’s calendar date in America/Denver as `YYYY-MM-DD`. */
export function getCampusTodayYyyyMmDd(): string {
  return todayYyyyMmDdInCampus();
}

function campusNowMinutes(): number {
  const parts = new Date().toLocaleTimeString('en-US', {
    timeZone: CAMPUS_TZ,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
  const [h, m] = parts.split(':').map((x) => parseInt(x, 10));
  return h * 60 + m;
}

function parseHmToMinutes(t: string | null | undefined): number | null {
  if (!t || typeof t !== 'string') return null;
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(t.trim());
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

/**
 * Model output is often almost ISO: `2026-4-9` or `04/09/2026`. Normalize to strict YYYY-MM-DD
 * so cards don't fall back to `status === 'gone'` for "ended" when the date is actually parseable.
 */
export function coerceExtractedDateToYyyyMmDd(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const loose = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (loose) {
    const y = parseInt(loose[1], 10);
    const mo = parseInt(loose[2], 10);
    const da = parseInt(loose[3], 10);
    const out = `${loose[1]}-${String(mo).padStart(2, '0')}-${String(da).padStart(2, '0')}`;
    const dt = new Date(Date.UTC(y, mo - 1, da, 12, 0, 0));
    if (Number.isNaN(dt.getTime())) return null;
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() + 1 !== mo || dt.getUTCDate() !== da) return null;
    return out;
  }

  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (us) {
    const mo = parseInt(us[1], 10);
    const da = parseInt(us[2], 10);
    const y = parseInt(us[3], 10);
    if (mo < 1 || mo > 12 || da < 1 || da > 31) return null;
    const dt = new Date(Date.UTC(y, mo - 1, da, 12, 0, 0));
    if (Number.isNaN(dt.getTime())) return null;
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() + 1 !== mo || dt.getUTCDate() !== da) return null;
    return `${y}-${String(mo).padStart(2, '0')}-${String(da).padStart(2, '0')}`;
  }

  return null;
}

/**
 * Flyer extraction often stores the wrong year (e.g. 2025-04-09 for an April 9, 2026 event).
 * If the raw YYYY-MM-DD is already on or after "today" (America/Denver), return it.
 * If it is in the past, try the same month/day in today's calendar year; if that date is
 * still >= today, return it. Otherwise return the raw value (event is truly in the past).
 */
export function resolveCampusEventYyyyMmDd(raw: string | null | undefined): string | null {
  const eventDate = coerceExtractedDateToYyyyMmDd(raw);
  if (!eventDate) return null;

  const today = todayYyyyMmDdInCampus();
  if (eventDate >= today) return eventDate;

  const mo = eventDate.slice(5, 7);
  const da = eventDate.slice(8, 10);
  const ty = today.slice(0, 4);
  const candidate = `${ty}-${mo}-${da}`;
  if (candidate >= today) return candidate;

  return eventDate;
}

/**
 * True when the event is clearly over (by calendar date or same-day end/start time vs now).
 */
export function isCampusEventEnded(args: {
  eventDate: string | null | undefined;
  endTime: string | null | undefined;
  startTime: string | null | undefined;
}): boolean {
  const { eventDate, endTime, startTime } = args;
  const resolved = resolveCampusEventYyyyMmDd(eventDate);
  if (!resolved) return false;

  const today = todayYyyyMmDdInCampus();
  if (resolved < today) return true;
  if (resolved > today) return false;

  let endMin = parseHmToMinutes(endTime);
  let startMin = parseHmToMinutes(startTime);
  /**
   * Common extraction mistake: "8:00 PM" stored as 08:00 (8 AM). If start is clearly PM/evening
   * and end reads as morning but is before start, assume end was meant PM the same day.
   */
  if (
    startMin != null &&
    endMin != null &&
    endMin < startMin &&
    startMin >= 12 * 60 &&
    endMin < 12 * 60
  ) {
    endMin += 12 * 60;
  }

  const nowMin = campusNowMinutes();

  if (endMin != null) return nowMin > endMin;
  if (startMin != null) return nowMin > startMin;
  return false;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** "Wed, Mar 30" from YYYY-MM-DD in a stable way (UTC noon parse). */
export function formatEventDateLabel(yyyyMmDd: string | null | undefined): string | null {
  if (!yyyyMmDd || !/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) return null;
  const [y, mo, d] = yyyyMmDd.split('-').map((x) => parseInt(x, 10));
  const dt = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
  return `${WEEKDAYS[dt.getUTCDay()]}, ${MONTHS[mo - 1]} ${d}`;
}

/** "6:00 PM" from 24h HH:MM */
export function formatTime12h(hhMm: string | null | undefined): string | null {
  const mins = parseHmToMinutes(hhMm ?? '');
  if (mins == null) return null;
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const am = h < 12 || h === 24;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m.toString().padStart(2, '0');
  return `${h12}:${mm} ${am ? 'AM' : 'PM'}`;
}
