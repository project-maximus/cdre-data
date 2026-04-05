import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireSessionUser } from "@/lib/session";

const ALLOWED_STATUSES = new Set(["not_submitted", "resubmit", "done"]);

export async function PATCH(request, context) {
  const session = requireSessionUser(request);
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getSql();
    const { status } = await request.json();
    const resolvedParams = await context.params;
    const id = Number(resolvedParams?.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid resource id." }, { status: 400 });
    }

    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    await sql`
      UPDATE content_resources
      SET status = ${status},
          updated_by = ${session.username},
          updated_at = NOW()
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to update status right now." },
      { status: 500 }
    );
  }
}
