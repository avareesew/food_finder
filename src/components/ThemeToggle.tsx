'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  // Helps built-in form controls match theme
  root.style.colorScheme = theme;
  // Some CSS libraries look at body; harmless for Tailwind but increases compatibility.
  if (theme === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');
  try {
    window.localStorage.setItem('theme', theme);
  } catch {}
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  // Avoid hydration mismatch: SSR always renders "light" UI; after mount we sync to real theme.
  useEffect(() => {
    setMounted(true);
    // If the init script already set the DOM class, trust DOM first.
    const domTheme: Theme =
      document.documentElement.classList.contains('dark') ? 'dark' : getInitialTheme();
    applyTheme(domTheme);
    setTheme(domTheme);
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Flip DOM class first (source of truth), then sync state/storage.
    const isDark = document.documentElement.classList.toggle('dark');
    const next: Theme = isDark ? 'dark' : 'light';
    applyTheme(next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="h-10 w-10 rounded-full border border-gray-200 bg-white/70 backdrop-blur hover:bg-white transition-colors flex items-center justify-center text-gray-700 dark:border-gray-800 dark:bg-gray-900/70 dark:hover:bg-gray-900 dark:text-gray-200"
      aria-label={!mounted ? 'Toggle theme' : theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={!mounted ? 'Toggle theme' : theme === 'dark' ? 'Light mode' : 'Dark mode'}
      suppressHydrationWarning
    >
      {!mounted ? (
        <span className="text-xs font-semibold">•</span>
      ) : theme === 'dark' ? (
        // Sun
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414m0-11.314 1.414 1.414m11.314 11.314 1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z"
          />
        </svg>
      ) : (
        // Moon
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
          />
        </svg>
      )}
    </button>
  );
}

