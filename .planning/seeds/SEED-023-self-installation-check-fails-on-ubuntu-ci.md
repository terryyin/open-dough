---
id: SEED-023
status: active
planted: 2026-09-22
planted_during: Execution retrospective for SEED-008#path-filter-aware-ci-observation
trigger_when: Any push reaches the `check-self-installation.sh` step on this repository's GitHub Actions Ubuntu runners
scope: small
---

# SEED-023: Fix scripts/check-self-installation.sh failing on Ubuntu CI

## Why This Matters

`scripts/check-self-installation.sh` is a read-only check that a repository's
native Open Dough installations (`.claude/skills/`, `.agents/skills/`) match
the immutable local Git tag named by their installed `VERSION` record. It runs
as part of `npm test` (`scripts/test.sh`) in the `test` matrix job of
`.github/workflows/ci.yml`.

During execution of SEED-008#path-filter-aware-ci-observation
(`claude/076-path-filter-aware-ci-observation`), this check failed
reproducibly on GitHub Actions' Ubuntu runners:

- Run `35694734061` (SHA `86c4e361ab1b2b6ce41077e0633f69a9675722ae`,
  2026-09-22): the `test` job's log shows `Running
  scripts/check-self-installation.sh` immediately followed by `##[error]Process
  completed with exit code 1`, with zero script output in between (under 2ms
  elapsed).
- Run `35700926334` (SHA `a8f9eb19be42e1b8c0a9b6e1e428fffbee6f2865`,
  2026-09-22): identical symptom — the same repository's `execution-ci-runtime.sh`
  step (184 unrelated tests) passed cleanly in the same job run, then
  `check-self-installation.sh` failed the same way immediately after.

Locally on macOS, at the exact same commits, `bash
scripts/check-self-installation.sh` exits `0` with no reported problem, both
standalone and through the full `scripts/test.sh` harness. Two immediately
prior CI runs on `main` at commits that predate this branch
(`fbc26d1f8e112080ddcc2a24368f5ca11c41ff3a`,
`59374fc245c71396d1b6202313b9aa2814f7f113`) both passed this same check on the
same Ubuntu runner image.

This is confirmed unrelated to the SEED-008 story's own changes: that story's
diff never touches `VERSION`, Git tags, or the installed
`.claude/skills/`/`.agents/skills/` payloads (`git diff HEAD --
.claude/skills .agents/skills VERSION CHANGELOG.md` is empty at the failing
commits), and its own dedicated test suite passed 184/184 on the same CI run
that then hit this failure. The failure will recur on any future push that
reaches this step, on any branch, until it is understood and fixed.

## Alternatives and Decision

No repair was attempted: SEED-008's execution retrospective found this defect
incidentally, outside that story's authorized scope ("release/version work" is
explicitly excluded from SEED-008's plan), and without access to a Linux shell
to reproduce and bisect the platform-specific behavior. This seed exists to
place the investigation and fix first in the backlog rather than let CI stay
red for every push that reaches this step.

Plausible root causes worth investigating first, not yet confirmed:

- `git archive --format=tar "v${recorded_version}" | tar -x -C
  "${tagged_tree}"` may behave differently between GNU `tar` (Ubuntu CI) and
  the `tar` available in a contributor's local shell, for some edge case in
  the archived tree.
- `actions/checkout@v7` runs with `fetch-depth: 0` and an unset
  `fetch-tags` (observed `fetch-tags: false` in the CI log) plus an explicit
  `+refs/tags/*:refs/tags/*` refspec; some Ubuntu-runner-specific tag
  visibility or ordering edge case could leave `git rev-parse --verify --quiet
  refs/tags/v<version>` unable to resolve the tag even though the same
  refspec appears to fetch tags.
- The script's `set -euo pipefail` may be exiting on an early command (inside
  `all_destinations_for`, `read_record`, or the sourced
  `open-dough-platform.sh`/`open-dough-release-version.sh` helpers) whose
  failure path does not itself print a message before propagating, which
  would also explain the near-instantaneous, silent exit.

## Story Decomposition

<a id="fix-self-installation-check-ubuntu-failure"></a>

### 1. Restore a passing check-self-installation.sh on GitHub Actions

- **For / why:** For any developer or agent relying on this repository's CI
  as a delivery gate; a check that fails deterministically and silently on
  every push undermines trust in CI overall and can mask a genuinely broken
  push behind a pre-existing, unrelated red job.
- **Evaluation:** A push to a disposable branch (or a `workflow_dispatch` run)
  on GitHub Actions' Ubuntu runner reaches the `test` job's
  `check-self-installation.sh` step and it passes, with the actual failing
  command and cause identified and explained, not merely rerun until green.
- **Value / learning:** Restores a reliable green CI signal for this
  repository; whatever cross-platform assumption caused this becomes a
  documented, tested invariant instead of a silent trap for a future change.
- **Effort hypothesis:** S — likely a narrow platform-specific fix once
  reproduced with real Linux shell access and verbose tracing (`bash -x`) of
  the script in that environment; confidence is moderate since the root
  cause is not yet confirmed.
- **Depends on:** none.
- **Safe stopping point:** Fixing this alone restores a real, unrelated
  benefit (a trustworthy CI signal for every branch) regardless of any other
  queued work.

## Ordering and Scope Reduction

Single-story seed; no reduction needed. Investigate and fix only this one
check; do not generalize into a broader cross-platform CI audit unless the
root cause turns out to be shared with other steps.

## When to Surface

Now — CI is currently red for this reason on at least one branch, and will
recur on any future push that reaches this step until fixed.

## Breadcrumbs

- CI run `35694734061` (SHA `86c4e361ab1b2b6ce41077e0633f69a9675722ae`) — job
  `test`, step `Run test`, log tail: `Running
  scripts/check-self-installation.sh` then `##[error]Process completed with
  exit code 1` with no intervening output.
- CI run `35700926334` (SHA `a8f9eb19be42e1b8c0a9b6e1e428fffbee6f2865`) —
  identical symptom, same repository, later push.
- CI runs `35693393521` (`fbc26d1f8e112080ddcc2a24368f5ca11c41ff3a`) and
  `35688572291` (`59374fc245c71396d1b6202313b9aa2814f7f113`) — this same
  check passing on `main` at commits both preceding and reachable from the
  branch above.
- `scripts/check-self-installation.sh`, `src/install/open-dough-release.sh`
  (`compare-payload`), `src/install/open-dough-platform.sh`,
  `src/install/open-dough-release-version.sh` — the script and its sourced
  helpers.
- `.github/workflows/ci.yml`'s `test` job: `actions/checkout@v7` with
  `fetch-depth: 0`, observed `fetch-tags: false`.
- Found during the SEED-008#path-filter-aware-ci-observation execution
  retrospective (2026-09-22); not investigated further there because it is
  outside that story's authorized, explicitly-excluded "release/version
  work" scope.
