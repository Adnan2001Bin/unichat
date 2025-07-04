import { z } from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Group name must be at least 3 characters" })
    .max(100, { message: "Group name cannot exceed 100 characters" })
    .trim(),
  description: z
    .string()
    .trim()
    .max(500, { message: "Description cannot exceed 500 characters" })
    .optional(),
  university: z
    .string()
    .trim()
    .max(100, { message: "University name cannot exceed 100 characters" })
    .optional(),
  coverImage: z
    .string()
    .url({ message: "Invalid URL for cover image" })
    .optional(),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
