/**
 * One-time script to patch the CPG Sales event with demo fields:
 *   - extractedEvent.clubSignupLink
 *   - extractedEvent.participationExpectations
 *
 * Usage: npx tsx scripts/seed-demo-fields.ts
 */

import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import * as admin from 'firebase-admin';
import { ensureFirebaseAdminInitialized } from '../src/backend/flyers/storageAdminUpload';

async function main() {
  ensureFirebaseAdminInitialized();
  const db = admin.firestore();

  // Find the CPG Sales event
  const snap = await db.collection('flyers').get();
  const match = snap.docs.find((doc) => {
    const title: unknown = doc.data()?.extractedEvent?.title;
    return typeof title === 'string' && title.toLowerCase().includes('cpg sales');
  });

  if (!match) {
    console.error('No flyer found with title containing "CPG Sales". Recent docs:');
    snap.docs.slice(-5).forEach((d) => {
      const t = d.data()?.extractedEvent?.title ?? '(no title)';
      console.log(`  ${d.id} — ${t}`);
    });
    process.exit(1);
  }

  console.log(`Found CPG Sales event: ${match.id} — "${match.data().extractedEvent?.title}"`);

  await match.ref.update({
    'extractedEvent.clubSignupLink': 'https://www.byusalessociety.com/',
    'extractedEvent.participationExpectations': 'Stay and be attentive for the whole event',
  });

  console.log('Updated clubSignupLink and participationExpectations.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
