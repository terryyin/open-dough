---
id: SEED-332
status: active
planted: 2026-11-13
planted_during: SEED-324#pass-landed-ci-repeat-checks-under-high-load execution, whose dashboard checks spent most of their time under CPU-bound contention in the fake gh's Node process per call
trigger_when: Terry accepted this story at SEED-324's execution handoff on 2026-11-13
scope: story
---

# SEED-332 — Dashboard checks answer GitHub reads without a process per call

## Why this matters

Every dashboard check reads GitHub through a fake `gh` that starts a Node
process for each call. Under CPU-bound contention that cost dominates: in
SEED-324's measurements with foreground CPU burners at load 31–48, the project
scope timing refresh case spent most of its 28 s waiting for the Done
comparison read's 21 calls, and both refresh cases reached the 30 s bound on
trunk and on that story's branch alike. SEED-324 kept the per-call cost out of
scope and Terry chose to take it up here.

Loaded failures seen on trunk and on SEED-324's branch alike, at load 30–70,
are this story's first evidence: `start-origin-isolation.spec.ts:140`
(DD-479), `intent-summary-story-comparison-sort.spec.ts:72`,
`intent-story-changes-landed-run.spec.ts:75`,
`intent-done-default-answer-selection.spec.ts:42`, and five scope-history
specs (`intent-scope-collected-file-timing-gaps`,
`intent-scope-collected-file-timing-history`,
`intent-scope-collected-timing-history`, `intent-scope-prior-build-states`,
`intent-scope-prior-build-average`).

<a id="answer-fake-gh-reads-in-process"></a>

### Answer fake GitHub reads without a process per call

**Identity:** SEED-332#answer-fake-gh-reads-in-process
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Not refined: the per-call cost by phase, the answers that depend on a process boundary, and hosted CI's shards are unmeasured"],"basis":{"document":"78cbed940a8a18f00ae509da3ea150316b11c4efd9c1baee35d43702d7f60aa6"}}
```

#### Goal

Maintainers get passing dashboard checks while other work keeps the machine's
CPUs busy, because a check's GitHub reads cost no new process each: the cases
named above and SEED-324's landed CI repeat checks pass with the default 30 s
case timeout under CPU-bound contention at a one-minute load of 30–50.

#### Scope

- The fake `gh` the dashboard checks use, and how a dashboard server under
  test reaches it.
- No product behavior changes; the product's own `gh` boundary stays as it is.
- To refine: what a call costs today by phase, which answers depend on a
  process boundary, and how hosted CI's shards are affected.
