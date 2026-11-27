# Track review status for each session

**Identity:** SEED-418#track-review-state-per-session

**Source:** [Track review status for each session](../../seeds/SEED-418-review-published-session-changes.md#track-review-state-per-session)

## Goal and scope

A developer can see, on this machine, whether a story's completed sessions
are all, partly, or not yet reviewed, and can mark or unreview one session.
The seed's Scope and Key examples are the acceptance source.

A story saved as reviewed at time T covers every reviewable session completed
at or before T, including one this machine learns about later. A session
completed after T starts unreviewed. One session's own mark replaces that
credit for that session only. Unreviewing the story removes the saved mark.

Excluded: review status in Intent, the scope dropdown, and Intent Home;
combined review of several sessions; a separate status per landed run;
recovery of expired records. Open sessions are not marked. Marks stay on
this machine and are not published, as
[ADR 0008 — Durable project state and local operational state](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
already separates this judgment from published project facts.
[Review in Intent](../../../docs/dashboard-ux-ui-north-star.md#review-in-intent)
does not bear on these slices: they do not open Intent or change a comparison.

## Current findings

Read at `d520b57b7ca2`. PFE: the review judgment already lives in one
machine-local store and one control. Change that solution. Do not add a
second store or a published fact.

- `~/.open-dough/dashboard/story-review-states.json`, by project id and story
  identity, holds `{ reviewedAt }` (`dashboard/server/storyReviewStates.ts`).
  An entry means the story is reviewed. A missing or unreadable file reads
  as nothing reviewed. GET/POST
  `/__project-configuration/story-review-states` answers
  `{ reviewed: storyIdentity[] }` (`dashboard/src/storyReviewState.ts`).
- The Done card's **Mark as reviewed** / **Reviewed** control is
  `StoryReviewStateAction`. **Reviewed** asks "Unreview this story?" before
  clearing. A failed save leaves the last saved state and says the review
  state could not be saved. The action does not change selection or the Side
  panel.
- Recently done session rows show **Needs review** when the story is not in
  that set (`SessionsSidebarSessionEntry.tsx`). The words name the story.
- A done card lists retained completed sessions and follow-ups, and published
  sessions with no retained launch. A retained launch and its published
  record are one entry, matched by `reportingReference`
  (`RecentlyDoneEntry.tsx`, `sessionListing.ts`). Published completion is
  `closedAt`; retained completion is `doneAt`.
- Expected edits are under 250 lines (`SessionEntry.tsx` is 241,
  `SessionsSidebarSessionEntry.tsx` is 221). No file this work expects to
  edit is already over the file-size check.

## Current decisions

- **One rule.** A reviewable session is reviewed when it has an explicit
  reviewed mark, or when it has no explicit mark and its completion is at or
  before the story's saved `reviewedAt`. Otherwise it is unreviewed. An
  explicit unreview wins over `reviewedAt`. The story card shows **Mark as
  reviewed** when none of the current reviewable sessions are reviewed,
  **Partially reviewed** when some are, and **Reviewed** when all are. With
  no reviewable session, a saved `reviewedAt` shows **Reviewed** and clearing
  it shows **Mark as reviewed**.
- **Same store and endpoint.** Session overrides sit beside the story's
  `reviewedAt` in the existing document. The story card, the session
  entries, and the sidebar cue all ask this one rule. **Mark as reviewed**
  on the story sets `reviewedAt` to now and clears explicit overrides for
  that story. **Unreview this story?** removes `reviewedAt` and those
  overrides.
- **One session.** The stored identity is the published session id when the
  session has one (the published record's `sessionId`, or the retained
  launch's reporting reference); otherwise the retained host and session id.
  Completion is `closedAt` when a published record is present, and `doneAt`
  otherwise.
- **Where the control lives.** The session's **Mark as reviewed** /
  **Reviewed** control is its own module, composed into the retained entry
  and the published-only entry, as `StoryReviewStateAction` is composed into
  the story card. It asks "Unreview this session?" and follows the story
  control's confirm, failure, focus, and 44px touch height.
- **Interim.** Until slice 2, only the story control writes a mark. Slice 2
  adds the per-session control and is the slice that removes that limit.
- Story Branch Mode or Trunk Mode is chosen at Take. No slice acts from trunk.

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Marking a story reviewed, cancelling unreview, and unreviewing it keep the card, its sessions, selection, and keyboard on the action | Slice 1's story control | `npm run --silent test:dashboard:frontend -- dashboard/frontend-tests/stories/recently-done-review-state-mount.spec.ts dashboard/frontend-tests/sessions/recently-done-review-cue-mount.spec.ts dashboard/frontend-tests/sessions/recently-done-card-membership-mount.spec.ts` at `d520b57b7ca2`, 27 Nov 2026 | Exit 0, 17/17. The mount store is the in-memory stand-in of the read source, not the JSON file. |
| A story mark updates every matching Recently done row's **Needs review** cue, and the cue is absent once the story is reviewed | Slice 1's cue | Same frontend command, `recently-done-review-cue-mount.spec.ts` | Passed in that run. The accessible description matches `Needs review` and `not been marked reviewed on this machine`. |
| A published follow-up and its retained launch are one done-card entry | Slice 1's single identity | Same command, `recently-done-card-membership-mount.spec.ts` "shows one entry, on its source card" | Passed. The fixture pairs them by `reporting.reference` equal to the published `sessionId`, and the published list on the card is absent. |
| A saved review document round-trips the story identity, and a document that is not that shape reads as nothing reviewed | Slice 1's store | This worktree has no `node_modules/playwright/cli.js`, so `npm run test:dashboard:backend -- dashboard/backend-tests/review/story-review-state-admission.spec.ts` exited 1 before a test. The same spec was run as `node /Users/terryyin/git/open-dough/node_modules/playwright/cli.js test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/review/story-review-state-admission.spec.ts` from this checkout at `d520b57b7ca2`, 27 Nov 2026. The CLI is that revision's Playwright; the config, spec, and server are this checkout. | Exit 0, quiet pass. GET with nothing saved returns `{ reviewed: [] }`. A POST save returns `{ reviewed: [identity] }`, the file's project object has that identity as a key, and the following GET returns it. The store schema that accepted the re-read requires `reviewedAt`. A non-document reads as `{ reviewed: [] }` until the next save moves it aside. |

## Ordered slices

### 1. A story mark covers the sessions completed by then
Type: Behavior
Status: done

Behavior: A story has two retained completed sessions and a published
session with no launch. With no saved mark, the story offers **Mark as
reviewed** and each completed session shows **Needs review** naming that
session. A mark at T leaves a session completed before T reviewed and one
completed after T unreviewed, and the story shows **Partially reviewed**,
**Reviewed**, or **Mark as reviewed** as those sessions fall. **Mark as
reviewed** saves T as now, so the sessions completed by then are reviewed
and one that completes afterwards starts unreviewed. **Unreview this
story?** removes the mark: current sessions are unreviewed, and a published
session from before the old mark that loads afterwards is unreviewed too. A
story with no reviewable session shows **Reviewed** after **Mark as
reviewed**, then offers **Mark as reviewed** once a later session completes.
A retained session and its published record count once. An open session has
no review control and no **Needs review** cue. A failed save leaves the last
saved statuses. A successful mark survives reload and a dashboard restart,
and the repository is unchanged. Opening a comparison does not mark a story
reviewed.

Proof: Extend `recently-done-review-state-mount.spec.ts`,
`recently-done-review-appearance-mount.spec.ts`, and
`recently-done-review-cue-mount.spec.ts` for the partial label, the session
cue, a session completed after the mark, and the empty story. Extend
`recently-done-card-membership-mount.spec.ts` so a published-only session
counts in that summary and a paired launch counts once. Extend
`story-review-state-admission.spec.ts` so the saved story entry keeps
`reviewedAt` and a session override is not required for this slice. Update
and run `e2e/stories/recently-done-review-state-persistence.spec.ts`,
`recently-done-review-state-failed-save.spec.ts`,
`recently-done-review-state-refresh.spec.ts`,
`e2e/sessions/recently-done-sessions-review-cue-ad-hoc.spec.ts`, and
`e2e/review/story-review-completed.spec.ts`.

Accepted proof (27 Nov 2026, uncommitted candidate on `5e2e6e355`):
frontend mount specs `recently-done-review-{state,appearance,coverage}-mount`,
`recently-done-review-cue-mount`, `recently-done-card-membership-mount` 27/27,
and the moved pairing's consumers `recently-done-{read-gaps,expired-published-sessions,published-counterpart}` 6/6.
The backend admission spec passed, as did `npm run typecheck:dashboard`. The
e2e specs ran with strict status passed, 9/9: the five planned ones plus
`e2e/sessions/recently-done-published-sessions.spec.ts` and
`e2e/intent/intent-session-scope.spec.ts`, which the refactor reached.

Learnings for slice 2:
- The endpoint now answers `{ stories: { [identity]: { reviewedAt } } }`. The
  rule lives in `dashboard/src/storyReviewStates.ts`
  (`sessionReviewed`, `storyReviewStatus`).
- `dashboard/src/recentlyDoneListing.ts` holds `pairedPublished` and
  `reviewableCompletions`, one place for "a retained session and its
  published record count once."
- In a partly reviewed story, **Partially reviewed** is a text badge beside
  **Mark as reviewed**, not the button's label.
- `recently-done-review-coverage-mount.spec.ts` changes the mount's answer
  mid-test for sessions arriving after a mark.

### 2. Mark or unreview one session
Type: Behavior
Status: planned

Behavior: A story has two completed sessions covered by T. **Mark as
reviewed** is not on a session yet until this slice. Marking the first
session's entry shows **Reviewed** on that entry and no **Needs review**
cue; the second stays unreviewed and the story shows **Partially reviewed**.
Unreviewing the second after both are reviewed returns the story to
**Partially reviewed** and leaves the first reviewed. **Reviewed** asks
"Unreview this session?"; Cancel leaves it reviewed. An explicit unreview
of a session completed before T stays unreviewed while another session
completed before T stays reviewed. **Mark as reviewed** on the story then
marks every current reviewable session. The same control is on a
published-only entry. A retained session and its published record share one
mark. A failed save leaves the last saved status. The action keeps the
keyboard on the control that remains, does not change the selected story or
the Side panel, and offers the shared 44px height on a touch screen.

Proof: Extend the slice 1 frontend specs and
`recently-done-sessions-review-cue-ad-hoc.spec.ts` for one session's mark
and unreview. Extend `story-review-state-admission.spec.ts` so an explicit
session mark survives a story `reviewedAt` that would otherwise cover it,
and clearing the story removes it.

## Proof ownership and local gate

| Promise (seed) | Slice |
| --- | --- |
| Story shows none, **Partially reviewed**, or **Reviewed** from its current reviewable sessions | 1 |
| A mark at T covers sessions completed then, including one learned later; a later completion starts unreviewed | 1 |
| Unreviewing the story removes that credit | 1 |
| A story with no reviewable session can be marked, and a session completed afterwards starts unreviewed | 1 |
| One status for a retained launch and its published record | 1, 2 |
| **Needs review** follows the session and names it | 1 |
| Mark or unreview one session, including an override of T | 2 |
| Failed save leaves the last saved status; a successful mark survives reload and restart; the repository is unchanged | 1 |
| Marking does not change selection or the Side panel | 1, 2 |

Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run focused specs at each slice with
`npm run test:dashboard:frontend -- <files>`,
`npm run test:dashboard:backend -- <files>`, and, for the end-to-end files,
`OPEN_DOUGH_E2E_PROOF_RECORD=<tmp> caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:e2e -- <files>`,
plus `npm run typecheck:dashboard`. The local gate is those focused commands
on an awake machine on AC power under `caffeinate -s -i`, per
[AGENTS.md](../../../AGENTS.md). This worktree's backend command needs the
checkout's Playwright installed; the premise row records the equivalent CLI
used while it was missing.

Consumer trace at `d520b57b7ca2` with `--base HEAD` and terms `Mark as reviewed`,
`Needs review`, `story-review-states`, and `StoryReviewStatesReadSource`.
The derived term `not-refined` is excluded: it came off this story's state
block and names the refinement vocabulary, not review marks. Historical
`.planning/done` reports, evaluation overlays, and other seeds are excluded
for the same reason. Reached consumers:

| Consumer | Disposition |
| --- | --- |
| `storyReviewStates.ts` (server), `storyReviewState.ts`, `storyReviewStates.ts`, `storyReviewStatesReadSource.ts`, `pageReads.tsx`, `StoryReviewStateAction.tsx`, `SessionsSidebarSessionEntry.tsx` | run in slice 1; session control added in slice 2 |
| `story-review-state.css`, `recently-done-review-appearance-mount.spec.ts` | run in slice 1; the outstanding and reviewed actions keep their contrast |
| Review-state mount, cue mount, card-membership mount, admission spec, `doneStoryReviewPage.ts`, `recentlyDoneReviewState.ts`, `recentlyDoneSessionsSidebarPage.ts` | run in the slice that changes the assertion |
| `board-frame-mount.ts`, `recently-done-sidebar-mount-page.ts`, `unreadPageReads.ts` | run by `npm run typecheck:dashboard`; they supply the read and do not assert a review label |
| `e2e/stories/recently-done-review-state-*.spec.ts`, `recently-done-sessions-review-cue-ad-hoc.spec.ts`, `e2e/review/story-review-completed.spec.ts` | run in slice 1; the cue spec again in slice 2 |

## Story obligations

### G1. Sidebar cue compares the retained `doneAt` (first reported in slice 1)
Reported: slice 1 — "The sidebar row has no published record, so it compares `doneAt` instead of the published `closedAt`. The story card does use `closedAt`."
Story clause: "A retained session and its published record count once."
Disposition: receiving slice 2

## Plan review

Slice-plan refinement was not needed: the two slices share one rule, each
owns its proof, and the count is within the limit. The only interim is the
absence of a per-session control until slice 2, and slice 2 removes it.
Concern evidence: none identified.
