# Preserve live agent profiles when integrating stories

**Identity:** SEED-010#preserve-live-profiles-during-integration

**Source:** [Refined story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#preserve-live-profiles-during-integration)

## Goal and scope

Integrating a story while another is Taken or Preparing keeps the other
story's agent profile in `agents/`, and an integration result that still
holds a profile under `done/` is held before it is committed by the merge
adapter's `continue` or pushed by publication. A valid completion keeps
publishing its done record and releasing its own profile. Both findings
([ODF-430](../../../docs/maintainer/findings/ODF-430.md),
[ODF-451](../../../docs/maintainer/findings/ODF-451.md)) record the delivered
response.

Excluded, as the story records: repairing past trunk history, changing the
profile or done-record format, a dedicated rebase or cherry-pick guard, and
detecting a live profile deleted outright.

## Current decisions

- Prevent at the cause. Git's merge infers an `agents/ → done/` directory
  rename when one side replaces the last profiles in `agents/` with done
  records, then moves the other side's new profile into `done/` and reports a
  file-location conflict. The merge adapter runs its `git merge` with
  directory-rename inference off for that invocation
  (`-c merge.directoryRenames=false`), leaving the user's Git configuration
  alone. Ordinary file renames stay detected. The publication candidate
  already merges through this adapter whenever `done/` changed on either side
  (`history-preserving-candidate.mjs`), so no second merge path changes.
- Hold through one domain rule beside the done records: a file under the
  done directory that parses as an agent profile is misplaced, and its home
  is `agents/<file name>`. The product-backlog module owns the rule. The merge
  adapter's `continue` and publication's existing candidate check
  (`completedIdentityStop` in `publication-backlog-validation.mjs`, used by
  the history-preserving, execution-increment, and resume publishers) apply
  it. Neither repairs; each stop names every misplaced path and its home and
  leaves Git state as it already does for other refusals.
- Arrange Git fixtures through the shared MakeMe and Git fixture helpers
  already used by the adapter and publication tests
  ([test data architecture](../../../tests/README.md#test-data-architecture)).
- Public guidance changes only where it describes the adapter's results:
  [merge conflicts](../../../src/skills/dough-product-backlog/references/merge-conflicts.md)
  gains the hold and what to do (move the profile back to its `agents/` path,
  then `continue`). Edit `src/skills/`, not installed copies.

## Decisive premises

Observed 2026-11-08 in this preparation worktree at `bd423bd94`, Git 2.50.1,
Node 24.21.0.

- **The adapter reproduces ODF-430 today.** A scratch repository with a real
  backlog, catalog, and profiles: base `agents/pyo-chan.json`; `main` replaced
  it with `done/SEED-A_a.json` (Git: 56% rename); story branch added
  `agents/joey-chan.json`. Running
  `src/skills/dough-product-backlog/scripts/product-backlog-git-merge.mjs merge --ref main --file .planning/PRODUCT-BACKLOG.md`
  exited 1 with `blocked` ("Something unrelated … still unresolved"), index
  `D agents/joey-chan.json`, `AU done/joey-chan.json`. Staging that path is
  exactly the resolution both trunk commits `e6948bfce` and `0b4ba8d1b`
  carry (100% renames `agents => done`).
- **Disabling inference removes it.** In the same repository and state,
  `git -c merge.directoryRenames=false merge --no-commit --no-ff main` merged
  cleanly with `agents/joey-chan.json` kept and the completion's rename
  intact. This is a raw-merge proxy for the adapter: the adapter's only
  differences are merge drivers registered for the backlog file and the done
  catalog, which do not take part in rename detection for `agents/` paths.
  Slice 1's adapter test confirms it in the consuming form.
- **Rebase and cherry-pick do not misplace.** A minimal scratch repository
  with the same shape: default `git rebase main` and `git cherry-pick` of the
  take commit both kept `a/joey.json`. Hence no rebase or cherry-pick change.
- **Publication stops before push on the existing check.**
  `bash scripts/test.sh src/skills/dough-execute-plan/scripts/publication-completed-identity.test.mjs tests/support/product-backlog-git-done-catalog.test.mjs`
  (Homebrew Bash 5 first on `PATH`, `GIT_ALTERNATE_OBJECT_DIRECTORIES` unset)
  passed: all three publishers return the `completedIdentityStop` result
  with no receipt and the checkout unchanged after a manual merge
  resolution. Slice 2 extends that function and the same test family.

## Outside-in proof

| Promise (seed example) | Owner | Observable signal |
| --- | --- | --- |
| Inferred directory rename keeps the live profile (1) | Slice 1 | Adapter `merge` on the fixture above answers `accepted`; the merge commit holds `agents/joey-chan.json` with its original blob, `done/SEED-A_a.json`, a catalog listing A, and no `done/joey-chan.json`. Fails before the change with `blocked` and `AU done/joey-chan.json`. |
| Valid own completion still publishes (3) | Slice 1 | Same test family: the completing side's profile is gone from `agents/`, its done record and catalog entry are present, and another active profile stays. Existing done-catalog and merge tests stay green (example 4). |
| Misplaced hand resolution is held (2) | Slice 2 | Adapter `continue` after staging `done/joey-chan.json` refuses, naming `done/joey-chan.json` and `agents/joey-chan.json`, with the merge still uncommitted. History, execution-increment, and resume publishers each stop on a committed candidate with that file, naming both paths, with no receipt, no push, and the checkout unchanged. Restoring the profile lets `continue` accept. |
| Findings record the response (5) | Slice 3 | ODF-430 and ODF-451 each carry a dated delivered response naming the change, its containing release (unreleased after 0.3.91 until released), and the ordinary-use criterion. |

## Local gates

Run the focused families through the project runner,
`bash scripts/test.sh <paths>`, with Homebrew Bash 5 first on `PATH` and
`GIT_ALTERNATE_OBJECT_DIRECTORIES` unset: the touched
`tests/support/product-backlog-git-merge*.test.mjs`,
`tests/support/product-backlog-git-done-catalog*.test.mjs`, and
`src/skills/dough-execute-plan/scripts/publication-completed-identity.test.mjs`
plus any new test file. Run `npm run --silent format` and `git diff --check`.
Hosted CI runs the full suite after publication; its failures stay owned.

Follow the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. For any long local test run, start fully awake on macOS. On AC
use `caffeinate -s -i`. On battery, plug in or start fully awake with the lid
open under `caffeinate -i` and inspect the sleep log afterward.
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).

## Slices

### 1. Integration keeps a live profile when the other side completes a story

**Type:** Behavior

**Status:** pending

Given trunk completed the story whose profile was the last in `agents/` and
the story branch took another story, merging them through the adapter (and
so through publication's candidate merge) keeps the taken story's profile in
`agents/`, publishes the completion's done record and catalog entry, and
reports `accepted`. Write the failing adapter test first, then turn off
directory-rename inference on the adapter's merge invocation.

### 2. A profile under `done/` is held before commit or push

**Type:** Behavior

**Status:** pending

Given an integration result whose done directory holds an agent profile,
the adapter's `continue` refuses and each publisher stops before push, naming
every misplaced path and its `agents/` home; moving the profile back lets the
integration continue. Add the shared rule beside the done records, apply it
in `continue` and `completedIdentityStop`, and update the merge-conflicts
reference with the new stop and its repair.

### 3. Both findings record the delivered response

**Type:** Behavior

**Status:** pending

After slices 1–2, ODF-430 and ODF-451 each gain a `### Delivered response`
section with the date, story, commits, containing release, and the
ordinary-use criterion: the next observed concurrent integration in which
one side completes a story while another is active keeps that profile in
`agents/` and adds no profile to `done/`. Their **Follow-up** lines say the
response is delivered and not yet resolved by ordinary use.

## Preparation review

Slice-plan refinement was not needed: each slice owns one observable outcome
with its own proof loop, the prevention and the hold share no special-case
rule, and the records slice depends only on the delivered commits. No
remaining slice-specific concern surfaced.
