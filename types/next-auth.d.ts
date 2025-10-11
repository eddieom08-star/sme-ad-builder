import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      businessId: number | null;
      role: "owner" | "admin" | "member";
    } & DefaultSession["user"];
  }

  interface User {
    businessId?: number | null;
    role?: "owner" | "admin" | "member";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    businessId?: number | null;
    role?: "owner" | "admin" | "member";
  }
}
