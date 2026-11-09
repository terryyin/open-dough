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

For developers whose slice edits a file already over the 250-line limit, decide
that file’s cohesive reorganization while planning and delegating, so the
refactor pass does not discover it after implementation and ask for an
exception. In [ODF-152](../../docs/maintainer/findings/ODF-152.md) (SEED-284,
plan 552), comment-only edits to six oversized files stopped the refactor pass;
Terry declined an exception or a simple split and directed a design-led
reorganization that then cost about 1.1M tokens after the slice. The same rule
family recurs across Open Dough, Doughnut and Pygardon in ODF-152,
[ODF-189](../../docs/maintainer/findings/ODF-189.md),
[ODF-195](../../docs/maintainer/findings/ODF-195.md) and
[ODF-207](../../docs/maintainer/findings/ODF-207.md).

Scope: planning and delegation of edits to files that already exceed the limit,
and how the refactor stop presents that decision. It keeps the 250-line rule and
does not cover the executable plan file itself (ODF-362).

Evaluate with the plan 552 case and one ordinary small edit to an oversized
file: the plan or brief names the file, its cohesive seams and the slice that
reorganizes it, or the developer’s recorded decision, before implementation.
The refactor pass then finds no surprise size stop for that file. Record the
delivered response, its containing release and an ordinary-use criterion at
ODF-152, and note its relevance at ODF-189, ODF-195 and ODF-207.

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
