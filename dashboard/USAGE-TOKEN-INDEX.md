# Token index in System settings → Usage

Usage charts finished dashboard-launched tasks of the selected tools (Codex,
Claude Code or both, each an independent checkbox; Codex initially), launch
workflow, model and effort. Each selected tool is read as its own cohort with
the same filters and period, under its own versioned tariff in
`server/usageTariffs.ts`, named in that tool's summary: Codex in GPT-6.1 Sol
input-token equivalents, Claude Code in Claude Opus 5.5 input-token
equivalents, pricing five-minute and one-hour cache writes each at its own
rate. Both tools share one numeric scale and one completion-time axis, but each
value stays in its tool's reference unit: the comparison claims no identical
unit, common cost or tool efficiency. Each tool has its own named, coloured
trace and summary, so tool identity also reads without colour; readouts and
task detail name the tool, since task IDs may repeat across tools.

Model and Effort offer the union of the selected tools' options with one All
models and one Any effort. A choice stays while any selected tool offers it;
once every selected tool has answered, an unoffered one returns to the broad
option. Answers for an older selection are discarded. A failed read names its
tool and is never shown as empty; a tool that answered with no priced task says
so. With no tool selected, the view asks for one and shows no measurements.

A Claude response at an unpriced speed, or whose cache writes were stored
without that split, leaves its task unpriced. The index is an observation, not
a bill or a claim of improvement. A Claude launch whose root transcript has no
usage, or whose worker left none, is partial with that gap named in its detail.
Claude Code's background agent-view summaries, recaps and idle compaction never
reach transcripts; the Claude Code summary says so in one note under its tariff
rather than marking every task partial.

**Equal spacing** is off initially; then the horizontal axis is completion
time and each task stands at its time. Switched on, the axis is **task order**:
every shown task of the selected tools takes one equal-width slot in
completion order across tools, equal times ordered by tool (Codex, then Claude
Code) and then task ID. An unpriced task has no point and so no slot. Filters
and tool choices rebuild that sequence; Refresh and cohort or day changes keep
the setting. Spacing changes placement only: values, filtering and median
membership stay the same, and readouts and task detail keep the actual
completion time, index and tool. Each median observation (`average`) names the
eligible task it ends with (`task`, beside its time `at` and `value`), so under
equal spacing each tool's median, including an above-scale **Median ↑**, stands
at its own task's slot. Switching off restores every time position.

**Last N days** starts at 30 and selects today plus the previous N−1 local
calendar days, including the first midnight and excluding tomorrow's midnight.
It is temporary view state. Cohort changes and Refresh keep the choice. Invalid
input explains the positive-whole-day requirement and retains the last valid
view. Counts, partial/unpriced notes and empty states describe that period.

The **10-task rolling median** of each selected tool uses its priced, measured
tasks without known gaps in the same cohort; tools never share a median. Each
value averages the two middle indices of the ten latest eligible tasks.
Earlier eligible tasks still contribute before the visible period. Large tasks remain eligible. Only median observations in the period are
shown; no observation means no median is available there.

Ordinary task values at or below 50 million set the zero-based scale. A larger
task appears as a red **×**, labeled with its actual value at its date, and can
still open its details by pointer, touch or keyboard. Partial coverage remains
explicit. Coincident large tasks use separate rows while retaining their date
coordinates. With only large tasks, the bounded axis is 0–50 million and the
view explains that no ordinary points exist. Measured zero remains zero.

The median has a distinct line painted above the task dots and never sets their
scale. Above-scale medians use **Median ↑** labels and dated values below the
chart. They are observations, not task actions. The trace breaks around overflow
rather than suggesting that its ceiling is the real value. Above-scale labels
name their tool (**Codex Median ↑**). For nine 1-million
tasks plus one 65-million task, the median is **1 million**.

Essential values need no hover. Overflow rows expand the chart for separate
actions and labels. Closing task details returns focus to its mark; changing
the period or hiding its tool clears a task selection that is no longer
visible. Refresh retains the last result for the same selection and its check
time while checking and when it fails.

The browser sends explicit `[from, until)` instants separately from cohort
identity. The server computes medians before period projection, counts dated
unpriced tasks before aggregation, and preserves the existing all-history API
when bounds are absent. Malformed or incomplete bounds are rejected. The shared
history chart receives Usage's optional display policy; CI and scope timing keep
their own scales, marks, gaps, references and readouts.
