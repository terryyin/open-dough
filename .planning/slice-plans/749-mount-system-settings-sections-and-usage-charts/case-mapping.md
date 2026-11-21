# Replacement proof for the built-app Settings cases

## Slice 1

The same titles run on mounted Chromium in the two Configuration specs.

| Built-app title | Mounted assertion location |
| --- | --- |
| the rolling median is distinct above dots and never enlarges ordinary geometry | usage-average, first case: ordinary separation before and after large task and median, overflow arrow placement, layering, width and contrast in light and dark |
| the chart shows a one-million median and the sixty-five-million task separately | usage-average, second case: latest median, 0/500K/1M axis, overflow label, crossed mark, problem stroke, position above grid and button over mark |
| an in-scale median breaks across above-scale observations and all-large medians stay explicit | usage-average, third case: disjoint in-scale paths, 0/25M/50M axis, latest and above-scale medians |
| narrow touch › day control, task actions and true overflow values remain readable without hovering | usage-average, narrow touch: same 420×900 viewport, days control, above-scale median words, window and text fit, CDP touch detail value and close focus |
| 200% zoom › day control, task actions and true overflow values remain readable without hovering | usage-average, 200% zoom: same proof at 640×450 and device scale 2 |
| the key and summary swatches show each shown tool's marks, and a hidden tool leaves the key | usage-legend, first case: ordered names, shape and computed paint against drawing for each tool, tool summary swatches and hiding a tool |
| phone › the compared key fits without sideways scroll in light and dark | usage-legend, phone: 390×844, shown key names and marks, document fit and whole rendered text in each scheme |
| narrowest reading window › the compared key fits without sideways scroll in light and dark | usage-legend, narrowest reading window: same proof at 420×900 in each scheme |

## Slice 2

The five titles run in mounted Chromium at `system-settings-usage-compare.spec.ts`. Configuration passed with 29 mounted cases. The final comparison and tool selection and dashboard typecheck passed. Making the measured Claude Code mark a circle failed the expected shape assertion before the production file was restored. See `slice2-configuration`, `slice2-compare-final`, `slice2-typecheck-final` and `slice2-shape-scratch`.

| Built-app title | Mounted assertion location and retained setups |
| --- | --- |
| both tools share one time axis and scale with their own medians, units and notes, keeping each task's tool through inspection | Five marks with shared Nov 3 centering, one and five day intervals, common 4,000 y position. Distinct 2,000 / 3,500 medians and widths, per-tool count notes and tariff labels and comparison note. Claude keyboard detail keeps named tool, model, value, date and coverage despite shared task IDs. Codex pointer detail value, selecting partial Claude then hiding Claude closes detail and leaves the original Codex marks and summary. |
| each tool's marks differ by shape, partial ones keep the caution stroke, and either tool's selected task is the one larger diamond | Both typed source replies; chart comparison owner checks measured and partial shapes for both tools, computed fills, caution stroke, distinct median strokes and dash, mark contrast. Separate pointer selections of Claude and Codex each yield one labeled diamond. |
| an empty tool says so, a failed read names its tool, and neither tool asks for one | Typed source returns Claude's empty reply then rejects its read after Refresh. Named empty panel, count, and three Codex points. The refused same selection keeps its preceding points and checked time and re-enables Refresh; switching cohort removes old points and retains a named refusal. Unchecking both shows the prompt and removes the chart. |
| phone › tool choices work by keyboard and a compared point opens by touch, in light and dark, without sideways scroll | Mounted 390×844 viewport, light and dark CDP media, native keyboard tool toggle, visible focus and both summaries, trace shapes and paint, document/text fit, native CDP touch selected value, Close returns focus, keyboard hide clears the detail. |
| narrowest reading window › tool choices work by keyboard and a compared point opens by touch, in light and dark, without sideways scroll | Same reads and assertions at 420×900. |

## Slice 3

All seven titles retain their mounted viewport conditions. The eleven affected Usage specs passed 33 cases, and dashboard typecheck passed. Drawing the coincident overflow marks at the same y position failed the separation assertion. The production file was restored before the final run. See `slice3-usage-consumers`, `slice3-typecheck-final` and `slice3-coincident-scratch`.

| Built-app title | Mounted assertion location and retained input |
| --- | --- |
| large tasks keep actual values and dates without flattening ordinary points | `system-settings-usage-overflow.spec.ts`: arrange 1M and 2M, then add 65M with the second task's Nov 2 date on period change. Preserve greater-than-40 and unchanged ordinary separation checks, crossed mark and label, same date position, above-scale note, and 65M detail after pointer selection. |
| coincident large tasks remain separate by pointer touch and keyboard with partial details and focus return | Same spec: arrange Nov 1 tasks of 65M and 70M with missing worker evidence only on 70M. Check distinct positions at a common x and at least 40px apart, both marks visibly above the ordinary top row, axis 0/25M/50M, and the all-large note. Select both marks independently by pointer, real CDP touch, and keyboard, then check each value and exact coverage, close and restore focus to the mark. |
| exactly fifty million remains ordinary and measured zero keeps an honest scale | Same spec: arrange 0, 50M and 50M+1, check exactly two ordinary marks and the above-scale label and readout for 50M+1. Change to two zero tasks and require two ordinary marks and rendered 0/0.5/1 ticks. |
| equal spacing gives each shown task one slot in completion order across tools, keeps medians on their tasks and actual times, and restores time positions | `system-settings-usage-spacing.spec.ts`: compare six measured tasks including a cross-tool tie, partial and 60M tasks, and one unpriced task with no mark. Keep dates and time positions before switching, keyboard operation, selection/date/focus, equal ordered gaps at unchanged relative heights, per-tool plotted median centres and summary values, slot rebuild after tool change and persistence through Refresh and period edits. Return to dates with selected partial detail's value and actual time, focus return, and original x positions. |
| an above-scale median stands at its own large task's slot under equal spacing | Same spec: swap Claude Code's median to 70M at the 60M task's date and time, check the above-scale median label and dated readout, centre above its task's slot, and reading-window fit. |
| phone › equal spacing works by keyboard and its points open by touch, in light and dark, without sideways scroll | Same spec: mounted 390×844 viewport under each CDP appearance. Keyboard Space enables and disables spacing with visible focus, task-order axis and layout fit. CDP touch opens the same Claude Code task, then Close returns focus. |
| narrowest reading window › equal spacing works by keyboard and its points open by touch, in light and dark, without sideways scroll | Same spec and observations at 420×900. |

## Slice 5

The four original titles run on the mounted OpenAI section. The restored Usage and OpenAI selection passed 40 cases, and Stories, Sessions sidebar and Review page consumers passed 106 mounted cases. Dashboard typecheck passed. Removing the stale-read guard failed all three targeted tests before the file was restored. See `slice5-held-status-break` and the final run records in the checkout evidence.

| Original case title | Mounted owner and retained observation |
| --- | --- |
| a held status response cannot overwrite successful save | OpenAISettings with its typed source holds the initial not-configured status. A successful save clears and focuses the password field, passes the exact draft and leaves the configured status and clean feedback after the older response settles. The supplied key is never echoed in text. |
| a held status response cannot overwrite successful remove | OpenAISettings saves the initial draft, requests status again through the validation error's Retry status, removes the key while the old configured reply is pending, and remains unconfigured once it settles. The draft clears, focus returns, and only the explicit save and remove are called. |
| a held status response cannot overwrite successful save after read error | OpenAISettings shows a refused initial read. A second refusal is held from Retry status until after Save completes. It cannot restore the alert or change the configured status, and the exact draft is passed, cleared and absent from visible text. |
| phone OpenAI settings recovery › touch keeps the password draft and the configured key through reduced height, rotation, a refused save and explicit recovery | Native CDP touch operates the mounted password field, Save, Retry status and Remove. Field-end alignment leaves Save physically reachable. The actual reduced-height caret produces the expected draft, and rotation preserves it without saving. Refused save retains draft and configured status; Retry status leaves the draft intact; Save clears it and Remove leaves not configured. The request sequence preserves both uses of the exact draft. |

## Slice 6

The five original titles run on mounted Terminal theme and Projects. The focused cases, both retained frame specs, 198 mounted consumer cases and typecheck passed. The temporary empty draft failed the second Add payload assertion. See `slice6-settings-restored`, `slice6-settings-frame`, `slice6-page-makeme-consumers`, `slice6-typecheck` and `slice6-empty-retry-scratch`.

| Original case title | Mounted owner and retained observation |
| --- | --- |
| terminal Light and Solarized samples keep their palette while settings chrome follows the system appearance | `system-settings-terminal-theme.spec.ts` mounts TerminalThemeSettings over the saved-theme provider. Each selected theme retains its visible checked option, sample caption, and computed background, foreground and red in dark and light OS schemes. The page style-root follows the appearance and the terminal heading keeps readable contrast. `dashboard-system-appearance.spec.ts` still checks contrast of the actual outer Settings heading in the full frame. |
| phone terminal theme recovery › touch reads the theme, keeps the saved theme shown after a refused save, and reaches Retry after rotation | Same spec reads the explanatory text and Default palette. CDP touch reaches the actual select at reduced height, holds a Solarized Dark write through the visible Saving state, and releases the refused reply. The exact refusal and previous Light choice and palette persist across rotation. A real landscape Retry clears the alert and shows the accepted theme. The reverse refusal keeps the old refused Light scenario, then Retry at reduced height saves the same requested theme. The final portrait sample stays readable, with an enabled selector and exactly the expected source saves. |
| phone project settings editing › touch edits at reduced height and retries a refused save with the exact draft | `system-settings-project-management-touch.spec.ts` opens the mounted Projects dialog with native CDP touch, checks initial URL focus, edits URL and path at 390×320, and checks both values after rotation and page, modal and reading-body fit. Refusal leaves the draft and project selection alone, and the alert stays readable. The second Add sends exactly the first draft. The successful row's checkout and Client facts are readable, and a touch Remove confirms the project disappears. |
| origin mismatch stays linked to the path, retains both inputs and saves nothing | `project-add-dialog.spec.ts` exercises the exact path-linked refusal, visible dialog, retained URL and path, Local path's invalid state and described-by alert, the URL's valid state and re-enabled Add. It observes one exact refused request, no selection change, no other writes and no attempted project in the saved list after dismissal. The real refused write is covered by the pre-existing `project-add-validation.spec.ts`. |
| Cancel and Escape save nothing, return focus and keep project arrows inside the modal | Same spec reaches Cancel and Escape separately after entering both fields and focusing Cancel. Both real arrows leave selection alone while the modal is open. Dismissal restores focus to Add and issues no write. Outside the dialog the real right arrow selects the alternate project through the same production keyboard binding. |
