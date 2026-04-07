import { NextRequest, NextResponse } from 'next/server';
import { processUploadedFlyer } from '@/backend/flyers/processUploadedFlyer';
import { logger } from '@/lib/logger';

function formatError(error: unknown): string {
  if (error instanceof Error) {
    const any = error as Error & { code?: string };
    if (typeof any.code === 'string' && any.message) {
      return `${any.code}: ${any.message}`;
    }
    return error.message;
  }
  return 'Unknown error';
}

/**
 * POST /api/upload/process
 * JSON: { downloadURL, storagePath, originalFilename, mimeType }
 *
 * Call after uploading the file to Firebase Storage from the browser.
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<{
      downloadURL: string;
      storagePath: string;
      originalFilename: string;
      mimeType: string;
    }>;

    if (!body.downloadURL || typeof body.downloadURL !== 'string') {
      return NextResponse.json({ error: 'downloadURL is required' }, { status: 400 });
    }
    if (!body.storagePath || typeof body.storagePath !== 'string') {
      return NextResponse.json({ error: 'storagePath is required' }, { status: 400 });
    }
    if (!body.originalFilename || typeof body.originalFilename !== 'string') {
      return NextResponse.json({ error: 'originalFilename is required' }, { status: 400 });
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
          event: result.event,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: 'firebase',
      flyerId: result.flyerId,
      downloadURL: result.downloadURL,
      event: result.event,
      rawModelOutput: result.rawModelOutput,
      extractionError: null,
      saved: { id: result.flyerId },
      message: 'Flyer stored in Firebase and extracted successfully.',
    });
  } catch (error) {
    logger.error('upload-process-error', { message: formatError(error) });
    const msg = formatError(error);
    const isMissingEnv = msg.startsWith('Missing required environment variable:');
    const firebaseHint =
      /permission-denied|Missing or insufficient permissions/i.test(msg)
        ? 'Check Firestore rules allow writes to the flyers collection.'
        : undefined;
    return NextResponse.json(
      {
        error: isMissingEnv ? msg : 'Processing failed',
        details: msg,
        hint: isMissingEnv
          ? 'Set OPENAI_API_KEY in .env.local for extraction.'
          : firebaseHint,
      },
      { status: isMissingEnv ? 400 : 500 }
    );
  }
}
