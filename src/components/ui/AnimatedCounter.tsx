"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  currency?: string;
  locale?: string;
  decimals?: number;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  currency = "",
  locale = "fr-CA",
  decimals = 2,
  duration = 1,
}: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) =>
    latest.toLocaleString(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );

  useEffect(() => {
    const animation = animate(count, value, {
      duration,
      type: "spring",
      bounce: 0,
    });
    return animation.stop;
  }, [count, value, duration]);

  return (
    <motion.span className="font-sans tabular-nums tracking-tight">
      <motion.span>{rounded}</motion.span>
      {currency && ` ${currency}`}
    </motion.span>
  );
}
