import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';
import { flyerDocToClientJson } from '@/backend/flyers/flyerDocToJson';
import { logger } from '@/lib/logger';

/**
 * GET /api/flyers/:flyerId — single flyer for event detail (Admin SDK).
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ flyerId: string }> }
) {
  try {
    const { flyerId } = await context.params;
    if (!flyerId) {
      return NextResponse.json({ error: 'Missing flyer id' }, { status: 400 });
    }

    ensureFirebaseAdminInitialized();
    const docRef = await admin.firestore().collection('flyers').doc(flyerId).get();
    if (!docRef.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ flyer: flyerDocToClientJson(docRef.id, docRef.data()!) });
  } catch (error) {
    logger.error('get-flyer-by-id-error', { flyerId: 'unknown', message: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: 'Failed to load flyer', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
