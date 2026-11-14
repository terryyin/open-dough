---
id: SEED-346
status: active
planted: 2026-11-14
planted_during: Terry asked for runnable A/B comparisons using labeled examples from the session-efficiency audit
trigger_when: selected from the product backlog for refinement
scope: story
---

# SEED-346 — Run native A/B comparisons on examples from real work

<a id="run-native-ab-comparisons-on-real-work"></a>

### Run native A/B comparisons on examples from real work

**Identity:** SEED-346#run-native-ab-comparisons-on-real-work
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

An Open Dough maintainer can choose a representative example and run a
baseline and a candidate on demand. The comparison shows whether the change
preserves the outcome and its proof, and what it does to agent effort.
Maintainers can reuse the same example for a later change.

#### During refinement

Review the architecture carefully during refinement. The earlier Doughnut
comparison provides one worked example. This story establishes a reusable
capability. Compare how to retain and refresh examples, isolate each run,
pin payloads independently, and assess results. Capture the architectural
direction and open trade-offs in the [Architectural North Star](../NORTH-STAR.md)
as they become clear.

#### Scope

- Retain an initial set of runnable examples in Open Dough. Extract the
  SEED-324 blocked-supplier decision from the
  [session-efficiency audit](../../docs/maintainer/session-token-efficiency-research.md#1-wake-the-coordinator-for-results-changes-and-bounded-deadlines).
  Use the [Doughnut SEED-122 verification replay](../../docs/maintainer/intent-coverage-cost-research.md#same-story-waiting-comparison)
  as the calibration case. Record each example's source session or replay,
  relevant project revision, and the starting state it needs.
- Keep the smallest runnable context that preserves the original decision
  and its proof. Keep the task, setup and separate acceptance check together.
  Use controlled events or service state where waiting on the original
  environment would dominate the run. Qualify each example as a
  representative task with enough judgment and verification to distinguish
  outcomes and a duration suitable for repeated runs.
- Tag each example with the workflow or problem it represents and traits
  that help a maintainer choose it, including applicable hosts, project
  environment, and expected duration. Preserve the case revision used in
  each comparison so a maintainer can revise an example as circumstances
  change and still recover the earlier comparison basis.
- Give the maintainer an on-demand way to select a case and run fresh,
  isolated native sessions. Use equivalent starting state and matched
  conditions, record the factor under test, and pin each Open Dough payload
  independently of the example project. Keep the assessor's expected
  outcome separate from the agent task. Return the observed outcome,
  decisive proof, effort and any unavailable evidence for both arms.
  Routine CI and local suites retain their deterministic checks.
- Reuse applicable native fixture and payload setup. The existing
  [effort comparison story](SEED-345-session-token-efficiency.md#compare-agent-effort-on-comparable-runs)
  owns reusable accounting from retained sessions. This story creates
  the matched runs, preserves their comparison basis, and uses available
  measurements for its verdict.

#### Key examples

1. A maintainer selects the blocked-supplier example from its tags and
   compares two payloads on the same host. Both start with the same paused
   supplier, consumer work, accepted proof, and controlled resume event.
   The report shows whether each arm resumes the right work once and
   preserves proof, then compares effort and empty wakes.
2. A maintainer runs the bounded Doughnut calibration example. The verdict
   identifies whether each arm caught the same fault and passed restored
   proof. A missing result or proof discrepancy stays visible even when an
   arm used fewer requests. A maintainer can identify the case version,
   payloads and host used to obtain that verdict.

#### After implementation

The A/B guidance in ADR 0005 is provisional. It draws on the earlier
comparison and anticipates a reusable capability. Review it after the first
end-to-end runs. Use what worked, what proved difficult, and what the evidence
can support to decide whether the ADR needs an update.

#### Priority

Place this after the urgent resume, long-verification and evidence-retention
work and the existing landed CI coverage correction. Place it before the
guidance, context and Cursor handoff trials so those stories can use the
examples. Urgent work can start with its own focused comparison.
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
governs native validation and on-demand experiments.
