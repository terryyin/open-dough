# Claude Code execution usage spikes, 2026-10-17 to 2026-11-16

System settings → Usage showed three rises in the 10-task rolling median for
Claude Code Execution launches. This record explains them for
[SEED-388](../../.planning/seeds/SEED-388-measure-and-control-agent-launch-cost.md),
[SEED-345](../../.planning/seeds/SEED-345-session-token-efficiency.md) and
[SEED-367](../../.planning/seeds/SEED-367-bounded-slice-active-time.md).
Values are millions of Claude Opus 5.5 input-token equivalents at the Usage
tariff.

## Method

The 265 priced tasks came from `/__usage/token-index?tool=claude&workflow=execution`
for the 30 days ending 2026-11-16. Each task was re-priced from its root and
subagent transcripts between the launch time and the reported end, with the
[Claude Code accounting](session-token-efficiency-research.md#claude-code-token-accounting)
rules: responses deduplicated by message ID and cache writes priced by
lifetime. Subagents were grouped by their description as slice implementer,
refactor pass, repair or diagnosis, retrospective or correction, and other.
The figures below come from the transcripts, because the Usage index
undercounts some tasks ([below](#usage-index-undercount)).

## Periods

| Period         | Tasks | Median per task | Slices per task | Slice agent: cost, turns, peak context | Observed model and effort |
| -------------- | ----- | --------------- | --------------- | -------------------------------------- | ------------------------- |
| Oct 17–24      | 75    | 2.7             | 3.5             | 0.26, 28, 99k                          | Opus medium               |
| Oct 25 – Nov 2 | 42    | 6.8             | 4.8             | 0.43, 36, 119k                         | Opus medium               |
| Nov 3–7        | 54    | 3.5             | 2.9             | 0.44, 36, 121k                         | Opus medium               |
| Nov 8          | 38    | 4.2             | 3.0             | 0.54, 44, 139k                         | Opus medium               |
| Nov 9          | 8     | 26.8            | 3.9             | 1.70, 101, 266k                        | Opus xhigh and max        |
| Nov 11–12      | 20    | 7.1             | 3.8             | 0.55, 27, 117k                         | Mostly Fable 5.2          |
| Nov 13–15      | 15    | 17.6            | 4.7             | 1.47, 97, 232k                         | Opus high, unrequested    |
| Nov 15–16      | 13    | 4.3             | 2.8             | 0.36, 33, 109k                         | Opus medium               |

## Causes

<a id="plan-size"></a>

### Plan size (Oct 25 – Nov 2)

Effort and model were unchanged. Plans grew from 4.2 to 6.5 slices in
Pygardon and from 2.2 to 3.3 in Open Dough. The four largest executions had
9–12 slices and 12–20 slice and refactor agents each: Pygardon SEED-144
(28.3), SEED-145 (27.2), SEED-20261042 (18.7) and SEED-20261065 (17.7). The
coordinator's cost per task rose about 1.8× (114 to 163 turns), and its peak
context reached 550–680k on these plans. The rise ended when the work changed
to small stories, not because of a guidance change. The 8-slice cap and the
15-active-minute limit arrived on 2026-11-15.

<a id="effort-and-model"></a>

### Effort and model (Nov 9 – Nov 15)

Effort changes how much work an agent does. Model changes the price of each
turn. Slice agents from Nov 7 onward:

| Observed model and effort | Agents | Median cost | Median turns | Median peak context | Cost per turn |
| ------------------------- | ------ | ----------- | ------------ | ------------------- | ------------- |
| Opus medium               | 193    | 0.47        | 41           | 125k                | 11.8k         |
| Opus high                 | 54     | 1.53        | 99           | 241k                | 15.0k         |
| Opus xhigh                | 9      | 1.55        | 95           | 263k                | 16.4k         |
| Opus max                  | 20     | 3.35        | 133          | 411k                | 23.3k         |
| Fable 5.2 medium          | 37     | 0.69        | 27           | 137k                | 29.4k         |
| Fable 5.2 high            | 29     | 0.92        | 28           | 129k                | 33.2k         |

Each of these tasks was also a different story, so the comparison is not
controlled. The rise in turns was consistent, though, across 13 high-effort
and 4 max-effort tasks.

- **Nov 9.** Launches chose xhigh or max after SEED-280 added an effort
  choice to the launch dialog. SEED-281 cost 56.0, SEED-285 53.7 and SEED-284
  51.9. Their coordinators peaked at 800–890k context.
- **Nov 11–12.** Mostly Fable 5.2. Turn counts stayed ordinary, but each
  turn cost about 2.5× as much.
- **Nov 13–15.** All 11 Opus launches that requested no effort and started
  between 2026-11-12T10:50Z and 2026-11-14T23:52Z ran at `high`. Launches
  started just before that window ran at `medium`, and so has every launch
  since 2026-11-15T03:54Z. `~/.claude/settings.json` was last modified at
  2026-11-15T03:21Z and now sets `modelSettings` effort `medium` for Opus 5.5
  and Fable 5.2. A launch that requests no effort inherits the user-level
  setting, and no Open Dough surface showed which effort it resolved to.
- **Distorted baseline.** The
  [2026-11-15 re-measurement](session-token-efficiency-research.md#2026-11-15-re-measurement)
  sampled this high-effort window ("every main and worker request ran at
  effort `high`"). Its worker figures are therefore high-effort figures.

<a id="runaway-diagnosis"></a>

### Unbounded diagnosis (all three rises)

Single repair agents that ran without a bound:

- "Diagnose and repair Intent CI timeouts": 9.8 over 269 turns, Opus max,
  SEED-261, Nov 9.
- "Diagnose and repair CI failure": 7.0 over 103 turns, Fable 5.2 high,
  SEED-316, Nov 12.
- "Repair flaky CI mailbox checks": 7.1 over 280 turns, Opus high, SEED-334,
  Nov 14.

Repair agents carried 22.8 of SEED-334's 80.7. During Nov 13–15, repair
agents cost 2.6 per task, against 0.1–0.8 in other periods.

<a id="waiting"></a>

### Waiting and test-heavy stories (Nov 13–15)

SEED-334 (run product-wide end-to-end tests) made 410 test runs across 45
agents, and SEED-346 (native A/B comparisons) cost 25.5. Agents ran shell
`sleep` 18.4 times per task, against 2.5–4.5 in other periods. After the
2026-11-15 rules on waiting without polling and on a silent supplier wait,
the latest 13 tasks average 3.4 sleeps.

## State on 2026-11-16

In the latest 13 tasks:

- Plans average 2.8 slices.
- A slice agent costs 0.36 over 33 turns.
- No agent exceeded 150 turns.
- The median coordinator peak is still 293k.

At medium effort, 0–2% of slice agents exceeded 150 turns in every period.
The current median of 3–4.6 is about 1.5× the October level. Most of the
difference comes from the work mix: an Open Dough slice costs more than a
Pygardon slice.

<a id="usage-index-undercount"></a>

## Usage index undercount

The Usage index counts only the launch's first human-input turn. Each Claude
Code launch record holds a single `nativeTurns` entry. When the developer
types again in the same session, for example to answer a question, choose an
option or say "the watch is restarted", the responses after that input belong
to no task.

- **Tasks with a later developer input (82 of 265).** The median index is
  0.53 of the launch-window transcript cost, and 38 of them are below half.
- **Tasks with a single input (183).** The median is 1.00, and 4 are below
  half.
- **Example.** SEED-192#open-development-intent-frame shows 0.14 against 7.0.
  The developer answered "1" at 03:18, two minutes into a ten-hour execution.

The tasks that need a developer's help are often the longest and most
expensive ones. Those are the tasks the index hides.
