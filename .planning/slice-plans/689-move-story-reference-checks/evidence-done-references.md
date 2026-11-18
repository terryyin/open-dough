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
