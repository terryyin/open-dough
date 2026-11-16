# Replace native reader gaps when a session is read again

**Identity:** SEED-388#replace-native-reader-gaps-on-reread
**Source:** [Selected story](../../seeds/SEED-388-measure-and-control-agent-launch-cost.md#replace-native-reader-gaps-on-reread)

## Goal and scope

Import and Refresh replace a session's `malformed-native-row` and
`native-source-unreadable` gaps with the ones a reread still reports, for
Codex and Claude Code. Excluded: gaps already stored without a host (automatic
repair of stored history), any change to framing, lineage or reconciliation
rules.

## Provenance and current findings

Retrospective correction of SEED-388#read-claude-rows-with-unicode-line-separators,
reviewed commit `a3553a7ad` (story branch
`claude/read-claude-code-rows-that-contain-unicode-line`). The defect predates
that commit.

- `nativeUsageLines` in `dashboard/server/nativeUsageFiles.ts` pushes both gap
  codes with `source` only; every other Claude Code and Codex gap names its
  `host` (`claudeUsage.ts`, `codexUsage.ts`).
- `reconciledGaps` in `dashboard/server/usageGapReconciliation.ts` drops a
  stored gap only when `gapSessionKeys` finds a replaced session, and that
  returns nothing without `host`. So a host-less gap survives every reread,
  contrary to `dashboard/USAGE-HISTORY.md` ("with only the gaps it still
  reports").
- On 2026-11-16 the real-store import that restored SEED-124's responses left
  all 3,316 stored `malformed-native-row` gaps in place; the fixed reader reads
  all 79 of their files without a gap.

## Existing solution and architecture

PFE: the session-scoped replacement already exists (`reconciledGaps`,
`gapSessions`); the reader only has to name the host its callers already know.
`nativeUsageLines` has four callers: `codexUsage.ts` and `claudeUsage.ts`,
whose gaps reach the store, and `agentEffortClaudeWakes.ts` and
`agentEffortCodexWakes.ts`, which only test whether any gap occurred and keep
that behavior. No new module, dependency or ADR topic.

## Proof ownership

| Source promise / example | Slice and outside-in observation |
| --- | --- |
| A Claude Code row that was truncated at one import and complete at the next leaves no gap | 1: case in `dashboard/backend-tests/usage-history/native-line-separators.spec.ts` (or a cohesive sibling): MakeMe transcript with a truncated last row → `runImport` → one `malformed-native-row` naming `host: "claude"`; rewrite the file with the row complete → `runImport` → no `malformed-native-row`, the response counted |
| The same for a Codex rollout | 1: same pattern with `aCodexRollout` |
| Refresh replaces them the same way | 1: Refresh case beside `token-index-refresh-line-separators.spec.ts` |
| Host-less stored gaps stay | none: no code path changes them; stated exclusion |

## Decisive premises

Observed 2026-11-16 at `a3553a7ad`, Node v24.21.0.

| Premise / consuming operation | Result and limit |
| --- | --- |
| `nativeUsageLines` callers; slice 1 sizing | Four call sites, all in `dashboard/server`; the two agent-effort wake readers count gaps only, so naming the host changes nothing they observe. |
| A hosted reader gap resolves to its session; slice 1 | `gapSessions` with `host: "claude"` on a `…/<session>/subagents/agent-*.jsonl` path gives the session id; with `host: "codex"` on a `rollout-…-<thread>.jsonl.zst` path gives the thread id. Without a host, `gapSessionKeys` returns none. |

## Ordered slices

### 1. Name the host on native reader gaps
Type: Behavior
Status: planned
Proof: the cases above, fail-first on `a3553a7ad`; the whole
`dashboard/backend-tests/usage-history` directory; typecheck and lint.

Behavior: a native file whose row was malformed or unreadable at one read →
import or Refresh reads its session again → only the gaps it still has remain.

## Local gates and execution discipline

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Apply installed MakeMe selection before test edits. Keep default
timeouts and never `test.slow()`. Run
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --reporter=list`,
`npm run typecheck:dashboard` and `npm run lint`; full suites stay in hosted
CI. No long local run: sleep guard
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
applies only if one is added.

## Concerns

Refinement not needed: one Behavior slice with its proof cases named. This
review found no remaining slice-specific concern.

## Learnings

None yet.
