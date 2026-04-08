"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-dz-cream flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-dz-red/10 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-dz-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-dz-text mb-2">Une erreur est survenue</h1>
      <p className="text-dz-text-secondary mb-8 max-w-sm text-sm">
        Nous travaillons a resoudre ce probleme. Veuillez reessayer.
      </p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl btn-gradient text-white font-semibold text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
        </svg>
        Reessayer
      </button>
    </div>
  );
}
