# Source-only review

A fresh general-purpose agent (`/root/source_review`, no inherited turns)
received only the selected story's [Goal, Scope and Key examples](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#mount-system-settings-sections-and-usage-charts)
and its contextual introduction and estimate. It was asked to number
independently observable promises. The coordinator allocated the returned IDs.

The 20 chart cases and nine sections cases refer to the original spec counts.
The exception for equivalent E2E proof applies when a case has no mounted replacement.
For C01–C14, Codex reports two tasks on the same day, valued at 65,000,000 and
70,000,000, with one partial. C05–C10 also account for the scope's input methods.
C15–C25 come from the Two tools compared example. The story specifies no
minimum timing improvement, exact refusal text, or focus destination for Cancel
and Escape. The four built-app frame specs, full-group comparison and
`frontendApp.ts` retirement are deferred to the parent.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| S01 | Move `system-settings-usage-average` to plain Vitest cases on mounted Chromium using `SystemSettingsUsage`. (Goal, Scope) | slice 1 | observed: system-settings-usage-average.spec.ts, all five mounted Chromium cases and the Slice 1 case mapping |
| S02 | Move `system-settings-usage-compare` to the same mounted section. (Goal, Scope) | slice 2 | |
| S03 | Move `system-settings-usage-legend` to the same mounted section. (Goal, Scope) | slice 1 | observed: system-settings-usage-legend.spec.ts, all three mounted Chromium cases and the Slice 1 case mapping |
| S04 | Move `system-settings-usage-overflow` to the same mounted section. (Goal, Scope) | slice 3 | |
| S05 | Move `system-settings-usage-spacing` to the same mounted section. (Goal, Scope) | slice 3 | |
| S06 | Move the four existing `system-settings-openai` cases to plain Vitest on mounted Chromium using `OpenAISettings`. (Goal, Scope) | slice 5 | |
| S07 | Move the two existing `system-settings-terminal-theme` cases to plain Vitest on mounted Chromium using `TerminalThemeSettings`. (Goal, Scope) | slice 6 | |
| S08 | Move the existing `system-settings-project-management-touch` case to plain Vitest on mounted Chromium using `ProjectsSettings`. (Goal, Scope) | slice 6 | |
| S09 | Move the two existing `project-add-dialog` cases to plain Vitest on mounted Chromium using `ProjectsSettings`. (Goal, Scope) | slice 6 | |
| S10 | `OpenAISettings` reads its setting through a typed source behind its reading hook. (Goal, Scope) | slice 4 | |
| S11 | `OpenAISettings` changes its setting through that source. (Scope) | slice 4 | |
| S12 | `TerminalThemeSettings` reads its setting through a typed source behind its reading hook. (Goal, Scope) | slice 4 | |
| S13 | `TerminalThemeSettings` changes its setting through that source. (Scope) | slice 4 | |
| S14 | `ProjectsSettings` reads its setting through a typed source behind its reading hook. (Goal, Scope) | slice 4 | |
| S15 | `ProjectsSettings` changes its setting through that source. (Scope) | slice 4 | |
| S16 | The page supplies the OpenAI source that communicates with the endpoints. (Scope) | slice 4 | |
| S17 | The page supplies the terminal theme source that communicates with the endpoints. (Scope) | slice 4 | |
| S18 | The page supplies the Projects source that communicates with the endpoints. (Scope) | slice 4 | |
| S19 | The OpenAI source preserves the existing endpoint refusal wording. (Scope) | slice 4 | |
| S20 | The terminal theme source preserves the existing endpoint refusal wording. (Scope) | slice 4 | |
| S21 | The Projects source preserves the existing endpoint refusal wording. (Scope) | slice 4 | |
| S22a | Mounted OpenAI cases build replies of the shared setting contracts with page-loadable MakeMe steps. (Goal, Scope) | slice 5 | |
| S22b | Mounted terminal theme cases build replies of the shared setting contracts with page-loadable MakeMe steps. (Goal, Scope) | slice 6 | |
| S22c | Mounted Projects cases build replies of the shared setting contracts with page-loadable MakeMe steps. (Goal, Scope) | slice 6 | |
| S23 | A case observing a pending read owns its deferred reply. (Scope) | slice 5 |  |
| S24 | A case observing a pending save owns its deferred reply. (Scope) | slice 6 | |
| S25a | Extend the mounted Usage page objects for chart marks. (Scope) | slice 1 | observed: system-settings-usage-chart-page.ts showsLarge and showsDistinctMedianAboveDots compare rendered SVG marks and task controls in the mounted average cases |
| S25b | Extend the mounted Usage page objects for the chart axis. (Scope) | slice 1 | observed: system-settings-usage-chart-page.ts hasAxis reads rendered ticks in mounted one-million and all-large median cases |
| S25c | Extend the mounted Usage page objects for the chart legend. (Scope) | slice 1 | observed: system-settings-usage-legend-page.ts showsKeyFor and showsSummarySwatches compare named shapes and computed paint in all mounted legend cases |
| S25d | Extend the mounted Usage page objects for chart readouts. (Scope) | slice 1 | observed: system-settings-usage-chart-page.ts showsMedianOverflow reads visible, contrasting SVG labels and dated text without task controls in the mounted average cases |
| S25e | Extend the mounted Usage page objects for chart spacing. (Scope) | slice 3 | |
| S26a | Mounted OpenAI cases operate their section through a small page object beside the specs. (Scope) | slice 5 | |
| S26b | Mounted terminal theme cases operate their section through a small page object beside the specs. (Scope) | slice 6 | |
| S26c | Mounted Projects cases operate their section through a small page object beside the specs. (Scope) | slice 6 | |
| S27a | Keep the Playwright settings page objects for the remaining built-app cases. (Scope) | slice 7 | |
| S27b | Keep the Playwright settings page objects for E2E. (Scope) | slice 7 | |
| S28 | Preserve every distinct assertion of the existing cases. (Scope) | slice 7 | |
| S29 | Omit an existing case only where an E2E journey proves the same behavior. (Scope) | slice 7 | |
| S30 | Name that covering E2E journey for every case omitted under S29. (Scope) | slice 7 | |
| S31 | Pair every retired built-app case that is migrated with its mounted case by name. (Scope) | slice 7 | |
| S32 | Retire each `dashboard/test-support/` export or module whose last consumer moves. (Scope) | slice 7 | |
| S33 | Keep the support E2E uses. (Scope) | slice 7 | |
| S34 | Keep the support the remaining specs use. (Scope) | slice 7 | |
| S35 | The resulting Configuration folder contains only cases that need the page frame. (Goal) | slice 7 | |
| S36 | Compare the focused selection’s timing before and after the move. (Scope) | slice 7 | |
| S37 | Retain chart proof in light mode. (Scope) | slice 3 | |
| S38 | Retain chart proof in dark mode. (Scope) | slice 3 | |
| S39 | Retain chart proof in narrow windows. (Scope) | slice 3 | |
| S40 | Retain chart proof at zoom. (Scope) | slice 1 | observed: system-settings-usage-average.spec.ts 200% zoom case mounts at 640 by 450 and doubleUsageDeviceScale observes DPR 2 before day, clipping, touch detail and focus checks |
| S41 | Use CDP touch to reach the control in a touch case. (Scope) | slice 6 | |
| S42 | Drive rotation by changing the mounted viewport. (Scope) | slice 6 | |
| S43 | Drive reduced-height cases through the mounted viewport. (Scope) | slice 6 | |
| S44 | Run the moved Usage chart cases over the existing typed `UsageSource`. (Goal, Scope) | slice 3 | |
| S45 | Supply their typed Token index answers through `makeMe.aTokenIndexAnswer`. (Goal, Scope) | slice 3 | |
| C01 | The chart shows the 65,000,000 task as a large mark above the axis. (Coincident large tasks) | slice 3 | |
| C02 | The chart shows the 70,000,000 task as a large mark above the axis. (Coincident large tasks) | slice 3 | |
| C03 | The axis shows `0`, `25M`, and `50M`. (Coincident large tasks) | slice 3 | |
| C04 | The note says that every priced task is above 50 million. (Coincident large tasks) | slice 3 | |
| C05 | Pointer selects the 65,000,000 task. (Coincident large tasks) | slice 3 | |
| C06 | Pointer selects the 70,000,000 task. (Coincident large tasks) | slice 3 | |
| C07 | Touch selects the 65,000,000 task. (Coincident large tasks) | slice 3 | |
| C08 | Touch selects the 70,000,000 task. (Coincident large tasks) | slice 3 | |
| C09 | Keyboard selects the 65,000,000 task. (Coincident large tasks) | slice 3 | |
| C10 | Keyboard selects the 70,000,000 task. (Coincident large tasks) | slice 3 | |
| C11 | The 65,000,000 task’s detail names its value. (Coincident large tasks) | slice 3 | |
| C12 | The 70,000,000 task’s detail names its value. (Coincident large tasks) | slice 3 | |
| C13 | The selected partial task’s detail names its partial coverage. (Coincident large tasks) | slice 3 | |
| C14 | Close returns focus to the selected mark. (Coincident large tasks) | slice 3 | |
| C15 | Codex and Claude Code share one time axis. (Two tools compared) | slice 2 | |
| C16 | Codex and Claude Code share one scale. (Two tools compared) | slice 2 | |
| C17 | Codex has its own median. (Two tools compared) | slice 2 | |
| C18 | Claude Code has its own median. (Two tools compared) | slice 2 | |
| C19 | Codex has its own unit. (Two tools compared) | slice 2 | |
| C20 | Claude Code has its own unit. (Two tools compared) | slice 2 | |
| C21 | Codex has its own note. (Two tools compared) | slice 2 | |
| C22 | Claude Code has its own note. (Two tools compared) | slice 2 | |
| C23 | A selected task retains its tool identity. (Two tools compared) | slice 2 | |
| C24 | An empty tool indicates that it is empty. (Two tools compared) | slice 2 | |
| C25 | A failed read names the tool whose read failed. (Two tools compared) | slice 2 | |
| E01 | Hold an OpenAI status read of the prior machine state while saving a key. Let the save answer first, then release the read. The section still shows `API key: Configured`. (A held OpenAI status) | slice 5 | |
| E02 | With the analogous held status read and reply order, Remove leaves the section showing `API key: Not configured`. (A held OpenAI status) | slice 5 | |
| E03 | A successful key save after a refused status read leaves the section showing `API key: Configured`. (A held OpenAI status) | slice 5 | |
| E04 | When touch selects Solarized Dark and the save is refused, the previously saved theme remains visible. (A refused terminal theme save) | slice 6 | |
| E05 | The refusal is visible when that save is refused. (A refused terminal theme save) | slice 6 | |
| E06 | Retry is reachable after rotating the viewport following that refused save. (A refused terminal theme save) | slice 6 | |
| E07 | At reduced viewport height, after a touch edit and refused project save, Retry sends the exact draft again. (A refused project change) | slice 6 | |
| E08 | An origin/path mismatch remains associated with the path field. (Adding a project) | slice 6 | |
| E09 | The mismatch preserves the path input. (Adding a project) | slice 6 | |
| E10 | The mismatch preserves the origin input. (Adding a project) | slice 6 | |
| E11 | The mismatch results in no save. (Adding a project) | slice 6 | |
| E12 | Cancel results in no save. (Adding a project) | slice 6 | |
| E13 | Cancel returns focus. (Adding a project) | slice 6 | |
| E14 | Escape results in no save. (Adding a project) | slice 6 | |
| E15 | Escape returns focus. (Adding a project) | slice 6 | |
