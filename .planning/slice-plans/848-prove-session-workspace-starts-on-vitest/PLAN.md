# Prove Dashboard session workspace choices in Node Vitest

**Identity:** SEED-413#prove-session-workspace-starts-on-vitest

**Source:** [Prove Dashboard session workspace choices in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-session-workspace-starts-on-vitest)

## Goal and scope

Move the surviving backend unit proof for workspace choice, confirmation,
story admission, startup recovery, landing, expiry, and scheduled feedback
from the legacy runner to Node Vitest. All 18 original paths below need a
disposition. Preserve native dispatch, installed command and Git proof at
their actual boundaries. The [campaign coverage map](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage)
assigns the generic launch lifecycle, host options and protocol, ordinary
follow-up, retained record readers, and runner removal to other stories.
Observe the cutover's chosen blank-start policy. Product policy and
production data migration belong to SEED-439.

## Current decisions

- Begin from accepted trunk after the recorded SEED-439 prerequisite clears.
  Use its completion evidence to identify the delivered contract and proof
  owners. [Plan 833](../833-complete-story-linked-ad-hoc-sessions/PLAN.md)
  describes the supplier's work during preparation. After wrap-up, use the
  dependency resolution's retained Git revision to recover it.
- Follow the North Star on [direct production test boundaries](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Vitest for unit checks and Playwright for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e),
  and [immediate browser actions](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  for any E2E changes. Apply [ADR 0002's domain mapping](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  [ADR 0008's state ownership](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  and [ADR 0010's improvement comparison](../../../docs/adrs/0010-definition-of-improvement-accepted.md#decision).
  The origin owns membership and accepted revisions. Local records keep
  the selected checkout, launch progress and authority required for recovery.
- Follow the production path from [launch admission](../../../dashboard/server/agentLaunchAdmission.ts)
  through [request acceptance](../../../dashboard/server/agentLaunchAccept.ts),
  [workspace/start selection](../../../dashboard/server/unattachedStart.ts),
  [kept starts](../../../dashboard/server/sessionStartStore.ts), and
  [continuation](../../../dashboard/server/launchAttemptContinuation.ts).
  Reuse the integrated admission and landing owners. Borrowed and isolated
  starts vary the checkout and Git authority in the same launch contract.
  Scheduling is a caller of that contract. Keep the delivery and expiry
  rules with their existing production owners. If a case needs a wide
  fixture, narrow the production seam at its own boundary in that slice.
- Use the real private machine JSON store for kept state, real checkout
  and bare origin for Git observations, and a typed recording collaborator
  at the effect a Node case must observe. Leave process/protocol and
  installed-tool behavior with a real boundary check. Use
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) for valid fixtures
  and [Dashboard page objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  for any browser proof changes. Add zero test-support wrappers. Remove
  unused fixture code after tracing its last consumer.

## Decisive premises

| Consuming operation | Observation and remaining check |
| --- | --- |
| Identify the legacy paths to account for before choosing replacement cases. | At preparation revision `bc84dff4a`, Node 24.21.0 ran the maintained `groupFiles(backendGroup)` selector against the 18 basenames in the mapped plan. All 18 matched exactly once and selected Playwright. The original run at `07435ba0f` passed 40 legacy cases on their first attempt, with 182.387 s summed case time. That is historical context for the pre-cutover contract. |
| Establish the replacement baseline and prove installed admission and landing at the delivered boundaries. | Trunk already contains SEED-432's isolated admission at `3edf13a3f`. The inspected SEED-439 branch plan at `4122661d6` records a held scheduled Take, installed reporting of a bound comparison, and recovery of an unbound attempt, but still has a blank-start policy slice and the production switch outstanding. Its branch already rewrites the mapped default-start, receipt and landing specs and adds scheduled admission and unbound recovery proof. Slice 1 probes the integrated replacements and reruns the selected baseline in the owned checkout after the dependency clears. Current branch and historical timings do not establish the integrated result. |

## Ordered slices

### 1. Start in the borrowed checkout on the admitted story

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Begin with the cutover probe. Read its accepted revision and trace all 18
mapped paths through renames, removals, and replacement assertions. Run the
runner listing and a focused built-in borrowed Start against the delivered
profile with a private origin. Confirm the actual story binding at dispatch,
and locate the live blank-start, scheduled, and landing readers. Capture the
comparable scoped backend baseline before editing. Where an assertion has
already moved or product behavior was retired, record the evidence and the
surviving owner, including any new cutover spec that inherits a mapped
case. If the integrated contracts or the baseline cannot be verified, stop
dependent migration and revise the affected slices before porting cases.

Proof. A typed ad hoc Start through the production admission and start
handler returns the selected execution checkout and common repository.
Drive explicit and default checkout choice, blank input and title, long or
unusable title input, and refusals still owned by the accepted route. Verify
one published Taken story before the recorded launch effect and the same
session on that story. Use an actual checkout, an admitted source and launch
request, a fixed clock where the title depends on time, and the native
handoff recorder. Observe that a blank launch stays blank at the actual
host in the retained E2E. Preserve exact text at the first-input boundary
in slice 2. Retire standalone inventory expectations with the supplier's
story-membership proof.

### 2. Start with existing changes only after confirmation

Type: Behavior
Status: planned
Estimate: 10–14 active minutes.

Proof. Submit a borrowed checkout containing staged, unstaged and untracked
changes. With no confirmation or stale confirmation, the real checkout
probe returns the current fingerprint with no attempt or native dispatch.
Confirm that fingerprint through Start and read the request, checkout and
native handoff. Verify the fingerprint stays out of retained input, the
developer's bytes and order survive, and index, branch and working tree
still hold the same changes. Preserve the default policy and refusal for
any unsupported tracked request still present after cutover. Use the typed
ad hoc request with explicit policy and confirmation, real temporary Git
state, and a tracked effect at dispatch. Retain real Codex and Cursor
workspace and input observations through the existing E2E when they
distinguish those paths. Extend those journeys only for observations the
supplier still needs and that no retained native check sees.

### 3. Open the isolated checkout only after published admission

Type: Behavior
Status: planned
Estimate: 10–14 active minutes.

Proof. Give the production Start owner a typed isolated request and a
selected host with a private worktree and bare origin. Hold the admission
result and observe zero native calls until it verifies the actual published
Taken identity. An origin mismatch or definitive refusal opens no native
session. Losing a provisional claim to a competitor leaves the competitor
intact and allows a fresh draft when Continue actually needs it. A lost reply
after acceptance reconciles the already-published claim without allocating
another one. Use the installed command where Git publication and receipt
parsing are the observation, with recorded native dispatch and kept
attempts. Retain the isolated E2E for real cwd, one worktree, first-input
handoff and order relative to publication. Reuse the same admission
contract proven in slice 1.

### 4. Continue from the kept checkout and policy

Type: Behavior
Status: planned
Estimate: 12–15 active minutes.

Proof. Exercise the typed Start and Continue inputs through the delivered
session-start owner with the private session-start and attempt stores.
Begin with no workspace, a worktree created before reply, or a kept
establishment whose formatter or native start stopped. Reopen the same
attempt and check workspace, branch, policy, story and input at the effect.
Observe the original receipt guard before retrying after unreadable output.
A definitive stop before establishment leaves no kept workspace decision,
so a later independent Start can choose again. If the session exists with
uncertain input, recovery observes that session without a second send.
A distinct landing policy cannot accidentally resume the waiting session.
Use actual temporary Git state where slug reuse or existence is tested,
and a held installed-result or native callback at the interrupted effect.
Retain restart and native acknowledgment observations in E2E.

### 5. Capture a landing under the selected authority

Type: Behavior
Status: planned
Estimate: 10–14 active minutes.

Proof. Feed the delivered launch policy to the production start and the
typed landing submission to the landing owner, using a story-bound
launch, a real private repository, `LandingSubmission` and real or
private `LandingStores`. Confirm the opt-in from Start through the
installed caller for the delivered blank and instructed flows. Confirmation
of existing changes alone leaves the landing choice as selected. An
authorized prepare and record pins the real candidate/base and returns
the accepted comparison. Mismatched bound story, host, origin, workspace,
branch or target refuses at the relevant guard without a push or retained
preparation. Keep installed discovery and actual Git publication in E2E.
The typed receiver covers matching and refusal variants at its actual
boundary, with receipts and persisted state as observations.

### 6. Read the accepted comparison after startup expiry

Type: Behavior
Status: planned
Estimate: 8–12 active minutes.

Proof. Start from a bound launch and real Git endpoints. Exercise the
production landing reporter once with an old settled attempt present, then
with the attempt actually absent and the retained record still present.
An unacknowledged reporting reply replays the same pair and does not
republish Git. Compare the prepared pins, accepted revision and retained
receipt, and observe unchanged attempt-store state on the retained path.
Refuse changed or deleted authority without recreating the record. Use
`LandingSubmission`, the retained authority read from the real machine
record, a controlled clock for expiry, and the private origin. The actual
publisher's retry belongs to the retained installed/E2E journey.

### 7. Prune only the expired attempt's startup evidence

Type: Behavior
Status: planned
Estimate: 6–10 active minutes.

Proof. Place old settled, current settled and unsettled
`LaunchAttemptRecord` values across projects in a private machine store
with their own kept starts and attachment directories. Trigger a normal
attempt write through the production store, then read the surviving
attempts and launch records and compare the checkout inventory before and
after. Confirm cleanup follows a successful replacement and touches only
the expired attempt's evidence. Keep the actual filesystem, clock and
worktree in the test. The retained landing reader is slice 6's separate
consumer of the evidence that survives.

### 8. Admit one scheduled feedback session and notify once

Type: Behavior
Status: planned
Estimate: 10–14 active minutes.

Proof. An authorized due-date review and configured host choice reach the
actual maintenance check. Supply a fixed local date, typed review and
session state, an observable admission effect and notification sink, and
private settings and records where persistence matters. Exercise the due
check and completion report through their production owners. Confirm
default effort and the selected source/policy reach admission, a held or
refused launch opens no native session, a successful due launch happens
once, an attention report notifies once with the session open, and the
same due date stays consumed after the session ends and is deleted.
Retain the scheduled E2E and supplier's held-admission proof for ordering
actual publication before native dispatch. Keep scheduler and notification
behavior in their own existing producers.

## Proof ownership and historical inventory

The filenames below are relative to `dashboard/backend-tests/launches/`.
They identify the pre-cutover files even when the supplier moves or retires
them. At execution, record per-case dispositions in this plan, with a
named replacement and observable proof for each surviving assertion.
Standalone-only cases require an accepted removal or a maintained
story-linked equivalent.

| Slice | Historical paths and independently retained observations |
| --- | --- |
| 1 | `agent-launch-ad-hoc-boundary.spec.ts`, `agent-launch-ad-hoc-sessions.spec.ts` for request, checkout, title, record and inventory. Keep `e2e/launches/agent-launch-ad-hoc.spec.ts` and `agent-launch-ad-hoc-instructed.spec.ts` for the visible blank/instructed session and terminal behavior. |
| 2 | `agent-launch-start-session-existing-changes-boundary.spec.ts`, `agent-launch-ad-hoc-cursor-established.spec.ts`, `agent-launch-ad-hoc-codex-input.spec.ts` for the confirmation, exact input, cwd and dirty checkout. The latter also contributes scheduled skill input to slice 8. Preserve the Cursor cases' blank and isolated handoffs and stale-workspace refusal through the reached production and native checks. Inspect `e2e/launches/agent-launch-start-session-existing-changes.spec.ts`, `agent-launch-ad-hoc-codex.spec.ts` and `agent-launch-ad-hoc-cursor.spec.ts` before dropping any protocol assertion. |
| 3 | `admitted-session-refusal.spec.ts`, `admitted-session-retry.spec.ts`, `agent-launch-start-session-isolated-codex.spec.ts`. Preserve real admitted checkout and publication ordering in `e2e/launches/agent-launch-start-session-isolated.spec.ts`; retain the Codex native variant for cwd and ordered materialization if the E2E lacks it. |
| 4 | `agent-launch-start-session-failed-boundary.spec.ts`, `agent-launch-start-session-identity.spec.ts`, `agent-launch-start-session-kept.spec.ts`, `agent-launch-start-session-lost.spec.ts`, `agent-launch-start-session-stops.spec.ts`. Keep `e2e/launches/agent-launch-start-session-recovery.spec.ts`, `agent-launch-start-session-failed.spec.ts`, `agent-launch-ad-hoc-codex-recovery.spec.ts` and the delivered unbound-continuation journey for their distinct UI, real installed and native observations. |
| 5 | `agent-launch-start-session-landing-admission.spec.ts`, `agent-launch-start-session-landing-boundary.spec.ts`. Keep `e2e/launches/agent-launch-start-session-landing-context.spec.ts`, `agent-launch-start-session-isolated-auto-land.spec.ts` and the supplier's installed declared-landing proof. |
| 6 | `agent-launch-start-session-landing-retained.spec.ts`. Read the post-expiry receipt and the pinned endpoints through the delivered record and preserve the installed reporting-only retry observation from SEED-439. |
| 7 | `agent-launch-start-session-retention.spec.ts`. The real machine-store write and filesystem check own cross-project pruning and workspace survival. |
| 8 | `feedback-maintenance-launch.spec.ts` and the scheduled skill-input cases in `agent-launch-ad-hoc-codex-input.spec.ts`. Retain `e2e/launches/feedback-maintenance-launch.spec.ts`, `feedback-maintenance-launch-held.spec.ts` and the supplier's scheduled-admission check for actual due-row, installed and native launch observations. |

## Local gates and comparison

- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to the plan and all repair handoffs. Keep default test timeouts and use
  the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  as production seams and fixtures change. Trace the Start/Continue route,
  installed handoff and publisher, scheduler, kept-store readers, and
  shared support that the changed output reaches. Record the command,
  setup, observation and result for each reached purpose.
- Run focused backend checks with
  `npm run test:dashboard:backend -- --workers=1 <spec paths>`.
  Use the same selector with `--list` and the maintained runner
  classification to confirm surviving cases are discovered on the intended
  engine and the scoped legacy count is zero. Select named E2E paths with
  `npm run test:e2e -- --workers=1 <spec paths>` for the boundaries above,
  and run `npm run typecheck:dashboard` for TS contract and proof changes.
  Run affected installed checks if a shipped contract changes. For long
  macOS checks use a fully awake machine on AC with `caffeinate -s -i`
  per [AGENTS.md](../../../AGENTS.md).
- Compare the same post-cutover promise selection before and after
  migration with one worker, locked dependencies, matching Node and
  Chromium, proof records and host conditions. Record runner classification,
  first-attempt counts, failures/retries, summed case time and wall time,
  with retained E2E counted separately. Use
  `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD` for the backend runner record.
  If the supplier has already changed the footprint, report the reconciled
  baseline alongside the historical 40-case result and attribute the
  difference. Include removed fixtures and any added proof in the cost
  comparison. The [campaign baseline](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage)
  records the comparison conditions. Record the case distribution around
  the campaign’s roughly 100 ms unit-test target.

## Readiness review

Slice-plan refinement was unnecessary because each slice has a distinct
observation and uses the same delivered launch and retention boundaries.
Eight slices. No further slice-specific concern was found on the reviewed
basis. The recorded cutover dependency holds Start, and the first slice
checks the delivered proof selection and baseline before conversion.
