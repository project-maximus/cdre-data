import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { logger } from "@/lib/logger";

const HIDDEN_SECTION_TITLES = ["Admin and Back-End Structure", "Member Account Area"];

export async function GET(request) {
  const session = requireRole(request, ["admin", "developer"]);
  if (!session.ok) {
    if (session.reason === "forbidden") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getSql();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 25));
    const offset = (page - 1) * limit;
    const statusFilter = searchParams.get("status") || "";
    const sectionFilter = searchParams.get("section") || "";
    const userFilter = searchParams.get("user") || "";

    /* Stats */
    const stats = await sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE r.status = 'done')::int AS done_count,
        COUNT(*) FILTER (WHERE r.status = 'resubmit')::int AS resubmit_count,
        COUNT(*) FILTER (WHERE r.status = 'not_submitted')::int AS not_submitted_count
      FROM content_resources r
      JOIN content_subsections ss ON ss.id = r.subsection_id
      JOIN content_sections s ON s.id = ss.section_id
      WHERE s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
    `;

    /* Total subsections (to calculate "not yet started") */
    const subsectionCount = await sql`
      SELECT COUNT(*)::int AS total
      FROM content_subsections ss
      JOIN content_sections s ON s.id = ss.section_id
      WHERE s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
    `;

    /* Resources with filters */
    let resources;
    let totalRows;

    if (statusFilter && sectionFilter && userFilter) {
      totalRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE r.status = ${statusFilter}
          AND s.id = ${Number(sectionFilter)}
          AND r.created_by = ${userFilter}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
      `;
      resources = await sql`
        SELECT r.id, r.resource_type, r.source_mode, r.drive_url, r.ai_note, r.notes, r.status,
               r.created_by, r.updated_by, r.created_at, r.updated_at,
               ss.title AS subsection_title, ss.code AS subsection_code,
               s.title AS section_title, s.id AS section_id
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE r.status = ${statusFilter}
          AND s.id = ${Number(sectionFilter)}
          AND r.created_by = ${userFilter}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
        ORDER BY r.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (statusFilter && sectionFilter) {
      totalRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE r.status = ${statusFilter} AND s.id = ${Number(sectionFilter)}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
      `;
      resources = await sql`
        SELECT r.id, r.resource_type, r.source_mode, r.drive_url, r.ai_note, r.notes, r.status,
               r.created_by, r.updated_by, r.created_at, r.updated_at,
               ss.title AS subsection_title, ss.code AS subsection_code,
               s.title AS section_title, s.id AS section_id
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE r.status = ${statusFilter} AND s.id = ${Number(sectionFilter)}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
        ORDER BY r.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (statusFilter && userFilter) {
      totalRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE r.status = ${statusFilter} AND r.created_by = ${userFilter}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
      `;
      resources = await sql`
        SELECT r.id, r.resource_type, r.source_mode, r.drive_url, r.ai_note, r.notes, r.status,
               r.created_by, r.updated_by, r.created_at, r.updated_at,
               ss.title AS subsection_title, ss.code AS subsection_code,
               s.title AS section_title, s.id AS section_id
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE r.status = ${statusFilter} AND r.created_by = ${userFilter}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
        ORDER BY r.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (sectionFilter && userFilter) {
      totalRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE s.id = ${Number(sectionFilter)} AND r.created_by = ${userFilter}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
      `;
      resources = await sql`
        SELECT r.id, r.resource_type, r.source_mode, r.drive_url, r.ai_note, r.notes, r.status,
               r.created_by, r.updated_by, r.created_at, r.updated_at,
               ss.title AS subsection_title, ss.code AS subsection_code,
               s.title AS section_title, s.id AS section_id
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE s.id = ${Number(sectionFilter)} AND r.created_by = ${userFilter}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
        ORDER BY r.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (statusFilter) {
      totalRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE r.status = ${statusFilter}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
      `;
      resources = await sql`
        SELECT r.id, r.resource_type, r.source_mode, r.drive_url, r.ai_note, r.notes, r.status,
               r.created_by, r.updated_by, r.created_at, r.updated_at,
               ss.title AS subsection_title, ss.code AS subsection_code,
               s.title AS section_title, s.id AS section_id
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE r.status = ${statusFilter}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
        ORDER BY r.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (sectionFilter) {
      totalRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE s.id = ${Number(sectionFilter)}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
      `;
      resources = await sql`
        SELECT r.id, r.resource_type, r.source_mode, r.drive_url, r.ai_note, r.notes, r.status,
               r.created_by, r.updated_by, r.created_at, r.updated_at,
               ss.title AS subsection_title, ss.code AS subsection_code,
               s.title AS section_title, s.id AS section_id
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE s.id = ${Number(sectionFilter)}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
        ORDER BY r.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (userFilter) {
      totalRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE r.created_by = ${userFilter}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
      `;
      resources = await sql`
        SELECT r.id, r.resource_type, r.source_mode, r.drive_url, r.ai_note, r.notes, r.status,
               r.created_by, r.updated_by, r.created_at, r.updated_at,
               ss.title AS subsection_title, ss.code AS subsection_code,
               s.title AS section_title, s.id AS section_id
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE r.created_by = ${userFilter}
          AND s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
        ORDER BY r.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      totalRows = await sql`
        SELECT COUNT(*)::int AS total
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
      `;
      resources = await sql`
        SELECT r.id, r.resource_type, r.source_mode, r.drive_url, r.ai_note, r.notes, r.status,
               r.created_by, r.updated_by, r.created_at, r.updated_at,
               ss.title AS subsection_title, ss.code AS subsection_code,
               s.title AS section_title, s.id AS section_id
        FROM content_resources r
        JOIN content_subsections ss ON ss.id = r.subsection_id
        JOIN content_sections s ON s.id = ss.section_id
        WHERE s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
        ORDER BY r.updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    /* Sections list for filter dropdown */
    const sections = await sql`
      SELECT id, title
      FROM content_sections
      WHERE title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
      ORDER BY sort_order
    `;

    /* Distinct users for filter dropdown */
    const users = await sql`
      SELECT DISTINCT r.created_by
      FROM content_resources r
      JOIN content_subsections ss ON ss.id = r.subsection_id
      JOIN content_sections s ON s.id = ss.section_id
      WHERE s.title NOT IN (${HIDDEN_SECTION_TITLES[0]}, ${HIDDEN_SECTION_TITLES[1]})
      ORDER BY r.created_by
    `;

    const total = totalRows[0]?.total || 0;

    return NextResponse.json({
      stats: {
        ...stats[0],
        total_subsections: subsectionCount[0]?.total || 0,
      },
      resources: resources.map((r) => ({
        id: r.id,
        resourceType: r.resource_type,
        sourceMode: r.source_mode,
        driveUrl: r.drive_url,
        aiNote: r.ai_note,
        notes: r.notes,
        status: r.status,
        createdBy: r.created_by,
        updatedBy: r.updated_by,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        subsectionTitle: r.subsection_title,
        subsectionCode: r.subsection_code,
        sectionTitle: r.section_title,
        sectionId: r.section_id,
      })),
      sections: sections.map((s) => ({ id: s.id, title: s.title })),
      users: users.map((u) => u.created_by),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("api/admin GET", error);
    return NextResponse.json(
      { error: "Unable to load admin data right now." },
      { status: 500 }
    );
  }
}
