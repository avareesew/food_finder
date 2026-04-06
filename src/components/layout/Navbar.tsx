'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

export default function Navbar() {
    const pathname = usePathname();
    const { firebaseConfigured, user, me, loading, sessionBanner, signOut } = useAuth();

    const linkBase =
        "px-3 py-2 rounded-full text-sm font-semibold transition-colors";
    const linkInactive =
        "text-gray-800 hover:text-brand-orange hover:bg-white/70";
    const linkActive =
        "text-brand-orange bg-white/80 ring-1 ring-brand-orange/20";

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b dark:bg-gray-950/70 dark:border-gray-800/60 bg-white/55 border-gray-200/60 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.25)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-3 h-20 min-w-0">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center min-w-0">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-serif font-black tracking-tight text-gray-900 dark:text-gray-50">
                                Scavenger<span className="text-brand-orange">.</span>
                            </span>
                        </Link>
                    </div>

                    {/* Center nav: flex-1 centers links in the space *between* logo and actions (avoids overlap) */}
                    <div className="hidden md:flex flex-1 justify-center items-center min-w-0 px-2">
                        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 lg:gap-x-6">
                            <Link
                                href="/"
                                className={`${linkBase} ${pathname === '/' ? linkActive : linkInactive} dark:text-gray-100 dark:hover:bg-gray-900/50 dark:hover:text-brand-orange ${pathname === '/' ? 'dark:bg-gray-900/70' : ''}`}
                            >
                                Home
                            </Link>
                            <Link
                                href="/feed"
                                className={`${linkBase} ${pathname?.startsWith('/feed') ? linkActive : linkInactive} dark:text-gray-100 dark:hover:bg-gray-900/50 dark:hover:text-brand-orange ${pathname?.startsWith('/feed') ? 'dark:bg-gray-900/70' : ''}`}
                            >
                                Discover
                            </Link>
                            <Link
                                href="/explore"
                                className={`${linkBase} ${pathname === '/explore' ? linkActive : linkInactive} dark:text-gray-100 dark:hover:bg-gray-900/50 dark:hover:text-brand-orange ${pathname === '/explore' ? 'dark:bg-gray-900/70' : ''}`}
                            >
                                Explore
                            </Link>
                            <Link
                                href="/about"
                                className={`${linkBase} ${pathname?.startsWith('/about') ? linkActive : linkInactive} dark:text-gray-100 dark:hover:bg-gray-900/50 dark:hover:text-brand-orange ${pathname?.startsWith('/about') ? 'dark:bg-gray-900/70' : ''}`}
                            >
                                About
                            </Link>
                        </div>
                    </div>

                    {/* Right: duplicate Browse Feed only when center nav is hidden (< md) */}
                    <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3 min-w-0">
                        <Link href="/feed" className="flex-shrink-0 md:hidden">
                            <span className="text-sm font-semibold text-gray-800 hover:text-brand-orange cursor-pointer dark:text-gray-100">
                                Feed
                            </span>
                        </Link>
                        <ThemeToggle />
                        {firebaseConfigured && (
                            <>
                                {sessionBanner ? (
                                    <span
                                        className="hidden xl:block max-w-[10rem] text-xs text-amber-800 dark:text-amber-200 leading-snug line-clamp-2"
                                        title={sessionBanner}
                                    >
                                        {sessionBanner}
                                    </span>
                                ) : null}
                                {loading ? (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 px-1">…</span>
                                ) : user ? (
                                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                        <span
                                            className="hidden lg:inline text-xs text-gray-600 dark:text-gray-300 max-w-[9rem] xl:max-w-[11rem] truncate"
                                            title={me?.email ?? user.email ?? ''}
                                        >
                                            {me?.email ?? user.email}
                                        </span>
                                        {me?.isAdmin ? (
                                            <Link
                                                href="/admin"
                                                className="text-xs font-semibold text-gray-700 hover:text-brand-orange dark:text-gray-200 dark:hover:text-brand-orange whitespace-nowrap px-1"
                                            >
                                                Admin
                                            </Link>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={() => void signOut()}
                                            className="text-xs font-semibold text-gray-600 hover:text-brand-orange dark:text-gray-300 dark:hover:text-brand-orange whitespace-nowrap px-1"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="text-xs sm:text-sm font-semibold text-gray-800 hover:text-brand-orange dark:text-gray-100 dark:hover:text-brand-orange px-2 sm:px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 inline-flex items-center whitespace-nowrap"
                                    >
                                        Sign in
                                    </Link>
                                )}
                            </>
                        )}
                        <Link href="/upload" className="flex-shrink-0">
                            <button className="bg-[#FF5A1F] text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg active:scale-95 ring-1 ring-brand-orange/20 whitespace-nowrap">
                                <span className="sm:hidden">Upload</span>
                                <span className="hidden sm:inline">Upload Flyer</span>
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
