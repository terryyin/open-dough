# Make every check's shell and Git environment explicit and reproduce CI's platform with one command

## Source

**Identity:** SEED-048#explicit-test-environment

[Refined story](../../seeds/SEED-048-explicit-test-environment.md#explicit-test-environment),
refined with the maintainer on 2026-09-27. The instruction authorizes
refinement, planning, and plan refinement, not implementation.

## Goal and scope

A maintainer or agent running checks locally gets the result CI would give,
whatever their Git configuration or default Bash, and reproduces a remaining
CI-only difference on CI's platform with one command. Included: one Git
environment set by `scripts/test.sh`; chosen checks through the runner; one
diagnosis-only container command for chosen checks, the suite, and the
dashboard browser suite; and a behavior-only assertion in
`ci-repair-stash.test.mjs`.

Excluded: containers for ordinary runs, a macOS CI runner, pinning CI's Git,
a Bash prelude per check file, a suite-wide wording sweep, local Git launcher
timing, and lint in the container. Shipped product and installer scripts keep
supporting macOS Bash 3.2. Paid native-agent runs stay manual and unverified
by this plan.

## Outside-in proof

| Promise | Owning slice and observable proof |
| --- | --- |
| The stash check proves a failed save by behavior under any supported Git | 1: fails first, then passes, under Git 2.39 in `node:24-bookworm`; passes locally and on CI |
| Every check the runner starts sees CI's Git state regardless of the machine's global config | 2: runner check with a hostile `HOME/.gitconfig`; full local suite green with the maintainer's real global config |
| A check that commits without its own identity fails locally as on CI | 2: the same runner check's identity-less commit fails |
| Chosen checks run alone through the runner, under the Bash floor and Git environment | 3: runner selection check; `tests/test-runner-bash.sh` extended to a selected run |
| A focused run is not judged against the suite budget; an unknown path fails by name | 3: runner selection check |
| One command reproduces CI's platform for chosen checks and the suite from a linked worktree | 4: automated check of the refusal and CI-version agreement; manual demonstration from this linked worktree |
| The dashboard browser suite reproduces CI's font-dependent layout, or the README states it does not | 5: manual demonstration reverting `15362af`'s layout fix |

## Current decisions and existing solution

- **Existing solutions (PFE).** `configure_fixture_git`
  (`tests/helpers/release-fixture.bash`) sets identity and
  `maintenance.auto false` per fixture; the tests README tells maintainers to
  export `GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1` by hand;
  `scripts/test.sh` already enforces Bash 5 for the whole run; the runner
  tests substitute checks through `OPEN_DOUGH_TEST_DIR`. Extend the runner
  rather than adding a wrapper or a per-check prelude. `nektos/act` was
  considered for reproduction and rejected: it runs whole workflow jobs in
  its own large images and cannot run one chosen check.
- **Git environment.** The runner exports `GIT_CONFIG_GLOBAL=/dev/null`,
  `GIT_CONFIG_NOSYSTEM=1`, and `GIT_CONFIG_COUNT` entries for
  `maintenance.auto=false`, `gc.auto=0`, and `user.useConfigOnly=true`. The
  last one makes a missing identity fail on every machine instead of Git
  deriving one from a macOS `.local` hostname; CI already fails there because
  its hostname has no domain. No identity and no `init.defaultBranch` are set,
  matching CI. `configure_fixture_git` keeps identity and drops its
  maintenance setting; the README's manual export advice is replaced.
- **Selection.** `scripts/test.sh [path…]` runs exactly the named shell or
  `node --test` files (kind by extension), with the same job scheduling and
  silence rule. The time budget applies only to a full run. A path that is
  not a file fails the run naming it, before any check starts.
- **Container.** `scripts/ci-container.sh [--dashboard] [path…]` builds a
  cached image from `ubuntu:24.04` with Git from the `git-core` PPA (as
  GitHub's runner image installs it), `jq`, Node 24, and Playwright Chromium
  installed with `--with-deps` as CI does. It mounts the checkout and, for a
  linked worktree, the common Git directory at their host paths, keeps
  `node_modules` in a container volume so host modules are neither used nor
  overwritten, runs `npm ci`, prints the Git and Node versions, and then runs
  `scripts/test.sh` with the given paths, or the dashboard typecheck, build,
  and browser suite with `--dashboard`. It runs as the host user with a
  container-local `HOME`, so files it writes in the checkout stay the
  maintainer's. It uses the host's native container architecture (aarch64
  under Colima here, while CI is x86_64); slice 5 decides whether an
  `--amd64` option is needed. The Ubuntu and Node versions are stated once in
  the script and checked against `.github/workflows/ci.yml`.
- **Architecture.** No new consequential direction: this is test
  infrastructure within the existing runner. No North Star topic applies;
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
  fast-feedback principle is served by keeping the container out of ordinary
  runs.

## Ordered slices

### 1. The stash check proves a failed save by behavior
Type: Behavior
Status: done
Proof: Before editing, run the check in `node:24-bookworm` (Git 2.39) with
the worktree mounted, and record the wording failure at
`ci-repair-stash.test.mjs:135`. After the change, the same command, the
focused local run, and CI pass.

Behavior: an index lock blocks the save → the stash helper saves →
status `failed`, exit 1, no recorded `oid`, and the foreign stash and dirty
files unchanged, asserted without Git's error text. Keep the helper's
reported error non-empty so a maintainer still sees Git's reason.

Accepted proof (2026-09-27): before the edit, `docker run --rm --user
$(id -u):$(id -g) -e HOME=/tmp -v $W:$W -w $W node:24-bookworm bash -c 'git
--version && node --test src/skills/dough-execute-plan/scripts/ci-repair-stash.test.mjs'`
(Git 2.39.5) failed only at line 135: `saved.error` was `Command failed: git
stash push --include-untracked -m …`, not matching `/could not write
index|index\.lock/`. After the edit (`assert.match(saved.error, /\S/)`), the
same file passes 7/7 in that container and 7/7 locally (Apple Git 2.50.1). The
refactor pass gave both fixture repositories one `initFixtureRepo` helper with
repository-local identity, bringing the file to the 250-line limit.

### 2. Every check the runner starts sees CI's Git state
Type: Behavior
Status: planned
Proof: New `tests/test-runner-git-environment.sh` runs the runner over
substitute checks with `HOME` holding a `.gitconfig` that sets
`maintenance.auto true`, a user identity, and `init.defaultBranch trunk`.
The substitute check observes no global identity, `maintenance.auto` false,
and Git's default branch rather than `trunk`, and its identity-less commit in
a fresh repository fails. Then the full local suite passes with the
maintainer's real global configuration, and CI passes.

Behavior: any global or system Git configuration → `npm test` → every check
runs with no global or system configuration, background maintenance off,
and identity only from what the check itself sets. Remove the maintenance
line from `configure_fixture_git` and replace the README's manual export
advice with the runner's guarantee.

### 3. Chosen checks run alone through the runner
Type: Behavior
Status: planned
Proof: New `tests/test-runner-selection.sh` over substitute checks, with a
budget that a full run breaches: selecting one shell check and one
`.test.mjs` file runs only those, reports no budget breach, and exits 0; the
selected shell check sees the slice 2 Git environment; a missing path fails
naming it and starts no check. Extend `tests/test-runner-bash.sh` so a
selected run under a Bash 3.2 child stops before any check with the existing
message.

Behavior: `npm test -- tests/<name>.sh` → only that check runs, under the
Bash floor and Git environment, without the suite budget. The tests README
names the runner as the way to run any check and states that a direct
`bash tests/<name>.sh` is unsupported.

### 4. One command runs chosen checks on CI's platform
Type: Behavior
Status: planned
Proof: Automated `tests/ci-container.sh` (no container runtime needed): with
no `docker` on `PATH`, the script exits non-zero naming the missing runtime;
and its stated Ubuntu and Node versions match `.github/workflows/ci.yml`.
Manual demonstration, recorded here with commands and results: from this
linked worktree, `scripts/ci-container.sh tests/test-runner-bash.sh` prints
the Git and Node versions and passes, and a check that reads the checkout's
own Git history (`scripts/check-self-installation.sh`) passes, showing that
the worktree's `.git` file resolves (it reads release tags from the common
Git directory); after the run, `git status` shows no new files and no file
owned by another user. One whole-suite run follows: a failure caused by
container setup is fixed in the script; any other difference from CI is
recorded here with its check and output and stops this slice for the
maintainer's judgment, since repairing product or check behavior is outside
this slice.

Behavior: a check fails only on CI → `scripts/ci-container.sh <path>` from
any checkout → it runs on CI's platform without manual setup. The tests
README replaces its "check in a Linux container such as `ubuntu:24.04`"
advice with this command and states that it is for diagnosis only.

### 5. The dashboard browser suite runs on CI's platform
Type: Behavior
Status: planned
Proof: Manual demonstration: on a scratch commit reverting `15362af`'s
layout fix, `scripts/ci-container.sh --dashboard` fails the 320 px checks
that CI failed at `762253a` and `bfdf893`; on the current revision it passes.
If the reverted layout passes natively, repeat once on `linux/amd64` (CI's
architecture); when that reproduces the failure, add `--amd64` and name it in
the tests README for layout checks. If neither reproduces it, record both
attempts and state in the tests README that font-dependent layout differences
are not reproduced; the command still runs the suite. The scratch revert
never leaves the workspace.

Behavior: a dashboard check fails only on CI → `scripts/ci-container.sh
--dashboard` → the typecheck, build, and browser suite run as CI runs them.

## Learnings

- **The Git environment breaks no current check (planning proof,
  2026-09-27).** At `98c22d4`, on this macOS machine with the maintainer's
  real global Git configuration and Homebrew Bash 5 first on `PATH`:
  `GIT_CONFIG_GLOBAL=/dev/null GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_COUNT=3
  GIT_CONFIG_KEY_0=maintenance.auto GIT_CONFIG_VALUE_0=false
  GIT_CONFIG_KEY_1=gc.auto GIT_CONFIG_VALUE_1=0
  GIT_CONFIG_KEY_2=user.useConfigOnly GIT_CONFIG_VALUE_2=true npm test`
  exited 0 with no failing check. It printed only the local budget report
  (the machine was loaded; SEED-046 owns that report). Slice 2 therefore
  needs no check repairs for identity or configuration; its runner check
  still owns the proof.
- **Git 2.39 does not always carry Git's reason into the stash helper's error
  (slice 1, 2026-09-27).** Under Debian's Git 2.39.5 the failed save's error
  held only Node's `Command failed: …` line. The check now asserts a non-empty
  error, which holds; making the helper surface Git's stderr on every version
  is outside this story.
- **Container mounts (slice 1, 2026-09-27).** A linked worktree mounted alone
  cannot resolve its `.git` file (`fatal: not a git repository`), as slice 4
  plans. One agent's host-path mount under Colima ran the tests while another
  reported node "Could not find" the file at the host path and succeeded with
  `/work`; slice 4 must confirm host-path mounting from this worktree before
  relying on it.
