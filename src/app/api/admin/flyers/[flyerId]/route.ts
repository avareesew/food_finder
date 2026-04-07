import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

import { requireAdminSession, respondAdminRouteError } from '@/backend/auth/requireAdmin';
import { deleteStorageObjectAtPath, ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ flyerId: string }> }
): Promise<NextResponse> {
    try {
        await requireAdminSession(request);
        const { flyerId } = await context.params;
        const id = typeof flyerId === 'string' ? flyerId.trim() : '';
        if (!id) {
            return NextResponse.json({ error: 'Missing flyer id.' }, { status: 400 });
        }

        ensureFirebaseAdminInitialized();
        const ref = admin.firestore().collection('flyers').doc(id);
        const doc = await ref.get();
        if (!doc.exists) {
            return NextResponse.json({ error: 'Flyer not found.' }, { status: 404 });
        }
        const data = doc.data() as { storagePath?: string; downloadURL?: string };
        const storagePath = typeof data.storagePath === 'string' ? data.storagePath.trim() : '';
        if (storagePath && storagePath.length > 0) {
            await deleteStorageObjectAtPath(storagePath).catch(() => {});
        }
        await ref.delete();
        return NextResponse.json({ ok: true });
    } catch (error) {
        return respondAdminRouteError(error);
    }
}
