'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuItems = [
    { name: 'Learn', href: '/learn' }, { name: 'FAQ', href: '/faq' },
    { name: 'Security', href: '/security' }, { name: 'Terms', href: '/terms' },
    { name: 'Privacy', href: '/privacy' },
  ];
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#08090e]/95 backdrop-blur-lg">
      <nav aria-label="Main navigation" className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 sm:h-20">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 text-white">
            <Image src="/logo.png" alt="" width={44} height={44} priority className="h-11 w-11 shrink-0 object-contain" />
            <div className="min-w-0"><p className="truncate text-base font-bold sm:text-lg">Dust Sweeper Tool</p><p className="hidden text-xs text-gray-400 sm:block">Find forgotten funds. Analyze wallets. Bridge, Swap and Scan tokens.</p></div>
          </Link>
          <div className="hidden items-center gap-5 md:flex">
            {menuItems.map(item => <Link key={item.name} href={item.href} className="inline-flex min-h-11 items-center text-sm text-gray-300 hover:text-white">{item.name}</Link>)}
          </div>
          <button type="button" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={isMenuOpen} aria-controls="mobile-navigation" onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 text-gray-200 md:hidden">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d={isMenuOpen ? 'M6 6l12 12M6 18L18 6' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
          </button>
        </div>
        {isMenuOpen && <div id="mobile-navigation" className="grid grid-cols-2 gap-2 border-t border-white/10 py-3 md:hidden">{menuItems.map(item => <Link key={item.name} href={item.href} onClick={() => setIsMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm text-gray-200 hover:bg-white/10">{item.name}</Link>)}</div>}
      </nav>
    </header>
  );
}
