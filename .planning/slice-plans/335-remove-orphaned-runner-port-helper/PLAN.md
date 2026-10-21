# Remove the orphaned start-if-absent runner port helper

**Source:** [Correction story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#remove-orphaned-runner-port-helper), a bounded retrospective correction of SEED-052#cursor-runner-restart-resume (plan 334, recoverable at before-cleanup commit `51891b53624b86030183da07fb7318c9512e7f78`, path `.planning/slice-plans/334-cursor-runner-restart-resume/PLAN.md`; attributable commits `79a1f1ec`, `614b490e`, `1581e5e6`, `72c7fa06` on published claim `3702de21`).
**Identity:** SEED-052#remove-orphaned-runner-port-helper

## Goal and scope

The runner-port surface offers only the two intents plan 334
established — accepting-only for observation, current-build for new
work — while startup retains the separate start-if-absent operation.
There is no third port helper a future caller could pick for new work and silently bypass the build-proof gate.

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

Preserved promises: observation never starts or replaces a runner;
startup starts only when no runner is accepting; new work (`exec`, keep, Recover, not-held
attach) runs only on a current-build runner; held attach, hangup, and
handoff release use the accepting runner untouched (plan 334, slices
1–3, deterministic fake-Cursor proof at `72c7fa06`). Native
`cursor-agent` verification remains pending under
[ADR 0005 — Cross-tool validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
and is untouched by this correction; the deterministic fixtures below are
not native acceptance evidence.

## Key examples and current preparation evidence

All examples belong to slice 1; this correction adds no user behavior.

- With the unused export present, a developer can choose a third port helper
  that starts without checking build proof. After removal, code and fixtures
  have no definition, import, or call of that exact symbol, and Recover's
  header describes its actual `keepCursorClient` current-build path.
- With an accepting stale runner holding a session, startup, observation,
  and held attach leave that runner and client alone. New exec/keep or
  not-held attach replaces stale proof before starting work; subsequent work
  reuses the replacement.
- After replacement, recorded sessions remain resumable and Recover resumes
  the scoped session on the replacement. An unrelated accepting process
  answering no runner protocol remains untouched and starts no agent.

Observed on 2026-10-21 at `ced8c7f7fb6e3d3cb3f15c15129d86d5f77b79fc`
in `/Users/terryyin/git/open-dough/.worktrees/correction-remove-the-orphaned-start-if-absent-r`:

- `rg -n '\bcursorRunnerPort\b' --hidden -g '!.git' -g '!node_modules' -g '!.planning/**'`
  found only the definition and Recover comment. The production consumers in
  `runnerClient.ts` and `terminalBridge.ts` already select the two surviving
  paths; Recover reaches new work through `keepCursorClient`.
- To test the consumer premise beyond that search, temporarily removed the
  helper's comment and export through the next `// Ends the runner` comment
  in `runnerProcess.ts`. The three-spec command below passed (exit 0), and
  `npm run typecheck:dashboard` passed (exit 0) with the removal. All scratch
  source edits were restored byte-for-byte before preparation writes.
- The first test attempt could not create its bundle directory because this
  worktree lacked `node_modules`; `npm ci --ignore-scripts` supplied the locked
  dependencies. The next attempt had no failed tests but the strict reporter
  rejected conflicting `NO_COLOR`/`FORCE_COLOR` warnings. Removing `NO_COLOR`
  from the test command's environment produced the passing run below.
- Inspected `cursorRunnerProof.ts`: isolated homes, real runner processes and
  fake Cursor executables exercise production exec/keep and terminal bridges.
  Build-proof assertions observe replacement PID/build ID, preserved held
  clients, and no agent for a non-protocol listener. Restart-shape assertions
  cover dead PID, reused port, and repeated startup before new work; the
  browser replacement spec observes records and scoped Recover through the UI.
  These reuse plan 334's preserved-behavior proof, not a new native claim.

## Existing solution and architectural direction

PFE: reuse `acceptingCursorRunnerPort` and `currentCursorRunnerPort` as they
stand; delete the unconsumed alternative without adding an abstraction.
Their meanings match the maintained
[Cursor terminal behavior](../../../dashboard/AGENT-LAUNCH-TERMINALS.md).
The [North Star's requested-assignment direction](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
keeps host behavior in its existing integration; no new architectural choice
or temporary direction is needed. This follows
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md):
preserve the domain model while removing unnecessary parts. No Accepted-ADR
conflict was identified.

## Outside-in proof ownership

| Promise | Observable proof |
| --- | --- |
| No start-if-absent port helper remains to bypass build proof | Slice 1: `rg -n '\bcursorRunnerPort\b' dashboard src scripts tests` returns no matches (exit 1); inspect `recover.ts` to confirm its header names `keepCursorClient` and the current-build path |
| Plan 334 behavior is unchanged | Slice 1: the three focused specs below retain the observed assertions above; dashboard typecheck passes. Existing hangup/handoff call paths and surviving helpers remain unchanged |

## Ordered slices

### 1. Remove the orphaned helper and stale comment

Type: Structure
Status: done
Proof: The exact-symbol search above returns no matches; then
`env -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts dashboard/tests/boundary/cursor-runner-build-proof.spec.ts dashboard/tests/boundary/cursor-runner-restart-shapes.spec.ts dashboard/tests/cursor-runner-replacement.spec.ts`
and `npm run typecheck:dashboard` pass.

Internal change: directly owns this retrospective correction by removing
the unused build-proof bypass and its stale comment. External behavior stays
unchanged; no later Behavior slice is required.

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

## Sizing, delivery, and concern review

One Structure slice owns one bounded correction and its preserved-behavior
proof loop. Splitting deletion and comment correction would leave one concept
inconsistent. No new representation or rule is introduced. No project numeric
slice limit was supplied; deletion, focused verification, and local cleanup
fit this single slice without speculative work.

Execution uses the installed Execute Plan workflow's independent post-change
refactoring, agent commit, delivery, and asynchronous CI ownership. The local
checks above are selected for the affected Cursor boundaries and TypeScript
consumers; hosted CI configuration alone adds no broader local gate. This
preparation does not execute or mark the slice done.

Slice-plan refinement was not needed: the existing single Structure slice has
one correction outcome, mapped proof, and an observed removal experiment.
No remaining slice-specific concern was identified. No human decision or
blocking supplier dependency remains for preparation.
