---
id: SEED-367
status: active
planted: 2026-11-15
planted_during: Terry made 15 active minutes the single slice limit, with running commands, refactoring and CI repair excluded
trigger_when: selected from the product backlog
scope: three stories
---

# SEED-367 — Keep slices within their active time

Evidence: [long-running slice categories](../long-slice-categories.md) from
Claude Code and Codex executions in the 30 days to 2026-11-15.

<a id="count-slice-active-time-deterministically"></a>

### Count a slice's active time without the agent's own clock

**Identity:** SEED-367#count-slice-active-time-deterministically

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/667-count-slice-active-time-deterministically/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"6e411af8ac267ee62e01cce3dadb2035144425a36036b5274609307000255c40","plan":"8c2c1879061733296d3264e9a10c601b88d4a0bdc62e4ca7add322165cd03f31"}}
```

**Goal.** A developer gets the
[15-active-minute slice limit](../../Distribution/src/skills/dough-story-decomposition/references/problem-decomposition.md#size-and-escalate-slices)
applied the same way on Claude Code, Codex and Cursor. One slice clock,
not each agent's own reading of the host clock, decides how much active time a
slice has used, so an overrun is reported reliably and every brief carries the
same remaining time. This is the measurement the other slice-limit stories
build on.

**Scope.**

- One installed execute-plan script keeps a slice clock for each slice under
  a stable slice identity: the story identity (or the quick execution's
  identity) plus the slice the coordinator names. The record lives in the
  execution's local Git state, so a replacement implementer, a resumed
  handback and a later coordinator session in the same checkout read the same
  record. Nothing in it is committed.
- The coordinator starts or resumes the clock when it dispatches or resumes a
  slice, or begins one itself, and pauses it when the implementer returns, the
  slice is accepted, or execution stops for the coordinator or a human. Each
  brief and resume carries the remaining time the clock reports.
- An implementer runs proof commands through the clock. Time inside such a
  command does not count, overlapping commands are excluded once, and the
  command's output and exit status go to the log and exit file that
  [waiting for proof](../../Distribution/src/skills/dough-execute-plan/references/wait-for-proof.md)
  waits on. Waiting for proof keeps its per-host instructions and uses the
  clock's exit file.
- At or past the limit the clock reports an overrun with the elapsed active
  time, at the next clock command on every host and, on Claude Code and
  Cursor, after the next tool call through their host hooks. Codex has no hook,
  so its detection waits for the next clock command.
- The refactor pass and CI repair run outside the clock. Refining or renaming
  an unfinished slice keeps its slice identity and elapsed time. A slice split
  after an overrun starts new slice clocks. The overrun stays in the story's
  record, so the coordinator can see a second overrun in the same story.
- Execute-plan guidance stops asking agents to count active time with the host
  clock: [track active time](../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#track-active-time),
  delegation briefs and waiting for proof use the clock instead.

Out of scope: changing the 15-minute limit or what counts as active work;
bounding diagnosis rounds and waiting for proof conditions (the sibling
stories); measuring model time or cost; enforcing the limit by killing an
agent or a command. A command started outside the clock still counts as
active time; the clock does not try to detect it.

**Key examples.**

- A coordinator dispatches slice 3 with nothing recorded. The brief says 15
  active minutes remain. The implementer works 6 minutes, runs a 9-minute
  focused suite through the clock and works 4 more minutes. The clock reports
  10 elapsed and 5 remaining, and the implementer ran no `date`.
- The implementer returns slice 3 with 11 minutes elapsed for a review fix.
  The coordinator's 20-minute review is paused time. The resumed brief, and a
  replacement implementer's brief in the same checkout, both say 4 minutes
  remain.
- On Codex an implementer passes 15 active minutes while editing. Its next
  clock command reports the overrun and the elapsed time, and the implementer
  returns unfinished work under
  [handle the overrun](../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#handle-the-overrun).
  On Claude Code the same overrun is reported after the next tool call.
- After a 13-minute slice is refined in place with a new title, it resumes with
  2 minutes remaining. After an overrun splits it into two slices, each starts
  at 15, and the story's record still shows one overrun.
- A focused suite started through the clock on Cursor exits nonzero. Its exit
  file holds the status, the blocking wait from waiting for proof ends on it,
  and the suite's time is excluded.
- The coordinator runs the refactor pass and repairs CI after slice 3 is
  accepted. Slice 3's elapsed time does not change.

**Evidence.** Under Pygardon's 10-minute stop rule, 35 of 382 Claude Code
implementers spent more than 10 model minutes; 11 reported the budget and 13
checked the clock more than once. In Doughnut, 5 went over and none reported
it.

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
  stops for a human. The same diagnosis retains its round count, cumulative
  active effort, hypotheses and results across agents, handbacks, refinements
  and resumes; a fresh context does not renew its allowance. A confirmed cause
  makes the fix an ordinary slice, and each CI run tests a stated hypothesis.
- **Priority.** Directly after the clock, which it uses, and ahead of
  split-story continuation, because unbounded repair recurred in every usage
  rise.
  Successful Claude Code diagnoses took 20–45 model minutes, so a plain
  15-minute stop would cut most of them off. Beyond that more time rarely
  helped: flaky-test slices were fixed in 4 of 7 at 10–15 model minutes and 7 of
  16 at 15–25. One CI-timeout repair ran 82 model minutes over 269 turns for
  $39, and 11 CI repairs above 25 model minutes cost $249 of $625.
  Single unbounded repair agents appeared in all three usage rises from
  2026-10-25 to 2026-11-15, at 7.0–9.8M input-token equivalents each, and repair
  agents carried 22.8M of SEED-334's 80.7M
  ([unbounded diagnosis](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#runaway-diagnosis)).
  Codex also encountered repeated repair and qualification during
  SEED-286#fast-intent-ci-comparison-tests (7,097 attributed requests) and
  Pygardon SEED-145#story-unattended-entry-operation (27 delivered slices).
  Those are whole-execution figures, not diagnosis-only cost; refinement must
  distinguish the repair rounds from implementation and useful qualification.
- **Effort and boundary.** Medium, low confidence. Refinement first reads about
  ten full diagnosis transcripts to check the round size, the three-round cap
  and the record fields. First classify machine conditions under
  [required proof conditions](#wait-for-a-quiet-machine-before-load-sensitive-proof);
  failures within the required conditions remain defects owned by this path.

<a id="wait-for-a-quiet-machine-before-load-sensitive-proof"></a>

### Wait for required conditions before load-sensitive proof

**Identity:** SEED-367#wait-for-a-quiet-machine-before-load-sensitive-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** Shared execution. A developer whose story needs
  load-sensitive proof gets the conditions that proof actually requires,
  rather than an assumed quiet-machine prerequisite. Agents stop repeated
  attempts while required power, load or other recorded conditions are
  unavailable, preserving the proof obligation and its resume condition.
- **Evaluation.** Proposal to validate during refinement: distinguish three
  cases before choosing another run. Missing required conditions leave proof
  pending, with the missing condition and the next eligible action named.
  A failure outside the proof's supported conditions retains its evidence and
  needs a bounded conditions judgment. A failure within required conditions
  stays a defect under the
  [failure policy](../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  In particular, SEED-340 requires stability at load 30–50: passing on a quiet
  machine cannot replace that proof or excuse an in-range timeout. Codex
  SEED-287 also required AC power and a specified load window, not quietness
  alone. Changing required conditions remains a human-owned proof decision.
  While conditions are unavailable, do not rerun, poll or dispatch repair
  agents merely to wait; retain independent work and engage the developer only
  when their decision or action is needed.
  Compare test runs, repair-agent cost and interventions on matched stories.
- **Priority.** After the SEED-345 efficiency stories, because the mechanism
  is still unclear. SEED-334's product-wide end-to-end execution made 410 test
  runs, and repair agents carried 22.8M of its 80.7M.
- **Effort and boundary.** Medium, low confidence. Refinement first identifies
  each proof's required and supported conditions and how they are measured;
  it does not introduce a universal quiet-machine gate.
  [Waiting and test-heavy stories](https://github.com/terryyin/open-dough/blob/ffdd3dd800a7325237adcfc9c54920956bb63f7b/docs/maintainer/claude-code-execution-usage-spikes-2026-11.md#waiting)
