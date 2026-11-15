# Token index in System settings → Usage

Usage charts finished dashboard-launched tasks of the chosen tool (Codex or
Claude Code), launch workflow, model and effort. Each tool has its own
versioned tariff in `server/usageTariffs.ts`, named under the chart, so indices
of different tools are never on one chart: Codex in GPT-6.1 Sol input-token
equivalents, Claude Code in Claude Opus 5.5 input-token equivalents, pricing
five-minute and one-hour cache writes each at its own rate. A Claude response
at an unpriced speed, or whose cache writes were stored without that split,
leaves its task unpriced. Switching tool keeps the workflow, and the model and
effort where the new tool ran them. The index is an observation, not a bill or
a claim of improvement. A Claude launch whose root transcript has no usage, or
whose worker left none, is partial with that gap named in its detail. Claude
Code's background agent-view summaries, recaps and idle compaction never reach
transcripts; the Claude Code chart says so in one note under its tariff rather
than marking every task partial.

**Last N days** starts at 30 and selects today plus the previous N−1 local
calendar days, including the first midnight and excluding tomorrow's midnight.
It is temporary view state. Cohort changes and Refresh keep the choice. Invalid
input explains the positive-whole-day requirement and retains the last valid
view. Counts, partial/unpriced notes and empty states describe that period.

The true trailing **10-task moving average** uses priced, measured tasks without
known gaps in the same cohort. Earlier eligible tasks still contribute before
the visible period. Large tasks remain eligible. Only average observations in
the period are shown; no observation means no average is available there.

Ordinary task values at or below 50 million set the zero-based scale. A larger
task appears as a red **×**, labeled with its actual value at its date, and can
still open its details by pointer, touch or keyboard. Partial coverage remains
explicit. Coincident large tasks use separate rows while retaining their date
coordinates. With only large tasks, the bounded axis is 0–50 million and the
view explains that no ordinary points exist. Measured zero remains zero.

The average has a distinct line painted above the task dots and never sets their
scale. Above-scale averages use **↑ Avg** labels and dated values below the
chart. They are observations, not task actions. The trace breaks around overflow
rather than suggesting that its ceiling is the real value. For nine 1-million
tasks plus one 65-million task, the true average remains **7.4 million**.

Essential values need no hover. Overflow rows expand the chart for separate
actions and labels. Closing task details returns focus to its mark; changing
the period clears a task selection that is no longer visible. Refresh retains
the last result and check time while checking and when it fails.

The browser sends explicit `[from, until)` instants separately from cohort
identity. The server computes averages before period projection, counts dated
unpriced tasks before aggregation, and preserves the existing all-history API
when bounds are absent. Malformed or incomplete bounds are rejected. The shared
history chart receives Usage's optional display policy; CI and scope timing keep
their own scales, marks, gaps, references and readouts.
