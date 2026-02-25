import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { extractFlyerFromImageBytes } from '@/backend/gemini/extractFlyer';

/**
 * POST /api/flyers/:flyerId/extract
 *
 * Reads the stored flyer (Firestore), fetches the image bytes (via downloadURL),
 * runs Gemini extraction, stores an extraction record, and updates the flyer.
 */
export async function POST(_request: NextRequest, context: { params: { flyerId: string } }) {
  try {
    const { flyerId } = context.params;

    const flyerRef = doc(db, 'flyers', flyerId);
    const flyerSnap = await getDoc(flyerRef);
    if (!flyerSnap.exists()) {
      return NextResponse.json({ error: 'Flyer not found' }, { status: 404 });
    }

    const flyer = flyerSnap.data() as Record<string, unknown>;
    const downloadURL = typeof flyer.downloadURL === 'string' ? flyer.downloadURL : undefined;
    if (!downloadURL) {
      return NextResponse.json({ error: 'Flyer has no downloadURL' }, { status: 400 });
    }

    // Mark extracting (best-effort)
    await updateDoc(flyerRef, { status: 'extracting', updatedAt: serverTimestamp() }).catch(() => {});

    const imgRes = await fetch(downloadURL);
    if (!imgRes.ok) {
      return NextResponse.json({ error: `Failed to fetch flyer image (${imgRes.status})` }, { status: 502 });
    }

    const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await imgRes.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);

    const { extraction, rawText } = await extractFlyerFromImageBytes({
      imageBytes,
      mimeType,
      campusTimezone: 'America/Denver',
    });

    const extractionRef = await addDoc(collection(db, 'extractions'), {
      flyerId,
      model: 'gemini-2.0-flash',
      campusTimezone: 'America/Denver',
      extraction,
      rawText,
      createdAt: serverTimestamp(),
    });

    await updateDoc(flyerRef, {
      status: 'extracted',
      lastExtractionId: extractionRef.id,
      extractedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      flyerId,
      extractionId: extractionRef.id,
      extraction,
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json(
      { error: 'Extraction failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

