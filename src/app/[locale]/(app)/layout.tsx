import React from "react";
import Sidebar from "@/components/navigation/Sidebar";
import BottomNav from "@/components/navigation/BottomNav";
import TopHeader from "@/components/navigation/TopHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#070B14] overflow-hidden">
      {/* Sidebar for Desktop (hidden on mobile) */}
      <div className="hidden md:flex w-64 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col h-full relative w-full max-w-full">
        {/* Global Header (Logo mobile, Notifications, Profile) */}
        <TopHeader />

        {/* Main scrollable content area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 md:pb-8 hide-scrollbar">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6">
            {children}
          </div>
        </main>

        {/* Bottom Navigation for Mobile (hidden on desktop) */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
