---
id: SEED-043
status: active
planted: 2026-09-26
planted_during: Authorized three-project retrospective findings maintenance
trigger_when: Stories in a shared seed are prepared or closed concurrently
scope: unknown
---

# SEED-043: Keep readiness tied to relevant story changes

## Why This Matters

Developers preparing parallel work should be able to start an unchanged ready
story after an unrelated sibling is edited or closed. Whole-seed invalidation
adds reassessment and publication work without identifying a changed premise.
This serves low coordination cost and empirical simplification under
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).

## Stories

<a id="preserve-sibling-readiness"></a>

### Preserve readiness when an unrelated sibling story changes

**Identity:** SEED-043#preserve-sibling-readiness
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** An execution coordinator can claim a ready story without repeating
preparation solely because another section of its seed changed.

**Outcome / scope:** Bind readiness to the selected story, its applicable shared
context and its plan. An unrelated sibling edit or closure preserves readiness;
a changed story, relevant shared premise or plan still requires reassessment.
Preserve existing authority and conservative handling of ambiguous relevance.
Choose the representation during refinement; a whole-seed hash replacement is
not predetermined by this story.

**Evaluation:** Prepare two stories in one seed; close or edit one and start the
unchanged other without a new readiness commit. Then change the selected story,
its plan and relevant shared context in turn: startup must request reassessment.
Existing recorded preparations remain interpretable or get an actionable
reassessment request without fabricated readiness. Cover the common reader and
startup contract; native evidence or justified reuse follows
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).

**Supporting finding:** [ODF-116](../../docs/maintainer/finding-names.md#odf-116).
The two executions and their provenance remain in the finding record and sources.

**Completion:** Update ODF-116 with the actual response, commit, first containing
release and effectiveness limits. Queueing is not resolution.

**Depends on:** None. Satisfied dependency conditions (ODF-120), missing correction
preparation (ODF-122), and plan-during-execution authority (ODF-123) remain separate.

**Safe stopping point:** Parallel preparation avoids unrelated invalidation while
retaining the existing reassessment gate for relevant changes.
