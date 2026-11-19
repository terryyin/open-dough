---
id: SEED-406
status: active
planted: 2026-11-19
planted_during: Terry requested a follow-up to the GPT-6.2 Token Index fix
trigger_when: selected from the product backlog
scope: one story
---

# SEED-406 — Plot new models with an estimated Token Index

<a id="plot-new-models-with-estimated-token-index"></a>

### Plot new models with an estimated Token Index

**Identity:** SEED-406#plot-new-models-with-estimated-token-index
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer reviewing Codex or Claude Code usage in System settings → Usage
can still see a finished task when a new model appears. The chart gives the
developer an estimate and tells them which model needs a rate-card update.
When GPT-6.2 appeared, the Codex rate card left 19 recent finished tasks
unpriced even though their token counts were already stored.

#### Scope

For a finished task with usable token counts, estimate usage from a model
missing from its tool’s [Token Index rate card](../../dashboard/USAGE-TOKEN-INDEX.md)
using the closest rated model for that tool. Use the tool’s Token Index
reference model when no closer match is available. Keep the actual model
visible and identify points that include an estimate.

Show a warning in Usage that names the tool, the new model, and the model used
for the estimate. The warning explains that the Token Index rate card needs an
update. Once an explicit rate is available, use it for that model’s stored
counts and clear its warning. Keep the reference units and the point values
for previously priced usage stable.

#### Key examples

- A finished Codex task uses a new model with a close match on the Codex rate
  card. Its estimated point appears under the actual model, and the warning
  identifies the model used to estimate it.
- A finished Claude Code task uses a new model with no closer match on the
  Claude Code rate card. Its point uses the Claude Code reference model as an
  estimate, and the warning identifies the new model and the fallback.
- A finished task has usage from a rated model and an unfamiliar model. The
  rated usage keeps its own rates. The point includes both amounts and shows
  that part of the total is estimated.
- After a rate-card update adds the new model, its point uses the explicit
  rate and its warning clears. The same previously priced tasks still have
  the same Token Index values.
