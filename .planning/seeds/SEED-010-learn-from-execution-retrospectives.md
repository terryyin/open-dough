---
id: SEED-010
status: active
planted: 2026-09-09
planted_during: Execution retrospective extraction follow-up
trigger_when: Improve empirical process control in Open Dough and selected client projects
scope: large
---

# SEED-010: Improve products and processes through observed outcomes

## Current context

Developers and maintainers use retrospectives and feedback maintenance to
connect observed problems to bounded responses and evaluate their effect after
release. The [research report](../../docs/maintainer/empirical-process-control-research.md)
retains the findings and evaluations, including the completed assessment of
Doughnut's note-details disclosure. The
[maintenance runbook](../../docs/maintainer/retrospective-findings-runbook.md)
and [response watch list](../../docs/maintainer/near-term-watch-list.md) track
the current workflow and outstanding observations.

The [execution retrospective](../../src/skills/dough-execution-retrospective/SKILL.md)
and [project findings maintenance](../../src/skills/dough-triage-project-findings/SKILL.md)
guidance own the delivered workflows. The broader feedback-loop proposal and
its decisions are recoverable from the
[original seed](https://github.com/terryyin/open-dough/blob/7cda80ffebcb3a190d1c71f80aec3e33b7e59f95/.planning/seeds/SEED-010-learn-from-execution-retrospectives.md).

## Stories

<a id="review-independently-observable-promises"></a>

### 1. Record source-review evidence once per independently observable promise

**Identity:** SEED-010#review-independently-observable-promises
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Let planned-execution coordinators use an independent review to catch
missing product proof while recording a shared observation once when several
qualifications describe the same promise. Keep user-visible alternatives,
restrictions that need their own check, and post-execution owners traceable to
the original source.

**Evaluation:** Replay a small and a compound story from [ODF-481](../../docs/maintainer/findings/ODF-481.md).
Compare the number of independent allocations and repeated observations with the
current review. Show that the previously missed pronunciation behavior and a
separately checkable alternative still require proof. Show that a settled
baseline, effort hypothesis, or proof-method explanation cannot add an
independent observation. Reuse the existing source review and obligation
record. Record the delivered response and containing release at ODF-481.

## Separately pending lifecycle validation obligations

These obligations remain pending under the recorded release exceptions. This
section preserves their scope without creating another selected story or
assigning backlog priority. A future human selection can establish an
appropriate acceptance story.

- Retrospective findings remain useful and correctly attributed: local recording,
  recurrence without duplicate counting, qualified findings, project context,
  execution-release provenance, and preservation of adopted finding identities.
- Review selection and bounded logging behave as configured: independent process
  and product selection, preserved project preferences after update, bounded
  recording and replacement, and authorized product-to-backlog outcomes.
- Quick, planned, and oversized executions preserve attributable work and proof:
  entry authority, **Taken** handling, refactoring and delivery, remaining-work
  conversion, planless retrospective recovery, and ordinary planned recovery.
- Wrap-up closes supported execution contexts, handles absent retrospective
  advice, preserves active work and recoverability, and retires only disposable
  implementation direction.
- Planning and implementation guidance produces useful decisions: refinement and
  planning boundaries, cumulative design, whole-product correction and test
  review, simple domain rules, PFE reuse and changed assumptions, optional
  architectural thinking, and human resolution of conflicting direction.

Use representative native cases and justified reuse under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md). Separate shared
integration proof from skill behavior; one tool's success does not prove another's.
Assess applicable evidence from 0.3.11 and ordinary released use before fresh
runs. Missing proof remains pending. Release exceptions do not mark these
obligations passed.
