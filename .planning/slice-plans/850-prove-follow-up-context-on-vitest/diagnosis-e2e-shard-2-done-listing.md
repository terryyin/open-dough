# Diagnosis: e2e shard 2 done listing

Round 1. Clock diagnosis `e2e-shard-2-done-listing`. Authorized rounds: 3. Cumulative active minutes after the green proof: 8.8. Remaining 6.2. Overrun false. Story overruns 7. The clock was not paused.

## Failure

- Signature: `e2e/sessions/agent-launch-done-listing.spec.ts:173` "retained sessions listed by their listing facts show as the full answer showed them" failed. `shownRetained` at line 137: `toContainText("Retained session 5")` on Recently done → article "Retained story 5" (exact) → list "Sessions" → article. Error: element(s) not found. Expect timeout 5000ms.
- Reproduction on this checkout: matched, 1 of 1. macOS, one focused Playwright worker, load averages about 9.5 / 8.1 / 8.1 on 16 cores, no competing e2e or Vitest suite. SHA `b52dd0a04e03a01810456453e96ef81fb70acc1b` before the fixture edit.
- CI: repo `terryyin/open-dough`, run `45910156425`, attempt 1, job `140216301781`, `e2e / shard 2/6`, SHA `b52dd0a04e03a01810456453e96ef81fb70acc1b`. https://github.com/terryyin/open-dough/actions/runs/45910156425/job/140216301781
- Tests started `2026-11-26T23:19:02Z` and the failure was reported `2026-11-26T23:19:42Z`. Inventory complete. One failed test. No failure-output artifact for shard 2; the page snapshot was not in the job log. The local run kept one, copied to the evidence file named below.
- This story's commits do not change that spec's assertions, its page objects, or session listing. The previous published SHA `5537a7f01` (run `45866964457`) failed only `dashboard-frontend / shard 1/2`. The only change after that SHA is the frontend shard pattern in `.github/workflows/ci.yml` and this plan. Recent `main` runs are green, and no trunk commit since the Take touches this spec. The spec's dates are absolute, so the same tree fails once the oldest mark crosses 30 days on the server clock.
- The failure is this execution's repair. The cause is fixed in the working tree and not committed.

## Hypothesis

`DoneStoryCard` names the article with the story title only after the done record is read; until then the name is the identity. `StorySessions` renders no Sessions list when `sessions` is empty. `showPage` returns once "Start session in Open Dough" is visible, and the assertion allows 5s. Either the record is still unread or the card has a title and no session list yet. Both produce this locator miss.

Result: the unread-record branch is refuted. The local page snapshot shows article "Retained story 5", identity `SEED-900#retained-4`, a Done time, and Follow up, with no "Reading done story…". Stories 2, 3, and 4 each have a Sessions list. Story 5 does not.

The empty list is launch retention. `readableRecordsByProject` keeps a Done session only while `Date.now() - doneAt` is within `launchRetentionDays` (30). The fixture's `opened` was `2026-10-28T10:00:00.000Z`. Retained session 5 is marked done at `2026-10-27T21:30:00.000Z`.

- At the CI print time `2026-11-26T23:19:42Z` that mark is 30d 1h 49m 42s old, so the server omits it. Session 4, marked done `2026-10-28T00:30:00.000Z`, is 29d 22h 49m 42s old and stays.
- At the local snapshot `2026-11-27T00:28:48Z` session 5 is 30d 2h 58m 48s old and session 4 is 29d 23h 58m 48s old. The snapshot matches that boundary.

The published done catalog still supplies the story card. `StorySessions` renders nothing when the retained array is empty. Waiting on the title would not show a session the server has already dropped.

## Experiments

1. One focused `npm run test:e2e -- sessions/agent-launch-done-listing.spec.ts` through the slice clock `run`, before the edit. Exit 1. Same locator and timeout as CI. Evidence: `diagnosis-done-listing-repro.log`, `diagnosis-done-listing-repro.log.run.json`, `diagnosis-done-listing-repro.exit`, and `diagnosis-done-listing-repro-error-context.md`.
2. After `opened` became `Date.now()`, the same command through the clock. Exit 0. The quiet reporter prints no FAIL line. Evidence: `diagnosis-done-listing-green.log`, `diagnosis-done-listing-green.log.run.json`, `diagnosis-done-listing-green.exit`.

Expensive-proof decision, rechecked: one focused spec on this machine. Not the e2e shard and not a CI rerun.

## Ruled out

- Unread done record, or an article still named by its identity. The snapshot names the story.
- A Sessions list that appears after the 5s assertion. The other three cards already listed their sessions, and session 5 was outside retention at both read times.
- This story's session-listing or page-object edits. There are none. The dates themselves aged out of the server window.

## Fix in the tree

`e2e/sessions/agent-launch-done-listing.spec.ts` sets `opened` from `Date.now()` and still pauses the page clock there. Relative ages are unchanged, so the oldest mark is about 12.5 hours old. No production change. No temporary diagnostic left.

## Unrelated fixture

`e2e/sessions/agent-launch-retained-history.spec.ts` still pins its session clock at `2026-10-28T10:00:00.000Z` and marks its session done five minutes earlier. That mark was still inside 30 days at this round's local read. It crosses the window at `2026-11-27T09:55:00.000Z`. It was not the failing test and was not changed.

## Next step

The confirmed cause is repaired and the same spec passes. Delivery is the coordinator's: this repair is uncommitted. Do not rerun CI from this round.
