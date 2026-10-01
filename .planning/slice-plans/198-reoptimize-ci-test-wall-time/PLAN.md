# Re-optimize CI feedback and test wall time

**Identity:** SEED-070#reoptimize-ci-test-wall-time
**Source:** [refined story](../../seeds/SEED-070-reoptimize-ci-test-wall-time.md#reoptimize-ci-test-wall-time)
**Authority:** Execute the existing plan under the current developer instruction.
**Execution:** Story Branch Mode; owned reused workspace `/Users/terryyin/git/open-dough/.worktrees/re-optimize-ci-feedback-and-test-wall-time-after`, branch `codex/re-optimize-ci-feedback-and-test-wall-time-after`, publisher `dashboard-mac.lan-open-dough`, agent `viktor-chan`; remote `origin`, trunk `main`, increment target `refs/heads/codex/re-optimize-ci-feedback-and-test-wall-time-after`. Starting revision `ce968f8d2957fea3d6eed242d0112955540471c0`; accepted claim and first increment base `89923f8dc3ca7607a013e8680dbf743a494b0df5`. Integration checkout `/Users/terryyin/git/open-dough` remains separate. Established start replaces the former planning assignment; no second Take.
**Setup:** `npm ci` and `npm run typecheck:dashboard` passed in this exact workspace on 2026-10-01, with its committed lockfile unchanged. Replanning retains existing planning authority within the story; no numeric slice limit is supplied. Claim trunk CI is unobserved; managed increment delivery will own story-branch observation (`ci.yml`, GitHub Actions).

## Goal and scope

Trunk CI on the delivered revision completes in under 2m30s on its first run
and on two reruns of the same revision (aiming for about 2m), with every test
passing and the diagnostic artifacts still uploaded.

The dashboard browser suite is the critical path. In trunk run `36835182175`,
the four shard jobs took 2m58s, 1m40s, 1m41s, and 2m48s. Their test steps took
146s, 67s, 63s, and 125s, and setup before the tests took 30–42s. The `test`
shares (1m26s–1m34s) and `lint` (1m05s) already fit the target with margin.

Included: making the slowest browser spec families cheaper through
`dough-test-optimization`, and spreading browser test time evenly across
dashboard jobs so no job approaches the target.

Excluded, as the story defers: keeping CI under target as later stories add
tests, CI-duration alerts or budgets, and local full-suite wall time. Also
considered and excluded, because the profile shows margin: splitting shell
tests (`tests/git-publication-native-one-shot.sh` is the longest at 65s, in a
1m34s share), refreshing `tests/longest-first`, and shortening the
`npx playwright install --with-deps chromium` step, which takes 12–25s even
when the Chromium cache hits. Any of these comes back in only if a branch CI
run shows that job is the one holding a run over target.

## Current decisions

- **Optimize first, then balance from fresh timings.** Balancing alone does
  not reach the target with margin: an even split of the observed 401s of
  shard test-step time is about 100s per shard, which gives jobs of about
  2m22s. Cutting the heavy families first shrinks the total, and slice 2 then
  balances the timings slice 1 leaves.
- **Balance by recorded duration, not by adding count-based shards alone.**
  Playwright's `--shard` with `fullyParallel` cuts the file-ordered test list
  into equal-count blocks. The heavy specs sit at both alphabetical ends
  (`accessible-overview*` and `agent-launch-*` first; `read-failure`,
  `session-alerts`, `story-readiness-gaps`, `taken-agent-profile` last). So
  even 8 count-based shards still leave a shard with about 240s summed test
  time (simulation below). Raise the shard count only if the simulation on
  slice 1's fresh timings shows it reaching the per-shard budget. Otherwise,
  assign spec files to shard jobs by their recorded duration, following the
  `tests/longest-first` pattern that `scripts/test-jobs.sh` already applies to
  shell tests (PFE: reuse that project pattern; no new timing store beyond a
  list like it).
- **No Playwright internals.** Playwright 1.63 reads per-shard count weights
  only from the internal `PWTEST_SHARD_WEIGHTS` environment variable
  (`node_modules/playwright/lib/cli/testActions.js`). It is undocumented and
  still count-based, so the plan does not rely on it.
- **Per-job budget:** each dashboard job finishes within about 2m10s, which
  leaves the target margin for runner variance. With 30–42s of setup, each
  shard's test step stays within about 85s. In the observed run, a shard with
  about 188s of summed test time took 67s and one with about 380s took 146s.
  So a shard holding about 225s of summed test time fits. That makes the
  budget reachable even without slice 1 gains: five duration-balanced shards
  over today's 1124s, or four after a cut of about 20%.
- **Keep the CI contract checks:** any change to the dashboard job's `run:`
  steps keeps `tests/ci-container.sh` green. That check compares the steps
  after `npm ci`, less a trailing `-- --shard…` argument, with
  `scripts/ci-container.sh`. A partition that replaces `--shard` updates both
  sides together.
- **Measure on branch CI.** The repository is public and `ci.yml` runs on
  every push, so a story-branch push gives a free CI timing before trunk
  integration. Local timings are relative only, because other workloads load
  this machine. Use them to compare before and after the same change, not
  against the CI target.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The three precondition stories are on `main` | Story start | `.planning/PRODUCT-BACKLOG.md` on `origin/main` lists none of them in Taken or Backlog; SEED-067's seed is gone; `d61ff81d Close SEED-066#composable-lightweight-session-options` | Confirmed (2026-10-01) |
| Dashboard shard jobs are the critical path and over target | Slices 1, 2 | `gh run view <id> --json jobs` for runs `36827199430`, `36829085706`, `36831993214`, `36835182175` | Run 2m41s–3m11s; `dashboard (4/4)` slowest every run; `test` ≤1m39s; `lint` ≤1m05s |
| Shard summed test time is uneven: 380s, 188s, 177s, 379s (165, 179, 161, 145 tests; 650 total, 1124s) | Slices 1, 2 | `gh run download 36835182175 -p 'dashboard-playwright-report-*'`, then decode `report.json` from the base64 zip in each `playwright-report/index.html` (`data:application/zip;base64,…`) and sum `files[].tests[].duration` | Confirmed |
| Count-based sharding cuts the file-then-line ordered list into equal-count blocks, and more shards leave heavy ends | Slice 2 decision | Sorting the decoded tests by file and line and cutting equal-count blocks reproduces the observed sums (380, 187, 177, 379). With n = 5–8, the max block is 375s, 335s, 271s, 241s | Confirmed |
| Playwright 1.63 offers no public duration-based shard balancing | Slice 2 decision | `grep -n shardWeights node_modules/playwright/lib/cli/testActions.js` | Only internal `PWTEST_SHARD_WEIGHTS` count weights |
| Slowest browser tests and families | Slice 1 | Same decoded reports, sorted by test and by file | Tests: `taken-agent-profile` 19.1s (single test), `auto-refresh-branches` 14.0s, `agent-launch-card-sessions` 13.8s, `launch-observations` 10.0s, three `agent-launch-ad-hoc-codex` 8.6–9.1s. Files: `agent-launch-preparation-codex-retry` 35.8s/10, `agent-launch-model` 27.2s/11, `agent-launch-ad-hoc-codex` 26.8s/3, `agent-launch-ad-hoc` 24.4s/8 |
| Branch pushes run CI at no cost | Slices 1, 2 proof | `ci.yml` `on: push` (paths-ignore `.planning/**`, `docs/**` only); `gh repo view --json visibility` | `PUBLIC` |
| `tests/ci-container.sh` strips only a trailing `-- --shard…` from the CI dashboard steps it compares | Slice 2 | `tests/ci-container.sh:108-121` | Confirmed |
| This worktree has no `node_modules`, so tools resolve to the integration checkout's | Execution setup | `ls -d node_modules` in the workspace | Absent; run `npm ci` in the workspace before local runs |

## Ordered slices

### 1. The slowest browser spec families run in less time with the same coverage
Type: Behavior
Status: locally validated; first increment awaiting hosted timing evidence
Proof: each optimized spec passes locally with the same assertions or
justified equivalent coverage, and its local duration drops against a
same-session baseline. A story-branch CI run shows lower summed test time for
the shards that held those specs.

Behavior: with the integrated suite as on trunk → apply
`dough-test-optimization` to the slowest families named above, starting with
the single slowest tests and the heaviest families at both alphabetical ends.
Use the playbook tactics: rightsize inflated fixtures, remove redundant
journeys or polling waits, and split a sequential multi-journey test only when
its parts are independent → the suite's summed browser test time falls, with
no test skipped or deleted and no assertion weakened beyond what that skill
justifies.

Stop this slice when the remaining slow families yield no further
justified cuts. If it cuts little, record that under Learnings: slice 2 then
needs duration-balanced shards rather than a count change.

### 2. Every dashboard job finishes within the per-job budget, and trunk CI meets the target
Type: Behavior
Status: planned
Proof: a story-branch CI run with every dashboard job ≤ about 2m10s and the
run under 2m30s. After trunk integration, the delivered revision's CI run and
two reruns (`gh run rerun <id>`) each finish under 2m30s with all jobs
green, each dashboard job still uploads its `dashboard-playwright-report-*`
artifact, and the `test` jobs still upload `test-times-*`.

Behavior: with slice 1's fresh branch-CI reports → rerun the shard simulation
and pick the smallest change that keeps every shard within budget: a shard
count, or duration-based assignment of spec files to shard jobs from a
committed longest-first list (see Current decisions). Apply it in
`.github/workflows/ci.yml` and any helper, and keep `tests/ci-container.sh`
and `scripts/ci-container.sh` in agreement → every browser test runs in
exactly one dashboard job; the type-check still runs once; per-job failure
reporting and artifacts still work; and runs meet the target.

A duration-based partition must still place spec files missing from the list
(new specs), so every spec runs. Prove that with a listing check over all
spec files with no duplicates and no misses, the way `scripts/test-jobs.sh`
splits are checked for shell tests.

## Proof ownership

| Promise (story) | Slice | Observation |
| --- | --- | --- |
| Delivered trunk revision and two reruns each under 2m30s | 2 | `gh run view <id> --json jobs,updatedAt,createdAt` for the run and both rerun attempts |
| No single job left as a variance-prone outlier | 2 | Every dashboard job ≤ about 2m10s in those runs |
| Coverage whole; no skipped, deleted, or weakened tests without justified equivalence | 1, 2 | Slice 1 diff review against `dough-test-optimization`; the HTML report test totals across dashboard jobs equal the listed suite (650 today plus or minus intended changes) |
| Diagnostic artifacts and per-job failure reporting keep working | 2 | Artifacts present on the trunk runs; a failing browser test still fails its own job (the existing per-job step, unchanged or rechecked when the run step changes) |
| `tests/ci-container.sh` stays green | 2 | `npm test -- tests/ci-container.sh` |
| Unit and shell shares still partition with no duplicate or miss | 2 | Unchanged unless touched; if `ci.yml` test matrix changes, list `OPEN_DOUGH_TEST_SPLIT=i/n` shares as plan `193` did |
| Faster runners or longer timeouts do not count | 1, 2 | `runs-on` stays `ubuntu-24.04`; `timeout-minutes` not raised |

## Verification

At slice boundaries, run the specs the slice touched with
`npx playwright test --config dashboard/playwright.config.ts <spec…>`, plus
`npm run typecheck:dashboard` and `npm run lint`. For CI workflow changes, also
run `npm test -- tests/ci-container.sh`. Treat a local failure or flake as a
defect to fix, as with a CI one.
Hosted CI runs the full suite on every branch push and owns the timing proof.

## Learnings

- Slice 1 comparable local profile at claim `89923f8d`, default eight workers, production build global setup, identical 37-case selection, no retries: `/usr/bin/time -p env -u NO_COLOR PLAYWRIGHT_JSON_OUTPUT_NAME=/tmp/seed070-baseline.json npx playwright test --config dashboard/playwright.config.ts taken-agent-profile.spec.ts auto-refresh-branches.spec.ts agent-launch-card-sessions.spec.ts launch-observations.spec.ts agent-launch-ad-hoc-codex.spec.ts agent-launch-preparation-codex-retry.spec.ts agent-launch-model.spec.ts agent-launch-ad-hoc.spec.ts --reporter=./dashboard/tests/support/quietReporter.ts,json`. After the combined change the same command with output `/tmp/seed070-after-combined.json` passed all 37 cases. Wall time 34.94s → 22.98s (34.2%); runner 34.506s → 22.547s. Profiles remain private under `/tmp`.
- Retained experiments: finish actual browser animations after hover in `agentPortrait.ts`, retaining exact atlas/tile/scale/serving/geometry assertions (Taken-profile 15.817s → 2.534s); controlled external deadline in `launch-observations.spec.ts` executing real aggregation, asserting both configured 10s deadlines, pending-before-abort through a real event-loop turn, unknown-after-abort and aborted signal (summed 10.001s → 0.003s). The deadline alone gave no local wall gain (34.92s); the combined strategy did.
- Fixed observed pre-existing process-exit race in the selected Codex journey: synthetic SIGHUP log precedes actual child exit. Reuse `processAlive` polling after SIGHUP, retaining original kill assertion. A failed baseline was diagnostic only; the accepted baseline above passed.
- Final synchronization proof: three consecutive `env -u NO_COLOR npx playwright test --config dashboard/playwright.config.ts launch-observations.spec.ts agent-launch-ad-hoc-codex.spec.ts` (5 cases each); three consecutive same command prefix with `taken-agent-profile.spec.ts taken-agent-profile-refresh.spec.ts nerds-cartoon-portrait.spec.ts backlog-preparing.spec.ts` (5 each). All pass. Shared portrait consumers included. `npm run typecheck:dashboard` passed final edits. Independent refactor found none, preserved proof, and `git diff --check` passed. No tests removed/skipped; no production behavior changed.
- Rejected clock batching: 250ms stepping protects pending transport and rate-limit deadlines; wider stepping can overshoot those conditions. Other heavy families retain distinct publication/restart and damage-case protection; no further credible justified cuts found. Balance using hosted timing in slice 2 remains the supported route to target.
- Local measurement proves the selected family improvement only. Hosted summed durations and overall CI target remain pending. Conflicting inherited color variables caused diagnostic-only warning failures; proof commands unset `NO_COLOR`, preserving quiet output.
