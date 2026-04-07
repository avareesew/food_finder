import * as admin from 'firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import {
    deleteUserProfileDoc,
    getConfiguredAdminEmail,
    getProfileDoc,
    isConfiguredAdminEmail,
    listUserProfiles,
    setUserCanUpload,
} from '@/backend/auth/userProfiles';
import { requireAdminSession, respondAdminRouteError } from '@/backend/auth/requireAdmin';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';
import { normalizeEmail } from '@/lib/authShared';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
    try {
        await requireAdminSession(request);
        const users = await listUserProfiles();
        return NextResponse.json({ users });
    } catch (error) {
        const code = error instanceof Error ? error.message : '';
        if (code === 'FORBIDDEN') {
            logger.warn('admin-users-forbidden', { method: 'GET' });
        } else if (code && code !== 'NO_ADMIN_CONFIGURED' && !/Missing Authorization|bearer token/i.test(code)) {
            logger.error('admin-users-error', { method: 'GET', message: code });
        }
        return respondAdminRouteError(error);
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const adminDecoded = await requireAdminSession(request);
        const body = (await request.json()) as { uid?: unknown; canUpload?: unknown };
        const uid = typeof body.uid === 'string' ? body.uid.trim() : '';
        if (!uid || uid === adminDecoded.uid) {
            return NextResponse.json(
                { error: 'Invalid target user, or use another way to change your own access.' },
                { status: 400 }
            );
        }
        if (typeof body.canUpload !== 'boolean') {
            return NextResponse.json({ error: 'canUpload boolean required' }, { status: 400 });
        }
        await setUserCanUpload(uid, body.canUpload);
        return NextResponse.json({ ok: true });
    } catch (error) {
        const msg = error instanceof Error ? error.message : '';
        if (msg === 'FORBIDDEN') {
            logger.warn('admin-users-forbidden', { method: 'PATCH' });
        }
        if (/Cannot remove upload access/.test(msg)) {
            return NextResponse.json({ error: msg }, { status: 403 });
        }
        if (/not found/i.test(msg)) {
            return NextResponse.json({ error: msg }, { status: 404 });
        }
        if (
            msg &&
            msg !== 'FORBIDDEN' &&
            msg !== 'NO_ADMIN_CONFIGURED' &&
            !/Missing Authorization|bearer token/i.test(msg)
        ) {
            logger.error('admin-users-patch-error', { message: msg });
        }
        return respondAdminRouteError(error);
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const adminDecoded = await requireAdminSession(request);
        const url = new URL(request.url);
        const uid = url.searchParams.get('uid')?.trim() ?? '';
        if (!uid || uid === adminDecoded.uid) {
            return NextResponse.json({ error: 'Invalid user id.' }, { status: 400 });
        }
        const adminEmail = getConfiguredAdminEmail();
        const target = await getProfileDoc(uid);
        const targetEmail = target?.email ? normalizeEmail(target.email) : '';
        if (adminEmail && targetEmail && isConfiguredAdminEmail(targetEmail)) {
            return NextResponse.json({ error: 'Cannot delete the admin account.' }, { status: 403 });
        }
        ensureFirebaseAdminInitialized();
        try {
            await admin.auth().getUser(uid);
        } catch (e: unknown) {
            const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code) : '';
            if (code === 'auth/user-not-found') {
                await deleteUserProfileDoc(uid).catch(() => {});
                return NextResponse.json({
                    ok: true,
                    note: 'Auth user was already gone; profile cleaned up if present.',
                });
            }
            throw e;
        }
        await admin.auth().deleteUser(uid);
        await deleteUserProfileDoc(uid).catch(() => {});
        return NextResponse.json({ ok: true });
    } catch (error) {
        return respondAdminRouteError(error);
    }
}
