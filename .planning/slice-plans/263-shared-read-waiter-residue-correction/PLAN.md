# Shared GitHub reads say and signal only what their waiters own

**Identity:** SEED-113#shared-read-waiter-residue-correction
**Source:** [correction story](../../seeds/SEED-113-dashboard-github-responsiveness.md#shared-read-waiter-residue-correction),
from the execution retrospective of SEED-113#share-repeated-observer-reads
(`572faa6f:.planning/seeds/SEED-113-dashboard-github-responsiveness.md`, plan
`572faa6f:.planning/slice-plans/261-shared-observer-reads/PLAN.md`), delivered by
commits a1c593a9, a5d7ae82, 74f6904b and 572faa6f on
`claude/share-repeated-reads-across-dashboard-observers`.
**Prepared:** 2026-10-06. Planning only, in the execution's worktree.

## Goal and boundaries

A maintainer reading the local authenticated read boundary finds one account of
who owns a `gh` call: each request owns only its wait, and a shared call ends
when its last waiter leaves, at its own bound, or when closing the server ends
every waiter. No comment still says a request owns its `gh` subprocess, and no
code imitates an aborted subprocess for a request that stopped waiting.

Exclusions: avatar fetch lifetime (`OutstandingReads.read`, kept by plan 261's
decision), the late-joiner timeout wording, and the redundant server-close case
in `authenticated-read-shared-waiters.spec.ts` (it names the story's close
example literally and costs one server start).

## Current findings

1. **Stale ownership comments.** `dashboard/src/authenticatedReadRules.ts:43-45`
   says each boundary request's owned `gh` subprocesses are given up after
   `readWaitLimitMs`; `dashboard/server/ghRead.ts:62-63` says timing out is never
   inferred there, while `spawnedGh` now decides the read's own bound
   (`ReadBoundReached`); `dashboard/server/authenticatedReadPlugin.ts:3-4` says
   the plugin ends its owned `gh` subprocesses on close; and
   `dashboard/server/authenticatedRead.ts:20-21` points to `./trackedGh.ts` for
   one request's `gh` lifetime.
2. **An imitated abort.** `execGh` (`dashboard/server/ghRead.ts`) catches a
   waiter's departure from `OutstandingReads.waitFor` and returns `abandoned()`,
   a fabricated `ABORT_ERR` run. Every consumer already settles a departed
   request from its own `signal` (`trackedGh.ts`, `revisionChecks.ts`,
   `projectAddition.ts`, `performedBranchRead.ts`, `listedRecordsRead.ts`), and
   because a departed waiter gets no output, the
   `signal.aborted ? undefined : parseIncluded(stdout)` guards in
   `ghRevision.ts` and `containmentRead.ts` can no longer matter.

## Preserved promises and constraints

Every promise and key example of SEED-113#share-repeated-observer-reads and the
accepted proof of plan 261: one `gh` call per outstanding question, departures
that leave a read others wait for running, the last departure ending the
process, the read's own bound with late joiners, server close, the shared
`askedAt`, refused and rate-limited reads failing every waiter alike, and
today's wording for an abandoned or timed-out request.

## Current decisions

- `execGh` lets a departed waiter's rejection propagate; `abandoned()`, the
  try/catch around `waitFor`, and the two `signal.aborted` guards go. A
  consumer that relied on the imitated run instead settles from its signal,
  as the others do; change one only where the proof shows it needs it.
- Comments describe the waiter model once, in `outstandingReads.ts` and
  `ghRead.ts`, and the others point there.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Every `execGh` caller settles a departed request from its signal before reading the run | Slice 1 | Retrospective review read `trackedGh.ts:28`, `revisionChecks.ts:47`, `projectAddition.ts:77`, `performedBranchRead.ts:85`, `listedRecordsRead.ts:145` at `572faa6f` | True by reading; slice 1's proof observes it |
| The two guards are the only readers of a departed waiter's output | Slice 1 | `grep -n "signal.aborted ? undefined" dashboard/server` at `572faa6f`: `ghRevision.ts:158`, `containmentRead.ts:71` | True |

## Proof

Run from the repository root with `NODE_ENV` unset:
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <spec>… --workers=2`,
plus `env -u NODE_ENV npm run typecheck:dashboard`. Because `execGh` is the one
`gh` invocation every read reaches, run the whole
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard` before
delivery.

| Correction outcome | Slice |
| --- | --- |
| One account of `gh` ownership in comments; no imitated abort; behavior unchanged | 1 |

## Slices

### 1. A departed waiter's wait ends without an imitated subprocess

Type: Structure
Status: done
Proof: `authenticated-read-subprocess-lifecycle.spec.ts`,
`authenticated-read-plugin-hooks.spec.ts`,
`authenticated-read-shared-waiters.spec.ts`,
`authenticated-read-shared-failures.spec.ts`,
`authenticated-read-revision-check.spec.ts`,
`authenticated-read-containment.spec.ts`,
`authenticated-branch-read-boundary.spec.ts`,
`authenticated-read-listed-records.spec.ts`, `project-add-boundary.spec.ts`,
`project-add-validation.spec.ts`, `shared-observer-reads.spec.ts`, and
`auto-refresh-visibility.spec.ts` stay green, with typecheck and the whole
suite.

Correction: removes `abandoned()` and the catch in `execGh` so a departed
waiter's rejection reaches its caller, removes the two dead `signal.aborted`
guards, and rewords the four comments in finding 1 to the waiter model.
External behavior is unchanged.

Accepted proof: `env -u NODE_ENV npm run typecheck:dashboard` passed; the twelve
named specs passed (53 tests, `--workers=2`); the whole dashboard suite passed
1158 of 1159. Its one failure, `system-settings-terminal-theme.spec.ts`
(preview), read the saved theme after Retry before that save settled. The test
now waits for the selector to be enabled, as it already did after its other two
saves, and passed 10 of 10 repeated runs.

Learning: no consumer needed a change. Each already settles a departed request
from its own signal, or rethrows its rejection (`revisionChecks.ts`,
`performedBranchRead.ts`, `listedRecordsRead.ts`).

CI repair (run 37536012215 on `aae961f6`): `published-facts-isolation.spec.ts`
counted Doughnut's setting-file read as asked after returning to Open Dough.
`selectSettledDoughnut` returned before Doughnut's done listing and setting-file
read reached GitHub, so the page could look settled before they answered. It
failed 6 of 60 runs locally with or without `11ddc3db`. It now waits for both
reads, and the matching wait in `auto-refresh-project-isolation.spec.ts` uses
the same `readsBesideChecks` form. With 20 repeats of both specs, 140 passed;
with 60 repeats of the returning case, 120 passed.

## Execution complete

Product advice: no change. The correction adds no feature promise; it leaves
`gh` error propagation explicit before the queued
SEED-113#recover-consistently-from-rate-limits story.
