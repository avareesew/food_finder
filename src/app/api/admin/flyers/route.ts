import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

import { requireAdminSession, respondAdminRouteError } from '@/backend/auth/requireAdmin';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';

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
    /** Set for Slack / Gmail ingests so admin can verify automated sources. */
    sourceType: string | null;
};

export async function GET(request: NextRequest) {
    try {
        await requireAdminSession(request);
        ensureFirebaseAdminInitialized();
        const limitRaw = new URL(request.url).searchParams.get('limit');
        const limit = Math.min(200, Math.max(1, Number.parseInt(limitRaw || '80', 10) || 80));
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
                sourceType?: string;
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
                sourceType: typeof d.sourceType === 'string' && d.sourceType.trim() ? d.sourceType.trim() : null,
            });
        });

        return NextResponse.json({ flyers: items });
    } catch (error) {
        return respondAdminRouteError(error);
    }
}
