import { NextRequest, NextResponse } from 'next/server';
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

type CreateEventRequest = {
  title: string;
  building?: string | null;
  room?: string | null;
  startIso: string;
  endIso?: string | null;
  timezone?: string | null;
  foodDescription?: string | null;
  estimatedPortions?: number | null;
  flyerId?: string | null;
  extractionId?: string | null;
};

function toDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * POST /api/events
 * Create a published event (feed + calendar source of truth).
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CreateEventRequest>;

    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    if (!body.startIso || typeof body.startIso !== 'string') {
      return NextResponse.json({ error: 'startIso is required' }, { status: 400 });
    }

    const startAt = toDate(body.startIso);
    if (!startAt) {
      return NextResponse.json({ error: 'startIso must be a valid ISO date-time' }, { status: 400 });
    }

    const endAt = body.endIso ? toDate(body.endIso) : null;
    if (body.endIso && !endAt) {
      return NextResponse.json({ error: 'endIso must be a valid ISO date-time' }, { status: 400 });
    }
    if (endAt && endAt.getTime() < startAt.getTime()) {
      return NextResponse.json({ error: 'endIso must be after startIso' }, { status: 400 });
    }

    const docRef = await addDoc(collection(db, 'events'), {
      title: body.title,
      location: {
        building: body.building ?? null,
        room: body.room ?? null,
      },
      startAt: Timestamp.fromDate(startAt),
      endAt: endAt ? Timestamp.fromDate(endAt) : null,
      timezone: body.timezone ?? 'America/Denver',
      food: {
        description: body.foodDescription ?? null,
        estimatedPortions: body.estimatedPortions ?? null,
      },
      source: {
        flyerId: body.flyerId ?? null,
        extractionId: body.extractionId ?? null,
        method: body.extractionId ? 'ai+confirm' : 'manual',
      },
      status: 'scheduled',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true, eventId: docRef.id });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Create event failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/events?from=ISO&to=ISO
 * List events for calendar/feed ranges.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const now = new Date();
    const from = fromParam ? toDate(fromParam) : now;
    const to = toParam ? toDate(toParam) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (!from) return NextResponse.json({ error: 'from must be a valid ISO date-time' }, { status: 400 });
    if (!to) return NextResponse.json({ error: 'to must be a valid ISO date-time' }, { status: 400 });

    const q = query(
      collection(db, 'events'),
      where('startAt', '>=', Timestamp.fromDate(from)),
      where('startAt', '<=', Timestamp.fromDate(to)),
      orderBy('startAt', 'asc')
    );

    const snap = await getDocs(q);
    const events = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error('List events error:', error);
    return NextResponse.json(
      { error: 'List events failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

