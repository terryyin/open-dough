---
id: SEED-447
status: active
planted: 2026-11-27
planted_during: Code review of SEED-439#complete-story-linked-ad-hoc-sessions (dashboard and E2E), requested by Terry
trigger_when: selected from the product backlog
scope: one story
---

# SEED-447 — Clean up after story-linked ad hoc sessions

<a id="clean-up-story-linked-session-tests"></a>

### Remove leftover unbound recovery and overlapping story-linked session tests

**Identity:** SEED-447#clean-up-story-linked-session-tests
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/878-clean-up-story-linked-session-tests/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"fc0133e04cf6f59705a5ad5c65486a933596022dfb7527801183c524917c6631","plan":"008cad4b005c6a66520188ffe58c1245738f55650551b2e6a9a2d824c27a5310"}}
```

**Goal.** Maintainers changing Dashboard launch, landing, follow-up or
session placement code keep each story-linked session behavior proven once,
at the cheapest level that observes it. They find one test-support owner for
each recurring arrangement, and no production code remains for unbound
Claude sessions, which can no longer occur.

**Scope.** Bounded retrospective correction of
[Complete story-linked ad hoc sessions in the Dashboard](https://github.com/terryyin/open-dough/blob/12753fa100a6d932363237d41a95c470371584bc/.planning/done/SEED-439_complete-story-linked-ad-hoc-sessions.json)
(reviewed range `2b69bc19f..12753fa10`). In scope:
- retire the unbound Claude recovery chain and its tests, and reword stale
  "standalone" comments;
- move landing-refusal and follow-up decision matrices into typed unit tables,
  keeping one wiring case per integration spec;
- collapse per-host repeats of the same E2E journeys and merge the specs
  covering the same retained ad hoc story;
- give session placement, the installed Board, the reporting input and
  "on a published story" setup one test-support owner each.

No product behavior changes, and the correction makes no new product promise.
The [plan](../slice-plans/878-clean-up-story-linked-session-tests/PLAN.md)
holds the findings, preserved behaviors and slices.
