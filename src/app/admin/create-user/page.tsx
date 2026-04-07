'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import { useAuth } from '@/components/providers/AuthProvider';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function AdminCreateUserPage() {
    const { firebaseConfigured, user, me, loading: authLoading } = useAuth();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [byuNetId, setByuNetId] = useState('');
    const [email, setEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [passwordResetLink, setPasswordResetLink] = useState<string | null>(null);
    const [createdEmail, setCreatedEmail] = useState<string | null>(null);
    const [copyHint, setCopyHint] = useState<string | null>(null);

    const copyText = async (label: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopyHint(`Copied ${label}.`);
            setTimeout(() => setCopyHint(null), 2500);
        } catch {
            setCopyHint(`Could not copy ${label} — select and copy manually.`);
        }
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setPasswordResetLink(null);
        setCreatedEmail(null);
        if (!user || !me?.isAdmin) return;
        setBusy(true);
        try {
            const token = await user.getIdToken();
            const res = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    byuNetId: byuNetId.trim(),
                    email: email.trim(),
                }),
            });
            const data = (await res.json().catch(() => ({}))) as {
                error?: string;
                passwordResetLink?: string;
                email?: string;
            };
            if (!res.ok) {
                setError(typeof data.error === 'string' ? data.error : 'Could not create user.');
                return;
            }
            if (typeof data.passwordResetLink === 'string') {
                setPasswordResetLink(data.passwordResetLink);
            }
            if (typeof data.email === 'string') {
                setCreatedEmail(data.email);
            }
            setFirstName('');
            setLastName('');
            setByuNetId('');
            setEmail('');
        } catch {
            setError('Request failed.');
        } finally {
            setBusy(false);
        }
    };

    if (!firebaseConfigured) {
        return (
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
                <p className="text-gray-600 dark:text-gray-300">Firebase is not configured.</p>
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

    if (!user || !me?.isAdmin) {
        return (
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950 space-y-4">
                <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-50">Create user</h1>
                <p className="text-gray-600 dark:text-gray-300">Admin sign-in required.</p>
                <Link href="/login" className="font-semibold text-brand-orange hover:underline">
                    Sign in →
                </Link>
            </main>
        );
    }

    return (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
            <AdminNavTabs />
            <div className="mb-6 mt-6">
                <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-50">Create user</h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Creates a Firebase user with a random temporary password, then returns a one-time password reset link.
                Copy the email and link into a message to the student so they can choose their own password.
            </p>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
                    {error}
                </div>
            )}

            {createdEmail && passwordResetLink && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm dark:border-green-900 dark:bg-green-950/30 dark:text-green-100 space-y-3">
                    <p className="font-semibold text-green-900 dark:text-green-50">User created</p>
                    <div>
                        <p className="text-xs font-bold uppercase text-green-800 dark:text-green-200">Email</p>
                        <p className="break-all font-mono text-green-950 dark:text-green-50">{createdEmail}</p>
                        <button
                            type="button"
                            onClick={() => void copyText('email', createdEmail)}
                            className="mt-1 text-xs font-semibold text-brand-orange hover:underline"
                        >
                            Copy email
                        </button>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase text-green-800 dark:text-green-200">
                            Password reset link
                        </p>
                        <p className="break-all font-mono text-xs text-green-950 dark:text-green-50">
                            {passwordResetLink}
                        </p>
                        <button
                            type="button"
                            onClick={() => void copyText('link', passwordResetLink)}
                            className="mt-1 text-xs font-semibold text-brand-orange hover:underline"
                        >
                            Copy link
                        </button>
                    </div>
                    {copyHint && <p className="text-xs text-green-800 dark:text-green-200">{copyHint}</p>}
                </div>
            )}

            <form
                onSubmit={onSubmit}
                className="max-w-lg space-y-4 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="cu-first" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            First name
                        </label>
                        <input
                            id="cu-first"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="cu-last" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last name
                        </label>
                        <input
                            id="cu-last"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="cu-netid" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        BYU Net ID
                    </label>
                    <input
                        id="cu-netid"
                        value={byuNetId}
                        onChange={(e) => setByuNetId(e.target.value)}
                        placeholder="e.g. jsmith"
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="cu-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        @byu.edu email
                    </label>
                    <input
                        id="cu-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                        required
                    />
                </div>
                <PrimaryButton type="submit" isLoading={busy} className="w-full justify-center">
                    Create user
                </PrimaryButton>
            </form>
        </main>
    );
}
