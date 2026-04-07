"use client";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { KYC_TIERS } from "@/lib/constants/kyc-tiers";

// ---------- Mock user state ----------
const CURRENT_TIER_ID = "tier_2";
const MONTHLY_USED = 650;

// SVG icons per tier (no emoji)
const TIER_ICONS: Record<string, React.ReactNode> = {
  tier_0: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  tier_1: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  ),
  tier_2: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
    </svg>
  ),
  tier_3: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
  ),
};

type TierStatus = "completed" | "current" | "next" | "locked";

function getTierStatus(tierId: string): TierStatus {
  const tierOrder = ["tier_0", "tier_1", "tier_2", "tier_3"];
  const currentIdx = tierOrder.indexOf(CURRENT_TIER_ID);
  const thisIdx = tierOrder.indexOf(tierId);

  if (thisIdx < currentIdx) return "completed";
  if (thisIdx === currentIdx) return "current";
  if (thisIdx === currentIdx + 1) return "next";
  return "locked";
}

export default function KycPage() {
  const currentTier = KYC_TIERS.find((t) => t.id === CURRENT_TIER_ID)!;
  const usedPercent = (MONTHLY_USED / currentTier.monthlyLimitCAD) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-dz-text">Verification KYC</h1>
        <p className="text-sm text-dz-text-muted mt-0.5">
          Gerez votre niveau de verification
        </p>
      </div>

      {/* Current tier hero card */}
      <Card
        variant="dark"
        padding="lg"
        className="bg-gradient-to-br from-dz-green-darkest via-dz-dark to-dz-dark-card overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-dz-green/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-dz-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          {/* Shield + tier name */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-dz-green/20 border border-dz-green/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-dz-green-light" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
                Votre niveau
              </p>
              <h2 className="text-xl font-bold text-white">
                {currentTier.label.fr}
              </h2>
            </div>
            <Badge color="green" className="ml-auto">Actif</Badge>
          </div>

          {/* Monthly limit progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/40 text-xs">Limite mensuelle</span>
              <span className="text-white/90 text-xs font-semibold">
                ${MONTHLY_USED.toLocaleString()} / ${currentTier.monthlyLimitCAD.toLocaleString()} CAD
              </span>
            </div>
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-dz-gold to-dz-gold-light rounded-full transition-all duration-700"
                style={{ width: `${usedPercent}%` }}
              />
            </div>
            <p className="text-white/30 text-xs mt-1.5">
              ${(currentTier.monthlyLimitCAD - MONTHLY_USED).toLocaleString()} CAD restants ce mois
            </p>
          </div>
        </div>
      </Card>

      {/* Tier progression */}
      <div>
        <h3 className="text-xs font-semibold text-dz-text-muted uppercase tracking-wider mb-3">
          Progression
        </h3>

        <div className="space-y-3">
          {KYC_TIERS.map((tier, index) => {
            const status = getTierStatus(tier.id);
            const isCompleted = status === "completed";
            const isCurrent = status === "current";
            const isNext = status === "next";

            return (
              <Card
                key={tier.id}
                padding="md"
                variant={isCurrent ? "outline" : "default"}
                className={`
                  ${isCurrent ? "border-dz-gold/60 ring-1 ring-dz-gold/20" : ""}
                  ${isCompleted ? "border border-dz-green/30" : ""}
                  ${!isCompleted && !isCurrent && !isNext ? "opacity-60" : ""}
                  animate-stagger-in stagger-${Math.min(index + 1, 5)}
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Icon circle */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? "bg-dz-green/10 text-dz-green"
                        : isCurrent
                        ? "bg-dz-gold/10 text-dz-gold"
                        : "bg-dz-cream text-dz-text-muted"
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      TIER_ICONS[tier.id]
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-dz-text">
                        {tier.label.fr}
                      </h4>
                      {isCurrent && <Badge color="gold">Actuel</Badge>}
                      {isCompleted && <Badge color="green">Valide</Badge>}
                    </div>

                    <p className="text-xs text-dz-text-secondary font-medium mb-2">
                      {tier.monthlyLimitCAD === 0
                        ? "Aucun envoi"
                        : `Jusqu'a $${tier.monthlyLimitCAD.toLocaleString()} CAD / mois`}
                    </p>

                    {/* Requirements list */}
                    <ul className="space-y-1">
                      {tier.requirements.fr.map((req, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-dz-text-muted">
                          {isCompleted ? (
                            <svg className="w-3.5 h-3.5 text-dz-green flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-dz-text-muted/50 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <circle cx="12" cy="12" r="9" />
                            </svg>
                          )}
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Upgrade CTA for next tier */}
                  {isNext && (
                    <Button size="sm" className="flex-shrink-0 mt-1">
                      Upgrader
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Premium upgrade CTA */}
      <Card
        variant="dark"
        padding="lg"
        className="bg-gradient-to-br from-dz-gold/20 via-dz-dark to-dz-dark-card overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-dz-gold/8 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-dz-gold" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-bold text-white">
              Passer a Premium
            </h3>
          </div>

          <ul className="space-y-2 mb-5">
            {[
              "Limite mensuelle de $10,000 CAD",
              "Taux de change preferentiels",
              "Support prioritaire WhatsApp",
              "Transferts instantanes",
              "Carte virtuelle internationale",
            ].map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                <svg className="w-4 h-4 text-dz-gold flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>

          <Button fullWidth size="lg" className="bg-gradient-to-r from-dz-gold to-dz-gold-light text-dz-dark hover:from-dz-gold-light hover:to-dz-gold">
            Demander la verification Premium
          </Button>
        </div>
      </Card>
    </div>
  );
}
