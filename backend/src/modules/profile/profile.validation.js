import { z } from "zod";

const updateProfileSchema = z.object({
    firstName: z.string().trim().min(1, "First name is required"),
    middleName: z.string().trim().optional(),
    lastName: z.string().trim().min(1, "Last name is required"),

    phone: z.string().trim().min(1, "Phone number is required"),

    bio: z.string().trim().optional(),

    gender: z.enum(
        ["male", "female", "other"],
        {
            message: "Please select your gender"
        }
    ),

    dateOfBirth: z.coerce.date({
        message: "Date of birth is required"
    }),

    education: z.string().trim().min(1, "Education is required"),
    college: z.string().trim().min(1, "College is required"),
    branch: z.string().trim().min(1, "Branch is required"),
    year: z.string().trim().min(1, "Year is required"),
    semester: z.string().trim().min(1, "Semester is required"),

    github: z.string().trim().optional(),
    linkedin: z.string().trim().optional(),

    skills: z.array(z.string()).min(
        1,
        "Please add at least one skill"
    ),

    currentAddress: z.string().trim().min(
        1,
        "Current address is required"
    ),

    localAddress: z.string().trim().min(
        1,
        "Local address is required"
    ),

    district: z.string().trim().optional(),
    state: z.string().trim().optional(),

    pincode: z.string()
        .trim()
        .min(1, "Pincode is required")
        .regex(/^\d{6}$/, "Pincode must be exactly 6 digits")
});

const partialUpdateProfileSchema = updateProfileSchema.partial();

export { updateProfileSchema, partialUpdateProfileSchema };
