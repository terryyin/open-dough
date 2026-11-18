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
