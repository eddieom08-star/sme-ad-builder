import { z } from "zod";
import { BUSINESS_CATEGORIES } from "@/lib/store/onboarding";

// Business hours schema
const businessHoursSchema = z.object({
  open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional(),
  closed: z.boolean(),
});

// Phone number validation (US format)
const phoneRegex = /^(\+1|1)?[-.\s]?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

// Business profile form schema
export const businessProfileSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must not exceed 100 characters"),

  category: z.enum(BUSINESS_CATEGORIES, {
    required_error: "Please select a business category",
  }),

  services: z
    .array(z.string())
    .min(1, "Add at least one service")
    .max(10, "Maximum 10 services allowed"),

  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal("")),

  location: z.object({
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required").max(2, "Use 2-letter state code"),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
    serviceRadius: z
      .number()
      .min(1, "Service radius must be at least 1 mile")
      .max(100, "Service radius cannot exceed 100 miles"),
  }),

  contact: z.object({
    phone: z.string().regex(phoneRegex, "Invalid phone number"),
    email: z.string().email("Invalid email address"),
    website: z
      .string()
      .url("Invalid website URL")
      .optional()
      .or(z.literal("")),
  }),

  hours: z.object({
    monday: businessHoursSchema,
    tuesday: businessHoursSchema,
    wednesday: businessHoursSchema,
    thursday: businessHoursSchema,
    friday: businessHoursSchema,
    saturday: businessHoursSchema,
    sunday: businessHoursSchema,
  }),
});

export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;

// Partial schema for auto-save (allows incomplete data)
export const businessProfilePartialSchema = businessProfileSchema.partial();
