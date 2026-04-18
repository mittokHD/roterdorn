import { NextResponse } from "next/server";
import { STRAPI_INTERNAL_URL } from "@/lib/config";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "E-Mail und Passwort sind erforderlich." },
        { status: 400 }
      );
    }

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
      maxAge: 60 * 60 * 24 * 30, // 30 Tage
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Interner Serverfehler." }, { status: 500 });
  }
}
