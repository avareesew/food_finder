import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { saveUpload, appendEvent } from '@/backend/local/eventsStore';
import { extractFlyerWithOpenAI } from '@/backend/openai/extractFlyer';
import { processUploadedFlyer } from '@/backend/flyers/processUploadedFlyer';
import { uploadBytesToStorage } from '@/backend/flyers/storageAdminUpload';
import { validateOpenAIExtractionRequired } from '@/lib/validateFlyerExtraction';
import { verifyIdTokenFromAuthorizationHeader } from '@/backend/auth/verifyBearer';
import { userMayUploadFlyer } from '@/backend/auth/userProfiles';
import { isValidEmailFormat, normalizeEmail } from '@/lib/authShared';
import { logger } from '@/lib/logger';

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

        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const firebaseBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        logger.info('upload-start', { filename: file.name, mode: firebaseBucket ? 'firebase' : 'local' });

        /**
         * Firebase: multipart to this API → Admin SDK uploads to Storage (no browser CORS),
         * then extraction + Firestore on the server.
         */
        if (firebaseBucket) {
            let uid: string;
            let emailNorm: string;
            try {
                const decoded = await verifyIdTokenFromAuthorizationHeader(
                    request.headers.get('authorization')
                );
                const email = decoded.email;
                if (!email) {
                    return NextResponse.json(
                        { error: 'Sign in with an email-based account to upload.' },
                        { status: 403 }
                    );
                }
                const normalized = normalizeEmail(email);
                if (!isValidEmailFormat(normalized)) {
                    return NextResponse.json({ error: 'Invalid email on this account.' }, { status: 403 });
                }
                emailNorm = normalized;
                uid = decoded.uid;
                const allowed = await userMayUploadFlyer(uid, emailNorm);
                if (!allowed) {
                    return NextResponse.json(
                        {
                            error: 'Upload not enabled for your account yet.',
                            hint: 'Ask the site admin to turn on flyer upload for your email.',
                        },
                        { status: 403 }
                    );
                }
            } catch {
                return NextResponse.json(
                    {
                        error: 'Sign in required',
                        hint: 'Sign in at /login, then try again.',
                    },
                    { status: 401 }
                );
            }

            const timestamp = Date.now();
            const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const storagePath = `flyers/${timestamp}_${safeFilename || 'flyer'}`;

            const { downloadURL } = await uploadBytesToStorage({
                bytes,
                storagePath,
                contentType: file.type || 'application/octet-stream',
            });

            const result = await processUploadedFlyer({
                downloadURL,
                storagePath,
                originalFilename: file.name,
                mimeType: file.type || 'image/jpeg',
                imageBytes: bytes,
            });

            if (!result.flyerId) {
                return NextResponse.json(
                    {
                        error: 'Flyer not saved',
                        details: result.rejectedReason ?? 'Missing required event details.',
                        missing: result.missingFields,
                        validationFailed: true,
                        event: result.event,
                    },
                    { status: 422 }
                );
            }

            return NextResponse.json({
                success: true,
                mode: 'firebase',
                flyerId: result.flyerId,
                downloadURL: result.downloadURL,
                event: result.event,
                rawModelOutput: result.rawModelOutput,
                extractionError: null,
                saved: { id: result.flyerId },
                message: 'Flyer stored in Firebase and extracted successfully.',
            });
        }

        const { relPath } = await saveUpload({ filename: file.name, bytes });
        const { extraction, rawModelOutput } = await extractFlyerWithOpenAI({
            imageBytes: bytes,
            mimeType: file.type || 'image/jpeg',
            campusTimezone: 'America/Denver',
        });

        const openAiVal = validateOpenAIExtractionRequired(extraction);
        if (!openAiVal.ok) {
            await unlink(path.join(process.cwd(), relPath)).catch(() => {});
            return NextResponse.json(
                {
                    error: 'Flyer not saved',
                    details: openAiVal.message,
                    missing: openAiVal.missing,
                    validationFailed: true,
                },
                { status: 422 }
            );
        }

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
    } catch (error) {
        const msg = formatUploadError(error);
        logger.error('upload-error', { message: msg });
        const isMissingEnv = msg.startsWith('Missing required environment variable:') || msg.startsWith('Missing ');
        const firebaseHint =
            /permission-denied|Missing or insufficient permissions/i.test(msg)
                ? 'Check Firestore rules for the flyers collection.'
                : /FIREBASE_SERVICE_ACCOUNT_JSON|service account/i.test(msg)
                  ? 'Add FIREBASE_SERVICE_ACCOUNT_JSON to .env.local (JSON key from Firebase Console → Project settings → Service accounts).'
                  : undefined;
        return NextResponse.json(
            {
                error: isMissingEnv ? msg : 'Upload failed',
                details: msg,
                hint: firebaseHint,
            },
            { status: isMissingEnv ? 400 : 500 }
        );
    }
}

function formatUploadError(error: unknown): string {
    if (error instanceof Error) {
        const any = error as Error & { code?: string };
        if (typeof any.code === 'string' && any.message) {
            return `${any.code}: ${any.message}`;
        }
        return error.message;
    }
    return 'Unknown error';
}
