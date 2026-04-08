'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { getRecentFlyers, type Flyer } from '@/services/flyers';
import { eventEngagementCardPreview, homePreviewRecordToFlyer } from '@/lib/homeDiscoverPreview';
import EventCard from '@/components/ui/EventCard';
import EventDetailModal from '@/components/ui/EventDetailModal';
import EmptyState from '@/components/ui/EmptyState';
import LocalEventCard from '@/components/ui/LocalEventCard';
import { logger } from '@/lib/logger';

type LocalRecord = {
    id: string;
    createdAtIso: string;
    imageUrl?: string | null;
    event: {
        title: string | null;
        host: string | null;
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
    };
};

export default function FeedPage() {
    const [flyers, setFlyers] = useState<Flyer[]>([]);
    const [localRecords, setLocalRecords] = useState<LocalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailFlyerId, setDetailFlyerId] = useState<string | null>(null);
    const [detailInitialFlyer, setDetailInitialFlyer] = useState<Flyer | null>(null);

    const closeDetail = useCallback(() => {
        setDetailFlyerId(null);
        setDetailInitialFlyer(null);
    }, []);

    const openFirebaseDetail = useCallback((id: string) => {
        const row = flyers.find((f) => f.id === id) ?? null;
        setDetailInitialFlyer(row);
        setDetailFlyerId(id);
    }, [flyers]);

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_BACKEND_MODE === 'local') {
            async function fetchLocal() {
                try {
                    const res = await fetch('/api/local/events');
                    const json = await res.json();
                    const recs = Array.isArray(json.records) ? (json.records as LocalRecord[]) : [];
                    recs.sort((a, b) => (b.createdAtIso || '').localeCompare(a.createdAtIso || ''));
                    setLocalRecords(recs);
                } catch (err) {
                    logger.error('feed-local-fetch-error', { message: err instanceof Error ? err.message : String(err) });
                } finally {
                    setLoading(false);
                }
            }
            fetchLocal();
            return;
        }

        async function fetchFlyers() {
            try {
                const data = await getRecentFlyers(20);
                if (data.length === 0) {
                    const now = Timestamp.fromMillis(Date.now());
                    const oneHourAgo = Timestamp.fromMillis(Date.now() - 3600000);
                    const twoHoursAgo = Timestamp.fromMillis(Date.now() - 7200000);
                    setFlyers([
                        {
                            id: 'mock-1',
                            originalFilename: 'Free Pizza @ TMCB',
                            status: 'available',
                            downloadURL:
                                'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
                            createdAt: now,
                            storagePath: '',
                        },
                        {
                            id: 'mock-2',
                            originalFilename: 'Bagels in JFSB Lobby',
                            status: 'gone',
                            downloadURL:
                                'https://images.unsplash.com/photo-1585478684894-a366c82f44da?auto=format&fit=crop&w=400&q=80',
                            createdAt: oneHourAgo,
                            storagePath: '',
                        },
                        {
                            id: 'mock-3',
                            originalFilename: 'Leftover Catering - WSC 3220',
                            status: 'available',
                            downloadURL:
                                'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
                            createdAt: twoHoursAgo,
                            storagePath: '',
                        },
                    ]);
                } else {
                    setFlyers(data);
                }
            } catch (err) {
                logger.error('feed-firebase-fetch-error', { message: err instanceof Error ? err.message : String(err) });
            } finally {
                setLoading(false);
            }
        }
        fetchFlyers();
    }, []);

    return (
        <main className="min-h-screen pt-28 pb-12 dark:bg-gray-950 bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(255,90,31,0.10),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(255,90,31,0.06),transparent_50%)] bg-brand-canvas">
            <EventDetailModal
                open={detailFlyerId !== null}
                flyerId={detailFlyerId}
                initialFlyer={detailInitialFlyer}
                onClose={closeDetail}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif text-brand-black mb-2 leading-tight dark:text-gray-50">
                            Discover Food <span className="text-3xl ml-2 align-middle">🍕</span>
                        </h1>
                        <p className="text-gray-700 text-lg max-w-xl dark:text-gray-400">
                            Real-time free food alerts on campus. Find leftovers, club meetings, and events happening now.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            className="px-6 py-2.5 bg-[#FF5A1F] text-white rounded-full font-semibold shadow-md hover:bg-orange-600 transition-all active:scale-95 text-sm"
                        >
                            All Events
                        </button>
                        <Link
                            href="/explore"
                            className="inline-flex items-center px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-full font-medium hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-colors text-sm dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300"
                        >
                            Map View
                        </Link>
                    </div>
                </div>

                {/* Light-mode section framing to reduce "empty" feel */}
                <div className="rounded-[2.25rem] border border-gray-200/70 bg-white/80 p-4 sm:p-6 shadow-soft dark:border-gray-800 dark:bg-gray-950/40 dark:shadow-none">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800"></div>
                        ))}
                    </div>
                ) : process.env.NEXT_PUBLIC_BACKEND_MODE === 'local' ? (
                    localRecords.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {localRecords.map((r) => (
                                <LocalEventCard
                                    key={r.id}
                                    onOpen={() => {
                                        setDetailFlyerId(r.id);
                                        setDetailInitialFlyer(homePreviewRecordToFlyer(r));
                                    }}
                                    imageUrl={r.imageUrl}
                                    title={r.event.title ?? 'Untitled Event'}
                                    place={r.event.place}
                                    date={r.event.date}
                                    startTime={r.event.startTime}
                                    endTime={r.event.endTime}
                                    food={r.event.food}
                                    foodCategory={r.event.foodCategory}
                                    details={r.event.details}
                                    engagementPreview={eventEngagementCardPreview(r.event)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No events yet"
                            description="Upload a flyer to see it appear here."
                            actionLabel="Upload a Flyer"
                            actionLink="/upload"
                        />
                    )
                ) : flyers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {flyers.map((flyer) => {
                            const ev = flyer.extractedEvent;
                            const title =
                                typeof ev?.title === 'string' && ev.title.trim()
                                    ? ev.title.trim()
                                    : flyer.originalFilename;
                            const desc =
                                (typeof ev?.details === 'string' && ev.details.trim()
                                    ? ev.details.trim()
                                    : null) ||
                                (flyer.extractionError ? `Extraction: ${flyer.extractionError}` : null);
                            const cardStatus =
                                flyer.status === 'gone' ? 'gone' : 'available';
                            return (
                                <EventCard
                                    key={flyer.id}
                                    id={flyer.id!}
                                    onOpenDetails={openFirebaseDetail}
                                    eventName={title}
                                    location={typeof ev?.place === 'string' ? ev.place : undefined}
                                    description={desc}
                                    eventDate={typeof ev?.date === 'string' ? ev.date : null}
                                    eventStartTime={typeof ev?.startTime === 'string' ? ev.startTime : null}
                                    eventEndTime={typeof ev?.endTime === 'string' ? ev.endTime : null}
                                    food={typeof ev?.food === 'string' ? ev.food : null}
                                    foodCategory={typeof ev?.foodCategory === 'string' ? ev.foodCategory : null}
                                    foodEmoji={typeof ev?.foodEmoji === 'string' ? ev.foodEmoji : null}
                                    engagementPreview={eventEngagementCardPreview(ev)}
                                    status={cardStatus}
                                    imageUrl={flyer.downloadURL || undefined}
                                    createdAt={flyer.createdAt}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState
                        title="No food yet"
                        description="Looks like nobody has uploaded any flyers recently. Be the first!"
                        actionLabel="Upload a Flyer"
                        actionLink="/upload"
                    />
                )}
                </div>
            </div>
        </main>
    );
}
