import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/** Public self-registration is disabled; admins create users via `/api/admin/create-user`. */
export async function POST() {
    logger.info('register-blocked', { reason: 'public_registration_disabled' });
    return NextResponse.json(
        {
            error:
                'Creating an account from the login page is disabled. Your administrator will invite you and send a password setup link.',
        },
        { status: 403 }
    );
}
