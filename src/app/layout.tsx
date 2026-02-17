import type { Metadata } from 'next';
import { Poppins, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Camups Food Finder',
  description: 'Find free food on campus in real-time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${dmSerif.variable}`}>
      <body className="font-sans bg-brand-canvas min-h-screen text-brand-black antialiased selection:bg-brand-orange/20 selection:text-brand-orange">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
