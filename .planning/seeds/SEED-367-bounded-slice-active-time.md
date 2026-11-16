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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/669-bound-diagnosis-in-evidence-rounds/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d714ab0db2188cd04635aedf24426c572c58e7a31892a775828efc9846626bd2","plan":"d4f9abf2016af80f2e775d62a4e4fa9dfe37c86fb09e44e68a63914155cfa1a3"}}
```

**Goal.** A developer whose execution meets a flaky test, a CI-only failure or
a hang gets either a confirmed cause or a stop with a diagnosis record a person
or fresh agent can act on. Diagnosis spends bounded active effort rather than
running open-ended, and the slice's proven and suspect work survives it. The
[failure policy](../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
still owes the repair; this story bounds how it is diagnosed, not whether.

**Scope.**

- A failure diagnosed and fixed within its slice's
  [15 active minutes](../../Distribution/src/skills/dough-execute-plan/references/oversized-slice.md#track-active-time)
  needs nothing new.
- Diagnosis runs in rounds once its cause is still unknown when either:
  - a slice reaches its limit while diagnosing, or
  - an owned CI failure is handed to a
    [repair agent](../../Distribution/src/skills/dough-execute-plan/references/ci-monitor.md#handle-a-notification),
    which today runs with no time bound.

  At a slice's limit, the slice's unfinished changes are parked, not reverted,
  because they may be the suspect.
- A round has 15 active minutes on the slice clock. Time inside clock-run
  proof commands does not count, as for slices.
- Each round ends by updating one diagnosis record. Its fields:
  - each failure signature, and whether each reproduction matched it;
  - the reproduction rate and its conditions: load, workers, platform, and
    other work running;
  - the base-versus-candidate attribution, and whether this story's changes
    touch the failing code;
  - CI run, job, attempt and artifact references;
  - each hypothesis with its experiment and result;
  - environments ruled out, with counts;
  - the reproduction command, any instrument, and evidence actually captured;
  - temporary diagnostic edits to revert, and the parked changes in the
    tested tree;
  - unrelated defects found;
  - the leading hypothesis and the next discriminating experiment;
  - the round count and cumulative active minutes.
- The record lives with the execution's plan, or under the executable-plan
  root for quick execution, so it survives agents, handbacks, refinements and
  resumes. A fresh context resumes the same diagnosis's round count and
  cumulative minutes; it never renews the allowance.
- The next round starts in a fresh context from the record only when the last
  round made progress, or it switches experiment kind. Progress means one of:
  - it first reproduced the signature (natural or forced), raised its rate,
    or captured missing evidence;
  - an instrument or experiment narrowed the cause;
  - it confirmed a hypothesis; or
  - it refuted a hypothesis while a matching reproduction exists.

  After a round whose reproduction attempts all failed, the next experiment
  must be a different kind, such as instrumentation, injection, or diagnostics
  that let the next CI failure answer it. More repetition at higher load does
  not qualify. Otherwise, and in any case after three rounds, diagnosis stops
  for a human.
- Every repeat batch and every CI run states its hypothesis and stopping count
  before it starts.
- A cause is confirmed by a reproduction that fails before the fix. That
  reproduction becomes the fix's proof. The fix gets its own 15-minute slice
  clock rather than counting against the rounds.
  - A cause in the parked changes resumes that slice with the fix.
  - A cause in committed or trunk code is fixed and delivered before the
    parked work resumes, as CI repair already orders it.
- A stop for a human keeps the record, the parked work and the owed repair.
  The human may authorize more rounds, a different approach, or the design
  judgment the stop names.

Out of scope:

- the conditions a load-sensitive proof requires, which belong to the
  [sibling story](#wait-for-a-quiet-machine-before-load-sensitive-proof);
- deadlines for waiting on a live proof run;
- changing the slice limit or what counts as active time;
- matching failure signatures automatically;
- metering diagnosis cost.

**Key examples.**

- An implementer meets a flaky spec at 6 elapsed minutes. It forces the race
  with an injected delay at 9 and fixes it by 13. The slice continues; no
  record or round is created.
- A slice reaches 15 minutes with a focused spec failing 2 in 10 and no cause:
  - its uncommitted changes stay parked;
  - the record names the signature, rate and load, and that the failing spec
    exercises the slice's new code;
  - round 1 starts in a fresh context.
- An owned CI failure on a published revision goes to a repair agent. At 15
  active minutes it has measured two candidate causes and has one natural
  reproduction. The reproduction is progress, so round 2 starts from the
  record. In round 2, injected Actions latency forces the failure. The cause
  is confirmed, and the fix runs on its own clock with that forcing as proof.
- Round 1 ran 900 repetitions locally and in a Linux container without one
  failure:
  - when round 2 names a spawn log as an instrument, it starts;
  - when it names another repetition batch at higher load, diagnosis stops
    for a human.
- Round 1 refuted two hypotheses without a matching local reproduction, and
  round 2 added diagnostics with no narrowing. Diagnosis stops after round 2,
  before the cap. The record names the diagnostics the next CI failure will
  report.
- Three rounds end without a confirmed cause. The stop reports 3 rounds and 45
  active minutes. When a replacement agent resumes the same failure after the
  human's answer, it continues at round 4 only if the human authorized more
  rounds.
- A repair agent wants a CI run to check whether the shard order matters. It
  states that hypothesis and one run before pushing. A rerun with no stated
  hypothesis is not an experiment and is not started.

Evidence: ten Claude Code diagnosis transcripts reviewed on 2026-11-16, five
CI or flaky repair agents and five slice implementers. Diagnosis took 1–28
active minutes; none needed more than two 15-minute rounds. Waiting and
qualification dominated wall time: an 82-model-minute CI-timeout repair spent
about 28 active minutes diagnosing. The proposed "confirmed or refuted"
continuation would have stopped two diagnoses that later succeeded and allowed
one that never reproduced. Successful confirmations came from forcing or
instrumenting, never from repetition. Recorded fields come from what those
agents actually used.

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
