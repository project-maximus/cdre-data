import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireSessionUser, requireRole } from "@/lib/session";
import { logger } from "@/lib/logger";
import { ALLOWED_SOURCE_MODES, isGoogleDriveUrl } from "@/lib/validate";

export async function PATCH(request, context) {
  const session = requireSessionUser(request);
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getSql();
    const { sourceMode, driveUrl, aiNote, notes } = await request.json();
    const normalizedSourceMode = sourceMode || "drive_link";
    const normalizedAiNote = (aiNote || "").trim();
    const normalizedNotes = (notes || "").trim();
    const resolvedParams = await context.params;
    const id = Number(resolvedParams?.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid resource id." }, { status: 400 });
    }

    if (!ALLOWED_SOURCE_MODES.has(normalizedSourceMode)) {
      return NextResponse.json({ error: "Invalid source mode." }, { status: 400 });
    }

    if (normalizedSourceMode === "drive_link" && !isGoogleDriveUrl(driveUrl)) {
      return NextResponse.json(
        { error: "Please provide a valid Google Drive link." },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE content_resources
      SET source_mode = ${normalizedSourceMode},
          drive_url = ${normalizedSourceMode === "drive_link" ? driveUrl : null},
          ai_note = ${normalizedSourceMode === "ai_generated" ? normalizedAiNote : null},
          notes = ${normalizedNotes || null},
          status = ${"resubmit"},
          updated_by = ${session.username},
          updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;

    if (!updated.length) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 });
    }

    logger.info("api/content/resources PATCH", `Resource #${id} updated by ${session.username}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("api/content/resources PATCH", error);
    return NextResponse.json(
      { error: "Unable to update this resource right now." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  const session = requireRole(request, ["admin", "developer"]);
  if (!session.ok) {
    if (session.reason === "forbidden") {
      return NextResponse.json({ error: "Only admins can delete resources." }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getSql();
    const resolvedParams = await context.params;
    const id = Number(resolvedParams?.id);

    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid resource id." }, { status: 400 });
    }

    const deleted = await sql`
      DELETE FROM content_resources WHERE id = ${id} RETURNING id
    `;

    if (!deleted.length) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 });
    }

    logger.info("api/content/resources DELETE", `Resource #${id} deleted by ${session.username}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("api/content/resources DELETE", error);
    return NextResponse.json(
      { error: "Unable to delete this resource right now." },
      { status: 500 }
    );
  }
}
