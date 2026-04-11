"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  {
    label: "Operations en direct",
    href: "/admin",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    label: "Utilisateurs & KYC",
    href: "/admin/users",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: "Taux & Liquidites",
    href: "/admin/rates",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const loc = (locale as string) || "fr";

  const isActive = (href: string) => {
    const fullPath = `/${loc}${href}`;
    if (href === "/admin") return pathname === fullPath;
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
            <span className="text-[10px] text-dz-green font-bold uppercase tracking-widest">
              Admin Ops
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-dz-fg">Equipe Ops</p>
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
