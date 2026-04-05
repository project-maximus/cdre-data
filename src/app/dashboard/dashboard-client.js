"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastProvider, useToast } from "../components/Toast";
import StatusBadge from "../components/StatusBadge";
import ConfirmModal from "../components/ConfirmModal";
import ThemeToggle from "../components/ThemeToggle";

/* ── SVG Icons ── */
const I = {
  Layers: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5L1.5 5L8 8.5L14.5 5L8 1.5Z"/><path d="M1.5 8L8 11.5L14.5 8"/><path d="M1.5 11L8 14.5L14.5 11"/>
    </svg>
  ),
  Chart: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="8" width="3" height="6" rx="0.5"/><rect x="6.5" y="4" width="3" height="10" rx="0.5"/><rect x="11" y="2" width="3" height="12" rx="0.5"/>
    </svg>
  ),
  Edit: () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z"/>
    </svg>
  ),
  Trash: () => (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4H14"/><path d="M5 4V2.5C5 2.22 5.22 2 5.5 2H10.5C10.78 2 11 2.22 11 2.5V4"/><path d="M12.5 4V13.5C12.5 13.78 12.28 14 12 14H4C3.72 14 3.5 13.78 3.5 13.5V4"/>
    </svg>
  ),
  External: () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8.5V13.5H2.5V4H7.5"/><path d="M10 2.5H13.5V6"/><path d="M7 9L13.5 2.5"/>
    </svg>
  ),
  Menu: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 5H15"/><path d="M3 9H15"/><path d="M3 13H15"/>
    </svg>
  ),
  Info: () => (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="8" r="6"/><path d="M8 7V11"/><circle cx="8" cy="5" r="0.5" fill="currentColor"/>
    </svg>
  ),
  Doc: () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5.5 5.5H10.5"/><path d="M5.5 8H10.5"/><path d="M5.5 10.5H8"/>
    </svg>
  ),
};

const RESOURCE_LABELS = {
  study_notes: "Study Notes",
  audio: "Audio",
  video: "Video Lesson",
  review_questions: "Review Questions",
  references: "References",
  worksheet: "Worksheet / PDF",
  other: "Other",
};

const SOURCE_MODE_LABELS = {
  drive_link: "Google Drive Link",
  ai_generated: "AI-Assisted Content",
};

export default function DashboardClient({ username, role }) {
  return (
    <ToastProvider>
      <DashboardInner username={username} role={role} />
    </ToastProvider>
  );
}

function DashboardInner({ username, role }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [sourceModes, setSourceModes] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [forms, setForms] = useState({});
  const [saving, setSaving] = useState({});
  const [editing, setEditing] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId),
    [sections, activeSectionId]
  );

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/content", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to load content."); return; }
      setSections(data.sections || []);
      setResourceTypes(data.resourceTypes || []);
      setSourceModes(data.sourceModes || []);
      if (data.sections?.length) setActiveSectionId((prev) => prev || data.sections[0].id);
    } catch { toast.error("Could not connect to server."); }
    finally { setLoading(false); }
  }

  function getForm(sid) {
    return forms[sid] || {
      sourceMode: sourceModes[0] || "drive_link",
      driveUrl: "",
      aiNote: "",
      notes: "",
      resourceType: resourceTypes[0] || "study_notes",
    };
  }

  function updateForm(sid, key, value) {
    setForms((prev) => ({ ...prev, [sid]: { ...getForm(sid), [key]: value } }));
  }

  async function addResource(e, sid) {
    e.preventDefault();
    const s = getForm(sid);
    if (s.sourceMode === "drive_link" && !s.driveUrl) { toast.error("Please provide a Google Drive link."); return; }
    setSaving((p) => ({ ...p, [sid]: true }));
    try {
      const res = await fetch("/api/content", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subsectionId: sid,
          sourceMode: s.sourceMode,
          driveUrl: s.driveUrl,
          aiNote: s.aiNote,
          notes: s.notes,
          resourceType: s.resourceType,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Could not save."); return; }
      setForms((p) => ({ ...p, [sid]: { ...s, driveUrl: "", aiNote: "", notes: "" } }));
      toast.success("Resource submitted successfully.");
      await loadData();
    } catch { toast.error("Could not save resource."); }
    finally { setSaving((p) => ({ ...p, [sid]: false })); }
  }

  function startEditing(r) {
    setEditing((p) => ({
      ...p,
      [r.id]: {
        sourceMode: r.sourceMode || "drive_link",
        driveUrl: r.driveUrl || "",
        aiNote: r.aiNote || "",
        notes: r.notes || "",
      },
    }));
  }

  function cancelEditing(rid) { setEditing((p) => { const n = { ...p }; delete n[rid]; return n; }); }

  async function saveEdit(rid) {
    const s = editing[rid]; if (!s) return;
    if (s.sourceMode === "drive_link" && !s.driveUrl) { toast.error("Please provide a Google Drive link."); return; }
    setSaving((p) => ({ ...p, [`e-${rid}`]: true }));
    try {
      const res = await fetch(`/api/content/resources/${rid}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceMode: s.sourceMode,
          driveUrl: s.driveUrl,
          aiNote: s.aiNote,
          notes: s.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Could not update."); return; }
      cancelEditing(rid); toast.success("Resource updated."); await loadData();
    } catch { toast.error("Could not update resource."); }
    finally { setSaving((p) => ({ ...p, [`e-${rid}`]: false })); }
  }

  async function deleteResource(rid) {
    try {
      const res = await fetch(`/api/content/resources/${rid}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Could not delete."); return; }
      toast.success("Resource deleted."); setDeleteTarget(null); await loadData();
    } catch { toast.error("Could not delete resource."); }
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/"); router.refresh();
  }

  const canDelete = role === "admin" || role === "developer";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(6,8,15,0.6)", zIndex: 35, backdropFilter: "blur(4px)" }} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sb-brand">
          <div className="sb-brand-icon"><I.Layers /></div>
          <div className="sb-brand-text"><h1>NutriPath</h1><p>Content Hub</p></div>
        </div>

        <nav className="sb-nav">
          <div className="sb-label">Sections</div>
          <div className="stagger">
            {sections.map((section) => {
              const count = section.subsections?.reduce((a, s) => a + (s.resources?.length || 0), 0);
              return (
                <button key={section.id} onClick={() => { setActiveSectionId(section.id); setSidebarOpen(false); }}
                  className={`sb-item ${activeSectionId === section.id ? "active" : ""}`}>
                  <span className="sb-item-icon"><I.Doc /></span>
                  <span className="sb-item-label">{section.title}</span>
                  {count > 0 && <span className="sb-item-count">{count}</span>}
                </button>
              );
            })}
          </div>
          {role === "developer" && (
            <>
              <div className="sb-label" style={{ marginTop: 16 }}>Admin</div>
              <button className="sb-item" onClick={() => router.push("/admin")}>
                <span className="sb-item-icon"><I.Chart /></span>
                <span className="sb-item-label">Admin Dashboard</span>
              </button>
            </>
          )}
        </nav>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">{username.charAt(0).toUpperCase()}</div>
            <div><div className="sb-user-name">{username}</div><div className="sb-user-role">{role}</div></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={signOut} className="sb-signout" style={{ flex: 1 }}>Sign out</button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div style={{ display: "none", marginBottom: 16 }} className="mobile-trigger">
          <button className="btn btn-secondary btn-sm" onClick={() => setSidebarOpen(true)}><I.Menu /> Menu</button>
        </div>
        <style>{`@media (max-width: 1024px) { .mobile-trigger { display: block !important; } }`}</style>

        <div className="page-header">
          <h2 className="page-title">{loading ? "Loading..." : activeSection?.title || "Select a section"}</h2>
          <p className="page-subtitle">Submit content resources for each topic. Choose your upload method and resource type.</p>
        </div>

        {!loading && activeSection && (
          <div className="tip-banner animate-fadeIn">
            <div className="tip-indicator"><I.Info /></div>
            <div className="tip-content">
              <strong>How it works — </strong>
              Select a resource type, choose your upload method, then submit.
              Each topic can have one resource per type. You can edit submissions anytime.
            </div>
          </div>
        )}

        {loading && (
          <div className="empty-state">
            <div className="empty-state-icon" style={{ animation: "breathe 2s ease-in-out infinite" }}><I.Layers /></div>
            <p className="empty-state-text">Loading content...</p>
          </div>
        )}

        {!loading && activeSection && (
          <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {activeSection.subsections.map((sub) => {
              const form = getForm(sub.id);
              const isSaving = saving[sub.id] || false;
              return (
                <div key={sub.id} className="sub-card">
                  <div className="sub-header">
                    <h3 className="sub-title">{sub.title}</h3>
                    {sub.resources.length > 0 ? (
                      <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                        {sub.resources.length} resource{sub.resources.length !== 1 ? "s" : ""}
                      </span>
                    ) : (
                      <StatusBadge status="not_submitted" />
                    )}
                  </div>
                  <div className="sub-body">
                    <form onSubmit={(e) => addResource(e, sub.id)} style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-end" }}>
                      <div style={{ flex: "0 0 auto", minWidth: 160 }}>
                        <label className="label">Upload Method</label>
                        <select value={form.sourceMode} onChange={(e) => updateForm(sub.id, "sourceMode", e.target.value)} className="select">
                          {sourceModes.map((m) => <option key={m} value={m}>{SOURCE_MODE_LABELS[m] || m}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <label className="label">{form.sourceMode === "ai_generated" ? "Notes (optional)" : "Google Drive Link"}</label>
                        {form.sourceMode === "ai_generated" ? (
                          <input type="text" value={form.aiNote} onChange={(e) => updateForm(sub.id, "aiNote", e.target.value)} className="input" placeholder="Describe what AI content is needed..." />
                        ) : (
                          <input type="url" value={form.driveUrl} onChange={(e) => updateForm(sub.id, "driveUrl", e.target.value)} className="input" placeholder="https://drive.google.com/..." required />
                        )}
                      </div>
                      <div style={{ flex: "0 0 auto", minWidth: 150 }}>
                        <label className="label">Resource Type</label>
                        <select value={form.resourceType} onChange={(e) => updateForm(sub.id, "resourceType", e.target.value)} className="select">
                          {resourceTypes.map((t) => <option key={t} value={t}>{RESOURCE_LABELS[t] || t}</option>)}
                        </select>
                      </div>
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <label className="label">Notes (optional)</label>
                        <input
                          type="text"
                          value={form.notes}
                          onChange={(e) => updateForm(sub.id, "notes", e.target.value)}
                          className="input"
                          placeholder="Any context for reviewers/admin"
                        />
                      </div>
                      <button type="submit" disabled={isSaving} className="btn btn-primary" style={{ height: 38 }}>
                        {isSaving ? "Saving..." : "Submit"}
                      </button>
                    </form>

                    {sub.resources.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        {sub.resources.map((r) => (
                          <div key={r.id} className="res-item">
                            {editing[r.id] !== undefined ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                  <select value={editing[r.id].sourceMode}
                                    onChange={(e) => setEditing((p) => ({ ...p, [r.id]: { ...p[r.id], sourceMode: e.target.value, driveUrl: e.target.value === "ai_generated" ? "" : p[r.id].driveUrl, aiNote: e.target.value === "drive_link" ? "" : p[r.id].aiNote } }))}
                                    className="select" style={{ width: "auto", minWidth: 160 }}>
                                    {sourceModes.map((m) => <option key={m} value={m}>{SOURCE_MODE_LABELS[m] || m}</option>)}
                                  </select>
                                  {editing[r.id].sourceMode === "drive_link" ? (
                                    <input type="url" value={editing[r.id].driveUrl} onChange={(e) => setEditing((p) => ({ ...p, [r.id]: { ...p[r.id], driveUrl: e.target.value } }))} className="input" style={{ flex: 1, minWidth: 200 }} placeholder="https://drive.google.com/..." required />
                                  ) : (
                                    <input type="text" value={editing[r.id].aiNote} onChange={(e) => setEditing((p) => ({ ...p, [r.id]: { ...p[r.id], aiNote: e.target.value } }))} className="input" style={{ flex: 1, minWidth: 200 }} placeholder="Describe what AI content is needed..." />
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={editing[r.id].notes || ""}
                                  onChange={(e) => setEditing((p) => ({ ...p, [r.id]: { ...p[r.id], notes: e.target.value } }))}
                                  className="input"
                                  placeholder="Notes (optional)"
                                />
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button type="button" onClick={() => saveEdit(r.id)} disabled={saving[`e-${r.id}`]} className="btn btn-primary btn-sm">{saving[`e-${r.id}`] ? "Saving..." : "Save Changes"}</button>
                                  <button type="button" onClick={() => cancelEditing(r.id)} className="btn btn-ghost btn-sm">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="res-meta">
                                  <span className="badge badge-source">{SOURCE_MODE_LABELS[r.sourceMode] || r.sourceMode}</span>
                                  <span className="badge badge-type">{RESOURCE_LABELS[r.resourceType] || r.resourceType}</span>
                                  <StatusBadge status={r.status} />
                                  <span className="res-by">by {r.createdBy}</span>
                                </div>
                                {r.sourceMode === "drive_link" && r.driveUrl && (
                                  <a href={r.driveUrl} target="_blank" rel="noreferrer" className="res-link" style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8 }}>
                                    <I.External />{r.driveUrl.length > 60 ? r.driveUrl.slice(0, 60) + "..." : r.driveUrl}
                                  </a>
                                )}
                                {r.sourceMode === "ai_generated" && (
                                  <div style={{ marginTop: 8 }}>
                                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>AI-assisted content{r.aiNote ? ":" : " requested"}</p>
                                    {r.aiNote && <p style={{ fontSize: 13, color: "var(--text-secondary)", background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "var(--radius-sm)", marginTop: 4, border: "1px solid var(--border-subtle)" }}>{r.aiNote}</p>}
                                  </div>
                                )}
                                {r.notes && (
                                  <div style={{ marginTop: 8 }}>
                                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Notes:</p>
                                    <p style={{ fontSize: 13, color: "var(--text-secondary)", background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "var(--radius-sm)", marginTop: 4, border: "1px solid var(--border-subtle)" }}>{r.notes}</p>
                                  </div>
                                )}
                                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                                  <button type="button" onClick={() => startEditing(r)} className="btn btn-ghost btn-sm"><I.Edit /> Edit</button>
                                  {canDelete && <button type="button" onClick={() => setDeleteTarget(r.id)} className="btn btn-danger btn-sm"><I.Trash /> Delete</button>}
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {sub.resources.length === 0 && (
                      <div className="empty-state" style={{ padding: "16px 0" }}>
                        <p className="empty-state-hint">No resources submitted yet — use the form above to add one.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {deleteTarget && (
        <ConfirmModal title="Delete Resource" description="Are you sure you want to delete this resource? This action cannot be undone."
          confirmLabel="Delete" confirmClass="btn-danger" onConfirm={() => deleteResource(deleteTarget)} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
