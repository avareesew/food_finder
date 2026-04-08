'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import { useAuth } from '@/components/providers/AuthProvider';

type GmailPreviewRow = {
    id: string;
    snippet: string;
    subject: string;
    from: string;
    internalDateMs: number | null;
    ingestMarkDetail: string | null;
};

export default function AdminGmailPage() {
    const { firebaseConfigured, user, me, loading: authLoading } = useAuth();
    const [messages, setMessages] = useState<GmailPreviewRow[]>([]);
    const [query, setQuery] = useState<string>('');
    const [listLoading, setListLoading] = useState(false);
    const [listError, setListError] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
    const [ingestBusy, setIngestBusy] = useState(false);
    const [ingestResult, setIngestResult] = useState<unknown>(null);
    const [ingestError, setIngestError] = useState<string | null>(null);

    const loadMessages = useCallback(async (u: NonNullable<typeof user>) => {
        setListLoading(true);
        setListError(null);
        try {
            const token = await u.getIdToken();
            const res = await fetch('/api/admin/gmail-messages', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await res.json().catch(() => ({}))) as {
                ok?: boolean;
                messages?: GmailPreviewRow[];
                query?: string;
                error?: string;
            };
            if (!res.ok || !data.ok) {
                setListError(typeof data.error === 'string' ? data.error : 'Could not load Gmail inbox.');
                setMessages([]);
                return;
            }
            setQuery(typeof data.query === 'string' ? data.query : '');
            setMessages(Array.isArray(data.messages) ? data.messages : []);
        } catch {
            setListError('Could not load Gmail inbox.');
            setMessages([]);
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!firebaseConfigured || authLoading) return;
        if (!user || !me?.isAdmin) return;
        void loadMessages(user);
    }, [authLoading, firebaseConfigured, loadMessages, me?.isAdmin, user]);

    const toggleId = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const runIngest = async (includeDebug: boolean) => {
        if (!user || !me?.isAdmin) return;
        setIngestBusy(true);
        setIngestError(null);
        setIngestResult(null);
        try {
            const token = await user.getIdToken();
            const unmarkMessageIds = Array.from(selectedIds);
            const res = await fetch('/api/admin/gmail-ingest', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    includeDebug,
                    ...(unmarkMessageIds.length > 0 ? { unmarkMessageIds } : {}),
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setIngestError(typeof data.error === 'string' ? data.error : `HTTP ${res.status}`);
                return;
            }
            setIngestResult(data);
            setSelectedIds(new Set());
            await loadMessages(user);
        } catch {
            setIngestError('Ingest request failed.');
        } finally {
            setIngestBusy(false);
        }
    };

    if (!firebaseConfigured) {
        return (
            <main className="mx-auto max-w-3xl px-4 py-24">
                <p className="text-gray-600 dark:text-gray-400">Firebase is not configured.</p>
            </main>
        );
    }

    if (authLoading) {
        return (
            <main className="mx-auto max-w-3xl px-4 py-24">
                <p className="text-gray-600 dark:text-gray-400">Loading…</p>
            </main>
        );
    }

    if (!user || !me?.isAdmin) {
        return (
            <main className="mx-auto max-w-3xl px-4 py-24">
                <p className="text-gray-600 dark:text-gray-400">Admin sign-in required.</p>
                <Link href="/admin" className="mt-4 inline-block text-brand-orange font-semibold">
                    ← Admin home
                </Link>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-24">
            <AdminNavTabs />

            <div className="mt-8">
                <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-gray-50">Gmail ingest</h1>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                    Uses the same inbox search as automatic cron. Tick <strong>Unmark</strong> for messages you want to
                    process again, then sync — those marks are cleared before the run. The message table below only refreshes
                    when you load the page or use <strong>Refresh inbox list</strong>; it does not fetch new mail by itself.
                </p>
                {query ? (
                    <p className="mt-3 text-xs font-mono text-gray-500 dark:text-gray-500">
                        Query: <span className="text-gray-700 dark:text-gray-300">{query}</span>
                    </p>
                ) : null}

                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        type="button"
                        disabled={ingestBusy}
                        onClick={() => void runIngest(false)}
                        className="rounded-full bg-[#FF5A1F] px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-50"
                    >
                        {ingestBusy ? 'Running…' : 'Sync inbox'}
                    </button>
                    <button
                        type="button"
                        disabled={ingestBusy}
                        onClick={() => void runIngest(true)}
                        className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:border-brand-orange hover:text-brand-orange disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    >
                        Sync inbox (diagnostics)
                    </button>
                    <button
                        type="button"
                        disabled={listLoading}
                        onClick={() => void loadMessages(user)}
                        className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        Refresh inbox list
                    </button>
                </div>
                <ul className="mt-4 max-w-2xl list-inside list-disc space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <li>
                        <strong className="text-gray-700 dark:text-gray-300">Sync inbox</strong> — Same work as cron: new
                        messages are processed, flyers/events updated. The JSON summary shows counts (ingested, skipped,
                        errors). Nothing extra is logged in the response.
                    </li>
                    <li>
                        <strong className="text-gray-700 dark:text-gray-300">Sync inbox (diagnostics)</strong> — Identical
                        processing, but the response also includes an <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">adminDebug</code>{' '}
                        array: per-message subject, body preview snippet, flags (image/PDF), and outcome (for example
                        whether text extraction ran). Useful when an email did not create an event and you need to see why.
                        Diagnostics are only in this HTTP response, not saved to the database.
                    </li>
                    <li>
                        <strong className="text-gray-700 dark:text-gray-300">Refresh inbox list</strong> — Only reloads the
                        table from Gmail (subjects, snippets, ingest status). Does <em>not</em> run ingest or change Firestore
                        flyers.
                    </li>
                </ul>

                {ingestError ? (
                    <p className="mt-4 text-sm text-red-600 dark:text-red-400">{ingestError}</p>
                ) : null}
                {ingestResult ? (
                    <details className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
                        <summary className="cursor-pointer text-sm font-semibold text-gray-800 dark:text-gray-200">
                            Last sync response
                        </summary>
                        <pre className="mt-3 max-h-[min(70vh,28rem)] overflow-auto text-xs text-gray-700 dark:text-gray-300">
                            {JSON.stringify(ingestResult, null, 2)}
                        </pre>
                    </details>
                ) : null}

                <div className="mt-10 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
                    {listLoading ? (
                        <p className="p-6 text-sm text-gray-500">Loading messages…</p>
                    ) : listError ? (
                        <p className="p-6 text-sm text-red-600">{listError}</p>
                    ) : messages.length === 0 ? (
                        <p className="p-6 text-sm text-gray-500">No messages matched the inbox query.</p>
                    ) : (
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80">
                                <tr>
                                    <th className="w-10 p-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Unmark
                                    </th>
                                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-gray-500">Subject</th>
                                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-gray-500">Snippet</th>
                                    <th className="p-3 text-xs font-bold uppercase tracking-wider text-gray-500">Ingest</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-gray-100 dark:border-gray-800/80 odd:bg-white even:bg-gray-50/80 dark:odd:bg-gray-950 dark:even:bg-gray-900/40"
                                    >
                                        <td className="p-3 align-top">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(row.id)}
                                                onChange={() => toggleId(row.id)}
                                                aria-label={`Unmark ${row.id} on next ingest`}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="p-3 align-top">
                                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                                                {row.subject || '(no subject)'}
                                            </p>
                                            <p className="mt-1 font-mono text-[11px] text-gray-400">{row.id}</p>
                                            {row.from ? (
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{row.from}</p>
                                            ) : null}
                                        </td>
                                        <td className="max-w-md p-3 align-top text-gray-700 dark:text-gray-300">
                                            {row.snippet || '—'}
                                        </td>
                                        <td className="p-3 align-top text-xs text-gray-600 dark:text-gray-400">
                                            {row.ingestMarkDetail ? (
                                                <span className="rounded-md bg-amber-100 px-2 py-1 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                                                    {row.ingestMarkDetail}
                                                </span>
                                            ) : (
                                                <span className="text-emerald-700 dark:text-emerald-400">Not marked</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </main>
    );
}
