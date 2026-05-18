import { NextResponse } from "next/server";
import { getCurrentUserForAdmin } from "@/lib/admin-auth";
import { saveAdminRezension } from "@/lib/admin-reviews";

interface RouteContext {
  params: Promise<{ documentId: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  const user = await getCurrentUserForAdmin();

  if (!user) {
    return NextResponse.json({ error: "Anmeldung erforderlich." }, { status: 401 });
  }

  if (!user.isAdmin) {
    return NextResponse.json({ error: "Kein Zugriff." }, { status: 403 });
  }

  try {
    const { documentId } = await context.params;
    const formData = await request.formData();
    const result = await saveAdminRezension(formData, documentId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Beitrag konnte nicht gespeichert werden." },
      { status: 400 },
    );
  }
}
