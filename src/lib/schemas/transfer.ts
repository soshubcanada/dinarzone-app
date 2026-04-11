import { z } from "zod";

const VALID_COUNTRIES = ["CA", "DZ", "TN", "QA", "AE"] as const;

export const corridorSchema = z.object({
  fromCountry: z.enum(VALID_COUNTRIES, { errorMap: () => ({ message: "Pays d'envoi invalide" }) }),
  toCountry: z.enum(VALID_COUNTRIES, { errorMap: () => ({ message: "Pays de destination invalide" }) }),
}).refine(
  (data) => data.fromCountry !== data.toCountry,
  { message: "Les pays d'envoi et de destination doivent etre differents" }
);

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

// IBAN: basic structure validation (2 letter country + 2 check digits + BBAN)
const ibanSchema = z
  .string()
  .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$/, "Format IBAN invalide")
  .optional();

export const recipientSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nom du beneficiaire requis")
    .max(100)
    .regex(/^[\p{L}\s'-]+$/u, "Caracteres invalides"),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  accountNumber: z.string().max(30).regex(/^[0-9\s]*$/, "Numero de compte invalide").optional(),
  bankName: z.string().max(100).optional(),
  iban: ibanSchema,
  agentId: z.string().uuid("ID agent invalide").optional(),
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
