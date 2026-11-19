---
id: SEED-301
status: active
planted: 2026-11-11
planted_during: Terry requested a reminder to cap first-layer test cases at ten lines
trigger_when: After SEED-413 renovates dashboard unit tests around directly testable production seams and Terry is ready to refine the case-length rule
scope: one story
---

# SEED-301 — First-layer test case length

<a id="limit-first-layer-test-cases-to-ten-lines"></a>

### Limit first-layer test cases to ten lines

**Identity:** SEED-301#limit-first-layer-test-cases-to-ten-lines
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Deferred until after SEED-413 unit-test renovation; refinement must define Lizard counting via Nix/Python and achieve <=10-line cases through clean production seams rather than test-support wrappers."],"basis":{"document":"308a46de16fe90f101ed5d36a744b71905de9c0418ed5efdf40c36006f97fe78"}}
```

#### Goal

Keep test intent easy for Open Dough developers to read by limiting each
first-layer test case body to 10 lines of code — achieved by making production
handlers and UI components directly testable with thin
[MakeMe](../../Distribution/tests/README.md#test-data-architecture) defaults
under the [Architectural North Star](../NORTH-STAR.md) and installed
[test boundary rule](../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary),
never by hiding test orchestration or assertions inside `test-support/`
wrappers. (`SEED-301#publish-intent-projects-through-makeme` was folded into
[`SEED-413#renovate-dashboard-frontend-unit-tests`](SEED-413-renovate-dashboard-unit-tests.md#renovate-dashboard-frontend-unit-tests)
on 2026-11-19 so Intent MakeMe inputs target narrow Intent components rather
than `putFrontend*` whole-app substitutes.)

#### Refinement reminder for Terry

Sequence after `SEED-413` so clean production entry points already exist before
enforcing a numeric cap. Agree how Lizard will count lines of code in
individual test case bodies and verify that a 10-line case passes and an
11-line case is flagged. Set up the tooling in dependency order: Nix for the
development environment, Python through Nix, then Lizard.
