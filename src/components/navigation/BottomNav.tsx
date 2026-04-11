"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { triggerHaptic } from "@/lib/utils/haptics";

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const cls = `w-6 h-6 ${active ? "text-[#00A84D]" : "text-white/40"}`;
  const sw = 1.5;

  switch (name) {
    case "home":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : sw}>
          {active
            ? <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 01-.53 1.28h-1.44v7.44a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5h-2.5v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-7.44H2.31a.75.75 0 01-.53-1.28l8.69-8.69z" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          }
        </svg>
      );
    case "history":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : sw}>
          {active
            ? <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          }
        </svg>
      );
    case "agents":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth={sw}>
          {active ? (
            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          ) : (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </>
          )}
        </svg>
      );
    case "profile":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth={sw}>
          {active
            ? <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          }
        </svg>
      );
    default:
      return null;
  }
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: "home" },
  { href: "/history", label: "Historique", icon: "history" },
  { href: "/send", label: "Envoyer", icon: "send", isCenter: true },
  { href: "/agents", label: "Agents", icon: "agents" },
  { href: "/profile", label: "Profil", icon: "profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const locale = segments[1] || "fr";
  const isActive = (href: string) => pathname.includes(href);

  return (
    <nav className="bg-[#070B14]/80 backdrop-blur-2xl border-t border-white/10 pb-safe">
      <div className="flex items-end justify-around px-6 pt-2 pb-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const fullHref = `/${locale}${item.href}`;

          if (item.isCenter) {
            return (
              <div key={item.href} className="relative -top-6">
                <Link href={fullHref} onClick={() => triggerHaptic("medium")} className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#00A84D] to-[#00873E] shadow-[0_8px_20px_rgba(0,168,77,0.4)] active:scale-95 transition-transform">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <span className={`text-[10px] mt-1 font-bold ${active ? "text-[#00A84D]" : "text-[#7B8DB5]"}`}>
                    {item.label}
                  </span>
                </Link>
              </div>
            );
          }

          return (
            <Link key={item.href} href={fullHref} onClick={() => triggerHaptic("light")} className="flex flex-col items-center gap-1 py-1 min-w-[56px]">
              <NavIcon name={item.icon} active={active} />
              <span className={`text-[10px] font-bold transition-colors duration-200 ${active ? "text-[#00A84D]" : "text-[#7B8DB5]"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
