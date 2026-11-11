---
id: SEED-318
status: active
planted: 2026-11-12
planted_during: Execution retrospective of the Intent test-reading story
trigger_when: Maintainers remove the unused Taken comparison journey
scope: bounded retrospective correction
---

# SEED-318 — Remove unused Taken comparison navigation

<a id="remove-unused-taken-comparison-navigation"></a>

### Remove unused Taken comparison navigation

**Identity:** SEED-318#remove-unused-taken-comparison-navigation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/596-remove-unused-taken-comparison-navigation/PLAN.md","assessment":"not-ready","reasons":["Candidate removal passed dashboard typecheck and restored exact source bytes, but its complete Summary sort journey timed out at the first A→B→A return. Chaifeng-chan already owns that exact timeout repair in active SEED-287 plan576 G7/G18; receive the completed published repair and observe candidate preservation before ready."],"basis":{"document":"1441b13e24e704e9bb9b246704bbd45d5b7d0130441df9e2e68fae250281b67f","plan":"8edbbb0d4e3f0ae3aae539af5776e7d0a923a49eca90235b0771ae88ab41ad45"}}
```

#### Goal

A maintainer reads only supported navigation in the shared Summary-comparison
test helper, without a dormant Taken journey and its private dependencies.

#### Scope

Remove the unreferenced selectTakenStoryForSummaryComparison export and imports
used only by it. Preserve every used Done, Changed-tests, Summary and drill-down
operation, the existing real Taken-story owner, all scenarios, independent
expected facts and fixture tiers. Add no replacement abstraction or new product
behavior.

**Plan:** [Bounded correction](../slice-plans/596-remove-unused-taken-comparison-navigation/PLAN.md)

#### Evaluation

The old export has no maintained caller; after its removal, dashboard typecheck
and the existing complete Summary sort/drill/story-selection journey pass.
No new test mirrors the unused function.

#### Provenance

Retrospective of [the Intent test-reading execution](https://github.com/terryyin/open-dough/blob/a48ca574df6df318f6d0708a109813c736aa2d45/.planning/seeds/SEED-300-dashboard-test-page-objects.md#express-dashboard-test-intent-through-page-objects).
The helper was already unused at8ad6544, was touched by the canonical read
continuation in90b5845, and remains unused at reviewed codea48ca574. This is
older structural residue, not a reported product regression. The dedicated
seed avoids reorganizing the still-shared, oversized original seed.
