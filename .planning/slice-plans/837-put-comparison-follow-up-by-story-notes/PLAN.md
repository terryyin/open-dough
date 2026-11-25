# Put comparison follow-up beside story notes

**Source:** [SEED-420](../../seeds/SEED-420-unified-intent-review.md#put-comparison-follow-up-by-story-notes)

**Identity:** SEED-420#put-comparison-follow-up-by-story-notes

## Goal and scope

From Intent's story title, a developer can open the existing follow-up
composer for the published completion or landed run they are reading. The
seed's three examples define the outcome. File and line follow-up, attachment
choices, Story Home, and comparison selection remain with their existing owners.

## Direction and current decisions

- [Dashboard UX/UI North Star, Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent),
  **Sessions and Compare**. A follow-up uses the published or landed
  comparison chosen for this Intent reading, including the widened published
  baseline when shown. [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#domain-concepts-and-relationships)
  keeps that comparison in the review scope and the new follow-up associated
  with the source story.
- Put the control in [IntentHeader](../../../dashboard/src/IntentHeader.tsx)
  beside Notes and remove its previous placement in
  [IntentComparedContext](../../../dashboard/src/IntentComparedContext.tsx).
  [StoryComparisonFollowUp](../../../dashboard/src/StoryAnchoredFollowUp.tsx)
  already reads the selected story and comparison.
  [StartSession](../../../dashboard/src/StartSession.tsx) owns activation,
  dialog focus return, and launch status. Reuse its launcher with the shared
  [IconButton](../../../dashboard/src/Icon.tsx) and the existing follow-up
  glyph for this trigger. Keep the title and both controls together when
  Notes reports an unreadable answer or launch feedback appears.
- Pass the displayed comparison from the summary. Intent can keep the last
  comparison visible during a read. The action follows that visible pair
  while it remains shown and the new pair once shown. The Done record supplies
  the composer subject and serves as the existing admission requirement.
- [The compact comparison bar story](../../seeds/SEED-420-unified-intent-review.md#compact-story-comparison-controls)
  locates the old action in its details. Either delivery order works. If its
  bar has already landed, remove the action from its details. If this story
  lands first, the bar inherits the details as delivered. Check the action
  count in either layout.
- For landed runs, reuse the existing named historical review resolution
  used by the file and line paths. It checks the selected project's story
  against published landing evidence or its retained launch references.
  Share exact pair validation with files and keep path validation in the file
  path. Keep the published whole-comparison wire form and its current
  request key. The landed target adds a reference in the same position as the
  completion identity in the key, with its own kind if needed to distinguish
  forms. The request still identifies the story and exact pair.

## Baseline and consumer trace

Observed at `039473be572d` in the preparation worktree on 25 November 2026
with Node 24.21.0 and the lockfile dependencies. Temporary changes were reverted.

| Premise | Observation |
| --- | --- |
| Intent's follow-up can move without changing the current composer or its payload | Moved the existing control from comparison details to the title row in a scratch edit with its current label. `caffeinate -s -i npm run --silent test:e2e -- --reporter=list intent/intent-story-follow-up.spec.ts review/story-review-follow-up.spec.ts` passed all four cases. The whole-comparison case checks the real first input against Git's published baseline and tree. The other paths exercise file, line, and landed-file follow-up. |
| The change reaches the persistent header's comparison and Notes observations and the shared launch surfaces | The same scratch move ran `caffeinate -s -i npm run --silent test:dashboard:frontend -- intent/ review/ launches/ --reporter=dot`. The group exited successfully. Its mounted Chromium report counted 472 passing cases in 174 files, including the long-title Notes warning, selected comparison changes, and shared launch layout. |
| The landed reference can resolve a file follow-up today, and whole-comparison admission needs a new shape | Sent the same landed fixture's reference, baseline and tree as a whole-comparison request immediately before the existing file follow-up. `caffeinate -s -i npm run --silent test:dashboard:backend -- --reporter=list agent-launch-follow-up-file-admission.spec.ts agent-launch-follow-up-published-range-admission.spec.ts` passed eight cases. The whole request returned 400 before starting Claude, the file request sent the landed pair, and the existing published whole request for a different tree was refused. |
| Historical file consumers use the admission being shared | `caffeinate -s -i npm run --silent test:dashboard:backend -- --reporter=list story-review-file-text-admission.spec.ts` passed. It opens a landed review and gets file text and printed diff through actual HTTP using the returned reference and pair. |

The installed consumer trace searched for `StoryComparisonFollowUp`,
`Follow up on comparison`, `followUpComparison`, `intent-story-title-line`,
`publishedBaseline`, `publishedCompletion`, `storyHeaderDetail`,
`intent-story-revisions`, `useDoneStoryFollowUp`, `admitHistoricalReviewedFile`,
`admitPublishedStoryComparison`, `requireLandingFile`, `followUpTargetItems`
and `sameFollowUpSource`. Run the frontend and E2E readers and the HTTP
admission routes listed in the slices. The title and baseline observations in
`intent-story-completed` and `recently-done-sessions-select-ad-hoc-review`
are enclosing header readers. The standalone published-session file route
continues to share its existing file-membership check. Historical planning
mentions and readiness fixture matches have no dependency on comparison
launcher placement or historical admission. Update the trace with the actual
diff when implementing.

## Ordered slices

### 1. Open the published comparison's follow-up beside Notes

Type: Behavior
Status: planned

Behavior: The Done story's readable published comparison offers one
accessible icon beside Notes. The keyboard opens the existing composer, which
shows the story and the displayed baseline/result, and Cancel returns focus
to the icon. Notes and the comparison icon fit beside a long title at narrow
width. When there is no shown eligible comparison or selected Done story,
the title has no comparison follow-up.

Proof: Use the mounted Intent path from
[intent-story-perspective.tsx](../../../dashboard/frontend-tests/intent/intent-story-perspective.tsx)
with the same selected work context as PageFrame, typed Done and review reads,
and the mounted launch recorder. The Done fixture supplies a readable
completion, optionally a wider baseline. Check the title row, one name and
icon with no visible label text, open and cancel by keyboard, and assert the
composer and outgoing request pair after changing the merged choice. Check
the unavailable variants through the same Intent entry point. Use the
published and line/file E2E journey to retain its independent host-input
observations, updating the button locator in
[intentStoryPage.ts](../../../dashboard/test-support/support/intentStoryPage.ts).
Run `npm run test:dashboard:frontend -- intent/ review/ launches/` and
`npm run test:e2e -- intent-story-follow-up story-review-follow-up intent-story-completed recently-done-sessions-select-ad-hoc-review`.
Budget 15 active minutes.

### 2. Start a follow-up from the selected landed run

Type: Behavior
Status: planned

Behavior: A developer switches from the published completion to a readable
landed run of the same Done story, opens the title action and starts a
follow-up. The composer and the host's first input identify the landed run
and its exact pair. A reference outside the story's runs or a mismatched pair
is refused before launch.

Use the comparison contract in
[followUpRequest.ts](../../../dashboard/src/followUpRequest.ts) and keep
[followUpAdmission.ts](../../../dashboard/server/followUpAdmission.ts) on
the story's historical review path. Give named landed resolution and its
pair check a cohesive home alongside
[storyReviewHistoricalFileAdmission.ts](../../../dashboard/server/storyReviewHistoricalFileAdmission.ts)
(248 lines). The existing story file admission and session file admission
retain their public entry points and file membership checks. Both the file
and whole-comparison callers use the same recorded/cache or retained-launch
resolution where they share a named historical run.

Proof: Extend the retained landed choice journey in
[story-review-follow-up.spec.ts](../../../e2e/review/story-review-follow-up.spec.ts)
or reuse its fixture from the Intent follow-up journey. Assert the landed
pair in the composer and first input from the retained Git facts, with a
different pair from the published completion. Keep the existing file
observation. At the HTTP launch boundary, use the real review repository and
Done catalog, with a reported run for the target story and a reference owned
by another story. Check admitted pairs for the retained launch and published
landing routes. Check a wrong baseline, wrong result and foreign reference
against otherwise valid Done-story requests. Assert each refusal and no
host call. Run `npm run test:dashboard:backend -- launches/agent-launch-follow-up review/story-review-file-text-admission.spec.ts review/story-review-state-admission.spec.ts review/published-session-review.spec.ts`
and rerun the affected frontend and E2E checks from slice 1. Budget 15 active
minutes.

## Proof map

| Seed promise | Slice |
| --- | --- |
| One accessible icon beside Notes, clean comparison details, and keyboard focus return | 1 |
| Published or widened comparison preview and outgoing pair | 1 |
| No action without an eligible shown comparison or selected Done story | 1 |
| Switching to a landed run supplies its own readable pair, through launch | 2 |
| Admission proves story ownership and exact comparison, with refusals before launch | 2 |
| Existing file and line paths and composer choices continue to work | 1, 2 |

## Concern evidence

Plan refinement was unnecessary because the first slice has one placement
and activation outcome and the second has one exact landed-pair outcome.
Each uses the same composer and historical comparison model. This review
found no remaining slice-specific concern.

## Local gate

Run the named checks and Dashboard typecheck for the changed boundaries.
Run long checks under [`caffeinate -s -i` on AC power](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
and apply the test conventions selected through [AGENTS.md](../../../AGENTS.md).
