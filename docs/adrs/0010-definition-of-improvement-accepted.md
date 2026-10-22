# 0010 — Definition of improvement

**Status:** Accepted

**Accepted:** 2026-10-22, by Terry Yin, after reviewing Story 10's evaluation
and the clarifications below.

**Date:** 2026-10-22

**Decision makers:** Terry Yin

**Consulted:** Terry Yin supplied the definition and intervention targets,
reviewed Story 10's evaluation and the clarification advice, and directed
acceptance.

## Context

[ADR 0002](./0002-software-development-lifecycle-principles-accepted.md) gives
improvement its direction: deliver the highest user value first and change
direction at very low cost. Empirical control also needs a shared meaning of
improvement so delivery, automation and cheaper execution do not become success
criteria by themselves. This decision applies to Open Dough's product and
process decisions; it is not imposed on projects using its guidance.

## Decision

> An improvement is an evidenced, worthwhile gain in useful product outcomes,
> our ability to deliver them, or our ability to change direction, compared with
> a stated baseline in the relevant context. The gain must justify its immediate
> and longer-term costs within agreed quality, risk and authority constraints.

Achieving an equivalent useful outcome with less total effort can qualify.
Every dimension need not improve; the permissible tradeoffs must be explicit.

- Establish the beneficiary, intended gain, comparison and result worth keeping
  before judging the evidence. For prospective evaluation, set this basis before
  the observed run; keep a short, reusable basis for recurring processes before
  their next run. Label retrospective evaluation exploratory. Use concrete
  qualitative or quantitative criteria appropriate to the decision, and disclose
  comparison limits and later changes to those criteria.
- Consider human effort and interruptions, agent and tool use, implementation,
  rework, evaluation itself, and future complexity and maintenance. Token use,
  speed, coverage, output volume and unattended completion are evidence only
  when connected to the intended outcome and its consequences.
- Distinguish a predicted benefit, a delivered change and an observed improvement.
  Use relevant exposure to assess immediate and delayed effects. Missing evidence
  remains unknown; delivery or absence of complaints alone establishes no benefit.
  Bound conclusions to the observed context and record any necessary later check.
- Humans own goals and consequential unresolved tradeoffs. Agents evaluate and
  act within established criteria and delegated authority. A conflict or missing
  consequential decision prompts Jidoka intervention on the affected action;
  independent authorized work can continue.

### Human intervention quality

A human intervention adds value when the event calls for a decision or
responsibility reserved to a human under current delegation, requires input or
action only a human can provide, or benefits from human judgment more than AI
judgment alone. Exercising reserved authority can add value even when the human
confirms the AI's recommendation. Routine approval already covered by delegation
does not qualify merely because a human supplied it.

Assess distinct decision events with two complementary rates. Several decisions
in one stop count separately; repeated prompts about one decision do not create
new events. Count interruptions and human effort separately as costs.

| Measure | Definition | Initial target |
| --- | --- | --- |
| Valuable-intervention rate | Stopped decision events with an actual, evidenced valuable human intervention / all stopped decision events with an assessable outcome | > 80% |
| Missed-intervention rate | Assessed decision events requiring or benefiting from human intervention without a timely stop / all assessed decision events requiring or benefiting from human intervention | < 5% |

Review events with and without stops; the stop log alone cannot reveal misses.
Report numerator and denominator, unassessed or pending events and coverage;
use counts rather than percentages for small samples. A zero denominator is not
assessable, not success. Small samples cannot establish sustained target
attainment, but an observed miss still matters. These are Terry's initial
targets for continued evaluation, not established benchmarks or permission to
skip required human decisions. Detailed assessment belongs with
[the research measures](../maintainer/empirical-process-control-research.md#assess-human-intervention-quality).

## Consequences

Product and process changes share a basis for retaining, adjusting, simplifying
or reverting a response, or concluding that evidence is insufficient. An
inconclusive or negative result can still provide useful learning.

Keep the decision basis and evidence in existing work records, proportionate to
the decision. This defines no universal score, mandatory metric set, new
measurement platform or approval step for routine decisions. It supplements
ADR 0002 without superseding it.

Acceptance establishes this decision policy; it does not establish that any
process achieves the targets or produces sustained benefits. Continue ordinary
observation and revise the policy when evidence warrants it.

## Related

- [Research and candidate evidence](../maintainer/empirical-process-control-research.md#a-useful-definition-of-improvement)
- [First trial on one feedback cycle](../maintainer/empirical-process-control-research.md#feedback-cycle-evaluation-follow-up)
- [Human advice and acceptance process](./README.md#advice-process)
