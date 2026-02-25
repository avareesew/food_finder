'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const CampusMap = dynamic(() => import('@/components/CampusMap').then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 animate-pulse rounded-[3rem] flex items-center justify-center">
      <span className="text-gray-400 font-bold tracking-widest uppercase text-xs">Loading Campus...</span>
    </div>
  )
});

type LocalRecord = {
  id: string;
  createdAtIso: string;
  imageUrl?: string | null;
  event: {
    title: string | null;
    date: string | null; // YYYY-MM-DD
    startTime: string | null; // HH:MM
    endTime: string | null; // HH:MM
    place: string | null;
    food: string | null;
    foodCategory: string | null;
    details: string | null;
  };
};

function toLocalDate(date: string | null, time?: string | null): Date | null {
  if (!date) return null;
  const t = time && /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : '00:00:00';
  const d = new Date(`${date}T${t}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function prettyStartLine(r: LocalRecord): string {
  const d = toLocalDate(r.event.date, r.event.startTime);
  if (!d) return 'Time TBD';
  const dateStr = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d);
  const timeStr = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(d);
  return `${dateStr} • ${timeStr}`;
}

export default function Home() {
  const [upcoming, setUpcoming] = useState<LocalRecord[]>([]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_BACKEND_MODE !== 'local') return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/local/upcoming?limit=3');
        const json = await res.json();
        if (cancelled) return;
        setUpcoming(Array.isArray(json.records) ? (json.records as LocalRecord[]) : []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-brand-canvas text-brand-black pt-28 pb-12 dark:bg-gray-950 dark:text-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HERO SECTION */}
        <section className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-orange">
              Find a Spot Near You
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-serif text-brand-black mb-6 leading-[1.1] dark:text-gray-50">
            Find Free Food & <br />
            Eat Smarter <span className="inline-block relative">🍕<span className="absolute -bottom-2 w-full h-3 bg-brand-orange/20 rounded-full -z-10 skew-x-12 transform"></span></span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-10 leading-relaxed font-normal dark:text-gray-300">
            Discover the best free food events, leftover catering, and club meetings with surplus snacks on campus. We&apos;ve got the good stuff, mapped out for you.
          </p>

          {/* Search / CTA */}
          <div className="max-w-xl mx-auto bg-white p-2 rounded-full shadow-soft flex items-center border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
            <div className="pl-4 text-gray-400 dark:text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by location or food type..."
              className="flex-1 px-4 py-3 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-400 font-medium dark:text-gray-100 dark:placeholder-gray-500"
            />
            <Link href="/feed">
              <button className="bg-[#FF5A1F] text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg">
                Search
              </button>
            </Link>
          </div>
        </section>

        {/* MAP / VISUAL SECTION */}
        <section className="mb-24">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-3xl font-serif text-brand-black mb-2 dark:text-gray-50">Explore Nearby</h2>
              <p className="text-gray-500 dark:text-gray-400">Discover top-rated free food spots in your area.</p>
            </div>
            <Link href="/feed">
              <button className="px-6 py-2 border border-gray-200 rounded-full text-sm font-semibold hover:bg-white hover:border-brand-orange hover:text-brand-orange transition-colors dark:border-gray-800 dark:hover:bg-gray-900">
                View All
              </button>
            </Link>
          </div>

          {/* Map/Hero Placeholder */}
          <div className="relative w-full h-[400px] md:h-[500px] bg-gray-100 rounded-[2.5rem] overflow-hidden shadow-card border-4 border-white dark:bg-gray-900 dark:border-gray-900">
            <CampusMap />

            {/* Floating "Live Now" Badge Override for Demo */}
            <div className="absolute bottom-6 left-6 z-[1000] bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 dark:bg-gray-950 dark:border-gray-800">
              <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center text-xl dark:bg-brand-orange/15">
                🍕
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">Happening Now</span>
                </div>
                <div className="font-serif font-bold text-gray-900 dark:text-gray-50">Pizza Social @ TMCB</div>
              </div>
            </div>
          </div>
        </section>

        {/* FEED PREVIEW */}
        <section className="mb-24">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-serif text-brand-black dark:text-gray-50">Discover Events</h2>
            <Link href="/feed">
              <button className="px-6 py-2 border border-gray-200 rounded-full text-sm font-semibold hover:bg-white hover:border-brand-orange hover:text-brand-orange transition-colors dark:border-gray-800 dark:hover:bg-gray-900">
                View All
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {process.env.NEXT_PUBLIC_BACKEND_MODE === 'local' && upcoming.length > 0
              ? upcoming.map((r) => (
                  <Link
                    key={r.id}
                    href="/feed"
                    className="block bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer dark:bg-gray-900 dark:border-gray-800"
                  >
                    <div className="h-48 bg-gray-100 rounded-2xl mb-4 overflow-hidden relative dark:bg-gray-800">
                      {r.imageUrl ? (
                        <img
                          src={r.imageUrl}
                          alt={r.event.title ?? 'Event flyer'}
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
                        <span className="text-brand-orange">
                          {r.event.food ?? 'Food'}
                        </span>
                        {r.event.foodCategory && (
                          <span className="text-gray-400 dark:text-gray-500">
                            • {r.event.foodCategory}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              : [1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer dark:bg-gray-900 dark:border-gray-800">
                    <div className="h-48 bg-gray-100 rounded-2xl mb-4 overflow-hidden relative dark:bg-gray-800">
                      {/* Mock Image Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${i === 1 ? 'from-orange-100 to-red-50' : i === 2 ? 'from-green-100 to-emerald-50' : 'from-blue-100 to-indigo-50'} flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-500`}>
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
                      <p className="text-sm text-gray-500 mb-3 dark:text-gray-400">JFSB Lobby • Posted 20m ago</p>

                      <div className="flex items-center gap-1 text-xs font-semibold text-brand-black">
                        <span className="text-orange-500">★ 4.8</span>
                        <span className="text-gray-400 dark:text-gray-500">(24 reviews)</span>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="bg-white rounded-3xl p-8 md:p-12 mb-20 border border-gray-100/50 shadow-sm dark:bg-gray-900/60 dark:border-gray-800 dark:shadow-[0_30px_80px_-60px_rgba(0,0,0,0.9)]">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif text-brand-black mb-2 dark:text-gray-50">What they say about us</h2>
            <p className="text-gray-500 dark:text-gray-400">Watch what people says about scavenger.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1: The Hungry Student */}
            <div className="bg-brand-canvas p-6 rounded-2xl border border-transparent hover:border-brand-orange/20 transition-colors dark:bg-gray-950/60 dark:border dark:border-gray-800 dark:hover:border-brand-orange/30">
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium dark:text-gray-200">
                &ldquo;Honestly, this saved me during finals week. I found free pizza in the JFSB and a bagel spread in the library just by checking the feed. No more sketchy vending machine dinners.&rdquo;
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

            {/* Testimonial 2: The Club Organizer */}
            <div className="bg-brand-canvas p-6 rounded-2xl border border-transparent hover:border-brand-orange/20 transition-colors dark:bg-gray-950/60 dark:border dark:border-gray-800 dark:hover:border-brand-orange/30">
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium dark:text-gray-200">
                &ldquo;We used to throw away so much food after our events. Now I just snap a photo, post it here, and 20 students show up within minutes. It&apos;s barely any extra work.&rdquo;
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

            {/* Testimonial 3: The RA */}
            <div className="bg-brand-canvas p-6 rounded-2xl border border-transparent hover:border-brand-orange/20 transition-colors dark:bg-gray-950/60 dark:border dark:border-gray-800 dark:hover:border-brand-orange/30">
              <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium dark:text-gray-200">
                &ldquo;As an RA, I love this for sustainability. It turns a wasteful problem into a community solution. My residents check Scavenger before they even think about ordering DoorDash.&rdquo;
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
