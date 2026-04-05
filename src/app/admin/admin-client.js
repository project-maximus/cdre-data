"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastProvider, useToast } from "../components/Toast";
import StatusBadge from "../components/StatusBadge";
import Pagination from "../components/Pagination";
import ConfirmModal from "../components/ConfirmModal";
import ThemeToggle from "../components/ThemeToggle";

/* ── SVG Icons ── */
function IconLayers() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5L1.5 5L8 8.5L14.5 5L8 1.5Z" /><path d="M1.5 8L8 11.5L14.5 8" /><path d="M1.5 11L8 14.5L14.5 11" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="8" width="3" height="6" rx="0.5" /><rect x="6.5" y="4" width="3" height="10" rx="0.5" /><rect x="11" y="2" width="3" height="12" rx="0.5" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 14H14" /><path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4H14" /><path d="M5 4V2.5C5 2.22 5.22 2 5.5 2H10.5C10.78 2 11 2.22 11 2.5V4" /><path d="M12.5 4V13.5C12.5 13.78 12.28 14 12 14H4C3.72 14 3.5 13.78 3.5 13.5V4" />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8.5V13.5H2.5V4H7.5" /><path d="M10 2.5H13.5V6" /><path d="M7 9L13.5 2.5" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconCheckCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function IconList() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

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
  drive_link: "Google Drive",
  ai_generated: "AI Content",
};

export default function AdminClient({ username, role }) {
  return (
    <ToastProvider>
      <AdminInner username={username} role={role} />
    </ToastProvider>
  );
}

function AdminInner({ username, role }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, sectionFilter, userFilter]);

  async function loadData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "25");
      if (statusFilter) params.set("status", statusFilter);
      if (sectionFilter) params.set("section", sectionFilter);
      if (userFilter) params.set("user", userFilter);

      const res = await fetch(`/api/admin?${params}`, { cache: "no-store" });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "Failed to load admin data.");
        return;
      }
      setData(json);
    } catch {
      toast.error("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteResource(resourceId) {
    try {
      const res = await fetch(`/api/content/resources/${resourceId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Could not delete resource.");
        return;
      }
      toast.success("Resource deleted.");
      setDeleteTarget(null);
      await loadData();
    } catch {
      toast.error("Could not delete resource.");
    }
  }

  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function resetFilters() {
    setStatusFilter("");
    setSectionFilter("");
    setUserFilter("");
    setPage(1);
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-CA", {
      year: "numeric", month: "short", day: "numeric",
    });
  }

  const stats = data?.stats || {};
  const resources = data?.resources || [];
  const sections = data?.sections || [];
  const users = data?.users || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };
  const hasFilters = statusFilter || sectionFilter || userFilter;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-brand-icon">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 1.5L1.5 5L8 8.5L14.5 5L8 1.5Z" /><path d="M1.5 8L8 11.5L14.5 8" /><path d="M1.5 11L8 14.5L14.5 11" />
            </svg>
          </div>
          <div className="sb-brand-text">
            <h1>NutriPath</h1>
            <p>Admin</p>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-label">Dashboard</div>
          <button className="sb-item active">
            <span className="sb-item-icon"><IconChart /></span>
            <span className="sb-item-label">All Submissions</span>
          </button>

          {role === "developer" && (
            <>
              <div className="sb-label" style={{ marginTop: 16 }}>Content</div>
              <button className="sb-item" onClick={() => router.push("/dashboard")}>
                <span className="sb-item-icon"><IconEdit /></span>
                <span className="sb-item-label">Content Dashboard</span>
              </button>
            </>
          )}
        </nav>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">{username.charAt(0).toUpperCase()}</div>
            <div>
              <div className="sb-user-name">{username}</div>
              <div className="sb-user-role">{role}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={signOut} className="sb-signout" style={{ flex: 1 }}>Sign out</button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="page-header">
          <h2 className="page-title">Admin Dashboard</h2>
          <p className="page-subtitle">Overview of all submitted content resources across the platform.</p>
        </div>

        {/* Stats */}
        <div className="stat-grid stagger">
          <div className="stat-card" style={{ "--_accent": "var(--accent-400)" }}>
            <div className="stat-card-icon" style={{ background: "var(--accent-50)", color: "var(--accent-600)" }}>
              <IconBox />
            </div>
            <div className="stat-card-value">{stats.total || 0}</div>
            <div className="stat-card-label">Total Resources</div>
          </div>
          <div className="stat-card" style={{ "--_accent": "var(--success-500)" }}>
            <div className="stat-card-icon" style={{ background: "var(--success-50)", color: "var(--success-600)" }}>
              <IconCheckCircle />
            </div>
            <div className="stat-card-value">{stats.done_count || 0}</div>
            <div className="stat-card-label">Submitted</div>
          </div>
          <div className="stat-card" style={{ "--_accent": "var(--warning-500)" }}>
            <div className="stat-card-icon" style={{ background: "var(--warning-50)", color: "var(--warning-600)" }}>
              <IconRefresh />
            </div>
            <div className="stat-card-value">{stats.resubmit_count || 0}</div>
            <div className="stat-card-label">Updated</div>
          </div>
          <div className="stat-card" style={{ "--_accent": "var(--n-400)" }}>
            <div className="stat-card-icon" style={{ background: "var(--n-75)", color: "var(--n-500)" }}>
              <IconList />
            </div>
            <div className="stat-card-value">{stats.total_subsections || 0}</div>
            <div className="stat-card-label">Total Topics</div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card animate-fadeInUp">
          <div className="card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--n-900)" }}>
              All Submissions
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--n-400)", marginLeft: 6 }}>
                {pagination.total} total
              </span>
            </h3>
            <div className="filter-bar">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="select"
                style={{ width: "auto", minWidth: 130, fontSize: 12 }}
              >
                <option value="">All Statuses</option>
                <option value="done">Submitted</option>
                <option value="resubmit">Updated</option>
                <option value="not_submitted">Pending</option>
              </select>
              <select
                value={sectionFilter}
                onChange={(e) => { setSectionFilter(e.target.value); setPage(1); }}
                className="select"
                style={{ width: "auto", minWidth: 160, fontSize: 12 }}
              >
                <option value="">All Sections</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
              <select
                value={userFilter}
                onChange={(e) => { setUserFilter(e.target.value); setPage(1); }}
                className="select"
                style={{ width: "auto", minWidth: 120, fontSize: 12 }}
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              {hasFilters && (
                <button className="btn btn-ghost btn-xs" onClick={resetFilters}>Clear</button>
              )}
            </div>
          </div>

          <div className="card-body-flush" style={{ overflowX: "auto" }}>
            {loading ? (
              <div className="empty-state">
                <div className="empty-state-icon" style={{ animation: "breathe 2s ease-in-out infinite" }}>
                  <IconChart />
                </div>
                <p className="empty-state-text">Loading submissions...</p>
              </div>
            ) : resources.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <IconBox />
                </div>
                <p className="empty-state-text">No submissions found</p>
                <p className="empty-state-hint">
                  {hasFilters ? "Try adjusting your filters" : "Resources will appear here once teachers submit content"}
                </p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Topic</th>
                    <th>Type</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>By</th>
                    <th>Date</th>
                    <th style={{ width: 70 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontSize: 12, color: "var(--n-500)", maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.sectionTitle}
                      </td>
                      <td style={{ fontWeight: 500, maxWidth: 190, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--n-800)" }}>
                        {r.subsectionTitle}
                      </td>
                      <td><span className="badge badge-type">{RESOURCE_LABELS[r.resourceType] || r.resourceType}</span></td>
                      <td><span className="badge badge-source">{SOURCE_MODE_LABELS[r.sourceMode] || r.sourceMode}</span></td>
                      <td><StatusBadge status={r.status} /></td>
                      <td style={{ fontSize: 12, color: "var(--n-600)", maxWidth: 220 }} title={r.notes || ""}>
                        {r.notes ? (r.notes.length > 64 ? `${r.notes.slice(0, 64)}...` : r.notes) : "—"}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--n-600)" }}>{r.createdBy}</td>
                      <td style={{ fontSize: 11, color: "var(--n-400)", whiteSpace: "nowrap" }}>{formatDate(r.updatedAt)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          {r.sourceMode === "drive_link" && r.driveUrl && (
                            <a
                              href={r.driveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-ghost btn-icon btn-sm"
                              title="Open link"
                            >
                              <IconExternal />
                            </a>
                          )}
                          <button
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() => setDeleteTarget(r.id)}
                            title="Delete"
                          >
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div style={{ borderTop: "1px solid var(--n-100)" }}>
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </main>

      {deleteTarget && (
        <ConfirmModal
          title="Delete Resource"
          description="This will permanently remove this resource. This action cannot be undone."
          confirmLabel="Delete"
          confirmClass="btn-danger"
          onConfirm={() => deleteResource(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
