import { NextRequest, NextResponse } from 'next/server';
import { verifyIdTokenFromAuthorizationHeader } from '@/backend/auth/verifyBearer';
import {
    isConfiguredAdminEmail,
    listUserProfiles,
    setUserCanUpload,
} from '@/backend/auth/userProfiles';
import { isByuEmail, normalizeEmail } from '@/lib/authShared';

async function requireAdmin(request: NextRequest) {
    const decoded = await verifyIdTokenFromAuthorizationHeader(request.headers.get('authorization'));
    const email = decoded.email;
    if (!email || !isByuEmail(email)) {
        throw new Error('FORBIDDEN');
    }
    if (!isConfiguredAdminEmail(normalizeEmail(email))) {
        throw new Error('FORBIDDEN');
    }
    if (!process.env.ADMIN_EMAIL?.trim()) {
        throw new Error('NO_ADMIN_CONFIGURED');
    }
    return decoded;
}

export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request);
        const users = await listUserProfiles();
        return NextResponse.json({ users });
    } catch (error) {
        const code = error instanceof Error ? error.message : '';
        if (code === 'FORBIDDEN') {
            return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });
        }
        if (code === 'NO_ADMIN_CONFIGURED') {
            return NextResponse.json({ error: 'ADMIN_EMAIL is not set on the server.' }, { status: 503 });
        }
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const adminDecoded = await requireAdmin(request);
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
        const code = error instanceof Error ? error.message : '';
        if (code === 'FORBIDDEN') {
            return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });
        }
        if (code === 'NO_ADMIN_CONFIGURED') {
            return NextResponse.json({ error: 'ADMIN_EMAIL is not set on the server.' }, { status: 503 });
        }
        const msg = error instanceof Error ? error.message : 'Update failed';
        if (/Cannot remove upload access/.test(msg)) {
            return NextResponse.json({ error: msg }, { status: 403 });
        }
        if (/not found/i.test(msg)) {
            return NextResponse.json({ error: msg }, { status: 404 });
        }
        if (/Missing Authorization|verify/i.test(msg)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
