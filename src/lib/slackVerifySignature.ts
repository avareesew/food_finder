import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verifies `X-Slack-Signature` per https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackRequestSignature(args: {
    signingSecret: string;
    requestTimestamp: string;
    rawBody: string;
    slackSignature: string;
}): boolean {
    const { signingSecret, requestTimestamp, rawBody, slackSignature } = args;
    const ts = Number.parseInt(requestTimestamp, 10);
    if (!Number.isFinite(ts)) return false;
    const nowSec = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSec - ts) > 60 * 5) return false;

    const base = `v0:${requestTimestamp}:${rawBody}`;
    const hmac = createHmac('sha256', signingSecret).update(base, 'utf8').digest('hex');
    const expected = `v0=${hmac}`;
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(slackSignature, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}
