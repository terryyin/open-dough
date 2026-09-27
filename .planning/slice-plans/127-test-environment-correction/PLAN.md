# Keep product guards provable and the CI-platform command faithful

## Source

**Identity:** SEED-048#test-environment-correction

[Correction story](../../seeds/SEED-048-explicit-test-environment.md#test-environment-correction),
from the execution retrospective of
plan 120 (SEED-048#explicit-test-environment, recoverable at
`8de2d7f:.planning/slice-plans/120-explicit-test-environment/PLAN.md`) on 2026-09-27. Reviewed commits on
`claude/120-explicit-test-environment`: `c22256e`, `c5b8de3`, `818907d`,
`192b703`, `31c5435`, `6132490`, `1e2d7e4` (claim `c79cb5d` is provenance).
Planning only; executing it needs a separate instruction.

## Goal and scope

A passing local check still proves the product's own safeguards, and
`scripts/ci-container.sh` runs chosen checks and the dashboard suite as CI
does or refuses clearly, with the tests README stating each environment rule
once.

Included: the agent-credit check's isolation from the runner's Git settings;
the container command's refusal of a stopped runtime and of paths outside the
checkout; one stated dashboard step list checked against CI, run with CI's
`CI=true` settings; removing one redundant runner-fixture check; a coherent
tests README including how to refresh the cached image.

Excluded: forwarding options to a chosen check or giving direct `--native`
wrapper runs the runner's Git state (a maintainer decision, see findings);
reproducing CI's font layout; changing CI's jobs (plan 122 owns them); any
behavior change to shipped product or installer scripts.

## Current findings

1. **The runner's Git settings hide a product guard from its test
   (`818907d`).** `scripts/test-environment.bash` exports
   `user.useConfigOnly=true` through `GIT_CONFIG_COUNT`, and product code a
   check starts inherits it. `workspace-agent-authorship.mjs`
   (`developerCoAuthor`) passes its own `-c user.useConfigOnly=true` so a Take
   is refused instead of crediting a guessed `user@host.local`.
   `workspace-publication-startup-agent-credit.test.mjs` (`withoutDeveloper`)
   hides global and system configuration and identity variables but keeps the
   inherited `GIT_CONFIG_*`. Retrospective mutation: with the product's flag
   removed, `npm test --
   src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent-credit.test.mjs`
   still exited 0.
2. **A stopped container runtime is not refused clearly (`31c5435`).** With
   `docker` on `PATH` but no reachable daemon, the script prints its
   image-building line, then Docker's connection error, and exits 1. The
   story promises a clear message when no runtime is available.
3. **Paths outside the checkout are silently mishandled (`31c5435`).** A
   caller directory outside the checkout falls back to the checkout root, and
   an absolute path outside it is not mounted.
4. **The container's dashboard steps copy CI's by hand, without CI's settings
   (`31c5435`).** The Playwright install and typecheck, build, and browser
   steps mirror `.github/workflows/ci.yml`'s `dashboard` job with nothing
   checking them; `CI` is unset, so `forbidOnly` and CI's HTML report are off
   and a stray `test.only` passes in the container but fails CI.
5. **`tests/payload-declaration-links-suite-failure.sh` is redundant (older,
   `3dc3e85`, edited again here).** It copies the runner and `src/skills` to
   prove what `tests/payload-declaration-links.sh` (an undeclared link fails,
   named) and `tests/test-runner-failure-report.sh` (a failing check is
   reported and the run exits 1) already prove, and every new runner file needs
   a second fixture copy.
6. **The tests README repeats rules and nears its size limit.** The Git-state
   guarantee and the chosen-run budget rule are each stated twice, several
   lines are overlong, and the file is 247 lines against 250. It does not say
   how to refresh the cached image, whose Git and Node are fixed when built.

## Preserved promises and constraints

Plan 120's promises hold: every runner-started check sees CI's Git state and
the Bash floor; chosen checks run alone without the budget; the container
command is diagnosis only, from any checkout, as the host user, and its
automated check needs no runtime. Shipped scripts keep Bash 3.2 support. Paid
native runs stay manual.

## Outside-in proof

| Promise | Owning slice and observable proof |
| --- | --- |
| The agent-credit check fails when the product's own guard is removed | 1: mutation removing `-c user.useConfigOnly=true` fails the check through the runner; restored, it passes |
| A stopped runtime or an outside path is refused by name before any build | 2: `tests/ci-container.sh` with a substitute `docker` whose daemon probe fails, and with an outside path |
| The container's dashboard run uses CI's steps and settings | 3: `tests/ci-container.sh` compares the stated step list with the `dashboard` job's `run:` commands; manual `--dashboard` run fails on a scratch `test.only` |
| The runner keeps its report and link coverage without the fixture copy | 4: named surviving checks pass; README reads coherently under 250 lines |

## Current decisions

- Isolate the agent-credit check from inherited `GIT_CONFIG_COUNT` and its
  keys in the check itself, with a comment that it proves the product's guard;
  the runner's settings stay as they are.
- The container probes the daemon (for example `docker info`) before building
  and prints the same refusal family as a missing `docker`; it refuses a
  caller directory or path outside the checkout by name.
- The container states the dashboard commands once and runs them with
  `CI=true`; the shell and node suite keeps `CI` unset, so the CI-only time
  budget does not apply there.
- Plan 122 (SEED-046) has landed: CI splits the suite with
  `OPEN_DOUGH_TEST_SPLIT`, job listing and chosen paths live in
  `scripts/test-jobs.sh`, and the budget applies only to a CI run without
  chosen checks. Compare with the dashboard job's commands minus any shard
  argument, and run the container's suite unsplit. `SEED-046#ci-verdict-correction`
  is queued ahead and also touches the runner and CI's split; build on it if
  it lands first.
- Delete the redundant check and its README paragraph;
  `tests/test-runner-bash.sh` keeps copying the runner, `scripts/test-jobs.sh`,
  and `scripts/*.bash`.

## Ordered slices

### 1. The agent-credit check proves the product's own guard
Type: Behavior
Status: done
Proof: With `-c user.useConfigOnly=true` removed from `developerCoAuthor`,
`PATH=/opt/homebrew/bin:$PATH npm test --
src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent-credit.test.mjs`
fails on the refused-Take case; restored, it passes, locally and on CI.

Behavior: a workspace with no developer identity and the runner's Git
settings inherited → a Take → refused as `developer-identity-refused` only
because the product itself forbids a guessed identity.

### 2. The container command refuses what it cannot run
Type: Behavior
Status: planned
Proof: `tests/ci-container.sh` gains a substitute `docker` on `PATH` whose
daemon probe fails: the script exits non-zero naming the unavailable runtime
and never attempts a build; a path outside the checkout exits non-zero
naming it. Manual: with Colima stopped or an unreachable `DOCKER_HOST`, the
same refusal appears.

Behavior: `docker` present but no daemon, or an outside path →
`scripts/ci-container.sh` → one clear refusal before any image work.

### 3. The container's dashboard run matches CI's job
Type: Behavior
Status: planned
Proof: `tests/ci-container.sh` checks that the script's stated dashboard
commands equal the `run:` commands of `ci.yml`'s `dashboard` job after
`npm ci`. Manual: a scratch `test.only` in a temporary worktree makes
`scripts/ci-container.sh --dashboard` fail as CI's `forbidOnly` would; the
current revision passes.

Behavior: CI's dashboard job changes or a spec keeps `test.only` →
`npm test` or `scripts/ci-container.sh --dashboard` → the difference is caught
before CI.

### 4. The tests README states each environment rule once
Type: Structure
Status: planned
Proof: `tests/payload-declaration-links.sh` and
`tests/test-runner-failure-report.sh` pass through the runner after the
redundant check is deleted; the full suite passes; the README is under 250
lines with one check-environment section and a line on refreshing the image.

Structure: delete `tests/payload-declaration-links-suite-failure.sh` and its
README paragraph; consolidate the Bash floor, Git state, and chosen-run rules
into one section. Directly owned retrospective correction.

## Learnings

- Slice 1 accepted proof: `withoutDeveloper` in
  `workspace-publication-startup-agent-credit.test.mjs` drops inherited
  `GIT_CONFIG_COUNT`/`KEY_n`/`VALUE_n`/`PARAMETERS`. With the product's
  `-c user.useConfigOnly=true` removed, the refused-Take case fails at
  `assertRefusedTake` (macOS: status `claim-failed`; where Git guesses an
  identity, the `ok === false` assertion fails instead); restored, it passes.
- `tests/README.md` is 267 lines at the claim (`cadcc27`), not 247: slice 4
  must remove more than the finding assumed to meet the 250-line limit.
