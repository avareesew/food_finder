import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { ExtractedEvent } from '@/backend/openai/extractEventFromFlyer';

export type StoredExtractionRecord = {
  id: string;
  createdAtIso: string;
  source: {
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
  };
  imageUrl?: string | null;
  event: ExtractedEvent;
  rawModelOutput: string;
};

const repoRoot = process.cwd();
const dataDir = path.join(repoRoot, 'data');
const eventsFile = path.join(dataDir, 'events.json');

async function ensureDataDir() {
  await fs.mkdir(dataDir, { recursive: true });
}

async function readJsonArray<T>(): Promise<T[]> {
  await ensureDataDir();
  try {
    const text = await fs.readFile(eventsFile, 'utf8');
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

async function writeJsonArray<T>(items: T[]) {
  await ensureDataDir();
  await fs.writeFile(eventsFile, JSON.stringify(items, null, 2) + '\n', 'utf8');
}

export async function appendExtractionRecord(record: StoredExtractionRecord) {
  const items = await readJsonArray<StoredExtractionRecord>();
  items.push(record);
  await writeJsonArray(items);
  return record;
}

export async function getExtractionRecords() {
  return await readJsonArray<StoredExtractionRecord>();
}

// Alias export (helps avoid any bundler export analysis weirdness)
export { getExtractionRecords as listExtractionRecords };
