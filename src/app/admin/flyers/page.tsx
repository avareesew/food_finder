'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import { useAuth } from '@/components/providers/AuthProvider';
import ConfirmModal from '@/components/ui/ConfirmModal';

type FlyerRow = {
    id: string;
    originalFilename: string;
    status: string;
    downloadURL: string;
    title: string | null;
    date: string | null;
    createdAtMs: number | null;
};

function FlyerThumbnail({ downloadURL }: { downloadURL: string }) {
    const [failed, setFailed] = useState(false);
    const showImage = Boolean(downloadURL) && !failed;

    return (
        <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800 sm:h-32 sm:w-28">
            {showImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- Firebase signed URLs; host varies by project
                <img
                    src={downloadURL}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={() => setFailed(true)}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center px-2 text-center">
                    <span className="text-[11px] font-semibold leading-snug text-gray-500 dark:text-gray-400">
                        {downloadURL && failed ? 'Preview unavailable' : 'Text-only'}
                    </span>
                </div>
            )}
        </div>
    );
}

export default function AdminFlyersPage() {
    const { firebaseConfigured, user, me, loading: authLoading } = useAuth();
    const [flyers, setFlyers] = useState<FlyerRow[]>([]);
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState<string | null>(null);
    const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);
    const [pendingDelete, setPendingDelete] = useState<FlyerRow | null>(null);

    const loadFlyers = useCallback(async (u: NonNullable<typeof user>) => {
        setListLoading(true);
        setListError(null);
        try {
            const token = await u.getIdToken();
            const res = await fetch('/api/admin/flyers?limit=100', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await res.json().catch(() => ({}))) as { flyers?: FlyerRow[]; error?: string };
            if (!res.ok) {
                setListError(typeof data.error === 'string' ? data.error : 'Could not load flyers.');
                setFlyers([]);
                return;
            }
            setFlyers(Array.isArray(data.flyers) ? data.flyers : []);
        } catch {
            setListError('Could not load flyers.');
            setFlyers([]);
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!firebaseConfigured || authLoading) return;
        if (!user || !me?.isAdmin) return;
        void loadFlyers(user);
    }, [authLoading, firebaseConfigured, loadFlyers, me?.isAdmin, user]);

    const confirmRemoveFlyer = async () => {
        if (!user || !me?.isAdmin || !pendingDelete) return;
        const id = pendingDelete.id;
        setDeleteBusyId(id);
        setListError(null);
        try {
            const token = await user.getIdToken();
            const res = await fetch(`/api/admin/flyers/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) {
                setListError(typeof data.error === 'string' ? data.error : 'Delete failed.');
                return;
            }
            setFlyers((prev) => prev.filter((f) => f.id !== id));
            setPendingDelete(null);
        } catch {
            setListError('Delete failed.');
        } finally {
            setDeleteBusyId(null);
        }
    };

    if (!firebaseConfigured) {
        return (
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
                <p className="text-gray-600 dark:text-gray-300">Firebase is not configured.</p>
            </main>
        );
    }

    if (authLoading) {
        return (
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
                <p className="text-gray-600 dark:text-gray-300">Loading…</p>
            </main>
        );
    }

    if (!user || !me?.isAdmin) {
        return (
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950 space-y-4">
                <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-50">Flyers</h1>
                <p className="text-gray-600 dark:text-gray-300">Admin sign-in required.</p>
                <Link href="/login" className="font-semibold text-brand-orange hover:underline">
                    Sign in →
                </Link>
            </main>
        );
    }

    const deleteBusy = Boolean(pendingDelete && deleteBusyId === pendingDelete.id);

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
            <ConfirmModal
                open={pendingDelete !== null}
                title="Remove this flyer?"
                description={
                    <>
                        <p>
                            This will delete the event from Firestore and remove the file from Storage.{' '}
                            <strong>This cannot be undone.</strong>
                        </p>
                        {pendingDelete ? (
                            <p className="mt-3 rounded-lg border border-gray-800 bg-gray-900/90 px-3 py-2.5 text-sm font-medium text-white">
                                {pendingDelete.title?.trim() ||
                                    pendingDelete.originalFilename ||
                                    'Untitled'}
                            </p>
                        ) : null}
                    </>
                }
                cancelLabel="Cancel"
                confirmLabel="Remove flyer"
                variant="danger"
                isBusy={deleteBusy}
                onCancel={() => {
                    if (deleteBusy) return;
                    setPendingDelete(null);
                }}
                onConfirm={() => void confirmRemoveFlyer()}
            />
            <AdminNavTabs />
            <div className="mb-6 mt-6">
                <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-50">Flyers & events</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Hard delete: removes the Firestore document and the Storage object when present. Thumbnails help
                    confirm which flyer you are removing. If a signed URL has expired, you will see “Preview
                    unavailable” — the row is still correct.
                </p>
            </div>

            {listError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
                    {listError}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-950/80 dark:text-gray-400">
                    Flyers ({flyers.length})
                </div>
                {listLoading ? (
                    <div className="p-6 text-sm text-gray-600 dark:text-gray-300">Loading…</div>
                ) : flyers.length === 0 ? (
                    <div className="p-6 text-sm text-gray-600 dark:text-gray-300">No flyers found.</div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {flyers.map((row) => {
                            const busy = deleteBusyId === row.id;
                            const when =
                                row.createdAtMs != null
                                    ? new Date(row.createdAtMs).toLocaleString(undefined, {
                                          dateStyle: 'short',
                                          timeStyle: 'short',
                                      })
                                    : '—';
                            return (
                                <li
                                    key={row.id}
                                    className="flex flex-wrap items-start gap-4 px-4 py-4 sm:flex-nowrap sm:items-center sm:px-5"
                                >
                                    <FlyerThumbnail downloadURL={row.downloadURL} />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-gray-50">
                                            {row.title?.trim() || row.originalFilename || 'Untitled'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {row.date ? `Date: ${row.date} · ` : ''}
                                            {when}
                                        </p>
                                        <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-1 break-all">
                                            {row.id}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={busy}
                                        onClick={() => setPendingDelete(row)}
                                        className="shrink-0 self-center text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400 sm:self-auto"
                                    >
                                        {busy ? 'Deleting…' : 'Delete'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </main>
    );
}
