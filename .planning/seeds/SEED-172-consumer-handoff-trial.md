---
id: SEED-172
status: active
planted: 2026-10-29
trigger_when: Evaluate a simpler consumer-tracing handoff prospectively
scope: bounded
---

# SEED-172: Evaluate a compact consumer-tracing handoff

## Story

<a id="trial-compact-consumer-handoff"></a>

### Decide whether a compact handoff earns its review cost

**Identity:** SEED-172#trial-compact-consumer-handoff
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/374-consumer-handoff-trial/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3fdba5e985dfd6666e790817d22a277609ee9859d4824bdda28c201d8e37d9c9","plan":"496179de4f682407e33207e10e139306ecc4a7804ea96949579bbca1d8e2f401"}}
```

**Goal:** Give Open Dough's maintainer a bounded prospective comparison of the
current and compact tracing handoffs, measuring missed consumers, useful
discoveries and review effort before deciding whether to change the mechanism.

**Scope:** Four paired shadow reviews of ordinary Open Dough shared-contract
changes, with the same frozen evidence and independent reviewers. Keep the full
trace and every required per-consumer disposition. Compare presentation and
navigation, not different product implementations, authority or proof standards.
Use the existing ODF-150 assessment to calibrate scoring, not as trial outcomes.
Version 2 first runs one fully timed fixed-case replay to verify the observation
method; that replay and version 1 never count among the four prospective cases.

**Examples:**

- A source owner is found but its observing test is omitted: the reviewer must
  identify that specific gap or its outcome is a missed consumer.
- A trace helps choose additional justified proof: count the new useful purpose
  once, even if several matching files or assertions express it.
- A compact summary is quicker to read but hides an earlier relevant lead:
  reject it despite time saved.
- Missing timing, an unaudited case or insufficient recruitment remains
  inconclusive; it is not recorded as zero cost or a successful trial.

**Evaluation basis (version 2):** Recruit the first four eligible changes within
14 days of an explicitly authorized start, with seven-day later-effect checks
and a final decision within 21 days. Cap incremental observation work at 120
agent task-minutes and 30 human minutes. Require no candidate misses or lost
useful baseline discoveries, at least 20% and one minute lower median paired
review time, and at least 10% lower total tracing/handoff/review effort. The
plan defines denominators, uncertainty, stop rules and the exact comparisons.
These are trial thresholds, not project-wide policy or established benchmarks.
Version 2 allows twelve minutes per independent audit, eight per review, and
four per presentation task. Measure C, P_A, P_B and R as complete tasks from
native dispatch to return, including reading, drafting, tools and queue time.
Freeze I0 before tracing starts. A prospective case requires these observations
from its ordinary work; reconstructed historical durations remain unknown.
The version-2 120-minute budget includes its replay and controller work; retain
version-1 costs separately. Never silently erase or retry an unsuccessful case.

**Preserved constraints:** Ordinary execution remains responsible for delivery,
tests, CI and safety. Neither experimental review authorizes publication or
suppresses a needed correction. No changes to tracing code, installed skills,
published guidance, other projects or standing automation are included.

**Source:** The developer requested this planning on 2026-10-29 after the
[three-case assessment](../../docs/maintainer/consumer-tracing-evaluation.md).
The developer subsequently authorized landing and execution, then requested:
“Revise the consumer-tracing trial with a realistic audit cap and proper timing
collection, then execute it.” This authorizes the version-2 protocol and replay,
prospective collection within its bounds, and no permanent adoption.

**Plan:** [Bounded paired trial](../slice-plans/374-consumer-handoff-trial/PLAN.md).
