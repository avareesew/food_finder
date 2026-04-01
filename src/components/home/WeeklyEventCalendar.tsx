'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import EventDetailModal from '@/components/ui/EventDetailModal';
import { addDays, addWeeks, format, isSameDay, startOfWeek } from 'date-fns';
import { getRecentFlyers, type Flyer } from '@/services/flyers';
import {
  coerceExtractedDateToYyyyMmDd,
  formatTime12h,
  resolveCampusEventYyyyMmDd,
} from '@/lib/eventTiming';
import PinIcon from '@/components/ui/PinIcon';

export type CalendarEventItem = {
  id: string;
  date: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  place: string | null;
  imageUrl?: string | null;
  food?: string | null;
};

type LocalRecord = {
  id: string;
  imageUrl?: string | null;
  event: {
    title: string | null;
    date: string | null;
    startTime: string | null;
    endTime: string | null;
    place: string | null;
    food?: string | null;
  };
};

function flyerToItems(flyers: Flyer[]): CalendarEventItem[] {
  const out: CalendarEventItem[] = [];
  for (const f of flyers) {
    const id = f.id;
    if (!id) continue;
    const ev = f.extractedEvent;
    const raw = typeof ev?.date === 'string' ? ev.date.trim() : '';
    const coerced = coerceExtractedDateToYyyyMmDd(raw);
    if (!coerced) continue;
    const date = resolveCampusEventYyyyMmDd(coerced) ?? coerced;
    const title =
      typeof ev?.title === 'string' && ev.title.trim()
        ? ev.title.trim()
        : f.originalFilename || 'Event';
    out.push({
      id,
      date,
      title,
      startTime: typeof ev?.startTime === 'string' ? ev.startTime : null,
      endTime: typeof ev?.endTime === 'string' ? ev.endTime : null,
      place: typeof ev?.place === 'string' ? ev.place : null,
      imageUrl: f.downloadURL || null,
      food: typeof ev?.food === 'string' && ev.food.trim() ? ev.food.trim() : null,
    });
  }
  return out;
}

function localToItems(records: LocalRecord[]): CalendarEventItem[] {
  const out: CalendarEventItem[] = [];
  for (const r of records) {
    const raw = r.event.date?.trim() ?? '';
    const coerced = coerceExtractedDateToYyyyMmDd(raw);
    if (!coerced) continue;
    const date = resolveCampusEventYyyyMmDd(coerced) ?? coerced;
    out.push({
      id: r.id,
      date,
      title: r.event.title?.trim() || 'Event',
      startTime: r.event.startTime,
      endTime: r.event.endTime,
      place: r.event.place,
      imageUrl: r.imageUrl ?? null,
      food:
        typeof r.event.food === 'string' && r.event.food.trim() ? r.event.food.trim() : null,
    });
  }
  return out;
}

export default function WeeklyEventCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [items, setItems] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventModalId, setEventModalId] = useState<string | null>(null);

  const weekStart = useMemo(
    () => startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 0 }),
    [weekOffset]
  );

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const byDate = useMemo(() => {
    const m = new Map<string, CalendarEventItem[]>();
    for (const it of items) {
      const list = m.get(it.date) ?? [];
      list.push(it);
      m.set(it.date, list);
    }
    for (const [, list] of m) {
      list.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    }
    return m;
  }, [items]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      if (process.env.NEXT_PUBLIC_BACKEND_MODE === 'local') {
        const res = await fetch('/api/local/events');
        const json = await res.json();
        const recs = Array.isArray(json.records) ? (json.records as LocalRecord[]) : [];
        setItems(localToItems(recs));
      } else {
        const flyers = await getRecentFlyers(100);
        setItems(flyerToItems(flyers));
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load events');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const today = new Date();
    if (weekDays.some((d) => isSameDay(d, today))) {
      setSelectedDate((prev) => (prev && weekDays.some((d) => isSameDay(d, prev)) ? prev : today));
    } else {
      setSelectedDate((prev) => (prev && weekDays.some((d) => isSameDay(d, prev)) ? prev : weekDays[0]));
    }
  }, [weekDays]);

  const selectedKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedEvents = selectedKey ? (byDate.get(selectedKey) ?? []) : [];

  const weekRangeTitle = useMemo(() => {
    const weekEnd = weekDays[6];
    if (!weekEnd) return '';
    const sameMonth =
      format(weekStart, 'yyyy-MM') === format(weekEnd, 'yyyy-MM');
    const sameYear = format(weekStart, 'yyyy') === format(weekEnd, 'yyyy');
    if (sameMonth) {
      return `${format(weekStart, 'MMMM d')} – ${format(weekEnd, 'd, yyyy')}`;
    }
    if (sameYear) {
      return `${format(weekStart, 'MMMM d')} – ${format(weekEnd, 'MMMM d, yyyy')}`;
    }
    return `${format(weekStart, 'MMM d, yyyy')} – ${format(weekEnd, 'MMM d, yyyy')}`;
  }, [weekStart, weekDays]);

  return (
    <section className="rounded-[2rem] border border-gray-200/80 bg-white shadow-soft overflow-hidden dark:border-gray-800 dark:bg-gray-900 dark:shadow-[0_30px_80px_-60px_rgba(0,0,0,0.85)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 sm:px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-orange-50/80 to-transparent dark:from-orange-950/25 dark:to-transparent">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-black dark:text-gray-50">
            This week on campus
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Days with a flyer show a marker. Tap a day to see what&apos;s happening.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            aria-label="Previous week"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset(0)}
            className="px-4 py-2 rounded-xl bg-brand-orange text-white text-sm font-semibold hover:bg-orange-600 shadow-sm"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            aria-label="Next week"
          >
            →
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {loadError ? (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{loadError}</p>
        ) : null}

        {weekRangeTitle ? (
          <p className="mb-3 text-center text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-300 sm:mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">
              Week of{' '}
            </span>
            {weekRangeTitle}
          </p>
        ) : null}

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayEvents = byDate.get(key) ?? [];
            const count = dayEvents.length;
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={`
                  relative flex flex-col items-center rounded-2xl border px-1 py-2.5 sm:py-3 transition-all min-h-[96px] sm:min-h-[112px]
                  ${
                    isSelected
                      ? 'border-brand-orange ring-2 ring-brand-orange/30 bg-orange-50/90 dark:bg-orange-950/40 dark:border-brand-orange'
                      : count > 0
                        ? 'border-orange-200/80 bg-orange-50/40 dark:border-orange-900/50 dark:bg-orange-950/20'
                        : 'border-gray-100 bg-gray-50/40 dark:border-gray-800 dark:bg-gray-950/40'
                  }
                  ${isToday && !isSelected ? 'ring-1 ring-brand-orange/50' : ''}
                  hover:border-brand-orange/60 dark:hover:border-brand-orange/50
                `}
              >
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {format(day, 'EEE')}
                </span>
                <span
                  className={`text-lg sm:text-2xl font-serif font-bold mt-0.5 leading-none ${
                    isToday ? 'text-brand-orange' : 'text-gray-900 dark:text-gray-50'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-500 sm:text-[10px]">
                  {format(day, 'MMM')}
                </span>
                <div className="mt-auto flex flex-wrap justify-center gap-0.5 max-w-full px-0.5 pt-0.5">
                  {loading ? (
                    <span className="h-1.5 w-6 rounded-full bg-gray-200 animate-pulse dark:bg-gray-700" />
                  ) : count > 0 ? (
                    <>
                      {dayEvents.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className="h-1.5 w-1.5 rounded-full bg-brand-orange dark:bg-orange-400"
                          title={ev.title}
                        />
                      ))}
                      {count > 3 ? (
                        <span className="text-[9px] font-bold text-brand-orange dark:text-orange-300 leading-none">
                          +{count - 3}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-[1.35rem] border border-gray-200/90 bg-gradient-to-b from-white to-gray-50/90 p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:border-gray-800 dark:from-gray-900 dark:to-gray-950/90 dark:shadow-none">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange/90">
                Selected day
              </p>
              <h3 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
                {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select a day'}
              </h3>
            </div>
            {selectedEvents.length > 0 ? (
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-brand-orange dark:bg-orange-950/60 dark:text-orange-300">
                {selectedEvents.length} event{selectedEvents.length === 1 ? '' : 's'}
              </span>
            ) : null}
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="h-[5.5rem] w-20 shrink-0 rounded-xl bg-gray-200 animate-pulse dark:bg-gray-800" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse dark:bg-gray-800" />
                    <div className="h-3 w-24 rounded bg-gray-100 animate-pulse dark:bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : selectedEvents.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              No flyers with a date for this day.{' '}
              <Link href="/feed" className="font-semibold text-brand-orange hover:underline">
                Browse Discover
              </Link>{' '}
              or{' '}
              <Link href="/upload" className="font-semibold text-brand-orange hover:underline">
                upload a flyer
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {selectedEvents.map((ev) => {
                const t12 = formatTime12h(ev.startTime);
                const end12 = formatTime12h(ev.endTime);
                const timeStr =
                  t12 && end12 ? `${t12} – ${end12}` : t12 || (end12 ? `Until ${end12}` : null);
                return (
                  <li key={ev.id}>
                    <button
                      type="button"
                      onClick={() => setEventModalId(ev.id)}
                      className="group relative flex w-full gap-3 sm:gap-4 overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-3 pr-3 text-left sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/45 hover:shadow-[0_12px_28px_-12px_rgba(255,90,31,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-orange/50 dark:focus-visible:ring-offset-gray-950"
                    >
                      <span
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-brand-orange to-amber-500 opacity-90"
                        aria-hidden
                      />
                      <div className="relative ml-1 h-[4.75rem] w-[4.75rem] sm:h-[5.25rem] sm:w-[5.25rem] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 ring-1 ring-black/5 dark:from-orange-950/80 dark:via-gray-900 dark:to-gray-900 dark:ring-white/10">
                        {ev.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- flyer thumbnails from storage
                          <img
                            src={ev.imageUrl}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-2xl sm:text-3xl opacity-90">
                            🍕
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-serif text-base sm:text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-brand-orange line-clamp-2 dark:text-gray-50 dark:group-hover:text-orange-400">
                            {ev.title}
                          </p>
                          <span
                            className="mt-0.5 shrink-0 text-brand-orange opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                            aria-hidden
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {timeStr ? (
                            <span className="inline-flex items-center rounded-full border border-orange-200/80 bg-orange-50/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-orange dark:border-orange-900/60 dark:bg-orange-950/50 dark:text-orange-300">
                              {timeStr}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                              Time TBD
                            </span>
                          )}
                        </div>
                        {ev.place ? (
                          <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                            <PinIcon className="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500" />
                            <span className="line-clamp-2">{ev.place}</span>
                          </p>
                        ) : null}
                        {ev.food ? (
                          <p className="mt-1.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-500">
                            <span className="font-semibold text-gray-600 dark:text-gray-400">Food</span>{' '}
                            · {ev.food}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <EventDetailModal
          open={eventModalId != null}
          flyerId={eventModalId}
          onClose={() => setEventModalId(null)}
        />

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <Link
            href="/feed"
            className="font-semibold text-brand-orange hover:underline"
          >
            Open Discover feed
          </Link>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <Link
            href="/explore"
            className="font-semibold text-brand-orange hover:underline"
          >
            Map · Explore
          </Link>
        </div>
      </div>
    </section>
  );
}
