import { z } from "zod";

export const updateProfileSchema = z.object({
  userName: z
    .string()
    .min(2, { message: "Username must be at least 2 characters" })
    .max(50, { message: "Username cannot exceed 50 characters" })
    .trim()
    .optional(),
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
  profilePicture: z.string().url({ message: "Invalid URL" }).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
