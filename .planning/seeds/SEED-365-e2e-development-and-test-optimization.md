---
id: SEED-365
status: active
planted: 2026-11-15
planted_during: Developer discussion of test findings and follow-through in recent execution retrospectives
trigger_when: selected from the product backlog
scope: story
---

# SEED-365 — Prefer E2E tests to drive development and optimize the retained suite before completion

<a id="drive-development-with-e2e-and-optimize-the-suite"></a>

### Prefer E2E tests to drive development and optimize the retained suite before completion

**Identity:** SEED-365#drive-development-with-e2e-and-optimize-the-suite
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

Developers using planned Open Dough execution get early feedback from a real
product workflow and finish the story with focused, economical tests that
still protect its behavior.

#### Scope

In slice planning and execution, prefer a representative failing E2E test to
drive a new or changed user workflow when its real service interactions matter.
Extend an existing journey when it fits. Use judgment about when a unit test
gives sufficient development feedback for behavior one service can prove.
Plan with the expectation that some detail checked through E2E during
development can move to unit tests once the workflow works.

For applicable plans, include a final Structure slice after the Behavior
slices, inside Execute Plan and before the Execution Retrospective. Apply the installed
[shared test boundary rule](../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#choose-the-test-boundary)
and the [Architectural North Star](../NORTH-STAR.md) across the test families
affected by the story, including older overlapping cases. Enter replacement
unit tests in Vitest. Use Node for strongly typed backend handlers and
browser mode for the smallest owning rendered UI components. Reshape the
[production seam](../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md#design-production-code-for-testability) when a unit test suite needs unrelated data
or services to construct the handler or render the component. Add zero wrappers to `test-support` (only
MakeMe data builders and `e2e/` page objects are allowed; any other touch only
removes from `test-support`). Prove the replacement unit coverage before
narrowing or removing an E2E case. Retain
representative E2E proof of real service interactions and remove a redundant
case when a surviving test catches the same regression. Record the surviving
proof and changes to E2E and total runnable case counts.
The final slice can finish with an evidenced decision to keep the suite as it is.

Extend the Structure slice rule to admit this outcome and use the ordinary
slice proof and delivery gates. The Execution Retrospective reviews the
aggregate result and can propose further improvements through the existing
Story Wrap Up follow-up process.

#### Key examples

- A workflow needs real frontend and backend behavior. An E2E example drives
  implementation. The final slice keeps that representative workflow and
  moves detailed outcomes, such as rejection variants owned by one service,
  to proven unit coverage at the typed backend handler or narrow owning UI
  component.
- A newly added test and an older case catch the same regression. The final
  slice preserves the stronger observation, removes the redundant case, and
  records the lower runnable case count.
- The [Project Intent revision family](SEED-413-renovate-dashboard-unit-tests.md#project-intent-revision-family-example)
  shows another outcome. The mounted case kept the unique notice Retry and
  dropped a file Retry already proved elsewhere. The composed E2E still
  exercises Show latest. All nine cases remained, and the measured focused
  command got faster after it no longer needed the built app.
- The affected cases each prove a distinct behavior at the appropriate layer.
  The final slice records that evidence, and the aggregate retrospective can
  still propose broader improvements for later work.
