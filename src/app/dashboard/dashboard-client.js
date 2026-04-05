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

const STATUS_LABELS = {
  not_submitted: "Not Submitted",
  resubmit: "Resubmit",
  done: "Done",
};

export default function DashboardClient({ username }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sections, setSections] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [globalMessage, setGlobalMessage] = useState("");
  const [forms, setForms] = useState({});

  useEffect(() => {
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
      setStatuses(data.statuses || []);

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
        driveUrl: "",
        resourceType: resourceTypes[0] || "study_notes",
        status: statuses[0] || "not_submitted",
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

    setSaving(true);
    setGlobalMessage("");

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subsectionId,
          driveUrl: state.driveUrl,
          resourceType: state.resourceType,
          status: state.status,
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

      setGlobalMessage("Link saved.");
      await loadData();
    } catch {
      setGlobalMessage("Could not save this link.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(resourceId, status) {
    setSaving(true);
    setGlobalMessage("");

    try {
      const response = await fetch(`/api/content/resources/${resourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        setGlobalMessage(data.error || "Could not update status.");
        return;
      }

      setGlobalMessage("Status updated.");
      await loadData();
    } catch {
      setGlobalMessage("Could not update status.");
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
                  Add Google Drive resources for each subsection and track status.
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
                        className="mt-3 grid gap-3 md:grid-cols-[1fr_170px_170px_120px]"
                      >
                        <input
                          type="url"
                          placeholder="Google Drive link"
                          value={form.driveUrl}
                          onChange={(event) =>
                            updateForm(subsection.id, "driveUrl", event.target.value)
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2"
                          required
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

                        <select
                          value={form.status}
                          onChange={(event) =>
                            updateForm(subsection.id, "status", event.target.value)
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABELS[status] || status}
                            </option>
                          ))}
                        </select>

                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                        >
                          Save
                        </button>
                      </form>

                      <div className="mt-4 space-y-2">
                        {subsection.resources.length ? null : (
                          <p className="text-sm text-slate-500">No links yet.</p>
                        )}

                        {subsection.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded bg-white px-2 py-1 text-xs font-medium">
                                {RESOURCE_LABELS[resource.resourceType] || resource.resourceType}
                              </span>
                              <span className="text-xs text-slate-600">
                                by {resource.createdBy}
                              </span>
                            </div>

                            <a
                              href={resource.driveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 block break-all text-sm text-blue-700 underline"
                            >
                              {resource.driveUrl}
                            </a>

                            <div className="mt-2">
                              <label className="mr-2 text-sm text-slate-600">Status:</label>
                              <select
                                value={resource.status}
                                onChange={(event) =>
                                  updateStatus(resource.id, event.target.value)
                                }
                                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                              >
                                {statuses.map((status) => (
                                  <option key={status} value={status}>
                                    {STATUS_LABELS[status] || status}
                                  </option>
                                ))}
                              </select>
                            </div>
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
