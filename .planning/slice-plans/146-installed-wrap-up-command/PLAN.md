# Close stories through an installed wrap-up command

## Source and authority

- **Identity:** SEED-008#installed-wrap-up-command.
- **Source:** [story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#installed-wrap-up-command),
  refined on 2026-09-28 with Terry's decisions: an entry point rather than
  dropping the shipped closure modules, Trunk Mode closure plus shared
  retirement only, both closure publications kept, Story Branch integration
  and current-checkout closure deferred. Enriched on 2026-09-28 with three
  plan 142 retrospective findings Terry assimilated into this story: native
  evidence identity gaps, harness repairs that reached only trunk closure, and
  the session-named retirement gate.
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
  Maria-chan at `0137fae2`; the enrichment used
  `.worktrees/prep-installed-wrap-up-command`
  (branch `claude/prep-installed-wrap-up-command`), announced as Aino-chan at
  `6e6fbcc8`. The readiness review before execution used
  `.worktrees/prep-installed-wrap-up-command`
  (branch `claude/prep-installed-wrap-up-command-ready`), announced as Anri-chan
  at `b79a8919`.
- **Readiness review (2026-09-29):** Terry asked to confirm the plan and make it
  ready before executing slice 1. He chose to remove
  `current-branch-publication.mjs` from the payload in slice 5. Slice 1 now
  reads the per-worktree creation ref decided in
  SEED-008#durable-workspace-creation-fact directly, rather than waiting for
  that story to land.

## Start gate

Satisfied on 2026-09-29. SEED-008#finish-removing-checkout-coordination
(plan 145, recoverable at
`bae283d2:.planning/slice-plans/145-finish-removing-checkout-coordination/PLAN.md`)
closed at `f16cc4cc` and has left Taken on remote trunk. Plan 142
(SEED-008#owned-context-start-and-truthful-refresh) closed at `2a3e0ba2`: it
extracted the retirement core this plan installs, rewrote the wrap-up and Land
refresh wording, and added the `trunk-closure/owned-context` and
`publication/preparation-land` native journeys slice 8 reruns. Observed at
`7387165f`: `closure-publication.mjs` forwards no `declaredOwner` or
`requester`, and `publishExecutionIncrement` stops with `unpublished-base`
(`execution-increment-publication.mjs:134`), which slice 3 reuses.

SEED-008#durable-workspace-creation-fact
(plan 147, recoverable at `0d056b38:.planning/slice-plans/147-durable-workspace-creation-fact/PLAN.md`) has closed. `selectOwnedWorkspace` writes
`refs/worktree/dough/created-for/<identity>` when it creates a worktree
(`createdForRef` in `workspace-publication-ownership.mjs`), and
`exploration-workspace.md` "Close or retain it" reads it as the durable
creation record beside a same-session `created: true` and the caller's
statement, which `--created-for-work` still carries. Plan 147 also changed
what later slices here rewrite; re-read each against then-current trunk:

- `trunk-publication.md` "Publish wrap-up closure" and wrap-up's "Remove
  execution resources safely" name the ownership check where closure retires
  (the record or another "Close or retain it" record shows this work created
  the worktree). Slice 3's command can carry that check; keep the entry points
  saying it or pointing at the command.
- Dough Land's intro, "with containment as the safety test", misled a native
  Claude Code closure agent into retiring after the containment check alone.
- The owned-context fixtures write the creation record; trunk closure's has
  story `SEED-T#final-closure` and a `Selected story:` state line. The
  owned-context evidence identity covers `exploration-workspace.md`,
  `workspace-publication-select.mjs`, and `workspace-publication-ownership.mjs`,
  the trunk-closure one covers `dough-land/SKILL.md`,
  `exploration-workspace.md`, and the ownership module, and
  `tests/native-evidence-identity.sh` checks the owned-context writer (slice 6).
- The owned-context assessors observe only the retired outcome, so an agent
  that skips the ownership check passes. Slice 8 should require retirement
  through the command, or add one variant whose worktree must stay, and accept
  each run on its transcript's ownership read, not on PASS alone.
- `dough-story-wrap-up/SKILL.md` is at the 250-line limit.
- Correction SEED-008#creation-record-test-residue (plan 149) will export the
  record prefix from the ownership module; reuse it if slice work needs it.

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
5. Retirement is asked for a reused, host-owned, or unrecorded worktree →
   the command retains it and removes nothing; one an earlier session created
   for this same work is retired.

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
agent-driven); current-checkout closure changes, whose guidance names no
script and stays as it is; a single-publication closure; a shared CLI argument-parsing
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
- **Retirement core** is plan 142's landed extraction, `retireWorktree`
  (`closure-resources.mjs:112`), which `removeExecutionResources` and the Land
  test model (`dough-land-test-fixtures.mjs:73`) already call. This plan moves
  it to Dough Land, which owns "Retire the worktree", and gives it the entry
  point.
- **Ownership gate:** two exist today. `removeExecutionResources` refuses
  unless `sessionOwned === true` (`closure-resources.mjs:198`, reason "another
  workspace"); the Land model refuses unless `createdForWork`
  (`dough-land-test-fixtures.mjs:66`). The lifecycle rule
  (`exploration-workspace.md` "Close or retain it") is work-scoped. Slice 1
  keeps one gate, the Land model's work-scoped one, inside the core.
- **Durable creation record:** plan 147 writes
  `refs/worktree/dough/created-for/<identity>` beside the existing
  `refs/worktree/dough/preparation-assignment` ref
  (`preparation-assignment-ownership.mjs:104-116`). Slice 1 reads it with one
  `for-each-ref` in the worktree; it adds no writer, registry, or record.
- **Native harness repairs** already exist in trunk closure only:
  `trunk_closure_stop_observer` stops by mailbox without entering the
  worktree (`trunk-closure-native-run.sh:86`), `native-node-call-recorder.mjs`
  loaded through `NODE_OPTIONS` (`trunk-closure-native-fixture.sh:55-61`), and
  harness logs under a separate `${harness}` directory. Slice 7 shares them.
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
| Native trunk-closure assessor expects the agent's own completion call | `tests/support/trunk-closure-native-assess.sh:54`, `trunk-closure-native-run.sh:39-66,118` | Greps the transcript for `complete-revision`; must observe the new command instead |
| Story Branch native assessor also checks completion | `tests/support/story-branch-closure-native-assess.sh:82` | Agent still runs completion there; unchanged by this plan |
| Payload is an explicit list without a JS import check | `install.sh` `managed_files` (:60-241); `tests/payload-declaration-links.sh` checks Markdown links only | New scripts are declared line by line; removed modules must be removed there and from `publication-update-proof.bash` |
| Land's retirement is proved only by a test model | `dough-story-refinement/scripts/dough-land-test-fixtures.mjs:49-97` ("Git model … not guidance-following"); `dough-land/` holds only `SKILL.md` | Observed at HEAD: the model is a thin adapter over `retireWorktree` with its own `createdForWork` check (`:66-78`); no installed Land script exists |
| Plan 142's core, wording, and journeys are the starting shape | `git log` (`2a3e0ba2` closes it); `closure-resources.mjs:112-182` read | Landed: `retireWorktree({repository, execution, branch, remote, targetRef, holdReason})` returns `{removed, partial, worktree, branch, reason, repository}` |
| Retirement ownership is session-named in shipped code, work-scoped in the Land model | `grep -rn "sessionOwned\|createdForWork" src` | `sessionOwned` only in `closure-resources.mjs:189,198`, `closure-publication.mjs:155`, and wrap-up tests; `createdForWork` only in the Land model and Land/preparation tests; no guidance names either |
| Native identities miss guidance their journeys prove | Unpaid probe on a scratch copy of `tests/` and `src/`: appended a line to each file and compared `git_publication_write_evidence_identity owned-context` and `trunk_closure_write_evidence_identity` input hashes | `exploration-workspace.md`, `preparation-workspace.md`, `maintain-default-checkout.md` changed neither identity; `dough-land/SKILL.md` changed owned-context only. `tests/native-evidence-identity.sh:24-36` lists no owned-context writer and checks only supervision inputs |
| Story Branch closure's observer stop can fail after successful cleanup | `story-branch-closure-native-run.sh:116-121` | Stops with `(cd "${story_closure_workspace}" && node … stop)`, the worktree cleanup removes |
| Node-call recording covers Codex login shells only in trunk closure | `grep -rn "NODE_OPTIONS\|native-node-call-recorder" tests` | Only `trunk-closure-native-fixture.sh:55-61,192-193` and its assessor test |
| Harness logs sit in the agent-visible fixture root outside trunk closure | `story-branch-closure-native-fixture.sh:61-64`, `ci-completion-native-fixture.sh:66-67` | `node-calls.log`, `gh-calls.log`, `control.log` under `${root}`, the agent workspace's parent |
| Transcript variables need no export | `grep -rn "CLOSURE_TRANSCRIPT\|CI_COMPLETION_TRANSCRIPT" tests` | Exported at `trunk-closure-native-run.sh:127`, `story-branch-closure-native-run.sh:106`, `ci-completion-native-run.sh:154`; read only by the runner's own controllers and `ci-completion-native-fixture.sh:24` in the same shell |
| The creation record is a per-worktree ref the retirement core can read before its writer lands | Plan 147's refined scope; fresh scratch repository on 2026-09-29 (Git 2.50.1): `update-ref` of `refs/worktree/dough/created-for/SEED-008#installed-wrap-up-command` in a worktree, the `for-each-ref --format='%(refname:lstrip=4)'` read from the worktree and main checkout, then `git worktree remove` | The read printed `SEED-008#installed-wrap-up-command` from the worktree and nothing from the main checkout; after removal no ref and no `.git/worktrees` entry remained. A test can write it with `update-ref` exactly as the writer will |
| `current-branch-publication.mjs` is orphaned once slice 5 deletes the closure modules | `grep -rln current-branch-publication src tests install.sh` at `7387165f` | Imported only by `closure-publication.mjs` and its own tests (`current-branch-publication.test.mjs`, `current-branch-local-operation.test.mjs`); declared at `install.sh:194` and in `publication-update-proof.bash:28`; no `isDirectCliEntry` |

## Slices

### 1. Land retires through an installed command
Type: Behavior
Status: done
Proof: child-process CLI tests for contained, uncontained, dirty, already-absent, creation-ref, other-work-ref, flag-only, and unrecorded retirement; Land, preparation-landing, and wrap-up cleanup suites green through the one gate.

Behavior: A landed, owned worktree whose branch tip trunk contains → the agent
runs `node <installed>/dough-land/scripts/worktree-retirement.mjs retire
--repository <management context> --worktree <path> --branch <name> --remote
<remote> --target-ref <ref> [--identity <work identity>] [--created-for-work]`
→ the worktree and local branch are removed and the JSON result says so. An
uncontained tip is refused with nothing removed (example 4); a dirty,
ambiguous, or other-branch worktree is preserved with a reason; a rerun after
removal reports already absent and pushes nothing. Ownership follows the work
(example 5): a worktree whose creation ref names `--identity` is retired,
whichever session created it; one whose ref names other work is retained and
reported as created for that work; one with no ref is retired only with
`--created-for-work`, which the agent passes only from a same-session
`created: true` or the caller's statement, per `exploration-workspace.md`
"Close or retain it"; otherwise a reused, host-owned, or unrecorded worktree is
retained with that reason.

Move `retireWorktree` into `src/skills/dough-land/scripts/worktree-retirement.mjs`
with its CLI, and import it from wrap-up. Put the one ownership gate in that
core, replacing both `removeExecutionResources`' `sessionOwned` check and the
Land model's `createdForWork` check; callers pass the identity and flag
through. The core reads the ref with
`git -C <worktree> for-each-ref --format='%(refname:lstrip=4)' refs/worktree/dough/created-for/`;
plan 147 owns writing it and the lifecycle wording that names it. An
already-absent worktree needs no ownership fact on a rerun. Replace Land's raw-Git steps 1–4 in
"Retire the worktree" with the command and how to act on each result, keeping
the rerun, never-force, and caller-gate rules. The Land test model's retirement
adapter calls the installed command, deleting the duplicated model logic.
Declare the script in `install.sh`.

Proof: new `worktree-retirement.test.mjs` runs the CLI as a child process on
`createCleanTrunkFixture` repositories for the four cases above, plus
ownership cases whose fixtures write the creation ref with `update-ref`: a ref
naming this identity with no flag (retired, as an earlier session's creation),
a ref naming other work with the flag (retained, reported as created for that
work), no ref with the flag (retired), and no ref without it (retained,
nothing removed). Wrap-up tests and `closure-publication.mjs` passing
`sessionOwned` pass the work-scoped fact instead.
`dough-land*.test.mjs`, `preparation-assignment-{land,landing-retry,remote-base,reuse}.test.mjs`,
`preparation-publication.test.mjs`, and `retained-artifacts.test.mjs` stay
green. Behavior review of the rewritten Land section.

Accepted proof (2026-09-29): `node --test`-style CLI tests in
`src/skills/dough-land/scripts/worktree-retirement.test.mjs` (contained and
already-absent rerun, uncontained, dirty, creation ref naming this work without
the flag, ref naming other work with the flag, unrecorded, usage error), run as
child processes through `runRetirementCommand` in `dough-land-test-fixtures.mjs`
on `createCleanTrunkFixture` with `update-ref` creation refs; focused suites
green through `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh` (Land,
preparation landing, retained artifacts, all wrap-up closure tests,
`ci-completion-lifecycle-guidance.test.mjs`); `tests/payload-declaration-links.sh`,
`tests/story-payload-update.sh`, and `tests/execution-payload-update.sh` green.

Learnings: `retireWorktree` takes `worktree` (was `execution`), `identity`, and
`createdForWork`; `removeExecutionResources` passes both instead of
`sessionOwned`, and an already-absent worktree needs no fact. Land's
`--created-for-work` accepts a `created: true` the work recorded in the plan or
conversation, matching "Close or retain it". The credential-free native
substitutes still retire with raw Git
(`tests/support/native-agent-owned-context.sh:98`,
`git-publication-native-owned-context-suite.sh:157`); slice 3's substitute
work, or slice 7 at the latest, moves them to the command. Editing Land's
section already makes recorded owned-context native evidence stale; slice 8
reruns it.

### 2. Story Branch wrap-up retires through the same command
Type: Behavior
Status: done
Proof: CLI test deleting a contained remote execution branch and keeping an uncontained one; Story Branch closure suites and the credential-free Story Branch native mode green.

Behavior: A Story Branch story whose integrated SHA has an accepted completion
receipt with confirmed shutdown → the agent runs `retire` with
`--remote-branch <execution branch>` and `--contained <integrated SHA>` → the
worktree, local branch, and remote branch are removed (example 2). A remote
execution tip trunk does not contain keeps all three.

Remote-branch deletion and extra-SHA containment move from
`removeExecutionResources` into the core. Wrap-up's "Remove execution resources
safely" calls the command for Story Branch Mode with the slice 1 ownership
fact; the receipt gate stays the agent's check before calling it, as today.

Proof: `closure-story-branch-cleanup.test.mjs` exercises the CLI; 
`closure-story-integration*.test.mjs` stay green;
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh tests/git-publication-native.sh`
passes in default mode with the Story Branch assessor accepting cleanup by the
command.

Accepted proof (2026-09-29): CLI tests in
`closure-story-branch-cleanup.test.mjs` (contained remote execution branch
removed with worktree and local branch, rerun already absent; uncontained
remote tip keeps all three; target branch refused) and
`worktree-retirement.test.mjs`; wrap-up, Land, preparation, and guidance suites,
payload checks, and credential-free `tests/git-publication-native.sh`, whose
Story Branch assessor now requires `worktree-retirement.mjs retire` with
`--remote-branch` and `--contained` and rejects raw-Git cleanup. Native suite
elapsed time: 56.5 s before slice 2, 57.7 s after (single runs).

Learnings: the Story Branch native fixture now uses a worktree of the
integration checkout instead of a clone with a project cleanup script, so its
recorded native evidence is stale until slice 8. Its runner's fallback observer
stop still enters the removed worktree; slice 7 owns that. CI repair
`de81cb96` kept the Land model's `identity` optional for the dashboard
preparing journey's typecheck (run 36507473752).

### 3. Trunk closure finishes through one installed command
Type: Behavior
Status: done
Proof: child-process CLI tests with a real mailbox for example 1 and example 3; credential-free trunk-closure native mode green with the assessor requiring the command.

Behavior: A Trunk Mode wrap-up whose before-cleanup commit was accepted through
`deliver` and whose final-closure commit is committed → the agent runs
`node <installed>/dough-story-wrap-up/scripts/trunk-closure.mjs finish
--workspace <path> --branch <name> --before-cleanup <sha> --final <sha>
--previously-published-base <sha> --target-ref <ref> --repo <owner/repo>
--host <host> [--identity <work identity>] [--created-for-work]
[--session-json <json>]
[--default-checkout <path>]` → it
confirms trunk contains the before-cleanup SHA, publishes the final closure
through `publishExecutionIncrement` on the recovered or armed observer and
registers it, runs `completeRevision` once for the final accepted SHA, attempts
the default-checkout refresh when one is given, and only on a receipt with
confirmed shutdown retires the worktree and branch through the slice 1 core
and its ownership gate (example 1). A publication conflict stops with the worktree, branch, and both
commits preserved and names the recovery step (example 3); a before-cleanup SHA
trunk lacks stops before publishing; failure, retained, or unconfirmed
shutdown preserves resources and reports the receipt.

Wrap-up's "Commit final closure" and "Remove execution resources safely" for
Trunk Mode, and `trunk-publication.md` "Publish wrap-up closure" (now
`wrap-up-closure-publication.md`), keep
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

Accepted proof (2026-09-29): `trunk-closure.test.mjs` drives the installed
CLI as a child process with the managed-delivery fixture's real observer and
`stopAtTeardown`: example 1 (reused mailbox, one success receipt for the final
SHA with confirmed shutdown, default checkout fast-forwarded, worktree and
branch retired); non-default remote `upstream` and target `refs/heads/release`
with no default checkout, an armed observer, and ownership from a creation ref;
example 3 (conflict stop naming the rebase-conflict recovery, resources and
both commits kept); before-cleanup SHA missing from trunk (nothing published or
observed); CI failure with retained shutdown; no observer; usage error. Wrap-up,
Land, delivery, and guidance suites, payload checks,
`tests/git-publication-native.sh` (assessor now requires exactly one `finish`
and no separate `complete-revision`), and
`tests/git-publication-native-owned-context.sh` green. Native suite elapsed
time after slice 3: 52 s (56.5 s before slice 2).

Learnings: `finish` composes `deliverManagedExecutionIncrement` with
`--validated-candidate` set to the final SHA, `completeRevision`,
`refreshDefaultCheckout`, and `retireWorktree`; a non-conflicting trunk advance
currently stops as `step: "publish"`, which slice 4 turns into rebase and
publish once. The closure guidance moved from `trunk-publication.md` to
`dough-execute-plan/references/wrap-up-closure-publication.md` ("Finish Trunk
Mode closure", "Complete current-branch closure", "Observe Story Branch
integration"), which the trunk-closure and Story Branch closure native
identities already hash. The trunk-closure fixtures now use a worktree of the
integration checkout, and the preparation-land substitute retires through
`retire`. `install.sh` and wrap-up `SKILL.md` sit at 250 lines, so later
additions need a trim. The closure CLIs each carry their own flag parser; a
shared one stays out of scope.

### 4. An interrupted trunk closure resumes from its first unfinished step
Type: Behavior
Status: done
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

Accepted proof (2026-09-29): `trunk-closure-resume.test.mjs` drives the
installed CLI with the real mailbox and a PATH `git` wrapper recording pushes:
rerun after acceptance, after completion (repeated on the ended mailbox), after
worktree removal (`step: "context"` without `--repository`, then
`already-absent`), worktree gone before acceptance, and a non-conflicting trunk
advance rebased and published once with the worktree kept until the receipt.
All five fail against slice 3's code. Wrap-up, Land, delivery, mailbox, and
guidance suites, payload checks, and the credential-free native suites green.

Learnings: `finish` takes `--repository` for reruns after removal and rebuilds
the observer root as `realpath(parent)/basename`, since a mailbox records the
removed worktree's realpath. It accepts a non-conflicting rebase of the final
closure without revalidation, because closure commits carry records, not
behavior proof. Ported from the old modules: no second push of an accepted
closure, missing registration, rebase and publish once, absent context stops,
rerun from the management context, already-absent cleanup, and completion
reuse. Not ported, because `finish` has no such inputs: `supersededShas` and
in-memory `publishedRevisions`. Slice 5 can delete
`closure-publication-resume*.test.mjs` and the resume part of
`closure-publication-remote-context.test.mjs`. `listMatchingMailboxes` is now
exported from `ci-mailbox-match.mjs`.

### 5. No shipped closure module is left without an entry point
Type: Structure
Status: done
Proof: payload scan finds every declared wrap-up and Land script, and `current-branch-publication.mjs`'s former place, is a CLI or imported by one; closure and Land suites green with duplicate tests removed.

Correction: plan 140's F7. `closure-publication.mjs`,
`closure-candidate-settlement.mjs`, and `closure-resources.mjs`, with their
in-memory observer interface, are superseded by slices 1–4 and still ship.
Delete them. Their removal leaves
`dough-execute-plan/scripts/current-branch-publication.mjs` without an
importer, so delete it too (Terry, 2026-09-29), with
`current-branch-publication.test.mjs`, `current-branch-local-operation.test.mjs`,
and `closure-current-branch.test.mjs`. Record the last commit that holds it
here, because the deferred direct-edit promise recovers its owned-path commit
(`commitOwned`) from there. Keep any shared module it imports that another
entry point still uses. Remove the deleted modules from `install.sh` and
`tests/helpers/publication-update-proof.bash`; delete
`closure-publication*.test.mjs`, `closure-named-target.test.mjs`, and
`closure-resource-cleanup.test.mjs` cases that `trunk-closure*.test.mjs` and
`worktree-retirement.test.mjs` now cover, porting any uncovered case first.
External behavior is unchanged: slices 1–4's CLI tests and the native default
mode stay green.

Proof: every script `install.sh` declares under `dough-story-wrap-up/scripts/`
and `dough-land/scripts/` has `isDirectCliEntry` or is imported by one that
does, and `current-branch-publication.mjs` is neither declared nor present; `tests/execution-payload-update.sh` and `tests/story-payload-update.sh`
pass; the focused suites above stay green.

Accepted proof (2026-09-29): a one-off scan of `install.sh` found
`worktree-retirement.mjs` and `trunk-closure.mjs` as CLIs, `retirement-checks.mjs`
and `trunk-closure-settlement.mjs` imported by them, and
`current-branch-publication.mjs` neither declared nor present. Wrap-up, Land,
delivery, and guidance suites (102 tests), payload checks, credential-free
native suites, dashboard typecheck, and lint green.

Recovery: `current-branch-publication.mjs`, with `commitOwned`, is recoverable
at `b269991d:src/skills/dough-execute-plan/scripts/current-branch-publication.mjs`.
Deleted tests' cases are covered by `trunk-closure*.test.mjs`,
`worktree-retirement.test.mjs`, and `closure-story-branch-cleanup.test.mjs`;
two uncovered cases were ported (a stopped refresh still retiring after the
receipt, and Story Branch retirement on a named non-default remote, now in
`closure-story-branch-named-remote.test.mjs`). The in-memory active-observer
refusal was dropped with the observer interface; `finish` retires only after a
confirmed-shutdown receipt. `closure-publication-fixtures.mjs` became
`closure-git-fixtures.mjs`, and `recordedCheckoutIdentity` left
`publication-git.mjs` for its only test consumer. A whole-payload entry-point
check would flag 32 modules that use other entry conventions, so no lasting
check was added.

### 6. Native evidence identity covers what each closure journey proves
Type: Structure
Status: done
Proof: `tests/native-evidence-identity.sh` fails when a named guidance or command input of the owned-context, trunk-closure, or Story Branch closure identity changes without changing that identity, and passes after the fix.

Correction: plan 142's retrospective found recorded native evidence stays
bound after the guidance it proved changes (ADR 0005 §5), because identities
omit inputs their journeys exercise (premise table). Enables slice 8, whose
recorded evidence must go stale when that guidance next changes.

Add to the owned-context identity `exploration-workspace.md`,
`preparation-workspace.md`, `maintain-default-checkout.md`, and this story's
`dough-land/scripts/worktree-retirement.mjs`; to the trunk-closure identity
`dough-land/SKILL.md`, `exploration-workspace.md`, `worktree-retirement.mjs`,
and `trunk-closure.mjs`; to the Story Branch closure identity
`dough-land/SKILL.md`, `exploration-workspace.md`, and
`worktree-retirement.mjs`. Keep each journey's
guidance inputs in one list its writer prints. Add the owned-context writer to
`tests/native-evidence-identity.sh`'s writers, and extend that test so changing
each listed guidance input changes its journey's identity, as it already does
for supervision inputs. No journey behavior changes.

Accepted proof (2026-09-29): `tests/native-evidence-identity.sh` reported 14
omissions against the pre-change writers in a scratch copy and passes now; a
writer printing a fixed hash for a listed input also fails it. The three
closure identities share Dough Land's inputs (`dough-land/SKILL.md`,
`worktree-retirement.mjs`, `retirement-checks.mjs`, `exploration-workspace.md`,
`maintain-default-checkout.md`) through `git_publication_land_input_hash_lines`
in `tests/support/git-publication-native-shared.sh`; owned-context adds
`preparation-workspace.md`, and trunk closure adds `trunk-closure.mjs` and
`trunk-closure-settlement.mjs`.

Learnings: before this slice, trunk was merged into the story branch at
`28fb01ae`, bringing plan 147's creation record; the substitutes now retire
from that record alone, passing `--identity` without `--created-for-work`. All
recorded evidence for `trunk-closure/*`, `story-branch-closure/*`,
`publication/startup-owned-context`, and `publication/preparation-land` is now
stale, as slice 8 expects. The identities still omit commands the listed
guidance names (`execution-increment-delivery.mjs`, `ci-mailbox.mjs`,
`execution-start.mjs`, `preparation-assignment.mjs`) and the closure commands'
imports; a rule deriving those from the guidance is a retrospective candidate.
Plan 149 exports `createdForRoot` from `workspace-publication-ownership.mjs`;
once it reaches trunk, `retirement-checks.mjs` imports it instead of its own
literal.

### 7. Closure harnesses observe the agent from outside its fixture
Type: Structure
Status: planned
Proof: credential-free `tests/git-publication-native.sh` default mode green for trunk closure, Story Branch closure, and execution review; a substitute run whose worktree is already removed still stops its observer; a Codex-shaped substitute whose PATH drops the node wrapper still records the command calls.

Correction: plan 142's harness repairs reached only trunk closure, and their
absence caused four false native failures there (premise table). Enables
slice 8's paid runs, which judge the Story Branch and trunk-closure journeys
through these observations.

Share trunk closure's repairs with the Story Branch closure and
`execution-review` (ci-completion) fixtures through one helper rather than a
copy per fixture: stop a live observer by mailbox without entering the
possibly-removed worktree; record node calls in process through
`native-node-call-recorder.mjs` via `NODE_OPTIONS`, restoring it afterwards;
keep node, gh, control, and transcript files in a harness directory outside the
agent-visible fixture root; and stop exporting `TRUNK_CLOSURE_TRANSCRIPT`,
`STORY_CLOSURE_TRANSCRIPT`, and `CI_COMPLETION_TRANSCRIPT`, which only the
runner's own controllers read. Add the helper to the identities slice 6 lists.
Assessors keep their counterexamples.

### 8. Native acceptance of the changed closure and Land guidance
Type: Behavior
Status: planned
Proof: fresh host runs judged accepted on Claude Code, Codex, and Cursor, with host version and candidate SHA recorded here. Paid and manual; needs Terry's run authority at execution time, and slices 6 and 7 done first.

Behavior: On each host, from installed candidate guidance, a completed Trunk
Mode story is wrapped up → the agent publishes the before-cleanup commit
through `deliver`, runs `finish` once, and the assessor observes final
acceptance, one completion receipt with confirmed shutdown before cleanup, and
the worktree and branch retired. A preparation keep lands and retires its
worktree through the `retire` command, and a Story Branch wrap-up
integrates and then retires through it.

Run `trunk-closure/source`, `trunk-closure/owned-context`,
`story-branch-closure/source-conflict` (its wrap-up retirement guidance
changed in slice 2), and `publication/preparation-land` on each host. One
attempt per host and case; pin the candidate SHA and CLI version; delete run
output after judging. Command:
`PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native <codex|cursor|claude> --case <case> --results-dir <dir>`.
Never in `scripts/test.sh`, CI, or a loop.

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Example 1: Trunk closure publishes both, one receipt, then retires | 3: `finish` CLI test; 8: native trunk-closure journeys |
| Example 2: Story Branch retirement removes worktree, local and remote branch | 2: `retire --remote-branch` CLI test; 8: native Story Branch closure journey |
| Example 3: publication conflict preserves resources and names recovery | 3: `finish` conflict CLI test |
| Example 4: uncontained tip refused, nothing removed | 1: `retire` CLI test |
| Example 5: one work-scoped ownership gate retires created-for-this-work, retains reused, host-owned, or unrecorded | 1: `retire` creation-ref, other-work-ref, flag-only, and unrecorded CLI tests; 2, 3: wrap-up callers pass the identity and flag |
| Before-cleanup accepted before spent history is deleted | 3: `finish` stops when trunk lacks it; guidance keeps `deliver` first |
| Retirement only after confirmed shutdown in wrap-up | 3: retained and unconfirmed receipt tests; native counterexample |
| Rerun pushes nothing twice and completes cleanup | 1: already-absent rerun; 4: interruption reruns |
| Land and wrap-up retire through one installed core | 1, 2, 3: all retirement tests reach `worktree-retirement.mjs` |
| No shipped closure module without an entry point | 5: payload scan of declared wrap-up and Land scripts; `current-branch-publication.mjs` removed |
| Wrap-up and Land guidance keep only judgment steps | 1–4: behavior review of edited sections |
| Native evidence goes stale when the guidance or commands it proved change | 6: `tests/native-evidence-identity.sh` per-input check |
| Closure harness observations hold across hosts before paid runs | 7: default-mode substitutes for removed worktree and PATH-dropping login shell |
| Changed guidance accepted natively on three hosts | 8 |
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
- **Predecessors.** Plans 142 and 145 have landed, and the start gate records
  the shapes slices 1 and 3 build on.
- **Paid runs.** Slice 8 needs separate run authority at execution time, and
  runs only after slices 6 and 7, so a failure reflects the guidance, not the
  harness.
- **Ownership fact source (readiness review, 2026-09-29).** Plan 147's story
  names this command as the reader of its creation ref, and plan 147 excludes
  the command, so waiting for it to land and then choosing a source would leave
  the reader unowned. Slice 1 reads the ref itself; its tests write the ref
  with `update-ref`, so they do not depend on plan 147's writer. Until that
  writer lands, a worktree without a ref retires only with `--created-for-work`
  from a recorded creation, and otherwise fails safe by retaining.
- **Concurrent plan 147.** It edits Dough Land's **Worktree** input,
  `exploration-workspace.md`, and the owned-context native fixtures while this
  plan edits Land's "Retire the worktree" and, in slices 6–8, the same native
  journeys and identities. Each slice re-reads those files on then-current
  trunk. Slice 8's owned-context runs carry the creation ref once plan 147's
  slice 3 lands; if it has not landed by slice 8, those runs keep their stated
  creation and pass `--created-for-work`.
- **Size.** The enrichment adds two small Structure slices and one gate to
  slice 1, for eight slices. Slice 7 touches three fixtures but applies one
  shared helper; the ci-completion fixture is included so the harness keeps
  one observation rule, though this story runs no `execution-review` journey.

No blocking slice-specific concern remains in this review.
