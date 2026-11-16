# Accepted slice evidence

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

Slice1 accepted publication: `4f2059948d26b900bd1adcf090c12a93c62bdd2d` to `origin/refs/heads/codex/compare-agent-effort-on-comparable-runs`, suffixBase `f777c4aa2e9f3603a50603fb20e67c95ccbff290`, observer `/tmp/dough-ci-501/watch-n98g3z` reused. This is the next increment’s previously published base. No local maintenance applies to branch publication.
