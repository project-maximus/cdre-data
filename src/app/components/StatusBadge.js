"use client";

export default function StatusBadge({ status }) {
  const config = {
    done: { label: "Submitted", className: "badge badge-done" },
    resubmit: { label: "Updated", className: "badge badge-resubmit" },
    not_submitted: { label: "Pending", className: "badge badge-pending" },
  };

  const { label, className } = config[status] || config.not_submitted;

  return (
    <span className={className}>
      <span className="badge-dot" />
      {label}
    </span>
  );
}
