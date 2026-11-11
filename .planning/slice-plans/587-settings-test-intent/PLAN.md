# Express Settings test intent through shared controls

**Identity:** SEED-300#express-settings-test-intent-through-page-objects
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-settings-test-intent-through-page-objects)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Goal and provisional scope

A developer can follow project-management and Settings choices, recovery and
appearance expectations without rebuilding repeated controls or observations.
Receive **Projects and settings navigation** and **Settings controls and
appearance**, including same-sequence sibling callers, touch management,
frontend system appearance and integrated Intent dark appearance.

The source audit was at `7eab3d6ca`; current inspection was at `9779b93c1`.
There was no original executable plan. These slices receive findings, not
invented original slices; refinement must confirm the examples and proof
cohorts before realigning this same plan for execution.

Preserve exact project URL/path, chosen project and option, focus destination,
credential refusal/recovery words, filesystem evidence, color scheme and
dimensions where they drive the case. Browser measurement utility contracts
belong to their separate receiving story. This story changes test expression
and ownership, with product Settings behavior preserved.

## Architecture and existing owners

Reuse `dashboard/tests/support/systemSettingsPage.ts`, `projectAddPage.ts`,
`settingsTouchPage.ts`, `openAISettingsPage.ts`, `terminalThemeSettingsPage.ts`,
and `dashboard/tests/systemAppearanceReading.ts` and
`feedbackMaintenanceDuePage.ts`. Share control reading and interaction while
retaining fixture preparation and exact expected values in their own cases.

[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps project configuration machine-local and distinct from repository-owned
workflow facts. Preserve that boundary in filesystem and browser evidence.
[ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires a worthwhile gain in reader clarity and control edit ownership that
justifies helper cost against the audit baseline.

No inspected expected owner exceeds 250 lines. Existing Settings owners are
small and already separate project management, credential controls, terminal
theme, touch and appearance reading; extend the matching responsibility.

## Provisional slices and proof ownership

Selections below are illustrative until refinement verifies current cases and
transitive consumers. Every slice retains independent expectations and records
its finding/caller disposition and representative before/after source proof.

### 1. Express project management and return navigation through shared owners
Type: Behavior
Status: planned
Proof: Shared rows, add dialog, remove/hide/show controls and Board return
operations serve pointer and touch callers. Keep project URL/path, chosen
project, focus destination and filesystem evidence explicit. Illustrative:
`npm run test:dashboard -- 'tests/configuration/project-(add|remove|hide)' 'tests/configuration/system-settings-project-management'`.

Behavior: A developer reads a project-management case → follows named Settings
and dialog operations → the source states the expected project and return
destination, and unchanged UI/filesystem/focus checks distinguish the result.

### 2. Express credential status and recovery without hiding provider facts
Type: Behavior
Status: planned
Proof: Reuse existing Settings credential controls for selection, status and
recovery; keep exact refusal/provider answers and persisted evidence separate.
Illustrative: `npm run test:dashboard -- 'tests/configuration/system-settings-openai'`.

Behavior: A developer reads a credential recovery case → follows named control
actions around explicit provider results → the source explains the expected
status and next action, with unchanged refusal/storage checks passing.

### 3. Express preference and appearance reading across affected surfaces
Type: Behavior
Status: planned
Proof: Shared Settings/appearance observations cover selected options,
maintenance status, focus, visibility and contrast. Preserve expected values,
color scheme and relevant dimensions. Terminal screen controls reuse the
Terminal owner. Illustrative:
`npm run test:dashboard -- 'tests/configuration/system-settings-terminal-theme' 'tests/configuration/system-settings-feedback-maintenance.spec.ts' 'frontend-tests/dashboard-system-appearance.spec.ts' 'tests/intent/intent-story-dark-appearance.spec.ts'`.

Behavior: A developer reads a preference or appearance case → follows named
option and reading observations → the source states the chosen value and
independent visibility/contrast expectation, with original browser checks passing.

## Refinement and verification still required

Resume `dough-story-refinement`, realign this same plan, then perform slice-plan
refinement and record the assessment. This provisional plan grants no readiness,
Take or execution. Refinement must observe the current caller cohorts,
cross-tier helper compatibility and each consuming proof operation.

Use changed specs plus transitive consumers and `npm run typecheck:dashboard`
for shared TypeScript edits. A broader local gate needs a changed shared
fixture/consumer or another requirement; hosted CI alone does not impose a full
local suite. Use MakeMe for domain data while leaving driving facts, exact
inputs and independent expectations at the call site. Preserve tiers, causal
waits, controlled clocks, helds and native/HTTP/Git/record evidence. Carry the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff. Keep default timeouts;
no wall-clock sleeps or `test.slow()`.
For long macOS runs start fully awake: on AC use `caffeinate -s -i`; on battery
plug in or keep the lid open under `caffeinate -i` and inspect sleep logs under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
