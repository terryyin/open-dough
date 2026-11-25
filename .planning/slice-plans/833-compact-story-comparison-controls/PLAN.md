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
  start of the comparison bar. The story tabs keep their own row, above the bar, until the
  Home story replaces them. Project Intent keeps its toggle in its tab bar.
- Details are collapsed when a story opens. Opening them keeps them open
  across a comparison change and a Refresh, so the keyboard stays on the
  pressed control.
- Reading, unavailable, failed and unreadable states replace the summary
  text in the bar. **Retry** stays in the bar with the failure.
- [IntentPage.tsx](../../../dashboard/src/IntentPage.tsx) (247 lines) and
  [IntentStoryComparison.tsx](../../../dashboard/src/IntentStoryComparison.tsx)
  (237 lines) are near the 250-line check. The bar and its summary go in a
  new `IntentComparisonBar.tsx`. IntentHeader keeps the title rows and
  places the bar under them (slice 1): placing it from IntentPage would
  pass 250 lines, and every Intent page object finds the comparison in the
  "Selected story" header. Slice 2 passes IntentPage's files-toggle state
  into IntentHeader, or moves the bar, keeping both files under 250 lines.
- Intent's comparison details reuse Review changes' `ReviewDetails` and
  the extracted `ReviewDetailsEye`. E2E journeys open them through the
  shared `showComparisonDetails` in
  [intentStoryPage.ts](../../../dashboard/test-support/support/intentStoryPage.ts);
  readers of the details (landed-run heading, follow-up, revisions) use it,
  not only Refresh.
- [Plan 832](../832-choose-review-scope/PLAN.md) removes the header's
  scope crumb controls and also edits `intent-story-changes-gaps`,
  `intent-story-changes-only` and `intent-sidebar-toggle`. Neither story
  depends on the other. Whichever executes second builds on the header the
  first one landed and reruns those specs.

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
Status: done
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

Accepted: the new spec's five cases, the frontend `intent` and `review`
folders, the e2e `intent` and `review` folders and traced consumers passed.
Four e2e timeouts at load ~25–33 passed when rerun alone; branch CI is the
deciding observation. `scripts/test.sh` runs no Playwright specs; e2e
proof runs through `npm run --silent test:e2e -- <files>`.

### 2. Change the comparison from the same row as the files toggle

Type: Behavior
Status: done
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

Accepted: the story tabs now sit between the title rows and the bar, so
the diff starts directly below the bar. The frontend `intent` folder and
40 traced e2e specs passed; two e2e timeouts at load ~20–30
(`intent-done-default-answer-selection`, `story-review-one-shot-choice-races`)
passed when rerun alone, and branch CI decides them.

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

## Story obligations

### G1. The bar wraps at 1280 px when landed runs are offered
Reported: slice 2 — "At 1280 px a landed-run choice's long label (kind, launch time and revision) pushes the summary onto a second row."
Story clause: "change it from one compact toolbar row"
Disposition: proved by slice 2: intent-story-comparison-summary.spec.ts "the files toggle, the comparison choice, Include merged changes and the summary share one row…" asserts one row at 1280×800 with landed runs offered; the in-bar choice label is capped with an ellipsis and keeps its full accessible name

### G2. Story tabs sit between the bar and the diff
Reported: slice 2 — "The story tabs still sit between the bar and the diff, as the plan decided until the Home story replaces them."
Story clause: "The file diff starts directly below the bar."
Disposition: proved by slice 2: the same case asserts the story tabs sit above the bar and the file browser starts directly below it; story tabs keep their own row above the bar

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
Run long checks under [`caffeinate -s -i` on AC power](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and select test conventions through [AGENTS.md](../../../AGENTS.md).
