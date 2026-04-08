'use client';

import { useEffect, useState } from 'react';
import { getFlyer, type Flyer } from '@/services/flyers';
import {
    coerceExtractedDateToYyyyMmDd,
    formatEventDateLabel,
    formatTime12h,
    isCampusEventEnded,
    resolveCampusEventYyyyMmDd,
} from '@/lib/eventTiming';
import { isPdfFlyerUrl } from '@/lib/flyerAttachment';

function signupTextLooksLikeUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

type Props = {
    open: boolean;
    flyerId: string | null;
    onClose: () => void;
    /** When provided for this `flyerId`, skip network fetch (local JSON / feed already has the row). */
    initialFlyer?: Flyer | null;
};

/**
 * Large overlay (not full-screen) with split flyer + details, dark-themed to match Discover/home in dark mode.
 */
export default function EventDetailModal({ open, flyerId, onClose, initialFlyer = null }: Props) {
    const [flyer, setFlyer] = useState<Flyer | null>(null);
    const [loading, setLoading] = useState(false);

    /* eslint-disable react-hooks/set-state-in-effect -- data-fetching effect with cleanup */
    useEffect(() => {
        if (!open || !flyerId) {
            setFlyer(null);
            setLoading(false);
            return;
        }
        if (initialFlyer && initialFlyer.id === flyerId) {
            setFlyer(initialFlyer);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setFlyer(null);
        getFlyer(flyerId)
            .then((f) => {
                if (!cancelled) setFlyer(f);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [open, flyerId, initialFlyer]);
    /* eslint-enable react-hooks/set-state-in-effect */

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onClose]);

    if (!open) return null;

    const ev = flyer?.extractedEvent;
    const displayTitle =
        typeof ev?.title === 'string' && ev.title.trim()
            ? ev.title.trim()
            : flyer?.originalFilename ?? 'Event';
    const createdSec =
        flyer?.createdAt && typeof flyer.createdAt === 'object' && 'seconds' in flyer.createdAt
            ? (flyer.createdAt as { seconds: number }).seconds
            : undefined;

    const rawDateStr = typeof ev?.date === 'string' ? ev.date.trim() : '';
    const hasReliableEventDate = Boolean(coerceExtractedDateToYyyyMmDd(rawDateStr || null));
    const whenDisplay =
        hasReliableEventDate
            ? formatEventDateLabel(resolveCampusEventYyyyMmDd(rawDateStr) ?? rawDateStr) ?? rawDateStr
            : ev?.date || '—';
    const start12 = formatTime12h(typeof ev?.startTime === 'string' ? ev.startTime : null);
    const end12 = formatTime12h(typeof ev?.endTime === 'string' ? ev.endTime : null);
    const timeLinePretty =
        start12 && end12 ? `${start12} – ${end12}` : start12 ? start12 : end12 ? `Until ${end12}` : null;
    const timeRangeRaw =
        ev?.startTime || ev?.endTime ? [ev.startTime, ev.endTime].filter(Boolean).join(' – ') : null;

    const menuLines = [ev?.food, ev?.foodCategory].filter(
        (x): x is string => typeof x === 'string' && x.trim().length > 0
    );

    const eventEndedByCalendar = isCampusEventEnded({
        eventDate: rawDateStr || null,
        endTime: typeof ev?.endTime === 'string' ? ev.endTime : null,
        startTime: typeof ev?.startTime === 'string' ? ev.startTime : null,
    });
    const treatAsExpired = flyer
        ? hasReliableEventDate
            ? eventEndedByCalendar
            : flyer.status === 'gone'
        : false;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/50 backdrop-blur-[3px]"
            role="presentation"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="event-detail-modal-title"
                className="relative flex w-full max-w-[min(96vw,80rem)] max-h-[min(92vh,52rem)] flex-col overflow-hidden rounded-3xl border border-gray-800 bg-gray-950 text-gray-100 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.85)] md:max-h-[min(94vh,56rem)] md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 bg-gray-900/95 text-gray-300 shadow-lg transition hover:bg-gray-800 hover:text-white"
                    aria-label="Close"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Flyer image — left: full image visible (letterboxing OK) */}
                <div className="relative flex min-h-[32vh] max-h-[42vh] w-full shrink-0 items-center justify-center overflow-hidden bg-gray-900 px-3 py-4 md:min-h-0 md:max-h-none md:h-auto md:w-[min(48%,560px)] md:max-w-[560px] md:self-stretch md:px-6 md:py-8">
                    {loading ? (
                        <div className="h-48 w-full max-w-md animate-pulse rounded-2xl bg-gray-800 md:h-96" />
                    ) : flyer?.downloadURL && isPdfFlyerUrl(flyer.downloadURL) ? (
                        <div className="flex h-full min-h-[min(40vh,360px)] w-full max-w-full flex-col items-stretch gap-3 md:max-h-[min(86vh,720px)]">
                            <iframe
                                title="Event PDF"
                                src={flyer.downloadURL}
                                className="min-h-[min(36vh,320px)] w-full flex-1 rounded-xl border border-gray-800 bg-gray-900"
                            />
                            <a
                                href={flyer.downloadURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-center text-sm font-semibold text-brand-orange hover:underline"
                            >
                                Open PDF in new tab
                            </a>
                        </div>
                    ) : flyer?.downloadURL ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote flyer URL
                        <img
                            src={flyer.downloadURL}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="max-h-[min(40vh,360px)] w-auto max-w-full object-contain md:max-h-[min(86vh,720px)]"
                        />
                    ) : (
                        <div className="flex min-h-[12rem] w-full flex-col items-center justify-center gap-3 px-4">
                            <span className="text-[5.5rem] leading-none sm:text-8xl" aria-hidden>
                                {(() => {
                                    const fe = flyer?.extractedEvent?.foodEmoji;
                                    return typeof fe === 'string' && fe.trim() ? fe.trim() : '🍽️';
                                })()}
                            </span>
                            <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {flyer?.sourceType === 'slack_text' ? 'No flyer · Slack text' : 'No image on file'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Details — right, scrollable */}
                <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-6 pt-4 sm:px-8 sm:pb-8 sm:pt-6 md:py-8 md:pr-10">
                    {loading ? (
                        <div className="space-y-4 py-2">
                            <div className="h-6 w-40 animate-pulse rounded bg-gray-800" />
                            <div className="h-12 w-4/5 animate-pulse rounded bg-gray-800" />
                            <div className="h-24 animate-pulse rounded-2xl bg-gray-900" />
                        </div>
                    ) : !flyer ? (
                        <p className="text-sm text-gray-400">Could not load this event.</p>
                    ) : (
                        <>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-orange/90">
                                Event details
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                <span
                                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest ${
                                        flyer.status === 'extraction_failed'
                                            ? 'border-amber-800/60 bg-amber-950/50 text-amber-200'
                                            : treatAsExpired
                                              ? 'border-gray-700 bg-gray-900 text-gray-400'
                                              : 'border-emerald-800/60 bg-emerald-950/40 text-emerald-300'
                                    }`}
                                >
                                    <span
                                        className={`mr-2 h-1.5 w-1.5 rounded-full ${
                                            treatAsExpired
                                                ? 'bg-gray-500'
                                                : flyer.status === 'extraction_failed'
                                                  ? 'bg-amber-500'
                                                  : 'bg-emerald-400 animate-pulse'
                                        }`}
                                    />
                                    {treatAsExpired
                                        ? 'Expired'
                                        : flyer.status === 'extraction_failed'
                                          ? 'Check details'
                                          : 'Live now'}
                                </span>
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                                    {createdSec
                                        ? new Date(createdSec * 1000).toLocaleString(undefined, {
                                              month: 'short',
                                              day: 'numeric',
                                              hour: 'numeric',
                                              minute: '2-digit',
                                          })
                                        : 'Just now'}
                                </span>
                            </div>

                            <h2
                                id="event-detail-modal-title"
                                className="mt-5 font-serif text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-4xl md:text-[2.75rem] pr-8"
                            >
                                {displayTitle}
                            </h2>

                            <div className="mt-8 grid grid-cols-1 gap-6 border-y border-gray-800 py-6 sm:grid-cols-2">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                        Location
                                    </p>
                                    <p className="mt-1.5 text-base font-medium leading-snug text-gray-100 sm:text-lg">
                                        📍 {typeof ev?.place === 'string' && ev.place.trim() ? ev.place.trim() : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                        When
                                    </p>
                                    <p className="mt-1.5 text-base font-medium text-gray-100 sm:text-lg">
                                        {whenDisplay}
                                    </p>
                                    {timeLinePretty ? (
                                        <p className="mt-1 text-sm text-gray-400">{timeLinePretty}</p>
                                    ) : timeRangeRaw ? (
                                        <p className="mt-1 text-sm text-gray-400">{timeRangeRaw}</p>
                                    ) : null}
                                </div>
                            </div>

                            {typeof ev?.host === 'string' && ev.host.trim() ? (
                                <p className="mt-4 text-sm text-gray-400">
                                    <span className="font-semibold text-gray-200">Host:</span> {ev.host.trim()}
                                </p>
                            ) : null}

                            <p className="mt-5 text-xs leading-relaxed text-gray-500">
                                Free food or snacks are often there to welcome you — many hosts also want you to stay for
                                the program, meet people, or join the club. Check expectations and sign-up info when
                                listed below.
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
                                    <div className="mt-6 rounded-2xl border border-sky-900/60 bg-sky-950/35 p-5 sm:p-6">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300/90">
                                            Join &amp; participate
                                        </p>
                                        {expect ? (
                                            <div className="mt-3">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                    Expectations
                                                </p>
                                                <p className="mt-1.5 text-sm leading-relaxed text-gray-100">{expect}</p>
                                            </div>
                                        ) : null}
                                        {signup ? (
                                            <div className={expect ? 'mt-4' : 'mt-1'}>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                                    Club / sign-up
                                                </p>
                                                {signupTextLooksLikeUrl(signup) ? (
                                                    <a
                                                        href={signup}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="mt-1.5 inline-block break-all text-sm font-semibold text-sky-400 hover:text-sky-300 hover:underline"
                                                    >
                                                        {signup}
                                                    </a>
                                                ) : (
                                                    <p className="mt-1.5 text-sm text-gray-200">{signup}</p>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })()}

                            <div className="mt-8 rounded-[1.75rem] border border-gray-800 bg-gray-900/80 p-6 sm:p-7">
                                <div className="mb-5 flex items-center justify-between gap-3">
                                    <h3 className="flex items-center gap-2.5 font-serif text-lg font-bold text-white sm:text-xl">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange text-sm text-white">
                                            ✦
                                        </span>
                                        Food &amp; details
                                    </h3>
                                    <div className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-950 px-3 py-1">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                            AI
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
                                    {menuLines.length > 0 ? (
                                        <ul className="space-y-2.5">
                                            {menuLines.map((item) => (
                                                <li key={item} className="text-base font-medium text-gray-100">
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">No food line detected.</p>
                                    )}
                                    {typeof ev?.details === 'string' && ev.details.trim() ? (
                                        <p className="mt-4 border-t border-gray-800 pt-4 text-sm leading-relaxed text-gray-300">
                                            {ev.details.trim()}
                                        </p>
                                    ) : flyer.extractionError ? (
                                        <p className="mt-3 text-sm text-amber-200/90">{flyer.extractionError}</p>
                                    ) : null}
                                </div>
                            </div>

                            <p className="mt-8 text-center text-xs text-gray-500 sm:text-left">
                                Click outside or press Esc to close.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
