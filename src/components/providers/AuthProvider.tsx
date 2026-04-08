'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { normalizeEmail } from '@/lib/authShared';
import { logger } from '@/lib/logger';

export type AuthMe = {
    uid: string;
    email: string;
    displayName: string | null;
    canUpload: boolean;
    isAdmin: boolean;
    adminEmailConfigured: boolean;
};

type AuthContextValue = {
    firebaseConfigured: boolean;
    user: User | null;
    me: AuthMe | null;
    loading: boolean;
    sessionBanner: string | null;
    setSessionBanner: (message: string | null) => void;
    signInWithEmailPassword: (email: string, password: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function formatFirebaseAuthError(error: unknown): string {
    const code =
        error && typeof error === 'object' && 'code' in error ? String((error as { code: unknown }).code) : '';
    const message =
        error && typeof error === 'object' && 'message' in error
            ? String((error as { message: unknown }).message)
            : error instanceof Error
              ? error.message
              : 'Sign-in failed.';

    if (code === 'auth/operation-not-allowed') {
        return 'Email/password sign-in is not enabled. In Firebase Console → Authentication → Sign-in method, turn on Email/Password.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        return 'Incorrect email or password.';
    }
    if (code === 'auth/invalid-email') {
        return 'Invalid email address.';
    }
    if (code === 'auth/too-many-requests') {
        return 'Too many attempts. Try again later.';
    }
    if (code === 'auth/unauthorized-domain') {
        return 'This site URL is not allowed for Firebase Auth. Add it under Authentication → Settings → Authorized domains.';
    }
    if (code === 'auth/network-request-failed') {
        return 'Network error. Check your connection and try again.';
    }
    if (code === 'auth/invalid-api-key') {
        return 'Invalid Firebase API key. Check NEXT_PUBLIC_FIREBASE_API_KEY and restart the dev server.';
    }
    if (code) {
        return `${code.replace(/^auth\//, '')}: ${message}`;
    }
    return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const firebaseConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

    const [user, setUser] = useState<User | null>(null);
    const [me, setMe] = useState<AuthMe | null>(null);
    const [loading, setLoading] = useState(firebaseConfigured);
    const [sessionBanner, setSessionBanner] = useState<string | null>(null);

    const fetchMe = useCallback(async (u: User) => {
        const token = await u.getIdToken();
        const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
            setMe(null);
            return;
        }
        const data = (await res.json()) as AuthMe;
        setMe(data);
    }, []);

    const syncProfile = useCallback(async (u: User) => {
        const token = await u.getIdToken();
        const res = await fetch('/api/auth/sync-profile', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            const j = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(typeof j.error === 'string' ? j.error : 'Profile sync failed');
        }
    }, []);

    useEffect(() => {
        if (!firebaseConfigured) {
            setLoading(false);
            return;
        }

        const unsub = onAuthStateChanged(auth, async (u) => {
            setSessionBanner(null);
            if (!u) {
                setUser(null);
                setMe(null);
                setLoading(false);
                return;
            }
            setUser(u);
            setLoading(true);
            try {
                await syncProfile(u);
                await fetchMe(u);
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Could not finish sign-in.';
                logger.error('auth-state-sync-failed', { message: msg });
                setSessionBanner(msg);
                await firebaseSignOut(auth);
                setUser(null);
                setMe(null);
            } finally {
                setLoading(false);
            }
        });

        return () => {
            unsub();
        };
    }, [fetchMe, firebaseConfigured, syncProfile]);

    const signInWithEmailPassword = useCallback(async (email: string, password: string) => {
        setSessionBanner(null);
        try {
            await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
            return true;
        } catch (error: unknown) {
            const msg = formatFirebaseAuthError(error);
            logger.warn('auth-sign-in-failed', { message: msg });
            setSessionBanner(msg);
            return false;
        }
    }, []);

    const signOut = useCallback(async () => {
        await firebaseSignOut(auth);
    }, []);

    const refreshMe = useCallback(async () => {
        if (!user) return;
        await fetchMe(user);
    }, [fetchMe, user]);

    const value = useMemo<AuthContextValue>(
        () => ({
            firebaseConfigured,
            user,
            me,
            loading,
            sessionBanner,
            setSessionBanner,
            signInWithEmailPassword,
            signOut,
            refreshMe,
        }),
        [
            firebaseConfigured,
            user,
            me,
            loading,
            sessionBanner,
            signInWithEmailPassword,
            signOut,
            refreshMe,
        ]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}

/** True when flyer uploads hit /api/upload with Firebase Storage (server enforces ID token). */
export function useFlyerUploadRequiresAuth(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
}
