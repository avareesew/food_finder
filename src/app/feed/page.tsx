'use client';

import { useState, useEffect } from 'react';
import { getRecentFlyers, Flyer } from '@/services/flyers';
import EventCard from '@/components/ui/EventCard';
import EmptyState from '@/components/ui/EmptyState';
import Link from 'next/link';

export default function FeedPage() {
    const [flyers, setFlyers] = useState<Flyer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFlyers() {
            try {
                const data = await getRecentFlyers(20);
                if (data.length === 0) {
                    // Mock Data for UI Demonstration
                    setFlyers([
                        {
                            id: 'mock-1',
                            originalFilename: 'Free Pizza @ TMCB',
                            status: 'available',
                            downloadURL: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
                            createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
                            storagePath: ''
                        },
                        {
                            id: 'mock-2',
                            originalFilename: 'Bagels in JFSB Lobby',
                            status: 'gone',
                            downloadURL: 'https://images.unsplash.com/photo-1585478684894-a366c82f44da?auto=format&fit=crop&w=400&q=80',
                            createdAt: { seconds: (Date.now() - 3600000) / 1000, nanoseconds: 0 } as any,
                            storagePath: ''
                        },
                        {
                            id: 'mock-3',
                            originalFilename: 'Leftover Catering - WSC 3220',
                            status: 'available',
                            downloadURL: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
                            createdAt: { seconds: (Date.now() - 7200000) / 1000, nanoseconds: 0 } as any,
                            storagePath: ''
                        }
                    ]);
                } else {
                    setFlyers(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchFlyers();
    }, []);

    return (
        <main className="min-h-screen bg-brand-canvas pt-28 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-serif text-brand-black mb-2 leading-tight">
                            Discover Food <span className="text-3xl ml-2 align-middle">🍕</span>
                        </h1>
                        <p className="text-gray-500 text-lg max-w-xl">
                            Real-time free food alerts on campus. Find leftovers, club meetings, and events happening now.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-6 py-2.5 bg-[#FF5A1F] text-white rounded-full font-semibold shadow-md hover:bg-orange-600 transition-all active:scale-95 text-sm">
                            All Events
                        </button>
                        <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-500 rounded-full font-medium hover:border-[#FF5A1F] hover:text-[#FF5A1F] transition-colors text-sm">
                            Map View
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse border border-gray-100 shadow-sm"></div>
                        ))}
                    </div>
                ) : flyers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {flyers.map((flyer) => (
                            <EventCard
                                key={flyer.id}
                                id={flyer.id!}
                                // TODO: Map these fields once we have AI parsing. 
                                // For now, using what we have or placeholders.
                                eventName={flyer.originalFilename}
                                status={flyer.status}
                                imageUrl={flyer.downloadURL}
                                createdAt={flyer.createdAt}
                            />
                        ))}
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
        </main>
    );
}
