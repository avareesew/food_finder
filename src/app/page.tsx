'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import WeeklyEventCalendar from '@/components/home/WeeklyEventCalendar';
import EventDetailModal from '@/components/ui/EventDetailModal';
import {
  homePreviewRecordToFlyer,
  pickClosestUpcomingFromFlyers,
  type HomeDiscoverPreviewRecord,
} from '@/lib/homeDiscoverPreview';
import { getRecentFlyers, type Flyer } from '@/services/flyers';

type LocalApiUpcomingRecord = {
  id: string;
  createdAtIso: string;
  imageUrl?: string | null;
  event: HomeDiscoverPreviewRecord['event'];
};

function toLocalDate(date: string | null, time?: string | null): Date | null {
  if (!date) return null;
  const t = time && /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : '00:00:00';
  const d = new Date(`${date}T${t}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function prettyStartLine(r: HomeDiscoverPreviewRecord): string {
  const d = toLocalDate(r.event.date, r.event.startTime);
  if (!d) return 'Time TBD';
  const dateStr = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d);
  const timeStr = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(d);
  return `${dateStr} • ${timeStr}`;
}

function localApiRecordToPreview(r: LocalApiUpcomingRecord): HomeDiscoverPreviewRecord {
  return {
    id: r.id,
    createdAtIso: r.createdAtIso,
    imageUrl: r.imageUrl ?? null,
    event: r.event,
  };
}

export default function Home() {
  const [discoverPreview, setDiscoverPreview] = useState<HomeDiscoverPreviewRecord[]>([]);
  const [discoverPreviewLoading, setDiscoverPreviewLoading] = useState(true);
  const [detailFlyerId, setDetailFlyerId] = useState<string | null>(null);
  const [detailInitialFlyer, setDetailInitialFlyer] = useState<Flyer | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDiscoverPreviewLoading(true);
      try {
        if (process.env.NEXT_PUBLIC_BACKEND_MODE === 'local') {
          const res = await fetch('/api/local/upcoming?limit=3');
          const json = await res.json();
          if (cancelled) return;
          const recs = Array.isArray(json.records) ? (json.records as LocalApiUpcomingRecord[]) : [];
          setDiscoverPreview(recs.map(localApiRecordToPreview));
        } else {
          const flyers = await getRecentFlyers(100);
          if (cancelled) return;
          setDiscoverPreview(pickClosestUpcomingFromFlyers(flyers, 3));
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setDiscoverPreview([]);
      } finally {
        if (!cancelled) setDiscoverPreviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openDiscoverPreview = (r: HomeDiscoverPreviewRecord) => {
    setDetailFlyerId(r.id);
    setDetailInitialFlyer(
      process.env.NEXT_PUBLIC_BACKEND_MODE === 'local' ? homePreviewRecordToFlyer(r) : null
    );
  };

  const closeDiscoverDetail = () => {
    setDetailFlyerId(null);
    setDetailInitialFlyer(null);
  };

  return (
    <main className="min-h-screen bg-brand-canvas text-brand-black pt-28 pb-12 dark:bg-gray-950 dark:text-gray-50">
      <EventDetailModal
        open={detailFlyerId !== null}
        flyerId={detailFlyerId}
        initialFlyer={detailInitialFlyer}
        onClose={closeDiscoverDetail}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-orange">
              Find a Spot Near You
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-serif text-brand-black mb-6 leading-[1.1] dark:text-gray-50">
            Find Free Food & <br />
            Eat Smarter{' '}
            <span className="inline-block relative">
              🍕
              <span className="absolute -bottom-2 w-full h-3 bg-brand-orange/20 rounded-full -z-10 skew-x-12 transform" />
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10 leading-relaxed font-normal dark:text-gray-300">
            Discover the best free food events, leftover catering, and club meetings with surplus snacks on
            campus. We&apos;ve got the good stuff, mapped out for you.
          </p>

          <div className="max-w-xl mx-auto bg-white p-2 rounded-full shadow-soft flex items-center border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <div className="pl-4 text-gray-400 dark:text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by location or food type..."
              className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 font-medium dark:text-gray-100 dark:placeholder-gray-500"
            />
            <Link href="/feed">
              <button
                type="button"
                className="bg-[#FF5A1F] text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
              >
                Search
              </button>
            </Link>
          </div>
        </section>

        {/* Weekly calendar */}
        <div className="max-w-5xl mx-auto mb-24">
          <WeeklyEventCalendar />
        </div>

        {/* Campus map — single CTA to Explore */}
        <section className="mb-24 flex flex-col items-center text-center">
          <h2 className="text-3xl font-serif text-brand-black mb-3 dark:text-gray-50">Campus map</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mb-8">
            Browse buildings, flyer counts, and activities on the Explore map — same week controls as the calendar
            above.
          </p>
          <Link href="/explore">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[#FF5A1F] px-10 py-4 text-sm font-semibold text-white shadow-md hover:bg-orange-600 hover:shadow-lg transition-all"
            >
              Explore the map
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </Link>
        </section>

        {/* FEED PREVIEW */}
        <section className="mb-24">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-serif text-brand-black dark:text-gray-50">Discover Events</h2>
            <Link href="/feed">
              <button
                type="button"
                className="px-6 py-2 border border-gray-200 rounded-full text-sm font-semibold hover:bg-white hover:border-brand-orange hover:text-brand-orange transition-colors dark:border-gray-800 dark:hover:bg-gray-900"
              >
                View All
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {discoverPreviewLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm dark:bg-gray-900 dark:border-gray-800 animate-pulse"
                  >
                    <div className="h-48 bg-gray-100 rounded-2xl mb-4 dark:bg-gray-800" />
                    <div className="h-6 bg-gray-100 rounded mb-2 dark:bg-gray-800" />
                    <div className="h-4 bg-gray-50 rounded w-2/3 dark:bg-gray-800/80" />
                  </div>
                ))}
              </>
            ) : discoverPreview.length > 0 ? (
              discoverPreview.map((r) => (
                  <div
                    key={r.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openDiscoverPreview(r)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openDiscoverPreview(r);
                      }
                    }}
                    className="block bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer dark:bg-gray-900 dark:border-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                  >
                    <div className="h-48 bg-gray-100 rounded-2xl mb-4 overflow-hidden relative dark:bg-gray-800">
                      {r.imageUrl ? (
                        <img
                          src={r.imageUrl}
                          alt={r.event.title ?? 'Event flyer'}
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-50 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500">
                          📄
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-brand-orange shadow-sm border border-black/5 dark:bg-gray-950/80 dark:border-gray-800/60">
                        UPCOMING
                      </div>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-brand-black mb-1 group-hover:text-brand-orange transition-colors dark:text-gray-50 line-clamp-2">
                        {r.event.title ?? 'Upcoming Event'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 dark:text-gray-400">
                        {r.event.place ?? 'Location TBD'} • {prettyStartLine(r)}
                      </p>

                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className="text-brand-orange">{r.event.food ?? 'Food'}</span>
                        {r.event.foodCategory ? (
                          <span className="text-gray-400 dark:text-gray-500">• {r.event.foodCategory}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer dark:bg-gray-900 dark:border-gray-800"
                  >
                    <div className="h-48 bg-gray-100 rounded-2xl mb-4 overflow-hidden relative dark:bg-gray-800">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${
                          i === 1
                            ? 'from-orange-100 to-red-50'
                            : i === 2
                              ? 'from-green-100 to-emerald-50'
                              : 'from-blue-100 to-indigo-50'
                        } flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500`}
                      >
                        {i === 1 ? '🥯' : i === 2 ? '🥗' : '🌯'}
                      </div>
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-brand-orange shadow-sm border border-black/5 dark:bg-gray-950/80 dark:border-gray-800/60">
                        AVAILABLE
                      </div>
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-brand-black mb-1 group-hover:text-brand-orange transition-colors dark:text-gray-50">
                        {i === 1 ? 'Morning Bagels' : i === 2 ? 'Club Salad Bar' : 'Late Night Burritos'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 dark:text-gray-400">
                        JFSB Lobby • Posted 20m ago
                      </p>

                      <div className="flex items-center gap-1 text-xs font-semibold text-brand-black">
                        <span className="text-orange-500">★ 4.8</span>
                        <span className="text-gray-400 dark:text-gray-500">(24 reviews)</span>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-white rounded-3xl p-8 md:p-12 mb-20 border border-gray-100/50 shadow-sm dark:bg-gray-900/60 dark:border-gray-800 dark:shadow-[0_30px_80px_-60px_rgba(0,0,0,0.9)]">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-brand-black mb-2 dark:text-gray-50">What they say about us</h2>
            <p className="text-gray-500 dark:text-gray-400">Watch what people says about scavenger.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-canvas p-6 rounded-2xl border border-transparent hover:border-brand-orange/20 transition-colors dark:bg-gray-950/60 dark:border dark:border-gray-800 dark:hover:border-brand-orange/30">
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium dark:text-gray-200">
                &ldquo;Honestly, this saved me during finals week. I found free pizza in the JFSB and a bagel
                spread in the library just by checking the feed. No more sketchy vending machine
                dinners.&rdquo;
              </p>
              <div className="flex items-center gap-1 text-orange-500 mb-4 text-sm">
                ★★★★★ <span className="text-gray-800 font-bold ml-1 dark:text-gray-100">5.0</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-lg dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
                  🎒
                </div>
                <div>
                  <div className="font-serif text-sm font-bold text-brand-black dark:text-gray-50">Tyler J.</div>
                  <div className="text-xs text-brand-gray dark:text-gray-400">CS Sophomore</div>
                </div>
              </div>
            </div>

            <div className="bg-brand-canvas p-6 rounded-2xl border border-transparent hover:border-brand-orange/20 transition-colors dark:bg-gray-950/60 dark:border dark:border-gray-800 dark:hover:border-brand-orange/30">
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium dark:text-gray-200">
                &ldquo;We used to throw away so much food after our events. Now I just snap a photo, post it
                here, and 20 students show up within minutes. It&apos;s barely any extra work.&rdquo;
              </p>
              <div className="flex items-center gap-1 text-orange-500 mb-4 text-sm">
                ★★★★★ <span className="text-gray-800 font-bold ml-1 dark:text-gray-100">4.9</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-lg dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
                  👩‍💻
                </div>
                <div>
                  <div className="font-serif text-sm font-bold text-brand-black dark:text-gray-50">Sarah M.</div>
                  <div className="text-xs text-brand-gray dark:text-gray-400">Marketing Club Pres.</div>
                </div>
              </div>
            </div>

            <div className="bg-brand-canvas p-6 rounded-2xl border border-transparent hover:border-brand-orange/20 transition-colors dark:bg-gray-950/60 dark:border dark:border-gray-800 dark:hover:border-brand-orange/30">
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium dark:text-gray-200">
                &ldquo;As an RA, I love this for sustainability. It turns a wasteful problem into a community
                solution. My residents check Scavenger before they even think about ordering DoorDash.&rdquo;
              </p>
              <div className="flex items-center gap-1 text-orange-500 mb-4 text-sm">
                ★★★★★ <span className="text-gray-800 font-bold ml-1 dark:text-gray-100">4.8</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-lg dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
                  🌿
                </div>
                <div>
                  <div className="font-serif text-sm font-bold text-brand-black dark:text-gray-50">Marcus L.</div>
                  <div className="text-xs text-brand-gray dark:text-gray-400">Heritage Halls RA</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
