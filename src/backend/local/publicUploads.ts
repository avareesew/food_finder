import { promises as fs } from 'node:fs';
import path from 'node:path';

function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export async function saveFlyerToPublicUploads(args: {
  originalFilename: string;
  bytes: Uint8Array;
}): Promise<{ publicUrl: string; relativePath: string }> {
  const repoRoot = process.cwd();
  const uploadsDir = path.join(repoRoot, 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const safe = safeFilename(args.originalFilename || 'flyer');
  const filename = `${Date.now()}_${safe}`;
  const relativePath = path.join('public', 'uploads', filename);
  const absPath = path.join(repoRoot, relativePath);
  await fs.writeFile(absPath, args.bytes);

  return { publicUrl: `/uploads/${filename}`, relativePath };
}

