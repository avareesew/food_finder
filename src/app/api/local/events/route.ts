import { NextResponse } from 'next/server';
import { getExtractionRecords } from '@/backend/local/eventsJsonStore';

export async function GET() {
  try {
    const records = await getExtractionRecords();
    // newest first (ISO strings sort correctly lexicographically)
    records.sort((a, b) => (b.createdAtIso || '').localeCompare(a.createdAtIso || ''));
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Local events read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read local events' },
      { status: 500 }
    );
  }
}

