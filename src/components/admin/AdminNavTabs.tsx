'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
    { href: '/admin', label: 'Upload access' },
    { href: '/admin/create-user', label: 'Create user' },
    { href: '/admin/flyers', label: 'Flyers' },
] as const;

export default function AdminNavTabs() {
    const pathname = usePathname() || '';

    return (
        <nav
            className="flex w-full flex-wrap items-stretch gap-1 border-b border-gray-200 dark:border-gray-800 sm:items-end"
            aria-label="Admin sections"
        >
            <div className="flex min-w-0 flex-1 flex-wrap gap-1">
                {tabs.map((t) => {
                    const active = t.href === '/admin' ? pathname === '/admin' : pathname === t.href;
                    return (
                        <Link
                            key={t.href}
                            href={t.href}
                            className={`inline-flex items-center justify-center rounded-t-lg px-3 py-2.5 text-sm font-semibold transition-colors sm:px-4 ${
                                active
                                    ? 'border-b-2 border-brand-orange bg-white text-brand-orange shadow-sm dark:bg-gray-900'
                                    : 'border-b-2 border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900/50 dark:hover:text-gray-100'
                            }`}
                        >
                            {t.label}
                        </Link>
                    );
                })}
            </div>
            <div className="flex w-full shrink-0 items-center justify-end border-t border-gray-100 py-2 sm:w-auto sm:border-t-0 sm:py-0 dark:border-gray-800/80">
                <Link
                    href="/upload"
                    className="text-sm font-semibold text-brand-orange hover:underline whitespace-nowrap px-1"
                >
                    Upload flyer →
                </Link>
            </div>
        </nav>
    );
}
