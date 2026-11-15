# Slice 8: intent-reading-place assertion occurrences

Original: HEAD 9007a576291cf2a864965d03fe9ca7a751cb1d18, unchanged from suffix base.
Maintained: `dashboard/frontend-tests/intent/intent-reading-place.spec.ts`. Browser requests count local authenticated-read/review requests, never GitHub calls.

Named cases:

- a file selected two folders deep, with Selected story only and Purpose scrolled, is shown the same after Development and back without reading again
- another project shows none of the reading place, and choosing the project again starts its reading afresh

Every original observing statement/helper occurrence below maps independently, in source order, with the identical expected expression. Helper internals and setup differences are in [helper observations](slice-8-helper-observations.md).

| Original line | Maintained line | Exact observing statement / helper call |
| --- | --- | --- |
| 74 | 71 | `await expect(intentDiffReading(intent).name).toHaveText(deepSpec)` |
| 75 | 72 | `await expect(intentDiffReading(intent).code).toHaveAttribute( "aria-busy", "false", )` |
| 96 | 92 | `await chooseStoryTab(intent, view)` |
| 97 | 93 | `await expect(intentReadingPane(intent)).toBeHidden()` |
| 98 | 94 | `await chooseStoryTab(intent, "Changed tests")` |
| 99 | 95 | `await expect.poll(() => intentReadingScroll(intent)).toBe(offset)` |
| 103 | 99 | `await expect(intent).toHaveCount(0)` |
| 105 | 101 | `await expectStoryTab(intent, "Changed tests")` |
| 106 | 102 | `await expectStoryComparisonRead(intent)` |
| 108 | 104 | `await expect(storyOnly(intent)).toBeChecked()` |
| 109 | 105 | `await expect(intentFile(intent, deepSpec)).toHaveAttribute( "aria-pressed", "true", )` |
| 113 | 109 | `await expect(intentDiffReading(intent).name).toHaveText(deepSpec)` |
| 114 | 110 | `await expect(intentDiffReading(intent).code).toHaveAttribute( "aria-busy", "false", )` |
| 118 | 114 | `await expect(intentGroupToggle(intent, "dashboard/tests")).toHaveAttribute( "aria-expanded", "true", )` |
| 123 | 119 | `await expect(folderToggle(intent, name, true)).toBeVisible()` |
| 124 | 120 | `await expect(folderToggle(intent, "out", false)).toBeVisible()` |
| 125 | 121 | `await expect.poll(() => intentReadingScroll(intent)).toBe(offset)` |
| 126 | 122 | `expect(reads).toEqual([])` |
| 142 | 137 | `await expect(intent).toContainText( "No intent locations are configured for Doughnut.", )` |
| 145 | 140 | `await expect(intent.getByRole("button", { name: deepSpec })).toHaveCount(0)` |
| 146 | 141 | `await expect(intent.locator('[aria-pressed="true"]')).toHaveCount(0)` |
| 152 | 147 | `await expectStoryTab(intent, "CI comparison")` |
| 153 | 148 | `await expect(ciPanel(intent)).toBeVisible()` |
| 154 | 149 | `await chooseStoryTab(intent, "Changed tests")` |
| 155 | 150 | `await expect(intentReadingPane(intent)).toContainText( "Choose a test, folder or location to read its Purpose and Proof.", )` |
| 158 | 153 | `await expect(ciPanel(intent)).toHaveCount(0)` |
| 159 | 154 | `await expect(purposeRegion(intent)).toHaveCount(0)` |
| 160 | 155 | `await expect(storyOnly(intent)).not.toBeChecked()` |
| 161 | 156 | `await expect(folderToggle(intent, "out", true)).toBeVisible()` |
| 162 | 157 | `await expect(intentFile(intent, deepSpec)).toHaveAttribute( "aria-pressed", "false", )` |
| 166 | 161 | `await expect( filesColumn(intent).locator('[aria-pressed="true"]'), ).toHaveCount(0)` |
| 169 | 164 | `expect(await intentReadingScroll(intent)).toBe(0)` |
