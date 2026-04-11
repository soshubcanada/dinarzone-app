import Link from "next/link";
import React from "react";
import PremiumLogo from "@/components/ui/PremiumLogo";

interface LogoProps {
  variant?: "full" | "icon";
  size?: number;
  className?: string;
}

export default function Logo({
  variant = "full",
  size,
  className = "",
}: LogoProps) {
  const iconSize = size || 32;

  if (variant === "icon") {
    return (
      <Link
        href="/fr/dashboard"
        className={`flex items-center active:scale-95 transition-transform ${className}`}
      >
        <PremiumLogo variant="icon" size={iconSize} />
      </Link>
    );
  }

  return (
    <Link
      href="/fr/dashboard"
      className={`flex items-center gap-2 active:scale-95 transition-transform ${className}`}
    >
      <PremiumLogo variant="icon" size={iconSize} />
      <div className="flex items-baseline gap-0.5">
        <span className="text-[17px] font-bold text-white tracking-tight">
          Dinar
        </span>
        <span className="text-[17px] font-bold text-dz-gold tracking-tight">
          Zone
        </span>
      </div>
    </Link>
  );
}
