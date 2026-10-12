# Resumed native feasibility and desktop follow-up

Supporting record for [plan 299](PLAN.md); slice status and current execution
ownership remain in that plan. This record grants no execution authority.

#### Resumed native feasibility after accepted direction (2026-10-12)

Terry accepted the recommendations and authorized proceeding with the bounded
native checks and necessary fixture actions. No additional general permission
is needed. Every required native form remains in scope. A permission grant
does not establish an unavailable native route or waive policy preservation.
This pass changes evidence, not source guidance or shipping behavior.

Claude Code `2.1.296` evidence is retained at
`/tmp/dough-claude-native-20261012-F4Q8/`: seven dispatch attempts, five actual
model turns, cost `$0.01128011`. Two attempts failed before a model turn;
the private startup readiness predicate was corrected after observing that
fixture setup race. No product helper or credentials were changed.

| Required route / question | Native observation and limit |
| --- | --- |
| Claude exited ordinary interactive CLI | Session `1b6c0f22-7e19-417c-8eb2-205c968f2ebc` exited through native `/exit`. `claude -p TEXT --resume ID --model haiku --output-format stream-json --verbose --permission-mode manual` continued that exact session, canonical fixture cwd, `claude-haiku-5-5` and native `default` permission mode (the manual alias). `CI_FAILURE_CLI_EXIT_F4Q8` occurs once; message `msg_011CfwDz5kKdTA2rVs2wQ2Am` returned the earlier context key and ACK. `logs/foreground-final-observations.json` maps native transcript lines. This addresses the earlier permission-mode drift for this explicit fixture mode, not arbitrary user rules. |
| Claude controlled unattached background stop/resume | Session `5ec006fa-243e-4489-8d5b-91c377bb556b`, short ID `5ec006fa`, was known idle and unattached by the owned fixture lifecycle. Native `claude stop 5ec006fa` exited 0, then `claude --bg --resume ID TEXT` with no extra option preserved its ID, cwd, saved model, name and mode. Token `CI_FAILURE_BG_F4Q8` occurs once; message `msg_011CfwE7cNWgEm5dPk2baGfS` returned its earlier context key and ACK. `logs/background-final-observations.json` retains the native signals. |
| Claude automatic unattached gate | While this same fixture was attached, native `/status` explicitly reported attached, but `claude agents --json --all --cwd DIR` exposed the same idle/done fields as the known unattached snapshot and no attachment flag. `logs/bg-attached-status.txt`, `bg-attached.json` and `bg-unattached-first.json` are a counterexample to using idle JSON as authorization to stop. No stop was attempted while attached. An automatic attachment gate and check/stop race remain unproved. |
| Claude still-open standalone CLI | Original interactive fixture PID `94742` remained idle with draft `UNSENT_COMPOSER_F4Q8`. Its `/status` exposed the original workspace, model and peer endpoint, while the scoped agent-view list showed zero sessions. The documented peek-panel path did not bind this foreground recipient. No supported external send route was established; no failure input or draft overwrite was attempted. Peer endpoint presence is not message acceptance. |

Claude's owned processes and command watches ended; `logs/cleanup-receipt.json`
contains exact PID absence, native stop exit 0 and terminal command receipts.
The shared supervisor and coordinator CI observer were preserved. The
controlled background route does not prove automatic safety, actual dashboard
enrollment, approval/input safety, lost-ack recovery or live standalone wakeup.

Additional Codex evidence remains under `/tmp/dough-bg-native-E886R8/`.
The Codex paid-attempt budget reached 16/16; no further paid Codex turn is
authorized by this bounded pass.

| Required route / question | Native observation and limit |
| --- | --- |
| Codex genuine approval and input waits | Private thread `01a12d06-942b-7cb1-89cc-3bcc0decfd63` established native command approval and `requestUserInput` requests. Steering while each was pending left `waitingOnApproval` / `waitingOnUserInput`; the sender answered neither request. Interrupt cleanup dropped the queued notice, so this first observation alone did not prove handled delivery. `codex-pending.mjs` and `logs/codex-pending-history.json` retain it. |
| Codex resolution by the fixture actor | `codex-pending-resolve.mjs` let the separate native fixture actor decline the harmless command and select `alpha`. Turns `01a12d08-ffdb-7672-a6d7-be72381bca4d` and `01a12d09-3729-7b00-8f7b-e8bed85a2bd4` then retained one failure token and its acknowledgment without the notification answering the request. Actual native context revealed that fresh-connection ID-only resume had changed the sandbox to full access. This proves the observed request separation, not restrictive-policy preservation on those turns. |
| Codex atomic policy binding candidate | Native `turn/start` with the original explicit `approvalPolicy` and `sandboxPolicy` preserved `untrusted`, workspace-write/network-disabled, original cwd/model and one accepted `CODEX_RESTRICTED_RESTORED_E886R8` on turn `01a12d0e-8cb4-7eb0-967b-b525f215c472`. `logs/codex-restored-turn-context.json` is effective native evidence. `thread/resume` sandbox options did not restore policy, and its config alternative was refused. Per-turn binding changes thread defaults; ambiguous intervening user choices require a hold, not silently restoring a stale snapshot. |
| Codex still-open restrictive standalone CLI | `node --experimental-transform-types --no-warnings /tmp/dough-bg-native-E886R8/codex-open-cli.mts` ended 0. Original native CLI thread `01a12d10-7493-7f90-8cbf-47327e1a9cfb` accepted the failure in turn `01a12d10-9f4b-79e0-966d-2d60ac411395` while draft `UNSENT_CODEX_CLI_COMPOSER_E886R8` remained intact. Actual original and continuation turn contexts preserved `on-request`, workspace-write/network-disabled, permission profile, `gpt-6.1-sol` and cwd. `logs/codex-open-cli-history.json`, raw PTY and native rollout `rollout-2026-10-12T07-23-35-01a12d10-7493-7f90-8cbf-47327e1a9cfb.jsonl` retain evidence. Its G11 shell command ended 1 with `gh did not answer: timed-out`; request-owner access did not pass. |
| Codex desktop fixture | Computer Use refused control of `com.openai.codex`. Terry created the disposable conversation and supplied `codex://threads/01a12d43-026b-7880-a6fa-ba846ce9f278`. Read-only native rollout and managed-daemon `thread/read` confirm `codex_work_desktop`, desktop version `0.162.0-alpha.17.2`, original READY prompt/response and canonical fixture workspace. Original context uses `gpt-6.1-sol` / high, `on-request`, `auto_review` and workspace-write/network-disabled with its visualization writable root. The actual recipient is identified; its live continuation endpoint remains unproved. Native resume was refused because the desktop already has an active writer; direct start was refused as thread not found. No arbitrary user thread or API-created substitute was selected. |

Cursor's actual runner transport resumed owned CLI chat
`8038544e-3d10-494b-846c-7aeeb925c686`. Separate WebSocket text and Enter
frames accepted `CURSOR_RUNNER_IDLE_E886R8`; the earlier coalesced frame
left text unsent and was a private harness issue. `cursor-runner-probe.mts`
held notice `CURSOR_DRAFT_HELD_E886R8` without typing over an unsent draft,
held `CURSOR_RUNNER_BUSY_E886R8` while work ran, and delivered it under the
original ID at the observed boundary. The native shell returned workflow
7001 / exit 0 through the private request owner. This fixture retained its
original unrestricted setting. `logs/cursor-runner.jsonl`, native stored
messages and final screen retain the observations. `cursor-runner-lost.mts`
then closed only the sender after delivery; the retained native client
continued, and reattachment reconciled `CURSOR_RUNNER_LOST_E886R8` without
resend. This is one observed lost-ack case, not a universal exactly-once claim.

The required Cursor IDE form was created in a separate native GUI window in
the same private project, without altering existing user windows. Its exact
native composer ID is `f6aa07f9-41c0-4abf-983b-1a280d7385a4`, verified against
read-only native `composerData`; the original `Grok 4.7 High Fast` response
acknowledged `CURSOR_IDE_READY_E886R8`. Native user request
`51b06602-543e-4e05-916d-2980d1d02afc` and assistant bubble
`69049cfd-f593-4621-a136-c37271da7228` retain that identity. Draft
`UNSENT_CURSOR_IDE_COMPOSER_E886R8` remained intact after route investigation.
ACP refused loading the exact ID; no-prompt CLI resume displayed an empty
Auto/Run Everything chat instead of its original IDE history and model.
No failure was sent through that false binding, and no IDE database was
edited. The IDE fixture is genuine; original-session external continuation
remains unproved. `cursor-ide-owned.json` and
`logs/cursor-ide-native-observations.md` retain the observations.

Cursor's private restrictive configuration left global user policy untouched.
Owned chat `c6cd4b62-09aa-4554-a244-8f9ed30ff7f4` produced a genuine native
`Not in allowlist: printf` approval request. The failure notice was held,
the request remained pending and its intended file remained absent. After
the native fixture actor selected `n`, the bounded observation did not
establish return to idle, so no failure was submitted. The first wait check
had missed the actual `esc or n` screen wording; a single corrected repeat
established that request but still failed the return-to-idle prerequisite.
`cursor-restrictive-wait.mts` ended 1; cleanup of the owned PTY ended exit 0 /
signal 1. This proves holding at the observed approval, not restrictive
post-wait/post-exit acceptance or explicit input-question handling.

Final shared ledger counts are Codex 16/16 and Cursor 11/16. Private daemon
PID `45306` was verified and terminated; command session `82793` ended 0.
Private request owner PID `87445` had already exited. Owned CLI/PTY commands
and watches ended. `logs/cleanup-resumed.json` retains cleanup evidence;
shared Codex daemon, Cursor runner and coordinator CI observer were preserved.
The native IDE fixture and evidence remain available for a capability decision.

Current G23 limits: Claude automatic unattached/race-safe background delivery
and still-open CLI; Codex desktop and policy-safe continuation across changed
native connection state; Cursor IDE, restrictive post-wait/post-exit acceptance
and explicit input-question handling; applicable coordinator/child isolation. Restrictive Codex
request-owner access remains unresolved under G11. Actual installed enrollment,
pending/success filtering and skill acceptance remain unperformed. Slice 2 is
still planned; missing required forms stay here, with no readiness renewal or
native acceptance claim and no dependent implementation.

Before renumbering, the installed `story-obligations.mjs check --plan PLAN.md --slice 1` refused
completion with `G23 / open-obligation`. This is an unmet native proof gate,
not missing general permission. The Taken claim, checkout, branch, uncommitted
evidence records and private fixtures remain. The original full required-form
scope is retained. Desktop fixture creation and manual draft setup are now
complete. Terry reported ready and clarified that the message was in the box
without being sent. `codex-desktop-probe.mjs inspect` ended 0 after verifying
the original history and full policy snapshot. The ordinary `deliver` attempt
ended 1 during `thread/resume`: `-32600`, `thread
01a12d43-026b-7880-a6fa-ba846ce9f278 already has an active writer`. It never
reached notice dispatch or consumed a model turn. This invalidates treating
readable saved desktop history, or this endpoint's `notLoaded` status, as a
verified live writer binding.

One direct `turn/start` tested whether that documented method reached the
existing writer without resume. `node
/tmp/dough-bg-native-E886R8/codex-desktop-probe.mjs deliver-direct` ended 1:
`-32600`, `thread not found: 01a12d43-026b-7880-a6fa-ba846ce9f278`.
The payload retained original cwd, model/effort, approval policy/reviewer and
complete sandbox roots; it was not accepted. Its separate ledger contains
one dispatch attempt and zero actual model turns; the preceding 16/16 Codex
budget was not reset. Read-only reconciliation found exactly the original
completed turn/context and zero failure-token rows. Native RPC records and
`logs/codex-desktop-refusal-result.json` retain evidence. Both sockets closed;
the desktop app and shared daemon were preserved.

Installed help, generated protocol schemas and official App Server transport
guidance did not establish another route to this desktop writer in the bounded
pass. No writer lock, desktop process or private stdio channel was taken over.
No successful desktop delivery, draft preservation under delivery, or installed
integration is claimed. No further manual fixture action is needed now. The
desktop continuation, Claude live-session/automatic stop and Cursor IDE route
gaps keep the full gate incomplete; required forms remain in scope.
