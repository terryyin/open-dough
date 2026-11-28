# Make Recently done setup traceable and Claude timeout proof reliable

**Identity:** SEED-341#make-recently-done-setup-and-claude-timeout-proof-reliable

**Source:** [Correction story](../../seeds/SEED-341-simplify-session-tests.md#make-recently-done-setup-and-claude-timeout-proof-reliable) and the maintainer's 2026-11-27 retrospective note about setup outside Playwright steps and a four-second readiness failure in a full local backend run. The original log and worker settings are unavailable. The affected cases trace to `500777a55` and `25be1d9a8`.

## Scope and examples

- When a maintainer opens the retained ad hoc selection journey's Playwright
  report, fixture publication and navigation to Recently done in Intent appear
  as named setup phases. The journey still proves the open report, scoped Done
  body reads, saved Intent coverage, historical comparison, exclusion of the
  unbound entry, and the card revealed beyond the Development window.
- When Claude is slow to enter the synthetic hang, the test waits within the
  runner's test budget for a live PID whose termination handlers are installed.
  Ending the wait then produces an uncertain `timed-out` result, stops that PID
  via `SIGTERM`, and leaves the launch records empty.

The correction is test-only. Production launch policy and the broader
[session-test simplification](../../seeds/SEED-341-simplify-session-tests.md#simplify-remaining-session-tests)
are outside its scope.

## Proof boundaries and decisions

The [North Star's runner boundary](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
keeps the integrated journey in Playwright and the typed launch boundary in
Node Vitest. Follow [Act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
by reusing the existing browser actions and observable waits.
[Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
favors the existing typed launch owner, synthetic Claude fixture, PID control,
and launch-wait end file. Keep test data in the existing MakeMe builders and
browser actions with the existing page objects under [AGENTS.md](../../../AGENTS.md).
Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

The PID and exit-signal controls have one live reader, the launch boundary
case. The mounted-server runtime spec now checks mounting and worker ownership.
The current browser consumer of the hang and explicit end-file control is the
[story-card startup recovery journey](../../../e2e/launches/agent-launch-story-card-problems.spec.ts).
Other hang and launched-hang journeys observe recorded launch calls or session
listings, both emitted before the PID and signal-handler sequence.

## Preparation observations

On 2026-11-28 in this preparation checkout at `3210fc680`, Node 24.21.0 on
macOS, the following commands ran under `caffeinate -s -i` on AC power. The
controlled variants were temporary and restored after the observations.

| Premise | Consuming operation and result |
| --- | --- |
| The retained selection journey's report omits setup phases | `npm run test:e2e -- e2e/sessions/recently-done-sessions-select-ad-hoc.spec.ts --reporter=json`. One Chromium journey passed and reported six named scenario steps, beginning with opening a report. Wrapping the two setup phases in scratch `test.step` calls made both labels appear before the same passing scenario steps. |
| A delayed PID can fail the proof before the termination path | `npm run test:dashboard:backend -- agent-launch-boundary.spec.ts --grep 'ends the waiting Claude process with SIGTERM'` selected the one Node Vitest case. The ordinary case passed in a 10-test focused baseline. Inserting a 4,250 ms delay before PID publication failed the four-second assertion with an undefined PID. With PID publication after handler registration and polling tied to the test abort signal, the same delayed case passed all assertions in 4,683 ms under the default 5,000 ms test timeout. This reconstructs the reported symptom with a controlled delay. The original full-run conditions remain unknown. |
| The published PID can precede signal handling | The same Node selector failed at the SIGTERM assertion when a 450 ms pause separated PID publication and handler registration. The process had exited and the signal file was absent. With the same pause and PID publication after handler registration, the case passed all assertions. |
| The shared fake still supports the browser's explicit launch-wait trigger | `npm run --silent test:e2e -- e2e/sessions/recently-done-sessions-select-ad-hoc.spec.ts e2e/launches/agent-launch-story-card-problems.spec.ts --reporter=json` passed both Chromium journeys with PID publication after handler registration. The startup journey exercised ending the launch wait, showing uncertainty, and restarting only after explicit recovery. The selection journey showed both named setup steps. |

## Ordered slices

### 1. Show Recently done setup in the Playwright report

Type: Structure
Status: planned

In the [retained ad hoc selection journey](../../../e2e/sessions/recently-done-sessions-select-ad-hoc.spec.ts#L50),
use two named Given steps to publish the retained sessions and their Done
story and open Recently done in Intent. Give fixture publication a file-local
function that returns the values used by the scenario. Keep the new callbacks
within the shared [Playwright step limits](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#write-observable-cases)
and keep the scenario steps' assertions.

Proof: run `npm run --silent test:e2e -- e2e/sessions/recently-done-sessions-select-ad-hoc.spec.ts --reporter=json`.
Inspect the passing journey's two named setup phases and six scenario steps.

### 2. Trigger the timeout after fake Claude is ready for SIGTERM

Type: Behavior
Status: planned

Publish the held PID from the existing [fake Claude hang fixture](../../../dashboard/test-support/fixtures/fake-claude#L186)
after installing its termination handlers. In the
[launch boundary case](../../../dashboard/backend-tests/launches/agent-launch-boundary.spec.ts#L201),
read the ready PID once successfully, polling with the test context's abort
signal under the default Vitest budget. Assert that the PID is live before
writing the existing launch-wait end file. Keep settlement and process-exit
observations together. Use an individual test timeout override only if
measured full-run evidence shows it is essential.

The launch boundary spec is 252 lines. Replace the duplicated readiness read
and streamline the timeout setup and settlement in this case to meet the
[250-line check](../../../.agents/skills/dough-post-change-refactor/references/refactor-checks.md#file-size).
Preserve the refusal and confirmation cases and their proof in the same spec.

Proof: run `npm run test:dashboard:backend -- agent-launch-boundary.spec.ts`
and `npm run test:e2e -- e2e/launches/agent-launch-story-card-problems.spec.ts`.
Observe the live PID, uncertain outcome, stopped process, SIGTERM marker, and
empty launch records in Node, and uncertainty followed by explicit recovery in
Chromium. Run the full local backend group to exercise the fix under suite
load. Use the reported worker settings if recovered, otherwise record the
runner's normal local settings and the resulting proof.

Local gate: run the focused checks above and
`caffeinate -s -i npm run test:dashboard:backend` from a fully awake Mac on AC
power per [AGENTS.md](../../../AGENTS.md).

## Plan review

Slice-plan refinement was unnecessary. Each of the two slices has focused
proof and uses the existing runner and fixture boundaries. No blocking
slice-specific concern remains after the preparation observations.
