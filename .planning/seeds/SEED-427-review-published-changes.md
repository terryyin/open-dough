---
id: SEED-427
status: active
planted: 2026-11-24
planted_during: Developer decision to review published changes
trigger_when: selected from the product backlog
scope: one story
---

# SEED-427 — Review published changes

<a id="review-published-changes"></a>

### Review published changes

**Identity:** SEED-427#review-published-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer can use Review changes and Intent to read published
story and session comparisons through one simpler review model. Published
changes include commits on origin's story branches before they land on trunk.

**Scope.** Remove code review of uncommitted changes and unpushed commits
completely. Trace both through the UI, API, comparison model, and capture and
retention paths. Delete code, tests, fixtures, builders, page-object operations,
and other infrastructure dedicated to those reviews. Simplify shared types,
branches, endpoints, and test support wherever their complexity served only
those paths. Preserve session execution, worktree ownership, local work, and
the established publication and landing workflows.

Remove descriptions, examples, and obsolete references from the tracked
documentation and planning records. Describe and test the supported published
review behavior directly. Delete the retired tests outright, including their
setup, rather than replacing them with assertions about missing behavior.
Keep recovery in Git history. Reconcile queued stories that depend on the
retired review paths when refining this work.

**Proof.** Show published story and session comparisons through their normal
entry points, including a published story branch and a landed result. Compare
affected source and test-support size and executable case counts before and
after. The retained review implementation and proof should be materially
smaller and simpler. Follow the [shared failure policy](../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
