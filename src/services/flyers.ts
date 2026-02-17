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

export interface Flyer {
    id?: string;
    createdAt: Timestamp;
    originalFilename: string;
    storagePath: string;
    downloadURL: string;
    status: string;
    uploader?: string;
}

const FLYERS_COLLECTION = 'flyers';

/**
 * Creates a new flyer record in Firestore
 */
export async function createFlyer(data: Omit<Flyer, 'id' | 'createdAt'>) {
    try {
        const docRef = await addDoc(collection(db, FLYERS_COLLECTION), {
            ...data,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding flyer document:', error);
        throw error;
    }
}

/**
 * Fetches recent flyers from Firestore
 */
export async function getRecentFlyers(limitCount = 10) {
    try {
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
        console.error('Error fetching flyers:', error);
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

    // Real Firestore Data
    try {
        const docRef = doc(db, FLYERS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Flyer;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching flyer:', error);
        throw error;
    }
}
