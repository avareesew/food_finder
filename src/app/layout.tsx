import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

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
    <html lang="en">
      <body className="font-sans bg-brand-canvas min-h-screen text-brand-black antialiased selection:bg-brand-orange/20 selection:text-brand-orange">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
