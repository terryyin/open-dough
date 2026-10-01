---
id: SEED-068
status: active
planted: 2026-10-01
planted_during: Terry's request to reduce CI wall time via test optimization and pipeline parallelization
trigger_when: CI feedback time slows developer workflow or tests take substantial time in CI runs
scope: story
---

# SEED-068: Reduce CI feedback and wall time

## Why This Matters

Developers and agents rely on prompt, trustworthy CI feedback when landing
changes on trunk. Current GitHub Actions CI runs take ~4 minutes of wall time,
dominated by the dashboard browser test suite shards (~3m40s–3m50s) and unit
test splits (~2m), in addition to dependency installation and tool setup.
Reducing CI wall time shortens feedback loops, reduces queue wait times for
trunk landing, and lowers compute overhead.

## Alternatives and Decision

- **Increase runner resources or timeouts only:** Rejected. Does not address
  wasteful test design, heavy fixture overhead, or avoidable sequential steps.
- **Skip or reduce test coverage in CI:** Rejected. Preserving behavioral
  confidence and regression protection is a non-negotiable promise.
- **Analyze bottlenecks, optimize tests with dough-test-optimization, and parallelize CI:**
  Selected. Measure actual job and step durations in CI, apply
  `dough-test-optimization` to shorten test runtime without losing confidence,
  and optimize or parallelize CI setup and matrix splits to cut overall wall time.

## Story

<a id="reduce-ci-wall-time"></a>

### Reduce CI wall time through test optimization and pipeline parallelization

**Identity:** SEED-068#reduce-ci-wall-time
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/193-reduce-ci-wall-time/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"60697846da3423ab5b08e50664db45a3ed776b2875c8a18708ad41c5a735b7b1","plan":"8f033f2a62588d5d58cdfd11e6f55bf6f256563b127467d11389f2d0d441c616"}}
```

- **For / why:** Developers and agents collaborating via trunk-based development
  receive faster, trustworthy CI feedback, shortening the cycle time between
  publishing changes and confirming trunk integration.
- **Goal:** Reduce GitHub Actions CI critical-path wall time to under 2.5 minutes
  (from ~4 minutes) by profiling bottlenecks, optimizing slow test families using
  `dough-test-optimization`, and tuning pipeline parallelization and caching in
  `.github/workflows/ci.yml`, while preserving complete behavioral test coverage.
- **Scope:**
  - **Critical path analysis & baseline:**
    - Baseline wall time: ~4 minutes on standard GitHub-hosted runners (`ubuntu-24.04`).
    - Critical path is dominated by `dashboard` browser shards (`dashboard (1/2)` at
      ~3m49s, `dashboard (2/2)` at ~3m31s), followed by `test` splits (`test (1/2)` at
      ~2m06s, `test (2/2)` at ~1m54s), and `lint` at ~52s.
    - Within `dashboard` jobs: setup takes ~35s (`npm ci` ~4s, Playwright Chromium install
      ~24-28s, typecheck ~6s), and test execution across 295 tests takes ~3m09s.
    - Within `test` jobs: heavy shell tests dominate (`tests/git-publication-native.sh` at
      ~67s, `tests/native-evidence-identity.sh` at ~26s, `tests/git-publication-native-one-shot.sh`
      at ~19s).
  - **Pipeline and workflow parallelization (`.github/workflows/ci.yml`):**
    - Increase `dashboard` matrix shards (e.g. from 2 to 3 or 4) so that browser test execution
      per runner comfortably finishes in under 1.5 minutes.
    - Evaluate and implement caching for Playwright Chromium binaries to save ~20–25s setup
      overhead per shard.
    - Tune `test` matrix shares if needed to keep unit/shell test splits under 1.5 minutes.
    - Keep `lint` independent and fast.
  - **Test execution optimization (`dough-test-optimization`):**
    - Apply `dough-test-optimization` to identified slowest test families in both Playwright
      browser suites (e.g. `accessible-overview.spec.ts` ~13.7s, `agent-launch-card-sessions.spec.ts`
      ~13.6s, `agent-launch-attention.spec.ts` ~9.8s) and shell/unit test suites
      (e.g. `tests/git-publication-native.sh` ~67s).
    - Eliminate redundant waiting, repeated heavy fixture setups, or unnecessary polling
      intervals while preserving behavioral assertions.
  - **Preserved promises and constraints:**
    - Full behavioral test coverage and regression protection must be retained. No tests may
      be skipped or deleted without surviving equivalent proof.
    - No weakened assertions; no masking flakiness with retries, sleeps, or ignored failures.
    - Artifact retention (`playwright-report`, `test-results`, `test-times.txt`) and failure
      reporting remain fully functional for diagnostics.
    - Standard GitHub-hosted `ubuntu-24.04` runners; no private runner infrastructure required.
  - **Deferred promises:**
    - Application feature changes outside CI workflow and test suites.
    - Moving away from GitHub Actions or introducing paid runner hardware.
- **Key examples:**
  - *Full CI run wall time target:* On push to trunk or branch, all CI jobs (lint, unit/shell
    tests, dashboard browser tests) run concurrently and the slowest job finishes in under
    2.5 minutes (150s), compared to the ~4-minute baseline.
  - *Dashboard shards parallelization & caching:* A dashboard shard job restores cached
    Playwright Chromium binaries (saving ~20-25s) or installs cleanly on cache miss, runs its
    share of browser tests across increased shards (e.g. 3 or 4 shards), and completes its
    entire job in under 2 minutes.
  - *Unit & shell test splits:* Test runner shares balance the test load so that neither share
    exceeds 1.5 minutes of wall time, with per-job `test-times.txt` uploaded as before.
  - *Test family optimization:* Running `dough-test-optimization` on a high-cost test family
    (e.g. `accessible-overview.spec.ts` or `tests/git-publication-native.sh`) refactors shared
    setup/wait overhead, demonstrably reducing wall time while all assertions pass.
  - *Accurate failure and artifact retention:* When a test fails in a dashboard shard or test
    split, the job fails promptly and artifacts (`playwright-report`, `test-results`) are uploaded
    properly without being masked by optimization or sharding changes.
- **Depends on:** Existing CI workflow (`.github/workflows/ci.yml`) and `dough-test-optimization` skill.
- **Effort hypothesis:** M — requires profiling CI data, implementing workflow caching and sharding adjustments, and conducting focused test optimization loops.
- **Capture:** Terry refined this story on 2026-10-01, selecting a wall time target of under 2.5 minutes and confirming a single combined story spanning pipeline parallelization and test optimization.

## Open Decisions

- Precise shard count for dashboard browser tests (3 vs 4 shards) to balance runner concurrency against GitHub Actions account limits.
- Selection of the first test family for `dough-test-optimization` during implementation planning (e.g. Playwright `accessible-overview` vs shell `tests/git-publication-native.sh`).

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [CI workflow](../../.github/workflows/ci.yml).
- [Test optimization skill](../../src/skills/dough-test-optimization/SKILL.md).
