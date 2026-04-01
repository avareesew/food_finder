'use client';

import Link from 'next/link';
import CampusBuildingsExplorer from '@/components/CampusBuildingsExplorer';

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-brand-canvas text-brand-black pt-28 pb-12 dark:bg-gray-950 dark:text-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-8 text-center sm:text-left">
          <div className="inline-block mb-3">
            <span className="text-xs font-bold tracking-widest uppercase text-brand-orange">Explore</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-brand-black mb-3 leading-tight dark:text-gray-50">
            Buildings & activities
          </h1>
          <p className="max-w-2xl text-gray-600 dark:text-gray-400">
            Pick a campus building to see flyer events for <strong className="text-gray-800 dark:text-gray-200">today</strong> and{' '}
            <strong className="text-gray-800 dark:text-gray-200">this week</strong>. Data comes from uploaded flyers (place names we
            can match). Pair with the calendar on{' '}
            <Link href="/" className="font-semibold text-brand-orange hover:underline">
              Home
            </Link>{' '}
            or{' '}
            <Link href="/feed" className="font-semibold text-brand-orange hover:underline">
              Discover
            </Link>
            .
          </p>
        </section>

        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-serif text-brand-black dark:text-gray-50">By building</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Square campus map (tiles match light/dark). Use the week controls to browse like the home calendar.
              </p>
            </div>
            <Link href="/feed">
              <button
                type="button"
                className="px-6 py-2 border border-gray-200 rounded-full text-sm font-semibold hover:bg-white hover:border-brand-orange hover:text-brand-orange transition-colors dark:border-gray-800 dark:hover:bg-gray-900 w-fit"
              >
                View Discover
              </button>
            </Link>
          </div>

          <CampusBuildingsExplorer />
        </section>
      </div>
    </main>
  );
}
