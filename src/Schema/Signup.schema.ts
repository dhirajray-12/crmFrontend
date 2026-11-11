// signup.schema.ts
import { z } from "zod";

export const signupBaseSchema = z.object({
  firstName: z
    .string()
    .min(3, "Minimum 3 characters")
    .nonempty("First name is required"),
  lastName: z
    .string()
    .min(3, "Minimum 3 characters")
    .nonempty("Last name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  confirmPassword: z.string(),
  countryCode: z
    .string()
    .regex(/^\+\d{1,4}$/, "Select a valid country code"),
  phone: z
    .string()
    .regex(/^\d{4,14}$/, "Phone number must be 4 to 14 digits"),
  zipCode: z.string().min(4, "Zip code required"),
  state: z.string().min(2, "State required"),
  dateofbirth: z.string().min(1, "Date of birth required"),
  country: z.string().min(1, "Country required"),
});

export const signupSchema = signupBaseSchema
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
