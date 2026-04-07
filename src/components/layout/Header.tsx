"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  title?: string;
  onMenuToggle?: () => void;
}

const LOCALES = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
];

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const currentLocale = segments[1] || "fr";
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Build the path with the new locale
  const getLocalePath = (locale: string) => {
    const rest = segments.slice(2).join("/");
    return `/${locale}/${rest}`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-dz-border/20">
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        {/* Left: Hamburger (mobile) / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-dz-cream/80 transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5 text-dz-text" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <Link href={`/${currentLocale}/dashboard`} className="flex items-center gap-2">
            {/* DZ logo mark */}
            <div className="w-8 h-8 rounded-full bg-dz-green flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold leading-none">D</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[17px] font-bold text-dz-text tracking-tight">Dinar</span>
              <span className="text-[17px] font-bold text-gradient-gold tracking-tight">Zone</span>
            </div>
          </Link>
        </div>

        {/* Center: Page title */}
        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-dz-text truncate max-w-[40%] md:hidden">
            {title}
          </h1>
        )}

        {/* Right: Notification + Language */}
        <div className="flex items-center gap-1.5">
          {/* Notification bell */}
          <button className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-dz-cream/80 transition-colors">
            <svg className="w-[22px] h-[22px] text-dz-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            {/* Badge count */}
            <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-dz-red rounded-full ring-2 ring-white">
              2
            </span>
          </button>

          {/* Language pill toggle */}
          <div className="relative">
            <div className="flex items-center h-8 rounded-full bg-dz-cream/80 p-0.5">
              {LOCALES.map((l) => (
                <Link
                  key={l.code}
                  href={getLocalePath(l.code)}
                  className={`
                    flex items-center justify-center h-7 px-2.5 rounded-full text-[11px] font-semibold
                    transition-all duration-200
                    ${
                      currentLocale === l.code
                        ? "bg-white text-dz-green shadow-sm"
                        : "text-dz-text-muted hover:text-dz-text"
                    }
                  `}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
