import { randomBytes } from 'node:crypto';

import * as admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

import { requireAdminSession, respondAdminRouteError } from '@/backend/auth/requireAdmin';
import { USER_PROFILES_COLLECTION } from '@/backend/auth/userProfiles';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';
import { rewritePasswordResetLinkToHostedApp } from '@/lib/firebaseEmailActionLinks';
import { isByuEduEmail, isValidByuNetId, isValidEmailFormat, normalizeByuNetId, normalizeEmail } from '@/lib/authShared';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const adminDecoded = await requireAdminSession(request);
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
        const emailNorm = normalizeEmail(emailRaw);

        logger.info('admin-create-user-start', {
            adminUid: adminDecoded.uid,
            email: emailNorm || emailRaw,
            byuNetId: byuNetIdRaw,
        });

        if (!firstName || !lastName) {
            return NextResponse.json({ error: 'First and last name are required.' }, { status: 400 });
        }
        if (!emailNorm || !isValidEmailFormat(emailNorm)) {
            return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
        }
        if (!isByuEduEmail(emailNorm)) {
            return NextResponse.json(
                { error: 'New accounts must use a @byu.edu email address.' },
                { status: 400 }
            );
        }
        if (!byuNetIdRaw) {
            return NextResponse.json({ error: 'BYU Net ID is required.' }, { status: 400 });
        }

        ensureFirebaseAdminInitialized();

        const netNorm = normalizeByuNetId(byuNetIdRaw);
        if (!isValidByuNetId(netNorm)) {
            return NextResponse.json(
                { error: 'BYU Net ID must be 2–32 letters or numbers only (no @).' },
                { status: 400 }
            );
        }
        const netSnap = await admin
            .firestore()
            .collection(USER_PROFILES_COLLECTION)
            .where('byuNetId', '==', netNorm)
            .limit(1)
            .get();
        if (!netSnap.empty) {
            return NextResponse.json({ error: 'That BYU Net ID is already used by another profile.' }, { status: 409 });
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

        const rawResetLink = await admin.auth().generatePasswordResetLink(emailNorm);
        const passwordResetLink = rewritePasswordResetLinkToHostedApp(rawResetLink);

        const ref = admin.firestore().collection(USER_PROFILES_COLLECTION).doc(userRecord.uid);
        const profileDoc: Record<string, unknown> = {
            email: emailNorm,
            displayName,
            firstName,
            lastName,
            byuNetId: netNorm,
            canUpload: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await ref.set(profileDoc, { merge: true });

        logger.info('admin-create-user-success', {
            adminUid: adminDecoded.uid,
            createdUid: userRecord.uid,
            email: emailNorm,
            byuNetId: netNorm,
        });

        return NextResponse.json({
            ok: true,
            uid: userRecord.uid,
            email: emailNorm,
            passwordResetLink,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Create user failed';
        if (
            message &&
            message !== 'FORBIDDEN' &&
            message !== 'NO_ADMIN_CONFIGURED' &&
            !/Missing Authorization|bearer token/i.test(message)
        ) {
            logger.error('admin-create-user-failure', { message });
        }
        return respondAdminRouteError(error, {
            route: 'admin-create-user',
            method: 'POST',
            skipUnexpectedErrorLog: true,
        });
    }
}
