# Prove host launch choices and first input in Node Vitest

**Identity:** SEED-413#prove-native-first-input-on-vitest

**Source:** [Prove host launch choices and first input in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-first-input-on-vitest)

## Goal and scope

Give Dashboard maintainers fast typed proof of the developer's model and
effort choices for Claude, Codex, and Cursor, and of the original native
conversation's first-input disposition. Move the 15 legacy dispatch specs
below off Playwright, including Codex effort cases they import. Preserve
discovery, refusal, durable creation, uncertain recovery, connection loss,
startup reconnection, and competing starts. Keep process and protocol
observations at the boundary that can observe them. Other launch stories
own installed starts, workspace choices, follow-up context, kept records,
and session or terminal lifecycle
in the
[campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).

## Current decisions

- Follow the North Star on [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e),
  and [acting as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows).
  Use the [direct domain mapping in ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [local operational state in ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [the proof and cost comparison in ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- Reuse [AgentLaunches](../../../dashboard/server/agentLaunches.ts) for
  attempt lifetime, [host settings admission](../../../dashboard/server/launchSettingsAdmission.ts)
  and [host operations](../../../dashboard/server/launchHosts.ts) for
  discovery and dispatch, and the [creation store](../../../dashboard/server/launchCreationStore.ts)
  for durable identity. The Node [worktree retry proof](../../../dashboard/backend-tests/launches/agent-launch-update-worktree-retry.spec.ts)
  exercises typed attempts with a private machine profile and real Git.
  Use that arrangement for handoffs and keep the process or RPC real when
  it supplies the observation.
- The [story-linked cutover](https://github.com/terryyin/open-dough/blob/1ee3eb03b59a2133fdb73dddaf28c9d44fef2de8/.planning/slice-plans/833-complete-story-linked-ad-hoc-sessions/PLAN.md)
  makes origin's published story part of fresh Dashboard session
  admission. Use that story for new launch fixtures. Restart and
  reconciliation use the original attempt's request and workspace.
- Reuse the existing Node
  [creation-recovery](../../../dashboard/backend-tests/launches/agent-launch-creation-recovery.spec.ts)
  pattern for typed creation evidence without a page. Extend that seam with
  real private machine files, deferred typed handoffs at the native effect
  being held, and the synthetic Claude and Codex fixtures already used by
  these boundaries. Avoid starting Vite or mounting Chromium for unit cases
  that observe only admission, durable identity, or protocol answers.
- Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for requests,
  creation records and kept launches. Use the Dashboard entry and existing
  [page objects](../../../.agents/skills/dough-page-objects/SKILL.md) when
  extending a retained E2E journey. Leave malformed wire inputs visible. Add
  zero test-support wrappers. Remove support only when its last consumer has
  moved and the replacement observes the same effect.

## Decisive premises

Replayed after the story-linked cutover at `afe1bb9f6` on 26 November
2026 in the owned checkout with Node 24.21.0, Chromium, locked dependencies
and one worker on awake macOS under `caffeinate -s -i` for the long runs.
Other local checks were running and load varied. Use these runs as
behavioral evidence and take a comparable pair for any performance claim.

| Premise | Consuming operation and result |
| --- | --- |
| The maintained backend selector reaches model, creation, recovery, lifetime and duplicate paths | The backend command below passed all 79 Chromium cases (243.710 s summed) from the 15 mapped specs and their imported effort cases, plus four Node creation cases (0.130 s summed). Wall time was 260.48 s. It observed Claude model and effort and process cancellation, Codex catalog, Cursor admission, creation gates, uncertain story-linked recovery, startup reconnection, and single-input competing starts. |
| Existing typed seams observe durable creation and retained startup | The backend command below with `launches/agent-launch-(creation-recovery\|update-worktree-retry)\.spec\.ts$` as the selector passed six Node cases in 28.70 s wall. Creation evidence gated unreadable records and derived the Codex predecessor picker. The real-Git worktree retry applied the updater to the exact kept worktree and dispatched that attempt once, or preserved it with a refusal and no dispatch. |
| Dialog and process journeys retain real model, creation and recovery consumers | The E2E command below passed all 23 Chromium cases on the first attempt, in 168.06 s wall and 155.593 s summed. It sent Cursor and Codex model and effort choices, verified Cursor sign-in failure, gated unreadable creation, recovered both blank and instructed Codex launches across restart, and explained unconfirmed Claude first input. |

## Execution context

- Story Branch Mode in the owned worktree
  `/Users/terryyin/git/open-dough/.worktrees/prove-host-launch-choices-and-first-input-in-nod`
  on `codex/prove-host-launch-choices-and-first-input-in-nod`. Integration
  checkout is `/Users/terryyin/git/open-dough` and the authorized trunk
  is `origin/main`.
- Publisher `dashboard-territory.local-open-dough`, agent Tsubomi-chan,
  starting revision `01fa9d50fe2b5445ed8f3a80ceee53930ee5a8a5`.
  Established claim `365c7c69bbdc91f7ca9c1b5119e34b20f9fcf724` is
  confirmed on the remote execution branch.
  Slice 1 published as `d6691f5bb35fc2214a1629e7ec873dcdbabe158e`
  on that branch with observer registration. Slice 2 published as
  `25be1d9a8661191589c44e60165edfd5186055a8` with the workspace-start merge
  and the same observer. Slice 3 published as `ade5fff4c67f06d1fa9ddbd84d69c1557b067df8`
  on the same target. Slice 4 published as
  `61c47088b1e5d2976bc4bb08d262fdf5e5b8ff0e`, followed by slice 5
  at `ead706721f4417cbe8d2d98bbfe6aeaa71df772d`. The slice 4 CI run
  was cancelled by that later branch push with no failed job. Slice 6
  published as `075273945e40df16be58719e50909cedb945feec`. Its push also
  superseded the slice 5 run with no failed job. The worktree-update CI
  repair published as `28b7d90c26821bf0d5208205dfd601117fc1343f`.
- Locked checkout install, native Chromium prerequisite check, and Dashboard
  typecheck passed. Retain the existing eight-slice scope and use the
  recorded baseline for behavior on the unchanged launch paths.
- CI workflow `ci.yml` (CI), GitHub push on the remote execution branch.
  Codex coordinator `codex-seed413-native-input` owns
  `/tmp/dough-ci-501/watch-aqWUbj` (PID 82813, yielded cell
  `g594:16`, command session 40826). The trunk Take precedes this observer.
- Local verification runs on awake macOS on AC with Node 24.21.0.
  One other worktree had a frontend test running at setup. Sequence owned
  long checks at one worker with `caffeinate -s -i`. Treat elapsed time as
  descriptive unless a comparable measurement pair can be established.

## Ordered slices

### 1. Send Claude's chosen model, effort, and environment

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: With typed launch requests, a listed model and effort reach the
synthetic Claude process and kept record. Open Dough's default effort
applies when omitted. An unlisted model or effort outside Claude's levels
is refused before process start. A deployment-like start uses the
developer's shell environment without Dashboard's start-up additions.
Convert `agent-launch-environment.spec.ts` and `agent-launch-model-boundary.spec.ts`.

Accepted proof: The legacy 20 cases are now 22 passing Node Vitest cases
and zero Playwright cases. The environment spec sees the actual synthetic
Claude process strip deployment additions and retain developer settings.
The model boundary sees the chosen model and effort, named and default
refusals, the published story context, blank and instructed ad hoc starts,
and durable records. The model admission spec observes the five malformed
or unlisted values for both request shapes, unsupported effort, and a
Claude alias on Codex without a dispatch. Default effort and native
refusal each split into two independent cases.

The exact selector was
`launches/agent-launch-(environment|model-admission|model-boundary)\.spec\.ts$`
via the backend local gate with one worker. Measured 17.575 s summed and
25.37 s wall. Thirteen admission cases finished in at most 100 ms. The
eight real-Git dispatch cases took 1.327–3.622 s each. Typecheck passed.
Installed execution's exact branch, workspace, and origin proof also
remains with slice 2. These measurements describe the run under variable
machine load. Independent refactoring was unnecessary after reviewing the
subject specs and reusing the existing environment, protocol, and
reporting observers.

### 2. Confirm or end the Claude process started for a story

Type: Behavior
Status: done
Estimate: 10–15 active minutes.

Proof: Account for `agent-launch-boundary.spec.ts` (254 lines). Partition
coverage at its existing responsibilities. For workspace and publication
cases, check the installed-start owners before consolidating, keeping any
unmatched evidence on the actual handoff. For host failure cases, assert
typed refusal and unconfirmed answers with the intended process and record
effects. The timeout must still observe the waiting Claude process exit
with SIGTERM and no kept record. Keep that case in E2E if the typed
boundary cannot observe it. Retire the legacy spec after each receiving
check accounts for its observations. Keep the
[Claude verification E2E](../../../e2e/launches/agent-launch-claude-verification.spec.ts)
and [unconfirmed-input E2E](../../../e2e/launches/agent-launch-unconfirmed-input.spec.ts)
for verification and kept-record recovery.

Accepted proof: All eight cases run in Node Vitest. The Claude handoff spec
keeps execution and refinement on actual private Git origins. It matches
the launch and confirmation listing arguments and working directories,
the native identity, the recorded origin revision, workspace and branch,
and the transmitted command, reporting context and developer input.
The boundary spec observes missing checkout and absent Claude, safe
untrusted-folder and native refusal answers, an unlisted session, and a
controlled launch wait that ends the held process with SIGTERM and leaves
no record. The missing-Claude case checks that trunk and worktrees are
unchanged. Removed fixture entry points had no consumers. The unchanged
change-wait consumer still uses the retained queued request fixture.

The backend selector
`launches/agent-launch-(boundary|claude-handoff)\.spec\.ts$` passed all
eight cases in two Node files and selected zero Playwright cases. Measured
11.753 s summed and 21.32 s wall. The two real-Git handoffs took 7.62 s
combined, and all eight were above 100 ms. The unchanged control selection
of model-boundary, start, preparation-start and change-wait passed 15 Node
and three Chromium checks. Dashboard typecheck passed. Concurrent work
loaded all 16 logical CPUs during an earlier run. The host outcome tests
now use an already published story through the native handoff fallback
to remove incidental installation work. The independent refactor moved
the model spec's private origin and host setup to its setup hook,
preserving the actual installed start in each case. All eight model
cases and Dashboard typecheck passed after that change. The run measured
24.938 s summed, including setup, and 28.88 s wall at lower machine load.
All checks use default timeouts.

Workspace-choice sibling `SEED-413#prove-session-workspace-starts-on-vitest`
landed at `23f2e537f`. Integrated pinned trunk `6bce7ce06` in merge
`ef0e5de2b` because the sibling extracted the native run and changed the
retained unconfirmed-input E2E. The combined backend replay passed 41
Node cases and three retained Chromium change-wait cases. The affected
unconfirmed-input Chromium E2E passed on the combined tree.

### 3. Admit Codex model and effort before acknowledging input

Type: Behavior
Status: done
Estimate: 12–15 active minutes.

Proof: Exercise Codex catalog reading through the same-origin project and
method rules, then model-only creation after durable identity. A disappeared
or contradictory native model is refused or kept without first-input intent
as today. Unavailable discovery still permits configured default, blank
input, and predecessor records. Native creation refusal exposes a bounded
message only. Convert `agent-launch-codex-model-boundary.spec.ts` with its
imported `codexEffortBoundaryCases.ts`, and
`agent-launch-codex-options.spec.ts`. Keep the
[Codex model E2E](../../../e2e/launches/agent-launch-codex-model.spec.ts)
and the [effort](../../../e2e/launches/agent-launch-codex-effort.spec.ts)
and [stale effort](../../../e2e/launches/agent-launch-codex-stale-effort.spec.ts)
journeys for dialog choice and native handoff.

Accepted proof: All 18 legacy cases now have 20 Node checks and zero
Playwright cases in the backend selection. The catalog spec exercises the
same-origin, method and project rules and pages through the actual
synthetic Codex socket. The model and effort specs check settings before
creation and sample the durable machine record at the first input request.
Conflicting settings keep the thread without sending input or saving a
sendable input intent. The options spec keeps the missing installed
refinement choices and bounded native creation refusals. The three input
shapes for a native refusal now run independently. The unchanged Codex
dialog E2E journeys retain native handoff from the browser.

The selector for the four receiving specs was
`launches/agent-launch-codex-(catalog|model-boundary|effort-boundary|options)\.spec\.ts$`.
It passed in 58.77 s wall, with 50.072 s summed and individual cases from
171.8 ms to 4.728 s including test setup. The old effort import is gone
and Dashboard typecheck passed. The owned changes concern these specs
alone, with existing protocol, storage, and reporting observers reused.
No further refactor was needed.

### 4. Validate Cursor's chosen model at discovery and creation

Type: Behavior
Status: done
Estimate: 8–12 active minutes.

Proof: Cursor effort admission refuses unsupported pairs and accepts a
composed listed id. An unlisted model or unestablished scope is refused
before create-chat. Model verification failures explain the exact known
stop. Convert `agent-launch-cursor-model-admission.spec.ts` and
`agent-launch-cursor-model-verification.spec.ts`. Keep the
[Cursor model](../../../e2e/launches/agent-launch-cursor-model.spec.ts),
[effort](../../../e2e/launches/agent-launch-cursor-model-effort.spec.ts), and
[verification](../../../e2e/launches/agent-launch-cursor-model-verification.spec.ts)
E2E journeys for listed choices on the prompted run.

Accepted proof: Seven Node cases replace the five legacy cases, with
unsupported, missing, and supported effort checked independently.
The actual Cursor runner passed `fixture-orb-low` to the prompted client
with the retained chat ID and checkout. The kept record persisted the model
and effort separately. Unlisted models and unavailable configuration
scope produce no create-chat. The native discovery process supplies
distinct safe messages for CLI exit and an unrecognizable model listing.

The exact backend selector
`launches/agent-launch-cursor-model-(admission|verification)\.spec\.ts$`
passed all seven cases with zero Playwright cases. Measured 6.318 s summed
and 9.89 s wall. Four cases took at most 100 ms. Dashboard typecheck passed.
The two subject specs reuse the existing host and runner fixtures. No
further refactor was needed.

### 5. Record creation before sending first input

Type: Behavior
Status: done
Estimate: 8–12 active minutes.

Proof: Failed durable identity recording prevents first input and explains
the known continuation. Unreadable creation evidence refuses Codex before
native creation, admits Claude, and preserves the evidence file. Convert
`agent-launch-codex-creation-boundary.spec.ts` and
`agent-launch-creation-gates-boundary.spec.ts`. Reuse the existing Node
`agent-launch-creation-recovery.spec.ts` observations. Keep the
[Codex creation E2E](../../../e2e/launches/agent-launch-codex-creation.spec.ts)
and [creation-gates E2E](../../../e2e/launches/agent-launch-creation-gates.spec.ts)
for protocol evidence and unavailable recovery advice.

Accepted proof: The failed identity write leaves the actual native thread
and its unresolved creation evidence, explains the exact quoted
continuation, closes the connection, and submits no turn. The next
Start leaves one total thread. Because the read-only store also prevents
attempt persistence, the test observes the typed in-memory attempt result.
The unreadable-record case checks the original bytes and empty Codex
creation log before a Claude start, then observes the Claude record and
the preserved unreadable copy.

The backend selector
`launches/agent-launch-(codex-creation-boundary|creation-gates-boundary|creation-recovery)\.spec\.ts$`
passed two migrated Node cases and four existing Node controls, with
zero Playwright cases. The migrated checks took 3.117 s summed, the
controls took 48 ms summed, and the selection took 6.18 s wall.
Dashboard typecheck passed. The two subject specs use the existing host
and persistence owners. No further refactor was needed.

### 6. Recover uncertain first input only with matching evidence

Type: Behavior
Status: done
Estimate: 10–15 active minutes.

Proof: Matching history confirms the original input. Explicit refusal can
allow the saved input once in the same conversation. Unreadable, missing,
empty, unrelated, or wrong-workspace history never authorizes a resend.
Direct verification refuses an uncertain Codex start and keeps its attempt.
A blank story-linked launch stays uncertain until persistence is verified.
The known refusal can confirm persistence with zero turns when the
conversation and workspace match. Convert
`agent-launch-ad-hoc-codex-recovery-boundary.spec.ts`,
`agent-launch-codex-reconciliation-boundary.spec.ts`, and
`agent-launch-codex-verify-boundary.spec.ts`. Keep the
[Codex reconciliation](../../../e2e/launches/agent-launch-codex-reconciliation.spec.ts),
[recheck](../../../e2e/launches/agent-launch-codex-recheck.spec.ts), and
[ad hoc Codex recovery](../../../e2e/launches/agent-launch-ad-hoc-codex-recovery.spec.ts)
E2E journeys for protocol evidence, including blank persistence and a
predecessor-shaped kept input after restart.

Accepted proof: The three legacy cases pass under Node. The blank case
reads the original published story and checks refusal and identity
variants before the known refusal confirms the matching thread and
workspace. One thread and zero turns are observed. The instructed
continuation uses a fresh owner and the durable attempt for all five
unsuitable histories, retaining the original record and one total
submitted turn. Direct Verify leaves both durable and observed attempts
unchanged without a native call. The unchanged reconciliation and
ad hoc recovery E2E retain positive resend and matching-history proof.

The selector
`launches/agent-launch-(ad-hoc-codex-recovery-boundary|codex-reconciliation-boundary|codex-verify-boundary)\.spec\.ts$`
passed three Node cases and zero Playwright cases in 6.22 s wall.
Measured 3.170 s summed and individual cases from 1.024 to 1.117 s.
Dashboard typecheck passed. The subject specs reuse the existing typed
attempt inputs, real stores, and protocol fixture. No further refactor
was needed.

Branch CI's worktree-update retry check failed on the slice 6 revision.
The fixture now waits for the live owner's settled refusal and separately
reads the durable refusal before retry. The reproduced ordering accepts
the retry after this change, and both focused retry cases and typecheck
passed. Follow the [diagnosis record](diagnosis-worktree-retry-ci.md).
The shared product operation and other launch tests stayed untouched.

### 7. Respect host connection loss and startup reconnection

Type: Behavior
Status: done
Estimate: 10–15 active minutes.

Proof: An active detached caller still records acknowledgment; a later
connection failure retains recovery and disposes resources. Ending
notifications racing confirmation are accounted for. Deleting an unreadable
Codex record stays deleted after a later native connection failure. A saved
Codex conversation reconnects after daemon loss at startup, and startup
preserves records across the current Codex scenarios. Convert
`agent-launch-codex-lifetime.spec.ts` and the record-state cases in
`agent-launch-codex-startup.spec.ts`. Keep the startup case that launches
the daemon from saved state before any read and attaches the same thread
in its saved workspace. Move that case to the Codex launch E2E family if
direct Node startup cannot observe both transitions. Keep the real worker
shutdown and restart observation from the lifetime spec with a process
owner, including previously published story and landing authority.

Accepted proof: Nine of the ten legacy cases run in Node. The lifetime
spec closes the caller response while the native turn is held, observes
acknowledgment and later connection loss, separates racing completion
from disconnect, and checks the deleted record remains absent. The
startup spec observes daemon invocation from saved state before any
read, the developer environment and actual PTY attach to the original
thread in its distinct saved workspace. The four startup states preserve
the applicable records.

The selector `launches/agent-launch-codex-(lifetime|startup)\.spec\.ts$`
passed all nine Node cases with zero Playwright cases, taking 4.851 s
summed and 6.94 s wall. Four cases took at most 100 ms. Dashboard typecheck
passed.

The tenth legacy case moved to
[worker shutdown E2E](../../../e2e/launches/agent-launch-codex-worker-shutdown.spec.ts).
The real worker shutdown closes the native connection without interrupting
the turn. The replacement worker reads the same unsettled attempt,
reporting, published story, and landing authority. Chromium passed that
single case in 3.436 s, 4.97 s wall. Include it in the story gate. The
three subject specs reuse existing boundary and fixture owners. No further
refactor was needed.

### 8. Send only one input during competing native starts

Type: Behavior
Status: planned
Estimate: 10–15 active minutes.

Proof: Overlapping launches for the same subject make one native
conversation and input. Story choice changes cannot bypass an in-flight
launch. Caller detachment keeps the gate until startup completion releases
it while the agent works. Native refusal releases the gate for a retry.
Distinct Claude instructions remain independent while both launches are
held. Convert `agent-launch-duplicate.spec.ts`.

## Proof ownership and local gate

Files are relative to `dashboard/backend-tests/launches/`. The baseline
case counts by slice are 20, 8, 18, 5, 2, 3, 10, and 13.

| Slice | Legacy selection | Observable proof |
| --- | --- | --- |
| 1 | `agent-launch-environment.spec.ts`, `agent-launch-model-boundary.spec.ts` | Chosen Claude model and effort on the process, default effort, refusals, and deployment shell environment |
| 2 | `agent-launch-boundary.spec.ts` | Installed context reaches Claude. Refusal, unconfirmed launch, and timeout preserve process and store effects. |
| 3 | `agent-launch-codex-model-boundary.spec.ts`, `codexEffortBoundaryCases.ts`, `agent-launch-codex-options.spec.ts` | Catalog rules, model-only after durable identity, discovery fallbacks, bounded creation refusal |
| 4 | `agent-launch-cursor-model-admission.spec.ts`, `agent-launch-cursor-model-verification.spec.ts` | Listed composed id, unlisted and unscoped refusals, verification explanations |
| 5 | `agent-launch-codex-creation-boundary.spec.ts`, `agent-launch-creation-gates-boundary.spec.ts` | No first input without durable identity; unreadable Codex evidence preserved |
| 6 | `agent-launch-ad-hoc-codex-recovery-boundary.spec.ts`, `agent-launch-codex-reconciliation-boundary.spec.ts`, `agent-launch-codex-verify-boundary.spec.ts` | Matching history and explicit refusal settle the saved input, and blank persistence creates no turn |
| 7 | `agent-launch-codex-lifetime.spec.ts`, `agent-launch-codex-startup.spec.ts` | Acknowledgment under loss, disposal, startup reconnect and record preservation |
| 8 | `agent-launch-duplicate.spec.ts` | One native input under contention; independent distinct instructions |

Run from the repo root with fresh absolute proof paths and one worker.
Repeat the baseline at the execution base if affected paths or measurement
conditions changed. The backend selection includes the 15 mapped specs, the
effort cases imported by the Codex model spec, and the unchanged Node
creation control. Report the control separately from the legacy cases.
Add exact selectors for replacements to each candidate run and record the
receiving proof owner. Confirm discrimination for any legacy assertion
retired as redundant. Use matching workloads and machine conditions to
compare costs.

```sh
selection='launches/agent-launch-(ad-hoc-codex-recovery-boundary|boundary|codex-(creation-boundary|lifetime|model-boundary|options|reconciliation-boundary|startup|verify-boundary)|creation-gates-boundary|cursor-model-(admission|verification)|duplicate|environment|model-boundary|creation-recovery)\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$e2e_proof" /usr/bin/time -p npm run test:e2e -- 'e2e/launches/agent-launch-(ad-hoc-codex-recovery|claude-verification|codex(-creation|-effort|-model|-reconciliation|-recheck|-stale-effort)?|creation-gates|cursor-model(-effort|-verification)?|unconfirmed-input)\.spec\.ts$' --workers=1
```

Run affected consumers from the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
and `npm run typecheck:dashboard` for changed typed contracts. Record
engine and case counts, per-case time against roughly 100 ms, summed case
time, elapsed selection time, and the separate cost of proof retained or
moved to E2E. Account for every scoped legacy case before accepting zero
Playwright selections for this boundary.

Use awake macOS on AC under `caffeinate -s -i` for long local checks per
[AGENTS.md](../../../AGENTS.md). Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to every failure and repair handoff. Keep default test timeouts.

## Plan review

Slice-plan refinement split Claude model and environment from process
confirmation and timeout. Eight Behavior slices cover the mapped specs.
Model choices, durable identity, matching history and competing attempts
each use the production operation that owns the decision. Each estimate
fits the 15-minute active-work limit. No remaining slice-specific concern
was identified in the reviewed proof paths.
