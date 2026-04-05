import { neon } from "@neondatabase/serverless";
import { loadEnvFromFile } from "./env.mjs";

const CONTENT = [
  {
    title: "Start Here: Exam Foundations",
    subsections: [
      "CDRE Exam Overview",
      "Exam Blueprint Breakdown",
      "How to Read the Questions and Effectively Practice",
      "How to Break Down Cognitive Levels of Questions",
      "Broad Knowledge",
      "Comprehension",
      "Analyze, Interpret, and Apply Knowledge",
      "How to Read the Question to Determine the Best Answer",
      "Eliminating Distractors",
      "Priority Frameworks",
      "Avoid Common Mistakes",
      "How to Study Smarter for the CDRE",
    ],
  },
  {
    title: "Study Planning Hub",
    subsections: [
      "Create Your Study Schedule",
      "Sample 4-Week Study Plan",
      "Sample 8-Week Study Plan",
      "Sample 12-Week Study Plan",
      "Weak Area Identification",
      "Progress Dashboard",
    ],
  },
  {
    title: "Core Study Library",
    subsections: [
      "1.01 Food Composition and Food Science",
      "1.02 Food Environments",
      "1.03 Human Nutrition and Metabolism",
      "1.04 Dietary Requirements and Guidelines in Canada",
      "1.05 Dietary Practices",
      "1.06 Nutrition Care Principles and Practices",
      "1.07 Population Health Promotion Principles and Practices",
      "1.08 Quantity Food Provision Principles and Practices",
      "2.01 Canadian Diversity in Practice",
      "2.02 Ethical Practice and Integrity",
      "2.03 Cultural Safety",
      "2.04 Client-Centred Practice",
      "2.05 Legislative, Regulatory, and Organizational Practice",
      "2.06 Documentation Standards",
      "2.07 Risk Management",
      "2.08 Time and Workload Management",
      "2.09 Evidence-Informed Practice",
      "2.10 Reflective Practice",
      "2.11 Practising Within Competence",
      "2.12 Maintaining Current Knowledge",
      "2.13 Information Management Technologies",
      "3.01 Communication Approaches",
      "3.02 Written Communication",
      "3.03 Oral Communication",
      "3.04 Electronic Communication",
      "3.05 Interpersonal Skills",
      "3.06 Teamwork",
      "3.07 Collaborative Practice",
      "4.01 Program and Project Management",
      "4.02 Quality Improvement in Practice",
      "4.03 Practice-Based Research",
      "4.04 Knowledge Translation",
      "4.05 Advocacy for Nutrition Health and Care",
      "4.06 Fostering Learning in Others",
      "4.07 Food Literacy Development",
      "4.08 Food Skills Development",
      "5.01 Nutrition Assessment",
      "5.02 Nutrition Diagnosis",
      "5.03 and 5.04 Nutrition Intervention Planning and Implementation",
      "Intervention: Diabetes",
      "Intervention: Cardiovascular",
      "Intervention: Renal",
      "Intervention: Respiratory",
      "Intervention: Gastrointestinal",
      "Intervention: Hematological Disease",
      "Intervention: Liver and Gallbladder",
      "Intervention: Musculoskeletal",
      "Intervention: Nervous Systems",
      "Intervention: Eating Disorder",
      "Intervention: Energy Imbalance",
      "Intervention: Nutrition Support",
      "Intervention: Stress and Critical Illness",
      "5.05 Monitoring and Evaluation",
      "6.01 Assess Community and Population Nutrition Situations",
      "6.02 Determine Community and Population Nutrition Issues",
      "6.03 Develop Community and Population Nutrition Plans",
      "6.04 Implement Community and Population Nutrition Plans",
      "6.05 Monitor and Evaluate Community and Population Nutrition Plans",
      "7.01 Determine Food Provision Requirements",
      "7.02 Plan Food Provision",
      "7.03 Manage Food Provision",
      "7.04 Monitor and Evaluate Food Provision",
    ],
  },
  {
    title: "Practice Question and Case-Based Learning Hub",
    subsections: [
      "Food and Nutrition Expertise",
      "Ethics and Professionalism",
      "Communication and Collaboration",
      "Management and Leadership",
      "Clinical Nutrition",
      "Population Public Health",
      "Food Provision",
      "Weak Area Question Sets",
      "Flagged Questions",
    ],
  },
  {
    title: "Mock Exam Centre",
    subsections: [
      "Mock Exam 1",
      "Mock Exam 2",
      "Post-Exam Performance Review",
      "Score Reports by Competency Area",
    ],
  },
  {
    title: "Quick Reference Library",
    subsections: [
      "Behavioural Change Theories",
      "Lab Values and Reference Ranges",
      "DRIs and AMDRs",
      "Energy Requirement Calculations",
      "Food Sources of Micro and Macronutrients",
      "Growth Charts",
      "ADIME and NCP Quick Guides",
      "Formula and Equation Sheets (Food Provision)",
    ],
  },
  {
    title: "Multimedia Learning Hub",
    subsections: [
      "Social Media Links",
      "Community Page and Forums",
      "Recorded Review Sessions",
      "Live Workshop Replays",
      "Live Support and Coaching",
      "Mentorship Sessions",
    ],
  },
  {
    title: "Exam Week and Exam Day",
    subsections: [
      "Final Week Preparation",
      "Exam Day Checklist",
      "Managing Stress on Exam Day",
      "During the Exam Reminders",
    ],
  },
  {
    title: "Admin and Back-End Structure",
    subsections: [
      "Content Management Dashboard",
      "Question Bank Management",
      "Mock Exam Builder",
      "Video and Media Upload Centre",
      "Worksheet and PDF Library Management",
      "User Management",
      "Subscription Management",
      "Booking and Calendar Management",
      "Analytics and Learner Progress Insights",
      "Accessibility and Content Update Controls",
      "Security and Content Protection Settings",
    ],
  },
  {
    title: "Member Account Area",
    subsections: [
      "My Dashboard",
      "My Study Plan",
      "My Bookings",
      "My Progress",
      "My Saved Resources",
      "My Mock Exams",
      "My Certificates and Completed Sessions",
      "Subscription and Billing",
      "Account Settings",
    ],
  },
];

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function main() {
  loadEnvFromFile();

  const connectionString = process.env.NEON_DB;
  if (!connectionString) {
    throw new Error("NEON_DB is missing. Add it to .env and retry.");
  }

  const sql = neon(connectionString);

  await sql`
    CREATE TABLE IF NOT EXISTS content_sections (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      sort_order INT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS content_subsections (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      section_id BIGINT NOT NULL REFERENCES content_sections(id) ON DELETE CASCADE,
      code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      sort_order INT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS content_resources (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      subsection_id BIGINT NOT NULL REFERENCES content_subsections(id) ON DELETE CASCADE,
      resource_type TEXT NOT NULL CHECK (
        resource_type IN (
          'study_notes',
          'audio',
          'video',
          'review_questions',
          'references',
          'worksheet',
          'other'
        )
      ),
      source_mode TEXT NOT NULL DEFAULT 'drive_link' CHECK (source_mode IN ('drive_link', 'ai_generated')),
      drive_url TEXT,
      ai_note TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'not_submitted' CHECK (status IN ('not_submitted', 'resubmit', 'done')),
      created_by TEXT NOT NULL,
      updated_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  /* Add notes column for existing tables */
  await sql`
    ALTER TABLE content_resources
    ADD COLUMN IF NOT EXISTS notes TEXT
  `;

  /* Add unique constraint to prevent duplicate resource types per subsection */
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_subsection_resource
    ON content_resources (subsection_id, resource_type)
  `;

  /* Add index on subsection_id for faster lookups */
  await sql`
    CREATE INDEX IF NOT EXISTS idx_resources_subsection
    ON content_resources (subsection_id)
  `;

  /* Add index on subsections.section_id for faster joins */
  await sql`
    CREATE INDEX IF NOT EXISTS idx_subsections_section
    ON content_subsections (section_id)
  `;

  for (let sectionIndex = 0; sectionIndex < CONTENT.length; sectionIndex += 1) {
    const section = CONTENT[sectionIndex];
    const sectionCode = `section-${sectionIndex + 1}-${slugify(section.title)}`;

    await sql`
      INSERT INTO content_sections (code, title, sort_order, updated_at)
      VALUES (${sectionCode}, ${section.title}, ${sectionIndex + 1}, NOW())
      ON CONFLICT (code)
      DO UPDATE SET
        title = EXCLUDED.title,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW()
    `;

    const sectionRows = await sql`
      SELECT id FROM content_sections WHERE code = ${sectionCode} LIMIT 1
    `;

    const sectionId = sectionRows[0]?.id;

    for (let subsectionIndex = 0; subsectionIndex < section.subsections.length; subsectionIndex += 1) {
      const subsectionTitle = section.subsections[subsectionIndex];
      const subsectionCode = `sub-${sectionIndex + 1}-${subsectionIndex + 1}-${slugify(subsectionTitle)}`;

      await sql`
        INSERT INTO content_subsections (section_id, code, title, sort_order, updated_at)
        VALUES (${sectionId}, ${subsectionCode}, ${subsectionTitle}, ${subsectionIndex + 1}, NOW())
        ON CONFLICT (code)
        DO UPDATE SET
          section_id = EXCLUDED.section_id,
          title = EXCLUDED.title,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW()
      `;
    }
  }

  console.log("Content tables are ready and CDRE hierarchy is seeded.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
