export const ALLOWED_RESOURCE_TYPES = new Set([
  "study_notes",
  "audio",
  "video",
  "review_questions",
  "references",
  "worksheet",
  "other",
]);

export const ALLOWED_STATUSES = new Set(["not_submitted", "resubmit", "done"]);

export const ALLOWED_SOURCE_MODES = new Set(["drive_link", "ai_generated"]);

export const ALLOWED_ROLES = new Set(["admin", "teacher", "developer"]);

export function isGoogleDriveUrl(input) {
  try {
    const url = new URL(input);
    const host = url.hostname.toLowerCase();
    return host.includes("drive.google.com") || host.includes("docs.google.com");
  } catch {
    return false;
  }
}
