import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { STRAPI_INTERNAL_URL } from "@/lib/config";
import { checkRateLimit } from "@/lib/rateLimit";
import { parseComment } from "@/lib/schemas";
import { getStrapiWriteHeaders } from "@/lib/strapi";

export async function POST(request: Request) {
  try {
    // ── Rate limiting ────────────────────────────────────────────────────
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
      headersList.get("x-real-ip") ??
      "unknown";

    const { allowed, retryAfter } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: `Zu viele Anfragen. Bitte warte ${retryAfter} Sekunden.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      );
    }

    // ── Auth check ───────────────────────────────────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Du musst angemeldet sein, um einen Kommentar zu schreiben." },
        { status: 401 }
      );
    }

    const userRes = await fetch(`${STRAPI_INTERNAL_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return NextResponse.json(
        { error: "Ungültige Sitzung. Bitte erneut anmelden." },
        { status: 401 }
      );
    }

    const strapiUser = await userRes.json();

    // ── Input validation ─────────────────────────────────────────────────
    const body = await request.json();
    const parsed = parseComment(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.errors[0].message },
        { status: 400 }
      );
    }

    const { text, rezensionId, website } = parsed.data;

    // Honeypot: bots fill hidden fields, real users leave them empty.
    if (website.length > 0) {
      return NextResponse.json({ success: true, fake: true }, { status: 201 });
    }

    // ── Strapi write ─────────────────────────────────────────────────────
    const strapiRes = await fetch(`${STRAPI_INTERNAL_URL}/api/kommentare`, {
      method: "POST",
      headers: getStrapiWriteHeaders(),
      body: JSON.stringify({
        data: {
          name: strapiUser.username,
          text,
          isApproved: false,
          user: strapiUser.id,
          rezension: { connect: [rezensionId] },
        },
      }),
    });

    if (!strapiRes.ok) {
      const errorData = await strapiRes.json().catch(() => ({}));
      console.error("Strapi comment creation error:", errorData);
      return NextResponse.json(
        { error: "Kommentar konnte nicht erstellt werden." },
        { status: 500 }
      );
    }

    const data = await strapiRes.json();
    return NextResponse.json({ success: true, data: data.data }, { status: 201 });
  } catch (error) {
    console.error("Comment proxy error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}
