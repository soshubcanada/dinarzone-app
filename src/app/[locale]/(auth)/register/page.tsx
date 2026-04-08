"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type AccountType = "personal" | "business";

const COUNTRIES = [
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "QA", name: "Qatar", dial: "+974", flag: "🇶🇦" },
  { code: "AE", name: "Emirats Arabes Unis", dial: "+971", flag: "🇦🇪" },
  { code: "DZ", name: "Algerie", dial: "+213", flag: "🇩🇿" },
  { code: "TN", name: "Tunisie", dial: "+216", flag: "🇹🇳" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "MA", name: "Maroc", dial: "+212", flag: "🇲🇦" },
  { code: "US", name: "Etats-Unis", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "Royaume-Uni", dial: "+44", flag: "🇬🇧" },
];

const BUSINESS_TYPES = [
  "Entreprise individuelle",
  "Societe (SARL, SAS, etc.)",
  "Freelance / Auto-entrepreneur",
  "ONG / Association",
  "Autre",
];

export default function RegisterPage() {
  const { locale } = useParams<{ locale: string }>();
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>("personal");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    phoneCountry: "CA",
    country: "CA",
    password: "",
    referralCode: "",
    businessName: "",
    businessType: "",
    businessRegistration: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const selectedPhoneCountry = COUNTRIES.find((c) => c.code === form.phoneCountry);

  // Password strength
  const passwordChecks = useMemo(() => {
    const p = form.password;
    return {
      length: p.length >= 9,
      letter: /[a-zA-Z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[^a-zA-Z0-9]/.test(p),
    };
  }, [form.password]);

  const strengthScore = Object.values(passwordChecks).filter(Boolean).length;
  const strengthLabel = ["", "Faible", "Moyen", "Bon", "Excellent"][strengthScore];
  const strengthColor = [
    "bg-gray-200",
    "bg-dz-red",
    "bg-amber-400",
    "bg-dz-green/60",
    "bg-dz-green",
  ][strengthScore];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = `/${locale}/dashboard`;
    }, 1500);
  };

  return (
    <div className="animate-fade-in">
      {/* Account type toggle — Wise style */}
      <div className="flex rounded-xl bg-dz-cream/80 p-1 mb-6">
        <button
          type="button"
          onClick={() => setAccountType("personal")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            accountType === "personal"
              ? "bg-white text-dz-text shadow-sm"
              : "text-dz-text-muted hover:text-dz-text"
          }`}
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Personnel
        </button>
        <button
          type="button"
          onClick={() => setAccountType("business")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            accountType === "business"
              ? "bg-white text-dz-text shadow-sm"
              : "text-dz-text-muted hover:text-dz-text"
          }`}
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18m16.5-18v18M5.25 4.5h1.5M5.25 7.5h1.5M5.25 10.5h1.5M5.25 13.5h1.5M5.25 16.5h1.5M17.25 4.5h1.5M17.25 7.5h1.5M17.25 10.5h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
          </svg>
          Entreprise
        </button>
      </div>

      {/* Subtitle based on type */}
      <h1 className="text-2xl font-bold text-dz-text mb-1">
        {accountType === "personal" ? "Creer un compte personnel" : "Creer un compte entreprise"}
      </h1>
      <p className="text-sm text-dz-text-secondary mb-6">
        {accountType === "personal"
          ? "Envoyez de l'argent a vos proches, simplement et en toute securite"
          : "Payez vos fournisseurs et freelances a l'international"}
      </p>

      {/* Social signup */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2.5 h-11 rounded-xl border border-dz-border/60 hover:bg-dz-cream/50 hover:border-dz-border transition-all text-sm font-medium text-dz-text card-press"
        >
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2.5 h-11 rounded-xl border border-dz-border/60 hover:bg-dz-cream/50 hover:border-dz-border transition-all text-sm font-medium text-dz-text card-press"
        >
          <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Apple
        </button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dz-border/40" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-4 text-dz-text-muted">Ou avec votre email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full name */}
        <Input
          label="Nom complet"
          type="text"
          placeholder={accountType === "personal" ? "Votre nom et prenom" : "Nom du representant legal"}
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          required
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          }
        />

        {/* Business fields */}
        {accountType === "business" && (
          <>
            <Input
              label="Nom de l'entreprise"
              type="text"
              placeholder="Ex: Sahara Import-Export SARL"
              value={form.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              required
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M3.75 3v18m16.5-18v18M5.25 4.5h1.5M5.25 7.5h1.5M5.25 10.5h1.5M5.25 13.5h1.5M5.25 16.5h1.5M17.25 4.5h1.5M17.25 7.5h1.5M17.25 10.5h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              }
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-dz-text mb-2">
                Type d&apos;entreprise
              </label>
              <select
                value={form.businessType}
                onChange={(e) => update("businessType", e.target.value)}
                className="w-full h-12 rounded-xl border-[1.5px] border-dz-border/60 bg-white px-4 text-[15px] text-dz-text focus:outline-none focus:ring-3 focus:ring-dz-green/12 focus:border-dz-green transition-all"
                required
              >
                <option value="" disabled>Selectionnez</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <Input
              label="Numero d'enregistrement (optionnel)"
              type="text"
              placeholder="NEQ, RC, QFC, etc."
              value={form.businessRegistration}
              onChange={(e) => update("businessRegistration", e.target.value)}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
            />
          </>
        )}

        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder={accountType === "personal" ? "votre@email.com" : "contact@entreprise.com"}
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
        />

        {/* Phone with country code — Wise style */}
        <div className="w-full">
          <label className="block text-sm font-medium text-dz-text mb-2">
            Telephone
          </label>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={form.phoneCountry}
                onChange={(e) => update("phoneCountry", e.target.value)}
                className="h-12 rounded-xl border-[1.5px] border-dz-border/60 bg-white pl-3 pr-8 text-[15px] text-dz-text focus:outline-none focus:ring-3 focus:ring-dz-green/12 focus:border-dz-green transition-all appearance-none cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.dial}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-dz-text-muted pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
            <input
              type="tel"
              placeholder={selectedPhoneCountry?.code === "CA" ? "(514) 000-0000" : "Numero de telephone"}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
              className="flex-1 h-12 rounded-xl border-[1.5px] border-dz-border/60 bg-white px-4 text-[15px] text-dz-text placeholder:text-dz-text-muted/60 focus:outline-none focus:ring-3 focus:ring-dz-green/12 focus:border-dz-green transition-all"
            />
          </div>
          <p className="mt-1.5 text-xs text-dz-text-muted">
            Nous vous enverrons un code de verification par SMS
          </p>
        </div>

        {/* Country of residence */}
        <div className="w-full">
          <label className="block text-sm font-medium text-dz-text mb-2">
            {accountType === "personal" ? "Pays de residence" : "Pays d'enregistrement"}
          </label>
          <div className="relative">
            <select
              value={form.country}
              onChange={(e) => update("country", e.target.value)}
              className="w-full h-12 rounded-xl border-[1.5px] border-dz-border/60 bg-white pl-11 pr-4 text-[15px] text-dz-text focus:outline-none focus:ring-3 focus:ring-dz-green/12 focus:border-dz-green transition-all appearance-none cursor-pointer"
              required
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-lg">
              {COUNTRIES.find((c) => c.code === form.country)?.flag}
            </div>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dz-text-muted pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Password with strength meter */}
        <div className="w-full">
          <label className="block text-sm font-medium text-dz-text mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-dz-text-muted">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 9 caracteres"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              minLength={9}
              className="w-full h-12 rounded-xl border-[1.5px] border-dz-border/60 bg-white ps-11 pe-12 text-[15px] text-dz-text placeholder:text-dz-text-muted/60 focus:outline-none focus:ring-3 focus:ring-dz-green/12 focus:border-dz-green transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 end-0 flex items-center pe-3.5 text-dz-text-muted hover:text-dz-text transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Strength bar */}
          {form.password.length > 0 && (
            <div className="mt-2.5">
              <div className="flex gap-1 mb-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= strengthScore ? strengthColor : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between items-start">
                <span className={`text-xs font-medium ${
                  strengthScore <= 1 ? "text-dz-red" :
                  strengthScore === 2 ? "text-amber-500" :
                  "text-dz-green"
                }`}>
                  {strengthLabel}
                </span>
              </div>
              <div className="mt-1.5 space-y-0.5">
                <PasswordCheck ok={passwordChecks.length} label="Au moins 9 caracteres" />
                <PasswordCheck ok={passwordChecks.letter} label="Contient des lettres" />
                <PasswordCheck ok={passwordChecks.number} label="Contient des chiffres" />
                <PasswordCheck ok={passwordChecks.special} label="Contient un caractere special" />
              </div>
            </div>
          )}
        </div>

        {/* Referral code */}
        <Input
          label="Code de parrainage (optionnel)"
          type="text"
          placeholder="Ex: DZ-FRIEND"
          value={form.referralCode}
          onChange={(e) => update("referralCode", e.target.value)}
          helperText="Vous et votre parrain recevrez un transfert gratuit"
        />

        {/* Terms acceptance */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-5 h-5 rounded-md border-[1.5px] border-dz-border/60 bg-white peer-checked:bg-dz-green peer-checked:border-dz-green peer-focus-visible:ring-3 peer-focus-visible:ring-dz-green/20 transition-all flex items-center justify-center">
              {acceptTerms && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-dz-text-secondary leading-snug">
            J&apos;accepte les{" "}
            <Link href="#" className="text-dz-green font-medium hover:underline">
              Conditions d&apos;utilisation
            </Link>
            {" "}et la{" "}
            <Link href="#" className="text-dz-green font-medium hover:underline">
              Politique de confidentialite
            </Link>
            {" "}de DinarZone
          </span>
        </label>

        <Button
          type="submit"
          fullWidth
          loading={loading}
          size="lg"
          className={!acceptTerms ? "opacity-50 cursor-not-allowed" : ""}
        >
          {accountType === "personal" ? "Creer mon compte" : "Creer mon compte entreprise"}
        </Button>
      </form>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-dz-text-secondary">
        Deja un compte?{" "}
        <Link
          href={`/${locale}/login`}
          className="text-dz-green font-semibold hover:text-dz-green-dark transition-colors"
        >
          Se connecter
        </Link>
      </p>

      {/* Trust badges */}
      <div className="mt-6 pt-5 border-t border-dz-border/30">
        <div className="flex items-center justify-center gap-5 flex-wrap">
          <TrustBadge
            icon={<path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25z" clipRule="evenodd" />}
            label="FINTRAC"
          />
          <div className="w-px h-3 bg-dz-border/40" />
          <TrustBadge
            icon={<path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />}
            label="AES-256"
          />
          <div className="w-px h-3 bg-dz-border/40" />
          <TrustBadge
            icon={<path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08z" clipRule="evenodd" />}
            label="QFC"
          />
          <div className="w-px h-3 bg-dz-border/40" />
          <TrustBadge
            icon={<><path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z" /><path d="m3.265 10.602 7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.13 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.71 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.738Z" /></>}
            label="2FA"
          />
        </div>
      </div>
    </div>
  );
}

function PasswordCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {ok ? (
        <svg className="w-3.5 h-3.5 text-dz-green" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" clipRule="evenodd" />
        </svg>
      )}
      <span className={`text-xs ${ok ? "text-dz-green" : "text-dz-text-muted"}`}>{label}</span>
    </div>
  );
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-dz-text-muted">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        {icon}
      </svg>
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}
