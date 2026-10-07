# Design and delivery decisions

Part of [plan 270](PLAN.md); execution identity and ordered slices stay there.

## Existing solutions and current decisions

PFE over the terminal registry, host boundary, and test support, rechecked
at the current preparation base. Reuse the existing host-owned native rename,
registry, recorded screen, and locked binding write rather than adding parallel
solutions. The launch-instruction readiness predicate has the same screen
contract, but its instruction/paste/persistence lifecycle is not the rename's:
reuse the predicate shape and screen, not the launch instruction operation.

- **A readiness predicate shape already exists.** Host attach results may
  declare `ready?: (screen, cursorVisible) => boolean`
  (`launchHosts.ts:42`); Cursor declares one from its composer text
  (`hosts/cursor/terminal.ts:18-26`, `hosts/cursor/idleScreen.ts`), and
  `LaunchInstruction` evaluates such a predicate on a server-side
  `KeptClientScreen` after each output (`launchInstruction.ts:88`). The
  private client already records its screen (`nativeAttach.ts:41-47`,
  `observeScreen: true`). Decision: reuse the predicate shape and the private
  client's recorded screen; Claude Code's prompt recognition lives in its host
  (`dashboard/server/hosts/claude/`, beside `rename.ts`) and is supplied by the
  rename to `WithAttachment`, which waits for it on the private client after
  each output settles, under the same `signal`. A screen that never shows the
  prompt before the wait ends reports `The terminal attachment could not be
  opened.`, as a silent attach does today.
- **Not `TerminalAttachment.ready` for Claude.** Declaring it on Claude's
  `attach` result would also gate the page terminal's admission and its
  reopen of a done session (`joinedSockets.ts:76-86`, `:115-127`), a page
  behavior change outside this correction. The open-socket path of
  `withAttachment` types as today: that terminal is the developer's.
- **The fake already has per-attach controls.** `claudeAttachesSilent`
  (`tests/support/fakeClaude.ts:94`, `:227-229`) toggles a state file the
  fixture reads. Decision: the fake's attach prints a prompt marker modelled on
  slice 1's observed prompt after its `attached …` line, after a delay read
  from one more state file (default none), and discards keys that arrive
  before the marker; `tests/support/fakeClaude.ts` gains one control to set
  that delay, documented in `dashboard/tests/README.md` beside
  `claudeAttachesSilent`.
- **`keepRecord`'s two parts.** Decision: the locked binding write becomes its
  own exported operation that returns the early report it found (re-exported
  from `launchRecordStore.ts`, where `recordOperation` imports from);
  `keepRecord(sourceId, record, doneMarks)` takes `doneMarks` as required and
  starts the reported Done after that write. The out-of-process test writers
  call the binding write by its name. **Caution:** making `doneMarks` required
  broke these callers once during plan 267; all four
  (`agent-completion-recovery.spec.ts:157`,
  `agent-completion-early-recovery.spec.ts:105`,
  `agent-completion-binding.spec.ts:165`,
  `tests/support/completionRecoveryFaults.ts:88`) change in the same slice.
- **One rename signal, owned by `track`.** Decision: `track` creates the
  controller and hands its signal to the Done it runs; both intents pass it to
  `LaunchHost.rename`, whose `stopped` becomes required (Codex ignores it, as
  today). A reported Done that is abandoned writes nothing (today's rule). A
  manual Done whose wait is abandoned, by a later Done of the same session or
  by `close()`, still records a rename problem from the four texts and never
  shows `Named` for a rename that did not complete, because its `doneAt` was
  already written without a pending text (`doneMarks.ts:231-234`,
  `launchRecordStore.ts:123-139`).

No new North Star topic is needed. The established “Agent launch as a
requested assignment” topic in `.planning/NORTH-STAR.md` supports the selected
host ownership and shared terminal transport. [ADR 0002 — Software development lifecycle
principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
is Accepted: its cohesion principle supports reusing one attachment registry
and one Done operation. [ADR 0005 — Cross-tool validation through native
acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
is Accepted: fake-host proof does not establish real-host behavior; the
existing real-host probe remains pending. ADR 0008 is Proposed in both the
[index](../../../docs/adrs/README.md) and its record; it supplies no binding
constraint on done marks. No conflict with the relevant Accepted ADRs was
found in this refinement.

## Retry boundary (developer decision)

On 2026-10-07 Terry accepted the refinement recommendation: preserve manual
Done stopping after a failed rename and defer repair of the original
post-failure manual retry promise. The evidence is `finishNativeDone` in
`dashboard/server/doneMarks.ts` at `fc2fbdc6`: it catches the rename failure
and proceeds to native stop. The fake's revival proves a new running-session
precondition, not a later retry of the stopped session. Keep that distinction
explicit in spec descriptions and comments; do not add resume machinery.
A first manual recovery after a failed reported wait remains required because
reporting leaves the session running. No story or queue entry for retry repair
is created by this planning request.

## Decision point (developer)

Slice 1 measures attach-to-prompt time T on a real host. The manual wait is
five seconds and also covers the idle read, the listing call, 600 ms of key
pauses, and the confirming listing read (about two seconds together in O1).
If T leaves less than about one second of that wait (T above roughly three
seconds), record T in Learnings and hand the manual wait to the developer as
a decision; do not choose a new value. Slice 5 still proceeds: typing only at
the prompt is required whatever the wait is.

## Starting from a clean session

- Execute in the story's existing worktree or a fresh one from trunk once this
  plan and story are published; dependencies are installed at the repository
  root here. In a new checkout run `env -u NODE_ENV npm ci --ignore-scripts
  --offline` first: a dashboard-launched session inherits
  `NODE_ENV=production`, under which `npm ci` skips dev dependencies.
- Terry authorized the executing agent to run slice 1's credentialed probe on
  2026-10-07; its accepted observation is recorded in
  [proof and observations](PROOF-AND-OBSERVATIONS.md#accepted-execution-proof-slice-1).
  The final real-host observation remains owner-run and uses the corrected dashboard.

## Current decisions

- Execution observation: Vite awaits `closePreviewServer` hook promises, then
  exits. The current void cleanup drops manual Done failure persistence.
  Slice 4 must return the existing tracked Done settlements through
  `NativeDoneMarks.close` → `agentLaunchPlugin` → `localBoundaryPlugin`
  cleanup, while closing attachments immediately. This necessary lifecycle
  structure establishes the already-required manual-close outcome; reported
  abandonment remains write-free. Verify affected shutdown consumers.

- Implementation slices run their named specs, typecheck, and lint before
  commit. The owner-run probe changes no product code and records its
  observation instead. Slice 5 adds the whole dashboard suite once because
  the shared fake executable is loaded by distributed test consumers.
- During execution, apply the installed dough-execute-plan local delivery
  gates: focused proof acceptance and independent dough-post-change-refactor
  before commit, repository formatting through `npm run format`,
  and delivery/CI ownership. See its references/delegation.md and
  references/wrap-up.md; do not treat hosted CI as an additional local gate.
  This request supplies planning authority only.
- Terry's resolved retry boundary applies to every slice: manual stopping is
  preserved, post-failure manual retry repair is deferred, and first manual
  recovery after a failed reported wait remains required.
- No new wait value; see the decision point.

## Plan refinement review

Refinement ran on the existing plan. Retain the owner-held early probe and the
retired-workspace proof slice. Retain the two direct retrospective Structure
corrections, moving the binding correction to slice 3 and signal ownership to
slice 4 before the prompt Behavior at slice 5. Retain the fake, readiness wait,
production integration, failure cleanup, and host proof in one prompt slice:
those changes establish one outcome, and separating them would deliver a fake
that invalidates existing consumers before its matching production behavior.
No slice is complete; the resulting count is five.

The common rule is one Done-owned, bounded rename attempt: Claude owns its
idle/prompt recognition and native confirmation; the shared registry owns the
attachment and its observed screen; binding owns the durable record and hands
native continuation to Done after releasing locks. PFE confirmed the existing
host boundary, screen model, and locked binding operation as suitable seams.
No second PTY path, readiness screen, persistence grammar, or background retry
is needed. `.planning/NORTH-STAR.md`'s “Agent launch as a requested assignment”
topic supports host-owned native operations and shared terminal transport;
its direction is carried forward unchanged. ADR 0008 remains Proposed.

No numeric slice target or hard limit was supplied by this request or
`AGENTS.md`; sizing includes implementation, focused proof, refactoring, and
cleanup under the installed slice-decomposition rule. The two Structure
slices each own one evidenced weakness and preserve external journeys.
The prompt slice has one red-to-green loop plus broad consumer verification;
its owner-held observation and shared-fixture suite are explicit costs, not
hidden preparation. No remaining boundary or cumulative-design concern was
identified in this review. Native observations remain pending work with the
stop rules above; readiness of this plan does not mark them passed.
