# Slice 4 reading assertion dispositions

Original sources at e234257ded1594371583fbaa405216448e14b80d.
Each destination is the same basename under dashboard/frontend-tests/intent/.
All rows retain the original expected value and scenario ordering.
Maintained positions are implementation positions before coordinator formatting/refactoring.
Repeated expressions map by occurrence in the full named journey.
See [slice setup and proof](slice-4-proof.md) for named cases, variants, real source proof and command results.

## review-return

| Original line | Maintained line | Retained assertion / observing helper |
| --- | --- | --- |
| 42 | 46 | `expectReviewRead(review)` |
| 43 | 47 | `expect(fileBrowser(review)).toBeVisible()` |
| 45 | 49 | `expect(review).toHaveCount(0)` |
| 51 | 55 | `expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a")` |
| 52 | 56 | `expect(storyTitle(intent)).toHaveText("Story A")` |
| 53 | 57 | `expectStoryTab(intent, "Changed tests")` |
| 54 | 58 | `expect(intentFile(intent, deepSpec)).toHaveAttribute( "aria-pressed", "true", )` |
| 58 | 62 | `expect(outsideCount(intent)).toBeFocused()` |
| 72 | 80 | `expectOutsideCount(intent, 2)` |
| 75 | 83 | `expect(intentDiffReading(intent).code).toHaveAttribute( "aria-busy", "false", )` |
| 81 | 89 | `expectStoryReadingKept(intent)` |
| 82 | 90 | `expect.poll(() => intentReadingScroll(intent)).toBe(offset)` |
| 90 | 98 | `expect(storyCi).toBeVisible()` |
| 92 | 100 | `expectStoryReadingKept(intent)` |
| 93 | 101 | `expect(fileReadingTab(intent, "Proof")).toHaveAttribute( "aria-selected", "true", )` |
| 97 | 105 | `expect(storyCi).toBeVisible()` |

## views-narrow

| Original line | Maintained line | Retained assertion / observing helper |
| --- | --- | --- |
| 46 | 50 | `expect(control).toBeVisible()` |
| 48 | 52 | `expect(at.x).toBeGreaterThanOrEqual(0)` |
| 49 | 53 | `expect(at.x + at.width).toBeLessThanOrEqual(width)` |
| 51 | 55 | `expect( await page.evaluate( () => document.documentElement.scrollWidth <= window.innerWidth, ), ).toBe(true)` |
| 59 | 63 | `expect(filesToggle(intent)).toBeFocused()` |
| 61 | 65 | `expectFilesShown(intent, false)` |
| 63 | 67 | `expectFilesShown(intent, true)` |
| 66 | 70 | `expectStoryTab(intent, "CI comparison")` |
| 67 | 71 | `expect(storyTab(intent, "CI comparison")).toBeFocused()` |
| 69 | 73 | `expectStoryTab(intent, "Intent coverage")` |
| 70 | 74 | `expect(filesToggle(intent)).toHaveCount(0)` |
| 88 | 94 | `expect( intent.getByRole("heading", { name: "No story selected", exact: true }), ).toBeVisible()` |
| 91 | 97 | `expect(intentPageFrame(intent)).toHaveAttribute( "data-intent-context", "project", )` |
| 95 | 101 | `expect(storyViews(intent)).toHaveCount(0)` |
| 105 | 111 | `expect(control).toBeVisible()` |
| 107 | 113 | `expect(at.x).toBeGreaterThanOrEqual(0)` |
| 108 | 114 | `expect(at.x + at.width).toBeLessThanOrEqual(width)` |
| 110 | 116 | `expect( await page.evaluate( () => document.documentElement.scrollWidth <= window.innerWidth, ), ).toBe(true)` |
| 117 | 123 | `expect(filesToggle(intent)).toBeFocused()` |
| 119 | 125 | `expectFilesShown(intent, false)` |
| 120 | 126 | `expect(ciPanel(intent)).toBeVisible()` |
| 122 | 128 | `expect(reading.height).toBeGreaterThan(viewport.height <= 256 ? 30 : 100)` |
| 124 | 130 | `expectFilesShown(intent, true)` |
| 126 | 132 | `expect( intentModeTab(intent, "Optimization Candidates"), ).toBeFocused()` |
| 129 | 135 | `expect(filesToggle(intent)).toHaveCount(0)` |
| 131 | 137 | `expect(intentModeTab(intent, "CI status")).toBeFocused()` |
| 132 | 138 | `expect(ciPanel(intent)).toBeVisible()` |
