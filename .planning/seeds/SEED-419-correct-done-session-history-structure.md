---
id: SEED-419
status: active
planted: 2026-11-20
planted_during: Execution retrospective of SEED-414#review-done-sessions-on-open-story-cards
trigger_when: accepted for execution with its correction plan
scope: one story
---

# SEED-419 — Correct the Done session history structure

<a id="keep-done-session-placement-in-one-rule"></a>

### Keep Done session placement in one rule and its proof cohesive

**Identity:** SEED-419#keep-done-session-placement-in-one-rule

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/735-keep-done-session-placement-in-one-rule/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"946e476726498f3c8f411df2fedf1f7993739f521b244aa5e5b7210b716004f8","plan":"7aafb35982d38e1f40ce8ae686183e04dd248877a575a829f546c61541a49719"}}
```

**Goal:** Dashboard maintainers can change where the Board shows a Done
session by editing one placement rule and its own tests, without coordinated
edits across Recently done, story cards and dozens of E2E journeys. This
corrects the structure the delivered SEED-414 Done history left behind.

**Scope:** Restructure the Board's Done-session placement, the story-card Done
disclosure's inputs and the tests that prove them, preserving every delivered
Done history, Recently done and scan-emphasis behavior. The correction plan
holds findings, provenance and proof:
[plan](../slice-plans/735-keep-done-session-placement-in-one-rule/PLAN.md).
