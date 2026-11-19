---
id: SEED-300
status: active
planted: 2026-11-11
planted_during: Terry requested a suite-wide audit after the dashboard page-object campaign
trigger_when: Surviving E2E launch or settings workflows repeat browser mechanics after dashboard frontend unit-test renovation
scope: two stories (E2E launch and settings workflows; six earlier/dropped stories closed)
---

# SEED-300 — Dashboard E2E test intent through page objects

## Parent goal and narrowed scope

A developer reading surviving representative workflows in `e2e/` can follow
what the user does, what changes, and what the workflow proves, with one
maintained page-object owner for shared E2E controls when a control changes.

Following the [Architectural North Star](../NORTH-STAR.md), the installed
[test boundary rule](../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary),
and the [unit-test renovation campaign](SEED-413-renovate-dashboard-unit-tests.md),
this seed is **deferred until after Frontend Renovation** and narrowed strictly
to surviving **`e2e/`** workflows:

- Single-service `dashboard/frontend-tests/` specs move to narrow owning
  component mounts under `SEED-413#renovate-remaining-dashboard-frontend-unit-tests` and
  do **not** receive whole-app page-object hand-offs.
- `SEED-300#express-browser-measurement-test-intent` was dropped on 2026-11-19
  (auditing and retiring `frontend-tests/test-harness/` belongs to
  `SEED-413#renovate-remaining-dashboard-frontend-unit-tests` rather than building shared
  setup to test test-harness code).
- Keep page objects thin; weigh every helper against the
  [Architectural North Star](../NORTH-STAR.md) and
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md) so test
  support shrinks rather than grows. Historical 2026-11-11 audit detail remains
  recoverable at
  `986aad0f1:.planning/seeds/SEED-300-dashboard-test-page-objects.md`.

Preserve distinct behavioral assertions, MakeMe domain setup, held-read and
focus causality, and independent exact-name accessibility assertions where the
label itself is the contract.

<a id="express-launch-test-intent-through-page-objects"></a>

### Express launch dialog and startup test intent through page objects

**Identity:** SEED-300#express-launch-test-intent-through-page-objects
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/586-launch-test-intent/PLAN.md","assessment":"not-ready","reasons":["Deferred until after SEED-413 frontend unit-test renovation; refine and realign provisional plan 586 strictly to surviving e2e/launches/ workflows."],"basis":{"document":"5fc516ae73e7bf070c517fa7e929ed7fe1996ae5b22119b9ba8f0d802d2869d8","plan":"fd87d0a54910c8dcfdac07e5c8981b768a5905eea327eb9a0bdf485f1a9bd0b2"}}
```

#### Goal

A developer reading a surviving `e2e/launches/` workflow can follow the chosen
workflow, host, inputs, and startup or recovery outcome without repeated
dialog-opening boilerplate, while `dashboard/frontend-tests/launches/` mounts
narrow components directly without whole-app page objects.

#### Scope

After `SEED-413` renovates `launches/` unit tests, refine and realign
[provisional plan 586](../slice-plans/586-launch-test-intent/PLAN.md) strictly
to the surviving `e2e/launches/` journeys (such as
[base CI](../../e2e/launches/agent-launch-base-ci.spec.ts),
[unread base CI](../../e2e/launches/agent-launch-base-ci-unread.spec.ts),
[model controls](../../e2e/launches/agent-launch-model.spec.ts),
[exclusive options](../../e2e/launches/agent-launch-options-exclusive.spec.ts),
[existing changes](../../e2e/launches/agent-launch-start-session-existing-changes.spec.ts),
[Cursor attachments](../../e2e/launches/agent-launch-ad-hoc-attachments-cursor.spec.ts),
[preparation retry](../../e2e/launches/agent-launch-preparation-codex-retry.spec.ts),
and [recovery verification](../../e2e/launches/responsive-session-recovery-verification.spec.ts)).
Keep refusal/disclosure steps, host progress gates, and exact wording in the
cases; add only helpers whose edit-site savings clearly outweigh their
`test-support` footprint.

<a id="express-settings-test-intent-through-page-objects"></a>

### Express settings test intent through page objects

**Identity:** SEED-300#express-settings-test-intent-through-page-objects
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"planned","plan":"../slice-plans/587-settings-test-intent/PLAN.md","assessment":"not-ready","reasons":["Deferred until after SEED-413 frontend unit-test renovation; refine and realign provisional plan 587 strictly to surviving e2e/configuration/ workflows."],"basis":{"document":"137be937cfa66cf0d2aa70e60fa1fcf62f57b77ffc2cd55c91c2eb4d7e0514c3","plan":"4c7ff515eb8a5c2bc40c2147240ed2a67852f445e4f6b9233de28881f2e339f5"}}
```

#### Goal

A developer reading a surviving `e2e/configuration/` workflow can follow
project management, terminal theme, and feedback-maintenance actions without
duplicating E2E settings navigation mechanics, while single-service settings UI
cases mount narrow components directly.

#### Scope

After `SEED-413` renovates `configuration/` unit tests, refine and realign
[provisional plan 587](../slice-plans/587-settings-test-intent/PLAN.md) strictly
to the surviving `e2e/configuration/` workflows (such as
[project removal](../../e2e/configuration/project-remove.spec.ts),
[hide with sessions](../../e2e/configuration/project-hide-sessions.spec.ts),
[project add](../../e2e/configuration/project-add.spec.ts),
[terminal theme](../../e2e/configuration/system-settings-terminal-theme.spec.ts),
and [feedback maintenance](../../e2e/configuration/system-settings-feedback-maintenance.spec.ts)).
Keep URLs, paths, chosen project, focus destination, and filesystem evidence
explicit in each scenario; add no helper whose cost exceeds the E2E duplication
it removes.
