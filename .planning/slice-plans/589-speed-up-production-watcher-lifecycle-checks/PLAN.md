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
The final candidate adds the ordinary production-watcher-preview spec to this selector. Confirm identity and
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
Status: done
Proof: Real browser and CLI journeys preserve selected commits, native-start
drain, shared files, runner and independent development. Retained assertions
await output, process, filesystem or actual boundary events. Verify every
changed consumer.
Behavior: Published changes and native settlement advance the watcher promptly
on their observable transitions. Full-app fixture publishes only runtime inputs.

### 3. Move detailed lifecycle coverage to its production owner
Type: Behavior
Status: done
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
- The no-mock replacement was established before moving detailed cases.
  The full dashboard uses actual local Git, a real Cursor runner and
  terminal client, and pinned native Codex with an empty conversation.
  Direct published-read tests retain ref, pinned-backlog and cache details.

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

## Slice 2 proof and decisions

- A full-dashboard startup uses a hidden configured local project and an
  actual shell PTY through the product's Cursor runner and dashboard
  WebSocket. The full app builds and hot-reloads dirty development source
  while production remains pinned. The same runner and client survive
  replacement and restart, with actual post-restart terminal input.
- The full update uses a real isolated Codex app-server with a blank native
  conversation. B's successful real Vite build reports its completion while
  the npm command is still held. The real launch-record store lock holds
  the accepted attempt until admission closes and a second HTTP start
  returns 503. A Node HTTP response-finish observer records the successful
  durable attempt before the old preview's drain response finishes.
  No GitHub or native host doubles participate in the watcher selection.
  The real held build, same-URL replacements, post-start durable bytes
  and SIGTERM cleanup are exercised.
- Runtime acquisition uses pinned `@openai/codex@0.167.1` via npm exec.
  Cold tool lookup/install was 9.98 seconds on this Mac and cached lookup
  was 0.29 seconds. Include it in ordinary elapsed runs. The daemon and
  its independent updater are owned and stopped by the test.
- The deployed authenticated-read and launch endpoints are exercised at
  the actual replacement URL. Their detailed configured-project backlog
  retrieval, ref resolution and pinned cache behavior stay directly
  protected by `authenticated-project-observation.spec.ts` and
  `authenticated-read-revision-backlog.spec.ts`. Vite dev and preview mount
  the same production boundary owner.
- The 31-case transitional event-driven selection passed in 83.29 seconds
  with the existing native/GitHub fixtures still present. This is evidence
  for synchronization, and the final measurement uses the real fixture.
- With the real native update, watcher update, Git selection and direct
  read proof passed 18/18 strict in 45.92 seconds including teardown.
  Literal selector under `caffeinate -s -i` and `--workers=1`:
  `production-watcher-updates\.spec\.ts|authenticated-read-revision-backlog\.spec\.ts|authenticated-project-observation\.spec\.ts|production-update-selection\.spec\.ts`.
  Dashboard typecheck passed. Direct drain and scheduling neighbors
  passed 2/2 during the event refactor.
- Independent refactor focused proof: 17/17 strict in 60.36 seconds
  with `/usr/bin/time -p caffeinate -s -i npm run --silent test:dashboard -- --workers=1 'production-watcher(-updates)?\.spec\.ts'`.
  Typecheck and whitespace checks passed. It consolidated the two minimal
  catalogs and credential isolation, made admission/drain records explicit,
  and stopped the fixture-owned native updater independently of its PID file.

### Linux CI repair

GitHub Actions run 42999113837 attempt 1 on `44e8554d0` failed the
held-start case. At admission closure the old preview had already exited.
The signal-based native gate did not guarantee a pending attempt on Linux.
The repair uses the actual launch-record writer lock, separate from durable
attempt acceptance. It acquires that lock after B's real Vite build finishes,
asserts the kept attempt is still pending when the old admission closes,
then releases the lock after the refused second start. The replacement
still requires a real successful Codex launch to have settled before drain
answers. No timeout or test retry changed.

The repaired update and direct drain selector passed all 11 checks on their
first attempt in 42.70 seconds on macOS with one worker under
`caffeinate -s -i`. Dashboard typecheck, scoped formatting and lint, and
`git diff --check` passed. This proof covers the pending attempt,
live old preview, second-start refusal, and durable native settlement.

## Accepted slice 3 proof

The ordinary backend check builds two one-page Vite deployments and calls
the preview owner used by the actual watcher. Both processes fail to
start with distinct causes. The check observes both commits and causes,
the closed URL and the ended original PID. A scratch mutation that
restarted the candidate in place of the working commit failed on the
missing working-preview cause and was reverted. The focused live recovery,
refusal and preview selection passed 9/9 in 20.74 seconds.

The retained CLI sequence still demonstrates real build failure, preview
failure, working-commit restoration on the same URL with a new PID and
successful retry of the same candidate. The CLI's common fatal exit is
proved by killing the serving preview and observing its exit, URL and
checkout retirement. A real independent development listener keeps
serving and the shared launch record and config keep their original bytes.
HUP and SIGINT await retirement events. Actual port refusal uses the tiny
watcher and an independent listener.

The full startup and update specs retain browser-visible pinned output
beside dirty development, exact B-before-C replacement at the same URL,
published read and launch boundaries, native drain and settlement, stable
shared records, and live Cursor runner and terminal client across
replacement and restart. The direct Git selection and provider-read
checks continue in ordinary CI. The selector has 29 cases in place of 31
because successive observations share journeys and the detailed dual
failure and port refusal use cheaper real boundaries.

Whole-command one-worker timing includes all setup and teardown. Both
base and candidate ran on AC macOS with the same ordinary strict runner.
The base passed 31/31 in 138.77 seconds. The repaired candidate's first
run passed 29/29 with no retry in 82.43 seconds, saving 56.34 seconds
(40.6%). The one-minute load at start was 5.94 on the base and 8.07 on
the candidate. Native tool resolution and fixture teardown are included.
The second repaired run passed 29/29 on the first attempt in 83.90 seconds
(one-minute load 6.08). Across the two runs the saving is 54.87–56.34
seconds (39.5–40.6%). The strict 11-case repair gate and the two whole
runs give three consecutive passes of the changed native drain sequence.

Playwright case durations locate the savings. These sums exclude the
outer setup and reporting overhead included in the wall times above.

| Behavior family | Baseline seconds | Repaired seconds |
| --- | ---: | ---: |
| Recovery, refusal and lower preview lifecycle | 51.46 | 21.89–22.28 |
| Full startup, independent development and Cursor runner | 27.06 | 17.08–17.48 |
| Full update and focused policy decisions | 36.24 | 27.97–28.70 |
| Real Git update selection | 2.38 | 2.19–2.30 |

The independent refactor review kept the shared production owner and
event helpers as implemented. Its traced consumers preserve the ordinary
CLI, single-preview and Git selection contracts.

## Execution complete

Product advice: no change. The optimization meets the local saving target
with equivalent behavioral proof through the ordinary watcher selection.
Standalone pinning and distribution remain with SEED-303.
