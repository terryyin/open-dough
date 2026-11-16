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

<a id="discard-time-after-an-ended-session"></a>

### Discard a slice's clock time after its session ended

**Identity:** SEED-367#discard-time-after-an-ended-session

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/668-discard-time-after-an-ended-session/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3ef8a5d9d97671362e115ae5a9ce2965744133022df038e3eba8557cd3b96f28","plan":"c3911e09ebca5455d5071705e852b46540278878df3b83532e8926ad20e720ca"}}
```

**Goal.** A developer whose execution session ended in the middle of a slice
gets that slice's active time back without the idle gap until the next
session. The coordinator resuming execution settles the ended session's running
slice at its last clock command, so the
[slice limit](../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#track-active-time)
reports no overrun that did not happen, and a new coordinator can start a
different slice without a `pause` it could not have run in time.

**Scope.**

- The slice clock records the time of every clock command in the checkout:
  `start`, `pause`, `status`, and the start and end of each `run`.
- A coordinator starting in a new session names that with a `start` option.
  When a slice is still running in the checkout, the clock then settles it:
  its open period ends at the last clock command, and a `run` the ended
  session left open ends there too. The named slice then starts or resumes
  from now. When nothing is running, the option changes nothing.
- The resume guidance in
  [continue or recover at an execution boundary](../../Distribution/src/skills/dough-execute-plan/SKILL.md#continue-or-recover-at-an-execution-boundary)
  and [track active time](../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#track-active-time)
  tells a coordinator in a new session to start with the option. Pausing when
  execution stops for the coordinator or a human keeps its current behavior.
- A slice settled at the limit is reported as an overrun as before; its
  report now counts only the settled time.

Out of scope: detecting an ended session by itself; counting active time after
the last clock command (an ended session loses that work, so the settled time
can undercount); the host hook recording tool calls; changing the limit or
what counts as active time.

**Key examples.**

- Slice 3 has 9 active minutes at the session's last `status` at 10:00. The
  session ends with slice 3 running. At 14:00 a new coordinator starts slice 3
  as a new session: the report gives 9 elapsed and 6 remaining, with no
  overrun.
- In the same situation the new coordinator starts slice 4 as a new session,
  with no `pause`: slice 3 is paused at 9 minutes and slice 4 starts at zero.
  Without the option the same `start` is still refused while slice 3 runs.
- Slice 3 has 6 active minutes at 10:00, and an implementer's `run` of a
  focused suite starts at 10:02. The session ends before the `run` returns. A
  new coordinator starts slice 3 as a new session at 14:00, and at 14:03
  `status` reports 11 elapsed and 4 remaining: the period and the `run` end at
  10:02, so the resumed time counts instead of hiding inside the dead `run`.
- The previous session paused slice 3 before it ended. A new coordinator
  starts slice 3 as a new session: it resumes exactly as a plain `start` does.

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
