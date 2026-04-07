import { NextRequest, NextResponse } from 'next/server';

import { runGmailIngest } from '@/backend/gmail/runGmailIngest';
import { logger } from '@/lib/logger';

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
    logger.warn('gmail-ingest-route-unauthorized', { method: request.method });
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    logger.info('gmail-ingest-route-start', { method: request.method });
    const summary = await runGmailIngest();
    logger.info('gmail-ingest-route-success', {
      method: request.method,
      ok: summary.ok,
      disabled: summary.disabled === true,
      messagesListed: summary.messagesListed,
      imagesIngested: summary.imagesIngested,
      textEventsIngested: summary.textEventsIngested,
      failed: summary.failed,
    });
    return NextResponse.json(summary);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Gmail ingest failed';
    logger.error('gmail-ingest-route-failure', { method: request.method, message: msg });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
