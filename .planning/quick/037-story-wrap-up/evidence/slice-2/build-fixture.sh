#!/usr/bin/env bash
# Build the Slice 2 shared-records Git fixture. Setup only; it does not wrap up.
set -euo pipefail

target=${1:?target directory required}
slice1=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../slice-1" && pwd)
bash "${slice1}/build-fixture.sh" "${target}"

# Shared seed: spent story plus an active sibling in the same file.
cat > "${target}/.planning/seeds/SEED-W-widget-status.md" <<'EOF'
# SEED-W: Widget work

<a id="widget-status"></a>

### Report widget status

**Status:** execution and retrospective complete.
**Plan:** `.planning/quick/001-widget-status/PLAN.md`.

SPENT-STORY-WIDGET-STATUS

A failed widget status check is retried twice before an error is returned.

This section is spent story history for wrap-up.

<a id="audit-trail"></a>

### Keep the audit trail

UNRELATED-SENTINEL-KEEP

This sibling story is active and must remain.
EOF

rm -f "${target}/.planning/seeds/SEED-U-unrelated.md"

cat > "${target}/.planning/PRODUCT-BACKLOG.md" <<'EOF'
# Product backlog

## Near-future direction

Keep the widget status endpoint reliable.

## Backlog list

- [Report widget status](seeds/SEED-W-widget-status.md#widget-status) — SEED-W
- [Keep the audit trail](seeds/SEED-W-widget-status.md#audit-trail) — SEED-W

## Recently done

- [Report widget status](seeds/SEED-W-widget-status.md#widget-status) — SEED-W
EOF

mkdir -p "${target}/.planning/quick/001-widget-status/evidence"
cat > "${target}/.planning/quick/001-widget-status/evidence/run.md" <<'EOF'
# Assessment

SPENT-STORY-WIDGET-STATUS

Walked 001-widget-status. This assessment record is spent.
EOF

cat > "${target}/docs/index.md" <<'EOF'
# Docs index

- Product: [widget](widget.md)
- Spent plan: [001-widget-status](../.planning/quick/001-widget-status/PLAN.md)
- Active sibling: [Keep the audit trail](../.planning/seeds/SEED-W-widget-status.md#audit-trail)
EOF

cat > "${target}/DearDough.md" <<'EOF'
# DearDough Process Findings

## DD-001 — Recovered the widget-status plan too often

Repeated recovery of `.planning/quick/001-widget-status/PLAN.md`.

### Occurrences

- Execution: `001-widget-status` / `SPENT-STORY-WIDGET-STATUS`
  - Tool: Cursor
  - Evidence: plan path `.planning/quick/001-widget-status/PLAN.md`
  - Observed effect: recovered the same spent plan three times

## DD-002 — Keep the process map handy

UNRELATED-SENTINEL-KEEP

A useful map for other work. Human note: do not rewrite this issue.

### Occurrences

- Execution: `record:unrelated-audit`
  - Tool: Codex
  - Evidence: sibling story Keep the audit trail
  - Observed effect: reused one map

## DD-003 — Status checks reread context

Mixed issue. One occurrence is the spent widget-status execution; one is not.

### Occurrences

- Execution: `001-widget-status` / `SPENT-STORY-WIDGET-STATUS`
  - Tool: Cursor
  - Evidence: `.planning/quick/001-widget-status/PLAN.md`
  - Observed effect: reread spent story context
- Execution: `record:unrelated-audit`
  - Tool: Codex
  - Evidence: audit-trail sibling
  - Observed effect: reread active sibling context

## DD-004 — Widget work felt slow

Someone mentioned widget work. No plan path or commit identifies a specific
execution.
EOF

git -C "${target}" add -A
git -C "${target}" commit -qm 'fixture: shared seed, log, finished entry, incoming link'
