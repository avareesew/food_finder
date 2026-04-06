'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

type UploadAuthGateProps = {
    /** Page heading + intro — only shown when the user may use upload (local mode or signed in). */
    hero: React.ReactNode;
    children: React.ReactNode;
};

/**
 * When Firebase is configured, the upload UI (and hero) is shown only after sign-in.
 * Guests see a single sign-in prompt instead of the upload form.
 * Local-only setups (no Firebase web config) skip this gate so `/upload` still works without auth.
 */
export default function UploadAuthGate({ hero, children }: UploadAuthGateProps) {
    const { firebaseConfigured, user, loading } = useAuth();

    if (!firebaseConfigured) {
        return (
            <>
                {hero}
                {children}
            </>
        );
    }

    if (loading) {
        return (
            <>
                {hero}
                <div className="max-w-3xl mx-auto px-1 sm:px-0">
                    <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Checking your account…</p>
                    </div>
                </div>
            </>
        );
    }

    if (!user) {
        return (
            <div className="max-w-3xl mx-auto px-1 sm:px-0">
                <div className="rounded-2xl border border-gray-100 bg-white p-8 sm:p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-50">Upload a Flyer</h2>
                    <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto dark:text-gray-300">
                        Sign in to upload and manage flyers. Use your <strong>@byu.edu</strong> email and password.
                    </p>
                    <Link
                        href="/login"
                        className="mt-6 inline-flex items-center justify-center rounded-full bg-[#FF5A1F] px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-orange-600 transition-colors ring-1 ring-brand-orange/20"
                    >
                        Go to sign in
                    </Link>
                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                        After you sign in, return here or use <strong>Upload Flyer</strong> in the header.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            {hero}
            {children}
        </>
    );
}
