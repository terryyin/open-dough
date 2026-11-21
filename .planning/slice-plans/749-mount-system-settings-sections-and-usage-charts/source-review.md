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
| S02 | Move `system-settings-usage-compare` to the same mounted section. (Goal, Scope) | slice 2 | observed: system-settings-usage-compare.spec.ts, five mounted Chromium replacements at the same path |
| S03 | Move `system-settings-usage-legend` to the same mounted section. (Goal, Scope) | slice 1 | observed: system-settings-usage-legend.spec.ts, all three mounted Chromium cases and the Slice 1 case mapping |
| S04 | Move `system-settings-usage-overflow` to the same mounted section. (Goal, Scope) | slice 3 | observed: system-settings-usage-overflow.spec.ts, three retained titles run on mounted Chromium |
| S05 | Move `system-settings-usage-spacing` to the same mounted section. (Goal, Scope) | slice 3 | observed: system-settings-usage-spacing.spec.ts, four retained titles run on mounted Chromium |
| S06 | Move the four existing `system-settings-openai` cases to plain Vitest on mounted Chromium using `OpenAISettings`. (Goal, Scope) | slice 5 | |
| S07 | Move the two existing `system-settings-terminal-theme` cases to plain Vitest on mounted Chromium using `TerminalThemeSettings`. (Goal, Scope) | slice 6 | |
| S08 | Move the existing `system-settings-project-management-touch` case to plain Vitest on mounted Chromium using `ProjectsSettings`. (Goal, Scope) | slice 6 | |
| S09 | Move the two existing `project-add-dialog` cases to plain Vitest on mounted Chromium using `ProjectsSettings`. (Goal, Scope) | slice 6 | |
| S10 | `OpenAISettings` reads its setting through a typed source behind its reading hook. (Goal, Scope) | slice 4 | observed: OpenAISettings.tsx passes stable typed source.read to useLocalSetting. The mounted OpenAI case reads the actual GET route and status refusal |
| S11 | `OpenAISettings` changes its setting through that source. (Scope) | slice 4 | observed: OpenAISettings.tsx invokes typed save and remove through useLocalSetting.change. Mounted source cases observe the save request and Configuration E2E covers actual save and remove |
| S12 | `TerminalThemeSettings` reads its setting through a typed source behind its reading hook. (Goal, Scope) | slice 4 | observed: savedTerminalTheme.ts reads source.read through the saved-theme hook. The mounted terminal source case observes the GET and rendered read refusal |
| S13 | `TerminalThemeSettings` changes its setting through that source. (Scope) | slice 4 | observed: savedTerminalTheme.ts saves through source.save. Mounted source proof observes the draft POST and fallback. Configuration E2E observes persistent choice and failed save |
| S14 | `ProjectsSettings` reads its setting through a typed source behind its reading hook. (Goal, Scope) | slice 4 | observed: ProjectsSettings.tsx reads through the typed source with the current AbortSignal. The mounted Projects source case observes the request, read refusal and retry |
| S15 | `ProjectsSettings` changes its setting through that source. (Scope) | slice 4 | observed: ProjectsSettings.tsx passes typed add, visibility and removal to its controls. Mounted source proof observes the draft and field refusal; built-app and E2E cover visible selection and persistent changes |
| S16 | The page supplies the OpenAI source that communicates with the endpoints. (Scope) | slice 4 | observed: SystemSettings.tsx passes pageOpenAIConfigurationSource. The retained built-app OpenAI cases run from the normal page, and Configuration E2E exercises real endpoints |
| S17 | The page supplies the terminal theme source that communicates with the endpoints. (Scope) | slice 4 | observed: App.tsx passes pageTerminalThemeSource to SavedTerminalThemeProvider. The built-app theme, Terminals and Configuration E2E prove the page wiring and shared saved state |
| S18 | The page supplies the Projects source that communicates with the endpoints. (Scope) | slice 4 | observed: SystemSettings.tsx passes pageProjectSettingsSource. Built-app Project Add, hide selection and Settings Look and project E2E exercise the normal page |
| S19 | The OpenAI source preserves the existing endpoint refusal wording. (Scope) | slice 4 | observed: system-settings-page-sources.spec.ts OpenAI case reads the exact status fallback and the credential-folder save refusal from the visible alert |
| S20 | The terminal theme source preserves the existing endpoint refusal wording. (Scope) | slice 4 | observed: system-settings-page-sources.spec.ts terminal theme case reads exact endpoint read refusal and the save fallback including previous-theme-kept wording |
| S21 | The Projects source preserves the existing endpoint refusal wording. (Scope) | slice 4 | observed: system-settings-page-sources.spec.ts Projects case observes the read fallback and exact Add refusal linked to Local path. Project E2E exercises real refusal and retry |
| S22a | Mounted OpenAI cases build replies of the shared setting contracts with page-loadable MakeMe steps. (Goal, Scope) | slice 5 | |
| S22b | Mounted terminal theme cases build replies of the shared setting contracts with page-loadable MakeMe steps. (Goal, Scope) | slice 6 | |
| S22c | Mounted Projects cases build replies of the shared setting contracts with page-loadable MakeMe steps. (Goal, Scope) | slice 6 | |
| S23 | A case observing a pending read owns its deferred reply. (Scope) | slice 5 |  |
| S24 | A case observing a pending save owns its deferred reply. (Scope) | slice 6 | |
| S25a | Extend the mounted Usage page objects for chart marks. (Scope) | slice 1 | observed: system-settings-usage-chart-page.ts showsLarge and showsDistinctMedianAboveDots compare rendered SVG marks and task controls in the mounted average cases |
| S25b | Extend the mounted Usage page objects for the chart axis. (Scope) | slice 1 | observed: system-settings-usage-chart-page.ts hasAxis reads rendered ticks in mounted one-million and all-large median cases |
| S25c | Extend the mounted Usage page objects for the chart legend. (Scope) | slice 1 | observed: system-settings-usage-legend-page.ts showsKeyFor and showsSummarySwatches compare named shapes and computed paint in all mounted legend cases |
| S25d | Extend the mounted Usage page objects for chart readouts. (Scope) | slice 1 | observed: system-settings-usage-chart-page.ts showsMedianOverflow reads visible, contrasting SVG labels and dated text without task controls in the mounted average cases |
| S25e | Extend the mounted Usage page objects for chart spacing. (Scope) | slice 3 | observed: system-settings-usage-spacing-page.ts owns spacing input, focus, axis and median coordinate readings used in the mounted equal-spacing cases |
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
| S37 | Retain chart proof in light mode. (Scope) | slice 3 | observed: system-settings-usage-spacing.spec.ts, both narrow layouts run keyboard, touch and fit assertions with CDP light appearance |
| S38 | Retain chart proof in dark mode. (Scope) | slice 3 | observed: system-settings-usage-spacing.spec.ts, both narrow layouts run keyboard, touch and fit assertions with CDP dark appearance |
| S39 | Retain chart proof in narrow windows. (Scope) | slice 3 | observed: system-settings-usage-spacing.spec.ts, 390×844 and 420×900 layouts fit in time and equal spacing modes |
| S40 | Retain chart proof at zoom. (Scope) | slice 1 | observed: system-settings-usage-average.spec.ts 200% zoom case mounts at 640 by 450 and doubleUsageDeviceScale observes DPR 2 before day, clipping, touch detail and focus checks |
| S41 | Use CDP touch to reach the control in a touch case. (Scope) | slice 6 | |
| S42 | Drive rotation by changing the mounted viewport. (Scope) | slice 6 | |
| S43 | Drive reduced-height cases through the mounted viewport. (Scope) | slice 6 | |
| S44 | Run the moved Usage chart cases over the existing typed `UsageSource`. (Goal, Scope) | slice 3 | observed: All five migrated Usage specs mount the actual SystemSettingsUsage with typed UsageSource replies |
| S45 | Supply their typed Token index answers through `makeMe.aTokenIndexAnswer`. (Goal, Scope) | slice 3 | observed: All five migrated Usage specs supply the chart replies through pageMakeMe.mjs aTokenIndexAnswer |
| C01 | The chart shows the 65,000,000 task as a large mark above the axis. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, 65M label, SVG mark and button aligned above top grid row |
| C02 | The chart shows the 70,000,000 task as a large mark above the axis. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, 70M partial label, SVG mark and button aligned above top grid row with separate mark geometry |
| C03 | The axis shows `0`, `25M`, and `50M`. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, visible 0/25M/50M vertical ticks |
| C04 | The note says that every priced task is above 50 million. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, visible every-priced-task-above-50-million note |
| C05 | Pointer selects the 65,000,000 task. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, pointer reaches the 65M mark and opens its detail |
| C06 | Pointer selects the 70,000,000 task. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, pointer reaches the separate 70M mark and opens its detail |
| C07 | Touch selects the 65,000,000 task. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, native CDP touch reaches the 65M mark and opens its detail |
| C08 | Touch selects the 70,000,000 task. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, native CDP touch reaches the separate 70M mark and opens its detail |
| C09 | Keyboard selects the 65,000,000 task. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, Enter on the focused 65M mark opens its detail |
| C10 | Keyboard selects the 70,000,000 task. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, Enter on the separate focused 70M mark opens its detail |
| C11 | The 65,000,000 task’s detail names its value. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, Token index reads 65,000,000 in detail for each input mode |
| C12 | The 70,000,000 task’s detail names its value. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, Token index reads 70,000,000 in detail for each input mode |
| C13 | The selected partial task’s detail names its partial coverage. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, partial detail reads Partial · Worker usage missing for each input mode |
| C14 | Close returns focus to the selected mark. (Coincident large tasks) | slice 3 | observed: system-settings-usage-overflow.spec.ts, same-day coincident overflow case, all six uses of Close return focus to precisely the mark that opened detail |
| C15 | Codex and Claude Code share one time axis. (Two tools compared) | slice 2 | observed: system-settings-usage-compare.spec.ts shared-axis case, Nov 3 coincident positions and one-day and five-day intervals |
| C16 | Codex and Claude Code share one scale. (Two tools compared) | slice 2 | observed: system-settings-usage-compare.spec.ts shared-axis case, level 4,000 marks and one-scale note |
| C17 | Codex has its own median. (Two tools compared) | slice 2 | observed: system-settings-usage-compare.spec.ts shared-axis case, the named Codex 2,000 summary and rendered median line |
| C18 | Claude Code has its own median. (Two tools compared) | slice 2 | observed: system-settings-usage-compare.spec.ts shared-axis case, the named Claude Code 3,500 summary and rendered median line |
| C19 | Codex has its own unit. (Two tools compared) | slice 2 | observed: system-settings-usage-compare.spec.ts shared-axis case, Codex tariff note scoped to Codex and included on the combined plot |
| C20 | Claude Code has its own unit. (Two tools compared) | slice 2 | observed: system-settings-usage-compare.spec.ts shared-axis case, Claude tariff note scoped to Claude Code and included on the combined plot |
| C21 | Codex has its own note. (Two tools compared) | slice 2 | observed: system-settings-usage-compare.spec.ts shared-axis case, named Codex three-task, one-partial summary and note |
| C22 | Claude Code has its own note. (Two tools compared) | slice 2 | observed: system-settings-usage-compare.spec.ts shared-axis case, named Claude Code summary with partial and unpriced counts and excluded-work note |
| C23 | A selected task retains its tool identity. (Two tools compared) | slice 2 | observed: system-settings-usage-compare.spec.ts shared-axis case, selected mark plus named Claude Code detail on a shared task ID and separate Codex value |
| C24 | An empty tool indicates that it is empty. (Two tools compared) | slice 2 | observed: system-settings-usage-compare.spec.ts empty-tool case, named Claude Code empty state while Codex keeps its three marks |
| C25 | A failed read names the tool whose read failed. (Two tools compared) | slice 2 | observed: system-settings-usage-compare.spec.ts empty-tool case, Claude Code refusal retains checked results on Refresh and clears the old cohort on selection |
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
