import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { STRAPI_INTERNAL_URL } from "@/lib/config";
import { checkRateLimit } from "@/lib/rateLimit";
import { parseLogin } from "@/lib/schemas";
import { logger } from "@/lib/logger";
import { isAdminUser } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    // ── Rate limiting (10 attempts/min per IP) ────────────────────────────
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
      headersList.get("x-real-ip") ??
      "unknown";

    const { allowed, retryAfter } = checkRateLimit(ip, 10);
    if (!allowed) {
      return NextResponse.json(
        { error: `Zu viele Anmeldeversuche. Bitte warte ${retryAfter} Sekunden.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    // ── Input validation ─────────────────────────────────────────────────
    const body = await request.json();
    const parsed = parseLogin(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.errors[0].message },
        { status: 400 }
      );
    }

    const { identifier, password } = parsed.data;

    // ── Strapi authentication ─────────────────────────────────────────────
    const strapiRes = await fetch(`${STRAPI_INTERNAL_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await strapiRes.json();

    if (!strapiRes.ok) {
      const message = data?.error?.message || "Anmeldung fehlgeschlagen.";
      return NextResponse.json({ error: message }, { status: 401 });
    }

    let userWithRole = data.user;
    try {
      const meRes = await fetch(`${STRAPI_INTERNAL_URL}/api/users/me?populate=role`, {
        headers: { Authorization: `Bearer ${data.jwt}` },
      });
      if (meRes.ok) userWithRole = await meRes.json();
    } catch {
      userWithRole = data.user;
    }

    const response = NextResponse.json({
      user: {
        id: userWithRole.id,
        username: userWithRole.username,
        email: userWithRole.email,
        isAdmin: isAdminUser(userWithRole),
      },
    });

    response.cookies.set("auth_token", data.jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    logger.error("Login route error", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
