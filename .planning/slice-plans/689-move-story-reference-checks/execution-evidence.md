# Execution evidence

Working evidence for [the plan](PLAN.md): its decisive premise observations
and the CI repairs this execution made. Each slice's assertion map and
scratch-break record are in [active-reference evidence](evidence-active-references.md)
(slices 1–4) or [Done-reference evidence](evidence-done-references.md)
(slices 5–8). Removed at wrap-up; Git keeps them.

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

## CI repairs

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

CI repair (2026-11-18): run 44238774522 attempt 1 at c3459b69, dashboard-frontend
1/2, `board-paging-side-panel.spec.ts:102` timed out in
`untilPageRequestsAnswered`: the page sent a change wait with `seen=1` for an
attempt its machine read already showed changed, and the launch substitute held
it until told, while the boundary (`OwnedAttempts.nextChange`) answers it at
once. Reproduced deterministically and as 1 of 40 under load; the substitute now
answers such a wait at once (120 of 120 under load, all 25 consumers of
`installFrontendLaunchBoundary` pass). Published `e1d62059` (evidence `fix2-*`).

Retrospective correction (2026-11-18): the c3459b69 refactor had loosened
`boundary-server.spec.ts`'s launch check to an entry prefix and "no vite";
it again equals the exact command with the served port, `--strictPort` and
`--environment production` (evidence `c7-boundary`, exit 0).
