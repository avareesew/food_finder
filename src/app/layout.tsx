import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Campus Food Finder',
  description: 'Find free food on campus in real-time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-brand-canvas min-h-screen text-brand-black antialiased selection:bg-brand-orange/20 selection:text-brand-orange dark:bg-gray-950 dark:text-gray-50">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(() => {
  try {
    const stored = localStorage.getItem('theme');
    const theme = (stored === 'light' || stored === 'dark')
      ? stored
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = theme;
  } catch {}
})();`.trim(),
          }}
        />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
