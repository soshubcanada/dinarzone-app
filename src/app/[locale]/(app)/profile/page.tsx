"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

// ---------- Mock user ----------
const MOCK_USER = {
  firstName: "Karim",
  lastName: "Benmoussa",
  email: "karim.b@gmail.com",
  phone: "+1 514 555 1234",
  kycTier: "tier_2",
  kycLabel: "Verifie",
  monthlyLimit: 2000,
  language: "Francais",
};

// ---------- Notification toggles ----------
interface NotifChannel {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const NOTIF_CHANNELS: NotifChannel[] = [
  {
    key: "push",
    label: "Notifications push",
    icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
      </svg>
    ),
  },
  {
    key: "sms",
    label: "SMS",
    icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    key: "email",
    label: "Email",
    icon: (
      <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
      </svg>
    ),
  },
];

function getInitials(first: string, last: string) {
  return `${first[0]}${last[0]}`.toUpperCase();
}

// ---------- Settings row component ----------
function SettingsRow({
  icon,
  label,
  right,
  onClick,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${
        onClick ? "hover:bg-dz-cream/40 cursor-pointer" : ""
      }`}
    >
      <span className={danger ? "text-dz-red" : "text-dz-text-muted"}>{icon}</span>
      <span className={`flex-1 text-sm font-medium ${danger ? "text-dz-red" : "text-dz-text"}`}>
        {label}
      </span>
      {right || (
        <svg className="w-4 h-4 text-dz-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </div>
  );
}

// ---------- Toggle component ----------
function Toggle({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        on ? "bg-dz-green" : "bg-dz-border/40"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          on ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

export default function ProfilePage() {
  const { locale } = useParams<{ locale: string }>();
  const initials = getInitials(MOCK_USER.firstName, MOCK_USER.lastName);

  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    push: true,
    sms: true,
    whatsapp: true,
    email: false,
  });

  function toggleNotif(key: string) {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* User card */}
      <Card
        variant="dark"
        padding="lg"
        className="bg-gradient-to-br from-dz-green-darkest via-dz-dark to-dz-dark-card overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-dz-green/5 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative flex items-center gap-4">
          {/* Large initials avatar */}
          <div className="w-16 h-16 rounded-full bg-dz-green/20 border-2 border-dz-green/30 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-dz-green-light">{initials}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white truncate">
                {MOCK_USER.firstName} {MOCK_USER.lastName}
              </h2>
              <Badge color="green">
                <svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
                {MOCK_USER.kycLabel}
              </Badge>
            </div>
            <p className="text-sm text-white/50 truncate">{MOCK_USER.email}</p>
            <p className="text-xs text-white/35 mt-0.5">{MOCK_USER.phone}</p>
          </div>
        </div>
      </Card>

      {/* Language */}
      <div>
        <h3 className="text-xs font-semibold text-dz-text-muted uppercase tracking-wider mb-2">
          Preferences
        </h3>
        <Card padding="none">
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
              </svg>
            }
            label="Langue"
            right={
              <div className="flex items-center gap-2">
                <span className="text-sm text-dz-text-secondary">{MOCK_USER.language}</span>
                <svg className="w-4 h-4 text-dz-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            }
            onClick={() => {}}
          />
        </Card>
      </div>

      {/* Notifications */}
      <div>
        <h3 className="text-xs font-semibold text-dz-text-muted uppercase tracking-wider mb-2">
          Notifications
        </h3>
        <Card padding="none">
          {NOTIF_CHANNELS.map((channel, index) => {
            const isLast = index === NOTIF_CHANNELS.length - 1;
            return (
              <div
                key={channel.key}
                className={`flex items-center gap-3 px-4 py-3.5 ${
                  !isLast ? "border-b border-dz-border/20" : ""
                }`}
              >
                <span className="text-dz-text-muted">{channel.icon}</span>
                <span className="flex-1 text-sm font-medium text-dz-text">
                  {channel.label}
                </span>
                <Toggle
                  on={notifications[channel.key]}
                  onToggle={() => toggleNotif(channel.key)}
                />
              </div>
            );
          })}
        </Card>
      </div>

      {/* Security */}
      <div>
        <h3 className="text-xs font-semibold text-dz-text-muted uppercase tracking-wider mb-2">
          Securite
        </h3>
        <Card padding="none">
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
              </svg>
            }
            label="Changer le mot de passe"
            onClick={() => {}}
          />
          <div className="border-t border-dz-border/20" />
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a48.667 48.667 0 0 0-1.488 2.074M6.67 13.5a48.823 48.823 0 0 1-3.56 4.865M12 10.5a1.5 1.5 0 0 0-3 0c0 1.168-.295 2.27-.817 3.233M12 10.5a48.545 48.545 0 0 1-1.884 7.797M14.07 13.5A48.591 48.591 0 0 1 12 21.75" />
              </svg>
            }
            label="Authentification a deux facteurs (2FA)"
            onClick={() => {}}
          />
        </Card>
      </div>

      {/* Transfer limits */}
      <div>
        <h3 className="text-xs font-semibold text-dz-text-muted uppercase tracking-wider mb-2">
          Limites de transfert
        </h3>
        <Card padding="md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dz-text-secondary">Niveau actuel</span>
              <Badge color="green">{MOCK_USER.kycLabel}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dz-text-secondary">Limite mensuelle</span>
              <span className="text-sm font-semibold text-dz-text">
                ${MOCK_USER.monthlyLimit.toLocaleString()} CAD
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-dz-text-secondary">Par transaction</span>
              <span className="text-sm font-semibold text-dz-text">
                $1,000 CAD
              </span>
            </div>
            <Link href={`/${locale}/kyc`}>
              <div className="flex items-center gap-1 text-sm font-medium text-dz-green hover:text-dz-green-dark transition-colors mt-1">
                <span>Augmenter mes limites</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Help & Support */}
      <div>
        <h3 className="text-xs font-semibold text-dz-text-muted uppercase tracking-wider mb-2">
          Aide &amp; Support
        </h3>
        <Card padding="none">
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
            }
            label="Questions frequentes"
            onClick={() => {}}
          />
          <div className="border-t border-dz-border/20" />
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            }
            label="Nous contacter"
            onClick={() => {}}
          />
          <div className="border-t border-dz-border/20" />
          <SettingsRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
            }
            label="Support WhatsApp"
            onClick={() => {}}
          />
        </Card>
      </div>

      {/* Logout and danger zone */}
      <div className="space-y-3 pb-8">
        <Button
          variant="ghost"
          fullWidth
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
          }
        >
          Se deconnecter
        </Button>

        <button className="w-full text-center text-sm font-medium text-dz-red hover:text-red-700 transition-colors py-2">
          Supprimer mon compte
        </button>

        {/* App version */}
        <p className="text-center text-xs text-dz-text-muted/50 pt-2">
          DinarZone v1.0.0 &middot; Yara AI (QFC)
        </p>
      </div>
    </div>
  );
}
