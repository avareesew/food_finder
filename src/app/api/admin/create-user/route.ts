import { randomBytes } from 'node:crypto';

import * as admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

import { requireAdminSession, respondAdminRouteError } from '@/backend/auth/requireAdmin';
import { USER_PROFILES_COLLECTION } from '@/backend/auth/userProfiles';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';
import { isByuEmail, isValidByuNetId, normalizeByuNetId, normalizeEmail } from '@/lib/authShared';

export async function POST(request: NextRequest) {
    try {
        await requireAdminSession(request);
        const body = (await request.json()) as {
            firstName?: unknown;
            lastName?: unknown;
            byuNetId?: unknown;
            email?: unknown;
        };
        const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : '';
        const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : '';
        const byuNetIdRaw = typeof body.byuNetId === 'string' ? body.byuNetId.trim() : '';
        const emailRaw = typeof body.email === 'string' ? body.email.trim() : '';
        if (!firstName || !lastName) {
            return NextResponse.json({ error: 'First and last name are required.' }, { status: 400 });
        }
        const netNorm = normalizeByuNetId(byuNetIdRaw);
        if (!isValidByuNetId(netNorm)) {
            return NextResponse.json({ error: 'Enter a valid BYU Net ID (letters and numbers only).' }, { status: 400 });
        }
        const emailNorm = normalizeEmail(emailRaw);
        if (!emailNorm || !isByuEmail(emailNorm)) {
            return NextResponse.json({ error: 'Email must be a @byu.edu address.' }, { status: 400 });
        }

        ensureFirebaseAdminInitialized();
        const netSnap = await admin
            .firestore()
            .collection(USER_PROFILES_COLLECTION)
            .where('byuNetId', '==', netNorm)
            .limit(1)
            .get();
        if (!netSnap.empty) {
            return NextResponse.json(
                { error: 'This BYU Net ID is already used by another profile.' },
                { status: 409 }
            );
        }

        try {
            await admin.auth().getUserByEmail(emailNorm);
            return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
        } catch (e: unknown) {
            const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code) : '';
            if (code !== 'auth/user-not-found') {
                throw e;
            }
        }

        const tempPassword = randomBytes(24).toString('base64url');
        const displayName = `${firstName} ${lastName}`.trim();
        const userRecord = await admin.auth().createUser({
            email: emailNorm,
            password: tempPassword,
            displayName,
            emailVerified: false,
        });

        const passwordResetLink = await admin.auth().generatePasswordResetLink(emailNorm);

        const ref = admin.firestore().collection(USER_PROFILES_COLLECTION).doc(userRecord.uid);
        await ref.set(
            {
                email: emailNorm,
                displayName,
                firstName,
                lastName,
                byuNetId: netNorm,
                canUpload: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
        );

        return NextResponse.json({
            ok: true,
            uid: userRecord.uid,
            email: emailNorm,
            passwordResetLink,
        });
    } catch (error) {
        return respondAdminRouteError(error);
    }
}
