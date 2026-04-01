import { NextResponse } from 'next/server';
import { getExtractionRecords, type StoredExtractionRecord } from '@/backend/local/eventsJsonStore';
import {
  coerceExtractedDateToYyyyMmDd,
  isCampusEventEnded,
  resolveCampusEventYyyyMmDd,
} from '@/lib/eventTiming';

function eventStartMs(date: string, startTime: string | null): number | null {
  const t = startTime && /^\d{2}:\d{2}$/.test(startTime) ? `${startTime}:00` : '00:00:00';
  const d = new Date(`${date}T${t}`);
  return Number.isNaN(d.getTime()) ? null : d.getTime();
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 3) || 3, 20);

    const records = await getExtractionRecords();

    const upcoming = records
      .map((r) => {
        const raw = r.event.date?.trim() ?? '';
        const coerced = coerceExtractedDateToYyyyMmDd(raw);
        if (!coerced) return null;
        const date = resolveCampusEventYyyyMmDd(coerced) ?? coerced;
        if (
          isCampusEventEnded({
            eventDate: date,
            endTime: r.event.endTime,
            startTime: r.event.startTime,
          })
        ) {
          return null;
        }
        const start = eventStartMs(date, r.event.startTime);
        if (start === null) return null;
        return { r, start };
      })
      .filter((x): x is { r: StoredExtractionRecord; start: number } => x != null)
      .sort((a, b) => a.start - b.start)
      .slice(0, limit)
      .map((x) => x.r);

    return NextResponse.json({ success: true, records: upcoming });
  } catch (error) {
    console.error('Local upcoming read error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read upcoming local events' },
      { status: 500 }
    );
  }
}
