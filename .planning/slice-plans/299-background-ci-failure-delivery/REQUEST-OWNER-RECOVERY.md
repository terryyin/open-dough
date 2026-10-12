# Unanswered request-owner recovery

Supporting record for [plan 299](PLAN.md); slice status and current execution
ownership remain in that plan. This record grants no execution authority.

### 1. Recover a GitHub request owner that no longer answers
Result: a standing request owner whose socket still accepts connections but
never answers its authenticated greeting is replaced once. Concurrent
consumers reach that replacement under the same API-host/login allowance.
A responsive owner with an incompatible protocol keeps its refusal behavior;
G12 remains with enrollment slice 3.

Boundary: the existing installed request-owner startup and consumer link,
reusing `greeted`, `standingRecord` / `claimedRecord`, `KeptAdmissions` and
`earlierCallsEnded`. A socket accepting a connection is insufficient readiness.
No new owner directory, allowance, daemon registry or fallback is added.
Plan 300 owns diagnostics and moving endpoint/process-table knowledge; this
slice changes only unanswered-greeting recovery and its proof.

Proof: a real private request owner is paused while its socket remains
connectable; concurrent consumers start, one replacement generation answers,
and resuming the original owner does not let it ask again. Observe the new
generation and original process exit, request/answer signals and upstream
call count; fixture setup supplies only the stopped owner. Existing replacement,
durable-hold, child-reconciliation and endpoint-privacy tests preserve the
surrounding contracts. All fixtures use private `gh` stand-ins, with no paid
native model turns or live GitHub calls.

Focused checks: `PATH=/opt/homebrew/bin:$PATH npm test --
src/skills/dough-execute-plan/scripts/github-request-owner-unresponsive.test.mjs
src/skills/dough-execute-plan/scripts/github-request-owner-replacement.test.mjs
src/skills/dough-execute-plan/scripts/github-request-owner-endpoint.test.mjs`.
Consumer proof: full
`npm test` and `npm run test:dashboard` before publication. Refactoring,
formatting, hooks, agent authorship and managed Story Branch delivery retain
the ordinary execution contract. There is no numeric timing exception.

This fulfills G21 independently; it completes neither the native gate nor the
story, and enables no replacement monitor or nonblocking completion cutover.

## Accepted implementation and focused observation

Startup now uses the existing authenticated `greeted()` response rather than
socket connectability. A silent greeting reaches the existing fenced claim;
a responsive incompatible welcome still refuses before any new generation or
upstream request. Hold persistence and earlier-child reconciliation stay owned
by their existing representations. Refactoring removes unused production
`reachable`, shares unchanged replacement fixture construction, and keeps the
paused-owner journey at its own observable boundary.

Pre-change regression: `node --test --test-name-pattern 'whose socket connects'
src/skills/dough-execute-plan/scripts/github-request-owner-replacement.test.mjs`
exited 1: “Timed out: one replacement owner answered the unanswered greeting”.
The failing assertion observed production recovery, not a fixture-supplied owner.
After implementation, all 36 selected owner/request/login/diagnostic/acquisition
cases passed; the separate login-secrecy case passed. Dashboard consumer proof
`env -u NO_COLOR npm run test:dashboard -- dashboard/tests/shared-request-owner.spec.ts`
passed all four cases. The first dashboard invocation's quiet-output failure
was the reproduced Node `NO_COLOR`/`FORCE_COLOR` conflict; removing `NO_COLOR`
preserved assertions and allowed the runner to observe them.

Fresh independent refactor completed with `## REFACTOR COMPLETE`. It confirmed
one production seam, no subsystem crossing, preserved scope/obligation ownership,
and all changed files at or below 250 lines. Fresh refactor proof: `PATH=/opt/homebrew/bin:$PATH npm test --
src/skills/dough-execute-plan/scripts/github-request-owner-unresponsive.test.mjs
src/skills/dough-execute-plan/scripts/github-request-owner-replacement.test.mjs
src/skills/dough-execute-plan/scripts/github-request-owner-endpoint.test.mjs`
exited 0, all 11 named cases passed silently. The earlier Bash 3.2 invocation
refused before checks; the repository-required Bash 5.3 on PATH ran them.

Decisive observation: `github-request-owner-unresponsive.test.mjs`, named
“an owner whose socket connects but whose greeting never answers is replaced
once for concurrent consumers, and the resumed owner is fenced”. Setup pauses
a real owner with a retained authenticated connection and verifies its socket
still connects. Two real consumers receive `200` / “the log for ann” from
exactly generation 2 in the same endpoint directory. Sending to the old
connection and resuming its PID yields its exit, no extra upstream read or
successful old answer, and only the replacement remains. The test resumes/ends
the original even on assertion failure; owned commands and fixtures were closed.
The incompatible-owner case in `github-request-owner-endpoint.test.mjs` observes
exit 1, original generation retained and no `gh` API call.

Unchanged admission, hold, child, authentication and consumer proof was reused
where refactoring changed only fixture construction or greeting disposal.
The whole Node/shell and dashboard suites remain required before publication.

Full Node/shell consumer proof: `PATH=/opt/homebrew/bin:$PATH npm test`
exited 0 silently (owned session `26789` terminal). No test-directory override
or split was set. Coordinator formatting `npm run format` exited 0 (session
`27049` terminal); production behavior and assertion/setup semantics are
unchanged, so accepted proof remains applicable. The formatter changed only
layout in the owned test files; no managed installed copy changed.

Whole dashboard consumer proof: `env -u NO_COLOR npm run test:dashboard`
exited 0 silently (owned session `31586` terminal). No test split, explicit file
selection, CI shard or deadline override was set. This completes the required
whole-suite observation. All focused/refactor/full/format commands are terminal;
no verification watch remains. Native gate 2 and the full story stay incomplete.
