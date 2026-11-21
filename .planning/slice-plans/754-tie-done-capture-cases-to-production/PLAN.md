# Tie Done capture cases to the real branch entry and retire the fold's residue

**Identity:** SEED-413#tie-done-capture-cases-to-production
**Source:** [Tie Done capture cases to the real branch entry and retire the fold's residue](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#tie-done-capture-cases-to-production)
**Source review:** [source-review.md](source-review.md)

## Correction input

**Provenance.** The execution retrospective for
SEED-413#fold-done-capture-launches-into-makeme reviewed
`01b7cc602..2bed7f34c` in `retro-outcome-review.md` (F1–F8). Recover the
source and plan 737 at `47af39ca6`. The review found test-proof and setup
defects with no production regression. The fold promised one case value with
checkout, records and timeline, preservation of the assertions, and fewer
setup verbs without new support wrappers.

**Current findings at `640349c9f`.**

- In `launches/declared-worktree-publication.spec.ts`, both entry assertions
  read the value composed through `withDeclaringLaunch`. The second reads it
  back immediately after the test itself keeps it. The publisher exercises
  landing and retry. Neither assertion exercises `proposeBranchEntry`. The
  backend-test README still says the fixture's entry is proposed by production.
- Integration `7b89046e3` includes `1cf323753`, which put the declared
  publisher specs and `server/landingRecordPersistence.spec.ts` back on the
  machine store and introduced `makeMe.anAcceptedAttempt.reportingFor(record)`
  and `.landingIn(authority)`. Their record writes are now observable by
  their tests. The three completion specs still build accepted reporting
  attempts by hand.
- `review/ad-hoc-session-comparisons.spec.ts` predicts the context file name
  to finish the record before calling `writeLandingContext`. Four other
  case-build sites explicitly keep every record immediately after `please()`
  although the builder already offers `.kept()`.
- Declaring, isolated, and declared-landing setup can silently substitute
  an empty path. The two declared-landing cases repeat repository, base, and
  worktree facts while varying specific landing data. The case's checkout type
  is re-exported through the effects module that materialization imports, and
  the builder's `CaseFacts` re-export has no consumer.
- In the quiet-receipt cases, one scenario repeats the Done time and the
  other sets the pending Done inside a refinement while the case timeline
  omits it. `support/capturedCommandFetch.ts` has one consumer, the
  command-carried handoff in `review/ad-hoc-session-branch-handoff.spec.ts`.

**Outcome.** Give dashboard maintainers proof that detects drift between
composed and production branch entry. Keep each setup fact in one place so
changes to context paths, worktree lookup, and Done timing reach the existing
observers from their real sources.

**Preserved.** Production behavior and independent assertions, including
real Git, work and launch times, machine-store races, pin ownership, installed
publisher delivery and exact retry, and native Done rename behavior. The
independent entry should be compared at the proposal boundary. The publisher
should still verify the landing context reference and the original session's
retained landing after retirement.

**Excluded.** Runtime work belongs to the
[optimization story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#optimize-done-capture-family-cases).
Keep the builder's generic casts. Keep `server/landingRecordPersistence.spec.ts`
at or below its current 225 lines and leave `review/ad-hoc-review-request.spec.ts`
out of the edits.

## Key examples and proof

| Given and trigger | Observer and expected result | Slice |
| --- | --- | --- |
| An open launch proposes a freshly registered worktree that a declaring fixture already represents. | The proposal spec compares the complete entries. Removing the recipe's trunk revision fails that assertion. The installed publisher still lands and exactly retries for the original launch. | 1 |
| A comparison launch receives the file returned by `writeLandingContext`, then goes Done and lands. | After retirement, the publisher receipt and file reads still distinguish the delivered rename from the captured working-tree result. | 2 |
| All named case records must be in the machine store before the first observed action. | The shared checkout, saved commits, and record-retention journeys read the same records and pins with `.kept()` at the equivalent boundary. | 3 |
| A case names a worktree it never declared, or declares a landing at a valid worktree. | The scratch invalid case fails during `please()` with the branch name. The two landing consumers still observe their own receipt, storage, and pin outcomes. | 4 |
| A quiet completion is recorded at the stated Done time and later retried. | The pending native mark resumes once, and the earlier capture failure stays at the case's Done time. | 5 |
| An accepted attempt corresponds to a reporting launch, including the race with an isolated request. | Quiet completion, reopen and the race still reach the corresponding launch, rename or preserve commits as appropriate, and keep the correct pins. | 6 |
| Default main input supplies a command that reports its branch entry. | The handoff case executes the emitted command, admits its observed request, and reads the saved entry. The existing refusal cases still execute. | 7 |

## Current decisions

- Reuse production `proposeBranchEntry` for the agreement case and the
  existing `writeLandingContext` result for the retained comparison. Neither
  requires a new product path. Keep `branchLandingContext` calls in the
  publisher journeys so their context writes remain visible.
- Reuse `makeMe.anAcceptedAttempt.reportingFor(record)` and the existing
  `withDeclaredLanding` record operation. Use the case's Git facts at its
  builder boundary, keeping each scenario's optional landing facts explicit.
  Keep `NativeDoneMarks`, completion submission, and the rename collaborator
  visible in their existing test owners.
- Use the same MakeMe case value for declared worktrees, dates and records.
  When the test observes a store transition, such as pins before keeping or a
  context write that changes the record, keep the explicit `keep` at that
  boundary. The installed publishers and persistence tests read the machine
  store that their explicit writes populate.
- Follow [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  against the current baseline. Preserve proof while reducing repeated setup
  and support bindings. The [North Star's directly testable production topic](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  supports returning command observation to its caller and adding only data
  composition to the case builder.

## Decisive premises observed

In this preparation checkout at `640349c9f`, 2026-11-21, macOS on AC, Node
24.21.0, load about 16–18, one worker with default timeouts. The commands
below use the local gate prefix, with `CI=1`. All scratch edits were reverted.

| Consuming operation | Observed form and result | Limit |
| --- | --- | --- |
| Agreement and installed publisher | `npm run --silent test:dashboard:backend -- --workers=1 branch-entry-proposal.spec.ts declared-worktree-publication.spec.ts` with a scratch agreement case on the fresh registered worktree passed 5/5. Running the proposal file alone after removing the recipe's `trunk.revision` failed only the new full-entry equality, with three other cases passing. Restoring the recipe passed 4/4. | The agreement covers a declaration at the fixture base. The existing proposal cases separately cover later tips, dirty trees and refusals. |
| Installed comparison and accepted reporting attempts | `npm run --silent test:dashboard:backend -- --workers=1 ad-hoc-session-comparisons.spec.ts ad-hoc-session-commits-done.spec.ts ad-hoc-session-quiet-done-receipts.spec.ts ad-hoc-branch-result-race.spec.ts` with scratch caller edits passed 7/7. The comparison built its record after the context write and published using its returned path. The completion calls used `reportingFor(record)` with the race's isolated request reapplied. | These ran the installed publisher, file reads and completion consumers. The timeline arrangement and builder cleanup remain slice proof. |

## Slices

### 1. The declaring recipe agrees with the production proposal

Type: Structure
Status: done

Add the observed fresh-worktree comparison to
`review/branch-entry-proposal.spec.ts`. A composed declared record and a
separate open record refer to the same worktree. Compare the full declared
entry with the proposal from the open record. Remove the publisher's two
assertions that restate the composed entry, preserving the context reference
and all landing and retry assertions. Correct the backend-test README's
description of the fixture and its agreement check.

**Proof.** Run `branch-entry-proposal.spec.ts` and both declared publisher
specs. Show that removing `trunk.revision` from the declaring recipe fails
the maintained equality and that restoration passes. Check the README against
the two call paths.

**Accepted.** Agreement case `the declaring recipe's entry is the proposal for its fresh worktree` added; the publisher's two restating assertions removed (1 added, 2 removed). Proposal plus both declared publisher specs passed 6/6; dropping the recipe's trunk revision failed only the agreement case. Refactor pass: already clean.

### 2. The comparison launch uses the file production wrote

Type: Structure
Status: done

Build the checkout, then write the context using its landing authority. Use the
returned path for the reporting launch record and installed publisher. Build
the record with MakeMe's existing isolated launch example, using the case's
clock and stated session. Keep it when its reporting facts are complete. Drop
the filename assertion and compose the corresponding accepted attempt from
that record and authority.

**Proof.** Run `ad-hoc-session-comparisons.spec.ts`. Preserve the preparation
and accepted receipt assertions and both file-content observations after
retirement. Trace the single returned path into the record and publisher.

**Accepted.** `writeLandingContext`'s returned path now feeds the isolated launch record's reporting, `reportingFor(record).landingIn(authority)` and `publishInstalled`; the filename assertion is removed (1 removed, 0 added). The comparison spec passed 1/1. Refactor pass: already clean.

### 3. The case keeps its complete record set at setup

Type: Structure
Status: done

Use `.kept()` in the four equivalent sites in
`done-kept-session-shared-checkout.spec.ts`, `done-kept-session-commits.spec.ts`
(two), and `kept-commits-release.spec.ts` (repository missing after keep).
Retain the separately timed keep where the test reads the baseline pins before
keeping. The declared publisher and persistence writes remain at their
existing machine-store boundary.

**Proof.** Run the three specs. Check the shared-checkout flag and runs, kept
commit pins and review after branch movement, and removal in the missing
repository case. In the pin-release case keep the before/after pin assertions.

**Accepted.** The four sites use `.kept()`, which keeps in materialization before `please()` returns; the pin-release case keeps its explicit keep after reading baseline pins. The three specs passed 12/12 with no assertion change. Refactor pass: already clean.

### 4. Named worktrees resolve once for the launch case

Type: Structure
Status: done

At case materialization, resolve requested worktrees against the declared
set and the Git paths. Give launch setup one checked lookup and reject an
undeclared or unmaterialized branch with its name. Use the same lookup for
declaring, isolated and declared-landing recipes. Share repository, base and
worktree setup for the two declared-landing cases through the case builder,
retaining each case's existing context, tree and optional trunk revision.
Remove the circular checkout type dependency by letting the materialization
side own its checkout type and giving the effects only the shape their
operations need. Retire the unused `CaseFacts` re-export.

**Proof.** A scratch case that supplies an undeclared worktree fails at
`please()` with the branch name. Run the traced case-builder consumers at one
worker, explicitly including `ad-hoc-prepared-landing-done.spec.ts` and
`landingRecordPersistence.spec.ts`. Preserve both retained and attempt-backed
persistence observations, default worktree behavior and the file-size bound.
Check that the affected setup no longer has an empty workspace fallback.

**Accepted.** `placesOf` resolves only declared worktrees and gives one checked `worktree(branch)` lookup, used by the declaring, isolated and declared-landing recipes and dated work; a scratch undeclared case was rejected at `please()` with its name. `withDeclaredLandingLaunch` states repository, base, worktree and origin once; `doneCaptureCase.ts` exports only `WorkCheckout`; the `CaseFacts` re-export is gone; the persistence spec fell from 225 to 214 lines. On the final code, the 36 reached consumer specs passed 128/128 at one worker, load 8–11. An earlier run at load about 37 timed out 11 cases at 5 s, and they passed again at lower load. Those load timeouts belong to the [optimization story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#optimize-done-capture-family-cases), whose goal names them.

**Learning for slice 7.** The support files grew from 524 to 561 lines, mostly the new builder step and the checked lookup. Slice 7's deletion of the 48-line capture module must bring support back to at or below 524 lines before commitment 19 is observed.

### 5. The quiet receipt and Done timeline share the case time

Type: Structure
Status: done

State Done in the timeline for both `ad-hoc-session-quiet-done-receipts` cases.
Give the completion and pending-mark refinement the same computed time.
Preserve the pending native-mark problem and the earlier failure time in the
retry arrangement.

**Proof.** Run both quiet-receipt cases and the case-builder consumers reached
by the timing change. The new quiet report still captures the additional
commit without a rename. The retry still returns the same receipt, renames
once, preserves the earlier failed capture, and clears the pending problem.
Inspect that both timeline entries agree with their starting records.

**Accepted.** Both cases declare `times` once. The completion, the case timeline, the pending-mark refinement and the failed capture all read `minutesAgo(times.done)`. The builder's own Done mark keeps the refinement's pending problem. The quiet-receipt spec passed 2/2 with no assertion changed. Refactor pass: already clean. CI run 44907064093 on slice 4 then failed an unrelated e2e race. It was repaired in 2827eb3e6; see [the diagnosis](diagnosis-codex-done-page-timeout.md).

### 6. The accepted attempt follows its reporting launch

Type: Structure
Status: done

Adopt the existing reporting-attempt recipe in
`ad-hoc-session-commits-done.spec.ts`, `ad-hoc-session-quiet-done-receipts.spec.ts`
and `ad-hoc-branch-result-race.spec.ts`. Keep the race's isolated request and
the quiet-receipt case's completion and receipt refinements explicit. Shared
MakeMe entry points already expose this recipe.

**Proof.** Run those three specs. Preserve the held-rename and reopen
observations, receipt identity and native mark retry, and which revision the
racing marks pin. Verify the diff keeps the shared factory unchanged.

**Accepted.** All three specs use `reportingFor(record)`. The race reapplies its isolated request and the quiet case keeps `withCompletion`. No case keeps a landing repository, so `landingIn` is unused. The shared factory is unchanged. The three specs passed 6/6 with no assertion change and fell from 511 to 496 lines. Refactor pass: already clean.

### 7. The command handoff spec owns its request observation

Type: Structure
Status: done

Return `captureBranchEntryCommand` to its only caller and delete
`support/capturedCommandFetch.ts`. The spec is currently 209 lines and the
module is 48. If the imported capture would take the spec over 250 lines,
move the wire-admission refusal cases and their refusal helper into a focused
request-admission spec. Keep the real command, admitted request and saved
entry together. Keep session-addressed handoff and state-dependent refusals
with the handoff.

**Proof.** Run the handoff and any extracted admission spec. Keep assertions
on the emitted request, admission, saved entry, all refusal reasons and the
original checkout. Verify the wrapper module and its imports are gone.

**Accepted.** `captureBranchEntryCommand` now sits in the handoff spec (246 lines, so no split was needed) and `support/capturedCommandFetch.ts` is deleted with no importers left. The handoff spec passed 9/9 with 12 assertions before and after. Refactor pass: already clean. Story totals since 439c23da5: the Done capture support went from 572 lines in six modules to 561 in five; three assertions were removed (two publisher restatements and the guessed filename) and one agreement assertion added; no production path changed.

## Execution complete

Product advice: no change. The correction keeps product behavior as it was and makes the Done capture setup state each fact once. The queued SEED-413#optimize-done-capture-family-cases can now profile the delivered builders; load timeouts at about 37 recurred during slice 4 proof, which supports its goal.

## Local gates and review

- On AC power, use
  `caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`
  per [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Backend checks use `npm run --silent test:dashboard:backend -- --workers=1 <spec paths>`.
  Keep default test timeouts and never use `test.slow()`. Run suites sequentially.
- Select and apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) before
  editing test sources. Run `npm run typecheck:dashboard` and `npm run lint`
  for the changed test and builder code. Apply the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written.
- Re-run the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  over changed builders and removed symbols. Run reached readers. A whole
  frontend run from the old plan was for changing the shared attempt-builder
  layer. The observed reuse changes backend callers on an existing builder.
- Compare assertions and support lines and bindings against `640349c9f`.
  Explain the two publisher assertions removed and the one filename assertion
  removed, and account for preserved observers and the new agreement assertion.
- Slice-plan refinement was unnecessary after separating the independent proof
  loops during construction. The seven bounded internal corrections preserve
  the same product behavior, and this review found no remaining slice concern.
