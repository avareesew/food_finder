'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { isByuEmail, normalizeEmail } from '@/lib/authShared';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function LoginPage() {
    const router = useRouter();
    const { firebaseConfigured, sessionBanner, signInWithEmailPassword, setSessionBanner } = useAuth();
    const [mode, setMode] = useState<'signin' | 'register'>('signin');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [byuNetId, setByuNetId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [busy, setBusy] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    if (!firebaseConfigured) {
        return (
            <main className="max-w-md mx-auto px-4 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
                <p className="text-gray-600 dark:text-gray-300">Firebase is not configured.</p>
            </main>
        );
    }

    const validateByu = (): boolean => {
        const norm = normalizeEmail(email);
        if (!isByuEmail(norm)) {
            setFormError('Use your @byu.edu email address.');
            return false;
        }
        return true;
    };

    const onSignIn = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSessionBanner(null);
        if (!validateByu()) return;
        setBusy(true);
        try {
            const ok = await signInWithEmailPassword(email, password);
            if (ok) router.push('/upload');
        } finally {
            setBusy(false);
        }
    };

    const onRegister = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSessionBanner(null);
        if (!firstName.trim()) {
            setFormError('Enter your first name.');
            return;
        }
        if (!lastName.trim()) {
            setFormError('Enter your last name.');
            return;
        }
        if (!byuNetId.trim()) {
            setFormError('Enter your BYU Net ID.');
            return;
        }
        if (!validateByu()) return;
        if (password.length < 6) {
            setFormError('Password must be at least 6 characters.');
            return;
        }
        setBusy(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    byuNetId: byuNetId.trim(),
                    email: normalizeEmail(email),
                    password,
                }),
            });
            const data = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) {
                setFormError(typeof data.error === 'string' ? data.error : 'Could not create account.');
                return;
            }
            const ok = await signInWithEmailPassword(email, password);
            if (ok) router.push('/upload');
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="max-w-md mx-auto px-4 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
                <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-50">
                    {mode === 'signin' ? 'Sign in' : 'Create account'}
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    School accounts only: email must end in <strong>@byu.edu</strong>. Passwords are stored by Firebase
                    Auth (hashed), not in plain text in Firestore.
                </p>

                <div className="mt-6 flex gap-2 rounded-full bg-gray-100 p-1 dark:bg-gray-800">
                    <button
                        type="button"
                        onClick={() => {
                            setMode('signin');
                            setFormError(null);
                            setSessionBanner(null);
                        }}
                        className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                            mode === 'signin'
                                ? 'bg-white text-gray-900 shadow dark:bg-gray-950 dark:text-gray-50'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        Sign in
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMode('register');
                            setFormError(null);
                            setSessionBanner(null);
                        }}
                        className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                            mode === 'register'
                                ? 'bg-white text-gray-900 shadow dark:bg-gray-950 dark:text-gray-50'
                                : 'text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        Create account
                    </button>
                </div>

                {mode === 'signin' ? (
                    <form onSubmit={onSignIn} className="mt-6 space-y-4">
                        <div>
                            <label
                                htmlFor="login-email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Email (@byu.edu)
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="login-password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Password
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                                required
                            />
                        </div>
                        {(formError || sessionBanner) && (
                            <p className="text-sm text-red-600 dark:text-red-400">{formError ?? sessionBanner}</p>
                        )}
                        <PrimaryButton type="submit" isLoading={busy} className="w-full justify-center">
                            Sign in
                        </PrimaryButton>
                    </form>
                ) : (
                    <form onSubmit={onRegister} className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="reg-first"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    First name
                                </label>
                                <input
                                    id="reg-first"
                                    type="text"
                                    autoComplete="given-name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="reg-last"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Last name
                                </label>
                                <input
                                    id="reg-last"
                                    type="text"
                                    autoComplete="family-name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="reg-netid"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                BYU Net ID
                            </label>
                            <input
                                id="reg-netid"
                                type="text"
                                autoComplete="username"
                                placeholder="e.g. jsmith"
                                value={byuNetId}
                                onChange={(e) => setByuNetId(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                                required
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Letters and numbers only, no @ (same ID you use for BYU login).
                            </p>
                        </div>
                        <div>
                            <label
                                htmlFor="reg-email"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Email (@byu.edu)
                            </label>
                            <input
                                id="reg-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                                required
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="reg-password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Password (min 6 characters)
                            </label>
                            <input
                                id="reg-password"
                                type="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                                required
                                minLength={6}
                            />
                        </div>
                        {(formError || sessionBanner) && (
                            <p className="text-sm text-red-600 dark:text-red-400">{formError ?? sessionBanner}</p>
                        )}
                        <PrimaryButton type="submit" isLoading={busy} className="w-full justify-center">
                            Create account
                        </PrimaryButton>
                    </form>
                )}

                <p className="mt-6 text-center text-sm">
                    <Link href="/" className="font-semibold text-brand-orange hover:underline">
                        ← Back home
                    </Link>
                </p>
            </div>
        </main>
    );
}
