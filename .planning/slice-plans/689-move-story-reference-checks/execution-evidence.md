# Execution evidence

Working evidence for [the plan](PLAN.md): its decisive premise observations
and, per slice, the assertion map and scratch-break record its gates require.
Removed at wrap-up; Git keeps it.

## Decisive premises and observations

Observed in this workspace at `3bc53f5cc38e2be8a1ca25384a6732461540603e`,
2026-11-18, AC power, load 5–19, after `node scripts/setup-native.mjs npm`,
`browser` and `check` (exit 0 each). Scratch edits were reverted
(`git status` shows only this preparation's seed and plan).

| Premise and consuming operation | Result and remainder |
| --- | --- |
| P1. The six interim specs pass before conversion (every slice's baseline). | `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/integrated.playwright.config.ts navigation/story-reference --reporter=list --workers=2`: 19 passed (55.9 s), exit 0. |
| P2. The Frontend homes the slices extend run here (slices 1–8). | Same prefix, `--config dashboard/frontend.playwright.config.ts navigation/story-card-dependency-selection.spec.ts navigation/story-url-destination.spec.ts intent/intent-done-project-refresh.spec.ts launches/agent-launch-story-card.spec.ts sessions/follow-up-source-navigation.spec.ts`: 15 passed (19.1 s), exit 0. The Done-reference arrangement, the held acceptance and the catalog hold are new; slices 5, 2 and 7 build them first, and a case they cannot express keeps a Backend or E2E home under the plan's proof rule. |
| P3. With the six specs gone the group runs on one shard and the shard checks pass (slice 8). | Six specs moved aside. `shards: "[1]"` with no `specs`: the listing gives 3 tests in 1 file, unsplit and at `OPEN_DOUGH_DASHBOARD_INTEGRATED_SPLIT=1/1`; `bash scripts/test.sh Distribution/tests/support/browser-group-shards.test.mjs Distribution/tests/support/ci-browser-groups.test.mjs` exits 1 on "an integrated pattern matching no spec fails the configuration naming it", whose edit then lands on the Backend group's first pattern. Keeping `1: dashboard/tests/navigation/source-*` on one shard is refused: "the last shard 1 runs the rest and takes no patterns". With that case pointed at `dashboard-backend` (`dashboard/backend-tests/retired/**`), both test files exit 0. Until slice 8, each earlier deletion leaves shard 2 selecting specs (the Done specs go last). |
| P4. Shared support survives the deletions or is removed (slices 2, 4, 7, 8). | Whole-checkout search of `dashboard`, `e2e` and `Distribution/tests` outside the six specs: `storyReferenceDone.ts` exports, `takeSupplier`, `holdDestinationCueWhileFading`, `expectDestinationCueRestarted`, `passPartOfCue`, `retryReference`, `pointerDownOn` and `passTimeToRecovery` have no other importer; `recordDependency`, `publishDependencies`, `suppliersInOneSeed`, `secondInSeedB`, `referenceNotice`, `doneDestination`, `showLatestAction`, `expectReadingTop`, `recordsAsked` and `untilPageRests` keep E2E or Frontend importers. Execution's consumer trace rechecks after each deletion. |
| P5. Each replacement discriminates (every slice). | Not observable before the replacements exist: each slice's paired scratch break settles it and records the result here. |

Refinement: not needed; eight slices with one proof loop each, at the slice
limit, sharing two new arrangements (active dependencies exist; Done
references are built once in slice 5).

Remaining slice-specific concerns: none identified in this review.

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
attempt is the starting state. `frontendLaunchSubstitutes.ts` is unchanged.

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

CI repair (2026-11-18): run 44233235497 attempt 1, Distribution Tests 3/3 at
2552c531 exhausted its 320 s run deadline (test step 305 s; every check about
twice its fast-runner time, none failing). `rebalance-ci-shards` over five main
runs: shares 563/609/681 s against 618; accepted change adds
`Distribution/tests/installation/update-*` to share 1 (623/609/622). Proof:
share listings 262/76/322 checks; share-matrix, split, selection and
browser-group checks and lint exit 0. Published `05828f0b`.

CI repair (2026-11-18): run 44234977392 attempt 1 at 05828f0b, dashboard-backend
1/3, `fake-gh-in-process-scopes.spec.ts` "simultaneous servers keep distinct
answers across a restart on one machine" failed with `listen EADDRINUSE`
127.0.0.1:34351. Cause: test servers started on `--port 0` took an ephemeral
port; a restart on that named port lost it to any other `listen(0)` or outgoing
connection. A scratch reproduction took the freed port before the restart (same
EADDRINUSE); after the repair 60000 anonymous binds never reached it. Repair:
`testServerPort.ts` gives unnamed test servers a leased port from 20000–32767,
below the ephemeral range (checked at runtime); named ports still never move.
Proof: full dashboard-backend group, focused backend rerun 10/10, frontend and
e2e restart users, lint and typecheck (evidence `fix-eaddrinuse-*`, `r3-*`).
