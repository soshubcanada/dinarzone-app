"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { triggerHaptic } from "@/lib/utils/haptics";

const LOCALES = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const currentLocale = segments[1] || "fr";

  const getLocalePath = (locale: string) => {
    const rest = segments.slice(2).join("/");
    return `/${locale}/${rest}`;
  };

  return (
    <div className="flex items-center h-8 rounded-full bg-white/10 p-0.5">
      {LOCALES.map((l) => (
        <Link
          key={l.code}
          href={getLocalePath(l.code)}
          onClick={() => triggerHaptic("light")}
          className={`flex items-center justify-center h-7 px-2.5 rounded-full text-[11px] font-semibold transition-all duration-200 ${
            currentLocale === l.code
              ? "bg-white/20 text-white shadow-sm"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}
