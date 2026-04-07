import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type * as admin from 'firebase-admin';

import { verifyIdTokenFromAuthorizationHeader } from '@/backend/auth/verifyBearer';
import { getConfiguredAdminEmail, isConfiguredAdminEmail } from '@/backend/auth/userProfiles';
import { normalizeEmail } from '@/lib/authShared';
import { logger } from '@/lib/logger';

type AdminRouteLogContext = {
    route: string;
    method: string;
    details?: Record<string, unknown>;
    skipUnexpectedErrorLog?: boolean;
};

function buildLogDetails(context?: AdminRouteLogContext, extra?: Record<string, unknown>): Record<string, unknown> {
    return {
        route: context?.route,
        method: context?.method,
        ...(context?.details ?? {}),
        ...(extra ?? {}),
    };
}

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

export function respondAdminRouteError(error: unknown, context?: AdminRouteLogContext): NextResponse {
    const code = error instanceof Error ? error.message : '';
    if (code === 'FORBIDDEN') {
        logger.warn('admin-route-forbidden', buildLogDetails(context));
        return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });
    }
    if (code === 'NO_ADMIN_CONFIGURED') {
        logger.error('admin-route-misconfigured', buildLogDetails(context));
        return NextResponse.json({ error: 'ADMIN_EMAIL is not set on the server.' }, { status: 503 });
    }
    const msg = error instanceof Error ? error.message : 'Unauthorized';
    if (/Missing Authorization|bearer token/i.test(msg)) {
        logger.warn('admin-route-unauthorized', buildLogDetails(context, { message: msg }));
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!context?.skipUnexpectedErrorLog) {
        logger.error('admin-route-error', buildLogDetails(context, { message: msg }));
    }
    return NextResponse.json({ error: msg }, { status: 400 });
}
