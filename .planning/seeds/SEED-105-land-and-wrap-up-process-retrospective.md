---
id: SEED-105
status: active
planted: 2026-10-05
planted_during: Terry's request for optional process retrospectives on Dough Land and Story Wrap Up
trigger_when: A developer wants to learn from how a Dough Land or Story Wrap Up run went
scope: unestimated
---

# SEED-105: Optional process retrospective for Dough Land and Story Wrap Up

## Why This Matters

Process review learns from how an agent worked, but today only the execution
retrospective offers it. Dough Land and Story Wrap Up also do substantial,
rule-driven work: reconciling and publishing trunk, retiring worktrees,
assimilating product knowledge, and handling follow-ups. Waste, churn, missing
stops, or unusable instructions in those runs go unrecorded. An opt-in process
retrospective lets a developer capture that learning in the same retrospective
findings without slowing ordinary runs.

## Story

<a id="land-and-wrap-up-process-retrospective"></a>

### Optional process retrospective for Dough Land and Story Wrap Up

**Identity:** SEED-105#land-and-wrap-up-process-retrospective
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer who invokes Dough Land or Story Wrap Up with
`--process-retrospective` gets a process review of that run whose supported
findings are recorded in the same retrospective findings (`DearDough.md`) as
the execution retrospective's process review.

**Scope:**

- Dough Land and Story Wrap Up each accept `--process-retrospective`. Without
  it, neither runs a process review, as today.
- With the flag, review the run's own process from its real record, as the
  [execution retrospective's process review](../../src/skills/dough-execution-retrospective/SKILL.md#review-process-only-from-a-real-record)
  does, and record supported findings through the same
  [process-finding recording](../../src/skills/dough-execution-retrospective/references/process-finding-recording.md)
  into the same `DearDough.md`.
- Reuse the existing process review and recording rather than adding a second
  copy of either.
- Describe the flag where each skill describes its invocation.

**Key examples:**

- `/dough-land` alone lands as today and runs no process review.
- `/dough-land --process-retrospective` lands, then reviews that landing's
  process; a supported finding (for example, repeated trunk reconciliation
  attempts caused by an unclear rule) appears in `DearDough.md` beside
  execution retrospective findings.
- `/dough-story-wrap-up --process-retrospective` wraps up the story and records
  supported findings about the wrap-up's process in the same `DearDough.md`.
- A flagged run with no supported findings leaves `DearDough.md` unchanged.
- A flagged run whose history is unavailable reports the process review
  unavailable and still completes the land or wrap-up.

**Refinement input:** Settle when the review runs relative to each skill's
final publication (for example, whether Dough Land's findings must be committed
before or after landing, and how a wrap-up that removes history still has a
record to review), how the review interacts with the dashboard completion
report as the final operation, and whether the project's
`skipProcessRetrospective` setting should also affect these skills or only the
flag enables them.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dough Land](../../src/skills/dough-land/SKILL.md).
- [Story Wrap Up](../../src/skills/dough-story-wrap-up/SKILL.md).
- [Execution retrospective](../../src/skills/dough-execution-retrospective/SKILL.md).
- [Learn across execution retrospectives](SEED-010-learn-from-execution-retrospectives.md).
- Terry's 2026-10-05 request: land and wrap-up should have their optional
  process retrospective as well, off by default and turned on by
  `--process-retrospective`, putting the process review result into the same
  retrospective findings as the execution retrospective.
