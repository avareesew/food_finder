import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createFlyer } from '@/services/flyers';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    logger.info('upload-request-start', {
        url: request.url,
        method: request.method,
    });
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            logger.warn('upload-no-file', { url: request.url });
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // 1. Upload to Firebase Storage
        const timestamp = Date.now();
        // Sanitize filename
        const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `flyers/${timestamp}_${safeFilename}`;
        const storageRef = ref(storage, storagePath);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const uploadResult = await uploadBytes(storageRef, buffer, {
            contentType: file.type,
        });

        const downloadURL = await getDownloadURL(uploadResult.ref);

        // 2. Create Firestore Record
        const flyerId = await createFlyer({
            originalFilename: file.name,
            storagePath: storagePath,
            downloadURL: downloadURL,
            status: 'uploaded',
            uploader: 'anonymous', // MVP
            // createdAt is handled by serverTimestamp() in the helper
        });

        logger.info('upload-success', {
            flyerId,
            storagePath,
            uploader: 'anonymous',
        });

        return NextResponse.json({
            success: true,
            flyerId,
            downloadURL,
            message: 'Upload successful'
        });

    } catch (error) {
        logger.error('upload-error', {
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        return NextResponse.json(
            { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
