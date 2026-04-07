"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const COUNTRIES = [
  { code: "CA", name: "Canada" },
  { code: "QA", name: "Qatar" },
  { code: "AE", name: "Emirats Arabes Unis" },
  { code: "DZ", name: "Algerie" },
  { code: "TN", name: "Tunisie" },
  { code: "FR", name: "France" },
];

export default function RegisterPage() {
  const { locale } = useParams<{ locale: string }>();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "CA",
    password: "",
    referralCode: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock registration - will connect to Supabase later
    setTimeout(() => {
      setLoading(false);
      window.location.href = `/${locale}/dashboard`;
    }, 1500);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-dz-text mb-1">Creer un compte</h1>
      <p className="text-sm text-dz-text-secondary mb-6">
        Rejoignez DinarZone en quelques minutes
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom complet"
          type="text"
          placeholder="Votre nom et prenom"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          required
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          }
        />

        <Input
          label="Email"
          type="email"
          placeholder="votre@email.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
        />

        <Input
          label="Telephone"
          type="tel"
          placeholder="+1 (514) 000-0000"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          required
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          }
        />

        {/* Country of residence */}
        <div className="w-full">
          <label className="block text-sm font-medium text-dz-text mb-1.5">
            Pays de residence
          </label>
          <select
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            className="w-full h-12 rounded-lg border border-dz-border bg-white px-4 text-base text-dz-text focus:outline-none focus:ring-2 focus:ring-dz-green/30 focus:border-dz-green transition-colors"
            required
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Mot de passe"
          type="password"
          placeholder="Minimum 8 caracteres"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
        />

        <Input
          label="Code de parrainage (optionnel)"
          type="text"
          placeholder="Ex: DZ-FRIEND"
          value={form.referralCode}
          onChange={(e) => update("referralCode", e.target.value)}
          helperText="Vous et votre parrain recevrez un bonus"
        />

        <Button type="submit" fullWidth loading={loading} size="lg">
          Creer mon compte
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
    </div>
  );
}
