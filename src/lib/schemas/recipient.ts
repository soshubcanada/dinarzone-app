import { z } from "zod";

export const addRecipientSchema = z.object({
  fullName: z.string().min(2, "Nom requis").max(100),
  country: z.string().length(2, "Pays requis"),
  phone: z.string().min(6, "Telephone invalide").max(20).optional(),
  deliveryMethod: z.enum([
    "baridimob_ccp",
    "cash_pickup",
    "bank_transfer",
    "d17_laposte",
    "exchange_house",
    "virtual_card",
  ]),
  // CCP / BaridiMob
  ccpNumber: z
    .string()
    .regex(/^\d{10,12}(\/\d{2})?$/, "Format CCP invalide (ex: 0012345678/01)")
    .optional(),
  // Bank transfer
  bankName: z.string().optional(),
  iban: z
    .string()
    .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/, "Format IBAN invalide")
    .optional(),
  // Cash pickup
  preferredAgent: z.string().optional(),
  city: z.string().optional(),
  // Notes
  nickname: z.string().max(50).optional(),
});

export type AddRecipientInput = z.infer<typeof addRecipientSchema>;
