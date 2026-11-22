---
id: SEED-422
status: active
planted: 2026-11-22
planted_during: Terry Yin requested a top-priority Usage correction after the November execution-token audit
trigger_when: Selected from the product backlog for refinement
scope: one story
---

# SEED-422 — Correct stale Dashboard token totals

## Why this matters

Developers use the Usage trend to decide where execution efficiency needs
attention. The Dashboard can pick up a task's completion while still showing
an earlier, incomplete usage total as measured. Those totals enter the
rolling median and can distort comparisons long after the task finishes.

<a id="correct-stale-token-totals"></a>

### Correct stale token totals for completed Dashboard tasks

**Identity:** SEED-422#correct-stale-token-totals
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Outcome.** A developer sees the attributable Codex or Claude Code
  usage for a finished Dashboard task after Refresh. If usage is still
  provisional or the native evidence is incomplete, the view shows that
  state and excludes the point from the rolling median until it qualifies.
- **Evaluation.** Start with a task sampled while running. It then records
  more attributable native responses and finishes. Show that Refresh
  recovers those responses, updates the point and trend, and counts each
  response once on repeated refreshes. Exercise both hosts and include a
  case with missing native evidence. Reproduce the production case where a
  later Usage check has already advanced past the omitted responses. Trace
  why the totals stayed stale before selecting the correction.
- **Production history.** Reconcile the accumulated production usage
  history against retained native evidence. If stale totals remain after
  the normal refresh path is corrected, rehearse and verify a one-time
  backfill on a copy, then apply it to production with a recoverable backup.
  Check affected totals and medians against the source evidence, preserve
  history that cannot be rebuilt, and surface gaps for those tasks. Verify
  that rerunning the repair leaves totals consistent without duplicates.
- **Evidence.** In the November 22 07:35 Singapore-time snapshot, Claude
  Code execution `SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed`
  showed 0.38M index units from 28 responses. A native recount found 12.64M
  across 860 attributable responses. Correcting the earlier totals moved
  the opening Claude Code median from 3.28M to 4.09M. Earlier Codex totals
  also missed retained responses, though those tasks did not change the
  opening median. The [task point](../../dashboard/server/tokenIndexTask.ts),
  [refresh](../../dashboard/server/usageRefresh.ts), and
  [history import](../../dashboard/server/usageImport.ts) are starting points.
- **Effort.** Medium, low confidence until the stale ingestion path and the
  availability of retained production evidence are confirmed. A manual
  recount can validate the backfill. The story also requires proof that
  future Refresh results and trend eligibility stay correct.
