"use server";

import { db } from "@/lib/db";
import { users, businesses } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
// import bcrypt from "bcryptjs"; // Not used - using Clerk for auth
import { RegisterInput } from "@/types";

export async function getUserByEmail(email: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export async function getUserById(id: number) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        business: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return null;
  }
}

export async function createUser(data: RegisterInput) {
  try {
    // Hash password
    // const hashedPassword = await bcrypt.hash(data.password, 10); // Using Clerk
    const hashedPassword = ""; // Clerk handles password hashing

    // Create user and business in a transaction
    const result = await db.transaction(async (tx) => {
      // Create business first
      const [business] = await tx
        .insert(businesses)
        .values({
          name: data.businessName,
          industry: data.industry,
          ownerId: 0, // Temporary, will update after user creation
        })
        .returning();

      // Create user
      const [user] = await tx
        .insert(users)
        .values({
          username: data.username,
          email: data.email,
          password: hashedPassword,
          businessId: business.id,
          role: "owner",
        })
        .returning();

      // Update business with actual owner id
      await tx
        .update(businesses)
        .set({ ownerId: user.id })
        .where(eq(businesses.id, business.id));

      return { user, business };
    });

    return result.user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
}
