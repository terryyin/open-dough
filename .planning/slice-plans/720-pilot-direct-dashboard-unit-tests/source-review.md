# Source review: SEED-413#pilot-direct-dashboard-unit-tests

Launch: a fresh general-purpose reviewer with no conversation inheritance, on
2026-11-19, given only the story's Goal, Scope (backend, frontend, guidance
and removal), Scope limits and Key examples from
[the seed section](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#pilot-direct-dashboard-unit-tests),
told to read no other project file, change nothing, and number independently
observable promises. Its unnumbered context: the goal's purpose and ADR 0010
judgment, "first Node Vitest run", the Doughnut pointer, and the scope limits.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | storyNotes.ts is split into a thin wire adapter (method, ?id= project and admission, body parsing against the shared change schema, abort) and a typed handler taking an admitted project and a typed StoryNoteChange, answering a StoryNotesAnswer, keeping every store rule | slice 2 |  |
| 2 | Both types come from the shared contract in dashboard/src/storyNote.ts; no second contract is added | slice 2 |  |
| 3 | Plain Node Vitest cases prove the store rules in-process, no server, against the real durable store under their own machine home | slice 3 |  |
| 3.1 | Ids and times assigned, notes kept by project and identity, newest first: two saved notes plus an add answer the new note first with id and time, and the file holds the three notes | slice 2 |  |
| 3.2 | The edit and delete rules hold | slice 3 |  |
| 3.3 | The delivered-notes and versions rules hold | slice 3 |  |
| 3.4 | An unreadable file is reported and preserved: read answers unreadable, a following add is refused, the file's bytes are unchanged | slice 3 |  |
| 3.5 | An unwritable store is refused | slice 3 |  |
| 4 | One focused wire check through a started server covers refused methods, missing or unconfigured project, malformed and non-JSON bodies, foreign origin, no-store, and each refusal's status; PUT, extra field and foreign origin give 405, 400, 403 and no notes file exists | slice 3 |  |
| 5 | The Node Vitest cases live under dashboard/backend-tests/ and run in npm run test:dashboard:backend | slice 2 |  |
| 6 | The same cases run in the dashboard-backend CI job beside the Playwright specs, inside the group's split, times and proof record | slice 2 |  |
| 7 | No CI job is added | slice 2 |  |
| 8 | Each of the eleven Story Notes behaviors in story-notes-*.mounted.spec.ts has exactly one owner, and none is lost | slice 6 |  |
| 9 | A behavior a rendered Story Notes component owns is a plain Vitest case mounting StoryNotesDialog or the StoryNotes control with MakeMe notes and typed inputs | slice 5 |  |
| 9.1 | StoryNotesDialog mounted with no notes, user adds "First observation" and saves: the dialog asks for one add change with that text and the story's identity | slice 4 |  |
| 9.2 | When that change is refused, the draft stays and "The note could not be saved." shows | slice 4 |  |
| 9.3 | The control's source answers an earlier read after a later save: the control keeps the save's notes and count | slice 5 |  |
| 9.4 | The control gets an unreadable answer: it shows "The notes could not be read." in place of a count | slice 5 |  |
| 10 | Server-owned behaviors such as newest-first order are proven by the backend cases alone, with no frontend duplicate | slice 6 |  |
| 11 | One step in the E2E terminal-lifetime journey owns Story Notes leaving an attached terminal mounted and connected: open and close notes on a card, the same terminal keeps printing and is not attached again | slice 6 |  |
| 12 | The board keyboard spec (Backlog, Taken) and the Recently done follow-up E2E journey (Done) keep owning that each card kind hosts the control | slice 6 |  |
| 13 | MakeMe gains a page-loadable entry for builders a browser case needs, starting with aStoryNote | slice 4 |  |
| 14 | makeMe.mjs keeps exposing the same builders from that one definition | slice 4 |  |
| 15 | The StoryNotes control reads and changes notes through a typed source (change?: StoryNoteChange) => Promise<StoryNotesAnswer> for one project, which production binds to the notes endpoint | slice 5 |  |
| 16 | A case supplies its own source, so pending, refused, unreachable and out-of-order answers need no route substitute and no held-answer helper | slice 5 |  |
| 17 | Cases deliver input in the page; real pointer or keyboard delivery only where native input is the behavior under test | slice 5 |  |
| 18 | The Story Notes unit cases total at most about 1.1 s summed case time at two workers | slice 6 |  |
| 19 | The test READMEs state the entry rules (typed handler in-process with one wire check; owning component with typed inputs and in-page input; plain Vitest), the test-support freeze, and name this family as the reference | slice 7 |  |
| 19.1 | In dashboard/backend-tests/README.md | slice 7 |  |
| 19.2 | In dashboard/frontend-tests/README.md | slice 7 |  |
| 20 | .planning/open-dough.json disables pageObjects on dashboard/frontend-tests | slice 7 |  |
| 21 | Every dashboard/test-support/ module and browser command left with no importer is deleted (on 2026-11-19 the mounted notes board, notes page, session terminal, story review page, retained note commands, notes board commands, and the held notes answer in mountedServices.ts and mountedDashboard.ts) | slice 6 |  |
| 22 | Nothing is added to dashboard/test-support/ other than MakeMe builders | slice 6 |  |
