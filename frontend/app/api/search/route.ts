import { NextResponse } from "next/server";
import { searchRezensionen } from "@/lib/strapi";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  
  if (!q || q.trim() === "") {
    return NextResponse.json({ data: [] });
  }
  
  try {
    const response = await searchRezensionen(q);
    return NextResponse.json({ data: response.data || [] });
  } catch (err) {
    console.error("Search API Error:", err);
    return NextResponse.json({ error: "Fehler bei der Suche" }, { status: 500 });
  }
}
