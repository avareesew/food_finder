import { formatDistance } from 'date-fns';
import type { Timestamp } from 'firebase/firestore';
import { useState, useMemo } from 'react';
import {
    coerceExtractedDateToYyyyMmDd,
    formatEventDateLabel,
    formatTime12h,
    isCampusEventEnded,
    resolveCampusEventYyyyMmDd,
} from '@/lib/eventTiming';
import { isPdfFlyerUrl } from '@/lib/flyerAttachment';

type CreatedAtLike = Timestamp | { seconds: number; nanoseconds?: number };

function createdAtToMs(createdAt: CreatedAtLike): number {
    const s = 'seconds' in createdAt ? createdAt.seconds : (createdAt as Timestamp).seconds;
    return s * 1000;
}

interface EventCardProps {
    id: string;
    onOpenDetails: (id: string) => void;
    eventName?: string;
    location?: string;
    description?: string | null;
    /** YYYY-MM-DD from extraction */
    eventDate?: string | null;
    eventStartTime?: string | null;
    eventEndTime?: string | null;
    food?: string | null;
    foodCategory?: string | null;
    /** Shown when there is no flyer image (e.g. Slack text) */
    foodEmoji?: string | null;
    /** One-line preview: expectations and/or sign-up (extracted from poster/email) */
    engagementPreview?: string | null;
    /** Student club / society name from extraction */
    society?: string | null;
    startTime?: Timestamp;
    status: string;
    imageUrl?: string;
    createdAt: CreatedAtLike;
}

function FoodUtensilsIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2" />
            <path d="M7 2v20" />
            <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h0Z" />
        </svg>
    );
}

export default function EventCard({
    id,
    onOpenDetails,
    eventName,
    location,
    description,
    eventDate,
    eventStartTime,
    eventEndTime,
    food,
    foodCategory,
    foodEmoji,
    engagementPreview,
    society,
    startTime,
    status,
    imageUrl,
    createdAt,
}: EventCardProps) {
    const title = eventName || 'New Food Alert';

    const hasFoodInfo = Boolean(
        (typeof food === 'string' && food.trim()) || (typeof foodCategory === 'string' && foodCategory.trim())
    );
    const foodLine = [food?.trim(), foodCategory?.trim()].filter(Boolean).join(' · ') || null;

    const effectiveEventDate = useMemo(
        () => resolveCampusEventYyyyMmDd(eventDate ?? null),
        [eventDate]
    );
    const dateLabel = formatEventDateLabel(effectiveEventDate);
    const start12 = formatTime12h(eventStartTime ?? null);
    const end12 = formatTime12h(eventEndTime ?? null);
    const timeLine =
        start12 && end12
            ? `${start12} – ${end12}`
            : start12
              ? start12
              : end12
                ? `Until ${end12}`
                : null;

    const postedAgo = formatDistance(new Date(createdAtToMs(createdAt)), new Date(), { addSuffix: true });
    const imageCaption = startTime
        ? new Date(startTime.seconds * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : postedAgo;

    /** Prefer calendar over `gone` whenever we can parse a real event date (including `2026-4-9`). */
    const hasReliableEventDate = Boolean(coerceExtractedDateToYyyyMmDd(eventDate ?? null));
    const eventEnded = useMemo(() => {
        const byTime = isCampusEventEnded({
            eventDate: eventDate ?? null,
            endTime: eventEndTime ?? null,
            startTime: eventStartTime ?? null,
        });
        if (hasReliableEventDate) return byTime;
        return status === 'gone' || byTime;
    }, [hasReliableEventDate, status, eventDate, eventEndTime, eventStartTime]);

    const [failedImgUrl, setFailedImgUrl] = useState<string | null>(null);
    const imgFailed = failedImgUrl === imageUrl;
    const showPdfTile = Boolean(imageUrl && isPdfFlyerUrl(imageUrl));

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onOpenDetails(id)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenDetails(id);
                }
            }}
            className={`relative group h-full w-full cursor-pointer overflow-hidden rounded-[1.5rem] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] border transition-all duration-300 flex flex-col group-hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 ${
                eventEnded
                    ? 'border-gray-200/80 opacity-[0.92] dark:border-gray-700'
                    : 'border-gray-100 dark:border-gray-800'
            } bg-white dark:bg-gray-900`}
            aria-label={`Open details for ${title}`}
        >
            <div className="flex h-full flex-col">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {imageUrl && !imgFailed && showPdfTile ? (
                        <div className="relative z-0 flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 px-4 dark:from-slate-800 dark:to-slate-900">
                            <span className="text-6xl leading-none sm:text-7xl" aria-hidden>
                                📄
                            </span>
                            <span className="text-center text-[11px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                PDF · tap for details
                            </span>
                        </div>
                    ) : imageUrl && !imgFailed ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote flyer URLs; host varies
                        <img
                            src={imageUrl}
                            alt={title}
                            referrerPolicy="no-referrer"
                            className={`relative z-0 w-full h-full object-cover transition-transform duration-700 ease-out ${
                                eventEnded ? 'brightness-[0.88]' : 'group-hover:scale-105'
                            }`}
                            onError={() => setFailedImgUrl(imageUrl ?? null)}
                        />
                    ) : (
                        <div className="relative z-0 flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-50/90 to-amber-50/80 px-4 dark:from-gray-800 dark:to-gray-900">
                            <span className="text-6xl leading-none filter drop-shadow-sm sm:text-7xl" aria-hidden>
                                {(foodEmoji && foodEmoji.trim()) || '🍽️'}
                            </span>
                            <span className="text-center text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Text post · no flyer
                            </span>
                        </div>
                    )}

                    {eventEnded ? (
                        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
                            <div
                                className="absolute left-1/2 top-1/2 w-[min(220%,48rem)] origin-center py-2.5 text-center text-[11px] font-extrabold uppercase tracking-[0.35em] text-white shadow-[0_2px_16px_rgba(0,0,0,0.35)]"
                                style={{
                                    transform: 'translate(-50%, -50%) rotate(-36deg)',
                                    background: 'linear-gradient(90deg, #991b1b 0%, #b91c1c 40%, #7f1d1d 100%)',
                                }}
                            >
                                Ended
                            </div>
                        </div>
                    ) : null}

                    {!eventEnded ? (
                        <div className="absolute top-3 left-3 z-[15]">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md border bg-white/95 text-emerald-700 border-emerald-100/50 dark:bg-gray-950/85 dark:text-emerald-200 dark:border-emerald-900/40">
                                <span className="mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                            </span>
                        </div>
                    ) : null}

                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/55 to-transparent p-3 pt-10 z-[5]">
                        <p className="text-white/85 text-[10px] font-medium tracking-wide uppercase">
                            Posted {imageCaption}
                        </p>
                    </div>
                </div>

                {/* Date highlight strip */}
                <div
                    className={`relative z-[6] px-4 py-3.5 border-b border-black/5 dark:border-white/10 ${
                        eventEnded
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                            : 'bg-gradient-to-r from-[#FF5A1F] via-orange-500 to-amber-500 text-white'
                    }`}
                >
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-90 mb-0.5">
                        {dateLabel ? 'When' : 'Schedule'}
                    </p>
                    {dateLabel ? (
                        <>
                            <p className="font-serif text-xl sm:text-[1.35rem] font-bold leading-tight tracking-tight">
                                {dateLabel}
                            </p>
                            {timeLine ? (
                                <p className="text-sm font-semibold mt-1 opacity-95 tabular-nums">{timeLine}</p>
                            ) : (
                                <p className="text-xs font-medium mt-1 opacity-85">Time not listed</p>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="font-serif text-lg font-bold leading-tight">Date not on flyer</p>
                            <p className="text-xs font-medium mt-1 opacity-90">See details · posted {postedAgo}</p>
                        </>
                    )}
                </div>

                <div className="p-5 flex flex-col flex-1 relative z-[6]">
                    <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-brand-orange transition-colors line-clamp-2 dark:text-gray-50">
                        {title}
                    </h3>

                    {society?.trim() ? (
                        <p className="text-gray-600 text-xs font-semibold mb-2 dark:text-gray-300">
                            Society: {society.trim()}
                        </p>
                    ) : null}

                    <p className="text-gray-500 text-xs font-medium flex items-start gap-2 dark:text-gray-400">
                        <svg
                            className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                        </svg>
                        <span className="line-clamp-2">{location?.trim() || 'Campus location TBD'}</span>
                    </p>

                    {hasFoodInfo ? (
                        <div className="mt-3 flex items-start gap-2 rounded-xl bg-orange-50/90 border border-orange-100/80 px-3 py-2.5 dark:bg-orange-950/40 dark:border-orange-900/50">
                            <span className="text-[#FF5A1F] dark:text-orange-400 shrink-0 mt-0.5">
                                <FoodUtensilsIcon />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-800/90 dark:text-orange-300/90">
                                    Food
                                </p>
                                <p className="text-sm font-semibold text-gray-900 leading-snug dark:text-gray-100">
                                    {foodLine}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {engagementPreview?.trim() ? (
                        <div className="mt-3 flex items-start gap-2 rounded-xl border border-sky-100 bg-sky-50/90 px-3 py-2.5 dark:border-sky-900/50 dark:bg-sky-950/35">
                            <span className="shrink-0 text-base leading-none" aria-hidden>
                                🤝
                            </span>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-900/80 dark:text-sky-300/90">
                                    Not just food — join in
                                </p>
                                <p className="text-xs font-medium leading-snug text-gray-800 line-clamp-2 dark:text-gray-200">
                                    {engagementPreview.trim()}
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {description?.trim() ? (
                        <p className="text-gray-600 text-sm mt-3 leading-relaxed line-clamp-3 dark:text-gray-300">
                            {description.trim()}
                        </p>
                    ) : null}

                    <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-orange flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            View flyer & details
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
