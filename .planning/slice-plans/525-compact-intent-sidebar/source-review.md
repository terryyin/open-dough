# Source review: SEED-271#compact-intent-sidebar

Launch: a fresh general-purpose reviewer (no conversation inheritance) on
2026-11-08, given only the seed's story section verbatim (Goal, Scope, scope
limits, Key examples, UI sketch, Architecture), instructed to read no project
files, change nothing, and return numbered commitments with qualifications,
examples and exclusions. The table below keeps its return as given; Slice and
the last column are the coordinator's allocation and acceptance record.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reviewing a story in Intent can quickly spot the top-level entries. | slice 1 | observed: intent-gherkin-groups.spec.ts header step (fullWidth vs column, labelWeight>=600, bg apart from rows); slice-1 light/dark screenshots (job tmp slice1/intent-tree-*.png): violet band apart from green change mark/folder tint and blue selected fill |
| 2 | The developer can give the reading pane more room. | slice 3 | |
| 3 | The developer can see at a glance how many changed files fall outside Intent locations. | slice 2 | observed: intentStoryPage.ts expectOutsideCount (text = count, accessible name + title = full wording, on disclosure line, old sentence gone) in intent-story-changes.spec.ts collapsed/expanded and intent-story-changes-gaps.spec.ts after Retry |
| 4 | Intent's sidebar becomes easier to scan and costs less room while reading. | slice 3 | |
| 5 | Reviewing a story's Purpose and Proof needs less scrolling and searching. | slice 3 | |
| 6 | Each top-level Intent location header spans the sidebar edge to edge. | slice 1 | observed: intent-gherkin-groups.spec.ts header step (fullWidth vs column, labelWeight>=600, bg apart from rows) |
| 7 | Each header has its own colored background. | slice 1 | observed: intent-gherkin-groups.spec.ts header step (own bg apart from rows); dashboard/src/intent-location-group.css --location-header |
| 8 | The header's toggle and label are padded inside that color. | slice 1 | observed: slice-1 light/dark screenshots (job tmp slice1/intent-tree-*.png): violet band apart from green change mark/folder tint and blue selected fill: toggle and label padded inside band |
| 9 | The header label is bold, setting it apart from the folder and file rows beneath. | slice 1 | observed: intent-gherkin-groups.spec.ts header step (fullWidth vs column, labelWeight>=600, bg apart from rows) labelWeight |
| 10 | The header keeps every cue it carries now. | slice 1 | observed: intent-story-changes.spec.ts changed-header step (fullWidth, weight, bg != changed folder, mark kept when selected); intent-story-ci-cues.spec.ts selected cued header (fullWidth, mark + count inset, tint kept, accent border) |
| 10.1 | Selected background across the header's whole width. | slice 1 | observed: intent-story-changes.spec.ts changed-header step (fullWidth, weight, bg != changed folder, mark kept when selected) |
| 10.2 | Alternative to 10.1: the accent border when a CI duration tint would be hidden. | slice 1 | observed: intent-story-ci-cues.spec.ts selected cued header (fullWidth, mark + count inset, tint kept, accent border) |
| 10.3 | Change mark on its leading edge. | slice 1 | observed: intent-story-changes.spec.ts changed-header step (fullWidth, weight, bg != changed folder, mark kept when selected); intent-story-ci-cues.spec.ts selected cued header (fullWidth, mark + count inset, tint kept, accent border) |
| 10.4 | A compared entry's count-border cue. | slice 1 | observed: intent-story-ci-cues.spec.ts selected cued header (fullWidth, mark + count inset, tint kept, accent border) |
| 10.5 | A compared entry's duration-tint cue. | slice 1 | observed: intent-story-ci-cues.spec.ts selected cued header (fullWidth, mark + count inset, tint kept, accent border) |
| 11 | The header color is distinct from those cues (10.1-10.5). | slice 1 | observed: slice-1 light/dark screenshots (job tmp slice1/intent-tree-*.png): violet band apart from green change mark/folder tint and blue selected fill; intent-story-changes.spec.ts changed-header step (fullWidth, weight, bg != changed folder, mark kept when selected) (bg != selected) |
| 12 | The header color is distinct from the shared background of folders holding changes. | slice 1 | observed: intent-story-changes.spec.ts changed-header step (fullWidth, weight, bg != changed folder, mark kept when selected) |
| 13 | Items 11 and 12 hold in light and dark themes. | slice 1 | observed: slice-1 light/dark screenshots (job tmp slice1/intent-tree-*.png): violet band apart from green change mark/folder tint and blue selected fill (dark: only CI cues vary in dark; token declared for both) |
| 14 | Example: five locations configured, sidebar open. Each location shows a full-width colored band with a bold name (`Dashboard Frontend Test`, `dashboard/tests`, ...). Its folders and files read as rows inside it, without the band's color. | slice 1 | observed: intent-gherkin-groups.spec.ts header step (fullWidth vs column, labelWeight>=600, bg apart from rows); slice-1 light/dark screenshots (job tmp slice1/intent-tree-*.png): violet band apart from green change mark/folder tint and blue selected fill |
| 15 | Example: `dashboard/tests` selected, with a story whose comparison changed files in it. The header carries the selected background across the full sidebar width and the change mark on its leading edge, as before. | slice 1 | observed: intent-story-changes.spec.ts changed-header step (fullWidth, weight, bg != changed folder, mark kept when selected); slice-1 light/dark screenshots (job tmp slice1/intent-tree-*.png): violet band apart from green change mark/folder tint and blue selected fill |
| 16 | While the Intent mode shows the location tree, the bar holding Intent and Optimization Candidates offers one toggle, **Hide files** / **Show files**. | slice 3 | |
| 16.1 | It is the same control and words Review changes uses for its file browser. | slice 3 | |
| 17 | Hiding removes the whole locations column (story summary and tree). | slice 3 | |
| 18 | Hiding gives the reading pane the freed width. | slice 3 | |
| 19 | On a narrow screen, where the tree sits above the reading pane, hiding gives the reading pane the full height. | slice 3 | |
| 20 | Showing the sidebar again restores the column as it was. | slice 3 | |
| 20.1 | Selection restored. | slice 3 | |
| 20.2 | Open location and folders restored. | slice 3 | |
| 20.3 | **Selected story only** restored. | slice 3 | |
| 20.4 | The summary's disclosure restored. | slice 3 | |
| 20.5 | The tree's scroll restored. | slice 3 | |
| 21 | Hiding changes no selection or reading. | slice 3 | |
| 22 | The choice is kept in memory with Intent's reading place. | slice 3 | |
| 22.1 | It persists across file and location selections. | slice 3 | |
| 22.2 | It persists across Optimization Candidates and back. | slice 3 | |
| 22.3 | It persists across Development and back. | slice 3 | |
| 22.4 | It persists across new revisions. | slice 3 | |
| 22.5 | A project change shows the sidebar again. | slice 3 | |
| 23 | The choice is not on the URL or in storage. | slice 3 | |
| 24 | The control is keyboard-operable. | slice 3 | |
| 25 | The control states whether the sidebar is shown. | slice 3 | |
| 26 | Example: story selected, a file's Purpose open, `dashboard/tests` and two of its folders open, then Hide files. The reading pane spans the page width. The bar shows Intent, Optimization Candidates, Show files, and `Story Make the Intent sidebar easier to scan and hide` at its trailing end, ellipsized when it does not fit, with the full title on hover. Then Show files: the summary, the same open folders, the selected file row and the tree's scroll return, and the reading pane still shows that file's Purpose. | slice 3 | |
| 27 | Example: sidebar hidden, no story selected. The bar shows the toggle and nothing at its trailing end. The reading pane shows **CI status** across the width. | slice 3 | |
| 28 | Example: sidebar hidden, then the developer switches to Development and back, or to Optimization Candidates and back. The sidebar is still hidden. Picking another project makes its Intent show the sidebar. | slice 3 | |
| 29 | With a story selected and the sidebar hidden in the Intent mode, the bar's remaining space at its trailing end names the story (`Story` and its title). | slice 3 | |
| 30 | The story name appears on one line. | slice 3 | |
| 31 | The story name is truncated, with the full title on hover. | slice 3 | |
| 32 | Nothing else from the summary appears there. | slice 3 | |
| 33 | Showing the sidebar removes the story name from the bar. | slice 3 | |
| 34 | Showing the sidebar returns the full summary above the tree. | slice 3 | |
| 35 | The summary replaces the sentence "N changed files outside Intent locations are shown in Review changes." and its separate button with one compact control. | slice 2 | observed: intentStoryPage.ts expectOutsideCount (text = count, accessible name + title = full wording, on disclosure line, old sentence gone) in intent-story-changes.spec.ts collapsed/expanded and intent-story-changes-gaps.spec.ts after Retry (old sentence and button gone) |
| 36 | The control sits on the story's title line. | slice 2 | observed: intentStoryPage.ts expectOutsideCount (text = count, accessible name + title = full wording, on disclosure line, old sentence gone) in intent-story-changes.spec.ts collapsed/expanded and intent-story-changes-gaps.spec.ts after Retry (button inside .intent-story-title-line, centred on the disclosure box) |
| 37 | The control shows an icon and the count. | slice 2 | observed: intentStoryPage.ts expectOutsideCount (text = count, accessible name + title = full wording, on disclosure line, old sentence gone) in intent-story-changes.spec.ts collapsed/expanded and intent-story-changes-gaps.spec.ts after Retry; IntentStorySummary.tsx GitCompare icon + count |
| 38 | Its accessible name and hover text explain the count and that it opens Review changes (for example, "2 changed files outside Intent locations — open Review changes"). | slice 2 | observed: intentStoryPage.ts expectOutsideCount (text = count, accessible name + title = full wording, on disclosure line, old sentence gone) in intent-story-changes.spec.ts collapsed/expanded and intent-story-changes-gaps.spec.ts after Retry |
| 38.1 | The quoted text is only an example of the wording. | slice 2 | observed: intentStoryPage.ts expectOutsideCount (text = count, accessible name + title = full wording, on disclosure line, old sentence gone) in intent-story-changes.spec.ts collapsed/expanded and intent-story-changes-gaps.spec.ts after Retry (wording as example) |
| 39 | Activating it opens Review changes on Intent's comparison (All changes, uncommitted included), as the button does now. | slice 2 | observed: intentStoryPage.ts openReviewFromIntent clicks the count; intent-story-changes-marked.spec.ts expectShown All changes + uncommitted checked; intent-story-changes.spec.ts review diffs untracked file |
| 40 | With no such files, the control is absent. | slice 2 | observed: intent-story-changes-gaps.spec.ts no-workspace and no-locations cases: outsideCount count 0; intent-story-changes.spec.ts cleared story |
| 41 | Example: a story whose comparison changed two files that no Intent location selects. The title line shows an icon and `2`. A screen reader hears "2 changed files outside Intent locations — open Review changes". Activating it opens Review changes on All changes for that story. | slice 2 | observed: intentStoryPage.ts expectOutsideCount (text = count, accessible name + title = full wording, on disclosure line, old sentence gone) in intent-story-changes.spec.ts collapsed/expanded and intent-story-changes-gaps.spec.ts after Retry; openReviewFromIntent in intent-story-changes.spec.ts |
| 42 | Example: a story whose changed files all fall inside locations shows no such control. | slice 2 | observed: intent-story-changes-gaps.spec.ts outsideCount count 0 while all changes inside / published tree |
| 43 | No resizable sidebar. | slice 3 | |
| 44 | No keyboard shortcut. | slice 3 | |
| 45 | No remembering the choice across reloads. | slice 3 | |
| 46 | Items 43-45 remain open. The toggle is enough for "more room". | slice 3 | |
| 47 | No sticky location headers while scrolling. The full-width bold header is this story's scanning aid. | slice 1 | observed: slice-1 diff adds no sticky positioning |
| 48 | While the sidebar is hidden, the bar shows no comparison state. | slice 3 | |
| 49 | While the sidebar is hidden, the bar shows no **Retry**. | slice 3 | |
| 50 | While the sidebar is hidden, the bar shows no outside count. | slice 3 | |
| 51 | A comparison that is reading or failed is seen when the sidebar is shown again. | slice 3 | |
| 52 | Surfacing that state in the bar is a possible follow-up if hidden reading proves to miss failures. | slice 3 | |
| 53 | Development's layout is unchanged. | slice 3 | |
| 54 | Review changes' own browser behavior is unchanged. | slice 3 | |
| 55 | The explanation shown in place of the tree (which has no sidebar to hide) is unchanged. | slice 3 | |
| 56 | Sidebar open: bar `[Intent \| Optimization Candidates]  [Hide files]`. The sidebar shows `> Story Make the Intent s…  [i] 2`, `[ ] Selected story only`, full-width bold header bands `[book] Dashboard Frontend Test`, folder rows `> intent/`, and header band `[book] dashboard/tests`. The reading pane is to the right. | slice 3 | |
| 57 | Sidebar hidden: bar `[Intent \| Optimization Candidates]  [Show files]      Story Make the Intent s…`. The reading pane spans the full width. | slice 3 | |
| 58 | Keep this as disposable presentation state (ADR 0008). | slice 3 | |
| 59 | The shown/hidden choice belongs to Intent's kept reading place (`useKeptReading`). | slice 3 | |
| 59.1 | It is owned by the perspective, because the toggle sits in the mode bar while the column lives in the browser. | slice 3 | |
| 59.2 | The browser reads it rather than keeping its own copy. | slice 3 | |
| 60 | The toggle reuses Review changes' `FileBrowserToggle`, moved to a shared home both surfaces import. | slice 3 | |
| 60.1 | One control owns Hide files / Show files. | slice 3 | |
| 61 | The outside-locations count stays computed where it is now. | slice 2 | observed: backend-tests/intent/intent-story-overlay.spec.ts passes; slice-2 diff leaves scope.outside computation untouched |
| 61.1 | Only its presentation changes. | slice 2 | observed: slice-2 diff: IntentStorySummary.tsx presentation only |
| 62 | The Development and Intent guidance doc, which describes the current location browser and selected-story summary, is updated with this behavior. | slice 3 | |
