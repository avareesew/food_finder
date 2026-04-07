'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { isValidEmailFormat, normalizeEmail } from '@/lib/authShared';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function LoginPage() {
    const router = useRouter();
    const { firebaseConfigured, sessionBanner, signInWithEmailPassword, setSessionBanner } = useAuth();
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

    const validateEmail = (): boolean => {
        const norm = normalizeEmail(email);
        if (!isValidEmailFormat(norm)) {
            setFormError('Enter a valid email address.');
            return false;
        }
        return true;
    };

    const onSignIn = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSessionBanner(null);
        if (!validateEmail()) return;
        setBusy(true);
        try {
            const ok = await signInWithEmailPassword(email, password);
            if (ok) router.push('/upload');
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="max-w-md mx-auto px-4 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
                <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-50">Sign in</h1>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-gray-600 dark:text-gray-400">
                    <li>
                        <strong className="text-gray-800 dark:text-gray-200">Sign in:</strong> use the email and
                        password for your account (any domain).
                    </li>
                    <li>
                        <strong className="text-gray-800 dark:text-gray-200">New account:</strong> an administrator
                        creates accounts from the admin console and sends you a password setup link — there is no
                        self-registration on this page.
                    </li>
                </ul>

                <form onSubmit={onSignIn} className="mt-6 space-y-4">
                    <div>
                        <label
                            htmlFor="login-email"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Email
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

                <p className="mt-6 text-center text-sm">
                    <Link href="/" className="font-semibold text-brand-orange hover:underline">
                        ← Back home
                    </Link>
                </p>
            </div>
        </main>
    );
}
