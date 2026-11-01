# Source review: SEED-213#renovate-intent-sidebar

**Launch:** Fresh general-purpose reviewer (no conversation inheritance); supplied only Goal, Scope, key examples, exclusions, UI, and required restrictions from `.planning/seeds/SEED-213-intent-sidebar-panels.md#renovate-intent-sidebar`. Instructed to read no other project files and change nothing.

**Input:** Story beneficiary, goal, selected direction, scope bullets, scope limits, required restrictions, key examples, and UI paragraph (verbatim excerpts in the launch prompt).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer browsing a project's configured Intent groups and their file lists in the dashboard Intent perspective. | slice 1 | observed: exclusive journey + prior browse journeys open Intent and list configured groups |
| 2 | Make the Intent locations column easier to scan and navigate by presenting each configured Intent group as its own recognizable expandable section. | slice 1 | observed: IntentLocationGroup section + intent-location-toggle; exclusive journey headers visible while bodies hidden |
| 3 | Using the same header-and-body pattern as Sessions sidebar optional sections. | slice 1 | observed: IntentLocationGroup uses sessions-sidebar-section-header with aria-expanded / aria-controls |
| 4 | Group identity stays visible while at most one group's file list is open at a time, and files in the open group stay selectable for Purpose reading. | slice 1 | observed: exclusive journey A→B exclusivity + file select → Purpose text |
| 5 | Keep the existing Intent browser layout (locations column beside Purpose/Proof). | slice 1 | observed: IntentBrowser intent-browser / intent-locations / intent-reading grid unchanged |
| 6 | Replace always-visible per-group file trees with collapsible group sections. | slice 1 | observed: body rendered only when expanded; expectIntentGroupsCollapsed zero bodies |
| 7 | Share Sessions-style expand/collapse chrome (aria-expanded header controls the body). | slice 1 | observed: header button aria-expanded + aria-controls bodyId; body only when expanded |
| 8 | Expansion is exclusive: opening one group closes any other. | slice 1 | observed: exclusive journey expand B closes A (aria-expanded false; A's files count 0) |
| 9 | On each Intent browser mount, every group starts collapsed. | slice 1 | observed: expandedPath initial null; expectIntentGroupsCollapsed on open |
| 10 | Expansion is session presentation state only. | slice 1 | observed: useState in IntentBrowser; no storage write for expansion |
| 11 | Expansion is not remembered across remounts, project/revision changes, or leaving and returning to Intent. | slice 1 | observed: parent remount clears component state; project-change step reasserts collapsed |
| 12 | File selection and Purpose/Proof reading stay as they are today. | slice 1 | observed: selectedPath / Purpose / Proof sections unchanged; prior browse Proof placeholder after expand-then-select |
| 13 | File selection and Purpose/Proof reading survive collapsing the selected file's group. | slice 1 | observed: collapse keeps Purpose text; re-expand restores aria-pressed true |
| 14 | Each configured Intent location remains one section in the locations column. | slice 1 | observed: map locations → one IntentLocationGroup section each |
| 15a | Header shows path identity cue. | slice 1 | observed: toggle shows location.path in code element |
| 15b | Header shows kind identity cue. | slice 1 | observed: intent-location-kind |
| 15c | Header shows include patterns identity cue. | slice 1 | observed: intent-location-pattern when include present; code-browse pattern headers |
| 16 | The header is the expand/collapse control with aria-expanded. | slice 1 | observed: toggle button aria-expanded |
| 17 | Associated body region for the file list or the existing empty/unsupported-kind explanation. | slice 1 | observed: intent-location-body with FileTree or problem explanation |
| 18 | Expanding a collapsed group expands it and collapses any other expanded group. | slice 1 | observed: exclusive journey A→B step |
| 19 | Collapsing the expanded group leaves every group collapsed. | slice 1 | observed: collapse → expectIntentGroupsCollapsed |
| 20 | Nested folder disclosure inside an expanded group's file tree stays local to that tree. | slice 1 | observed: nested folder step; group stays aria-expanded true |
| 21 | Nested folder disclosure does not count as another Intent group. | slice 1 | observed: folder toggle does not change Intent group exclusivity |
| 22 | On each Intent browser mount (first visit, leave/return remount, source/revision remount), every group starts collapsed. | slice 1 | observed: mount null + project-change remount collapsed assertion |
| 23 | Expansion is not persisted to browser storage or elsewhere. | slice 1 | observed: no localStorage/sessionStorage for Intent expansion in changed Intent sources |
| 24 | Selecting a file in an expanded group still opens that file in Purpose (and the existing Proof placeholder). | slice 1 | observed: Purpose source text in exclusive journey; Proof region in prior browse after expand |
| 25 | Collapsing a group does not clear the current selection or Purpose/Proof content. | slice 1 | observed: Purpose text retained across collapse |
| 26 | Selecting another file replaces the selection as today. | slice 1 | observed: prior multi-file browse journeys still select/replace after expand |
| 27 | Failed file reads, settings problems, and not-configured states keep their current behavior outside this section chrome. | slice 1 | observed: intent-gherkin-unusable expand-then failed read/retry; frame not-configured unchanged |
| 28 | Follow the Sessions sidebar optional-section header and body interaction pattern for expand/collapse affordance and accessibility naming. | slice 1 | observed: shared sessions-sidebar-section-header class + aria pairing |
| 29a | Do not adopt Sessions multi-open rules for Intent groups. | slice 1 | observed: exclusive expandedPath single key; exclusive journey |
| 29b | Do not adopt Sessions height room ownership for Intent groups. | slice 1 | observed: no sessionsSidebarHeights in Intent sources |
| 29c | Do not adopt Sessions resize dividers for Intent groups. | slice 1 | observed: no ResizeDivider in Intent sources |
| 30 | At most one Intent group body is expanded at a time. | slice 1 | observed: exclusive journey; expandedPath single nullable |
| 31 | Do not name these sections the dashboard Side panel. | slice 1 | observed: Intent product copy uses Intent location/group language; no Side panel label on toggles |
| 32 | In product language they are Intent group sections in the Intent locations column; panel must not collide with Side panel. | slice 1 | observed: comments/UI label Purpose locations / Intent location; no Side panel naming |
| 33 | The Intent locations column lists one expandable section per configured group. | slice 1 | observed: one section per location in map |
| 34 | Each section has a header control (group path/kind/patterns). | slice 1 | observed: toggle content path/kind/patterns |
| 35 | Body appears only while that group is expanded. | slice 1 | observed: conditional expanded body render |
| 36 | Interaction matches Sessions optional-section expand/collapse for the header control. | slice 1 | observed: header click toggles via onToggle; Sessions header class |
| 37 | Layout stays the existing Intent browser grid (locations beside reading). | slice 1 | observed: unchanged intent-browser grid structure |
| 38a | No Board changes. | slice 1 | observed: no Board files in owned diff |
| 38b | No Sessions multi-open changes. | slice 1 | observed: no Sessions sidebar behavior files in owned diff |
| 38c | No Sessions height changes. | slice 1 | observed: no sessionsSidebarHeights changes |
| 38d | No Side panel changes. | slice 1 | observed: no side-panel files in owned diff |
| E1 | Several Intent groups configured; on opening Intent every group header visible and every file list hidden. | slice 1 | observed: exclusive journey first step |
| E2 | With A expanded, expanding B collapses A and shows B's files (or empty/unsupported explanation). | slice 1 | observed: exclusive A→B step + empty/unsupported step |
| E3 | With B expanded, collapsing B leaves no group expanded; headers remain visible. | slice 1 | observed: collapse → collapsed; toggles still visible |
| E4 | Select file under A; Purpose shows it; collapse A keeps Purpose; re-expand keeps selected row. | slice 1 | observed: selection-survives-collapse step |
| E5 | Unsupported-kind or empty group, when expanded, shows existing explanation and participates in exclusive expansion. | slice 1 | observed: empty_features / frontend/src (java) exclusive body step |
| E6 | Nested folders open/close without collapsing that Intent group or expanding another. | slice 1 | observed: nested folder step |
| D1 | Persisting which Intent group was expanded across visits, reloads, or projects. |  | D1 |
| D2 | Auto-expanding the group that contains a pre-selected or deep-linked file on mount. |  | D2 |
| D3 | Changing Purpose/Proof layout, Intent location configuration, or how locations and files are published. |  | D3 |
| D4 | Sharing one React component module with Sessions sections unless reuse is the simplest local implementation; visual/behavioral likeness is the promise, not a shared abstraction. |  | D4 |
