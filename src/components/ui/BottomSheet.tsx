"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { triggerHaptic } from "@/lib/utils/haptics";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      triggerHaptic("light");
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
      triggerHaptic("light");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              onClose();
              triggerHaptic("light");
            }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 w-full max-w-xl mx-auto bg-dz-card border-t border-white/10 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]"
          >
            {/* Handle */}
            <div className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing touch-none">
              <div className="w-12 h-1.5 bg-white/20 rounded-full" />
            </div>

            {/* Titre optionnel */}
            {title && (
              <div className="px-6 pb-4 border-b border-white/5">
                <h3 className="text-xl font-bold text-white text-center">
                  {title}
                </h3>
              </div>
            )}

            {/* Contenu scrollable */}
            <div className="px-6 py-6 overflow-y-auto overscroll-contain hide-scrollbar">
              {children}
            </div>

            {/* Safe area padding pour iPhone */}
            <div className="pb-safe" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
