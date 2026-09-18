"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: "Learn", href: "/learn" },
    { name: "FAQ", href: "/faq" },
    { name: "Security", href: "/security" },
    { name: "Terms", href: "/terms" },
    { name: "Privacy", href: "/privacy" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="flex h-36 items-center justify-between">

          {/* LOGO + TITULO + SUBTITULO */}
          <div className="flex flex-col">

            <Link
              href="/"
              className="flex items-center gap-4 transition-opacity hover:opacity-80"
            >
              <Image
                src="/logo.png"
                alt="Dust Sweeper Tool"
                width={260}
                height={70}
                priority
                className="h-22 w-auto"
              />

              <span className="text-2xl font-bold tracking-tight text-white">
                Dust Sweeper Tool
              </span>
            </Link>

            {/* SUBTITULO */}
            <span className="text-[13px] text-gray-300 mt-1 pl-[105px]">
              Find forgotten funds. Analyze wallets. Bridge, Swap and Scan tokens.
            </span>

          </div>

          {/* MENU DESKTOP */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8 text-white">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* BOTÃO MOBILE */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <span className="sr-only">Open main menu</span>

              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MENU MOBILE */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black animate-in fade-in slide-in-from-top-2">
          <div className="space-y-1 px-4 pb-6 pt-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block rounded-md py-4 text-base font-medium text-gray-300 hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}