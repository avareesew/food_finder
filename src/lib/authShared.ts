/** Allowed school email domain for registration and sign-in (lowercase suffix). */
export const BYU_EMAIL_DOMAIN = '@byu.edu';

/** Lowercase / trim for comparing configured admin email to ID token email. */
export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function isByuEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return normalizeEmail(email).endsWith(BYU_EMAIL_DOMAIN);
}

/** Lowercase trim for comparing Net IDs (no @). */
export function normalizeByuNetId(raw: string): string {
    return raw.trim().toLowerCase();
}

/** BYU Net ID: letters and digits only, typical length. */
export function isValidByuNetId(norm: string): boolean {
    if (norm.length < 2 || norm.length > 32) return false;
    return /^[a-z0-9]+$/.test(norm);
}
