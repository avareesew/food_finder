import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

import { requireAdminSession, respondAdminRouteError } from '@/backend/auth/requireAdmin';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';
import { logger } from '@/lib/logger';

export type AdminFlyerListItem = {
    id: string;
    originalFilename: string;
    status: string;
    storagePath: string;
    /** Signed Storage URL when the flyer has an image; empty for text-only ingests. */
    downloadURL: string;
    title: string | null;
    date: string | null;
    createdAtMs: number | null;
};

export async function GET(request: NextRequest) {
    try {
        await requireAdminSession(request);
        ensureFirebaseAdminInitialized();
        const limitRaw = new URL(request.url).searchParams.get('limit');
        const limit = Math.min(200, Math.max(1, Number.parseInt(limitRaw || '80', 10) || 80));
        logger.info('admin-flyers-list-start', { limit });
        const snap = await admin
            .firestore()
            .collection('flyers')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        const items: AdminFlyerListItem[] = [];
        snap.forEach((docSnap) => {
            const d = docSnap.data() as {
                originalFilename?: string;
                status?: string;
                storagePath?: string;
                downloadURL?: string;
                extractedEvent?: { title?: string | null; date?: string | null };
                createdAt?: { toMillis?: () => number };
            };
            const createdAt = d.createdAt?.toMillis?.() ?? null;
            const downloadURL = typeof d.downloadURL === 'string' ? d.downloadURL.trim() : '';
            items.push({
                id: docSnap.id,
                originalFilename: typeof d.originalFilename === 'string' ? d.originalFilename : '',
                status: typeof d.status === 'string' ? d.status : '',
                storagePath: typeof d.storagePath === 'string' ? d.storagePath : '',
                downloadURL,
                title: typeof d.extractedEvent?.title === 'string' ? d.extractedEvent.title : null,
                date: typeof d.extractedEvent?.date === 'string' ? d.extractedEvent.date : null,
                createdAtMs: typeof createdAt === 'number' ? createdAt : null,
            });
        });

        logger.info('admin-flyers-list-success', { count: items.length, limit });
        return NextResponse.json({ flyers: items });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Flyer list failed';
        if (
            message &&
            message !== 'FORBIDDEN' &&
            message !== 'NO_ADMIN_CONFIGURED' &&
            !/Missing Authorization|bearer token/i.test(message)
        ) {
            logger.error('admin-flyers-list-failure', { message });
        }
        return respondAdminRouteError(error, {
            route: 'admin-flyers',
            method: 'GET',
            skipUnexpectedErrorLog: true,
        });
    }
}
