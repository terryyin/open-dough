# Read and change the story comparison from one control bar

**Source:** [SEED-420](../../seeds/SEED-420-unified-intent-review.md#compact-story-comparison-controls)

**Identity:** SEED-420#compact-story-comparison-controls

## Goal and scope

A developer reviewing a story in Intent identifies the active comparison
and changes it from one toolbar row below the story title. The seed's
Goal, Scope and Key examples are the complete source. Each slice below
names the examples it proves.

Exclusions: automatic re-reading on newer publications; the follow-up
button beside the notes (its own story); the Sessions control (SEED-418);
Project Intent's tab bar, which keeps its current layout.

## Direction

- North Star
  [Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent),
  **Files** and **Sessions and Compare**: the files toggle opens the
  toolbar, then the comparison choice and **Include merged changes**.
  The slices follow the topic; they add no Sessions control.
- [Dashboard ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships):
  the comparison stays the story's review read; no new domain concept.
- PFE: Review changes already has the pattern this story needs.
  [ReviewToolbar](../../../dashboard/src/StoryReviewToolbar.tsx) puts the
  files toggle at the far left, names the comparison, and an eye reveals
  [the review details](../../../dashboard/src/StoryReviewDetailsSection.tsx).
  Escape returns focus to the eye. Reuse its disclosure behavior and
  `fileBrowserToggle` for Intent's bar. Do not build a second disclosure.
  [AgentPortrait](../../../dashboard/src/AgentPortrait.tsx) renders a known
  agent's portrait and nothing for an unknown name. Reuse it for the
  summary.

## Current decisions

- In a story view, the files toggle moves from the story tab bar to the
  start of the comparison bar. The story tabs keep their own row until the
  Home story replaces them. Project Intent keeps its toggle in its tab bar.
- Details are collapsed when a story opens. Opening them keeps them open
  across a comparison change and a Refresh, so the keyboard stays on the
  pressed control.
- Reading, unavailable, failed and unreadable states replace the summary
  text in the bar. **Retry** stays in the bar with the failure.
- [IntentPage.tsx](../../../dashboard/src/IntentPage.tsx) (247 lines) and
  [IntentStoryComparison.tsx](../../../dashboard/src/IntentStoryComparison.tsx)
  (237 lines) are near the 250-line check. The bar and its summary go in a
  new `IntentComparisonBar.tsx`. IntentHeader keeps the title rows.
  IntentPage only places the bar. No reorganization of the existing files
  is required.
- The bookmark story removed the header's scope controls and updated
  `intent-story-changes-gaps`, `intent-story-changes-only` and
  `intent-sidebar-toggle`. Check the delivered header and rerun those specs
  for the comparison bar change. [Bookmarked scope proof](https://github.com/terryyin/open-dough/blob/01b3833c9ee0c38fbd54345ea1d90748311bf0f7/.planning/slice-plans/832-choose-review-scope/PLAN.md).

## Decisive premises and baseline

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| Collapsing the comparison details and Refresh changes only a bounded set of Intent consumers | Frontend runner over `dashboard/frontend-tests/intent` and `dashboard/frontend-tests/review` (`npm run --silent test:dashboard:frontend -- …`) | At `b1b58e8b4` on 25 November 2026, Node 24.21.0, load ~7. A scratch edit hid `ComparisonDetail` and Refresh. 7 of 390 cases failed and 383 passed. The failures were in `intent-story-changes-no-locations` (2), `intent-story-changes-only` (1), `intent-story-compare-done` (2), `intent-story-compare-fixed` (1) and `intent-story-compare-reading` (1). They click Refresh or wait for visible detail text. The scratch edit was reverted. |
| E2E journeys reach Refresh only through page objects | `refreshAndAnswer`, `refresh` and `expectRefreshFocused` in [intentReviewChangesPage.ts](../../../dashboard/test-support/intentReviewChangesPage.ts) and [reviewChangesPage.ts](../../../dashboard/test-support/reviewChangesPage.ts) | Search at `b1b58e8b4`: e2e specs under `e2e/review` and `e2e/intent` call only those methods. `expectRead` waits for Refresh to be enabled, which holds while it is collapsed. Slice 1 runs the named e2e specs. |

No other premise is decisive. Landed runs carry no agent in
[storyReviewContract.ts](../../../dashboard/src/storyReviewContract.ts);
`published` and `published-taken` carry `agent`. That is a schema read,
and slice 3 proves it.

## Ordered slices

### 1. Read the active comparison from a one-line summary that opens its details

Type: Behavior
Status: planned
Proof: New frontend spec `intent-story-comparison-summary.spec.ts` in
`dashboard/frontend-tests/intent`. Update the seven failing cases above
through
[intent-story-compare-page.ts](../../../dashboard/frontend-tests/intent/intent-story-compare-page.ts),
which opens the details before reading them or pressing Refresh. Update
`#refresh` in `intentReviewChangesPage.ts` to open the details first. Run
the frontend `intent` and `review` folders. Run e2e
`story-review-trunk-own-changes`, `story-review-offline` and
`intent-taken-branch-contributions` through `scripts/test.sh`. Budget 15
active minutes.

Behavior: A story's comparison is read. The bar shows a one-line summary
naming it, and the details are collapsed. The developer opens the summary
and sees the branch, the baseline and result revisions, the attribution,
the follow-up action and **Refresh**. Pressing **Refresh** re-reads the
comparison, keeps the choice, reports the refreshed comparison, and leaves
the details open with focus on Refresh. No comparison is available: the
summary says so and the details explain why. The read failed: the summary
reports it with **Retry**. Seed examples 3 and 5.

### 2. Change the comparison from the same row as the files toggle

Type: Behavior
Status: planned
Proof: Extend `intent-story-comparison-summary.spec.ts`. The files toggle,
the comparison choice, **Include merged changes** and the summary share
one row below the title at desktop width and wrap without horizontal
overflow at 375 px. Choosing a landed run changes the summary and the open
details to its time and landing revisions. Update `filesToggle` in
[intentModePage.ts](../../../dashboard/test-support/intentModePage.ts)
and
[intent-sidebar-toggle.spec.ts](../../../dashboard/frontend-tests/intent/intent-sidebar-toggle.spec.ts)
for the toggle's new place. Run the frontend `intent` folder and e2e
`story-card-review-intent`. Budget 15 active minutes.

Behavior: A story with a published comparison and landed runs is open.
The files toggle, the comparison choice, **Include merged changes** and the
summary sit in one row under the story title. The diff starts directly
below the bar. Choosing a landed run updates the summary and details, and
**Include merged changes** follows that comparison's support. Seed
examples 1 (layout) and 2.

### 3. Recognize the recorded agent in the summary

Type: Behavior
Status: planned
Proof: Extend `intent-story-comparison-summary.spec.ts`. A published
comparison by a rotation agent shows that agent's portrait beside the
attribution in the summary. A landed run, or an agent outside the roster,
shows the attribution text and no portrait. Run the frontend `intent`
folder. Budget 10 active minutes.

Behavior: A published comparison with a known agent is open. The summary
shows the agent's portrait beside the attribution. A comparison without a
known agent shows the attribution alone. Seed examples 1 (portrait) and 4.

## Proof map

| Seed promise | Slice |
| --- | --- |
| One-line summary opens full details (time, branch, revisions, attribution or unavailability) | 1 |
| Refresh in details keeps the choice; standalone Refresh removed | 1 |
| Reading, unavailable and failed states with Retry | 1 |
| Files toggle, comparison controls and Include merged changes in one row under the title; narrow wrap | 2 |
| Changing the comparison updates summary and details | 2 |
| Agent portrait when known, attribution alone otherwise | 3 |

## Concern evidence

Refinement was not needed. The three slices each own one proof loop, and
the scratch observation bounded slice 1's consumers. This review found no
remaining slice-specific concern.

## Local gate

Run focused checks and the Dashboard typecheck for each changed boundary.
Run long checks under `caffeinate -s -i` on AC power.
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and select test conventions through [AGENTS.md](../../../AGENTS.md).
