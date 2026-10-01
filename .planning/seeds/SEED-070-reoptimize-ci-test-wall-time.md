---
id: SEED-070
status: active
planted: 2026-10-01
planted_during: Terry's request for follow-up CI and test optimization after concurrent story branches land
trigger_when: Active concurrent story branches (SEED-066, SEED-052 Codex dashboard support, SEED-067) have completed and landed on trunk
scope: story
---

# SEED-070: Re-optimize CI feedback and test wall time after concurrent story branches land

## Why This Matters

Prompt, trustworthy CI feedback is critical for smooth trunk-based collaboration.
During the initial CI optimization pass in `SEED-068` (plan `193`), several other
tasks were actively executing in their own story branches (`SEED-066` composable
session options, `SEED-052` Codex dashboard sessions, and `SEED-067` Codex
refinement reliability).

As those branches progressed and integrated into trunk, they introduced new
tests, additional browser fixtures, and asynchronous host workflows. After the
first integration merge into `main`, trunk CI wall time was already observed to be
longer than on the isolated optimized branch (with `dashboard (4/4)` taking
~2m57s and overall duration increasing). Once all these concurrent in-flight
branches have completed and landed on trunk, another targeted optimization pass is
needed to restore and maintain fast feedback (<2.5m, targeting ~2m).

## Alternatives and Decision

- **Optimize immediately before in-flight branches finish:** Rejected. Concurrent
  branches are actively adding and modifying tests; optimizing before they land
  would leave new tests unprofiled and require yet another pass.
- **Rely solely on increasing runner hardware or timeout budgets:** Rejected. Does
  not address structural test bottlenecks, fixture bloat, or execution imbalance.
- **Perform targeted CI and test optimization once concurrent branches land:**
  Selected. Wait until active story branches (`SEED-066`, `SEED-052`, `SEED-067`)
  are landed, then profile the integrated suite on trunk and execute targeted
  optimizations using the proven tactics from `SEED-068`.

## Story

<a id="reoptimize-ci-test-wall-time"></a>

### Re-optimize CI feedback and test wall time after concurrent story branches land

**Identity:** SEED-070#reoptimize-ci-test-wall-time
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** Developers and agents collaborating on trunk receive fast,
  reliable CI feedback under 2.5 minutes, preventing feedback delays caused by
  new tests merged from concurrent story branches.
- **Goal:** Once active concurrent story branches (`SEED-066`, `SEED-052` Codex
  support, `SEED-067`) have completed and landed on trunk, profile new bottleneck
  jobs, apply `dough-test-optimization` to newly introduced or shifted slow test
  families, and rebalance CI matrix shares/shards so trunk CI critical-path wall
  time stays consistently under 2.5 minutes (targeting ~2 minutes).
- **Scope:**
  - **Precondition:** Wait until `SEED-066#composable-lightweight-session-options`,
    `SEED-052#use-codex-from-dashboard`, and
    `SEED-067#resolve-codex-refinement-launch-failures` have completed and landed
    on `main`.
  - **Trunk profiling & critical-path discovery:**
    - Inspect recent GitHub Actions runs on `main` via `gh run list --branch main`
      and `gh run view <run-id>`.
    - Download test timing artifacts (`gh run download <run-id> -p 'test-times-*' -D /tmp/times`)
      and Playwright reports (`gh run download <run-id> -p 'dashboard-playwright-report-*' -D /tmp/dash-reports`).
    - Identify which job (a specific `dashboard` shard, `test` share, or `lint`)
      is the slowest critical-path bottleneck.
  - **Targeted test optimization (`dough-test-optimization`):**
    - Apply `dough-test-optimization` to new or shifted slow test families in
      both browser suites (e.g. newly added Codex/session specs) and shell/unit
      suites.
    - Rightsize inflated mock data and test card counts (as demonstrated in
      `accessible-overview.spec.ts`, where reducing `queuedCount` from 40 to 16
      eliminated 24 card renders, ~25 API polling reads, and ~120 keyboard
      roundtrips while fully preserving overflow and scrolling coverage).
    - Partition multi-suite monolithic test files into dedicated parallel checks
      where sequential sub-suites create bottlenecks (as demonstrated when
      partitioning `tests/git-publication-native-admission.sh` out of
      `tests/git-publication-native.sh`, cutting its duration from 69s to 27s).
  - **Matrix rebalancing & `longest-first` refresh:**
    - Refresh `tests/longest-first` from latest CI timings (`sort -rn /tmp/times/*/test-times.txt | awk -F '\t' '$1 >= 3 { print $2 }'`)
      so longest jobs start first and distribute evenly across matrix shares.
    - Verify with `scripts/test-jobs.sh` that all unit/shell tests partition
      cleanly across `OPEN_DOUGH_TEST_SPLIT=1/3`, `2/3`, `3/3` with 0 duplicates.
    - Adjust Playwright sharding or matrix share count if necessary.
  - **Preserved promises and constraints:**
    - 100% behavioral test coverage must be preserved; no tests skipped, deleted,
      or assertions weakened.
    - Diagnostic artifacts (`playwright-report`, `test-results`, `test-times.txt`)
      and failure reporting remain fully operational.
    - All changes to `.github/workflows/ci.yml` must satisfy `tests/ci-container.sh`
      (dashboard `run:` steps after `npm ci` must match `scripts/ci-container.sh`).
- **Reference from previous effort (`SEED-068` / Plan 193):**
  - Commit history:
    - `28df8eb9`: Parallelize dashboard browser shards (4 shards) and cache Playwright Chromium.
    - `d38a45ab`: Parallelize test matrix (3 shares) and refresh `tests/longest-first`.
    - `4e79272c`: Partition admission publication journeys into dedicated parallel test (`tests/git-publication-native-admission.sh`).
    - `45b3c53c`: Streamline large backlog test count (`queuedCount: 16`) in `dashboard/tests/accessibleOverview.ts`.
    - `09dbcfa1`: CI timeout alignment to 6 minutes.
    - `0e28f831`: Handle background session polling in `agent-launch-host-identity.spec.ts`.
  - Recoverable plan: `.planning/slice-plans/193-reduce-ci-wall-time/PLAN.md` in
    Git history (`0c4f3178`).
- **Key examples:**
  - *Precondition check:* CI optimization starts only after all concurrent story
    branches in `Taken` have completed and integrated into `main`.
  - *Measured improvement:* CI runs on `main` demonstrate critical-path wall time
    under 2.5 minutes (e.g. ~2m00s–2m15s), with unit/shell test splits under 1m20s
    and dashboard shards under 2m00s.
  - *No regression:* All existing unit, shell, and Playwright tests continue to
    pass cleanly.
- **Depends on:** Landing of `SEED-066`, `SEED-052#use-codex-from-dashboard`, and
  `SEED-067` on `main`.
- **Effort hypothesis:** S to M — leveraging the established playbook, tooling,
  and lessons from `SEED-068`.
- **Capture:** Terry requested this follow-up story on 2026-10-01 to capture the
  knowledge and ensure a second optimization pass occurs after concurrent branches
  land.

## Open Decisions

- Whether any newly added Playwright specs or unit tests require partitioning or
  fixture rightsizing.
- Whether dashboard shard count should remain 4 or increase to 5 based on total
  browser test count after Codex workflows merge.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [CI workflow](../../.github/workflows/ci.yml).
- [Initial CI optimization effort](../../docs/maintainer/finding-names.md) (`SEED-068` / plan `193` in commit `0c4f3178`).
- [Test optimization skill](../../src/skills/dough-test-optimization/SKILL.md).
- [Test harness and runner](../../tests/README.md).
