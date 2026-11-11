# Express Board, navigation and published-read test intent

**Identity:** SEED-300#express-board-test-intent-through-page-objects
**Source:** [Story](../../seeds/SEED-300-dashboard-test-page-objects.md#express-board-test-intent-through-page-objects)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Goal and provisional scope

A developer can follow Board reading, navigation choices and the published
facts a case proves. Shared controls and repeated browser measurements have
one maintained owner while causal evidence remains legible.

Receive all six original findings: **Board columns and accessible reading**;
**Project choice, header and destination focus**; **Story inspection and
references**; **Story card evidence**; **Recently done stories**;
**Published facts, refresh and read recovery**. Include every same-sequence
sibling caller, including cross-family reference and retained-session callers.

The source audit was at `7eab3d6ca`; current inspection was at `9779b93c1`.
There was no original executable plan; this provisional plan maps findings,
not fictional original slices. Refinement must confirm the examples and exact
proof cohorts before realigning this plan for execution.

Preserve independent ordering, viewport, key/gesture, focus, selected story,
actor/link/status/slice-count and malformed-record expectations. Held reads,
controlled clocks, request logs and pinned revisions remain at the boundary
whose causal sequence they prove. No product navigation change is promised.

## Architecture and existing owners

Reuse `dashboard/tests/boardPage.ts`, `boardColumnNavigation.ts`,
`projectChoice.ts`, `storyCardControls.ts`, `storyCardSelection.ts`,
`storyCardPages.ts`, `recentlyDoneProgressivePage.ts`, `dashboardPage.ts` and
`transientRecoveryPage.ts`; retain their existing layout, selection, column,
card and recovery responsibilities. Existing reference helpers are reuse leads
to inspect, rather than a reason to add an omnibus Board page object.

[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
distinguishes Inspect from Selected story and authoritative published facts
from presentation/local evidence. Keep those meanings in shared operations.
[ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires a gain against the audit baseline that justifies helper cost.

No inspected expected owner exceeds 250 lines; `dashboardPage.ts` is exactly
250 and already composes `dashboardParts.ts`. Preserve its seams;
`boardPage.ts` already delegates column navigation to `boardColumnNavigation.ts`.

## Provisional slices and proof ownership

Commands are illustrative until refinement verifies their actual selection and
all transitive consumers. Each slice resolves its finding and discovered
sibling callers with retained assertions and representative before/after proof.

### 1. Read and page named Board columns through shared operations
Type: Behavior
Status: planned
Proof: Shared Board operations own repeated scroll, paging and reachability
mechanics; expected column order, input modality and geometry stay explicit.
Illustrative: `npm run test:dashboard -- 'tests/navigation/board-(scroll|paging|reading)' 'tests/navigation/accessible-board'`.

Behavior: A developer reads a Board reading case → follows named column and
paging actions → the source exposes the reading destination and retained
position, and unchanged browser layout/focus checks pass.

### 2. Express project, header and destination-focus navigation
Type: Behavior
Status: planned
Proof: Reuse project/frame/navigation controls, preserving actual key order,
project, destination and sanitized-link expectations. Illustrative:
`npm run test:dashboard -- 'tests/navigation/dashboard-header' 'tests/navigation/project-keyboard-navigation' 'tests/navigation/notification-story-navigation.spec.ts' 'tests/navigation/source-navigation.spec.ts'`.

Behavior: A developer reads a destination case → follows named project or frame
navigation → the source states the expected arrival and focus, with original
URL, link, focus and reading-place checks still distinguishing outcomes.

### 3. Express inspection and reference journeys without hiding interruption
Type: Behavior
Status: planned
Proof: Share card/reference operations; keep pointer-down and release separately
invocable so a held answer can arrive between them. Preserve the case's
superseding choice, focused action and notice expectations. Illustrative:
`npm run test:dashboard -- 'tests/navigation/story-card-(selection|dependency-selection)' 'tests/navigation/story-reference'`.

Behavior: A developer reads a pending reference case → follows named reference
actions around explicit hold/release and user interruption → the source explains
which choice wins, and original selection/focus/notice checks pass.

### 4. Read published Story card evidence through card and roster owners
Type: Behavior
Status: planned
Proof: Shared card/roster readers own repeated subregion and badge/avatar
mechanics; expected actor, ordering, links, statuses and slice counts remain
independent. Illustrative: `npm run test:dashboard -- 'tests/stories/backlog-preparing.spec.ts' 'tests/stories/story-(readiness|dependencies)' 'tests/stories/agent-roster' 'tests/stories/taken-slice-progress.spec.ts' 'tests/stories/branch-progress-reading.spec.ts'`.

Behavior: A developer reads a card-evidence case → follows named evidence
observations → the source identifies the expected published facts or malformed
record, and the unchanged display and source-boundary checks pass.

### 5. Express Recently done range and retained-position reading
Type: Behavior
Status: planned
Proof: Extend existing progressive Board operations for range/count, wheel,
collapse and focus; distinguish showing fewer entries from abandoning a pending
reference. Keep answering requests and expected entry order explicit.
Illustrative: `npm run test:dashboard -- 'tests/stories/recently-done-progressive' 'tests/stories/recently-done-read-latency.spec.ts'` plus affected reference/session consumers.

Behavior: A developer reads a retained-range case → follows named range and
reading actions → the source exposes which entries and position survive, and
the original request, order and focus checks pass.

### 6. Read retained published facts and recovery around explicit answers
Type: Behavior
Status: planned
Proof: Extend dashboard/recovery observations for visible facts, notices,
placeholders, focus and scroll; keep controlled clocks, request logs and pinned
revision sequences outside them. Illustrative:
`npm run test:dashboard -- 'tests/observation/published-facts' 'tests/observation/steady-refresh' 'tests/observation/auto-refresh-(recovery|rate-limit)' 'tests/observation/profile-addition-latency.spec.ts' 'tests/observation/transient-credit-recovery.spec.ts'`.

Behavior: A developer reads a held published-read case → follows named visible
fact observations before and after explicit answer release → the source states
what remains and what changes, with the original causal evidence passing.

## Refinement and verification still required

Resume `dough-story-refinement`, realign this same plan, then run slice-plan
refinement and record the preparation assessment. No execution or readiness is
authorized by this provisional plan. Refinement must inspect the current
caller cohorts and settle reuse premises through the consuming operations.

Use changed specs and transitive consumers, plus `npm run typecheck:dashboard`
for shared TypeScript changes. Broader local checks require a changed shared
fixture/consumer or another project requirement, not merely CI configuration.
Arrange domain data through MakeMe; retain driving facts, exact inputs and
independent expectations. Preserve test tiers, causal waits, helds, controlled
clocks and native/HTTP/Git/record evidence. Carry the
[failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
as written into every delegation and repair handoff. Keep default timeouts;
no wall-clock sleeps or `test.slow()`.
For long macOS runs start fully awake: on AC use `caffeinate -s -i`; on battery
plug in or keep the lid open under `caffeinate -i` and inspect sleep logs under
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
