import { NextRequest, NextResponse } from 'next/server';
import { verifyIdTokenFromAuthorizationHeader } from '@/backend/auth/verifyBearer';
import {
    getConfiguredAdminEmail,
    getProfileDoc,
    isConfiguredAdminEmail,
    userMayUploadFlyer,
} from '@/backend/auth/userProfiles';
import { isValidEmailFormat, normalizeEmail } from '@/lib/authShared';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
    try {
        const decoded = await verifyIdTokenFromAuthorizationHeader(request.headers.get('authorization'));
        const email = decoded.email;
        if (!email) {
            return NextResponse.json({ error: 'Signed-in account has no email' }, { status: 403 });
        }
        const normalized = normalizeEmail(email);
        if (!isValidEmailFormat(normalized)) {
            return NextResponse.json({ error: 'Invalid email on this account.' }, { status: 403 });
        }
        const isAdmin = isConfiguredAdminEmail(normalized);
        const mayUpload = await userMayUploadFlyer(decoded.uid, normalized);
        const profile = await getProfileDoc(decoded.uid);
        const tokenName = typeof decoded.name === 'string' && decoded.name.trim() ? decoded.name.trim() : null;
        const displayName = profile?.displayName ?? tokenName;
        return NextResponse.json({
            uid: decoded.uid,
            email: normalized,
            displayName,
            canUpload: mayUpload,
            isAdmin,
            adminEmailConfigured: Boolean(getConfiguredAdminEmail()),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unauthorized';
        logger.error('auth-me-error', { message });
        return NextResponse.json({ error: message }, { status: 401 });
    }
}
