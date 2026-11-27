# Prove session retention, one-shot starts and input in Node Vitest

**Identity:** SEED-413#prove-session-retention-and-input-on-vitest

**Source:** [Prove session retention, one-shot starts and input in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-retention-and-input-on-vitest)

## Goal and scope

Give Dashboard developers faster, type-checked Node feedback for the 27
legacy cases mapped below. Preserve their observations of machine history,
one-shot start policy, image and voice input, and saved workspace loss during
PTY startup. The [campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage)
owns the neighboring launch and terminal families and the eventual runner
cutover. Actual vendor services and browser gestures stay outside this
deterministic backend proof.

## Current decisions

- Follow the North Star for
  [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use the existing domain records, request policy and responses directly under
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).
  Use real filesystem, Git, HTTP streams or native PTY only for outcomes they
  determine, with controlled vendor inputs under
  [ADR 0005, Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md#2-keep-deterministic-checks-in-ci).
- Keep history, records, scopes and attachments in the private machine home.
  Compare origin refs, backlog and profiles separately for the start promises,
  following [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
  Reuse the record document's archive-before-drop rule and the existing host
  removal dispatch for both ways a record leaves. Reuse the installed session
  policy and the established context model for fresh and continued starts.
- Call stable production operations where they own the outcome. Keep wire
  checks at their adapter when the status, headers, streaming or socket
  lifecycle is the observation. Reuse `startOrigin`, the fake native hosts
  and the loopback voice provider only where their behavior is observed. Build
  valid story, request and record data with MakeMe. The
  [backend test entry](../../open-dough.json) selects MakeMe and leaves
  page objects to the browser journeys. Add zero test-support wrappers.
  Remove exclusively used setup or assertion code when its last caller moves.
  `expectEstablishedOneShot` has one legacy caller file. The policy data
  factory in that module has other Review callers.
- Compare proof, runtime and support cost with the same selection and
  one-worker profile under [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
  Compare per-case times against the campaign's roughly 100 ms reference and
  explain the remaining cost of real Git, process or wire evidence. A slower
  import-only transfer is evidence of compatibility. The planned reductions
  come from narrower production entry points and setup.

## Decisive premises

Observed in the owned preparation checkout at `5ee801fa0` on
27 November 2026 with Node 24.21.0, Playwright 1.65.0 and Vitest 5.1.0.
The runner used one worker, private homes, local fixtures and awake macOS on
AC. The shell time includes runner startup.

| Premise | Consuming operation and observation |
| --- | --- |
| The maintained selection exercises the whole legacy family | The local-gate command selected 27 Chromium cases, zero Node cases and zero retries. All passed, with 45.430 s summed case time and 52.96 s elapsed. Per-file legacy counts and times appear below. |
| The typed record mutation can reach real storage and scope retirement | Scratch `typed-history` used the machine record document, production `setRecordDoneAt` and `deleted`, and real Cursor removal dispatch. A filesystem obstruction kept the leaving record and scope. After removing it, the next write or deletion archived once with the right reason, retired the scope and left the linked conversation. Both Node cases passed (116 ms for expiry and 21 ms for removal). The legacy selection also exercised restart, the 29-day contrast, and retained scopes. |
| The existing typed start path can reach a real installed workflow and retain the policy | Scratch `typed-start` called `withSessionPolicy` and `attemptRun` with a real installed execution checkout and bare origin, and a recording native collaborator. One default-checkout automatic start reached the requested location and formatted context, wrote the policy and start to the record, and left the origin refs unchanged (1.79 s). The scratch copies of the three legacy start specs also ran all 14 cases through the real installed workflows and fake native boundaries, including both Codex first-input cases, both retry cases and both refusal cases. |
| Vitest can observe the same wire and native loss boundaries | Scratch copies of all four attachment cases used a local Dashboard boundary and the existing fake native services. They preserved refusal before storage, an unavailable session, numbered concurrent writes and opaque-ID storage. All passed. The three voice cases kept the loopback provider and real client disconnect and shutdown, and all passed. The PTY case intercepted the Codex spawn call, observed the existing cwd, removed it and called the real native spawn. The typed attachment owner reported the missing workspace, refused the attach and released the socket (66 ms). |

Scratch commands used the same local-gate invocation and flags with separate
proof files and the following filters:

```text
zz-prep-retention-.*\.spec\.ts$
zz-prep-retention-(typed-(history|start)|session-attachment-boundary)\.spec\.ts$
```

The first run had five scratch files, 18 Node cases, 52.006 s summed case
time and 57.08 s elapsed. The second had three files, seven Node cases,
16.477 s summed case time and 21.55 s elapsed. Both passed with zero retries.
Scratch copies were removed. These runs establish the observed entry points
and compatibility. Delivery owns the final case mapping, typecheck and
comparable performance measurement.

## Ordered slices

Legacy names below are relative to `dashboard/backend-tests/sessions`.
Retire each legacy selection when its receiving proof passes.

### 1. Expire a Done session into history before retiring its scope

Type: Behavior
Status: planned
Estimate: 13 active minutes.

Proof: Replace both `launch-history-aged-out` cases and the
`agent-launch-retention-scope` case. Seed the real document with a 31-day
Done record, 29-day Done control and older unclosed control. Use
`keptRecords` for the visible records and `readStoredRecords` for physical
retention before and after a real `setRecordDoneAt` or recording write.
Observe the archived record, project, `aged-out` reason and timestamp,
then write again with a fresh process reader/writer on the same private
home to preserve the restart observation. Block the history append and
observe the requested Done write succeed while the expired record remains
stored and hidden. After restoring the history directory, a write archives
it once. Exercise the production default retirement listener and real
Cursor scopes with the shared chats symlink. The expired scope leaves
after the record, while retained scopes, shared config and saved chat
bytes survive. Use the narrow new-process pattern already in
[launch records across processes](../../../dashboard/backend-tests/launches/launch-records-across-processes.spec.ts)
for the restart observation.

### 2. Remove a session only when its history can be kept

Type: Behavior
Status: planned
Estimate: 9 active minutes.

Proof: Replace both `launch-history-removed` cases through
`launchRecordDeletion.deleted` with the admitted source and record.
Substitute only the observed native state to control removability.
Use real record and history files and the existing host cleanup. Observe
the deleted answer, remaining records, one `removed` archive entry across
the write and a later operation, and retirement of only the removed Cursor
scope with the saved conversation intact. A blocked archive returns the
existing 500 JSON refusal with its deletion error, leaves the original
record and its scope, and preserves existing history. Keep the adapter
observation for the refusal response. The
[recently Done deletion journey](../../../e2e/sessions/agent-launch-recent-delete.spec.ts)
owns the browser's deletion and visible result.

### 3. Refuse a session policy that cannot be established

Type: Behavior
Status: planned
Estimate: 9 active minutes.

Proof: Replace both `agent-launch-session-refusal` cases. Use the installed
host's real policy file and the production `sessionPolicies` catalog and
`withSessionPolicy` decision. Exercise execution and refinement with the
shared script removed and contrast the capable installation. Preserve the
two standard-tracking conflicts, default-checkout and automatic landing.
At the production launch admission boundary, observe the corresponding 400
answers, empty kept starts and native dispatches, and unchanged origin.
Reuse the existing boundary only for the wire response and dispatch control.

### 4. Carry the selected one-shot policy into a new session

Type: Behavior
Status: planned
Estimate: 15 active minutes.

Proof: Replace all ten `agent-launch-session-options` cases. Exercise all
eight execution/refinement, workspace and landing combinations through
`withSessionPolicy` and `attemptRun`, the actual installed start, real
worktree and bare origin. Observe selected cwd, policy flags, formatted
context, reporting reference, final kept record and cleared kept start.
Read origin refs, profiles and backlog before and after. Carry the two
Codex cases through the real host adapter with the fake Codex protocol
and observe `thread/start` cwd and `turn/start` input. Observe the actual
Claude command and instruction through its existing fake executable.
Use the shared start/recording setup for each case and keep assertions
beside the receiving contract. The
[session choices](../../../e2e/launches/agent-launch-session-choices.spec.ts)
and [isolated start journey](../../../e2e/launches/agent-launch-start-session-isolated-boundary.spec.ts)
retain browser selection and launch behavior.

### 5. Continue the one-shot workspace kept after a refusal

Type: Behavior
Status: planned
Estimate: 12 active minutes.

Proof: Replace both `agent-launch-session-kept-start` cases. Through the
typed attempt path and real installed execution/refinement scripts, have
native launch first refuse, then accept a standard Start for that story.
Observe the existing refusal text, the kept start's own policy and
establishment record, origin and worktree count, native cwd and established
first input. The accepted launch keeps the original context and policy
and consumes the prior start entry. Count worktrees, read origin and inspect
the actual native call to catch re-establishment or policy replacement.

### 6. Save bounded images in the admitted session's own directory

Type: Behavior
Status: planned
Estimate: 14 active minutes.

Proof: Replace all four `session-attachment-boundary` cases. Reuse
`submitSessionAttachment`, its shared `admittedAttach` decision and the
existing image reader and storage. Reach record lookup and native
availability with the typed session data and state observer. Keep a real
loopback request for origin, method, body, response headers and concurrent
upload proof. Observe the current refusal precedence, unknown or unavailable
session, unsupported media, empty and oversized bodies, absent storage and
no terminal attach. For admissions, inspect actual bytes and numbering
across sequential and concurrent requests, sanitized filenames, opaque-ID
hashing, and the obstructing path and existing files after storage refuses.
The [paste image journey](../../../e2e/terminals/agent-terminal-touch-paste-image.spec.ts)
owns the browser gesture and next terminal input.

### 7. Bound an instruction transcription request through completion

Type: Behavior
Status: planned
Estimate: 13 active minutes.

Proof: Replace all three `session-instruction-voice-boundary` cases around
`installInstructionTranscriptionMiddleware`. Exercise local origin, method,
media and empty, content-length and chunked byte limits through real HTTP,
and count provider contacts. Use only the existing loopback provider
substitute and private credential. Through the same boundary, hold an
accepted request and observe the provider disconnect after the client
disconnects and after the Dashboard closes. Keep the provider response
variants, including authentication, rate limit, other error, blank or
malformed text, response bound and network failure. Observe public statuses
and errors plus the absence of diagnostics and key material from replies
and service output. The
[voice lifecycle](../../../e2e/terminals/session-terminal-voice-lifecycle.spec.ts)
and [provider failure journey](../../../e2e/launches/session-instruction-voice-provider-failures.spec.ts)
own browser capture and recovery observations.

### 8. Refuse a terminal whose saved workspace disappears at startup

Type: Behavior
Status: planned
Estimate: 8 active minutes.

Proof: Replace the single `session-workspace-retirement-startup` case.
Call `TerminalAttachments.connect` with a kept, marked-Done Codex
session and the socket observer. Intercept only the native spawn call,
verify the cwd existed at the call, remove it and invoke the real PTY
library. Observe the missing-workspace control and exact close code and
reason, absence of attached readiness, and that ending attachments sends
no second close. The
[saved workspace Done journey](../../../e2e/sessions/session-workspace-retirement-done.spec.ts)
retains proof of the visible Done behavior.

## Proof ownership and local gate

The eight slices account for 3 + 2 + 2 + 10 + 2 + 4 + 3 + 1 legacy cases.
Retain a disposition for each case and verify zero Playwright selections
for the nine source paths. Include any named receiving paths in the final
selection and record the final case count and both runtime measures.
The baseline summed case times by source file (count, seconds) were
aged-out (2, 19.375), removed (2, 1.038), retention scope (1, 4.498),
policy refusal (2, 1.095), options (10, 11.998), kept start (2, 2.879),
image (4, 2.345), voice (3, 1.326) and PTY startup (1, 0.876).

Use the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Run the focused backend gate per slice and `npm run typecheck:dashboard`
for affected typed production and specs. Trace any changed production
contract through its consumers and run the affected existing E2E or other
observations under the
[consumer trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace).
Keep the default test timeout unless an individual case demonstrates an
essential longer wait under [AGENTS.md](../../../AGENTS.md).

Run long checks on awake macOS on AC under `caffeinate -s -i` per
[AGENTS.md](../../../AGENTS.md). Set `backend_proof` to a disposable output
path in advance. Compare on one worker and repeat the baseline on a
comparable revision or load if either materially changes.

```sh
selection='sessions/(launch-history-(aged-out|removed)|agent-launch-retention-scope|agent-launch-session-(kept-start|options|refusal)|session-(attachment-boundary|instruction-voice-boundary|workspace-retirement-startup))\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
```

## Plan review

Slice-plan refinement was unnecessary after mapping separate archive
triggers, policy refusal, fresh and kept starts, and the three input and
attachment outcomes to their existing owners. Expiry and explicit removal
share the record document and history rule, with separate behavior for
archive failure. Fresh and kept starts share the same policy and established
context. The eight bounded slices each own their corresponding legacy
observations. The preparation found no remaining slice-specific concerns.
