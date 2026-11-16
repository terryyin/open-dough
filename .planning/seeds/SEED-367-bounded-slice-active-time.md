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
