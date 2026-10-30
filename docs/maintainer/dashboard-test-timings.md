# Dashboard CI timing measurements

Measured on 2026-10-29 for early serial deployment scheduling, shared-hook
weights, and fewer browser observation round trips. Timings are observations
from a small sample of shared runners, not a guaranteed saving per run.

## Comparable workload

The hosted workflow is `.github/workflows/ci.yml`, on `ubuntu-24.04`, with
12 dashboard shards and four observed workers per shard. No existing case,
assertion, fixture isolation, native touch move, one-pixel observation, strict
verdict or retry policy was removed. Baseline revision
`0bffc434d8ef9cb7db0f294fbf6c8bcf1aca7869` has the same application and test
code as the pre-investigation revision `5de6411d`.

The baseline contains 1,721 browser cases in 570 files. Scheduling adds two
regression cases; the helper candidate adds four more. Compare cases by spec
file, registration location and full describe/title path, ignoring project
names because serial chains now use a complementary native project. Original
cases must occur exactly once with the same verdict. Four existing platform
skips remain identical on Ubuntu; the other 1,717 original cases pass. No new
skips or retries were added. The helper candidate passes 1,723 cases and retains
those same four skips, for 1,727 selected cases.

Dashboard-job seconds include setup, the suite and artifact handling. Suite
seconds are the HTML reporter's elapsed duration. CI seconds run from workflow
creation to the last job's completion, including runner queue time. Job start
spread exposes queue skew; it is not code execution time. The maximum job and
maximum suite can belong to different shards.

## Hosted observations

| Revision | Run | Max dashboard job | Max browser suite | Full CI | Job start spread |
| --- | --- | ---: | ---: | ---: | ---: |
| Baseline `0bffc434` | [40789926577](https://github.com/terryyin/open-dough/actions/runs/40789926577) | 291s | 252.96s | 295s | 1s |
| Baseline `0bffc434` | [40790934008](https://github.com/terryyin/open-dough/actions/runs/40790934008) | 247s | 217.71s | 333s | 104s |
| Scheduling `7eda0986` | [40793949962](https://github.com/terryyin/open-dough/actions/runs/40793949962) | 241s | 211.35s | 244s | 1s |
| Helpers `930974d6` | [40796911428](https://github.com/terryyin/open-dough/actions/runs/40796911428) | 233s | 199.30s | 235s* | 1s |
| Helpers and fixture repair `876b2645` | [40798322595](https://github.com/terryyin/open-dough/actions/runs/40798322595) | 226s | 202.91s | 229s | 0s |

Baseline runs were dispatched manually; the scheduling run was push-triggered.
They execute the same workflow and job commands. The baseline and scheduling
runs passed all 16 jobs. *The first helper run passed all 12 dashboard jobs and
lint but failed one Node job: an unchanged owner-replacement test read a record
after its removal (`owner.1.json`, `ENOENT`). Its 235s is time to a failed CI
result, not time to passing CI. A separate bounded fixture-race repair retains
that failure and the successful dashboard measurement. The repair run passed
all 16 jobs and repeats the same dashboard changes. Its code changes are the
test fixture repair and its regression test; this is not a second observation
of an identical complete revision. Runs were sequential, with unchanged shards and
workers. Both candidate dashboard reports preserve the original selection and
verdicts exactly, plus six passing regression cases.
Unmeasured runner headroom and cache variability limit causal attribution.

The production update chain began 102.39s and 81.63s into baseline suites,
versus 6.30s after scheduling. Its tail after all other work in that shard fell
from 64.84s and 52.92s to 13.46s. The other two production chains also started
within six seconds, and finished before their ordinary peers. This supports
the dispatch mechanism. The update chain itself took longer with concurrent
peers in that run, so the saving comes from overlap rather than faster
individual deployment transitions.

The phone header step took 26.28s and 23.12s in baseline runs, 26.81s after
scheduling, and 21.40s/20.86s with helpers. The large sidebar-resize case took
61.20s/42.24s, 61.64s and 38.29s/44.67s respectively. The short-window room step
varied: 27.75s/16.65s, 10.15s and 15.50s/9.91s. The phone step improved in both
candidate observations; layout timings do not isolate a separate gain from
runner variance. Reported Evaluate-step counts are not comparable after
browser handles move sampling into operations the HTML report does not list
individually; use elapsed timings and the native-input guards, not that count.

The production update chain began at 6.05s/6.02s with helpers; its residual
idle tail was 0s/7.97s. A small tail remains possible as runners vary. Longest
dashboard jobs averaged 269s in the two baselines and 229.5s in the two
candidate observations, a descriptive 39.5s (14.7%) reduction. Longest suites
averaged 235.33s and 201.10s respectively (14.5% lower). These small-sample
means are not confidence bounds. The latest passing complete CI took 229s;
compare the baseline 295s/333s with the queue-skew caveat above.

The retained change uses native Playwright project dispatch and existing
allocation/reporting seams; browser helpers avoid success-path diagnostic
reads and combine each frame wait with its live reading predicate. Scheduling
provides the clearest critical-path gain. The phone-step observation supports
retaining touch batching; no independent layout speedup is claimed.

## Ordinary local observations

Command, before and after, with unchanged default workers:

```sh
env -u NO_COLOR npm run test:dashboard -- production-watcher \
  cursor-sessions-sidebar-resize-lasting \
  recently-done-sessions-sidebar-room agent-terminal-touch
```

The host had 16 logical CPUs and 48 GiB RAM; the runner used eight default
workers. Commands ran sequentially, using the same checkout dependencies and
sanitized color environment. Each passed all 24 selected cases.

| Code | Wall time | Reporter elapsed |
| --- | ---: | ---: |
| Baseline | 97.35s | 96.98s |
| Scheduling | 88.97s | 88.57s |
| Scheduling and helpers | 92.09s | 91.69s |

The combined observation is 5.26s faster than the baseline, but 3.12s slower
than scheduling alone. It establishes no additional local helper gain. A
34-case helper family, including the four new real-browser guards, passed
three consecutive times in 38.12s, 37.76s and 37.94s. These repetitions check
changed asynchronous behavior; they are not repeated baseline comparisons.

An earlier complete local attempt failed strict verdicts because inherited
`NO_COLOR` conflicted with nested runs enabling `FORCE_COLOR`. It supplies
no valid speed baseline. Full-suite coverage is measured by hosted CI.

## Evidence and reproduction

GitHub run pages retain job timestamps and per-shard Playwright HTML reports
as workflow artifacts, subject to their retention policy. HTML reports retain
case selection, worker count, elapsed time, native-input steps and browser
observations. The committed hook-inclusive duration lists were refreshed with
`scripts/test-shares.mjs refresh` from the two baseline reports, including
exact `beforeAll`/`afterAll` hooks once per execution.

Raw downloads, strict local records, exact commands and analysis outputs for
this measurement were retained outside Git under
`/private/tmp/dashboard-ci-time-164` on the measurement host. They are temporary
local evidence; the named revisions and run links identify the reproducible
workload and hosted results.

## Isolated installed-start fixture preparation

Measured on 2026-10-29 after the scheduling and observation changes above.
Baseline `a94c65e2c2e4a9143b5260b569c83bd4292f081c` is a metadata-only revision
with the runtime of `b22c40678b15adabb25fb10872048a77945940d9`. Candidate
`8c55a30c56d324100cc44cbb105123aa8ebfc823` prepares fresh packed installed-skill
origins once per run, then copies private origins and creates native clones.
No writable Git objects, refs, config, indexes, HOME, server, browser context or
fake-service state is shared. Run preparation uses current working-tree source
and is removed at teardown; there is no persistent cache.

The baseline selects 1,735 cases in 577 files. The candidate preserves every
original full case identity and verdict and adds three passing isolation guards:
concurrent real installed starts and private publication/cleanup; current source
across successive preparations; and failure cleanup with unexpected errors.
It selects 1,738 cases in 578 files: 1,734 pass and the same four platform skips
remain. Both use twelve shards with four observed workers; neither has a retried
case. Existing scenarios and assertions, strict verdicts, native input,
every-control observations and compile-cache policy are unchanged.

| Revision | Run | Max dashboard job | Max browser suite | Full CI | Job start spread |
| --- | --- | ---: | ---: | ---: | ---: |
| Baseline `a94c65e2` | [40809484652](https://github.com/terryyin/open-dough/actions/runs/40809484652) | 230s | 199.32s | 235s | 2s |
| Candidate `8c55a30c` | [40814111625](https://github.com/terryyin/open-dough/actions/runs/40814111625) | 219s | 187.70s | 221s | 0s |
| Same candidate `8c55a30c` | [40815056135](https://github.com/terryyin/open-dough/actions/runs/40815056135) | 227s | 203.38s | 230s | 0s |

All three runs passed all sixteen jobs. The baseline and repeat were manually
dispatched; the first candidate was push-triggered. Runs were sequential with
unchanged commands and workload. First-job queue was 3s/2s/3s respectively. The
maximum job and suite can belong to different shards. Both candidates preserve
the same original identities/verdicts plus three guards, with no extra attempts.
Accumulated origin-fixture spans fell from 442.99s to 81.66s/81.83s (81.5–81.6%
lower). Dashboard-fixture spans varied from 1,162.17s to 1,191.43s/1,187.21s.
Ordinary per-test setup/teardown, excluding shared hooks, fell from 1,829.75s
to 1,461.44s/1,465.70s.
These are accumulated, sometimes nested spans, not elapsed CI seconds; do not
add them together. The three new guard bodies cost 6.63s/7.06s of accumulated time.

The longest dashboard jobs were 3–11s (1.3–4.8%) shorter and full CI 5–14s
(2.1–6.0%) shorter than this baseline. Suite elapsed 187.70–203.38s straddles
the 199.32s baseline, so this sample establishes no reliable suite-elapsed
improvement. Shared runner headroom, cache state and unchanged slow-case
variability limit causal attribution. The repeated fixture-component reduction
is much clearer than the modest, variable elapsed CI effect.

The same normal local family passed all 45 cases before and after with eight
default workers on one 16-CPU/48-GiB host:

```sh
env -u NO_COLOR npm run test:dashboard -- agent-launch-model.spec.ts \
  agent-launch-codex-model.spec.ts agent-launch-preparation-codex-retry.spec.ts \
  agent-session-cursor.spec.ts accessible-board-keyboard.spec.ts
```

Wall time fell from 41.26s to 30.88s (25.2%); reporter time fell from 40.558s to
30.458s. The comparison includes eager preparation. Host load and available
memory varied. Three consecutive isolation-guard runs passed, as did twenty
ordinary installed-start, recovery, process, serving and compile-cache cases.

Preparation has a tradeoff: even focused runs with no installed starts pay its
cost. A real setup profile observed 1.71–3.29s for the two layout seeds. An early
first-use diagnostic varied/slowed despite cheaper initialization and does not
independently establish a gain. The retained benefit is supported by the normal
family and complete CI, not that microprofile. Aborted or incomplete diagnostics
are excluded from passing proof.

A real preview-server profile retained Vite, native config loading and prebuilt
assets. Three private starts took 269–276ms, with only 4–7ms before spawning;
closing them took 28–30ms. Existing build/bundle/executable reuse already removes
the obvious repeated immutable work, so no further bootstrap change was
justified. Concurrent HTTP/browser observations confirmed that changing and
stopping one preview left its peer's process, HOME, fake answers, Codex model
and browser storage intact. All observed processes and run preparation ended.

Raw strict records, complete report downloads, profiles, exact commands and
comparison outputs are retained outside Git under
`/private/tmp/cheap-isolated-fixtures-167`. Hosted reports and named revisions
provide the reproducible workload, subject to artifact retention.

Subsequent reduction of repeated production-watcher policy builds is measured
in [production policy test timings](production-policy-test-timings.md).

## Local `npm run test:dashboard` pass (2026-10-29 / 2026-10-30)

Measured under ADR 0010 like-conditions rules on the developer's Mac host.

| Revision | Role | Wall (`durationMs`) | Cases | Load (1m/5m/15m at start) | Notes |
| --- | --- | ---: | ---: | --- | --- |
| `838e533a` | Green baseline (board-scroll Column-fit fix) | 597.8s | 1753 | 5.30 / 4.58 / 3.98 | `strictStatus: passed` |
| `3149bf64` | After journey/boundary wait move | 970.8s | 1754 | 10.02 / 8.52 / 8.19 | Unlike load; no suite-wall claim |
| `3149bf64` | Second after run | 695.5s | 1754 | 6.46 / 26.67 / 29.19 | Contended (pygardon research); no suite-wall claim |

`agent-launch-second-server` case duration: **64.6s → 52.5s / 51.2s**. Focused
family wall (journey + boundary change-wait) measured **67.8s → 53.4s** with
three consecutive passes. Retained: move non-owner 30s change-wait into
`dashboard/tests/boundary/agent-launch-change-wait.spec.ts`; keep Column-fit
clear of Chromium overlay scrollbars via a 15px WebKit scrollbar track on
`.board-scroll`. Full-suite wall speedup was **not** demonstrated under
comparable load.

### Remaining candidates

1. Long single journeys (`agent-completion-attention`, production-watcher chains)
   only with surviving proof and measured wall-time gain — **human decision
   pending** (2026-10-30 resolve): whether thinner integrated coverage is an
   acceptable confidence trade-off for local wall time. SEED-177 is already
   Taken for measured dashboard test optimization.

### Resolved (2026-10-30 resolve)

- **Necessary cost:** further unique multi-step `agent-launch*` poles
  (`ad-hoc-terminal`; remaining `agent-launch-second-server` cost after the
  SEED-176 change-wait boundary move). Dual-preview page protection and
  immediate terminal-attachment journeys are the protected behavior; cheaper
  boundary moves for those poles are already landed. No project
  profile-exclusion mechanism; none invented.
- **Replacement plan:** touch viewport matrices that only repeat layout
  branches — obligation in
  [slice-plans/413-resolve-dashboard-touch-viewport-candidates/PLAN.md](../../.planning/slice-plans/413-resolve-dashboard-touch-viewport-candidates/PLAN.md)
  (SEED-178). Implementation not authorized by resolve-only triage.
