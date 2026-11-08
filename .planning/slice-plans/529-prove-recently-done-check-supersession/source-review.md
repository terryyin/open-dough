# Source review

Launch: fresh general-purpose subagent, no conversation inheritance, launched by
the execution coordinator on 2026-11-08 before slice 1 delegation. Input: the
story section's Goal and Scope from
`.planning/seeds/SEED-272-select-recently-done-sessions.md#prove-recently-done-check-supersession`
plus the plan's correction input (Provenance, Current findings, Preserved
promises and constraints) with file and symbol names abstracted; no slicing,
proof table or product files. Instruction: use only these inputs, read no
project files, change nothing; return numbered commitments.

Reviewer exclusions: the standalone-choice clearing question stays with the
developer; no new product promise; the Board's Recently done wording and window
do not change; row-choice supersession is already proved; the phone test's
held-read linked step is kept.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1.1 | A maintainer who changes Recently done session selection gets a failing test when a superseded done-catalog check would move the developer's reading. | slice 2 | |
| 1.2 | A maintainer who changes Recently done session selection gets a failing test when an unreadable done-catalog check would move the developer's reading. | slice 1 | observed: recently-done-sessions-select-check.spec.ts › catalog naming the story's done record unreadable, step 1 (break: linkIn→absent fails it) |
| 2.1 | The maintainer finds one done-catalog reading, shared by Recently done selection and the Board. | slice 1 | observed: dashboard/src/recentlyDoneSelection.ts readLink calls doneStories.ts cataloguedAt; Board readDoneStories calls the same |
| 2.2 | The maintainer finds one done-catalog wording, shared by Recently done selection and the Board. | slice 1 | observed: recently-done-sessions-select-check.spec.ts › catalog naming the story's done record unreadable, step 2: row text repeats doneUnreadProblem + gap + doneCatalogRepair |
| 3.1 | Scope: proof of the existing check rules. This is a bounded retrospective correction of "Select recently done sessions." | slice 2 | |
| 3.2 | Scope: the duplicated catalog read is consolidated. | slice 1 | observed: dashboard/src/recentlyDoneSelection.ts readLink: readDoneCatalogAt conversion removed |
| 3.3 | Scope: the duplicated catalog-gap wording is consolidated. | slice 1 | observed: recently-done-sessions-select-check.spec.ts › catalog naming the story's done record unreadable, step 2 (break: raw gap problem fails it) |
| 3.4 | Scope: overlapping selection tests are trimmed. | slice 2 | |
| 3.5 | No new product promise. | slice 2 | |
| 4.1 | A project change while a check is unanswered abandons that check. A test fails if this rule is dropped. Example: if the rule regressed, a late linked answer would move an Intent reader to another project. | slice 2 | |
| 4.2 | An explicit Open abandons an unanswered check. A test fails if this rule is dropped. Example: if the rule regressed, a late linked answer would override the Open's reveal. | slice 2 | |
| 4.3 | Supersession by choosing another row stays covered. | slice 2 | |
| 5 | When the catalog names the story's done record as unreadable, the link check reports a problem, not "absent." A test arranges this case. | slice 1 | observed: recently-done-sessions-select-check.spec.ts › catalog naming the story's done record unreadable, step 1: 'Its done record … could not be read.'; expectKept |
| 6.1 | The row's link read stops copying the Board's catalog reading and uses the shared gap-or-catalogued conversion. | slice 1 | observed: dashboard/src/recentlyDoneSelection.ts readLink uses cataloguedAt |
| 6.2 | The row and the Board say a catalog gap with the same wording; the Board's wording is the one that stays. | slice 1 | observed: recently-done-sessions-select-check.spec.ts › catalog naming the story's done record unreadable, step 2; Board wording unchanged in doneStories.ts cataloguedAt |
| 7.1 | The phone-width Development test no longer re-proves the linked and standalone reveal and range extension the development selection spec proves. | slice 2 | |
| 7.2 | The development selection spec's test 2, step 1 no longer repeats the row-choice supersession the check spec proves. | slice 2 | |
| 7.3 | Exception to 7.1: the phone test's linked step, holding the Board's catalog read until the overlay closes, stays. | slice 2 | |
| 8 | The page frame source file is tidied: it has grown to 255 lines and its header sentence about going to what was selected is hard to parse. | slice 2 | |
| 9.1 | Kept: answers superseded by a later choice are ignored. | slice 2 | |
| 9.2 | Kept: answers superseded by a later navigation are ignored. | slice 2 | |
| 10.1 | Kept: an unread or failed catalog stays distinct from a miss. | slice 1 | observed: recently-done-sessions-select-check.spec.ts › catalog naming the story's done record unreadable, steps 1–2 and existing 502 step in the same spec |
| 10.2 | 10.1 includes the case where the catalog names an unreadable file for that identity. | slice 1 | observed: recently-done-sessions-select-check.spec.ts › catalog naming the story's done record unreadable, step 1 |
| 11.1 | Preserved as delivered: Select and Open stay distinct. | slice 2 | |
| 11.2 | Preserved as delivered: linked selection. | slice 2 | |
| 11.3 | Preserved as delivered: standalone selection. | slice 2 | |
| 11.4 | Preserved as delivered: the Intent reading is kept. | slice 2 | |
| 11.5 | Preserved as delivered: the Development Board reveal, with range extension. | slice 2 | |
| 11.6 | Preserved as delivered: the phone overlay stays open on Select. | slice 2 | |
| 11.7 | Preserved as delivered: checking and failed checks are said apart from a confirmed miss. | slice 1 | observed: recently-done-sessions-select-check.spec.ts both tests: checking/failed/unreadable/gap statuses vs miss |
| 11.8 | All other "Select recently done sessions" promises and its source review observations stay as delivered. | slice 2 | |
| 12.1 | The Board's Recently done wording stays the same. | slice 1 | observed: dashboard/tests/stories/recently-done-stories.spec.ts passes unchanged |
| 12.2 | The Board's Recently done window stays the same. | slice 1 | observed: recentDoneRecords unchanged; recently-done-stories.spec.ts passes |
| 13 | Excluded and left with the developer: whether a standalone choice should clear when the Selected story changes. | slice 2 | |
