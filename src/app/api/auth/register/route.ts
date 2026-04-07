import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';
import { getConfiguredAdminEmail, USER_PROFILES_COLLECTION } from '@/backend/auth/userProfiles';
import { isByuEmail, isValidByuNetId, normalizeByuNetId, normalizeEmail } from '@/lib/authShared';
import { logger } from '@/lib/logger';

const MIN_PASSWORD = 6;

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as {
            email?: unknown;
            password?: unknown;
            firstName?: unknown;
            lastName?: unknown;
            byuNetId?: unknown;
        };
        const emailRaw = typeof body.email === 'string' ? body.email : '';
        const password = typeof body.password === 'string' ? body.password : '';
        const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
        const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
        const byuNetId = normalizeByuNetId(typeof body.byuNetId === 'string' ? body.byuNetId : '');

        const email = normalizeEmail(emailRaw);
        if (!email || !isByuEmail(email)) {
            return NextResponse.json({ error: 'Use your @byu.edu email address.' }, { status: 400 });
        }
        if (firstName.length < 1) {
            return NextResponse.json({ error: 'First name is required.' }, { status: 400 });
        }
        if (lastName.length < 1) {
            return NextResponse.json({ error: 'Last name is required.' }, { status: 400 });
        }
        if (!isValidByuNetId(byuNetId)) {
            return NextResponse.json(
                {
                    error: 'BYU Net ID must be 2–32 letters or numbers only (no @).',
                },
                { status: 400 }
            );
        }
        if (password.length < MIN_PASSWORD) {
            return NextResponse.json(
                { error: `Password must be at least ${MIN_PASSWORD} characters.` },
                { status: 400 }
            );
        }

        ensureFirebaseAdminInitialized();
        const db = admin.firestore();

        const netIdTaken = await db
            .collection(USER_PROFILES_COLLECTION)
            .where('byuNetId', '==', byuNetId)
            .limit(1)
            .get();
        if (!netIdTaken.empty) {
            return NextResponse.json(
                { error: 'This BYU Net ID is already registered. Sign in or use a different account.' },
                { status: 409 }
            );
        }

        const displayName = `${firstName} ${lastName}`;
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName,
            emailVerified: false,
        });

        const adminEmail = getConfiguredAdminEmail();
        const isAdmin = Boolean(adminEmail && adminEmail === email);

        await db.collection(USER_PROFILES_COLLECTION).doc(userRecord.uid).set({
            email,
            firstName,
            lastName,
            byuNetId,
            displayName,
            canUpload: isAdmin,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        const code =
            error && typeof error === 'object' && 'code' in error
                ? String((error as { code: unknown }).code)
                : '';
        if (code === 'auth/email-already-exists') {
            return NextResponse.json(
                { error: 'An account with this email already exists. Sign in instead.' },
                { status: 409 }
            );
        }
        if (code === 'auth/invalid-email') {
            return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
        }
        if (code === 'auth/weak-password') {
            return NextResponse.json({ error: 'Password is too weak. Try a longer one.' }, { status: 400 });
        }
        logger.error('register-error', { message: error instanceof Error ? error.message : String(error) });
        return NextResponse.json({ error: 'Could not create account.' }, { status: 500 });
    }
}
