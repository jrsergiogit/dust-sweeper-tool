'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureAttribution, trackPageView } from '../lib/dust-analytics';

export default function PageAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    captureAttribution();
    trackPageView(pathname);
  }, [pathname]);
  return null;
}
