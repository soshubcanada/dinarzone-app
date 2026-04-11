"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  {
    label: "Terminal PoS",
    href: "/agent-dashboard",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
      </svg>
    ),
  },
  {
    label: "Retraits en cours",
    href: "/agent-pickups",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
      </svg>
    ),
  },
  {
    label: "Devenir partenaire",
    href: "/partner-onboarding",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
  },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const loc = (locale as string) || "fr";

  const isActive = (href: string) => {
    const fullPath = `/${loc}${href}`;
    if (href === "/agent-dashboard") return pathname === fullPath;
    return pathname.startsWith(fullPath);
  };

  return (
    <div className="min-h-screen bg-dz-bg text-dz-fg font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-dz-border-subtle bg-dz-card hidden md:flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-dz-border-subtle flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-dz-gold to-[#9A7A31] flex items-center justify-center text-dz-bg font-black text-xs">
            DZ
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-widest text-dz-fg block leading-none">
              DinarZone
            </span>
            <span className="text-[10px] text-dz-gold font-bold uppercase tracking-widest">
              Agent PoS
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={`/${loc}${item.href}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-white/5 text-dz-fg border border-dz-border-subtle font-bold"
                  : "text-dz-fg-muted hover:bg-white/5 hover:text-dz-fg"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-dz-border-subtle">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-dz-fg-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-dz-fg">Point de Service</p>
              <button
                onClick={() => router.push(`/${loc}/login`)}
                className="text-[10px] text-dz-fg-muted hover:text-dz-red transition-colors"
              >
                Deconnexion
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
}
