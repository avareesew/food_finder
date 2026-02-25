import { NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import { promises as fs } from 'fs';

const ALLOWED_HOSTS = new Set(['images.unsplash.com', 'source.unsplash.com']);

function extFromContentType(contentType: string | null): string {
  const ct = (contentType ?? '').toLowerCase();
  if (ct.includes('image/png')) return 'png';
  if (ct.includes('image/webp')) return 'webp';
  if (ct.includes('image/gif')) return 'gif';
  if (ct.includes('image/jpeg') || ct.includes('image/jpg')) return 'jpg';
  return 'jpg';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: unknown };
    const url = typeof body.url === 'string' ? body.url : null;
    if (!url) {
      return NextResponse.json({ success: false, error: 'Missing url' }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid url' }, { status: 400 });
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return NextResponse.json({ success: false, error: 'Invalid url protocol' }, { status: 400 });
    }

    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      return NextResponse.json(
        { success: false, error: `Host not allowed: ${parsed.hostname}` },
        { status: 400 }
      );
    }

    const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(publicUploadsDir, { recursive: true });

    const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 16);

    // If we already cached this URL with some extension, reuse it.
    const existing = await fs.readdir(publicUploadsDir);
    const found = existing.find((f) => f.startsWith(`remote_${hash}.`));
    if (found) {
      return NextResponse.json({ success: true, localUrl: `/uploads/${found}`, cached: true });
    }

    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch image: ${res.status}` },
        { status: 502 }
      );
    }

    const ext = extFromContentType(res.headers.get('content-type'));
    const filename = `remote_${hash}.${ext}`;
    const destPath = path.join(publicUploadsDir, filename);
    const bytes = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(destPath, bytes);

    return NextResponse.json({ success: true, localUrl: `/uploads/${filename}`, cached: false });
  } catch (error) {
    console.error('Local cache-image error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cache image' },
      { status: 500 }
    );
  }
}

