
import { z } from "zod";

export const signUpSchema = z.object({
  userName: z
    .string()
    .min(2, { message: "Username must be at least 2 characters" })
    .max(50, { message: "Username cannot exceed 50 characters" })
    .trim(),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .trim(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  university: z
    .string()
    .trim() 
    .max(100, { message: "University name cannot exceed 100 characters" })
    .optional(),
  graduationYear: z
    .number()
    .min(1900, { message: "Invalid graduation year" })
    .max(2100, { message: "Invalid graduation year" })
    .optional(),
  interests: z.array(z.string()).optional(),
  bio: z
    .string()
    .trim() 
    .max(200, { message: "Bio cannot exceed 200 characters" })
    .optional(),
  role: z
    .enum(["undergraduate", "graduate", "admin"], {
      message: "Invalid role",
    })
    .default("undergraduate"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
