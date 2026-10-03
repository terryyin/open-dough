---
id: SEED-091
status: active
planted: 2026-10-03
planted_during: Terry's request for two dashboard UX/UI renovation stories
trigger_when: A developer wants a polished dashboard frame and compact story information radiators
scope: unestimated
---

# SEED-091: Renovate the dashboard frame and story cards

## Why This Matters

A developer monitoring and directing story work needs a dashboard that looks
modern, feels coherent, and makes important information and actions easy to find.
Terry requested two stories, queued first and second respectively: renovate the
dashboard frame, then improve the story tag/card as an information radiator.

## Stories

<a id="side-panel-review-reopen-and-close-alignment"></a>

### Align the side panel's same-review opening, report close shortcut, and proof

**Identity:** SEED-091#side-panel-review-reopen-and-close-alignment
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/242-side-panel-alignment-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f02a4403795e914685b69a9ed2c5a66c2bbd7ef777987af02736e470b0f31583","plan":"58302c3fbd250ab3667fc6a406641488e44aaccb90309a7264c514579620556b"}}
```

**Slice plan:** [Side panel alignment correction](../slice-plans/242-side-panel-alignment-correction/PLAN.md).

**Goal:** A developer using the shared side panel gets feedback when activating
Review changes for the review already shown, and maintainers read one accurate
account of the panel's review opening and Close shortcut, with proof that pays
for its cost. This bounded correction follows the retrospective of the shared side panel
(`3775c64d:.planning/seeds/SEED-091-dashboard-ui-renovation.md`).

**Scope:** focus the review already shown when its Review changes control is
activated again, keeping its fixed snapshot until Refresh; align the
maintained review contract and the page-frame comment with that behavior;
state in the UX/UI North Star that the side panel is multi-purpose and holds
one item at a time, leaving review details to the review contract;
give the final report's Command+Shift+Escape one shared owner with the review
and terminal; remove the tautological header-look test and trim repeated
malformed-width rounds. No new feature promise, report chrome redesign, or
change to snapshot, width, or session semantics.

<a id="card-renovation-alignment"></a>

### Align product guidance, shared styles, and tests with the renovated cards

**Identity:** SEED-091#card-renovation-alignment
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/241-card-renovation-alignment/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"246d5bc0bd3a557e1e4209ed893fac1e772b26696020e1d6c61e17bb184f7761","plan":"18185219a054758c9917db5704729e3b45f0ba970ed39e63377ce6bba1f02d46"}}
```

**Slice plan:** [Card renovation alignment](../slice-plans/241-card-renovation-alignment/PLAN.md).

**Goal:** A maintainer reading the dashboard's guidance, or changing the
renovated story cards later, finds documentation that says where each card
fact is actually shown, roster and session identity lines laid out as before
the card renovation, and card tests that open detail explicitly and prove each
focus walk once. This bounded retrospective correction of
[the story-card renovation](https://github.com/terryyin/open-dough/blob/bf0d9ad52cfbe4c0a01fac4907361016f1f8d7d5/.planning/seeds/SEED-091-dashboard-ui-renovation.md#story-card-information-radiator) adds no product
promise.

**Scope:**

- Correct the dashboard guidance and code comment that misplace the
  dependency explanation, assignment metadata, and human-developer and field
  gaps relative to the card's scan view and inspected detail.
- Restore the shared story-identity spacing outside the card while keeping the
  inspected detail as delivered.
- Move story-detail opening out of the whole-snapshot check into explicit
  steps, and remove duplicated focus-return walks from the action-group tests.
- Excludes the remaining launch-answer waits under load, which belong to their
  own recorded finding, and any change to card behavior or presentation.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- Terry's 2026-10-03 request: capture the frame renovation as the first queued
  item and the story tag improvement as the second; work directly on main and
  sync with origin. These are captured stories awaiting refinement and planning.
- Terry's 2026-10-03 request: capture moving the story review from its dialog
  into the terminal's right side panel, exclusive with the terminal and
  resizable by dragging for both, as the fourth backlog priority; work directly
  on main and sync with origin.
