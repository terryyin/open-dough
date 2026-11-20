# Restore Done capture proof after the composed review move

**Identity:** SEED-413#restore-done-capture-proof-after-composed-reviews
**Source:** [Restore Done capture proof after the composed review move](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#restore-done-capture-proof-after-composed-reviews)

## Correction input

**Provenance.** Retrospective of
[SEED-413#split-done-mark-decision-from-store](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#split-done-mark-decision-from-store)
(plan 734), reviewed over `fd05ea2d2..0d1560004` (commits `f5e3a956d`,
`39e8ac4b3`, `a60e32a59`, `93cc82cf7`, `1d657edf1`, `53e4fb525`,
`0d1560004`). Its source promised: "Keep Done marking as the topic only in
specs that prove the capture, the transition rules … or the adapter's
persistence", "keep one real-Git case for the reflog read", and "Every
replaced case keeps its assertions." No production regression was found.

**Current findings** (read-only review at `0d1560004`):

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

**Preserved.** Production Done behavior; the typed transition, capture
collaborator and attribution seams; composed review cases whose topic is the
review; branch entry, observation and landing store reads and the launch
preset fold stay with their own stories.

## Current decisions

- Adapter- or capture-topic cases mark Done through `markDone` (or call
  `readSessionCommits`/`captureBranchResult` directly); test support writes no
  Done state by hand. Remove `keptAsDone`, `keptAsDoneAfterRetirement` and the
  `pinned` option.
- A composed branch result comes only from a capture without a delivery;
  `aDoneBranch` refuses a delivery so such a case fails loudly.
- Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Ordered slices

### 1. Default main capture proof runs real Git again

Type: Structure
Status: planned

Add one real-Git `readSessionCommits` case over a history that rebases onto
pulled trunk, merges, amends and autosquashes, asserting its runs (finding 1).
Add one adapter case that marks Done with two sessions kept in one checkout
and asserts `sessionCommits.shared` (finding 2). Make the declared-branch
review case take its runs from `readSessionCommits` on the entered record
after the Default main moves (finding 3).

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

**Proof.** The specs keep their assertions; a scratch edit that removes the
preparation check fails the prepared-landing case; a delivery passed to
`aDoneBranch` throws.

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

## Local gates

- On AC power, run tests under `caffeinate -s -i` with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`, as
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  describes: `npm run --silent test:dashboard:backend -- <specs>`, then
  `npm run typecheck:dashboard` and `npm run lint`, never concurrently. Keep
  default timeouts; never `test.slow()`.
