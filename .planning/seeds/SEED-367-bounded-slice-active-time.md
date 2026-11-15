---
id: SEED-367
status: active
planted: 2026-11-15
planted_during: Terry made 15 active minutes the single slice limit, with running commands, refactoring and CI repair excluded
trigger_when: selected from the product backlog
scope: two stories
---

# SEED-367 — Keep slices within their active time

Evidence: [long-running slice categories](../long-slice-categories.md) from
Claude Code and Codex executions in the 30 days to 2026-11-15.

<a id="count-slice-active-time-deterministically"></a>

### Count a slice's active time without the agent's own clock

**Identity:** SEED-367#count-slice-active-time-deterministically

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** A developer gets the
  [15-active-minute slice limit](../../Distribution/src/skills/dough-story-decomposition/references/problem-decomposition.md#size-and-escalate-slices)
  applied the same way on Claude Code, Codex and Cursor, without implementers
  keeping time themselves.
- **Evaluation.** From dispatch to return, and across handbacks and resumes,
  the coordinator and the implementer read the slice's remaining active time
  from one record. Time inside commands run through it, the refactor pass, CI
  repair and waits for the coordinator or a human do not count. Every brief and
  resume carries the same value, and an overrun is detected at the limit
  without the agent running `date`. A command run through it also writes the
  exit file that [waiting for proof](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md)
  uses.
- **Priority.** First in the efficiency group: the slice limit depends on it.
  Under Pygardon's 10-minute stop rule, 35 of 382 Claude Code implementers
  spent more than 10 model minutes; 11 reported the budget and 13 checked the
  clock more than once. In Doughnut, 5 went over and none reported it.
- **Effort and boundary.** Medium. A new execute-plan script with tests and a
  payload declaration; host hooks are a variant on Claude Code and Cursor,
  while Codex has none. It does not change the limit itself.

<a id="bound-diagnosis-in-evidence-rounds"></a>

### Bound flaky-test and CI-failure diagnosis in evidence rounds

**Identity:** SEED-367#bound-diagnosis-in-evidence-rounds

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** A developer whose slice meets a flaky test, a
  CI-only failure or a hang gets either a confirmed cause or a stop with a usable
  diagnosis record, without open-ended diagnosis and without losing the slice's
  proven work. The [failure policy](../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  still owes the repair.
- **Evaluation.** Proposal to validate during refinement: diagnosis runs as its
  own repair unit while the slice's work stays parked, not reverted. It runs in
  rounds of 15 active minutes. Each round records the failure signature, how
  often and under which conditions it reproduces, each hypothesis with its
  experiment and result, the leading hypothesis, and the next discriminating
  experiment. Another round starts from that record in a fresh context only
  when the last one confirmed or refuted a hypothesis; after three rounds it
  stops for a human. A confirmed cause makes the fix an ordinary slice, and each
  CI run tests a stated hypothesis.
- **Priority.** Directly after the clock, which it uses. Successful Claude Code
  diagnoses took 20–45 model minutes, so a plain 15-minute stop would cut most
  of them off. Beyond that more time rarely helped: flaky-test slices were
  fixed in 4 of 7 at 10–15 model minutes and 7 of 16 at 15–25. One CI-timeout
  repair ran 82 model minutes over 269 turns for $39, and 11 CI repairs above
  25 model minutes cost $249 of $625.
- **Effort and boundary.** Medium, low confidence. Refinement first reads about
  ten full diagnosis transcripts to check the round size, the three-round cap
  and the record fields. Failures under machine load stay with the
  unavailable-proof-conditions path.
