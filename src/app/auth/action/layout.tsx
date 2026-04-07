import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
    title: 'Set your password · Campus Food Finder',
    description: 'Choose a new password for your Campus Food Finder account.',
};

export default function AuthActionLayout({ children }: { children: ReactNode }) {
    return children;
}
