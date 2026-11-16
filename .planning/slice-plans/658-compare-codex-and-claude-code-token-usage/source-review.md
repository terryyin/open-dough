# Source review

Launch: fresh general-purpose subagent (no conversation inheritance) on 2026-11-16, given only the seed section's Goal, Scope (with exclusions paragraph) and Key examples from `.planning/seeds/SEED-383-compare-codex-and-claude-code-token-usage.md` lines 22–70, with instructions to read no files, change nothing and return numbered commitments. Returned table retained verbatim below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: A developer can compare the token index of finished, dashboard-launched Codex and Claude Code tasks in System settings → Usage. | slice 2 |  |
| 1.1 | Qualification: only finished tasks count. | slice 2 |  |
| 1.2 | Qualification: only dashboard-launched tasks count. | slice 2 |  |
| 1.3 | Location: System settings → Usage. | slice 2 |  |
| 2 | The developer can see when usage occurred. | slice 2 |  |
| 3 | When comparing individual tasks, the developer can give closely timed tasks equal room on the chart. | slice 3 |  |
| 4 | Tool selection: show Codex, Claude Code, or both together. | slice 2 |  |
| 4.1 | Codex alone is a valid choice. | slice 2 |  |
| 4.2 | Claude Code alone is a valid choice. | slice 2 |  |
| 4.3 | Both together is a valid choice. | slice 2 |  |
| 4.4 | Example: the single Tool dropdown is replaced by a selection that lets the developer show Codex, Claude Code, or both. | slice 2 |  |
| 4.5 | Example: deselecting one tool hides its series. | slice 2 |  |
| 5 | Keep an independently calculated rolling median for each selected tool. | slice 2 |  |
| 5.1 | Example: with both selected, task points and rolling medians overlap on one chart. | slice 2 |  |
| 5.2 | Example: with both selected, the series use distinct, labeled colors. | slice 2 |  |
| 6 | Keep these filters available: | slice 2 |  |
| 6.1 | launch workflow; | slice 2 |  |
| 6.2 | model; | slice 2 |  |
| 6.3 | effort; | slice 2 |  |
| 6.4 | recent local calendar-day filtering. | slice 2 |  |
| 7 | Model options: offer the union of models available from the selected tools. | slice 2 |  |
| 7.1 | Example: the Model dropdown offers the models from the selected tools. | slice 2 |  |
| 7.2 | Example: the dropdown has one **All models** option that covers all selected tools. | slice 2 |  |
| 7.3 | Example: turning off a tool removes models offered only by that tool. | slice 2 |  |
| 8 | Model selection is kept while any selected tool offers that model. | slice 2 |  |
| 8.1 | Otherwise it returns to All models. Example: return to **All models** when the chosen model is no longer offered. | slice 2 |  |
| 9 | Spacing: switch between (a) a shared completion-time axis and (b) one chronological sequence that gives equal room to every visible task across the selected tools. | slice 3 |  |
| 9.1 | Time view example: both series use the same completion-time axis over the selected period. | slice 2 |  |
| 9.2 | Time view example: tasks that finished at the same time share a horizontal position. | slice 2 |  |
| 9.3 | Time view example: gaps between tasks are proportional to elapsed time. | slice 2 |  |
| 9.4 | Equal-spacing example: each visible task gets one equal-width slot in a single chronological sequence across the selected tools. | slice 3 |  |
| 9.5 | Equal-spacing example: the axis shows task order. | slice 3 |  |
| 9.6 | Equal-spacing example: selecting a point still shows the task's actual completion time and token index. | slice 3 |  |
| 9.7 | Example: turning the option off restores the shared time axis. | slice 3 |  |
| 10 | Spacing changes only placement. It does not change: | slice 3 |  |
| 10.1 | task values; | slice 3 |  |
| 10.2 | filtering; | slice 3 |  |
| 10.3 | median membership. | slice 3 |  |
| 11 | Keep these understandable: | slice 2 |  |
| 11.1 | tool identity; | slice 2 |  |
| 11.2 | coverage; | slice 2 |  |
| 11.3 | unpriced counts; | slice 2 |  |
| 11.4 | tariff meaning; | slice 2 |  |
| 11.5 | actual completion times. | slice 3 |  |
| 12 | Keep task inspection available by: | slice 2 |  |
| 12.1 | pointer; | slice 2 |  |
| 12.2 | keyboard; | slice 2 |  |
| 12.3 | touch; | slice 2 |  |
| 12.4 | closing the detail returns focus/context to its mark ("closing detail back to its mark"). | slice 3 |  |
| 13 | Narrow screens: tool choices and the spacing control stay usable. Example: both tool choices and the spacing control stay visible and usable on narrow screens. | slice 3 |  |
| 14 | Keep each tool's existing token-index calculation. | slice 2 |  |
| 15 | Use a shared numeric vertical scale. Example: a common numeric scale with each tool's reference unit labeled. | slice 2 |  |
| 16 | Name both reference units explicitly: | slice 2 |  |
| 16.1 | Codex: GPT-6.1 Sol input-token equivalents. | slice 2 |  |
| 16.2 | Claude Code: Claude Opus 5.5 input-token equivalents. | slice 2 |  |
| 17 | The comparison does not claim (Terry chose this interpretation on 2026-11-16): | slice 2 |  |
| 17.1 | identical units; | slice 2 |  |
| 17.2 | common cost; | slice 2 |  |
| 17.3 | tool efficiency. | slice 2 |  |
| X1 | Exclusion: matched workloads are not promised. | slice 2 |  |
| X2 | Exclusion: a tool efficiency ranking is not promised. | slice 2 |  |
| X3 | Exclusion: billing totals are not promised. | slice 2 |  |
| X4 | Exclusion: a new usage collector is not promised. | slice 2 |  |
| X5 | Exclusion: Cursor support is not promised. | slice 2 |  |
| X6 | Exclusion: changed tariffs are not promised. | slice 2 |  |
| X7 | Qualification on X1–X6: these are delivery limits only. They are not reasons to reject data the feature naturally supports. | slice 2 |  |
