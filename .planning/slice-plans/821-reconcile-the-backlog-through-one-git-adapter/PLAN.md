# Reconcile backlog merges and rebases through one Git adapter

**Identity:** SEED-423#reconcile-the-backlog-through-one-git-adapter
**Source:** [Reconcile backlog merges and rebases through one Git adapter](../../seeds/SEED-423-shrink-the-installed-distribution.md#reconcile-the-backlog-through-one-git-adapter)

## Execution context

- Story Branch Mode in the Dashboard-established worktree
  `/Users/terryyin/git/open-dough/.worktrees/reconcile-backlog-merges-and-rebases-through-one`,
  branch `codex/reconcile-backlog-merges-and-rebases-through-one`.
  The separate integration checkout is `/Users/terryyin/git/open-dough`.
- Airi-chan, publisher `dashboard-territory.local-open-dough`.
  Starting revision `6e146d8ba709e5b3ca285238089ef95a9d618756`.
  Take accepted on `origin/main` and the story branch at
  `0b2306e5712c3a6993184dc31c999d748a12db3e`.
- GitHub Actions `ci.yml` (CI), observing the story branch as
  `seed-423-airi-421098b1` from this checkout. Observer directory
  `/tmp/dough-ci-501/watch-u95qvY`, PID 9875, cell `g229:14`,
  session `73711`.
- Replanning permission follows the existing plan. The retirement and the
  later merge/rebase slice are compatible. Git's ongoing-operation checks
  still serve landing and checkout maintenance.

## Goal and scope

Maintain one Git reconciliation path behind the installed merge and rebase
commands. Retire the cherry-pick adapter and the unused rebase endpoint
overrides. Preserve compatible backlog and done-record changes, recoverable
stops and explicit resolution, even when a text merge or each step of a
rebase appears clean. Backlog policy, publication retries, and installer
behavior have separate owners.

## Current decisions

- Reuse `mergeBacklogs` and the registered backlog and catalog drivers.
  The Git adapter shares registration, the unmerged-path check, staged
  candidate validation, and CLI dispatch and diagnostics. Build on
  `product-backlog-git-cli.mjs`, `product-backlog-git-candidate.mjs` and
  `product-backlog-git-repository.mjs`.
  Merge owns its ancestry checks and uncommitted candidate. Rebase owns its
  replay range, real stopped revisions, and comparison of the finished tip
  with the reconciliation of the original endpoints. A human's staged
  decision goes through the readback check once. It can override the
  automatic decision and the rebase can still report another replay stop.
- Keep the merge and rebase entry paths used by history-preserving
  publication, suffix reconciliation, and startup retry. Keep the existing
  flags for selecting the checkout, backlog path, branch and replay cutoff.
  Preserve the result names, exits, successful receipt without diagnostics,
  and Git and hook diagnostics on failure. The catalog still belongs to the
  merge commit or, where needed, a separate rebase tip commit with the
  existing developer credit. Git operation detection for landing and
  refresh continues to protect in-progress work.
- The installed directory is the payload inventory. Delete files at their
  source and use ordinary install and update to deliver the change. Edit
  the existing guidance and any affected anchors in place. Keep one
  procedure for invocation, stop and recovery. Delete private state,
  generic parameters with a single fixed use, forwarding code, superseded
  comments, tests and dead references with the change that obsoletes them.
  Keep historical release and evidence records with their recorded revisions.
  Compare the total shipped lines of code and guidance serving the operation
  with the baseline, including renamed or moved files.
- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  supports one backlog model and one adapter over it.
  [ADR 0004, Client installation and update](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  requires a standalone shared payload.
  [ADR 0006, Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  gives the procedure one home.
  [ADR 0005, Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  supports exercising the installed commands and checking the guidance with
  one representative journey through invocation and recovery.
- Follow the North Star topics [Make production code directly testable
  instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Exercise the real Git, CLI and publication boundaries under the maintained
  Distribution runner with the existing fixtures.

## Baseline and decisive premises

Observed in the preparation checkout at `9ba3fba87` on 25 November 2026
with Node 24.21.0, Apple Git 2.50.1, and Bash 5 on AC power.
The `product-backlog-git-*.mjs` scripts totaled 1,862 shipped lines, of
which the three cherry-pick modules accounted for 392 before their private
state code. The backlog skill and its merge-conflict reference totaled 482
lines. The installed help and backlog guard also named the retired adapter.
The whole-payload caller trace found the cherry-pick command only in its
own implementation, guidance and tests. The endpoint flags appeared only
in rebase parsing, its usage and guidance.

| Consuming operation | Observed result |
| --- | --- |
| Fresh installation and update | `bash install.sh --target <scratch> --source "$PWD" --platform codex` installed byte-identical merge, rebase and cherry-pick entries in both installed roots. Each installed `node <entry> --help` ran successfully. `update-removes-dropped-files.sh` confirmed normal update removes release-owned files absent from the new payload. The retirement slice verifies the actual dropped names with that mechanism. |
| Git merge and stopped resolution | The real CLI kept concurrent closures, rebuilt the catalog from done records, preserved a live agent profile in `agents/` and left stopped merges recoverable. Bypassing backlog driver registration failed both `merge stops` cases for the clean duplicate move and clean direction dispute in `product-backlog-git-merge.test.mjs`. |
| Git replay and readback | The real CLI exercised linked worktrees, `--onto` with a named branch, clean aggregate refusal, later conflicts, read-only validation and catalog rebuilding. Suppressing the aggregate refusal failed both `rebase stops` cases in `product-backlog-git-rebase-clean.test.mjs`. Suppressing staged/worktree equality failed both `human recovery refuses a staged candidate` cases in the merge-conflict and rebase files. |
| Publication through the entry paths | Story Branch closure and the done-catalog publication test reached the merge entry, including stop and continue. Temporarily refusing the primary rebase verb failed the managed delivery sibling-backlog case in `execution-increment-managed-delivery-reconciliation-stops.test.mjs` and the `remote advance replays an owned suffix` and `a rival holding a different agent name` cases in the startup race and startup agent race files. The distinct-claims race can rebuild its Take, so use the cases that discriminated for startup replay. |

The baseline ran `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES
PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i
bash scripts/test.sh <paths>` on the Git cases, installed guard and payload
checks, preparation publication, and the reviewed publication cases below.
All 31 jobs passed with 94 Node case passes. The targeted startup agent race
case also passed. The table's scratch probes ran `node --test
--test-name-pattern <named case> <test path>` on disposable fixture repos
from this checkout. The affected cases passed with the original source
restored, and `git diff --exit-code HEAD -- Distribution/src` confirmed
pristine product source.

## Slices

Trace each affected command, link, exported symbol and receipt through
[consumer tracing](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
The local gate is the focused Distribution checks below, post-change
refactoring, and ordinary commit hooks. Use the
[macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
with Bash 5 on PATH. Run long checks under `caffeinate -s -i` on AC power.
On battery keep the lid open under `caffeinate -i` and inspect the sleep log.
Apply the [failing and flaky test policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

### 1. Install and update without the backlog cherry-pick adapter

Type: Behavior
Status: done
Proof: Install the candidate in a disposable repository and update a
disposable installation from a release fixture containing all three retired
modules. Verify their absence in both installed roots, usable merge and
rebase entries, and a denial from the installed backlog guard that directs
the agent to supported tooling. Use `update-removes-dropped-files.sh`,
`payload-declaration-links.sh`, `product-backlog-native.sh`, and the rebase
cases in `product-backlog-git-done-catalog-replay.test.mjs`.

Delete the cherry-pick entry, stop and aggregate modules, private sequencer
reader, dedicated fixtures and tests, and cherry-pick-only cases in the
mixed catalog replay file. Remove all live mentions, including the backlog
skill, conflict reference, help, guard receipt and now-inaccurate code
comments. Keep shared catalog and Git state readers used by merge, rebase
or checkout maintenance. Review the installed instructions under the
[skill authoring behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review).
Estimated active effort 8–12 minutes.

Accepted implementation proof at `0b2306e57` with the slice changes:
`update-removes-dropped-files.sh` observed all three names before update
and their removal from both installed roots. `product-backlog-native.sh`
proved fresh absence, both remaining entries' help, and the installed
guard's denial. Payload links and rebase catalog cases passed. The installed
merge walkthrough stopped on a disputed title, then committed a third
title supplied by the developer with two parents and empty success stderr.
The focused rebase and refresh checks passed, including the real worktree
rebase stop and `CHERRY_PICK_HEAD` refresh deferral.
Proof and consumer trace are under `open-dough/evidence/slice-1-report.md`
in the execution worktree's Git directory. At this boundary the shipped
Git scripts went from 1,862 to 1,397 lines and guidance from 471 to 446
lines compared with the Take.

### 2. Reconcile merge and rebase through the same adapter

Type: Behavior
Status: planned
Proof: Exercise the installed merge and rebase forms, including continuation
from a conflict and read-only validation after a disputed replay. The two
removed endpoint flags disappear from help and are refused before Git
changes state. With `--onto` and a named branch, Git replays only the owned
suffix, preserves the destination's sibling change, and checks the original
branch tip and destination; a refused replay keeps the original branch
recoverable. Run the remaining `product-backlog-git-*.test.mjs` checks
under `Distribution/tests/support/`, including the real driver lifetime,
catalog and authorship cases.

Run managed delivery's `execution-increment-managed-delivery-reconciliation{,-stops}.test.mjs`,
`publication-racing-suffix.test.mjs`, and the startup race and startup agent
race cases that reach rebase in `Distribution/tests/skills/dough-execute-plan/`.
Run `closure-story-integration*.test.mjs` for the Story Branch merge path
and `preparation-publication.test.mjs` for preparation release and landing.
Run `native-evidence-identity.sh` to confirm the native acceptance inventory
still follows both entry paths to the implementation, and
`payload-declaration-links.sh` for guidance. Keep the representative
installed guidance walkthrough on the supported commands.

Make the entry files thin over the common path. Keep the merge-only
authorship and catalog staging and the rebase-only replay and aggregate
decision with their operation. Collapse the generic aggregate wrapper into
its sole rebase responsibility if it has no other live caller. Keep the
stage and worktree equality rule and the before/after Git boundaries above.
Shorten the existing guidance sections as the unused options go away.
Estimated active effort 12–15 minutes.

## Plan review

Separate refinement was unnecessary. Retirement is a complete first
delivery, and the second slice uses the same resolver and recovery rules
for the remaining supported commands. No remaining slice-specific concern
was identified.
