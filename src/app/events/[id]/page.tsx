'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import { getFlyer, Flyer } from '@/services/flyers';
import {
    coerceExtractedDateToYyyyMmDd,
    formatEventDateLabel,
    formatTime12h,
    isCampusEventEnded,
    resolveCampusEventYyyyMmDd,
} from '@/lib/eventTiming';

function signupTextLooksLikeUrl(s: string): boolean {
    return /^https?:\/\//i.test(s.trim());
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

export default function EventDetailPage() {
    const params = useParams();
    const [flyer, setFlyer] = useState<Flyer | null>(null);
    const [loading, setLoading] = useState(true);
    const [failedImgUrl, setFailedImgUrl] = useState<string | null>(null);

    useEffect(() => {
        async function loadFlyer() {
            if (params.id) {
                const data = await getFlyer(params.id as string);
                setFlyer(data);
                setLoading(false);
            }
        }
        loadFlyer();
    }, [params.id]);

    // Hooks must be called before any early returns (rules-of-hooks)
    const ev = flyer?.extractedEvent;
    const rawDateStr = typeof ev?.date === 'string' ? ev.date.trim() : '';
    const hasReliableEventDate = Boolean(coerceExtractedDateToYyyyMmDd(rawDateStr || null));

    const effectiveEventDate = resolveCampusEventYyyyMmDd(rawDateStr || null);

    const eventEnded = (() => {
        if (!flyer) return false;
        const byTime = isCampusEventEnded({
            eventDate: rawDateStr || null,
            endTime: typeof ev?.endTime === 'string' ? ev.endTime : null,
            startTime: typeof ev?.startTime === 'string' ? ev.startTime : null,
        });
        if (hasReliableEventDate) return byTime;
        return flyer.status === 'gone' || byTime;
    })();

    if (loading) {
        return (
            <main className="min-h-screen pt-28 pb-12 bg-brand-canvas dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto animate-pulse space-y-4">
                        <div className="h-8 w-32 rounded-lg bg-gray-200 dark:bg-gray-800" />
                        <div className="aspect-[4/3] rounded-[1.5rem] bg-gray-200 dark:bg-gray-800" />
                        <div className="h-24 rounded-2xl bg-gray-200 dark:bg-gray-800" />
                    </div>
                </div>
            </main>
        );
    }

    if (!flyer) {
        return (
            <main className="min-h-screen pt-28 pb-12 flex flex-col items-center justify-center px-6 text-center bg-brand-canvas dark:bg-gray-950">
                <h1 className="text-4xl mb-4">😕</h1>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">Event not found</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">This food might have already disappeared.</p>
                <Link
                    href="/feed"
                    className="inline-flex font-semibold tracking-wide py-4 px-8 rounded-2xl transition-all bg-[#FFF0E5] text-[#FF5A1F] hover:bg-[#FFDBCC] dark:bg-gray-900 dark:text-[#FF5A1F] dark:hover:bg-gray-800"
                >
                    Back to Discover
                </Link>
            </main>
        );
    }

    const imgFailed = failedImgUrl === flyer.downloadURL;
    const displayTitle =
        typeof ev?.title === 'string' && ev.title.trim() ? ev.title.trim() : flyer.originalFilename;
    const createdSec =
        flyer.createdAt && typeof flyer.createdAt === 'object' && 'seconds' in flyer.createdAt
            ? (flyer.createdAt as { seconds: number }).seconds
            : undefined;
    const postedAgo = createdSec
        ? formatDistance(new Date(createdSec * 1000), new Date(), { addSuffix: true })
        : 'recently';

    const dateLabel = formatEventDateLabel(effectiveEventDate);
    const start12 = formatTime12h(typeof ev?.startTime === 'string' ? ev.startTime : null);
    const end12 = formatTime12h(typeof ev?.endTime === 'string' ? ev.endTime : null);
    const timeLine =
        start12 && end12 ? `${start12} – ${end12}` : start12 ? start12 : end12 ? `Until ${end12}` : null;

    const treatAsExpired = hasReliableEventDate ? eventEnded : flyer.status === 'gone';

    const menuLines = [ev?.food, ev?.foodCategory].filter(
        (x): x is string => typeof x === 'string' && x.trim().length > 0
    );
    const hasFoodInfo = menuLines.length > 0;
    const foodLine = menuLines.join(' · ');

    const whenFallback = ev?.date || '—';

    return (
        <main className="min-h-screen pt-28 pb-12 dark:bg-gray-950 bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(255,90,31,0.10),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(255,90,31,0.06),transparent_50%)] bg-brand-canvas">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <Link
                            href="/feed"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand-orange transition-colors dark:text-gray-400 dark:hover:text-brand-orange"
                        >
                            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7 7-7"
                                    />
                                </svg>
                            </span>
                            Back to Discover
                        </Link>
                        <span className="text-gray-300 dark:text-gray-700">·</span>
                        <Link
                            href="/explore"
                            className="text-sm font-semibold text-brand-orange hover:underline"
                        >
                            Explore buildings
                        </Link>
                    </div>

                    <article
                        className={`overflow-hidden rounded-[1.5rem] border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:bg-gray-900 ${
                            eventEnded
                                ? 'border-gray-200/80 opacity-[0.96] dark:border-gray-700'
                                : 'border-gray-100 dark:border-gray-800'
                        }`}
                    >
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                            {flyer.downloadURL && !imgFailed ? (
                                // eslint-disable-next-line @next/next/no-img-element -- remote flyer URL
                                <img
                                    src={flyer.downloadURL}
                                    alt={displayTitle}
                                    referrerPolicy="no-referrer"
                                    className={`h-full w-full object-cover ${eventEnded ? 'brightness-[0.88]' : ''}`}
                                    onError={() => setFailedImgUrl(flyer.downloadURL ?? null)}
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-orange-50/90 to-amber-50/80 px-4 dark:from-gray-800 dark:to-gray-900">
                                    <span className="text-7xl leading-none sm:text-8xl" aria-hidden>
                                        {typeof ev?.foodEmoji === 'string' && ev.foodEmoji.trim()
                                            ? ev.foodEmoji.trim()
                                            : '🍽️'}
                                    </span>
                                    {flyer.sourceType === 'slack_text' ? (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                            Text post · no flyer
                                        </span>
                                    ) : null}
                                </div>
                            )}

                            {eventEnded ? (
                                <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
                                    <div
                                        className="absolute left-1/2 top-1/2 w-[min(220%,48rem)] origin-center py-2.5 text-center text-[11px] font-extrabold uppercase tracking-[0.35em] text-white shadow-[0_2px_16px_rgba(0,0,0,0.35)]"
                                        style={{
                                            transform: 'translate(-50%, -50%) rotate(-36deg)',
                                            background:
                                                'linear-gradient(90deg, #991b1b 0%, #b91c1c 40%, #7f1d1d 100%)',
                                        }}
                                    >
                                        Ended
                                    </div>
                                </div>
                            ) : null}

                            {!eventEnded ? (
                                <div className="absolute top-3 left-3 z-[15]">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md border ${
                                            flyer.status === 'extraction_failed'
                                                ? 'bg-amber-50/95 text-amber-900 border-amber-200/80 dark:bg-amber-950/85 dark:text-amber-100 dark:border-amber-900/40'
                                                : 'bg-white/95 text-emerald-700 border-emerald-100/50 dark:bg-gray-950/85 dark:text-emerald-200 dark:border-emerald-900/40'
                                        }`}
                                    >
                                        <span
                                            className={`mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                                                flyer.status === 'extraction_failed'
                                                    ? 'bg-amber-500'
                                                    : 'bg-emerald-500 animate-pulse'
                                            }`}
                                        />
                                        {flyer.status === 'extraction_failed' ? 'Check details' : 'Active'}
                                    </span>
                                </div>
                            ) : null}

                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/55 to-transparent p-3 pt-10 z-[5]">
                                <p className="text-white/85 text-[10px] font-medium tracking-wide uppercase">
                                    Posted {postedAgo}
                                </p>
                            </div>
                        </div>

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
                                    <p className="font-serif text-lg font-bold leading-tight">{whenFallback}</p>
                                    {timeLine ? (
                                        <p className="text-sm font-semibold mt-1 opacity-95 tabular-nums">{timeLine}</p>
                                    ) : (
                                        <p className="text-xs font-medium mt-1 opacity-90">
                                            See details · posted {postedAgo}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="p-5 sm:p-6 flex flex-col gap-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                                        flyer.status === 'extraction_failed'
                                            ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200'
                                            : treatAsExpired
                                              ? 'border-gray-200 bg-gray-100 text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400'
                                              : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                                    }`}
                                >
                                    <span
                                        className={`mr-2 h-1.5 w-1.5 rounded-full ${
                                            treatAsExpired
                                                ? 'bg-gray-400'
                                                : flyer.status === 'extraction_failed'
                                                  ? 'bg-amber-500'
                                                  : 'bg-emerald-500 animate-pulse'
                                        }`}
                                    />
                                    {treatAsExpired
                                        ? 'Expired'
                                        : flyer.status === 'extraction_failed'
                                          ? 'Extraction issue'
                                          : 'Live now'}
                                </span>
                                {createdSec ? (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                        {new Date(createdSec * 1000).toLocaleString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                ) : null}
                            </div>

                            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 leading-tight dark:text-gray-50">
                                {displayTitle}
                            </h1>

                            <p className="text-gray-500 text-sm font-medium flex items-start gap-2 dark:text-gray-400">
                                <svg
                                    className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0 mt-0.5"
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
                                <span>{typeof ev?.place === 'string' && ev.place.trim() ? ev.place.trim() : 'Campus location TBD'}</span>
                            </p>

                            {typeof ev?.host === 'string' && ev.host.trim() ? (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">Host:</span>{' '}
                                    {ev.host.trim()}
                                </p>
                            ) : null}

                            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                Food is often a perk to welcome you — clubs may also expect you to stay for the program,
                                dress a certain way, or sign up to join.
                            </p>

                            {(() => {
                                const signup =
                                    typeof ev?.clubSignupLink === 'string' && ev.clubSignupLink.trim()
                                        ? ev.clubSignupLink.trim()
                                        : '';
                                const expect =
                                    typeof ev?.participationExpectations === 'string' &&
                                    ev.participationExpectations.trim()
                                        ? ev.participationExpectations.trim()
                                        : '';
                                if (!signup && !expect) return null;
                                return (
                                    <div className="rounded-2xl border border-sky-100 bg-sky-50/90 p-4 dark:border-sky-900/50 dark:bg-sky-950/35">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                                            Join &amp; participate
                                        </p>
                                        {expect ? (
                                            <p className="mt-2 text-sm text-gray-800 dark:text-gray-100">{expect}</p>
                                        ) : null}
                                        {signup ? (
                                            <div className={expect ? 'mt-3' : 'mt-2'}>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                    Club / sign-up
                                                </p>
                                                {signupTextLooksLikeUrl(signup) ? (
                                                    <a
                                                        href={signup}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1 inline-block break-all text-sm font-semibold text-sky-600 hover:underline dark:text-sky-400"
                                                    >
                                                        {signup}
                                                    </a>
                                                ) : (
                                                    <p className="mt-1 text-sm text-gray-800 dark:text-gray-100">{signup}</p>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })()}

                            {hasFoodInfo ? (
                                <div className="flex items-start gap-2 rounded-xl bg-orange-50/90 border border-orange-100/80 px-3 py-2.5 dark:bg-orange-950/40 dark:border-orange-900/50">
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
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No food line detected on the flyer.</p>
                            )}

                            {typeof ev?.details === 'string' && ev.details.trim() ? (
                                <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-950/50">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                                        More details
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed dark:text-gray-300">
                                        {ev.details.trim()}
                                    </p>
                                </div>
                            ) : flyer.extractionError ? (
                                <p className="text-sm text-amber-800 dark:text-amber-200">{flyer.extractionError}</p>
                            ) : null}

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Link
                                    href="/feed"
                                    className="flex-1 inline-flex items-center justify-center font-semibold tracking-wide py-4 px-8 rounded-2xl transition-all bg-[#FF5A1F] text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:bg-[#E64A19] hover:-translate-y-0.5 active:translate-y-0 text-center"
                                >
                                    Browse more on Discover
                                </Link>
                                <Link
                                    href="/explore"
                                    className="flex-1 inline-flex items-center justify-center font-semibold tracking-wide py-4 px-8 rounded-2xl transition-all bg-[#FFF0E5] text-[#FF5A1F] hover:bg-[#FFDBCC] dark:bg-gray-900 dark:hover:bg-gray-800 text-center"
                                >
                                    Explore by building
                                </Link>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </main>
    );
}
