# Execution evidence

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

## Slice 1 acceptance

Trigger: retained launch or explicit native family/window; expected read-only
coordinator/worker counters with sources, deduplication and explicit gaps.
Inspected `agentEffortReport.ts` task/family selection, shared resolved association
filter, worker grouping, fallback and unowned response paths;
`agentEffortTotals.ts` known component/lifetime sums; `usageScan.ts` read-only
shared reader/reconciliation; `usageImport.ts` raw persistence, resolved export
and graph-release boundary. Original CLI spec's six named cases at lines
13, 42, 58, 72, 85 and 93 observe these results using isolated retained evidence
and existing MakeMe builders. Negative byte assertions include newly created files.

- `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history/agent-effort-report.spec.ts --reporter=list`: 6 passed.
- `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history --reporter=list --workers=2`: 96 passed in 1.3m; log `/tmp/compare-effort-usage-history.log`. Import/export/report/persistence/reimport, native association/coverage and Refresh consumers observed.
- `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history/import-responses.spec.ts dashboard/backend-tests/usage-history/import-report.spec.ts dashboard/backend-tests/usage-history/agent-effort-report.spec.ts --reporter=list --workers=2`: final importer graph-release change, 8 passed (5.2s); final `npm run typecheck:dashboard` passed; `git diff --check` passed.

Consumer trace effects: extraction of `scanUsageHistory`, relocation/re-export of
`launchCatalog`, preserved `importUsageHistory`. Product boundaries are offline
import/export/report and Usage Refresh; observations above cover those consumers.
Planning/documentation hits do not execute those operations. No pricing/schema
change; those consumers retain unchanged behavior. Active implementation 13m.
Exact reply ownership remains G1 until the shared sibling lands; current CLI
shows the unowned native identifiers/sources and partial totals. G2–G4 retain
the other planned interims. Freshness unchanged at pinned trunk
`87ebb7cdd0afb4bf43c125d1143adb77ec4ad37b`; no named sibling product landed there.

Consumer trace command: `node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base f777c4aa2e9f3603a50603fb20e67c95ccbff290 --term scanUsageHistory --term launchCatalog --term importUsageHistory` exited 0. `usageRefresh.ts` launchCatalog caller and persistence paths unchanged, covered by the 96-test run.

Refactor relocation: canonical selected-launch and bounded Claude cases are in
`agent-effort-report.spec.ts`; lost-native fallback, ambiguous selection,
partial input/lifetime coverage and unowned reply cases moved verbatim to
`agent-effort-coverage.spec.ts`. Shared CLI invocation/byte capture is
`dashboard/tests/usage-history/agentEffortHarness.ts`.
Contribution grouping moved to `agentEffortGroups.ts`; boundary/attribution and
all six complete assertion bodies are preserved. Refactor focused replacement
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history/agent-effort --reporter=list --workers=2`: 6 passed (3.7s). Scan/import/Refresh proof remains unchanged.

Independent refactor returned `## REFACTOR COMPLETE`; final typecheck and tracked/new-file whitespace checks passed. Consumer record `/tmp/compare-effort-refactor-consumers.txt` inspected: actual CLI and both specs/harness run, planning references reused, no other runtime consumer. Refactor active13m; final proof load8.48/8.26/8.67 on AC, free memory48%.

Guarded delivery initially stopped at formatting, before commit: untyped CLI JSON and two non-null assertions. Independent refactor repaired derived harness types, catalog presence checks and explicit existing selection narrowing within traced paths; output/assertions unchanged. Final typecheck and whitespace checks passed; six CLI cases reused. Type-repair consumer trace `/tmp/compare-effort-refactor-type-repair-consumers.txt`; second `## REFACTOR COMPLETE` received.
