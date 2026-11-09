# Independent source review

Reviewer launch: `/root/source_review`, fresh context (`fork_turns: none`).
Input: only the selected story's identity, title, Goal and Scope at
`SEED-275-story-intent-tabs.md#align-story-tabs-records`, reproduced verbatim
in the launch. The reviewer was instructed to read no project files, change
nothing, and return individual commitments, qualifications, examples and
exclusions without assigning slices or acceptance. No plan, implementation,
proof or suspected omission was supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P1 | Request documentation states that hidden story CI stays followed. | slice 1 | observed: dashboard/GITHUB-REQUESTS.md and docs/dashboard-development-intent-ci-status.md: selected story reading stays followed during Project Intent visits |
| P2 | Request documentation states that hidden trunk CI stays followed. | slice 1 | observed: dashboard/GITHUB-REQUESTS.md and docs/dashboard-development-intent-ci-status.md: trunk stays followed after first Project Intent showing, including while story shows |
| P3 | Request counts in the Project Intent visit journey protect the cost of following hidden story CI. | slice 1 | observed: dashboard/tests/intent/intent-project-visit-ci.spec.ts: Project Intent visit journey, story push during visit observes four judgment calls and refreshed Passed after return |
| P4 | Request counts in that journey protect the cost of following hidden trunk CI. | slice 1 | observed: dashboard/tests/intent/intent-project-visit-ci.spec.ts: Project Intent visit journey, hidden trunk advance observes three judgment calls and refreshed Passed on visit |
| P5 | A Taken story’s CI status stops repeating the story title beneath the persistent header. | slice 1 | observed: dashboard/src/IntentCiJudgedBranch.tsx role-only label; intent-ci-status-story.spec.ts asserts header title, exactly one title, no title in status; comparison and activation consumers agree |
| P6 | Correct stale homepage wording wherever it occurs in touched comments. | slice 2 | observed: IntentCiComparison.tsx, storyCiComparisonEntries.ts, storyCiComparisonWording.ts and IntentCiStatus.tsx comments now describe selected-story CI comparison; touched spec comments describe persistent header and Project Intent landing |
| P7 | Correct stale homepage wording wherever it occurs in touched test titles. | slice 2 | observed: inspected touched test titles: no stale homepage wording remains; no homepage category occurred in original touched titles requiring a separate edit |
| P8 | Correct stale segmented-strip wording wherever it occurs in touched comments. | slice 2 | observed: IntentModeTabs.tsx comment names Project Intent views tablist and tab row, replacing segmented-strip wording |
| P9 | Correct stale segmented-strip wording wherever it occurs in touched test titles. | slice 2 | observed: inspected touched test titles: segmented-strip wording does not occur; conditional category needs no invented title edit |
| P10 | Correct stale Intent-tab wording wherever it occurs in touched comments. | slice 2 | observed: IntentModeTabs.tsx and intent-home-activation.spec.ts comment describe Project Intent CI status and selected-story CI comparison views; story-status comment names persistent header |
| P11 | Correct stale Intent-tab wording wherever it occurs in touched test titles. | slice 2 | observed: intent-home-activation.spec.ts titles and step title now name CI status rather than activating Intent; intent-ci-status-story.spec.ts step names CI comparison |
| Q1 | This is a correction bounded to retrospective findings for SEED-275#story-intent-tabs. | slice 2 | observed: aggregate implementation diff matches the three original retrospective findings: documented/protected hidden follow cost, role-only Taken heading, and bounded comments/test titles |
| Q2 | Wording corrections concern touched comments and test titles; the source does not require a repository-wide wording sweep. | slice 2 | observed: slice2 diff touches only five named source comment headers and two spec comments/titles; no repository-wide rewrite |
| Q3 | The source specifies request-count protection but supplies no counts, timing, or request breakdown. | slice 1 | observed: intent-project-visit-ci.spec.ts establishes zero repeat-visit calls, three trunk calls, four story calls using existing branchJudgmentCalls boundary |
| Q4 | The heading change applies to a Taken story’s CI status beneath its persistent header. | slice 1 | observed: intent-ci-status-story.spec.ts and intent-ci-comparison-taken.spec.ts select Taken story then assert header title and role-only status |
| Q5 | P6–P11 describe conditional locations, not a requirement that every wording category occurs in both comments and test titles. | slice 2 | observed: reviewed conditional categories individually; absent homepage/segmented-strip title occurrences remain absent while actual Intent activation titles are corrected |
| J1 | During the Project Intent visit journey, story CI is hidden but remains followed; documentation describes that fact and request counts protect its cost. | slice 1 | observed: intent-project-visit-ci.spec.ts: story push while Project Intent shows, four calls and current result after return; request docs describe follow lifecycle |
| J2 | During that journey, trunk CI is hidden but remains followed; documentation describes that fact and request counts protect its cost. | slice 1 | observed: intent-project-visit-ci.spec.ts: trunk advance while story shows, three calls and current result on Project Intent visit; request docs describe follow lifecycle |
| J3 | A developer views a Taken story’s CI tab with its persistent header present; the status area does not repeat the story title underneath. | slice 1 | observed: intent-ci-status-story.spec.ts: Selected story header matches failing.title, exact title count one, CI status excludes title and retains branch/judgment assertions |
| J4 | A maintainer reads an affected comment or test title; its terminology accurately describes the delivered story tabs. | slice 2 | observed: inspected seven-file wording diff against current scope controls, persistent header, and actual focused journeys; terminology matches delivered UI |
| X1 | Product behavior other than the Taken heading line remains unchanged. | slice 2 | observed: aggregate runtime diff changes only IntentCiJudgedBranch.tsx role label; remaining product edits are comments, with full Intent proof retained and both touched specs passing |
| X2 | Changing whether hidden story or trunk CI stays followed is outside scope. | slice 1 | observed: git diff: no CI provider/follow implementation edits; only product change is role-only label in IntentCiJudgedBranch.tsx |
| X3 | New tab behavior, navigation, layout changes beyond the repeated heading, and request-cost optimization are not promised. | slice 2 | observed: aggregate diff adds no navigation, tab behavior, layout or request optimization; CI-follow implementation unchanged |
| X4 | No slice boundaries, implementation ownership, or acceptance disposition follow from this source. | slice 2 | observed: source-only review input and numbered return derive promises only; slice allocation and acceptance are coordinator decisions in this plan |
