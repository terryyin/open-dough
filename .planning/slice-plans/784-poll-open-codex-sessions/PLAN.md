# Keep open Codex session status current

**Identity:** SEED-424#poll-open-codex-sessions
**Source:** [Keep open Codex session status current](../../seeds/SEED-424-poll-open-codex-sessions.md#poll-open-codex-sessions)

## Goal and scope

The Board and Sessions sidebar show live Codex status for dashboard-tracked
open work. Recently done displays saved outcomes. Dashboard terminal reopen
makes that same conversation open again. Other host observation, the
retained-history payload, and its delivery transport have their own scope.

## Current decisions

- Use the existing Done timestamp as the source for membership in the recurring
  Codex read. The shared machine-session observation owns that choice. Keep
  retained records in the overview and history and feed open Codex targets to
  the existing bounded reader. The same observation serves the notification
  consumer. Preserve the single-record read through terminal admission and
  reuse the terminal's ready transition that clears Done. This applies
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  and [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  by keeping the recorded dashboard disposition and native evidence at their
  owning boundaries.
- Derive a Done Codex row and its saved outcome from the kept record. Check
  consumers of the observation state for access, follow-up, Delete record,
  attention and active counts. A skipped read makes the saved Codex record
  eligible for on-demand continuation through the existing terminal check;
  confirmed workspace retirement still routes to the final report. Keep
  action decisions grounded in the record or a fresh observation. In
  particular, use the current deletion rule at explicit admission and keep
  polling omissions from introducing Delete record actions for Done Codex
  entries. Retire the Codex presentation of a running native turn beside Done
  and the assertions that establish it. Retain independent proof for other
  hosts.
- Apply the Architectural North Star's
  [Make production code directly testable instead of growing test support](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Use a typed production observation entry and a recording native boundary
  for the exact target set. Reuse the existing browser journey for visible
  terminal readiness and reopen.
- Local gate — focused dashboard backend Vitest proof and affected E2E
  readers, plus `npm run typecheck:dashboard`. Use default test timeouts,
  `caffeinate -s -i` on AC, or start fully awake with the lid open under
  `caffeinate -i` on battery and check the sleep log afterwards.
  Apply the maintained
  [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  and [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).

## Outside-in proof

| Setup and action | Observable result |
| --- | --- |
| Read Sessions with older Done Codex conversations and one newer open conversation. Set a Done native conversation to active and the open one to working. | The exact native status-read target list contains only the open conversation. The open row reads Working and the retained row reads Done. |
| Open the retained session in the dashboard from Recently done. Run the existing failed and successful reopen journey. | The failed attempt leaves the Done row in place. The successful attempt opens the original history and restores the same identity to the open list. Its next overview read again includes it in the live target list. |
| Read a retained Codex report after workspace retirement. | The selected entry reads Done and the dedicated report returns the retained answer. |

The comparison is recurring native targets before and after on the same saved
records. The production baseline in the seed establishes the cost and
timing of the old batch, following [ADR 0010, Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
The regression uses exact observed identities and row states, with timing
measurements kept as evidence rather than a gate.

## Slices

### 1. Live checks follow open Codex work through Done and reopen

Type: Behavior
Status: planned

Use the recurring selection entering
[`AgentLaunches.machineSessions`](../../../dashboard/server/agentLaunches.ts)
and the [state join](../../../dashboard/server/launchStates.ts) to keep native
reads focused on open Codex sessions. Use the existing Done presentation
and saved record to show the retained outcome. Terminal admission still
reads the selected conversation and
[terminal readiness](../../../dashboard/server/joinedSockets.ts) clears Done
for its successful reopen. Reuse the retained-report path. Remove the
superseded Codex code, tests, and fixture setup within this slice. Keep
assertions affirmative, using complete expected values for the sampled IDs,
row status and reopen outcome.

**Proof.** Reproduce the target-list mismatch at the production observation
entry in Node Vitest. Run the updated case with the expected target list and
Done/Working results, including the post-reopen membership. Run the dashboard
backend runner for that case and reached session-reading and attachment
admission specs. Run the existing
[`agent-terminal-done-codex-page`](../../../e2e/sessions/agent-terminal-done-codex-page.spec.ts)
journey and the reached
[`agent-completion-quiet-done`](../../../e2e/sessions/agent-completion-quiet-done.spec.ts)
and [`recently-done-one-shot-review`](../../../e2e/review/recently-done-one-shot-review.spec.ts)
cases through the E2E runner. Replace the obsolete Codex cue expectations
with exact Done wording while retaining their report and review proof.
Trace the changed observation and Done outputs to their other consumers
before accepting the proof. Run the typecheck in the local gate.

**Sizing.** One rule change, its owning presentation, and a focused proof
loop fit the 15 active-minute slice. The existing reopen and report entry
points supply the behavioral seams.

## Learnings

Production passed 427 saved Done records through every ordinary Codex
observation, ahead of newer open sessions. A successful dashboard attach
already clears the saved Done mark. The dedicated report read already
handles a retired workspace.

## Readiness review

The plan has one cohesive slice, a deterministic native target assertion,
and an existing reopen journey. The slice plan stands as written.
