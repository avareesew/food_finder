import { NextResponse } from 'next/server';
import { getExtractionRecords } from '@/backend/local/eventsJsonStore';

function toLocalDate(date: string | null, time?: string | null): Date | null {
  if (!date) return null;
  const t = time && /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : '00:00:00';
  const d = new Date(`${date}T${t}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 3) || 3, 20);

    const records = await getExtractionRecords();
    const now = Date.now();

    const upcoming = records
      .map((r) => {
        const start = toLocalDate(r.event.date, r.event.startTime)?.getTime() ?? null;
        return { r, start };
      })
      .filter((x) => x.start !== null)
      .filter((x) => (x.start as number) >= now)
      .sort((a, b) => (a.start as number) - (b.start as number))
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

