import { NextRequest, NextResponse } from 'next/server';

import { requireAdminSession, respondAdminRouteError } from '@/backend/auth/requireAdmin';
import { clearGmailIngestMarksForMessages, runGmailIngest } from '@/backend/gmail/runGmailIngest';
import { logger } from '@/lib/logger';

/** Same work as Vercel cron; use for manual “sync inbox now” from an admin client. */
export const maxDuration = 60;

type AdminGmailIngestBody = {
    /** When true, response includes `adminDebug` per message (plain preview, outcomes). Admin-only. */
    includeDebug?: boolean;
    /** Clear ingest marks for these Gmail message ids so the next run processes them again. */
    unmarkMessageIds?: unknown;
};

export async function POST(request: NextRequest) {
    try {
        await requireAdminSession(request);
    } catch (error) {
        return respondAdminRouteError(error);
    }

    let includeDebug = false;
    let unmarkIds: string[] = [];
    try {
        const ct = request.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
            const body = (await request.json().catch(() => ({}))) as AdminGmailIngestBody;
            if (body?.includeDebug === true) {
                includeDebug = true;
            }
            if (Array.isArray(body?.unmarkMessageIds)) {
                unmarkIds = body.unmarkMessageIds.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
            }
        }
    } catch {
        /* empty or invalid JSON body — default options */
    }

    try {
        if (unmarkIds.length > 0) {
            await clearGmailIngestMarksForMessages(unmarkIds);
            logger.info('admin-gmail-ingest-unmark', { count: unmarkIds.length });
        }
        const summary = await runGmailIngest({ adminDebug: includeDebug });
        logger.info('admin-gmail-ingest', {
            imagesIngested: summary.imagesIngested,
            textEventsIngested: summary.textEventsIngested,
            textEventsSkippedDuplicate: summary.textEventsSkippedDuplicate,
            gmailDocumentsUploaded: summary.gmailDocumentsUploaded,
            skippedAlreadyProcessed: summary.skippedAlreadyProcessed,
            failed: summary.failed,
            includeDebug,
        });
        return NextResponse.json(summary);
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Gmail ingest failed';
        logger.error('admin-gmail-ingest-error', { message: msg });
        return NextResponse.json({ ok: false, error: msg }, { status: 500 });
    }
}
