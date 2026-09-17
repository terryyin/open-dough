# Stop invalidated optimization paths at the next-slice boundary

## Source

[SEED-010 Story 6](../../seeds/SEED-010-learn-from-execution-retrospectives.md#act-on-decisive-optimization-checkpoints),
first in the product backlog and refined on 2026-09-17. The maintainer kept the
current backlog order because this correction and the other selected work will
be released together.

## Goal and scope

A developer running a measured test-optimization plan gets an explicit strategy
decision when a recorded checkpoint invalidates the remaining path to the
agreed target, before execution dispatches another dependent optimization
slice.

Include the checkpoint's current measurement, remaining-gap comparison,
affected strategy assumption, consequences for remaining experiments, and the
selected authorized decision in the active plan. Permit continued execution
when the evidence still supports a plausible route. Preserve completed
improvements and compatible proof, and stop only the dependent path when a
different target, outcome, or scope needs the developer's decision.

Exclude a new metric or checkpoint owner, a numeric plausibility formula,
automatic hypothesis scoring, generic approval gates, automatic cancellation or
replanning, target changes, non-optimization reassessment policy, and changes to
unrelated execution lifecycles. The other work in the selected combined release,
release-version choice, tag, publication, and adoption are outside this plan.
After this correction is delivered, retain Story 6 until the combined release
can supply ODF-023's required first-containing-release attribution.

Assume an affected optimization plan already records an explicit time target,
comparable checkpoint result, and expected remaining savings as required by
`dough-test-optimization`. Missing or inconclusive evidence does not become a
fabricated decisive checkpoint.

## PFE and decisions

Change the two existing responsibilities rather than add another workflow.
`dough-test-optimization` already owns the target, measurement, hypotheses, and
remaining-gap comparison. `dough-execute-plan` already applies shared execution
decisions before selecting each next slice. Make the former leave an explicit
decision obligation in the active plan and make the latter honor that obligation
at its existing boundary. Keep the comparison in one authoritative home; do not
copy optimization arithmetic into general execution guidance.

The current `Reassess before extending work` rule is the suitable execution
solution, but its general wording did not make the optimization checkpoint
handoff unavoidable in the recorded 0.3.18 recurrence. Strengthen that handoff;
do not create a new state file, checkpoint registry, or third skill.

[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires stopping an invalidated path, resolving consequential judgment, and
improving from observed recurrence. [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one shared runtime source written for the agent in the executing
project. [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
allows a representative behavior review for this conventional shared-guidance
change while reusing unchanged installation evidence. No new architectural
choice or North Star topic is warranted.

## Outside-in proof

All implementation promises belong to Slice 1:

- A decisive Pygardon-shaped checkpoint records the observation, invalidated
  assumption, effect on remaining experiments, and selected authorized decision
  before another dependent experiment is dispatched.
- A checkpoint with a plausible remaining route does not create a gratuitous
  stop.
- A required target, outcome, or scope change preserves completed improvements
  and stops only the dependent optimization path for the developer.
- The remaining-gap comparison stays owned by `dough-test-optimization`; general
  execution guidance enforces the recorded decision without duplicating that
  domain rule.

Proof: review the final combined runtime guidance against the three key examples
in the source story and inspect the complete diff to confirm the single-owner
handoff. Then run `git diff --check`, `npm run lint`, and
`bash tests/install-all-tools.sh` to verify repository formatting and unchanged
shared-payload installation. Do not add exact-prose assertions or a new native
tool matrix for this conventional instruction change.

## Ordered slices

### 1. Honor a decisive optimization checkpoint before the next experiment
Type: Behavior
Status: planned
Proof: the outside-in behavior review and focused commands above pass.

Behavior: Given an optimization plan with an explicit target and a comparable
checkpoint whose recorded remaining experiments cannot plausibly close the
remaining gap, when execution reaches the next-slice boundary, it records and
honors an authorized strategy decision before dispatching another dependent
experiment. A still-plausible path proceeds, while a decision outside the
agent's authority stops only the affected path and preserves completed value.

Implementation boundary: revise the shared `dough-test-optimization` source and
the existing `dough-execute-plan` reassessment handoff only as needed to make the
checkpoint decision explicit and enforceable. The main execution workflow
already applies those decisions at the next-slice boundary; do not duplicate the
rule elsewhere or edit installed managed copies. After delivery, update ODF-023
with the exact implemented response while preserving the failed 0.3.14 response
and 0.3.18 recurrence; leave the first-containing-release field pending until
the maintainer's combined release exists.

Safe stopping point: a decisive checkpoint cannot be bypassed silently, a
plausible path is not interrupted, and completed optimization value remains
recoverable without any new workflow or measurement machinery.

No separate Structure slice is justified: the existing optimization owner,
active-plan decision record, and execution boundary already provide the needed
coherent model.
