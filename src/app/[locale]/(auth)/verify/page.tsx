"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import OtpInput from "@/components/auth/OtpInput";
import { triggerHaptic } from "@/lib/utils/haptics";
import { createClient } from "@/lib/supabase/client";

export default function VerifyPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || `/${locale}/dashboard`;

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [otpKey, setOtpKey] = useState(0); // to force-remount OtpInput on error

  // On mount, list MFA factors and create a challenge
  const initChallenge = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    // Must be authenticated (post-password login) to reach this page
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      router.replace(`/${locale}/login`);
      return;
    }

    const { data: factorsData, error: factorsErr } =
      await supabase.auth.mfa.listFactors();

    if (factorsErr) {
      setError("Impossible de charger les methodes 2FA. Reessayez.");
      setLoading(false);
      return;
    }

    const verifiedTotp = factorsData?.totp?.find((f) => f.status === "verified");
    if (!verifiedTotp) {
      // No 2FA enrolled — skip straight to destination
      router.replace(redirectTo);
      return;
    }

    setFactorId(verifiedTotp.id);

    const { data: challengeData, error: challengeErr } =
      await supabase.auth.mfa.challenge({ factorId: verifiedTotp.id });

    if (challengeErr || !challengeData) {
      setError("Impossible de creer le defi 2FA. Reessayez.");
      setLoading(false);
      return;
    }

    setChallengeId(challengeData.id);
    setLoading(false);
  }, [locale, redirectTo, router]);

  useEffect(() => {
    initChallenge();
  }, [initChallenge]);

  const handleOtpComplete = async (code: string) => {
    if (!factorId || !challengeId || verifying) return;

    triggerHaptic("light");
    setVerifying(true);
    setError(null);

    const supabase = createClient();
    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (verifyErr) {
      triggerHaptic("error");
      const msg = verifyErr.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("verification")) {
        setError("Code incorrect. Verifiez votre application authentificateur.");
      } else if (msg.includes("expired")) {
        setError("Code expire. Un nouveau defi a ete cree.");
        // Refresh challenge
        const { data: newChallenge } = await supabase.auth.mfa.challenge({ factorId });
        if (newChallenge) setChallengeId(newChallenge.id);
      } else {
        setError("Erreur de verification. Reessayez.");
      }
      setOtpKey((k) => k + 1); // remount to clear inputs
      setVerifying(false);
      return;
    }

    triggerHaptic("success");
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-dz-green/10 rounded-2xl flex items-center justify-center">
          <svg
            className="w-8 h-8 text-dz-green"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-dz-text mb-1">
          Verification 2FA
        </h1>
        <p className="text-sm text-dz-text-muted">
          Entrez le code a 6 chiffres de votre application authentificateur
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-10 h-10 mx-auto border-2 border-dz-green/20 border-t-dz-green rounded-full"
          />
          <p className="text-sm text-dz-text-muted mt-4">Preparation...</p>
        </div>
      ) : (
        <>
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {error}
            </div>
          )}

          <div className="mb-4 flex items-center gap-2 p-3 bg-dz-cream rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-dz-green/10 flex items-center justify-center text-dz-green">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-dz-text">
                Application authentificateur
              </p>
              <p className="text-[11px] text-dz-text-muted">
                Google Authenticator, Authy, 1Password...
              </p>
            </div>
          </div>

          {verifying ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-10 h-10 mx-auto border-2 border-dz-green/20 border-t-dz-green rounded-full"
              />
              <p className="text-sm text-dz-text-muted mt-4">Verification...</p>
            </div>
          ) : (
            <OtpInput
              key={otpKey}
              phone="votre application authentificateur"
              length={6}
              onComplete={handleOtpComplete}
            />
          )}

          <button
            type="button"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push(`/${locale}/login`);
            }}
            className="mt-6 text-sm text-dz-text-muted font-medium hover:text-dz-text transition-colors w-full text-center"
          >
            Annuler et se deconnecter
          </button>
        </>
      )}
    </div>
  );
}
