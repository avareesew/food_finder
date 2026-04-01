import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { processUploadedFlyer } from '@/backend/flyers/processUploadedFlyer';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';
import { flyerDocToClientJson } from '@/backend/flyers/flyerDocToJson';

/**
 * GET /api/flyers?limit=20
 * Recent flyers via Admin SDK (works with locked-down Firestore rules; no client read required).
 */
export async function GET(request: NextRequest) {
  try {
    ensureFirebaseAdminInitialized();
    const limitParam = request.nextUrl.searchParams.get('limit');
    const limitCount = Math.min(100, Math.max(1, parseInt(limitParam || '20', 10) || 20));

    const snap = await admin
      .firestore()
      .collection('flyers')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    const flyers = snap.docs.map((d) => flyerDocToClientJson(d.id, d.data()));
    return NextResponse.json({ flyers });
  } catch (error) {
    console.error('GET /api/flyers:', error);
    return NextResponse.json(
      { error: 'Failed to load flyers', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/flyers
 * JSON body (after client uploads to Firebase Storage):
 * { downloadURL, storagePath, originalFilename, mimeType? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<{
      downloadURL: string;
      storagePath: string;
      originalFilename: string;
      mimeType: string;
    }>;

    if (!body.downloadURL || !body.storagePath || !body.originalFilename) {
      return NextResponse.json(
        { error: 'downloadURL, storagePath, and originalFilename are required' },
        { status: 400 }
      );
    }

    const result = await processUploadedFlyer({
      downloadURL: body.downloadURL,
      storagePath: body.storagePath,
      originalFilename: body.originalFilename,
      mimeType: typeof body.mimeType === 'string' ? body.mimeType : 'image/jpeg',
    });

    if (!result.flyerId) {
      return NextResponse.json(
        {
          error: 'Flyer not saved',
          details: result.rejectedReason ?? 'Missing required event details.',
          missing: result.missingFields,
          validationFailed: true,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      flyerId: result.flyerId,
      downloadURL: result.downloadURL,
      storagePath: result.storagePath,
      message: 'Upload successful',
    });
  } catch (error) {
    console.error('Flyer upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
