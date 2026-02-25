import { NextRequest, NextResponse } from 'next/server';
import { extractEventFromFlyerWithOpenAI } from '@/backend/openai/extractEventFromFlyer';
import { appendExtractionRecord } from '@/backend/local/eventsJsonStore';
import { saveFlyerToPublicUploads } from '@/backend/local/publicUploads';

/**
 * Extraction-only MVP endpoint (does NOT store anything):
 *
 * POST /api/local/extract
 * Multipart form-data:
 * - file: flyer image
 *
 * Returns extracted event JSON.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Save the original flyer image locally so Discover can show the real flyer.
    const { publicUrl: imageUrl } = await saveFlyerToPublicUploads({
      originalFilename: file.name,
      bytes,
    });

    const { event, rawModelOutput } = await extractEventFromFlyerWithOpenAI({
      imageBytes: bytes,
      mimeType: file.type || 'image/jpeg',
      campusTimezone: 'America/Denver',
    });

    // Persist successful extractions for MVP testing (local dev only)
    const record = await appendExtractionRecord({
      id: `extract_${Date.now()}`,
      createdAtIso: new Date().toISOString(),
      source: {
        originalFilename: file.name,
        mimeType: file.type || 'image/jpeg',
        sizeBytes: bytes.byteLength,
      },
      imageUrl,
      event,
      rawModelOutput,
    });

    return NextResponse.json({ success: true, event, rawModelOutput, saved: { id: record.id } });
  } catch (error) {
    console.error('Local extract error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    const isMissingEnv = msg.startsWith('Missing required environment variable:');
    return NextResponse.json(
      {
        error: isMissingEnv ? msg : 'Local extract failed',
        details: msg,
        hint: isMissingEnv ? 'Create .env.local and set OPENAI_API_KEY.' : undefined,
      },
      { status: isMissingEnv ? 400 : 500 }
    );
  }
}

