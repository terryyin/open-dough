# Express Session discovery and report test intent

**Identity:** SEED-300#express-session-test-intent-through-page-objects
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-session-test-intent-through-page-objects)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Goal and provisional scope

A developer can follow which session a case discovers, acts on or reads,
without rebuilding shared row, sidebar and report mechanics. Receive the
original findings **Session rows, actions and membership**; **Sessions sidebar
and Running Cursor sessions**; **Final report, retained sessions and workspace
retirement**, including every affected sibling caller and both frontend and
integrated host-status readers.

The original audit was at `7eab3d6ca`; current inspection was at `9779b93c1`.
There was no original executable plan: these slices provisionally receive
findings, not invented original slices. Refinement must confirm examples,
proof ownership and caller inventory before making this executable.

Preserve session IDs, exact report text, states and badges, placement, separate
observations of the same session in different surfaces, and retirement evidence.
Selecting a session and opening its Final report remain distinct operations.
Terminal controls belong to the Terminal story; reuse their accepted owner
without moving native/PTY evidence into this story's reading helpers.

## Architecture and existing owners

Reuse `dashboard/tests/sessionsSidebarPage.ts`,
`recentlyDoneSessionsSidebarPage.ts`, `runningCursorSessionsPage.ts`,
`cursorSessionsSidebarResizePage.ts`, `storyCardSessionListing.ts`,
`support/sessionEntryDisclosure.ts`, `support/sessionHostStatus.ts`,
`support/unreadReportPage.ts`, `support/reportTouchPage.ts` and
`finalReportPages.ts`, with the existing mark-done helpers owning their causal
answer waits. Host-status display assertions can be shared without sharing
frontend synthetic setup with integrated servers.

[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
distinguishes Session entry from Story card, local session evidence from story
membership, and selecting a retained session from changing the Side panel.
Preserve those meanings. Evaluate clarity, selector edit sites and helper cost
against the audit under [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

No inspected expected owner exceeds 250 lines; `sessionsSidebarPage.ts` has
238 and `runningCursorSessionsPage.ts` has 232. Keep open, Recently done,
Running Cursor, resizing and report responsibilities on their existing seams.

## Provisional slices and proof ownership

Commands illustrate proof cohorts until refinement verifies actual selections
and transitive consumers. Each slice resolves its receiving finding/callers and
retains independent assertions with a representative source comparison.

### 1. Express Session entry actions and placement through shared owners
Type: Behavior
Status: planned
Proof: Reuse row/disclosure/mark-done operations for open, inspect,
confirm/cancel, Done/Delete and placement. Preserve separate surface checks and
expected state/session facts. Illustrative: `npm run test:dashboard -- 'tests/sessions/compact-session-entry.spec.ts' 'tests/sessions/agent-launch-story-card-(sessions|delete)' 'tests/sessions/session-column-membership.spec.ts' 'tests/sessions/session-unread-report.spec.ts' 'tests/sessions/cursor-session-recovery-stops.spec.ts'`.

Behavior: A developer reads a Session entry case → follows named actions and
placement observations → the source explains which session changes where,
and unchanged UI plus kept-record checks distinguish the same outcomes.

### 2. Express Sessions sidebar reading and host figures across both tiers
Type: Behavior
Status: planned
Proof: Share row/keyboard/paging/retained-scroll observations and the duplicated
host-figure contract; expected count and accessible words stay caller-supplied.
Frontend fixtures remain independent. Illustrative:
`npm run test:dashboard -- 'tests/sessions/sessions-sidebar' 'tests/sessions/recently-done-sessions-sidebar' 'frontend-tests/sessions-sidebar-host-status.spec.ts'`.

Behavior: A developer reads sidebar navigation or host-status cases → follows
shared sidebar observations around explicit keys and clock/read events → the
source states retained position and shown figures, with original checks passing.

### 3. Express Running Cursor discovery and resize through its existing owner
Type: Behavior
Status: planned
Proof: Share repeated list opening, selection and resize observations; retain
input modality, geometry, focus and native runner/session evidence. Illustrative:
`npm run test:dashboard -- 'tests/sessions/cursor-sessions-sidebar' 'frontend-tests/cursor-runner-sessions-ui.spec.ts'` plus discovered Running Cursor callers.

Behavior: A developer reads a Running Cursor case → follows named list and
resize operations → the source exposes the selected session and reachable
controls, and unchanged UI/native checks still distinguish them.

### 4. Express retained selection and Final report reading distinctly
Type: Behavior
Status: planned
Proof: Report/session owners expose panel title, session identity, exact report
and read/open/close actions. Keep retirement/attachment, completion receipts and
independent record evidence explicit. Illustrative:
`npm run test:dashboard -- 'tests/sessions/recently-done-sessions-select.spec.ts' 'tests/sessions/final-report-touch.spec.ts' 'tests/sessions/agent-completion-attention.spec.ts' 'tests/sessions/session-workspace-retirement'`.

Behavior: A developer reads a retained-session/report case → follows distinct
selection and report-opening operations → the source states what selection,
text and retired-workspace evidence persist, with original checks passing.

## Refinement and verification still required

Resume `dough-story-refinement`, realign this same plan, then run slice-plan
refinement and record the assessment. This provisional plan supplies no
readiness, Take or execution authority. Observe current caller cohorts and
cross-tier reuse through the consuming operation before readiness.

Use changed specs plus transitive consumers and `npm run typecheck:dashboard`
for shared TypeScript edits. A broader local gate needs a changed shared
fixture/consumer or another requirement; CI configuration alone does not impose
a full local suite. Use MakeMe for domain data while leaving driving facts,
exact inputs and independent expectations at the call site. Preserve tiers,
causal waits, controlled clocks, helds and native/HTTP/Git/record evidence.
Follow the [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written in every delegation and repair handoff. Keep default timeouts;
no wall-clock sleeps or `test.slow()`.
For long macOS runs start fully awake: on AC use `caffeinate -s -i`; on battery
plug in or keep the lid open under `caffeinate -i` and inspect sleep logs under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
