import { NextRequest, NextResponse } from 'next/server';
import { verifyIdTokenFromAuthorizationHeader } from '@/backend/auth/verifyBearer';
import { syncUserProfileFromIdToken } from '@/backend/auth/userProfiles';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const decoded = await verifyIdTokenFromAuthorizationHeader(request.headers.get('authorization'));
        await syncUserProfileFromIdToken(decoded);
        return NextResponse.json({ ok: true });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Sync failed';
        logger.error('sync-profile-error', { message });
        if (/byu\.edu|email address|Only @byu|admin account/i.test(message)) {
            return NextResponse.json({ error: message }, { status: 403 });
        }
        if (/Missing Authorization|verify/i.test(message)) {
            return NextResponse.json({ error: message }, { status: 401 });
        }
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
