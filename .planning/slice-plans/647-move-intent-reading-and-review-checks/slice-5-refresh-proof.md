# Slice 5 refresh assertion dispositions

Original source at a2692caf9c13edd785f452308381fe708002f5aa.
Each row retains an observing occurrence in original order. The same-named
Frontend case preserves its expected expression unless a real boundary is named.
Controlled payloads establish presentation input, never real source judgment.

## intent-done-project-refresh-reading.spec.ts: case 1

Named destination: `dashboard/frontend-tests/intent/intent-done-project-refresh-reading.spec.ts` —
project refresh returns the same Done historical Purpose file and reading place after cycling all Done tabs.

| Original line | Observing assertion / helper, expected values retained | Maintained observation |
| --- | --- | --- |
| 65 | `expect(locations).toEqual([completion])` | Same named Frontend case |
| 67 | `expect(filesColumn(intent)).toBeVisible()` | Same named Frontend case |
| 68 | `expect(locations).toEqual([completion])` | Same named Frontend case |
| 70 | `expect(filesColumn(intent)).toBeVisible()` | Same named Frontend case |
| 71 | `expect(locations).toEqual([completion, published])` | Same named Frontend case |
| 72 | `expect(browserRevision(intent)).toContainText(published.slice(0, 7))` | Same named Frontend case |
| 79 | `expect(intentDiffReading(intent).code).toHaveAttribute( "aria-busy", "false", )` | Same named Frontend case |
| 87 | `expect(endpoints).toContain(completion.slice(0, 7))` | Same named Frontend case |
| 104 | `expect(revisionNotice(intent)).toBeVisible()` | Same named Frontend case |
| 105 | `expect(browserRevision(intent)).toContainText(published.slice(0, 7))` | Same named Frontend case |
| 107 | `expect(revisionNotice(intent)).toHaveCount(0)` | Same named Frontend case |
| 108 | `expect(browserRevision(intent)).toContainText( laterRevision.slice(0, 7), )` | Same named Frontend case |
| 111 | `expect(locations).toEqual([completion, published, laterRevision])` | Same named Frontend case |
| 114 | `expect(projectIntentLink(intent)).toBeFocused()` | Same named Frontend case |
| 115 | `expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a")` | Same named Frontend case |
| 116 | `expect(intentFile(intent, selected)).toHaveAttribute( "aria-pressed", "true", )` | Same named Frontend case |
| 120 | `expect(fileReadingTab(intent, "Purpose")).toHaveAttribute( "aria-selected", "true", )` | Same named Frontend case |
| 124 | `expect.poll(() => intentReadingScroll(intent)).toBe(offset)` | Same named Frontend case |
| 125 | `expect(await readIntentDiff(intent)).toBe(originalDiff)` | Same named Frontend case |
| 126 | `expect(revisions).toHaveText(endpoints)` | Same named Frontend case |

## intent-done-project-refresh-proof.spec.ts: case 1

Named destination: `dashboard/frontend-tests/intent/intent-done-project-refresh-proof.spec.ts` —
project refresh restores Done historical Purpose before Proof survives a later Project Intent visit.

| Original line | Observing assertion / helper, expected values retained | Maintained observation |
| --- | --- | --- |
| 63 | `expect(locations).toEqual([completion])` | Same named Frontend case |
| 65 | `expect(filesColumn(intent)).toBeVisible()` | Same named Frontend case |
| 66 | `expect(locations).toEqual([completion])` | Same named Frontend case |
| 68 | `expect(filesColumn(intent)).toBeVisible()` | Same named Frontend case |
| 69 | `expect(locations).toEqual([completion, published])` | Same named Frontend case |
| 70 | `expect(browserRevision(intent)).toContainText(published.slice(0, 7))` | Same named Frontend case |
| 77 | `expect(intentDiffReading(intent).code).toHaveAttribute( "aria-busy", "false", )` | Same named Frontend case |
| 83 | `expect(endpoints).toContain(completion.slice(0, 7))` | Same named Frontend case |
| 94 | `expect(revisionNotice(intent)).toBeVisible()` | Same named Frontend case |
| 95 | `expect(browserRevision(intent)).toContainText(published.slice(0, 7))` | Same named Frontend case |
| 97 | `expect(revisionNotice(intent)).toHaveCount(0)` | Same named Frontend case |
| 98 | `expect(browserRevision(intent)).toContainText( laterRevision.slice(0, 7), )` | Same named Frontend case |
| 101 | `expect(locations).toEqual([completion, published, laterRevision])` | Same named Frontend case |
| 104 | `expect(projectIntentLink(intent)).toBeFocused()` | Same named Frontend case |
| 105 | `expect(intent).toHaveAttribute("data-selected-story", "SEED-A#a")` | Same named Frontend case |
| 106 | `expect(intentFile(intent, selected)).toHaveAttribute( "aria-pressed", "true", )` | Same named Frontend case |
| 110 | `expect(fileReadingTab(intent, "Purpose")).toHaveAttribute( "aria-selected", "true", )` | Same named Frontend case |
| 114 | `expect(intentDiffReading(intent).code).toHaveAttribute( "aria-busy", "false", )` | Same named Frontend case |
| 118 | `expect(revisions).toHaveText(endpoints)` | Same named Frontend case |
| 120 | `expect(proofRegion(intent)).toBeVisible()` | Same named Frontend case |
| 122 | `expect(browserRevision(intent)).toContainText( laterRevision.slice(0, 7), )` | Same named Frontend case |
| 126 | `expect(intentFile(intent, selected)).toHaveAttribute( "aria-pressed", "true", )` | Same named Frontend case |
| 130 | `expect(fileReadingTab(intent, "Proof")).toHaveAttribute( "aria-selected", "true", )` | Same named Frontend case |
| 134 | `expect(proofRegion(intent)).toBeVisible()` | Same named Frontend case |
| 136 | `expect(intent.locator(".intent-story-coverage-text")).toHaveText( report, )` | Same named Frontend case |

Recorded 45 observing occurrences. Scenario setup and helper-derived
observations (diff text/scroll, revision labels, holds and focus) remain in the
named cases; real setup and command results are in [slice-5-proof](slice-5-proof.md).
