# Source review: Review a selected story in Intent tabs

**Launch:** a fresh general-purpose reviewer (no conversation inheritance, fork
or resume) on 2026-11-08, during execution of SEED-275#story-intent-tabs,
before the first implementation delegation.

**Input:** only the story's Goal, Design reference, Scope, Key examples,
Architecture and Visual acceptance text from
[the seed](../../seeds/SEED-275-story-intent-tabs.md#story-intent-tabs) at
`5a1f5834c`, with instructions to read no other file and change nothing.

**Returned exclusions (no commitment):** report generation and formatting are
deferred; the mockup's sample story, build figures and report excerpt are
illustrations only; the mockup's value range does not limit the scale (see 22).

**Returned journeys (illustrations, not rejection rules):** E1 to E4 follow the
story's four key examples and are covered by the rows marked "(from the
example)" and their sibling rows.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | A developer reviewing a selected story sees the available CI evidence first. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-locations.spec.ts held locations read: CI comparison tab chosen, Baseline compared with Landed while locations held |
| G2 | The developer can inspect the changed tests without losing their place. | slice 1 | observed: dashboard/tests/intent/intent-sidebar-toggle.spec.ts file, Proof, folders, Selected story only and tree scroll kept across views |
| G3 | The developer can inspect the saved Intent Coverage assessment without losing their place. | slice 3 | |
| G4 | The developer can visit project CI and optimization candidates and return to the same story evidence. | slice 2 | |
| D1 | Hierarchy, spacing, tabs and timing treatment follow the approved interactive mockup. | slice 5 | |
| D2 | Real evidence and the states described in the story are used. The mockup's sample story, build figures and report excerpt only illustrate the interaction. | slice 5 | |
| 1 | One persistent story header sits above the tabs. | slice 1 | observed: dashboard/tests/intent/intent-story-changes.spec.ts one Selected story region above the tablist |
| 1a | The story header cannot be collapsed. | slice 1 | observed: dashboard/tests/intent/intent-story-changes.spec.ts no collapse control on the header (storyHeaderDetail) |
| 2 | Tabs appear in this order: **CI comparison**, **Changed tests**, **Intent coverage**. | slice 1 | observed: dashboard/tests/intent/intent-story-changes.spec.ts tablist text CI comparison, Changed tests, Intent coverage |
| 3 | A new story selection opens **CI comparison**. | slice 1 | observed: dashboard/tests/intent/intent-story-changes-only.spec.ts Story B then A each opens CI comparison |
| 4 | The header stays visible when the files are hidden. | slice 1 | observed: dashboard/tests/intent/intent-sidebar-toggle.spec.ts Hide files keeps the header above the reader; intent-story-summary-title.spec.ts |
| 5 | When changes outside Intent locations are known, their compact count stays beside the title. | slice 1 | observed: expectOutsideCount on the title line in intent-story-changes*.spec.ts and intent-story-completed.spec.ts |
| 5a | The **Review changes** action stays beside the title when those changes are known. | slice 1 | observed: intent-story-review-return.spec.ts outside count opens Review changes by keyboard; focus returns to the Intent tab on close |
| 6 | The selected story's existing CI summary is shown directly. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison.spec.ts compares-named-builds variants (locations read held): summary shown in the default CI comparison panel |
| 6a | Its build table is shown directly. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison.spec.ts compares-named-builds variants (locations read held): build table wall times in the default panel |
| 6b | Its sortable entry timing table is shown directly. | slice 1 | observed: dashboard/tests/support/selectDoneStoryForSummaryComparison.ts waits for the entry table in the default view; sort specs |
| 7 | CI can appear while file locations are still loading. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-locations.spec.ts held locations read: CI shown while held, no second comparison read after release |
| 7a | CI can appear when file locations are unavailable. | slice 1 | observed: intent-story-changes-gaps.spec.ts without configured locations; dashboard/tests/intent/intent-ci-comparison-locations.spec.ts failed locations read keeps CI shown with Retry in Changed tests |
| 8.1 | Build selection is preserved. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison.spec.ts compares-named-builds variants (locations read held): existing endpoint, source, wall/runner-wait, count, attribution and missing-evidence assertions in the default panel |
| 8.2 | Evidence sources are preserved. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison.spec.ts compares-named-builds variants (locations read held): existing endpoint, source, wall/runner-wait, count, attribution and missing-evidence assertions in the default panel |
| 8.3 | The build table keeps measured wall time. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison.spec.ts compares-named-builds variants (locations read held): existing endpoint, source, wall/runner-wait, count, attribution and missing-evidence assertions in the default panel |
| 8.4 | The build table keeps time without runner waits. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison.spec.ts compares-named-builds variants (locations read held): existing endpoint, source, wall/runner-wait, count, attribution and missing-evidence assertions in the default panel |
| 8.5 | Counts are preserved. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison.spec.ts compares-named-builds variants (locations read held): existing endpoint, source, wall/runner-wait, count, attribution and missing-evidence assertions in the default panel |
| 8.6 | Attribution context is preserved. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison.spec.ts compares-named-builds variants (locations read held): existing endpoint, source, wall/runner-wait, count, attribution and missing-evidence assertions in the default panel |
| 8.7 | Provisional evidence stays recognizable. | slice 1 | observed: intent-ci-comparison-taken.spec.ts provisional states through the CI comparison default |
| 8.8 | Missing evidence stays recognizable. | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison.spec.ts compares-named-builds variants (locations read held): existing endpoint, source, wall/runner-wait, count, attribution and missing-evidence assertions in the default panel |
| 8.9 | Recovery actions are preserved. | slice 1 | observed: intent-ci-comparison-retry.spec.ts Check again recovery through the CI comparison default |
| 9 | The CI summary shows one signed elapsed-time delta when both timings are measured. | slice 4 | |
| 9a | Branch entry cells show one signed elapsed-time delta when both timings are measured. | slice 4 | |
| 9b | Landed entry cells show one signed elapsed-time delta when both timings are measured. | slice 4 | |
| 10 | The measured Baseline time stays in its own column. | slice 4 | |
| 11 | Branch and Landed columns sort by their numeric delta. | slice 4 | |
| 11a | Entries without comparable timings sort after the measured deltas. | slice 4 | |
| 12 | A new entry shows its measured time instead of a change mark. | slice 4 | |
| 13 | The existing explanation is kept when timing evidence is missing. | slice 4 | |
| 14 | Relative change appears with a visible zero mark. | slice 5 | |
| 15 | Comparable timings share one scale. | slice 5 | |
| 16 | Faster extends left and slower extends right. | slice 5 | |
| 17 | The elapsed delta is readable without relying on color. | slice 5 | |
| 18 | **Show %** starts off. | slice 5 | |
| 18a | Turning on **Show %** reveals all numeric percentages together. | slice 5 | |
| 19 | Zero change stays at the center. | slice 5 | |
| 20 | An absent baseline supplies no relative change. | slice 5 | |
| 20a | A zero baseline supplies no relative change. | slice 5 | |
| 21 | A measured zero baseline can still supply an elapsed delta. | slice 4 | |
| 22 | The shared scale handles values beyond those shown in the mockup. | slice 5 | |
| 23 | **Hide files** / **Show files** sits at the trailing end of the tab row. | slice 1 | observed: intent-sidebar-toggle.spec.ts toggle at the end of the story tab row, absent from the mode bar |
| 23a | It reuses the existing control and the kept reading place. | slice 1 | observed: intent-sidebar-toggle.spec.ts kept choice survives Candidates, Development and project change via FileBrowserToggle |
| 24.1 | File and folder selection is preserved. | slice 1 | observed: intent-sidebar-toggle.spec.ts file, folders, Selected story only and Proof restored after Coverage and CI views |
| 24.2 | Open folders are preserved. | slice 1 | observed: intent-sidebar-toggle.spec.ts file, folders, Selected story only and Proof restored after Coverage and CI views |
| 24.3 | **Selected story only** is preserved. | slice 1 | observed: intent-sidebar-toggle.spec.ts file, folders, Selected story only and Proof restored after Coverage and CI views |
| 24.4 | The Purpose and Proof view is preserved. | slice 1 | observed: intent-sidebar-toggle.spec.ts file, folders, Selected story only and Proof restored after Coverage and CI views |
| 24.5 | The scroll position is preserved. | slice 1 | observed: intent-reading-place.spec.ts reading-pane scroll kept after CI, Coverage and Development without rereads |
| 25 | When the changes could not be read, the tree stays usable. | slice 1 | observed: intent-story-changes-gaps.spec.ts failed changes read keeps the tree usable in Changed tests |
| 25a | When the changes could not be read, comparison recovery stays usable. | slice 1 | observed: intent-story-changes-gaps.spec.ts Retry in the header after a failed comparison read |
| 26 | Controls stay reachable at narrow widths. | slice 1 | observed: intent-story-views-narrow.spec.ts 390px: controls in viewport, no horizontal scroll |
| 26a | Controls stay reachable by keyboard. | slice 1 | observed: intent-story-views-narrow.spec.ts Tab, Enter/Space, Home/End on views and toggle |
| 27 | File Proof offers the mockup's direct return to **CI comparison**. | slice 1 | observed: intent-summary-story-comparison-file.spec.ts file Proof returns directly to CI comparison by Enter, tab focused |
| 28 | With files hidden, the reader uses the available width and the header stays above it. (from the example) | slice 1 | observed: intent-sidebar-toggle.spec.ts Hide files gives the reader the width under the story header |
| 29 | **Intent coverage** has its own reading pane. | slice 3 | |
| 30 | The full saved report is shown as text. | slice 3 | |
| 31.1 | A saved unavailable reason has its own distinct message. | slice 3 | |
| 31.2 | An older completion that was read successfully but has no assessment has its own distinct message. | slice 3 | |
| 31.3 | A completion whose record is still being read has its own distinct state. | slice 3 | |
| 31.4 | A completion whose record could not be read has its own distinct state. | slice 3 | |
| 32 | The existing retry is kept where available. | slice 3 | |
| 32a | A failed completion read offers recovery without implying that no assessment was ever saved. (from the example) | slice 3 | |
| 33 | For an unfinished story, the pane explains that the assessment runs during feature story wrap-up. | slice 3 | |
| 34 | **Optimization Candidates** sits alongside **CI status** in **Project Intent**. | slice 2 | |
| 35 | Project CI shows trunk proof, including during a visit from a selected story. | slice 2 | |
| 36 | Project test browsing is preserved. | slice 2 | |
| 36a | A candidate keeps its route to its project test and back. | slice 2 | |
| 37 | With no story selected, project CI status is the landing view. | slice 2 | |
| 38.1 | A visit to Project Intent keeps the selected story. | slice 2 | |
| 38.2 | A visit to Project Intent keeps that story's current tab. | slice 2 | |
| 38.3 | A visit to Project Intent keeps that story's reading place. | slice 2 | |
| 39 | Project test browsing uses the dashboard's existing published-revision and update behavior. | slice 2 | |
| 39a | A candidate's test that the selected story also changes shows project-published content. (from the example) | slice 2 | |
| 39b | Returning goes to the same candidate first and then to the selected story. Its tab, file, Proof and reading position are restored. (from the example) | slice 2 | |
| A1 | The dashboard keeps one page-owned Selected story. | slice 2 | |
| A2 | A Project Intent visit changes the evidence and reading context and leaves the selection intact. | slice 2 | |
| A3 | Project browsing does not borrow the story's diff or file selection. | slice 2 | |
| A4 | Both reading places (story and project) are disposable page state. | slice 2 | |
| A5 | CI and coverage come from their existing published evidence. | slice 3 | |
| V1 | The implementation is compared with the mockup in light and dark themes. | slice 5 | |
| V2 | The comparison covers desktop and narrow widths. | slice 5 | |
| V3.1 | Reviewed view: the default CI tab with percentages off. | slice 5 | |
| V3.2 | Reviewed view: the default CI tab with percentages on. | slice 5 | |
| V3.3 | Reviewed view: the file pane with the sidebar shown. | slice 5 | |
| V3.4 | Reviewed view: the file pane with the sidebar hidden. | slice 5 | |
| V3.5 | Reviewed view: the coverage tab. | slice 5 | |
| V4 | Keyboard navigation is verified. | slice 5 | |
| V5 | State restoration is verified through the dashboard's normal entry points. | slice 5 | |
