# Source-only review

Fresh general-purpose reviewer launched from the Claude Code coordinator on
2026-11-16 without conversation inheritance. Its input was the selected
story's Goal, Scope, out-of-scope paragraph and key examples, with the links
replaced by the names of the references they point at. No plan, slicing,
product, proof or suspected omission was supplied. It read no project files
and changed none. Ids 2, 3, 5, 6, 7, 10, 11, 13, 15 and 19 were returned with
sub-ids only; each sub-id row carries its parent's source text.

Reviewer's judgment calls: 14 rests on Example 3 alone and may describe
existing guidance; 21 comes from the out-of-scope paragraph; 20 is a
cross-host umbrella over 1–19.

Unnumbered context: the story is the measurement the other slice-limit stories
build on; the 15-minute limit and what counts as active work are unchanged;
"waiting for proof", "handle the overrun" and the oversized-slice reference
are existing guidance; Codex has no hook; diagnosis rounds, proof-wait
conditions, model time or cost, and killing an agent or command are excluded;
example figures illustrate the promises and are not separate rules.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | "One installed execute-plan script keeps a slice clock for each slice"; one slice clock, not each agent's host-clock reading, decides active time; nothing recorded starts at 15, and 6 + 4 minutes worked gives "10 elapsed and 5 remaining" (Goal; Scope 1; Example 1) | slice 2 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs 'a slice with nothing recorded starts at 15 remaining…': start reports 0/15, status 10 elapsed, 5 remaining; scripts/slice-clock.mjs declared in the payload |
| 2a | Clock keyed by a stable slice identity: story identity plus the coordinator-named slice (Scope 1; Examples 1, 2) | slice 2 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs: every case keys --identity SEED-367#… --slice 3; 'each story's and each quick execution's slice has its own clock' keeps slice 3 at 7 |
| 2b | Clock keyed by the quick execution's identity plus the coordinator-named slice (Scope 1) | slice 2 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs 'each story's and each quick execution's slice has its own clock': quick identity slice 1 starts at 0 and reads 2 |
| 3a | Record lives in the execution's local Git state: a replacement implementer reads the same record; its brief says 4 minutes remain (Scope 1; Example 2) | slice 2 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs 'a slice handed back at 11 minutes…': replacement's unnamed status from another directory reads 11 elapsed, 4 remaining |
| 3b | Record lives in the execution's local Git state: a resumed handback reads the same record; its brief says 4 minutes remain (Scope 1; Example 2) | slice 2 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs 'a slice handed back at 11 minutes…': start from a second process after the 20-minute pause reports 11 elapsed, 4 remaining |
| 3c | Record lives in the execution's local Git state: a later coordinator session in the same checkout reads the same record (Scope 1) | slice 2 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs 'a slice handed back at 11 minutes…': later named status from the worktree root reads 11 elapsed, 4 remaining |
| 4 | "Nothing in it is committed" (Scope 1) | slice 2 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs 'the record stays in the worktree's own Git state…': record under git-path, git status --porcelain --ignored empty |
| 5a | The coordinator starts the clock when it dispatches a slice (Scope 2; Example 1) | slice 5 | |
| 5b | The coordinator resumes the clock when it resumes a slice, continuing from recorded elapsed time: 11 elapsed resumes with 4 remaining (Scope 2; Example 2) | slice 5 | |
| 5c | The coordinator starts the clock when it begins a slice itself (Scope 2) | slice 5 | |
| 6a | The coordinator pauses the clock when the implementer returns; "The coordinator's 20-minute review is paused time" (Scope 2; Example 2) | slice 5 | |
| 6b | The coordinator pauses the clock when the slice is accepted (Scope 2; Example 6) | slice 5 | |
| 6c | The coordinator pauses the clock when execution stops for the coordinator or a human (Scope 2) | slice 5 | |
| 7a | A dispatch brief carries the remaining time the clock reports; "The brief says 15 active minutes remain" (Goal; Scope 2; Example 1) | slice 5 | |
| 7b | A resume, including a replacement implementer's brief, carries the clock's remaining time (Scope 2; Example 2) | slice 5 | |
| 8 | "An implementer runs proof commands through the clock. Time inside such a command does not count"; a 9-minute suite leaves 10 elapsed and 5 remaining; "the suite's time is excluded" (Scope 3; Examples 1, 5) | slice 2 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs first case: 6 + command moving time 6→15 + 4 reads 10 elapsed, 5 remaining; nonzero case keeps 2 across a 7-minute command |
| 9 | "overlapping commands are excluded once" (Scope 3) | slice 2 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs 'two overlapping commands through the clock are excluded once': runs 6→15 and 8→12 leave 6 at 12 and 10 at 19 |
| 10a | The command's output goes to the log that waiting for proof waits on (Scope 3) | slice 2 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs first case: log holds stdout and stderr; nonzero case: log holds '1 failed' |
| 10b | The exit status goes to the exit file, including a nonzero exit: "Its exit file holds the status" (Scope 3; Example 5) | slice 2 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs 'a command that exits nonzero…': exit file holds 3; first case holds 0 |
| 11a | The waiting-for-proof wait uses, and ends on, the clock's exit file (Scope 3; Example 5) | slice 5 | |
| 11b | Waiting for proof keeps its per-host instructions (Scope 3) | slice 5 | |
| 12 | "At or past the limit the clock reports an overrun with the elapsed active time, at the next clock command on every host"; Codex detection waits for the next clock command (Goal; Scope 4; Example 3) | slice 3 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-overrun.test.mjs 'an implementer who passes 15 active minutes without a command reads the overrun…': status at 15 and run at 17 report overrun, elapsed time and the slice; 'an overrun first seen by a run through the clock is counted once' |
| 13a | On Claude Code the overrun is reported after the next tool call through its host hook (Scope 4; Example 3) | slice 4 | |
| 13b | On Cursor the overrun is reported after the next tool call through its host hook (Scope 4) | slice 4 | |
| 14 | After the overrun is reported, "the implementer returns unfinished work under 'handle the overrun'" (Example 3) | slice 5 | |
| 15a | The refactor pass runs outside the clock and adds no elapsed time (Scope 5; Example 6) | slice 5 | |
| 15b | CI repair runs outside the clock and adds no elapsed time (Scope 5; Example 6) | slice 5 | |
| 16 | "Refining or renaming an unfinished slice keeps its slice identity and elapsed time"; a 13-minute slice refined with a new title resumes with 2 minutes remaining (Scope 5; Example 4) | slice 3 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-continues.test.mjs 'a 13-minute slice refined in place with a new title resumes with 2 minutes remaining, also when renumbered to key 4' |
| 17 | "A slice split after an overrun starts new slice clocks"; each starts at 15 (Scope 5; Example 4) |  | G1 |
| 18 | "The overrun stays in the story's record, so the coordinator can see a second overrun in the same story"; after the split the record still shows one overrun (Scope 5; Example 4) | slice 3 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-overrun.test.mjs 'a slice split after an overrun starts each new slice at 15 remaining…': record keeps one overrun, storyOverruns 1 then 2 on a second overrun |
| 19a | "Track active time" in the oversized-slice reference uses the clock, not the host clock (Scope 6) | slice 5 | |
| 19b | Delegation briefs use the clock; "the implementer ran no `date`" (Scope 6; Example 1) | slice 5 | |
| 19c | Waiting-for-proof guidance uses the clock (Scope 6) | slice 5 | |
| 20 | "A developer gets the 15-active-minute slice limit applied the same way on Claude Code, Codex and Cursor" (Goal; Examples 3, 5) | slice 5 | |
| 21 | "A command started outside the clock still counts as active time; the clock does not try to detect it" (Out of scope) | slice 2 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock.test.mjs 'a command started outside the clock counts as active time': 3 minutes without run read 3 elapsed |
