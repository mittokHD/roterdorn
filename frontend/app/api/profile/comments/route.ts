import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { STRAPI_INTERNAL_URL } from "@/lib/config";
import { getStrapiReadHeaders } from "@/lib/strapi";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  // Validate session and retrieve user identity from Strapi
  const userRes = await fetch(`${STRAPI_INTERNAL_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!userRes.ok) {
    return NextResponse.json({ error: "Ungültige Sitzung." }, { status: 401 });
  }

  const strapiUser = await userRes.json();

  // Filter comments by user ID (immutable) instead of username (mutable).
  // This prevents comments from "disappearing" if the user ever changes their name.
  const query = new URLSearchParams({
    "filters[user][id][$eq]": String(strapiUser.id),
    "populate[rezension][fields][0]": "title",
    "populate[rezension][fields][1]": "slug",
    "populate[rezension][fields][2]": "type",
    "sort": "createdAt:desc",
    "pagination[pageSize]": "50",
  });

  const kommentareRes = await fetch(
    `${STRAPI_INTERNAL_URL}/api/kommentare?${query}`,
    { headers: getStrapiReadHeaders() }
  );

  if (!kommentareRes.ok) {
    return NextResponse.json({ kommentare: [] });
  }

  const data = await kommentareRes.json();
  return NextResponse.json({ kommentare: data.data || [] });
}

