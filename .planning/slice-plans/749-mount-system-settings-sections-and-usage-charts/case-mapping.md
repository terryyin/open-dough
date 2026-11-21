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
