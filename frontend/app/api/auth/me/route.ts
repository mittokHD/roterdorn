import { NextResponse } from "next/server";
import { getCurrentUserForAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const user = await getCurrentUserForAdmin();
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
