---
id: SEED-366
status: active
planted: 2026-11-15
planted_during: Terry made the eight-slice plan limit a hard rule that splits an execution at its last delivered slice
trigger_when: selected from the product backlog
scope: story
---

# SEED-366 — Continue split stories automatically

<a id="continue-a-ready-split-story-automatically"></a>

### Continue a ready split story automatically after wrap-up

**Identity:** SEED-366#continue-a-ready-split-story-automatically

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Scope and beneficiary.** A developer whose execution was split at the
  [eight-slice limit](../../Distribution/src/skills/dough-story-decomposition/references/problem-decomposition.md#limit-slices-per-plan)
  gets the remaining story executed without starting it by hand when nothing
  in it needs a human decision. The dashboard, or a higher-level coordinator it
  runs, owns the continuation.
- **Evaluation.** When the original story's wrap-up completes and the story its
  split placed first in the backlog is refined, planned, assessed `ready` and
  start-eligible, its execution starts once with the original launch's host,
  model, effort and mode. When that story awaits refinement, has not-ready
  reasons or an unsatisfied dependency, or the original wrap-up stopped or
  failed, nothing starts and the dashboard shows why. A developer can turn
  automatic continuation off.
- **Priority.** Directly after the slice clock. It counters the risk that the
  limit makes agents merge slices to stay under it: once the remainder starts
  on its own, going over costs almost nothing. With the limit at eight, about 18 of 240 Claude Code executions in the
  30 days to 2026-11-15 would have split, each needing a manual start after
  wrap-up.
- **Effort and boundary.** Medium. The splitting execution keeps the judgment
  whether the remainder is already refined and records it through
  [split at a delivered slice boundary](../../Distribution/src/skills/dough-resplit-story/SKILL.md#split-at-a-delivered-slice-boundary);
  the continuation only reads that record and the derived start eligibility.
  It refines or plans nothing itself, and a chain of splits continues one
  story at a time.
