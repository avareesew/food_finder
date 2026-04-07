import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type * as admin from 'firebase-admin';

import { verifyIdTokenFromAuthorizationHeader } from '@/backend/auth/verifyBearer';
import { getConfiguredAdminEmail, isConfiguredAdminEmail } from '@/backend/auth/userProfiles';
import { normalizeEmail } from '@/lib/authShared';

export async function requireAdminSession(request: NextRequest): Promise<admin.auth.DecodedIdToken> {
    const decoded = await verifyIdTokenFromAuthorizationHeader(request.headers.get('authorization'));
    const email = decoded.email;
    if (!email) {
        throw new Error('FORBIDDEN');
    }
    if (!getConfiguredAdminEmail()) {
        throw new Error('NO_ADMIN_CONFIGURED');
    }
    if (!isConfiguredAdminEmail(normalizeEmail(email))) {
        throw new Error('FORBIDDEN');
    }
    return decoded;
}

export function respondAdminRouteError(error: unknown): NextResponse {
    const code = error instanceof Error ? error.message : '';
    if (code === 'FORBIDDEN') {
        return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });
    }
    if (code === 'NO_ADMIN_CONFIGURED') {
        return NextResponse.json({ error: 'ADMIN_EMAIL is not set on the server.' }, { status: 503 });
    }
    const msg = error instanceof Error ? error.message : 'Unauthorized';
    if (/Missing Authorization|bearer token/i.test(msg)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
}
