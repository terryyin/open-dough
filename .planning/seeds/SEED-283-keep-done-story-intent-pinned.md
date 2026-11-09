---
id: SEED-283
status: active
planted: 2026-11-09
scope: story
---

# Keep Done story Intent pinned to the landed result

<a id="keep-done-story-intent-pinned"></a>

### Keep Done story Intent pinned to the landed result

**Identity:** SEED-283#keep-done-story-intent-pinned

**Goal.** A developer reviewing a Done story can see what the story changed
and the evidence for that change, even after the project has moved on. Today a
new commit on trunk can show a revision notice inside the Done story. Clicking
**Show latest** on **CI comparison** can dismiss the notice without changing
anything else the developer can see.

**Scope.** Use the story's recorded comparison and evidence across **CI
comparison**, **Changed tests**, and **Intent coverage**. Build the Done
story's test view from its baseline and landed result, including the test
locations at landing. Explain when historical evidence is unavailable. Keep
the project revision notice and refresh action in **Project Intent**, beside
the test browser they update. Show the browser's current revision there and
update the label after a successful refresh.

**Key examples.**

- A developer returns to a Done story after trunk renames or deletes a test
  that the story changed. **Changed tests** still shows the original story
  diff. All three story tabs stay free of the project revision notice.
- A Done story has a missing historical comparison or saved assessment. The
  affected tab explains what evidence is unavailable.
- In **Project Intent**, a new trunk commit only updates a planning record.
  The developer updates the test browser. Its revision label advances even
  though the displayed test files look the same.

**Related work.** [Unify the Intent view and CI proof](SEED-282-unify-intent-view-and-ci-proof.md#unify-intent-view-and-ci-proof)
shares the presentation and leaves revision and freshness behavior to this
story. The historical story and current project remain separate evidence
contexts under [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
