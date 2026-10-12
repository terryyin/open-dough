# Original Claude async wakeup feasibility

Supporting record of [plan 299](PLAN.md), native slice 2. This record owns
observations, not slice status or authority. Required forms remain unchanged.

## Candidate and prerequisites

The [official command hook reference](https://code.claude.com/docs/en/hooks#command-hook-fields)
documents `asyncRewake: true`: a background hook exiting 2 wakes an idle
session with native feedback. Ordinary async waits for another interaction;
print-mode teardown cancels outstanding hooks. Installed Claude 2.1.296 was
observed. Existing `ci-host-hook.mjs` and delivered Claude Stop/PostToolUse
assets select ready mailboxes synchronously; they do not implement this route.

Private prefix: `/tmp/dough-claude-native-20261012-F4Q8/async-rewake/`.
One temporary private project `.claude/settings.local.json` added only a Stop
command hook with asyncRewake, timeout 95 seconds and an 85-second private gate
deadline. First qualifying Stop claims its episode; subsequent Stops exit 0.
No global settings, channel, private IPC, permissions or production files changed.
Parent inspected hook source, native receipts and actual draft screen frames.

## Original foreground idle delivery and draft

Literal readiness: `node /tmp/dough-claude-native-20261012-F4Q8/async-rewake/foreground.mjs readiness`
exited 0. Read-only native `/hooks` showed the local Stop command; no new model
turn. Literal probe: `node /tmp/dough-claude-native-20261012-F4Q8/async-rewake/foreground.mjs run`.
It resumed original `1b6c0f22-7e19-417c-8eb2-205c968f2ebc` with retained
`--model haiku --permission-mode manual`, enrolled Stop, established idle and
an unsent draft, then released only the external private failure gate.

Native feedback UUID `49a56717-b7fc-47f4-ac5b-6073de7db66f` arrived in that
same original session. ACK message `msg_011CfwwK4HZJrH4ZjejXjrwP` was exactly
`CL_INTERACTIVE_CONTEXT_F4Q8 CLAUDE_ASYNC_FOREGROUND_FAILURE_F4Q8 ACK`.
Both actual terminal frames retain `UNSENT_CLAUDE_ASYNC_COMPOSER_F4Q8` and
manual mode. Hook/native rows preserve canonical private cwd, default/manual
mode, medium effort and `claude-haiku-5-5`. No failure was typed into the PTY.

Checker exited 1 from counting duplicate thinking/text chunks as separate model
turns. Two distinct server message IDs prove two actual turns. No replay.
Read-only `node /tmp/dough-claude-native-20261012-F4Q8/async-rewake/reconcile-foreground.mjs`
exited 0, retaining original error separately in `foreground-reconciliation.json`.
Owned native exit 129 and exact owned PIDs absent are retained there.

## Original controlled background idle delivery

Initial `node /tmp/dough-claude-native-20261012-F4Q8/async-rewake/background.mjs`
exited 1 after one enrollment turn: the guard mistakenly tested lifecycle
`state`, although native `status: idle`, `state: done` and a live PID were
observed. Failure gate was never released. Owned native stop completed.
This is a prerequisite checker error, not failed native failure delivery.
Two additional reservations were authorized without resetting prior history.

Distinctly fenced `node /tmp/dough-claude-native-20261012-F4Q8/async-rewake/background-second.mjs`
exited 0. `claude --bg --resume ID PROMPT` with no extra flags resumed the same
original `5ec006fa-243e-4489-8d5b-91c377bb556b`, rather than a copy. Native
status idle/live PID `92519` preceded external failure gate release. ACK message
`msg_011Cfwwh3ERdWxFFoPKJjcCH` was exactly
`CL_BG_CONTEXT_F4Q8 CLAUDE_ASYNC_BACKGROUND_FAILURE_SECOND_F4Q8 ACK`.
Original cwd, model, medium effort and default/manual policy remained.
Two new server message IDs, genuine native hook feedback and subsequent Stop
exit 0 were inspected. No attachment, failure typing or permission answer.
Only this controlled unattached fixture ended through `claude stop 5ec006fa`.
General idle status does not establish safe stop/attachment authority.

## Cleanup, budget and limits

`node /tmp/dough-claude-native-20261012-F4Q8/async-rewake/finalize.mjs` exited 0;
`final-receipt.json` lists every owned native/hook PID absent, background stopped
and temporary project hook settings removed. Shared supervisor, global settings,
other sessions and coordinator CI observer were untouched. Original receipts,
ledger, costs, screens and exact commands remain in the private `REPORT.md`.
Total is five actual model message IDs across six retained reservations; old
native ledgers remain unchanged. Subsequent Stop exit 0 prevents wake loops.

Accepted scope is original live foreground/background idle wake, foreground
draft preservation, original context/model/cwd/policy and owned cleanup.
Separate [protected-prompt proof](CLAUDE-PROTECTED-FEASIBILITY.md) passed permission
and genuine input waits. [Busy and parent/child proof](CLAUDE-LIVE-FEASIBILITY.md)
also passed for original foreground. Lost ACK, expired
hook rearming, pending/success silence and installed-runtime acceptance remain
unobserved. Exited CLI continuation uses the separately retained earlier proof.
This candidate does not complete slice 2 or implement shipping delivery.
