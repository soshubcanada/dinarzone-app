export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dz-cream flex flex-col items-center justify-center px-4 py-8">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-2">
          <span className="text-3xl font-bold text-dz-green">Dinar</span>
          <span className="text-3xl font-bold text-gradient-gold">Zone</span>
        </div>
        <p className="text-sm text-dz-text-secondary">
          Transferts vers le Maghreb
        </p>
      </div>

      {/* Card container */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-dz-border/60 shadow-sm p-6 sm:p-8">
          {children}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-dz-text-muted text-center">
        &copy; 2026 DinarZone. Tous droits reserves.
      </p>
    </div>
  );
}
