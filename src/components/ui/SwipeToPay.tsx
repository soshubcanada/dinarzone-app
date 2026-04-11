"use client";

import React, { useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
} from "framer-motion";
import { triggerHaptic } from "@/lib/utils/haptics";

interface SwipeToPayProps {
  onConfirm: () => void;
  amount: string;
}

export default function SwipeToPay({ onConfirm, amount }: SwipeToPayProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);

  const opacity = useTransform(x, [0, 150], [1, 0]);
  const progressWidth = useTransform(x, [0, 250], ["0%", "100%"]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    const trackWidth = trackRef.current?.offsetWidth || 300;
    const thumbWidth = thumbRef.current?.offsetWidth || 60;
    const threshold = trackWidth - thumbWidth - 10;

    if (info.offset.x >= threshold) {
      setIsCompleted(true);
      triggerHaptic("success");
      controls.start({ x: trackWidth - thumbWidth });
      setTimeout(() => onConfirm(), 500);
    } else {
      triggerHaptic("light");
      controls.start({
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      });
    }
  };

  return (
    <div
      ref={trackRef}
      className="relative w-full h-16 bg-white/5 border border-white/10 rounded-full overflow-hidden flex items-center justify-center touch-none"
    >
      {/* Barre de progression verte */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#00A84D] to-[#00873E]"
        style={{ width: progressWidth }}
      />

      {/* Texte d'instruction avec shimmer */}
      <motion.span
        style={{ opacity }}
        className="absolute z-10 font-bold text-white/70 text-sm"
      >
        Glisser pour payer {amount}
      </motion.span>

      {/* Thumb */}
      <motion.div
        ref={thumbRef}
        drag={isCompleted ? false : "x"}
        dragConstraints={trackRef}
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="absolute left-1 z-20 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)] cursor-grab active:cursor-grabbing"
      >
        {isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-[#00A84D]"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        ) : (
          <svg
            className="w-5 h-5 text-[#070B14]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </motion.div>
    </div>
  );
}
