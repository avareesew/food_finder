import { NextRequest, NextResponse } from 'next/server';
import { uploadFlyer } from '@/backend/flyers/uploadFlyer';
import { saveUpload, appendEvent } from '@/backend/local/eventsStore';
import { extractFlyerWithOpenAI } from '@/backend/openai/extractFlyer';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        /**
         * Local-first fallback:
         * If Firebase Storage isn't configured (no bucket), use local disk + OpenAI extraction.
         *
         * This keeps the existing UI working even before Firebase is set up.
         */
        const firebaseBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!firebaseBucket) {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);

            const { relPath } = await saveUpload({ filename: file.name, bytes });
            const { extraction, rawModelOutput } = await extractFlyerWithOpenAI({
                imageBytes: bytes,
                mimeType: file.type || 'image/jpeg',
                campusTimezone: 'America/Denver',
            });

            const record = await appendEvent({
                id: `local_${Date.now()}`,
                createdAtIso: new Date().toISOString(),
                imagePath: relPath,
                extraction,
                rawModelOutput,
            });

            return NextResponse.json({
                success: true,
                mode: 'local',
                record,
                message: 'Flyer processed and saved to data/events.json',
            });
        }

        const { flyerId, downloadURL } = await uploadFlyer({ file });

        return NextResponse.json({
            success: true,
            mode: 'firebase',
            flyerId,
            downloadURL,
            message: 'Upload successful'
        });

    } catch (error) {
        console.error('Upload error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        const isMissingEnv = msg.startsWith('Missing required environment variable:');
        return NextResponse.json(
            {
                error: isMissingEnv ? msg : 'Upload failed',
                details: msg,
                hint: isMissingEnv
                    ? 'Create .env.local and set OPENAI_API_KEY (for local mode) or NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (for firebase mode).'
                    : undefined
            },
            { status: isMissingEnv ? 400 : 500 }
        );
    }
}
