# Make Recently done setup traceable and Claude timeout proof reliable

**Identity:** SEED-341#make-recently-done-setup-and-claude-timeout-proof-reliable

**Source:** [Correction story](../../seeds/SEED-341-simplify-session-tests.md#make-recently-done-setup-and-claude-timeout-proof-reliable) and the maintainer's 2026-11-27 retrospective note reporting setup outside Playwright steps and a four-second readiness failure during a full local run. The exact run log and worker settings were not supplied. The relevant cases trace to `500777a55` and `25be1d9a8` respectively. This work also relates to [Simplify the remaining session tests](../../seeds/SEED-341-simplify-session-tests.md#simplify-remaining-session-tests).

## Scope and proof

Keep every existing assertion and fixture scenario in both specs. Use the
[existing E2E page objects and MakeMe selection](../../../AGENTS.md) and apply
the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
The [North Star's runner boundary](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
keeps the integrated journey in Playwright and the typed launch boundary in
Node Vitest. Its [test support guidance](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
favors the existing fixture and controls. Keep browser actions on existing
page objects in line with [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows).

At `5581c1392`, runner listing selected the one Chromium journey and the Node
launch boundary spec containing the SIGTERM case. The reported load failure
supplies the four-second symptom. Source inspection locates the narrower race
in the fixture: it writes the PID before registering termination handlers.
Capture the readiness observation and suite result during slice 2.

## Ordered slices

### 1. Show Recently done setup in the Playwright report

Type: Structure
Status: planned

In the [retained ad hoc selection journey](../../../e2e/sessions/recently-done-sessions-select-ad-hoc.spec.ts#L50),
group publication of the retained sessions and their Done story in a named
`test.step`. Use a second named step to open Recently done in Intent. Return
the fixture values needed by the current scenario steps and keep the later
report, request, history, and Development observations.

Proof: run `npm run test:e2e -- e2e/sessions/recently-done-sessions-select-ad-hoc.spec.ts`
and inspect the Playwright report for both setup phases and the existing
passing journey.

### 2. Trigger the timeout after fake Claude is ready for SIGTERM

Type: Behavior
Status: planned

Change the existing [hang fixture](../../../dashboard/test-support/fixtures/fake-claude#L186)
to write the held PID once its termination handlers are installed. Reuse the
same PID control used by the [mounted-server timeout case](../../../dashboard/backend-tests/runtime/mounted-boundary-server.spec.ts#L171)
and the launch spec's existing end-file control. In the
[launch boundary case](../../../dashboard/backend-tests/launches/agent-launch-boundary.spec.ts#L201),
wait for and return that PID in one readiness operation. Observe the process
alive before writing the end file. Use the existing runner budget and keep any
essential timeout override inside the individual test, supported by measured
full-run evidence.

The launch boundary spec starts at 252 lines. Reorganize its timeout case
around a single readiness operation and the controlled timeout outcome.
Remove the duplicate PID read and streamline that case's setup and settlement
while retaining its assertions. Keep the resulting spec within the
[250-line check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).
Its native refusal and confirmation cases stay in the same spec.

Proof: run `npm run test:dashboard:backend -- agent-launch-boundary.spec.ts mounted-boundary-server.spec.ts`.
Observe the ready process, the uncertain `timed-out` result, process exit via
`SIGTERM`, and the empty launch records in the boundary case. Verify that the
mounted-server consumer still ends its pending launch wait. Run the full local
backend group using the reported worker settings if recoverable. The full run
is required because the readiness failure was observed under suite load.

Local gate: the focused runs above and `caffeinate -s -i npm run test:dashboard:backend`
from a fully awake Mac on AC power per [AGENTS.md](../../../AGENTS.md).

## Plan review

The report change and readiness change have separate proof and can run in
order in one correction. The plan keeps the existing runner and fixture
boundaries. Slice refinement was unnecessary. The exact load profile from the
reported run is unverified and the repair remains to be proved in execution.
