# Reduce CI feedback and wall time

**Identity:** SEED-068#reduce-ci-wall-time
**Source:** [refined story](../../seeds/SEED-068-reduce-ci-wall-time.md#reduce-ci-wall-time)
**Authority:** Planning only. No Take, implementation, commit, or publication.
**Preparation:** Established workspace `/Users/terryyin/git/open-dough/.worktrees/reduce-ci-wall-time`, branch `cursor/reduce-ci-wall-time`, remote `origin`, trunk `main`, agent `pyo-chan`, published assignment `3876d6d8080953c3c1a9ca2ef4d374d478ac50e6`, integration checkout `/Users/terryyin/git/open-dough`.

## Goal and scope

Reduce GitHub Actions CI critical-path wall time to under 2.5 minutes (150 seconds, baseline ~4 minutes / 240s) by profiling bottlenecks, optimizing slow test families using `dough-test-optimization`, and tuning pipeline parallelization and caching in `.github/workflows/ci.yml`, while preserving complete behavioral test coverage.

### Scope and baseline analysis

- **Baseline wall time:** ~4 minutes on standard GitHub-hosted runners (`ubuntu-24.04`).
  - `dashboard (1/2)`: ~3m49s (setup ~35s, 295 tests ~3m09s)
  - `dashboard (2/2)`: ~3m31s (setup ~35s, tests ~2m53s)
  - `test (1/2)`: ~2m06s (dominated by `tests/git-publication-native.sh` at ~67s)
  - `test (2/2)`: ~1m54s
  - `lint`: ~52s
- **Critical path analysis:**
  - The critical path is dictated by the dashboard browser suite (~3m40s–3m50s), closely followed by the unit/shell test splits (~2m06s).
  - Sharding dashboard tests into 4 shards will cut test duration per runner from ~3m00s to ~1m30s.
  - Adding Playwright browser binary cache saves ~20-25s per shard.
  - Expanding test splits from 2 to 3 shares balances unit/shell checks so no share exceeds 1.5 minutes.
  - Applying `dough-test-optimization` to `tests/git-publication-native.sh` and slow Playwright tests directly eliminates wasted setup and wait overhead.

## Architecture and pipeline design

### Decisive premises and observations

1. **Premise:** Playwright test runner supports arbitrary `--shard=i/n` cleanly.
   - **Observation:** `npx playwright test --config dashboard/playwright.config.ts --list --reporter=list --shard=1/4` executes and partitions the 571 tests into 146, 149, 135, and 141 tests per shard with zero overlapping or dropped tests.
2. **Premise:** `scripts/test-jobs.sh` supports arbitrary `OPEN_DOUGH_TEST_SPLIT=i/n` and partitions disjointly.
   - **Observation:** Running `OPEN_DOUGH_TEST_SPLIT=1/3`, `2/3`, `3/3` partitions the 250 unit/shell test jobs into 84, 83, 83 tests with exactly 0 duplicates and 250 total.
3. **Premise:** `.github/workflows/ci.yml` is the sole workflow defining CI in this repo.
   - **Observation:** Checked `.github/workflows/` and confirmed `ci.yml` is the sole workflow.
4. **Premise:** `tests/longest-first` dictates start order in `scripts/test-jobs.sh` to prevent long tests from bunching up.
   - **Observation:** Inspected `scripts/test-jobs.sh` lines 110-134; it schedules items in `tests/longest-first` round-robin across shares before sorting remaining jobs.
5. **Premise:** Credential-free `tests/git-publication-native.sh` runs 17 counterexample and substitute suites sequentially, causing a ~67s runtime.
   - **Observation:** Inspected `tests/git-publication-native.sh` lines 132-149 and verified the suite sequence.

## Planned slices

### Slice 1: Parallelize dashboard browser shards and cache Playwright Chromium
- **Kind:** Behavior / Structure
- **Goal:** Update `.github/workflows/ci.yml` to run the dashboard browser suite across 4 shards (instead of 2) and cache the Playwright Chromium binary in `~/.cache/ms-playwright` keyed by lockfile hash.
- **Scope:**
  - In `.github/workflows/ci.yml`:
    - Matrix shards: change `shard: [1, 2]` to `shard: [1, 2, 3, 4]`.
    - Add Playwright browser caching step before `Install Playwright Chromium`:
      ```yaml
      - name: Cache Playwright Chromium
        uses: actions/cache@v4
        id: playwright-cache
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
      - name: Install Playwright Chromium
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps chromium
      - name: Install Playwright Chromium OS deps
        if: steps.playwright-cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps chromium
      ```
    - Preserve artifact upload `dashboard-playwright-report-${{ matrix.shard }}` across all 4 shards.
    - Preserve `Type-check the dashboard` on `if: matrix.shard == 1`.
- **Proof:**
  - Verify `.github/workflows/ci.yml` syntax.
  - Verify Playwright sharding command locally: `npm run test:dashboard -- --shard=1/4` executes and produces report.
  - Verify expected job time saving: browser execution drops from ~180s to ~90s, setup savings ~20s on cache hit.
- **Stopping point:** Dashboard CI job is parallelized to 4 shards with caching configured and verified.

### Slice 2: Parallelize unit and shell test matrix shares and refresh `longest-first`
- **Kind:** Behavior / Structure
- **Goal:** Update `.github/workflows/ci.yml` test matrix from 2 shares to 3 shares (`share: [1, 2, 3]`), and refresh `tests/longest-first` with recent CI timings so the longest jobs are distributed evenly across the shares.
- **Scope:**
  - In `.github/workflows/ci.yml`:
    - Update `test` matrix: `share: [1, 2, 3]`.
    - Update artifact upload to handle all 3 shares (`test-times-${{ matrix.share }}`).
  - In `tests/longest-first`:
    - Incorporate recorded timings from latest CI runs (`test-times-1` and `test-times-2`) so jobs running > 3s start at the front of the round-robin distribution.
- **Proof:**
  - Verify `OPEN_DOUGH_TEST_SPLIT=1/3`, `2/3`, `3/3` partitioning with `scripts/test-jobs.sh`.
  - Confirm round-robin assignment places the top 3 longest jobs (`tests/git-publication-native.sh`, `src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs`, `tests/native-evidence-identity.sh`) into separate shares.
- **Stopping point:** Unit and shell test runner is parallelized across 3 shares with refreshed longest-first balancing.

### Slice 3: Apply `dough-test-optimization` to the slowest shell test family (`tests/git-publication-native*.sh`)
- **Kind:** Behavior / Structure
- **Goal:** Hypothesize, measure, and optimize shared setup and execution cost in `tests/git-publication-native.sh` to reduce its runtime from ~67s without dropping any behavioral checks.
- **Scope:**
  - Profile `tests/git-publication-native.sh` sub-suites (`run_assessor_counterexamples`, `run_trunk_closure_assessor_counterexamples`, etc.).
  - Identify redundant repository initializations, git config writes, or unnecessary sleep/polling delays in `tests/support/git-publication-native-*.sh`.
  - Refactor to reuse shared mock repositories or streamline git commands where safe.
  - Verify all 17 counterexample suites pass and retain complete behavioral assertion coverage.
- **Proof:**
  - Measured local execution timing of `tests/git-publication-native.sh` before and after.
  - Full run of `tests/git-publication-native.sh` and related suites (`tests/git-publication-native-one-shot.sh`, `tests/git-publication-native-owned-context.sh`).
- **Stopping point:** Shell publication suite runs substantially faster with verified identical assertion coverage.

### Slice 4: Apply `dough-test-optimization` to high-latency dashboard browser test specs
- **Kind:** Behavior / Structure
- **Goal:** Profile and streamline high-latency dashboard Playwright specs (such as `accessible-overview.spec.ts` ~13.7s and `agent-launch-card-sessions.spec.ts` ~13.6s) to reduce test latency.
- **Scope:**
  - Inspect test execution traces and steps in `accessible-overview.spec.ts` and `agent-launch-card-sessions.spec.ts`.
  - Replace unnecessary timeouts or sequential polling loops with event-driven locators and auto-retrying assertions.
  - Eliminate redundant UI state navigations within tests while preserving the exact screen/journey behavior being tested.
- **Proof:**
  - Measured execution timing before and after for targeted specs using Playwright reporter.
  - Full pass of the targeted spec files under Playwright chromium.
- **Stopping point:** Targeted high-latency browser specs demonstrate measurable duration reduction while passing all assertions.

### Slice 5: End-to-end CI wall time verification and threshold validation
- **Kind:** Behavior / Structure
- **Goal:** Validate the integrated CI workflow and optimized test suites locally and against CI expectations to verify that the under 2.5-minute wall time target is met.
- **Scope:**
  - Run full lint and verification checks.
  - Verify CI workflow step dependencies and timeout configuration (`timeout-minutes: 5` or `6` aligned with new budget).
  - Verify that all artifacts, diagnostic outputs, and failure notifications remain intact.
- **Proof:**
  - Complete local suite pass: `PATH="/opt/homebrew/bin:$PATH" npm run lint` and `PATH="/opt/homebrew/bin:$PATH" npm test`.
  - Playwright browser suite pass.
  - Confirmed critical path calculation: all parallel jobs (`lint` ~50s, `test` ~60-80s, `dashboard` ~90-110s) complete within ~2 minutes wall time.
- **Stopping point:** Full suite verification complete; CI workflow ready for landing with validated < 2.5m critical-path wall time.

## Current decisions and accepted trade-offs

- **Accepted trade-off:** Increasing dashboard shards from 2 to 4 and test shares from 2 to 3 increases the total number of parallel GitHub Actions runner jobs from 5 to 8 (1 lint + 3 test + 4 dashboard). This is well within GitHub Actions concurrent job limits (typically 20 for standard plans) while cutting wall time from ~4m to < 2.5m.
- **Preserved promises:** No tests skipped, deleted, or masked. Full Playwright HTML reports and test times artifacts uploaded.
