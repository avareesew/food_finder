/** Lowercase / trim for comparing configured admin email to ID token email. */
export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

/** Minimal format check for sign-in and created accounts (any domain). */
export function isValidEmailFormat(email: string | null | undefined): boolean {
    if (!email || typeof email !== 'string') return false;
    const n = normalizeEmail(email);
    if (n.length < 3 || n.length > 254) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n);
}

/** Admin create-user only: must be a @byu.edu address (login may still use any email). */
export function isByuEduEmail(normalizedEmail: string): boolean {
    return isValidEmailFormat(normalizedEmail) && normalizedEmail.endsWith('@byu.edu');
}

/** Lowercase trim for comparing Net IDs / org login ids (no @). */
export function normalizeByuNetId(raw: string): string {
    return raw.trim().toLowerCase();
}

/** Optional org / school login id: letters and digits, typical length. */
export function isValidByuNetId(norm: string): boolean {
    if (norm.length < 2 || norm.length > 32) return false;
    return /^[a-z0-9]+$/.test(norm);
}
