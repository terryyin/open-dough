# Run Dashboard launch tests on an installed project

**Identity:** SEED-433#run-dashboard-launch-tests-on-an-installed-project
**Source:** [Run Dashboard launch tests on an installed project](../../seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#run-dashboard-launch-tests-on-an-installed-project)

## Goal and scope

Every catalog project the Dashboard test harness creates becomes an installed
Open Dough project with a matching bare origin. The consumers whose promise is
about launching are updated to what installation changes: reporting context in
ad hoc instructions, story launches through the real installed start, and the
start's refusal when `claude` is missing. Each consumer keeps its distinct
observation, and production code is unchanged. The result lets SEED-432's
default-choice admission change only story-dependent expectations.

Excluded: consumers that launch only to obtain a session. The supplier story
[compose existing sessions directly](../../seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#compose-existing-sessions-directly)
moves them first, and the recorded dependency holds this story until that
supplier is on trunk.

## Current decisions

- Follow the North Star topic
  [make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  Add no support module. Attempt 4's `catalogProjectOrigin.ts` is not
  reused. Installation replaces the empty folder `installFakeClaude`
  creates (`dashboard/test-support/support/fakeClaude.ts`), through the
  existing `initializeStartOrigin`
  (`dashboard/test-support/support/startOriginInitialization.ts`). Seeded
  stories are MakeMe repository descriptions (`queuedReadyRepository` and
  `withRevision`). Assert the readiness of the installed checkout and its
  bare origin once, where the checkout is made.
- A server whose machine already holds an installed checkout, such as one
  `startOrigin` or `preparationPage` made, keeps it.
- Keep the run-wide prepared origin cheap. A consumer's description shares
  the run-wide queued base (`queuedReadyRepository`) as its first revision
  and adds its stories as later revisions. `preparedStartOrigin` then copies
  the shared preparation and commits the later revisions, instead of
  privately materializing a whole new installation per process.
- Story launches whose observation needs no started workspace launch ad hoc
  work instead, which costs about 300 ms rather than about 1,900 ms. Keep a
  story launch where the observation is about a story workflow: the
  execution or refinement command, a kept start, or the card's Start.
- Interim divergence: slices 1–4 install only the consumers they move,
  through one fixture option on the server options (`catalog: "installed"`).
  Slice 5 makes installation the only path and removes the option, so no
  consumer opts out at the end.
- Execute in Trunk Mode. Every slice leaves its consumers green, and
  landing each slice gives SEED-432 the harness early.

## Decisive premises and baseline

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Install a catalog project per server cheaply (slices 1–5) | At `cde557acd`, 24 November 2026, load about 12 on 16 cores, Node 24.21.0: a temporary backend spec under `npm run --silent test:dashboard:backend -- <spec> --workers=1` timed `startOrigin(queuedReadyRepository().please())` four times | 110–160 ms after a 1,029 ms first round, against a 440–580 ms server start |
| An ad hoc launch on the installed project launches, with reporting context (slice 1) | Same spec, `launch(server, makeMe.aLaunchRequest.adHoc())` on a `startOrigin` machine; and the full scratch run below | `launched` in 270–340 ms; `agent-launch-ad-hoc-boundary` failed only because the instruction gained the reporting context and branch-entry block |
| A story launch of a story queued on the catalog origin runs the real start and launches (slices 2–4) | Same spec, `makeMe.aLaunchRequest.executing({ identity: queuedIdentity, … })` against a `startOrigin(queuedReadyRepository())` machine | `launched` in 1,830–2,100 ms. The E2E card Start posts the same request to the same endpoint; only page data differs, and the page reads its stories from the published fixture origin, not the catalog origin |
| Story launches of stories absent from the catalog origin are refused (slices 2–4) | Full scratch run with every catalog project installed: attempt 4's `catalogProjectOrigin.ts`, called after `installFakeClaude` in `dashboardServer.ts`, `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend` and `… test:e2e`, 21:38–22:21 +08 | 53 backend cases in 37 files and 109 E2E cases in 58 files failed; the [seed's baseline](../../seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#shared-context) classifies them. Logs are private under the common Git directory at `open-dough/evidence/SEED-433-installed-catalog-probe` |
| Missing `claude` answers the start's refusal (slice 2) | Same full run, `agent-launch-boundary.spec.ts:225` | `{ kind: "failed", reason: "start-refused" }` instead of `not-installed` |

The baseline's failing set includes the supplier story's consumers, so each
slice reruns its own consumers rather than reusing that run. The scratch
wiring is reverted; nothing from it is on the branch.

## Slices and outside-in proof

Each slice runs the
[consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
with `--term catalog --term projectFolders --term launchRequest`. It then
runs its named files before and after the change, plus every further
launching consumer the trace reaches.

### 1. Launch ad hoc work on an installed catalog project
Type: Behavior
Status: planned
Proof: The backend `agent-launch-ad-hoc-boundary` and the E2E
`agent-launch-ad-hoc*` specs and `responsive-session-recovery-ad-hoc` pass on
installed catalog projects. In the baseline, `agent-launch-ad-hoc`,
`-ad-hoc-attachments` and `-ad-hoc-instructed` failed, and the rest passed. The boundary spec asserts the reporting context
and its branch-entry block for the launch's own reference.

Installed catalog project, ad hoc Start or launch → the native session opens
in the project checkout with the developer's text followed by the Dashboard
reporting context. Add the installation path and the `catalog` option, with
its one readiness assertion. Move the ad hoc launch consumers onto the
option, keeping their attachment, label, terminal and problem observations.
Include the Pygardon project case in `agent-launch-ad-hoc`.

### 2. Launch stories at the backend boundary through the real start
Type: Behavior
Status: planned
Proof: `agent-launch-boundary`, `-environment`, `-model-boundary`,
`-options-boundary`, `-options-groups`, `-duplicate`,
`-uncertain-continuation` and `runtime/mounted-boundary-server` pass on
installed catalog projects, with their launched stories queued on origin.
The missing-`claude` case answers the start's refusal and keeps no record.

Queued story on the catalog origin, execution or refinement launch → the
real start runs, the session opens in its workspace with the established
block, and the consumer's own observation holds: environment, model alias,
option order, one conversation under contention, or continuation. Queue
`agentLaunchBoundary`'s identity through a MakeMe later revision on the
shared queued base, or use `queuedIdentity`. Cases whose observation needs no
story workflow switch to ad hoc launches under the current decision.

### 3. Start a card's story through the real start in E2E
Type: Behavior
Status: planned
Proof: The E2E `agent-launch-story-card`, `-story-card-open-session`,
`-story-card-problems`, `-claude-verification`,
`-claude-own-record-verification`, `-follow-up-session` and `-codex` specs
pass on installed catalog projects.

The launch journey's catalog origin queues the journey's stories, including
its Taken story → Start on the card runs the real start, and the card lists
the session beside its Start actions. Verification, Recheck, the follow-up
and the Codex host keep their observations. Use `launchJourney`'s story
identities in the description, and update workspace and instruction
expectations to the started workspace.

### 4. Launch from the options, model and voice dialogs on installed projects
Type: Behavior
Status: planned
Proof: The E2E `agent-launch-options`, `-options-exclusive`,
`-options-kept`, `-model`, `session-instruction-voice`,
`-voice-key-failures` and `-voice-provider-failures` specs pass on installed
catalog projects.

Dialog choices, then Start → the launch carries the chosen flags, model or
dictated text through the real start. The options-file cases (no file,
invalid, another command's, a skill that is not installed) state their file
through the MakeMe repository description of the installed project, not
beside an empty folder.

### 5. Install every catalog project
Type: Behavior
Status: planned
Proof: Full backend and E2E suites pass with no `catalog` option left, run as
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend`
with `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` set, and the same for
`test:e2e`. Their wall time is within the run-to-run spread of a
preparation-base run taken under the same load.

Any server → its catalog projects are installed with a matching bare origin.
Remove the option and make installation the only path. Move every remaining
consumer the full run reaches onto the slice 2–4 patterns. A consumer that
launches only to obtain a session is a supplier gap: report it to the
developer instead of moving it here. Full suites are the local gate for this
slice because every server fixture changes.

## Concern evidence

Refinement was not needed. Each of slices 1–4 owns one launch route and its
own consumers, and slice 5 removes the interim option. Remaining concerns:

- Slice 3: the started workspace may change E2E card observations beyond the
  launch, such as Taken placement or the session's folder. The baseline
  attributed 24 E2E files' `toHaveCount`/`toBeEnabled` failures to no cause.
  Most of them belong to the supplier's consumers, but any launch consumers
  among them may overrun this slice's sizing.
- Slice 5: the remaining set depends on what the supplier story leaves.
  Its size is known only once the supplier lands.

## Verification and delivery

- Local gate: use the maintained [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power for slice 5's full runs. Keep the
  default timeout and apply the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run slice files with
  `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:backend -- <files>`
  or `… npm run --silent test:e2e -- <files>`. Run Dashboard typecheck and
  lint. When a slice changes `Distribution/tests/support/` builders, run
  `scripts/test.sh` on the MakeMe support tests it touches.
