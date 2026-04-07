/**
 * Canonical public site origin (no trailing slash). Used to rewrite Firebase
 * password-reset links so users open our branded /auth/action page instead of
 * *.firebaseapp.com/__/auth/action.
 */
export function getPublicSiteOrigin(): string | null {
    const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '');
    if (explicit) return explicit;
    const vercel = process.env.VERCEL_URL?.trim();
    if (vercel) {
        const host = vercel.replace(/^https?:\/\//, '');
        return `https://${host}`;
    }
    return null;
}

/**
 * Turns https://PROJECT.firebaseapp.com/__/auth/action?mode=resetPassword&oobCode=…&apiKey=…
 * into https://YOUR_APP/auth/action?… so the in-app handler runs on your domain.
 */
export function rewritePasswordResetLinkToHostedApp(firebaseActionLink: string): string {
    const origin = getPublicSiteOrigin();
    if (!origin) return firebaseActionLink;

    let url: URL;
    try {
        url = new URL(firebaseActionLink);
    } catch {
        return firebaseActionLink;
    }

    const oobCode = url.searchParams.get('oobCode');
    const mode = url.searchParams.get('mode');
    const apiKey = url.searchParams.get('apiKey');
    if (!oobCode || mode !== 'resetPassword' || !apiKey) {
        return firebaseActionLink;
    }

    const out = new URL(`${origin}/auth/action`);
    out.searchParams.set('mode', mode);
    out.searchParams.set('oobCode', oobCode);
    out.searchParams.set('apiKey', apiKey);
    const lang = url.searchParams.get('lang');
    if (lang) out.searchParams.set('lang', lang);
    return out.toString();
}
