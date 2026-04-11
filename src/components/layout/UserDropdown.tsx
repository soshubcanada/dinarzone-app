"use client";

import { useState } from "react";
import { triggerHaptic } from "@/lib/utils/haptics";

export default function UserDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Notification bell */}
      <div className="flex items-center gap-1.5">
        <button className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/10 transition-colors">
          <svg
            className="w-[22px] h-[22px] text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
            />
          </svg>
          <span className="absolute top-0.5 right-0.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-dz-red rounded-full ring-2 ring-[#070B14]">
            2
          </span>
        </button>

        {/* Avatar */}
        <button
          onClick={() => {
            triggerHaptic("light");
            setOpen(!open);
          }}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#00A84D] to-[#006A33] text-white text-xs font-bold shadow-md hover:shadow-lg transition-shadow"
        >
          PC
        </button>
      </div>

      {/* Dropdown menu */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-dz-card border border-dz-border-subtle rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-sm font-bold text-dz-fg">Patrick C.</p>
              <p className="text-xs text-dz-fg-muted">Premium</p>
            </div>
            <div className="py-1">
              <button className="w-full text-left px-4 py-2.5 text-sm text-dz-fg hover:bg-white/5 transition-colors">
                Mon profil
              </button>
              <button className="w-full text-left px-4 py-2.5 text-sm text-dz-fg hover:bg-white/5 transition-colors">
                Param&egrave;tres
              </button>
              <button className="w-full text-left px-4 py-2.5 text-sm text-dz-red hover:bg-white/5 transition-colors">
                D&eacute;connexion
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
