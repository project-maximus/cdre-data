import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireSessionUser } from "@/lib/session";

function isGoogleDriveUrl(input) {
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    return host.includes("drive.google.com") || host.includes("docs.google.com");
  } catch {
    return false;
  }
}

export async function PATCH(request, context) {
  const session = requireSessionUser(request);
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getSql();
    const { driveUrl } = await request.json();
    const resolvedParams = await context.params;
    const id = Number(resolvedParams?.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid resource id." }, { status: 400 });
    }

    if (!driveUrl || !isGoogleDriveUrl(driveUrl)) {
      return NextResponse.json(
        { error: "Please provide a valid Google Drive link." },
        { status: 400 }
      );
    }

    await sql`
      UPDATE content_resources
      SET drive_url = ${driveUrl},
          status = ${"resubmit"},
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
