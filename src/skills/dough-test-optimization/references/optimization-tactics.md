# Design a cheaper test family

Apply these tactics to the complete related group identified by the skill.
Apply the [shared behavioral test guidance](../../dough-post-change-refactor/references/refactor-checks.md#tests-as-behavioral-documentation)
for test boundaries, assertions, builders, and proof-preserving consolidation.
Use the main skill's design comparison to choose and reassess these tactics.

## Reduce repeated proof and work

Use the group's surviving-proof map to find repeated work. A line-coverage
percentage or similar test name does not establish equivalent protection.
Before moving variations to a cheaper boundary, inspect error propagation,
serialization, persistence, rendering, and ordering obligations to establish
which integrated checks must remain.

Parameterization reduces duplication; it does not inherently reduce executions
or runtime. Remove equivalent cases when their fault-detection purpose is
already covered. Use representative equivalence classes and meaningful edges
rather than exhaustively repeating the same path with arbitrary values. Retain
distinct regressions unless replacement proof can detect the same fault. Use a
focused negative control or mutation check when equivalence is uncertain; do
not impose a new whole-project coverage tool.

## Remove avoidable setup cost

- Apply the shared fixture rules to expensive preparation. Cache immutable
  preparation or reuse safely resettable resources when isolation is proved.
- Reuse compatible application contexts, render harnesses, and process setup;
  investigate accidental configuration differences that multiply startup cost.
  Keep actual platform or integration differences that the tests promise to prove.
- Establish preconditions through direct APIs or testability seams when setup
  is incidental. Keep the real user action, route, transport, or process launch
  when that is the behavior under test.
- Apply the shared external-dependency rule to unnecessary live calls. Retain
  real protocol checks where protocol behavior is the subject.

## Make synchronization observable

Remove fixed sleeps and arbitrary polling delays. Await an observable result,
completion event, framework flush, or bounded condition with a clear failure.
Use a controlled clock for time-dependent behavior when it preserves the
contract; do not replace a timing guarantee with instant mocked success.

For UI or terminal tests, await the visible state needed by the next interaction.
An HTTP response or cleared busy flag alone need not prove rendered success.
Use fast, stable selectors consistent with project policy. Profile expensive
queries before replacing them; retain role, accessibility, or real-input proof
when that is their purpose. Batch long input only when per-character behavior
is irrelevant to the scenario.

## Challenge the design, then measure

Look for a simpler existing seam that eliminates repeated work across the
family. Improve fixture and harness design rather than add special-case flags,
branching mega-helpers, or another test framework. Follow production refactoring
authority when a production seam must change.

Assess test and support code together: shorter test files that hide more
orchestration elsewhere are not automatically cleaner. Use parallelism only
after removing needless work, with isolation and resource contention understood.
Do not accept a runner-only saving as completion of an identified proof/design
simplification. If no material improvement survives verification, explain the
attempts and remaining cost as a candidate instead of manufacturing success.
