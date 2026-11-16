# Compare agent effort on comparable runs

**Identity:** SEED-345#compare-agent-effort-on-comparable-runs
**Source:** [Selected story](../../seeds/SEED-388-measure-and-control-agent-launch-cost.md#compare-agent-effort-on-comparable-runs)

**Source review:** [Independent commitments](source-review.md)

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

## Execution context

- Established Story Branch Mode in `/Users/terryyin/git/open-dough/.worktrees/compare-agent-effort-on-comparable-runs`, branch `codex/compare-agent-effort-on-comparable-runs`, reused owned linked worktree. Remote `origin`, trunk `main`; integration/default checkout `/Users/terryyin/git/open-dough` is separate and untouched.
- Identity `SEED-345#compare-agent-effort-on-comparable-runs`, publisher `dashboard-territory.local-open-dough`, agent Yuma-chan. Starting revision `fffced8c60680a43399419eb56e98e36b0e43e92`; accepted claim and first published base `f777c4aa2e9f3603a50603fb20e67c95ccbff290`. Claim on trunk has `pendingCi: unobserved`.
- Exact checkout setup: Node v24.21.0; `node scripts/setup-native.mjs npm` passed with unchanged lockfile; `npm run typecheck:dashboard` passed. Hook `.githooks/pre-commit` is check-only staged lint and dashboard typecheck. Selective formatter `npm run format`; agent commit contract applies.
- Replanning: preserve existing planned authority; no overrun permission supplied. Five slices are within the eight-slice cap. Implementation agents own 15 active minutes per slice.
- Observer: GitHub Actions `ci.yml` (verified CI, id 351271804), repository `terryyin/open-dough`, target `codex/compare-agent-effort-on-comparable-runs`, coordinator `yuma-compare-345`. Codex yielded cell `g601:15`, session 67032, PID 52119, directory `/tmp/dough-ci-501/watch-n98g3z`; runtime is this checkout's `.agents/skills/dough-execute-plan`. Integrated-state completion uses the configured push check.

## Proof and premises

[Retained proof mapping and preparation observations](execution-evidence.md)
remain authoritative for each slice. Implementation proof is added there.

## Ordered slices

Each slice targets 15 active minutes, including its focused proof and cleanup.

### 1. Inspect an execution's combined effort without changing history
Type: Behavior
Status: done
Proof: `agent-effort-report.spec.ts`, `agent-effort-coverage.spec.ts`, existing
usage-history consumers; typecheck.

Behavior: select a Codex/Claude execution → readable/JSON report with attributed
root/worker requests and counters, settings, source/boundary and gaps; no writes.
Extract the existing scan from persistence, preserve import/Refresh behavior,
add explicit selection and diagnostics, and expose unowned family responses as partial ownership evidence. Exact
later-turn acceptance consumes the shared reader correction in slice 5 (G1). Interim: peaks, wakes and Cursor metrics say unavailable until slices
2–4; the report does not claim those observations yet.

### 2. See each agent's observed context and settings
Type: Behavior
Status: done
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
samples against the retained replay; shared developer-reply ownership cases;
focused consumers, typecheck and lint.

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


## Story obligations

### G1. Plain developer reply ownership awaits shared correction
Reported: slice 1 — "Task path only propagated candidate-linked gaps; empty-candidate later replies need an explicit ownership gap until the shared correction lands."
Story clause: "Failed, cancelled and later-turn work stays in its owning execution"
Disposition: interim until slices 5
Commitment: 13


### G2. Peaks remain unavailable in first increment
Reported: slice 1 — "First increment intentionally reports per-agent peak input as unavailable until observation is added."
Story clause: "peak input per agent"
Disposition: proved by slice 2: agent-effort-settings.spec.ts inclusive maxima; agent-effort-peaks.spec.ts disjoint maxima and lower bounds; claude-sample-summary.json752562 coordinator peak, never summed
Commitment: 11
### G3. Wake classification remains unavailable in first increment
Reported: slice 1 — "First increment reports idle-wake evidence unavailable until conservative request-level observation is added."
Story clause: "observed idle-wake requests"
Disposition: interim until slices 3
Commitment: 12

### G4. Cursor support belongs to host workflow slice
Reported: slice 1 — "First increment accepts Codex and Claude only; Cursor workflow reporting is not implemented yet."
Story clause: "Cursor reports token usage and unobservable wakes as unavailable"
Disposition: receiving slice 4
Commitment: 28

### G5. Stored-only worker downgrades another agent's peak
Reported: slice 2 — "Independent refactor found that stored-only worker gaps downgrade a fully retained coordinator peak through the report-global missing-request policy."
Story clause: "peak input per agent"
Disposition: proved by slice 2: agent-effort-stored-worker.spec.ts retained coordinator maximum100, stored worker peak unavailable/input100 partial, combined200 partial and all gaps visible
