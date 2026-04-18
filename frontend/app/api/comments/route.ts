import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { STRAPI_INTERNAL_URL, STRAPI_WRITE_TOKEN } from "@/lib/config";

export async function POST(request: Request) {
  try {
    // Auth-Check: JWT aus Cookie lesen und bei Strapi validieren
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

    const body = await request.json();
    const { text, website, rezensionId } = body;

    // Honeypot
    if (website && website.length > 0) {
      return NextResponse.json({ success: true, fake: true }, { status: 201 });
    }

    if (!text || typeof text !== "string" || text.trim().length < 3) {
      return NextResponse.json(
        { error: "Kommentar muss mindestens 3 Zeichen lang sein." },
        { status: 400 }
      );
    }

    if (!rezensionId || typeof rezensionId !== "string") {
      return NextResponse.json(
        { error: "Ungültige Rezensions-ID." },
        { status: 400 }
      );
    }

    const strapiRes = await fetch(`${STRAPI_INTERNAL_URL}/api/kommentare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(STRAPI_WRITE_TOKEN
          ? { Authorization: `Bearer ${STRAPI_WRITE_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        data: {
          name: strapiUser.username,
          text: text.trim(),
          isApproved: false,
          rezension: {
            connect: [rezensionId],
          },
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
    return NextResponse.json(
      { success: true, data: data.data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Comment proxy error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}
