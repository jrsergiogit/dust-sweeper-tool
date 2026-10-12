'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureAttribution } from './lib/dust-analytics';

export default function CleanUrl() {
  const pathname = usePathname();
  useEffect(() => {
    // Synchronous ordering: save attribution before touching the address bar.
    captureAttribution();
    const url = new URL(window.location.href);
    let changed = false;
    for (const key of Array.from(url.searchParams.keys())) {
      if (key.toLowerCase().startsWith('utm_')) { url.searchParams.delete(key); changed = true; }
    }
    // Keep gclid, gbraid, wbraid, _gl, _gcl*, msclkid and fbclid for advertising tags.
    // Preserve the Next.js history state and the widget's own query parameters.
    if (changed) window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  }, [pathname]);
  return null;
}
