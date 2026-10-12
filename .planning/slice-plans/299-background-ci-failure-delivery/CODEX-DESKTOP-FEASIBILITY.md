# Original Codex desktop delivery feasibility

Supporting record of [plan 299](PLAN.md), native slice 2. This record owns
observations, not status or execution authority. All required forms remain.

## Codex desktop: persisted queue candidate

Generated desktop protocol declares `thread/queue/add`, `list`, `changed`,
`start` and `delete`. Add accepts exact `threadId`, `clientUserMessageId` and
native user input, returning a queued submission. Neither schema nor fetched
[App Server documentation](https://learn.chatgpt.com/docs/app-server) establishes
automatic consumption by an original writer in another process. Queue visibility
alone is not wakeup. [MCP Events](https://developers.openai.com/plugins/build/mcp-events)
documents Work web/Desktop Cloud and dots, not this local desktop writer.

Read-only native inspection of original thread
`01a12d43-026b-7880-a6fa-ba846ce9f278`: absent from managed
`thread/loaded/list`, empty persisted `thread/queue/list`, same original native
history/context. Connections closed; no queue mutation or model input sent.
Receipts and distilled research:
`/tmp/dough-bg-native-E886R8/logs/codex-desktop-public-route-read.json` and
`codex-desktop-public-route-reassessment.md` in that log directory.

Prepared single-queue observation:
`/tmp/dough-bg-native-E886R8/codex-desktop-queue-probe.mjs`.
`node --check` and its `inspect` mode exited 0. Inspect verified one original
context, original desktop version `0.162.0-alpha.17.2`, queue length zero and
`loadedHere: false`; model dispatch count zero. Send mode requires an explicit
one-dispatch/one-model-turn authority record and durably keeps intent before
calling `queue/add`. It never calls external `queue/start` or `resume`, takes
over no writer, reconciles the unique token, and withdraws only its own still
queued submission. Prior Codex 16/16 and the earlier desktop refused attempt
are retained unchanged. A one-test extension was required before dispatch.
Unsent desktop draft observation remains human-owned; no UI control was bypassed.

Terry subsequently said “Ready—one extra Codex test approved.” Authority is
retained at `/tmp/dough-bg-native-E886R8/desktop-queue-authority-20261012.json`.
Literal command: `node /tmp/dough-bg-native-E886R8/codex-desktop-queue-probe.mjs
send /tmp/dough-bg-native-E886R8/desktop-queue-authority-20261012.json`.
One `thread/queue/add` accepted submission `01a12ea7-f67a-74a0-ad77-7d7c46d6b16f`
at 05:48:41.978 UTC. Original desktop thread automatically started native turn
`01a12ea8-15f6-7a03-bfd8-6583364583bf` with `turn_trigger: queue` at
05:48:50.045, completing at 05:48:54.453 with
`CODEX_DESKTOP_READY_E886R8 CODEX_DESKTOP_QUEUE_FAILURE_E886R8 ACK`.

The checker exited 1 because it expected `event_msg/user_message`; this desktop
records user input as `response_item/message`. That assertion was a harness
error, not failed native delivery. No input was resent. Read-only reconciliation
`node /tmp/dough-bg-native-E886R8/codex-desktop-queue-reconcile.mjs` exited 0.
Both the original rollout and public `thread/read` show exactly one new user
message and completed response, no tools, and two total native contexts. Cwd,
model (`gpt-6.1-sol`), effort (`high`), approval policy (`on-request`), reviewer,
sandbox (`workspace-write`) and permission profile equal the original context.
The queue is empty; no external queue start, resume or writer takeover occurred.
The original checker result is retained separately from the reconciliation
receipt in `logs/codex-desktop-queue-result.json` and
`logs/codex-desktop-queue-reconciliation.json`. Ledger holds one intent/add;
the separate extra allowance is now 1/1, with the old 16/16 ledger unchanged.

This proves the original desktop's idle continuation endpoint (G25). Native
notification and ACK visibility are also confirmed: Terry pasted both from
the test conversation, with displayed time 2:48 PM. The private human receipt
is `logs/codex-desktop-human-observation.json`. Terry subsequently said
“Draft unchanged”, confirming idle-delivery draft preservation. Desktop busy, approval/input safety and installed
runtime integration are not established by this one turn.

### Busy delivery under delegated authority

Terry said “i authorize you to decide and run them.” A separate authority at
`/tmp/dough-bg-native-E886R8/desktop-busy-queue-authority.json` bounded this
fresh episode to two dispatches/two native turns; old 16/16 and extra 1/1
remain exhausted. Parent inspected the private producer, probe and guard.
Literal command: `node /tmp/dough-bg-native-E886R8/codex-desktop-busy-queue-probe.mjs
send /tmp/dough-bg-native-E886R8/desktop-busy-queue-authority.json`.
Command session `58578` terminated, exit 0.

Setup queue ID `01a12eec-02a6-7fb3-bc96-4fc7204d75a5` was accepted at
07:03:01.543 UTC; original native turn `01a12eec-23d7-7852-a611-d16ddd385cb3`
started at 07:03:10.051 with queue trigger. That native turn launched the owned
bounded producer PID `16402`; its marker plus unmatched native task and exact
setup input proved busy. The parent never launched that producer itself.
Failure queue ID `01a12eec-4c31-7890-afd3-af681ac4aecb` was accepted while
that task remained active at 07:03:20.370; the actor released only its private
producer at 07:03:20.372. Setup completed at 07:03:28.028 with
`CODEX_DESKTOP_BUSY_SETUP_E886R8_B1 DONE`.

Native failure turn `01a12eec-6a1c-7380-b9b1-f754f3569d1b` started at
07:03:28.037, nine milliseconds after setup completed, with queue trigger.
It completed at 07:03:37.084 with
`CODEX_DESKTOP_READY_E886R8 CODEX_DESKTOP_BUSY_QUEUE_FAILURE_E886R8_B1 ACK`.
Parent inspected actual native task timestamps, result, ledger and cleanup;
read-only `node /tmp/dough-bg-native-E886R8/codex-desktop-busy-queue-reconcile.mjs`
also exited 0. Exactly two new native contexts and completed public turns,
one failure input and ACK; native/public history agree. Original ID, cwd,
model, effort, approval/reviewer, sandbox and permission profile stay equal.

Private `logs/codex-desktop-busy-queue-result.json` and
`desktop-busy-queue-ledger.jsonl` retain receipt/intents/cleanup. Producer exit
was observed and PID absent; native queue is empty. No approval/input response,
shared-process signal, external queue start/resume or writer takeover occurred.
New busy allowance is 2/2, separate from earlier ledgers. Terry subsequently
confirmed “Draft unchanged; I’m watching now.” Desktop approval/input and applicable
coordinator/child safety, lost acknowledgment and runtime integration remain open.

## Unpaid protected-wait capability prefix

Private prefix `/tmp/dough-codex-protected-prefix-syrYdy/` retains generated
public 0.162.1 protocol, passive `inspect.mjs`, `receipt.json` and exact commands
in `README.md`. Schema generation, syntax and `node <prefix>/inspect.mjs inspect`
exited 0. Parent inspected actual inspector source and receipt. Original four
native contexts completed with unchanged policy and empty queue. The managed
control instance reports notLoaded/loaded-list absent and receives no original
writer callbacks; that is not evidence of original desktop wait state.

Fresh schema includes active waitingOnApproval/waitingOnUserInput flags and
server-initiated requestApproval/requestUserInput callbacks. It has no separate
thread subscribe, pending-callback-list or callback-response client method.
Read/list access does not establish callback ownership. No fake response,
resume/start, writer takeover, composer touch or model input occurred; socket
closed, zero native mutations and no retained owned native process.

Original on-request/auto_review makes harmless ordinary shell operations
promptless or reviewer-evaluated, not a deterministic human picker. Forcing a
risky command or changing policy is outside the fixture. Official
[automatic review documentation](https://learn.chatgpt.com/docs/sandboxing/auto-review#when-it-triggers)
distinguishes Computer Use app consent as still user-facing. A harmless app read
is only a candidate, needing actual native tool/picker and uncached permission;
Codex control remains excluded after its refusal. No such app probe was run.
Default-mode blocking input is unproved; a declared Plan fixture could test a
distinct capability, without replacing this original conversation or proof.

A future original-desktop wait episode needs the actor's actual picker
observation, holding it unanswered through failure queue acceptance and resolving
only the owned fixture afterward. Public notLoaded or an unsent composer cannot
supply that prerequisite. This prefix leaves all native G23 wait promises open;
old 16/16, extra 1/1 and busy 2/2 ledgers remain unchanged.

## Watched app-consent episodes

Terry confirmed the busy draft unchanged and actual actor availability:
“Draft unchanged; I’m watching now.” Private human receipt:
`logs/codex-desktop-busy-human-observation-20261012.json`. No composer access
or UI-control bypass was used. Original baseline contained four completed turns.

Delegated C1 selected a separate two-dispatch/two-native-turn allowance and one
read-only Computer Use call. Private prefix:
`/tmp/dough-bg-native-E886R8/codex-desktop-permission-C1/`.
Syntax and inspect exited 0 before one setup queue add
01a1301a-cb59-7b93-ad6c-1e7a39d51b2e. Original turn
01a1301a-e04b-7ec0-b57d-689430f1e390 started at 12:33:50.164 UTC.
Native Computer Use call call_7A5c9Nrru7GxKvBlHZHBbKee selected Calculator
with exactly await cua.getApp("Calculator"); at 12:33:58.436.

The initial detector missed the rollout's unqualified function name js; parent
inspected the actual call and corrected only that metadata guard. No input was
replayed. Calculator returned successfully at 12:35:11.831, with native MCP
status completed/error null; setup DONE followed at 12:35:20.320. Terry then
reported the dialog and clarified “I missed it” / “I approved it.” No failure
was queued and no protected hold is accepted. Read-only reconciliation exited
0: one new completed native turn, unchanged original policy, no own queue item.
C1 actual/reserved is 1/2; old budgets remain. Its native permission was actor-approved,
not an automatic-review rejection or a coordinator answer.

A distinct C2 selects installed Chess for one fresh read-only consent request;
Calculator access is not reset or reused to manufacture a picker. Separate cap
two dispatches/two native turns/one Computer Use call, baseline five. Private
`codex-desktop-permission-C2/` retains syntax/inspection, fresh authority and
one setup intent/add. Actor was instructed to leave Chess unanswered until
the coordinator says Decline now. No failure dispatch is permitted without
fresh actual dialog confirmation plus matching original pending tool/policy.

C2 setup queue 01a13024-2ec0-7261-81f6-9dc63beab43f was consumed by original
turn 01a13024-2f19-7d51-a752-7c395caca032. Native js call
call_fMEJPCPUnVwvDVOfJ48eVNm2 at 12:44:07.788 UTC requests only Chess.
Latest read-only receipt retains six unchanged native contexts, that unmatched
task/tool call with no result, no setup completion/failure reply and empty queue.
The store-reading control's interrupted status does not prove writer wait state;
actual unanswered-dialog confirmation remains pending. C2 actual/reserved 1/2,
no failure dispatched. Its existing request/prefix is intentionally retained
for the actor handoff; no new setup or permission reset is needed on continuation.

Terry confirmed “Chess dialog open” on continuation. Fresh native inspection
matched the original still-unreturned Chess call and unchanged six contexts.
One failure queue add 01a13036-76ef-7603-836c-cd1b038bec12 was accepted at
13:03:58.191 UTC. Eight-second hold completed at 13:04:06.379: original tool
unreturned, same active task/policy, no new native context/failure reply and own
failure still queued. No callback answer or external start/resume occurred.
Only then was Terry instructed to decline the Chess fixture permission and
leave the draft unsent. Terry subsequently confirmed “Chess declined; draft unchanged.”
Native tool returned “Computer Use was not approved to use Chess” at
21:38:04.808 UTC. Setup completed at 21:38:08.074; failure turn
01a1320d-324d-7d23-b4b9-c14ce2cec685 started thirteen milliseconds later,
then completed at 21:38:11.469 with one exact READY/failure/ACK response.
Read-only reconciliation exited 0: seven original-policy contexts, no active
task or queued item, one setup input and one failure input/ACK. No replay,
callback response, external start/resume or shared signal occurred.
Private final-receipt.json retains native ordering and human confirmation.
C2 actual/reserved turns and dispatches are 2/2; one Computer Use call.
This passes original desktop app-consent hold/decline/delivery/draft safety;
blocking structured input and applicable parent/child isolation remain separate.

A read-only requirement review confirms a declared native Plan-mode episode
in this same disposable desktop thread can cover the distinct blocking-input
mechanism: the story preserves recipient/workspace/permissions, not a static
collaboration mode. Default optional questions cannot prove a blocking hold.
This candidate retains the accepted Default evidence and requires actual native
Plan selection plus unchanged draft/model/policy before two bounded queued turns.
[Official Plan toggle guidance](https://learn.chatgpt.com/guides/best-practices)
describes Shift+Tab or /plan; availability here still requires actor observation.
No mode/policy change or Plan model input has occurred.

[D1 parent/child isolation](CODEX-DESKTOP-CHILD-FEASIBILITY.md) subsequently
passed under unchanged original settings; Terry also confirms its draft unchanged.

Prepared P1 prefix: `/tmp/dough-bg-native-E886R8/codex-desktop-plan-question-P1-38eyzcv8/`.
Root reviewed source, actor receipts and separate two-turn/one-question cap.
Syntax check and root read-only inspect passed: nine completed original
contexts, full original policy and empty queue. P1 dispatch count remains zero;
actual human Plan selection/draft confirmation is pending. A later failure
requires a genuine unanswered native Alpha/Beta picker and actual Plan context.

Terry confirmed “Draft unchanged; Plan selected” and clarified Shift+Tab did
not work; actual selection used the native menu. This satisfies the UI
prerequisite without inferring shortcut support. One P1 setup queue
01a1322f-f594-7b72-9083-c270594be45a was accepted. Original native setup turn
01a13230-0532-73e3-8a85-31ad43fbaa8f has actual Plan context and unchanged
full model/workspace/permission policy. Native request_user_input call
call_gOmtKvWlUM2bhkBNGH0QKeSe at 22:16:20.217 UTC remains unreturned in
that active task. Actual visible picker/draft confirmation remains pending;
no failure dispatch occurred. Prior Default history remains unchanged.

Terry confirmed “Question open; draft unchanged.” Fresh native inspection
matched the same pending Plan question/task and full original policy. One
failure add 01a13236-55c1-72f3-b95b-ca7ec96485aa was accepted at
22:23:04.129 UTC. Eight-second hold passed at 22:23:12.246: no question result,
new context or failure reply, and failure still queued. Only then was the actor
instructed to choose Alpha in the fixture question and keep the draft unsent.
Actual Alpha result/subsequent original-turn ACK and draft confirmation remain
pending. Both dispatches are consumed; one native setup turn and one queued
failure turn, no callback answer or external resume/start. No resend.

P1 subsequently passed after actual Alpha resolution, exact subsequent failure
ACK and human-confirmed unchanged draft. [Definitive native input proof](CODEX-DESKTOP-INPUT-FEASIBILITY.md)
owns timestamps, complete policy inspection, separate 2/2 budget and cleanup.
