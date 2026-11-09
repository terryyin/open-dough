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
| P6 | Correct stale homepage wording wherever it occurs in touched comments. | slice 2 | |
| P7 | Correct stale homepage wording wherever it occurs in touched test titles. | slice 2 | |
| P8 | Correct stale segmented-strip wording wherever it occurs in touched comments. | slice 2 | |
| P9 | Correct stale segmented-strip wording wherever it occurs in touched test titles. | slice 2 | |
| P10 | Correct stale Intent-tab wording wherever it occurs in touched comments. | slice 2 | |
| P11 | Correct stale Intent-tab wording wherever it occurs in touched test titles. | slice 2 | |
| Q1 | This is a correction bounded to retrospective findings for SEED-275#story-intent-tabs. | slice 2 | |
| Q2 | Wording corrections concern touched comments and test titles; the source does not require a repository-wide wording sweep. | slice 2 | |
| Q3 | The source specifies request-count protection but supplies no counts, timing, or request breakdown. | slice 1 | observed: intent-project-visit-ci.spec.ts establishes zero repeat-visit calls, three trunk calls, four story calls using existing branchJudgmentCalls boundary |
| Q4 | The heading change applies to a Taken story’s CI status beneath its persistent header. | slice 1 | observed: intent-ci-status-story.spec.ts and intent-ci-comparison-taken.spec.ts select Taken story then assert header title and role-only status |
| Q5 | P6–P11 describe conditional locations, not a requirement that every wording category occurs in both comments and test titles. | slice 2 | |
| J1 | During the Project Intent visit journey, story CI is hidden but remains followed; documentation describes that fact and request counts protect its cost. | slice 1 | observed: intent-project-visit-ci.spec.ts: story push while Project Intent shows, four calls and current result after return; request docs describe follow lifecycle |
| J2 | During that journey, trunk CI is hidden but remains followed; documentation describes that fact and request counts protect its cost. | slice 1 | observed: intent-project-visit-ci.spec.ts: trunk advance while story shows, three calls and current result on Project Intent visit; request docs describe follow lifecycle |
| J3 | A developer views a Taken story’s CI tab with its persistent header present; the status area does not repeat the story title underneath. | slice 1 | observed: intent-ci-status-story.spec.ts: Selected story header matches failing.title, exact title count one, CI status excludes title and retains branch/judgment assertions |
| J4 | A maintainer reads an affected comment or test title; its terminology accurately describes the delivered story tabs. | slice 2 | |
| X1 | Product behavior other than the Taken heading line remains unchanged. | slice 2 | |
| X2 | Changing whether hidden story or trunk CI stays followed is outside scope. | slice 1 | observed: git diff: no CI provider/follow implementation edits; only product change is role-only label in IntentCiJudgedBranch.tsx |
| X3 | New tab behavior, navigation, layout changes beyond the repeated heading, and request-cost optimization are not promised. | slice 2 | |
| X4 | No slice boundaries, implementation ownership, or acceptance disposition follow from this source. | slice 2 | |
