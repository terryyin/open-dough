# Express Launch dialog and startup test intent

**Identity:** SEED-300#express-launch-test-intent-through-page-objects
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-launch-test-intent-through-page-objects)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Goal and provisional scope

A developer can follow launch choices, supplied instruction and available
startup recovery without reconstructing repeated dialog controls. Receive
**Launch entry and dialog**; **Launch input, attachments and touch layout**;
**Startup answers and recovery**, including same-sequence siblings across
story, ad hoc, preparation, model/options, existing-changes, host-specific
attachment, responsive and frontend startup cases.

The source audit was at `7eab3d6ca`; current inspection was at `9779b93c1`.
No original executable plan existed. These slices provisionally receive the
audit findings, not fictional original slices. Refinement must confirm examples,
case cohorts and proof operations before this plan becomes executable.

Preserve workflow, host, exact options and payloads, disclosure/refusal steps,
provider faults, input modality, focus and host-progress gates. Exact startup,
verification and refusal wording remains independent scenario evidence.
Terminal interaction belongs to the Terminal story even where a launch case
uses its controls; reuse that shared owner without duplicating it here.

## Architecture and existing owners

Reuse `dashboard/tests/launchStoryCardPage.ts`, `touchLaunchPage.ts`,
`support/sessionDialog.ts`, `support/preparationPage.ts`,
`support/startProgressPage.ts`, `acceptedAttemptPage.ts`,
`continuationPage.ts`, `support/codexRetryPage.ts` and `support/voicePage.ts`.
Keep launch preparation, native host progress and dialog interaction distinct;
a shared reader should not silently perform a refusal disclosure under test.

[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps launch workflow and execution mode distinct and local launch evidence
separate from published membership. Compare reader clarity, shared-selector
edit sites and helper cost with the audit under
[ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

No inspected expected owner exceeds 250 lines; `support/voicePage.ts` has 228.
Use the existing dialog, progress/recovery, touch and voice seams rather than
one launch helper owning all fixture preparation and interaction.

## Provisional slices and proof ownership

Commands are illustrative until refinement confirms actual selections and
every affected caller. Each slice records a finding/caller disposition and
representative before/after showing preserved independent expectations.

### 1. Express launch entry and dialog choices through shared owners
Type: Behavior
Status: planned
Proof: Share workflow/host/options/existing-changes controls and confirmation
without hiding refusal or disclosure actions. Preserve exact chosen values and
native/HTTP/record evidence. Illustrative:
`npm run test:e2e -- 'e2e/launches/agent-launch-base-ci' 'e2e/launches/agent-launch-start-session-existing-changes.spec.ts'`,
`npm run test:dashboard:integrated -- 'tests/launches/agent-launch-model.spec.ts' 'tests/launches/agent-launch-options'` and
`npm run test:dashboard:backend -- 'backend-tests/launches/agent-launch-options'`.

Behavior: A developer reads a launch-choice case → follows named entry and
dialog operations → the source states the workflow, host and options chosen,
with unchanged dialog and startup-boundary checks distinguishing them.

### 2. Express attachment, paste and draft editing in the dialog
Type: Behavior
Status: planned
Proof: Dialog owners provide attach/paste/preview/draft/cancel operations while
the case keeps exact payload, provider fault and focus expectations. Preserve
frontend/integrated setup separation. Illustrative:
`npm run test:e2e -- 'e2e/launches/agent-launch-ad-hoc-attachments'`,
`npm run test:dashboard:integrated -- 'tests/launches/agent-launch-ad-hoc-attachments'` and
`npm run test:dashboard:frontend -- 'frontend-tests/agent-launch-ad-hoc-attachments-refusal.spec.ts'`.

Behavior: A developer reads a launch attachment case → follows named dialog
input operations with explicit payloads → the source explains the retained,
submitted or refused draft and the original input/provider checks pass.

### 3. Express instruction recording, cancellation and overflow editing
Type: Behavior
Status: planned
Proof: Reuse the existing voice owner and dialog draft controls; keep provider
events, transcript, cancellation and overflow edits visible. Illustrative:
`npm run test:e2e -- 'e2e/launches/.*instruction-voice'` and
`npm run test:dashboard:integrated -- 'tests/launches/.*instruction-voice'` plus discovered
instruction recording callers.

Behavior: A developer reads an instruction voice case → follows recording and
editing operations around explicit provider answers → the source states the
expected instruction and recovery, with original draft/focus checks passing.

### 4. Express touch reachability of the same launch choices
Type: Behavior
Status: planned
Proof: Reuse touch/dialog operations for disclosure, scrolling and pressing;
retain actual gesture, viewport, reachability and focus expectations. Direct
measurement assertions keep independent bounds. Illustrative:
`npm run test:dashboard:integrated -- 'tests/launches/agent-launch-dialog-touch.spec.ts'` plus
layout/touch siblings using the changed controls.

Behavior: A developer reads a touch launch case → follows named dialog actions
while seeing actual modality and dimensions → the source explains the reachable
choice, and unchanged touch/layout/focus checks pass.

### 5. Express startup answers and the next recovery action
Type: Behavior
Status: planned
Proof: Shared result readers and retry/recheck/continue controls serve
preparation, responsive and frontend families. Keep native progress gates,
exact verification/refusal wording and release order explicit. Illustrative:
`npm run test:e2e -- 'e2e/launches/agent-launch-preparation' 'e2e/launches/responsive-session-recovery'`,
`npm run test:dashboard:integrated -- 'tests/launches/agent-launch-start-story-card.spec.ts' 'tests/launches/responsive-session-(access|recovery)'`,
`npm run test:dashboard:backend -- 'backend-tests/launches/agent-launch-preparation'` and
`npm run test:dashboard:frontend -- 'frontend-tests/startup-host-words.spec.ts'`.

Behavior: A developer reads a pending or refused startup case → follows named
answer observations and the explicit chosen recovery → the source states what
the user sees and does next, with the same host/HTTP/record evidence passing.

## Refinement and verification still required

Resume `dough-story-refinement`, realign this same plan, then perform slice-plan
refinement and record the assessment. This provisional plan grants no readiness,
Take or execution. Inspect current caller cohorts and observe cross-tier reuse
and causal progress operations before dependent readiness claims.

Use changed specs plus transitive consumers and `npm run typecheck:dashboard`
for shared TypeScript edits. Broader local checks require a shared-fixture or
consumer reason or another project requirement; CI alone does not impose a full
local suite. Arrange domain data through MakeMe while preserving driving facts,
exact inputs and independent expectations. Keep tiers, causal waits, controlled
clocks, holds and native/HTTP/Git/record evidence. Carry the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff. Keep default timeouts;
no wall-clock sleeps or `test.slow()`.
For long macOS runs start fully awake: on AC use `caffeinate -s -i`; on battery
plug in or keep the lid open under `caffeinate -i` and inspect sleep logs under
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
