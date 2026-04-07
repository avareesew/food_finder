import { NextResponse } from 'next/server';
import { getExtractionRecords } from '@/backend/local/eventsJsonStore';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const records = await getExtractionRecords();
    // newest first (ISO strings sort correctly lexicographically)
    records.sort((a, b) => (b.createdAtIso || '').localeCompare(a.createdAtIso || ''));
    return NextResponse.json({ success: true, records });
  } catch (error) {
    logger.error('local-events-read-error', { message: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { success: false, error: 'Failed to read local events' },
      { status: 500 }
    );
  }
}

