# Keep closure reruns truthful and closure proof exact

## Source and authority

- **Identity:** SEED-008#closure-proof-and-harness-correction.
- **Source:** [correction story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#closure-proof-and-harness-correction),
  from the execution retrospective of
  plan 146 (recoverable at
  `097cc35f:.planning/slice-plans/146-installed-wrap-up-command/PLAN.md`)
  (SEED-008#installed-wrap-up-command) on 2026-09-29.
- **Provenance:** reviewed commits on `claude/installed-wrap-up-command`:
  `aa4fd510`, `de81cb96`, `1d227845`, `9c672fc9`, `b269991d`, `8c75f730`,
  `834a4a66`, `9df5455f`, `b590083f`, `3ca0b8f9`, `809b407d`, `ee77d3b6`.
  Findings below were re-observed at `ee77d3b6`.
- **Authority:** planning only, delegated by the executing agent of plan 146's
  retrospective. It grants no Take, queue change, implementation, or
  publication. The correction is not queued.
- **Preparation workspace:** the owned execution checkout
  `.worktrees/installed-wrap-up-command` (branch
  `claude/installed-wrap-up-command`, HEAD `ee77d3b6`), supplied by the
  invoking execution, whose coordinator commits this plan.

## Outcome and boundaries

An agent rerunning `trunk-closure.mjs finish` after its final closure was
rebased and published gets that closure recognized, completed, and retired
instead of a false stop. Each closure test, native harness check, and native
evidence identity proves exactly what it names: the confirmed-shutdown gate has
its own test, each closure behavior is owned by one test, the harness judges
responses by trunk-CI failure only and keeps its shims on every closure
fixture, and changing a module a journey runs makes its recorded native
evidence stale.

Key examples:

1. `finish` rebased and published the final closure, then was interrupted →
   the agent reruns the same command with the original `--final` → nothing is
   pushed again, completion runs for the rebased accepted SHA, and the
   worktree and branch are retired.
2. The same rerun after the worktree and branch were already retired, with
   `--repository` → cleanup is reported `already-absent`, not a `context` stop
   that claims the final closure is unpublished.
3. A success receipt whose observer shutdown is retained or unconfirmed →
   `finish` stops at `step: "completion"` and the worktree and branch stay.
4. Cursor's accepted Story Branch response, which mentions a failed push beside
   a trunk CI success, is judged a trunk success; a response reporting trunk CI
   failed or unavailable still is not.
5. A module `trunk-closure.mjs` imports changes → the trunk-closure evidence
   identity changes.

Preserved promises and constraints:

- Every plan 146 promise and its accepted proof stays: both closure
  publications, retirement only after a confirmed-shutdown receipt, no second
  push of an accepted closure, never force, one JSON line with exit 1/2.
- No new feature promise. `finish` keeps its flags; the rerun rule in
  `wrap-up-closure-publication.md` "Finish Trunk Mode closure" becomes true
  rather than changing.
- Edit sources only in `src/skills/` and `tests/`; never installed copies
  ([AGENTS.md](../../../AGENTS.md)). Guidance addresses the executing agent
  ([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md));
  when removing prose, add no "no longer" wording.
- Recorded native evidence is invalidated, never renewed, by changed inputs
  ([ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) §5).
  No paid native run belongs to this correction.
- Files stay at most 250 lines.

Excluded (separate decisions for Terry):

- **D1:** `install.sh` is at 250 lines; splitting its payload declaration is a
  maintainer decision. This correction adds no payload file.
- **D2:** `--created-for-work` guidance clarity (Cursor passed it without a
  recorded basis in plan 146 slice 8, harmlessly).
- **D3:** consolidating the older `isAncestor` copies in
  `publication-resume.mjs:14`, `maintain-default-checkout.mjs:15`,
  `history-preserving-publication.mjs:31`, and `ci-path-applicability.mjs:45`
  (execute-plan); only Land's and wrap-up's are corrected here.
- Native acceptance of the journeys whose identities change here belongs to
  whoever next needs that evidence; this plan promises no paid run.

## Current findings

1. **F1: the confirmed-shutdown gate has no distinguishing test.**
   `receiptPermitsRetirement` (`trunk-closure.mjs:56-61`) retires only on a
   non-failure verdict with confirmed shutdown. The only non-retiring receipt
   test (`trunk-closure.test.mjs:187`) uses a failure verdict, so dropping the
   shutdown condition passes every test.
2. **F2: rerun after a rebased publication stops falsely.** After `finish`
   rebases and publishes, the branch tip is the rebased SHA and the original
   `--final` is not on the target. `settleFinalClosure`
   (`trunk-closure-settlement.mjs:135`) then either publishes again with
   `validatedCandidate: final` against a different tip (worktree present:
   delivery `candidate-mismatch`, whose recovery tells the agent to commit or
   rename) or stops `context` with "report the unpublished final closure"
   (worktree gone), which is false. `wrap-up-closure-publication.md:69-76`
   promises the rerun continues.
3. **F3: dead exports and a duplicate `isAncestor`.**
   `worktree-retirement.mjs:27-35` re-exports `canonical`, `findWorktree`, and
   `isAncestor` and exports `trunkTarget`; nothing outside Land uses the first
   two or the last. `trunk-closure.mjs:24-27` and
   `trunk-closure-settlement.mjs:19` import the generic `isAncestor` from
   Land's CLI module. `retirement-checks.mjs:31` defines its own `isAncestor`
   while it already imports from `workspace-publication-ownership.mjs`, which
   exports one (`:50`).
4. **F4: overlapping and misplaced closure tests.**
   `closure-story-branch-cleanup.test.mjs:44` repeats the racing integration of
   `closure-story-integration.test.mjs:43` and retirement cases of
   `worktree-retirement.test.mjs` (unrecorded ownership, already-absent rerun);
   `:176` (target branch refused as remote branch) is a pure `retire` option
   case. `closure-story-branch-named-remote.test.mjs` repeats named-remote
   retirement from `dough-land-remote-context.test.mjs:141`, adding only the
   remote-branch deletion and history-preserving integration on that remote.
   `dough-land-rerun.test.mjs:201` repeats `worktree-retirement.test.mjs:78`
   except for its partial case (worktree already removed, branch still there).
   `closure-admitted-work-fixtures.mjs:62` calls `publishExecutionIncrement`
   with a hand-copied validate policy and never reaches `finish`.
5. **F5: the Story Branch response check rejects unrelated failures.**
   `story_closure_response_trunk_result`
   (`story-branch-closure-native-assess.sh:32-41`) rejects any line holding a
   trunk, CI, coverage, receipt, verdict, observer, or watcher word plus
   "failed". Cursor's correct response, one line holding "The push failed due
   to zsh colon modifiers" beside trunk and observer words and a trunk CI
   success, was rejected; Terry accepted that run on transcript judgment.
6. **F6: the login-shell PATH repair reaches one fixture.**
   `native-harness-login-shell.sh` is sourced and applied only by
   `story-branch-closure-native-fixture.sh:18-20,118,170`. The trunk-closure
   fixture (and its owned-context scenario) installs the same `harness/bin/gh`
   shim (`trunk-closure-native-fixture.sh:130`), so a Codex or Cursor agent
   that arms an observer from its login shell would reach the real `gh`.
7. **F7: evidence identities omit what the journeys run.** The trunk-closure
   identity lists `trunk-closure.mjs` and its settlement module but not their
   imports (`execution-increment-delivery.mjs`,
   `execution-increment-publication.mjs`, `publication-resume.mjs`,
   `ci-mailbox-complete.mjs`, `ci-mailbox-match.mjs`,
   `maintain-default-checkout.mjs`) nor `publish-the-candidate.md`, which the
   before-cleanup `deliver` follows. The Story Branch identity omits
   `publish-the-candidate.md` and the backlog merge adapter
   `product-backlog-git-merge.mjs` it names. The owned-context identity omits
   `preparation-assignment.mjs`, the command `preparation-assignment.md` names.

## Existing solutions (PFE)

- **Recognizing a rebased closure:** `resumeInterruptedPublication`
  (`publication-resume.mjs`) already takes the rewritten SHA as
  `candidateSha` and pre-rebase identities as `supersededShas`, never pushing
  them (`:61-75,125`). Slice 1 calls it with the recognized rebased SHA and
  `supersededShas: [final]`. `closureMailbox` and `listRegisteredRevisions`
  already list what matching observers registered; delivery registers the
  rebased receipt SHA (`execution-increment-delivery.mjs:156`).
- **One `isAncestor`:** `workspace-publication-ownership.mjs:50`, already
  imported by `retirement-checks.mjs` for `createdForRoot`.
- **Retirement option cases:** `worktree-retirement.test.mjs` with
  `runRetirementCommand` (`dough-land-test-fixtures.mjs`).
- **Login-shell repair:** `native_harness_keep_login_path` and
  `native_harness_release_login_path`; the shared place every closure fixture
  already enters is `native_harness_observe_node` / `native_harness_restore`
  (`native-harness-observation.sh`).
- **Identity hashing:** `native_result_input_hash_lines`
  (`native-result-identity.sh:9`) and `git_publication_land_input_hash_lines`.
  No relative-import closure helper exists (searched `tests/support`,
  `tests/helpers`, `scripts`); slice 4 adds one small Node helper.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| F1: no test distinguishes the shutdown condition | `grep -n "verdict\|shutdown\|step" trunk-closure.test.mjs` | Only `:187` stops at `completion`, with verdict `failure` and shutdown `retained` |
| A success receipt with non-confirmed shutdown is producible | `ci-mailbox-complete.mjs:121-150` read | Success verdict gets `retained` with `unread_actionable_failure` when an unread CI failure event remains, or `unconfirmed` when the stop fails or the worker lives (`ci-mailbox-complete-unresolved-cases.mjs:180-199`); the fixture's `releaseCi` sets per-SHA verdicts |
| F2: rerun with the original `--final` misfires | `trunk-closure-settlement.mjs:131-149`, `trunk-closure.mjs:83-121`, `trunk-closure-resume.test.mjs:203-245` read | Not an ancestor → worktree present calls delivery with `validatedCandidate: final` although the tip is the rebased SHA; worktree absent → `context` "unpublished". No test reruns after a rebase |
| Delivery rebases with `git rebase`, which keeps author, author date, and message | `owned-suffix-reconciliation.mjs:68`; scratch repository (Git 2.50.1): rebased one commit onto a moved `main` after a one-second pause and compared `%an|%ae|%at|%B` | Identical before and after, so these fields identify a rebased final closure |
| A rerun test can create the rebased state without killing a process | `trunk-closure-resume.test.mjs:36-52` (`acceptBothClosures` delivers the final through `deliverThroughCli`) and `advanceOriginFromAnotherWriter` | Advance origin, deliver the final through `deliver` (which rebases and registers), then run `finish` with the original `--final` |
| F3: exports are dead and `isAncestor` duplicated | `grep -rn` for each export across `src` and `tests` | `canonical`, `findWorktree`, `trunkTarget` used only inside Land's two modules (`trunkTarget` as the `targetRef` default at `:47`); `isAncestor` and `preserved` imported by `dough-land-test-fixtures.mjs:18-21`, `notCreatedForWork` by `closure-story-branch-cleanup.test.mjs:10`; `isAncestor` defined at `retirement-checks.mjs:31` and `workspace-publication-ownership.mjs:50` |
| F4: overlaps are as described, and two cases are unique | Test bodies read | Cleanup `:44` repeats integration and ownership/rerun cases; named-remote uniquely proves remote-branch deletion and history-preserving integration on a named remote; Land rerun `:201` uniquely proves the partial rerun (worktree gone, branch removed) |
| `history-preserving-publication.mjs` is not something a journey runs | `grep -rln history-preserving-publication src tests install.sh`; `grep -c isDirectCliEntry` | Declared in `install.sh`, imported only by wrap-up tests, no CLI; Story Branch integration stays agent-driven (plan 146 exclusion) |
| F5: the check rejects Cursor's sentence shape | `story-branch-closure-native-assess.sh:32-41,229-247` read | Any matched word plus "failed" on one line rejects; counterexamples hold no unrelated failure beside trunk words |
| F6: repair sourced only by the Story Branch fixture | `grep -rn "native-harness-login-shell\|keep_login_path" tests` | Story Branch fixture and runner only; trunk-closure fixture installs `bin/gh` at `:130` |
| F7: identities omit imports and linked guidance | `trunk-closure-native-run.sh:15-43`, `story-branch-closure-native-run.sh:67-91`, `git-publication-native-evidence.sh:5-43` read | As in finding 7; the owned-context identity already includes `publish-the-candidate.md` through the `publication` identity, so only `preparation-assignment.mjs` is missing there |
| Proof commands run credential-free and green now | `PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh` and `bash tests/native-evidence-identity.sh` at `ee77d3b6`, 2026-09-29 | Both exit 0 (62 s and 5 s) |
| Size headroom | `wc -l` | `trunk-closure.mjs` 246, `trunk-closure.test.mjs` 242, `trunk-closure-resume.test.mjs` 245, `story-branch-closure-native-assess.sh` 248, settlement 149, `worktree-retirement.test.mjs` 151 |

## Slices

### 1. A rebased final closure resumes on rerun, and only a confirmed receipt retires
Type: Behavior
Status: pending
Proof: child-process `finish` tests for the rebased rerun (worktree present, and after retirement) and for a success receipt without confirmed shutdown.

Behavior: `finish` was interrupted after it rebased and published the final
closure → the agent reruns with the original `--final` → `finish` recognizes
the accepted rebased closure: a SHA the fetched target contains, taken from
the branch tip when the branch exists, else from the revisions the matching
observers registered, whose author, author date, and message equal
`--final`'s. It then resumes through `resumeInterruptedPublication` with that
SHA as the candidate and `--final` as superseded, pushing nothing, completes on
the covering observer, and retires (example 1). After retirement the same rerun
with `--repository` reports cleanup `already-absent` (example 2). When no
accepted closure is recognized and the worktree is gone, the `context` stop's
recovery names both possibilities: rerun with the `acceptedSha` an earlier
result reported, or report the unpublished final closure. A success receipt
with retained or unconfirmed shutdown stops at `completion` with the worktree
and branch kept (example 3).

Keep the recognition in `trunk-closure-settlement.mjs`; `trunk-closure.mjs`
stays under 250 lines. Adjust the `step: "context"` row in
`wrap-up-closure-publication.md` only if its wording no longer matches.

Proof: new `trunk-closure-rebased-rerun.test.mjs` (the resume file is at 245
lines): advance origin, deliver the final closure through `deliver` so it is
rebased and registered, rerun `finish` with the original `--final` → zero
pushes, `acceptedSha` is the rebased SHA, completion on it, retired; then rerun
from `--repository` → `already-absent`. Parameterize
`trunk-closure.test.mjs:187` over a failure receipt and a success receipt with
retained shutdown (an earlier SHA's unread CI failure), each asserting
`step: "completion"` and worktree and branch kept. The new rerun test fails
against `ee77d3b6`; the parameterized case fails if the shutdown condition is
removed. Wrap-up closure suites stay green.

### 2. Closure scripts share one `isAncestor`, and each closure behavior has one owning test
Type: Structure
Status: pending
Proof: wrap-up, Land, and preparation-landing suites green; each deleted or moved test names its surviving owner below.

Correction: F3 and F4. Remove the dead `canonical`, `findWorktree`, and
`trunkTarget` exports and the `isAncestor` re-export from
`worktree-retirement.mjs`; `retirement-checks.mjs` drops its own `isAncestor`,
and it, wrap-up's two scripts, and `dough-land-test-fixtures.mjs` import the
one from `workspace-publication-ownership.mjs`.

Tests:

- Move the target-branch refusal (`closure-story-branch-cleanup.test.mjs:176`),
  the named-remote remote-branch deletion and its rerun, and the partial rerun
  (`dough-land-rerun.test.mjs:201`: worktree gone, branch still removed) into
  `worktree-retirement.test.mjs` as parameterized `retire` cases.
- Keep one Story Branch journey test (`closure-story-branch-cleanup.test.mjs`)
  that integrates and retires with `--remote-branch` and `--contained`,
  asserting only its distinguishing outcomes: the remote execution branch
  removed, other worktrees and the integration checkout untouched. Drop its
  repeated racing-integration, unrecorded-ownership, and rerun assertions,
  owned by `closure-story-integration.test.mjs:43` and
  `worktree-retirement.test.mjs`.
- Move the named-remote history-preserving integration into
  `closure-story-integration.test.mjs` as a remote/target parameter of an
  existing case, then delete `closure-story-branch-named-remote.test.mjs`;
  named-remote Land retirement stays owned by
  `dough-land-remote-context.test.mjs:141`.
- Delete `dough-land-rerun.test.mjs:201` after its partial case moves.
- `closeInTrunkMode` (`closure-admitted-work-fixtures.mjs:62`) closes through
  `deliver` and `finish` as child processes, as `trunk-closure-test-fixtures.mjs`
  does; if the admitted-work fixture cannot supply an observer cheaply, move
  the admitted-work closure cases beside the backlog completion tests instead,
  keeping their Taken, profile, and plan assertions. Decide at execution by
  which keeps files under 250 lines; record the choice.

Proof: `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh` on wrap-up
`closure-*.test.mjs`, `trunk-closure*.test.mjs`, Land's
`worktree-retirement.test.mjs`, `dough-land*.test.mjs`, and
`preparation-assignment-{land,landing-retry,remote-base,reuse}.test.mjs`
green; `grep` shows no import of `isAncestor` from Land's modules and no
definition in `retirement-checks.mjs`. Record the surviving owner of every
removed case in this slice's accepted proof.

### 3. Native harness judges trunk CI only, with shims reachable in every closure fixture
Type: Structure
Status: pending
Proof: credential-free `tests/git-publication-native.sh` default mode green, including Cursor's response as an accepted counterexample and a trunk-closure login-shell counterexample.

Correction: F5 and F6. Narrow `story_closure_response_trunk_result`'s rejection
to trunk-CI failure phrases (CI, coverage, receipt, or verdict reported failed,
failing, unavailable, or not green), so a failed push or other step beside a
trunk success passes. Add Cursor's response shape as a `true` counterexample,
reconstructed from plan 146 slice 8's record (run output was deleted): one line
stating "The push failed due to zsh colon modifiers" with trunk and observer
words and trunk CI success. Keep every existing counterexample's verdict. Keep
the assessor at most 250 lines.

Apply the login-shell repair in `native-harness-observation.sh`:
`native_harness_observe_node` keeps the login PATH and `native_harness_restore`
releases it, so the Story Branch, trunk-closure (with its owned-context
scenario), and execution-review fixtures all get it; the Story Branch fixture
drops its own calls. Extend `run_native_harness_counterexamples` so a
trunk-closure-shaped harness resolves `gh` to `harness/bin/gh` through
`native_harness_login_shell` despite a decoy profile, and restore leaves
`ZDOTDIR`, `PATH`, and `NODE_OPTIONS` unchanged. Add
`native-harness-login-shell.sh` to every identity that hashes
`native-harness-observation.sh`.

Proof: `PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh`
default mode green; the new Cursor counterexample fails against the current
check; `tests/git-publication-native-owned-context.sh` and
`tests/native-evidence-identity.sh` green. The affected identities (Story
Branch, trunk-closure, owned-context, execution-review) change, so their
recorded native evidence goes stale.

### 4. Native evidence identity covers the modules and guidance each journey runs
Type: Structure
Status: pending
Proof: `tests/native-evidence-identity.sh` fails when a module in a listed command's relative-import closure changes without changing that identity, and passes after the fix.

Correction: F7. Add `tests/support/native-import-closure.mjs`, which prints the
sorted relative-import closure of the `.mjs` inputs it is given (static
`import … from "./…"` or `"../…"`). Each closure identity writer hashes that
closure for the commands its journey runs instead of listing modules by hand:
trunk closure `trunk-closure.mjs`, `execution-increment-delivery.mjs`, and
`ci-mailbox.mjs`; Story Branch `worktree-retirement.mjs`, `ci-mailbox.mjs`,
and `product-backlog-git-merge.mjs`; owned-context the commands it lists plus
`preparation-assignment.mjs`; Land's shared lines keep
`worktree-retirement.mjs` through the helper. Add `publish-the-candidate.md` to
the trunk-closure and Story Branch guidance lists. List Markdown explicitly
from the guidance each journey follows; do not follow links transitively.
`history-preserving-publication.mjs` stays out: no journey runs it.

Extend `tests/native-evidence-identity.sh`: for each writer, every module in
the relative-import closure of a listed `.mjs` input is listed, so its existing
per-input change check covers it.

Proof: the extended check fails against the current writers in a scratch copy
(for example `ci-mailbox-complete.mjs` unlisted in trunk closure) and passes
after; `PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh`
default mode and `tests/git-publication-native-owned-context.sh` green.

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Example 1: rebased closure rerun pushes nothing, completes, retires | 1: `trunk-closure-rebased-rerun.test.mjs` |
| Example 2: rerun after retirement reports already absent | 1: same file, `--repository` rerun |
| Example 3: success without confirmed shutdown keeps resources | 1: parameterized `trunk-closure.test.mjs` completion case |
| Truthful `context` stop when nothing is recognized | 1: existing `trunk-closure-resume.test.mjs:175`, recovery text updated |
| One `isAncestor` for Land and wrap-up; no dead exports | 2: grep after edit; suites green |
| Each closure behavior has one owning test | 2: moved cases in `worktree-retirement.test.mjs` and `closure-story-integration.test.mjs`; surviving owners recorded |
| Example 4: response check rejects only trunk-CI failure | 3: `story_closure_response_counterexamples` with Cursor's shape |
| Login-shell shims on every closure fixture | 3: `run_native_harness_counterexamples` trunk-closure case |
| Example 5: imported module change stales the identity | 4: extended `tests/native-evidence-identity.sh` |
| Plan 146 promises unchanged | every slice: plan 146's CLI suites and native default mode stay green |

## Delivery checks

Run each slice's focused files at its boundary with
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh <files>`; use a modern bash
for shell tests, since macOS system bash masks `set -e` failures. Slices 3 and 4
run `tests/git-publication-native.sh` (about 60 s) and
`tests/native-evidence-identity.sh`. No slice changes the payload declaration,
so payload checks are needed only if a slice unexpectedly touches
`install.sh`-declared files' imports; then run `tests/payload-declaration-links.sh`
and `tests/story-payload-update.sh`. Never run a paid native mode. Use
independent post-change refactoring and ordinary managed delivery.

## Concern review

- **Slice 1 recognition rule.** Author, author date, and message identify a
  rebased closure only while delivery rebases with `git rebase`; a future
  switch to cherry-pick with a new date would stop recognizing it and fall
  back to the truthful `context` stop, not a wrong push. The observed premise
  covers today's mechanics.
- **Slice 2 admitted-work choice** is left to execution between two bounded
  options; both keep the same assertions and the 250-line limit, so sizing
  does not change.
- **Slice 3 counterexample** is reconstructed, not the verbatim Cursor
  response, because plan 146 deleted run output after judging.
- **Stale native evidence.** Slices 3 and 4 change the Story Branch,
  trunk-closure, owned-context, and execution-review identities. Their
  recorded evidence becomes stale by design; renewing it is left to whoever
  next needs it.
- **Plan 146 wrap-up.** Plan 146's closure deletes its plan and story section;
  the correction story's provenance link then resolves through Git history.
  Wrap-up owns updating that link.

No blocking slice-specific concern remains in this review.
