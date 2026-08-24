import { z } from "zod";


export const signupSchema = z
    .object({

        username: z
            .string()
            .trim()
            .min(3, "First name must be at least 3 characters")
            .max(30, "First name too long"),

        email: z
            .string()
            .trim()
            .email("Please enter a valid email"),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /[A-Z]/,
                "At least one uppercase letter"
            )
            .regex(
                /[a-z]/,
                "At least one lowercase letter"
            )
            .regex(
                /[0-9]/,
                "At least one number"
            )
            .regex(
                /[^A-Za-z0-9]/,
                "At least one special character"
            ),

        confirmPassword: z
            .string(),

        terms: z
            .boolean()
            .refine(
                value => value === true,
                {
                    message: "Please accept Terms & Conditions"
                }
            )
    })

    .refine(
        (data) => data.password === data.confirmPassword,
        {
            path: ["confirmPassword"],
            message: "Passwords do not match"
        }
    );