import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import * as admin from 'firebase-admin';

/** Dynamic lookup so Next’s bundler does not inline missing `process.env.FOO` as undefined at build time. */
function readServerEnv(name: string): string | undefined {
  const v = process.env[name];
  return typeof v === 'string' && v.trim().length > 0 ? v.trim() : undefined;
}

/**
 * .env often wraps the key as a JSON string (`"{\"type\":...}"`), so the first parse yields a string.
 * `admin.credential.cert()` must receive an object — if given a string, it treats it as a filesystem path.
 */
function parseServiceAccountJson(raw: string, label: string): admin.ServiceAccount {
  const trimmed = raw.replace(/^\uFEFF/, '').trim();
  let data: unknown;
  try {
    data = JSON.parse(trimmed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `${label} is not valid JSON (${msg}). Use one line of minified JSON, or prefer FIREBASE_SERVICE_ACCOUNT_PATH to a .json file.`
    );
  }
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(
        `${label} was stored as a JSON string containing the key; inner JSON failed to parse (${msg}).`
      );
    }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${label} must decode to a JSON object (Firebase service account key).`);
  }
  return data as admin.ServiceAccount;
}

function loadServiceAccount(): admin.ServiceAccount {
  const pathEnv =
    readServerEnv('FIREBASE_SERVICE_ACCOUNT_PATH') || readServerEnv('GOOGLE_APPLICATION_CREDENTIALS');
  const b64 = readServerEnv('FIREBASE_SERVICE_ACCOUNT_JSON_BASE64');
  const inline = readServerEnv('FIREBASE_SERVICE_ACCOUNT_JSON');

  // Prefer a local JSON file when present — avoids Next sometimes omitting very long env values at runtime.
  if (pathEnv) {
    const resolved = path.isAbsolute(pathEnv) ? pathEnv : path.join(process.cwd(), pathEnv);
    if (existsSync(resolved)) {
      const file = readFileSync(resolved, 'utf8');
      return parseServiceAccountJson(file, `service account file ${pathEnv}`);
    }
  }

  // Base64 avoids Next.js/dotenv mangling: double-quoted FIREBASE_SERVICE_ACCOUNT_JSON values get
  // `\\n` → newline substitutions that break JSON (see @next/env + dotenv expand).
  if (b64) {
    const raw = Buffer.from(b64, 'base64').toString('utf8');
    return parseServiceAccountJson(raw, 'FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 (decoded)');
  }

  if (inline) {
    try {
      return parseServiceAccountJson(inline, 'FIREBASE_SERVICE_ACCOUNT_JSON');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(
        `${msg} ` +
          `Storing raw JSON in a double-quoted .env line often breaks under Next.js (\\n escapes in the key file). ` +
          `Use FIREBASE_SERVICE_ACCOUNT_PATH, or FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 (see env.example).`
      );
    }
  }

  throw new Error(
    'Set FIREBASE_SERVICE_ACCOUNT_PATH to a service account JSON file (e.g. .secrets/firebase-adminsdk.json), ' +
      'or FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 / FIREBASE_SERVICE_ACCOUNT_JSON. ' +
      'Firebase Console → Project settings → Service accounts → Generate new private key.'
  );
}

/**
 * GCS bucket names for the Admin SDK. New projects may use `*.firebasestorage.app`; older ones use
 * `project-id.appspot.com`. FIREBASE_STORAGE_BUCKET is tried first, then we always try the other
 * common names (do not stop after one wrong explicit env).
 */
function storageBucketCandidates(): string[] {
  const explicit = process.env.FIREBASE_STORAGE_BUCKET?.trim();
  const pub = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  const pid = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

  const candidates: string[] = [];
  const push = (name: string | undefined) => {
    if (name && !candidates.includes(name)) candidates.push(name);
  };

  push(explicit);
  push(pub);
  if (pid) {
    push(`${pid}.appspot.com`);
    push(`${pid}.firebasestorage.app`);
  }

  return candidates;
}

function initAdmin(): void {
  if (admin.apps.length > 0) return;

  const cred = loadServiceAccount();

  // Do not pass storageBucket here — we pass an explicit bucket name per request so we can retry candidates.
  admin.initializeApp({
    credential: admin.credential.cert(cred),
  });
}

/** Idempotent — use before Admin Storage or Firestore in API routes. */
export function ensureFirebaseAdminInitialized(): void {
  initAdmin();
}

/**
 * Upload bytes using the Firebase Admin SDK (server only).
 * Avoids browser CORS issues with firebasestorage.googleapis.com.
 */
export async function uploadBytesToStorage(args: {
  bytes: Uint8Array;
  storagePath: string;
  contentType: string;
}): Promise<{ downloadURL: string }> {
  initAdmin();

  const names = storageBucketCandidates();
  if (names.length === 0) {
    throw new Error(
      'Missing NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET or NEXT_PUBLIC_FIREBASE_PROJECT_ID for Storage bucket resolution.'
    );
  }

  let lastErr: unknown;
  for (const bucketName of names) {
    try {
      const bucket = admin.storage().bucket(bucketName);
      const file = bucket.file(args.storagePath);

      await file.save(Buffer.from(args.bytes), {
        metadata: { contentType: args.contentType },
        resumable: false,
      });

      const [downloadURL] = await file.getSignedUrl({
        action: 'read',
        expires: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000),
      });

      return { downloadURL };
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      if (/does not exist|No such bucket|not found|404/i.test(msg)) {
        continue;
      }
      throw e;
    }
  }

  const hint =
    `Tried buckets: ${names.join(', ')}. ` +
    `If none exist, open Firebase Console → Storage → Get started to create the default bucket. ` +
    `You can set FIREBASE_STORAGE_BUCKET to the exact name from Google Cloud → Cloud Storage → Buckets.`;

  throw lastErr instanceof Error
    ? new Error(`${lastErr.message} ${hint}`)
    : new Error(`Storage upload failed. ${hint}`);
}

/** Best-effort delete after a rejected upload (wrong bucket is skipped). */
export async function deleteStorageObjectAtPath(storagePath: string): Promise<void> {
  initAdmin();
  const names = storageBucketCandidates();
  for (const bucketName of names) {
    try {
      const file = admin.storage().bucket(bucketName).file(storagePath);
      const [exists] = await file.exists();
      if (exists) {
        await file.delete();
        return;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/No such object|not found|404/i.test(msg)) continue;
    }
  }
}
