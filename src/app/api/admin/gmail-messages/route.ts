import { NextRequest, NextResponse } from 'next/server';

import { listGmailInboxPreviews } from '@/backend/gmail/listGmailInboxPreviews';
import { requireAdminSession, respondAdminRouteError } from '@/backend/auth/requireAdmin';
import { logger } from '@/lib/logger';

export const maxDuration = 60;

export async function GET(request: NextRequest) {
    try {
        await requireAdminSession(request);
    } catch (error) {
        return respondAdminRouteError(error);
    }

    try {
        const result = await listGmailInboxPreviews();
        if (!result.ok) {
            logger.warn('admin-gmail-messages-config', { reason: result.reason });
            return NextResponse.json(
                { ok: false, error: result.message, reason: result.reason },
                { status: result.reason === 'missing_oauth' ? 503 : 400 }
            );
        }
        return NextResponse.json({ ok: true, query: result.query, maxResults: result.maxResults, messages: result.messages });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to list Gmail messages';
        logger.error('admin-gmail-messages-error', { message: msg });
        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}
