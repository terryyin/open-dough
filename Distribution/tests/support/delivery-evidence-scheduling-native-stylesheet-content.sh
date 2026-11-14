#!/usr/bin/env bash
# Stylesheet content for delivery-evidence/scheduling: the dashboard's one
# stylesheet, just under the project's 150-line limit, and the requested action
# row's rules that take it over that limit.

delivery_evidence_scheduling_write_stylesheet() {
  local workspace=$1
  mkdir -p -- "${workspace}/styles"
  cat > "${workspace}/styles/dashboard.css" << 'EOF'
/* Dashboard base, layout, sidebar and project card styles. */
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --radius: 6px;
  --text: #1f2933;
  --muted: #61717f;
  --surface: #ffffff;
  --canvas: #f4f6f8;
  --accent: #2563eb;
  --accent-strong: #1d4ed8;
  --border: #d9e0e6;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--text);
  background: var(--canvas);
}

/* Layout */
.dashboard {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

.dashboard-main {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dashboard-title {
  margin: 0;
  font-size: 1.25rem;
}

/* Sidebar */
.sidebar {
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: var(--space-3);
}

.sidebar-heading {
  margin: 0 0 var(--space-2);
  font-size: 0.85rem;
  text-transform: uppercase;
  color: var(--muted);
}

.sidebar-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sidebar-item {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
}

.sidebar-item:hover {
  background: var(--canvas);
}

.sidebar-item-current {
  font-weight: 600;
  color: var(--accent-strong);
}

/* Project cards */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-3);
}

.project-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.project-card-title {
  margin: 0;
  font-size: 1rem;
}

.project-card-meta {
  color: var(--muted);
  font-size: 0.85rem;
}

/* Status badges */
.badge {
  display: inline-block;
  padding: 0 var(--space-2);
  border-radius: 999px;
  font-size: 0.75rem;
  line-height: 1.6;
}

.badge-active {
  background: #dcfce7;
  color: #166534;
}

.badge-archived {
  background: #e5e7eb;
  color: #374151;
}

/* Empty state */
.empty-state {
  color: var(--muted);
  text-align: center;
  padding: var(--space-4);
}
EOF
}

# The requested row's rules, appended to the one stylesheet, which they take
# over the line limit.
delivery_evidence_scheduling_append_action_rules() {
  local workspace=$1
  cat >> "${workspace}/styles/dashboard.css" << 'EOF'

/* Project actions */
.project-actions {
  display: flex;
  gap: var(--space-1);
}

.project-action {
  padding: 2px var(--space-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 0.8rem;
}

.project-action:hover {
  border-color: var(--accent);
}

.project-action:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}

.project-action:disabled {
  opacity: 0.5;
}
EOF
}
