'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const linkBase =
        "px-3 py-2 rounded-full text-sm font-semibold transition-colors";
    const linkInactive =
        "text-gray-800 hover:text-brand-orange hover:bg-white/70";
    const linkActive =
        "text-brand-orange bg-white/80 ring-1 ring-brand-orange/20";

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b dark:bg-gray-950/70 dark:border-gray-800/60 bg-white/55 border-gray-200/60 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.25)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 relative">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-serif font-black tracking-tight text-gray-900 dark:text-gray-50">
                                Scavenger<span className="text-brand-orange">.</span>
                            </span>
                        </Link>
                    </div>

                    {/* Centered Navigation */}
                    <div className="hidden md:flex space-x-8 items-center absolute left-1/2 transform -translate-x-1/2">
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
                            href="/about"
                            className={`${linkBase} ${pathname?.startsWith('/about') ? linkActive : linkInactive} dark:text-gray-100 dark:hover:bg-gray-900/50 dark:hover:text-brand-orange ${pathname?.startsWith('/about') ? 'dark:bg-gray-900/70' : ''}`}
                        >
                            About
                        </Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        <Link href="/feed">
                            <span className="text-sm font-semibold text-gray-800 hover:text-brand-orange cursor-pointer hidden sm:block dark:text-gray-100">
                                Browse Feed
                            </span>
                        </Link>
                        <ThemeToggle />
                        <Link href="/upload">
                            <button className="bg-[#FF5A1F] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg active:scale-95 ring-1 ring-brand-orange/20">
                                Upload Flyer
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
