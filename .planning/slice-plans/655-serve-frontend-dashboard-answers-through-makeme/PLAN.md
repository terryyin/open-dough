# Serve frontend dashboard answers through MakeMe

**Identity:** SEED-301#serve-frontend-dashboard-answers-through-makeme
**Source:** [Serve frontend dashboard answers through MakeMe](../../seeds/SEED-301-limit-first-layer-test-cases-to-ten-lines.md#serve-frontend-dashboard-answers-through-makeme)

## Goal and scope

Dashboard Frontend Tests state the machine's answer and the host status
through `makeMe.aMachineAnswer` steps and the `frontendServices` fixture they
already hold, so a spec imports no `putFrontendMachine`,
`putFrontendObservedLaunches`, `observedDone`, `observedOpen`,
`putFrontendHostStatus` or `putFrontendThreeProjects`.

Exclusions: published project answers (Intent sources and story, published
backlog and stories, candidates, done records) belong to
[Publish Intent projects through MakeMe](../../seeds/SEED-301-limit-first-layer-test-cases-to-ten-lines.md#publish-intent-projects-through-makeme).
`machineOffering` stays a harness helper: it shapes an offer with the
production `offeredShape`, which a builder may not import at runtime.

## Settled premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| Observed launches keep the order a case states them | slice 1's `observingDone`/`observingUnavailable`/`observingOpen` steps | `Distribution/tests/support/machineAnswerTestData.mjs` at `f3de595a4`: `observing` pushes onto one list in call order | holds; each new step delegates to `observing`, so interleaved calls keep the case's order |
| The machine answer builder may build observed launches | slice 1 | the same module and `launchObservationTestData.mjs` import nothing from `dashboard/` at runtime | holds; the new steps import `ObservedLaunchBuilder` and `SessionStateBuilder` directly |
| Specs reach the services only through the fixture value | slices 1–2 | `dashboard/tests/support/frontendApp.ts` installs substitutes reading `frontendServices` fields at answer time | holds; methods on the same object assign those fields, as `putFrontend…` did |

## Design

- `MachineAnswerBuilder` gains `observingDone(...records)` (session retained
  for review), `observingUnavailable(...records)` (session unavailable) and
  `observingOpen(...records)` (loaded, working), replacing `observedDone` and
  `observedOpen`.
- The `frontendServices` fixture value gains `answerMachine(answer |
  undefined)`, `answerHostStatus(status | undefined)` and
  `listProjects(...sources)`, as `comparisonServices.serve(story)` serves a
  compared story. They replace `putFrontendMachine`,
  `putFrontendObservedLaunches`, `putFrontendHostStatus` and
  `putFrontendThreeProjects`; support modules that wrap them call the methods.

## Outside-in proof and local gates

- Each slice's changed frontend specs, and the specs importing a changed
  support module, from `dashboard/`:
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config frontend.playwright.config.ts --reporter=dot <specs>`.
- `npx tsc --build dashboard/tsconfig.json`; eslint and prettier on changed
  files.
- Slice 2 runs the whole frontend suite once, because `frontendApp.ts` and
  `frontendServiceState.ts` reach every frontend spec:
  `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=dot`
  on AC power from a fully awake machine
  ([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)).
- Failures and flakes follow the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

| Key example | Owner |
| --- | --- |
| The Recently done sidebar case arranges its five launches with one `answerMachine` call and imports none of the observed helpers | 1 |
| A launch case answering attempts imports no `putFrontendMachine` | 2 |
| `answerMachine(undefined)` keeps the machine unread | 1 |
| Every changed spec keeps its scenario facts and expectations and passes | 1, 2 |

## Ordered slices

### 1. Observed launches as machine answer steps

Status: done
Type: Structure

Add the three observing steps and the fixture's `answerMachine`,
`answerHostStatus` and `listProjects`. Convert the Recently done and sessions
sidebar specs and their support modules (`frontendRecentlyDone*.ts`,
`frontendDone*.ts`, `frontendRecentlyDoneStoryCards.ts`,
`sessions-sidebar-host-status.spec.ts`), and remove
`putFrontendObservedLaunches`, `observedDone`, `observedOpen`,
`putFrontendHostStatus` and `putFrontendThreeProjects`.

Proof: the converted specs and every spec importing a changed support module
pass.

Accepted: 72 frontend specs reaching the changed modules, 150 passed. Where a
launch's observed kind depends on its own data, support modules add each
record to one `makeMe.aMachineAnswer` in a loop. `putFrontendThreeProjects`
became the fixture step `listThreeProjects()` in place of a projects list.

### 2. Machine answers through the fixture

Status: done
Type: Structure

Convert the remaining `putFrontendMachine` callers (launch, terminal,
startup, settings and session specs and their support modules) to
`frontendServices.answerMachine`, and remove `putFrontendMachine`.

Proof: the converted specs pass, then the whole frontend suite once.

Accepted: 72 specs reaching the changed modules, 159 passed; the whole
frontend suite, 455 passed at load about 4. Hand-built observed launches that
matched a step now use it; Done launches with a missing workspace stay built
by hand.

## Current decisions

- Story Branch Mode, in this session's established workspace.
- Fixture methods, not a builder for the whole service state: the default
  state's published Open Dough project comes from `dashboard/tests` modules a
  builder may not import, and the machine and host answers already have
  builders.

## Readiness and sizing

Refinement not needed: each slice changes one arrangement concern across its
consumers and owns its proof. No slice-specific concern remains. Slice 1
touches about 15 files and slice 2 about 40 mechanical call sites.
