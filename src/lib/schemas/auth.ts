import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const registerSchema = z.object({
  accountType: z.enum(["personal", "business"]),
  fullName: z.string().min(2, "Nom trop court").max(100),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(6, "Numero de telephone invalide").max(20),
  phoneCountry: z.string().length(2),
  country: z.string().length(2),
  password: z
    .string()
    .min(9, "Minimum 9 caracteres")
    .regex(/[a-zA-Z]/, "Doit contenir des lettres")
    .regex(/[0-9]/, "Doit contenir des chiffres"),
  referralCode: z.string().optional(),
  // Business fields
  businessName: z.string().optional(),
  businessType: z.string().optional(),
  businessRegistration: z.string().optional(),
}).refine(
  (data) => {
    if (data.accountType === "business") {
      return !!data.businessName && data.businessName.length >= 2;
    }
    return true;
  },
  { message: "Nom d'entreprise requis", path: ["businessName"] }
);

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
