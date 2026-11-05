# Execution notes — Show CI status and timing on the Intent homepage

Companion to [PLAN.md](./PLAN.md): ADR 0010 measurements, learnings, current
decisions and concern evidence recorded during execution.

## ADR 0010 baseline (slice 1, before product change)

Measured 2026-11-05 locally on a throwaway `npm run dev:dashboard` at
`http://127.0.0.1:55278` with `PATH` `gh` wrapper counting `gh api`
invocations and a private `DOUGH_GITHUB_REQUEST_OWNER_ROOT` (mode `0700`),
against Open Dough's trunk (`main`). Journey: Intent settled → choose
**CI status** → judgment on screen (`Passed at 68f27aa…`, `Checked at…`).

| Measure | Value |
| --- | --- |
| GitHub requests per show | **6** (`commits?sha=main&per_page=30` twice, `actions/workflows/ci.yml`, workflow push runs on `main`, artifacts list for the shown attempt, artifact zip download). The duplicate history listing matches Vite's React StrictMode double-mount on this throwaway dev server; `GITHUB-REQUESTS.md` still accounts trunk judgment as three asks plus proof's list+download when the summary is not already remembered. |
| Time until judgment on screen | **4822 ms** from the CI status tab click to `.intent-ci-state` with `Checked at` |
| Machine load average | **5.22 5.95 6.53** (`uptime` / `os.loadavg` at measurement start 2026-11-05T10:07:42Z) |

Evidence: `/tmp/dough-adr0010-baseline-meas/baseline-result.json` (local,
unpaid). Slice 5 records the warm comparison beside these numbers.

## ADR 0010 comparison (slice 5, after kept answer)

Measured 2026-11-05 locally on a throwaway `npm run dev:dashboard` at
`http://127.0.0.1:51138` with `PATH` `gh` wrapper counting `gh api`
invocations and a private `DOUGH_GITHUB_REQUEST_OWNER_ROOT` (mode `0700`),
against Open Dough's trunk (`main`). Journey after the product change: open
Intent with nothing selected (CI status is the homepage). Cold = first show
with an empty process keep; warm = leave Intent and return so the kept answer
is asked with a fresh read.

| Measure | Slice 1 baseline (CI status tab) | Slice 5 cold homepage | Slice 5 warm homepage |
| --- | --- | --- | --- |
| GitHub CI asks per show (judgment + proof list/download; StrictMode doubles counted) | **6** | **4** by the time `Checked at` appeared (history, workflow, runs, artifacts list; proof zip still outstanding) | **5** for the fresh read (history, workflow, runs, artifacts list + zip). Kept form asked nothing. |
| Time until a CI result on screen | **4822 ms** from tab click to `Checked at` | **10879 ms** from Intent navigation to `Checked at` (includes Intent settle; not the same start mark as the tab click) | **123 ms** to the kept judgment labelled previously retrieved; **4957 ms** until the fresh `Checked at` |
| Machine load average | **5.22 5.95 6.53** | **1.32 2.28 2.50** at measurement start 2026-11-05T11:33:28Z | same |

Evidence: `/tmp/dough-adr0010-slice5-meas/comparison-result.json` (local,
unpaid). Warm show puts CI evidence on screen without waiting on GitHub; per-show
fresh judgment asks stay in the account of `dashboard/GITHUB-REQUESTS.md`.

## Learnings (slice 1)

- Cold Intent (`perspective=intent`) can mount with `work === undefined`;
  showing CI in the terminal-explanation panel while locations are still
  loading double-judged once work settled — withhold CI until locations settle.
- CI Proof's accessible name "Proof" is not the Purpose/Proof reading region;
  empty-selection checks should assert the Purpose region / Purpose-and-Proof
  tablist, not a bare `Proof` region count.
- Post-change refactor extracted `IntentSelectionReading` and split
  `intentModePage` / `intentFileReadingPage` from oversized helpers; removed
  dead empty-selection Purpose/Proof branches.

## Learnings (slice 2)

- GHA `updated_at` is completion for the listed latest attempt; fixtures
  without times correctly surface **not recorded** once the wall-time line is
  always shown on Proof.
- Shared `attemptTimesOf` / `shownCiProofRun` keep judgment and Proof from
  duplicating start/completion spreading.

## Learnings (slice 3)

- Optional `durationMs` stays additive on schema v1; parts without a duration
  omit the field so entry sums only present parts.
- Duration collector tests live in `ci-proof-duration.test.mjs` so collect/
  summary files stay within the line budget.

## Learnings (slice 4)

- Entry execution time is derived only from parts (gaps or untimed present
  parts → partial); Intent CI whole-minute wording stays separate from
  file-Proof `proofDurationWords`.

## Learnings (CI repair after slice 5)

- Specs that asserted Purpose/Proof or Side by side on empty Intent selection
  must select a file first; empty selection is the CI homepage. Not-configured
  helpers must not treat CI status "Failed"/"Proof" wording as location noise.

## Current decisions

- Story Branch Mode; no step must act from trunk.
- Wall time is listed `updated_at − run_started_at` for GitHub Actions and
  `completedAt − startedAt` for an adapter attempt; it is never derived from
  summed durations. Without both times it is not recorded.
- An outcomes-based entry's execution time is the sum of its checks' job
  seconds from the times file; a Playwright entry's is the sum of every
  finished attempt's `durationMs`, retries included, so it is the tests' own
  time without shared hooks. The wording names it test execution time.
- The kept answer lives in the dashboard server process, bounded like the
  existing summary memory; nothing is persisted.
- The slices share one model: the shown attempt's evidence gains two timing
  facts from their natural sources, and the server keeps the last shown
  answer per target. No parallel CI status view, recognizer or status field
  is added.
- No numeric slice target or hard limit is established. Each slice has one
  proof loop; slice 1 is the largest because existing specs move to the
  homepage through shared page objects.

## Concern evidence

- Slice-plan refinement was not needed: each slice has one outcome and proof
  loop, slice 3 (published summaries) and slice 4 (display) are split because
  their proof loops are independent, and no Structure slice is needed before
  slice 1, which moves an existing component instead of preparing one.
- No remaining slice-specific concern was identified. Slice 3's hosted CI
  observation is ordinary post-publication proof on the story branch, not an
  unsettled premise; slice 1's baseline is a local, unpaid measurement taken
  before its change.
