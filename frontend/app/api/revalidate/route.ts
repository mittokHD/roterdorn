import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { REVALIDATION_SECRET } from "@/lib/config";

export async function POST(request: Request) {
  try {
    // Verify webhook secret
    const secret = request.headers.get("x-webhook-secret");

    if (!REVALIDATION_SECRET || secret !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: "Invalid webhook secret" },
        { status: 401 }
      );
    }

    // Revalidate all review-related caches
    // @ts-expect-error - Next.js 16.2 typings require a second undocumented 'profile' argument
    revalidateTag("rezensionen");

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
    });
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
