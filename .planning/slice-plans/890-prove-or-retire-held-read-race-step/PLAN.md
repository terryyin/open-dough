# Retire the held-read race step that cannot fail

**Identity:** SEED-418#prove-or-retire-held-read-race-step

**Source:** [Retire the held-read race step that cannot fail](../../seeds/SEED-418-review-published-session-changes.md#prove-or-retire-held-read-race-step)

## Provenance

Retrospective correction of
[SEED-418#keep-session-review-proof-after-retirement](https://github.com/terryyin/open-dough/blob/6ff9df321cea812893c411e44b3ebcb3d074df66/.planning/seeds/SEED-418-review-published-session-changes.md#keep-session-review-proof-after-retirement),
executed in plan 883
(recoverable at `6ff9df321:.planning/slice-plans/883-keep-session-review-proof-after-retirement/PLAN.md`)
on branch `claude/keep-intent-s-session-review-and-its-proof-whole`:
`767b1bd76` through `3494989eb`. The retrospective outcome review's finding
F3 says G1's "the race stays proved" was not shown to distinguish. Plan 883
slice 5 intended to move the race to a frontend case and narrow the Side panel
spec to its final-report frame. It kept the step because no frontend case
could be made to fail (G1). The original promises stand.

## Current findings

Read at `3494989eb`.

1. **The step cannot fail in the product.**
   `side-panel-content-replacement.spec.ts:25-53` holds the first session's
   review read, opens the second session through Development, and then asserts
   "1 changed file" after release. Leaving Intent unmounts it
   (`boardOrIntent.tsx:47`, `showsIntent && …`). That cleanup aborts the held
   read, and the newly mounted Intent never asked for it. No stale-read break
   fails the step (premises P1–P3). It fails only when Intent is also kept
   mounted across Development (P4).
2. **The staleness checks are live and proved elsewhere.** A mounted reader
   whose query changes (Intent's lens across a story change) is guarded by
   `useReviewRead.ts:119` (late answer of an aborted read) and `:160`
   (`read.of !== of`, reading). The frontend case
   `intent-story-compare-fixed.spec.ts:159` "a late branch comparison cannot
   replace another story's explanation or files" fails with the answer guard
   alone bypassed (P6). Bypassing both checks fails it and two more Intent
   cases (P5). Within Intent, the session race is unreachable: the Review scope
   dropdown is disabled while a read is pending (plan 883 slice 5).
3. **Setup only the step uses.** `holdPublishedReviewOf`
   (`holdReviewResponse.ts:50-56`) has no other caller. The `first` session,
   `trunkAdvancedWith` and the `first.txt`/`second.txt` pair in
   `sidePanelReplacement.ts:29,35-40,73` serve only the held first session.

## Current decisions

- Delete the step instead of moving it: no boundary in the product can
  observe a late session answer. The generic race keeps its frontend proof
  in `intent-story-compare-fixed.spec.ts:159`.
- Keep both `useReviewRead.ts` checks; P5 and P6 show they are live. Nothing
  is removed from the product, so the destructive later-outcome check
  (`.claude/skills/dough-execute-plan/references/destructive-later-outcome-check.md`)
  stops at its step 1: removing a test step removes no user-visible path.
- The first case keeps one opening of the second session before the final
  report, so "Reopening reads a fresh snapshot" still compares against an
  earlier read.
- Story Branch Mode or Trunk Mode is chosen at Take.

## Ordered slices

### 1. Narrow the Side panel journey to its final-report frame
Type: Structure
Status: done

Change: In `e2e/navigation/side-panel-content-replacement.spec.ts`, remove the
held first-session read, the phase that opens the first session, and the step
"a held read never answers a later session's changes". The first case opens
the second session's changes in Intent (`expectSessionChosen("1 changed
file")`) and then continues with the final-report, divider and reopening
phases unchanged. Drop "A held Git comparison must not answer a later
session" from the header and the "first session" wording from the title.
Remove `first` and its setup from `storiesAAndB` in
`dashboard/test-support/support/sidePanelReplacement.ts`, and
`holdPublishedReviewOf` from `holdReviewResponse.ts` (keep
`holdStoryReviewOf` and its shared `holdReviewOf`). Update their header
comments.

Proof: the narrowed spec passes with strict status. `npm run
typecheck:dashboard` and `npm run lint` pass. `git grep -n
holdPublishedReviewOf` finds nothing outside `.planning`. No discrimination
proof is owed for removed coverage: P1–P4 show the step guarded nothing
reachable, and P6 is the retained proof of the guard.

Accepted proof (2026-11-27, load 7.5 → 7.1): the E2E gate command on the
narrowed spec ran 3 tests, strict status passed; `typecheck:dashboard` and
`lint` passed; `git grep -n holdPublishedReviewOf` finds only this plan. The
fixture's remaining session is named `session`, and the opening phase keeps
the empty Side panel check. The refactor pass merged the now single-caller
`holdReviewOf` into `holdStoryReviewOf` (signature unchanged); its only
consumer, `e2e/review/story-card-review-arrival-race.spec.ts`, passed 3 of 3
with strict status (load about 11.8), and typecheck and lint passed again.

## Decisive premises

Observed at `3494989eb` in this checkout, with
`OPEN_DOUGH_E2E_PROOF_RECORD=<EVIDENCE>/<name>.json caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:e2e -- e2e/navigation/side-panel-content-replacement.spec.ts`
(default reporter). Frontend runs used
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:frontend -- <files>`.
EVIDENCE is
`/Users/terryyin/git/open-dough/.git/worktrees/keep-intent-s-session-review-and-its-proof-whole/open-dough/evidence`.
Every scratch edit was restored from a backup copy. 1-minute load averages
are from `uptime` at the start and end of each run.

| Premise | Consuming operation | Scratch break and observation | Load | Result |
| --- | --- | --- | --- | --- |
| P1 Unkeying the session's selection lets the first session's late answer win | Slice 1's deletion | `useStorySessionScope.ts:56` `keyedBy: scopeKey` → `keyedBy`; E2E file (`c1-break-unkeyed-selection.log`, `.json`) | 2.8 → 2.8 | 3 passed, strict status passed: the step does not fail |
| P2 Bypassing both `useReviewRead.ts` checks lets it win | Slice 1's deletion | `:119` answer guard → `if (true)`; `:160` reading drops `read.of !== of`; E2E file (`c1-break-read-checks`) | 2.7 → 3.3 | 3 passed: the step does not fail |
| P3 A read that is never aborted lets it win | Slice 1's deletion | P2 plus the error guard → `if (true)` and the cleanup no longer calling `controller.abort()`; E2E file (`c1-break-read-no-abort`) | 3.2 → 4.1 | 3 passed: the step does not fail |
| P4 The step can observe a late answer at all | Finding 1's cause | P3 plus `boardOrIntent.tsx` keeping Intent mounted (hidden) across Development (`c1-control-intent-kept-mounted`); the same mount change with `useReviewRead.ts` intact (`c1-control-intent-kept-mounted-checks-intact`) | 3.7 → 3.6; 3.8 → 4.2 | With the read break, the step fails at `side-panel-content-replacement.spec.ts:47`: it receives "2 changed files" instead of "1 changed file". With the checks intact, it passes. The step can only fail if Intent stays mounted, which the product does not do |
| P5 The staleness checks have frontend proof | Decision to keep them | P2's break; `dashboard/frontend-tests/intent`, `review`, `sessions`, `stories` (`c1-fe-read-checks.log`) | 4.3 → 4.3 | 3 failed, 458 passed (149 of 217 files reported cases): `intent-story-compare-fixed.spec.ts:159`, `intent-done-source-selection.spec.ts:22`, `intent-ci-comparison-locations.spec.ts:65` |
| P6 The late-answer guard alone has frontend proof | Decision to keep it; retained race proof | Only `:119` answer guard → `if (true)`; `intent-story-compare-fixed.spec.ts` (`c1-fe-answer-guard.log`) | 4.2 → 4.3 | `:159` fails at line 196: the aborted read's late answer replaced the other story's explanation |

## Proof ownership and local gate

| Finding | Slice |
| --- | --- |
| 1 Step cannot fail | 1 (removal) |
| 2 Checks live and proved | none needed: P5 and P6; `intent-story-compare-fixed.spec.ts` is unchanged |
| 3 Setup only the step uses | 1 |

Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Local gate: the E2E command above for
`e2e/navigation/side-panel-content-replacement.spec.ts`, plus
`npm run typecheck:dashboard` and `npm run lint`. Run them on awake macOS on
AC power under `caffeinate -s -i`, per [AGENTS.md](../../../AGENTS.md).
`holdReviewResponse.ts` has other consumers, which the typecheck covers.
Removing an unused export changes no behavior, so their E2E specs are not
part of the gate.

## Plan review

Refinement was not needed: there is one Structure slice that owns the one
correction and its proof. No slice-specific concern remains.
