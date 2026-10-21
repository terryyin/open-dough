# Remove the orphaned start-if-absent runner port helper

**Source:** [Correction story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#remove-orphaned-runner-port-helper), a bounded retrospective correction of SEED-052#cursor-runner-restart-resume (plan 334, recoverable at before-cleanup commit `51891b53624b86030183da07fb7318c9512e7f78`, path `.planning/slice-plans/334-cursor-runner-restart-resume/PLAN.md`; attributable commits `79a1f1ec`, `614b490e`, `1581e5e6`, `72c7fa06` on published claim `3702de21`).
**Identity:** SEED-052#remove-orphaned-runner-port-helper

## Goal and scope

The runner-port surface offers only the two intents plan 334
established — start-if-absent/accepting for observation and startup,
current-build for new work — with no third helper a future caller
could pick for new work and silently bypass the build-proof gate.

Excluded: any behavior change; touching `ensureCursorRunner`,
`acceptingCursorRunnerPort`, `currentCursorRunnerPort`, the wire
protocol, or build identity; any new helper or replacement API.

## Current findings (evidence)

- Plan 334 slice 1 (`79a1f1ec`) moved every caller of
  `cursorRunnerPort` (`dashboard/server/hosts/cursor/runnerProcess.ts`):
  `execOnRunner`/`keepCursorClient` now use `currentCursorRunnerPort`,
  reads/hangup/handoff use `acceptingCursorRunnerPort`, and the
  terminal bridge splits between them. At reviewed revision
  `72c7fa06` a repository search finds `cursorRunnerPort` only at its
  definition and in the stale header comment of
  `dashboard/server/hosts/cursor/recover.ts` (line 3), which still
  says Recover "uses cursorRunnerPort, which may" start a runner;
  Recover actually reaches the runner through `keepCursorClient` and
  the current-runner path.
- The helper is not dead weight alone: it starts a runner when none
  is accepting and returns its port with no build comparison, so a
  future new-work caller choosing the shortest name recreates plan
  334's original silent stale-reuse defect behind a green call site.

Preserved promises: observation and startup never start-or-replace
beyond start-if-absent; new work (`exec`, keep, Recover, not-held
attach) runs only on a current-build runner; held attach, hangup, and
handoff release use the accepting runner untouched (plan 334, slices
1–3, deterministic fake-Cursor proof at `72c7fa06`). Native
`cursor-agent` verification remains pending under ADR 0005 and is
untouched by this correction.

## Outside-in proof ownership

| Promise | Observable proof |
| --- | --- |
| No start-if-absent port helper remains to bypass build proof | Repository search for `cursorRunnerPort` (excluding `acceptingCursorRunnerPort`/`currentCursorRunnerPort`) returns no definition or caller; `recover.ts` names the current-runner path it actually uses |
| Plan 334 behavior is unchanged | Focused boundary/replacement specs that proved slices 1–3 stay green; dashboard typecheck passes |

## Ordered slices

### 1. Remove the orphaned helper and stale comment

Type: Structure
Status: planned
Proof: Search above returns nothing outside the two surviving intent
helpers; then
`npx playwright test --config dashboard/playwright.config.ts dashboard/tests/boundary/cursor-runner-build-proof.spec.ts dashboard/tests/boundary/cursor-runner-restart-shapes.spec.ts dashboard/tests/cursor-runner-replacement.spec.ts`
and `npm run typecheck:dashboard` pass.

Behavior: none — this slice removes unreachable code and corrects a
comment only.

- Delete `cursorRunnerPort` from `runnerProcess.ts`; keep
  `ensureCursorRunner` and `acceptingCursorRunnerPort` byte-stable in
  behavior.
- Rewrite the `recover.ts` header sentence to name the current-runner
  new-work path (through `keepCursorClient`) instead of the removed
  helper.
- Change no test; the existing specs are the preserved-behavior proof.

Safe stopping point: the port surface names exactly the two intents,
and plan 334's proof still passes unchanged.

## Current decisions

- Removal, not deprecation: the helper has no caller in this
  repository, is not a published API, and its only plausible future
  use is the bypass this correction exists to prevent.
- This correction is planned and queued first at its predecessor's
  wrap-up; a separate request executes it. It grants no execution
  authority.
