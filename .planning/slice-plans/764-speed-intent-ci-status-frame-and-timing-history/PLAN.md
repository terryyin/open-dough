# Get fast proof of Intent CI status on the real page and of timing history

**Identity:** SEED-413#speed-intent-ci-status-frame-and-timing-history
**Source:** [Get fast proof of Intent CI status on the real page and of timing history](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-ci-status-frame-and-timing-history)
**Source review:** [source-review.md](source-review.md)
**Split from:** SEED-413#speed-intent-timing-history-proof (recoverable at `756f67d70:.planning/slice-plans/759-speed-intent-timing-history-proof/PLAN.md`, former Slices 3–9) on 2026-11-22 at its delivered Slice 2 boundary

## Goal and scope

**Correction first.** Slices 1–3 finish the correction of the CI status test
entry (see
[Correction of the CI status test entry](#correction-of-the-ci-status-test-entry))
on top of the required typed page entry that SEED-413#speed-intent-timing-history-proof
delivered (`dashboard/src/pageReads.tsx`, `dashboard/src/sessionServices.ts`),
so the history slices build on the corrected entry instead of extending it.

Dashboard maintainers get CI status proof that renders the production page
frame and its owning Intent composition, with every page read supplied through
the typed page entry. They also get fast Vitest feedback on what collected
Project and Done timing history say across Intent's homepage, location,
folder, and file, and on how those history reads recover independently and
stay isolated to their project, endpoint, and scope key. Move the story notes,
CI follow-up and review-state reads behind the typed page entry; render the 7
CI status and cue-contrast files (`intent-ci-status-{freshness,execution-time,sort,homepage,kept,side-panel}`
and `intent-ci-cues-dark-contrast`) through their production owners. Move the
31 legacy cases across 19 timing-history files in
`dashboard/frontend-tests/intent/` (`intent-ci-compact-readout`,
`intent-ci-done-glance`, `intent-ci-done-reference-lifecycle`,
`intent-ci-history-chart-marks`, `intent-project-ci-history-chart-marks`,
`intent-project-scope-glance`,
`intent-project-scope-history-{key-isolation,project-isolation,recovery,refresh,remount,source-identity}`,
`intent-scope-glance`, and
`intent-scope-timing-history-{absent,gaps,provenance,reading,segments,units}`),
and refresh the 3 existing Project CI wall-time Vitest specs
(`intent-ci-wall-time-history{,-gaps,-evidence}`) to retire `createRoot`,
React `act`, and `IS_REACT_ACT_ENVIRONMENT` while covering any changed owner.

## Decisions and existing owners

- Apply the [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses),
  and [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Use `mountComponent`, `pageMakeMe.mjs` (`aProjectHistory`,
  `aScopeHistoryGlance`, `aComparedStory`, `aCiProof`, and Node-free
  `aDoneWallTimeHistory` added on `publishedReadingMakeMe.mjs`), and colocated
  page objects under `dashboard/frontend-tests/intent/` without modifying
  sibling-owned page objects (`intent-ci-evidence-page.tsx`,
  `intent-ci-scope-page.tsx`, `intent-done-story-page.tsx`,
  `intent-browser-page.ts`, `intent-candidates-page.ts`,
  `intent-file-reading-page.ts`).
- Read every page read through the typed page entry that plan 759
  established (`PageReads`, `PageReadsOnPage`, `authenticatedPageReads`, and
  `pageReadsSupplying` in
  `dashboard/test-support/component-mount/unreadPageReads.ts`). Add story
  notes, CI follow-up and review states (Slice 1), `readDoneWallTimeHistory`
  (`useIntentCiDoneWallTimeHistory.ts`, Slice 4) and `readScopeHistory`
  (`useIntentCiScopeHistory.ts`, Slice 5) as **required** members, supplied
  with their authenticated readers by `authenticatedPageReads` and with typed
  replies by each case. No optional member, context default, `?? default`
  fallback, or defaulted parameter.
- Render the production composition that owns the history, at its typed
  entry, the way production renders it. Where a history view needs the
  reading place, mount the production owner that provides it; when no owner
  can stand alone, make it stand alone in production. Do not rebuild provider
  stacks, page frames, or ancestor class wrappers in test code. Do not call
  private pipeline functions to build a view's props. Narrow `JudgedBranch`'s
  presentation input to `Omit<JudgedReading, "round">` while
  `IntentCiHistoryPanel` keeps its refresh `round`, and verify owner refresh
  on `intent-ci-wall-time-history.spec.ts`. Use pure helpers in
  `dashboard/src/ciPriorBuildReference.ts` or `ciScopeTiming*.ts` directly
  only for pure calculation rules that need no DOM.
- Build every domain input with page-loadable MakeMe builders and add
  domain-named steps for recurring setup. Do not hand-write domain records,
  and do not run production transforms such as `measuredHistoryOf` to make
  inputs. Keep each spec's and colocated helper's production imports to the
  entry, its typed inputs, and stylesheets. A longer list means the entry
  exposes too much or the case mounts below its owner: fix the entry instead.
- Size each slice to one mount boundary and 3–6 test files (avoiding the
  20-file / 3-surface bundle that overran former Slice 4 in `plan 752`).
  Capture the 19-file / 31-case legacy Playwright baseline with
  `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` at `--workers=2` in Slice 4
  before replacing the first legacy spec, and compare the completed history
  suite in Slice 8. Remove any history `dashboard/test-support/` module whose
  last consumer moves in Slice 8.

## Correction of the CI status test entry

Retrospective of SEED-413#speed-intent-proof-and-timing (`plan 752`,
recoverable at `3acae5160:.planning/slice-plans/752-speed-intent-proof-and-timing/PLAN.md`;
implementation `b1a3f27ea`, `8f260107c`, `b41efa7cb`, merge reconciliation
`6b1afcd88`, landed at `75ab8266d`), at `f5237fab7` on 21 November 2026.
Terry raised the first finding on reviewing the helpers' import lists. It
repeats the backend
[Done capture import-list analysis](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#done-capture-import-list-analysis)
on the frontend. The findings break the
[test boundary](../../../.claude/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary)
and [testability](../../../.claude/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability)
rules: a case renders the entry production uses, and production gains no
behavior solely for tests. They also break the
[frontend guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses):
a component that cannot stand alone is made to.

- **Symptom: long production import lists.** In `dashboard/frontend-tests/intent/`,
  `intent-ci-side-panel-mount.ts` imports from 22 production modules,
  `intent-ci-status-fixtures.ts` from 12, `intent-ci-perspective-mount.ts`
  from 10 and the 39-line-body `intent-ci-cues-dark-contrast.spec.ts` from 9.
  The CI comparison family's `intent-done-story-page.tsx` (16) and
  `intent-ci-evidence-page.tsx` (10) show the same shape over the same seam.
- **Test code re-implements production composition.**
  `intent-ci-side-panel-mount.ts` hand-builds a copy of `PageFrame`: the
  Sessions sidebar, `usePageSidePanel` wiring, banner, story cards and
  panels. Production `PageFrame` already takes typed `sessions` and
  `stories`. `intent-ci-perspective-mount.ts` rebuilds
  `StorySelectionProvider` → `IntentPageProviders` → `IntentReadRecovery` →
  `IntentPerspective`, which production composes in `PageFrame` and
  `ConfiguredDashboardContent`. `mountIntentCiEvidence` restates the reading
  place that `IntentCiEvidenceProvider` needs outside its owner
  (`IntentReadingProvider` + `IntentReadingPlaceOfItsOwn`, recorded as a
  `plan 752` learning). The side-panel, homepage and kept cases therefore
  prove a test copy of the page. A change to the production composition can
  break the product while these cases still pass.
- **Cases drive private pipelines and hook state.** The dark-contrast case
  builds Summary props by calling `ciTargetOf`, `scopeEvidenceOf`,
  `comparisonProofOf`, `intentStoryOverlay`, `overlayFilesByPath`,
  `owningLocation` and `filesOfSelection`. It wraps the view in hand-written
  `intent-perspective` / `intent-browser` / `intent-reading` divs so the
  composed backgrounds resemble the page. `mountJudgedRunProof` passes
  `JudgedBranch` a hand-built `judged` hook state and `shownRunOf(shown)`.
- **The typed source is not enforced, and production gained test-only
  behavior.** Delivered by plan 759 Slices 1–2: the default-valued
  `IntentCiReadSourceOnPage`, `IntentReadSourceOnPage` and
  `ReviewSourceOnPage` contexts, the optional `readHistory`, the defaulted
  reader parameters and the reselection rule are gone, and the side-panel
  service calls entered the same entry. Still open: the page's story notes,
  CI follow-up and review-state reads use contexts whose hooks fall back to
  fetching their endpoint (Slice 1).
- **Data built outside MakeMe.** `takenStoryEntry` hand-writes a `WorkEntry`
  because `aPublishedWork` has no Taken-story step. `inertCiReads` runs
  production `measuredHistoryOf` to make its empty history. The kept case
  asserts builder output through production `watchedBranchHeads`.

**Correction outcome.** Dashboard maintainers get CI status proof that renders
the production composition through the one required, typed page-reads entry
that production supplies explicitly. Each helper's production imports shrink
to that entry, its typed inputs and stylesheets.

**Preserved promises.** Every observation in the 15 `plan 752` cases keeps an
owner: the case titles and distinguishing assertions of the 7 CI status and
cue-contrast files, and the comparison family's consumers of the seam. Product
behavior is unchanged. The 7-file selection stays near its recorded
`8,315 ms` (two workers, including preparation); a regression beyond paired
noise needs a recorded reason.

**Out of scope.** Page-object CSS-class locators (`.intent-ci-state`,
`.intent-locations`) are a separate concern. The comparison family's own
mount design changes only as far as the new entry requires.
`dashboard/frontend-tests/intent/intent-candidates-publication.ts` belongs to
`plan 762`; `dashboard/frontend-tests/sessions/sessions-sidebar-open-mount.ts`
belongs to the story that moves the Sessions sidebar cases.

## Local gate

On macOS run from an awake machine on AC using `caffeinate -s -i` under
the [sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, the default test timeouts, focused path selections, and
the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run `npm run typecheck:dashboard` for changed production/types and check
representative E2E history consumers when shared contracts change.

## Decisive premises and proof

- At `58b829487ba83a8a0752eabfeb37391e4169a596` on 21 November 2026 (macOS on AC under `caffeinate -s -i`, `--workers=2`), `intent-project-scope-history-recovery.spec.ts`, `intent-ci-comparison-check-again.spec.ts`, and `intent-ci-comparison-selection.spec.ts` passed 7 cases observing failed and empty history preserving live Scope Proof, measured zero, and partial-unit gaps; the existing 3-file / 5-case Vitest Project CI wall-time history suite (`intent-ci-wall-time-history{,-gaps,-evidence}.spec.ts`) passed in `3,437 ms` (`3.44 s`) elapsed including preparation (`baseline-vitest-wall-time-history.proof.json`); and the pre-split 44-file / 95-case legacy cohort ran in `36,187 ms`.
- During `plan 752`'s Slice 4 probe on `cursor/get-fast-proof-of-intent-evidence-and-timing-his` (21 November 2026), adding optional `readDoneWallTimeHistory` and `readScopeHistory` on `IntentCiReadSource`, `aDoneWallTimeHistory` on `publishedReadingMakeMe.mjs`, and narrowing `JudgedBranch` to `Omit<JudgedReading, "round">` passed `npm run typecheck:dashboard` with `0` errors and mounted `IntentCiComparisonView`, `IntentCiHistory`, and `IntentScopeTimingHistory` cleanly in Vitest Browser Mode. The optional members are superseded by required ones under plan 759's entry; the typecheck premise still holds for adding them.
- Scratch mount at `ebd6cc201` on 21 November 2026 (Vitest Browser Mode,
  `frontend.vitest.config.mts`): real `PageFrame` inside `ProjectsOnPage` and
  `LaunchesOnPage`, with the Side panel case's MakeMe sessions and global
  `fetch`/`WebSocket` recorded. Mounting made no call. Without
  `LaunchesOnPage`, `Terminal` throws "A launch control is shown outside the
  page's launches." The scratch spec was deleted.
- Frame-mount attempt on `a48e1eae9` on 22 November 2026 (Vitest Browser
  Mode, two workers), kept as
  [frame-mount-attempt.patch](frame-mount-attempt.patch), which applies
  cleanly on `a48e1eae9`. The extracted production `BoardOrIntent`
  (`dashboard/src/boardOrIntent.tsx`: hidden `<main><Board/></main>` plus
  `IntentReadRecovery` → `RetainedFollowUpPerspective`/`IntentPerspective`),
  rendered by `ConfiguredDashboardContent`, passed `npm run typecheck:dashboard`.
  Through `mountIntentCiPage` (production `PageFrame`,
  `StoryReferenceNavigation` and `BoardOrIntent` under `PageReadsOnPage`,
  `LaunchesOnPage`, `ProjectsOnPage` and `FollowUpNavigationOnPage`), the
  homepage, kept and freshness cases passed with unchanged titles. The
  side-panel case passed every journey observation and failed only its final
  `expect(outsideCalls).toEqual([])`: the production Board made 7 global
  `fetch` calls to `/__project-configuration/story-notes`,
  `/__project-configuration/ci-follow-up` and
  `/__project-configuration/story-review-states`, and opened no WebSocket.
  Their production sites: `storyNotes.ts` (`StoryNotesOnPage`, whose
  `useStoryNotes` falls back to fetching the endpoint), `storyReviewStates.ts`
  (same pattern), `ciFollowUp.ts` (no context), `CiFollowUpViews.tsx`,
  `RetainedFollowUpPerspective.tsx`, `RecentlyDonePageEvidence.tsx`,
  `storyNoteAnnouncement.ts` and `App.tsx`. Their test sites:
  `dashboard/frontend-tests/review/story-review-page-contexts.ts`,
  `dashboard/frontend-tests/stories/story-notes-control.spec.ts`,
  `dashboard/test-support/mounted-dashboard/mountedServices.ts` and
  `dashboard/test-support/support/ciFollowUpReadingPage.ts`.

| Promise | Owning proof |
| --- | --- |
| Story notes, CI follow-up and review-state reads enter through the required typed page entry that production supplies; unsupplied reads reject in cases. | Slice 1 (`npm run typecheck:dashboard`, full frontend group, representative story notes, CI follow-up and review-state E2E journeys). |
| Homepage, kept-status and Side-panel cases render production `PageFrame` and the production Board/Intent composition, not test copies, and make no outside `fetch` or `WebSocket` call. | Slice 2 (`intent-ci-status-{homepage,kept,side-panel}`). |
| Status freshness, execution timing, sort and dark-contrast cases render their owning production composition with MakeMe inputs, with no private pipeline calls or hand-built hook state. | Slice 3 (`intent-ci-status-{freshness,execution-time,sort}`, `intent-ci-cues-dark-contrast`, 7-file timing). |
| Done wall-time history keeps its separate read boundary from live Proof, states missing/pending/outside-retention/zero-base facts accurately, and follows reference lifecycle changes | Slice 4 (`intent-ci-compact-readout`, `intent-ci-done-glance`, `intent-ci-done-reference-lifecycle`). |
| Existing Project CI wall-time mounts refresh cleanly without `act` wrapping when `JudgedBranch` narrows, and Done/Project scope chart marks preserve keyboard order, labels, and narrow layout | Slice 5 (`intent-ci-wall-time-history{,-gaps,-evidence}`, `intent-ci-history-chart-marks`, `intent-project-ci-history-chart-marks`). |
| Project and Done scope glances and source/project history keys stay isolated to their own source and project | Slice 6 (`intent-project-scope-glance`, `intent-scope-glance`, `intent-project-scope-history-{source-identity,project-isolation}`). |
| Project scope history distinguishes scope keys, preserves kept history and live Proof on failure, and recovers via Retry or refresh across remounts | Slice 7 (`intent-project-scope-history-{key-isolation,recovery,refresh,remount}`). |
| Collected scope timing keeps case/file units, provenance, segments, and gap explanations distinct, removes spent history support, and runs faster on Vitest | Slice 8 (`intent-scope-timing-history-{absent,gaps,provenance,reading,segments,units}` + two-worker before/after comparison). |

## Learnings

- **Former plan 759 Slice 2 split during execution (22 November 2026).** It
  stopped at 9 of 15 active minutes because its premise failed: the
  side-panel case also observes the Taken story cards (`Board`) and the
  Development/Intent switch, which sit outside `PageFrame` plus the Intent
  body. It split into the service-call move (delivered as plan 759 Slice 2)
  and the frame mount (former Slice 3, now Slice 2 here).
- **Former plan 759 Slice 3 stopped at 10.7 of 15 active minutes (22 November
  2026) on a failed premise.** The plan assumed the production Board makes no
  call outside the typed page entry; it fetches story notes, CI follow-up and
  review states directly (see the frame-mount premise). Moving those reads
  touches production providers and consumers, so the unfinished attempt was
  parked as [frame-mount-attempt.patch](frame-mount-attempt.patch) and the
  move became Slice 1. Terry then split the story at its delivered Slice 2
  boundary.
- **From the attempt, for Slice 2.** Production's Sessions button lives in
  `DashboardBanner`, outside `BoardOrIntent`; the case opens the sidebar with
  its page-wide `{ControlOrMeta>}b{/ControlOrMeta}` shortcut. The attempt
  added `aPublishedWork.of(source).at(rev).retrievedAt(date).taking(story, facts?)`
  in `Distribution/tests/support/comparisonViewTestData.mjs` and removed
  `takenStoryEntry`, which forced the freshness spec onto the step.
  `dashboard/test-support/component-mount/machineSessionsAnswering.ts` maps
  a MakeMe `aMachineAnswer` to a full typed `MachineSessions`; it is a typed
  adapter over a MakeMe answer, and
  `dashboard/frontend-tests/review/story-review-page-contexts.ts` keeps its
  own inline copy (refactor candidate). Production import counts after the
  attempt: `intent-ci-page-mount.ts` 9, `intent-ci-homepage-page.ts` 3
  (renamed from the perspective mount), `machineSessionsAnswering.ts` 2; specs
  side-panel 2, kept 3, homepage 2.
- **Slice 1 premise failed at 5.4 of 15 active minutes (22 November
  2026).** Removing the hooks' fetch fallback failed 93 cases in 49 frontend
  files (`s1-failed-files.txt` in this checkout's evidence), not the four
  named test sites (`mountedServices.ts` no longer exists). They reach the
  notes control and sidebar entries through a few shared mounts
  (`board-mount.ts` 26 files, `board-frame-mount.ts` 12,
  `story-review-panel-page.ts` 10) and fetch substitutes. P01 already owes
  every case, so Slice 1 was refined in place to move those shared mounts
  and substitutes onto typed replies; the plan stays at 8 slices.
- **Slice 1 delivered (22 November 2026, 8.3 active minutes).** The new
  required members are `storyNotes`, `ciFollowUp` (`readCards`,
  `readRetained`) and `reviewStates`, implemented in
  `storyNotesReadSource.ts`, `ciFollowUpReadSource.ts` and
  `storyReviewStatesReadSource.ts`, which also own their failure messages;
  notes and review states carry their writes through the same members.
  `PageReadsOnPage` holds both per-project maps, so `RecentlyDonePageEvidence`
  was removed and `PageFrame` renders `RecentlyDoneLinkSources` itself.
  `doneOutsideKinds` no longer lists story notes; Slice 4 removes the Done
  wall-time glance from it. `test-harness/unread-page-reads.spec.ts` walks
  every `PageReads` member, so later required members are covered without
  naming them. Focused E2E paths are relative to `e2e/`; set
  `OPEN_DOUGH_E2E_PROOF_RECORD` to see the selected count.
- **Slice 2 delivered (22 November 2026, 8.2 active minutes).** Cases mount
  through `intent/intent-ci-page-mount.ts` (`mountIntentCiPage`: production
  `PageFrame`, `StoryReferenceNavigation` and `BoardOrIntent`, no wrapper
  divs), with typed defaults for review ("unavailable") and an unmeasured host
  status (`unmeasuredHostSessions`); any case mounting `PageFrame` must
  answer the banner's host status read. `recordOutsideCalls`
  (`test-support/component-mount/outsideCalls.ts`) is the shared outside-call
  recorder; `intent-ci-development-card-page.ts` operates Development cards.
  Import counts: side-panel mount 21 and perspective mount 11 removed;
  `intent-ci-page-mount.ts` 9, `intent-ci-homepage-page.ts` 3,
  `machineSessionsAnswering.ts` 2. `intent-ci-status-fixtures.ts` is 13
  (gained `ReviewSource`) for Slice 3.
- **Slice 2 CI repair (22 November 2026, run 44992453497).** The page-wide
  Sessions shortcut is Command+B only (`pageShortcuts.ts`); a case pressing
  `{ControlOrMeta>}b` sends Control+B on the Linux runners and passes only on
  macOS. Press `{Meta>}b{/Meta}` and wait for the sidebar before acting in it.
- **Plan 759 Slice 2 timing.** Under load 15–20 the full frontend group took
  about 24 minutes wall time.

- **Consumers from SEED-420#test-compare-on-mounted-intent (22 November
  2026).** `intent/intent-story-compare-*.spec.ts` mount through
  `intent-ci-perspective-mount.ts` (typed page reads, workspaces,
  `selectStory`) from `intent/intent-story-compare-stories.ts`, so Slice 2's
  replacement must carry them. Their Done cases assert that their only
  outside calls are story notes and the CI Done wall-time history glance
  (`doneOutsideKinds` in `intent/intent-story-compare-stories.ts`). Slices 1
  and 4 make that check `[]`.
  `PageReads` already has a required `done` member for done record bodies
  (`dashboard/src/doneRecordReadSource.ts`).

## Story obligations

### G1. Full-app Playwright specs answer notes and review-state reads at the network
Reported: slice 1 — "Fetch substitutes left as they are (named gap): frontendStoryNotes.ts, frontendStoryReviewState.ts, frontendRecentlyDoneBoardReview.ts, frontendRecentlyDoneReviewCue.ts and the notes part of frontendServiceSubstitutes.ts were not converted."
Story clause: "Production and every case supply the story notes, CI follow-up and review-state reads through the required typed page entry."
Disposition: no user cost "A dashboard maintainer can quickly check what CI status says on the real page frame": those legacy Playwright specs serve the built app through `dashboard/test-support/support/frontendApp.ts`, whose production `App.tsx` supplies `authenticatedPageReads` to `ConfiguredDashboard`; the substitutes answer the endpoints that entry's required members call, so the cases already read through the required typed page entry production supplies. They are outside the 7 status, 19 history and 3 wall-time files this story owns and move with their own migrations.

## Slices

### 1. Story notes, CI follow-up and review-state reads enter through the typed page entry

Type: Structure
Status: done

Follow plan 759 Slice 2's pattern. `PageReads` gains required members for the
page's story notes, CI follow-up and review-state reads (currently
`/__project-configuration/story-notes`, `/ci-follow-up` and
`/story-review-states`). `authenticatedPageReads` supplies their endpoint
implementations, and `pageReadsSupplying` rejects them unless a case supplies
typed replies. The per-project state that `StoryNotesOnPage` and
`StoryReviewStatesOnPage` hold stays page-held but is created from the
entry's reads; remove the hooks' fallback to fetching the endpoint and give
CI follow-up the same entry. Move every provider and consumer: the
production sites named in the frame-mount premise and the test sites
`story-review-page-contexts.ts`, `story-notes-control.spec.ts`,
`ciFollowUpReadingPage.ts`, with no change to their assertions; update
`dashboard/frontend-tests/README.md` where it names them. `PageReadsOnPage`
holds the per-project story notes and review-state maps, created from the
entry's reads, so no separate provider has to be mounted. The shared test
mounts that relied on the hooks' fallback (`navigation/board-mount.ts`,
`board-frame-mount.ts`, `board-reading-page.ts`, `story-review-panel-page.ts`,
and the few other mounts the failing files reach) supply typed story notes,
review-state and CI follow-up replies through `pageReadsSupplying`, and the
fetch substitutes that answered those endpoints (`frontendStoryNotes.ts`,
`frontendStoryReviewState.ts`, `frontendRecentlyDoneBoardReview.ts`,
`frontendRecentlyDoneReviewCue.ts`, the notes part of
`frontendServiceSubstitutes.ts`) become typed replies, with no change to the
cases' assertions. The notes and review-state members carry their writes too,
because one source reads and changes them.

**Proof.** `npm run typecheck:dashboard` passes; the full frontend group
passes; representative E2E journeys that read story notes, CI follow-up
(`intent-ci-follow-up`) and review states
(`recently-done-review-state-persistence`) pass, proving production supplies
the authenticated reads. `grep` finds no fetch of the three endpoints in
`dashboard/src` outside `authenticatedPageReads` and no fallback in their
hooks. A focused Vitest case proves the missing path that Intent Coverage
confirmed at `341f133da` (SEED-413#speed-intent-timing-history-proof
wrap-up): for each `PageReads` member, the new ones included, a
`pageReadsSupplying` case that leaves it unsupplied rejects with "Unexpected
… read" and makes no `fetch`. Under the probe's fault, which filled
unsupplied members with `authenticatedPageReads`, 275 maintained cases still
passed while a witness saw four real requests.

### 2. Homepage, kept and Side panel CI status cases render the production page frame

Type: Structure
Status: done

Start from [frame-mount-attempt.patch](frame-mount-attempt.patch) and its
learnings above. Replace `intent-ci-side-panel-mount.ts` and
`intent-ci-perspective-mount.ts`. The cases mount production `PageFrame`
with MakeMe sessions and stories, through the typed page entry, around one
production component extracted from `ConfiguredDashboardContent`
(`BoardOrIntent`): the part that shows either the Board (`<main
hidden><Board/></main>`, owning the Taken story cards, the "Read final
report" button and card selection) or the Intent body (`IntentReadRecovery`
→ `IntentPerspective`/`RetainedFollowUpPerspective`).
`ConfiguredDashboardContent` and the cases render that same component; a
case switches view through its typed `showsIntent` input, as the route does.
Supply the page's launches (`LaunchesOnPage`, typed `MachineSessions` built
by MakeMe with every member) as `ConfiguredDashboard` does, because
`Terminal` and `Board` require them.

Add a Taken-story step to `aPublishedWork` in place of `takenStoryEntry`.
Drop the `watchedBranchHeads` assertions on builder output. Remove the
`storyNoteAnnouncement.ts` fallback for a missing page notes map (only
`story-notes-dialog.spec.ts` relies on it): throw outside the page and mount
that spec inside `PageReadsOnPage`. Keep role-based
colocated page objects. Trace the consumers of `BoardOrIntent`,
`ConfiguredDashboardContent`, `aPublishedWork`, `takenStoryEntry` and
`unavailableReviewSource`.

**Proof.** `intent-ci-status-homepage`, `intent-ci-status-kept` and
`intent-ci-status-side-panel` keep their titles and distinguishing
observations and pass at `--workers=2`. None of these cases or their helpers
renders `usePageSidePanel`, `SessionsSidebarOpenList`,
`StorySelectionProvider` or `IntentPageProviders` itself. The side-panel
case records every `fetch` and `WebSocket` call and shows none outside its
typed replies (`expect(outsideCalls).toEqual([])`). Record each replaced
helper's production import count before (side-panel mount 21, perspective
mount 11 at `40408c07c`) and after. Representative E2E journeys
(`intent-ci-status`, `agent-terminal-done-report` and one board navigation
journey) pass.

### 3. Status evidence and cue-contrast cases render their owning composition with MakeMe inputs

Type: Structure
Status: planned

Render `intent-ci-status-freshness`, `-execution-time` and `-sort` through
the owner of CI status and its proof. That owner stands alone in production,
or the cases render it within the production Intent composition. Either way
the cases restate no reading-place stack, and the judged state comes from
typed status and proof replies, not from a hand-built `judged` or
`shownRunOf`. Render `intent-ci-cues-dark-contrast` through the production
Intent Summary for a selected scope fed by typed CI reads, so that real
ancestors compose the background and no private pipeline function is called.
Add MakeMe steps for any recurring input, such as an empty measured history,
in place of `measuredHistoryOf`.

**Proof.** The 4 files keep their titles and distinguishing observations and
pass. Measure the complete 7-file selection at `--workers=2`, including
preparation, against `8,315 ms`, and record any regression beyond paired
noise with its reason. Record each spec's and helper's production import
count before and after. `intent-ci-status-fixtures.ts` keeps no production
transform.

### 4. Done wall-time history keeps its separate boundary, compact readout, and reference lifecycle

Type: Behavior
Status: planned

Capture the 19-file / 31-case legacy timing-history baseline at `--workers=2`
with `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`. Add required
`readDoneWallTimeHistory` to the CI reads (`useIntentCiDoneWallTimeHistory.ts`),
supplied by production and by each case, and add `aDoneWallTimeHistory` to
`publishedReadingMakeMe.mjs` (`pageMakeMe.mjs`).
Move `intent-ci-compact-readout`, `intent-ci-done-glance`, and
`intent-ci-done-reference-lifecycle` (3 files, 6 legacy cases) over
`IntentCiComparisonView` and the typed page entry (and direct pure
reference checks only where no DOM behavior is part of the proof). First
observe one held Done wall-time history read resolving beside live comparison
proof without rereading comparison proof.

**Proof.** Missing, pending, outside-retention, insufficient, unusable-selected,
zero-average, and stand-in landing baselines render their exact compact words
and cues; Done glance marks and hover/focus details match the landing;
changing or retrying the Done reference updates or preserves history without
perturbing live Proof (`0` legacy Playwright cases remain on the 3 files).

### 5. Project CI wall-time mounts drop `act` wrapping and chart marks keep keyboard and narrow layout

Type: Behavior
Status: planned

Add required `readScopeHistory` to the CI reads
(`useIntentCiScopeHistory.ts`) and narrow `JudgedBranch` to
`Omit<JudgedReading, "round">` while `IntentCiHistoryPanel` retains its
refresh `round`. Refresh `intent-ci-wall-time-history{,-gaps,-evidence}.spec.ts`
onto `mountComponent` (retiring `createRoot`, React `act`, and
`IS_REACT_ACT_ENVIRONMENT` and verifying refresh round behavior), and move
`intent-ci-history-chart-marks` and `intent-project-ci-history-chart-marks`
(2 legacy files / 4 legacy cases + 3 refreshed Vitest files).

**Proof.** Project CI wall-time history refreshes through `Check again` ->
`Builds and evidence` keyboard order without `act` helpers, and Project/Done
history chart marks preserve build/date labels, accessible descriptions,
run links, and narrow-viewport fit.

### 6. Scope glances and project/source history keys stay isolated to their source

Type: Behavior
Status: planned

Move `intent-project-scope-glance`, `intent-scope-glance`,
`intent-project-scope-history-source-identity`, and
`intent-project-scope-history-project-isolation` (4 files, 5 legacy cases)
over `IntentScopeTimingHistory` / `useIntentCiScopeHistory` within its
production owner (no restated reading-place stack) and typed `readScopeHistory` replies recording requested source, endpoint, scope,
and `AbortSignal`.

**Proof.** Project and Done scope glances display accurate summary cues, and
switching source identity or project issues the right request and aborts/ignores
other projects' or sources' answers without leaking history across projects.

### 7. Project scope history isolates scope keys, retains live proof on failure, and recovers on Retry

Type: Behavior
Status: planned

Move `intent-project-scope-history-key-isolation`,
`intent-project-scope-history-recovery`,
`intent-project-scope-history-refresh`, and
`intent-project-scope-history-remount` (4 files, 6 legacy cases) within the
production owner of `IntentScopeTimingHistory` beside live Scope Proof.

**Proof.** Entry, folder, file, and revision keys keep distinct kept histories
across remounts; a failed or empty history read preserves both the last kept
history and live Scope Proof, offers `Retry`, and recovers or refreshes
without borrowing history from another endpoint or scope.

### 8. Collected scope timing preserves units, provenance, segments, and gaps and runs faster on Vitest

Type: Behavior
Status: planned

Move `intent-scope-timing-history-absent`, `intent-scope-timing-history-gaps`,
`intent-scope-timing-history-provenance`, `intent-scope-timing-history-reading`,
`intent-scope-timing-history-segments`, and `intent-scope-timing-history-units`
(6 files, 10 legacy cases) over `IntentScopeTimingHistory` (plus direct pure
timing checks only where DOM rendering is not the proof). Remove any
`dashboard/test-support/` history module whose last consumer across `e2e/` and
`dashboard/frontend-tests/` has moved, and record the two-worker before/after
timing and case-disposition comparison against Slice 4's 19-file legacy
baseline and the `3,437 ms` Vitest wall-time baseline.

**Proof.** Absent, partial, and unavailable timing reasons, separate case vs
file units, interrupted segments, build dates, and provenance stay readable
and accessible; zero legacy Playwright cases remain across all 19 owned files;
no `act`/`IS_REACT_ACT_ENVIRONMENT` remains in the owned history specs; spent
history support is removed; and two-worker Vitest elapsed time including
preparation improves over the legacy baseline.

## Plan review

Split on 22 November 2026 from SEED-413#speed-intent-timing-history-proof
(plan 759) at its delivered Slice 2 boundary, on Terry's authorization. Former
Slices 3–9 map to Slices 2–8 here; Slice 1 is new and moves the three page
reads the frame-mount attempt found outside the typed entry, the change that
attempt's stop report recommended. Eight slices is the plan limit. Each
slice keeps one boundary: the page entry, the page-frame mount, the evidence
mount, then one history owner per slice. The story starts after plan 759's
typed page entry lands on main; the parked patch was captured on `a48e1eae9`
and needs reconciliation at Slice 2: after plan 759 merged `c64549aac`
(22 November 2026) it no longer applies to `intent-ci-side-panel-mount.ts`,
and `ConfiguredDashboard` now takes its reads as a required `reads` prop.
