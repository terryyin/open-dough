# Prove host launch choices and first input in Node Vitest

**Identity:** SEED-413#prove-native-first-input-on-vitest

**Source:** [Prove host launch choices and first input in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-native-first-input-on-vitest)

## Goal and scope

Give Dashboard maintainers fast typed proof that a chosen Claude, Codex, or
Cursor model and effort reach the native process, and that a recovered
conversation receives first input only once when matching evidence
authorizes it. Move the 15 legacy native-dispatch and first-input specs
below off Playwright, including Codex effort cases they import. Preserve
discovery, refusal, durable creation, uncertain recovery, connection loss,
startup reconnection, and competing starts. Keep true process and protocol
observations with E2E. Other launch stories own installed starts, workspace
choices, follow-up context, kept records, and session or terminal lifecycle
in the
[campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).

## Current decisions

- Follow the North Star on [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e),
  and [acting as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows).
  Use the [direct domain mapping in ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [local operational state in ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [the proof and cost comparison in ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
- Reuse [claudeHost](../../../dashboard/server/claudeHost.ts),
  [codexHost](../../../dashboard/server/codexHost.ts),
  [cursorHost](../../../dashboard/server/cursorHost.ts),
  [launchBoundaryAnswer](../../../dashboard/server/launchBoundaryAnswer.ts),
  [launchCreation](../../../dashboard/server/launchCreation.ts) with its
  [store](../../../dashboard/server/launchCreationStore.ts),
  [hostLaunch](../../../dashboard/server/hostLaunch.ts), and
  [Cursor model id composition](../../../dashboard/server/hosts/cursor/modelIds.ts).
  Keep one meaning for each host's discovery, admission, creation, first
  input, and recovery rule. Origin remains authoritative for published story
  facts.
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

Observed in the owned preparation checkout at `a932cc90e` on 26 November
2026 with Node 24.21.0 and Chromium, one worker, local locked dependencies
after `npm ci`, and macOS on AC under `caffeinate -s -i`. Use these runs for
behavioral evidence and take a comparable pair for the execution's
performance claim.

| Premise | Consuming operation and result |
| --- | --- |
| The maintained backend selector reaches model, creation, recovery, lifetime and duplicate paths | The exact first-plan backend command below passed all 79 Chromium cases on the first attempt across the 15 mapped specs plus `codexEffortBoundaryCases.ts` imported by the Codex model boundary. Summed case time 161.687 s, wall 173.978 s. It observed chosen model and effort on Claude, Codex catalog and Cursor admission, creation gates, uncertain recovery refusals, startup reconnection, and single-input competing starts. |
| Existing Node owners can observe creation evidence without Playwright | The same backend command restricted to `agent-launch-creation-recovery` ran four Node cases, all passing on the first attempt in under 3 s wall. Stand-in evidence gated unreadable records, refused unavailable recovery, and derived the Codex predecessor picker from saved facts. |
| Dialog and process journeys retain real model, creation and recovery consumers | The launch E2E command below passed all 17 Chromium cases on the first attempt, in 94.074 s wall and 88.087 s summed. It sent Cursor and Codex model choices, verified Cursor sign-in failure, gated unreadable creation, reconciled uncertain Codex input, and explained Claude unconfirmed first input. |

## Ordered slices

### 1. Send Claude's chosen model, effort, and environment

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof: Call the production Claude launch path with typed requests through the
local launch boundary. A listed model and effort reach the synthetic Claude
process and stay in the kept record; Open Dough's default effort applies when
none is chosen. An unlisted model or effort outside Claude's levels is
refused before `claude` starts and names what was asked. A deployment-like
start runs Claude in the developer's shell environment without the
Dashboard's start-up additions. Convert
`agent-launch-boundary.spec.ts`, `agent-launch-environment.spec.ts`, and
`agent-launch-model-boundary.spec.ts`. Keep the
[Claude verification E2E](../../../e2e/launches/agent-launch-claude-verification.spec.ts)
and [unconfirmed-input E2E](../../../e2e/launches/agent-launch-unconfirmed-input.spec.ts)
for real process and forged-record recovery surfaces.

### 2. Admit Codex model and effort before acknowledging input

Type: Behavior
Status: planned
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
for dialog and substitute catalog pages.

### 3. Validate Cursor's chosen model at discovery and creation

Type: Behavior
Status: planned
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

### 4. Record creation before sending first input

Type: Behavior
Status: planned
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

### 5. Recover uncertain first input only with matching evidence

Type: Behavior
Status: planned
Estimate: 10–15 active minutes.

Proof: Only a matching acknowledgment or known refusal settles an uncertain
first input. Unreadable, missing, empty, unrelated, or wrong-workspace
history never authorizes a resend. Direct verification refuses an uncertain
Codex start and keeps its attempt. Blank ad-hoc recovery stays uncertain
except for the known refusal that establishes persistence. Convert
`agent-launch-ad-hoc-codex-recovery-boundary.spec.ts`,
`agent-launch-codex-reconciliation-boundary.spec.ts`, and
`agent-launch-codex-verify-boundary.spec.ts`. Keep the
[Codex reconciliation](../../../e2e/launches/agent-launch-codex-reconciliation.spec.ts)
and [recheck](../../../e2e/launches/agent-launch-codex-recheck.spec.ts) E2E
journeys for live protocol evidence.

### 6. Respect host connection loss and startup reconnection

Type: Behavior
Status: planned
Estimate: 10–15 active minutes.

Proof: An active detached caller still records acknowledgment; a later
connection failure retains recovery and disposes resources. Ending
notifications racing confirmation are accounted for. Deleting an unreadable
Codex record stays deleted after a later native connection failure. A saved
Codex conversation reconnects after daemon loss at startup, and startup
preserves records across the current Codex scenarios. Convert
`agent-launch-codex-lifetime.spec.ts` and
`agent-launch-codex-startup.spec.ts`. Retain actual daemon and socket proof
in E2E when the unit seam cannot observe the loss.

### 7. Send only one input during competing native starts

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

Files in the following map are relative to `dashboard/backend-tests/launches/`.

| Slice | Legacy selection | Observable proof |
| --- | --- | --- |
| 1 | `agent-launch-boundary.spec.ts`, `agent-launch-environment.spec.ts`, `agent-launch-model-boundary.spec.ts` | Chosen Claude model and effort on the process, default effort, refusals, and deployment shell environment |
| 2 | `agent-launch-codex-model-boundary.spec.ts`, `codexEffortBoundaryCases.ts`, `agent-launch-codex-options.spec.ts` | Catalog rules, model-only after durable identity, discovery fallbacks, bounded creation refusal |
| 3 | `agent-launch-cursor-model-admission.spec.ts`, `agent-launch-cursor-model-verification.spec.ts` | Listed composed id, unlisted and unscoped refusals, verification explanations |
| 4 | `agent-launch-codex-creation-boundary.spec.ts`, `agent-launch-creation-gates-boundary.spec.ts` | No first input without durable identity; unreadable Codex evidence preserved |
| 5 | `agent-launch-ad-hoc-codex-recovery-boundary.spec.ts`, `agent-launch-codex-reconciliation-boundary.spec.ts`, `agent-launch-codex-verify-boundary.spec.ts` | Matching evidence only; mismatched history never resends |
| 6 | `agent-launch-codex-lifetime.spec.ts`, `agent-launch-codex-startup.spec.ts` | Acknowledgment under loss, disposal, startup reconnect and record preservation |
| 7 | `agent-launch-duplicate.spec.ts` | One native input under contention; independent distinct instructions |

For the first and final comparisons, use fresh absolute proof paths from
the repo root and one worker. Repeat the baseline at the execution base if
affected paths or the measurement conditions changed. Select the 15 mapped
basenames; `codexEffortBoundaryCases.ts` is included through the Codex model
boundary import. If a replacement moves to a new filename, add its exact
selector to the candidate run and record the matching proof owner. Use the
E2E selection below for retained process proof. Confirm baseline
discrimination for any legacy assertion retired as redundant. Use the same
workload and machine conditions for a relative cost claim.

```sh
selection='launches/agent-launch-(ad-hoc-codex-recovery-boundary|boundary|codex-(creation-boundary|lifetime|model-boundary|options|reconciliation-boundary|startup|verify-boundary)|creation-gates-boundary|cursor-model-(admission|verification)|duplicate|environment|model-boundary|creation-recovery)\.spec\.ts$'
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD="$backend_proof" /usr/bin/time -p npm run test:dashboard:backend -- "$selection" --workers=1
caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u OPEN_DOUGH_E2E_SPLIT -u FORCE_COLOR -u NO_COLOR OPEN_DOUGH_E2E_PROOF_RECORD="$e2e_proof" /usr/bin/time -p npm run test:e2e -- 'e2e/launches/agent-launch-(claude-verification|codex(-creation|-model|-reconciliation|-recheck)?|creation-gates|cursor-model(-effort|-verification)?|unconfirmed-input)\.spec\.ts$' --workers=1
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

Slice-plan refinement was not needed: seven Behavior slices match the
coverage-map outcomes, stay under the eight-slice limit, and reuse existing
host, creation, and E2E owners without unresolved integration assumptions or
repeated special-case design. Prospective estimates assume the installed host
entry points keep their current typed boundaries. No unresolved
slice-specific concern remained after this review.
