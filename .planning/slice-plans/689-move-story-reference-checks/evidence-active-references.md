# Active-reference evidence

Assertion maps and scratch-break records of slices 1–4 of [the plan](PLAN.md).
Removed at wrap-up; Git keeps it.

## Slice 1. Follow a reference to an active story

Assertion map (interim → Frontend `story-reference-navigation.spec.ts`, same
test names; "first" = "a dependency opens its active story…", "gap" = "an
identified active block with unreadable detail…"):

- Setup: `twoDependencies` revision + long `B.md` seed + `publishCommittedOrigin`
  (`follows`) → `putFrontendActiveReference` (`frontendStoryReferences.ts`,
  `putFrontendDependencies` plus the seed); GitHub page route → same helper;
  `hasTouch`, 1280×500 kept. Interim `openUntilRead` guard dropped (no real
  server refresh); `pausePageClock` kept in first, which passes cue and check
  time itself, with `preholdRevisionStreamSlots` for the recurring check.
- first, step 1: detail region (`storyDetail`) visible; card focused; card taller than the
  viewport; `expectReadingTop`; cue with motion; no `.story-card-selected`;
  `expectCueEnds`; `expectSelected(false)`; page host `127.0.0.1` (8a).
- first, step 2: empty-area click selects; repeat follow cues, keeps
  selection, detail open (`expectInspected`), reading top.
- first, step 3: `passPartOfCue` + `holdDestinationCueWhileFading`, repeat
  follow → cue, `expectDestinationCueRestarted`, selected, detail open,
  focused; again after 1000 ms and `expectCueEnds` (8b).
- first, step 4: popup heading "Source evidence"; URL
  `https://github.com/<openDough repository>/blob/<published revision>/.planning/seeds/B.md#b` (8c).
- first, step 5: hide detail, focus Story A's Inspect, later revision through
  `advanceFrontendDoneProject` (revision + files, `passTimeUntilChecked`) →
  read revision shows the new short revision, Story B's detail closed,
  Story A's Inspect focused (8d).
- first: `claudeLaunchCalls`/`claudeAttaches` empty → `recordHostRequests`
  empty.
- gap: `B.md` answered with GitHub 404 → `failFrontendSupplierSeed` (boundary's
  actionable 502 failure, no transient recovery); dependency summary visible;
  `.preparation-problem` in detail; focused; in viewport ≥ 0.5;
  `referenceNotice` empty; added `recordHostRequests` empty.

Scratch break (2026-11-18): fault — `useStoryReferenceJourney.follow` in
`dashboard/src/storyReferenceJourney.tsx` also called
`StorySelectionOnPage.select(reference)`. Command
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts navigation/story-reference-navigation.spec.ts --workers=2`
→ exit 1: first failed at `expect(page.locator(".story-card-selected")).toHaveCount(0)`
(unexpected value "1"); gap passed. Restored byte-for-byte from a copy
(`git diff -- dashboard/src` empty); same command → exit 0.

## Slice 2. Reveal a starting story without opening it

Assertion map (interim "a reference reveals a starting story…" → Frontend
`story-reference-navigation.spec.ts`, same test name):

- Setup: interim `publishCommittedOrigin` (`follows`) with the
  `twoDependencies` revision, `claudeScenario("held")` and `openUntilRead` →
  `putFrontendDependencies(twoDependencies())`, `installFrontendLaunchBoundary`
  with `frontendAttempt(...).accept`, `recordHostRequests`; real-server read
  guard dropped.
- Start execution on Story B, dialog Start → same, plus the dialog closes.
- Inspect story disabled (9a precondition) → `inspectionToggle(supplier)`
  disabled while the accepted attempt runs unlaunched.
- `claudeLaunchCalls` reaches 1 within `launchWaitMs` (the real Take and host
  invocation) → not a Frontend concern. 5a premise is false: E2E
  `e2e/launches/agent-launch-start-dependencies.spec.ts` has one case, "a
  blocker published after the card rendered refuses real startup before claim
  or native launch", which asserts `takenProfiles()` and `claudeLaunchCalls()`
  empty, not a real Take. The real Take of a ready story with host invocation
  is E2E `e2e/launches/agent-launch-story-card.spec.ts` "only explicit Start
  sends the exact multiline draft and the card distinguishes accepted startup
  from a launched session" (Start disabled during "Local startup in progress",
  `claudeLaunchCalls` length 1 while held, lines 162–180); the developer chose
  that case as the home (G1).
- Follow from Story A → Story B focused (9a); detail region count 0 →
  `storyDetail(supplier)` count 0 (9a); `canonicalRecord` visible (9a).
- `claudeLaunchCalls().length` unchanged and `claudeAttaches` empty →
  `hostRequests()` equals exactly `["POST /__agent-launch/accept"]` at that
  point (9b/5b: one acceptance, no other launch or attach request).
- `releaseHeldClaude` then Inspect enabled (30 s) → `attempt.launch(Story B
  executing record)` + `boundary.tellChanged()`, Inspect enabled at default
  timeout; `boundary.acceptances` length 1. After launch the page sends
  `POST /__agent-launch/reconciled` (bookkeeping, not a launch or attach), so
  the exact request list is asserted before the launch only.

Held acceptance: not added. With the acceptance held, the Start dialog stays
open (`expect(dialog).toBeHidden()` failed, run `s2-focused3`), so a held
acceptance cannot reach the reference journey; the accepted, still-running
attempt is the starting state. slice 2 left `frontendLaunchSubstitutes.ts` unchanged.

Support removal (consumer trace in `evidence/s2-consumer-trace.md`, base
`2552c531`): nothing removed. `takeSupplier` keeps
`dashboard/tests/navigation/story-reference-identity.spec.ts`; the cue helpers
(`holdDestinationCueWhileFading`, `expectDestinationCueRestarted`,
`passPartOfCue`) keep the Frontend spec; `launchWaitMs`, `notFoundAnswer`,
`publishCommittedOrigin`, `openUntilRead`, `passTimeUntilChecked`,
`emptyArea` keep other importers.

Scratch break (2026-11-18): fault — `dashboard/src/Columns.tsx` line 170, the
reveal's `inspect(opening.identity)` guard
`launches.storyStartupOf(...) === undefined` became `... === undefined || true`.
Command
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts navigation/story-reference-navigation.spec.ts --workers=2`
→ exit 1: the new case failed at `expect(storyDetail(supplier)).toHaveCount(0)`
(received 1); others passed. Restored from a copy (`git diff -- dashboard/src`
empty, 0 bytes); same command after deleting the interim spec → exit 0.

## Slice 3. Tell references apart by identity and project

Assertion map (interim `dashboard/tests/navigation/story-reference-identity.spec.ts`
→ Frontend `dashboard/frontend-tests/navigation/story-reference-identity.spec.ts`,
same test names; arrangements in `dashboard/tests/support/frontendStoryIdentities.ts`):

- "distinct stories in one seed…": setup `suppliersInOneSeed` revision,
  `recordDependency` (second story waiting), `takeSupplier`,
  `publishDependencies`, `publishCommittedOrigin`, `openUntilRead` →
  `putFrontendSuppliersInOneSeed` publishes the result directly (Story B Taken
  with its plan, Story A's seed with agreements on Story B, Story C and the
  second story). The real CLI write, Git publication and real-server reading
  of the same data stay in E2E `e2e/stories/story-dependencies.spec.ts` "two
  suppliers sharing one seed display their titles and open their own stories"
  (verified: asserts both references' blob hrefs at the published revision,
  `#b` and `#second`, and that following each focuses its own card).
- 390×844, reduced motion, reveal recorder → same; the recorder is now the
  shared `recordReveals`/`revealsOf` in `dashboard/tests/sessionNavigationJourney.ts`
  (refactor r5 removed a duplicate in `storyReference.ts`).
- Tap opens Dependencies; keyboard follows "Second story in seed B" → same (10c).
- Second's detail visible, focused, in view (ratio 0.5) → same via
  `storyDetail` (10a, 10d); Story B's detail count 0 → same.
- Last reveal behavior `"auto"` → `revealsOf(page)` last `"auto"` (10d), now
  also asserted after the tap.
- Tap follows "Story B": detail visible, focused, in view → same (10a, 10c).
- Second's detail stays open → same (10d).
- `claudeLaunchCalls`/`claudeAttaches` empty → `hostRequests()` equals `[]`.
- "each project's rendered pinned reference…": Open Dough
  `publishCommittedOrigin` of the `twoDependencies` revision →
  `putFrontendDependencies(twoDependencies())`; Pygardon `startOrigin` with its
  own seed, `recordDependency`, `publishDependencies` → `answerPygardonTelling`
  publishes Pygardon's telling of SEED-B#b through `answerOwnPublications` at
  the catalog Pygardon revision.
- Follow Story B on Open Dough, focused → same. Choose Pygardon, summary
  visible, open Dependencies → same.
- Reference href is Pygardon's blob URL at its revision → same (10b).
- Click opens "Pygardon selected story": detail visible, focused, in view;
  Story B absent; route `project=pygardon` → same (10b).
- `claudeLaunchCalls`/`claudeAttaches` empty → `hostRequests()` equals `[]`.

Support removal (consumer trace `evidence/s3-consumer-trace.md`, base
`c3459b69`): removed `takeSupplier` from `dashboard/tests/storyDependencyFixture.ts`
(no importer left in dashboard, e2e or Distribution/tests). Kept:
`takeConsumer`, `recordDependency`, `publishDependencies` (E2E
`start-eligibility.spec.ts`, `story-dependencies.spec.ts`);
`suppliersInOneSeed`, `secondInSeedB` (E2E `story-dependencies.spec.ts`,
`frontendStoryIdentities.ts`). Other interim imports keep many importers.

Scratch break (2026-11-18): fault — `dashboard/src/dashboardDestination.ts`
`activeStoryAt` matched `entry.identity.split("#")[0] === target.identity.split("#")[0]`
(the seed, not the identity). Command
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts navigation/story-reference-identity.spec.ts --workers=2`
→ exit 1 (`s3-break`): the first case failed at
`expect(storyDetail(second)).toBeVisible()` (element not found; the reference
opened Story B); the second passed. Restored from a copy kept in this
directory and then deleted (`git diff -- dashboard/src` 0 bytes); same command
with the interim spec deleted → exit 0 (`s3-focused2`, with
`story-reference-navigation.spec.ts`).

## Slice 4. Recover an active reference

Assertion map (interim `dashboard/tests/navigation/story-reference-recovery.spec.ts`
→ Frontend `dashboard/frontend-tests/navigation/story-reference-recovery.spec.ts`,
same test names; arrangements in `dashboard/tests/support/frontendStoryReferenceRecovery.ts`):

- Setup `originRepository` (`queuedReadyRepository` + `twoDependencies`),
  `publishCommittedOrigin`, `openUntilRead` → `putFrontendRecoverableReference`
  publishes the same revision through `putFrontendDependencies` and keeps the
  page's revision checks (`since`/`at`) held, so only a retry reads the later
  revision (without this the substitute's stream announced it at once and the
  page refreshed itself). `pausePageClock` dropped: no case passes time.
- `origin.publishRevision(queueStoryC)` → `queueStoryC()` publishes Story C
  queued at revision `c3…` (`describedRevisions` + `backlogApart`).
- `published.hold(".planning/PRODUCT-BACKLOG.md")` → `hold()` on Open Dough's
  backlog read (no `path`, `done`, `intent`, `agents`, `branch`, `since`, `at`);
  `answerWith(notFoundAnswer())` → `fail()` answers it 502 with an actionable
  error; `restore()` → `pass()`.
- Case 1: notice empty and marked, Dependencies, reference visible, follow;
  marker kept and "SEED-C#c is unavailable in Open Dough's dashboard" (11a);
  Inspect enabled (`inspectionToggle`); "Reading Open Dough to find SEED-C#c"
  (11b) and Story C count 0; "Could not read Open Dough to find SEED-C#c", not
  "unavailable" (11c); retry → Story C detail visible, focused, in view 0.5,
  notice empty (11d). All kept.
- Case 2: Pygardon `startOrigin`/`publishCommittedOrigin` →
  `answerOwnPublications([catalogPublications.pygardon])`; "unavailable",
  "Reading Open Dough", choose Pygardon, choice kept after release, notice
  empty, no detail region, project control focused (11e) → same.
- Case 3: "unavailable", "Reading Open Dough", Inspect opens Story A's detail,
  release, Story C visible with no detail, Story A's toggle ("Hide detail")
  focused, notice empty (11e) → same.

Support removal (consumer trace `evidence/s4-consumer-trace.md`, base
`d703ce37`): none. `retryReference` stays (new spec and interim
`story-reference-done-recovery.spec.ts`); other interim imports keep many
importers.

Scratch break (2026-11-18): fault — `dashboard/src/storyReferenceJourney.tsx`
problem branch `: follows && readProblem !== undefined` → `: false && follows && …`
(a failed read reads "unavailable"). Command
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts navigation/story-reference-recovery.spec.ts --workers=2`
→ exit 1 (`s4-break`): case 1 failed at line 70 expecting "Could not read Open
Dough to find SEED-C#c", received "SEED-C#c is unavailable in Open Dough's
dashboard."; cases 2 and 3 passed. Restored from a copy in the evidence dir,
then deleted (`git diff -- dashboard/src` 0 bytes); same command with the
interim spec deleted → exit 0 (`s4-focused3`).
