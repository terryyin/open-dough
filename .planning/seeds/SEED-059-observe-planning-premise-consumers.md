---
id: SEED-059
status: active
planted: 2026-09-30
planted_during: Authorized three-project retrospective-findings runbook
trigger_when: A planning premise stops before its consumer or a proposed bug remedy has not reproduced the symptom
scope: unknown
---

# SEED-059: Settle decisive planning premises on their actual journey

## Why This Matters

The generic decisive-premise response shipped in 0.3.43, yet actual 0.3.46–0.3.47 executions still rely on a named seam or grep result that does not reach the consuming operation. The cost includes non-converged attempts, replaced proof and scope decisions during delivery. At least six distinct representative executions support the selected journey problem across the three projects; overlaps between supporting findings count once, and unknown releases cannot establish a failed numbered-release fix.

## Story Decomposition

<a id="observe-premise-consumers"></a>

### Observe a planning premise through the operation that consumes it

**Identity:** SEED-059#observe-premise-consumers
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** The developer and executing agent rely on the accepted story outcome to decide whether work can proceed or close.
- **Intended outcome:** The planner establishes that the selected premise's evidence reaches the consuming operation on the actual fixture and input path, or places that unresolved question before dependent implementation as a bounded probe. Mere presence of a helper, assertion or hook cannot clear the premise.
- **Bounded scope:** Reconsider why the existing 2c5ff71 rule still yielded shallow observations, then make the smallest change that distinguishes presence evidence from decisive journey evidence. Bound the response to consuming-step/fixture premises and reproducing a claimed remedy before dependent implementation. Preserve cheap read-only inspections when they actually settle a factual premise and preserve paid/owner-held probe boundaries. Add no audit of all facts, automatic execution permission or general process engine. The moved-seeding caller clarifications aa650875/9d4bf02f/c97c3fe0 are already delivered and must be reused rather than duplicated.
- **Evaluation:** Use the retained EPUB landing/current-block probe, the Chapter Alpha auto-marking fixture, the Search repair_genome transformation and the Take/reconciliation hook race as representative cases. A plan must either observe the operation that consumes the result on the actual path or put its uncertainty in an early bounded probe with dependent work stopped. Include the already-passing UAT remedy spec as a control: it must leave the original symptom unexplained rather than call the defect fixed. Compare a sound current-code premise as a control against extra investigation cost; claims of host improvement require existing native-acceptance evidence.
- **Supporting findings:** [ODF-074](../../docs/maintainer/finding-names.md#odf-074), [ODF-110](../../docs/maintainer/finding-names.md#odf-110), [ODF-182](../../docs/maintainer/finding-names.md#odf-182), [ODF-198](../../docs/maintainer/finding-names.md#odf-198). Occurrence evidence stays in the catalog and its linked source records.
- **Completion criterion:** Record the actual response, implementation commit, first containing release (or release pending), and proof limits on every supporting finding in `docs/maintainer/finding-names.md`. Delivery and queueing alone do not mark the finding resolved; a watch starts only from verified relevant use.
- **Depends on:** None established; the two selected responses address separate acceptance and planning decisions and can deliver independently.
- **Safe stopping point:** This response preserves current authorization, story ownership and proof boundaries if other process work is cancelled.
- **Effort hypothesis:** Unknown until selected-story refinement; no executable plan is created by this run.

## When to Surface

Selected by the owner-authorized runbook on 2026-09-30; queued for later refinement.

## Breadcrumbs

- [Retrospective findings runbook](../../docs/maintainer/retrospective-findings-runbook.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
