# Inbound native route reassessment

Supporting record of [plan 299](PLAN.md), native slice 2. Terry said “go ahead”
after independent G21 delivery. All required native forms remain; this pass
first investigates enrollment/queues without repeating the refused resume paths
or resetting exhausted native budgets. Documentation is candidate evidence,
not a native acceptance pass. Production guidance/runtime remain unchanged.

## Claude: session-owned channel prerequisite

Current official channels guidance permits Team/Enterprise managed
`allowedChannelPlugins` to approve an internal marketplace plugin, with
`channelsEnabled: true`. This differs from the development bypass rejected by
the earlier route. A channel is still a per-session startup opt-in through
`--channels`; no supported retrofit of an already-open ordinary CLI was found.
Ordinary inbound events and permission verdicts are distinct notifications.
The channel contract has no native acknowledgment; transcript reconciliation
remains necessary. Existing background flag propagation, approval/input holding,
draft preservation and child identity are unproved. A closed session receives
no channel event; channels alone do not cover exited standalone continuation.

Primary sources: [channels](https://code.claude.com/docs/en/channels),
[channel contract](https://code.claude.com/docs/en/channels-reference),
[official fakechat source](https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/external_plugins/fakechat/server.ts).
Fakechat is a cheap approved local observation vehicle; its lack of auth,
durable history and delivery reconciliation prevents calling it the production
contract. No channel was activated, no settings changed, and no model dispatched.
Owned `claude remote-control --help` printed help but stayed alive; exact PID
`19259` was verified and ended, session `75066` exited 143, PID absent.
No shared session/supervisor or observer was stopped by this investigation.

## Claude: native async idle wakeup

A subsequent documented asyncRewake candidate passed original live foreground
and controlled background idle wakeup. Foreground unsent draft and original
context/model/cwd/default/manual policy were preserved. [Exact evidence](CLAUDE-ASYNC-FEASIBILITY.md)
retains native feedback/message IDs, original checker errors, separate read-only
reconciliation, cleanup and five actual turns across six retained reservations.
A protected-prompt preparation stopped from inspected checker errors before
any protected request or failure. [Retained errors and bounded continuation](CLAUDE-PROTECTED-FEASIBILITY.md)
retain that one enrollment. Corrected permission P2 passed native hold, actor
decline and subsequent original-policy ACK. Q5 also held a genuine question
then delivered after actor Alpha, with original policy. Stage actual/reserved
10/10 plus one retained local zero-usage row. [Original foreground busy and
parent/child isolation](CLAUDE-LIVE-FEASIBILITY.md) subsequently passed, separate
3/3 and 4/6 stages; original errors and actual child completion are retained.

## Codex desktop: original queue delivery

Original-thread idle delivery, human-confirmed idle draft preservation and
busy-to-completed-boundary delivery passed under unchanged native policy.
[Exact commands, timestamps, IDs, ledgers and cleanup](CODEX-DESKTOP-FEASIBILITY.md)
retain candidate research and episodes. Busy allowance is 2/2;
old 16/16 and idle extra 1/1 remain. C2 app-consent wait/decline/ACK passed,
separate 2/2 turns, with human-confirmed unchanged draft. [Declared native Plan
blocking input](CODEX-DESKTOP-INPUT-FEASIBILITY.md) also passed, separate 2/2 turns;
child safety was subsequently proved by [bounded D1](CODEX-DESKTOP-CHILD-FEASIBILITY.md).
A fresh original-thread inventory read on 2026-10-13
JST returned thread-not-found for both MCP status and experimental features;
the unloaded control connection supplies no original-writer tool capability.

## Cursor IDE: conversation-owned MCP App candidate

[Cursor MCP documentation](https://cursor.com/docs/mcp) supports MCP Apps.
The official extension distinguishes followup-triggering
[`App.sendMessage`](https://apps.extensions.modelcontextprotocol.io/api/classes/app.App.html#sendMessage)
(`ui/message`) from context updates that wait for another turn. Its
[host context](https://apps.extensions.modelcontextprotocol.io/api/interfaces/app.McpUiHostContext.html)
exposes neither canonical conversation ID nor busy/approval/input state.
Capability, consent, view lifetime, native binding and safety need actual proof;
no CLI support is inferred from an IDE App.

Private prefix:
`/tmp/dough-bg-native-E886R8/cursor-mcp-app-prefix-bvz91hxt/`.
Its README, proposed configuration and readiness result retain the exact setup.
Real stdio tool/resource metadata and bundled official App/PostMessageTransport
completed an official AppBridge handshake under a synthetic host. Disarmed
failure/pending/success stayed silent; explicit test-actor release emitted one
stable-token `ui/message`. These assertions prove the harness, not Cursor.
Build, readiness and syntax commands exited 0; owned server PID `50652` exited
and endpoint closed. Repository lockfile hash stayed unchanged.

Native enrollment spent one authorized attempt: Cursor is now 12/16, four
remain. The original IDE conversation retained its workspace, Grok 4.7 model
configuration, Agent mode and observed current native UI policy: Run Everything
(Unsandboxed), Steer for new messages, Interrupt for manual queued messages,
and automatic mode transitions off. This is a current UI baseline, not deeper
historical policy proof. Original native request `31c8ee1f-73cd-45c9-8e21-298dbf1b143e`,
tool bubble `95e3d57f-251b-4645-94b6-0d0ae7201469` and final
`CURSOR_MCP_APP_ENROLLED_E886R8` bind the observed tool invocation to the original
conversation. Its real App rendered after native tool-group expansion.

Actual handshake identified Cursor 3.24.12 and advertised openLinks,
serverTools, serverResources, logging and sandbox, but no `message` capability.
The App recorded unsupported-capability-stop. No `ui/message`, failure event
or release occurred. Official Cursor docs did not establish a per-App message
opt-in. This candidate fails its cheap native capability gate on this install;
UI rendering does not establish background wakeup.

Exact `UNSENT_CURSOR_IDE_COMPOSER_E886R8` was restored and confirmed in native
AX. Restoration is fixture-actor setup, not external-delivery preservation proof.
The project-only MCP entry was disabled, then removed with the newly created
empty `.cursor` directory. Owned server PID `62848` exited through `stdio-end`,
no signal; port `62168` closed. Cleanup command `node <prefix>/native-cleanup.mjs`
exited 0. Original conversation/draft remain; no global or production setting
changed. Exact handshake, enrollment and cleanup receipts are respectively
`native-handshake.json`, `native-enrollment-receipt.json` and
`native-cleanup-receipt.json` in the private prefix. All owned prefix commands
and servers ended. That candidate did not prove IDE wakeup. A later public stop-hook episode
passed original idle continuation with preserved draft/model/policy and an
actually ended native setup while its hook remained pending. [Exact native proof
and safety limits](CURSOR-IDE-FEASIBILITY.md) retain two additional turns and
cleanup. Busy/approval/input/race safety remains open.

## G11: isolated native sandbox socket comparison

Literal probe: `node /tmp/dough-g11-permission-ot8jtizl/probe.mjs` exited 0;
owned command session `79836` reached terminal cleanup. Private fake `gh`
answered workflow 7001, with no real GitHub or model request. Prewarming the
real production request owner outside the sandbox produced the workflow answer.
The public native permission catalogue listed `:read-only`, `:workspace` and
`:danger-full-access`. Two commands used `codex sandbox --permission-profile
:workspace --cd <private-project>` and the same Node primitive/socket/diagnostic:

- Default profile: Node Unix socket connect returned `EPERM`, syscall `connect`.
- With explicit `--allow-unix-socket <private-owner-root>`: connect succeeded;
  the real production diagnostic returned workflow 7001 through that owner.

Both native command exits were 0 with the distinguishing JSON observation.
The explicit exception changes permissions, so this is a diagnostic comparison,
not a pass under the original unchanged restricted conversation policy. It
supports an OS socket-authorization cause; original native G11 remains open.
All private request owners ended through their fixture lifecycle before removal.
The receipt and fake request log remain in the probe folder's `result.json`.
An earlier cheap prefix using legacy `--sandbox workspace-write` was refused
before primitive execution because this CLI requires a named permission profile;
the public catalogue identified the corrected input. No failed setup is counted
as product behavior. No user or original native session policy was changed.

A later [approval-bound original CLI episode](CODEX-CLI-DIAGNOSTIC-FEASIBILITY.md)
passed through one-time accept under existing on-request policy, retaining
restrictive defaults/full permission profile. Default socket access/autonomous
bootstrap remain unproved; the EPERM comparison is not reversed.

## Cursor CLI: restrictive continuation

Original-ID interactive resume accepted one failure after prior process exit
under unchanged allowlist and Auto selection. A fresh live episode also held
failure through permission/feedback, then delivered at true idle under unchanged
policy. The distinct native question setup returned no picker and sent no failure.
Original Cursor ledger is 16/16; contingent extra is 0/1, unused. [Detailed proof and limits](CURSOR-RESTRICTIVE-FEASIBILITY.md)
retain both native episodes, actual signals and exact cleanup.

## Current boundary

Native G23 stays open; G25 has inspected original-thread delivery proof.
Codex desktop app-consent and declared Plan-input hold/actor/ACK, unchanged draft
and child isolation passed. Changed-connection policy safety, Cursor IDE busy/protected-wait/race safety, distinct blocking question
handling and remaining applicable child isolation are unproved. Claude foreground
idle/busy/permission/question/parent-child boundaries passed; installed filtering/enrollment and
full native acceptance remain later work. Required forms are not removed.

## Current-policy read prefix

A bounded unpaid prefix inspected saved regular/experimental/desktop protocol
and made one public thread/read of the original desktop with includeTurns false.
Schemas declare thread/settings/update but no settings read; config/read takes
cwd/includeLayers, not a thread ID. The actual original-thread read returned
notLoaded, canAcceptDirectInput/environments null and persisted model/effort.
Approval/reviewer/sandbox/profile/mode fields were absent. Persisted metadata
or control-process defaults cannot prove the original writer's current UI policy.

Receipt: `/tmp/dough-bg-native-E886R8/codex-current-policy-read-1791845379967.json`.
Root inspected the whitelisted response and method declarations. No config
read, load/resume/start/settings update, native input, private IPC/DB fallback,
UI or process change occurred. This leaves the current-policy fresh-connection
prerequisite missing; another paid turn or user UI change is not justified by
this API. Existing same-writer desktop queue proof remains accepted.
