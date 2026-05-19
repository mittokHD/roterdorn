import { NextResponse } from "next/server";
import { getCurrentUserForAdmin } from "@/lib/admin-auth";
import { saveAdminRezension } from "@/lib/admin-reviews";

export async function POST(request: Request) {
  const user = await getCurrentUserForAdmin();

  if (!user) {
    return NextResponse.json({ error: "Anmeldung erforderlich." }, { status: 401 });
  }

  if (!user.isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const result = await saveAdminRezension(formData);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Beitrag konnte nicht gespeichert werden." },
      { status: 400 },
    );
  }
}
