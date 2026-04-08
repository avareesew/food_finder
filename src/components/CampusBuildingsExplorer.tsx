'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { addWeeks, endOfWeek, format, parseISO, startOfWeek } from 'date-fns';
import type { BuildingPinStats } from '@/components/CampusBuildingMap';
import { BYU_BUILDINGS, buildingAbbreviation, buildingById } from '@/data/byuBuildings';
import { matchByuBuildingId } from '@/lib/matchByuBuilding';
import {
  coerceExtractedDateToYyyyMmDd,
  formatTime12h,
  getCampusTodayYyyyMmDd,
  resolveCampusEventYyyyMmDd,
} from '@/lib/eventTiming';
import PinIcon from '@/components/ui/PinIcon';
import EventDetailModal from '@/components/ui/EventDetailModal';
import { getRecentFlyers, type Flyer } from '@/services/flyers';
import { logger } from '@/lib/logger';

const CampusBuildingMap = dynamic(() => import('@/components/CampusBuildingMap'), {
  ssr: false,
  loading: () => (
    <div className="mx-auto w-full max-w-[min(100%,440px)]">
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Loading map…</span>
      </div>
    </div>
  ),
});

type FlyerRow = {
  id: string;
  title: string;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  place: string | null;
  buildingId: string | null;
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

function flyersToRows(flyers: Flyer[]): FlyerRow[] {
  const out: FlyerRow[] = [];
  for (const f of flyers) {
    const id = f.id;
    if (!id) continue;
    const ev = f.extractedEvent;
    const place = typeof ev?.place === 'string' ? ev.place.trim() : null;
    const bid = matchByuBuildingId(place);
    const title =
      typeof ev?.title === 'string' && ev.title.trim()
        ? ev.title.trim()
        : f.originalFilename || 'Event';
    const food = typeof ev?.food === 'string' && ev.food.trim() ? ev.food.trim() : undefined;

    const raw = typeof ev?.date === 'string' ? ev.date.trim() : '';
    const coerced = coerceExtractedDateToYyyyMmDd(raw);
    if (!coerced) {
      if (!bid) continue;
      out.push({
        id,
        title,
        date: null,
        startTime: typeof ev?.startTime === 'string' ? ev.startTime : null,
        endTime: typeof ev?.endTime === 'string' ? ev.endTime : null,
        place,
        buildingId: bid,
        imageUrl: f.downloadURL ?? null,
        food,
      });
      continue;
    }
    const date = resolveCampusEventYyyyMmDd(coerced) ?? coerced;
    out.push({
      id,
      title,
      date,
      startTime: typeof ev?.startTime === 'string' ? ev.startTime : null,
      endTime: typeof ev?.endTime === 'string' ? ev.endTime : null,
      place,
      buildingId: bid,
      imageUrl: f.downloadURL ?? null,
      food,
    });
  }
  return out;
}

function localToRows(records: LocalRecord[]): FlyerRow[] {
  const out: FlyerRow[] = [];
  for (const r of records) {
    const place = typeof r.event.place === 'string' ? r.event.place.trim() : null;
    const bid = matchByuBuildingId(place);
    const raw = r.event.date?.trim() ?? '';
    const coerced = coerceExtractedDateToYyyyMmDd(raw);
    if (!coerced) {
      if (!bid) continue;
      const food =
        typeof r.event.food === 'string' && r.event.food.trim() ? r.event.food.trim() : undefined;
      out.push({
        id: r.id,
        title: r.event.title?.trim() || 'Event',
        date: null,
        startTime: r.event.startTime,
        endTime: r.event.endTime,
        place,
        buildingId: bid,
        imageUrl: r.imageUrl ?? null,
        food,
      });
      continue;
    }
    const date = resolveCampusEventYyyyMmDd(coerced) ?? coerced;
    const food =
      typeof r.event.food === 'string' && r.event.food.trim() ? r.event.food.trim() : undefined;
    out.push({
      id: r.id,
      title: r.event.title?.trim() || 'Event',
      date,
      startTime: r.event.startTime,
      endTime: r.event.endTime,
      place,
      buildingId: bid,
      imageUrl: r.imageUrl ?? null,
      food,
    });
  }
  return out;
}

function timeLabel(start: string | null, end: string | null): string | null {
  const a = formatTime12h(start);
  const b = formatTime12h(end);
  if (a && b) return `${a} – ${b}`;
  if (a) return a;
  if (b) return `Until ${b}`;
  return null;
}

function rowSort(a: FlyerRow, b: FlyerRow): number {
  const da = a.date || '9999-12-31';
  const db = b.date || '9999-12-31';
  return da.localeCompare(db) || (a.startTime || '').localeCompare(b.startTime || '');
}

export default function CampusBuildingsExplorer() {
  const [rows, setRows] = useState<FlyerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailFlyerId, setDetailFlyerId] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const selectBuilding = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const openEventDetail = useCallback((flyerId: string, e: MouseEvent<HTMLAnchorElement>) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setDetailFlyerId(flyerId);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (process.env.NEXT_PUBLIC_BACKEND_MODE === 'local') {
        const res = await fetch('/api/local/events');
        const json = await res.json();
        const recs = Array.isArray(json.records) ? (json.records as LocalRecord[]) : [];
        setRows(localToRows(recs));
      } else {
        const flyers = await getRecentFlyers(150);
        setRows(flyersToRows(flyers));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not load events';
      logger.error('campus-explorer-load-failed', { message: msg });
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const campusToday = getCampusTodayYyyyMmDd();
  const { weekStartStr, weekEndStr, weekStartDate } = useMemo(() => {
    const start = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 0 });
    const end = endOfWeek(start, { weekStartsOn: 0 });
    return {
      weekStartStr: format(start, 'yyyy-MM-dd'),
      weekEndStr: format(end, 'yyyy-MM-dd'),
      weekStartDate: start,
    };
  }, [weekOffset]);

  const selectedWeekContainsToday = campusToday >= weekStartStr && campusToday <= weekEndStr;

  const inSelectedWeek = useCallback(
    (d: string) => d >= weekStartStr && d <= weekEndStr,
    [weekStartStr, weekEndStr]
  );

  const stats = useMemo(() => {
    const m: Record<string, { today: number; week: number; undated: number; total: number }> = {};
    for (const b of BYU_BUILDINGS) {
      m[b.id] = { today: 0, week: 0, undated: 0, total: 0 };
    }
    for (const r of rows) {
      if (!r.buildingId || !m[r.buildingId]) continue;
      m[r.buildingId].total++;
      if (!r.date) m[r.buildingId].undated++;
      else if (r.date === campusToday) m[r.buildingId].today++;
      if (r.date && inSelectedWeek(r.date)) m[r.buildingId].week++;
    }
    return m;
  }, [rows, campusToday, inSelectedWeek]);

  const pinStats = useMemo(() => {
    const out: Record<string, BuildingPinStats> = {};
    for (const b of BYU_BUILDINGS) {
      const s = stats[b.id] ?? { today: 0, week: 0, undated: 0, total: 0 };
      out[b.id] = {
        total: s.total,
        today: s.today,
        week: s.week,
        undated: s.undated,
      };
    }
    return out;
  }, [stats]);

  const unmatchedCount = useMemo(() => rows.filter((r) => !r.buildingId).length, [rows]);

  const selectedRows = useMemo(() => {
    if (!selectedId) {
      return { today: [] as FlyerRow[], weekRest: [] as FlyerRow[], undated: [] as FlyerRow[] };
    }
    const all = rows.filter((r) => r.buildingId === selectedId);
    const today = selectedWeekContainsToday ? all.filter((r) => r.date === campusToday) : [];
    const weekRest = all.filter(
      (r) =>
        r.date &&
        inSelectedWeek(r.date) &&
        (!selectedWeekContainsToday || r.date !== campusToday)
    );
    const undated = all.filter((r) => !r.date);
    today.sort(rowSort);
    weekRest.sort(rowSort);
    undated.sort((a, b) => a.title.localeCompare(b.title));
    return { today, weekRest, undated };
  }, [rows, selectedId, campusToday, inSelectedWeek, selectedWeekContainsToday]);

  const selectedBuilding = selectedId ? buildingById(selectedId) : undefined;

  const weekRangeLabel = `${format(weekStartDate, 'MMM d')} – ${format(parseISO(weekEndStr), 'MMM d, yyyy')}`;

  function eventRowClasses(undatedStyle: boolean) {
    return undatedStyle
      ? 'group relative flex w-full gap-3 sm:gap-4 overflow-hidden rounded-2xl border border-amber-200/80 bg-white p-3 pr-3 text-left sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/45 hover:shadow-[0_12px_28px_-12px_rgba(255,90,31,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 dark:border-amber-900/40 dark:bg-gray-900 dark:hover:border-brand-orange/50 dark:focus-visible:ring-offset-gray-950'
      : 'group relative flex w-full gap-3 sm:gap-4 overflow-hidden rounded-2xl border border-gray-200/90 bg-white p-3 pr-3 text-left sm:p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-orange/45 hover:shadow-[0_12px_28px_-12px_rgba(255,90,31,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-orange/50 dark:focus-visible:ring-offset-gray-950';
  }

  function EventRow({
    r,
    showDateLine,
    undatedStyle,
  }: {
    r: FlyerRow;
    showDateLine?: boolean;
    undatedStyle?: boolean;
  }) {
    const timeStr = timeLabel(r.startTime, r.endTime);
    const u = Boolean(undatedStyle);
    return (
      <Link
        href={`/events/${r.id}`}
        onClick={(e) => openEventDetail(r.id, e)}
        className={eventRowClasses(u)}
      >
        <span
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gradient-to-b from-brand-orange to-amber-500 opacity-90"
          aria-hidden
        />
        <div className="relative ml-1 h-[4.75rem] w-[4.75rem] sm:h-[5.25rem] sm:w-[5.25rem] shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 ring-1 ring-black/5 dark:from-orange-950/80 dark:via-gray-900 dark:to-gray-900 dark:ring-white/10">
          {r.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- flyer thumbnails
            <img
              src={r.imageUrl}
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
              {r.title}
            </p>
            <span
              className="mt-0.5 shrink-0 text-brand-orange opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
              aria-hidden
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
          {showDateLine && r.date ? (
            <p className="mt-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300">
              {format(parseISO(r.date), 'EEE, MMM d')}
            </p>
          ) : null}
          {r.place ? (
            <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
              <PinIcon className="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500" />
              <span className="line-clamp-2">{r.place}</span>
            </p>
          ) : null}
          {r.food ? (
            <p className="mt-1.5 line-clamp-1 text-xs text-gray-500 dark:text-gray-500">
              <span className="font-semibold text-gray-600 dark:text-gray-400">Food</span> · {r.food}
            </p>
          ) : null}
        </div>
      </Link>
    );
  }

  return (
    <>
      <EventDetailModal
        open={detailFlyerId !== null}
        flyerId={detailFlyerId}
        onClose={() => setDetailFlyerId(null)}
      />
    <div className="rounded-[2.5rem] border border-gray-200 bg-white shadow-card overflow-hidden dark:border-gray-800 dark:bg-gray-900">
      <div className="border-b border-gray-100 p-4 sm:p-6 dark:border-gray-800">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
          Campus map · pins show building abbreviations (hover for full name & flyer count) · week filter applies to
          dated events
        </p>
        <div className="mx-auto mt-5 grid max-w-md grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-brand-orange/40 hover:bg-orange-50/80 hover:text-brand-orange dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-brand-orange/50 dark:hover:bg-gray-800"
            aria-label="Previous week"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="min-w-0 px-1 text-center">
            <p className="font-serif text-base font-bold leading-snug text-gray-900 dark:text-gray-50 sm:text-lg">
              {weekRangeLabel}
            </p>
            {weekOffset === 0 ? (
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-orange">
                This week
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setWeekOffset(0)}
                className="mt-1.5 text-xs font-semibold text-brand-orange underline-offset-2 hover:underline"
              >
                Back to this week
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:border-brand-orange/40 hover:bg-orange-50/80 hover:text-brand-orange dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-brand-orange/50 dark:hover:bg-gray-800"
            aria-label="Next week"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="mt-5 flex justify-center">
          <CampusBuildingMap pinStats={pinStats} selectedId={selectedId} onSelectBuilding={selectBuilding} />
        </div>
        <p className="mx-auto mt-3 max-w-xl text-center text-xs text-gray-600 dark:text-gray-400">
          Pins use short codes (e.g. TNRB, WSC). Orange = flyers matched; gray = none yet. Tiles follow light/dark
          mode.
        </p>
      </div>

      <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
            Buildings
          </h3>
          {error ? <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p> : null}
          {loading ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse dark:bg-gray-800" />
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {BYU_BUILDINGS.map((b) => {
                const s = stats[b.id] ?? { today: 0, week: 0, undated: 0, total: 0 };
                const isSelected = selectedId === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedId(b.id)}
                    className={`
                      flex w-full flex-col items-start rounded-xl border px-4 py-3 text-left transition-all
                      ${
                        isSelected
                          ? 'border-brand-orange bg-orange-50 ring-2 ring-brand-orange/25 dark:bg-orange-950/30 dark:border-brand-orange'
                          : 'border-gray-200 bg-gray-50/80 hover:border-brand-orange/40 hover:bg-white dark:border-gray-800 dark:bg-gray-950/50 dark:hover:border-brand-orange/50 dark:hover:bg-gray-900'
                      }
                    `}
                  >
                    <span className="font-serif text-sm font-bold leading-snug text-gray-900 dark:text-gray-50">
                      {b.name}{' '}
                      <span className="whitespace-nowrap text-[11px] font-extrabold tracking-wide text-brand-orange dark:text-orange-300">
                        ({buildingAbbreviation(b)})
                      </span>
                    </span>
                    <span className="mt-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{s.total} flyers</span>
                      <span className="text-gray-300 dark:text-gray-600"> · </span>
                      {s.today > 0 ? (
                        <span className="font-semibold text-brand-orange dark:text-orange-300">{s.today} today</span>
                      ) : (
                        <span>0 today</span>
                      )}
                      <span className="text-gray-300 dark:text-gray-600"> · </span>
                      <span>
                        {s.week} {weekOffset === 0 ? 'this week' : 'in view'}
                      </span>
                      {s.undated > 0 ? (
                        <>
                          <span className="text-gray-300 dark:text-gray-600"> · </span>
                          <span>{s.undated} no date</span>
                        </>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && unmatchedCount > 0 ? (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              {unmatchedCount} flyer{unmatchedCount === 1 ? '' : 's'} didn&apos;t match a building code or name —{' '}
              <Link href="/feed" className="font-semibold text-brand-orange hover:underline">
                browse Discover
              </Link>{' '}
              for full place text.
            </p>
          ) : null}
        </div>

        <div className="min-h-[280px] rounded-2xl border border-gray-200 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-950/40 sm:p-6">
          {!selectedBuilding ? (
            <div className="flex h-full min-h-[220px] flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
              <span className="text-3xl opacity-40">🏛️</span>
              <p className="mt-3 text-sm font-medium">Select a building</p>
              <p className="mt-1 max-w-xs text-xs">
                Click a map pin or a building card — both stay in sync.
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-gray-200 pb-4 dark:border-gray-800">
                <h3 className="font-serif text-xl font-bold text-gray-900 dark:text-gray-50">
                  {selectedBuilding.name}{' '}
                  <span className="text-base font-extrabold tracking-wide text-brand-orange dark:text-orange-300">
                    ({buildingAbbreviation(selectedBuilding)})
                  </span>
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Flyer place lines · campus today {campusToday} · list uses {weekRangeLabel}
                </p>
              </div>

              <div className="mt-5 space-y-6 max-h-[min(55vh,520px)] overflow-y-auto pr-1">
                {selectedWeekContainsToday ? (
                  <section>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-orange mb-2">
                      Today
                    </h4>
                    {selectedRows.today.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No flyer-dated events today.</p>
                    ) : (
                      <ul className="space-y-3 sm:space-y-4">
                        {selectedRows.today.map((r) => (
                          <li key={r.id}>
                            <EventRow r={r} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ) : null}

                <section>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">
                    {weekOffset === 0 ? 'Later this week' : `This week (${weekRangeLabel})`}
                  </h4>
                  {selectedRows.weekRest.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No dated events in this week range for this building.
                    </p>
                  ) : (
                    <ul className="space-y-3 sm:space-y-4">
                      {selectedRows.weekRest.map((r) => (
                        <li key={r.id}>
                          <EventRow r={r} showDateLine />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {selectedRows.undated.length > 0 ? (
                  <section>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-2">
                      Date not on flyer
                    </h4>
                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      We matched the building from the place line, but the flyer had no usable calendar date.
                    </p>
                    <ul className="space-y-3 sm:space-y-4">
                      {selectedRows.undated.map((r) => (
                        <li key={r.id}>
                          <EventRow r={r} undatedStyle />
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
