'use client';

import { Suspense, useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import PrimaryButton from '@/components/ui/PrimaryButton';

const MIN_PASSWORD_LEN = 6;

function AuthActionContent() {
    const searchParams = useSearchParams();
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    const firebaseConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

    const [linkPhase, setLinkPhase] = useState<'pending' | 'invalid' | 'expired' | 'ready'>('pending');
    const [accountEmail, setAccountEmail] = useState<string | null>(null);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!firebaseConfigured) return;
        if (mode !== 'resetPassword' || !oobCode) {
            setLinkPhase('invalid');
            return;
        }
        let cancelled = false;
        void verifyPasswordResetCode(auth, oobCode)
            .then((email) => {
                if (cancelled) return;
                setAccountEmail(email);
                setLinkPhase('ready');
            })
            .catch(() => {
                if (cancelled) return;
                setLinkPhase('expired');
            });
        return () => {
            cancelled = true;
        };
    }, [firebaseConfigured, mode, oobCode]);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!oobCode || mode !== 'resetPassword') return;

        if (password.length < MIN_PASSWORD_LEN) {
            setFormError(`Password must be at least ${MIN_PASSWORD_LEN} characters.`);
            return;
        }
        if (password !== confirmPassword) {
            setFormError('Passwords do not match. Enter the same password twice.');
            return;
        }

        setBusy(true);
        try {
            await confirmPasswordReset(auth, oobCode, password);
            setSuccess(true);
        } catch (err: unknown) {
            const code =
                err && typeof err === 'object' && 'code' in err ? String((err as { code: unknown }).code) : '';
            if (code === 'auth/weak-password') {
                setFormError('That password is too weak. Try a longer or more complex password.');
            } else if (code === 'auth/expired-action-code' || code === 'auth/invalid-action-code') {
                setFormError('This link is no longer valid. Request a new password setup link.');
            } else {
                setFormError('Could not update your password. Try again or use a new link.');
            }
        } finally {
            setBusy(false);
        }
    };

    if (!firebaseConfigured) {
        return (
            <main className="max-w-md mx-auto px-4 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
                <p className="text-gray-600 dark:text-gray-300">Firebase is not configured.</p>
            </main>
        );
    }

    if (linkPhase === 'pending') {
        return (
            <main className="max-w-md mx-auto px-4 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <BrandMark centered />
                    <p className="mt-6 text-sm text-gray-600 dark:text-gray-300">Checking your link…</p>
                </div>
            </main>
        );
    }

    if (linkPhase === 'invalid') {
        return (
            <main className="max-w-md mx-auto px-4 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
                    <BrandMark />
                    <h1 className="mt-6 text-xl font-serif font-bold text-gray-900 dark:text-gray-50">Invalid link</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Open the full link from your email, or go to sign in if you already have a password.
                    </p>
                    <p className="mt-6">
                        <Link href="/login" className="font-semibold text-brand-orange hover:underline">
                            Sign in →
                        </Link>
                    </p>
                </div>
            </main>
        );
    }

    if (linkPhase === 'expired') {
        return (
            <main className="max-w-md mx-auto px-4 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
                    <BrandMark />
                    <h1 className="mt-6 text-xl font-serif font-bold text-gray-900 dark:text-gray-50">Link expired</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        This link is invalid or has expired. Ask an admin for a new password setup link, or try again
                        from sign-in if password reset is available.
                    </p>
                    <p className="mt-6">
                        <Link href="/login" className="font-semibold text-brand-orange hover:underline">
                            Back to sign in →
                        </Link>
                    </p>
                </div>
            </main>
        );
    }

    if (success) {
        return (
            <main className="max-w-md mx-auto px-4 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm dark:border-green-900 dark:bg-green-950/30 sm:p-8">
                    <BrandMark />
                    <h1 className="mt-6 text-xl font-serif font-bold text-green-950 dark:text-green-50">
                        Password updated
                    </h1>
                    <p className="mt-2 text-sm text-green-900 dark:text-green-100">
                        You can sign in with your email and new password.
                    </p>
                    <p className="mt-6">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center rounded-full bg-[#FF5A1F] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-md mx-auto px-4 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
                <BrandMark />
                <h1 className="mt-6 text-2xl font-serif font-bold text-gray-900 dark:text-gray-50">
                    Set your password
                </h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Campus Food Finder — choose a password for your account
                    {accountEmail ? (
                        <>
                            {' '}
                            <span className="block mt-1 font-medium text-gray-800 dark:text-gray-200">{accountEmail}</span>
                        </>
                    ) : null}
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div>
                        <label
                            htmlFor="reset-password"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            New password
                        </label>
                        <input
                            id="reset-password"
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                            required
                            minLength={MIN_PASSWORD_LEN}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="reset-password-confirm"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Confirm new password
                        </label>
                        <input
                            id="reset-password-confirm"
                            type="password"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-50"
                            required
                            minLength={MIN_PASSWORD_LEN}
                        />
                    </div>
                    {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
                    <PrimaryButton type="submit" isLoading={busy} className="w-full justify-center">
                        Save password
                    </PrimaryButton>
                </form>

                <p className="mt-6 text-center text-sm">
                    <Link href="/" className="font-semibold text-brand-orange hover:underline">
                        ← Home
                    </Link>
                    <span className="mx-2 text-gray-300 dark:text-gray-600">·</span>
                    <Link href="/login" className="font-semibold text-brand-orange hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}

function BrandMark({ centered }: { centered?: boolean }) {
    return (
        <div className={centered ? 'flex justify-center' : ''}>
            <Link href="/" className="inline-flex flex-col gap-1">
                <span className="text-2xl font-serif font-black tracking-tight text-gray-900 dark:text-gray-50">
                    Scavenger<span className="text-brand-orange">.</span>
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Campus Food Finder
                </span>
            </Link>
        </div>
    );
}

export default function AuthActionPage() {
    return (
        <Suspense
            fallback={
                <main className="max-w-md mx-auto px-4 py-12 pt-28 sm:pt-32 bg-brand-canvas min-h-screen dark:bg-gray-950">
                    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Loading…</p>
                    </div>
                </main>
            }
        >
            <AuthActionContent />
        </Suspense>
    );
}
