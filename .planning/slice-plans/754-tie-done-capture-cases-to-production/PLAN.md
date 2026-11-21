# Tie Done capture cases to the real branch entry and retire the fold's residue

**Identity:** SEED-413#tie-done-capture-cases-to-production
**Source:** [Tie Done capture cases to the real branch entry and retire the fold's residue](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#tie-done-capture-cases-to-production)

## Correction input

**Provenance.** Retrospective of
[SEED-413#fold-done-capture-launches-into-makeme](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme)
(plan 737), reviewed over `01b7cc602..2bed7f34c` (commits `249908e2`,
`20e7cb7a`, `72f85adc`, `9f89a8eb`, `b3cd1acf`, `c0544ae4`, `fa777c74`,
`503b1c54`, `2bed7f34`). Its source promised one case value with the checkout,
records and timeline, "every assertion preserved", "Keep any remaining effect
in its existing owner and add no support wrappers", and fewer redundant verbs.
No production regression was found; the six reviewed specs passed 12/12 at one
worker.

**Current findings** (read-only review at `2bed7f34c`):

1. *The publisher case asserts the entry its builder supplied.*
   `dashboard/backend-tests/launches/declared-worktree-publication.spec.ts:97-103`
   asserts `record.branchEntry`, which now comes from
   `makeMe.aLaunchRecord.ofDeclaringDefaultMainLaunch`
   (`Distribution/tests/support/launchReviewedSessionTestData.mjs:143-154`,
   hard-coding `committedTip`, `defaultTip` and `trunk` at the base), not from
   `proposeBranchEntry`; `branchLandingContext` leaves the entry unchanged and
   the composed store was seeded with the same record. Nothing ties the
   recipe's copy of the proposal rule to production, so the publication,
   landing-handoff and branch-entry cases built with `withDeclaringLaunch`
   stay green if the proposal's shape changes.
2. *Setup duplicated after preset removal.* The accepted reporting attempt
   (`anAcceptedAttempt.withId(…).adHoc().reportingTo(…).capturingLanding(…).launched(…)`)
   in `ad-hoc-session-commits-done.spec.ts:28-36`,
   `ad-hoc-session-quiet-done-receipts.spec.ts:56-64` and a variant in
   `ad-hoc-branch-result-race.spec.ts:40-52`; the `withDeclaredLanding` fact
   list in `ad-hoc-prepared-landing-done.spec.ts:38-47` and
   `server/landingRecordPersistence.spec.ts:64-71`. The landing-context write
   in both declared publication specs and the `NativeDoneMarks` construction
   in the two quiet-completion specs repeat too.
3. *A new single-caller support harness.*
   `dashboard/backend-tests/support/capturedCommandFetch.ts` (48 lines) was
   moved out of `review/ad-hoc-session-branch-handoff.spec.ts`, its only caller,
   against the
   [North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
4. *A guessed production file name.* `review/ad-hoc-session-comparisons.spec.ts:43,60-67`
   predicts `landing-context.json` and asserts `writeLandingContext` returned
   it, because the record is fixed in `please()` before the context is written.
5. *Two ways to keep records.* `please()` then `keep(<all records>)` where
   `.kept()` does the same: `done-kept-session-shared-checkout.spec.ts:30-34`,
   `done-kept-session-commits.spec.ts:35-39` and `:102-105`,
   `kept-commits-release.spec.ts:157-161`. Conversely `.kept()` writes records
   into a machine store nobody reads in `server/landingRecordPersistence.spec.ts`
   (`:32`, `:73`) and both `launches/declared-*-publication.spec.ts`, where the
   old code kept only a private home; there the machine store and the composed
   store silently diverge.
6. *Stale README.* `dashboard/backend-tests/README.md:61-63` says declared
   branches are entered at the entry `proposeBranchEntry` proposes.
7. *Case value gaps.* `ad-hoc-session-quiet-done-receipts.spec.ts` states Done
   through a refinement absent from the timeline (`:127-130`) and writes the
   same "30" twice unlinked (`:70`, `:84`). `worktrees[x] ?? ""` gives a record
   an empty workspace silently (`doneCaptureCaseBuilder.ts:129,150`, finding 2's
   two specs). `doneCaptureCase.ts:25-27` imports mid-file and re-exports
   `Checkout` from `doneCaptureCaseMaterialization.ts`, which imports back from
   it; the `CaseFacts` re-export (`doneCaptureCaseBuilder.ts:17-20`) has no
   consumer outside support.

Full review: the retrospective's `retro-outcome-review.md` for this execution
(F1–F8); this list carries the excerpts the slices need.

**Preserved.** Production behavior; every assertion except the two restating
ones (finding 1) and the guessed name (finding 4); launch, Done and work times;
real Git, pins, races, the installed publisher, `branchLandingContext`,
`NativeDoneMarks` and the rename collaborator as visible operations in the
bodies; plan 737's one case value and its explicit `.kept()`.

**Excluded.** Runtime cost (owned by
[the optimization](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#optimize-done-capture-family-cases));
`server/landingRecordPersistence.spec.ts` and `review/ad-hoc-review-request.spec.ts`,
at 250 lines before the fold, take no new lines; the builder's generic casts
(`doneCaptureCaseBuilder.ts:48,75,183,193`, materialization) type builder
state and hide no case fact once the worktree lookup throws.

## Key examples and proof

| Example | Observer | Slice |
| --- | --- | --- |
| The declaring recipe's entry drifts from the real proposal | Agreement case in `branch-entry-proposal.spec.ts` fails on a scratch edit of the recipe | 1 |
| The comparisons case keeps the record production's context write names | Record built after `please()` from the returned path; no file-name assertion; delivery and branch-result assertions pass | 2 |
| A case keeps records only when it reads the machine store | One verb per site; composed-store specs isolate HOME without writing records; assertions unchanged | 2 |
| A case names an undeclared worktree | `please()` throws naming it; no `?? ""` remains | 3 |
| Shared data shapes have one MakeMe home and the command capture lives with its caller | Reporting attempt recipe and declared-landing step replace the copies; `capturedCommandFetch.ts` is deleted; specs keep their assertions; frontend group passes | 4 |

## Current decisions

- The agreement case compares the real proposal on a fresh declared worktree
  with the `withDeclaringLaunch` record's entry by `toEqual`; other cases keep
  composing the entry. The publisher case keeps its context reference assertion
  and drops the two entry assertions.
- Data shapes go to MakeMe: an accepted reporting-attempt recipe on a derived
  attempt recipe layer beside `AcceptedAttemptBuilder` (whose
  `launchAttemptTestData.mjs` is at 250 lines), following
  `LaunchReviewedSessionBuilder`, and a declared-landing launch step on the
  case builder beside `withDeclaringLaunch`. Recipes take filesystem facts as
  inputs: builders that `makeMe` reaches load in browser-mode frontend specs.
- `branchLandingContext`, `NativeDoneMarks` and the completion submission stay
  in the bodies as plan 737 decided; their repetition is the visible operation,
  not setup to extract.
- `captureBranchEntryCommand` returns to the handoff spec. If the spec would
  pass 250 lines, split it by responsibility (the command-carried handoff apart
  from the typed refusals) rather than keep the module.
- Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written. Keep default timeouts; never `test.slow()`.

## Decisive premises observed

Base `2bed7f34c`, 2026-11-21, this worktree, AC power, load 7–9, Node 24.21.0.

| Consuming operation | Observation and result | Limit and consequence |
| --- | --- | --- |
| Agreement case (slice 1) | A scratch spec built `aDoneCaptureCase().withOrigin().withWorkspace("draft").withDeclaringLaunch("declared", …).withDefaultMainLaunch("open", …)` and asserted `proposeBranchEntry("refs/heads/main", open, { workspace, branch })` `toEqual` the declared record's `branchEntry`: passed in 844 ms at one worker. With `revision: base` removed from the recipe's trunk, it failed on `trunk.revision`. Scratch removed. | The recipe agrees with production today and the case catches drift; slice 1 needs no recipe change. |

## Slices

### 1. The declaring recipe answers to the real proposal

Type: Structure
Status: planned

Add the agreement case to `review/branch-entry-proposal.spec.ts` (findings 1
and 6). Remove the `entry` assertions at
`launches/declared-worktree-publication.spec.ts:97-103` and correct
`dashboard/backend-tests/README.md:61-63`: cases compose the entry through
`withDeclaringLaunch`, and the proposal's own cases call `proposeBranchEntry`.

**Proof.** `branch-entry-proposal` and `declared-worktree-publication` pass;
a scratch edit dropping the recipe's trunk revision fails the agreement case;
`npm run typecheck:dashboard`.

### 2. Each case keeps its records one way, built from what production wrote

Type: Structure
Status: planned

Build the comparisons case's record after `please()` from the path
`writeLandingContext` returns and keep it explicitly; drop the guessed-name
assertion (finding 4). Replace `please(); keep(<all records>)` with `.kept()`
at the four sites, and in the composed-store specs replace `.kept()` with a
body `keep()` for HOME isolation alone (finding 5).

**Proof.** `ad-hoc-session-comparisons`, `done-kept-session-shared-checkout`,
`done-kept-session-commits`, `kept-commits-release`, `landingRecordPersistence`,
`declared-blank-launch-publication` and `declared-worktree-publication` pass;
expect counts unchanged except comparisons 6 → 5 (its pre-fold count);
`landingRecordPersistence.spec.ts` stays at or under 250 lines.

### 3. The case states each worktree and Done once

Type: Structure
Status: planned

Resolve named worktrees once in materialization: `please()` and refinements
see only declared worktrees and throw for any other, removing the `?? ""`
fallbacks. Add the declared-landing launch step and move
`ad-hoc-prepared-landing-done` and `landingRecordPersistence` onto it. State
each quiet-receipt case's Done once and visible in its timeline, giving a
refinement that needs the time the stated value. Untangle the
`doneCaptureCase.ts`/materialization import cycle and drop the `CaseFacts`
re-export (findings 2 and 7).

**Proof.** The specs importing `doneCaptureCaseBuilder.ts` (consumer trace)
pass at one worker; a scratch case naming an undeclared worktree throws;
`grep '?? ""'` finds none in the family; typecheck and `npm run lint`.

### 4. Shared data shapes live in MakeMe and the command capture with its caller

Type: Structure
Status: planned

Add the accepted reporting-attempt recipe and use it in
`ad-hoc-session-commits-done`, `ad-hoc-session-quiet-done-receipts` and, where
it composes with the isolated request, `ad-hoc-branch-result-race` (finding 2).
Move `captureBranchEntryCommand` back into `ad-hoc-session-branch-handoff`
and delete `capturedCommandFetch.ts` (finding 3).

**Proof.** Those four specs pass with their assertions; the frontend group
(`npm run --silent test:dashboard:frontend`) passes because `makeMe` reaches the
new layer; the consumer trace over `launchMakeMe.mjs`'s `anAcceptedAttempt`
runs its reached backend and Distribution consumers; typecheck and lint.
Record the support line and binding change against `2bed7f34c`.

## Local gates and review

- On AC power, prefix test commands with `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`,
  as [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes. Backend: `npm run --silent test:dashboard:backend -- --workers=1 <spec paths>`.
  Then `npm run typecheck:dashboard` and `npm run lint`; never run suites
  concurrently.
- Re-run the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  over changed builders and retired symbols in each slice.
- Refinement not needed: four slices with one proof loop each, ordered so
  slice 3 edits the builder after slice 2's keeping changes and slice 4 alone
  changes a `makeMe`-reached builder. No slice-specific concern remains.
