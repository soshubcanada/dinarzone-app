"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import OtpInput from "@/components/auth/OtpInput";
import { createClient } from "@/lib/supabase/client";
import { triggerHaptic } from "@/lib/utils/haptics";

type Stage = "loading" | "already-enrolled" | "enroll" | "verify" | "success";

export default function TwoFactorPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unenrolling, setUnenrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpKey, setOtpKey] = useState(0);

  // Check existing factors on mount
  const loadState = useCallback(async () => {
    setError(null);
    setStage("loading");
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      router.replace(`/${locale}/login`);
      return;
    }

    const { data, error: listErr } = await supabase.auth.mfa.listFactors();
    if (listErr) {
      setError("Impossible de charger les parametres 2FA.");
      setStage("enroll");
      return;
    }

    const verified = data?.totp?.find((f) => f.status === "verified");
    if (verified) {
      setFactorId(verified.id);
      setStage("already-enrolled");
      return;
    }

    // Clean up any leftover unverified factors to allow fresh enrollment
    const unverified = data?.totp?.filter((f) => f.status !== "verified") || [];
    for (const f of unverified) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }

    setStage("enroll");
  }, [locale, router]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const startEnrollment = async () => {
    setError(null);
    const supabase = createClient();

    // Ensure no leftover factors
    const { data: existing } = await supabase.auth.mfa.listFactors();
    const leftover = existing?.totp?.filter((f) => f.status !== "verified") || [];
    for (const f of leftover) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }

    const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `DinarZone (${new Date().toLocaleDateString("fr-CA")})`,
    });

    if (enrollErr || !data) {
      setError("Impossible de demarrer l'enrollement 2FA. Reessayez.");
      return;
    }

    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setStage("verify");
  };

  const handleVerify = async (code: string) => {
    if (!factorId || verifying) return;
    triggerHaptic("light");
    setVerifying(true);
    setError(null);

    const supabase = createClient();
    const { data: challengeData, error: challengeErr } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeErr || !challengeData) {
      setError("Erreur de defi 2FA. Reessayez.");
      setVerifying(false);
      setOtpKey((k) => k + 1);
      return;
    }

    const { error: verifyErr } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });

    if (verifyErr) {
      triggerHaptic("error");
      setError("Code incorrect. Verifiez votre application authentificateur.");
      setVerifying(false);
      setOtpKey((k) => k + 1);
      return;
    }

    triggerHaptic("success");
    setStage("success");
    setVerifying(false);
  };

  const handleDisable = async () => {
    if (!factorId || unenrolling) return;
    setUnenrolling(true);
    setError(null);
    const supabase = createClient();
    const { error: unenrollErr } = await supabase.auth.mfa.unenroll({ factorId });
    if (unenrollErr) {
      setError("Impossible de desactiver le 2FA. Reessayez.");
      setUnenrolling(false);
      return;
    }
    setFactorId(null);
    setUnenrolling(false);
    loadState();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-dz-card border border-dz-border-subtle flex items-center justify-center hover:bg-white/5 transition-colors"
          aria-label="Retour"
        >
          <svg className="w-5 h-5 text-dz-fg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-dz-fg">Authentification 2FA</h1>
          <p className="text-xs text-dz-fg-muted">Double protection de votre compte</p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {stage === "loading" && (
        <div className="text-center py-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-10 h-10 mx-auto border-2 border-dz-green/20 border-t-dz-green rounded-full"
          />
        </div>
      )}

      {stage === "already-enrolled" && (
        <Card>
          <div className="flex items-start gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-dz-green/10 flex items-center justify-center text-dz-green flex-shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold text-dz-fg text-sm mb-1">2FA active</p>
              <p className="text-xs text-dz-fg-muted leading-relaxed">
                Votre compte est protege par l&apos;authentification a deux facteurs.
                Un code sera demande a chaque connexion.
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            fullWidth
            loading={unenrolling}
            onClick={handleDisable}
          >
            Desactiver le 2FA
          </Button>
        </Card>
      )}

      {stage === "enroll" && (
        <Card>
          <h2 className="font-bold text-dz-fg text-base mb-2">Activer le 2FA</h2>
          <p className="text-xs text-dz-fg-muted leading-relaxed mb-5">
            Utilisez une application authentificateur (Google Authenticator, Authy,
            1Password) pour generer des codes a 6 chiffres et securiser votre compte.
          </p>

          <ul className="space-y-2 mb-6 text-xs text-dz-fg-muted">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-dz-green/10 text-dz-green flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</span>
              <span>Installez Google Authenticator, Authy ou similaire</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-dz-green/10 text-dz-green flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</span>
              <span>Scannez le QR code qui s&apos;affichera</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-dz-green/10 text-dz-green flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</span>
              <span>Entrez le code a 6 chiffres pour confirmer</span>
            </li>
          </ul>

          <Button fullWidth onClick={startEnrollment}>
            Activer le 2FA
          </Button>
        </Card>
      )}

      {stage === "verify" && qrCode && (
        <Card>
          <h2 className="font-bold text-dz-fg text-base mb-2">Scannez le QR code</h2>
          <p className="text-xs text-dz-fg-muted leading-relaxed mb-5">
            Ouvrez votre application authentificateur et scannez ce code.
          </p>

          <div className="flex justify-center mb-5">
            <div className="p-4 bg-white rounded-2xl border border-dz-border-subtle">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCode}
                alt="QR code 2FA"
                width={200}
                height={200}
                className="w-[200px] h-[200px]"
              />
            </div>
          </div>

          {secret && (
            <div className="mb-5">
              <p className="text-[11px] text-dz-fg-muted mb-2">
                Ou entrez cette cle manuellement :
              </p>
              <div className="bg-dz-bg border border-dz-border-subtle rounded-xl px-3 py-2.5 font-mono text-xs text-dz-fg break-all select-all">
                {secret}
              </div>
            </div>
          )}

          <p className="text-xs font-bold text-dz-fg mb-3 text-center">
            Entrez le code a 6 chiffres
          </p>

          {verifying ? (
            <div className="text-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-8 h-8 mx-auto border-2 border-dz-green/20 border-t-dz-green rounded-full"
              />
            </div>
          ) : (
            <OtpInput
              key={otpKey}
              phone="votre application"
              length={6}
              onComplete={handleVerify}
            />
          )}
        </Card>
      )}

      {stage === "success" && (
        <Card>
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="w-16 h-16 mx-auto mb-4 bg-dz-green/10 rounded-full flex items-center justify-center"
            >
              <svg className="w-10 h-10 text-dz-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </motion.div>
            <h2 className="font-bold text-dz-fg text-lg mb-2">2FA active</h2>
            <p className="text-xs text-dz-fg-muted mb-6">
              Votre compte est desormais protege. Un code sera demande a chaque connexion.
            </p>
            <Button fullWidth onClick={() => router.push(`/${locale}/profile`)}>
              Retour au profil
            </Button>
          </div>
        </Card>
      )}
    </motion.div>
  );
}
