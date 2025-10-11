"use server";

import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { businessProfilePartialSchema } from "@/lib/validations/onboarding";
import type { BusinessProfileData } from "@/lib/store/onboarding";

interface SaveBusinessProfileResult {
  success: boolean;
  businessId?: number;
  error?: string;
}

export async function saveBusinessProfile(
  data: Partial<BusinessProfileData>
): Promise<SaveBusinessProfileResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate the data (partial validation for auto-save)
    const validatedData = businessProfilePartialSchema.parse(data);

    // Check if business already exists for this user
    const existingBusiness = await db.query.businesses.findFirst({
      where: eq(businesses.ownerId, parseInt(session.user.id)),
    });

    if (existingBusiness) {
      // Update existing business
      const [updated] = await db
        .update(businesses)
        .set({
          name: validatedData.businessName || existingBusiness.name,
          industry: validatedData.category || existingBusiness.industry,
          description: validatedData.description || existingBusiness.description,
          website: validatedData.contact?.website || existingBusiness.website,
          settings: {
            ...((existingBusiness.settings as any) || {}),
            services: validatedData.services,
            location: validatedData.location,
            contact: validatedData.contact,
            hours: validatedData.hours,
          },
          updatedAt: new Date(),
        })
        .where(eq(businesses.id, existingBusiness.id))
        .returning();

      return { success: true, businessId: updated.id };
    } else {
      // Create new business
      const [created] = await db
        .insert(businesses)
        .values({
          name: validatedData.businessName || "Unnamed Business",
          industry: validatedData.category || "Other",
          description: validatedData.description,
          website: validatedData.contact?.website,
          ownerId: parseInt(session.user.id),
          settings: {
            services: validatedData.services,
            location: validatedData.location,
            contact: validatedData.contact,
            hours: validatedData.hours,
          },
        })
        .returning();

      // Update user's businessId
      // Note: You may need to create a users update action

      return { success: true, businessId: created.id };
    }
  } catch (error) {
    console.error("Error saving business profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save business profile",
    };
  }
}

export async function getBusinessProfile(): Promise<BusinessProfileData | null> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.ownerId, parseInt(session.user.id)),
    });

    if (!business) {
      return null;
    }

    const settings = business.settings as any;

    return {
      businessName: business.name,
      category: business.industry as any,
      services: settings?.services || [],
      description: business.description || "",
      location: settings?.location || {
        address: "",
        city: "",
        state: "",
        zipCode: "",
        serviceRadius: 10,
      },
      contact: settings?.contact || {
        phone: "",
        email: "",
        website: business.website || "",
      },
      hours: settings?.hours || {
        monday: { open: "09:00", close: "17:00", closed: false },
        tuesday: { open: "09:00", close: "17:00", closed: false },
        wednesday: { open: "09:00", close: "17:00", closed: false },
        thursday: { open: "09:00", close: "17:00", closed: false },
        friday: { open: "09:00", close: "17:00", closed: false },
        saturday: { open: "10:00", close: "14:00", closed: false },
        sunday: { open: "", close: "", closed: true },
      },
    };
  } catch (error) {
    console.error("Error fetching business profile:", error);
    return null;
  }
}

// Auto-save function that can be called frequently
export async function autoSaveBusinessProfile(
  data: Partial<BusinessProfileData>
): Promise<{ success: boolean }> {
  try {
    const result = await saveBusinessProfile(data);
    return { success: result.success };
  } catch (error) {
    console.error("Auto-save error:", error);
    return { success: false };
  }
}
