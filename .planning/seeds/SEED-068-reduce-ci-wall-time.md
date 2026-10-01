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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** Developers and agents collaborating via trunk-based development
  receive faster, trustworthy CI feedback, shortening the cycle time between
  publishing changes and confirming trunk integration.
- **Goal:** Profile and analyze what takes the longest time in GitHub Actions
  CI runs, apply `dough-test-optimization` to reduce test execution duration, and
  optimize or parallelize pipeline jobs, matrix splits, and setup steps so that
  the overall CI wall time is substantially reduced while preserving full
  behavioral test coverage.
- **Scope:**
  - **Bottleneck analysis:** Inspect recent CI run durations and step timings
    (e.g., `dashboard` browser shards vs `test` splits vs `lint`, and within
    jobs: `npm ci`, Playwright browser downloads, type-checking, and test execution).
  - **Test execution optimization:** Use `dough-test-optimization` to
    hypothesize, measure, and streamline expensive test families (such as
    slow browser interactions, redundant test scenarios, heavy fixture setups, or
    slow shell test execution) while preserving behavioral proof.
  - **Pipeline and job optimization:** Evaluate and implement CI workflow
    improvements (in `.github/workflows/ci.yml`), such as caching Playwright
    binaries or tool downloads, tuning matrix shard/share distributions,
    optimizing job dependencies, or running independent steps concurrently.
  - **Measurement and verification:** Compare before-and-after wall time and
    individual step timings under comparable conditions. Confirm all existing
    lint, unit, and dashboard test suites continue to run and verify product
    behavior completely.
  - **Not included:** Weakening assertions, skipping tests, compromising flakiness
    detection, or changing product features outside test/CI infrastructure.
- **Key examples for later refinement:**
  - Analysis identifies the critical path in CI (e.g., the slowest dashboard
    Playwright shard or unit test split).
  - Test suites are optimized via `dough-test-optimization` to eliminate
    redundant waiting, redundant setup, or slow cases without loss of confidence.
  - CI jobs or matrix shards are adjusted so workload is balanced and wall time
    is shortened.
  - Tool or dependency steps (e.g., Playwright browser installation) are cached
    or parallelized where safe.
  - Post-optimization CI runs show a measured reduction in total wall time on
    comparable commits.
- **Depends on:** Existing CI workflow (`.github/workflows/ci.yml`) and
  `dough-test-optimization` skill. No new product prerequisite.
- **Effort hypothesis:** M — requires profiling CI data, running test
  optimization loops, and validating workflow changes.
- **Capture:** Terry requested this story on 2026-10-01 to be placed at the top
  of the product backlog.

## Open Decisions

- What target wall time is desired (e.g., under 2 minutes vs under 3 minutes)?
- Which bottleneck contributes the most to wall time: test execution within
  the dashboard Playwright shards, test execution in the unit test runner, or
  runner setup / browser installation overhead?
- How many matrix shards/shares balance speed against GitHub Actions runner
  concurrency limits?

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [CI workflow](../../.github/workflows/ci.yml).
- [Test optimization skill](../../src/skills/dough-test-optimization/SKILL.md).
