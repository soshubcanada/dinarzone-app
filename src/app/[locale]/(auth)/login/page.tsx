"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || `/${locale}/dashboard`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setLoading(false);
      // Map Supabase errors to French user-friendly messages
      const msg = signInError.message.toLowerCase();
      if (msg.includes("invalid login credentials")) {
        setError("Email ou mot de passe incorrect.");
      } else if (msg.includes("email not confirmed")) {
        setError("Veuillez confirmer votre adresse e-mail.");
      } else if (msg.includes("too many")) {
        setError("Trop de tentatives. Réessayez dans quelques minutes.");
      } else {
        setError("Une erreur est survenue. Réessayez.");
      }
      return;
    }

    // Check if user has MFA factors enrolled — if yes, redirect to /verify
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const hasVerifiedTotp = factorsData?.totp?.some((f) => f.status === "verified");

    if (hasVerifiedTotp) {
      // User has 2FA enabled — must complete MFA challenge
      router.push(`/${locale}/verify?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    // No MFA → go straight to dashboard (or requested redirect)
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="animate-fade-in">
      {/* Brand header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-full bg-dz-green flex items-center justify-center shadow-sm">
          <span className="text-white text-lg font-bold leading-none">D</span>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className="text-lg font-bold text-dz-text tracking-tight">Dinar</span>
          <span className="text-lg font-bold text-gradient-gold tracking-tight">Zone</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-dz-text mb-1">Connexion</h1>
      <p className="text-sm text-dz-text-muted mb-8">
        Envoyez de l&apos;argent a vos proches, simplement et en toute securite.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="Votre mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
        />

        <div className="flex items-center justify-end">
          <Link
            href={`/${locale}/forgot-password`}
            className="text-sm text-dz-green font-medium hover:text-dz-green-dark transition-colors"
          >
            Mot de passe oublie?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading} size="lg">
          Se connecter
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dz-border/40" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-dz-text-muted">
            Ou continuer avec
          </span>
        </div>
      </div>

      {/* Social login */}
      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2.5 h-12 rounded-xl border border-dz-border/60 hover:bg-dz-cream/50 hover:border-dz-border transition-all text-sm font-medium text-dz-text card-press">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>

        <button className="flex-1 flex items-center justify-center gap-2.5 h-12 rounded-xl border border-dz-border/60 hover:bg-dz-cream/50 hover:border-dz-border transition-all text-sm font-medium text-dz-text card-press">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Apple
        </button>
      </div>

      {/* Register link */}
      <p className="mt-7 text-center text-sm text-dz-text-muted">
        Pas encore de compte?{" "}
        <Link
          href={`/${locale}/register`}
          className="text-dz-green font-semibold hover:text-dz-green-dark transition-colors"
        >
          Creer un compte
        </Link>
      </p>

      {/* Trust badges */}
      <div className="mt-8 pt-6 border-t border-dz-border/30">
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-dz-text-muted">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
            <span className="text-[11px] font-medium">QFC Registered</span>
          </div>
          <div className="w-px h-3 bg-dz-border/40" />
          <div className="flex items-center gap-1.5 text-dz-text-muted">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
            </svg>
            <span className="text-[11px] font-medium">AES-256</span>
          </div>
          <div className="w-px h-3 bg-dz-border/40" />
          <div className="flex items-center gap-1.5 text-dz-text-muted">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z" />
              <path d="m3.265 10.602 7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.13 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.71 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.738Z" />
              <path d="m10.933 19.231-7.668-4.13-1.37.739a.75.75 0 0 0 0 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 0 0 0-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 0 1-2.134-.001Z" />
            </svg>
            <span className="text-[11px] font-medium">SOC 2</span>
          </div>
        </div>
      </div>
    </div>
  );
}
