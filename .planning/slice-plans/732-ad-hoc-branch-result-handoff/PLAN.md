# Prove the ad hoc branch result and its handoff at typed Done seams

**Identity:** SEED-413#ad-hoc-branch-result-handoff
**Source:** [Prove the ad hoc branch result and its handoff at typed Done seams](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#ad-hoc-branch-result-handoff)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Move eight of the nine cases of
`review/ad-hoc-branch-result-race.spec.ts` (two of its three),
`ad-hoc-branch-worktree-result.spec.ts`,
`ad-hoc-session-branch-handoff.spec.ts` and
`ad-hoc-branch-cursor-recovery.spec.ts` under `dashboard/backend-tests/` to
plain Node Vitest. Each case calls the production functions directly with
MakeMe kept records and real Git, as the Done capture family does through
[`doneCaptureCase.ts`](../../../dashboard/backend-tests/support/doneCaptureCase.ts).
Follow [Which entry a case uses](../../../dashboard/backend-tests/README.md#which-entry-a-case-uses).
Drop `ad-hoc-branch-result-quiet-retry.spec.ts`.

Exclusions:

- "A newer quiet Done takes precedence over a manual mark still capturing
  its branch" stays on Playwright in `ad-hoc-branch-result-race.spec.ts`,
  owned by `SEED-413#renovate-later-dashboard-backend-unit-test-families`.
- The launch-input wiring case of `ad-hoc-session-branch-handoff.spec.ts`
  stays on Playwright under the same parent story. It is the only case that
  runs the generated branch handoff command.
- The observation and publication cases belong to
  `SEED-413#arrange-done-ad-hoc-observation-and-publication`.
- The Done lifecycle belongs to `SEED-413#ad-hoc-done-lifecycle`.
- `adHocReview.ts` retirement waits for those stories.

## Key examples and proof

| Example | Observable signal |
| --- | --- |
| A newer Done wins | An isolated launch commits `stale` and is marked Done while its ancestry read is held. During the hold, `review` answers `unavailable`. The branch then commits `latest` and is marked Done again. After release, `review` answers `branch-result` at `latest`. The session's `refs/open-dough/session-branch/claude/<id>/` pins are the baseline and `latest`, without `stale`. |
| Cursor replacement | A Cursor launch's branch result pins under chat `A`. `replaceKeptSession` installs chat `B` and `bindRecord` binds it. `deleteRecord` of `B` leaves no `refs/open-dough/session-branch/cursor/A/` pins. Another launch's pins remain. |
| Undeclared move | A Default main launch switches to `not-identified`, commits there and is marked Done. `review` answers `landing-unavailable` with "No branch was identified for this session, and no Default main commits were captured." |

## Current decisions

- **Held capture.** `readBranchResult` in
  [`sessionBranchCapture.ts`](../../../dashboard/server/sessionBranchCapture.ts)
  reads the workspace, then runs `git merge-base --is-ancestor` before the
  store write. This is the only wait between them. Give that read a typed
  collaborator that defaults to `runGit`, as `checkAncestry(…, read = runGit)`
  in `gitRunner.ts` does. Thread it through `withBranchResultAtDone` and an
  option of `setRecordDoneAt`. A case passes
  `(args, call) => held.then(() => runGit(args, call))`. Production callers
  pass nothing. No `PATH` shim and no new test support.
- **Arrangement.** Use `aCheckout`, `anIsolatedLaunch`, `aDefaultLaunch`,
  `keep`, `work`, `inWorktree`, `markDone`, `undoDone`, `review`, `fileText`
  and `fileDiff` from `doneCaptureCase.ts`. For Cursor records, use
  `makeMe.aLaunchRecord…inCursorSession({ sessionId, continuation: { workspace } })`.
  For a declared branch, use `recordSessionBranchEntry`, as
  [`ad-hoc-branch-entry-attribution.spec.ts`](../../../dashboard/backend-tests/review/ad-hoc-branch-entry-attribution.spec.ts)
  does. Arrange expiry as the `removals` table of
  [`ad-hoc-branch-result.spec.ts`](../../../dashboard/backend-tests/review/ad-hoc-branch-result.spec.ts)
  does. Read pins with `git for-each-ref` on the host's prefix in the spec.
  `sessionBranchPins` hard-codes `claude`.
- **What each topic keeps.** The reporting CLI is a precondition in every
  case except one. The command's instruction text is proven by
  `reportingInputAssertions.ts` consumers. The exception is the launch-input
  wiring: the branch handoff command a launch's input names reaches the
  receiver and declares that branch. The
  [arrange-done plan](../730-arrange-done-ad-hoc-observation-and-publication/PLAN.md)
  names this spec as that wiring's owner while it moves
  `agent-launch-session-branch-landing.spec.ts`. The command is an inline
  `node -e` script built in `reportingInstruction.ts` that posts over HTTP,
  so no typed entry reaches it in process. Slice 3 therefore keeps one
  Playwright case, "the launch command binds the original checkout's own
  branch", which runs that command, as the wiring owner. Its other facts
  move to Vitest. The parent story moves that case with the remaining server
  cases. Keep each case's unique facts:
  - entry state and default tip;
  - the same answer after main moves;
  - each refusal, with status 409;
  - Done's `branch-result` and run `0`;
  - the delayed-validation exclusion;
  - the index, HEAD and files left untouched;
  - pins surviving a forced retirement;
  - pin ownership after a Cursor replacement.
  "Deletion releases only that session's pins" for a Claude branch is
  already owned by `ad-hoc-branch-result.spec.ts`. Do not repeat it.
- **Quiet retry.** An applied duplicate returns at the top of
  `deliverCompletion` (`completionDelivery.ts`), before any capture.
  `sessions/agent-completion-identity.spec.ts` proves that it writes nothing.
  Delete the quiet-retry spec without a replacement.
- **Spec files.** Replace each Playwright file with a Vitest file of the same
  name. Exception: the race file keeps its Playwright precedence case until
  the parent story moves it. Its two moved cases go to
  `ad-hoc-branch-result-supersession.spec.ts`.
- **Test-support retirement.** These specs are the only consumers of
  `dashboard/test-support/support/cursorBranchRecovery.ts`; delete it in
  slice 4. `branchResultValidation.ts`, `launchIsolatedReview` and
  `sessionBranchPins` keep consumers in other stories. After each slice, grep
  `dashboard`, `e2e` and `Distribution` for every module the removed spec
  imported, and delete any export left without a consumer.

## Decisive premises

| Consuming operation | Observation |
| --- | --- |
| In one Vitest process, a held capture leaves the review unavailable and a newer Done wins with only its pins, and the case discriminates | Scratch at `5eae84032` in this workspace, since reverted: a Vitest spec under `review/` with `aCheckout` plus an `anIsolatedLaunch` worktree. It held `merge-base --is-ancestor` with a `PATH` shim, a proxy for the same call the typed collaborator will wrap. Ran `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- review/zz-scratch-race`. While held, `review` read `unavailable`. After release it read `branch-result` at `latest`. Passed in 1.6 s. With the supersession guard in `recordDoneAt.ts` disabled, the case failed with the tree at `stale`. The collaborator holds the same call at the same point, so the proxy cannot change the outcome. |
| `replaceKeptSession`, `bindRecord` and `deleteRecord` keep and release a Cursor branch's pins under the original chat without a server, runner or attempt store | Scratch at `5eae84032`, since reverted, run as `… -- review/zz-scratch-cursor`. `markDone` pinned `refs/open-dough/session-branch/cursor/<A>/…/{base,revision}`. `replaceKeptSession` installed chat `B`. `bindRecord` answered `undefined`, since the record has no reporting context. `deleteRecord(B)` left no pins under `A`. Passed in 681 ms. |
| `recordSessionBranchEntry` runs in Vitest on a kept Default main launch with a real worktree | `npm run --silent test:dashboard:backend -- review/ad-hoc-branch-entry-attribution` at `5eae84032`: 2 passed in 2.51 s. |

## Ordered slices

### 1. A held Done capture is superseded by a newer Done in a typed case

Type: Structure
Status: done

Add the ancestry-read collaborator. Write
`ad-hoc-branch-result-supersession.spec.ts`, which covers:

- reopening keeps the branch evidence and refuses the old file pair;
- a held stale Done reads unavailable, and the newer Done wins with only its
  pins;
- deleting a record while its capture is held leaves no pins.

Remove those two cases from the Playwright race file.

Accepted proof: the new spec passes 3 cases; the guard-disabled scratch fails
the newer-Done case at the tree, and `keepBranchResultRefs` before the write
fails the deletion case with 2 pins. `review/ad-hoc-branch-result`,
`review/ad-hoc-branch-attribution`, the remaining Playwright race case,
typecheck and lint pass. Learning for slice 2: the held read is the spec-local
`aHeldDone`; if slice 2 needs it too, share it from `doneCaptureCase.ts`, not
Dashboard Test Support.

| Promise | Slice 1 proof |
| --- | --- |
| Newer Done wins; deletion during capture | The new spec passes with every signal in its rows. |
| The case discriminates | With the supersession guard in `recordDoneAt.ts` disabled in a scratch edit, the newer-Done case fails at `stale`. With `keepBranchResultRefs` moved before the record write in `withBranchResultAtDone`, the deletion case fails on a left pin. Both pass once reverted. |
| Production unchanged | `review/ad-hoc-branch-result`, `review/ad-hoc-branch-attribution` and the remaining Playwright race case pass. |

### 2. Done keeps the working tree it read, and a held capture excludes a later edit

Type: Structure
Status: done

Rewrite `ad-hoc-branch-worktree-result.spec.ts` on Vitest. Arrange staged,
untracked, deleted and ignored files with `makeMe.aCheckoutWork`, or with
plain Git where no step exists. Edit during the held ancestry read. Drop the
rename-wait environment and the native rename, since capture finishes before
any native Done.

| Promise | Slice 2 proof |
| --- | --- |
| Working-tree result | The case passes. The index, HEAD and file contents are unchanged after Done. The result lists staged, untracked and deleted files but not ignored files. The held edit is absent. The pins are `[baseline, tree, committedTip]`. The review survives `retireAdHocBranch`. |
| The case discriminates | In a scratch edit, reading the tree after the ancestry check makes the case fail on the held edit. It passes once reverted. |

Accepted proof: the Vitest case passes with every row's signal, and the
scratch read-after-ancestry fails it on the held edit. `aHeldDone` now lives in
`doneCaptureCase.ts`, and `historyBeforeTheCase` takes base `files`. Learning
for slice 4: the isolated-launch setup (checkout with origin, worktree check,
`anIsolatedLaunch`, `keep`) repeats in three specs; decide there whether it
belongs in `doneCaptureCase.ts`, which is near 250 lines.

### 3. A declared branch's handoff is proven at `recordSessionBranchEntry`

Type: Structure
Status: done

Move the handoff cases to a Vitest `ad-hoc-session-branch-entry.spec.ts`,
with the unique facts listed in Current decisions. Leave only the
launch-input wiring case in the Playwright `ad-hoc-session-branch-handoff.spec.ts`.

| Promise | Slice 3 proof |
| --- | --- |
| Handoff examples | All five cases pass, including the undeclared-move explanation and each 409 refusal. |
| Launch-input wiring keeps its owner | The Playwright file keeps only the wiring case, which still passes. The Vitest file holds the entry-state, repeated-entry and Done facts. |
| The cases discriminate | Each in a scratch edit: `verifyRegisteredWorkspace` always passing together with the checkout guard in `readBranchWorkspace` removed fails the refusal case; `existingEntry` returning `undefined` fails the repeated-entry assertion; `branchEntryMissing` never set fails the undeclared case. All pass once reverted. |

Accepted proof: the five Vitest cases and the remaining Playwright wiring case
pass. Each scratch break fails its case. Learning: `readBranchWorkspace`
already refuses a foreign clone and a wrong branch, so `verifyRegisteredWorkspace`
alone breaks nothing observable; the refusal discriminates only with both
guards broken. Done-capture cases need `historyBeforeTheCase()` so the base
commit stays outside the session's reflog window.

### 4. Branch pins follow the original Cursor chat through replacement

Type: Structure
Status: done

Rewrite `ad-hoc-branch-cursor-recovery.spec.ts` on Vitest. It covers deletion
and expiry of the replacement with another launch's pins kept, and the stale
native replacement after a pending entry. Delete `cursorBranchRecovery.ts`.

| Promise | Slice 4 proof |
| --- | --- |
| Cursor example | All three cases pass. |
| The cases discriminate | With `branchEvidenceOwner` dropped from `replaceKeptSession` in a scratch edit, the deletion case fails on a left pin under `A`. It passes once reverted. |
| No orphan | `grep -rn cursorBranchRecovery dashboard e2e Distribution` lists nothing. |

Accepted proof: three Vitest cases pass. Without `branchEvidenceOwner`, both
removal cases fail at the first check that A's pins hold `latest`, the same
ownership fact earlier than planned. The kept session's review read in
`doneCaptureCase.ts` now names the record's own host through
`aSessionReviewRead.ofSession(id, host)`. The 15 `doneCaptureCase.ts` consumer specs pass
(51 tests). Coordination boundary: `ad-hoc-manual-landing.spec.ts:57` timed
out once at 5 s under load about 9 and ran 3.9 s at load 5 to 9. The active
`SEED-413#arrange-done-ad-hoc-observation-and-publication` branch rewrites that
spec and `doneCaptureCase.ts`, adding `anIsolatedBranch` and
`historyBeforeTheCase(files)`. Reconcile both files with it when either lands.

### 5. The family leaves Playwright with its retired support

Type: Structure
Status: planned

Delete `ad-hoc-branch-result-quiet-retry.spec.ts`. Recheck test-support
consumers and delete orphaned exports. Name the moved specs in the ad hoc
review paragraph of `dashboard/backend-tests/README.md`.

| Promise | Slice 5 proof |
| --- | --- |
| No orphan, gates pass | The test-support grep finds no export without a consumer. `npm run typecheck:dashboard` and `npm run lint` pass. `npm run --silent test:dashboard:backend -- review/ad-hoc-branch review/ad-hoc-session-branch sessions/agent-completion-identity` passes. |
| Focused speed | Run the old selection at `5eae84032` and the new one at the candidate: three interleaved warm runs each of `npm run --silent test:dashboard:backend -- <the five specs> --workers=2`. Record median command time and load in this plan. |

## Local gates

Apply [Dough MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) before
test edits. Run focused selections with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- <selection>`,
and run `npm run typecheck:dashboard` and `npm run lint`. On AC power, run
them under `caffeinate -s -i`, as
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
describes. Follow the
[shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Keep default test timeouts. The full backend group runs in CI after
publication. No shared fixture changes, so no broader local suite is needed.

## Plan review

Slice-plan refinement was not needed. The plan has five Structure slices,
each one spec with one proof loop. Slice 1 alone changes production code,
adding one optional collaborator. The premises above were observed in
scratch. This review found no remaining slice-specific concern.
