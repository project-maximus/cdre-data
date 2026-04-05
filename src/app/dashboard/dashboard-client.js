"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const RESOURCE_LABELS = {
  study_notes: "Study Notes",
  audio: "Audio",
  video: "Video Lesson",
  review_questions: "Review Questions",
  references: "References",
  worksheet: "Worksheet/PDF",
  other: "Other",
};

const SOURCE_MODE_LABELS = {
  drive_link: "Google Drive Link",
  ai_generated: "Use AI Generated Stuff",
};

const STATUS_LABELS = {
  not_submitted: "Not Submitted",
  resubmit: "Resubmit",
  done: "Done",
};

export default function DashboardClient({ username }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [sourceModes, setSourceModes] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [globalMessage, setGlobalMessage] = useState("");
  const [forms, setForms] = useState({});
  const [editing, setEditing] = useState({});

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId),
    [sections, activeSectionId]
  );

  async function loadData() {
    setLoading(true);
    setGlobalMessage("");

    try {
      const response = await fetch("/api/content", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        setGlobalMessage(data.error || "Failed to load dashboard data.");
        return;
      }

      setSections(data.sections || []);
      setResourceTypes(data.resourceTypes || []);
      setSourceModes(data.sourceModes || []);

      if (data.sections?.length) {
        setActiveSectionId((prev) => prev || data.sections[0].id);
      }
    } catch {
      setGlobalMessage("Could not load dashboard right now.");
    } finally {
      setLoading(false);
    }
  }

  function getFormState(subsectionId) {
    return (
      forms[subsectionId] || {
        sourceMode: sourceModes[0] || "drive_link",
        driveUrl: "",
        resourceType: resourceTypes[0] || "study_notes",
      }
    );
  }

  function updateForm(subsectionId, key, value) {
    const current = getFormState(subsectionId);
    setForms((prev) => ({
      ...prev,
      [subsectionId]: {
        ...current,
        [key]: value,
      },
    }));
  }

  async function addResource(event, subsectionId) {
    event.preventDefault();
    const state = getFormState(subsectionId);

    if (state.sourceMode === "drive_link" && !state.driveUrl) {
      setGlobalMessage("Google Drive link is required for Drive Link mode.");
      return;
    }

    setSaving(true);
    setGlobalMessage("");

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subsectionId,
          sourceMode: state.sourceMode,
          driveUrl: state.driveUrl,
          resourceType: state.resourceType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setGlobalMessage(data.error || "Could not save this link.");
        return;
      }

      setForms((prev) => ({
        ...prev,
        [subsectionId]: {
          ...state,
          driveUrl: "",
        },
      }));

      setGlobalMessage("Submitted and marked as Done.");
      await loadData();
    } catch {
      setGlobalMessage("Could not save this link.");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(resource) {
    setEditing((prev) => ({
      ...prev,
      [resource.id]: {
        sourceMode: resource.sourceMode || "drive_link",
        driveUrl: resource.driveUrl || "",
      },
    }));
  }

  function cancelEditing(resourceId) {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[resourceId];
      return next;
    });
  }

  async function saveEditedResource(resourceId) {
    const state = editing[resourceId];
    const driveUrl = state?.driveUrl || "";
    const sourceMode = state?.sourceMode || "drive_link";

    if (sourceMode === "drive_link" && !driveUrl) {
      setGlobalMessage("Google Drive link is required for Drive Link mode.");
      return;
    }

    setSaving(true);
    setGlobalMessage("");

    try {
      const response = await fetch(`/api/content/resources/${resourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceMode, driveUrl }),
      });
      const data = await response.json();

      if (!response.ok) {
        setGlobalMessage(data.error || "Could not update this link.");
        return;
      }

      cancelEditing(resourceId);
      setGlobalMessage("Updated and marked as Resubmitted.");
      await loadData();
    } catch {
      setGlobalMessage("Could not update this link.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-xl font-semibold">NutriPath CDRE Prep Platform</h1>
            <p className="text-sm text-slate-600">Signed in as {username}</p>
          </div>
          <button
            onClick={signOut}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </header>

      {mounted ? (
        <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Warning: Follow Exact Naming + Valid Drive Links</p>
            <p className="mt-1">
              Use exact subsection naming and a consistent file name pattern such as
              SubsectionCode_ResourceType_Version.
            </p>
            <p className="mt-1">
              You can choose Google Drive Link mode or Use AI Generated Stuff mode.
              For Drive Link mode, make sure link permissions allow access.
            </p>
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8">
        <aside className="rounded-xl border border-slate-200 bg-white p-3">
          <h2 className="mb-2 px-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Sections
          </h2>
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                  activeSectionId === section.id
                    ? "bg-slate-900 text-white"
                    : "hover:bg-slate-100"
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </aside>

        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          {loading ? <p>Loading content...</p> : null}
          {!loading && !activeSection ? <p>No section found.</p> : null}

          {!loading && activeSection ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">{activeSection.title}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Default status is Not Submitted. First save becomes Done. Editing marks it as Resubmitted.
                </p>
                {globalMessage ? (
                  <p className="mt-2 text-sm text-slate-700" aria-live="polite">
                    {globalMessage}
                  </p>
                ) : null}
              </div>

              <div className="space-y-6">
                {activeSection.subsections.map((subsection) => {
                  const form = getFormState(subsection.id);

                  return (
                    <article
                      key={subsection.id}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <h3 className="font-semibold">{subsection.code} - {subsection.title}</h3>

                      <form
                        onSubmit={(event) => addResource(event, subsection.id)}
                        className="mt-3 grid gap-3 md:grid-cols-[170px_1fr_170px_120px]"
                      >
                        <select
                          value={form.sourceMode}
                          onChange={(event) =>
                            updateForm(subsection.id, "sourceMode", event.target.value)
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2"
                        >
                          {sourceModes.map((mode) => (
                            <option key={mode} value={mode}>
                              {SOURCE_MODE_LABELS[mode] || mode}
                            </option>
                          ))}
                        </select>

                        <input
                          type="url"
                          placeholder={
                            form.sourceMode === "ai_generated"
                              ? "No link needed for AI mode"
                              : "Google Drive link"
                          }
                          value={form.driveUrl}
                          onChange={(event) =>
                            updateForm(subsection.id, "driveUrl", event.target.value)
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2"
                          required={form.sourceMode === "drive_link"}
                          disabled={form.sourceMode === "ai_generated"}
                        />

                        <select
                          value={form.resourceType}
                          onChange={(event) =>
                            updateForm(subsection.id, "resourceType", event.target.value)
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2"
                        >
                          {resourceTypes.map((type) => (
                            <option key={type} value={type}>
                              {RESOURCE_LABELS[type] || type}
                            </option>
                          ))}
                        </select>

                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                        >
                          Submit
                        </button>
                      </form>

                      <div className="mt-4 space-y-2">
                        {subsection.resources.length ? null : (
                          <p className="text-sm text-slate-500">
                            No links yet. Status: <strong>{STATUS_LABELS.not_submitted}</strong>
                          </p>
                        )}

                        {subsection.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
                                {SOURCE_MODE_LABELS[resource.sourceMode] || resource.sourceMode}
                              </span>
                              <span className="rounded bg-white px-2 py-1 text-xs font-medium">
                                {RESOURCE_LABELS[resource.resourceType] || resource.resourceType}
                              </span>
                              <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                                {STATUS_LABELS[resource.status] || resource.status}
                              </span>
                              <span className="text-xs text-slate-600">
                                by {resource.createdBy}
                              </span>
                            </div>

                            {editing[resource.id] !== undefined ? (
                              <div className="mt-2 space-y-2">
                                <select
                                  value={editing[resource.id].sourceMode}
                                  onChange={(event) =>
                                    setEditing((prev) => ({
                                      ...prev,
                                      [resource.id]: {
                                        ...prev[resource.id],
                                        sourceMode: event.target.value,
                                        driveUrl:
                                          event.target.value === "ai_generated"
                                            ? ""
                                            : prev[resource.id].driveUrl,
                                      },
                                    }))
                                  }
                                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                                >
                                  {sourceModes.map((mode) => (
                                    <option key={mode} value={mode}>
                                      {SOURCE_MODE_LABELS[mode] || mode}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  type="url"
                                  value={editing[resource.id].driveUrl}
                                  onChange={(event) =>
                                    setEditing((prev) => ({
                                      ...prev,
                                      [resource.id]: {
                                        ...prev[resource.id],
                                        driveUrl: event.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                                  required={editing[resource.id].sourceMode === "drive_link"}
                                  disabled={editing[resource.id].sourceMode === "ai_generated"}
                                  placeholder={
                                    editing[resource.id].sourceMode === "ai_generated"
                                      ? "No link needed for AI mode"
                                      : "Google Drive link"
                                  }
                                />
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => saveEditedResource(resource.id)}
                                    disabled={saving}
                                    className="rounded bg-slate-900 px-3 py-1 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
                                  >
                                    Save Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => cancelEditing(resource.id)}
                                    className="rounded border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                {resource.sourceMode === "drive_link" ? (
                                  <a
                                    href={resource.driveUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 block break-all text-sm text-blue-700 underline"
                                  >
                                    {resource.driveUrl}
                                  </a>
                                ) : (
                                  <p className="mt-2 text-sm text-slate-700">
                                    AI generated content requested for this item.
                                  </p>
                                )}
                                <div className="mt-2">
                                  <button
                                    type="button"
                                    onClick={() => startEditing(resource)}
                                    className="rounded border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50"
                                  >
                                    Edit
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
