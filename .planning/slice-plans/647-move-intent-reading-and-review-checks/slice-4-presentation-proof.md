# Slice 4 presentation assertion dispositions

Original sources at e234257ded1594371583fbaa405216448e14b80d.
Each destination is the same basename under dashboard/frontend-tests/intent/.
All rows retain the original expected value and scenario ordering.
Maintained positions are implementation positions before coordinator formatting/refactoring.
Repeated expressions map by occurrence in the full named journey.
See [slice setup and proof](slice-4-proof.md) for named cases, variants, real source proof and command results.

## ci-cues

| Original line | Maintained line | Retained assertion / observing helper |
| --- | --- | --- |
| 56 | 56 | `expect( filesColumn(intent).getByRole("button", { name: "Collapse folder", exact: true, }), ).toBeVisible()` |
| 68 | 68 | `expectCueState(locationHeader, { count: "more-light", duration: "slower-strong", })` |
| 72 | 72 | `expect(locationName).toHaveAttribute( "aria-label", "dashboard/tests, typescript, **/*.spec.ts, 4 → 6 test cases (+2) → 5 test cases (+1), +6.5 s", )` |
| 77 | 77 | `expectCueState(file, { count: "none", duration: "slower-light", countReason: "unchanged", })` |
| 82 | 82 | `expect(file).toHaveAttribute( "aria-label", \`${cuedFileLabel}, ${proofCounts}, ${proofAfter}\`, )` |
| 94 | 94 | `expectCueState(proofRow, { count: "none", duration: "slower-light", countReason: "unchanged", })` |
| 99 | 99 | `expect(proofRow.getByRole("cell").nth(0)).toHaveText(proofCounts)` |
| 100 | 100 | `expect(proofRow.getByRole("cell").nth(3)).toHaveText(proofAfter)` |
| 105 | 105 | `expect(file).toHaveAttribute("aria-pressed", "true")` |
| 106 | 106 | `expectCueState(file, { count: "none", duration: "slower-light", countReason: "unchanged", })` |
| 120 | 120 | `expect(selected.background).not.toBe("rgba(0, 0, 0, 0)")` |
| 121 | 121 | `expect(selected.borderColor).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/)` |
| 147 | 147 | `expect(focusRing).toEqual({ outline: "3px solid var(--accent)", offset: "2px", })` |
| 152 | 152 | `expect(file).toBeFocused()` |
| 160 | 160 | `expect(focused.background).toBe(selected.background)` |
| 161 | 161 | `expect(focused.borderColor).toBe(selected.borderColor)` |
| 162 | 162 | `expectCueState(file, { count: "none", duration: "slower-light", countReason: "unchanged", })` |
| 170 | 170 | `expect(locationGroup(intent, "dashboard/tests")).toHaveAttribute( "data-contains-changes", "true", )` |
| 175 | 175 | `expect(unselected.mark).not.toBe("none")` |
| 176 | 176 | `expect(unselected.mark).toMatch(/rgb/)` |
| 179 | 179 | `expect(locationName).toHaveAttribute("aria-pressed", "true")` |
| 180 | 180 | `expectCueState(locationHeader, { count: "more-light", duration: "slower-strong", })` |
| 185 | 185 | `expect(selected.fullWidth).toBe(true)` |
| 186 | 186 | `expect(selected.mark).not.toBe("none")` |
| 188 | 188 | `expect(selected.mark.split(/,(?![^(]*\))/).length).toBeGreaterThanOrEqual( 2, )` |
| 199 | 199 | `expect(selectedStyle.background).not.toBe("rgba(0, 0, 0, 0)")` |
| 200 | 200 | `expect(selectedStyle.borderColor).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/)` |
| 204 | 204 | `expect(folderItem(intent, "folder")).not.toHaveAttribute( "data-ci-count-cue", )` |
| 207 | 207 | `expect(folderItem(intent, "folder")).not.toHaveAttribute( "data-ci-duration-cue", )` |
| 210 | 210 | `expect( folderRow(intent, "folder").locator("[data-ci-count-cue]"), ).toHaveCount(0)` |
| 228 | 228 | `expect(card).toBeVisible()` |
| 230 | 230 | `expectSelected(card, false)` |
| 232 | 232 | `expect(intent).toBeVisible()` |
| 233 | 233 | `expect(intent).not.toHaveAttribute("data-selected-story")` |
| 234 | 234 | `expect( filesColumn(intent).locator("[data-ci-count-cue]"), ).toHaveCount(0)` |
| 237 | 237 | `expect( filesColumn(intent).locator("[data-ci-duration-cue]"), ).toHaveCount(0)` |

## coverage

| Original line | Maintained line | Retained assertion / observing helper |
| --- | --- | --- |
| 34 | 35 | `expect( detail.getByRole("heading", { name: "Intent coverage" }), ).toBeVisible()` |
| 38 | 39 | `expect(result).toBeVisible()` |
| 39 | 40 | `expect(await result.textContent()).toBe(report)` |
| 51 | 51 | `expect( detail.getByRole("heading", { name: "Intent coverage" }), ).toBeVisible()` |
| 54 | 54 | `expect(detail.getByText("Unavailable", { exact: true })).toBeVisible()` |
| 55 | 55 | `expect(detail.getByText(unavailable, { exact: true })).toBeVisible()` |
| 68 | 69 | `expect(detail.locator("p")).toHaveText([noAssessment])` |
| 95 | 94 | `expect(detail.getByRole("status")).toHaveText("Reading done story…")` |
| 96 | 95 | `expect.poll(() => reads.held()).toBe(1)` |
| 101 | 100 | `expect(detail.getByText(unknown, { exact: true })).toBeVisible()` |
| 102 | 101 | `expect( detail.getByText("Done stories could not be read."), ).toBeVisible()` |
| 105 | 104 | `expect(detail.getByText(noAssessment)).toHaveCount(0)` |
| 106 | 105 | `expect(detail.getByText("Unavailable")).toHaveCount(0)` |
| 112 | 111 | `expect(result).toBeVisible()` |
| 113 | 112 | `expect(await result.textContent()).toBe(report)` |
| 114 | 113 | `expect(detail.getByText(unknown)).toHaveCount(0)` |

## dark-appearance

| Original line | Maintained line | Retained assertion / observing helper |
| --- | --- | --- |
| 61 | 60 | `expectDarkSurface(page)` |
| 67 | 66 | `expect(comparison).toBeVisible()` |
| 68 | 67 | `expectReadableContrast(comparison.getByRole("heading").first())` |
| 69 | 68 | `expectReadableContrast(comparison.locator("thead th").first())` |
| 70 | 69 | `expectNoAppearanceSwitch(page)` |
| 75 | 74 | `expect(filesToggle(intent)).toHaveText("Hide files")` |
| 77 | 76 | `expectReadableContrast( intentFile(intent, cuedFileLabel).locator("code"), )` |
| 82 | 81 | `expectDarkSurface(page)` |
| 84 | 83 | `expectFilesShown(intent, false)` |
| 86 | 85 | `expectFilesShown(intent, true)` |
| 100 | 99 | `expect(coverage).toBeVisible()` |
| 101 | 100 | `expectReadableContrast( coverage.getByRole("heading", { name: "Intent coverage" }), )` |
| 104 | 103 | `expectReadableContrast( coverage.locator("p, .intent-story-coverage-text").first(), )` |
| 113 | 112 | `expectCueState(file, { count: "none", duration: "slower-light", countReason: "unchanged", })` |
| 119 | 118 | `expect(file).toHaveAttribute("aria-pressed", "true")` |
| 121 | 120 | `expect(file).toBeFocused()` |
| 124 | 123 | `expect(diff).toBeVisible()` |
| 130 | 129 | `expectReadableContrast(line)` |
| 135 | 134 | `expectSourceReadable(intent, unchangedPath)` |
| 187 | 186 | `expect(history).toBeVisible()` |
| 188 | 187 | `expectReadableContrast(scopeHistoryReading(history).measure)` |
| 189 | 188 | `expectReadableContrast(chart.readout)` |
| 190 | 189 | `expectChartMarkContrast(chart.measured.first())` |
| 199 | 198 | `expect(source).toBeVisible()` |
| 204 | 203 | `expectLightSurface(page)` |
| 205 | 204 | `expect(intent).toHaveAttribute("data-selected-story", /SEED-A#a/)` |
| 206 | 205 | `expect(source).toBeVisible()` |
| 208 | 207 | `expect(await colourOf(token)).not.toBe(darkColour)` |
| 212 | 211 | `expectDarkSurface(page)` |
| 213 | 212 | `expect(intent).toHaveAttribute("data-selected-story", /SEED-A#a/)` |
| 214 | 213 | `expect(source).toBeVisible()` |
| 216 | 215 | `expect(await colourOf(token)).toBe(darkColour)` |

## summary-title

| Original line | Maintained line | Retained assertion / observing helper |
| --- | --- | --- |
| 36 | 37 | `expect(title).toHaveText(long)` |
| 37 | 38 | `expect(intent.getByText(long, { exact: true })).toHaveCount(1)` |
| 45 | 46 | `expect(box.overflows).toBe(false)` |
| 46 | 47 | `expect(box.lines).toBeGreaterThan(1)` |
| 49 | 50 | `expect(storyHeaderReading(intent).identity).toHaveText("SEED-A#a")` |
| 50 | 51 | `expect(storyHeaderReading(intent).revisions).toContainText( \`Compared ${shortRevision(baseline)} with worktree \`, )` |
| 60 | 61 | `expectStackedInOrder([title, storyTab(intent, view)])` |
| 64 | 65 | `expect( intent.getByRole("region", { name: "Intent coverage" }).locator("p"), ).toHaveText([ "If an Intent Coverage assessment is saved during feature story wrap-up, it appears here once this story is completed.", ])` |
