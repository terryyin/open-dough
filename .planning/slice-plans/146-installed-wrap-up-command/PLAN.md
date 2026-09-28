# Close stories through an installed wrap-up command

## Source and authority

- **Identity:** SEED-008#installed-wrap-up-command.
- **Source:** [story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#installed-wrap-up-command),
  refined on 2026-09-28 with Terry's decisions: an entry point rather than
  dropping the shipped closure modules, Trunk Mode closure plus shared
  retirement only, both closure publications kept, Story Branch integration
  and current-checkout closure deferred.
- **Provenance:** plan 140's retrospective finding F7 (recoverable at
  `199c579f:.planning/slice-plans/140-remote-history-workflows/PLAN.md`);
  plan 142 hands its payload part to this story (its F7 exclusion). The
  unretired `SEED-053#proportionate-local-verification` worktree and branches
  observed on 2026-09-28 are the story's reliability evidence.
- **Authority:** Terry asked for a slice plan assuming plan 142 is done, to be
  executed only after plan 142 is done. This plan is planning only. It grants
  no Take, implementation, or publication.
- **Preparation workspace:** `.worktrees/plan-installed-wrap-up-command`
  (branch `claude/plan-installed-wrap-up-command`), announced as agent
  Maria-chan at `0137fae2`.

## Start gate

**Do not Take or execute this plan until
[SEED-008#owned-context-start-and-truthful-refresh](../142-owned-context-start-and-refresh/PLAN.md)
(plan 142) and
[SEED-008#finish-removing-checkout-coordination](../145-finish-removing-checkout-coordination/PLAN.md)
(plan 145) have both left Taken on remote trunk.** Plan 142 extracts the
retirement core this plan installs, rewrites the wrap-up and Land refresh
wording, and adds the `trunk-closure/owned-context` native journey slice 6
reruns. Plan 145 removes the `declaredOwner`/`requester` arguments that
`closure-publication.mjs` still forwards and puts the unpublished-base guard in
`publishExecutionIncrement`, which slice 3 reuses. The story's accepted
ordering names both.

This plan is written against their planned end state. At start, re-read the
files each slice names against the then-current trunk, confirm the extracted
retirement core's actual name, location, and result shape, and refresh line
references before editing. If either plan landed a different shape, update the
affected slices here before implementing.

## Outcome and boundaries

Agents closing a Trunk Mode story, and agents landing any owned worktree, run
the closure and retirement mechanics the tests prove through installed
commands. Wrap-up and Dough Land guidance keep only judgment steps, and closed
work stops leaving worktrees and branches behind.

Key examples (from the story):

1. A completed Trunk Mode story → the agent runs the closure command → both
   closure commits are accepted on the remote, one completion receipt covers
   the final SHA, and the worktree and branch are then retired.
2. A Story Branch story whose integrated SHA has an accepted receipt → the
   agent runs the retirement command → the worktree, local branch, and remote
   branch are removed.
3. Trunk advanced and the closure publication conflicts → the command stops,
   preserving the worktree, branch, and closure commits, and reports the
   recovery step.
4. Retirement is asked for a branch whose tip trunk does not contain → the
   command refuses and removes nothing.

Preserved promises and constraints:

- Both closure publications stay. The before-cleanup commit is published and
  accepted before spent history is deleted, because a rebase would rewrite a
  SHA the final closure cites as a recovery locator.
- Retirement never force-removes, force-deletes, or resets; dirty, ambiguous,
  foreign-branch, or uncontained resources are preserved and reported.
- Trunk Mode never deletes a remote execution branch.
- Wrap-up retires only after a completion receipt with confirmed shutdown;
  Land's gate stays containment only.
- Completion stays one bounded foreground operation per closure, never
  polled or assigned to another agent.
- Assimilation, queue decisions, deletion scope, and conflict resolution stay
  agent judgment in prose.
- One JSON line on stdout, exit 1 when not ok, exit 2 on usage error, as the
  other installed commands do.
- Edit sources only in `src/skills/`, never installed copies. Follow ADR 0006's
  executing-agent audience; when removing prose, add no "no longer" wording.

Excluded (deferred promises): an entry point for Story Branch integration
(`history-preserving-publication.mjs` and the backlog merge adapter stay
agent-driven); current-checkout closure changes (`current-branch-publication.mjs`
is untouched); a single-publication closure; a shared CLI argument-parsing
library; Story Branch native journeys beyond keeping the existing one green.

## Existing solutions (PFE)

- **Before-cleanup publication** already runs through the installed
  `dough-execute-plan/scripts/execution-increment-delivery.mjs deliver`
  (`trunk-publication.md` "Publish wrap-up closure" routes each closure commit
  through the common sequence). Reuse it unchanged; no new command for that
  step.
- **Observer attachment** reuses `establishObservation`
  (`execution-increment-observation.mjs:65`), which recovers a live matching
  mailbox via `findLiveMatchingMailbox` (`ci-mailbox-match.mjs:59`) before
  arming one, and `registerPushedRevision` for accepted SHAs.
- **Completion** reuses `completeRevision(directory, sha)`
  (`ci-mailbox-complete.mjs:121`) in-process. It is plain Node, not
  host-specific, and already handles an already-terminal mailbox.
- **Publication and resume** reuse `publishExecutionIncrement` and
  `resumeInterruptedPublication`, as `settleClosureCandidate` does today.
- **Retirement core** is plan 142 slice 6's extraction from
  `removeExecutionResources`. This plan moves it to Dough Land, which owns
  "Retire the worktree", and gives it the entry point.
- **Direction:** [North Star "Remote history and optional local refresh"](../../NORTH-STAR.md#remote-history-and-optional-local-refresh)
  says Dough Land and wrap-up consume one cohesive publication, refresh, and
  retirement solution with their distinct duties intact. Slices 1–3 follow it:
  one retirement core and command under Land, with wrap-up adding only its
  completion gate.
- **CLI shape** follows `execution-increment-delivery.mjs` (`isDirectCliEntry`
  from `ci-direct-entry.mjs:16`, kebab-to-camel flags, one JSON line). No
  shared parser exists, and adding one is out of scope.
- **Replaced:** the in-memory observer object (`register`, `stop()`,
  `stopped`, `receipts`) that `closure-publication.mjs`,
  `closure-candidate-settlement.mjs`, and `closure-resources.mjs` expect has
  no production adapter. Slice 3 drops it in favor of the mailbox directory.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| The closure modules have no entry point and no production caller | `grep -rln "closure-publication.mjs\|closure-candidate-settlement.mjs\|closure-resources.mjs" src tests scripts install.sh`, excluding the modules themselves | Only `install.sh:238-240` and the import smoke check `tests/helpers/publication-update-proof.bash:43-45`; none of the three uses `isDirectCliEntry` |
| Wrap-up guidance names no closure script | `src/skills/dough-story-wrap-up/SKILL.md` read in full | Links procedures only; Land "Retire the worktree" (`dough-land/SKILL.md:102-135`) gives raw Git steps |
| A command can run completion itself | `ci-mailbox-complete.mjs:121` export; `ci-completion-wait.md`, `ci-monitor.md:77` | In-process export, bounded, foreground; the coordinator owns one call; nothing requires a host background wait |
| Rerunning completion on a stopped mailbox is safe | `ci-mailbox-complete-success-cases.mjs:47` | "complete-revision handles already-terminal success without a separate stop" |
| Observer recovery exists for reuse | `execution-increment-observation.mjs:65`, `ci-mailbox-match.mjs:59` | `establishObservation` reuses a live matching mailbox or arms one |
| Native trunk-closure assessor expects the agent's own completion call | `tests/support/trunk-closure-native-assess.sh:53`, `trunk-closure-native-run.sh:39-66,118` | Greps the transcript for `complete-revision`; must observe the new command instead |
| Story Branch native assessor also checks completion | `tests/support/story-branch-closure-native-assess.sh:82` | Agent still runs completion there; unchanged by this plan |
| Payload is an explicit list without a JS import check | `install.sh` `managed_files` (:60-241); `tests/payload-declaration-links.sh` checks Markdown links only | New scripts are declared line by line; removed modules must be removed there and from `publication-update-proof.bash` |
| Land's retirement is proved only by a test model | `dough-story-refinement/scripts/dough-land-test-fixtures.mjs:49-97` ("Git model … not guidance-following"); `dough-land/` holds only `SKILL.md` | After plan 142 the model is a thin adapter over the core; no installed Land script exists |
| Plan 142's core, wording, and journey are the starting shape | Plan 142 slices 5–8 (`:391-597`), all `planned` on 2026-09-28 | Assumed done at start; the start gate re-verifies the landed shape |

## Slices

### 1. Land retires through an installed command
Type: Behavior
Status: planned
Proof: child-process CLI tests for contained, uncontained, dirty, and already-absent retirement; Land and preparation-landing suites green through the command.

Behavior: A landed, owned worktree whose branch tip trunk contains → the agent
runs `node <installed>/dough-land/scripts/worktree-retirement.mjs retire
--repository <management context> --worktree <path> --branch <name> --remote
<remote> --target-ref <ref>` → the worktree and local branch are removed and
the JSON result says so. An uncontained tip is refused with nothing removed
(example 4); a dirty, ambiguous, or other-branch worktree is preserved with a
reason; a rerun after removal reports already absent and pushes nothing.

Move plan 142's extracted core into `src/skills/dough-land/scripts/worktree-retirement.mjs`
with its CLI, and import it from wrap-up. Replace Land's raw-Git steps 1–4 in
"Retire the worktree" with the command and how to act on each result, keeping
the rerun, never-force, and caller-gate rules. The Land test model's retirement
adapter calls the installed command, deleting the duplicated model logic.
Declare the script in `install.sh`.

Proof: new `worktree-retirement.test.mjs` runs the CLI as a child process on
`createCleanTrunkFixture` repositories for the four cases above.
`dough-land*.test.mjs`, `preparation-assignment-{land,landing-retry,remote-base,reuse}.test.mjs`,
`preparation-publication.test.mjs`, and `retained-artifacts.test.mjs` stay
green. Behavior review of the rewritten Land section.

### 2. Story Branch wrap-up retires through the same command
Type: Behavior
Status: planned
Proof: CLI test deleting a contained remote execution branch and keeping an uncontained one; Story Branch closure suites and the credential-free Story Branch native mode green.

Behavior: A Story Branch story whose integrated SHA has an accepted completion
receipt with confirmed shutdown → the agent runs `retire` with
`--remote-branch <execution branch>` and `--contained <integrated SHA>` → the
worktree, local branch, and remote branch are removed (example 2). A remote
execution tip trunk does not contain keeps all three.

Remote-branch deletion and extra-SHA containment move from
`removeExecutionResources` into the core. Wrap-up's "Remove execution resources
safely" calls the command for Story Branch Mode; the receipt gate stays the
agent's check before calling it, as today.

Proof: `closure-story-branch-cleanup.test.mjs` exercises the CLI; 
`closure-story-integration*.test.mjs` stay green;
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/git-publication-native.sh`
passes in default mode with the Story Branch assessor accepting cleanup by the
command.

### 3. Trunk closure finishes through one installed command
Type: Behavior
Status: planned
Proof: child-process CLI tests with a real mailbox for example 1 and example 3; credential-free trunk-closure native mode green with the assessor requiring the command.

Behavior: A Trunk Mode wrap-up whose before-cleanup commit was accepted through
`deliver` and whose final-closure commit is committed → the agent runs
`node <installed>/dough-story-wrap-up/scripts/trunk-closure.mjs finish
--workspace <path> --branch <name> --before-cleanup <sha> --final <sha>
--previously-published-base <sha> --target-ref <ref> --repo <owner/repo>
--host <host> [--session-json <json>] [--default-checkout <path>]` → it
confirms trunk contains the before-cleanup SHA, publishes the final closure
through `publishExecutionIncrement` on the recovered or armed observer and
registers it, runs `completeRevision` once for the final accepted SHA, attempts
the default-checkout refresh when one is given, and only on a receipt with
confirmed shutdown retires the worktree and branch through the slice 1 core
(example 1). A publication conflict stops with the worktree, branch, and both
commits preserved and names the recovery step (example 3); a before-cleanup SHA
trunk lacks stops before publishing; failure, retained, or unconfirmed
shutdown preserves resources and reports the receipt.

Wrap-up's "Commit final closure" and "Remove execution resources safely" for
Trunk Mode, and `trunk-publication.md` "Publish wrap-up closure", keep
`deliver` for the before-cleanup commit and call `finish` for the rest,
dropping the prose sequence it replaces. Declare `trunk-closure.mjs` in
`install.sh`. The trunk-closure native substitute and assessor observe the
`finish` command, keeping the counterexamples for cleanup before the receipt
and a surviving worktree. The superseded closure modules stay untouched until
slice 5.

Proof: `trunk-closure.test.mjs` drives the CLI as a child process with the
managed-delivery CLI fixtures' real mailbox (`stopAtTeardown`), covering no
default checkout and a non-default remote and target. Payload checks below,
`tests/story-payload-update.sh`, and native default mode green.

### 4. An interrupted trunk closure resumes from its first unfinished step
Type: Behavior
Status: planned
Proof: CLI rerun tests at each interruption point: no second push, one completion receipt, cleanup completed or reported already absent.

Behavior: `finish` was interrupted after the final closure was accepted, after
completion, or after the worktree was removed → the agent reruns the same
command → it recognizes the accepted SHA without pushing again, reuses or
repeats completion on the matching mailbox, and completes or reports cleanup
as already done. An unpublished final tip that trunk has moved past is rebased
and published once, keeping the worktree until the receipt.

Port the resume obligations of `resumeTrunkClosure` and
`settleClosureCandidate` that slice 3 did not need into `finish`, using
`resumeInterruptedPublication`. Wrap-up's rerun wording points at the command.

Proof: `trunk-closure-resume.test.mjs` drives the CLI as a child process.

### 5. No shipped closure module is left without an entry point
Type: Structure
Status: planned
Proof: payload scan finds every declared wrap-up and Land script is a CLI or imported by one; closure and Land suites green with duplicate tests removed.

Correction: plan 140's F7. `closure-publication.mjs`,
`closure-candidate-settlement.mjs`, and `closure-resources.mjs`, with their
in-memory observer interface, are superseded by slices 1–4 and still ship.
Delete them; repoint `closure-current-branch.test.mjs` at
`current-branch-publication.mjs`; remove the modules from `install.sh` and
`tests/helpers/publication-update-proof.bash`; delete
`closure-publication*.test.mjs`, `closure-named-target.test.mjs`, and
`closure-resource-cleanup.test.mjs` cases that `trunk-closure*.test.mjs` and
`worktree-retirement.test.mjs` now cover, porting any uncovered case first.
External behavior is unchanged: slices 1–4's CLI tests and the native default
mode stay green.

Proof: every script `install.sh` declares under `dough-story-wrap-up/scripts/`
and `dough-land/scripts/` has `isDirectCliEntry` or is imported by one that
does; `tests/execution-payload-update.sh` and `tests/story-payload-update.sh`
pass; the focused suites above stay green.

### 6. Native acceptance of the changed closure and Land guidance
Type: Behavior
Status: planned
Proof: fresh host runs judged accepted on Claude Code, Codex, and Cursor, with host version and candidate SHA recorded here. Paid and manual; needs Terry's run authority at execution time.

Behavior: On each host, from installed candidate guidance, a completed Trunk
Mode story is wrapped up → the agent publishes the before-cleanup commit
through `deliver`, runs `finish` once, and the assessor observes final
acceptance, one completion receipt with confirmed shutdown before cleanup, and
the worktree and branch retired. A preparation keep lands and retires its
worktree through the `retire` command.

Run `trunk-closure/source` and `trunk-closure/owned-context` on each host, plus
one plan 142 slice 8 journey that lands and retires through Dough Land. One
attempt per host and case; pin the candidate SHA and CLI version; delete run
output after judging. Command:
`PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native <codex|cursor|claude> --case <case> --results-dir <dir>`.
Never in `scripts/test.sh`, CI, or a loop.

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Example 1: Trunk closure publishes both, one receipt, then retires | 3: `finish` CLI test; 6: native trunk-closure journeys |
| Example 2: Story Branch retirement removes worktree, local and remote branch | 2: `retire --remote-branch` CLI test |
| Example 3: publication conflict preserves resources and names recovery | 3: `finish` conflict CLI test |
| Example 4: uncontained tip refused, nothing removed | 1: `retire` CLI test |
| Before-cleanup accepted before spent history is deleted | 3: `finish` stops when trunk lacks it; guidance keeps `deliver` first |
| Retirement only after confirmed shutdown in wrap-up | 3: retained and unconfirmed receipt tests; native counterexample |
| Rerun pushes nothing twice and completes cleanup | 1: already-absent rerun; 4: interruption reruns |
| Land and wrap-up retire through one installed core | 1, 2, 3: all retirement tests reach `worktree-retirement.mjs` |
| No shipped closure module without an entry point | 5: payload scan of declared wrap-up and Land scripts |
| Wrap-up and Land guidance keep only judgment steps | 1–4: behavior review of edited sections |
| Changed guidance accepted natively on three hosts | 6 |
| One shared payload across hosts | every slice: payload checks below |

## Delivery checks

Each slice carries its implementation, guidance, focused proof, and cleanup.
Run the focused test files named in each slice at its boundary. When a slice
changes declared runtime or guidance dependencies, run
`bash tests/payload-declaration-links.sh` and the affected
`tests/execution-payload-update.sh` or `tests/story-payload-update.sh`. Measure
`tests/git-publication-native.sh` elapsed time before slice 2 and after slice 3,
since it is the suite's longest job. Follow the slice-planning local-verification
rule landed by `162b5fb4`. Keep new modules at most 250 lines. Do not
hand-synchronize installed copies. Use independent post-change refactoring and
ordinary managed delivery.

## Concern review

- **Slice 3 size** was reduced in this review: resume moved to slice 4 and
  module deletion with test consolidation to slice 5, so slice 3 holds one
  command, its guidance, and its CLI proof. Between slices 3 and 5 the old
  modules ship unwired exactly as they do today; no delivery boundary makes
  that worse.
- **Unlanded predecessors.** Slices 1 and 6 build on plan 142's extracted core
  and native journey, and slice 3 on plan 145's owner-argument removal. The
  start gate covers both and requires re-verifying their landed shape, as
  plan 145 does for plan 142.
- **Paid runs.** Slice 6 needs separate run authority at execution time.

No blocking slice-specific concern remains in this review.
