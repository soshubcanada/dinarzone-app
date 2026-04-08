import { z } from "zod";

export const corridorSchema = z.object({
  fromCountry: z.string().length(2, "Pays d'envoi requis"),
  toCountry: z.string().length(2, "Pays de reception requis"),
});

export const amountSchema = z.object({
  sendAmount: z.number().positive("Le montant doit etre positif").max(10000, "Montant maximum depasse"),
  sendCurrency: z.string().length(3),
  receiveAmount: z.number().positive(),
  receiveCurrency: z.string().length(3),
  rate: z.number().positive(),
  fee: z.number().min(0),
});

export const deliverySchema = z.object({
  method: z.enum([
    "baridimob_ccp",
    "cash_pickup",
    "bank_transfer",
    "d17_laposte",
    "exchange_house",
    "virtual_card",
  ]),
});

export const recipientSchema = z.object({
  fullName: z.string().min(2, "Nom du beneficiaire requis").max(100),
  phone: z.string().optional(),
  // Conditional fields based on delivery method
  accountNumber: z.string().optional(), // CCP, BaridiMob, bank account
  bankName: z.string().optional(),
  iban: z.string().optional(),
  agentId: z.string().optional(), // For cash pickup
}).refine(
  (data) => {
    // At least one account identifier must be provided
    return !!(data.accountNumber || data.iban || data.agentId);
  },
  { message: "Informations de paiement requises", path: ["accountNumber"] }
);

export const createTransferSchema = z.object({
  corridor: corridorSchema,
  amount: amountSchema,
  delivery: deliverySchema,
  recipient: recipientSchema,
});

export type CorridorInput = z.infer<typeof corridorSchema>;
export type AmountInput = z.infer<typeof amountSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;
export type RecipientInput = z.infer<typeof recipientSchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;
