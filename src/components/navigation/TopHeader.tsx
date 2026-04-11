"use client";

import Logo from "@/components/ui/Logo";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import UserDropdown from "@/components/layout/UserDropdown";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function TopHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#070B14]/80 backdrop-blur-xl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo + texte */}
        <Logo variant="full" size={32} />

        {/* Droite : Theme, Langue, Notifications, Profil */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
