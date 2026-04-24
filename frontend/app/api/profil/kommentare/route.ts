import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { STRAPI_INTERNAL_URL, STRAPI_API_TOKEN } from "@/lib/config";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  // Get username from Strapi
  const userRes = await fetch(`${STRAPI_INTERNAL_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!userRes.ok) {
    return NextResponse.json({ error: "Ungültige Sitzung." }, { status: 401 });
  }

  const strapiUser = await userRes.json();

  // Fetch this user's comments by name
  const query = new URLSearchParams({
    "filters[name][$eq]": strapiUser.username,
    "populate[rezension][fields][0]": "title",
    "populate[rezension][fields][1]": "slug",
    "populate[rezension][fields][2]": "type",
    "sort": "createdAt:desc",
    "pagination[pageSize]": "50",
  });

  const kommentareRes = await fetch(
    `${STRAPI_INTERNAL_URL}/api/kommentare?${query}`,
    {
      headers: {
        ...(STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {}),
      },
    }
  );

  if (!kommentareRes.ok) {
    return NextResponse.json({ kommentare: [] });
  }

  const data = await kommentareRes.json();
  return NextResponse.json({ kommentare: data.data || [] });
}
