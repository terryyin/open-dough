# Restore Done capture proof and focus session Review tests

**Identity:** SEED-413#restore-done-capture-proof-after-composed-reviews
**Source:** [Restore Done capture proof and focus session Review tests](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#restore-done-capture-proof-after-composed-reviews)

## Correction input

**Provenance.** Retrospective of
SEED-413#split-done-mark-decision-from-store (story and plan 734 at
`6250b7399:.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md` and
`6250b7399:.planning/slice-plans/734-split-done-mark-decision-from-store/PLAN.md`), reviewed over `fd05ea2d2..0d1560004` (commits `f5e3a956d`,
`39e8ac4b3`, `a60e32a59`, `93cc82cf7`, `1d657edf1`, `53e4fb525`,
`0d1560004`). Its source promised: "Keep Done marking as the topic only in
specs that prove the capture, the transition rules … or the adapter's
persistence", "keep one real-Git case for the reflog read", and "Every
replaced case keeps its assertions." The correction preserves distinct
product promises and removes redundant assertions and cases.

**Original findings** (read-only review at `0d1560004`)

1. *Reflog actions are proved only as hand-written strings.* The base cases
   that ran real rebases, pulls, merges, amends, cherry-picks and autosquashes
   through `readSessionCommits` now compose `sessionCommits`; the typed cases in
   `done-session-commit-attribution.spec.ts` feed literal action text, and the
   remaining real-Git Done cases make only plain `commit:` entries. A
   `committing`, `replaying` or `moving` pattern
   (`dashboard/server/sessionCommitAttribution.ts`) that stopped matching Git's
   own text would pass.
2. *Done no longer proves it stores `shared`.* `done-kept-session-shared-checkout`
   proves `checkoutSharedMeanwhile` and composes `shared: true`; nothing
   connects them through `settleSessionCommits` (`dashboard/server/doneCapture.ts`).
   Intent Coverage at `6ff2b1d9c` confirmed it: dropping `shared` there passed
   every maintained check while an independent Done witness lost it (the
   SEED-413#split-done-mark-decision-from-store done record holds the report).
3. *Done no longer proves session commits stop at the branch entry's Default
   main tip.* "Done reviews a declared branch apart from the Default main
   commits before its entry" (`ad-hoc-session-branch-entry.spec.ts`) now
   composes its run; `readSessionCommits`' use of `entry.defaultTip` is
   unexercised.
4. *The prepared-receipt guard at Done is unproved.*
   `ad-hoc-prepared-landing-done` uses `keptAsDone`, which never reaches
   `keepManualLanding`'s preparation check (`dashboard/server/manualSessionLanding.ts`).
5. *Composed state production cannot store.* `aDoneBranch` and `keptAsDone`
   drop the captured `delivery`, so "a branch merged into trunk still retains
   its own Done comparison" (`ad-hoc-branch-attribution.spec.ts`) no longer has
   the landing it proved the comparison survives. `keptAsDone` and
   `keptAsDoneAfterRetirement` omit `dispositionChangedAt` and the session
   commit capture production writes for Default main launches.
6. *Test support imitates the adapter.* `keptAsDone`,
   `keptAsDoneAfterRetirement` (`dashboard/backend-tests/support/doneCaptureReview.ts`)
   and `twoDoneBranchesMergedByHand`'s `pinned` option write Done state by hand
   or switch setups, against the
   [North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support);
   findings 4 and 5 follow from them.
7. *Residue.* `aHeldDone` now holds after the whole capture, so
   `ad-hoc-branch-worktree-result`'s edit during the hold no longer proves the
   later reads use the snapshot, and `ad-hoc-branch-result-supersession.spec.ts`'s
   header still says "held in its ancestry read". The `sessionBranchPins`
   check after `deleteRecord` in `ad-hoc-manual-landing-revision-observation`
   can no longer fail. `doneTransition.ts` imports `hasBranchReview` from the
   Git capture module.

**Follow-up findings** (read-only review at `3c1bc448a`)

8. *The store dependency moved out of a helper and into its callers.* The
   exact phrase `await review(await keptRecords(source)` went from zero at
   `fd05ea2d2` (where `review(record)` loaded the store itself) to 43 calls
   across 19 backend specs at `0d1560004` and integration `2a7260d6d`. The
   current revision has 39 across 15 specs, or 55 including multiline calls
   and the file readers in the Review specs using `doneCaptureReview.ts`.
   Those Review specs call the three helpers 97 times in total, including
   calls with composed records. The completed plan records 75 to 79 cases
   in its 28-spec cohort, plus new transition and attribution specs outside
   that cohort. The split improved setup cost, but keeping the old
   assertion inventory made changes to Review's input ripple through tests
   about Done, delivery, expiry, and native reporting.
9. *Several scenarios exercise independent rules together.* The
   completion race specs reopen Review to inspect changes to saved commits.
   The manual-landing spec reasserts the same branch response and file
   rendering across different Git histories. The merged and amended
   two-run Review cases supply the pairs themselves, so those Git histories
   cannot catch a capture regression. This repetition coexists with the
   missing adapter and capture proof in findings 1–7.
10. *The Review read takes a wider input than it uses.* `reviewInput`
    resolves the catalog source and passes its kept list and subject.
    `keptSessionOf` then selects one host-qualified record and checks
    whether it is a story launch. Both session comparison and file
    admission use only that record. The project-wide list belongs at the
    lookup boundary. `namedKeptSession` already implements the shared
    lookup and unknown-session refusal. The store may still read its
    document internally. This is a contract and cohesion problem with no
    demonstrated user-visible regression.

**Preserved.** Done and Review behavior, including source and host admission,
story-launch and missing-session refusals, selected runs, literal retained
file pairs, Git capture and pins, and lifecycle races. The typed transition
and capture seams stay. The sibling stories own branch entry, the split of
observation and landing store access, and the launch preset fold.

## Current decisions

- Adapter- or capture-topic cases mark Done through `markDone` (or call
  `readSessionCommits`/`captureBranchResult` directly); test support writes no
  Done state by hand. Remove `keptAsDone`, `keptAsDoneAfterRetirement` and the
  `pinned` option.
- A composed branch result comes only from a capture without a delivery;
  `aDoneBranch` refuses a delivery so such a case fails loudly.
- Capture cases exercise real Git where Git's reflog, history, or objects
  establish the behavior. Adapter cases exercise the production write and
  assert the record or refs that write owns. Review cases compose retained
  evidence and vary comparison selection, unavailable reasons, and file
  admission independently of how Done or delivery produced it. Keep a
  cross-boundary read where reading is the proof of survivability.
  Keep the existing browser workflow in
  [recently-done-sessions-select-ad-hoc-review](../../../e2e/sessions/recently-done-sessions-select-ad-hoc-review.spec.ts)
  for selecting a Done session and opening its historical Review after
  cleanup.
- Resolve a standalone session once at the production admission boundary
  shared by comparison and file reads. Keep source and host selection and
  refusals there. Let the existing typed handlers consume the resulting
  record and their own request fields. Use MakeMe for inputs and remove
  the generic `review`, `fileText`, and `fileDiff` procedures as their
  callers disappear. Update the backend test reference for the delivered
  boundary. Follow the
  [Architectural North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  for the typed Dashboard boundaries.
- Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Ordered slices

### 1. Default main capture proof runs real Git again

Type: Structure
Status: planned

Before the first edit, record the execution baseline for case counts and
full Review reads across the affected backend specs. Use the union of
affected specs on each revision for the final comparison.

Add one real-Git `readSessionCommits` case over a history that rebases onto
pulled trunk, merges, amends and autosquashes, asserting its runs (finding 1).
Add one adapter case that marks Done with two sessions kept in one checkout
and asserts `sessionCommits.shared` (finding 2). Make the declared-branch
case assert what `readSessionCommits` captures on the entered record after
Default main moves (finding 3). Leave pair rendering with the Review cases.

**Proof.** Each new case fails in a scratch edit: a narrowed `replaying`
pattern, removing `shared` from `settleSessionCommits`, and ignoring
`entry.defaultTip`.

### 2. Adapter-topic cases mark Done through the adapter

Type: Structure
Status: planned

Return `ad-hoc-prepared-landing-done`, the declared publication specs and the
observation lifecycle case to `markDone`; remove `keptAsDone`,
`keptAsDoneAfterRetirement` and `twoDoneBranchesMergedByHand`'s `pinned`
option (findings 4–6). Make `aDoneBranch` refuse a captured delivery and mark
the merged-branch attribution case Done through the adapter (finding 5).

**Proof.** The real adapter retains the branch result and delivery together.
A scratch edit that removes the preparation check fails the prepared-landing
case. A delivery passed to `aDoneBranch` throws. Publication cases retain
their receipt and accepted-pair checks.

### 3. Capture residue

Type: Structure
Status: planned

Restore the worktree-snapshot proof with a hold between the workspace read and
the later reads (or state the narrowed proof), correct the supersession header,
drop the vacuous pin check, and move `hasBranchReview` out of the Git capture
module (finding 7).

**Proof.** `ad-hoc-branch-worktree-result`, `-supersession` and
`-revision-observation` pass; `doneTransition.ts` imports nothing from
`sessionBranchCapture.ts`; typecheck and lint pass.

### 4. Observe each lifecycle change at the operation that owns it

Type: Structure
Status: planned

In `ad-hoc-session-commits-done`, assert the saved Done timestamp, run or
failure marker alongside the native rename, reopen and retry signals. Keep
intermediate observations that establish ordering. In branch supersession
and delivery-observation lifecycle cases, assert which session, branch
evidence, delivery, and pins survive. Keep one restart-to-offline review
in `ad-hoc-manual-landing-observation` for the two independently readable
pairs, and the Default main read after pruning in `done-kept-session-commits`.
Remove repeated Review checks whose distinguishing outcome is already
asserted through persisted state or the retained Review proof. Leave the
observation algorithm and its store wiring to plan 736.

**Proof.** The lifecycle cases still distinguish a stale capture winning,
a failed capture running again, or a removed session retaining a delivery
pin. The retained workflow reads still distinguish missing Git evidence
after retirement or pruning. The lifecycle specs issue fewer comparison
and file reads before any change to their signatures.

### 5. Retire cases that retest the same Review behavior

Type: Structure
Status: planned

Keep the first `done-kept-session-commit-runs` case for ordered selection of
two distinct retained pairs and exact diff isolation. Retire its merge and
amended-merge variants behind the corresponding
`done-session-commit-attribution` rules and slice 1's real reflog witness.
Retire the published-rebase reads in `done-kept-session-rebased-runs` once
the resulting pairs are proved by typed attribution and the real Git bridge,
including any distinct fetch-and-rebase behavior. Keep one composed empty
run answer and one failed capture answer, with the uncommitted-edit case
checking what capture actually returns.

In `ad-hoc-manual-landing`, retain separate evidence for exact
fast-forward, an unwitnessed parent, a same-content squash, and trunk
target authority where each catches a distinct failure. Assert those facts
from `inspectManualLanding` or `captureBranchResult`, depending on which
reads the target or decides the pair. Retire the unrelated-trunk case if
the same-content squash proves the same rejection of a tip absent from
trunk's ancestry and additionally rules out accepting tree equality.
The verified manual merge keeps proof of its trunk parent and actual
conflict resolution. Prove delivered
versus branch-result selection and literal file-pair admission from
composed records once per rule. Use the existing
`kept-session-commits-review` and `ad-hoc-review-file` cases for the run-pair
and file checks they already own.

**Proof.** For each deleted case, cite the surviving assertion that fails
for the same regression. Establish any replacement proof before deleting
the original. Count executed cases across the same affected spec roster
before and after, including added or moved cases. Require a net reduction
as well as fewer full Review reads. Use the counts as evidence under
[ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

### 6. Pass the selected session to the typed Review handlers

Type: Structure
Status: planned

Move kept-session lookup and story-launch refusal to the shared production
admission boundary in `storyReviewInput.ts`, reusing the existing
host-qualified lookup. Feed the session record and relevant read fields
to the existing comparison, file diff, and file text paths. Keep the story
read flow and route contracts. Update the MakeMe read builder and migrate
the remaining callers to the production entry points. Remove the generic
read wrappers in `doneCaptureReview.ts` and the obsolete record-list input.

**Proof.** The wire or admission cases prove unknown source, unknown
session, host qualification, and story-launch refusal at their owner.
The typed comparison and file cases pass with composed records and no
machine-store setup. Recheck the case and Review-read counts including
direct handler calls after migration. Catch a case moved behind a helper
or to another spec in the same accounting.

At handoff, reconcile plan 736's references to composed Review and
`doneCaptureReview.ts` with the delivered typed entry and surviving case
owners. The observation decision and persistence races remain in plan 736.

## Local gates

- On AC power, run tests under `caffeinate -s -i` with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`, as
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes: `npm run --silent test:dashboard:backend -- <specs>`, then
  `npm run typecheck:dashboard` and `npm run lint`, never concurrently. Keep
  default timeouts; never `test.slow()`.
