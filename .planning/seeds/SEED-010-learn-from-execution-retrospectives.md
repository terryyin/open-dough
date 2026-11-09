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

<a id="plan-cohesive-reorganization-of-oversized-files"></a>

### 2. Plan the cohesive reorganization of an already-oversized file a slice touches

**Identity:** SEED-010#plan-cohesive-reorganization-of-oversized-files
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/562-plan-cohesive-oversized-file-reorganization/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"45be2780101336ec985508a2e706d6e9e7881fd5180e3323afd22ee34654d9ae","plan":"6ca8090872cd40ba510d63c6758387da17a3db4f9a8565445b354cdef5439d9c"}}
```

**Goal:** Developers whose slice edits an already-oversized file understand and
own its cohesive reorganization before implementation. The independent refactor
pass can validate that result instead of first discovering its cost and asking
for an exception. In [ODF-152](../../docs/maintainer/findings/ODF-152.md), plan
552's comment-only edits to six oversized files stopped refactoring; Terry
rejected an exception and a simple split, then directed a design-led
reorganization costing about 1.1M reported tokens. Related evidence remains at
[ODF-189](../../docs/maintainer/findings/ODF-189.md),
[ODF-195](../../docs/maintainer/findings/ODF-195.md) and
[ODF-207](../../docs/maintainer/findings/ODF-207.md).

**Scope:** For expected edits to files already over 250 lines, including
comment-only changes, planning identifies the file and current size, cohesive
responsibilities and seams, affected callers and preserved proof, and the slice
owning reorganization. Necessary Structure belongs with or immediately before
the Behavior it enables. Delegation carries that decision and the existing
file-size rule; a newly discovered oversized edit gets the same decision before
editing. Where scope or architecture needs human judgment, the affected work
waits for the developer's recorded decision with its exact scope.

Keep the existing 250-line rule and cohesive-design requirement: short diffs,
prior exceptions and a plan mention do not waive it. Refactoring checks the
delivered reorganization; a missed file, unmet decision or contrary evidence
returns the file, missing decision and affected work through the existing stop,
without granting an automatic exception or treating a mechanical split as the
solution. Preserve existing authority for cross-subsystem work and exceptions.

**Scope limits:** No repository-wide cleanup, new size scanner, relaxed limit,
executable-plan size policy (ODF-362), or general policy for new/near-limit files.
Release and rollout remain separate work. Record the delivered response and
ordinary-use criterion at ODF-152, noting relevance at ODF-189/195/207; record the
first containing release only when verified, keeping it pending until then.
Delivery and representative review do not themselves establish improvement.

**Key examples:**

1. Plan 552's comment-only edits would touch six already-oversized files →
   planning and the implementation brief assign their design-led reorganization
   before those edits, using cohesive watcher observations, fault/origin guards,
   page-free proof and review responsibilities rather than arbitrary cuts →
   refactoring validates the delivered structure and preserved behavior.
2. An ordinary small edit touches an oversized file → the plan or brief names
   its size, seams and owning slice before implementation → the implementer
   delivers that reorganization and the refactor pass finds no surprise size
   decision for that file. This story's ODF-152 response update is one such case.
3. A proposed reorganization conflicts with an Accepted ADR or needs unapproved
   cross-subsystem work → stop the affected path before implementation for the
   developer's decision, retaining other work. A recorded exception applies only
   to its stated file, work and conditions.
4. Implementation or refactoring reveals an additional oversized file or an
   incomplete planned reorganization → identify the new evidence and missing
   decision, preserve the work and use the existing stop/replanning path. Do not
   claim refactoring complete merely because the plan mentioned size.

**Plan:** [562 — Decide cohesive reorganization before editing an oversized file](../slice-plans/562-plan-cohesive-oversized-file-reorganization/PLAN.md).

<a id="pending-lifecycle-validation-obligations"></a>

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
