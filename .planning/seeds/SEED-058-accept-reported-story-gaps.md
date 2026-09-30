---
id: SEED-058
status: active
planted: 2026-09-30
planted_during: Authorized three-project retrospective-findings runbook
trigger_when: A slice reports a story contradiction or changes its fixture to avoid the real example
scope: unknown
---

# SEED-058: Accept slices without losing the story promise

## Why This Matters

Developers can receive a completed story whose own hand-back reports that it loses something the story promised to preserve. Four distinct executions support this problem: a reproduced stash-loss path, a published newline loss, a dropped searched parameter, and a fixture changed to avoid the real EPUB shape. The fixture case was caught before acceptance; no actual stash data loss was reported. The response should prevent the contradiction from becoming accepted delivery or a filed learning.

## Story Decomposition

<a id="accept-reported-story-gaps"></a>

### Check reported gaps against the story before accepting a slice

**Identity:** SEED-058#accept-reported-story-gaps
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** The developer and executing agent rely on the accepted story outcome to decide whether work can proceed or close.
- **Intended outcome:** The executing agent checks a reported gap and any fixture change used to make the proof pass against the selected story's goal and examples before accepting the slice. A contradiction returns for correction or reaches the owner as a real scope decision; it cannot become completion merely by being written under Learnings.
- **Bounded scope:** Change the smallest part of proof acceptance and its necessary handoff that closes this decision gap. Evaluate the reported omission, preservation loss and fixture-shape substitution using the existing story and returned evidence. Preserve valid out-of-scope observations and healthy acceptance; add no blanket full-suite, approval, report-resend or per-slice accounting requirement. The separately completed native assessor correction remains separate.
- **Evaluation:** Replay the retained Search parameter-drop and newline-loss hand-backs against their preservation goals, plus the EPUB fixture substitution against the real separate-spine-cover example. Each must return the required behavior or surface a human-owned scope conflict. A harmless gap outside the goal must still permit acceptance, and sufficient unchanged proof must need no new run. Include the reproduced restore-applied-none consequence when checking that accepted limitations cannot authorize loss of the only saved work. Judge any host claims with the project's existing native-acceptance rules.
- **Supporting findings:** [ODF-138](../../docs/maintainer/finding-names.md#odf-138), [ODF-139](../../docs/maintainer/finding-names.md#odf-139), [ODF-185](../../docs/maintainer/finding-names.md#odf-185), [ODF-196](../../docs/maintainer/finding-names.md#odf-196). Occurrence evidence stays in the catalog and its linked source records.
- **Completion criterion:** Record the actual response, implementation commit, first containing release (or release pending), and proof limits on every supporting finding in `docs/maintainer/finding-names.md`. Delivery and queueing alone do not mark the finding resolved; a watch starts only from verified relevant use.
- **Depends on:** None established; the two selected responses address separate acceptance and planning decisions and can deliver independently.
- **Safe stopping point:** This response preserves current authorization, story ownership and proof boundaries if other process work is cancelled.
- **Effort hypothesis:** Unknown until selected-story refinement; no executable plan is created by this run.

## When to Surface

Selected by the owner-authorized runbook on 2026-09-30; queued for later refinement.

## Breadcrumbs

- [Retrospective findings runbook](../../docs/maintainer/retrospective-findings-runbook.md).
- [Product backlog](../PRODUCT-BACKLOG.md).
