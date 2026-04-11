import { z } from "zod";

// ---------- Phone: E.164 format ----------
const phoneSchema = z
  .string()
  .min(8, "Numero trop court")
  .max(16, "Numero trop long")
  .regex(/^\+?[1-9]\d{6,14}$/, "Format invalide (ex: +15145551234)");

// ---------- Password: fintech-grade ----------
const passwordSchema = z
  .string()
  .min(10, "Minimum 10 caracteres")
  .max(128, "Maximum 128 caracteres")
  .regex(/[a-z]/, "Doit contenir une minuscule")
  .regex(/[A-Z]/, "Doit contenir une majuscule")
  .regex(/[0-9]/, "Doit contenir un chiffre")
  .regex(/[^a-zA-Z0-9]/, "Doit contenir un caractere special (!@#$...)");

// ---------- Login ----------
export const loginSchema = z.object({
  email: z.string().email("Adresse email invalide").max(255),
  password: z.string().min(1, "Mot de passe requis").max(128),
});

// ---------- Register ----------
export const registerSchema = z
  .object({
    accountType: z.enum(["personal", "business"]),
    fullName: z
      .string()
      .min(2, "Nom trop court")
      .max(100, "Nom trop long")
      .regex(/^[\p{L}\s'-]+$/u, "Caracteres invalides dans le nom"),
    email: z.string().email("Adresse email invalide").max(255),
    phone: phoneSchema,
    phoneCountry: z.string().length(2).toUpperCase(),
    country: z.string().length(2).toUpperCase(),
    password: passwordSchema,
    referralCode: z
      .string()
      .max(20)
      .regex(/^[A-Z0-9-]*$/, "Code invalide")
      .optional(),
    // Business fields
    businessName: z.string().max(200).optional(),
    businessType: z.string().max(100).optional(),
    businessRegistration: z.string().max(50).optional(),
  })
  .refine(
    (data) => {
      if (data.accountType === "business") {
        return !!data.businessName && data.businessName.length >= 2;
      }
      return true;
    },
    { message: "Nom d'entreprise requis", path: ["businessName"] }
  );

// ---------- Exports ----------
export { phoneSchema, passwordSchema };
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
