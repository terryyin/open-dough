# Get fast proof of Intent revision reading and reading-place detours

**Identity:** SEED-413#speed-intent-revision-and-detour-reading
**Source:** [Get fast proof of Intent revision reading and reading-place detours](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#speed-intent-revision-and-detour-reading)
**Source review:** [Source review](source-review.md)
**Split from:** Plan 762 at its delivered Slice 9 boundary, recoverable at `8fb7691cc:.planning/slice-plans/762-speed-intent-source-browsing-and-detours/PLAN.md`

## Goal and scope

Give maintainers fast proof of revision reading, CI activation, Candidates
reuse and reading-place detours. Move the revision test composition and six
legacy cases to their production owners, preserve real routing in E2E, and
apply the two retrospective corrections carried from plan 762. The published
observation story owns four legacy cases (home activation with a discovered
revision, both project visits, startup-detail selection) and the eventual
replacement of the Candidates backoff case's recovery mount. Keep those four
legacy cases runnable and count their cost in the comparison.

## Current decisions

- Reuse `mountIntentCiPage` with production `PageFrame` and `BoardOrIntent`,
  and typed `PageReads` supplied by `pageReadsSupplying`. Use `showWork` to
  offer a snapshot the page already has, `showDevelopment` and `showIntent`
  for a view change, and a real Board card for story selection. Await each
  committed view before sending another. The page owns reading and selection
  across child mounts. It consumes published work as input for these cases.
- Feed revision-specific locations, file, CI, and Review changes replies
  through the existing reads. Use distinct revisions for independent examples
  sharing paths and wait on effects in the DOM or recorded typed reads.
  The original revision fixture's publication data still has consumers.
  Retire its provider and chosen-mode composition while retaining that data
  where callers use it. Supply page-loadable builders through `pageMakeMe.mjs`
  to keep `makeMe.mjs`'s native-evidence import closure free of dashboard code.
- Keep Candidates reuse in the existing authenticated reader and reuse
  `memoizedAnswer` and `keptIntentCandidatesAt`. The reader's transport
  dependency is separate from the page's typed reader. Use the same production
  reader for present, absent, unreadable, and invalid replies.
- Apply [campaign acceptance](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#acceptance-shared-by-the-eight-stories),
  [the North Star](../../NORTH-STAR.md), and the
  [frontend entry guidance](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses).
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  keeps each project's disposable reading place and story selection in
  the page and ties Purpose and Proof to their scope.
  [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  calls for preserving the promises while reducing test cost.
  Use colocated page objects and typed MakeMe inputs. Count production imports
  before and after for each touched spec and helper. Retire shared Playwright
  support only after checking its last consumer across frontend tests and E2E.

## Local gate

On macOS, run on AC with `caffeinate -s -i` under the maintained
[sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
Use two workers, default timeouts, and the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run focused named proof in each slice, `npm run typecheck:dashboard` for
changed TypeScript contracts and mounts, and selected E2E for routing and
popup behavior. Retained Playwright outcomes are in the frontend proof
record, including when stdout only shows Vitest. Set
`OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` to a fresh path for each run.

## Decisive premises

Observed 23 November 2026 in the established worktree at `bb42f3886`, using
its installed dependencies and headless Chromium on AC. The frontend
commands below use `caffeinate -s -i npm run --silent test:dashboard:frontend --`
and end in `--workers=2`. Scratch edits were disposable.

- **Current coverage.** The selection `intent/intent-home-activation.spec.ts`,
  `intent/intent-read-reuse.spec.ts`, `intent/intent-reading-place.spec.ts`,
  `intent/intent-recent-stories.spec.ts`, `intent/intent-project-visit.spec.ts`,
  `intent/intent-project-visit-selection.spec.ts`, `intent/intent-selection-reads.spec.ts`,
  `intent/intent-ci-status-homepage.spec.ts`, `intent/intent-ci-status-kept.spec.ts`,
  `intent/intent-cached-reads.spec.ts`, `intent/intent-candidates-read-recovery.spec.ts`,
  `intent/intent-revision-`, and `intent/intent-source-target-recovery.spec.ts`
  passed 21 mounted and 10 legacy cases in 30.73 s including preparation.
  It reached the two branch scopes, file/record reuse, detours and the
  retained observation routes. This is a preparation run on today's
  remainder and companions. The original cohort has a separate baseline.
- **Replacement page entry.** A scratch adapter reran the six
  `intent-revision-*.spec.ts` files and `intent-source-target-recovery.spec.ts`
  on `mountIntentCiPage`. All 11 passed after awaiting each committed
  view change. This reached held and failed reads, Retry, discarded old
  reads on project switch, reopened reading, and line 44 with focus and
  scroll. The first adapter could supersede a commit it was still awaiting,
  so the slice uses awaited operations instead of overlapping promises.
- **Detour and Recent stories.** A scratch `intent/intent-planning-detour-probe.spec.ts`
  passed both journeys. Real card selection plus typed story review and
  diff replies restored a selected nested diff at the exact scroll offset
  after Development with zero extra calls, and cleared selection after
  switching away and back. Disabling scroll recording made the same
  nested-diff case return at 0 instead of 1,054 pixels. Wait for the pane's scroll event before leaving
  so the page has recorded the offset. Adding the production
  `DashboardBanner` inside the existing `PageFrame` and
  `StoryReferenceNavigation` exposed the Recent stories button. It reopened
  A from Project Intent, selected B in Intent, and selected a remembered
  unavailable row. URL behavior remains at the built-page boundary.
- **Candidates reader.** A scratch reader factory took
  `typeof authenticatedGet` as a required dependency. A Node module probe
  called the actual reader twice at each revision, with fresh abort
  signals and a counted typed transport. Present and absent used one
  call each, unreadable used two, and the present reply was available
  through `keptIntentCandidatesAt` on return.
- **Candidates backoff.** The scratch MakeMe reply reached the recovery
  timer through the Candidates record. The 22 mounted cases selected by
  `intent/intent-revision-`, `intent/intent-source-target-recovery.spec.ts`,
  `intent/intent-planning-detour-probe.spec.ts`,
  `intent/intent-candidates-read-recovery.spec.ts` and
  `intent/intent-read-recovery.spec.ts` passed, including the
  backoff due before the limit and the successful retry after it.
  Disabling `noteLimitUntil` left the focused recovery case at two
  reads when it expected the third at the end of the limit.

- **Existing E2E routes.** At the same revision,
  `caffeinate -s -i npm run --silent test:e2e -- 'navigation/source-navigation.spec.ts|stories/published-work.spec.ts|stories/direction-disclosure.spec.ts|intent/intent-project-visit-ci.spec.ts' --grep 'source links open|published Board shows|direction starts collapsed|a Project Intent visit reuses' --workers=2`
  passed all four cases, including a plan popup, a canonical popup and
  a real Intent visit. The suite took 56.12 s including preparation.
  The current popup case took 11.56 s in this run. Plan 762's 7.6 s
  measurement is retained for historical comparison; use a paired run
  to attribute changes to the cleanup.

## Slices

### 1. Revision and pinned-source reading use the production Intent body

Type: Structure
Status: done

Replace the test-owned `ProjectIntentReading` and
`IntentReadingProvider` stack in `intent-revision-fixtures.ts` with the
existing mounted page and revision-specific read replies. Make the
revision offer, leave and reopen operations await the committed snapshot.
Activate Candidates through its real tab. Keep one adapter only while its
callers need the mapping from published features to typed replies.

**Proof.** The six `intent-revision-*.spec.ts` files and
`intent-source-target-recovery.spec.ts` own the notice, planning-only
advance, held locations and file, stale reply rejection, removed file
explanation and focus, failure cause, Retry, and kept selection, target
line, focus and scroll. Preserve their exact distinguishing assertions
and run the Candidates and Gherkin consumers of the fixture data. The
E2E check in `e2e/intent/intent-project-visit-ci.spec.ts` owns the
observed-revision route.

**Delivered.** `mountIntentReading` mounts `mountIntentCiPage` with typed
intent and unread CI reads at 1280×600, chooses Candidates through its tab,
and awaits `showWork`, `showIntent` and `showDevelopment` in each operation.
Its direct production imports fell from 7 to 3; callers only gained
`await`. The revision, source-target, Candidates, Gherkin, folder-summary and
Java selection passed 36 of 36 with two workers. `mountProjectIntent` remains
the one adapter from published features to typed replies. The production
`IntentReadingProvider` stays for the observation story's recovery mount.

### 2. Activating CI home follows the selected scope

Type: Behavior
Status: done

When a story file is selected, activating CI comparison judges the story
branch, and switching to Project Intent judges trunk with an independent
file selection. Returning restores the story's Changes. Arrow keys, Home
and End move and focus the project mode without clearing the read file.
Direct activation clears it and shows the CI home.

**Proof.** Migrate the first two cases of `intent-home-activation` using
the typed intent, review and CI collaborators from
`intent-ci-status-homepage`, `intent-ci-status-kept` and
`intent-story-compare-stories`. Observe the judged revisions and request
identities, file selection, names, focus and mode with the production DOM.
Carry the project URL assertion to a keyboard step on
`e2e/intent/intent-project-visit-ci.spec.ts`. Keep the third legacy case
for the observation story.

**Delivered.** `intent-home-activation-scope.spec.ts` replaces the first two
legacy cases on `mountIntentCiPage`, observing recorded `readStatus` branches,
the review query identity and file reads. `frontendIntentActivation.ts`,
`storyBoardCiAnswers` and `publishCiStoryBoard` lost their last consumer and
were removed. With one project the built page omits `project=` from the URL,
so the E2E keyboard step asserts that arrow keys keep the visited URL. The
Files column has no accessible name and its two folder-toggle variants are
named differently, so `openEveryFolder` and `pressedFileCount` still use class
selectors; naming them needs a production change outside this story.

### 3. A fixed Candidates reply is reused at its published revision

Type: Behavior
Status: done

Make the authenticated transport a required collaborator of the existing
Candidates reader, with production explicitly wiring `authenticatedGet`.
Keep validation, cache keys, cancellation and the kept-answer access at their
current owner. A second read for the same fixed answer returns the same
record without calling the transport. A different revision has its own
answer and an unreadable reply can be retried.

**Proof.** A focused plain Vitest reader case observes the transport calls
and parsed replies, including one call per fixed present or absent
answer and a new call after unreadable or a revision change. A scratch
cache bypass must fail the reuse assertion. The existing
`intent-ci-status-kept` and `intent-cached-reads` cases own the record and
mode after returning to Intent and the matching locations read count.
Retire the legacy case when those owners cover all three signals.

**Delivered.** `intentCandidatesReader(get)` takes the transport as a
required collaborator and production wires `authenticatedGet`.
`intent-candidates-reader-reuse.spec.ts` holds six reader cases; a scratch
`fixed` bypass failed three of them. `intent-read-reuse.spec.ts`,
`frontendIntentCandidates.ts` and `putFrontendCandidates` were retired after
their last consumer moved. All 259 `intent/` frontend cases and the
Candidates and CI E2E specs passed.

### 4. Returning to Changes restores the nested diff and its reading place

Type: Behavior
Status: done

With a nested diff selected, Purpose scrolled, Selected story only on and
an adjacent folder manually collapsed, leave for CI comparison, Intent
coverage or Development. Returning restores the Changes view, selected
path, folder arrangement and exact offset without rereading locations,
published text, or the story diff. Another project starts fresh and
returning to the original project starts at the selected story's CI
comparison, with a fresh Changes tree.

**Proof.** Migrate both `intent-reading-place` cases. Extend the existing
selected-story review and tree page objects as needed. Supply work,
machine/worktree, review snapshot and counted typed locations, file
and diff replies through the established mount. Wait for the actual
scroll event before leaving. Exercise both resets through `showWork`
with distinct project snapshots. Retire legacy-only reading-place
support after the consumer trace.

**Delivered.** Both `intent-reading-place` cases run on `mountIntentCiPage`
with counted typed reads; returning after CI comparison, Intent coverage and
Development reads nothing. Vitest page objects share `intentReadingPane` and
`scrollReadingHalfway` (resolved on the pane's scroll event) from
`intent-browser-page.ts`. The old spec's helpers all keep other consumers;
the consumerless `expectReadingOffset` and `scrollIntentReadingToStart` were
removed. All 259 `intent/` cases passed. The reading pane has no accessible
name, like the Files column.

### 5. Recent stories restores or changes the story in Intent

Type: Behavior
Status: done

Render the production banner in the existing page mount for this
journey, inside the real story reference and selection providers. Render
the production navigation notice in that composition. Clicking Recent
stories from Project Intent reveals the selected story's start, and
choosing a different or unavailable remembered row keeps Intent. The
unavailable row selects without adding a story-reference notice.

**Proof.** Migrate `intent-recent-stories` using the current Board card
selection, real banner control, an isolated kept-history preference for
the unavailable row, and typed page reads. Observe the selected identity,
readable story start, focused perspective and empty notice. The existing
`navigation/recent-stories` reload case owns persistence of the history
itself. Add the real-page perspective URL assertion to the
`e2e/intent/intent-project-visit-ci.spec.ts` visit, with a Recent stories
return action, before removing the legacy case.

**Delivered.** `mountIntentCiPage` renders the production `DashboardBanner`
and story-reference notice inside `StoryReferenceNavigation`, as
`ConfiguredDashboard` composes them, with an isolated kept Recent stories
preference. Three mounted cases replace the legacy case; the readable start
uses production `startIsReadable`. The E2E visit asserts `perspective=intent`
after a Recent stories return through
`returnFromProjectIntentWithRecentStories`. `recentStoriesIntentPage.ts` lost
its last consumer and was removed. That URL assertion has no break check.

### 6. A typed Candidates reply establishes the standing limit in the recovery case

Type: Structure
Status: planned

Apply the plan 762 retrospective correction for the test. Give
`makeMe.aRateLimitedIntentReply` a `.reading(kind)` step while keeping
its locations default for existing callers. Use it and
`makeMe.anUnreachableAuthenticatedRead` in the Candidates backoff case.
The typed reply itself starts the standing limit. Keep the existing
recovery mount until the observation story replaces it.

**Proof.** Run `intent-candidates-read-recovery` and `intent-read-recovery`
on the controlled clock, retaining the retry and exact read-count
observations before and after the limit expires. Remove
`noteLimitUntil` in scratch and verify the standing-limit case detects
the missing wait. Restore the edit before delivery.

### 7. Existing Board journeys cover source navigation

Type: Structure
Status: done

The follow-up removed `e2e/navigation/source-navigation.spec.ts`.
`published-work.spec.ts` opens the pinned canonical record and checks that
the Board keeps its detail open, displays the recorded external address,
and makes no request to the external host. `story-readiness.spec.ts`
already opens the pinned plan in a new tab and checks plan fragments in
the rendered links. Title and direction markup are covered by the Board
and direction disclosure cases. The Vitest source-link specs check
recorded addresses, the external link's new-tab target, and refused targets.

**Proof.** Seven E2E cases across `published-work`, `story-readiness`, and
`direction-disclosure` and seven Vitest cases across `source-links` and
`source-link-rules` passed with two workers. The earlier standalone timings
remain available for the cohort comparison in slice 8.

### 8. The cohort comparison measures faster feedback with proof intact

Type: Behavior
Status: planned

Account for the original 15 files and all 22 legacy cases. The baseline
at `6c51cc4eb` on 22 November 2026 was 22 Playwright `chromium` cases,
26.8 s runner time at load 10.0. Plan 762 Slice 5 identifies that run
as `s5-legacy-baseline.json` and measures the added popup journey at
7.6 s. Use the retained run for comparable fields. If its preparation
time is unavailable, reconstruct the two-worker comparison at that
revision in a disposable checkout under comparable load, identifying
the reconstruction and any remaining timing limits.

**Proof.** At `6c51cc4eb`, select `navigation/source-navigation.spec.ts`
and `navigation/source-navigation-refused.spec.ts`, and these 13
`intent/` specs: `intent-code-browse-java`, `intent-entry-folder-summaries`,
`intent-entry-folder-summaries-folders`, `intent-gherkin-groups`,
`intent-gherkin-layout`, `intent-home-activation`, `intent-project-visit`,
`intent-project-visit-selection`, `intent-purpose-case`, `intent-read-reuse`,
`intent-reading-place`, `intent-recent-stories` and `intent-selection-reads`.
Map plan 762's 12 migrated cases and this plan's six case replacements to
the current proof by path and title, plus the four retained legacy cases.
Run comparable two-worker selections explicitly per engine and include
the affected E2E journeys. Report elapsed time with preparation, counts
by engine, the slowest remaining cases, and observed savings or limits
under paired load. Check remaining `dashboard/test-support/` imports and
record an owner for every retired observation.

## Slice review

Slice-plan refinement reviewed all eight boundaries against the observed entry and proof.
The revision migration has one shared adapter, two or three
transition operations per affected caller and one focused proof run,
which keeps it within the 15-minute active-time limit. Separate
Recent stories from the nested diff detour because it proves banner
selection and routing. Separate the Candidates data correction and
popup correction from the reader and timing analyses so each has its
own proving run. The slices reuse the page's reading place, readers and scope ownership.
This review found no remaining slice-specific concerns.
