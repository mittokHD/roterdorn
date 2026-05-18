import { NextResponse } from "next/server";
import { getCurrentUserForAdmin } from "@/lib/admin-auth";

const FACEBOOK_PAGE_URL = "https://www.facebook.com/roterdorn/";
const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/roterdorn.de/";

interface CrosspostRequest {
  platform?: "facebook" | "instagram";
  title?: string;
  url?: string;
  excerpt?: string;
  imageUrl?: string;
  message?: string;
}

export async function POST(request: Request) {
  const user = await getCurrentUserForAdmin();

  if (!user) {
    return NextResponse.json({ error: "Anmeldung erforderlich." }, { status: 401 });
  }

  if (!user.isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as CrosspostRequest;
  const validationError = validateCrosspostBody(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (body.platform === "facebook") {
    return postToFacebook(body as Required<Pick<CrosspostRequest, "platform" | "title" | "url">> & CrosspostRequest);
  }

  return postToInstagram(body as Required<Pick<CrosspostRequest, "platform" | "title" | "url">> & CrosspostRequest);
}

function validateCrosspostBody(body: CrosspostRequest) {
  if (body.platform !== "facebook" && body.platform !== "instagram") {
    return "Unbekannte Plattform.";
  }

  if (!body.title || body.title.trim().length < 2) {
    return "Titel fehlt.";
  }

  if (!body.url || !isHttpUrl(body.url)) {
    return "Ungültige URL.";
  }

  if (body.imageUrl && !isHttpUrl(body.imageUrl)) {
    return "Ungültige Bild-URL.";
  }

  return null;
}

async function postToFacebook(body: CrosspostRequest & { title: string; url: string }) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const manualUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(body.url)}`;

  if (!pageId || !accessToken) {
    return NextResponse.json(
      {
        error: "Facebook ist noch nicht konfiguriert. Benötigt werden FACEBOOK_PAGE_ID und FACEBOOK_PAGE_ACCESS_TOKEN.",
        manualUrl,
        target: FACEBOOK_PAGE_URL,
      },
      { status: 501 },
    );
  }

  const params = new URLSearchParams({
    message: buildMessage(body),
    link: body.url,
    access_token: accessToken,
  });

  const response = await fetch(`https://graph.facebook.com/v20.0/${pageId}/feed`, {
    method: "POST",
    body: params,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json(
      { error: data?.error?.message || "Facebook-Post konnte nicht erstellt werden.", target: FACEBOOK_PAGE_URL },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, message: "Facebook-Post wurde erstellt.", data });
}

async function postToInstagram(body: CrosspostRequest & { title: string; url: string }) {
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accountId || !accessToken) {
    return NextResponse.json(
      {
        error: "Instagram ist noch nicht konfiguriert. Benötigt werden INSTAGRAM_BUSINESS_ACCOUNT_ID und INSTAGRAM_ACCESS_TOKEN.",
        manualUrl: INSTAGRAM_PROFILE_URL,
      },
      { status: 501 },
    );
  }

  if (!body.imageUrl) {
    return NextResponse.json(
      { error: "Instagram-Posts benötigen eine öffentlich erreichbare Bild-URL.", manualUrl: INSTAGRAM_PROFILE_URL },
      { status: 400 },
    );
  }

  const createParams = new URLSearchParams({
    image_url: body.imageUrl,
    caption: buildMessage(body),
    access_token: accessToken,
  });

  const createResponse = await fetch(`https://graph.facebook.com/v20.0/${accountId}/media`, {
    method: "POST",
    body: createParams,
  });
  const createData = await createResponse.json().catch(() => ({}));

  if (!createResponse.ok || !createData.id) {
    return NextResponse.json(
      { error: createData?.error?.message || "Instagram-Media konnte nicht vorbereitet werden.", target: INSTAGRAM_PROFILE_URL },
      { status: 502 },
    );
  }

  const publishParams = new URLSearchParams({
    creation_id: createData.id,
    access_token: accessToken,
  });

  const publishResponse = await fetch(`https://graph.facebook.com/v20.0/${accountId}/media_publish`, {
    method: "POST",
    body: publishParams,
  });
  const publishData = await publishResponse.json().catch(() => ({}));

  if (!publishResponse.ok) {
    return NextResponse.json(
      { error: publishData?.error?.message || "Instagram-Post konnte nicht veröffentlicht werden.", target: INSTAGRAM_PROFILE_URL },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, message: "Instagram-Post wurde erstellt.", data: publishData });
}

function buildMessage(body: CrosspostRequest & { title: string; url: string }) {
  const customMessage = body.message?.trim();
  if (customMessage) return customMessage;

  return [body.title, body.excerpt, body.url].filter(Boolean).join("\n\n");
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
