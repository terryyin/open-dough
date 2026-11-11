# Speed up production watcher lifecycle checks

**Identity:** SEED-311#speed-up-production-watcher-lifecycle-checks
**Source:** [Story](../../seeds/SEED-311-production-watcher-lifecycle-checks.md#speed-up-production-watcher-lifecycle-checks)

**Source review:** [Independent source review](source-review.md)

## Goal and scope

Keep ordinary proof for selected commits, activation and replacement,
rollback, fatal exit, cleanup, and shared launch and development state. Reduce
local one-worker elapsed time by at least 25 seconds. Measure all retained
and replacement cases, including startup, fixture preparation and teardown.
Use minimal inputs, real boundaries and event-driven synchronization. Leave
standalone deployment distribution and other test families in their existing
stories.

[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
makes published Git authoritative for shared state and machine-local files
authoritative for configuration and launch records. Preserve both.
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires a measured worthwhile improvement and surviving proof.

## Outside-in proof and existing owners

| Promise | Required observation |
| --- | --- |
| Published selection | Existing real-Git cases prove unchanged, exclusion, rejection and retry baselines. A real CLI deployment stages the selected commit even when main advances. |
| Recovery | Real Git, npm and a one-page Vite artifact exercise build failure, restore and retry, double failure, preview exit, and cleanup. A deliberate wrong-restoration fault fails replacement proof before the old assertions leave. |
| Ownership | Real occupied socket, signals, process exit, files, and HTTP distinguish process and checkout ownership, same URL, continued development, and restart. |
| Full dashboard | Representative full dashboard stays available beside dirty development, serves pinned source, replaces at the same URL and preserves shared records, configuration and accepted starts. Preserve native runner and client lifetime and published reads with equivalent ordinary CI proof. |
| Fast feedback | Whole wall time with setup and teardown and the complete coverage map. New synchronization waits for events and uses no fixed polling delay. |

Reuse publishedMainFixture, productionUpdates, stageDeployment,
startDeploymentPreview, and the existing process output / filesystem
observation patterns. The archived extraction identified a preview lifecycle
owner that can be used by the real CLI and cheaper tests. Use the existing
LaunchAdmission and LaunchAttemptOwner boundaries for their distinct business
rules. Prove their CLI composition before retiring the native fixtures.

## Verification

Local gate on fully awake AC macOS uses
[`caffeinate -s -i`](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Apply the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests).
Compare the base and candidate using strict ordinary Playwright, one worker,
identical test intent and all preparation paid. Record the base SHA, exact
commands, counts, wall time, host load, and any non-comparable observation.
Typecheck and lint affected paths. Use ordinary CI on the candidate and
integrated trunk.

The baseline selector is
`npm run --silent test:dashboard -- --workers=1 'production-watcher(-failures|-updates|-refusals)?\.spec\.ts|production-update-selection\.spec\.ts'`.
The candidate includes any new lifecycle spec explicitly. Confirm identity and
outcomes with the proof record. Require three consecutive focused passes for
new synchronization.

## Ordered slices

### 1. Prove recovery and refusal with minimum inputs and events
Type: Behavior
Status: done
Proof: All existing recovery and early refusal observations pass through the
real CLI. The minimal app uses the installed Vite toolchain and the real
admission middleware. Record counts and comparable timings before layering.
Behavior: A candidate's inputs cause real process failure or recovery and the
watcher leaves the expected commit, process and checkout observable.

### 2. Prove full-dashboard transitions through events
Type: Behavior
Status: planned
Proof: Real browser and CLI journeys preserve selected commits, native-start
drain, shared files, runner and independent development. Retained assertions
await output, process, filesystem or actual boundary events. Verify every
changed consumer.
Behavior: Published changes and native settlement advance the watcher promptly
on their observable transitions. Full-app fixture publishes only runtime inputs.

### 3. Move detailed lifecycle coverage to its production owner
Type: Behavior
Status: planned
Proof: A bounded early experiment tests the archived preview owner through
real Vite and process boundaries, then maps each proposed removal to surviving
proof and an appropriate fault control. Verify the real CLI uses the same
owner. Explicitly settle equivalent no-mock proof for accepted native starts,
runner/client lifetime and published reads before changing those observations.
Behavior: Detailed recovery and cleanup faults fail cheaper tests while a few
full app journeys still detect broken composition. Run the complete matched
comparison and retain the change only with the declared saving and coverage.

## Current decisions

- Prior feasibility passes at the same runtime revision measured 129.90 seconds
  before and 85.50 / 93.61 after for 31 passing cases. Trial hardware was awake
  on AC and host load varied. Obtain a fresh baseline before claiming a gain.
- A separate 11.22-second recovery trial with two tiny outputs and real
  processes caught restoration to the failed candidate. It left CLI
  composition, origin recovery, signals and native acceptance to other proof.
- The decisive no-mock composition question is bounded by the early
  experiment in slice 3. Existing full CI cases use synthetic GitHub and
  native host fixtures. Establish an ordinary-CI replacement using real
  product boundaries before removing that evidence. If no equivalent proof
  is feasible without live credentialed host services, surface the exact
  gap for a decision before claiming coverage or landing.

## Accepted slice 1 proof

- Unmodified base `4d7a2ff66`: 31/31 strict in 138.77 seconds whole wall
  using the baseline selector above. The 11 recovery/refusal cases took
  51.459 seconds summed. AC host one-minute load was 5.94 before launch.
- Minimal recovery/refusal selection
  `/usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- --workers=1 'production-watcher-(failures|refusals)\.spec\.ts'`:
  11/11 three consecutive strict passes (26.90, 24.61, 23.24 seconds).
  The independent refactor awaited the whole failure report and passed
  11/11 in 22.61 seconds. This is focused evidence.
- Actual local Git publication, real npm/Vite build, stream and Git trace
  events, and the installed launch middleware preserve the recovery inputs
  and assertions. Build failure retains the running commit; retry stages the
  same commit. Origin loss and resumption are observed through Git output.
- Direct Git fixture, qualification, selection and deployment neighbors
  passed 12/12 in 18.43 seconds under the normal one-worker AC command
  `npm run --silent test:dashboard -- --workers=1 'production-(publication-fixture|qualification|update-selection|deployment)\.spec\.ts'`.
  Dashboard typecheck and whitespace checks passed.

## Execution context

Take `61eee0b54b3831c17749de0875d896214fea16b6`, agent `ziqing-chan`.
Publisher and CI coordinator `seed311-watcher-lifecycle-20261111`.
Story branch `codex/speed-up-production-watcher-lifecycle-checks`.
Observer directory `/tmp/dough-ci-501/watch-TF4UVr`, PID 31792.
