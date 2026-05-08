import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { STRAPI_INTERNAL_URL } from "@/lib/config";
import { checkRateLimit } from "@/lib/rateLimit";
import { parseRegister } from "@/lib/schemas";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    // ── Rate limiting (3 registrations/min per IP) ────────────────────────
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
      headersList.get("x-real-ip") ??
      "unknown";

    const { allowed, retryAfter } = checkRateLimit(`register:${ip}`, 3);
    if (!allowed) {
      return NextResponse.json(
        { error: `Zu viele Registrierungsversuche. Bitte warte ${retryAfter} Sekunden.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    // ── Input validation ─────────────────────────────────────────────────
    const body = await request.json();
    const parsed = parseRegister(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.errors[0].message },
        { status: 400 }
      );
    }

    const { username, email, password } = parsed.data;

    // ── Strapi registration ───────────────────────────────────────────────
    const strapiRes = await fetch(
      `${STRAPI_INTERNAL_URL}/api/auth/local/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      }
    );

    const data = await strapiRes.json();

    if (!strapiRes.ok) {
      const message = data?.error?.message || "Registrierung fehlgeschlagen.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const response = NextResponse.json({
      user: {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
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
    logger.error("Register route error", error);
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
