import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { STRAPI_INTERNAL_URL } from "@/lib/config";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const strapiRes = await fetch(`${STRAPI_INTERNAL_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!strapiRes.ok) {
      return NextResponse.json({ user: null });
    }

    const user = await strapiRes.json();
    return NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
