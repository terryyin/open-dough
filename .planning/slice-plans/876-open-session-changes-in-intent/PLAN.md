# Open session changes in Intent and retire the Side panel review

**Identity:** SEED-418#select-a-story-session-for-review

**Source:** [Open session changes in Intent and retire the Side panel review](../../seeds/SEED-418-review-published-session-changes.md#select-a-story-session-for-review)

## Goal and scope

A developer reviewing one session's contribution lands on it in Intent, from
any machine with the project repository, and moves between that session and
the whole story in the same view. The Side panel keeps only terminals and
final reports, as
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
already names it. The seed's Scope and Key examples are the acceptance source.

Excluded: the compact scope dropdown, the selected session's details on
Intent Home, per-session review status, combined sessions and expired-record
recovery (later SEED-418 stories), and any phone-specific Intent layout to
replace the Side panel review's touch panes.

## Current findings

Read at `0bff20a80`.

- Only **Review session changes** still opens the Side panel review:
  `PublishedSessionReviewAction` in `dashboard/src/PublishedSessionEntry.tsx`,
  used for a retained session with a published record and for a published
  session without a retained launch (`dashboard/src/RecentlyDoneEntry.tsx`).
  It goes through `useOpenSessionReview` (`pageSessionReviews.ts`) to the
  `session-review` kind of `pageSidePanel.ts` and `<StoryReview>` in
  `PageFrame.tsx`. A Story card's **Review changes** already opens Intent
  through `useOpenStoryChanges` (`pageStoryReviewOpening.tsx`).
- Intent's comparison (`useIntentStoryLens.ts` → `useStoryComparison.ts`)
  builds a `ReviewedStorySubject` only. The selection hook under it,
  `useStoryReviewSelection.ts`, and `storyComparisonShown.ts` already accept
  the published-session subject and its `published-session` review (with
  `ranges`, `selectedRun` and `session.shared`). The review endpoint is
  `GET /__agent-launch/review?…&published=<uuid>[&run=<n>]`
  (`dashboard/server/publishedSessionReview.ts`).
- A published record always has at least one range
  (`publishedSessionRecord.ts`), so "a session without a recorded landing" is
  a session known only from this machine's launches with no published record.
  The record carries `workflow`, `story` and `closedAt` for naming.
- `storyFollowUpSessions` (`followUpSessions.ts`) merges retained launches and
  published records once per session by reporting reference, but skips ad hoc
  follow-up launches because it lists follow-up targets. The page's published
  records reach Intent through `RecentlyDoneLinkSources` (`PageFrame.tsx`),
  as Intent's Follow up already reads them.
- Intent's Proof takes a selected revision range through
  `storyCiEvidenceOptionsOf` (`IntentStorySummary.tsx`) for a chosen landed
  run of a completed story; `IntentCiEvidenceProvider` reads it for Done and
  Taken comparison targets only.
- Side-panel-only code: `StoryReview.tsx`, `StoryReviewBody.tsx`,
  `StoryReviewHeading.tsx`, `StoryReviewSnapshotView.tsx`,
  `StoryReviewWorkarea.tsx`, `ReviewFilesDrawer.tsx`,
  `reviewFileSidebarWidth.ts`, `pageSessionReviews.ts`,
  `story-review-touch.css`, `story-review-workarea.css` and part of
  `story-review.css`. Its tests: 9 specs in `dashboard/frontend-tests/review/`
  (`published-session-subject`, `story-review-details`,
  `-diff-syntax-hint-reads`, `-files-divider`, `-files-divider-kept`,
  `-files-drawer`, `-toolbar-truthful`, `-toolbar-truthful-gaps`,
  `-touch-height`) with `story-review-panel-page.ts`,
  `navigation/story-destination-repeat-cue.spec.ts`, and E2E
  `review/story-review-panes`, `-touch`, `-narrow-files`, `-diff-context`
  (through `support/reviewPanes.ts`), `intent/intent-published-range-source`,
  `sessions/recently-done-published-sessions`, and parts of
  `navigation/side-panel-content-switching`, `-replacement` and
  `sessions/admitted-session-completion`. Page objects only it uses:
  `storyReviewPages.ts`, `sessionRunSwitchPages.ts`, `reviewToolbarPages.ts`,
  `support/reviewPanes.ts`, `support/storyReviewTouchJourney.ts`,
  `support/storyReviewTouchContext.ts`, the Side panel half of
  `reviewChangesPage.ts` (`assumeReviewChanges`, `reviewChangesAfter`,
  `openPublishedSessionReviewChanges`, `publishedSessionReviewControl`) and
  the story-review part of `sidePanelPages.ts`.

## Current decisions

- **One session model.** A session scope is the published-session subject
  `{source, identity, published: <uuid>}`. Its comparison is the published
  record's range; several ranges are the session's recorded runs, chosen by
  the existing `PublishedRangeSwitch`. A retained session with no published
  record stays chosen and says it published no comparison; it reads nothing.
  No second local-launch session reader is added.
- **Session list.** One function lists a story's completed sessions from this
  machine's retained launches and the published records, once per session
  (by reporting reference = published UUID), including ad hoc follow-ups and
  sessions closed after completion, oldest first. Generalize from
  `storyFollowUpSessions` rather than adding a parallel merge; Follow up
  keeps its own exclusion of follow-up launches as a filter over that list.
  Each session is named by its workflow name (`launchKindName`) and its
  launch time when retained, otherwise its close time.
- **Scope state.** The chosen scope belongs to the Selected story in its
  project: a new Selected story, or an opening from a Story card, starts at
  **Whole story**; an opening from **Review session changes** carries that
  session. Carry it on the existing story-review opening
  (`pageStoryReviewOpening.tsx`) and the comparison's keyed state, not a new
  page context.
- **Proof.** A chosen session's selected range feeds the existing selected
  range evidence (`storyCiEvidenceOptionsOf`). Where Intent shows no CI
  comparison for the story (a queued story), Proof stays as it is.
- **Retirement.** After slice 6 no Dashboard action opens the Side panel
  review. Slice 7 then deletes its code, styles, tests, page objects and
  documentation, and removes shared review options that existed only for it
  (for example the Side panel files drawer and toolbar `browser` option,
  the `session-review` panel kind, and the published-session heading). The
  shared components named under Current findings stay where Intent uses
  them.
- Story Branch Mode or Trunk Mode is chosen at Take; no slice acts from trunk.

## Learnings

- Slice 1: `publishedSessionScopes` (`followUpSessions.ts`) lists a story's
  published sessions oldest first; `useStoryComparison.ts` keeps a second
  `useStoryReviewSelection` for the chosen session so the story's
  `defaultReview` (historical locations, CI evidence) stays the story's.
  Published records name their workflow by skill; `sessionWorkflowName`
  (`launchWorkflow.ts`) maps it. Published records reach Intent through
  `useCurrentPublishedSessions` (`recentlyDoneShownLinks.ts`).
- E2E records written with `trunkAdvancedWith` need the tip published with
  `publishCommittedOrigin(..., follows: true)`.
- Slice 2: `useStorySessionScope.ts` owns the chosen session, the list
  (`storySessionScopes`, launch-only sessions keyed by `followUpSessionKey`
  so a later published record merges), its review selection, `ranges` and
  the no-comparison explanation. The launch-only case has frontend proof
  only. Untested: the story's chosen run surviving a session visit.
- Slice 3: `sessionEvidenceOf` (`IntentStorySummary.tsx`) turns a chosen
  session into `selectedRange`, or a `selectedRangeGap` worded by
  `comparisonGapOf`; `SelectedComparisonEvidence` is `measured` or
  `unmeasured`. A chosen session never measures the whole story.
- Slice 4 needed no product change: Intent's diff already carries the
  session's comparison into `fileFollowUpTarget`. `ReviewDiffs` gained
  `followUpFromFile` and `followUpFromLine`; slice 7 removes the Side panel's
  own `ReviewChanges.followUpFromLine`.
- Plan refined during the routing slice (then 5, now 6): the Side panel
  frame specs used the review as content, so routing alone failed 11 cases.
  The frame move became slice 5, delivered before the routing; the
  unreachable review specs' deletion moved into slice 6. The routing slice
  kept its 12 active minutes; its uncommitted work stays in the checkout.
- Slice 5 uses a running session's terminal, not a final report: only the
  terminal (and the review) render Maximize/Restore, which five frame cases
  use. To keep the slice-5 commit green, `side-panel-width-review-mount.ts`
  holds the review mount unchanged and `panel` matches
  `/^(Terminal|Session review)$/`. Slice 6 deletes that mount and its
  re-export from `side-panel-width-view.ts` and narrows `panel` to
  `"Terminal"` exactly. Refactor pass skipped for slice 5: test-only change
  to its subject specs and their view; the transitional mount is removed by
  slice 6.
- Slice 6: an opening from **Review session changes** carries the session
  on `pageStoryReviewOpening.tsx`; it becomes the keyed initial scope. Intent
  opening helpers live in `intentReviewChangesOpening.ts`; `ReviewComparison`
  owns `expectSessionChosen`. `reviewChangesAfter` and
  `Board.expectPublishedReviewFocused` are already gone. Slice 7 also removes
  `support/reviewPanes.ts` `openLargeReview`, `storyReviewTouchJourney.ts`,
  `storyReviewTouchContext.ts`, `assumeReviewChanges` and its callers, and
  the stale header comment in `reviewChangesPage.ts`.
- `e2e/sessions/admitted-session-completion.spec.ts:91` timed out at 31 s in
  a combined four-spec rerun at load 24–29 and passed alone in 22 s (13.8 s
  earlier at lower load); its setup is unchanged by slice 6. Published on
  targeted proof with the branch CI verdict deciding; a CI timeout there is
  this execution's repair.
- Slice 7's shared-code audit decides the name of `followUpSessions.ts` and
  `FollowUpSession`, which now hold a story's sessions in general (a rename
  reaches `dashboard/server/followUpStory.ts`, `followUpAdmission.ts`).

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| A published session is reviewed by UUID, with its ranges and shared-checkout warning, on a machine without its launch | The review endpoint read every session slice uses | `OPEN_DOUGH_E2E_PROOF_RECORD=<tmp> caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:e2e -- e2e/sessions/recently-done-published-sessions.spec.ts` at `0bff20a80`, 27 Nov 2026, load ~20–29 | Exit 0, proof record phase completed, 2/2 selected. Covers range 1 vs 2 exclusion, trunk moving on, de-duplication with a local launch, and the shared-checkout warning. The UI consuming it changes from Side panel to Intent in slices 1–2; the endpoint does not. |
| Intent reads the page's published records for the Selected story's project | Slice 1's session list | Read: `PageFrame.tsx` wraps Intent in `RecentlyDoneLinkSources` with `stories.work`; Intent Follow up builds its candidates from it (`FollowUp.tsx`) | Same reader and context as Intent's existing Follow up candidate list; no new read. |
| Intent's comparison shows a `published-session` review | Slices 1–2 | Read: `storyComparisonShown.ts` returns a shown comparison for that kind; the Side panel review renders it through the same shared file tree and diff | Implementation work owned by slice 1's proof, not an unobserved current-state claim. |

## Ordered slices

### 1. Choose one published session as Intent's review scope
Type: Behavior
Status: done

Behavior: A Done story has two refinements, an execution and an ad hoc
follow-up published from another machine, and this machine has no launch of
them → the developer selects the story, opens Intent and chooses the second
refinement under **Sessions** → the comparison summary names that refinement
and the diff lists only its files; choosing **Whole story** returns to the
story comparison with its existing choices. Repeated refinements are named
apart; a session also known from a local launch appears once.

Proof: Frontend specs beside `intent-story-compare-done.spec.ts` with review
answers keyed by `published`: the Sessions list (names, once per session,
oldest first, ad hoc follow-ups included), choosing a session reads by UUID,
Whole story returns, a new Selected story resets to Whole story. A new E2E
`e2e/intent/intent-session-scope.spec.ts` publishes the four sessions on an
origin with empty launch storage and asserts the second refinement's diff
excludes the others' files.

### 2. Show a session's recorded runs and shared-checkout warning in Intent
Type: Behavior
Status: done

Behavior: A chosen session recorded two ranges, or shared its checkout, or
is known only from a retained launch → Intent offers both runs under the
session and shows the chosen one; shows the shared-checkout warning in the
comparison details; or keeps the session chosen and says it published no
comparison, without falling back to the story.

Proof: Frontend Intent compare specs for the range choice, the warning and
the no-record explanation. Extend `intent-session-scope.spec.ts`, or move the
two cases of `e2e/sessions/recently-done-published-sessions.spec.ts` into
Intent journeys, so range 1 vs range 2 exclusion, trunk moving on, and the
shared-checkout warning are observed in Intent.

### 3. Proof follows the chosen session's range
Type: Behavior
Status: done

Behavior: A Done story's chosen session has a recorded range → Intent's CI
comparison measures that range's base and candidate as its selected range;
Whole story restores the story comparison.

Proof: A frontend spec beside `intent-story-compare-evidence.spec.ts`
asserting the selected range the CI evidence reads for a chosen session and
its chosen run.

### 4. Follow up from a session scope uses its exact comparison
Type: Behavior
Status: done

Behavior: A session is chosen in Intent on a second machine → file and line
Follow up start with that session's published comparison and the chosen
range; a stale line explains the unavailable source and returns to the file.

Proof: Move `e2e/intent/intent-published-range-source.spec.ts` (two cases) to
open the session through Intent's Sessions choice instead of the Side panel,
keeping its composer and first-input assertions.

### 5. Side panel frame specs show a final report
Type: Structure
Status: done

Change: `dashboard/frontend-tests/navigation/side-panel-width-view.ts` opens
a finished session's final report instead of the Side panel review, so
`side-panel-width`, `-kept`, `-covering` and `board-scroll-side-panel` keep
observing the Side panel frame (width, kept width, covering, board scroll)
with content that stays after slice 7. Drop assertions that only make sense
for the review (files toggle, review read counts). Inserted before the
routing slice: slice 6's routing removed the review these specs used as
content (11 cases failed, `s5-fe-width.log`), and they must stay green on
their own.

Proof: The four frame specs pass at this slice's commit with the review
still reachable; frontend `navigation/` stays green.

### 6. Review session changes opens Intent at that session
Type: Behavior
Status: done

Behavior: A Done card shows **Review session changes** for a retained or
published session → activating it selects the story, shows Intent and
chooses that session; no Dashboard action opens a code review in the Side
panel; a running session's terminal and a finished session's final report
still open there.

Slice 6 also deletes the specs that can no longer reach the Side panel
review (moved from slice 7, so slice 6 commits green); slice 7 keeps the
code, styles, page objects and documentation.

Proof: Point `openPublishedSessionReviewChanges` in `reviewChangesPage.ts`
at Intent and run `e2e/sessions/recently-done-published-sessions.spec.ts`,
`e2e/sessions/admitted-session-completion.spec.ts`,
`e2e/navigation/side-panel-content-switching*.spec.ts` and
`-replacement*.spec.ts`, with their Side panel review steps rewritten to the
Intent destination and the terminal and report steps kept.

### 7. Remove the retired Side panel review and its dual-UI options
Type: Structure
Status: planned

Change: Delete the Side-panel-only code, styles, specs and page objects
listed under Current findings, the `session-review` panel kind and its
routing, and the Side panel review's mention in documentation. Then remove
shared review options, branches and abstractions that served only the
Side panel (search `StoryReview`, `SessionReviewsOnPage`, `session-review`,
`ReviewFilesDrawer`, `reviewFileSidebarWidth`, `story-review-touch`,
`assumeReviewChanges`, `reviewChangesAfter`, `publishedSessionReviewControl`
across `dashboard/`, `e2e/`, `docs/`). Separated from slice 6 to keep its
routing change recoverable; it completes slice 6's change with external
behavior unchanged.

Proof: Old symbols and paths are gone; `npm run typecheck:dashboard`,
`npm run lint`, and the review family below stay green.

## Proof ownership and local gate

| Promise (seed) | Slice |
| --- | --- |
| Review session changes opens Intent at that session, without local history | 6 (with 1 for the scope) |
| Sessions: Whole story default, each completed session once, repeated refinements named | 1 |
| Session's recorded runs selectable; session without a landing stays chosen | 2 |
| Source, diff use the selection | 1, 2 |
| Proof uses the selection | 3 |
| Shared-checkout warning; exact published ranges | 2 |
| File and line Follow up | 4 |
| Whole story keeps its choices | 1 (existing `intent-story-compare-*` specs stay green) |
| Side panel review removed; terminal and report remain | 5, 6, 7 |

Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run focused specs at each slice with
`npm run test:dashboard:frontend -- <files>` and
`OPEN_DOUGH_E2E_PROOF_RECORD=<tmp> caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:e2e -- <files>`,
plus `npm run typecheck:dashboard`. Because slice 7 changes shared review
code, run the review family before landing: frontend `review/` and `intent/`
(`intent-story-*`), and E2E `e2e/review/`, `e2e/intent/`, `e2e/sessions/`
and `e2e/navigation/side-panel-*`, on awake macOS on AC under
`caffeinate -s -i` per [AGENTS.md](../../../AGENTS.md).

## Story obligations

### G1. Story's chosen run after a session visit untested (first reported in slice 1)
Reported: slice 3 — "No spec checks that a story's chosen run is still chosen after visiting a session."
Story clause: "**Whole story** keeps today's story comparison choices: Published completion, its landed runs, and Include merged changes."
Disposition: proved by slice 3: `dashboard/frontend-tests/intent/intent-story-compare-session-evidence.spec.ts` "Whole story keeps the story's chosen landed run after a session visit" chooses a landed run, a session, then Whole story and observes the run still checked and its range measured; Include merged changes is keyed state beside the run (`useStoryComparison.ts`) that a session choice does not reset.

### G2. Proof measures the whole story for a session without a published comparison
Reported: slice 3 — "Proof and CI comparison stay on the story's measurement and show the existing \"Describes the whole story\" note."
Story clause: "Choosing it keeps it chosen and says it has no recorded comparison, rather than falling back to the story."
Disposition: proved by slice 3: `dashboard/frontend-tests/intent/intent-story-compare-session-evidence.spec.ts` "a session without a published record measures nothing and says so; Whole story measures the story again" observes the explanation, no story measurement or whole-story note, and no range read (red-checked in `s3b-red.log`).

### G3. Launch-only session has no E2E observation
Reported: slice 2 — "no e2e covers this case; the frontend spec is its only proof."
Story clause: "A session without a recorded landing stays chosen and explains that it has nothing to compare."
Disposition: proved by slice 2: `dashboard/frontend-tests/intent/intent-story-compare-session-runs.spec.ts` "a session known only from a launch here stays chosen and published no comparison" mounts Intent with a retained launch and no record and observes the chosen radio, the explanation and zero published reads; the launch store is a browser-local input the frontend boundary owns.

### G4. File Follow up from a chosen session not observed
Reported: slice 4 — "no test opens Follow up from the file header with a session chosen."
Story clause: "File and line Follow up use the shown comparison."
Disposition: proved by slice 4: `e2e/intent/intent-published-range-source.spec.ts` "a second machine follows up on the exact published file" chooses the session and range 2 in Intent with no local launch, opens Follow up from the file header and observes the composer and Claude's first input carrying that session's range-2 comparison.

### G5. Side panel frame specs and review specs fail once nothing opens the review (first reported in slice 6, then numbered 5)
Reported: slice 6 — "11 frontend cases now fail in specs that are not on slice 6's deletion list."
Story clause: "The Side panel's terminal and final report stay as they are."
Disposition: proved by slice 6: `dashboard/frontend-tests/navigation/side-panel-width*.spec.ts` and `board-scroll-side-panel.spec.ts` observe the frame on a running terminal (`s6-fe.log`); `e2e/navigation/side-panel-content-switching.spec.ts` and `side-panel-content-replacement.spec.ts` observe the terminal and final report still opening in the Side panel beside Intent (`s5-e2e-c.proof.json`); specs whose only subject was the Side panel review are deleted.

## Plan review

Each slice owns one outcome and proof loop; seven slices are within the
limit. Slice 5 was inserted during execution (see Learnings) so the Side
panel frame specs stay green independently of the routing. Slice 7 is
Structure that finishes slice 6's retirement rather than preparing a later
Behavior; it is separated only for recovery.
