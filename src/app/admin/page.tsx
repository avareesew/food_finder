'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { normalizeEmail } from '@/lib/authShared';

type ListedUser = {
    uid: string;
    email: string;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    byuNetId: string | null;
    canUpload: boolean;
};

export default function AdminPage() {
    const { firebaseConfigured, user, me, loading: authLoading } = useAuth();
    const [users, setUsers] = useState<ListedUser[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState<string | null>(null);
    const [toggleBusyUid, setToggleBusyUid] = useState<string | null>(null);

    const adminEmailNorm = me ? normalizeEmail(me.email) : '';

    const loadUsers = useCallback(async (u: NonNullable<typeof user>) => {
        setListLoading(true);
        setListError(null);
        try {
            const token = await u.getIdToken();
            const res = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await res.json().catch(() => ({}))) as { users?: ListedUser[]; error?: string };
            if (!res.ok) {
                setListError(typeof data.error === 'string' ? data.error : 'Could not load users.');
                setUsers([]);
                return;
            }
            setUsers(Array.isArray(data.users) ? data.users : []);
        } catch {
            setListError('Could not load users.');
            setUsers([]);
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!firebaseConfigured || authLoading) return;
        if (!user || !me?.isAdmin) return;
        void loadUsers(user);
    }, [authLoading, firebaseConfigured, loadUsers, me?.isAdmin, user]);

    const onToggle = async (row: ListedUser, next: boolean) => {
        if (!user || !me?.isAdmin) return;
        if (normalizeEmail(row.email) === adminEmailNorm) return;
        setToggleBusyUid(row.uid);
        setListError(null);
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid: row.uid, canUpload: next }),
            });
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) {
                setListError(typeof data.error === 'string' ? data.error : 'Update failed.');
                return;
            }
            setUsers((prev) => prev.map((u) => (u.uid === row.uid ? { ...u, canUpload: next } : u)));
        } catch {
            setListError('Update failed.');
        } finally {
            setToggleBusyUid(null);
        }
    };

    if (!firebaseConfigured) {
        return (
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
                <p className="text-gray-600 dark:text-gray-300">Firebase is not configured for this deployment.</p>
            </main>
        );
    }

    if (authLoading) {
        return (
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
                <p className="text-gray-600 dark:text-gray-300">Loading…</p>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950 space-y-6">
                <h1 className="text-3xl font-serif font-bold text-brand-black dark:text-gray-50">Admin</h1>
                <p className="text-gray-600 dark:text-gray-300">Sign in with your @byu.edu email to continue.</p>
                <Link
                    href="/login"
                    className="inline-flex rounded-full bg-[#FF5A1F] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-600"
                >
                    Sign in
                </Link>
                <p>
                    <Link href="/" className="text-sm font-semibold text-brand-orange hover:underline">
                        ← Back home
                    </Link>
                </p>
            </main>
        );
    }

    if (!me?.isAdmin) {
        return (
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950 space-y-4">
                <h1 className="text-3xl font-serif font-bold text-brand-black dark:text-gray-50">Admin</h1>
                <p className="text-gray-600 dark:text-gray-300">
                    This page is only available to the configured admin account.
                </p>
                <p>
                    <Link href="/" className="text-sm font-semibold text-brand-orange hover:underline">
                        ← Back home
                    </Link>
                </p>
            </main>
        );
    }

    return (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-brand-black dark:text-gray-50">
                        Flyer upload access
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        @byu.edu accounts appear here after they sign in. Only people with upload enabled below can post
                        flyers to Firebase.
                    </p>
                </div>
                <Link href="/upload" className="text-sm font-semibold text-brand-orange hover:underline">
                    Upload page →
                </Link>
            </div>

            {listError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
                    {listError}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-950/80 dark:text-gray-400">
                    Signed-in users ({users.length})
                </div>
                {listLoading ? (
                    <div className="p-6 text-sm text-gray-600 dark:text-gray-300">Loading users…</div>
                ) : users.length === 0 ? (
                    <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
                        No profiles yet. Have someone create an account or sign in on /login, then refresh this page.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {users.map((row) => {
                            const isSelf = normalizeEmail(row.email) === adminEmailNorm;
                            const busy = toggleBusyUid === row.uid;
                            return (
                                <li
                                    key={row.uid}
                                    className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-semibold text-gray-900 dark:text-gray-50">
                                            {row.email}
                                        </p>
                                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                            {row.firstName || row.lastName
                                                ? [row.firstName, row.lastName].filter(Boolean).join(' ')
                                                : row.displayName ?? '—'}
                                            {row.byuNetId ? (
                                                <>
                                                    {' '}
                                                    <span className="text-gray-400">·</span> Net ID:{' '}
                                                    <span className="font-medium text-gray-600 dark:text-gray-300">
                                                        {row.byuNetId}
                                                    </span>
                                                </>
                                            ) : null}
                                        </p>
                                        {isSelf ? (
                                            <p className="mt-1 text-xs font-semibold text-brand-orange">Admin</p>
                                        ) : null}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Upload
                                        </span>
                                        {isSelf ? (
                                            <span className="text-xs text-gray-400 dark:text-gray-500">Always on</span>
                                        ) : (
                                            <button
                                                type="button"
                                                role="switch"
                                                aria-checked={row.canUpload}
                                                disabled={busy}
                                                onClick={() => void onToggle(row, !row.canUpload)}
                                                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-gray-900 ${
                                                    row.canUpload ? 'bg-[#FF5A1F]' : 'bg-gray-200 dark:bg-gray-700'
                                                }`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${
                                                        row.canUpload ? 'translate-x-5' : 'translate-x-0.5'
                                                    }`}
                                                />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </main>
    );
}
