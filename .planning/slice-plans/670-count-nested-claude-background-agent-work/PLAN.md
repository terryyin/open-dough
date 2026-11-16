# Count a Claude Code background agent started by a subagent

**Identity:** SEED-388#count-nested-claude-background-agent-work
**Source:** [Selected story](../../seeds/SEED-388-measure-and-control-agent-launch-cost.md#count-nested-claude-background-agent-work)
**Source review:** [source-review.md](source-review.md)

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

- **Fork-replayed responses (developer decision, 2026-11-16).** Slice 1 is extended so that the 846 second-level responses the key example promises are counted. A forked worker's transcript replays its parent's rows with their native identities. A response read from several transcripts belongs to the one reading agent whose transcript every reading's climb passes through. Its measurements are restated as that agent's (`dashboard/server/claudeUsageReplay.ts`) and the observation is reconciled again. Any other lineage conflict, or an unresolved reading, still leaves it `contradictory-lineage`. No `meta.json` evidence is used.

## Decisive premises and preparation observations

| Premise / consuming operation | Result |
| --- | --- |
| The lookup at a worker's first row causes the loss in the import's own reader | Settled 2026-11-16 at `ece4addef`. A scratch esbuild bundle of `claudeUsage`, `claudeLineage` and `claudeAncestry` (the functions `usageImport.ts` and `usageRefresh.ts` call through `claudeAssociation`) read session `50829ac2…` → 311 root and 2,639 worker measurements reached a root and 595 worker measurements were unresolved. With the scratch climb-key edit (reverted), all 3,234 worker measurements reached a root, and root counts were unchanged. |
| The second-level agent's join is recorded in its parent worker's transcript | Settled 2026-11-16. Agent `a3c1825c…` (`spawnDepth` 2, `parentAgentId` `aef2d680…`) has its `toolUseResult` `{status: "async_launched", agentId}` row in `subagents/agent-aef2d6806e3ccac3e.jsonl`. |
| No other loss affects SEED-334's launch | **False (2026-11-16, execution).** After the climb fix, one real-store import shows SEED-334 at 67.84M with 3,294 responses, against 56.33M and 2,699 before. A scratch import of only session `50829ac2…` gives the same split: 3,293 assigned and 251 unassigned. Every measurement of the 251 reaches the launch's root turn `04e26478…`. They stay unassigned because each response is recorded in two to nine worker transcripts. Agents `a3c1825c…` and `ad45aedb…` are `fork` agents of `aef2d680…`, and a fork's transcript replays its parent's history with the same row UUIDs and `message.id`s. The copies carry different `agentId`s, so `reconcileObservation` (`dashboard/server/usageReconciliation.ts`) marks the response `contradictory-lineage` and `reconcileAssociation` assigns no task. 595 + 251 = 846. |
| Discrimination of the new spec | Observed at execution: the spec is written first and must fail on the current climb key. |

## Ordered slices

### 1. Join a second-level background agent's responses to its launch

Type: Behavior
Status: done
Proof: a focused backend spec, then a real-store import.

Behavior: a forked B whose transcript replays A's rows counts A's replayed
response once, as A's, for the launch. Also: a launch whose coordinator starts worker A, and A starts background
worker B with B's `async_launched` agent result in A's transcript → import (and
Refresh, through the shared association) assigns B's responses to the launch,
with no `unresolved-native-task-lineage` on them. Removing B's agent result
leaves B's responses unassigned with `unresolved-native-task-lineage`, and
`unjoined-worker-evidence` names B.

## Execution complete

Product advice: no change to priorities. The Usage index now counts a Claude Code launch's background agents at any depth, including fork-replayed responses, so SEED-334's launch reads its 74.03M transcript cost. That makes it usable as the measure for the [SEED-345](../../seeds/SEED-345-session-token-efficiency.md) trials. One branch is untested: a response owned by the root transcript, which arises when a fork of a first-level fork replays root rows. It is not a story promise and shares the tested restatement path, so it needs no correction.

## Proof ownership

| Source example | Slice and observation |
| --- | --- |
| Second-level agent joins through its parent worker's agent result | 1: new case in `dashboard/backend-tests/usage-history/claude-nested-workers.spec.ts` (built with the existing `writeClaudeSession`/`nativeFile` harness and MakeMe launch record). It writes a root, worker A and worker B under `<session>/subagents/` and runs `runImport`. `taskUsage` includes B's response, and B's observation has no unresolved-lineage gap. It fails on the current code. |
| Missing join keeps explained gaps | 1: same file; B's transcript is present with no agent result → B's response is unassigned with `unresolved-native-task-lineage`, and the import's gaps include `unjoined-worker-evidence` |
| Fork-replayed response counted once (developer decision) | 1: same file, "counts a response a forked worker replays from its parent once, as the parent's" — B's transcript replays A's rows; `msg-a` has both measurements as `worker-a`, no `contradictory-lineage`, is assigned to the launch, and the launch has 3 requests. It fails before the replay rule. |
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
  `dashboard/backend-tests/usage-history/claude-usage.spec.ts`,
  `claude-nested-workers.spec.ts` and `claude-coverage.spec.ts`. Full suites stay in hosted CI.
- Local-gate sleep guard: see
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Wrap the real-store import (about 9 minutes) in `caffeinate -s -i` on AC
  power.

## Learnings

- Real-store imports on 2026-11-16 used the backup at `$CLAUDE_JOB_DIR/tmp/usage.before.json`. The climb-key fix alone took 611 s. With the fork-replay rule added, the import took 940 s with sleep held on AC power.
  - SEED-334#run-and-observe-product-wide-end-to-end-tests: from 56.33M (2,699 responses) to 67.84M (3,294) after the climb fix, then 74.03M (3,545) with the replay rule. The replay rule left no unassigned entry.
  - SEED-284#optimize-tests-from-ci-proof gained 15 responses and SEED-262#declare-fake-github-planning-data gained 128, matching the transcript replay.
  - No launch dropped or shrank (705 tasks before, 715 after).
- The other launches that grew show identical old and new climbs in a per-session replay. Their growth comes from the full reimport over a store Refresh had last written.
- A coordinator's first-level fork loses no responses this way: a root measurement has no `agentId`, so only one value remains.

## Story obligations

### G1. Fork-replayed responses stay unassigned
Reported: slice 1 — "Independently discovered at real-store acceptance: 251 of SEED-334's 846 second-level responses are recorded in several fork transcripts with different agentIds, so reconciliation marks them contradictory-lineage and assigns no task; SEED-334 reads 67.84M, not 74.03M."
Story clause: "After one import, the launch's Claude Code total matches its 74.03M transcript cost, with all 846 second-level responses counted."
Disposition: proved by slice 1: claude-nested-workers.spec.ts "counts a response a forked worker replays from its parent once, as the parent's"; real-store import 2026-11-16 puts SEED-334 at 74.03M with all 3,545 responses assigned and no unassigned entry
