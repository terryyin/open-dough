# Arrange Done ad hoc sessions directly for delivery observation and publication

**Identity:** SEED-413#arrange-done-ad-hoc-observation-and-publication
**Source:** [Arrange Done ad hoc sessions directly for delivery observation and publication](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#arrange-done-ad-hoc-observation-and-publication)

## Goal and scope

Replace nine launch/list/HTTP Done arrangements in ten delivery observation
and publication cases with kept MakeMe records and a single
`setRecordDoneAt` per session. Preserve each delivery, comparison,
refusal, and cleanup signal with plain Node Vitest, production handlers, and
real Git in private repositories. For installed publication, run the
installed publisher and retained reporting entry against the real landing
handler, with an in-process substitute for the reporting transport.

The [later backend families](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families)
own the early quiet Done/native binding case, the other branch and
session-commits families, and final retirement of still-used review
helpers. General suite migration, runtime rework, and shipped skill code
are outside this increment.

## Current decisions

- Reuse [the Done capture arrangement](../../../dashboard/backend-tests/support/doneCaptureCase.ts)
  for private kept records, real dated checkout work, and the Done mark.
  Use [typed review and file reads](../../../dashboard/backend-tests/README.md#which-entry-a-case-uses)
  for the results. Set Git times after launch and before Done. Use
  the production record store and pin operations throughout.
- Give the current capture algorithm an explicit process-lifetime
  observation owner in
  [`observedSessionLandings.ts`](../../../dashboard/server/observedSessionLandings.ts).
  Its typed operation takes a source ID and ref and a published revision.
  A test can await the pass and supply an inspection function of the same
  signature as `inspectManualLanding` only where it needs to fail or hold
  validation. Real inspection still verifies the repository and authorized
  target. One owner holds checked witnesses and the in-flight state by
  project and observed revision. Keep the current pin-name update and
  fire-and-forget adapter used by Board ref reads, ordinary revision checks,
  and revision stream ticks. A fresh owner represents a restart while the
  private store and Git objects persist.
- Extract the shared typed `LandingSubmission`, request origin and
  prepare-or-record operation beneath
  [`submitLanding`](../../../dashboard/server/launchLandingReporting.ts).
  Keep origin, method, schema and known-source checks at the existing
  adapter. Reuse the current retained-record and launch-attempt paths,
  lock order, receipt and Git verification. Use
  [`recordSessionBranchEntry`](../../../dashboard/server/sessionBranchEntry.ts)
  and [`branchLandingContext`](../../../dashboard/server/branchLandingContext.ts)
  for declared worktrees. Reuse the real isolated home, real installed
  scripts and local origin fixture. Use canonical worktree paths on macOS
  to match Git's registered paths.
- Call the installed `publishExecutionIncrement` and the retained
  `reportCompletion` retry entry in process. Bridge only the installed
  sender's fetch to the typed receiver, preserving route, body schema and
  origin checked at the bridge. For retry, use the file selected by the
  sender's retained handoff, and check that the receiver records or returns
  the same pair and that trunk does not move. The branch handoff command's
  launch-input wiring remains proved by
  [ad-hoc-session-branch-handoff](../../../dashboard/backend-tests/review/ad-hoc-session-branch-handoff.spec.ts).
  The real reporting transport and surviving standalone command remain
  covered by
  [one-shot landing recovery](../../../e2e/review/one-shot-landing-recovery.spec.ts).
- Follow the North Star's
  [direct testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  direction and preserve the Dashboard's separate observation and publication roles under
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
  Judge the change by retained assertions, focused timing and reduced
  setup and support under
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Decisive premises

Observations ran at `563d21afc` in the established workspace on Node 24.21.0.
The six-spec baseline used `npm run test:dashboard:backend --
review/ad-hoc-manual-landing-observation.spec.ts
review/ad-hoc-manual-landing-observation-retry.spec.ts
review/ad-hoc-manual-landing-observation-lifecycle.spec.ts
review/ad-hoc-manual-landing-precedence.spec.ts
review/ad-hoc-session-comparisons.spec.ts
launches/agent-launch-session-branch-landing.spec.ts --workers=2`.
All 11 cases passed on the first attempt in 20.71 s of runner wall time,
including the retained native binding case.

The scratch extraction in `observedSessionLandings.ts` and
`launchLandingReporting.ts` and the scratch spec were reverted after the
checks. The command was `npm run test:dashboard:backend --
zz-scratch-ad-hoc-preparation --workers=1`, under the environment and
power guard below. All four checks passed on 2026-11-20 at 16:53 +08.

| Consuming operation | Result observed |
| --- | --- |
| Kept ad hoc record, production Done, real remote merge, then typed observation | `setRecordDoneAt` set `manualDeliveryChecked` and left the pre-push result eligible. Failing initial inspection left it as branch-result. Awaiting the same revision again returned the actual landed pair. A fresh owner preserved that receipt and deletion removed both types of pin. The baseline reached the independent success, later trunk advance and offline file checks through the same capture algorithm. |
| Real record removal while typed inspection is held | Holding inspection for the first of two Done branches let both deletion and expiry win in separate runs. The second branch landed. The first stayed absent from the document and its refs were gone. Expiring the second and writing through the production record store removed its remaining refs. With the removal dispatch installed, a store write sufficed to apply retention. |
| Installed publisher prepares and records through the typed handler | A kept blank Default main record declared a canonical worktree through production, created a real context, and loaded its installed publisher. At `beforePush` trunk still named the base and the store held the prepared pair. After acceptance, direct Done and worktree removal, the surviving reporting entry with `--operation landing --retry` returned the identical receipt while trunk stayed on the accepted candidate. The baseline also reached the instructed declaration and bound isolated attempt. |

## Ordered slices

### 1. A repeated revision check keeps one delivery

Type: Structure
Status: planned

Expose the awaitable owner and make the existing adapter delegate to it.
Move the ordinary revision-check case in
`review/ad-hoc-manual-landing-observation-lifecycle.spec.ts`. Keep the
pending lifecycle cases passing until slice 4. With a documented Done
branch and a real published merge, observe the selected pair and file,
then observe the same revision and a later advance. Assert one receipt
and exactly the same two landing pins. Delete through the production
record operation and verify that branch and delivery pins are released.
Run the existing `observation/authenticated-read-revision-check.spec.ts`
and `observation/authenticated-read-revision-stream.spec.ts` to preserve
the existing adapter callers and their revision replies.

### 2. A Board read discovers delivery for a retained or newly Done session

Type: Structure
Status: planned

Move both `review/ad-hoc-manual-landing-observation.spec.ts` cases.
Keep the conflict merge with its resolution, a later trunk commit, and
the distinct working-tree snapshot. Start a fresh observation owner on
the same store after branch retirement. Assert branch-result before the
first pass and the actual merge pair afterwards, then read both diffs and
texts offline and verify the Done timestamp. In the second case observe
the published revision before Done, arrange the Done mark while Git's
remote is offline, restore the remote and observe the same revision
again. Assert the eligible but unlanded intermediate record and the
newly discovered exact pair.

### 3. A failed verification can retry while another delivery settles

Type: Structure
Status: planned

Move `review/ad-hoc-manual-landing-observation-retry.spec.ts`. Supply
two Done records and two successive real merges. Fail the typed
inspection for the first candidate once and delegate other inspections
to real Git. Await the first pass and verify the other pair and file
have landed and the failed candidate still presents its branch result.
Await the same revision and assert the first merge, its original base and
its file. This owns the retry and per-record isolation proof.

### 4. Deletion and expiry still win while inspection is held

Type: Structure
Status: planned

Move the two held-inspection cases from
`review/ad-hoc-manual-landing-observation-lifecycle.spec.ts`. Gate the
typed inspection for the leaving branch and let it run real Git upon
release. Use the record deletion or retention operation and the production
retention dispatch, and await the entire observation. Verify the surviving
delivery, the absence of the removed record from storage, and exactly the
survivor's Git refs. In the expiry case age out the survivor, apply a real
store rewrite, and verify its remaining evidence is released too.

### 5. A prepared receipt remains recordable across Done

Type: Structure
Status: planned

Expose the typed landing handler without moving the admission
contract or the attempted/retained write logic. Move only the
prepared-receipt case from
`review/ad-hoc-manual-landing-precedence.spec.ts` to a Vitest spec.
Declare the private worktree, retain the exact pair via prepare, and
publish it to the authorized local origin. Call Done before capture and
verify the prepared pair still has precedence, then record the same
receipt and read its landed comparison. Keep the native binding case
running through its existing boundary. Run
`review/one-shot-landing-capture-admission.spec.ts` to confirm existing
wire refusal and accepted capture through the delegated adapter.

### 6. A Done session keeps its different delivered and working comparisons

Type: Structure
Status: planned

Move `review/ad-hoc-session-comparisons.spec.ts`. Keep the established
isolated launch and its matching reporting attempt and context in the
private stores using MakeMe state. Use the installed publisher to drive
prepare and record via the typed receiver. Arrange the dirty rename at Done
and restore its committed bytes before publication. After retirement and
pruning, assert delivered is selected by default and branch-result is
still selectable. Through typed review and file reads, assert both rename
pairs and their distinct text, and the 409 refusals for a foreign tree
and an incorrect old path.

### 7. A declared worktree's publication and retry stay with its original launch

Type: Structure
Status: planned

Move the instructed launch case from
`launches/agent-launch-session-branch-landing.spec.ts`. Keep the
original and a different launch with distinct references. Declare the
original worktree through production and assert the registration facts.
Refuse the other launch's reference and an undeclared worktree's tip
without changing either record. Use installed publication, asserting
the original trunk and prepared pair before push and the exact accepted
pair afterwards. Confirm the record is still open, then retire the
worktree, arrange Done and retry the retained input. Check the same
receipt, unchanged trunk, retained file and text. Keep the blank launch
case running until slice 8.

### 8. A blank launch keeps its declared delivery until deletion

Type: Structure
Status: planned

Move the blank Default main case from the same launch spec. Keep a
blank record, declare its own worktree, and check pre-push preparation,
accepted delivery, and the exact installed retry after retirement and
Done. Assert the launch still has no input reporting context and that the
landed file and pins belong to the declared reference. Delete the record
through production and verify those pins are gone. Remove only support that
has lost its final caller. Trace `launchIsolatedReview`,
`keptAdHocRecord`, and the declared-publication helpers across dashboard
and e2e before deletion. Keep the shared review helpers used by the
deferred branch and session-commits cases.

## Local gates

Run the moved and remaining cases named by each slice with
`npm run test:dashboard:backend -- <selection>`. Recheck test-entry
selection for actual paths and apply MakeMe to the moved Node cases. Use
the maintained [consumer trace](../../../Distribution/src/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
for retired setup and affected production seams. Run
`npm run typecheck:dashboard`, `npm run lint`, and a final focused run of
the migrated and preserved checks. Keep default timeouts and follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Unset `NO_COLOR`, `FORCE_COLOR` and `GIT_ALTERNATE_OBJECT_DIRECTORIES`.
Start fully awake and use `caffeinate -s -i` on AC, or `caffeinate -i`
with the lid open and inspect the sleep log on battery, under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).

For the improvement check, compare the ten scoped baseline and replacement
case durations at the same worker count, with repeated warm focused runs
and the strict proof record. Report the median summed case times and wall
time for equivalent selections, the separate runner overhead if observed,
and any load or engine effects. Confirm that the ten migrated cases use no
launch, fake finished listing or HTTP Done arrangement, and list the
removed support callers and remaining shared consumers.

## Plan review

Each of the eight Structure slices owns a proof loop sized for 15 active
minutes. The two shared seams sit with their first migrated cases. This
review found no remaining concern requiring slice-plan refinement.
