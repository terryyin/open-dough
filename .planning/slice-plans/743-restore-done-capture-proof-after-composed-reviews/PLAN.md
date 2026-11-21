# Restore Done capture proof and focus session Review tests

**Identity:** SEED-413#restore-done-capture-proof-after-composed-reviews
**Source:** [Restore Done capture proof and focus session Review tests](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#restore-done-capture-proof-after-composed-reviews)

## Correction input

- **Provenance.** Retrospective of SEED-413#split-done-mark-decision-from-store.
  Recover the story and plan 734 at `6250b7399`. Review range
  `fd05ea2d2..0d1560004` covers `f5e3a956d`, `39e8ac4b3`, `a60e32a59`,
  `93cc82cf7`, `1d657edf1`, `53e4fb525`, and `0d1560004`. The source
  retained real Git reflog proof and required each moved case to preserve its
  assertions. The [done record](../../done/SEED-413_split-done-mark-decision-from-store.json)
  records Intent Coverage at `6ff2b1d9c`: omitting the saved shared-checkout
  flag passed the maintained checks and failed an independent Done witness.
- **Current findings.** Typed attribution exercises literal labels. Real Git
  rewrite, merge, and rebased-pair cases supply the run they assert. The
  shared-checkout Review cases compose the flag, and the declared-branch
  Review example supplies the run before checking the entry cutoff. A
  composed landing store now runs the branch settler in its own Done procedure.
  The prepared-receipt fixture omits the witnessed trunk revision, so Git
  cannot propose the competing manual landing. `aDoneBranch` drops the
  delivery returned by capture. The worktree test holds after the entire
  capture, and the revision-observation test checks removal of a branch pin
  it never established. The retrospective at `3c1bc448a` found repeated
  Review calls in capture, lifecycle, delivery, and reporting tests. Both
  session comparison and file admission take a project's kept list to use
  one host-qualified record.
- **Preserved product behavior.** Source, host and session admission,
  story-launch and missing-session refusals, selected runs, literal file
  pairs, aborts and deadlines, captured evidence and pins, and lifecycle
  ordering. Keep the supported historical Review after cleanup.
- **Boundaries.** Plan 736 owns the observation decision and store split.
  Branch entry, landing store design, launch presets, and timing targets
  for the family stay with their respective stories. Plans
  [736](https://github.com/terryyin/open-dough/blob/24864be6360f87cc9fec3dc4333de5361de165eb/.planning/slice-plans/736-observe-done-deliveries-over-typed-records/PLAN.md) and
  [742](../742-prove-ad-hoc-review-handoffs/PLAN.md) were Taken at
  `e6cd3a320` and `9889c9925`. Plan 736 owns the observation fixtures,
  the pin setup switch and the timeout repairs for its restart and lifecycle
  cases. Plan 742 owns the wire-to-typed migration for its three handoffs.
  At the Review boundary change, recheck each sibling's landed form, migrate
  reached readers, and preserve its distinct proof. If a sibling still owns
  unlanded edits to the same reader, coordinate the migration through that
  owner. Reconcile the retained Review proof references at handoff.

## Current decisions

Reuse the production owners. `readSessionCommits` consumes a dated launch and
its Default main Git checkout. `captureBranchResult` consumes a launch and
Done timestamp and returns the branch result and proposed delivery.
`setRecordDoneAt` owns the durable Done write, both capture settlements and
pins. Publisher cases use the delivered `handleLanding` seam. The prepared
receipt test uses the real record store because it observes the handoff
between two production writes.

`namedKeptSession` already resolves a host-qualified session and owns the
unknown-session response. Use that lookup in the existing Review input
adapter for both comparison and files. Refuse story launches there. Story
Review keeps its story input. Standalone handlers receive one admitted
`LaunchRecord`, the selected run or literal file fields, and the caller's
signal. Keep the same wire routes and the current signal and deadline behavior.
This follows [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and the [North Star on directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
Use counts with proof preservation under [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Decisive premises

Observed on 2026-11-21 SGT at `1946c3db2` in the preparation worktree,
using the AC guard below. Focused backend probes used `--workers=1`
and a title filter when the spec had other cases. The edits were reverted.

| Consuming operation | Result |
| --- | --- |
| Git log to captured runs (1) | With the existing pull-and-amend history, `readSessionCommits` returned exactly the pulled trunk commit to the published session tip. Dropping only `pull` from the replay recognizer caused an unplaceable log entry. The original composed history and typed cases passed with the same omission. Checkout work already exercises merge, continued cherry-pick, fixup and squash. |
| Default main write (2) | The maintained shared-checkout cases passed when settlement dropped `shared`, corroborating the recovered Intent Coverage witness. Replacing the saved entry tip with the current ref left the old declared-branch case green. A direct read using the entered record while main had advanced returned just the pair ending at the saved entry tip. |
| Prepared and unprepared delivery (3–4) | Without a witnessed trunk revision, the original receipt case passed with the preparation guard removed. Supplying the revision and asserting the absence of an auto-landing failed at that assertion when the guard was removed. The production store variant kept the branch result with the pending receipt, then recorded that receipt; the unprepared merged variant stored branch and delivery together. |
| Snapshot consumption (5) | A Vitest spy held only the capture's ancestry request in the worktree. Editing during the hold, then retiring the worktree, left the older draft text readable and kept the live index and HEAD intact. The existing supersession case holds after capture and serves a different race. |
| Manual merge attribution (7) | The current merge timed out at 5 s with two workers and with one. In the same fixture, two direct capture reads distinguished a local-only merge from its published trunk pair, and Git returned the conflict-resolution bytes. The case took 2.01 s at one worker. The existing post-prune and offline cases own independent survivability. |
| Review boundary consumers (8) | The selected Chromium journey passed after cleanup using `npm run --silent test:e2e -- e2e/sessions/recently-done-sessions-select-ad-hoc-review.spec.ts --workers=1` (one case, 8.35 s). The backend cohort exercised wire request shape, typed subject refusals, run selection, literal pair/file reads and file aborts. Consumer trace for `reviewInput`, `keptSessionOf`, `aSessionReviewRead` and `doneCaptureReview` reached the Dashboard comparison/diff/text handlers, MakeMe and backend specs. The installed support builder has no independent Distribution spec consumer. Retest the affected paths and story variant at the switch. |

The planning roster selected 124 cases in 36 backend specs. At two workers,
116 passed and eight timed out. The one-worker diagnostic selected the seven
affected files and passed 14 of 15 cases. The verified merge was the only
repeat timeout. The other timed-out cases belong to slices 4, 5 and 7, or
plan 736 for observation lifecycle and restart. Preserve their proof and
verify stable default-timeout execution with the final affected cohort at the
ordinary two-worker setting. Counts include timed-out cases.

## Plan review

Slice-plan refinement separated capture, durable writes, publisher proof,
snapshot timing, lifecycle assertions, attribution, and the final contract
change into eight proof loops, each scoped to the maintained setup it uses.
Most move assertions inside existing specs. The final slice switches one type
and builder after earlier slices remove the incidental Review callers.
The observed baseline failures have named repair owners and verification.
This review found no remaining slice-specific planning concern.

## Ordered slices

### 1. Attribute Default main commits from Git's reflog

Type: Structure
Status: planned

Reuse the existing dated Git checkout recipes in the composed rebased-run,
commit-run and rewrite specs. Exercise `readSessionCommits` with Git's own
pull/rebase replay, merge or amended merge, and autosquash entries. Keep a
continued cherry-pick or fetch-and-rebase example where it proves a distinct
action spelling or capture result. Assert exact surviving run pairs and,
where meaningful, the rewritten file contents with Git. Keep the typed
attribution cases for classification and grouping. Keep the separate composed
two-run Review case for ordered selection and diff isolation. Replace a
composed history case only when its distinct assertion has a passing owner.

**Proof.** Exact captured pairs fail when their consumed Git reflog action
is rejected or the capture selects the discarded tip. Preserve omitted older
or imported work, empty runs, and existing failed-capture outcomes. Keep
fixture histories small enough to fit the default timeout.

### 2. Prove which Default main evidence the Done write saves

Type: Structure
Status: planned

Keep two overlapping Default main launches, mark one through
`setRecordDoneAt`, and assert the persisted capture has `shared: true`.
Retain composed Review coverage for presenting the flag. In the declared
branch example, let Default main advance past the recorded entry tip before
Done. Assert the saved Default main pair ends at `entry.defaultTip` and
the branch result has its own pair. Reuse existing branch-entry arrangements
and leave comparison choice and file rendering with the Review owners.

**Proof.** Removing propagation of the computed `shared` field or using the
current Default main tip fails the corresponding persisted assertion.

### 3. Preserve receipt precedence and both kinds of Done evidence

Type: Structure
Status: planned

On a kept launch whose branch record includes the witnessed trunk revision,
prepare through `handleLanding`, push its exact tip, and mark Done with
`setRecordDoneAt`. Observe the same kept record between preparation and
recording. Require branch evidence, the prepared receipt, and no auto-kept
manual landing. Record the exact supplied receipt. In the merged branch case
with no preparation, use the real Done write and assert both saved pairs and
their pins. Retire `keptAsDone` and `keptAsDoneAfterRetirement`.

**Proof.** The receipt case fails if Done substitutes its own delivery for
the prepared pair. The merged case fails if settlement drops either pair or
fails to pin it. A remaining branch-only fixture that uses
`captureBranchResult` must reject an unexpected delivery, with the merged
case exercising the positive delivery path at its real persistence owner.

### 4. Focus publisher and worktree-retirement proof

Type: Structure
Status: planned

Narrow the installed-publisher cases to preparation, acceptance, exact retry,
and saved landing or pins when those are the outcomes each case owns. Keep
the landing record-write correction's fixture and deletion responsibility.
In the mixed-comparison case, run the real Done adapter in the store the
publisher reads. Keep a representative post-retirement read of independent delivered
and worktree file contents, including a renamed path where the case proves
retention. Give equivalent pair admission checks to the typed Review cases.

**Proof.** Installed publication cases still distinguish preparation before
push, exact acceptance and reporting retry, and release of the owning pins.
Preserve the mixed-pair historical file witness in
`ad-hoc-session-comparisons`; allocate its independent old-path rejection to
the typed file cases. Keep the published-worktree and mixed-pair cases within
the default timeout by removing incidental full reads and Git work.

### 5. Prove the snapshot survives later workspace edits and retirement

Type: Structure
Status: planned

Hold the ancestry check after `readBranchWorkspace` has taken the snapshot.
Edit the file before capture completes. Use Vitest's spy on the existing
Git-runner call, forwarding other Git calls and releasing the hold in cleanup. Keep the old bytes, unchanged live index and HEAD, and
readable retained objects after forced retirement. The supersession case
holds after capture and names that actual phase.

**Proof.** A late re-read of the live file changes the retained bytes and
fails the test. Keep the post-retirement file text that observes those bytes.
Move repeated diff or file-kind assertions to their independent Review proof.

### 6. Observe lifecycle results in saved records and refs

Type: Structure
Status: planned

In completion/reopen/retry and branch supersession cases observe saved Done
time, runs, failure markers and pins alongside the native events and ordering
signals. Remove Review calls used solely to inspect persisted state. Keep
the Default main post-prune read. Carry forward plan 736's offline restart
read of both independent pairs and its deletion/expiry and pin proof. Account
for the vacuous revision-observation branch-pin check under plan 736's
replacement of that fixture.

**Proof.** The cases detect a stale capture winning, a retry recapturing a
failed Done, and deletion or expiry retaining evidence or resurrecting a
record. The saved-state cases have fewer full comparison and file reads.

### 7. Verify delivery attribution at the Git decision

Type: Structure
Status: planned

Use `inspectManualLanding` for witnessed fast-forward, unwitnessed parent,
unrelated target advance and same-content squash. Use `captureBranchResult`
where reading the recorded remote target is the property. Preserve the
verified merge's actual target parent and conflict-resolution bytes with
`inspectManualLanding` and Git, including local-only versus accepted merge
evidence. Move branch-entry attribution assertions to the captured result and
its retained objects. Retire duplicate calls or cases after identifying the
remaining assertion that catches each regression. Keep a distinct unrelated
history case if the same-content squash fails by a different rule.

**Proof.** The verified merge reaches its decisive pair and conflict content
inside the default timeout. The remaining cases reject each false witness
and inspect the exact accepted pair. Capture and attribution mutations
distinguish the preserved outcomes without rendering Review.

### 8. Pass the admitted record through standalone Review

Type: Structure
Status: planned

Apply the single-record boundary in `storyReviewInput.ts` shared by the
comparison and both file readers. Transfer unknown-source, missing-session,
host qualification and story-launch checks to a boundary case with an
isolated kept store. The typed handlers and MakeMe input builder no longer
take a record list. Remove the generic comparison, diff and text wrappers
from `doneCaptureReview.ts`. Move `hasBranchReview` beside the existing
branch-result domain predicates so the typed Done transition imports no
Git adapter. Update the backend test reference.

**Proof.** Exercise both route shapes and all three production response paths
through admission. Use the composed selection, unavailable, file-pair, rename,
and abort cases to preserve their typed results. Keep the bounded story
Review smoke that uses the other variant of each contract. Review earlier
slices' remaining wrapper callers before switching the input. Any retained
caller must use the production boundary appropriate to what it proves.

## Accounting and gates

- Audit the baseline and final selected backend cases from runner results
  using the union of affected specs across both revisions, including moved
  and newly selected owners. Subtract no cases merely because one revision
  times out. Across intervening sibling changes take both measurements from
  the same integrated basis for work attributed to this correction. Follow wrappers and direct calls to
  `storyReview`, `reviewedFileDiff`, and `reviewedFileText`. Count the full
  standalone reads in those cases, including parameterized cases and loops,
  at those entry points on each revision. Use a reverted counter probe when
  static accounting would miss runtime multiplicity. Final proof requires a
  net decrease in case count and full Review reads with distinct coverage
  mapped to their surviving cases.
- Local gate on AC power under `caffeinate -s -i`, per
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Run `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run --silent test:dashboard:backend -- <affected specs>`,
  then Dashboard typecheck and lint sequentially. Keep default timeouts,
  never use `test.slow()`. Preserve the existing
  [historical browser workflow](../../../e2e/sessions/recently-done-sessions-select-ad-hoc-review.spec.ts)
  and run it after the shared response change. Select tests with
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md), and apply the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to every failure. Run consumer trace for changed boundaries, including
  shared test builders and browser journeys reached by the adapter.
