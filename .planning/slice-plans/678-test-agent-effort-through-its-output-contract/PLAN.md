# Test agent effort through its output contract

**Source:** [selected story](../../seeds/SEED-345-session-token-efficiency.md#test-agent-effort-through-its-output-contract)
**Source review:** [source-only review](source-review.md)
**Identity:** SEED-345#test-agent-effort-through-its-output-contract

## Goal and scope

Maintainers get a documented JSON/readable contract and question-led CLI
examples that survive changes behind it. Preserve every existing distinct
promise while replacing internal serialization, production-derived test
types and patch-shaped test organization. Refactor implicated report
responsibilities where the migration exposes duplication. The source owns
scope, restrictions and six key examples; this plan adds none.

No Usage, dashboard UI, native-run or guidance changes, paid runs or measured
savings claim. This preparation authorizes no implementation.

## Existing solution and direction

PFE: reuse the real `compareAgentEffort.ts` command, existing MakeMe native
and Cursor builders, isolated retained-Usage fixtures and source byte checks.
`usageScan.ts`, `usageContributions.ts` and `usageReconciliation.ts` already
own selection, disjoint accounting and response identity. Keep those meanings
there. `effortTotals`/`responseEntries`, `effortAgents`, `wakeCoverage` and
`cursorWorkflowTotals` already serve single/group reports: improve these
owners when needed, rather than adding parallel host or comparison rules.

The missing responsibility is an explicit output projection. Define its
public names, shapes, units, coverage values and named gaps in
`dashboard/AGENT-EFFORT.md`; use ordinary typed mapping/rendering functions.
Preserve current v1 names and meanings and existing CLI options/errors.
Readable output presents the same facts and caveats, without depending on
incidental object order. No version bump, new framework or generic schema
platform is needed. Test support independently describes the documented
output; it never infers it from production return types or imports production
report types. JSON has one shape-focused proof; other examples observe their
own facts through domain-named test readers, selecting hosts/agents by identity
rather than fixed positions. Keep negative checks where absence is the promise.

[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) keeps domain
names consistent. [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps repository workflow facts separate from local evidence; this read-only
tool acquires no workflow authority.
[ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md) judges
changeability against the preserved-output baseline, not a lower test count.
The ADR index and record statuses agree; no conflict or supersession applies.
No North Star topic adds direction for this local report boundary, and none
is created.

## Consumer trace and retained proof

At `274d9d0d0b3989fbe8b01bfc3fb030e87914f327`, production report consumers are
the CLI, the single/native/Cursor assembly path, and comparison assembly.
The CLI feeds JSON/readable output to maintainers. Cross-file searches for
`agentEffort`, `compareAgentEffort` and production type imports also reach
`dashboard/tests/usage-history/agentEffortHarness.ts` and the twelve backend
specs below, including a direct Cursor type import in the selection spec.
No UI or other production command consumes the report output. Shared Usage
readers are upstream dependencies, not an alternative report contract.

| Current spec family (`agent-effort-*.spec.ts`) | Distinct proof to retain; owner |
| --- | --- |
| ownership, native-family | Replies, workers, copied ancestry, next-task exclusion and explicit retained-family selection; 1 |
| cursor-selection | Ambiguity, usable roots, absent evidence and unprovable window; 1/3 |
| report | Read-only accounting, failed/cancelled workers, response uniqueness, Claude lifetimes; 2 |
| peaks, settings | Host input definitions, agent maxima, changing/requested settings and historical guidance; 2/3 |
| cursor | Nested workers, dynamic tools, consistent IDs, conflicting/ID-less rows and unavailable metrics; 2/3 |
| coverage, stored-worker | Stored provenance, missing components, later replies and metric-specific peak qualification; 3 |
| wakes | Supported result joins, mixed/progressing/missing evidence, duplicate rows and complete/partial coverage; 3 |
| comparison, group-coverage | Execution context, union totals, group peaks, aliases, stored overlap, like-host deltas and warnings; 4 |

Before deleting or merging a case, add a row under this plan's working
`proof-migration.md`: old file/test and protected fault → surviving named
example and assertion → owning slice → accepted proof. Recover former plan
666 obligations G1–G14 from
`0ffdf58012bc210423868326e252042192c2332b:.planning/slice-plans/666-compare-agent-effort-on-comparable-runs/PLAN.md`
and reconcile them against current assertions. The historical execution
patch is provenance, not the unit of the new tests. Equivalent examples may
merge; different host definitions, ownership or missing-evidence faults need
their own discriminating observation. No numeric test-count reduction target.

## Decisive premises

All observations below use this preparation worktree at `274d9d0d` on
2026-11-17, Node v24.21.0, isolated local fixtures, no account or paid calls.

| Premise / consuming operation | Observation and result | Remainder |
| --- | --- | --- |
| Current CLI proof route runs all affected examples | `caffeinate -s -i npm run test:dashboard:backend -- usage-history/agent-effort- --workers=2 --reporter=list`: 66 passed, 33.2s, on AC power. Fixtures invoke the actual CLI with isolated homes/native roots; assertions cover the table above. | None for route/baseline; this is not a claim of discrimination for every old assertion. |
| Internal serialization leaks into the public catalog | `node dashboard/server/compareAgentEffort.ts --home <isolated-empty-home> --codex-root <empty-codex> --claude-root <empty-claude> --list --json` returned `{"format":"agent-effort-v1","selections":[]}`. A scratch-only `internalProjectionProbe: true` on the internal catalog appeared in JSON; byte-for-byte restoration returned the baseline. | None; source restored before record writes. Slice 1 replaces this boundary. |
| Group overlap proof discriminates against double-charging | The [retained intent-coverage report](../../done/SEED-345_compare-agent-effort-on-comparable-runs.json) records the actual CLI and unchanged maintained test: baseline input50/requests2; disabling stored/native overlap exclusion produced input70/requests3 and failed the expected50 assertion; restored test passed. `git diff 0ffdf58012bc210423868326e252042192c2332b HEAD -- dashboard/server/agentEffortComparisonGroup.ts dashboard/backend-tests/usage-history/agent-effort-group-coverage.spec.ts` was empty. | None for this witness; preserve it in slice 4. |

Independent test typing and grouping are observed directly in imports and
assertions. Future projection isolation is the change to prove, not an
assumption that it already works. No premise needs a paid or human probe.

## Proof and local gates

The unit/boundary is this read-only CLI service. Drive its highest stable entry,
`node dashboard/server/compareAgentEffort.ts`, with real file readers and
controlled local source files. Do not substitute report assembly, attribution,
reconciliation or output mapping. JSON/readable/list/error are distinct
surfaces; one format's success does not prove the others.

Run the focused CLI family above after each slice; it is cheap enough to
cover all affected consumers. Keep new filenames under `agent-effort-` so the
command still selects the complete family. Use `npm run typecheck:dashboard`
after type/import changes and `npm run lint` for changed sources. These are
chosen for changed CLI/test contracts; a whole backend/browser run is not a
local gate. If a shared builder or Usage dependency must change, trace and run
its actual additional consuming tests before acceptance.

Local gate: follow [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC use `caffeinate -s -i`; on battery plug in or use
`caffeinate -i` with lid open and inspect the sleep log afterwards. Follow the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written for all failures and flakes. Do not use `test.slow()` or suite,
file, group or hook timeout overrides; retain the default test timeout.

Selection resolved for the existing report/comparison backend paths:
`makeMe: true`, `pageObjects: false`. Before authoring or moving each test,
rerun the installed test-entry selector for its actual source path and apply
[MakeMe](../../../.agents/skills/dough-makeme/SKILL.md); these CLI tests open no
page. Reuse the established fixture/builders, keeping expected figures
independent. Recheck any newly implicated consumers.

## Ordered slices

Each slice is bounded to 15 active minutes under the shared sizing rule;
command time is excluded. Split an overrun by learned outcome/risk before
continuing, preserve accepted proof, and keep every delivered state green.

### 1. A maintainer can resolve a selection through the documented CLI contract
Type: Behavior
Status: done
Proof: source example 5; real catalog/selection/refusal scenarios and named
boundary assertions in JSON and readable/list/error output, plus the focused
family. A temporary internal-only catalog field must not appear in output.

Behavior: exact/ambiguous tasks, retained native families and Cursor roots →
invoke selection/list → usable identifiers, deterministic refusal and explicit
task/family/window boundaries follow the documented contract. Add the catalog
and common selection contract/projection and independent test-side readers;
regroup selection/ownership examples by this question. Do not conflate a
whole family with a task or silently apply an unprovable Cursor window.
Accepted proof: focused family 69 passed after refactor (`agent-effort-selection.spec.ts`, cursor-selection ambiguity/unprovable-window tests); typecheck clean; scratch catalog probe field absent from `--list --json`. Catalog projection lives in `agentEffortCatalog.ts`.

### 2. A maintainer can read what one execution cost without knowing its modules
Type: Behavior
Status: done
Proof: source example 1 and host definitions in examples 3/6; independent
expected native input/output, Cursor workflow facts, per-agent maxima,
settings/provenance and unchanged input bytes in JSON/readable output.

Behavior: selected native or Cursor evidence → invoke the report → figures,
units, workers, peaks and settings have explicitly mapped public names and
meanings. Document/map the single-report variants, move cost examples by
question, and replace their production-derived types. Reuse existing totals
and workflow owners; consolidate genuinely repeated calculations within this
capability. Keep distinct Codex inclusive and Claude disjoint input semantics.
Accepted proof: focused family 69 passed (`agent-effort-cost-*.spec.ts`, selection spec); scratch removal of `totals` from the native projection failed both cost-report tests, restored. Single-report projection lives in `agentEffortSingleReport.ts`; test readers in `agentEffortCost.ts`.

### 3. A maintainer can distinguish known figures from gaps in the evidence
Type: Behavior
Status: done
Proof: source examples 3/4; missing native/cache/input/wake/settings evidence,
stored counters, Cursor unsupported metrics and conservative join scenarios.
Assert known subtotals, null versus zero, affected coverage and named reasons
through JSON and readable output. An input-completeness fault must affect its
own example; a wake-only gap must leave a known input peak complete.

Behavior: incomplete or unsupported evidence → invoke the report → known,
partial and unavailable values retain their exact scope and explanation.
Finish the documented coverage/gap projection and independent single-report
test contract; regroup uncertainty examples and shared data-only variants.
Reshape coverage responsibilities where repeated rules are exposed without
collapsing input completeness into unrelated wake or settings completeness.
Accepted proof: focused family 69 passed; uncertainty specs regrouped as `agent-effort-unknown-{counters,stored-worker,wakes}.spec.ts` with readable output equal to JSON-stated facts (`costViews`). Scratch faults each failed their owning examples and were restored: null→0 figures (4 failed), peak status ignoring missing components (cost-peaks lower-bound example), wake gap qualifying peak (17 wakes examples), readable dropping a gap (5 readable-only failures). Nested facts mapped in `agentEffortSingleReportFacts.ts`.

### 4. A maintainer can compare groups while retaining their evidence boundaries
Type: Behavior
Status: done
Proof: source example 2 and final example 6; CLI native/stored/Cursor overlap,
group peak/coverage, like-host deltas, supplied notes and no-winner examples in
both formats. Complete every proof-migration row. In scratch, rename or split
an internal report module and update only production callers: unchanged specs
and test support must typecheck and pass; restore afterwards. Separately
disable the preserved stored/native overlap rule and observe its owning
example fail, then restore and pass the focused family.

Behavior: baseline/candidate manifests with repeated/overlapping selections →
compare → each execution stays visible, per-host union figures and peaks
deduplicate correctly, and only compatible known metrics yield qualified
deltas. Document/map comparison output, regroup comparison examples and remove
the remaining production-derived test types. Refactor implicated aggregation
and identity responsibilities using existing shared owners. Inspect every
removed/merged case's surviving witness before accepting the final contract.
Accepted proof: focused family 73 passed; comparison projection in `agentEffortComparisonReport.ts`; scratch rename of `agentEffortSingleReportFacts.ts` with production-only import updates kept specs unedited and 73 passing; scratch disable of stored/native overlap exclusion failed `agent-effort-compare-overlap.spec.ts` (expected input 50, received 70); both restored.

## Current decisions and preparation assessment

- Interim: unmigrated output variants and their current tests remain intact
  until their named slice replaces them; slice 4 completes the public boundary.
  The sequence adds no host-specific duplicate calculation or speculative API.
- Expected report modules, CLI, harness, fixtures and twelve specs are all
  at most 250 lines at baseline (largest: group-coverage spec, exactly 250).
  No already-oversized implementation file needs advance reorganization.
  Keep any enlarged file within the maintained limit along cohesive contract,
  rendering, evidence or question seams, not arbitrary fragments.
- Slice-plan refinement was not needed: four question-led outcomes own their
  complete CLI proof and cleanup, with one common output model and existing
  domain reasons for host-specific accounting/identity rules.
- Remaining slice-specific concerns: none identified in this review. No
  pre-Take human decision or supplier dependency is required.

## Learnings

- Slice 1: the Cursor report union declares `selections?: never`, so CLI projections narrowing on `"selections" in report` must treat `selections` as optional.
- Slice 3: Claude wake fixtures have incomplete input, so a "wake gap does not qualify the peak" witness must condition on input completeness; native `unownedResponses` is typed `unknown[]`, blocking an explicit projection until its owner exposes a shape.

Otherwise none beyond the baseline and premises above. Execution records consequential
new evidence here and retains migration evidence with this plan until wrap-up.

## Story obligations

### G1. Single-report selection object not yet explicitly projected
Reported: slice 1 — "The `selection` object inside single reports is not yet produced through an explicit projection; only the catalog boundary was replaced."
Story clause: "The CLI explicitly maps internal results to that contract."
Disposition: proved by slice 2: dashboard/server/agentEffortSingleReport.ts nativeSelection/cursorSelection feed `--json` and readable output via compareAgentEffort.ts; agent-effort-cost-report.spec.ts example-1 test reads `selection` from JSON and the readable `Selection` line; cursor-selection unprovable-window test reads `appliedBoundary`

### G2. Output-reading harness still derives report types from production
Reported: slice 1 — "`agentEffortHarness.ts` still derives `report` / `cursorReport` / `comparisonReport` types from production."
Story clause: "no spec or its output-reading harness imports production report types or derives expectations from production functions"
Disposition: proved by slice 4: dashboard/tests/usage-history/agentEffortHarness.ts keeps only command/writeCursorTranscript/bytes; no agent-effort spec or test reader imports dashboard/server (grep); agentEffortCompare.ts holds independent comparison types

### G3. Documented Cursor and unknown-task refusals lack an owning example
Reported: slice 1 — "The Cursor `was not found` / missing `--family` refusal messages are documented, but this slice added no new test for them."
Story clause: "Remove a promised figure, qualification or selection boundary → its owning example fails."
Disposition: proved by slice 4: agent-effort-selection.spec.ts "${refusal} is refused with an empty report and a named reason" for unknown task, Cursor without --family and Cursor --task: status 1, empty stdout, named stderr

### G4. Ownership examples not yet regrouped by maintainer question
Reported: slice 1 — "The ownership and native-family specs were not moved into `agent-effort-selection.spec.ts`."
Story clause: "Organize examples by maintainer question: what one execution cost, how two groups compare, what stays unknown and why, and how selections resolve."
Disposition: proved by slice 2: cost examples regrouped as agent-effort-cost-{report,ownership,peaks,settings,cursor}.spec.ts, native-family merged into agent-effort-selection.spec.ts; proof-migration.md rows; focused family 69 passed

### G5. Nested figure, coverage and agent shapes still pass through owner objects (slice 3 mapped all but `unownedResponses` and `requestedSettings`)
Reported: slice 2 — "`totals`, `workflow`, `sources`, `observedSettings` and agent `peakInput`/`idleWakeRequests` are still passed through as their existing owner shapes, not re-mapped key by key."
Story clause: "The CLI explicitly maps internal results to that contract."
Disposition: proved by slice 4: agentEffortSingleReport.ts maps unownedResponses and requestedSettings key by key (typed UnownedResponse in agentEffortNativeSummary.ts); focused family 73 passed unchanged

### G6. Cursor readable output lacks its own bytes-not-tokens observation
Reported: slice 3 — "I added no Cursor readable assertion. The `costViews` readable reader is native-only, and the Cursor spec still has only its JSON assertions plus the Cursor readable lines from slice 2."
Story clause: "Cursor bytes never become tokens."
Disposition: proved by slice 4: agent-effort-cost-cursor.spec.ts "Cursor readable output keeps transcript bytes as bytes and token figures unavailable": readable Workflow bytes = file size, readable Combined known figures token metrics {value:null,status:unavailable}
