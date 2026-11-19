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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/712-plot-new-models-with-estimated-token-index/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c9b56d8d771ecc794e81bbb2e8c2bcf1cfe5a85d32973c06a9e56a9cc920d129","plan":"8f89faea0488ec6cfd1ab5a6922f04a4eee46b58ed1cf113a4ecd9a936be15b0"}}
```

#### Goal

A developer reviewing Codex or Claude Code usage in System settings → Usage
can still see a finished task when a new model appears. The chart gives the
developer an estimate. The warning tells the developer
which model needs a rate-card update so they can correct the calculation.
When GPT-6.2 appeared, the Codex rate card left 19 recent finished tasks
unpriced even though their token counts were already stored.

#### Scope

For a finished task with usable token counts, estimate usage from a model
missing from its tool’s [Token Index rate card](../../dashboard/USAGE-TOKEN-INDEX.md)
using the nearest unambiguous numeric version in the same named model family
on that card. Use the tool’s Token Index reference model when the family
or version gives no clear match. Keep the actual model
visible and identify points that include an estimate.

Show a warning in Usage that names the tool, the new model, and the model used
for the estimate. The warning explains that the Token Index rate card needs an
update. Make it visible on opening Usage without selecting a task. Once an explicit rate is available, use it for that model’s stored
counts and clear its warning. Keep the reference units and the point values
for previously priced usage stable.

Apply the estimate to each unlisted, named model's own recorded usage,
including a worker's usage. Keep the task's primary observed model for the
Model filter. A developer reading the chart can identify an estimated point
without hovering and can inspect the task to see which actual model used
which substitute rate. The warning in the selected tool's Usage summary
identifies each affected model in the displayed tasks once, even if it
appears in several tasks.

An estimated rate and missing usage describe different facts. A task may
show both. The estimate supplies only a missing model rate. The existing
rules for an absent model identity, unsupported speed, and Claude cache
writes with an unknown duration still apply. Any estimated contribution keeps
the task outside the tool’s 10-task rolling median. With complete counts and
explicit rates for every contribution it is eligible on the next read.

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
- Using the counters from the GPT-6.2 regression (1,000 uncached input,
  9,000 cache-read and 100 output), the November 15 Codex card gives no
  point for GPT-6.2 Astra. Applying GPT-6 Astra's rates gives 12,000.
  With the November 19 card, those same counters give 7,800 for GPT-6.2
  Astra. The denominator in both calculations is GPT-6.1 Sol's input rate.
- A rated root has a worker on a new model. Opening the task under the root's
  observed model shows the worker's actual model and the substitute that
  contributed to the total. The task keeps any independently recorded gaps.
- With nine eligible Codex tasks and a tenth using an estimated rate, Usage
  shows ten points and the warning. The rolling median first appears when
  the tenth task gets an explicit rate and all ten have complete counts.

#### Architecture

The server already reads stored model identities and token counts against
the selected tool's versioned tariff. Derive the actual-model/substitute
pair there with the point, so the chart, task detail and warning describe
the same calculation. Reading the updated card can then retire the estimate
without rewriting usage history. This follows the direct domain mapping in
[ADR 0002, Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
