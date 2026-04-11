"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: "home" },
  { href: "/send", label: "Envoyer", icon: "send" },
  { href: "/history", label: "Historique", icon: "history" },
  { href: "/recipients", label: "Destinataires", icon: "recipients" },
  { href: "/agents", label: "Agents", icon: "agents" },
  { href: "/kyc", label: "Verification", icon: "kyc" },
  { href: "/profile", label: "Profil", icon: "profile" },
];

function SidebarIcon({ name, active }: { name: string; active: boolean }) {
  const cls = `w-5 h-5 flex-shrink-0 ${active ? "text-[#00A84D]" : "text-white/40"}`;
  const sw = 1.5;

  switch (name) {
    case "home":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth={sw}>
          {active
            ? <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 01-.53 1.28h-1.44v7.44a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-4.5h-2.5v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-7.44H2.31a.75.75 0 01-.53-1.28l8.69-8.69z" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          }
        </svg>
      );
    case "send":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.126A59.768 59.768 0 0 1 21.485 12 59.77 59.77 0 0 1 3.27 20.876L5.999 12Zm0 0h7.5" />
        </svg>
      );
    case "history":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke={active ? "none" : "currentColor"} strokeWidth={sw}>
          {active
            ? <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
            : <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          }
        </svg>
      );
    case "recipients":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
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
    case "kyc":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
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
      return <div className="w-5 h-5" />;
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const locale = segments[1] || "fr";
  const isActive = (href: string) => pathname.includes(href);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="w-9 h-9 rounded-full bg-dz-green flex items-center justify-center">
          <span className="text-white text-sm font-bold">D</span>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-lg font-bold text-white tracking-tight">Dinar</span>
          <span className="text-lg font-bold text-dz-gold tracking-tight">Zone</span>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col gap-0.5 px-3 mt-2 flex-1">
        {SIDEBAR_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#00A84D] rounded-r-full" />
              )}
              <SidebarIcon name={item.icon} active={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom promo */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-[#004D26] to-[#070B14] rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-dz-gold" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
            </svg>
            <p className="text-xs font-semibold text-dz-gold">Premium</p>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">
            Augmentez votre limite a $10,000/mois
          </p>
          <Link
            href={`/${locale}/kyc`}
            className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-dz-gold hover:text-dz-gold-light transition-colors"
          >
            Verifier maintenant
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
