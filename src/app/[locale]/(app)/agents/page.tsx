"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

// ---------- Types ----------
interface Agent {
  id: string;
  name: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  methods: string[];
  lat: number;
  lng: number;
}

// ---------- Mock data ----------
const COUNTRIES = [
  { code: "DZ", label: "Algerie" },
  { code: "TN", label: "Tunisie" },
  { code: "QA", label: "Qatar" },
  { code: "AE", label: "EAU" },
];

const CITIES: Record<string, { code: string; label: string }[]> = {
  DZ: [
    { code: "alger", label: "Alger" },
    { code: "oran", label: "Oran" },
    { code: "constantine", label: "Constantine" },
  ],
  TN: [
    { code: "tunis", label: "Tunis" },
    { code: "sfax", label: "Sfax" },
  ],
  QA: [
    { code: "doha", label: "Doha" },
  ],
  AE: [
    { code: "dubai", label: "Dubai" },
  ],
};

const MOCK_AGENTS: Agent[] = [
  {
    id: "a1",
    name: "DinarZone Alger Centre",
    country: "DZ",
    city: "alger",
    address: "12 Rue Didouche Mourad, Alger Centre",
    phone: "+213 21 73 45 67",
    hours: "Lun-Sam 9h-18h",
    methods: ["Cash", "Baridimob"],
    lat: 36.7538,
    lng: 3.0588,
  },
  {
    id: "a2",
    name: "DinarZone Bab El Oued",
    country: "DZ",
    city: "alger",
    address: "45 Av. Colonel Lotfi, Bab El Oued",
    phone: "+213 21 96 12 34",
    hours: "Lun-Sam 8h30-17h30",
    methods: ["Cash", "CCP"],
    lat: 36.7875,
    lng: 3.0511,
  },
  {
    id: "a3",
    name: "DinarZone Oran Medina",
    country: "DZ",
    city: "oran",
    address: "8 Bd Emir Abdelkader, Oran",
    phone: "+213 41 33 22 11",
    hours: "Lun-Sam 9h-17h",
    methods: ["Cash", "Baridimob", "CCP"],
    lat: 35.6969,
    lng: -0.6331,
  },
  {
    id: "a4",
    name: "DinarZone Constantine",
    country: "DZ",
    city: "constantine",
    address: "22 Rue Ben M'hidi, Constantine",
    phone: "+213 31 92 55 44",
    hours: "Lun-Ven 9h-16h30",
    methods: ["Cash"],
    lat: 36.3650,
    lng: 6.6147,
  },
  {
    id: "a5",
    name: "DinarZone Tunis Centre",
    country: "TN",
    city: "tunis",
    address: "15 Avenue Habib Bourguiba, Tunis",
    phone: "+216 71 34 56 78",
    hours: "Lun-Sam 8h30-18h",
    methods: ["Cash", "Virement"],
    lat: 36.8065,
    lng: 10.1815,
  },
  {
    id: "a6",
    name: "DinarZone Sfax",
    country: "TN",
    city: "sfax",
    address: "Avenue de la Liberte, Sfax",
    phone: "+216 74 22 33 44",
    hours: "Lun-Ven 9h-17h",
    methods: ["Cash", "Virement"],
    lat: 34.7406,
    lng: 10.7603,
  },
  {
    id: "a7",
    name: "DinarZone Doha - QFC",
    country: "QA",
    city: "doha",
    address: "Qatar Financial Centre, Tower 2, West Bay",
    phone: "+974 4412 5678",
    hours: "Dim-Jeu 8h-17h",
    methods: ["Cash", "Virement"],
    lat: 25.3236,
    lng: 51.5310,
  },
  {
    id: "a8",
    name: "DinarZone Dubai - DIFC",
    country: "AE",
    city: "dubai",
    address: "Gate Village, DIFC, Dubai",
    phone: "+971 4 355 6789",
    hours: "Dim-Jeu 9h-18h",
    methods: ["Cash", "Virement"],
    lat: 25.2138,
    lng: 55.2797,
  },
];

export default function AgentsPage() {
  const [activeCountry, setActiveCountry] = useState("DZ");
  const [activeCity, setActiveCity] = useState<string | null>(null);

  const cities = CITIES[activeCountry] || [];
  const filtered = MOCK_AGENTS.filter(
    (a) =>
      a.country === activeCountry &&
      (activeCity ? a.city === activeCity : true)
  );

  function handleCountryChange(code: string) {
    setActiveCountry(code);
    setActiveCity(null);
  }

  function openMaps(agent: Agent) {
    const url = `https://www.google.com/maps/search/?api=1&query=${agent.lat},${agent.lng}`;
    window.open(url, "_blank", "noopener");
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-dz-text">Points de retrait</h1>
        <p className="text-sm text-dz-text-muted mt-0.5">
          Trouvez un agent pres de votre famille
        </p>
      </div>

      {/* Country tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
        {COUNTRIES.map((c) => (
          <button
            key={c.code}
            onClick={() => handleCountryChange(c.code)}
            className={`flex-shrink-0 h-9 px-4 rounded-full text-sm font-medium transition-all ${
              activeCountry === c.code
                ? "btn-gradient text-white"
                : "bg-white border border-dz-border/40 text-dz-text-secondary hover:border-dz-green/40 hover:text-dz-green"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* City filter */}
      {cities.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCity(null)}
            className={`flex-shrink-0 h-8 px-3 rounded-lg text-xs font-medium transition-all ${
              activeCity === null
                ? "bg-dz-green/10 text-dz-green border border-dz-green/20"
                : "bg-dz-cream/60 text-dz-text-secondary hover:bg-dz-cream"
            }`}
          >
            Toutes
          </button>
          {cities.map((city) => (
            <button
              key={city.code}
              onClick={() => setActiveCity(city.code)}
              className={`flex-shrink-0 h-8 px-3 rounded-lg text-xs font-medium transition-all ${
                activeCity === city.code
                  ? "bg-dz-green/10 text-dz-green border border-dz-green/20"
                  : "bg-dz-cream/60 text-dz-text-secondary hover:bg-dz-cream"
              }`}
            >
              {city.label}
            </button>
          ))}
        </div>
      )}

      {/* Agent list */}
      {filtered.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dz-cream flex items-center justify-center">
            <svg className="w-8 h-8 text-dz-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          <h3 className="font-semibold text-dz-text mb-1">Aucun agent trouve</h3>
          <p className="text-sm text-dz-text-muted">
            Nous ne disposons pas encore d&apos;agents dans cette zone.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((agent, index) => (
            <Card
              key={agent.id}
              padding="md"
              className={`animate-stagger-in stagger-${Math.min(index + 1, 5)}`}
            >
              <div className="space-y-3">
                {/* Agent name */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-dz-green/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-dz-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-dz-text">{agent.name}</h3>
                      <p className="text-xs text-dz-text-muted mt-0.5">{agent.address}</p>
                    </div>
                  </div>
                </div>

                {/* Details row */}
                <div className="flex items-center gap-4 text-xs text-dz-text-secondary">
                  {/* Phone */}
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                    </svg>
                    {agent.phone}
                  </span>
                  {/* Hours */}
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {agent.hours}
                  </span>
                </div>

                {/* Methods + maps link */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {agent.methods.map((m) => (
                      <Badge key={m} color="gray">{m}</Badge>
                    ))}
                  </div>
                  <button
                    onClick={() => openMaps(agent)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-dz-green hover:text-dz-green-dark transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    Ouvrir dans Maps
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
