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

Make the environment each check needs explicit and enforced, rather than
making every machine identical. Running every check in a container, adding a
macOS CI runner, or pinning CI's Git would each cost speed or CI time for
problems the explicit environment already removes. Keep one scripted
CI-matching Linux run for diagnosis only.

## Stories

<a id="explicit-test-environment"></a>

### Make every check's shell and Git environment explicit and reproduce CI's platform with one command

**Identity:** SEED-048#explicit-test-environment
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A check gives the same result locally and on CI regardless of the
machine's Git configuration, Git version, or default shell, and a developer or
agent can reproduce CI's platform with one command when a difference remains.

**What we know (SEED-037, 2026-09-26 and 2026-09-27):**

- **Git background maintenance.** CI's Git 2.55 ran `git maintenance run
  --auto --detach` after a fixture commit and repacked 229 loose objects
  within 5 seconds, removing `.git/objects/xx` directories while a snapshot's
  `find` walked them; `tests/native-delivery-updated-use.sh` and its adapters
  check failed on CI in 1 of 4 runs and never reproduced locally. Fixed for
  the delivery adopter fixture by using `init_fixture_repo`
  (`configure_fixture_git` sets `maintenance.auto false`) and by pruning `.git`
  in snapshots. Still exposed: native-agent fixture repositories that commit
  with inline `-c` identity and no maintenance setting
  (`product-backlog-native-guard-*`, `product-backlog-native-take`,
  `delivery-evidence-native-run`, `ci-completion-native-fixture`,
  `trunk-closure`, `story-branch-closure`, `git-publication`).
- **Git message text.** `ci-repair-stash.test.mjs` fails under Git 2.39 and
  2.43 because it matches Git's error wording; CI's Git 2.55 passes.
- **Bash 3.2.** macOS `/bin/bash` 3.2 lets a failing standalone `[[ ]]`
  pass under `set -e` (finding ODF-061). `scripts/test.sh` already refuses a
  Bash older than 5, but a check run directly (`bash tests/<name>.sh`) or a
  helper script with `#!/usr/bin/env bash` still picks up 3.2; every agent
  brief had to prepend `PATH=/opt/homebrew/bin`, and one measurement run
  silently did nothing under 3.2.
- **macOS Git launcher.** `/usr/bin/git` is an `xcrun` stub that roughly
  doubled local Git cost against the Command Line Tools Git, distorting local
  measurements.
- **Operating-system output.** Process listings differ: an exiting node
  worker shows `[MainThread] <defunct>` in state `Sl` on Linux and `(node)`
  on macOS; both were misread as a different process until
  `commandShowsExit` classified them in one place. The dashboard's 320 px
  checks clipped a fraction of a pixel only with CI's fonts. Bash's
  `child setpgid` race printed only on macOS under load.
- **Hand-built Linux reproduction.** Agents rebuilt a CI-matching container
  three times and each tripped on setup: a missing `jq`, installing Git 2.55
  from a PPA, and the worktree's `.git` file not resolving inside the
  container.

**Scope (proposed, to confirm in refinement):**

1. The test runner sets one Git environment every check inherits: no global
   or system Git config, background maintenance off, fixed defaults for new
   repositories. Fixture helpers stop needing to remember it.
2. Shell checks share a prelude that stops with a clear message under Bash
   older than 5, so a direct run cannot pass silently on 3.2.
3. Checks assert behavior (exit status, files, observable state), not a
   tool's message wording or output format; where a tool's output must be
   parsed, one adapter owns it with cases per platform. Repair
   `ci-repair-stash.test.mjs` under this rule.
4. One command runs chosen checks, or the suite, in a CI-matching Linux
   container (Ubuntu 24.04, CI's Git, `jq`, Node) from any worktree, for
   diagnosis only; it is not part of the normal suite.

**Key examples:**

1. A developer with `maintenance.auto` enabled globally and an old Git runs
   the suite → every fixture repository behaves as on CI, and no check fails
   because of background maintenance.
2. An agent runs `bash tests/<name>.sh` under macOS Bash 3.2 → the check stops
   at once, naming the Bash it needs.
3. A check that failed only on CI → one command reproduces it locally on CI's
   platform.

**Out of scope:** running every check in a container, a macOS CI runner, and
pinning CI's Git version.

## When to Surface

Now: first in the product backlog, per the maintainer on 2026-09-27.

## Breadcrumbs

- SEED-037's measurements and repairs are recoverable at
  `e67796d:.planning/quick/107-cut-test-work-and-ci-wait/PLAN.md`; the
  auto-maintenance repair is `bfdf893`.
- Finding ODF-061 in `DearDough.md` (Bash 3.2 passing a failing assertion).
- SEED-046 (the next CI verdict round) relies on this story for CI/local
  parity.
