import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dz-cream flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-dz-green/10 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-dz-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-dz-text mb-2">404</h1>
      <p className="text-dz-text-secondary mb-8 max-w-sm">
        Cette page n&apos;existe pas ou a ete deplacee.
      </p>
      <Link
        href="/fr/dashboard"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gradient text-white font-semibold text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        Retour au tableau de bord
      </Link>
    </div>
  );
}
