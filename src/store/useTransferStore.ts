import { create } from "zustand";

type DeliveryMethod = "baridimob" | "ccp" | "bank" | "cash" | "d17" | "wallet";

type TransferState = {
  step: number;
  direction: number;
  sendAmount: number;
  receiveAmount: number;
  exchangeRate: number;
  fee: number;
  corridor: string;
  sendCurrency: string;
  receiveCurrency: string;
  deliveryMethod: DeliveryMethod | null;
  recipientId: string | null;

  setStep: (step: number) => void;
  setAmount: (send: number, receive: number) => void;
  setCorridor: (corridor: string, rate: number) => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  setRecipient: (id: string) => void;
  setFee: (fee: number) => void;
  reset: () => void;
};

const INITIAL_STATE = {
  step: 1,
  direction: 1,
  sendAmount: 1000,
  receiveAmount: 99500,
  exchangeRate: 99.5,
  fee: 2.5,
  corridor: "CA-DZ",
  sendCurrency: "CAD",
  receiveCurrency: "DZD",
  deliveryMethod: null as DeliveryMethod | null,
  recipientId: null as string | null,
};

export const useTransferStore = create<TransferState>((set) => ({
  ...INITIAL_STATE,

  setStep: (newStep) =>
    set((state) => ({
      step: newStep,
      direction: newStep > state.step ? 1 : -1,
    })),

  setAmount: (send, receive) =>
    set({ sendAmount: send, receiveAmount: receive }),

  setCorridor: (corridor, rate) => {
    if (!/^[A-Z]{2}-[A-Z]{2}$/.test(corridor)) return;
    const [from, to] = corridor.split("-");
    const currencyMap: Record<string, string> = {
      CA: "CAD",
      DZ: "DZD",
      TN: "TND",
      QA: "QAR",
      AE: "AED",
      MA: "MAD",
      FR: "EUR",
      GB: "GBP",
      US: "USD",
      TR: "TRY",
    };
    set((state) => ({
      corridor,
      exchangeRate: rate,
      sendCurrency: currencyMap[from] || "CAD",
      receiveCurrency: currencyMap[to] || "DZD",
      receiveAmount: state.sendAmount * rate,
    }));
  },

  setDeliveryMethod: (method) => set({ deliveryMethod: method }),

  setRecipient: (id) => set({ recipientId: id }),

  setFee: (fee) => set({ fee }),

  reset: () => set(INITIAL_STATE),
}));
