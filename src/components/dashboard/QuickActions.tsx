"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import FlagIcon from "@/components/ui/FlagIcon";

interface QuickAction {
  label: string;
  flag: string;
  rate: string;
  href: string;
  color: string;
}

interface QuickActionsProps {
  locale?: string;
  actions?: QuickAction[];
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: "Algerie", flag: "DZ", rate: "99.5", href: "/send?to=DZ", color: "bg-dz-green/8" },
  { label: "Tunisie", flag: "TN", rate: "2.28", href: "/send?to=TN", color: "bg-dz-red/6" },
  { label: "Qatar", flag: "QA", rate: "2.71", href: "/send?to=QA", color: "bg-dz-maroon/6" },
  { label: "EAU", flag: "AE", rate: "2.73", href: "/send?to=AE", color: "bg-dz-gold/8" },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function QuickActions({
  locale = "fr",
  actions = DEFAULT_ACTIONS,
}: QuickActionsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-4 gap-2.5"
    >
      {actions.map((action) => (
        <Link key={action.flag} href={`/${locale}${action.href}`}>
          <motion.div
            variants={item}
            whileHover={{ y: -5, scale: 1.05 }}
            className={`flex flex-col items-center gap-1.5 rounded-2xl bg-white border border-dz-border/30 py-3 px-2 text-center cursor-pointer card-elevated`}
          >
            <div
              className={`w-11 h-11 rounded-xl ${action.color} flex items-center justify-center`}
            >
              <FlagIcon countryCode={action.flag} size="md" />
            </div>
            <span className="text-xs font-semibold text-dz-text">
              {action.label}
            </span>
            <span className="text-[10px] text-dz-text-muted">{action.rate}</span>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
}
