# Group Dashboard Backend Test by feature

**Identity:** SEED-251#group-dashboard-backend-tests
**Source:** [Group Dashboard Backend Test by feature](../../seeds/SEED-251-group-dashboard-backend-tests.md#group-dashboard-backend-tests)

## Goal and scope

Opening Dashboard Backend Test reveals a concise, complete set of service
feature groups so each backend test's protected behavior is easy to find.
Analyze the flat suite first; reuse the browser domain vocabulary where it still
names the protected service behavior; prefer fewer than ten groups and never
more than ten. Place every backend `*.spec.ts` and case-definition module in
exactly one feature folder; truly shared fixtures stay shared. Preserve the
independent entry, every existing case once, the shared twelve-shard run/build,
and CI wall time no worse than a comparable successful baseline. Do not change
product runtime beyond this entry's Intent folder browse, regroup the browser
suite, or create the frontend-test entry.

## Existing solution and decisions

- Reuse the SEED-249 organization pattern: feature folders under the suite root,
  recursive discovery already in `dashboard/tests/support/testFiles.mjs`, shared
  fixtures in `dashboard/tests/`, duration labels and proof identities as
  repository paths relative to `dashboard/`.
- Extend maintained documentation from
  [feature-groups.md](../../../dashboard/tests/feature-groups.md) and
  [backend-tests/README.md](../../../dashboard/backend-tests/README.md) so the
  backend inventory names each chosen group and its responsibility; do not invent
  a second runner or Intent entry.
- ADR 0001 preserves agreed domain vocabulary when reusing browser group names;
  ADR 0008 keeps published facts separate from local operations. No ADR
  exception or North Star topic is warranted: this relocates test inventory for
  browsing, not product domain boundaries.
- Exact group inventory and membership are chosen in the Behavior slice from the
  required analysis; planning does not freeze folder names.

## Premises and baseline

| Premise | Consuming observation | Result and remainder |
| --- | --- | --- |
| Nested paths under a suite root stay discovered exactly once | `dashboardSpecFiles('dashboard')` in this checkout at `74d354330102e2156d0274b2b8dcd6e3fc185852` | 743 specs: 475 nested under `tests/<feature>/…`, 268 flat under `backend-tests/`, 0 nested backend yet. Same recursive helper already selects browser feature folders; no discovery change is required for nesting under `backend-tests/`. |
| The twelve-shard deal indexes current inventory with recorded durations | `node scripts/test-shares.mjs preview --split-count 12 --spec-dir dashboard` | 743 jobs, 743 recorded, 0 unrecorded; ~886.2–886.4 predicted job-seconds per share. Move duration labels with each relocated path and re-preview after the move. |
| A comparable successful CI baseline exists after the flat backend entry | CI run `42269123525` at `328b316e931db00f7f2f8427b6bf0050ab27e5cc` (SEED-249 close) | Workflow success ~296 s wall (`2026-11-06T18:16:02Z`–`18:20:58Z`); slowest dashboard shard ~277 s (`dashboard (4/12)` / `(8/12)`). Alternate newer success: run `42318533230` at `626ecc24b28c398eaa4543e19936a415c526c0e9`. Compare final published CI on the same twelve Ubuntu shards; diagnose any increase. |
| Backend case-definition modules are finite and feature-owned or shared | Read-only listing of non-spec `.ts` under `dashboard/backend-tests/` | Seven modules: `codexEffortBoundaryCases.ts`, `openStorySessionAcceptance.ts`, `ownRecordContinuation.ts`, `revisionCheckBoundary.ts`, `revisionReuseBoundary.ts`, `revisionStreamBoundary.ts`, `settledAttempt.ts`. Move each with its owning feature, or leave only if genuinely multi-feature shared (prefer feature ownership when one feature's specs alone consume it). |
| Full discovery case inventory is stable for before/after comparison | `npx playwright test --config dashboard/playwright.config.ts --list --reporter=json` | ~2088 registered cases across 743 root suites. Capture a before JSON at execution start; after regrouping, missing/added original identities must be none (deliberate new regression cases counted separately). |

## Outside-in proof and ownership

- The single Behavior slice owns group analysis and naming, every file move,
  import/doc/duration/proof updates, Intent folder browse of the entry, complete
  once-each discovery, and final CI wall-time comparison.
- Local gates: selective formatter/lint as touched, `npm run --silent typecheck:dashboard`,
  full discovery before/after comparison, twelve-shard allocation preview after
  label migration, and focused harness/relocated representative specs under the
  maintained macOS sleep guard
  ([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)):
  fully awake on observed AC with `caffeinate -s -i`, or the lid-open
  `caffeinate -i` procedure on battery with sleep-log inspection. Full hosted CI
  owns exhaustive execution; do not run the entire local dashboard suite solely
  for relocation.
- Failure policy: [Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written.

## Ordered slices

### 1. Browse backend tests through service feature groups
Type: Behavior
Status: planned
Proof: Chosen groups (≤10, each one domain concept) are documented; every
backend spec and case-definition module lives in exactly one feature folder;
full discovery retains every original case identity once; twelve-shard preview
partitions the result with migrated duration labels; focused path-sensitive and
representative relocated checks pass; Intent browse of Dashboard Backend Test
reaches those folders; final published CI passes without increased wall time
against run `42269123525` (or the newer comparable success above). Record
observed runtime variability truthfully.

Behavior: After analyzing the flat backend suite, opening Dashboard Backend Test
reveals the chosen service feature folders; opening any folder reaches its
existing tests and CI proof at the moved paths. Shared fixtures remain shared.
The complete browser/backend suite still runs under the existing CI schedule.

## Refinement review

Refinement was not needed: one independently observable browsing outcome owns
the complete proof loop, reuses existing runner machinery, and stays within the
story's exclusions. No remaining slice-specific concern was identified.

## Current decisions

- Prefer fewer groups than the browser suite's ten when backend behavior
  collapses cleanly; reuse browser folder names only when they still name the
  protected service behavior accurately.
- Classify by the behavior assertions protect, not filename prefixes (same rule
  as [feature-groups.md](../../../dashboard/tests/feature-groups.md)).
