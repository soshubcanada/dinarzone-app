"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useKycStore } from "@/store/useKycStore";
import { createClient } from "@/lib/supabase/client";

// ---------- Animation ----------
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// ---------- Premium toggle ----------
function PremiumToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 flex items-center p-1 ${
        on ? "bg-[#00A84D]" : "bg-dz-border/30 border border-dz-border-subtle"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`block w-5 h-5 bg-white rounded-full shadow-md ${on ? "ml-auto" : ""}`}
      />
    </button>
  );
}

// ---------- Settings row ----------
function SettingsRow({
  icon,
  label,
  sublabel,
  right,
  onClick,
  danger = false,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between p-4 transition-colors ${
        onClick ? "hover:bg-white/5 cursor-pointer active:bg-white/10" : ""
      } ${!last ? "border-b border-dz-border-subtle" : ""}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-dz-border-subtle ${
          danger ? "text-dz-red" : "text-dz-fg-muted"
        }`}>
          {icon}
        </div>
        <div>
          <p className={`font-bold text-sm ${danger ? "text-dz-red" : "text-dz-fg"}`}>{label}</p>
          {sublabel && <p className="text-[10px] text-dz-fg-muted">{sublabel}</p>}
        </div>
      </div>
      {right || (
        <svg className="w-4 h-4 text-dz-fg-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </div>
  );
}

// ---------- Tier labels ----------
const TIER_LABELS: Record<string, string> = {
  tier_0: "Non verifie",
  tier_1: "Basique",
  tier_2: "Verifie",
  tier_3: "Premium",
};

const TIER_LEVEL: Record<string, number> = {
  tier_0: 0,
  tier_1: 1,
  tier_2: 2,
  tier_3: 3,
};

export default function ProfilePage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const kyc = useKycStore();

  const [faceIdEnabled, setFaceIdEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // Avatar upload
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // TODO: upload to Supabase Storage — for now, local preview
      setTimeout(() => {
        const imageUrl = URL.createObjectURL(file);
        setAvatar(imageUrl);
        setIsUploading(false);
      }, 1500);
    }
  };

  const triggerFileInput = () => {
    if (!isUploading) fileInputRef.current?.click();
  };

  const usedPercent = kyc.monthlyLimitCAD > 0
    ? Math.round((kyc.monthlyUsedCAD / kyc.monthlyLimitCAD) * 100)
    : 0;

  const tierLabel = TIER_LABELS[kyc.tierId] || kyc.tierLabel;
  const tierLevel = TIER_LEVEL[kyc.tierId] ?? 0;

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    const loc = (locale as string) || "fr";
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore — we always redirect regardless
    }
    router.push(`/${loc}/login`);
    router.refresh();
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {/* 1. User Identity Card with Avatar Upload */}
      <motion.div
        variants={itemVariants}
        className="relative w-full rounded-3xl p-6 overflow-hidden bg-dz-card border border-dz-border-subtle shadow-xl"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A84D] rounded-full blur-3xl opacity-10 pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          {/* Interactive avatar */}
          <div
            onClick={triggerFileInput}
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#00A84D] to-[#004D26] p-[2px] shadow-lg cursor-pointer group flex-shrink-0"
          >
            <div className="w-full h-full rounded-full bg-dz-bg flex items-center justify-center border-2 border-dz-bg overflow-hidden relative">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-dz-fg">KB</span>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                </svg>
              </div>

              {/* Upload spinner */}
              <AnimatePresence>
                {isUploading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-dz-bg/80 backdrop-blur-sm flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white/20 border-t-[#00A84D] rounded-full"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Edit badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-dz-card border-2 border-dz-card rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-3 h-3 text-dz-fg-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-dz-fg truncate">Karim Benmoussa</h2>
            <div className="inline-flex items-center gap-1.5 bg-[#00A84D]/10 border border-[#00A84D]/30 px-2.5 py-1 rounded-md mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00A84D]" />
              <span className="text-[10px] font-bold text-[#00A84D] uppercase tracking-wider">
                {tierLabel} (Niv. {tierLevel})
              </span>
            </div>
          </div>

          <Link href={`/${locale}/kyc`}>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-dz-border-subtle">
              <svg className="w-4 h-4 text-dz-fg-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
              </svg>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* 2. Personal Information */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xs font-bold text-dz-fg-muted uppercase tracking-wider mb-3 ml-2">
          Informations Personnelles
        </h3>
        <Card padding="none">
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            }
            label="Adresse E-mail"
            sublabel="n.dahmani@exemple.com"
            right={<span className="text-xs font-bold text-[#00A84D]">Modifier</span>}
            onClick={() => {}}
          />
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            }
            label="Telephone (Valide)"
            sublabel="+1 (514) *** **34"
            onClick={() => {}}
          />
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            }
            label="Adresse de Residence"
            sublabel="1234 Rue Sainte-Catherine, Montreal, QC"
            onClick={() => {}}
            last
          />
        </Card>
      </motion.div>

      {/* 3. Account Limits — Animated progress */}
      <motion.div variants={itemVariants} className="bg-dz-card border border-dz-border-subtle rounded-3xl p-5 shadow-lg">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-sm font-bold text-dz-fg">Limite d&apos;envoi mensuelle</p>
            <p className="text-xs text-dz-fg-muted">Reinitialisation le 1er du mois</p>
          </div>
          <p className="text-sm font-bold text-dz-fg tabular-nums">
            {kyc.monthlyUsedCAD.toLocaleString("fr-CA")} / {kyc.monthlyLimitCAD.toLocaleString("fr-CA")} CAD
          </p>
        </div>
        <div className="h-2 w-full bg-dz-bg rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usedPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#00A84D] to-[#B8923B] rounded-full"
          />
        </div>
        <Link href={`/${locale}/kyc`}>
          <p className="mt-4 text-xs font-bold text-[#00A84D] hover:underline">
            Demander une augmentation
          </p>
        </Link>
      </motion.div>

      {/* 3. Security */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xs font-bold text-dz-fg-muted uppercase tracking-wider mb-3 ml-2">
          Securite
        </h3>
        <Card padding="none">
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a48.667 48.667 0 0 0-1.488 2.074M6.67 13.5a48.823 48.823 0 0 1-3.56 4.865M12 10.5a1.5 1.5 0 0 0-3 0c0 1.168-.295 2.27-.817 3.233M12 10.5a48.545 48.545 0 0 1-1.884 7.797M14.07 13.5A48.591 48.591 0 0 1 12 21.75" />
              </svg>
            }
            label="FaceID / Biometrie"
            sublabel="Connexion sans mot de passe"
            right={<PremiumToggle on={faceIdEnabled} onToggle={() => setFaceIdEnabled(!faceIdEnabled)} />}
          />
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
            }
            label="Code PIN de l&apos;application"
            sublabel="Modifier le code a 4 chiffres"
            onClick={() => {}}
          />
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            }
            label="Authentification 2FA"
            sublabel="Protection renforcee du compte"
            onClick={() => router.push(`/${locale}/profile/2fa`)}
          />
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
              </svg>
            }
            label="Appareils Connectes"
            sublabel="1 appareil actif"
            onClick={() => {}}
            last
          />
        </Card>
      </motion.div>

      {/* 4. Preferences */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xs font-bold text-dz-fg-muted uppercase tracking-wider mb-3 ml-2">
          Preferences
        </h3>
        <Card padding="none">
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
              </svg>
            }
            label="Langue de l&apos;application"
            sublabel="Francais (Canada)"
            onClick={() => {}}
          />
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
            }
            label="Notifications Push"
            sublabel="Statut des transferts et alertes"
            right={<PremiumToggle on={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} />}
            last
          />
        </Card>
      </motion.div>

      {/* 5. Support & Legal */}
      <motion.div variants={itemVariants}>
        <Card padding="none">
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
            }
            label="Contacter le support client"
            onClick={() => {}}
          />
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            }
            label="Mentions legales &amp; CGU"
            onClick={() => {}}
            last
          />
        </Card>
      </motion.div>

      {/* 6. Logout */}
      <motion.div variants={itemVariants} className="space-y-3 pb-8">
        <Button
          variant="ghost"
          fullWidth
          onClick={handleSignOut}
          loading={signingOut}
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
          }
        >
          Se deconnecter
        </Button>

        <p className="text-center text-xs text-dz-fg-muted/50 pt-2">
          DinarZone v1.0.4 &middot; Concu a Montreal &amp; Doha
        </p>
      </motion.div>
    </motion.div>
  );
}
