# Execution evidence

## Execution context

- Established Story Branch Mode in `/Users/terryyin/git/open-dough/.worktrees/compare-agent-effort-on-comparable-runs`, branch `codex/compare-agent-effort-on-comparable-runs`, reused owned linked worktree. Remote `origin`, trunk `main`; integration/default checkout `/Users/terryyin/git/open-dough` is separate and untouched.
- Identity `SEED-345#compare-agent-effort-on-comparable-runs`, publisher `dashboard-territory.local-open-dough`, agent Yuma-chan. Starting revision `fffced8c60680a43399419eb56e98e36b0e43e92`; accepted claim and first published base `f777c4aa2e9f3603a50603fb20e67c95ccbff290`. Claim on trunk has `pendingCi: unobserved`.
- Exact checkout setup: Node v24.21.0; `node scripts/setup-native.mjs npm` passed with unchanged lockfile; `npm run typecheck:dashboard` passed. Hook `.githooks/pre-commit` is check-only staged lint and dashboard typecheck. Selective formatter `npm run format`; agent commit contract applies.
- Replanning: preserve existing planned authority; no overrun permission supplied. Five slices are within the eight-slice cap. Implementation agents own 15 active minutes per slice.
- Observer: GitHub Actions `ci.yml` (verified CI, id 351271804), repository `terryyin/open-dough`, target `codex/compare-agent-effort-on-comparable-runs`, coordinator `yuma-compare-345`. Codex yielded cell `g601:15`, session 67032, PID 52119, directory `/tmp/dough-ci-501/watch-n98g3z`; runtime is this checkout's `.agents/skills/dough-execute-plan`. Integrated-state completion uses the configured push check.

## Existing solution and architecture

PFE: `usageRecords.ts`, `codexUsage.ts`, `claudeUsage.ts` and
`usageReconciliation.ts` already own native counters and response identity.
`usageImport.ts` gathers native task facts, resolves lineage and calls the
same associations the dashboard uses. `usageContributions.ts` and
`usageTaskSummary.ts` already sum by model, effort, service tier and root/worker;
the stored summary intentionally discards responses. `collectUsageHistory`
currently couples reading to `writeUsageHistory`, even with an alternate store.
Expose its evidence-reading phase and reuse it; preserve the importer's writer.
Do not reconstruct a second task-attribution or token-normalization rule.

The evaluation archive's `retainedUsage` in
`Distribution/evaluation/src/native-comparison-archive-usage.mjs` has the same
own-response invariant but assumes a Codex controlled-attempt directory. Reuse
the general Usage solution instead of extending that harness into historical
reporting. Cursor's existing `hosts/cursor/unfinishedSubagents.ts` supplies its
belonging-directory convention; its liveness boolean is not accounting evidence.

Keep report-only host observations (peaks and tools) outside persistent usage
history. The report is derived local evidence, not a new store or workflow
authority: [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) requires
matched task/conditions for controlled trials; this tool reads retained native
evidence and does not run those trials. Label retrospective comparisons
exploratory under [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
Use the existing North Star's observation/presentation separation; no new
architectural topic, package or installation kind is needed.

Expected shared-file edit: `usageImport.ts` is 231 lines at preparation;
extract the cohesive read phase rather than adding another writer path. The
other observed readers are below 250 lines. New modules stay cohesive and small;
do not expand the history schema to retain report-only detail.

## Current decisions

- Input identifies explicit tasks/launches, or native root families and a
  boundary, with an optional second comparison side and linked continuations.
  Include selection provenance in output. A listing/diagnostic gives usable
  identifiers; ambiguous selection is corrected by the maintainer, never by
  choosing the latest matching story. Do not constrain naturally valid groups
  to an arbitrary count. The CLI's planned entry is
  `node dashboard/server/compareAgentEffort.ts`; keep flags in its maintained doc.
- Task ownership follows the shared reader, including the preceding
  developer-reply correction when it lands. This story can start independently
  with accounting/observation work; its later-turn acceptance must consume that
  shared correction, not implement a private workaround. Queue order alone is
  not a blocking dependency. The explicit-effort story improves new baselines;
  old missing effort remains unknown.
- Agent identity includes the host's worker identity (Claude's `agentId`, not
  just the root `sessionId`). Total input is Codex's inclusive input, or the sum
  of Claude's disjoint fresh/read/write input. Reasoning output is a subset,
  not another output charge. Retain cache lifetime gaps.
- A peak is the maximum observed request input for that agent and selected
  boundary. Missing requests make it an observed lower bound, not a complete
  peak. Group peaks remain per agent. Whole-run and original-window reports
  are different selections; never compare their totals without that warning.
- Idle-wake exposure: count an owned request only when its immediately
  preceding retained tool results establish solely an empty still-running
  continuation or explicit wait timeout, with no observed progress. Clock-only
  calls are separate workflow evidence. Mixed results, missing joins or formats
  that cannot establish this stay unclassified with coverage stated. Counts
  describe exposure, not a savings claim. Repeated result rows add no request.
- Cursor's native transcript has no per-request usage and usually no tool
  results. Report named workflow counts, unavailable token/peak/wake measures,
  and family/boundary uncertainty. Do not infer live context from bytes or claim
  a native turn boundary its transcript cannot prove.
- Guidance version needs historical source evidence; otherwise show unknown.
  Optional supplied context is explicitly labelled. Requested and observed
  settings and all changes stay separate; unknown/unequal settings warn without
  suppressing measured figures. Aggregate/delta only like definitions and hosts.
- The command never refreshes Usage or writes native/usage/launch records.
  Missing native files can preserve stored counters with their stored coverage;
  peaks and tool evidence then remain unavailable. JSON has stable ordering,
  explicit unknown/partial status and source references; readable output keeps
  totals, settings and gaps together. Never print transcript bodies.

## Proof ownership

All new CLI specs invoke the actual Node entry with isolated homes, retained
launch records and native fixtures; assert emitted output and unchanged input
bytes. Use the selected MakeMe builders rather than hand-built host rows.

| Source promise / example | Slice and outside-in observation |
| --- | --- |
| Read-only selection; root/worker counters; failed, cancelled, later-turn work; own responses once | 1: `dashboard/backend-tests/usage-history/agent-effort-report.spec.ts` runs the CLI over both hosts; duplicate fork/stream rows, a reply, a failed worker and a next task prove boundaries and summed figures. Assert native, launch and usage files unchanged and no new refresh files. Reuse existing coverage/lineage cases as consumers. |
| Partial history and unavailable counters; ambiguous selection recoverable | 1: same CLI spec removes one native file, supplies conflicting ownership, selects duplicate story matches; known stored counters retain their provenance, other fields show gaps and selection lists identifiers. |
| Per-agent peaks, mixed observed settings, guidance provenance | 2: same CLI spec with two agents and changing model/effort, inclusive/disjoint input and a missing counter; assert maxima and unknowns. Change today's VERSION independently of the historical input and assert no invented historical version. |
| Explicit conservative idle-wake exposure | 3: `agent-effort-wakes.spec.ts` CLI fixture with an empty live continuation, timeout, progress, mixed results, clock-only and missing pairing; assert exact owned-request counts, exclusions and coverage. Replay a result and retain the same count. |
| Cursor workflow substitute and nested workers | 4: `agent-effort-cursor.spec.ts` CLI fixture with direct and CallDynamicTool calls, nested worker, missing worker/result and another task; assert each named count, bytes and unavailable tokens/peaks/wakes with boundary limits. |
| Paired comparison; fewer tokens with mismatched effort/proof; split continuations | 5: `agent-effort-comparison.spec.ts` compares grouped selections with one repeated member; per-run figures survive, each response adds once, agent peaks are not added, deltas stay within known host/metric definitions, settings/proof/rescue differences are visible and no winner is emitted. |
| Three audits reproduced on their actual retained samples | 5: actual CLI with the replay's sample identifiers and original Codex window → 2,083 / 436,806,678; Claude coordinator peak 752,562; Cursor TodoWrite 15 / PLAN.md reads 8. Compare JSON against this independent replay, not against current Usage's differently bounded task totals. |

## Decisive premises and preparation observations

Observed 2026-11-16 in this owned checkout at `33633a3157a537789ce712c0c07b47f130db3a41`,
Node v24.21.0. Dependency access used a temporary symlink to the integration
checkout's `node_modules`; it is removed before records/landing. No native
session or API was started. Replay:
`node .planning/slice-plans/666-compare-agent-effort-on-comparable-runs/observe-retained-evidence.mjs`.
The original research is recoverable at Git revision `ffdd3dd800a7325237adcfc9c54920956bb63f7b`,
`docs/maintainer/session-token-efficiency-research.md` (method and sample tables).

| Premise / consuming operation | Result and limit |
| --- | --- |
| Shared native counters can reproduce the sampled Codex audit; slices 1/5 | Read-only SQLite index discovery found 11 retained files in the SEED-324 family; `codexUsage` and `collectResponses` read them, with 10 native descendants. Window `[2026-11-12T00:03:56Z, 2026-11-14T00:03:56Z)` yielded 2,083 requests, 435,582,418 input (432,339,840 cached), 1,224,260 output, 436,806,678 total, no read gaps. Matches published 2,083 / 436.81M. This tests counters/family evidence, not task selection or reply ownership. |
| Native observations retain the per-agent input/settings needed by slice 2 | `claudeUsage` and `collectResponses` read session `296b888d-08b1-4b06-ac2e-24a4462da7d0`: 280 responses, peak 752,562, 122 Fable/medium and 158 Opus/high, standard service tier; no read/counter gaps. Peak matches the audit. Historical requested effort/guidance need their own source; this observation does not infer them. |
| Cursor's sampled published workflow figures are recoverable; slice 4 | Retained `a6169ce7-5db3-4970-8f00-c8bf8c548fb4` JSONL read: direct/CallDynamicTool names give TodoWrite 15 and PLAN.md Read 8; zero usage-bearing rows. No token or idle-result premise is assumed. |
| Existing summary is insufficient; slices 1/2/3 | Read `usage-history-v2` (3,040 tasks, 7,196 session contributions), then inspected `usageTaskSummary`'s consuming transformation: it groups token totals/settings/root status and discards request maxima and tool-result evidence. The native reader operations above, rather than the summary, supply those observations. |
| Read/persist separation is necessary; slice 1 | Existing `importUsageHistory` command and its documented alternate-store/response export route always call `writeUsageHistory` inside `collectUsageHistory`; do not use this writer against live history for the report. New read-only CLI behavior and importer preservation are acceptance proof to add, not existing behavior being claimed. |

No cheap factual premise remains assumed about a paid/live session or an
unavailable data source. The new selection, wake classification and comparison
behaviors have discriminating fixture proof above; no existing test is claimed
to prove them. Unknown historical version and outcome equivalence remain honest
report fields, not premises on which implementation depends.

## Accepted implementation proof

- [Slice 1 acceptance and publication](slice-1-evidence.md).
- [Slice 2 acceptance and publication](slice-2-evidence.md).
- [Slice 3 acceptance and publication](slice-3-evidence.md).
- [Slice 4 acceptance and publication](slice-4-evidence.md).
- [Slice 5 retained attempt and remaining proof](slice-5-evidence.md).
