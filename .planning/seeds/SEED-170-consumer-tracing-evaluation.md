---
id: SEED-170
status: active
planted: 2026-10-29
trigger_when: Evaluate consumer tracing against real misses and successful deliveries
scope: bounded
---

# SEED-170: Evaluate consumer tracing against actual outcomes

## Story

<a id="evaluate-consumer-tracing"></a>

### Decide whether to keep, simplify, or change consumer tracing

**Identity:** SEED-170#evaluate-consumer-tracing
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Give Open Dough's maintainer an evidence-backed decision about consumer
tracing's contribution to useful proof selection, missed effects, and total effort.

**Scope:** Investigate ODF-150 using Pygardon SEED-144's plan 411, Pygardon
SEED-145's plan 430, and Open Dough SEED-168's publication repair. Recover the
applicable guidance, actual tracing and acceptance evidence, missed consumers,
repairs, and available cost. Distinguish discovery limits from incomplete use or
proof acceptance. Preserve unrelated active work and the current direction.

**Expected outcome:**

- Trace each failure from the original change through discovery, proof selection,
  acceptance and repair, with exact recoverable sources and qualified unknowns.
- Compare the successful publication repair, including what its initial
  investigation already knew before the later consumer trace.
- Separate actual use from reconstructed replays, and observed cost from estimates.
- Recommend keep, simplify, or change, explaining which parts the evidence supports
  and what remains unproved. Record the assessment at ODF-150's existing home,
  with a linked concise analysis when useful.

**Evaluation basis:** This is a retrospective, exploratory three-case assessment
under ADR 0010, not an estimate of sustained effectiveness. Traceable prevention
or improved proof choice is a benefit; reviewing already-known consumers may
provide confirmation but is not a new discovery. Count failures by execution,
not symptoms. A missing conforming script trace cannot establish a script defect.
Assess the strongest simpler approach that preserves relevant behavioral proof.
Missing cost or human-effort data stays unknown.

**Authority:** The developer requested investigation and a decision on 2026-10-29.
No implementation, release, client mutation, new response execution, or broad
feedback-maintenance cycle is selected. Any consequential recommendation to
change the mechanism remains a proposal for the maintainer.
