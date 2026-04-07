"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTransferWizard } from "@/lib/hooks/useTransferWizard";
import { DELIVERY_METHOD_INFO } from "@/lib/constants/corridors";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

export default function StepConfirmation() {
  const { locale } = useParams<{ locale: string }>();
  const wizard = useTransferWizard();
  const [copied, setCopied] = useState(false);

  const deliveryInfo = wizard.deliveryMethod
    ? DELIVERY_METHOD_INFO[wizard.deliveryMethod]
    : null;

  const trackingCode = wizard.trackingCode || "DZ-A8F3K2M9";

  const handleSendAnother = () => {
    wizard.reset();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `J'ai envoye ${wizard.receiveAmount.toLocaleString()} ${wizard.receiveCurrency} via DinarZone! Code de suivi: ${trackingCode}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="space-y-6 text-center animate-fade-in">
      {/* Success animation - Revolut style big checkmark */}
      <div className="flex flex-col items-center pt-6">
        <div className="w-24 h-24 rounded-full bg-dz-success/10 flex items-center justify-center mb-5 animate-check-circle">
          <div className="w-20 h-20 rounded-full bg-dz-success/15 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-dz-success"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-dz-text mb-1 animate-scale-in">
          Transfert envoye!
        </h2>
        <p className="text-sm text-dz-text-muted max-w-xs leading-relaxed">
          Votre transfert est en cours de traitement. Le destinataire sera
          notifie.
        </p>
      </div>

      {/* Tracking code - dark premium card with copy */}
      <Card variant="dark" padding="lg" className="bg-gradient-to-br from-dz-green-darkest to-dz-dark relative overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-dz-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />

        <p className="text-[11px] text-white/40 uppercase tracking-widest mb-2 relative">
          Code de suivi
        </p>
        <p className="text-2xl sm:text-3xl font-bold tracking-[0.2em] text-dz-gold relative mb-3">
          {trackingCode}
        </p>
        <button
          onClick={handleCopy}
          className="relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/8 hover:bg-white/12 transition-colors text-xs text-white/60 hover:text-white/80"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-dz-success" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
              </svg>
              Copie!
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
              Copier le code
            </>
          )}
        </button>
      </Card>

      {/* Transfer summary */}
      <Card padding="none">
        <div className="divide-y divide-dz-border/15">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-dz-text-muted">Montant envoye</span>
            <span className="text-sm font-semibold text-dz-text">
              ${wizard.sendAmount.toLocaleString()} {wizard.sendCurrency}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-dz-text-muted">Montant recu</span>
            <span className="text-sm font-bold text-dz-green">
              {wizard.receiveAmount.toLocaleString()} {wizard.receiveCurrency}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-dz-text-muted">Destinataire</span>
            <span className="text-sm font-medium text-dz-text">
              {wizard.recipientName}
            </span>
          </div>
          {deliveryInfo && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-dz-text-muted">Livraison</span>
              <span className="text-sm font-medium text-dz-text">
                {deliveryInfo.label.fr}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-dz-text-muted">Statut</span>
            <Badge color="gold">En cours</Badge>
          </div>
          {deliveryInfo && (
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-dz-text-muted">Delai estime</span>
              <span className="text-sm font-medium text-dz-text">
                {deliveryInfo.estimatedTime.fr}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Action buttons - clear hierarchy */}
      <div className="space-y-3 pt-1">
        <Link href={`/${locale}/track/${trackingCode}`}>
          <Button fullWidth size="lg" icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          }>
            Suivre mon transfert
          </Button>
        </Link>

        <Button
          fullWidth
          size="lg"
          variant="secondary"
          onClick={handleShareWhatsApp}
          icon={
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 2C6.486 2 2 6.486 2 12c0 1.826.495 3.535 1.348 5.009L2 22l5.176-1.332A9.93 9.93 0 0 0 12 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18a7.94 7.94 0 0 1-4.077-1.117l-.29-.175-3.012.775.8-2.916-.191-.302A7.93 7.93 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
            </svg>
          }
        >
          Partager sur WhatsApp
        </Button>

        <button
          onClick={handleSendAnother}
          className="w-full text-center text-sm font-medium text-dz-text-muted hover:text-dz-green transition-colors py-2"
        >
          Envoyer un autre transfert
        </button>
      </div>
    </div>
  );
}
