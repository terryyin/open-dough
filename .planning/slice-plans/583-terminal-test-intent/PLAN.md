# Express Terminal test intent through shared controls

**Identity:** SEED-300#express-terminal-test-intent-through-page-objects
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-terminal-test-intent-through-page-objects)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Goal and provisional scope

A developer can follow the session, input, output and recovery a Terminal case
proves while shared screen/input mechanics have one maintained owner. Receive
the original **Terminal input and output** finding, including all 63 audited
browser-spec callers and any same-sequence siblings across Terminal, launch,
session, navigation, configuration and frontend tests. Keep each test in its
current tier; sharing a control does not merge its independent proofs.

The source audit was at `7eab3d6ca`; current inspection was at `9779b93c1`.
No original executable plan existed: these are receiving findings and
provisional proof loops, not mapped original slices. Story refinement must
confirm examples and the complete current caller inventory before execution.

Preserve exact command bytes, output, draft text, focus, session identity,
prompt/trust/ended-input distinctions, native attach/PTY evidence and transport
observations. The Launch story owns its dialog attachments; this story owns
Terminal screen/input controls wherever their callers live.

## Architecture and existing owners

Reuse `dashboard/tests/terminalPages.ts`, `terminalPastePage.ts`,
`touchTerminalPage.ts`, `touchTerminalSoftKeyboardPage.ts`, and
`support/terminalVoicePage.ts`, with existing Terminal boundary/transport
fixtures retaining their own evidence. Reading screen text is different from
observing the native host receive bytes. Keep those observations independent.

[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
distinguishes Session entry, Terminal content and Side panel frame; preserve
their ownership and selection semantics. Under
[ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md),
compare reader clarity, shared-selector edit sites and helper maintenance cost
with the audit baseline. A fluent conversion is a candidate only where its
shared-control or handoff gain pays for the added code.

No inspected expected helper owner exceeds 250 lines. Current owners already
separate Terminal screen, paste, touch, soft keyboard and voice responsibilities.
Do not replace those seams with one large universal Terminal journey helper.

## Provisional slices and proof ownership

Selections below illustrate each proof loop; refinement must locate every
affected caller, including the 63 audited specs, and add transitive consumers.
Every slice retains original assertions and records its caller disposition,
representative source comparison and shared-selector ownership evidence.

### 1. Name Terminal screen and session identity observations
Type: Behavior
Status: planned
Proof: One shared owner reads screen output and Terminal identity and composes
existing panel entry/close controls. Exact output and session IDs stay in cases;
native attachments and kept records stay outside screen readers. Illustrative:
`npm run test:dashboard -- 'tests/terminals/agent-terminal-(codex-page|cursor-page|cursor-launch-page)' 'tests/navigation/side-panel-content-switching.spec.ts'`.

Behavior: A developer reads a Terminal opening or replacement case → follows
named screen/session observations → the source identifies the expected session
and text, and unchanged browser plus native identity checks pass.

### 2. Express keyboard, prompt and ended-input recovery scenarios
Type: Behavior
Status: planned
Proof: Shared input/draft/focus operations serve keyboard, trust/prompt and
ended-input callers without hiding key sequences, WebSocket frames or PTY
lines. Illustrative: `npm run test:dashboard -- 'tests/terminals/agent-terminal-keyboard.spec.ts' 'tests/terminals/agent-terminal-cursor-trust-page.spec.ts' 'frontend-tests/terminal-prompts-recovery.spec.ts'`.

Behavior: A developer reads a keyboard or recovery case → follows named
Terminal actions around the explicit input sequence → the source states which
input reaches which session and recovery state, with original evidence passing.

### 3. Express touch, composition and soft-keyboard interactions
Type: Behavior
Status: planned
Proof: Reuse touch and soft-keyboard owners for Terminal draft and reachability;
retain gesture, viewport, focus and keyboard-fit expectations. Illustrative:
`npm run test:dashboard -- 'tests/terminals/agent-terminal-touch'` plus all
discovered compose and soft-keyboard callers.

Behavior: A developer reads a touch/composition case → follows the named
Terminal interaction while seeing the actual modality → the source explains
the retained draft and reachable controls, and the same input/layout checks pass.

### 4. Express paste through the existing Terminal paste owner
Type: Behavior
Status: planned
Proof: Migrate repeated screen/input plumbing in paste callers; keep exact
payload, clipboard/provider faults, sent bytes and draft expectations explicit.
Illustrative: `npm run test:dashboard -- 'frontend-tests/agent-terminal-touch-paste-image.spec.ts' 'tests/terminals/.*paste'`.

Behavior: A developer reads a Terminal paste case → follows a shared paste
operation with the case's explicit payload → the source states what is inserted
or refused, and the independent draft/transport evidence still distinguishes it.

### 5. Express Terminal voice input and recovery
Type: Behavior
Status: planned
Proof: Extend the existing Terminal voice owner with common control/draft
observations; retain recording, cancellation, provider answers and expected
transcript or command as case facts. Illustrative:
`npm run test:dashboard -- 'tests/terminals/.*voice'`.

Behavior: A developer reads a Terminal voice case → follows named recording and
editing operations around explicit provider events → the source states the
resulting input or recovery, and original voice/draft/native checks pass.

## Refinement and verification still required

Resume with `dough-story-refinement`, realign this same plan, then perform
slice-plan refinement and record the assessment. This provisional plan grants
neither readiness nor execution.

Refinement must reconcile all audited and current sibling callers, inspect
shared-control compatibility across frontend/integrated tiers, and confirm
which focused commands consume each changed helper. Run changed specs plus
transitive consumers and `npm run typecheck:dashboard` for shared TypeScript
changes. A full local suite needs an actual shared fixture/consumer reason or
another project requirement; CI configuration alone does not impose it.

Use shared MakeMe for domain data while keeping driving facts, exact inputs and
independent expectations at the call site. Preserve tiers, causal waits,
controlled clocks, held responses, HTTP/Git/record and native/PTY evidence.
Follow the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written in every delegation and repair handoff. Keep default timeouts;
no wall-clock sleeps or `test.slow()`.
For long macOS runs start fully awake: on AC use `caffeinate -s -i`; on battery
plug in or keep the lid open under `caffeinate -i` and inspect sleep logs under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
