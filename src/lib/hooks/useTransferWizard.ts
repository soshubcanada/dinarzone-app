import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeliveryMethod } from '../constants/corridors';

export interface TransferWizardState {
  // Step 1: Corridor
  sourceCountry: string;
  destinationCountry: string;
  corridorId: string;

  // Step 2: Amount
  sendAmount: number;
  sendCurrency: string;
  receiveAmount: number;
  receiveCurrency: string;
  exchangeRate: number;
  feeAmount: number;
  totalCharged: number;

  // Step 3: Delivery
  deliveryMethod: DeliveryMethod | null;

  // Step 4: Recipient
  recipientId: string | null;
  recipientName: string;
  recipientPhone: string;
  recipientAccountNumber: string;
  recipientBankName: string;
  recipientCcpKey: string;
  recipientAgentLocationId: string;

  // Wizard state
  currentStep: number;
  rateLockExpiresAt: string | null;
  transferId: string | null;
  trackingCode: string | null;

  // Actions
  setCorridorStep: (data: Partial<TransferWizardState>) => void;
  setAmountStep: (data: Partial<TransferWizardState>) => void;
  setDeliveryStep: (method: DeliveryMethod) => void;
  setRecipientStep: (data: Partial<TransferWizardState>) => void;
  setStep: (step: number) => void;
  setTransferResult: (transferId: string, trackingCode: string) => void;
  reset: () => void;
}

const initialState = {
  sourceCountry: 'CA',
  destinationCountry: 'DZ',
  corridorId: 'CA-DZ',
  sendAmount: 0,
  sendCurrency: 'CAD',
  receiveAmount: 0,
  receiveCurrency: 'DZD',
  exchangeRate: 0,
  feeAmount: 0,
  totalCharged: 0,
  deliveryMethod: null as DeliveryMethod | null,
  recipientId: null as string | null,
  recipientName: '',
  recipientPhone: '',
  recipientAccountNumber: '',
  recipientBankName: '',
  recipientCcpKey: '',
  recipientAgentLocationId: '',
  currentStep: 1,
  rateLockExpiresAt: null as string | null,
  transferId: null as string | null,
  trackingCode: null as string | null,
};

export const useTransferWizard = create<TransferWizardState>()(
  persist(
    (set) => ({
      ...initialState,

      setCorridorStep: (data) => set((state) => ({ ...state, ...data, currentStep: 2 })),

      setAmountStep: (data) => set((state) => ({ ...state, ...data, currentStep: 3 })),

      setDeliveryStep: (method) => set((state) => ({
        ...state,
        deliveryMethod: method,
        currentStep: 4,
      })),

      setRecipientStep: (data) => set((state) => ({ ...state, ...data, currentStep: 5 })),

      setStep: (step) => set({ currentStep: step }),

      setTransferResult: (transferId, trackingCode) => set({
        transferId,
        trackingCode,
        currentStep: 7,
      }),

      reset: () => set(initialState),
    }),
    {
      name: 'dinarzone-transfer-wizard',
      partialize: (state) => ({
        sourceCountry: state.sourceCountry,
        destinationCountry: state.destinationCountry,
        corridorId: state.corridorId,
        sendAmount: state.sendAmount,
        deliveryMethod: state.deliveryMethod,
        recipientId: state.recipientId,
        currentStep: state.currentStep,
      }),
    }
  )
);
