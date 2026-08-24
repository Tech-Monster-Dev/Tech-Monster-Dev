import { z } from "zod";

export const registerSchema = z.object({

    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username is too long"),

    email: z
        .string()
        .trim()
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "At least one uppercase letter")
        .regex(/[a-z]/, "At least one lowercase letter")
        .regex(/[0-9]/, "At least one number")
        .regex(/[^A-Za-z0-9]/, "At least one special character"),

    terms: z
        .literal(true, {
            error: "You must accept the Terms & Conditions"
        }),

    role: z
        .enum(["student", "admin"])
        .optional()
        .default("student")

});

export const loginSchema = z.object({

    email: z.email(),

    password: z.string().min(1)

});