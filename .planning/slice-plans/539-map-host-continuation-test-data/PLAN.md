# Make Codex and Cursor session test setup map directly to the domain

**Identity:** SEED-261#map-host-continuation-test-data
**Source:** [Refined story](../../seeds/SEED-261-share-domain-test-data.md#map-host-continuation-test-data)
**Source review:** [source-only review](source-review.md)

## Goal and boundaries

Make valid arranged host sessions read like the saved conversations the
dashboard continues. Use the same MakeMe vocabulary for a kept launch and
for the host session a terminal or runner consumes on its own. The source
owns the four key examples and the boundary with the other test-data stories.

Convert arranged facts. Keep real launches, workspace establishment, reads of
records produced by the dashboard, recovery, native stand-ins, PTY and socket
operations, route substitutions, faults, wire frames, and independent
expectations in their existing proof roles.

## Reuse and decisions

- Build on [MakeMe's launch builder](../../../tests/support/launchTestData.mjs)
  and the real [host session contract](../../../dashboard/src/hostSession.ts).
  Where a terminal or runner consumes a session by itself, expose the same
  typed session construction through MakeMe and have the kept-record builder
  use it. Use the first real consumer to establish the API. Keep the native
  name independently settable where it differs from the request title.
- Preserve each host's continuation shape. A current Codex resume command
  names the saved endpoint, workspace, and thread, and may carry a notice
  alongside the arguments. Cursor names the native UUID and workspace, and
  its optional saved configuration scope is distinct from the resume
  arguments. Compare with the production
  [Codex launch](../../../dashboard/server/hosts/codex/launch.ts),
  [Cursor launch](../../../dashboard/server/hosts/cursor/launch.ts), and
  [Cursor recovery](../../../dashboard/server/hosts/cursor/recoveryResume.ts)
  paths. Keep explicitly different argv when it drives a case. Preserve
  literal predecessor omissions and extraneous aliases at the decoder edge.
- The [kept record plan](../534-map-launch-and-session-test-data/PLAN.md)
  owns writer consolidation, including `saveObservations`, `keptCursorTurn`
  and `cursorRunnerReplacement`. Use the current store seam, preserving
  atomic replacement of records read by a live runner. The
  [live observation plan](../536-map-launch-observation-test-data/PLAN.md)
  owns `observationRecord` and passive reads. Use its valid records at mixed
  boundaries and keep the explicit predecessor variants where tested. If a
  sibling has already converted shared setup, check the consuming case and
  reuse it. The existing builder, typed host shapes, and store seams suffice
  without a blocking supplier agreement.
- Follow [ADR 0002 §5, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and the [agent launch North Star](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment).
  Host-specific identity and continuation belong to each host, a kept record
  belongs to the machine store, and the Cursor runner's held answer is an
  observation. Keep proof deterministic under
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci)
  and test builders in test support under [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md).

## Preparation evidence

Observations ran in this worktree at `8d5a787ac` with Node 24.21.0 and
Chromium 153.0.8010.12 after `node scripts/setup-native.mjs npm` and
`node scripts/setup-native.mjs check`. Playwright commands below used
Homebrew Bash first on `PATH` and unset `NO_COLOR` and `FORCE_COLOR`.

| Premise and consuming operation | Observation and result |
| --- | --- |
| MakeMe's current variants feed the real launch-record decoder, and the decoder handles the host-specific additions and predecessor facts. | With `node --experimental-transform-types --disable-warning=ExperimentalWarning --input-type=module`, passed existing MakeMe Codex and Cursor records through `launchRecordSchema.parse`. Both kept their continuation facts. Adding a Codex notice or a Cursor configuration scope to the corresponding input retained that field. A predecessor Codex record decoded without continuation and the extra Claude alias was stripped. Missing Codex endpoint, missing Cursor continuation, and non-UUID Cursor inputs were refused. The backend `launch-record-session-rules.spec.ts` passed as well. |
| The Codex terminal consumes saved context at native attach, and the test distinguishes that behavior. | `npm run test:dashboard -- --workers=1 'backend-tests/terminals/agent-terminal-codex\.spec\.ts$' --grep 'saved context supplies native resume'` failed on the retained history assertion when only the native terminal's `--no-alt-screen` flag was removed in scratch. The edit was reverted. The unchanged spec passed. |
| The Cursor resume and replacement tests observe the saved arguments and scope through the runner, and the socket replay test has an independent output-order assertion. | `caffeinate -s -i npm run test:dashboard -- --workers=2 'backend-tests/(launches/launch-record-session-rules|terminals/(agent-terminal-codex|agent-terminal-resize|joined-sockets-replay|live-terminal-diagnostic-capture)|sessions/(cursor-runner-environment|cursor-held-sessions-revision))\.spec\.ts$' 'dashboard/tests/sessions/(cursor-session-scope-continuation|cursor-runner-replacement-controls|cursor-session-recovery-stops|cursor-sessions-sidebar-size-(kept|unkept))\.spec\.ts$'` passed. Scope recovery checks native argv, model scope, and the shared configuration. Replacement checks eligible, failed, and excluded revivals. The replay spec checks literal frame order. |
| The held-list reader accepts Cursor records, and list visibility alone cannot verify their resume identity. | The Node probe passed a copied crowd row through `runningCursorSessionsSchema.parse`. Changing only its UUID passed decoding and the real `sessionKey` changed, while the resume argument still named the original session. `npm run test:dashboard -- --workers=2 'backend-tests/terminals/agent-terminal-codex\.spec\.ts$' 'dashboard/tests/sessions/(agent-launch-codex-observation-workspace|cursor-sessions-sidebar-layout)\.spec\.ts$'` passed on the restored checkout. Slice 4 compares the produced UUID to the resume target separately from its browser proof. |

## Proof and delivery gates

At each slice, compare converted input at the consuming boundary with the
previous fixture. Preserve case-driving values and exact bytes when under
proof. For a repaired shape, record the changed field and the assertion that
still discriminates. Run the named selection and affected consumers found by
the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
Review the changed call sites under
[ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
for visible case-driving facts and removed duplicate construction.

Local gate follows [test automation](../../../AGENTS.md#test-automation)
and carries the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into each delegation and repair handoff. Follow
[native setup](../../../tests/native-setup.md) in a fresh worktree, put
Homebrew Bash 5 first on macOS, and unset `NO_COLOR` and `FORCE_COLOR` for
Playwright. Run `npm run typecheck:dashboard` for shared MakeMe changes and
run `npm run test:dashboard` and `npm test` before final delivery because
both suites load the common entry point. On fully awake macOS with AC power
wrap full runs in `caffeinate -s -i`. On battery follow the lid-open
`caffeinate -i` and sleep-log guidance in
[Machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Keep native protocol evidence intact. If the trace identifies a native
scenario that uses changed setup, update its evidence identity for the
changed dependencies. Hosted CI follows the selected execution mode.

## Slices

### 1. A saved Codex thread supplies its own terminal context
Type: Behavior
Status: done
Proof: Source example 1. Run `npm run test:dashboard -- 'backend-tests/(launches/(launch-record-session-rules|agent-launch-codex-startup)|terminals/(agent-terminal-codex[^/]*|agent-terminal-resize))\.spec\.ts$' 'dashboard/tests/(sessions/agent-launch-codex-observation-workspace|terminals/agent-terminal-codex-page)\.spec\.ts$'`.

A maintainer arranges a saved Codex thread through MakeMe → the terminal
opens → the host receives the thread's saved endpoint and working directory.
Use the shared host facts for valid Codex record and direct terminal setup.
In the resize race arrange separate coherent host variants, with the alias
on Claude and continuation on Codex. Keep exact predecessor inputs and
decoder expectations in the schema cases. Compare real attach argv and
working directory with the saved facts, retaining the tests that launch
the session for real. The first `agent-launch-codex-startup` case seeds a
record through `observationRecord` and then opens its terminal. Use shared
Codex continuation facts for that setup while keeping passive fixture
ownership in the observation story and process setup in `codexLaunch`.

Accepted: `makeMe.aHostSession` (`tests/support/hostSessionTestData.mjs`)
builds standalone Claude and Codex sessions, and `aLaunchRecord`'s
`inClaudeSession`/`inCodexSession` delegate to it. A Codex session's resume
arguments default to the current `codex resume --remote <endpoint> --cd
<workspace> <thread>` command; the fake's `codexEndpoint` lives in
`fakeCodex.ts`. The startup case now asserts the attach argv and working
directory (a scratch endpoint break failed it). Slice selection 22 passed;
consumer specs (observation alerts, concurrency, sharing, status, wait,
listing, side panel, Codex launch) 26 passed; typecheck passed.

### 2. Cursor recovery resumes the saved conversation and configuration
Type: Behavior
Status: done
Proof: Source example 2. Run `npm run test:dashboard -- 'dashboard/tests/sessions/(cursor-session-recovery[^/]*|cursor-session-scope[^/]*|cursor-runner-replacement[^/]*)\.spec\.ts$' 'backend-tests/terminals/agent-terminal-cursor[^/]*\.spec\.ts$'`.

A maintainer arranges kept Cursor continuations → recovery or replacement
runs → the runner resumes the intended UUID and scope for eligible sessions.
Use MakeMe for those continuations, including the valid
finished and failed-revival records in the replacement controls. Keep
their IDs, the failed workspace, timestamps, and last-held selection
visible. Keep live records from `cursorStart` and `cursorSessionRecovery`
and the `keptCursorTurn` rewrite where the case is injecting a failure into
a record produced by a launch. Preserve the observed resume command,
scope, process controls and the Recover and Recently done assertions.

Accepted: `makeMe.aHostSession.cursor` arranges a Cursor UUID, workspace,
resume arguments (default `cursor-agent --workspace <ws> --resume <uuid>`)
and an optional configuration scope kept apart from them; `inCursorSession`
delegates to it. `cursorStart`, `cursorSessionRecovery` and `keptCursorTurn`
arrange no session facts and stay live evidence. The replacement controls'
finished and failed-revival records and the retention scope case's session
now come from MakeMe; break checks on `markedDoneAt` and `configScope`
failed them. The selection plus retention passed. The retained native
stream records' `input-hash` lines for MakeMe support files already
differed from the files before this story; they identify the revision each
paid run used, so they stay unchanged. The selection exposed a launch-wait
race in the Cursor wait cases, repaired separately after this slice:
a test-only `DOUGH_TEST_LAUNCH_WAIT_END_FILE` (`dashboard/server/launchWait.ts`)
ends a wait once the case observes the kept record, held trust prompt or
attach, and the fake Cursor holds paint until released. A scratch 2 s
create-chat delay failed 5/5 old cases and passed 8/8 repaired; 80/80
repeated under load 37-41; Cursor consumers 195 passed.

### 3. A held terminal joins the intended Cursor session
Type: Behavior
Status: done
Proof: Source example 3. Run `npm run test:dashboard -- 'backend-tests/(terminals/(joined-sockets-replay|kept-client-screen-write-queue|live-terminal-diagnostic-capture)|sessions/(cursor-runner-(build-proof|environment|helper-repair-shapes|last-held|restart-shapes)|cursor-recover-(split-paint|submitted-chip)|cursor-session-(belonging-subagents|owned-pending-ci)))\.spec\.ts$'`.

A maintainer arranges a held Cursor session through MakeMe → a terminal
joins → the joining socket receives the held screen before live output.
Replace standalone arranged sessions in `cursorRunnerProof`,
`recoveredCursorPty`, and direct terminal and runner consumers. Keep the
command the runner actually executes, native stream, socket frames,
joining and replay order, and teardown with their original owners.
Preserve the session IDs the runner uses to keep conversations separate.

Accepted: `cursorProofSession`, `keepRecoveredCursor` and the direct
terminal and runner specs arrange their Cursor sessions through
`makeMe.aHostSession.cursor`; the mixed belonging and pending CI cases
convert only their session. Partial resume arguments became the production
command, which these paths do not read. The executed keep and resume
commands, frames and replay order stay literal. Selection 41 passed; a
scratch break ignoring the session ID failed the bridge join/resume and
last-held cases.

### 4. Every synthetic held row names its own resumable Cursor session
Type: Behavior
Status: planned
Proof: Source example 4. Run `npm run test:dashboard -- 'dashboard/tests/sessions/cursor-(sessions-sidebar[^/]*|runner-sessions[^/]*)\.spec\.ts$' 'dashboard/tests/[^/]+/recently-done-sessions-sidebar[^/]*\.spec\.ts$' 'frontend-tests/cursor-runner-sessions-ui\.spec\.ts$' 'backend-tests/sessions/cursor-held-sessions-revision\.spec\.ts$'`. Compare each substituted row's UUID with the resume argument before the list is read.

Use shared session facts in `runningCursorSessionsPage.answerCrowd` and
the other synthetic held answers that arrange host facts. A crowded list
has distinct UUIDs and the saved command of each row targets that UUID.
Preserve the real `heldSessionsAnswer` route precondition and the layout,
scrolling and no-write observations. General kept Claude crowd records
stay with the kept-record story.

## Readiness review

Plan refinement made each conversion own its maintainer-visible result
and existing product proof, with shared setup introduced alongside a
consumer. The observed contracts support the same host facts across slices.
No slice-specific blocking concern was found.
