# Dashboard CI timing measurements

Measured on 2026-10-29 for early serial deployment scheduling, shared-hook
weights, and fewer browser observation round trips. Timings are observations
from a small sample of shared runners, not a guaranteed saving per run.

Current findings and their dispositions are maintained in
[Test Optimization Candidates](../../.planning/TEST-OPTIMIZATION-CANDIDATES.md).
This document retains measurement evidence.

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

Measured on 2026-10-29. Full hosted and local observations, including
isolation guards and preparation tradeoffs, are in
[installed-start fixture timings](dashboard-installed-start-fixture-timings.md).
Subsequent production-watcher policy reduction is in
[production policy test timings](production-policy-test-timings.md).

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

### Resolved (2026-10-30 resolve)

The accepted costs and transferred obligation now live in
[Test Optimization Candidates](../../.planning/TEST-OPTIMIZATION-CANDIDATES.md#accepted-necessary-costs).
This heading remains as a forwarding link for existing story and plan references.
Touch-family reduction retained 2026-10-30 under ADR 0010 (36→21 cases);
spent plan/story recover from before-cleanup
`025b24e71325b524898f9a3a6b645cf3f519a0be`.

## Local touch-family reduction (SEED-180, 2026-10-30)

Retained 2026-10-30 under ADR 0010: 36 cases / 14 files → 21 / 12; focused
walls 32.647 / 33.074 / 31.827 s versus baseline 37.551 / 35.696 / 36.279 s;
ordinary suite green once (`selectedCount=1742`). Focused command, loads,
surviving-proof table, and comparison limits:
[dashboard touch-family timings](dashboard-touch-family-timings.md).

## Local `npm run test:dashboard` pass (SEED-177, 2026-10-30)

Measured under ADR 0010 like-conditions rules on the developer's Mac host.

| Revision | Role | Wall (`durationMs`) | Cases | Load (1m/5m/15m at start) | Notes |
| --- | --- | ---: | ---: | --- | --- |
| `3060f8f5` | Green baseline (admit) | 751.0s | 1754 | 5.18 / 4.98 / 6.77 | `strictStatus: passed` |
| `a047236b` | After `DOUGH_CHANGE_WAIT_MS` bound observation | 741.4s | 1754 | 4.79 / 7.04 / 10.55 | Modest suite-wall gain |

Boundary `agent-launch-change-wait` non-owner case: **34.6s → 3.9s**. Focused
family wall (`--workers=1`): **38.63s → 7.41–10.57s** (three consecutive
passes). Retained: `configuredLimit("DOUGH_CHANGE_WAIT_MS", 30_000)` with the
boundary test observing a 500 ms bound; production default remains 30 s.
Full-suite wall ≈ **9.6 s (1.3%)** shorter under comparable load.

SEED-177's bound observation does not reopen the decisions preserved in
[Test Optimization Candidates](../../.planning/TEST-OPTIMIZATION-CANDIDATES.md).

## Local `npm run test:dashboard` pass (SEED-191, 2026-10-30)

Measured under ADR 0010 like-conditions rules on the developer's 16-CPU / 48-GiB
Mac host (`npm run test:dashboard`, eight default workers, `NO_COLOR` unset).

| Revision | Role | Wall (`durationMs`) | Cases | Summed attempts / specs | Load (1m/5m/15m start → end) |
| --- | --- | ---: | ---: | ---: | --- |
| `7225da81` | Green baseline (admit) | 950.8s (951.4s wall) | 1,751 | 6,508.3s / 7,283.5s | 9.93 / 11.35 / 10.54 → 56.08 / 54.43 / 39.26 |
| `b374ab6b` | After Slices 2–3 | 554.3s (554.7s wall) | 1,747 | 4,080.8s / 4,283.3s | 4.62 / 4.81 / 6.19 → 20.86 / 16.95 / 12.41 |

Case delta (`1,751 → 1,747` selected, or `1,751 → 1,745` on the baseline set;
all passed, `0` skipped, `strictStatus: "passed"`): `-6` redundant voice
provider-failure browser journeys replaced by boundary assertions in
`boundary/session-instruction-voice-boundary.spec.ts`, plus `+2` story-review
diff-context cases merged from trunk (`0154843a`, SEED-189). Shared
`beforeAll`/`afterAll` hook overhead fell from **775.2s to 202.5s** (**−572.7s**).

- **Family 1 (`publishStoryColumnsJourney` worker cache, Slice 2):** Caching the
  read-only 4-commit origin once per worker in `dashboard/tests/launchJourney.ts`
  reduced the 4-spec / 15-case focused family (`--workers=1`) from **51.8s**
  (summed `.tsv` **46.2s**) to **38.5–41.2s** (**34.4–36.8s**) over three
  consecutive passes. Across all 44 `publishStoryColumnsJourney` specs in the
  full suite, summed spec time fell from **1,031.7s to 376.0s** and shared hook
  overhead fell from **615.0s to 87.8s** (**−527.2s**).
- **Family 2 (non-subject Claude `doneRenameWaitMs: 100`, Slice 2):** Bounding
  non-subject `markDone` / `closeOpenSessions` waits reduced the 15-spec /
  83-case focused family (8 workers) from **48.8s** (summed `.tsv` **272.3s**)
  to **21.5–22.8s** (**101.8–109.0s**) over three passes. In the full suite, the
  8 `closeOpenSessions` boundary specs fell from **155.5s to 23.4s** and all 15
  specs fell from **251.8s to 64.4s**. `boundary/agent-launch-done-rename-wait.spec.ts`
  and the 5,000ms production default remain unchanged.
- **Family 3 (voice dictation boundary move + direct credential seed, Slice 3):**
  `boundary/session-instruction-voice-boundary.spec.ts` proves all 8 upstream
  error variants (`401`, `403`, `429`, `500`, `200` empty, `200` malformed,
  `200` oversized, socket disconnect) plus `bytes > 0`;
  `session-instruction-voice-provider-failures.spec.ts` retains the refusal
  retry (`bytes > 0`, `recovered`, retry, `typedStart`) and `deadline` journeys;
  `session-instruction-voice.spec.ts` retains `saveVoiceKey(page)` UI settings
  round-trip and missing-key refusal while non-settings voice specs use
  `seedVoiceKey`. Focused 7-spec wall fell from **16.1s** (summed `.tsv`
  **65.9s**, 26 cases) to **13.1–13.2s** (**45.0–45.6s**, 20 cases) over three
  passes (`provider-failures` **21.1s → 5.5–5.8s**; full-suite voice specs
  **90.7s → 42.8s**).
- **Comparison limits:** Baseline started under somewhat higher load (`9.93` vs
  `4.62` 1m) and reached higher peak contention (`56.08` vs `20.86`) partly from
  36 redundant per-file Git fixture builds competing with 8 workers; controlled
  focused passes isolate each family's direct gain. No product behavior changed
  and no experiments were rejected. Raw records:
  `/tmp/SEED-191-optimize-dashboard-test-feedback/`.

## Local `npm run test:dashboard` pass (SEED-193, 2026-10-30)

Measured under ADR 0010 like-conditions rules on the developer's 16-CPU / 48-GiB
Mac host (`npm run test:dashboard`, eight default workers, `NO_COLOR` unset).

| Revision | Role | Wall (`durationMs`) | Cases | Summed attempts / specs | Load (1m/5m/15m start → end) |
| --- | --- | ---: | ---: | ---: | --- |
| `7aa54d9c` | Green baseline (admit) | 640.3s (640.74s wall) | 1,751 | 4,704.8s / 4,946.6s | 7.86 / 14.46 / 14.67 → 21.98 / 21.57 / 19.16 |
| `f279f582` | After Slice 3 | 622.8s | 1,750 | 4,593.2s / 4,823.0s | 5.55 / 6.27 / 9.76 → 17.76 / 16.77 / 14.27 |

Case delta (`1,751 → 1,750`, all passed, `0` skipped, `strictStatus: "passed"`):
`−1` redundant `final-report-touch` short-phone **240** height journey; **320**
retained (resize loop still visits 240; wrap and ≤480 survival remain).

- **Family (`final-report-touch` short-phone collapse, Slice 3):** Focused
  file wall fell from **34.3–34.6s** (4 cases) to **25.1–25.2s** (3 cases)
  over three consecutive passes when keeping **320** and dropping **240**.
  Keeping **240** alone left focused wall ≈**34s** (240 remained critical).
  Full-suite `final-report-touch.spec.ts` times fell from **51.4s to 23.0s**.
- **Rejected (Slice 2):** Moving HTTP-only story-review admission specs to
  boundary did not improve focused wall (**12.6s → 12.1–12.5s**); undone and
  listed under Pending candidates.
- **Comparison limits:** After suite started under quieter 1-minute load
  (`5.55` vs `7.86`); focused three-pass evidence anchors the family claim.
  No product behavior changed. Raw records:
  `/tmp/SEED-193-optimize-dashboard-test-feedback/`.

## Local `npm run test:dashboard` pass (SEED-194, 2026-10-30)

Measured under ADR 0010 like-conditions rules on the developer's 16-CPU / 48-GiB
Mac host (`npm run test:dashboard`, eight default workers, `NO_COLOR` and
`FORCE_COLOR` unset).

| Revision | Role | Wall (`durationMs`) | Cases | Summed attempts / specs | Load (1m/5m/15m start → end) |
| --- | --- | ---: | ---: | ---: | --- |
| `02ddad60` | Green baseline (admit) | 679.6s (680.10s wall) | 1,750 | 4,958.5s / 5,207.2s | 6.53 / 5.26 / 5.15 → 43.44 / 35.64 / 22.34 |
| `276ef912` | After Slices 2–3 | 657.2s (657.90s wall) | 1,746 | 4,797.1s / 5,064.9s | 8.70 / 14.82 / 17.30 → 30.23 / 26.65 / 23.62 |

Case delta (`1,750 → 1,746`, all passed, `0` skipped, `strictStatus: "passed"`):
`−4` Claude launch-dialog model kind-matrix journeys (execution/session
offers-Model; refinement/execution Default-without-`--model`).

- **Family (`agent-launch-model` kind matrix, Slice 2):** Focused file wall
  fell from **13.3–16.4s** (11 cases) to **10.0–11.7s** (7 cases) over three
  consecutive passes. Retained refinement offers-Model+Opus (layout), session
  Default-without-`--model`, Cancel/Escape dismiss across kinds, reopen
  Default, Tab order, and refused launch. Boundary
  `agent-launch-model-boundary.spec.ts` unchanged. Full-suite file `.tsv`
  **20.1s → 17.8s**.
- **Rejected (Slice 3):** Collapsing Codex discovered-model story workflows
  to `execution` + `ad-hoc` did not improve focused family wall
  (**10.2–12.1s / 13 → 11.0–11.6s / 12**); undone and listed under Pending
  candidates.
- **Comparison limits:** After suite started under higher multi-minute load
  (`14.82` / `17.30` vs `5.26` / `5.15`); focused three-pass evidence anchors
  the retained family. No product behavior changed. Raw records:
  `/tmp/SEED-194-optimize-dashboard-test-feedback/`.

## Local `npm run test:dashboard` pass (SEED-195, 2026-10-30)

Measured under ADR 0010 like-conditions rules on the developer's 16-CPU / 48-GiB
Mac host (`npm run test:dashboard`, eight default workers, `NO_COLOR` and
`FORCE_COLOR` unset). Scope: top 20% of suite cost by recorded duration
contribution, following related families.

| Revision | Role | Wall (`durationMs`) | Cases | Summed attempts / specs | Load (1m/5m/15m start → end) |
| --- | --- | ---: | ---: | ---: | --- |
| `bb8924b8` | Green baseline (admit) | 670.0s (670.51s wall) | 1,746 | 4,882.2s / 5,141.0s | 5.86 / 5.38 / 8.73 → 19.94 / 22.37 / 18.81 |
| `45cc3fba` | After Slices 2–3 | 665.8s (666.30s wall) | 1,746 | 4,898.9s / 5,150.7s | 6.87 / 11.42 / 14.47 → 22.81 / 23.19 / 20.18 |

Case count unchanged (`1,746` passed, `0` skipped, `strictStatus: "passed"`).

- **Family (Codex retained-retry independent-launch dedupe, Slice 2):** Focused
  `boundary/agent-launch-preparation-codex-retry.spec.ts` wall fell from
  **14.6–16.5s** (10 cases) to **9.5–10.9s** (10 cases) over three consecutive
  passes. All ten damage refusals retained; only the `workspace` case still
  launches unrelated Story B. Journey
  `agent-launch-preparation-codex-retry.spec.ts` still passed. Full-suite file
  `.tsv` **56.2s → 39.0s** (before from Slice 1 ranking written before a later
  focused run overwrote the baseline times artifact).
- **Rejected (Slice 3):** Collapsing `agent-launch-start-phases` to one host
  did not improve focused wall (**9.20–9.77s / 3 → 9.14–9.38s / 2**); undone and
  listed under Pending candidates.
- **Comparison limits:** After suite started under higher multi-minute load
  (`11.42` / `14.47` vs `5.38` / `8.73`); suite-wall delta is modest (4.1s).
  Focused three-pass evidence anchors the retained family. No product behavior
  changed. Raw records: `/tmp/SEED-195-optimize-dashboard-test-feedback/`.

## Local `npm run test:dashboard` pass (SEED-196, 2026-10-30)

Measured under ADR 0010 like-conditions rules on the developer's 16-CPU / 48-GiB
Mac host (`npm run test:dashboard`, eight default workers, `NO_COLOR` and
`FORCE_COLOR` unset). Scope: top 40% of suite cost by recorded duration
contribution, following related families.

| Revision | Role | Wall (`durationMs`) | Cases | Summed attempts / specs | Load (1m/5m/15m start → end) |
| --- | --- | ---: | ---: | ---: | --- |
| `2c84e521` | Green baseline (admit) | 844.1s (844.94s wall) | 1,746 | 6,138.2s / 6,469.4s | 5.37 / 4.35 / 6.26 → 34.99 / 36.03 / 26.95 |
| `4dbd4474` | After Slices 2–5 | 779.5s (780.08s wall) | 1,746 | 5,736.1s / 6,046.9s | 11.19 / 12.95 / 16.49 → 24.11 / 27.16 / 24.46 |

Case count unchanged (`1,746` passed, `0` skipped, `strictStatus: "passed"`).

- **Family (scoped Cursor noninterference Recover preamble, Slice 4):** Focused
  `cursor-session-scope-noninterference.spec.ts` wall fell from
  **15.14–16.18s** (3 cases) to **14.04–15.47s** over three consecutive
  passes (cleanup recheck **13.37s**). Continuation
  `cursor-session-scope-continuation.spec.ts` still proved Recover through a
  deliberate default change. Full-suite file `.tsv` **43.4s → 42.6s**.
- **Rejected (Slice 2):** Completed-review journey Landed-runs tail trim did
  not improve focused wall (**9.69–10.00s → 11.07–11.51s**); undone.
- **Rejected (Slice 3):** Gaps `ambiguous-merge` drop was inconclusive
  (**10.34–11.18s → 9.48–11.51s**); undone.
- **Skipped (Slice 5):** Recent-delete dialog delta withdrawn at decisive
  checkpoint (launch setup dominates; only one Keep-focus overlap).
- **Comparison limits:** Baseline ended under extreme load (`~35` 1-minute);
  after started quieter (`~11–13`) but still contended. Suite-wall delta
  (~64.6s) is **not** a like-conditions claim and is not attributed to the
  retained change. Focused three-pass evidence anchors the modest family
  retain. No product behavior changed. Raw records:
  `/tmp/SEED-196-optimize-dashboard-test-feedback/`.
