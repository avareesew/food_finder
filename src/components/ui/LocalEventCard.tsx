import { useEffect, useState } from 'react';

type LocalEventCardProps = {
  imageUrl?: string | null;
  title: string;
  place?: string | null;
  date?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  food?: string | null;
  foodCategory?: string | null;
  details?: string | null;
};

function toLocalDate(date: string, time?: string | null): Date | null {
  // date: YYYY-MM-DD, time: HH:MM (24h)
  if (!date) return null;
  const t = time && /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : '00:00:00';
  const d = new Date(`${date}T${t}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatPrettyDate(date: string | null | undefined): string | null {
  if (!date) return null;
  const d = toLocalDate(date);
  if (!d) return null;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

function formatPrettyTime(date: string, time: string | null | undefined): string | null {
  if (!time) return null;
  const d = toLocalDate(date, time);
  if (!d) return null;
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export default function LocalEventCard(props: LocalEventCardProps) {
  const prettyDate = formatPrettyDate(props.date);
  const prettyStart = props.date ? formatPrettyTime(props.date, props.startTime) : null;
  const prettyEnd = props.date ? formatPrettyTime(props.date, props.endTime) : null;

  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const u = props.imageUrl ?? null;
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) return;
    if (!/unsplash\.com/i.test(u)) return;

    let cancelled = false;
    async function cache() {
      try {
        const res = await fetch('/api/local/cache-image', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ url: u }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (json?.success && typeof json.localUrl === 'string') setCachedImageUrl(json.localUrl);
      } catch {
        // ignore
      }
    }
    cache();
    return () => {
      cancelled = true;
    };
  }, [props.imageUrl]);

  const timeLine =
    prettyDate && prettyStart
      ? `${prettyDate} • ${prettyStart}${prettyEnd ? `–${prettyEnd}` : ''}`
      : prettyDate
        ? prettyDate
        : null;

  const foodLine =
    props.food || props.foodCategory
      ? `${props.food ?? 'Food'}${props.foodCategory ? ` • ${props.foodCategory}` : ''}`
      : null;

  const resolvedImageUrl = cachedImageUrl ?? props.imageUrl;

  return (
    <article className="bg-gray-50 rounded-[1.85rem] border border-gray-200 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.25)] hover:shadow-[0_18px_44px_-20px_rgba(0,0,0,0.35)] overflow-hidden transition-all duration-300 h-full flex flex-col hover:-translate-y-0.5 ring-1 ring-brand-orange/10 dark:bg-gray-900 dark:border-gray-800 dark:ring-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 border-b border-gray-100 dark:bg-gray-800 dark:border-gray-800">
        {/* Warm overlay for light mode to add depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/55 via-transparent to-transparent pointer-events-none dark:from-transparent" />
        {resolvedImageUrl ? (
          <img
            src={resolvedImageUrl}
            alt={props.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50/50">
            <span className="text-4xl filter drop-shadow-sm">📄</span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight mb-2 line-clamp-2 dark:text-gray-50">
          {props.title}
        </h3>
          <span className="inline-flex items-center gap-1 rounded-full border border-brand-orange/20 bg-brand-orange/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-orange dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
            Flyer
          </span>
        </div>

        {(props.place || timeLine) && (
          <div className="text-gray-600 text-xs font-medium leading-relaxed space-y-1 dark:text-gray-400">
            {props.place && (
              <div className="flex items-start gap-2">
                <span className="mt-[1px]">📍</span>
                <span className="line-clamp-2">{props.place}</span>
              </div>
            )}
            {timeLine && (
              <div className="flex items-start gap-2">
                <span className="mt-[1px]">🕒</span>
                <span className="line-clamp-1">{timeLine}</span>
              </div>
            )}
          </div>
        )}

        {foodLine && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-orange bg-brand-orange/10 border border-brand-orange/20 rounded-full px-3 py-1 dark:bg-brand-orange/15">
            <span>🍕</span>
            <span className="truncate">{foodLine}</span>
          </div>
        )}

        {props.details && (
          <p className="mt-4 text-sm text-gray-700 leading-relaxed line-clamp-3 dark:text-gray-300">
            {props.details}
          </p>
        )}
      </div>
    </article>
  );
}

