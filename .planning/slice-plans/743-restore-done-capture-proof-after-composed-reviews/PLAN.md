# Restore Done capture proof and focus session Review tests

**Identity:** SEED-413#restore-done-capture-proof-after-composed-reviews
**Source:** [Restore Done capture proof and focus session Review tests](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#restore-done-capture-proof-after-composed-reviews)
**Source review:** [Source-only commitments](source-review.md)

## Execution context

- Agent Rina-chan, publisher `dashboard-territory.local-open-dough`, Story Branch Mode.
- Execution checkout `/Users/terryyin/git/open-dough/.worktrees/restore-done-capture-proof-and-focus-session-rev`, branch `codex/restore-done-capture-proof-and-focus-session-rev`. Integration checkout `/Users/terryyin/git/open-dough`.
- Authorized remote `origin`, target `main`. Starting revision `623efa1fd11c9b09d321dea5d6bbb89765cb2c5e`; established claim on trunk and branch `44d066285382c809f7ed78c081cf438ebe3f3715`.
- Checkout-bound `npm ci` and `npm run typecheck:dashboard` passed with Node 24.21.0. The tracked check-only hook uses staged lint and Dashboard typecheck.
- GitHub Actions `ci.yml` (CI), branch `codex/restore-done-capture-proof-and-focus-session-rev`. Codex stream coordinator `rina-743-1b49221c`, directory `/tmp/dough-ci-501/watch-dRtRwr`, session 75465, PID 71136, cell `g65:12`. The claim's trunk CI is unobserved.
- Replanning stays within existing planning authority.
- Slices 1 and 2 accepted on the execution branch at
  `0d4666c3f8105e53189babd8355ee061dfe8639e` and
  `5af3c3a034dc94fbea55a5ac3643b7e769ea7c06`. Both reused the live stream.
  Run 44843537632 attempt 1 had no failed jobs and was superseded by the
  push-triggered run 44844609085 for slice 2 under same-ref CI concurrency.
- Slice 3 accepted at `00870a50094edd8bfa352e7b0b26e125b06efe92` and reused the
  live observer. The slice 2 attempt had no failed jobs and was superseded by
  the slice 3 push-triggered run 44845496590 under the same concurrency group.
- Slice 4 accepted at `c16c2420094baa6f1c686ed9cb5a574c088a21d4` and reused the
  live observer.
- Slice 5 accepted at `0c95fce81672b657968fde5c5f46bfe46e397126` and reused the
  live observer.

- Slice 6 accepted at `0ba5db4a69ae63f6a61afe4e2000a7a8b4d21f2c` and reused the
  live observer.

- Slice 7 accepted at `4308b3bbc0f3f0426f17b2c58e9c2b1870074043` and
  reused the live observer. Run 44848998117 attempt 1 had no failed jobs
  and was superseded by 44850082670 under same-ref CI concurrency.

- Slice 8 accepted at `4056d73bd257e88d344c124e9082d5a3a61078cc` and reused
  the live observer.

- Slice 9 published at `706285f9ee7ead02168f8885d046429207996f87`.
  The accepted SEED-418 Review surface was reconciled in `a98710b79`.

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
Status: done

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

**Accepted proof.** Six backend specs passed 29 cases with the AC guard,
default timeouts and two workers. The literal command and captured pairs are in
the checkout evidence `slice1-return.md` and `slice1-reflog-focused.log.run.json`.
The amended pull/rebase example observes the actual pushed tip and surviving
bytes. The fetch/rebase, two merge forms, continued cherry-pick and both
autosquash forms observe their own capture pairs. The composed pulled-story
comparison retains ordered selection and diff isolation. The checkout-edit
case in `done-kept-session-unavailable.spec.ts` owns the repeated empty-run
response. The three edited specs go from 9 to 8 cases and 15 to 4 standalone
Review reads. The final accounting uses the full affected roster.

### 2. Prove which Default main evidence the Done write saves

Type: Structure
Status: done

Keep two overlapping Default main launches, mark one through
`setRecordDoneAt`, and assert the persisted capture has `shared: true`.
Retain composed Review coverage for presenting the flag. In the declared
branch example, let Default main advance past the recorded entry tip before
Done. Assert the saved Default main pair ends at `entry.defaultTip` and
the branch result has its own pair. Reuse existing branch-entry arrangements
and leave comparison choice and file rendering with the Review owners.

**Proof.** Removing propagation of the computed `shared` field or using the
current Default main tip fails the corresponding persisted assertion.

**Accepted proof.** The three affected backend specs passed 13 cases.
After the mixed Review case adopted the Git tree baseline from the moved
branch-entry fixture, all three cases in its typed Review spec passed.
See `slice2-return.md`, `slice2-durable-done.log.run.json` and
`slice2-entry-tree.log.run.json` in checkout evidence. The changed cases
observe the saved pairs and flag after real Done writes and keep the typed
overlap, comparison choices and file content checks. Across those specs
cases go from 12 to 13 and full Review reads go from 13 to 11.
The independent pass moved run selection into the existing MakeMe Review
builder and passed eight reached cases, including numeric and named selections,
the default and literal file reads. See `slice2-refactor.md`.

### 3. Preserve receipt precedence and both kinds of Done evidence

Type: Structure
Status: done

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

**Accepted proof.** Ten cases in seven backend specs passed the final
selection with default timeout and worker settings. The prepared record keeps
its branch result and receipt at Done, then records that exact receipt. The
unprepared manual merge stores and pins both pairs. The two edited specs
retain four cases and reduce full Review reads from five to three.
See `slice3-return.md` and `slice3-branch-consumers.log.run.json` in checkout
evidence. The two unused imitation helpers are removed. Slice 4 owns retirement
of the remaining composed Done procedure and the final observation for
commitment 25.

### 4. Focus publisher and worktree-retirement proof

Type: Structure
Status: done

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

**Accepted proof.** Twelve cases across the two declaration specs,
`ad-hoc-session-comparisons.spec.ts` and `ad-hoc-review-file.spec.ts` passed at
default settings. The exact worktree retry, blank deletion and mixed historical
read took 1.585, 2.249 and 2.811 seconds respectively. Both renamed file
versions remain readable after retirement and pruning. The typed file cases
own the exact foreign-pair and wrong-old-path refusals. Across the four specs
cases go from 11 to 12 and full standalone Review reads from 18 to 12.
See `slice4-return.md` and `slice4-publisher-and-review.log.run.json`.
Plan 745’s independently owned store-retention and deletion work remains scoped
to its own active checkout; its inspected edits concern the composed store’s
read and replace paths, separate from removal of the imitation Done member.
The independent pass removed the unused `attempts()` accessor. Both
remaining declared publisher fixtures passed their cases again; see
`slice4-refactor.md`.

### 5. Prove the snapshot survives later workspace edits and retirement

Type: Structure
Status: done

Hold the ancestry check after `readBranchWorkspace` has taken the snapshot.
Edit the file before capture completes. Use Vitest's spy on the existing
Git-runner call, forwarding other Git calls and releasing the hold in cleanup. Keep the old bytes, unchanged live index and HEAD, and
readable retained objects after forced retirement. The supersession case
holds after capture and names that actual phase. In the newer-Done case, inspect the saved
state before the second mark and the saved newer branch pair, timestamp and
pins at settlement. The focused refactor run timed out at 5.079 seconds on
the 16-logical-CPU Mac while its one-minute load was 24.23. Move this case's
planned slice 6 saved-record migration here to remove two full Review reads
from the time-sensitive interval. Keep the pending and newer-wins observations.

**Proof.** A late re-read of the live file changes the retained bytes and
fails the test. Keep the post-retirement file text that observes those bytes.
Move repeated diff or file-kind assertions to their independent Review proof.

**Accepted proof.** The two changed specs passed all four cases at default
settings after the targeted supersession migration. The snapshot compares the
live index, HEAD, pinned file set and earlier bytes after forced retirement.
The independent Chromium backend deleted-file case proves baseline text and a
null result side. A held first Done now leaves the saved session unmarked.
After release, the newer Done timestamp, branch pair and only its Git pins
remain. This case passed in 1.643 seconds with load 20.86 before and 20.02
after, lower than the timed-out run's load. The proof establishes headroom
in those conditions; the timing difference includes the workload change.
Cases stay at four and full Review reads go from eight to three.
See `slice5-return.md`, `slice5-saved-supersession.log.run.json` and
`slice5-deleted-review-proof.json` in checkout evidence.

### 6. Observe lifecycle results in saved records and refs

Type: Structure
Status: done

In completion/reopen/retry and remaining branch supersession cases observe saved Done
time, runs, failure markers and pins alongside the native events and ordering
signals. Remove Review calls used solely to inspect persisted state. Keep
the Default main post-prune read. Carry forward plan 736's offline restart
read of both independent pairs and its deletion/expiry and pin proof. Account
for the vacuous revision-observation branch-pin check under plan 736's
replacement of that fixture.

**Proof.** The cases detect a stale capture winning, a retry recapturing a
failed Done, and deletion or expiry retaining evidence or resurrecting a
record. The saved-state cases have fewer full comparison and file reads.

**Accepted proof.** Seventeen cases in four backend specs passed at default
settings. Completion, reopen, retry and supersession now observe saved Done
fields and pins together with native ordering and removal. The held-rename
case carries the removed standalone example's receipt and native rename
arguments. The two Default main historical reads still pass after trunk
advance and after prune; the old branch-pair refusal remains.
Cases go from 11 to 10 and full Review reads from 11 to 3 across the affected
specs. See `slice6-return.md`, `slice6-lifecycle.log.run.json` and
`slice6-lifecycle.json`. The observed plan 736 branch at `1bb48cd6f` still owns
its restart and actual revision-pin cases; this delivery leaves those paths
with their owner.

### 7. Verify delivery attribution at the Git decision

Type: Structure
Status: done

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

**Accepted proof.** Fifteen cases in four specs passed at default settings.
The real conflicting merge proves the local-only refusal, the accepted actual
trunk parent and the exact resolution bytes in 3.544 seconds with other
worktrees active. The same-content squash retains the previous unrelated
change case's branch-tip ancestry refusal. A new typed attribution-gap case
retains the explanation and refusal for an otherwise literal file pair.
Three bounded, reverted probes rejected incorrect remote recognition,
branch attribution and omission of the gap at their intended assertions.
Cases stay at 15 and full Review reads go from 25 to 6.
See `slice7-return.md`, `slice7-git-attribution.log.run.json` and
`slice7-probe.log.run.json`; the independent pass made no edits.

### 8. Prove standalone Review at production admission

Type: Structure
Status: done

Exercise both wire shapes and comparison, diff and text production responses
from one isolated configured source and store. Two hosts use the same native
session ID and hold different actual Git pairs. Retain source, missing-session
and story-launch refusals and literal file fields. Keep one exact no-capture
Review response on the real failed-Done example and preserve independently
composed object, availability and attribution-gap cases. Move
`hasBranchReview` beside the branch-result domain predicates to remove the
typed Done transition's Git adapter dependency.

**Proof.** The focused production responses return the selected host's run
and literal file results, and the boundary refuses unknown sources, missing
sessions and story launches. The existing branch and Done guards pass with
the relocated predicate.

**Boundary decision.** The ninth slice is a split of the in-progress eighth
slice within the execution cap of ten. Admission proof and the predicate
relocation stand independently and can be delivered while the two named
siblings still own unlanded readers. The original shared-input change and the
whole-story accounting remain together in slice 9. The story outcome, scope
and evaluation are unchanged.

**Accepted proof.** The production admission and branch-guard cohort passed
37 cases across seven specs. Repeating only the request spec after moving the
matching native IDs under the nondefault configured source passed all eight
cases. The real unreadable-log Done case retains the exact no-capture response
for two redundant composed cases. Cases go from 19 to 18 across the four
edited specs. The old shared handler still sees the two handler-level
refusals, so full typed calls go from 11 to 12 here; slice 9 owns final
accounting. See `slice8-admission-return.md`, the two passing run records and
their selected-case reports. The preceding configuration failure was fixed by
initializing the real catalog in the private home.

### 9. Pass the admitted record through standalone Review

Type: Structure
Status: done

Apply the single-record boundary in `storyReviewInput.ts` shared by the
comparison and both file readers. Preserve slice 8’s source, host and session admission and refusals. The typed handlers and MakeMe input builder no longer
take a record list. Remove the generic comparison, diff and text wrappers
from `doneCaptureReview.ts`. Update the backend test reference.

**Coordination.** Plan 736's accepted restart and observation readers were
integrated at `0747fb0a2`. The branch-only fixture now captures before the
manual publish so the same observed revision can discover a newly Done
record with no preselected delivery. The offline pair and both old file
versions, lifecycle races and all pin assertions remain covered. Plan 742's
closure `fe9755dba` was accepted at `be03d5643`. Its two typed handoffs now
read the saved host-qualified record; the actual branch-entry handoff was
rechecked. Those 11 cases passed at default settings. The final comparison
uses the same accepted `be03d5643` basis on both sides.

**Proof.** Exercise both route shapes and all three production response paths
through admission. Use the composed selection, unavailable, file-pair, rename,
and abort cases to preserve their typed results. Keep the bounded story
Review smoke that uses the other variant of each contract. Review earlier
slices' remaining wrapper callers before switching the input. Any retained
caller must use the production boundary appropriate to what it proves.

**Accepted proof.** The focused records are `slice9-return.md`,
`slice9-refactor-current.md`, `slice9-plan742-return.md` and
`slice9-refactor-plan742.md`. The current and peer readers preserve exact
handler admission, signal behavior, pairs and file bytes. The typed adapter
resolves the project, host and native ID once and passes only the selected
record and requested fields.

## Accounting and gates

The union contains 43 spec paths. Live baseline Vitest collection
(`vitest list --no-staticParse`) gives 146 cases, and the native Chromium
listing gives two, for 148 on `be03d5643`. The guarded integrated candidate
run passed all 146 selected cases (144 Vitest, two Chromium) across 41
surviving specs. Two removed files remain in the baseline roster. Live
collection counts each loop iteration, including cases that previously timed out. The same roster has 138 baseline and 68 candidate standalone
Review reads at the comparison, diff and text handler entries, counting the
actual invocations from test loops and wrappers. The 742 handoffs preserve
one comparison read each. The offline, post-prune and forced-retirement
examples retain actual reads in their own cases. Checkout evidence includes
`slice9-integrated-audit-roster`, `slice9-baseline-runtime-be03d5643.json`,
`slice9-baseline-native-be03d5643.json`, `slice9-integrated-backend.json` and
`slice9-read-audit-be03d5643.json`.

After selective formatting and the affected backend cohort, Dashboard
typecheck and repository lint passed sequentially under the AC guard. The
recorded Chromium historical journey selected and passed its single
case, including the saved Intent coverage and historical Review after
cleanup. See `slice9-integrated-typecheck.log`,
`slice9-integrated-lint.log` and
`slice9-integrated-historical-browser.json`.


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

## Concurrent published-session Review

SEED-418 landed on trunk at `8be1d198` after the initial implementation
was published. The merge `a98710b79` keeps three explicit admission
paths. Local sessions carry one saved record, published sessions carry
their configured fetched source and bounded request signal, and story
reads use the existing story input. The focused reconciliation passed
26 local and published cases. The subsequent request-spec refactor passed
nine cases and the final combined local gates passed.

The final matched roster adds the three published-session backend specs
on both sides. Live Vitest collection and native listing selected 165
baseline cases across 46 specs. The reconciled candidate passed all 163
cases across 44 surviving specs. Full standalone Review reads on that
roster go from 145 to 75, including seven published-session calls on
each side. Dashboard typecheck, repository lint and the one-case
Chromium historical journey passed on the combined candidate. See
`slice9-final-audit-roster`, `slice9-baseline-runtime-8be1d198.json`,
`slice9-baseline-native-8be1d198.json`, `slice9-read-audit-8be1d198.json`,
`slice9-reconciled-backend.json` and `slice9-reconciled-historical-browser.json`.

## Concurrent delivery-observation proof

The delivery-observation consolidation at `a2a767f12` replaces the
observation roster on both sides of the comparison. Retain its typed Git
decision, retry and coalescing cases and its focused store and pin checks.
The manual-landing spec still proves the exact merge parent and resolution,
witnessed fast-forward, acceptance on a different remote branch and squash. The offline
check now uses the existing real Done write and saved manual delivery in
`ad-hoc-branch-attribution.spec.ts`. The selected file response verifies both
versions after branch retirement with an unreachable origin.

On the updated `0759aff06` basis the live-collected backend cohort goes
from 157 cases in 41 specs to 155 cases in 39 specs. All 155 pass on the
reconciled candidate. Full Review entries go from 126 to 64. See
`wrap-up-main-vitest.json`, `wrap-up-backend.log` and `wrap-up-read-audit.json`.

## Execution complete

Product advice: Keep the direct Done capture and persistence proof, and
the separate, single-record standalone Review admission. The now-retained
historical workflow and its unit-level signal, file and store proofs
support keeping the current order of Done fixture composition and
performance measurement. The outcome review found no further correction.
The existing Chromium journey was a regression check for the shared
boundary. [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
supports the distinct kept and published evidence, and the matched counts
support the local proof improvement under
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The process review recorded [DD-604](../../../DearDough.md#dd-604) and a
[DD-594 occurrence](../../../DearDough.md#dd-594).
