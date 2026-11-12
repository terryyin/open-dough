---
id: SEED-331
status: active
planted: 2026-11-12
scope: story
---

# Read CI history at a glance

<a id="read-ci-history-at-a-glance"></a>

### Read CI history at a glance in story comparison and test Proof

**Identity:** SEED-331#read-ci-history-at-a-glance

#### Goal

A developer reviewing a Done story in Dashboard Intent can see how the landing
compares with recent builds, spot failed builds, and drill into test execution
cost by entry, folder, and file. The chart and a few figures carry the answer
without asking the reader to scan build records or reference membership.

#### Views

- **Done story → CI comparison.** Add the CI wall-time chart to the reference
  section below the Baseline, Branch, and Landed comparison and above the
  by-entry table. Keep the comparison's endpoint proof, CI time without runner
  waits, and navigation available. The chart shows the selected published
  landing and verified retained observations through it. The current
  [Done wall-time reference](../../dashboard/src/IntentCiDoneWallTimeReference.tsx)
  has metrics and an open **Builds and reference evidence** list. The existing
  [history chart](../../dashboard/src/IntentCiHistoryChart.tsx) already renders
  project wall time and scope execution time.
- **Changed tests → entry or folder Summary.** Put test execution history above
  the sortable child table, with its immediate folders and files still opening
  their own views. Both depths use [IntentScopeProof](../../dashboard/src/IntentScopeProof.tsx),
  which currently appends history after the table. Apply the same placement in
  Project Intent's entry and folder Summaries.
- **Test file → Proof.** Put history above the file's endpoint comparison
  or proof table. Use one chart with **Test cases** and **Test file** choices
  when both measured units exist. Each has its own values, comparable average,
  and scale. A case timing here is the file's test-case aggregate. Retain
  **Purpose**, the observed counts and timing comparison, and the return to
  story CI comparison. [File Proof](../../dashboard/src/IntentFileProof.tsx)
  and Summary share [scope timing history](../../dashboard/src/IntentScopeTimingHistory.tsx)
  and its [unit charts](../../dashboard/src/IntentScopeTimingHistoryUnits.tsx)
  in both story and Project Intent contexts.

#### History design and response

- Use the same compact reading order and marks across the views. Show the
  selected timing, the prior-build average and count, and the signed elapsed and
  percentage change. Use green for faster timing and amber for slower timing,
  with the sign carrying the meaning in either appearance. Label CI wall time
  and cumulative test execution time explicitly. Plot by build date with
  readable units, a diamond for the selected landing or observed trunk endpoint,
  and a dashed line for the prior average.
- Place failed builds on a separate row below the duration axis with a red ×.
  Use a distinct hollow mark for unavailable timing. Keep the timing line broken
  at gaps and across incompatible scope measurements. Each mark offers a short
  date, timing or status readout via pointer, keyboard, and touch. Keep actual
  measured zero on the duration axis.
- Use brief status labels for pending, missing, out-of-retention, or insufficient
  history and for a selected measurement that reused an equivalent or later
  trunk build. When a later build stands for the landing, say that its timing
  includes later changes. If only the prior average is available, still show it.
  Keep the Done reference's refresh as a labeled icon and show a short retry
  action when a history read fails. Preserve the last successful history when
  a refresh fails for the same endpoint, independently of comparison refresh.
- Remove **Builds and reference evidence**, **Builds and evidence**, and the
  Included, Excluded, and Selected membership rows from the affected views.
  Replace the reference methodology and repeated provenance paragraphs with the
  chart and its compact metrics. The affected shared metric and list owners are
  [IntentCiPriorBuildReference](../../dashboard/src/IntentCiPriorBuildReference.tsx)
  and [IntentScopePriorBuildReference](../../dashboard/src/IntentScopePriorBuildReference.tsx).
- Slim the selected and scoped [authenticated history responses](../../dashboard/server/intentCiHistoryRead.ts)
  at the API boundary. Send dated measurements, typed gap statuses and reasons,
  compatible segment information, the selected endpoint and relevant provenance,
  and the compact prior-reference figures. Omit per-build membership, median and
  filtering details, and duplicated run and landing metadata used only by the
  removed lists. Project Intent's top-level [CI status history](../../dashboard/src/IntentCiHistory.tsx)
  still consumes the richer response. Preserve compatibility for that reader
  and supported dashboard versions.
- Derive the display from the existing retained history and Git-ordered cohort,
  and keep the current measurement eligibility, retention, and reference math.
  The [automatic follow-up ledger](../../docs/dashboard-ci-follow-up.md) keeps
  its full decision evidence server-side. Browsing history remains a local
  read. Update the [wall-time and reference specification](../../docs/dashboard-development-intent-ci-reference.md),
  which currently requires the evidence lists, and the applicable [CI comparison
  guidance](../../docs/dashboard-development-intent-ci-comparison.md). The display
  remains derived under [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).

#### Key examples

1. A Done landing measures 8m 04s against six comparable builds averaging
   8m 24s. The comparison shows −20s and −4%, a selected diamond, and the
   dashed average. A failed build and a missing measurement appear as distinct
   dated marks below the timing plot. Inspecting either shows its status in one
   line. The chart omits unrelated newer landings.
2. From that story, open the dashboard test entry, drill into a folder, and open
   a test file. In both Summaries, history is visible before the child table. In
   file Proof, switching between test-case and test-file timings changes the
   selected value, average, and chart scale together. The same layout is usable
   by keyboard and touch in light and dark appearance.
3. If a selected build failed or has no usable timing, show its status and any
   usable prior average without a delta. If fewer than five comparable prior
   builds remain, show the available observations with a short insufficient
   history status. A measured zero remains a point, and a zero prior average
   permits an elapsed difference with the percentage unavailable. When a later
   trunk build supplies the selected measurement, keep that provenance visible.
4. A history refresh fails while the Done comparison or scope Proof remains
   usable. The retained history and compact retry stay available independently
   of the endpoint comparison. The selected and scoped responses contain the
   chart data without the former lists, and the saved follow-up reference
   retains its membership and exact decision evidence.

#### Temporary design reference

Use the [interactive mockup](SEED-331-read-ci-history-at-a-glance/ci-history-mockups.html)
to review the four layouts, chart marks, and file timing unit switch. Its sample
timings and abbreviated tables are illustrative. During story wrap-up, after
implementation and review, delete the mockup and its remaining links with the
spent story records. Git preserves the reference for recovery.
