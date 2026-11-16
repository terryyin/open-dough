# Compare agent effort on comparable runs

**Identity:** SEED-345#compare-agent-effort-on-comparable-runs
**Source:** [Selected story](../../seeds/SEED-388-measure-and-control-agent-launch-cost.md#compare-agent-effort-on-comparable-runs)

## Goal and scope

A maintainer reproduces one execution's effort or compares a baseline and
candidate, per host, without a fresh audit. The source owns the scope and
examples. Deliver a read-only local command with readable and JSON output;
retain outcome/proof/intervention notes as supplied context, with no automatic
winner. No dashboard UI, paid runs, invoice claim, new pricing or workflow state.

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

## Ordered slices

Each slice targets 15 active minutes, including its focused proof and cleanup.

### 1. Inspect an execution's combined effort without changing history
Type: Behavior
Status: planned
Proof: `agent-effort-report.spec.ts`, existing usage-history consumers; typecheck.

Behavior: select a Codex/Claude execution → readable/JSON report with attributed
root/worker requests and counters, settings, source/boundary and gaps; no writes.
Extract the existing scan from persistence, preserve import/Refresh behavior,
add explicit selection and diagnostics, and cover later turns through the shared
reader. Interim: peaks, wakes and Cursor metrics say unavailable until slices
2–4; the report does not claim those observations yet.

### 2. See each agent's observed context and settings
Type: Behavior
Status: planned
Proof: per-agent cases in `agent-effort-report.spec.ts`; actual Claude sample.

Behavior: select an execution with multiple agents or changing settings → each
agent's input maximum and observed distribution, requested settings separately,
and sourced/supplied/unknown guidance version. Missing coverage qualifies peaks.

### 3. Distinguish observed empty wakes from useful results and unknowns
Type: Behavior
Status: planned
Proof: `agent-effort-wakes.spec.ts`, including mixed results and missing evidence.

Behavior: select a run with retained wait/tool-result evidence → request-level
exposure counts and coverage under the stated rule; progress and unproved joins
cannot become idle-wake claims. Extend report-only observation, not task ownership.

### 4. Inspect Cursor effort through its retained workflow evidence
Type: Behavior
Status: planned
Proof: `agent-effort-cursor.spec.ts`; actual Cursor sample's 15 / 8 counts.

Behavior: select a Cursor family → coordinator/worker workflow counts, bytes,
sources and gaps, with token/context/wake unavailability explicit. Reuse its
belonging-directory convention and parse recorded dynamic names without a new
usage-history host schema or a live runner dependency.

### 5. Compare delivered outcomes across explicit execution groups
Type: Behavior
Status: planned
Proof: `agent-effort-comparison.spec.ts`; actual CLI reports for all three audit
samples against the retained replay; focused consumers, typecheck and lint.

Behavior: select baseline/candidate groups and supply outcome/proof/intervention
context → per-execution and deduplicated group figures, like-metric deltas,
settings/boundary/coverage differences and no automatic winner. Add the maintained
command/definitions/examples at `dashboard/AGENT-EFFORT.md`; preserve audit-window
versus whole-execution distinctions and record the actual sample results here.

## Concerns and cumulative design

Slice-plan refinement was not needed: all five slices extend one derived report,
using one existing ownership/normalization rule, then host evidence and grouping.
Each has one outside-in proof loop; no file/layer-only slice or speculative
framework. The named interim unavailability is replaced by slices 2–4. This
review identified no remaining slice-specific concern or human pre-Take decision.

## Local gates and execution discipline

Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Before test edits apply installed MakeMe selection and Page Objects
selection if a browser test is added. Keep default timeouts and never `test.slow()`.
Run focused specs via
`env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history/agent-effort --reporter=list`;
after the shared scan change run the whole `dashboard/backend-tests/usage-history`
directory with that runner. Use `npm run typecheck:dashboard` and `npm run lint`.
Execution's consumer trace owns any additional affected checks; full suites stay
in hosted CI. Sample replay is read-only over this machine's retained history.
Local-gate sleep guard: [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos),
start fully awake; on AC wrap long/full runs in `caffeinate -s -i`. Inspect actual
load before a long consumer run; keep all observation scripts and results with
this plan until wrap-up, then remove spent evidence through that workflow.

## Learnings

None beyond the preparation observations above.
