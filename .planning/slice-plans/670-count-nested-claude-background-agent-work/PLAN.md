# Count a Claude Code background agent started by a subagent

**Identity:** SEED-388#count-nested-claude-background-agent-work
**Source:** [Selected story](../../seeds/SEED-388-measure-and-control-agent-launch-cost.md#count-nested-claude-background-agent-work)

## Goal and scope

A Claude Code response in any worker transcript climbs to its launch through
each worker's own recorded agent result, wherever that result is recorded, so
Usage counts background agents started by subagents. A worker without an agent
result keeps today's unresolved lineage and `unjoined-worker-evidence` gaps.
Import and Refresh share the rule; existing stores gain the responses on their
next import. The source owns the exclusions: no automatic history repair, no
join through `subagents/*.meta.json`, and no Codex change.

## Existing solution and architecture

PFE: the climb in `dashboard/server/claudeUsageAncestry.ts` already follows
worker joins recorded by `recordClaudeNode` in
`dashboard/server/claudeUsageLineage.ts`. Node keys already carry the agent of
their transcript (`claudeNodeKey`). Correct the one lookup that uses the
starting response's agent so it uses the agent of the transcript being climbed.
Add no new evidence source or reader. Codex's `codexAncestry` already walks
each session's own parent and is unaffected.

The change stays inside the Claude reader's lineage. Usage history remains a
derived, local read model ([ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
Synthetic fixtures and retained native transcripts are the proof; no paid
session is needed ([ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)).
No North Star topic applies.

## Current decisions

- **Climb key.** At a worker transcript's first row, look up the worker join for
  the agent in that row's node key, not the measurement's agent. Shared
  ancestors are still visited once, and a cycle is still unresolved.
- **Documentation.** In `dashboard/USAGE-HISTORY.md`, the worker-join sentence
  says that a worker joins through its own recorded agent result. That result
  may be in the root transcript or another worker's transcript, at any depth.
- **Real-store evaluation.** Back up this machine's `usage.json` first, then
  run one `import`. This follows the store recovery rule in
  `dashboard/USAGE-HISTORY.md`. Refresh alone does not reread finished
  sessions.

## Decisive premises and preparation observations

| Premise / consuming operation | Result |
| --- | --- |
| The lookup at a worker's first row causes the loss in the import's own reader | Settled 2026-11-16 at `ece4addef`. A scratch esbuild bundle of `claudeUsage`, `claudeLineage` and `claudeAncestry` (the functions `usageImport.ts` and `usageRefresh.ts` call through `claudeAssociation`) read session `50829ac2…` → 311 root and 2,639 worker measurements reached a root and 595 worker measurements were unresolved. With the scratch climb-key edit (reverted), all 3,234 worker measurements reached a root, and root counts were unchanged. |
| The second-level agent's join is recorded in its parent worker's transcript | Settled 2026-11-16. Agent `a3c1825c…` (`spawnDepth` 2, `parentAgentId` `aef2d680…`) has its `toolUseResult` `{status: "async_launched", agentId}` row in `subagents/agent-aef2d6806e3ccac3e.jsonl`. |
| No other loss affects SEED-334's launch | Settled from the analysis: 56.33M + 17.70M (846 second-level responses) = 74.03M transcript cost. A transcript-level replay recovers all 846 responses. |
| Discrimination of the new spec | Observed at execution: the spec is written first and must fail on the current climb key. |

## Ordered slices

### 1. Join a second-level background agent's responses to its launch

Type: Behavior
Status: planned
Proof: a focused backend spec, then a real-store import.

Behavior: a launch whose coordinator starts worker A, and A starts background
worker B with B's `async_launched` agent result in A's transcript → import (and
Refresh, through the shared association) assigns B's responses to the launch,
with no `unresolved-native-task-lineage` on them. Removing B's agent result
leaves B's responses unassigned with `unresolved-native-task-lineage`, and
`unjoined-worker-evidence` names B.

## Proof ownership

| Source example | Slice and observation |
| --- | --- |
| Second-level agent joins through its parent worker's agent result | 1: new case in `dashboard/backend-tests/usage-history/claude-usage.spec.ts` (built with the existing `writeClaudeSession`/`nativeFile` harness and MakeMe launch record). It writes a root, worker A and worker B under `<session>/subagents/` and runs `runImport`. `taskUsage` includes B's response, and B's observation has no unresolved-lineage gap. It fails on the current code. |
| Missing join keeps explained gaps | 1: same file; B's transcript is present with no agent result → B's response is unassigned with `unresolved-native-task-lineage`, and the import's gaps include `unjoined-worker-evidence` |
| First-level agent unchanged | 1: the existing `claude-usage.spec.ts` and `claude-coverage.spec.ts` cases pass unchanged |
| SEED-334's launch matches 74.03M after one import | 1: back up `~/.open-dough/dashboard/launch-history/usage.json` (`usageHistoryFile`), run `node dashboard/server/importUsageHistory.ts import --since '2026-09-16T00:00:00+08:00'`, and read SEED-334#run-and-observe-product-wide-end-to-end-tests' Claude Code total (`taskUsage`) → about 74.03M. Record the figure, the other two affected sessions' change, and that no launch dropped. |

## Concerns and cumulative design

Slice-plan refinement was not needed: one rule change, one proof loop and one
real-store observation. This review identified no remaining slice-specific
concern.

## Local gates and execution discipline

- Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written.
- Before test edits, apply the installed
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) selection. No
  browser test is added.
- Keep default timeouts and never use `test.slow()`.
- Run focused proof with `bash scripts/test.sh` on
  `dashboard/backend-tests/usage-history/claude-usage.spec.ts` and
  `claude-coverage.spec.ts`. Full suites stay in hosted CI.
- Local-gate sleep guard: see
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Wrap the real-store import (about 9 minutes) in `caffeinate -s -i` on AC
  power.

## Learnings

None beyond the preparation observations above.
