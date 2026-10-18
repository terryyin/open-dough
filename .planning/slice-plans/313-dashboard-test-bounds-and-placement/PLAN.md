# Bound each dashboard test after its event and place page-less specs at the boundary

**Identity:** SEED-136#dashboard-test-bounds-and-placement
**Source:** [bounded correction](../../seeds/SEED-136-dashboard-test-efficiency.md#dashboard-test-bounds-and-placement)
Retrospective source: SEED-136#unify-and-streamline-dashboard-e2e, commits
789b7ca9..0bee7fd8, plan 310 slices 3–4 and Learnings, recoverable at
`0c96a546:.planning/slice-plans/310-unify-dashboard-e2e-strategy/PLAN.md`.

## Goal and scope

No dashboard test's bound precedes its required event; every spec that opens
no page lives in `dashboard/tests/boundary/` (README "Two tiers" and
"Synchronization"). The original correction's three findings were:

1. `boundary/project-add-boundary.spec.ts`: its 500 ms handler deadline can
   expire before gh writes its pid; retain event polls and choose a measured deadline.
2. Declare own-work bounds in `agent-launch-preparation-codex-retry.spec.ts`,
   `boundary/agent-launch-preparation-resume.spec.ts`, and
   `boundary/agent-launch-start-resume.spec.ts`; generalize the guide's rule.
3. Move page-less `serving-modes.spec.ts` and `production-watcher-refusals.spec.ts`
   into `boundary/`, fix imports, five comments and README references; name
   serving-modes as the boundary spec using real Vite servers on the run's build.

Required proof exposed own-work siblings and checks before settlement, native
creation or refreshed reads: reuse signals before unchanged assertions and
declare measured bounds. User-approved touch progress replaces the twelve-stroke
cap; verify both consumer specs and every assertion (evidence in Learnings).

Preserve every assertion, title and test count; retries, workers, shards and
process sweep. Exclude prebuilt-default/build placement (the CI story), tablet
iterations of `launchTouchViewports`, production-file size splits, longest-first.
`--load` burns each core; use test bounds, never longer expect bounds, sleeps or
retries. Original premises/measurements: `59fc28c8`.

## Design and existing solutions

- Middleware starts the deadline before body parsing/`gh` spawn: allow measured
  seconds for spawn before expiry. Keep both polls and disconnect/unfinished-body events.
- Reuse file-level `test.setTimeout(120_000)` (suite 60–180 s) where measured work
  approaches 30 s, including full-proof siblings. Retain separate hook/test bounds
  and unchanged expect bounds.
- Reuse `settledOutcome` after accepted launches and `expectSettledPage`
  before final read-dependent assertions; preserve intermediate/held helpers.
- `support/testFiles.mjs` discovers recursively, proved by
  `tests/support/dashboard-test-files.test.mjs`; neither move is in `longest-first`.
  Only serving-modes requires the build.
- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  applies (fast feedback, one representation); no conflict or new decision.

## Preparation observations and decisive premises

At `0bee7fd8`, unchanged at `78ee26f8` on 2026-10-18: timing starts before gh;
the three files lack bounds; identifier scanning (`page`, `newPage`, `browser`)
finds only `serving-modes` and `production-watcher-refusals` page-less at top level.
Only README/five comments cite them, neither is in `longest-first`; repeat
accepts specs after flags and burns each core. Full evidence: plan at `59fc28c8`.

## Outside-in proof ownership

| Promise / example | Owning slice and observable proof |
| --- | --- |
| Deadline observed in order (key example 1) | 1: `boundary/project-add-boundary.spec.ts` passes 3 of 3 under `--load`; a scratch product regression that answers the deadline without ending `gh` fails the test on `ghExitedBy()`, not on the pid poll. |
| Bound declared for real work (key example 2) | 1: the three files pass 3 of 3 under `--load` with their declared bounds; a scratch regression in one behavior each proves fails that test with its own assertion. |
| The guide states the rule | 1: `writing-journeys.md` "Commands, servers and shared preconditions" names the general case. |
| Placement (key example 3) | 2: both files run from `boundary/`; the scan of top-level specs finds none; `npm test -- tests/support/dashboard-test-files.test.mjs` green; README references point at the new paths and qualify the build. |
| Preserved: assertions, titles, `retries: 0`, workers, shards, sweep | Both slices: assertions, titles and counts stay; configuration is untouched; a whole run at four workers passes with nothing of the run surviving. |

## Ordered slices

### 1. Bounds follow their events
Type: Behavior
Status: done
Proof: `bash scripts/dashboard-repeat.sh 3 --load boundary/project-add-boundary.spec.ts agent-launch-preparation-codex-retry.spec.ts boundary/agent-launch-preparation-resume.spec.ts boundary/agent-launch-start-resume.spec.ts`
exits 0 (three runs, every test passed, load average reported); the
deadline case's chosen deadline and its reason are stated in the test; a
scratch regression per changed test fails it for its own reason (the
deadline test on `ghExitedBy()` or the 503 when the product no longer ends
`gh` at the deadline; one test of each git-heavy file on its assertion when
the behavior it proves is broken, with no timeout in the failure); the
`writing-journeys.md` sentence states the general rule; `npm run
typecheck:dashboard` green; a whole run at four workers passes with nothing
of the run surviving.

Behavior: pre: on a loaded machine the deadline test's precondition is
never observed and the git-heavy tests hit the default 30 s → trigger: the
deadline is long enough for the spawn to be observed first, and each
git-heavy file declares the bound its work needs, and the Codex retry
waits for its accepted attempt to settle before checking its result → result: the same
assertions pass under load, and a failure in these files names a defect.

### 2. Page-less specs live in `boundary/`
Type: Behavior
Status: planned
Proof: `git mv` of `serving-modes.spec.ts` and
`production-watcher-refusals.spec.ts` into `dashboard/tests/boundary/` with
imports resolved; the five citing comments and the README (line 52 and
"Adding a test") name the new paths, the README stating that
`boundary/serving-modes.spec.ts` is the one boundary spec that starts the
Vite servers on the run's build; `npm run --silent test:dashboard --
boundary/serving-modes.spec.ts boundary/production-watcher-refusals.spec.ts`
passes 6 tests; `npm test -- tests/support/dashboard-test-files.test.mjs`
green; the code-level scan of `dashboard/tests/*.spec.ts` finds no spec
without a page; typecheck green; a whole run at four workers passes with
nothing of the run surviving.

Behavior: pre: two specs that open no page sit among the journeys →
trigger: relocation → result: the README's placement rule holds for every
file, and discovery selects each once.

## Current decisions

- PFE: reuse `reportGeometry` and native `scrollByTouch`; change the existing
  report-reading owner. Settings permits DOM scrolling, and review-code reading
  owns different geometry/axes, so neither supplies this report contract.
- Whole proof uses four workers while the machine is shared, as plan 310 did.
  `prebuilt: builtDashboardDir` stays as it is (next story).

## Learnings

Codex acceptance returned `running:true` before a 5 s refusal assertion expired:
follow with `settledOutcome`. Reads finished after reconciliation checks (kept
plan +406 ms, refused-start +79 ms); readiness exhausted 30 s before its final
poll. Final result/publication checks need `expectSettledPage`, readiness 120 s.
Focused load exposed earlier accepted-start/sibling reads: inspect final groups
together; preserve submit-only/revision-check intermediate and held-read semantics.

Short-phone touch: all 12 gestures progressed but left scrollTop 38 and Close
clipped, without an observed product scroll defect. User approval (2026-10-18):
continue real touches toward visibility, stop without progress, retain reachability
and final visibility/hit assertions. Failed runs stay diagnostics in the handoff.

## Execution context

- Story Branch Mode; identity above, publisher `dashboard-territory.local-open-dough`, agent `mrsn-chan`.
- Originating/execution checkout (reused owned worktree):
  `/Users/terryyin/git/open-dough/.worktrees/bound-each-dashboard-test-after-its-event-and-pl`.
- Branch `codex/bound-each-dashboard-test-after-its-event-and-pl`;
  `/Users/terryyin/git/open-dough` stays the default checkout, not an edit location.
- Remote `origin` (`terryyin/open-dough`), trunk `main`; increments target the execution branch.
- Starting revision `32999702c1907aaa8e6b7092bbc9cb38f5eb01b6`;
  accepted Take / initial candidate `59fc28c8b19e03e0513775cf59dad5c367731164`.
- Locked npm/browser/check and typecheck passed: Node 24.21.0, Chromium
  153.0.8010.12, Homebrew Bash 5.3.20. No numeric budget; same correction authority.
- `npm run format`; check-only staged lint/script typecheck; no generation trigger
  or execution-time readiness renewal.
- GitHub Actions `ci.yml` verified (351271804, CI); branch observer coordinator
  `mrsn-chan-execution`, `/tmp/dough-ci-501/watch-OILrFx`, PID 11731,
  session 27570, cell 77, this checkout's `.agents/skills/dough-execute-plan` runtime.
  Prior stream `watch-lQaVLI` stopped with unread 0 and PID exit confirmed.
  The Take's trunk CI is unobserved; managed delivery registers execution increments here.

## Story obligations

### G1. Codex retry assertion starts before settlement
Reported: slice 1 — "file timeout doesn't cover its missing event"
Story clause: "no dashboard test's bound precedes the event it depends on"
Disposition: proved by slice 1: Accepted focused proof below; inspected existing settlement/read observers and preserved assertions at the named test boundaries.

### G2. Reconciliation check precedes preparation reads
Reported: slice 1 — "pending preparation/dependency reads"
Story clause: "no dashboard test's bound precedes the event it depends on"
Disposition: proved by slice 1: Accepted focused proof below; inspected existing settlement/read observers and preserved assertions at the named test boundaries.

### G3. Refused-session check precedes refreshed reads
Reported: slice 1 — "before published state is fully read/reconciled"
Story clause: "no dashboard test's bound precedes the event it depends on"
Disposition: proved by slice 1: Accepted focused proof below; inspected existing settlement/read observers and preserved assertions at the named test boundaries.

### G4. Touch helper exhausts its gesture budget
Reported: slice 1 — "all12 strokes made progress yet left scrollTop38"
Story clause: "a whole run at four workers is green with nothing of the run surviving."
Disposition: proved by slice 1: six report-touch consumers pass; reachable/no-progress and unreachable-panel scratch controls fail preserved assertions without a test timeout. See touch handoff below.

### G5. Readiness journey exhausts its test bound
Reported: slice 1 — "three later phases never begin"
Story clause: "no dashboard test's bound precedes the event it depends on"
Disposition: proved by slice 1: Accepted focused proof below; inspected existing settlement/read observers and preserved assertions at the named test boundaries.

### G6. Earlier event waits in the newly reached specs
Reported: slice 1 — "No product wrong-result evidence"
Story clause: "no dashboard test's bound precedes the event it depends on"
Disposition: proved by slice 1: Accepted focused proof below; inspected existing settlement/read observers and preserved assertions at the named test boundaries.

### G7. Corrected whole-suite proof is missing
Reported: slice 1 — "Required corrected whole suite at --workers 4 is not run"
Story clause: "a whole run at four workers is green with nothing of the run surviving."
Disposition: proved by slice 1: full-bounded.json records all 1,523 passed at four workers, terminal exit 0 and strict passed, 2,120.079 s; no output violations or run survivors.

### G8. More own-work journeys have no effective test bound
Reported: slice 1 — "finalprogresspoll got0.504s beforetesttimeout"
Story clause: "no dashboard test's bound precedes the event it depends on"
Disposition: proved by slice 1: Expanded focused proof below; 23 measured files pass 3 x 36 under load, and each scratch control fails its unchanged assertion without a test timeout.

### G9. More final launch checks precede settlement and reads
Reported: slice 1 — "final5srefusalassertionbegins atacceptance"
Story clause: "no dashboard test's bound precedes the event it depends on"
Disposition: proved by slice 1: Expanded focused proof below; accepted attempts settle before final checks, both reachKeptStart consumers run, and unchanged final assertions reject real product regressions.

### G10. Held retry checks precede native creation
Reported: slice 1 — "actual phase=preparing vs launching"
Story clause: "no dashboard test's bound precedes the event it depends on"
Disposition: proved by slice 1: Expanded focused proof below; native afterCreation follows launching phase entry, precedes unchanged held-progress assertions, and settlement follows release in both Codex counterparts.

### G11. Retained-refusal UI checks precede browser result reads
Reported: slice 1 — "Three retry assertions outran browser result processing"
Story clause: "no dashboard test's bound precedes the event it depends on"
Disposition: proved by slice 1: All 13 final launch groups follow server settlement with the existing browser request/body/message-turn observer; three loaded 29-test passes cover all ten consumers. See PROOF.md.

### G12. Initial enabled-button check precedes plan reads
Reported: slice 1 — "one enabled-button assertion outran plan reads"
Story clause: "no dashboard test's bound precedes the event it depends on"
Disposition: proved by slice 1: Initial dependency checks follow expectSettledPage before publishing the blocker; the stale-card race and final refusal assertions pass in all three loaded runs. See PROOF.md.

## Accepted focused proof and continuation

[Proof and diagnostics](PROOF.md) retain the literal commands and observations.
The 1,523-test whole run passed; replacement focused proof after event/refactor
changes passes 3 × 29 under load. Independent refactor, typecheck, assertion/title
preservation and formatting pass. Slice 2 remains; retain Taken and this workspace.
