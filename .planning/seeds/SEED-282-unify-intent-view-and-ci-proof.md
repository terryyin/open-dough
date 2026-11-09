---
id: SEED-282
status: active
planted: 2026-11-09
scope: story
---

# Unify the Intent view and CI proof

<a id="unify-intent-view-and-ci-proof"></a>

### Unify the Intent view and CI proof

**Identity:** SEED-282#unify-intent-view-and-ci-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** Developers can use the same Intent layout with or without a selected
story and read CI comparisons the same way as they drill into test evidence.

**Scope.** Use one Intent page implementation and layout for Project Intent and
the selected story's views. Model them as the same Intent perspective, with a
selected story supplying context for the evidence and views that apply. Use
the delivered story view as the reference for the persistent header, tab row,
and content arrangement. When the selection is empty, show **No story selected**
in the header and offer the project's own views and evidence. Follow
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
and [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).

Share the story-level CI comparison model and presentation with the location
and folder **Summary** views and the individual file **Proof** view in
**Changed tests**. Use the same active
comparison label, Baseline / Branch / Landed timing columns, signed changes
from Baseline, relative timing marks, and **Show %** control wherever the
evidence supports them. Sort timing rows by the values shown and use the same
rules and explanations for timing gaps and unavailable endpoints at every
scope. [Intent CI timing comparison](../../docs/dashboard-development-intent-ci-comparison.md)

**Key examples.**

- Clearing the selected story changes the header to **No story selected** and
  brings up Project Intent, with trunk CI and its applicable tabs in the same
  arrangement. Selecting a story again shows its title and story views in that
  layout. Visiting Project Intent while a story is still selected keeps the
  way back to that story and its reading place.
- When **CI comparison** shows **Baseline compared with Landed**, opening a
  location or folder Summary and then a file's Proof in **Changed tests** shows
  the same comparison label and timing presentation for the evidence at each
  scope. The signed changes, marks, and **Show %** work the same way at each level.
- When the active comparison uses Branch, or a file has no comparable timing,
  the drill-down uses the same endpoint rules and gap wording as the story's
  CI comparison.
