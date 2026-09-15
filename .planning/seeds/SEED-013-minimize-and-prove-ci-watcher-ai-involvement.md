---
id: SEED-013
status: active
planted: 2026-09-15
planted_during: Review of Quick 035 CI-watcher experience
trigger_when: Before relying on the CI watcher for another execution
scope: bounded
---

# SEED-013: Minimize and prove AI involvement in CI watching

## Why This Matters

A developer using Open Dough should receive actionable CI feedback during an
execution without the executing AI spending attention on routine monitoring.
Quick 035 showed that polling itself is script-driven, but the AI still handled
substantial setup and teardown detail: it verified configuration, launched a
large host wrapper, retained several observer identifiers, registered the pushed
revision, stopped the observer, and reaped the host cell. That execution ended
before the first post-push polling interval, so it did not prove that a real CI
failure reaches the active execution through the mailbox.

The desired effect is one trustworthy workflow in which scripts own routine
observation and lifecycle bookkeeping, the AI performs only irreducible actions,
and a deliberately failing build visibly wakes the active execution with the
right revision and actionable failure evidence. The watcher remains quiet for
non-actionable state and stops when execution finishes.

## Alternatives and Decision

Keeping the current workflow and relying on unit tests is the strongest simpler
alternative. It avoids more product work, but it neither establishes native
mailbox delivery nor shows that the current AI-facing ceremony is irreducible.
Manually inspecting CI after a run would prove the build result while bypassing
the product behavior being evaluated.

Select one story that first examines the actual AI-owned watcher interactions
and removes or hides only avoidable ones, then runs a controlled red-to-green CI
journey through the ordinary execution boundary. Keep investigation and native
proof together because simplifying the lifecycle can change the notification
path that must be accepted.

## Story Decomposition

<a id="minimize-and-prove-ci-watcher-involvement"></a>

### 1. Minimize and prove AI involvement in CI watching

- **For / why:** A developer running an Open Dough execution can rely on CI
  feedback without the executing AI babysitting the watcher or carrying
  unnecessary observer machinery in its working context.
- **Evaluation:** Review one representative execution to distinguish
  irreducible AI decisions from script-owned mechanics and simplify the
  interaction where evidence supports it. Then deliberately push a controlled
  failing build and observe the active execution receive exactly one mailbox
  notification naming the checked revision and useful bounded failure evidence.
  Repair the failure through the normal execution flow, confirm the matching
  green build remains quiet, and confirm the watcher stops at execution
  completion without manual polling or an orphaned observer. If the current
  interface is already minimal, retain it and record the evidence rather than
  manufacturing a change.
- **Value / learning:** Establish whether the watcher actually closes the native
  CI feedback loop, while reducing AI involvement only where the real journey
  shows avoidable ceremony.
- **Effort hypothesis:** Band pending project S/M/L definitions. Confidence is
  low because native notification timing and the smallest safe lifecycle
  interface have not yet been exercised together.
- **Depends on:** A CI workflow that can be failed and repaired in a controlled,
  recoverable execution without leaving the integration target red.
- **Safe stopping point:** The project ends green, the observer is confirmed
  stopped, and the evidence states separately whether mailbox delivery worked
  and whether any AI-facing simplification was justified. A passing build,
  direct GitHub inspection, or mailbox-file inspection alone does not establish
  notification delivery to the active execution.

## Ordering and Scope Reduction

This is intentionally one story. The AI-interaction review comes first, followed
by the controlled failure journey, because any lifecycle simplification must be
included in the path being accepted. Do not split out speculative automation or
declare success from controlled unit proof alone. If scope must shrink, retain
the real failure notification journey and defer only improvements shown to be
optional by that journey.

## Open Decisions

No product decision blocks refinement. Planning must choose a safe controlled
failure mechanism and define which AI actions are irreducible without weakening
revision coverage, failure repair, or observer shutdown.

## When to Surface

Surface before the next execution is used as evidence that CI mailbox delivery
works or before adding more watcher lifecycle machinery.

## Breadcrumbs

- Quick 035 execution and wrap-up commits: `152a627`, `b4b4363`, and `1db5038`.
- Quick 035 execution review observed `pendingCi: unobserved`, zero delivered
  events, and the pushed revision as unchecked when the observer stopped.
- Existing watcher guidance:
  [`dough-execute-plan`](../../src/skills/dough-execute-plan/SKILL.md).
- Human direction on 2026-09-15: group minimum AI involvement and native mailbox
  notification proof into one top-priority story; examine improvement space,
  then deliberately fail a build to observe watcher behavior.
