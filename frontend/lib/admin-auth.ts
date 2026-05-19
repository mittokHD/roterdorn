import { cookies } from "next/headers";
import { STRAPI_INTERNAL_URL } from "@/lib/config";

interface StrapiRole {
  id: number;
  name?: string;
  type?: string;
}

export interface AdminAuthUser {
  id: number;
  username: string;
  email: string;
  role?: StrapiRole | null;
  isAdmin: boolean;
}

export async function getCurrentUserForAdmin(): Promise<AdminAuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) return null;

  const response = await fetch(`${STRAPI_INTERNAL_URL}/api/users/me?populate=role`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const user = await response.json();

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role || null,
    isAdmin: isAdminUser(user),
  };
}

export function isAdminUser(user: { email?: string; role?: StrapiRole | null }) {
  const adminEmails = (process.env.ADMIN_CROSSPOST_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const roleName = `${user.role?.name || ""} ${user.role?.type || ""}`.toLowerCase();
  const email = String(user.email || "").toLowerCase();

  return adminEmails.includes(email) || roleName.includes("admin");
}
