import { promises as fs } from 'node:fs';
import path from 'node:path';

export type LocalEventRecord = {
  id: string;
  createdAtIso: string;
  imagePath: string; // local relative path under data/uploads
  extraction: {
    title: string | null;
    building: string | null;
    room: string | null;
    startIso: string | null;
    endIso: string | null;
    foodDescription: string | null;
    estimatedPortions: number | null;
    notes: string | null;
  };
  rawModelOutput: string;
};

const repoRoot = process.cwd();
const dataDir = path.join(repoRoot, 'data');
const uploadsDir = path.join(dataDir, 'uploads');
const eventsFile = path.join(dataDir, 'events.json');

async function ensureDirs() {
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(dataDir, { recursive: true });
}

export async function saveUpload(args: { filename: string; bytes: Uint8Array }) {
  await ensureDirs();
  const safe = args.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const stamped = `${Date.now()}_${safe || 'flyer'}`;
  const rel = path.join('data', 'uploads', stamped);
  const abs = path.join(repoRoot, rel);
  await fs.writeFile(abs, args.bytes);
  return { relPath: rel };
}

async function readEvents(): Promise<LocalEventRecord[]> {
  await ensureDirs();
  try {
    const text = await fs.readFile(eventsFile, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as LocalEventRecord[]) : [];
  } catch {
    // If missing or invalid, start fresh (MVP convenience)
    return [];
  }
}

async function writeEvents(events: LocalEventRecord[]) {
  await ensureDirs();
  await fs.writeFile(eventsFile, JSON.stringify(events, null, 2) + '\n', 'utf8');
}

export async function appendEvent(event: LocalEventRecord) {
  const events = await readEvents();
  events.push(event);
  await writeEvents(events);
  return event;
}

