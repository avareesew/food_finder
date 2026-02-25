import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface EventCardProps {
    id: string;
    eventName?: string;
    location?: string;
    startTime?: Timestamp;
    status: string;
    imageUrl?: string;
    createdAt: Timestamp;
}

export default function EventCard({ id, eventName, location, startTime, status, imageUrl, createdAt }: EventCardProps) {
    // Fallback for event name if not yet parsed
    const title = eventName || 'New Food Alert';
    const timeDisplay = startTime
        ? new Date(startTime.seconds * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : formatDistance(new Date(createdAt.seconds * 1000), new Date(), { addSuffix: true });

    const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!imageUrl) return;
        if (!/^https?:\/\//i.test(imageUrl)) return;
        if (!/unsplash\.com/i.test(imageUrl)) return;

        let cancelled = false;
        async function cache() {
            try {
                const res = await fetch('/api/local/cache-image', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ url: imageUrl }),
                });
                const json = await res.json();
                if (cancelled) return;
                if (json?.success && typeof json.localUrl === 'string') {
                    setCachedImageUrl(json.localUrl);
                }
            } catch {
                // ignore; we'll just use the original remote URL
            }
        }
        cache();
        return () => {
            cancelled = true;
        };
    }, [imageUrl]);

    const resolvedImageUrl = cachedImageUrl ?? imageUrl;

    return (
        <Link href={`/events/${id}`} className="block group h-full">
            <article className="bg-white rounded-[1.5rem] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden transition-all duration-300 h-full flex flex-col group-hover:-translate-y-1 dark:bg-gray-900 dark:border-gray-800">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {/* Image */}
                    {resolvedImageUrl ? (
                        <img
                            src={resolvedImageUrl}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-50/50">
                            <span className="text-4xl filter drop-shadow-sm">🍕</span>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                        <span className={`
                            inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md border
                            ${status === 'available'
                                ? 'bg-white/95 text-emerald-700 border-emerald-100/50 dark:bg-gray-950/80 dark:text-emerald-200 dark:border-emerald-900/40'
                                : 'bg-gray-900/95 text-gray-200 border-gray-800 dark:bg-gray-950/80 dark:text-gray-200 dark:border-gray-800'
                            }
                        `}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></span>
                            {status === 'available' ? 'Available' : 'Gone'}
                        </span>
                    </div>

                    {/* Timestamp overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
                        <p className="text-white/90 text-[10px] font-medium tracking-wide uppercase">
                            {timeDisplay}
                        </p>
                    </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                    <div className="mb-2">
                        <h3 className="font-serif text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-brand-orange transition-colors line-clamp-2 dark:text-gray-50">
                            {title}
                        </h3>
                        <p className="text-gray-500 text-xs font-medium flex items-center gap-1.5 dark:text-gray-400">
                            <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {location || 'Campus Location'}
                        </p>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="text-xs font-semibold text-brand-orange flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            View Details
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}
