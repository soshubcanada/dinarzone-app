"use client";

import React, { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "framer-motion";

export default function VirtualCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  // Valeurs de mouvement brutes (-1 a 1)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Physique de ressort pour une fluidite parfaite
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  // Transformation en degres de rotation (Max 15 degres)
  const rotateX = useTransform(springY, [-1, 1], [15, -15]);
  const rotateY = useTransform(springX, [-1, 1], [-15, 15]);

  // Transformation pour le reflet de lumiere (Glare)
  const glareX = useTransform(springX, [-1, 1], ["0%", "100%"]);
  const glareY = useTransform(springY, [-1, 1], ["0%", "100%"]);
  const glareOpacity = useTransform(springY, [-1, 1], [0.1, 0.4]);
  const glareBackground = useMotionTemplate`radial-gradient(circle 120px at ${glareX} ${glareY}, rgba(255,255,255,0.8), transparent)`;

  // Gestion du gyroscope (Mobile)
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta && e.gamma) {
        const tiltX = Math.max(-30, Math.min(30, e.gamma)) / 30;
        const tiltY = Math.max(-30, Math.min(30, e.beta - 45)) / 30;

        x.set(tiltX);
        y.set(tiltY);
      }
    };

    if (typeof window !== "undefined" && window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation);
    }
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, [x, y]);

  // Gestion de la souris (Desktop)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    const relativeX =
      (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const relativeY =
      (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div
      className="flex items-center justify-center p-8"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-80 h-52 rounded-2xl cursor-pointer group"
      >
        {/* Corps de la carte : Design Mat Premium DinarZone */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#070B14] to-[#003A1C] border border-white/10 shadow-2xl overflow-hidden">
          {/* Motif geometrique discret */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:12px_12px]" />

          {/* Reflet holographique qui se deplace (Glare) */}
          <motion.div
            className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay"
            style={{
              background: glareBackground,
              opacity: glareOpacity,
            }}
          />

          {/* Contenu de la carte (sureleve en 3D) */}
          <div
            className="relative z-10 p-6 flex flex-col justify-between h-full transform-gpu"
            style={{ transform: "translateZ(30px)" }}
          >
            {/* Header : Logo et Type */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#B8923B] to-[#9A7A31] flex items-center justify-center text-[#070B14] font-black text-xs">
                  DZ
                </div>
                <span className="font-bold text-white tracking-widest text-sm">
                  DinarZone
                </span>
              </div>
              <span className="text-white/50 text-xs font-semibold tracking-wider">
                VIRTUAL
              </span>
            </div>

            {/* Puce electronique (Chip) stylisee */}
            <div className="w-10 h-8 rounded bg-gradient-to-br from-[#B8923B]/80 to-[#9A7A31]/50 border border-[#B8923B]/30 flex flex-col justify-between p-1 opacity-80">
              <div className="w-full h-[1px] bg-black/20" />
              <div className="w-full h-[1px] bg-black/20" />
              <div className="w-full h-[1px] bg-black/20" />
            </div>

            {/* Numeros et Footer */}
            <div>
              <div className="text-white/80 font-mono text-xl tracking-[0.2em] mb-2 drop-shadow-md">
                &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull;
                &bull;&bull;&bull;&bull; 4589
              </div>
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div>
                    <div className="text-[8px] text-white/50 uppercase tracking-widest mb-0.5">
                      Valide thru
                    </div>
                    <div className="text-sm text-white font-mono">12/28</div>
                  </div>
                  <div>
                    <div className="text-[8px] text-white/50 uppercase tracking-widest mb-0.5">
                      CVC
                    </div>
                    <div className="text-sm text-white font-mono">
                      &bull;&bull;&bull;
                    </div>
                  </div>
                </div>
                {/* Mastercard circles */}
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/80 mix-blend-screen" />
                  <div className="w-8 h-8 rounded-full bg-yellow-500/80 mix-blend-screen" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
