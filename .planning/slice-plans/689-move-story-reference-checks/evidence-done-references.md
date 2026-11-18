# Done-reference evidence

Assertion maps and scratch-break records of slices 5–8 of [the plan](PLAN.md).
Removed at wrap-up; Git keeps it.

## Slice 5. Reveal a Done story from a reference

Assertion map (interim `dashboard/tests/navigation/story-reference-done.spec.ts`
tests 1–2 → Frontend `dashboard/frontend-tests/navigation/story-reference-done.spec.ts`,
same test names; arrangement `dashboard/tests/support/frontendDoneReferences.ts`):

- Data seam: the 35 Done records, near/far/later/expired/unlisted references,
  `done*Through` helpers, `doneReferenceSeeds()` and `doneReferenceRecords(now)`
  now live in `frontendDoneReferences.ts`; interim `storyReferenceDone.ts`
  re-exports them and keeps only its Git publishing (`publishDoneReferences`,
  `serveDoneReferences`). Chosen so slice 8 deletes the interim module with no
  data move and slices 6–8 import the Frontend module directly.
- Setup `serveDoneReferences`/`openUntilRead` → `putFrontendDoneReferences`
  (`putFrontendDependencies` for seeds and Story A, `putFrontendDoneRecords`
  for the records) and `page.goto("/")`. `pausePageClock` kept only in case 2
  (`expectCueEnds` passes page time); dropped in case 1.
- `recordsAsked(githubFor(page))` → `recordDoneRecordsAsked(page)`: file names
  the page itself asked in `done=bodies` reads, compared as a set (`asked`).
  The page asks the near and far records twice (supplier title, then range);
  the server sparing a second GitHub read is owned by Backend
  `dashboard/backend-tests/observation/authenticated-read-listed-records.spec.ts`
  "a later revision asks GitHub only for the record whose blob changed"
  (`contentReads(...)` equals catalog plus the changed record only). No Backend
  case added.
- Case 1: ten entries and asked = first ten (12b); far reference visible;
  near focused, in view 0.5, reading top, still ten, asked = ten + suppliers
  (12a near, 12b); far focused, in view 0.5, 27 entries, "Showing 27 of 35
  entries.", asked = 27 + suppliers (12a, 12b); refollow far focused, near
  focused, range kept at 27, asked unchanged (12a, 12b); no session entries,
  notice empty, host 127.0.0.1 — kept. `dashboard.claudeLaunchCalls()`/
  `claudeAttaches()` → `recordHostRequests(page)` empty.
- Case 2: 390×740, reduced motion, tap Dependencies, keyboard follow;
  "Reading done story…", not focused, notice "Reading Open Dough to find
  SEED-227#…" without "unavailable", asked polls to 27 + suppliers; release;
  title reference, accessible name, focused, in view, motionless cue, no
  selected card, cue ends, not selected, notice empty, asked unchanged (12c,
  12b) — kept. `published.hold(farDone.path)` (held every GitHub read of the
  record) → `holdAuthenticatedReadsWhere` on every `done=bodies` ask naming the
  far file. `installFrontendDoneBodyReads.hold` holds only the next ask and
  flaked (the range ask answered the card while the supplier ask was held;
  run `s5-restored.log`), so it is not used.

Scratch break (2026-11-18): fault — `dashboard/src/recentlyDoneRange.ts`
`settle`: `? Math.max(last.requested, through)` → `? last.requested` (a
reference to a later Done story keeps ten shown). Command
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts navigation/story-reference-done.spec.ts --workers=2`
→ exit 1: case 1 failed at `expect(destination).toBeFocused()` (far card not
found), case 2 at "Reading done story…" (destination not found). Restored
from a copy in the evidence dir (deleted), `git diff -- dashboard/src | wc -c`
→ 0; same command with `--repeat-each=3` → exit 0 (6 passed).

## Slice 6. Show a Done reference's gap and read a replaced disclosure when opened

Assertion map (interim tests 3–4 → the same Frontend spec, same names; it is
now 231 lines, so no second spec). Interim spec deleted.

- Setup `serveDoneReferences`/`openUntilRead` → `putFrontendDoneReferences`
  and `page.goto("/")`; `recordsAsked(githubFor(page))` →
  `recordDoneRecordsAsked(page)` (page-side asks).
- Case 3 (12d): `published.answerWith(farDone.path, noConnection)` → new
  `failDoneRecordReads(page, file)` in `frontendDoneBodyReads.ts` (every ask
  naming the far file aborts until `restore`; `failed()` counts them). Poll
  far reads = 1 plus `untilPageRequestsAnswered` → poll `failed()` = 1 (the
  failed title ask finished). Identity reference visible; follow; "This done
  story could not be read.", accessible name = identity, focused, in view 0.5,
  notice empty — kept. Far reads = 2 → `failed()` = 2. Restore, "Retry done
  stories", 27 entries, no "could not be read" — kept. "No path outside 27 +
  suppliers" → distinct asked set equals 27 + suppliers (stronger); far asked
  3 times by the page — kept; refollow focused — kept.
- Case 4: `serveDoneReferences({ follows: true })` + `origin.publishRevision`
  → `putFrontendDoneReferences`, `preholdRevisionStreamSlots` (so the page
  checks on its own clock; without it the second `passTimeUntilChecked` saw no
  check, run `s6-first.log`) and `replacedStoryAAgreements(services)`
  (described later revisions; `publishUnreadable`, `publishReplaced`) in
  `frontendDoneReferences.ts`. Far title visible; "Dependency facts
  unavailable", no disclosure; "Dependencies · 1 blocking", not open; later
  record not asked before opening; title after opening; asked once by the page
  — kept. Whether the server reads GitHub once is Backend's
  (`authenticated-read-listed-records.spec.ts`, see slice 5).

Support removal: re-exports `donePathsThrough`, `laterDone`, `nearDone` in
`dashboard/tests/storyReferenceDone.ts` lost their last consumer and were
removed. Every other export of `storyReferenceDone.ts`, `storyReference.ts`,
`storyDependencyFixture.ts`, `destinationCue.ts`, `recentlyDoneProgressivePage.ts`,
`pageRequestNotes.ts` keeps a consumer in `dashboard`, `e2e` or
`Distribution/tests`. `originAnswers.ts` `CliAnswer`/`commitEtag` had no outside
consumer before this slice either (not from the deleted spec); left.

Scratch break (2026-11-18): fault — `dashboard/src/StoryCardDependencies.tsx`
`useDoneDetails(..., needed, open)` → `..., needed, true)` (supplier titles read
before the disclosure opens). Command
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts navigation/story-reference-done --workers=2`
→ exit 1: case 4 failed at `expect(recordsAsked()).not.toContain(laterDone.path)`
(received list ends with `SEED-231_progressive-31.json`); case 1 also failed
(asked set had 2 extra). Restored from a copy in the evidence dir (deleted),
`git diff -- dashboard/src | wc -c` → 0; same command with
`--repeat-each=3` → exit 0 (12 passed).

## Slice 7. Recover a Done reference

`dashboard/frontend-tests/navigation/story-reference-done-recovery.spec.ts`
four cases (the unavailable and failed inspections as two named tests), names kept. Interim spec deleted (`git rm`).

- Setup: `serveDoneReferences`/`openUntilRead` → `putFrontendDoneReferences`
  and `page.goto("/")`; `pausePageClockAt(page, new Date())` kept (the
  `opened` clock showed 36 entries: records sit before real `now`).
- GitHub catalog `hold`/`answerWith(noConnection)` → `holdAuthenticatedReadsWhere`
  (`done=catalog`, every ask held, aborted on release) over
  `controlFrontendAuthenticatedRead` (`unreachable` until `pass`).
- Case 1 (14a): unavailable notice and no destination for expired and
  unlisted — kept. 4a: `githubFor(page).calls.slice(before)` = [] → per
  reference, `countAuthenticatedReads(done=*)` = 0 after
  `untilPageRequestsAnswered` (`${identity} asks no Done read`, each observed).
  4a: `recordsAsked(github)` = 10 + suppliers → distinct page asks
  (`recordDoneRecordsAsked`). Inspect → detail — kept.
- Case 2 (14b): "Reading Open Dough to find…", not "unavailable" — kept. 4a:
  `recordsAsked(github)` = [] while held → page asked no record. "Could not
  read…", "Done stories could not be read.", retry, "Reading unanswered detail
  again", `passTimeToRecovery`, focused, in view, notice empty — kept. 4a: 27 +
  suppliers at GitHub → distinct page asks.
- Cases 3–4 (14c): `follows: true` + `publishDoneReferences` → new
  `putHealedFrontendDoneReferences` (`frontendDoneReferences.ts`, far record at
  a later revision) with `preholdRevisionStreamSlots`; failed: `catalog.pass()`.
  Notice, Inspect focus, notice cleared, revision shown, "35 entries", ten
  shown, no far destination, detail and focus kept — all kept.
- 4b: whether GitHub is asked again for a record the page re-asks is the
  server's cache — Backend "a later revision asks GitHub only for the record
  whose blob changed" (`authenticated-read-listed-records.spec.ts`,
  `expect(contentReads(server.github.calls, doneDirectory, second)).toEqual([...])`).
  No interim count needed a new Backend case.

Support removal: `storyReferenceDone.ts` lost `donePathsWithSuppliersThrough`,
`expiredDone`, `unlisted` re-exports, the `publishDoneReferences` export and
the `options`/`follows` parameter (cancellation spec calls it bare);
`DoneReferenceOptions` no longer exported. `retryReference` and
`passTimeToRecovery` keep Frontend consumers.

Scratch break (2026-11-18): fault — `dashboard/src/storyReferenceJourney.tsx`
`: pending` → `: false && pending` ("unavailable" while the catalog is read).
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES caffeinate -s -i npx playwright test --config dashboard/frontend.playwright.config.ts navigation/story-reference-done-recovery --workers=2`
→ exit 1: only case 2 failed at `toContainText("Reading Open Dough to find SEED-227#progressive-27")`,
received "SEED-227#progressive-27 is unavailable in Open Dough's dashboard.".
Restored from a copy in the evidence dir (deleted); `git diff -- dashboard/src | wc -c`
→ 0; focused group `--repeat-each=3` → exit 0.
