"use client";

import React from "react";
import { motion } from "framer-motion";
import { triggerHaptic } from "@/lib/utils/haptics";

type ButtonVariant = "primary" | "secondary" | "gold";

interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[#00A84D] to-[#00873E] text-white shadow-[0_8px_25px_-8px_rgba(0,168,77,0.5)]",
  secondary:
    "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md",
  gold:
    "bg-gradient-to-r from-[#B8923B] to-[#9A7A31] text-white shadow-[0_8px_25px_-8px_rgba(184,146,59,0.5)]",
};

export default function PremiumButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  type = "button",
  className = "",
}: PremiumButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={() => {
        triggerHaptic("medium");
        onClick?.();
      }}
      disabled={disabled}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`group relative w-full overflow-hidden rounded-2xl py-4 px-6 font-bold text-[15px] tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${className}`}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_forwards] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
