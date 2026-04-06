import * as admin from 'firebase-admin';
import { ensureFirebaseAdminInitialized } from '@/backend/flyers/storageAdminUpload';
import { getOptionalEnv } from '@/backend/env';
import { isByuEmail, normalizeEmail } from '@/lib/authShared';

export const USER_PROFILES_COLLECTION = 'userProfiles';

export type UserProfileRow = {
    uid: string;
    email: string;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    byuNetId: string | null;
    canUpload: boolean;
};

function db(): admin.firestore.Firestore {
    ensureFirebaseAdminInitialized();
    return admin.firestore();
}

export function getConfiguredAdminEmail(): string | undefined {
    const raw = getOptionalEnv('ADMIN_EMAIL');
    return raw ? normalizeEmail(raw) : undefined;
}

export function isConfiguredAdminEmail(email: string): boolean {
    const adminEmail = getConfiguredAdminEmail();
    if (!adminEmail) return false;
    return normalizeEmail(email) === adminEmail;
}

export async function syncUserProfileFromIdToken(decoded: admin.auth.DecodedIdToken): Promise<void> {
    const email = decoded.email;
    if (!email) {
        throw new Error('Your account must have an email address to use this app.');
    }
    const emailNorm = normalizeEmail(email);
    if (!isByuEmail(emailNorm)) {
        throw new Error('Only @byu.edu email addresses are allowed.');
    }

    const uid = decoded.uid;
    const tokenName =
        typeof decoded.name === 'string' && decoded.name.trim().length > 0 ? decoded.name.trim() : null;

    const adminEmail = getConfiguredAdminEmail();
    const isAdmin = adminEmail ? emailNorm === adminEmail : false;

    const ref = db().collection(USER_PROFILES_COLLECTION).doc(uid);
    const snap = await ref.get();
    const existingData = snap.exists ? (snap.data() as { displayName?: string | null }) : null;
    const existingName =
        existingData && typeof existingData.displayName === 'string' && existingData.displayName.trim()
            ? existingData.displayName.trim()
            : null;
    const displayName = tokenName ?? existingName;

    const base: Record<string, unknown> = {
        email: emailNorm,
        lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (displayName) {
        base.displayName = displayName;
    }

    if (!snap.exists) {
        await ref.set({
            ...base,
            canUpload: isAdmin,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return;
    }

    const update: Record<string, unknown> = { ...base };
    if (isAdmin) {
        update.canUpload = true;
    }
    await ref.set(update, { merge: true });
}

export async function getProfileDoc(
    uid: string
): Promise<{ canUpload: boolean; email: string; displayName: string | null } | null> {
    const snap = await db().collection(USER_PROFILES_COLLECTION).doc(uid).get();
    if (!snap.exists) return null;
    const data = snap.data() as {
        canUpload?: boolean;
        email?: string;
        displayName?: string | null;
    } | undefined;
    const email = typeof data?.email === 'string' ? data.email : '';
    const canUpload = data?.canUpload === true;
    const displayName =
        typeof data?.displayName === 'string' && data.displayName.trim() ? data.displayName.trim() : null;
    return { canUpload, email, displayName };
}

export async function userMayUploadFlyer(uid: string, email: string): Promise<boolean> {
    if (!email?.trim() || !isByuEmail(email)) return false;
    if (isConfiguredAdminEmail(email)) return true;
    const profile = await getProfileDoc(uid);
    return profile?.canUpload === true;
}

export async function listUserProfiles(): Promise<UserProfileRow[]> {
    const qs = await db().collection(USER_PROFILES_COLLECTION).orderBy('email').get();
    const rows: UserProfileRow[] = [];
    qs.forEach((docSnap) => {
        const d = docSnap.data() as {
            email?: string;
            displayName?: string | null;
            firstName?: string | null;
            lastName?: string | null;
            byuNetId?: string | null;
            canUpload?: boolean;
        };
        rows.push({
            uid: docSnap.id,
            email: typeof d.email === 'string' ? d.email : '',
            displayName: typeof d.displayName === 'string' ? d.displayName : null,
            firstName: typeof d.firstName === 'string' && d.firstName.trim() ? d.firstName.trim() : null,
            lastName: typeof d.lastName === 'string' && d.lastName.trim() ? d.lastName.trim() : null,
            byuNetId: typeof d.byuNetId === 'string' && d.byuNetId.trim() ? d.byuNetId.trim() : null,
            canUpload: d.canUpload === true,
        });
    });
    return rows;
}

export async function setUserCanUpload(uid: string, canUpload: boolean): Promise<void> {
    const ref = db().collection(USER_PROFILES_COLLECTION).doc(uid);
    const snap = await ref.get();
    if (!snap.exists) {
        throw new Error('User profile not found.');
    }
    const data = snap.data() as { email?: string } | undefined;
    const email = typeof data?.email === 'string' ? normalizeEmail(data.email) : '';
    const adminEmail = getConfiguredAdminEmail();
    if (adminEmail && email === adminEmail && !canUpload) {
        throw new Error('Cannot remove upload access from the admin account.');
    }
    await ref.set({ canUpload, lastSeenAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
}
