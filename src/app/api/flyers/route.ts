import { NextRequest, NextResponse } from 'next/server';
import { uploadFlyer } from '@/backend/flyers/uploadFlyer';

/**
 * POST /api/flyers
 * Multipart form-data:
 * - file: File
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const { flyerId, downloadURL, storagePath } = await uploadFlyer({ file });

    return NextResponse.json({
      success: true,
      flyerId,
      downloadURL,
      storagePath,
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

