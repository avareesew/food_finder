'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onStoreChange: () => void) {
  const el = document.documentElement;
  const mo = new MutationObserver(onStoreChange);
  mo.observe(el, { attributes: true, attributeFilter: ['class'] });
  return () => mo.disconnect();
}

function getSnapshot(): boolean {
  return document.documentElement.classList.contains('dark');
}

function getServerSnapshot(): boolean {
  return false;
}

/** True when `<html class="dark">` (matches ThemeToggle). */
export function useHtmlDarkClass(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
