---
id: SEED-151
status: active
planted: 2026-10-25
planted_during: Combined feedback maintenance across maintained projects
trigger_when: Test-file changes consume CI share headroom despite sound product code
scope: small
---

# SEED-151: Keep test shares reliable as the suite changes

## Why This Matters

Open Dough contributors need a useful CI verdict without unrelated budget repairs.
[DD-279](../../docs/maintainer/project-test-findings.md#dd-279) records dashboard
deadlines in plan 292 and a Node share-budget failure in plan 350. Refreshing
`longest-first` repaired those runs, but adding or renaming files can reshuffle
the unmeasured remainder and exhaust the margin again. A refreshed list alone
has already proved temporary.

## Stories

<a id="tidy-share-allocator"></a>

### 1. Tidy the share allocator's surfaces and tests

**Identity:** SEED-151#tidy-share-allocator
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/354-tidy-share-allocator/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3ed8e702b1771209eb3e3b1f5c8de1b057ee3c7bd8849ad136c130dc5696a8df","plan":"ef988d6be6c815eb660662b419d4d72667a87b360e9aa2f8f2441f1d5e60e387"}}
```

Bounded retrospective correction of SEED-151#balance-test-shares (closed; its story and plan 353 are recoverable at `8dd20d66:.planning/seeds/SEED-151-test-share-reliability.md#balance-test-shares` and `8dd20d66:.planning/slice-plans/353-balance-test-shares/PLAN.md`;
commits 61d16b66, 34f3192f, 065d6655, 2a537b21), planned in
[plan 354](../slice-plans/354-tidy-share-allocator/PLAN.md), which holds the
correction input: the retrospective's findings, proof ownership and slices.
It adds no feature promise.

**Goal:** A contributor who runs, reads or changes the share allocator finds
its commands failing readably, its deal stated in full once, each piece of
form, order and floor knowledge in one home, and tests that pin behavior
rather than today's numbers and names, while every job and spec file is dealt
exactly as before.

**Scope:**

Required behavior and structure (each with what is preserved):

- `scripts/test-shares.mjs` reports a missing `--list`, `--labels`,
  `--budget`, refresh times file or default `<dir>/longest-first` as a
  `FAIL: ...` line naming the path, exit 1, like its other failures, instead
  of a Node stack trace. Preserved: every command's output for readable
  inputs, the runner's `share` path, which passes `--list` only for an
  existing list.
- The deal rule (longest first to the lightest share, ties to the lower
  share, unrecorded jobs at the recorded median in bytewise order) has one
  full statement, in `tests/test-shares.md`; `dashboard/tests/shards.md`
  states the dashboard's differences and links it, the `scripts/share-deal.mjs`
  header points at it, and the READMEs, `tests/time-budget.md` and
  `.github/workflows/ci.yml` keep their short forms. Preserved: both list
  headers describe the deal, the list form and the refresh, as story 1
  requires; the CI comment at the dashboard times step names
  `dashboard/tests/shards.md`, where the refresh procedure is.
- The times form (seconds to a tenth, longest first, ties bytewise) is
  written by `scripts/share-deal.mjs` for both the refresh merge and the
  dashboard reporter: `dashboard/tests/support/specTimes.ts` imports a typed
  export instead of its own `bytewise`, rounding and sort. Preserved: the
  `dashboard-times-<shard>` artifact line for line.
- The Bash 5 floor number and its message have one home, read by both
  `scripts/test-environment.bash` and the preview's `scripts/test-jobs.sh`
  listing. Preserved: the runner's and the preview's refusal of an older
  bash, each naming the remedy.
- The tests read the ceiling they assert from a scratch budget or from
  `readTimeBudget`, never as a literal 710; the dashboard's real-suite
  assertions keep exact-once membership and the preview text for a new spec
  while the greedy-invariant spread test and the copied tie rule go; the
  malformed list line keeps its unit, runner and configuration proofs and
  loses the share-command copy; the retained CI runs fixture is named by what
  it holds (`tests/support/fixtures/node-suite-ci-runs/`) with the run ids and
  revision in the test header. Preserved: every behavior a current test
  covers stays covered by a named test; the former planning copy of these
  inputs was removed with plan 353 and is recoverable at
  `8dd20d66:.planning/slice-plans/353-balance-test-shares/plan-350-inputs/`.

Preserved throughout: the deal, every allocation (`share`, `preview`,
`refresh` outputs for readable inputs), `tests/longest-first` and
`dashboard/tests/longest-first`, `tests/time-budget`, the CI shard and share
counts, and `scripts/ci-test-times.sh` and `scripts/test-budget.sh`.

Out of scope: any change to the deal, the list form, ceilings, refresh
automation or published guidance; the merge of `spec-times.spec.ts`'s first
two nested runs is optional and taken only if it keeps each assertion.

**Key examples:**

1. `node scripts/test-shares.mjs share --list tests/missing --split 1/3`
   (and `preview --labels missing`, `preview --budget missing`,
   `refresh ... missing-times.txt`, `preview --test-dir <dir>` with no
   `<dir>/longest-first`) prints one `FAIL:` line naming that path on stderr
   and exits 1, with no stack trace.
2. A reviewed edit of `total-job-seconds` in `tests/time-budget` (710 to
   720, then reverted) leaves `tests/support/test-shares.test.mjs` and
   `tests/support/share-deal-recorded-runs.test.mjs` green.
3. `grep -rln 'ties to the lower' scripts tests dashboard .github` names only
   `tests/test-shares.md`; `dashboard/tests/shards.md` and the
   `scripts/share-deal.mjs` header link to it.
4. `grep -rn 'Bash 5 or newer' scripts` names one file; the runner and the
   preview still refuse a Bash 3.2 stub naming the floor.
5. After the change, `OPEN_DOUGH_DASHBOARD_SPLIT=1/12 npx playwright test --list`
   from `dashboard/` selects the same 43 files as at 2a537b21, and
   `node scripts/test-shares.mjs preview --split-count 3` prints the same
   predictions.

**Architecture:** None new. The allocator keeps its one owner under
`scripts/`; this correction moves knowledge that leaked beside it back into
it and into the documents that already own the deal.
