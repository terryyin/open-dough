---
id: SEED-048
status: active
planted: 2026-09-27
planted_during: Maintainer review after SEED-037's wrap-up (plan 107)
trigger_when: A check behaves differently locally and on CI because of the shell, Git, or operating system it runs on
scope: 1 story
---

# SEED-048: Give the suite one explicit test environment

## Why This Matters

Developers and agents run the suite on macOS with whatever Bash and Git a
machine has, while CI runs Ubuntu 24.04 with a newer Git. Checks that depend
on something they never state (global Git config, background maintenance,
tool message text, process listings) pass on one side and fail on the other,
usually only on CI, where a failure is slow to see and slow to reproduce. In
SEED-037 alone this caused about six separate diagnosis cycles, the worst
costing roughly two hours and blocking an integration.

## Alternatives and Decision

Make the environment each check needs explicit where checks start, rather
than making every machine identical. Running every check in a container,
adding a macOS CI runner, or pinning CI's Git would each cost speed or CI time
for problems the explicit environment already removes. Keep one scripted
CI-matching Linux run for diagnosis only.

Refinement on 2026-09-27 narrowed the proposal. The acute Git-maintenance
flake is already repaired in the automated suite (`bfdf893`), and main's
twenty CI runs before refinement held no Git, Git-version, or Bash failure;
two failures were the dashboard's 320 px checks under CI's fonts, which only
a CI-matching run reproduces. The recurring cost was slow diagnosis once a
CI-only failure appeared. So the story invests in one place every check
starts from and in the reproduction command. It drops a Bash prelude in every
check and a suite-wide "assert behavior, not wording" sweep.

## Stories

<a id="explicit-test-environment"></a>

### Make every check's shell and Git environment explicit and reproduce CI's platform with one command

**Identity:** SEED-048#explicit-test-environment
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/120-explicit-test-environment/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"51cff6f6fe636c31e1cb3c20d5c52a3169b4fd52f5476efd0aded70e0be04c15","plan":"d2357ccca00d4a10800359a2f6c3339a52b85a51ab23262b91671d826d358474"}}
```

**Goal:** A maintainer or agent running checks locally gets the result CI
would give, whatever their machine's Git configuration or default Bash, and
when a CI-only difference remains, reproduces it on CI's platform with one
command instead of hand-building a container. This keeps trunk's CI verdict
trustworthy for parallel agents publishing to it.

**Scope:**

1. **One Git environment where checks start.** `scripts/test.sh` gives every
   check it runs CI's Git state: no global or system configuration, and
   background maintenance off. It supplies no Git identity, because CI has
   none; a check that commits without setting one fails locally as it does on
   CI. Fixture helpers no longer need to turn off maintenance themselves.
2. **Chosen checks through the runner.** `scripts/test.sh` (and `npm test --`)
   accepts shell-check and `node --test` file paths and runs only those, with
   the same Bash-5 check and Git environment as a full run. A focused run is
   not judged against the suite's time budget. The tests README names the
   runner as the way to run any check; running a check file directly is
   unsupported.
3. **One CI-matching diagnosis command.** A script runs chosen checks, the
   whole shell and node suite, or the dashboard browser suite in an Ubuntu
   24.04 container with CI's Git version, Node 24, `jq`, and Playwright
   Chromium installed as CI installs it. It works from the default checkout or
   any linked worktree, and stops with a clear message when no container
   runtime is available. It is for diagnosis only and not part of `npm test`
   or CI.
4. **The stash check asserts behavior, not Git's wording.**
   `ci-repair-stash.test.mjs` proves a failed save by its status, recorded
   `oid`, and unchanged files, not by Git's error text, so it passes under
   Ubuntu 24.04's stock Git 2.43 as well as CI's Git.

**Key examples:**

1. A maintainer's `~/.gitconfig` sets `maintenance.auto true`, a user
   identity, and `init.defaultBranch trunk` → `npm test` → fixture
   repositories run no background maintenance and see the defaults CI sees;
   a check that commits without its own identity fails locally as on CI.
2. An agent's `PATH` resolves `/bin/bash` 3.2 → `npm test -- tests/<name>.sh`
   → the run stops at once naming the Bash it needs. With Bash 5 first on
   `PATH`, only that check runs, under the same Git environment as a full run.
3. A check fails only on CI → the maintainer runs the diagnosis command with
   that check from a linked worktree → it runs on CI's platform without manual
   container setup. Reverting `15362af`'s fix and running the dashboard
   browser suite through it shows the 320 px failure CI showed. If CI's fonts
   cannot be matched, the command still runs the browser suite, and the
   tests README says font-dependent layout differences are not reproduced.

**Constraints:**

- Shipped product and installer scripts keep running under macOS Bash 3.2;
  `src/install/open-dough-release-version.sh` already guards for it. The Bash-5
  floor applies to the test runner and checks only.
- Paid native-agent runs (`--native …`) stay manually triggered. They inherit
  the runner's Git environment when started through it, but no automated run
  verifies them.

**Out of scope:** running every check in a container; a macOS CI runner;
pinning CI's Git version; a Bash-version prelude in every check file; a
suite-wide sweep for message-text or output-format assertions beyond the stash
check; the macOS `/usr/bin/git` launcher's effect on local timing (SEED-046's
measurement concern); running lint (`shellcheck`, `shfmt`) in the diagnosis
container.

**Evidence (SEED-037, 2026-09-26 and 2026-09-27):**

- **Git background maintenance.** CI's Git 2.55 ran a detached auto-maintenance
  repack after a fixture commit, removing `.git/objects/xx` directories while
  a snapshot walked them; `tests/native-delivery-updated-use.sh` failed on CI
  in 1 of 4 runs and never locally. Repaired for that fixture by
  `configure_fixture_git` and pruning `.git` in snapshots; fixtures that
  commit with inline `-c` identity still leave maintenance on.
- **Git message text.** `ci-repair-stash.test.mjs` fails under Git 2.39 and
  2.43 because it matches Git's error wording.
- **Bash 3.2.** macOS `/bin/bash` 3.2 lets a failing standalone `[[ ]]` pass
  under `set -e` (finding ODF-061). `scripts/test.sh` refuses Bash older than
  5, but always runs the whole suite, so focused runs bypass it; every agent
  brief prepended `PATH=/opt/homebrew/bin`, and one measurement run silently
  did nothing under 3.2.
- **Operating-system output.** The dashboard's 320 px checks clipped a
  fraction of a pixel only with CI's fonts (red main at `762253a` and
  `bfdf893`, repaired in `15362af`).
- **Hand-built Linux reproduction.** Agents rebuilt a CI-matching container
  three times and each tripped on setup: a missing `jq`, installing Git 2.55
  from a PPA, and the worktree's `.git` file not resolving inside the
  container.

## When to Surface

Now: first in the product backlog, per the maintainer on 2026-09-27.

## Breadcrumbs

- SEED-037's measurements and repairs are recoverable at
  `e67796d:.planning/quick/107-cut-test-work-and-ci-wait/PLAN.md`; the
  auto-maintenance repair is `bfdf893`.
- Finding ODF-061 in `DearDough.md` (Bash 3.2 passing a failing assertion).
- SEED-046 (the next CI verdict round) relies on this story for CI/local
  parity.
