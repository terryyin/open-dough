# Original Cursor IDE stop-hook delivery

Supporting record of [plan 299](PLAN.md), native slice 2. This record owns
observations, not status or authority. Required forms remain unchanged.

## Native candidate and ordering

[Public hook guidance](https://cursor.com/docs/hooks) documents stop output
`followup_message`, command timeout and loop limits. Installed Cursor 3.24.12
source `/Applications/Cursor.app/Contents/Resources/app/out/vs/workbench/workbench.desktop.main.js`
supplies a concrete async lifecycle candidate: completion clears active
generation and marks completed, then invokes `triggerStopHook` without awaiting.
Native finish/settled callbacks proceed. That method awaits the hook result and
submits a returned followup to its captured exact composer ID, with skipClearInput
and skipFocusAfterSubmission. Parent inspected bounded source excerpts in
`/tmp/dough-bg-native-E886R8/cursor-hook-lifecycle-k9z9mj3m/candidate-parent-excerpt.json`.
Documentation/source is candidate evidence; native proof follows separately.

## Original idle delivery

Terry's delegated authority selected two new turns, separate from old Cursor
16/16 and contingent question extra 0/1. Private prefix:
`/tmp/dough-bg-native-E886R8/cursor-ide-stop-uggbleut/`.
Only a new private-project `.cursor/hooks.json` configured a public stop command,
timeout 90 seconds and loop_limit 1. Its own private wait deadline is 85 seconds.
Hook checks original conversation, completed status, loop 0 and a one-time claim;
external release binds both conversation and originating native generation.

The fixture actor temporarily replaced its own draft for harmless enrollment,
then restored `UNSENT_CURSOR_IDE_COMPOSER_E886R8`. Exact CUA commands, bound
to native observed elements, are retained in `literal-native-actions.json`.
Setup request `df8164c5-0427-4c6c-8f67-d1d6364b7d83` returned
`CURSOR_IDE_STOP_READY_E886R8` in original composer
`f6aa07f9-41c0-4abf-983b-1a280d7385a4`. Native AX showed worked/idle and restored
draft while hook PID `51342` remained gate-waiting from 07:46:50.439 UTC.

Read-only original native data at 07:47:09.525 confirmed completed, no active
generation/action manager/queue/plan, same modelConfig and Agent mode. Fresh
native precondition check preceded external gate release at 07:47:51. No failure
was typed into the native composer. Automatic request
`c27ad29d-fee5-4a2d-bd2e-6bf615f2a38a`, human bubble
`01d260f9-3904-4b1f-b51a-616fe86ae5fb`, appeared at 07:47:52.044. ACK bubble
`e982f319-a30b-4e2d-86f2-48572c99433e` returned
`ACK_CURSOR_IDE_STOP_FAILURE_E886R8` at 07:47:54.291 in that same composer.

Original Grok 4.7 High Fast modelConfig, Agent mode and canonical private cwd
were preserved. Actual AX draft remained unchanged after automatic delivery.
Native before/after UI policy matched: Run Everything (Unsandboxed), new messages
Steer, manual queued messages Interrupt, automatic transitions off. Parent
inspected hook source, native ID/message receipts and actual cleanup. Exactly
two new inputs/turns and no tools; old ledgers unchanged.

Owned hook completed its callback; exact command/PID absent, no signal. Its OS
exit code was not independently collected. Project config
and its newly created empty `.cursor` directory were removed. Original native
conversation/draft remain. `reconciliation.json`, native before/after records,
`cleanup-receipt.json` and removed config retain proof. Other processes/settings,
shared observer, repository and installed guidance were untouched.

## Protected-wait and race limit

Installed `triggerStopHook` has no generation/busy/wait/policy recheck after its
await. Its followup path lacks the separate background-submit preserve-draft
guard. Native QUEUING logic with a blocking decision and empty queue returns
shouldStop false. `abortChatAndWaitForFinish` occurs before public
beforeSubmitPrompt, so that later hook veto cannot prevent an initiated abort.
Bounded source ordering/timeout/queue excerpts remain in the lifecycle prefix.

This accepts original IDE idle wakeup, nonblocking setup boundary and observed
draft/model/policy preservation. Busy/stale generation, permission/input hold,
child isolation, lost ACK, policy-drift hold and error-path draft safety remain
unproved. The native idle pass does not establish a safe general hook-only port,
complete slice 2, or implement installed delivery.

## Read-only MCP Tasks and native dispatcher prefix

A later five-minute disposable prefix made no native/model/UI/config/process
changes. Parent inspected the decisive installed 3.24.12 source excerpts;
private `/tmp/dough-bg-native-E886R8/cursor-background-admission-psz67upp/source-excerpts.json`
retains them. These are source/candidate facts, not another native acceptance.

Installed `extensions/cursor-mcp/dist/main.js` application getTools around
character 926243 maps tool metadata without `execution`. Application callTool
around 927032 and callToolForUI around 935428 await ordinary client.callTool
with name, arguments and progress metadata; neither supplies task augmentation.
The SDK's ordinary callTool around 738499 rejects required-task tools and
directs callers to its task stream. That stream has no application caller in
the examined installed bundle. Bundled task schemas do not establish an IDE
nonblocking task/late-wakeup port. No paid Tasks trial is justified by this prefix.

The [MCP Tasks specification](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/tasks)
distinguishes server tools/call task support from client sampling/elicitation
support; absent client tasks alone is not disqualification. Saved App traces
did not retain an initialize request, so this judgment uses the actual consumer
paths, not inferred initialize capabilities. [Cursor's published MCP support](https://cursor.com/docs/mcp)
does not advertise Tasks in its capability table.

Native background-work machinery is present. Workbench completion admission
around character 30796545 checks owning workspace, isNAL, no live turn, no
blocking decision and no pending questionnaire. Existing original-conversation
receipts report isNAL true. Ordinary shell/subagent completions additionally
depend on long_running_jobs eligibility. But the completion caller around
30791968 supplies no beforeClaim recheck to _runWakeupAction around 30788104,
which awaits provider/setup, secret hydration and model details before claiming
generation. Ordinary submission cancels its completion abort controller;
that alone does not establish atomic plan/decision protection.

The installed private enqueueBackgroundWakeup route and host-owned task
machinery are not a supported generic extension port. [Public extension APIs](https://cursor.com/docs/extension-api)
document MCP/plugin registration, not that wakeup entry point. The private
trySubmitBackgroundMessage helper has no examined desktop caller;
_internalPreserveDraft protects restoration/context while clearText separately
depends on skipClearInput. Neither establishes supported admission safety.
No private API, IPC, installed-source mutation or draft-flag workaround was used.
A built-in passive shell completion remains only a candidate pending public
bootstrap and admission proof; no such native episode has been dispatched.

## Bounded built-in shell prefix

A final four-minute unpaid prefix established model-facing Shell bootstrap:
agent-host schema around character 2240784 describes block_until_ms 0 for
immediate background execution. Actual exposure depends on enableBlockUntilMs,
whose value for the original model was not established. Parent inspected those
definitions and completion code; `shell-prefix.json` in the same private prefix
retains excerpts. This supports a candidate nonblocking start, not a native pass.

Native guidance around 2221550 separates completion notifications from
notify_on_output matches. enqueueShellCompletion around 7091394 computes success,
error or aborted status and enqueues each terminal result. No supported schema
argument suppresses successful/expired completion. A finite failure-only waiter
therefore has no established quiet-success/silent-expiry behavior on this path.

Completion admission contains no hasPendingPlan or queueItems check. Pending-plan
registry synchronization can update independently of ordinary backend submission;
its cancellation path does not supply the missing guard. Decision snapshots can
also update independently. A decision becoming active during awaited completion
preparation is a source-inferred race, not a reproduced native interruption.
Current long_running_jobs eligibility remains unverified. This prefix justifies
no paid native shell trial: quiet-success/silent-expiry and protected-plan/final
decision admission are prerequisites. No native/UI/config/process or observer
mutation occurred, and no original-conversation input was submitted.

## Public Queue-setting guard review

A later bounded read-only review falsified switching New Messages to Queue as
a safe general stop-followup solution. The public stop callback does enter
ordinary native QUEUING: start-submit-chat capabilities can stop submission
before generation claim/abort. It does not unconditionally bypass that queue.
However, a blocking decision/questionnaire with an empty queue returns
shouldStop false before the generating branch, independently of the setting.
Ordinary busy queue capture also clears text/richText/editing/context unless
_internalPreserveDraft is supplied. triggerStopHook supplies skipClearInput and
skipFocusAfterSubmission, which do not suppress this earlier queue clearing.
An admitted submission still reaches abort before public beforeSubmitPrompt.

Installed 3.24.12 source locations: triggerStopHook 18613309; capability return
18622124/18635412; QUEUING 30473922–30475371; clearInputAfterQueueCapture
30489263; abort/hook ordering 18658471/18661549. Public queue behavior is
configurable; [Agent queued messages](https://cursor.com/docs/agent/overview#queued-messages)
and [hooks](https://cursor.com/docs/hooks) document those surfaces, without
establishing protected-wait or draft-preserving stop followups. These are source
facts and predicted failures, not newly reproduced native failures. No paid
Queue trial is justified; final admission and preserved queue capture remain
missing prerequisites. No native/UI/config/process/Git/observer change occurred.
