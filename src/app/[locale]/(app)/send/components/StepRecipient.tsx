"use client";

import { useState } from "react";
import { useTransferWizard } from "@/lib/hooks/useTransferWizard";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const ALGERIAN_BANKS = [
  "BNA - Banque Nationale d'Algerie",
  "CPA - Credit Populaire d'Algerie",
  "BEA - Banque Exterieure d'Algerie",
  "BADR - Banque de l'Agriculture",
  "BDL - Banque de Developpement Local",
  "Societe Generale Algerie",
  "AGB - Gulf Bank Algerie",
];

const TUNISIAN_BANKS = [
  "STB - Societe Tunisienne de Banque",
  "BNA - Banque Nationale Agricole",
  "BIAT - Banque Internationale Arabe de Tunisie",
  "Amen Bank",
  "Attijari Bank",
  "UIB - Union Internationale de Banques",
];

export default function StepRecipient() {
  const wizard = useTransferWizard();
  const [name, setName] = useState(wizard.recipientName || "");
  const [phone, setPhone] = useState(wizard.recipientPhone || "");
  const [accountNumber, setAccountNumber] = useState(wizard.recipientAccountNumber || "");
  const [ccpKey, setCcpKey] = useState(wizard.recipientCcpKey || "");
  const [bankName, setBankName] = useState(wizard.recipientBankName || "");

  const method = wizard.deliveryMethod;
  const isAlgeria = wizard.destinationCountry === "DZ";

  const banks = isAlgeria ? ALGERIAN_BANKS : TUNISIAN_BANKS;

  const isValid = () => {
    if (!name.trim()) return false;
    if (method === "baridimob_ccp") return accountNumber.trim().length > 0;
    if (method === "cash_pickup") return phone.trim().length > 0;
    if (method === "bank_transfer") return bankName.trim().length > 0 && accountNumber.trim().length > 0;
    if (method === "d17_laposte") return phone.trim().length > 0;
    return true;
  };

  const handleContinue = () => {
    wizard.setRecipientStep({
      recipientName: name,
      recipientPhone: phone,
      recipientAccountNumber: accountNumber,
      recipientCcpKey: ccpKey,
      recipientBankName: bankName,
    });
  };

  const handleBack = () => {
    wizard.setStep(3);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-dz-text mb-1">Destinataire</h2>
        <p className="text-sm text-dz-text-secondary">
          Informations de la personne qui recevra l&apos;argent
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          {/* Full name - always shown */}
          <Input
            label="Nom complet du destinataire"
            placeholder="Nom et prenom (tel que sur la piece d'identite)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            }
          />

          {/* BaridiMob / CCP fields */}
          {method === "baridimob_ccp" && (
            <>
              <Input
                label="Numero de compte CCP"
                placeholder="Ex: 00799999 0000 13"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
                helperText="Le numero CCP a 10+ chiffres"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                }
              />
              <Input
                label="Cle CCP"
                placeholder="Ex: 13"
                value={ccpKey}
                onChange={(e) => setCcpKey(e.target.value)}
                helperText="Les 2 derniers chiffres (cle de verification)"
              />
            </>
          )}

          {/* Cash pickup fields */}
          {method === "cash_pickup" && (
            <Input
              label="Telephone du destinataire"
              placeholder={isAlgeria ? "+213 XX XXX XXXX" : "+216 XX XXX XXX"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              helperText="Pour le contacter lors du retrait"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              }
            />
          )}

          {/* D17 / La Poste fields */}
          {method === "d17_laposte" && (
            <Input
              label="Telephone du destinataire"
              placeholder="+216 XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              helperText="Numero lie au compte D17"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              }
            />
          )}

          {/* Bank transfer fields */}
          {method === "bank_transfer" && (
            <>
              <div className="w-full">
                <label className="block text-sm font-medium text-dz-text mb-1.5">
                  Banque
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-12 rounded-lg border border-dz-border bg-white px-4 text-base text-dz-text focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green transition-colors"
                  required
                >
                  <option value="">Selectionnez une banque</option>
                  {banks.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Numero de compte / RIB"
                placeholder="Ex: 00799999000013"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
                helperText="IBAN ou numero de compte bancaire"
              />
            </>
          )}

          {/* Exchange house / virtual card - minimal fields */}
          {(method === "exchange_house" || method === "virtual_card") && (
            <Input
              label="Telephone du destinataire"
              placeholder="+XXX XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="ghost" size="lg" onClick={handleBack} className="px-6">
          Retour
        </Button>
        <Button
          fullWidth
          size="lg"
          onClick={handleContinue}
          disabled={!isValid()}
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
