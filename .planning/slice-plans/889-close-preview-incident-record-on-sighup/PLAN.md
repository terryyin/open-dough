# Close the preview's incident record when the watcher ends on SIGHUP

**Identity:** SEED-370#close-preview-incident-record-on-sighup
**Source:** [Close the preview's incident record when the watcher ends on SIGHUP](../../seeds/SEED-370-remove-old-dashboard-deployments.md#close-preview-incident-record-on-sighup)

## Goal and scope

When SIGHUP stops a watcher that is serving a published commit, the preview
finishes its own incident record before the watcher exits. Diagnostics can then
report an ended preview. Preserve deployment checkout retirement, development
and Cursor runner/client continuity, clean replacement, and genuine loss
reporting. Deployment retention, repair of earlier records, and changes to the
diagnostics format are outside this story.

## Current decisions

- [PFE](../../../.agents/skills/dough-pfe/SKILL.md) found the existing clean
  close in `productionPreviewLifecycle.mjs`, `productionPreview.mjs`, and
  `incidentLifecycle.ts`. Replacement drains accepted starts and then calls
  `preview.stop()`. The watcher's `finally` already awaits that same stop,
  but its abort signal also reaches `ownedProcess` and sends SIGKILL before
  `finally` can close the preview. Give the preview owner one shutdown path
  after activation, with cancellation still able to retire a preview that
  has yet to start serving. Keep the existing bounded escalation and the
  replacement drain. Check cancellation at the ownership transition so a
  late start cannot escape cleanup. Keep forced cancellation for staged
  commands and Git. If the shared process helper changes, preserve the
  existing behavior for its other callers and run their affected proof.
- The preview's incident lifecycle continues to write and flush its own end
  entry. The diagnostics reader derives `ended` or `lost` from that same
  machine-local record. This follows [ADR 0008, Project dashboard domain and
  architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  and [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#2-whole-product-focus).
- The North Star topics [Make production code directly testable instead of
  growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  apply. Use the existing serial watcher E2E journey, its isolated published
  fixture, `previewServer` and `processRecord`. This check needs the real
  watcher, npm, Vite and incident writer. Keep the current fixture and page
  objects and run the MakeMe and Page Objects selector before editing the
  spec. The existing separate-process diagnostics check can exercise the
  reader at its own boundary.

## Decisive premises

| Consuming operation | Observation in the preparation checkout on 2026-11-27 at `809ab519a1cf` | Result |
| --- | --- | --- |
| The real watcher stops the served preview, and the E2E observation can distinguish an unclosed record. | `caffeinate -s -i npm run test:e2e -- runtime/production-watcher.spec.ts --workers=1 --retries=0`. A scratch assertion captured the incident writer inside the served process group before SIGHUP and read that PID's lifecycle entries after the watcher exited. | The replacement case observed `process-started`, `process-ended`. The SIGHUP case reached its new assertion after the existing cleanup and continuity checks passed. It failed with `["process-started"]`, missing `process-ended`. The serial restart was skipped on this run. The scratch edit was reverted. |
| The maintained watcher route also covers restart and SIGINT after the SIGHUP phase. | `caffeinate -s -i npm run test:e2e -- runtime/production-watcher.spec.ts --workers=1 --retries=0 --reporter=list` with the spec restored. | All six existing tests passed in 58.9 s, including replacement, SIGHUP cleanup and restart/SIGINT. |
| The watcher compatibility runs use the real deployment E2E project. | `caffeinate -s -i npm run test:e2e -- 'runtime/production-watcher(-updates|-failures)?[.]spec[.]ts$' --workers=1 --retries=0 --list --reporter=list` | Selected 25 cases in three files under `chromium-deployments`, including cancellation during real build and unexpected SIGKILL. The updates and failures suites are execution checks. |
| Diagnostics consume the incident lifecycle entries. | `caffeinate -s -i npm run test:dashboard:backend -- authenticated-read-incident-record-lifecycle.spec.ts --grep 'a clean close ends the record' --workers=1 --retries=0 --reporter=list` | The one selected case passed in 4.6 s. It observed the flushed end entry and the successor's `ended` and `lost` states. |

## Outside-in proof

Slice 1 owns all observations below. Record the candidate proof separately
from the preparation observations. Run the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
against the actual diff and include the changed signal/cleanup effects and the
incident output in its search terms.

| Promise | Observation at the product boundary |
| --- | --- |
| SIGHUP closes the same preview's incident record. | In `production-watcher.spec.ts`, capture the served preview's incident writer PID before SIGHUP using `previewServer`. Add a dedicated observation to the serial shutdown journey. After watcher exit, `processRecord` for that captured PID contains `process-started` then `process-ended`. Reuse the journey's running preview and its shutdown, with no extra deploy. Keep the spec within the project file-size limit. |
| Production and its checkouts retire while development, the runner and its client keep running. | Run `production-watcher.spec.ts` through the SIGHUP test's checkout, PID and HTTP observations and the successor's reuse of the same runner/client on restart. Keep the existing quiet-shutdown and SIGINT checks. |
| Replacement stays clean and cancellation still works during a build or preview failure. | The watcher spec observes the retired preview's start/end pair after replacement. `production-watcher-updates.spec.ts` observes that SIGTERM ends a real in-flight build, the served preview and the deployment checkouts. `production-watcher-failures.spec.ts` observes failed start and restoration, and a real SIGKILL that the watcher reports as unexpected loss before cleaning up. |
| Diagnostics still distinguish a clean end from a forced loss. | `authenticated-read-incident-record-lifecycle.spec.ts`, "a clean close ends the record after its queued failure, and a successor reads a killed process as lost", checks a real close and a real forced death. The successor reads `ended` for the first and `lost` with no `endedAt` for the second. |

### Local gate

Run long macOS checks from a fully awake machine on AC power under
`caffeinate -s -i`, per [AGENTS.md](../../../AGENTS.md#failing-and-flaky-tests).
Check load before running the real deployment chain. Run the watcher family
with one worker and zero retries. Include the targeted diagnostics case because
it consumes the same lifecycle entries and covers forced loss independently.
The execution [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
applies. The repository's pre-commit hook checks staged lint and runs the
dashboard typecheck for staged scripts.

```sh
caffeinate -s -i npm run test:e2e -- 'runtime/production-watcher(-updates|-failures)?[.]spec[.]ts$' --workers=1 --retries=0
caffeinate -s -i npm run test:dashboard:backend -- authenticated-read-incident-record-lifecycle.spec.ts --grep 'a clean close ends the record' --workers=1 --retries=0
```

## Ordered slices

### 1. Close the served preview's incident record on watcher SIGHUP
Type: Behavior
Status: done
Estimate: 10–15 active minutes, excluding test commands.

Behavior: Given the watcher has activated a production preview, SIGHUP stops
it through the preview's own close, flushes the end entry before watcher exit,
and retires the deployment checkouts while development, the runner and its
client continue. Replacement and unexpected loss keep their existing meaning.

Proof: Retain the discriminating incident-record observation in the watcher
journey and run the local gate above. Review affected callers, then refactor
and publish under the execution workflow.

## Candidate proof

Slice 1, on 2026-11-27 from `111d8d6f9` plus the uncommitted slice, load
average 7–12, under the local gate's `caffeinate -s -i` commands:

- Watcher family: 25 of 25 passed with one worker and zero retries,
  including the new SIGHUP incident-record observation.
- Diagnostics case "a clean close ends the record…": 1 of 1 passed.
- Discrimination: without only the preview's `ownShutdown()` handover,
  `production-watcher.spec.ts` failed the SIGHUP test with `process-ended`
  missing from the captured preview's record.
- Consumer trace (`ownShutdown`, `startDeploymentPreview`,
  `startProductionPreview`, `terminate(`, `process-ended`): the watcher is the
  only preview owner. `command()`, `gitRunner.ts`, `dashboardBuild.ts` and the
  timeout proof fixture never hand over shutdown, so cancellation still
  force-stops them. A preview cancelled before it serves is still killed, and
  `ownShutdown()` throws if cancellation came first.

## Preparation review

Slice-plan refinement was unnecessary. The change and its preservation checks
share one production shutdown path and fit one Behavior slice without new
test infrastructure. No unresolved slice boundary or proof-route concern.

## Execution complete

Product advice: no change. The fix restores accurate shutdown diagnostics
inside the watcher's existing lifecycle. The queued sibling, "Remove old
dashboard deployments automatically", keeps its place.
