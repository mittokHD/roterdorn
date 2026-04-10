import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_INTERNAL_URL || "http://strapi:1337";
const STRAPI_WRITE_TOKEN = process.env.STRAPI_WRITE_TOKEN;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields AND honeypot
    const { name, text, website, rezensionId } = body;

    // BOT PROTECTION (Honeypot) - If 'website' is filled, it's a spambot.
    if (website && website.length > 0) {
      // Fake a success response to fool the bot into thinking it worked!
      return NextResponse.json({ success: true, fake: true }, { status: 201 });
    }

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name muss mindestens 2 Zeichen lang sein." },
        { status: 400 }
      );
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

    // Forward to Strapi with write token (not exposed to client)
    const strapiRes = await fetch(`${STRAPI_URL}/api/kommentare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(STRAPI_WRITE_TOKEN
          ? { Authorization: `Bearer ${STRAPI_WRITE_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        data: {
          name: name.trim(),
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
