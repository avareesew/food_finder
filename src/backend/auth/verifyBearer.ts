import * as admin from 'firebase-admin';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';

export async function verifyIdTokenFromAuthorizationHeader(
    authHeader: string | null
): Promise<admin.auth.DecodedIdToken> {
    const token =
        authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
    if (!token) {
        throw new Error('Missing Authorization bearer token.');
    }
    ensureFirebaseAdminInitialized();
    return admin.auth().verifyIdToken(token);
}
