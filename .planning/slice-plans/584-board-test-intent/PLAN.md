# Express Board, navigation and published-read test intent

**Identity:** SEED-300#express-board-test-intent-through-page-objects
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-board-test-intent-through-page-objects)
**Source review:** [Source-only review](source-review.md)

## Goal, scope and evaluation

A developer reading these tests can follow the user's Board navigation and the
published facts retained or replaced. Shared browser controls have one owner;
independent expectations and causal transport evidence remain in the scenario.

Resolve all six source findings and their reached same-control/sequence callers.
Story examples 1–7 map to slices 1–8 below; example 8 and the shared acceptance
criteria belong to every slice. Preserve each distinct behavior check and tier.
No new dashboard behavior, universal fluent conversion, framework, speed/case-count
promise, or wholesale sibling-workflow migration is included. Necessary repair
of failing maintained proof is owned, never waived as an unrelated baseline.

Baseline: audit `7eab3d6ca`, reconciled to this workspace at
`99dcb55b67cc56a67f40ff2c29c97786eb2e3b28` on 2026-11-12. For each finding,
execution retains representative before/after source, caller dispositions,
mechanics edit sites removed, and helper cost. Keep clearer actions/outcomes and
one coherent control owner only when their gain justifies that cost. Passing
commands and fewer raw locators alone do not establish improvement.

## Architecture and existing solutions

Follow Accepted [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for Inspect versus Selected story, named regions, and published versus local
facts; and [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
for the comparison above. The index and in-file statuses agree, with no relevant
supersession or conflict. Follow [One backlog interpretation, separate observation
and presentation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
and the [navigation guidance](../../../docs/dashboard-navigation.md). Existing
direction supports this test-side change; no new North Star topic is needed.

PFE decisions from current source and the observations below:

| Responsibility | Existing solution and decision |
| --- | --- |
| Column paging, layout, wheel reading | Extend `boardColumnNavigation.ts` and `boardPage.ts`; reuse `readingPlace.ts`, `touchGestures.ts` and `pageLayout.ts`. Keep expected columns, keys, geometry and modality supplied by callers. |
| Project/frame/destination navigation | Extend `projectChoice.ts`, `dashboardParts.ts`, `pageShortcutsPage.ts`, `sourceNavigationJourney.ts` and `notificationStoryJourney.ts` at their existing boundaries; setup remains setup. |
| Inspection, selection and references | Extend `storyCardControls.ts`, `storyCardSelection.ts`, `storyReferenceDone.ts` and scoped reference operations. Fluent `storyCardPages.ts` composes the same controls; do not create another Board-wide framework. |
| Card, roster and attribution facts | Reuse `rosterParts`, readiness observations, `agentPortrait.ts` and `publishedFactsAssertions.ts`. Extract repeated credit/progress observations into focused card/roster owners where a gap remains; `agentRosterRecords.ts` owns fixture records, not browser expectations. |
| Recently done range and retention | Extend `recentlyDoneColumn.ts` and `recentlyDoneProgressivePage.ts`; keep `recordsAsked` and held-answer evidence independent. `recentlyDoneProgressiveJourney.ts` remains a publication/journey collaborator. |
| Published arrival and recovery | Compose card readers with `transientRecoveryPage.ts`, existing refresh/clock/request owners and focused retained-reading observations. Do not move request holds, revision advancement, or expected results into a page object. |

Expected owner/support edits are at most 250 lines at this revision:
`boardPage.ts` 192, `boardColumnNavigation.ts` 110, `projectChoice.ts` 90,
`storyCardControls.ts` 93, `storyCardSelection.ts` 47, `storyCardPages.ts` 173,
`recentlyDoneProgressivePage.ts` 119, `dashboardPage.ts` 250,
`dashboardParts.ts` 120, `transientRecoveryPage.ts` 27, `pageLayout.ts` 247,
`storyReadinessAccessible.ts` 249, `autoRefreshJourney.ts` 236.
The inspected navigation/stories/observation specs are also at most 250 lines.
Preserve existing composition/re-exports; add cohesive reading/credit modules
rather than growing the near-limit facades. Recheck exact expected edits before
authoring; newly discovered oversized edits need their own cohesive decision.

## Decisive premises and preparation observations

All observations ran in this owned workspace at the revision above on 2026-11-12.
Trial code and injected faults were restored byte-for-byte before record writes.
These observations establish bounded premises, not completed implementation.

| Premise / consuming operation | Form and observed result | Unverified remainder |
| --- | --- | --- |
| The integrated proof route builds its local server here. | Initial pointer probe failed at server-bundle `mkdtemp` because this worktree lacked `node_modules`; `npm ci --silent` repaired setup. The same route then passed. | Execution must install this checkout's dependencies; parent resolution is insufficient. |
| A card operation can expose press without swallowing release or focus proof. | P1 temporarily extracted scroll/box/move/down to `holdCardAction(Locator)` in `storyCardControls.ts`; the original pointer case passed, with release, intermediate expectations and up still explicit. | Execution sweeps every affected caller; this one case is no suite-wide claim. |
| That case detects losing the causal press. | P2 omitted only `mouse.down` in the trial helper. The maintained `not.toBeFocused` failed: Done destination actually held focus. P3 restored the helper and passed. | Preserve this exact assertion strength and split input sequence. |
| Project choice, card gaps, ranges and retained published reads reach real results here. | P4 selected seven actual integrated cases: compact resize, malformed dependencies, 35-entry reveal, published-fact arrival, unchanged carry and failed-check recovery passed; native Board reading failed. | Six passing cases do not establish all variants or excuse the seventh. |
| Native End is a valid unchanged Board baseline. | **False.** P4 and an instrumented diagnostic both saw End focus Board but leave scrollTop 0 instead of 5457. Event log shows keydown, focusin, keyup and scrollend at 0, without scripted scrolling. A separate ordinary-document End comparison passed in the same fixture/profile. | Slice 2 owns repair and full native reading replay. Diagnosis, load profile and remedy are in the next two rows. |
| Follow-up diagnosis of the End failure (default checkout at `3e104c841`, 2026-11-12). | Unchanged case passes idle (1 + 5 repeats, plus the full P4 seven-case command) and on green main CI. At external load 31–42 (`yes` ×12–16, 4–6 workers, 16–30 repeats) it fails 5/16 and 3/30. Two causes: (a) test race: `readKey` installs its `scrollend` listener concurrently with the press, so a quick scroll can end first and the step times out (3 of the 5). Listening before pressing removed every timeout. (b) Stale compositor state: event log shows PageDown reach 599, then PageUp emit `scrollend` with no movement, with Board already focused. Home and End fail the same way, so the body-to-Board focus handoff is not the cause. Native key scrolling acts on the last drawn scroll offset/extent, which lags the page under load. Waiting two animation frames before each press cut failures to 1/60 (End, first key) but did not remove them. Capture-phase key logging also masked the failure. | Decision below sets the load profile; slice 2 applies the remedy and replays every reached key caller. |
| Load profile and remedy (Terry, 2026-11-12). | Terry decided the journey must survive moderate to somewhat high CPU load, not extreme load. Profile: one test worker plus external load up to about 2× this host's 16 cores (load ≈32, covering the 31 seen in P4). The remedy registers `scrollend` before the press and waits two animation frames before pressing. Under `yes` ×16 at `--workers=1 --repeat-each=40` (load ≈28–36) it passed 40/40; the unchanged case at the same load failed 6/40 (Home stuck at 5457; three `scrollend` timeouts). Extreme load (`yes` ×28, load ≈48; or 4–6 parallel browsers at ≈40) still fails about 1 in 40–60 and is out of scope. Trial code was restored byte-for-byte. | Slice 2 applies the remedy wherever reading keys wait on `scrollend` (including `board-native-reading.spec.ts`). It re-proves the complete journey in this profile with no relaxed bound, retry or timeout change. |
| The named proof cohorts select real specs in this checkout. | P5 executes each C1–C8 regex through the real runner with `--list --reporter=json`; retain the resulting selection counts below. | Listing is route selection only, not behavioral proof. |

Literal pointer command for P1/P2/P3 (one case each, no retry):
`caffeinate -i npm run test:dashboard -- tests/navigation/story-reference-done-cancellation.spec.ts --grep 'pointer down stops' --workers=1`.
Runs took 16.485 s / 19.268 s (expected fault failure) / 15.053 s.
Evidence: `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/board-refinement-ifk_7pfh/`
contains command, proof records, fault report and restoration hashes.

P4 command (seven cases, six passed, one failed, 70.311 s):

```sh
caffeinate -i npm run test:dashboard -- tests/navigation/board-reading.spec.ts tests/navigation/dashboard-header-compact.spec.ts tests/stories/story-dependencies-malformed.spec.ts tests/stories/recently-done-progressive-loading.spec.ts tests/observation/published-facts-reading.spec.ts tests/observation/steady-refresh-carry.spec.ts tests/observation/auto-refresh-recovery.spec.ts --grep 'body reading keys|resizing keeps Doughnut|malformed and unreadable|35 entries show ten|including done success|an unchanged revision|a failed check keeps A' --workers=1
```

P4 proof/log/command: `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/board-preparation-cohort-7xcn3lkt/`.
Instrumented native-key command: `caffeinate -i npm run test:dashboard -- tests/navigation/board-reading.spec.ts --grep 'body reading keys' --workers=1`;
events/proof/log: `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/board-key-diagnostic-vofc5pe9/`.
Ordinary-document comparison: same file/runner with temporary case selected by
`--grep 'diagnostic native End' --workers=1`; proof/log:
`/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/board-native-diagnostic-o13wf1p9/`.

Host decision before launch: macOS on battery 65%, lid observed open, load
31.01/26.01/17.47, 57% memory free, with other worktrees' Playwright and Python
work active. Use one worker under `caffeinate -i`; leave other owners' work alone.
Reconsider power/load before larger cohorts; no timeout or assertion was relaxed.

## Ordered slices

Each Behavior includes its caller sweep, source comparison, implementation,
focused proof and cleanup. C1–C8 below are initial proof cohorts, not file-based
scope limits. Extend them through the effect/consumer trace before delivery.

### 1. Read and page the Board without losing its usable room
Type: Behavior
Status: done
Proof: C1; retain expected column order, card share, scroll extent, reduced motion,
kept position, and panel/sidebar/dialog conditions. Story example 1.

Behavior: Given a long or paged Board, the developer reads named column paging,
wheel and resize operations and their independent geometry outcomes. Extend the
existing column/layout owners; browser probes remain measurements of the actual
page. Safe stop: layout/column callers are readable and green without keyboard,
reference or recovery migration.

Accepted (2026-11-12): new `dashboard/tests/boardReading.ts` (76 lines:
`wheelBy`, `pressScrollbarTrack`, `untilBoardRests`, `expectAtBoardBottom`,
`expectDocumentStill`, `expectPagingControlInSight`), the intended home of
slice 2's reading operations; C1 specs plus the covering-panel cases of
`board-reading`/`board-session-reading` use it and existing owners
(`expectCoveringFillsWindow`, `control`, `panelDivider`, `columnPagingControl`).
`boardPage.ts`, `boardColumnNavigation.ts` and `pageLayout.ts` are unchanged.
Proof: C1 19/19 passed (3.3 min, load 44→28); reached callers
`board-reading.spec.ts board-session-reading.spec.ts --grep 'Session entry'`
5/5; typecheck exit 0. Comparison: 28 inline mechanics sites removed (9
document-scroll probes, 3 bottom comparisons, 5 paging-control sight checks, 2
wheel-by computations, scrollbar press, rest poll, 3 covering assertions, 3 raw
side-panel locators, 1 raw paging-control class); helper cost +76 lines, specs
−14. Exact DOM/geometry/storage contracts stay direct (divider hit test,
overflow, scrollHeight, scrollbar room, reduced-motion geometry, sticky heading,
`localStorage` keys). The roster wheel is slice 5's; board-kept's local
`chooseProject` slice 3's; board-height's Hide-detail press slice 4's.
Remaining same-probe callers are O1 (slice 2) and O2 (slices 5–8).

CI repair after slice 1 (run 43215764018/1, `intent-project-visit-ci.spec.ts:35`
received no branch-judgment calls): `untilNotedAnswered` gave the page its turns
and looked for unanswered reads in separate evaluates, so an answer landing
between them got no turns. The page now counts settled requests
(`requestsSettled`, change waits aside) and the wait loops while any settled
since its turns began. A held-read reproduction failed 3/3 at the old wait and
passed at the new; all 77 direct callers passed (165 tests). Locally, a cold
first test can still exceed 30 s in test-scoped fixture startup under load; it
predates this story and lies outside its scope.

### 2. Follow native keyboard and touch reading with preserved ownership
Type: Behavior
Status: done
Proof: C2 plus reached C1, Review touch and responsive-session-access callers;
retain exact keys/gestures, native-document comparison, expected focus, modal
ownership and reading positions. Example 2.

Behavior: Given body/Board/control focus, reading keys or touch move the intended
region and modal controls keep their keys. Named reading operations own the key
wait (`readWithKey`: listen for `scrollend` before the press, press after two
drawn frames), Tab walks, touch reading and document/bottom probes. Board is
never pre-focused in a way that removes the body-to-Board promise, and no
measurement is synthesized or bound loosened. The in-profile repeat proof of
body-to-Board handoff keys moves to slice 9 (O3).
Safe stop: keyboard/touch callers use the shared operations and C2 passes.

Accepted (2026-11-12): `boardReading.ts` adds `readWithKey` (Board or
document region) and `expectReadWholeInCard`. `tabTo` moves from
`responsiveAccess.ts` to `accessibleReading.ts`.
- `board-reading` and `board-native-reading` drop their local scrollend races and adopt the O1 probes.
- `accessible-board-keyboard` uses `tabTo`.
- `accessible-board-touch` uses `expectReadWholeInCard` four times.
- `reviewTouchReading.ts` uses `expectDocumentStill`.

`accessible-board-scroll` stays at HEAD on evidence (slice 9). Proof:
- C2 16/16 (load 41→37).
- C1, Review touch and responsive-session-access 26/26.
- In-profile `board-reading` key journey 40/40.
- Typecheck exit 0.

About 16 mechanics sites removed; helper +50 lines, specs/support net −43.

### 3. Follow project, header and destination focus through shared controls
Type: Behavior
Status: done
Proof: C3; preserve compact/wide transitions, actual key order, perspective,
selected project, sanitized/pinned links and arrival focus/scroll. Example 3.

Behavior: Given a current project and viewport, named project/frame/destination
actions expose where the reader arrives and what stays selected. Reuse existing
project/shortcut/source owners; independent exact-name/URL contracts stay
explicit. Safe stop: these navigation callers stand alone with their assertions.

Accepted (2026-11-12): `projectChoice.ts` adds `projectTab` and
`pressProjectListKeys`. New `bannerReading.ts` adds `expectBannerRow`,
`bannerStops` and `expectPinnedShortBanner`, and now holds `expectBelowBanner`,
moved from `boardPage.ts`. `expectRoute` also reads `story`. Other additions:
`expectCatalogStories`, `focusCanonicalRecord`, notification arrival/focus
readers, and `followLeavingDashboard` taking the caller's project. Proof:
- C3 35/35.
- `board-kept` and `project-read-isolation` 7/7.
- After refactor, notification, eligibility and keyboard-navigation 13/13.
- Typecheck exit 0.

About 85 mechanics sites removed (28 project-tab radios, 12 membership
literals, 10 story-param reads and others). Helpers about +100 lines, specs
−139. `source-navigation` keeps exact `target`/`rel` reads direct.
Project-tab callers outside navigation are O4 (slice 8).

### 4. Inspect and follow references without hiding interruption
Type: Behavior
Status: done
Proof: C4, including all three Done-cancellation cases and selection/dependency,
identity, scroll-completion, failure/retry and repeated-destination cues. Example 4.

Behavior: Given a pending reference, the scenario states its later choice,
release and expected destination/focus. Share card/reference controls with
procedural/fluent consumers while retaining separate down/up, Tab, Inspect and
Show latest 10 actions. Keep selected versus inspected state distinct. P1–P3
support this seam. Safe stop: navigation and every interrupted continuation pass.

Accepted (2026-11-12): new `storyReference.ts` holds the Dependencies
disclosure, list and reference, `followReference`, the notice and Retry, and
the pending Done destination. `storyCardControls.ts` adds `storyCard`,
`hideDetail`, `canonicalRecord` and `pointerDownOn`. `storyCardSelection.ts`
adds `emptyArea`. `storyReferenceDone.ts` adds `serveDoneReferences` and
`doneTitlesThrough`. The fluent `StoryCard` composes the same controls.
Done-cancellation shares the pending jump as `followHeldFarReference`, while
hold, release, pointer-down, focus checks and pointer-up stay separate lines.
A P2-style fault (no `mouse.down`) failed `not.toBeFocused`, and the file was
restored byte-for-byte. Proof:
- C4 22/22.
- Reached consumers 27/27.
- After refactor, 6/6.
- Typecheck exit 0.

About 180 mechanics sites removed; helpers +110 lines, callers about −205.
Remaining same-control callers are O5 (slice 8). Done column mechanics belong
to slice 6.

### 5. Read card and roster facts with independent expected evidence
Type: Behavior
Status: done
Proof: C5 plus reached launch eligibility, session attribution, published-fact
and branch-refresh consumers. Expected actor, ordering, badge/state, links,
slice counts, malformed text, avatar source and request counts remain explicit.
Example 5; owns the Story card evidence finding.

Behavior: Given published preparation/dependencies/assignments/progress, named
card/roster observations explain available facts and gaps. Reuse scoped readiness
and portrait readers, extracting repeated credit/progress mechanics where needed.
Keep raw invalid bytes, history/HTTP evidence and MakeMe setup outside browser
owners. Safe stop: all card-evidence finding/caller dispositions are supported.

Accepted (2026-11-12): new `agentCredit.ts` holds the credit parts of a
card, detail or roster member, plus `expectHumanAvatar` and
`expectHumanInitials`. New `storyCardFacts.ts` holds badges (including
`blockedByAnyDependency`), `expectSliceBar` and `expectNoSliceCount`.
Readiness, queued-plan and published-facts support, the 17 C5 specs,
`start-eligibility` and `session-attribution` use them. Expected actors,
orders, statuses, links, slice counts and malformed texts stay at the call
sites. Sites migrated for earlier obligations:
- O2: `branch-progress-reading`.
- O4: `story-readiness`, `direction-disclosure`, `storyReadinessRefresh`.
- O5: readiness, queued-plan and published-facts support.

Proof:
- C5 26/26.
- Consumers 20/20.
- After refactor, 4/4.
- Typecheck exit 0.

About 290 mechanics sites removed; helpers +157 lines, whole change about
−100 lines. Remaining callers are O6 (slices 7–8).

### 6. Reveal and retain Recently done ranges through one column owner
Type: Behavior
Status: done
Proof: C6 plus reached C1/review/retained-session consumers; preserve visible
entry order/count, nested versus standalone entries, exact requested paths,
held failures/retry, collapse focus, retained position and pending destination.
Example 6; owns the Recently done finding.

Behavior: Given a partial range, reveal/latest/refresh/session-reference actions
show the expected range and keep or supersede the chosen destination as stated.
Extend existing column/progressive owners. Replace the reached `settle` helper's
500 ms wall-clock delay with completed read/render/motion observations; use
controlled clocks where time drives behavior. Retain request-count evidence
rather than swapping the delay for an unconditional immediate check. Safe stop:
all its callers use causal completion and the range/navigation journeys pass.

Accepted (2026-11-13): the 500 ms `settle` delay is gone. Its 28 sites wait
on `untilPageRests` (the Board rests and its reads are answered),
`untilBoardRests`, `untilPageReadsAnswered` or `wheelToBoardEnd`, and a
revision check uses `passTimeUntilChecked`. New and moved owners:
- `recentlyDoneColumn.ts`: `revealAction`, `showLatestAction`.
- `columnCountOf`.
- `boardPage.ts`: `wheelToBoardEnd`.
- `boardReading.ts`: `watchBoardScroll`, sharing one scrollend listener with `readWithKey`.

Fault checks: an answer that extends the list after Show latest 10 failed both
post-release checks. Without the new wait, it passed unnoticed or was blamed
on the wrong step. Product files were restored byte-for-byte. Proof:
- C6 39/39.
- Consumers 13/13.
- After refactor, 7/7.
- Typecheck exit 0.

About 60 mechanics sites removed (28 `settle`, 19 `.column-count`, Show
latest, watchers, wheels); helpers about +36 lines. O2 refresh sites and the
O6 read-latency and recently-done-stories credit sites were migrated.

CI repair after slice 6 (run 43259996446/1,
`authenticated-read-plugin-hooks.spec.ts:33`: a held `gh` was still alive
after the server closed). The shell `fake-gh` exit cleanup sent TERM to a
just-forked child, which can drop it while still running the parent's trap,
so `gh` waited forever on `curl`. Cleanup now sends KILL. A direct
reproduction left 16–33 of 600 stuck before the fix and none after. Proof
after the fix: the focused trio ×20 passed 240/240, and the backend
observation and runtime folders passed 307/307.

### 7. Read arriving facts and retained cards through shared observations
Type: Behavior
Status: done
Proof: C7; retain held group identity, independent release/failure order,
placeholder history, card text/box snapshots, pinned links, selected/inspected
story, focus/viewport and the reader's later wheel move. Example 7, arrival/carry.

Behavior: Given open scrolled inspection and held facts or a new revision,
shared observations show what remains and what changes when each answer arrives.
Extract snapshot/placeholder mechanics from `steady-refresh-carry.spec.ts` into
focused reading support, composed with card owners from slice 5; callers retain
old/new expected values and revision normalization under proof. Safe stop:
arrival/carry finding dispositions are green without recovery changes.

Accepted (2026-11-13): new `retainedFacts.ts` holds `shownCards`,
`notePlaceholders` and `expectNoPlaceholderShown`, moved out of
`steady-refresh-carry`. `storyCardFacts.ts` adds `badges`, `preparationFacts`
and `storyPurpose`. The published-facts specs reuse `watchPageErrors`. Holds,
release and failure order, clock steps, request logs, `pinnedAtB` and
`unpinned` stay in the specs, and the scroll-away test now asserts the
reader's place. Fault checks in `carriedFacts.ts`:
- An early uncarried partial failed the placeholder record.
- Uncarried preparation failed the card snapshot.

Product files were restored byte-for-byte. Proof:
- C7 26/26.
- Consumers 9/9.
- After refactor, 19/19.
- Typecheck exit 0.

About 62 mechanics sites removed; about +22 lines net. Migrated for earlier
obligations:
- O2: `published-facts-reading` L52–59 and L152–160, `readingPlace.ts`.
- O4: isolation spec and journey.
- O5 and O6: the C7 files.

`untilBShownWhileHeld` stays duplicated in the carry and bound specs, as a
named causal gate at each call site.

CI repair after slice 7 (run 43267639966/1, teardown ENOTEMPTY in
`recently-done-sessions-select-supersede.spec.ts:47`): a cancelled synthetic
`gh` was still exiting, and writing into the temp root, as it was removed.
This applies trunk's 30f2ef263 byte-for-byte (a call stays recorded until its
`gh` is gone). It also fixes fake-gh's auth hold, which watched its directory
and could miss a release on macOS; it now watches the hold file. Before the
fix, both reproduced (3/12 and 87/400). Proof after:
- Failing spec ×10 20/20.
- Hold ×30 under load 120/120.
- Consumer cohort 330/330.
- `dashboard/tests/sessions` 229/229.
- github-request node tests pass.

### 8. Read recovery and limits without concealing timing or source truth
Type: Behavior
Status: done
Proof: C8 plus consumers outside observation reached by changed recovery/card
owners. Retain controlled schedules, request logs/counts, failed/retained/fresh
revisions, profile/credit source, notices, retry, placeholder and focus evidence.
Example 7, recovery; completes the published facts/refresh/recovery finding.

Behavior: Given a failed, limited or independently delayed read, named visible
fact/notice observations explain retained truth and subsequent recovery around
explicit clock and answer steps. Extend focused recovery/card owners rather than
wrapping whole scenarios. Finish all six finding/caller comparisons, including
justified direct-contract observations. Safe stop: every finding and reached
caller has a completed disposition and the combined affected proof passes.

Accepted (2026-11-13). Recovery:
- `transientRecoveryPage.ts` holds `recoversAt`, `passTimeToRecovery` and `expectEarlierSnapshotKept`, all through `limitNotice.ts` `timeSaid`.
- `agentCredit.ts` adds `humanGap`, `branch` and `detailHuman`.
- `storyCardControls.ts` adds `slicePlanLink`.
- `limitRecoveryCredit.ts` is shared by limit and transient credit recovery.
- `selectSettledDoughnut` inspects and focuses before awaiting reads.

O7's 1 s delay became a route hold released on observed preparation and
focus. The O2/O4/O5/O6 sweep reached the named launch, session, review,
terminal, Intent, stories and observation sites; the remaining raw sites have
direct dispositions in the obligations. Fault checks, with product files
restored byte-for-byte:
- O7 fault (no wait for independent reads): 3/3 failures.
- Snapshot-time fault: 3/3 failures at `expectEarlierSnapshotKept`.

Proof:
- C8 27/27.
- Combined C1–C8, changed specs and reached consumers 306/306 (load ~4).
- After refactor, 36/36.
- Typecheck exit 0.

Recovery share: about 126 mechanics sites removed across 29 files. Helpers
about +55 lines; the slice is about −80 lines.

### 9. Prove native reading keys under the decided load
Type: Behavior
Status: planned
Proof: in-profile repeat proof (one worker, external load ≈28–36,
`--repeat-each=40` or more) of `board-reading`, `board-native-reading` and
`accessible-board-scroll` key journeys, with unchanged-form comparisons at
the same load; C2 after any change. Owns O3.

Behavior: Given body-to-Board handoff keys under the decided load, the reading
journeys pass without retry, relaxed bound or timeout change. A bounded
diagnosis (Terry, 2026-11-12) looks for a compositor-ready signal to wait on
instead of animation frames, and compares a suite-wide Chromium key-scrolling
setting (smooth or threaded scrolling off). Any suite-wide setting returns to
Terry before it lands. Runs need ambient load at or below the profile; check
`uptime` first.
Safe stop: the key journeys pass in profile, or the diagnosis evidence and the
remaining decision are recorded for Terry.

## Proof commands and execution gates

For each Cn regex below, run `caffeinate -i npm run test:dashboard -- '<regex>' --workers=1`
on battery with lid open; on AC use `caffeinate -s -i`. P5 uses the same runner
and regex with `--list --reporter=json` instead of a behavioral run.
P5 selected C1: 19, C2: 16, C3: 35, C4: 22, C5: 26, C6: 39, C7: 26, C8: 27 cases; all eight listings exited 0 without errors.
Selection evidence: `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/board-cohort-selection-1l9gp5uo/cohorts.json`.

| Cohort | Regex |
| --- | --- |
| C1 | `/tests/navigation/board-(scroll|paging[^/]*|height|clamp|kept)\.spec\.ts$` |
| C2 | `/tests/navigation/(accessible-board[^/]*|board-(reading|native-reading|session-reading))\.spec\.ts$` |
| C3 | `/tests/navigation/(dashboard-header[^/]*|project-(keyboard-navigation[^/]*|selection)|development-intent-frame[^/]*|notification-story-navigation|source-navigation)\.spec\.ts$` |
| C4 | `/tests/navigation/(story-card-[^/]*|story-reference-[^/]*|story-destination-repeat-cue)\.spec\.ts$` |
| C5 | `/tests/stories/(backlog-preparing|preparation-legend|story-readiness[^/]*|story-dependencies[^/]*|agent-roster[^/]*|taken-(slice-progress|agent-profile|execution-complete)|branch-(slice-progress|progress-reading))\.spec\.ts$` |
| C6 | `/tests/stories/recently-done-(progressive[^/]*|read-latency|stories)\.spec\.ts$|/tests/navigation/story-reference-done[^/]*\.spec\.ts$|/tests/sessions/recently-done-sessions-sidebar-(navigation|paging-board)\.spec\.ts$` |
| C7 | `/tests/observation/(published-facts-[^/]*|steady-refresh[^/]*)\.spec\.ts$` |
| C8 | `/tests/observation/(auto-refresh-(recovery|rate-limit)|profile-addition-latency|transient-(credit-recovery|read-recovery|detail-recovery|recovery-currentness|recovery-lifecycle)|owner-replacement-recovery|limit-recovery-(credit[^/]*|detail)|limited-reading-profile-history)\.spec\.ts$` |

Run changed specs and transitive consumers per [own executable proof](../../../.agents/skills/dough-story-refinement/references/executable-proof.md),
including aggregate text/count/focus observers and indirect wrappers; produce the
consumer trace and disposition every reached caller as run, reused or excluded
with a boundary reason. Cohorts reuse sufficient proof at unchanged boundaries.
Shared card/column owners reach launch/session/Intent/review callers: their
presence outside the initial cohort never excludes their proof. A changed shared
fixture justifies a broader local cohort; CI configuration alone does not.
Run `npm run typecheck:dashboard` for shared TypeScript changes under the
[test guidance](../../../tests/README.md#waits-fixtures-and-teardown).

Apply [MakeMe](../../../tests/README.md#test-data-architecture) to domain setup;
exact invalid bytes/keys and independent expectations remain explicit. The
installed entry selector at the preparation base resolved both convention flags
false for these spec entries; AGENTS.md independently required MakeMe.
Recheck selection when paths change. Preserve tiers, default timeouts and causal
waits; no wall-clock sleeps, `test.slow()`, suite/file/hook timeout override.
The local-gate sleep guard and power condition are maintained in
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Carry the project's [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written, by this link or verbatim, into every delegation and repair handoff.

## Current decisions, concerns and readiness

Eight cohesive proof loops keep layout separate from input ownership and
arrival/carry separate from recovery; each includes cleanup and caller sweep.
No numeric slice target or hard limit was supplied. Reassess actual scope and
helper cost at each boundary; do not split by file or introduce deferred machinery.
Slice-plan refinement was not needed: the rewritten boundaries have distinct
observable outcomes and reuse the same existing component owners cumulatively.

The former slice 2 blocker is settled. The End failure is load-sensitive key
timing in the test, not an app focus defect. Terry set the load profile
(moderate to somewhat high load, not extreme). The remedy observed in that
profile is recorded in the premise rows; slice 2 owns applying and replaying it.
No other slice-boundary/proof-ownership concern was identified in this review;
this is neither completed execution nor authority to begin it.

Slice 2 stopped on 2026-11-12. Under the decided load, the remedied
`board-native-reading` failed 1/40 and `accessible-board-scroll` 2/40 at
body-to-Board handoff keys, while `board-reading` passed 40/40. Each failure
ended in `scrollend` with no movement. The unchanged forms show the same
symptom, and above the profile so did the ordinary-document comparator.
Terry chose (2026-11-12) to fund a bounded diagnosis and to let slices 3–8 go
first. Slice 2 delivers the shared reading operations; slice 9 owns the
in-profile key proof and the diagnosis (O3). Evidence:
`/Users/terryyin/.claude/jobs/7c2dd325/tmp/slice2-*`.

## Story obligations

### O1. Board reading-key and touch probes still read the document and Board bottom inline
Reported: slice 1 — "Same probes, not yet migrated, in slice 2 territory: board-reading L75 (key test), board-native-reading L58 (`scrollY`) and L50 (bottom), board-reading L46 (bottom poll), and `support/reviewTouchReading.ts` L113/L117 (Review touch)."
Story clause: "Shared browser controls and repeated reading observations have one maintained owner"
Disposition: proved by slice 2: board-reading/board-native-reading use expectAtBoardBottom, expectDocumentStill and scrollYOf; support/reviewTouchReading.ts reachReviewControl uses expectDocumentStill; native-document comparator L41/43 stays direct; C2 16/16 and Review touch 4/4 passed

### O2. Raw Board scroll-place reads outside the cohort duplicate the Board owner (slices 5–7 sweep their own files; slice 8 the rest)
Reported: slice 1 — "Raw `.board-scroll` scroll-place reads outside the cohort that duplicate `scrollYOf` / `wheelTo`: `readingPlace.ts:46`, `terminals/agent-launch-ad-hoc-terminal.spec.ts` L49–80, `sessions/sessions-sidebar-navigation-cases.spec.ts` L245, `review/story-review-file-moves.spec.ts` L53, `stories/branch-progress-reading.spec.ts` L35–40 (slice 5), `stories/recently-done-progressive-refresh.spec.ts` L114–128 (slice 6), `observation/published-facts-reading.spec.ts` L52–59 and L152–160 (slice 7)."
Story clause: "Shared browser controls and repeated reading observations have one maintained owner"
Disposition: proved by slice 8: published-facts-reading, readingPlace, branch-progress-reading and recently-done-progressive-refresh (slices 5–7), agent-launch-ad-hoc-terminal, sessions-sidebar-navigation-cases and story-review-file-moves (slice 8) use scrollYOf/wheelTo; remaining raw reads are in-evaluate geometry probes; combined 306/306

### O3. Body-to-Board reading keys sometimes scroll nothing within the decided load profile
Reported: slice 2 — "In profile, every remedied failure is at a body-to-Board handoff key (End from body; Meta+ArrowUp after blur): 3/80 remedied versus 0/80 unchanged on the same two specs."
Story clause: "Necessary test/harness repair follows the project's failing/flaky-test policy."
Disposition: receiving slice 9

### O4. Raw project-tab radio locators remain outside navigation
Reported: slice 3 — "Raw `project.getByRole("radio",{name,exact:true})` sites remain outside navigation: in this story's later territory: `stories/story-readiness`, `stories/direction-disclosure`, the `observation/*` project-read/transient/auto-refresh/shared-observer/read-failure specs, `storyReadinessRefresh.ts`, `doughnutJourney.ts`, `limitedReadingJourney.ts`, `publishedFactsIsolationJourney.ts`; in sibling families: `responsiveStart.ts` and `launches/responsive-session-recovery-restart`, which are launch-family and also omit `exact`."
Story clause: "Shared browser controls and repeated reading observations have one maintained owner"
Disposition: proved by slice 8: every named project-tab site uses projectTab/chooseProject; checked radio-state reads and configuration/settings families stay direct; combined 306/306

### O5. Card, Canonical record and empty-area controls still have raw callers outside slice 4's reach
Reported: slice 4 — "Raw `/^Canonical record/` link locators remain in about 20 other files (doughnutJourney, storyReadiness*, queuedPlanNavigation, responsiveStart, publishedFactsAssertions/IsolationAssertions, accessible-board-keyboard, source-navigation, project-selection, branch-progress-reading, story-dependencies-touch, observation/*). Left for slice 8. Card-by-title `getByRole("article",…)` remains suite-wide (about 180 sites). Empty-area heading clicks remain in the Intent family."
Story clause: "Shared browser controls and repeated reading observations have one maintained owner"
Disposition: proved by slice 8: no raw Canonical record or Slice plan locator outside storyCardControls; emptyArea in Intent sites except two existing single owners; card role-and-name lookups in sibling families excluded from wholesale migration; combined 306/306

### O6. Raw credit, badge and progress selectors remain outside slice 5's reach
Reported: slice 5 — "Observation (slices 7/8): limited-reading-profile-history, profile-addition-latency, published-facts-reading/isolation, steady-refresh-inspection, transient-credit-recovery, unchanged-assignment-credit, reopened-project-reads, revision-stream, auto-refresh-branches, `limitRecoveryCredit.ts`, `publishedFactsIsolationAssertions.ts`. Other families: launches/agent-launch-story-card-noted-start, responsive-session-reconciliation, agent-launch-preparation-cursor, stories/recently-done-read-latency, recently-done-stories, nerds-cartoon-portrait, taken-admitted-investigation, intent/intent-story-coverage, `storyCardAttention.ts`."
Story clause: "Shared browser controls and repeated reading observations have one maintained owner"
Disposition: proved by slice 8: named credit/badge/progress sites use agentCredit/storyCardFacts, except intent-story-coverage, which now reads its own "Done stories could not be read." problem text (it only shared the CSS class); storyCardAttention and agentPortrait keep one-turn/self-owned selectors; combined 306/306

### O7. A published-facts test delays a read by wall-clock time
Reported: slice 7 — "`published-facts-isolation.spec.ts` L108–114 delays the profiles request with `setTimeout(resolve, 1_000)` in a route handler. AGENTS.md says never wait for wall-clock time."
Story clause: "Use MakeMe for domain data and observable waits or controlled clocks."
Disposition: proved by slice 8: published-facts-isolation releases a route hold after observed preparation and canonical-link focus; fault (no wait for independent reads) failed 3/3; spec 6/6
