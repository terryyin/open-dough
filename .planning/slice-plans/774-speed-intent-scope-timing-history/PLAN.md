# Get fast proof of Intent scope timing history

**Identity:** SEED-413#speed-intent-scope-timing-history
**Source:** [Get fast proof of Intent scope timing history](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-scope-timing-history)
**Split from:** SEED-413#speed-intent-timing-history-on-vitest ([plan 772](../772-speed-intent-timing-history-on-vitest/PLAN.md), former Slices 4–6) before readiness on 2026-11-22, when its 19 legacy files exceeded one plan.
**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

## Provisional input

Resize at refinement: plan 764's three-file history port overran, so one or
two legacy files fit a slice. Mount through the page entry that plan 772
Slice 1 corrects; apply the carried decisions of plan 772 and the
[campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories).
`readScopeHistory` is already a required member of `IntentCiReadSource`.
Capture this story's own 14-file legacy baseline at two workers before the
first move (the 19-file baseline was 31 cases in 184.99 s, load 33–41,
22 November 2026).

### A. Scope glances and project/source history keys stay isolated to their source

Move `intent-project-scope-glance` (1), `intent-scope-glance` (1),
`intent-project-scope-history-source-identity` (2) and
`intent-project-scope-history-project-isolation` (2) over
`IntentScopeTimingHistory` / `useIntentCiScopeHistory` within its production
owner and typed `readScopeHistory` replies recording requested source,
endpoint, scope and `AbortSignal`.

Proof: Project and Done scope glances show accurate summary cues; switching
source identity or project issues the right request and aborts or ignores
other projects' or sources' answers.

### B. Project scope history isolates scope keys, keeps live proof on failure, and recovers on Retry

Move `intent-project-scope-history-key-isolation` (1),
`-recovery` (2), `-refresh` (1) and `-remount` (1) beside live Scope Proof.

Proof: entry, folder, file and revision keys keep distinct kept histories
across remounts; a failed or empty read keeps the last history and live Scope
Proof, offers `Retry`, and recovers without borrowing another endpoint's or
scope's history.

### C. Collected scope timing preserves units, provenance, segments and gaps

Move `intent-scope-timing-history-absent` (2), `-gaps` (3), `-provenance`
(1), `-reading` (1), `-segments` (1) and `-units` (2), with direct pure timing
checks only where DOM rendering is not the proof. Remove spent history
support and record the two-worker before/after timing and case disposition.

Proof: absent, partial and unavailable reasons, separate case and file
units, interrupted segments, build dates and provenance stay readable and
accessible; 0 legacy cases remain across the 14 files.
