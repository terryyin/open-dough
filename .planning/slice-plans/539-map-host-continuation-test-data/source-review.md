# Source review

Source-only reviewer: a fresh general-purpose agent with no conversation
inheritance, launched by the executing coordinator on 2026-11-08 before the
first implementation delegation. Input: only the Goal, Scope and Key examples
of [SEED-261#map-host-continuation-test-data](../../seeds/SEED-261-share-domain-test-data.md#map-host-continuation-test-data)
(seed lines 383–436, sha256 `68ea8c0a3424baac5fdb00767ef06ac7dd390e21a2de1ec5ba3f78d4b4fc04de`),
with no amendments, plan, product or proof. It returned the numbered
commitments below.

Reviewer's exclusions and qualifications: the kept record, live observation
and completion and landing stories keep the areas the source assigns them;
builders arrange valid sessions only; the Codex notice and Cursor scope appear
only when a case needs them; item 6 accepts either removal or delegation;
items 14, 16, 18 and 20 preserve current behavior.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Goal: maintainers can read the setup of a Codex or Cursor continuation test and see three things: | slice 4 | observed: converted call sites state thread or UUID, workspace, endpoint and scope or notice when needed (agent-launch-codex-startup, replacement controls, retention scope, cursorRunnerProof, answerCrowd) |
| 1.1 | which saved Codex thread or Cursor conversation the test continues | slice 4 | observed: sessionId stated at each converted call site (saved-conversation, doneSessionId/failSessionId, cursorProofSession sessionId, crowd UUIDs) |
| 1.2 | where it resumes | slice 4 | observed: workspace and Codex endpoint stated at call sites; startup case asserts attach cwd and --remote/--cd |
| 1.3 | which host-specific facts drive the result | slice 4 | observed: configScope (retention scope), notice (session rules), missing workspace and markedDoneAt (replacement controls) visible where they drive the case |
| 2 | Goal: terminal, recovery and held-session tests use the same domain setup, so changes to continuation data can be made and reviewed in one place. | slice 4 | observed: terminal (slices 1, 3), recovery (slice 2) and held-session (slice 4) setups all build sessions through tests/support/hostSessionTestData.mjs |
| 3 | Valid Codex and Cursor sessions are arranged through shared MakeMe builders, either on a kept launch or as the session that a terminal or runner consumes directly. | slice 3 | observed: kept: launchTestData inClaudeSession/inCodexSession/inCursorSession; direct: cursorRunnerProof.ts cursorProofSession, recoveredCursorPty.ts keepRecoveredCursor, joined-sockets-replay, kept-client-screen-write-queue, live-terminal-diagnostic-capture, cursor-runner-environment via makeMe.aHostSession |
| 4 | Each case shows at the call site the facts it relies on. | slice 4 | observed: case-driving facts visible at call sites per slices 1-4 Accepted notes |
| 4.1 | A Codex session has a thread ID, a saved workspace and endpoint, and resume arguments. It has a notice when the case needs one. | slice 1 | observed: tests/support/hostSessionTestData.mjs codexSession; launch-record-session-rules.spec.ts "accepts a Codex continuation with its endpoint and workspace" toEqual(savedCodex) with notice |
| 4.2 | A Cursor session has a native UUID, a workspace and resume arguments. It has the saved configuration scope when the case needs it. | slice 2 | observed: tests/support/hostSessionTestData.mjs cursorSession (UUID, workspace, default resume args, optional configScope); agent-launch-retention-scope.spec.ts expired scope removal depends on arranged configScope (break check failed it) |
| 5 | Arranged host and continuation facts are converted in these places: | slice 4 | observed: source-review rows 5.1-5.5 observed in slices 1-4 |
| 5.1 | Codex launch and observation support | slice 1 | observed: dashboard/tests/support/codexObservation.ts observationRecord builds session via makeMe.aHostSession.codex; launchTestData inCodexSession delegates to codexSession |
| 5.2 | Cursor start and recovery support | slice 2 | observed: cursorStart.ts and cursorSessionRecovery.ts arrange no session facts (records come from live launches); arranged recovery/replacement continuations in cursor-runner-replacement-controls.spec.ts converted to makeMe.aLaunchRecord.adHoc().inCursorSession |
| 5.3 | kept Cursor turns | slice 2 | observed: keptCursorTurn.ts arranges no session facts: keptCursor reads, rewriteKeptCursor rewrites launch-produced records (cursor-session-alerts.spec.ts) unchanged |
| 5.4 | Running Cursor sessions setup | slice 4 | observed: dashboard/tests/runningCursorSessionsPage.ts answerCrowd rows via makeMe.aHostSession.cursor; frontend-tests/cursor-runner-sessions-ui.spec.ts heldRecord via inCursorSession default args |
| 5.5 | the terminal and runner consumers of the above | slice 3 | observed: consumers cursor-runner-(build-proof\|helper-repair-shapes\|last-held\|restart-shapes), cursor-recover-(split-paint\|submitted-chip) pass in slice 3 selection (41 passed) |
| 6 | Displaced constructors are removed, or the harness helpers delegate to MakeMe (either option). | slice 4 | observed: codexObservation.observationRecord, inClaudeSession/inCodexSession/inCursorSession, cursorRunnerProof, recoveredCursorPty, replacement controls, answerCrowd delegate to tests/support/hostSessionTestData.mjs; remaining literals belong to kept-record, completion and observation stories |
| 7 | A record actually produced by a launch, start or recovery stays as evidence from that operation. It is not arranged as fixture data. | slice 2 | observed: live records from startCursorExecution/launchSecondHeldSession kept in scope-continuation, recovery, recovery-stops (missing workspace injection) and replacement specs; rewriteKeptCursor unchanged |
| 8 | These keep their existing proof roles: | slice 4 | observed: rows 8.1-8.5 observed in slices 1-3; heldSessionsAnswer precondition unchanged in slice 4 |
| 8.1 | fake hosts | slice 1 | observed: fakeCodex/observed/passive unchanged; agent-terminal-codex.spec.ts real launch cases pass (slice 1 selection 22 passed) |
| 8.2 | real runner operations | slice 3 | observed: keepWorkingClient literal cursor-agent keep command, execOnRunner, stand-in runners, stopCursorRunner unchanged; runner specs attaches().at(-1)?.sessionId and buildId assertions pass |
| 8.3 | terminal frames | slice 3 | observed: joined-sockets-replay.spec.ts literal frame lists unchanged; bridgedProofTerminal output unchanged |
| 8.4 | process control | slice 2 | observed: hangup, stale runner proof, occupyRunner and stopCursorRunner unchanged; Cursor slice selection passed |
| 8.5 | faults | slice 2 | observed: setAttachMode faults and recovery-stops missing workspace injection unchanged; Cursor slice selection passed |
| 9 | These stay visible in the cases that verify how they are handled: | slice 1 | observed: launch-record-session-rules.spec.ts literal predecessor, refused deletions and alias inputs kept at call site |
| 9.1 | exact predecessor omissions | slice 1 | observed: launch-record-session-rules.spec.ts "accepts a predecessor Codex session without a continuation" literal input; observation-workspace delete legacy.session.continuation |
| 9.2 | malformed input | slice 1 | observed: launch-record-session-rules.spec.ts refused(...) cases without alias or endpoint |
| 9.3 | extraneous aliases | slice 1 | observed: launch-record-session-rules.spec.ts {...claude, continuation} and "a parsed Codex session carries no Claude alias" |
| 10 | These expectations stay independent of fixture construction: | slice 4 | observed: rows 10.1-10.3 observed in slices 2-4 |
| 10.1 | command expectations | slice 2 | observed: literal resumed?.args / attached?.args / continuation.args expectations in scope-continuation, replacement, recovery-restart and agent-terminal-cursor specs do not use the builder |
| 10.2 | identity expectations | slice 4 | observed: answerCrowd parses continuation.args after --resume and expects toBe(row.sessionId), distinct UUID set size = crowd; independent of the builder |
| 10.3 | terminal expectations | slice 3 | observed: literal frame arrays, held row sessionId toBe, diagnostic head/tail/budget and continuationInstruction expectations do not use the builder |
| 11 | Synthetic sessions whose resume arguments name a different conversation from their stored identity are corrected. | slice 4 | observed: answerCrowd rows previously resumed the held UUID; break check restoring old args failed runningCursorSessionsPage.ts resume-vs-UUID assertion; frontend heldRecord ["agent","resume"] replaced |
| 12 | In mixed cases, this story owns the continuation or terminal facts needed to exercise operations that other stories own. | slice 1 | observed: agent-terminal-codex.spec.ts failed-exit case: other-host session via makeMe.aHostSession.claude; produced record doneAt rewrite unchanged |
| 13 | Example 1: a kept Codex thread has a saved endpoint and workspace. Opening its terminal resumes that thread with the saved endpoint and working directory. | slice 1 | observed: agent-launch-codex-startup.spec.ts "saved Codex conversation reconnects after daemon loss at startup": codexAttaches toMatchObject cwd=workspace, args resume --remote endpoint --cd workspace; break check on endpoint failed it |
| 14 | Example 1: a schema case that supplies a predecessor record with no continuation, or with an extra Claude alias, still observes the current decoding behavior. | slice 1 | observed: launch-record-session-rules.spec.ts predecessor and Claude-alias cases pass with exact inputs |
| 15 | Example 2: a kept Cursor session has a saved model configuration scope. Recovering it resumes the saved UUID in its workspace with that scope. | slice 2 | observed: cursor-session-scope-continuation.spec.ts Recover through recorded scope with literal --workspace <ws> --resume <uuid>; cursor-runner-replacement.spec.ts expectContinuationThroughScope |
| 16 | Example 2: when a replacement runner considers several kept sessions, it revives the eligible one. The existing controls still distinguish finished, never-held and failed revivals. | slice 2 | observed: cursor-runner-replacement-controls.spec.ts: doneSessionId/failSessionId, missingWorkspace and launchedAt/markedDoneAt visible; Recover, Recently done and attach assertions pass; markedDoneAt break check failed the Recently done count |
| 17 | Example 3: a terminal joins an already held Cursor session. The saved session identifies the conversation. | slice 3 | observed: cursor-runner-build-proof.spec.ts terminal bridge joins a held client on a stale runner but resumes a not-held session: break check ignoring sessionId failed it and cursor-runner-last-held |
| 18 | Example 3: the terminal assertions still observe the session's replay before queued live output. | slice 3 | observed: joined-sockets-replay.spec.ts frame order readiness, replay, held screen, live update toEqual |
| 19 | Example 4: a sidebar test arranges enough held Cursor sessions to overflow the list. Each row's UUID and resume arguments refer to the same conversation. | slice 4 | observed: answerCrowd asserts 30 distinct UUIDs each resumed by its own args before the route; cursor-sessions-sidebar-layout/resize/room specs see heldRows count = crowd (37 passed) |
| 20 | Example 4: the test still observes that both lists can reach their last entries. | slice 4 | observed: expectLastInReach and wheelToEnd in cursor-sessions-sidebar layout, resize and recently-done room specs pass unchanged |
