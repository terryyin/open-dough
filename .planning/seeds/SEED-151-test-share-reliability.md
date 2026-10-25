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

<a id="balance-test-shares"></a>

### 1. Keep test-file changes from unexpectedly exhausting CI share budgets

**Identity:** SEED-151#balance-test-shares
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/353-balance-test-shares/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d675a0bef14e240dc2284f1e2ed19f51cef149e9dc13b1959ab961e9715baa88","plan":"343fc0ae0266a44b672086e0e1951aa6f057402cdce4b328e16ead2d70a208f2"}}
```

**Goal:** A contributor who adds, removes, or renames a test file gets CI
shares whose predicted load stays balanced and visible before pushing, so a
sound change no longer fails a Node share budget or a dashboard shard
deadline because its position in a name-ordered deal moved unrelated jobs
onto a near-full share. This serves the trustworthy CI verdict that
[DD-279](../../docs/maintainer/project-test-findings.md#dd-279) lost twice:
once in the dashboard shards (plan 292) and once in the Node share budget
(plan 350), each after one file was added and each repaired only by a refresh
that ages again.

**Scope:**

Required behavior:

- Both suites deal their shares by recorded duration. Each recorded job (a
  Node runner job, or a dashboard spec file) goes, longest first, to the share
  with the smallest predicted total; unrecorded jobs follow in sorted order,
  each at one assumed duration (the median of the recorded ones), so a
  file-set change moves predicted time by at most that job's duration instead
  of a block of its sorted neighbours. The deal is deterministic: CI jobs
  compute it independently from the same files and list, with ties broken by
  share index and stable orders.
- Each suite's duration list keeps seconds beside labels, in the
  `<seconds><TAB><label>` form the runner's `test-times` artifact already
  prints, and lists every recorded job rather than those of 3 s or more, so an
  unrecorded job is a genuinely new or renamed one.
- One allocator owns the partition for both suites; `scripts/test-jobs.sh` and
  `dashboard/tests/support/testFiles.mjs` consume it instead of each holding
  a copy of the deal. Within a share, recorded jobs still start longest first.
- An allocation preview a contributor runs locally reports, per suite, each
  share's predicted total, the unrecorded jobs with the assumed duration
  applied to them, and, for the Node suite, the headroom to the total ceiling
  in `tests/time-budget`. The dashboard preview reports predicted test-seconds
  per shard without a ceiling, because its deadline is wall-clock under
  parallel workers.
- The dashboard CI shards retain per-spec durations in the same
  `<seconds><TAB><file>` form as an artifact, so both lists are refreshed from
  CI artifacts by one documented procedure that keeps the seconds.
- `tests/README.md`, `dashboard/tests/README.md`, `tests/time-budget.md` (its
  thin-share step points at the preview) and the list headers describe the
  deal, the list form and the refresh.
- Completion records the adopted response, its revision, the measured
  allocation of the landed revision's CI run and the remaining hosted-use
  observation criterion at
  [DD-279](../../docs/maintainer/project-test-findings.md#dd-279) and its
  [project index](../../ProjectFindings.md#dd-279).

Preserved: every job and spec file runs in exactly one share; strict failure
verdicts; the `tests/time-budget` ceilings (74 s per job, 710 job-seconds per
share) and the dashboard's 320-second deadline; three Node shares and twelve
dashboard shards; substitute test directories (`OPEN_DOUGH_TEST_DIR`) with
their own lists; `scripts/ci-test-times.sh` and `scripts/test-budget.sh` as
they are.

Rejection constraint: a list line without seconds fails the run naming the
line before any check starts, as a malformed `OPEN_DOUGH_TEST_SPLIT` already
does (`tests/README.md`), because the runner refuses malformed configuration
rather than running a guessed partition.

Deferred promises, not built or verified here: refreshing the lists
automatically in CI or on a schedule (the preview makes a stale list visible
and the refresh stays one documented command); changing share counts,
ceilings or the deadline; evening out runner-speed differences between share
jobs (DD-279 saw 1.4 times across unrelated specs; balanced predictions
maximise the margin for it but promise no stable hosted timing); balancing
dashboard tests below the file; any published skill change or generic CI
service.

Boundary assumptions: CI's seven-day artifact retention is the duration
source, so the refresh reads a recent run; durations from one runner are
proportional enough across runners to balance by; the preview uses recorded
CI seconds, never local timing.

**Key examples:**

1. Plan 350 reconstructed from retained inputs (runs 39875064344 before and
   39883782226 after, list at `3fba18f9`, 84 labels, one 1.0 s file added):

   | Deal | Share 1 | Share 2 | Share 3 | Jobs changing share |
   | --- | --- | --- | --- | --- |
   | Positional, before (measured) | 607.1 | 497.6 | 683.3 | |
   | Positional, after (measured) | 588.6 | 495.6 | 711.1 | 47 |
   | By duration, predicted from the before run | 596.0 | 596.0 | 596.0 | |
   | By duration, after (measured) | 599.2 | 599.5 | 596.6 | 0 |

   The added file lands alone on the lightest share; every share keeps more
   than 110 job-seconds of headroom instead of share 3 ending 1.1 over.
2. A contributor adds an unrecorded test file and runs the preview: it lists
   that file as unrecorded at the assumed duration on the lightest share, and
   the other shares' predictions are unchanged.
3. A contributor renames `tests/git-publication-native.sh` (54.4 s recorded):
   the positional deal swings the shares to 518.0 / 646.2 / 631.1; the
   duration deal gives 621.7 / 591.8 / 581.8, the heaviest share rising by no
   more than the renamed job's real duration, and the preview names the
   renamed file as unrecorded so the next refresh records it.
4. The preview on a stale list (84 recorded of 417 jobs) counts 333 unrecorded
   jobs, so staleness is visible before CI; the balanced deal from a fresh
   list then follows the documented refresh.
5. After one CI run with the dashboard's per-spec artifact, the refreshed
   dashboard list carries seconds; the twelve shards' predicted test-seconds
   lie within one spec file's duration of each other, every spec file is
   matched by exactly one shard, and a newly added spec appears in the
   preview as unrecorded in the lightest shard.
6. A list line without seconds fails the Node run, or the dashboard
   configuration, naming that line before any check runs.
7. The landed revision's CI run supplies the measured per-share totals that
   DD-279 records; the story claims nothing about runner-to-runner timing.

**Architecture:** This introduces one concept, share allocation by recorded
duration, and gives it one owner: a Node ES module beside the runner under
`scripts/`, consumed by the shell runner's job listing through `node` and by
the Playwright configuration through an import (the dashboard type-check
accepts that import; observed in preparation). Its inputs are the suite's job
labels, its duration list and the split; its outputs are the share's labels,
longest first, and the prediction report. Both suites produce the list's input
in the runner's `test-times` form, the Node runner as today and the dashboard
quiet reporter newly, retained as CI artifacts. The two positional copies of
the deal retire. `scripts/ci-test-times.sh` keeps reading Node artifacts for
budget verdicts; the preview reads lists, not artifacts. No ADR is needed:
this is internal test infrastructure under ADR 0002's low-cost change and ADR
0005's proof by tests, and the North Star has no topic here.

<a id="tidy-share-allocator"></a>

### 2. Tidy the share allocator's surfaces and tests

**Identity:** SEED-151#tidy-share-allocator
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/354-tidy-share-allocator/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2858b4bcc3aca2a3c6b577a2839cdfd0441ed87de86d1418c43a8d69286fc159","plan":"451200d41496d2bff1b0a3a9292e00f898eff15a23f43d0555c835b0c9fda839"}}
```

Bounded retrospective correction of SEED-151#balance-test-shares (plan 353,
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
  covers stays covered by a named test; the planning copy
  `.planning/slice-plans/353-balance-test-shares/plan-350-inputs/` is left for
  story 1's wrap-up.

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
