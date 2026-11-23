# Plan 763 case disposition

Paths in the table are relative to `dashboard/frontend-tests/`.
The 41 cases from the original Playwright inventory comprise 39
migrations and two shortcut retirements. The later outside-locations
line-note case accounts for the 40th migration. The six existing Notes
control checks share five mounted cases after combining Enter and Close
in one observed journey.

| Source path | Case | Origin | Disposition |
| --- | --- | --- | --- |
| `intent/intent-done-landed-review-mode.spec.ts` | ordinary Done Review resets Intent's captured run while the same panel stays open and waits for its live workspace | Original Playwright cohort | Retired with the Intent shortcut in `ffb4ef63d` |
| `intent/intent-done-project-refresh.spec.ts` | project refresh returns the same Done historical Purpose file and reading place after cycling all Done tabs, then Proof survives a later Project Intent visit | Playwright | Vitest, same path and title |
| `intent/intent-done-review-modes.spec.ts` | switching the open review between live workspace and Done Intent waits for each mode's own answer | Original Playwright cohort | Retired with the Intent shortcut in `ffb4ef63d` |
| `intent/intent-done-source-selection.spec.ts` | a newly selected Done story shows only its own historical source after held comparison and locations reads | Playwright | Vitest, same path and title |
| `intent/intent-read-reuse-story.spec.ts` | with a selected story, browsing reads nothing and a changed file's diff is read once, without its published text | Playwright | Vitest, same path and title |
| `intent/intent-sidebar-toggle.spec.ts` | Hide files gives the reading pane the width under the story's header; after the other views, Show files returns the column, test and Proof as they were | Playwright | Vitest, same path and title |
| `intent/intent-sidebar-toggle.spec.ts` | changed locations keep their own full-width header and change mark when selected | New mounted observation | Vitest, equivalent location-header appearance moved from the retained E2E |
| `intent/intent-sidebar-toggle.spec.ts` | narrow, the hidden column gives the reading pane the height under the strip | Playwright | Vitest, same path and title |
| `intent/intent-sidebar-toggle.spec.ts` | the hidden column stays hidden through a Project Intent visit, which keeps its own choice, and Development, and a project change shows it | Playwright | Vitest, same path and title |
| `intent/intent-sidebar-toggle.spec.ts` | with no story, the toggle is reached by Tab after the tabs, works with Enter and Space, and CI status takes the width | Playwright | Vitest, same path and title |
| `intent/intent-story-changes-gaps.spec.ts` | a failed comparison read explains itself with a retry that then shows the story's changes | Playwright | Vitest, same path and title |
| `intent/intent-story-changes-gaps.spec.ts` | an active story with no workspace explains that no comparison is available and leaves the tree usable | Playwright | Vitest, same path and title |
| `intent/intent-story-changes-gaps.spec.ts` | without configured Intent locations the header names the selected story, CI comparison shows its CI status, Changes the explanation, and Project Intent main's CI status beside it | Playwright | Vitest, same path and title |
| `intent/intent-story-changes-only.spec.ts` | Selected story only shows just the story's changed files, expanded, and off again the whole tree with its changed folders open | Playwright | Vitest, same path and title |
| `intent/intent-story-changes-only.spec.ts` | Selected story only stays on through a new trunk revision and refreshing Project Intent | Playwright | Vitest, same path and title |
| `intent/intent-story-changes-only.spec.ts` | a story that changed only product code says Selected story only has no test files in Intent locations, with its code outside | Playwright | Vitest, same path, a product-only or empty comparison explains why no tests changed and keeps published source readable |
| `intent/intent-story-ci-cues.spec.ts` | tree file rows and location headers show shared CI cues with distinct selection and focus | Playwright | Vitest, same path and title |
| `intent/intent-story-coverage.spec.ts` | Intent coverage waits for the done record, and a failed read offers Retry without saying no assessment was saved | Playwright | Vitest, same path, Intent coverage waits for the done record, then distinguishes a failed read from absence and recovers on Retry |
| `intent/intent-story-coverage.spec.ts` | Intent says an older completion read without an assessment saved none | Playwright | Vitest, same path and title |
| `intent/intent-story-coverage.spec.ts` | Intent shows Unavailable and the reason when completion has no assessment report | Playwright | Vitest, same path and title |
| `intent/intent-story-coverage.spec.ts` | Intent shows an Insufficient evidence report with its reason and unavailable cost | Playwright | Vitest, same path and title |
| `intent/intent-story-dark-appearance.spec.ts` | a Done story's Intent evidence stays readable under the system dark appearance | Playwright | Vitest, same path and title |
| `intent/intent-story-notes.spec.ts` | Notes from Intent keeps the selected file's reading and returns focus | Playwright | Vitest, same path and title |
| `intent/intent-story-notes.spec.ts` | a line note can start from the diff of a file outside Intent locations | Playwright (added by `88d7b0553`) | Vitest, same path and title |
| `intent/intent-story-notes.spec.ts` | a line note from Intent Changes records the Intent view | Playwright | Vitest, same path and title |
| `intent/intent-story-notes.spec.ts` | a note saved from Intent → Changed tests still reads its view | Playwright | Vitest, same path and title |
| `intent/intent-story-notes.spec.ts` | the unreadable Notes warning leaves the Notes icon beside a long Intent story title | Playwright | Vitest, same path and title |
| `intent/intent-story-summary-title.spec.ts` | a long story title shows once in full above the story's views, whichever is chosen | Playwright | Vitest, same path and title |
| `intent/intent-story-views-narrow.spec.ts` | narrow, a selected story's views and Hide files stay reachable by keyboard without widening the page | Playwright | Vitest, same path and title |
| `intent/intent-story-views-narrow.spec.ts` | without a story the shared header, project views and reader fit narrow and short reading with keyboard controls | Playwright | Vitest, same path and title |
| `navigation/story-reference-done-cancellation.spec.ts` | Tab away from a pending reference's Dismiss action supersedes its jump before held Done detail arrives | Playwright | Vitest, same path and title |
| `navigation/story-reference-done-cancellation.spec.ts` | a developer's later move or latest-ten choice supersedes a pending Done reference | Playwright | Vitest, same path and title |
| `navigation/story-reference-done-cancellation.spec.ts` | pointer down stops a pending Done jump while its data arrives and the pointer's chosen action still clicks | Playwright | Vitest, same path and title |
| `navigation/story-reference-done-recovery.spec.ts` | Done catalog loading and failure stay distinct from absence and story retry reaches the recovered catalog | Playwright | Vitest, same path and title |
| `navigation/story-reference-done-recovery.spec.ts` | a later inspection supersedes a failed Done reference when its catalog subsequently heals | Playwright | Vitest, same path and title |
| `navigation/story-reference-done-recovery.spec.ts` | a later inspection supersedes a unavailable Done reference when its catalog subsequently heals | Playwright | Vitest, same path, a later inspection supersedes an unavailable Done reference when its catalog subsequently heals |
| `navigation/story-reference-done-recovery.spec.ts` | expired and unlisted references remain unavailable without fabricated blocks or history reads | Playwright | Vitest, same path and title |
| `navigation/story-reference-done.spec.ts` | a Done reference without sessions reveals exactly through its existing destination and keeps a longer range | Playwright | Vitest, `navigation/story-reference-done-reveal.spec.ts` |
| `navigation/story-reference-done.spec.ts` | a delayed Done detail keeps the destination pending and keyboard activation reaches it at a narrow reduced-motion viewport | Playwright | Vitest, `navigation/story-reference-done-reveal.spec.ts` |
| `navigation/story-reference-done.spec.ts` | a dependency disclosure replaced after unavailable facts waits for opening before reading its new supplier title | Playwright | Vitest, same path and title |
| `navigation/story-reference-done.spec.ts` | a failed Done detail reveals its identified gap and the existing Done retry recovers without reading older stories | Playwright | Vitest, same path and title |
| `stories/plan-execution-complete-detail.spec.ts` | the story detail shows a plan's recorded execution completion and product advice, its gap, or no completion | Playwright | Vitest, same path, the story detail shows recorded advice as text, a completion gap, or no completion without reading the plan again |
| `stories/story-notes-control.spec.ts` | an older read answering after a save keeps the save's notes | Vitest | Vitest, same path and title |
| `stories/story-notes-control.spec.ts` | an unreadable answer replaces the count with the problem | Vitest | Vitest, same path and title |
| `stories/story-notes-control.spec.ts` | closing Story notes returns focus to the control | Vitest | Vitest, same path, Enter opens Story notes and Close returns focus to its control |
| `stories/story-notes-control.spec.ts` | the control counts the story's notes and describes the waiting ones | Vitest | Vitest, same path and title |
| `stories/story-notes-control.spec.ts` | the keyboard opens Story notes from the control | Vitest | Vitest, same path, Enter opens Story notes and Close returns focus to its control |
| `stories/story-notes-control.spec.ts` | the next check updates the count and the open list | Vitest | Vitest, same path and title |
| `stories/taken-slice-progress.spec.ts` | each Taken card shows its recorded slice progress as a bar and count, or the plan's gap | Playwright | Vitest, same path, each Taken card shows recorded slice progress or its plan's gap as the plan changes |

The built-page journey in `e2e/navigation/story-reference-catalog-retry.spec.ts`
adds proof of the prevailing catalog revision through Retry and focus.
The eight original E2E cases remain in the paired selection. The separate
Story Notes terminal and Done-card E2E checks exercise their existing
built-page wiring.
