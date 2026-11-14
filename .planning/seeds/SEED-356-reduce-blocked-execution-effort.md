---
id: SEED-356
status: active
planted: 2026-11-14
planted_during: Terry abandoned the SEED-345 resume implementation after its negative token comparison
trigger_when: selected from the product backlog
scope: story
---

# SEED-356 — Reduce total model work during blocked execution

<a id="reduce-total-model-work-during-blocked-execution"></a>

### Reduce total model work during blocked execution

**Identity:** SEED-356#reduce-total-model-work-during-blocked-execution

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer should be able to leave authorized work blocked on
an unmet supplier outcome, preserve its partial work and proof, and continue
when meaningful evidence allows progress, with less total model work and no
extra developer rescue compared with the existing workflow.

#### Goal and evaluation

Demonstrate a worthwhile net reduction in complete-task model requests and
tokens under a stated representative blocked-work baseline. Count coordinator
and worker effort from setup and enrollment through waiting, reassessment,
continuation, any recovery, and final proof. Report cached input, uncached input,
output, and developer interventions separately. Preserve correct output,
decisive proof, ownership, authority, model/settings and publication decisions.
Declare the gain worth keeping, quality criteria, and acceptable overhead on
ordinary unblocked work before evaluation, following
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).

Use the smallest real-work example that exercises the proposed saving. Include
unchanged evidence, new evidence that still fails the supplier agreement, and
qualifying evidence. Require preserved partial work and accepted proof while
blocked, then exactly one continuation with passing proof when the agreement
is satisfied. Measure through subsequent work and proof. Unknown worker usage
stays unknown. Judge net effort across the whole task and keep any proof loss
visible in the result.

#### Experience from the abandoned attempt

Terry abandoned SEED-345#resume-when-blocked-work-can-advance and directed a clean
reversion, retaining only the independent A/B-assessor fix, regression proof and
experiment evidence. The retained-fix [controlled A/B](../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921-observer-ab.json) observed 0.00% token difference on identical saved native subjects. Its implementation and spent planning are recoverable at
Git revision `56000581b9b4cd65984e681b8c849b59e23503b2`; they are not the starting
architecture for this story.

- The [matched comparison](../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921.txt)
  used baseline 91f32d3 and candidate 764c4e0 with the same task, host/settings and
  events. After correcting a missed delegated proof, both preserved the outcome.
- [Observed tokens](../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921-tokens.md)
  rose from 8,386,947 to 13,434,290 (+60.2%); requests rose 80 to 94. This is one
  stochastic pair, not an estimate of population-wide regression or price.
- The case forced four turns in each arm. The candidate had no native handle
  for automatic delivery and used the manual fallback. It paid additional hold
  bookkeeping while no wake was suppressed. This experiment exposed overhead
  but did not establish the proposed event-driven saving.
- Additional guidance/runtime inspection, hand-built execution/condition records
  and verbose status/recovery data enlarged the retained context. At qualifying
  continuation the first coordinator input was 122,918 vs 77,768 tokens; the
  implementation worker began at 169,054 vs 123,672. Larger context then carried
  through later requests and workers. About 79% of the token excess occurred
  after qualification. Exact causal allocation remains unproved.
- A coordinator-only assessor missed passing tests performed by an owned worker,
  initially creating a false improvement verdict. The retained observer fix
  verifies actual worker identity, current turn, workspace and terminal receipt.
- A separate native journey proved functional continuation and duplicate guards;
  it did not prove the total-cost improvement. Known native evaluation alone
  consumed at least 29,369,243 tokens; complete implementation cost was larger or
  unknown. Prove the economic premise early and bound evaluation cost.

#### Approach to redefine

The implementation approach is **unselected**. Reassess the existing workflow
and available host facilities before choosing a solution. Do not automatically
restore the abandoned daemon, transport extraction, retained JSON protocol or
agent-side setup. Decide where responsibility belongs and what the agent must
actually read or construct from observed costs, rather than inheriting them.

#### Comparison cases and preflight

- Use the event-driven paused-supplier variant and the representative unblocked
  example from [Save and reuse native A/B baselines](SEED-346-native-ab-comparisons.md#reuse-native-comparison-baselines).
  Verify that their saved baselines match the candidate comparison's material
  conditions and measurement needs. Obtain a fresh baseline when they differ.
  The forced-turn result remains evidence for correctness and per-wake overhead.
- Before paying for a full pair, demonstrate that the selected native host can
  use the candidate's actual delivery path and that the assessor distinguishes
  an intentional skipped wake from an unavailable or broken session. Check
  that it still requires preserved work, exactly one qualifying continuation,
  and terminal proof from the coordinator or its owned worker.
- Use the unblocked case through final proof to check candidate overhead on
  work with zero wakes to save.
- Reassess the opportunity if the current baseline already stays quiet in the
  representative blocked case. Stop the candidate if its setup, continuation,
  or recovery costs erase the worthwhile net saving through final proof, or
  if it exceeds the agreed unblocked overhead or loses quality. Retain the
  observations and distinguish an evaluation defect from a candidate failure.

#### Boundaries and open decisions

Preserve exact supplier-condition judgment, accepted work/proof, execution owner,
permission and CI receipt rules. Supplier publication alone does not satisfy an
agreement. Repeated/uncertain delivery must create no duplicate writer. Missing
facilities must produce truthful recovery ownership rather than a promise of
unsupported automatic continuation. Keep running-verification efficiency and
general accounting tooling with their existing sibling stories.

Refinement must select the representative task/host, existing baseline, expected
block frequency, meaningful net gain, ordinary-task nonregression criterion,
evaluation budget, and the smallest candidate worth testing. No slice plan or
implementation is authorized by this queued story. Apply
[AGENTS.md's failure policy](../../AGENTS.md#failing-and-flaky-tests) as written.
