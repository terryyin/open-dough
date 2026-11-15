# Keep Claude coverage gaps current after Refresh

**Identity:** SEED-359#keep-claude-coverage-gaps-current-after-refresh
**Source:** [Keep Claude coverage gaps current after Refresh](../../seeds/SEED-359-claude-code-task-token-usage.md#keep-claude-coverage-gaps-current-after-refresh)

## Provenance and findings

Retrospective correction of
View token usage for dashboard-launched Claude Code tasks
(`5c16998bc:.planning/seeds/SEED-359-claude-code-task-token-usage.md#view-claude-code-task-token-usage`,
plan `5c16998bc:.planning/slice-plans/636-claude-code-task-token-usage/PLAN.md`; commits `83276a56`, `65210f8d`, `3f463b92`, `bbc0be6e`, landed in
`1e56a8f4`). Outcome review of `200392236..bbc0be6e` on 2026-11-15 found,
and the coordinator confirmed in the code:

1. **A Refresh before a launch's first response leaves it partial for good.**
   `claudeCoverage` (`dashboard/server/claudeUsageLineage.ts`, the
   `lineage.sessions` loop) emits `missing-root-transcript-usage` for any
   session whose root has no response yet, including a just-started launch
   whose transcript holds only its user row. Refresh keeps it for a known
   task (`knownGaps` in `usageRefresh.ts`), and `reconciledGaps`
   (`dashboard/server/usageHistory.ts`) only adds gaps, dropping none but an
   answered `no-attributable-response-usage`. Since slice 3 that code marks a
   task partial (`usageCoverageGaps`), so the launch stays partial and out of
   the moving average after its responses arrive, even after a re-import.
   Worker gaps (`missing-worker-evidence`, `incomplete-worker-evidence`)
   behave the same while a worker has not answered, and Codex's
   `no-response-usage-evidence` already follows the same pattern.
   `token-index-refresh-claude.spec.ts` writes a response before its first
   Refresh, so no case covers this.
2. **A Claude worker gap in a subagent file reaches no task.**
   `dashboard/server/usageTaskGaps.ts` finds a native-source gap's session with
   `containingCodexThread(gap.source.file)` for every host. A Claude root file
   resolves by accident of the trailing UUID; `<session>/subagents/agent-*.jsonl`
   resolves to `agent-*`. `containingClaudeSession` (`claudeUsageKeys.ts`)
   already maps both.
3. **The usage-history contract omits the stored split and Claude's tier.**
   `dashboard/USAGE-HISTORY.md` (session contributions paragraph and the
   grouping sentence) still describes four token subtotals and Codex
   `service_tier` only. The file is at 249 lines.
4. **Redundant Claude Usage E2E work.**
   `e2e/configuration/system-settings-usage-tools.spec.ts` test 1 proves
   tool choice, tariff label, model offers and detail, all already proved by
   `dashboard/frontend-tests/system-settings-usage-tool.spec.ts` and
   `dashboard/backend-tests/usage-history/token-index-claude.spec.ts`; test 2
   repeats the store-lock checking step that
   `e2e/configuration/system-settings-usage.spec.ts` and
   `dashboard/frontend-tests/system-settings-usage-checking.spec.ts` own.

## Preserved promises and constraints

- Every SEED-359 promise stays as observed in plan 636's source review (`5c16998bc:.planning/slice-plans/636-claude-code-task-token-usage/source-review.md`),
  including: a missing root transcript or worker that stays missing marks the
  task partial; the auxiliary limit is one cohort note, never a task gap; a
  session read again replaces its contribution; an unchanged Refresh leaves
  the store bytes unchanged.
- Codex answers stay unchanged; the offline import over unchanged native
  files produces the same store.
- One usage document, no database (ADR 0008); one representation per concept
  (ADR 0002): gap replacement follows the same session scope as contribution
  replacement, not a second rule per host.
- Files stay within 250 lines; `USAGE-HISTORY.md` is reworded in place.

## Proof ownership

| Finding / promise | Owning slice and observable proof |
| --- | --- |
| 1, 2: gaps current after a re-read; worker gap reaches its launch | 1: Backend Refresh over a user-only Claude root → task partial with `missing-root-transcript-usage`; append a response, Refresh → measured, in the average; a worker that answers later clears its worker gap; a subagent-file worker gap that stays makes its launch partial; a Codex session read again after its first response loses `no-response-usage-evidence`; existing usage-history specs (byte stability, earlier stores, coverage) stay green. |
| 3: contract names split and tier | 1: `USAGE-HISTORY.md` sentences reworded; file ≤250 lines. |
| 4: redundant E2E | 2: E2E test 1 and test 2's checking step removed; the surviving test 2 still imports, chooses Claude Code, Refreshes and shows the new point; frontend and backend specs named above still pass. |

## Ordered slices

Each slice targets 15 active minutes.

### 1. Replace a re-read session's coverage gaps
Type: Behavior
Status: planned
Proof: new backend cases in `dashboard/backend-tests/usage-history/`
(a sibling of `token-index-refresh-claude.spec.ts`, ≤250 lines) as in the
proof table; `npm run test:dashboard:backend -- --reporter=list usage-history`;
`npm run test:dashboard:frontend -- --reporter=list system-settings-usage`;
`npm run typecheck:dashboard`.

Behavior: a Claude launch is refreshed before its first response → partial;
its response arrives → next Refresh → measured and in the moving average.
`writeUsageHistory` replaces the stored gaps that name a session the batch
re-read (by `sessionId` or by a native source inside it), as it replaces that
session's contribution; gaps of sessions not re-read stay. `TaskGaps.record`
resolves a native-source gap's session by the gap's host
(`containingClaudeSession` for Claude). Reword the `USAGE-HISTORY.md`
contribution and gap sentences to say entries may keep the five-minute and
one-hour cache writes and that Claude's speed is the entry's tier, and that a
session read again replaces its gaps.

### 2. Keep one Claude Code Usage journey end to end
Type: Structure
Status: planned
Proof: `npm run test:e2e -- --reporter=list configuration/system-settings-usage`
with the surviving journeys passing; frontend `system-settings-usage` and
backend `usage-history` unchanged and green.

Remove `system-settings-usage-tools.spec.ts` test 1 and test 2's store-lock
checking step; keep test 2's import → choose Claude Code → Refresh → new point.
If a real-UI switch back to Codex is wanted, add one `choose("Tool","Codex")`
step to test 2 rather than a second journey.

## Local gates and execution discipline

Apply the linked [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Run Playwright with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES` and
`--reporter=list`. Per [AGENTS.md](../../../AGENTS.md), keep default
timeouts, never use `test.slow()`, and apply MakeMe and page-object selection
before test edits. The local-gate sleep guard is
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC wrap long or full runs in `caffeinate -s -i`.
