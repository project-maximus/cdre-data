import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireSessionUser } from "@/lib/session";
import { logger } from "@/lib/logger";
import {
  ALLOWED_RESOURCE_TYPES,
  ALLOWED_SOURCE_MODES,
  ALLOWED_STATUSES,
  isGoogleDriveUrl,
} from "@/lib/validate";

const HIDDEN_SECTION_TITLES = ["Admin and Back-End Structure", "Member Account Area"];

export async function GET(request) {
  const session = requireSessionUser(request);
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getSql();
    const { searchParams } = new URL(request.url);
    const sectionFilter = searchParams.get("section");

    let rows;

    if (sectionFilter) {
      rows = await sql`
        SELECT
          s.id AS section_id,
          s.code AS section_code,
          s.title AS section_title,
          s.sort_order AS section_order,
          ss.id AS subsection_id,
          ss.code AS subsection_code,
          ss.title AS subsection_title,
          ss.sort_order AS subsection_order,
          r.id AS resource_id,
          r.resource_type,
          r.source_mode,
          r.drive_url,
          r.ai_note,
          r.notes,
          r.status,
          r.created_by,
          r.updated_at
        FROM content_sections s
        LEFT JOIN content_subsections ss ON ss.section_id = s.id
        LEFT JOIN content_resources r ON r.subsection_id = ss.id
        WHERE s.id = ${Number(sectionFilter)}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
        ORDER BY s.sort_order, ss.sort_order, r.updated_at DESC
      `;
    } else {
      rows = await sql`
        SELECT
          s.id AS section_id,
          s.code AS section_code,
          s.title AS section_title,
          s.sort_order AS section_order,
          ss.id AS subsection_id,
          ss.code AS subsection_code,
          ss.title AS subsection_title,
          ss.sort_order AS subsection_order,
          r.id AS resource_id,
          r.resource_type,
          r.source_mode,
          r.drive_url,
          r.ai_note,
          r.notes,
          r.status,
          r.created_by,
          r.updated_at
        FROM content_sections s
        LEFT JOIN content_subsections ss ON ss.section_id = s.id
        LEFT JOIN content_resources r ON r.subsection_id = ss.id
        WHERE s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
        ORDER BY s.sort_order, ss.sort_order, r.updated_at DESC
      `;
    }

    const sectionMap = new Map();

    for (const row of rows) {
      if (!sectionMap.has(row.section_id)) {
        sectionMap.set(row.section_id, {
          id: row.section_id,
          code: row.section_code,
          title: row.section_title,
          sortOrder: row.section_order,
          subsections: [],
        });
      }

      const section = sectionMap.get(row.section_id);

      if (!row.subsection_id) {
        continue;
      }

      let subsection = section.subsections.find((item) => item.id === row.subsection_id);

      if (!subsection) {
        subsection = {
          id: row.subsection_id,
          code: row.subsection_code,
          title: row.subsection_title,
          sortOrder: row.subsection_order,
          resources: [],
        };
        section.subsections.push(subsection);
      }

      if (row.resource_id) {
        subsection.resources.push({
          id: row.resource_id,
          resourceType: row.resource_type,
          sourceMode: row.source_mode,
          driveUrl: row.drive_url,
          aiNote: row.ai_note,
          notes: row.notes,
          status: row.status,
          createdBy: row.created_by,
          updatedAt: row.updated_at,
        });
      }
    }

    return NextResponse.json({
      username: session.username,
      role: session.role,
      sections: Array.from(sectionMap.values()),
      statuses: Array.from(ALLOWED_STATUSES),
      resourceTypes: Array.from(ALLOWED_RESOURCE_TYPES),
      sourceModes: Array.from(ALLOWED_SOURCE_MODES),
    });
  } catch (error) {
    logger.error("api/content GET", error);
    return NextResponse.json(
      { error: "Unable to load content right now." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const session = requireSessionUser(request);
  if (!session.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getSql();
    const { subsectionId, resourceType, sourceMode, driveUrl, aiNote, notes } = await request.json();
    const normalizedSourceMode = sourceMode || "drive_link";
    const normalizedAiNote = (aiNote || "").trim();
    const normalizedNotes = (notes || "").trim();

    if (!subsectionId || !resourceType || !normalizedSourceMode) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (!ALLOWED_RESOURCE_TYPES.has(resourceType)) {
      return NextResponse.json({ error: "Invalid resource type." }, { status: 400 });
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

    /* Check for duplicate (same subsection + resource type) */
    const existing = await sql`
      SELECT id FROM content_resources
      WHERE subsection_id = ${subsectionId} AND resource_type = ${resourceType}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: `A "${resourceType.replace(/_/g, " ")}" resource already exists for this topic. Please edit the existing one instead.`,
        },
        { status: 409 }
      );
    }

    const inserted = await sql`
      INSERT INTO content_resources (
        subsection_id,
        resource_type,
        source_mode,
        drive_url,
        ai_note,
        notes,
        status,
        created_by,
        updated_by
      )
      VALUES (
        ${subsectionId},
        ${resourceType},
        ${normalizedSourceMode},
        ${normalizedSourceMode === "drive_link" ? driveUrl : null},
        ${normalizedSourceMode === "ai_generated" ? normalizedAiNote : null},
        ${normalizedNotes || null},
        ${"done"},
        ${session.username},
        ${session.username}
      )
      RETURNING id
    `;

    logger.info("api/content POST", `Resource created #${inserted[0]?.id} by ${session.username}`);
    return NextResponse.json({ success: true, id: inserted[0]?.id });
  } catch (error) {
    logger.error("api/content POST", error);
    return NextResponse.json(
      { error: "Unable to save this resource right now." },
      { status: 500 }
    );
  }
}
