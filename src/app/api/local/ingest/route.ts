import { NextRequest, NextResponse } from 'next/server';
import { appendEvent, saveUpload } from '@/backend/local/eventsStore';
import { extractFlyerWithOpenAI } from '@/backend/openai/extractFlyer';

/**
 * Local-first MVP endpoint (NOT for production/serverless persistence):
 *
 * POST /api/local/ingest
 * Multipart form-data:
 * - file: flyer image
 *
 * Saves the image under `data/uploads/` and appends an extracted record to `data/events.json`.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // 1) Save image locally
    const { relPath } = await saveUpload({ filename: file.name, bytes });

    // 2) Extract with ChatGPT (OpenAI vision)
    const { extraction, rawModelOutput } = await extractFlyerWithOpenAI({
      imageBytes: bytes,
      mimeType: file.type || 'image/jpeg',
      campusTimezone: 'America/Denver',
    });

    // 3) Append to data/events.json
    const record = await appendEvent({
      id: `local_${Date.now()}`,
      createdAtIso: new Date().toISOString(),
      imagePath: relPath,
      extraction,
      rawModelOutput,
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Local ingest error:', error);
    return NextResponse.json(
      { error: 'Local ingest failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

