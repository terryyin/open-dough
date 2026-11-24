---
id: SEED-433
status: active
planted: 2026-11-24
planted_during: Execution of SEED-432#finish-story-linked-ad-hoc-sessions (slice 3 overrun)
trigger_when: selected from the product backlog before SEED-432 resumes default-choice admission
scope: one story
---

# SEED-433 — Run Dashboard launch tests on an installed project

<a id="run-dashboard-launch-tests-on-an-installed-project"></a>

### Run Dashboard launch tests on an installed project

**Identity:** SEED-433#run-dashboard-launch-tests-on-an-installed-project

**Goal:** A maintainer changing the Dashboard launch path gets backend and E2E
results from the same installed project and bare origin that production
launches use. Then [admitting every ad hoc start](SEED-432-finish-story-linked-ad-hoc-sessions.md#finish-story-linked-ad-hoc-sessions)
changes only the expectations that depend on its story.

**Developer decision.** Extract this work from SEED-432 as its own test-only
story that lands on trunk before SEED-432 resumes at default-choice admission.
The developer made the extraction after SEED-432's slice 3 overran.

**Scope.**

- The catalog project checkout the test harness creates (in
  `dashboard/test-support/support/fakeClaude.ts`) is an installed Open Dough
  project. Its bare `origin` has a matching `main`. Reuse the run-wide
  prepared start origin in `startOriginPreparation.ts`, not a per-test
  install, and check readiness once in shared support.
- Seed through MakeMe the stories each consumer launches, including
  `launchJourney`'s Taken story, into that origin.
- Update the expectations that installation changes on the current route:
  - instructions gain the Dashboard reporting context;
  - story launches run the real installed start;
  - a missing installation's refusal changes.
- Keep each consumer's distinct observation. Production behavior does not
  change.

**Key examples.**

- `agent-launch-ad-hoc-boundary` launches on the installed project and observes
  the instruction with its reporting context.
- `agent-launch-environment` and `agent-launch-done-refusal` launch stories
  queued on the origin and keep their environment and refusal observations.
- The ad hoc problems, Codex and Cursor E2E pass unchanged on the installed
  project.

**Evidence.** SEED-432's fourth slice 3 attempt wired installation into the
harness. Ad hoc E2E and the backend duplicate family passed. The full backend
run failed 11 specs, and the consumer trace reached 364 spec files. The
attempt is parked privately as `slice-3/attempt-4.patch` in SEED-432's
execution evidence, and
[plan 813](../slice-plans/813-finish-story-linked-ad-hoc-sessions/PLAN.md) on
its story branch records the finding.
