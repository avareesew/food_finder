import { NextRequest, NextResponse } from 'next/server';

import { runGmailIngest } from '@/backend/gmail/runGmailIngest';

export const maxDuration = 60;

function authorizeCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV === 'development';
  }
  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  const q = request.nextUrl.searchParams.get('secret');
  return q === secret;
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

async function handle(request: NextRequest) {
  if (!authorizeCron(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const summary = await runGmailIngest();
    return NextResponse.json(summary);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gmail ingest failed';
    console.error('[gmail-ingest]', e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
