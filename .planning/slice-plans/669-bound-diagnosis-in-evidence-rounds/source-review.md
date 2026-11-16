# Source review

Launch: fresh general-purpose subagent on 2026-11-16, no conversation
inheritance, given only the selected story's Goal, Scope, Out of scope, Key
examples and Evidence text from
[SEED-367#bound-diagnosis-in-evidence-rounds](../../seeds/SEED-367-bounded-slice-active-time.md#bound-diagnosis-in-evidence-rounds),
told to read no files and change nothing, and to number independently
observable promises.

Unnumbered context returned: the Goal summary (covered by 5–18); the failure
policy still owes the repair; parking's reason (changes may be the suspect);
"as for slices"; "as CI repair already orders it"; the out-of-scope list; the
evidence baseline; illustrative example details (6/9/13 minutes, 2 in 10, 900
repetitions, spawn log, Actions latency, shard order).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A failure diagnosed and fixed within its slice's 15 active minutes creates no record or round; the slice continues (Scope 1; example 1) | slice 2 | |
| 2a | Diagnosis runs in rounds when a slice reaches its limit while the cause is unknown (Scope 2; example 2) | slice 2 | |
| 2b | Diagnosis runs in rounds when an owned CI failure is handed to a repair agent, which is then bounded (Scope 2; example 3) | slice 3 | |
| 3 | At a slice's limit, unfinished changes are parked, not reverted (Scope 2; example 2) | slice 2 | |
| 4 | A round is 15 active minutes on the slice clock; time inside clock-run proof commands does not count (Scope 3; example 3) | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-diagnosis.test.mjs: 'proof run through the clock inside a round does not count…' (run 5→25 leaves round at 5; round ends at 15 with overrun) |
| 5 | Each round ends by updating one diagnosis record (Scope 4) | slice 2 | |
| 6 | The record carries signature/match, rate and conditions, base-versus-candidate attribution, CI references, hypotheses with experiments and results, environments ruled out with counts, reproduction command/instrument/evidence, temporary edits and parked changes, unrelated defects, leading hypothesis and next experiment, round count and cumulative minutes (Scope 4; examples 2, 5) | slice 2 | |
| 7a | The record lives with the execution's plan (Scope 5) | slice 2 | |
| 7b | For quick execution, the record lives under the executable-plan root (Scope 5) | slice 2 | |
| 8 | A fresh context resumes the same diagnosis's round count and cumulative minutes and never renews the allowance (Scope 5; example 6) | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-diagnosis.test.mjs: 'a diagnosis stops after three 15-minute rounds…' (each round a fresh start/pause continues round count and cumulative minutes 15/15/45; nothing resets) |
| 9 | The next round starts in a fresh context from the record only after progress (as defined) or a switch of experiment kind (Scope 6; examples 2, 3) | slice 2 | |
| 10 | After a round whose reproduction attempts all failed, the next experiment must be a different kind; more repetition at higher load stops for a human (Scope 6; example 4) | slice 2 | |
| 11 | Without progress or a kind switch, diagnosis stops for a human before the cap (Scope 6; example 5) | slice 2 | |
| 12 | Diagnosis stops for a human after three rounds; the stop reports round count and cumulative active minutes (Scope 6; example 6) | slice 1 | observed: Distribution/tests/skills/dough-execute-plan/slice-clock-diagnosis.test.mjs: 'a diagnosis stops after three 15-minute rounds…' (4th start refused naming 3 rounds and 45 cumulative minutes; --rounds-authorized 4 starts round 4) |
| 13 | Every repeat batch and CI run states its hypothesis and stopping count before it starts; a rerun without one is not started (Scope 7; example 7) | slice 2 | |
| 14 | A cause is confirmed only by a reproduction that fails before the fix, and that reproduction becomes the fix's proof (Scope 8; example 3) | slice 2 | |
| 15 | The fix runs on its own 15-minute slice clock, not against the rounds (Scope 8; example 3) | slice 2 | |
| 16a | A cause in the parked changes resumes that slice with the fix (Scope 8) | slice 2 | |
| 16b | A cause in committed or trunk code is fixed and delivered before the parked work resumes (Scope 8) | slice 3 | |
| 17 | A stop for a human keeps the record, the parked work and the owed repair (Scope 9; Goal) | slice 3 | |
| 18 | Only the human's answer decides what follows a stop: more rounds, another approach, or the named design judgment; rounds beyond the cap need that authorization (Scope 9; example 6) | slice 2 | |
