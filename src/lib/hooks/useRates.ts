"use client";

import { useEffect, useState, useCallback } from "react";

interface Rate {
  corridor_code: string;
  from: string;
  to: string;
  mid_market_rate: number;
  dz_rate: number;
  margin_percent: number;
  fee_flat: number;
  fee_percent: number;
  min_amount: number;
  max_amount: number;
}

interface RatesState {
  rates: Rate[];
  updatedAt: string | null;
  loading: boolean;
  error: string | null;
}

export function useRates() {
  const [state, setState] = useState<RatesState>({
    rates: [],
    updatedAt: null,
    loading: true,
    error: null,
  });

  const fetchRates = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const res = await fetch("/api/rates");
      if (!res.ok) throw new Error("Erreur taux");
      const data = await res.json();
      setState({
        rates: data.corridors,
        updatedAt: data.updated_at,
        loading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Impossible de charger les taux",
      }));
    }
  }, []);

  useEffect(() => {
    fetchRates();
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRates]);

  const getRate = useCallback(
    (from: string, to: string) => {
      return state.rates.find((r) => r.from === from && r.to === to);
    },
    [state.rates]
  );

  return { ...state, fetchRates, getRate };
}
