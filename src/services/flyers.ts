import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    limit,
    getDocs,
    getDoc,
    doc,
    Timestamp
} from 'firebase/firestore';
import { logger } from '@/lib/logger';
import type { ExtractedEvent } from '@/backend/openai/extractEventFromFlyer';

/** Firestore Timestamp or JSON from GET /api/flyers (plain { seconds, nanoseconds }). */
export type FlyerCreatedAt = Timestamp | { seconds: number; nanoseconds?: number };

export interface Flyer {
    id?: string;
    createdAt: FlyerCreatedAt;
    originalFilename: string;
    storagePath: string;
    downloadURL: string;
    status: string;
    uploader?: string;
    extractedEvent?: ExtractedEvent | null;
    rawModelOutput?: string | null;
    extractionError?: string | null;
    /** Present when this row was ingested from Slack */
    slackTeamId?: string;
    slackChannelId?: string;
    slackFileId?: string;
    slackWorkspaceName?: string;
    slackWorkspaceLabel?: string;
    slackMessageTs?: string;
    /** No image — e.g. Slack text ingest */
    sourceType?: 'flyer' | 'slack_text';
}

const FLYERS_COLLECTION = 'flyers';

/**
 * Creates a new flyer record in Firestore
 */
export async function createFlyer(data: Omit<Flyer, 'id' | 'createdAt'>) {
    try {
        logger.info('create-flyer-start', {
            originalFilename: data.originalFilename,
        });
        // Firestore rejects `undefined` anywhere in the document; JSON round-trip drops undefined keys.
        const sanitized = JSON.parse(JSON.stringify(data)) as Omit<Flyer, 'id' | 'createdAt'>;
        const docRef = await addDoc(collection(db, FLYERS_COLLECTION), {
            ...sanitized,
            createdAt: serverTimestamp(),
        });
        logger.info('create-flyer-success', {
            flyerId: docRef.id,
        });
        return docRef.id;
    } catch (error) {
        logger.error('create-flyer-failure', {
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
    }
}

/**
 * Fetches recent flyers. In `firebase` mode the browser uses GET /api/flyers (Admin SDK) so
 * Firestore security rules can stay locked down. Local / server still uses the client SDK where needed.
 */
export async function getRecentFlyers(limitCount = 10) {
    try {
        logger.info('get-recent-flyers-start', { limitCount });

        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_MODE === 'firebase') {
            const res = await fetch(`/api/flyers?limit=${limitCount}`);
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(
                    typeof body.details === 'string' ? body.details : `HTTP ${res.status}`
                );
            }
            const json = (await res.json()) as { flyers?: Flyer[] };
            return Array.isArray(json.flyers) ? json.flyers : [];
        }

        const q = query(
            collection(db, FLYERS_COLLECTION),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Flyer[];
    } catch (error) {
        logger.error('get-recent-flyers-failure', {
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
    }
}

/**
 * Fetches a single flyer by ID (supports mock IDs)
 */
export async function getFlyer(id: string): Promise<Flyer | null> {
    // Mock Data Handler
    if (id.startsWith('mock-')) {
        const mockData: Record<string, Flyer> = {
            'mock-1': {
                id: 'mock-1',
                originalFilename: 'Free Pizza @ TMCB',
                status: 'available',
                downloadURL: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
                createdAt: Timestamp.now(),
                storagePath: ''
            },
            'mock-2': {
                id: 'mock-2',
                originalFilename: 'Bagels in JFSB Lobby',
                status: 'gone',
                downloadURL: 'https://images.unsplash.com/photo-1585478684894-a366c82f44da?auto=format&fit=crop&w=800&q=80',
                createdAt: Timestamp.fromMillis(Date.now() - 3600000),
                storagePath: ''
            },
            'mock-3': {
                id: 'mock-3',
                originalFilename: 'Leftover Catering - WSC 3220',
                status: 'available',
                downloadURL: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
                createdAt: Timestamp.fromMillis(Date.now() - 7200000),
                storagePath: ''
            }
        };
        return mockData[id] || null;
    }

    try {
        logger.info('get-flyer-start', { id });

        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BACKEND_MODE === 'firebase') {
            const res = await fetch(`/api/flyers/${encodeURIComponent(id)}`);
            if (res.status === 404) {
                logger.warn('get-flyer-missing', { id });
                return null;
            }
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(
                    typeof body.details === 'string' ? body.details : `HTTP ${res.status}`
                );
            }
            const json = (await res.json()) as { flyer?: Flyer };
            if (json.flyer) {
                logger.info('get-flyer-success', { id });
                return json.flyer;
            }
            return null;
        }

        const docRef = doc(db, FLYERS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            logger.info('get-flyer-success', { id });
            return { id: docSnap.id, ...docSnap.data() } as Flyer;
        }
        logger.warn('get-flyer-missing', { id });
        return null;
    } catch (error) {
        logger.error('get-flyer-failure', {
            message: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
    }
}
