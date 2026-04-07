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
        logger.info('admin-users-list-start');
        const users = await listUserProfiles();
        logger.info('admin-users-list-success', { count: users.length });
        return NextResponse.json({ users });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'List users failed';
        if (
            message &&
            message !== 'FORBIDDEN' &&
            message !== 'NO_ADMIN_CONFIGURED' &&
            !/Missing Authorization|bearer token/i.test(message)
        ) {
            logger.error('admin-users-list-failure', { message });
        }
        return respondAdminRouteError(error, {
            route: 'admin-users',
            method: 'GET',
            skipUnexpectedErrorLog: true,
        });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const adminDecoded = await requireAdminSession(request);
        const body = (await request.json()) as { uid?: unknown; canUpload?: unknown };
        const uid = typeof body.uid === 'string' ? body.uid.trim() : '';
        logger.info('admin-users-update-start', { adminUid: adminDecoded.uid, targetUid: uid || 'missing' });
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
        logger.info('admin-users-update-success', { adminUid: adminDecoded.uid, targetUid: uid, canUpload: body.canUpload });
        return NextResponse.json({ ok: true });
    } catch (error) {
        const msg = error instanceof Error ? error.message : '';
        if (/Cannot remove upload access/.test(msg)) {
            logger.warn('admin-users-update-blocked', { message: msg });
            return NextResponse.json({ error: msg }, { status: 403 });
        }
        if (/not found/i.test(msg)) {
            logger.warn('admin-users-update-missing', { message: msg });
            return NextResponse.json({ error: msg }, { status: 404 });
        }
        if (
            msg &&
            msg !== 'FORBIDDEN' &&
            msg !== 'NO_ADMIN_CONFIGURED' &&
            !/Missing Authorization|bearer token/i.test(msg)
        ) {
            logger.error('admin-users-update-failure', { message: msg });
        }
        return respondAdminRouteError(error, {
            route: 'admin-users',
            method: 'PATCH',
            skipUnexpectedErrorLog: true,
        });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const adminDecoded = await requireAdminSession(request);
        const url = new URL(request.url);
        const uid = url.searchParams.get('uid')?.trim() ?? '';
        logger.info('admin-users-delete-start', { adminUid: adminDecoded.uid, targetUid: uid || 'missing' });
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
                logger.info('admin-users-delete-success', { adminUid: adminDecoded.uid, targetUid: uid, authUserMissing: true });
                return NextResponse.json({
                    ok: true,
                    note: 'Auth user was already gone; profile cleaned up if present.',
                });
            }
            throw e;
        }
        await admin.auth().deleteUser(uid);
        await deleteUserProfileDoc(uid).catch(() => {});
        logger.info('admin-users-delete-success', { adminUid: adminDecoded.uid, targetUid: uid, authUserMissing: false });
        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Delete user failed';
        if (
            message &&
            message !== 'FORBIDDEN' &&
            message !== 'NO_ADMIN_CONFIGURED' &&
            !/Missing Authorization|bearer token/i.test(message)
        ) {
            logger.error('admin-users-delete-failure', { message });
        }
        return respondAdminRouteError(error, {
            route: 'admin-users',
            method: 'DELETE',
            skipUnexpectedErrorLog: true,
        });
    }
}
