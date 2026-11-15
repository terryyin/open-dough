# Slice 5 modes assertion dispositions

Original source at a2692caf9c13edd785f452308381fe708002f5aa.
Each row retains an observing occurrence in original order. The same-named
Frontend case preserves its expected expression unless a real boundary is named.
Controlled payloads establish presentation input, never real source judgment.

## intent-done-review-modes.spec.ts: case 1

Named destination: `dashboard/frontend-tests/intent/intent-done-review-modes.spec.ts` —
switching the open review between live workspace and Done Intent waits for each mode's own answer.

| Original line | Observing assertion / helper, expected values retained | Maintained observation |
| --- | --- | --- |
| 52 | `expect(historicalDiff).toContain("completed historical test")` | Same named Frontend case |
| 55 | `expect((await readReview(page, card)).kind).toBe("snapshot")` | Backend `review/story-review-historical-choice`: real ordinary snapshot vs historical published; E2E `intent-done-retained-workspace`: original/live diff selection |
| 56 | `expect(await reviewDiff(page, modified)).toContain( "retained live local test", )` | Same named Frontend case |
| 68 | `expect(await (await heldHistorical.ready).json()).toMatchObject({ kind: "published", completion, })` | Backend `review/story-review-historical-choice`: real ordinary snapshot vs historical published; E2E `intent-done-retained-workspace`: original/live diff selection |
| 72 | `expect(review.getByRole("status")).toHaveText( "Reading the story's changes…", )` | Same named Frontend case |
| 75 | `expect(fileBrowser(review)).toHaveCount(0)` | Same named Frontend case |
| 76 | `expect(review).not.toContainText("retained live local test")` | Same named Frontend case |
| 79 | `expect(await reviewDiff(page, modified)).toBe(historicalDiff)` | Same named Frontend case |
| 89 | `expect(ordinary).toBeInViewport()` | Same named Frontend case |
| 97 | `expect(await (await heldLive.ready).json()).toMatchObject({ kind: "snapshot", })` | Backend `review/story-review-historical-choice`: real ordinary snapshot vs historical published; E2E `intent-done-retained-workspace`: original/live diff selection |
| 100 | `expect(review.getByRole("status")).toHaveText( "Reading the story's changes…", )` | Same named Frontend case |
| 103 | `expect(fileBrowser(review)).toHaveCount(0)` | Same named Frontend case |
| 104 | `expect(review).not.toContainText("completed historical test")` | Same named Frontend case |
| 107 | `expect(await reviewDiff(page, modified)).toContain( "retained live local test", )` | Same named Frontend case |
| 115 | `expect(ordinary).toBeFocused()` | Same named Frontend case |

## intent-done-landed-review-mode.spec.ts: case 1

Named destination: `dashboard/frontend-tests/intent/intent-done-landed-review-mode.spec.ts` —
ordinary Done Review resets Intent's captured run while the same panel stays open and waits for its live workspace.

| Original line | Observing assertion / helper, expected values retained | Maintained observation |
| --- | --- | --- |
| 97 | `expect(storyReviewSchema.parse(await (await received).json())).toMatchObject({ kind: "landed", baseline: story.trunkTip, tree: accepted, selectedRun: story.reporting.reference, })` | E2E `intent-done-retained-landing` capture variant: real captured baseline/tree/run; Backend `review/story-review-historical-choice`: ordinary snapshot and absent selectedRun |
| 106 | `expect(landedRunChoice(review)).toHaveValue(story.reporting.reference)` | Same named Frontend case |
| 122 | `expect(answer.kind).toBe("snapshot")` | E2E `intent-done-retained-landing` capture variant: real captured baseline/tree/run; Backend `review/story-review-historical-choice`: ordinary snapshot and absent selectedRun |
| 123 | `expect(answer.selectedRun).toBeUndefined()` | E2E `intent-done-retained-landing` capture variant: real captured baseline/tree/run; Backend `review/story-review-historical-choice`: ordinary snapshot and absent selectedRun |
| 124 | `expect(reviewFeedback(review)).toHaveText( "Reading the story's changes…", )` | Same named Frontend case |
| 127 | `expect(landedRunChoice(review)).toHaveCount(0)` | Same named Frontend case |
| 128 | `expect( review.getByRole("heading", { name: "Landed run", exact: true }), ).toHaveCount(0)` | Same named Frontend case |
| 131 | `expect(fileBrowser(review)).toHaveCount(0)` | Same named Frontend case |
| 135 | `expect(live).toContain("+local edit after captured landing")` | Same named Frontend case |
| 136 | `expect( comparisonChoice(review, "All changes", { exact: true }), ).toBeChecked()` | Same named Frontend case |
| 139 | `expect(landedRunChoice(review)).toHaveCount(0)` | Same named Frontend case |
| 145 | `expect(ordinary).toBeFocused()` | Same named Frontend case |

## intent-done-source-selection.spec.ts: case 1

Named destination: `dashboard/frontend-tests/intent/intent-done-source-selection.spec.ts` —
a newly selected Done story shows only its own historical source after held comparison and locations reads.

| Original line | Observing assertion / helper, expected values retained | Maintained observation |
| --- | --- | --- |
| 117 | `expect(purposeRegion(intent)).toContainText("a 11")` | Same named Frontend case |
| 118 | `expect( sourceRevision(intent, "dashboard/tests/a.spec.ts"), ).toContainText(first.completion.slice(0, 7))` | Same named Frontend case |
| 149 | `expect(intent).toHaveAttribute("data-selected-story", storyB.identity)` | Same named Frontend case |
| 150 | `expect(storyTitle(intent)).toHaveText(storyB.title)` | Same named Frontend case |
| 151 | `expect.poll(() => comparisonHeld).toBeGreaterThan(0)` | Same named Frontend case |
| 153 | `expect(filesColumn(intent)).toHaveCount(0)` | Same named Frontend case |
| 154 | `expect( intent.getByRole("tabpanel", { name: "Changed tests" }), ).toContainText("Reading the story's historical Intent locations…")` | Same named Frontend case |
| 157 | `expect(purposeRegion(intent)).toHaveCount(0)` | Same named Frontend case |
| 160 | `expect.poll(() => locations.held()).toBeGreaterThan(0)` | Same named Frontend case |
| 161 | `expect(filesColumn(intent)).toHaveCount(0)` | Same named Frontend case |
| 162 | `expect(purposeRegion(intent)).toHaveCount(0)` | Same named Frontend case |
| 165 | `expect(intentFile(intent, "dashboard/tests/a.spec.ts")).toHaveCount(0)` | Same named Frontend case |
| 167 | `expect(purposeRegion(intent)).toContainText( "Story B historical source", )` | Same named Frontend case |
| 170 | `expect(purposeRegion(intent)).not.toContainText("a 11")` | Same named Frontend case |

Recorded 41 observing occurrences. Scenario setup and helper-derived
observations (diff text/scroll, revision labels, holds and focus) remain in the
named cases; real setup and command results are in [slice-5-proof](slice-5-proof.md).
