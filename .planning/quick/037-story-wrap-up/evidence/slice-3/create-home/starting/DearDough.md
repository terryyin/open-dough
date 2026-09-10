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
