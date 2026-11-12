# Delivered slice contracts

The completed contracts below retain the exact active-plan text for retrospective
review. PLAN.md owns authoritative statuses and remaining work; detailed runtime
observations remain in each linked slice evidence record.

<a id="slice-1"></a>

### 1. Restore complete review handoff proof within the default case budget
Type: Structure
Status: done
Proof: Retain every assertion in both `side-panel-content-replacement` cases;
repeat them twice under the default timeout, then typecheck and run affected
Claude/native fixture consumers found by the consumer trace. P2 is the bounded
candidate evidence, not a substitute for verification of the delivered diff.

Change: Reuse/modularize the existing immutable preview preparation in the common
worker pool for queued Codex readers. Keep private origins, native protocol,
server lifecycle and all causal user work in their existing fixtures/cases.
The whole run still accounts for the preparation. This repairs P0 and enables
slice2's full fluent/procedural compatibility gate. Do not cherry-pick an entire
stopped worktree or change its files/ownership; reuse only the justified seam.
No active exact repair owner was established: SEED-287's retained evidence
records a user-directed stop, and SEED-324 names different landed-CI checks.

<a id="slice-2"></a>

### 2. Read review entry and comparisons through shared controls
Type: Behavior
Status: done
Proof: Entire affected review cohort plus procedural/fluent entry consumers;
independent expected names, revisions, files/diffs and request evidence remain.

Behavior: A developer reads branch/trunk/completed/one-shot and Intent-entry
cases → follows named entry/comparison operations → the chosen story, baseline
or run and expected comparison are explicit, with one Review changes owner.
Retain exact accessible-name/glyph/Tab proof in `story-review-action.spec.ts`.
Sweep current callers, not the historical count: include completed Intent and
review-mode cases, `navigation/board-scroll`, `support/launchLandingReview` and
helpers that open review indirectly. Disposition each affected caller.

Starting gate: `caffeinate -s -i npm run test:dashboard -- /tests/review/ tests/intent/intent-story-review-return.spec.ts tests/intent/intent-done-review-modes.spec.ts tests/intent/intent-done-landed-review-mode.spec.ts tests/navigation/board-scroll.spec.ts tests/navigation/side-panel-content-replacement.spec.ts tests/navigation/side-panel-content-switching.spec.ts --workers=1`.
Add transitive consumers identified by the delivered effect.

<a id="slice-3"></a>

### 3. Read tree, file and diff retention without local selector plumbing
Type: Behavior
Status: done
Proof: Caller-supplied tree order, changed-file counts, selected row, diff text,
line numbers, focus/scroll and independent accessibility/geometry checks remain.

Behavior: A developer reads file/context/retention cases → follows shared tree,
pane and reading operations → the source exposes what is selected and readable
before and after pointer, keyboard or touch input. Keep pane-specific scrolling,
context expansion and visible-line measurements distinct. Extend suitable
owners; do not hide the user protocol in a single generic journey operation.

Starting gate: `caffeinate -s -i npm run test:dashboard -- '/tests/review/story-review-(tree|panes|diff-context|touch|line-counts)' --workers=1`.
Include consuming entry/comparison and one-shot-race cases when their owner changes.

<a id="slice-4"></a>

### 4. Keep freshness and held-answer causality visible
Type: Behavior
Status: done
Proof: Refresh/commit/uncommitted-check cases preserve old/new snapshot and file
facts, selected comparison/checks, request payload/counts and exact release order.

Behavior: A review/file read is pending or the worktree changes → the reviewer
chooses another run/file or refreshes → named operations reveal the retained or
replacement answer while the scenario still controls every hold and release.
`story-review-one-shot-choice-races.spec.ts` owns the cross-boundary old-answer
rejection example, including divider, narrow layout, Hide/Show files and focus
return; run it after changes to any owner it consumes, without duplicating it.

Starting gate: `caffeinate -s -i npm run test:dashboard -- '/tests/review/story-review-(refresh|commit-refresh|uncommitted-check|commit-races|one-shot-choice-races)' --workers=1`.
