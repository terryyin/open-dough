# Source review — SEED-312#speed-up-touch-review-checks

Launch: a fresh general-purpose reviewer without conversation inheritance,
spawned by the execution coordinator on 2026-11-11 before the first
delegation. Input: only the story section's Goal, Scope (with its required
restrictions, SEED-287 ownership and scope limits), Key examples and Success
measure, verbatim from
[the seed](../../seeds/SEED-312-touch-review-checks.md#speed-up-touch-review-checks)
at `58442ace8`. It was told to read no project files and change nothing, and
to return numbered commitments, qualifications, examples and exclusions. The
kind it gave each row is kept in the source text cell.

Ambiguities it named: the "such as" list in 4a is illustrative; 8a names no
baseline revision or method; 19c names no counting unit; 14e gives no
observable; 10f.3 and 18d describe SEED-287's later integration. The plan
settles these: strokes are counted over the whole selection from traced runs,
8a compares with the execution base under burners at two workers, and 14e is
observed as review range reads.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1a | "Dashboard maintainers get faster feedback on reviewing a story by touch." (commitment) | slice 5 | |
| 1b | "Real finger input still proves that each review pane scrolls on its own" (commitment) | slice 4 | |
| 1c | Real finger input still proves that "the chosen file ... survive[s] rotation" (commitment) | slice 4 | |
| 1d | Real finger input still proves that "the chosen file ... survive[s] ... panel controls" (commitment) | slice 4 | |
| 1e | Real finger input still proves that "both reading places survive rotation" (commitment) | slice 4 | |
| 1f | Real finger input still proves that "both reading places survive ... panel controls" (commitment) | slice 4 | |
| 1g | "Ordinary CI continues to catch the same product regressions." (commitment) | slice 4 | |
| 2a | "Give the touch journeys a comparison no larger than their assertions distinguish" (commitment) | slice 2 | |
| 2a.1 | "enough files to scroll the file browser in its tallest arrangement" (commitment) | slice 2 | |
| 2a.2 | "two files long enough to scroll the code pane" (commitment) | slice 2 | |
| 2a.3 | "one line wider than the widest code pane" (commitment) | slice 2 | |
| 2a.4 | "one folder" (commitment) | slice 2 | |
| 2a.5 | "one uncommitted file" (commitment) | slice 2 | |
| 2b | "Arrange it through the shared MakeMe builder" (commitment) | slice 2 | |
| 2c | "with those facts stated at the call site" (commitment) | slice 2 | |
| 2d | "Desktop review checks keep the large comparison their own assertions need." (commitment) | slice 2 | |
| 3a | "Send only the finger strokes each reading promise needs" (commitment) | slice 2 | |
| 3a.1 | "reach the wide line" (commitment) | slice 2 | |
| 3a.2 | "read its hidden end" (commitment) | slice 2 | |
| 3a.3 | "return to its beginning" (commitment) | slice 2 | |
| 3a.4 | "read a short line after vertical movement" (commitment) | slice 2 | |
| 3a.5 | "move the file browser without moving the code" (commitment) | slice 2 | |
| 3b | "The 200 lines above the wide line ... are incidental distance." (qualification) | slice 2 | |
| 3c | "the length of the line beyond the widest pane [is] incidental distance." (qualification) | slice 2 | |
| 4a | "Keep one owner for each observation that does not depend on the viewport" (commitment) | slice 3 | |
| 4a.1 | "such as tap-target size" (example) | slice 3 | |
| 4a.2 | "[such as] the context reveal" (example) | slice 3 | |
| 4a.3 | "[such as] the folder toggle" (example) | slice 3 | |
| 4a.4 | "[such as] the commit choice" (example) | slice 3 | |
| 4b | "The second viewport repeats only what its arrangement changes" (commitment) | slice 3 | |
| 4b.1 | "the file browser above the code in a narrow review" (alternative to 4b.2) (commitment) | slice 3 | |
| 4b.2 | "or beside it in a wide one" (alternative to 4b.1) (commitment) | slice 3 | |
| 4b.3 | "the panel covering the page up to 800 px wide" (commitment) | slice 3 | |
| 4b.4 | "Maximize and Restore when the panel sits beside the page" (commitment) | slice 3 | |
| 4c | "This applies the one-device rule in "where a check goes" (dashboard/tests/README.md)" (qualification) | slice 3 | |
| 4d | "which keeps tablet portrait for the side-by-side review body" (qualification) | slice 3 | |
| 5a | "A journey prepares only what its own assertions use." (commitment) | slice 4 | |
| 5b | "Remove comparison choices that only repeat another case's proof as setup." (commitment) | slice 4 | |
| 6a | "Establish surviving proof before removing a case, step or assertion" (commitment) | slice 4 | |
| 6a.1 | Establish surviving proof before removing "a case" (commitment) | slice 4 | |
| 6a.2 | Establish surviving proof before removing a "step" (commitment) | slice 4 | |
| 6a.3 | Establish surviving proof before removing an "assertion" (commitment) | slice 4 | |
| 6b | "a deliberate fault it detected fails a remaining check" (what surviving proof means) (qualification) | slice 4 | |
| 7a | "Every scroll result comes from native touch input." (commitment) | slice 4 | |
| 7b.1 | "An assigned scroll position ... does not prove that a finger moves the intended pane." (exclusion) | slice 4 | |
| 7b.2 | "a synthesized scroll ... does not prove that a finger moves the intended pane." (exclusion) | slice 4 | |
| 7b.3 | "a layout-only assertion does not prove that a finger moves the intended pane." (exclusion) | slice 4 | |
| 8a | "No case this story changes takes longer than before under SEED-287's load profile, local load 20–30 on 2 workers" (commitment) | slice 5 | |
| 8b | "this story adds no case-local allowance" (exclusion) | slice 5 | |
| 8c | "Fitting the default 30 s there is SEED-287's promise" (qualification) | slice 5 | |
| 8d | "a consolidated case that outgrows it trades one defect for another" (qualification) | slice 5 | |
| 9a | "No internal mocks, wall-clock sleeps, retries, skips, timeout inflation or special runner modes obtain a saving." (exclusion) | slice 5 | |
| 9a.1 | No "internal mocks" obtain a saving (exclusion) | slice 5 | |
| 9a.2 | No "wall-clock sleeps" obtain a saving (exclusion) | slice 5 | |
| 9a.3 | No "retries" obtain a saving (exclusion) | slice 5 | |
| 9a.4 | No "skips" obtain a saving (exclusion) | slice 5 | |
| 9a.5 | No "timeout inflation" obtains a saving (exclusion) | slice 5 | |
| 9a.6 | No "special runner modes" obtain a saving (exclusion) | slice 5 | |
| 9b | "Preserve ordinary CI selection" (commitment) | slice 5 | |
| 9c | "follow the failure policy (AGENTS.md, "Failing and flaky tests")" (commitment) | slice 5 | |
| 10a | "SEED-287 ("Fit dashboard journeys in default timeout") owns the reading case's fit in the default timeout." (qualification) | slice 1 | observed: PLAN.md "Execution base record": base 58442ace8 is main at Take and holds none of SEED-287's touch changes (spec imports preparationPage test, test.setTimeout(60_000) at line 18, no largeReviewFiles.ts) |
| 10b.1 | "Its shorter overflowing line ... [is] accepted on its story branch (`codex/make-dashboard-journeys-fit-the-default-timeout`, `90cfdde52`) and [was] not on main at `77716145b`." (qualification) | slice 1 | observed: PLAN.md "Execution base record": base 58442ace8 is main at Take and holds none of SEED-287's touch changes (spec imports preparationPage test, test.setTimeout(60_000) at line 18, no largeReviewFiles.ts) |
| 10b.2 | "its worker inputs ahead of the private origin ... are accepted on its story branch ... and were not on main at `77716145b`." (qualification) | slice 1 | observed: PLAN.md "Execution base record": base 58442ace8 is main at Take and holds none of SEED-287's touch changes (spec imports preparationPage test, test.setTimeout(60_000) at line 18, no largeReviewFiles.ts) |
| 10b.3 | "its removal of the 60 s allowance [is] accepted on its story branch ... and [was] not on main at `77716145b`." (qualification) | slice 1 | observed: PLAN.md "Execution base record": base 58442ace8 is main at Take and holds none of SEED-287's touch changes (spec imports preparationPage test, test.setTimeout(60_000) at line 18, no largeReviewFiles.ts) |
| 10c | "Neither story waits for the other." (commitment) | slice 1 | observed: PLAN.md "Execution base record": base 58442ace8 is main at Take and holds none of SEED-287's touch changes (spec imports preparationPage test, test.setTimeout(60_000) at line 18, no largeReviewFiles.ts) |
| 10d | "Start from main as it is at Take" (commitment) | slice 1 | observed: PLAN.md "Execution base record": base 58442ace8 is main at Take and holds none of SEED-287's touch changes (spec imports preparationPage test, test.setTimeout(60_000) at line 18, no largeReviewFiles.ts) |
| 10e.1 | "Where SEED-287's changes are there, keep its worker inputs" (alternative to 10f) (commitment) | slice 1 | observed: PLAN.md "Execution base record": condition not met, SEED-287 is not on main at Take, so this alternative is not triggered |
| 10e.2 | "Where SEED-287's changes are there, keep ... the default budget" (alternative to 10f) (commitment) | slice 1 | observed: PLAN.md "Execution base record": condition not met, SEED-287 is not on main at Take, so this alternative is not triggered |
| 10e.3 | "[Where SEED-287's changes are there,] let this story's comparison replace the reading-specific line." (alternative to 10f) (commitment) | slice 1 | observed: PLAN.md "Execution base record": condition not met, SEED-287 is not on main at Take, so this alternative is not triggered |
| 10f.1 | "Where they are not, leave the allowance ... to SEED-287." (alternative to 10e) (commitment) | slice 2 | |
| 10f.2 | "Where they are not, leave ... the worker inputs to SEED-287." (alternative to 10e) (commitment) | slice 2 | |
| 10f.3 | "Its integration then keeps this story's comparison and journeys." (alternative to 10e) (qualification) | slice 2 | |
| 11a | "first-in-worker preparation ... stay[s] as [it is]" (exclusion) | slice 5 | |
| 11b | "other touch specs ... stay as they are" (exclusion) | slice 5 | |
| 11c | "the desktop review checks stay as they are" (exclusion) | slice 5 | |
| 11d | "Local-only archived experiments are excluded from the maintained selection." (exclusion) | slice 5 | |
| 12a | Reading on a phone: "The chosen file has more lines than its pane shows" (example) | slice 2 | |
| 12b | Reading on a phone: "[The chosen file has] one line wider than the pane" (example) | slice 2 | |
| 12c | Reading on a phone: "the file browser sits above the code" (example) | slice 2 | |
| 12d | Reading on a phone: "A finger drags the code to the wide line" (example) | slice 2 | |
| 12e | Reading on a phone: "[A finger drags the code] sideways to its hidden end" (example) | slice 2 | |
| 12f | Reading on a phone: "[A finger drags the code] back to its beginning" (example) | slice 2 | |
| 12g | Reading on a phone: "Each named part is then wholly visible inside the code pane." (example) | slice 2 | |
| 12h | Reading on a phone: "The file browser's position ... stay[s] where [it was]." (example) | slice 2 | |
| 12i | Reading on a phone: "the fixed header and controls ... stay where they were." (example) | slice 2 | |
| 12j | Reading on a phone: "the page stay[s] where [it was]." (example) | slice 2 | |
| 12k | Reading on a phone: "A drag in the file browser then moves the list" (example) | slice 2 | |
| 12l | Reading on a phone: "[A drag in the file browser] leaves the code where it was." (example) | slice 2 | |
| 13a | Reading on a tablet: "With the file browser beside the code" (example) | slice 3 | |
| 13b | Reading on a tablet: "the same drags give the same independent result in each pane." (example) | slice 3 | |
| 14a | Rotation and panel controls: "A file is chosen and both panes are moved by touch." (example) | slice 4 | |
| 14b | Rotation and panel controls: "Rotating to landscape and back keeps the file" (example) | slice 4 | |
| 14c | Rotation and panel controls: "Rotating to landscape and back keeps ... the comparison" (example) | slice 4 | |
| 14d | Rotation and panel controls: "Rotating to landscape and back keeps ... both reading places" (example) | slice 4 | |
| 14e | Rotation and panel controls: "[Rotating to landscape and back] reads the review no further." (example) | slice 4 | |
| 14f | Rotation and panel controls: "Maximize and Restore keep them where the panel sits beside the page." (example) | slice 4 | |
| 14g | Rotation and panel controls: "Hide files and Show files keep them too." (example) | slice 4 | |
| 15a | File and comparison changes: "Next file opens at its top." (example) | slice 4 | |
| 15b | File and comparison changes: "Refresh keeps the chosen file." (example) | slice 4 | |
| 15c | File and comparison changes: "An explicitly chosen Commits comparison keeps its file ... through rotation." (example) | slice 4 | |
| 15d | File and comparison changes: "An explicitly chosen Commits comparison keeps its ... reading place through rotation." (example) | slice 4 | |
| 15e | File and comparison changes: "Leaving uncommitted changes out survives the next rotation." (example) | slice 4 | |
| 15f | File and comparison changes: "Close returns focus to the Review changes action." (example) | slice 4 | |
| 16a | Honest proof: "A code pane that no longer scrolls sideways by touch ... fail[s] a remaining case." (example) | slice 4 | |
| 16b | Honest proof: "a file browser that no longer scrolls on its own ... fail[s] a remaining case." (example) | slice 4 | |
| 16c | Honest proof: "a rotation that rebuilds the review and loses the chosen file ... fail[s] a remaining case." (example) | slice 4 | |
| 16d | Honest proof: "a side-by-side diff that no longer yields its width ... fail[s] a remaining case." (example) | slice 4 | |
| 16e | Honest proof: "The last one fails only where the file browser sits beside the code." (qualification) | slice 4 | |
| 17a | SEED-287 on main at Take: "The story keeps the worker inputs" (example) | slice 1 | observed: PLAN.md "Execution base record": condition not met, SEED-287 is not on main at Take, so this alternative is not triggered |
| 17b | SEED-287 on main at Take: "The story keeps ... the default budget." (example) | slice 1 | observed: PLAN.md "Execution base record": condition not met, SEED-287 is not on main at Take, so this alternative is not triggered |
| 17c | SEED-287 on main at Take: "The reading case still passes within the default 30 s under load 20–30 on 2 workers." (example) | slice 1 | observed: PLAN.md "Execution base record": condition not met, SEED-287 is not on main at Take, so this alternative is not triggered |
| 18a | SEED-287 still on its branch at Take: "The 60 s allowance ... stay[s] untouched on main" (example) | slice 2 | |
| 18b | SEED-287 still on its branch at Take: "the worker inputs stay untouched on main" (example) | slice 2 | |
| 18c | SEED-287 still on its branch at Take: "the smaller comparison lands." (example) | landing | |
| 18d | SEED-287 still on its branch at Take: "SEED-287's integration removes the allowance over this story's journeys." (example) | slice 2 | |
| 19a | "Save at least a quarter of whole-command wall time on the ordinary one-worker selection `npm run test:dashboard -- tests/review/story-review-touch.spec.ts --workers=1`" (commitment) | slice 5 | |
| 19b | "with every replacement, preparation and teardown paid." (qualification) | slice 5 | |
| 19c | "Send at most two thirds of the finger strokes." (commitment) | slice 5 | |
| 19d | "Compare with the execution base" (qualification) | slice 5 | |
| 19d.1 | "[Compare] in alternating runs" (qualification) | slice 5 | |
| 19d.2 | "[Compare] under the same load" (qualification) | slice 5 | |
| 19d.3 | "three passing observations of each." (qualification) | slice 5 | |
