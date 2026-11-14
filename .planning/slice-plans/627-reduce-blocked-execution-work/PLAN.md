# Reduce blocked execution work

**Identity:** SEED-356#reduce-total-model-work-during-blocked-execution
**Source:** [refined story](../../seeds/SEED-356-reduce-blocked-execution-effort.md#reduce-total-model-work-during-blocked-execution)

## Goal and decisions

Remove one observed source of repeated model work on blocked continuation;
keep it only if complete-task tokens fall at least 20%, requests/interventions
do not rise, and unblocked tokens rise no more than 5% with no extra
requests/interventions. Preserve all case outcomes and proof. The source owns
the full criteria and four-journey budget. No event-driven runtime, new state
protocol or general phase-loading rewrite. This plan authorizes no execution.

Reuse the existing execution context and dependency interpretation:
`dough-execute-plan/SKILL.md` (continue/recover), `product-backlog.mjs
read-dependencies`, and the supplier-resolution procedure. PFE found these
already own context reuse and exact-condition judgment; CI notification and
dashboard session transport own different lifecycles and are not needed here.
Delete redundant blocked-path procedure first. Add a compact mechanical helper
only if the baseline justifies it, using existing readers and replacing the
agent steps rather than adding a second representation. Keep judgment with the
agent. No new North Star direction is needed.

Follow Accepted ADRs [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md) and
[0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md). Edit reusable
guidance in `Distribution/src/skills/`; do not hand-sync installed copies.

## Slices

### 1. Establish a fresh baseline and one worthwhile removal
Type: Behavior
Status: planned
Proof: current paused-supplier assessment passes, complete coordinator/worker
usage is retained, and one measured source of unnecessary work could plausibly
clear the whole-task saving bar; otherwise stop with the evidence.

Freeze the execution's current pre-change SHA. Use the maintained
[baseline capture](../../../Distribution/tests/native-comparison-baselines.md#save-one-frozen-baseline)
with `--case paused-supplier --baseline <SHA> --model gpt-6.1-sol --effort xhigh`
and a new `--save-baseline` path. Inspect
`.capture.originalAssessment == "pass"` and `.usage.status == "complete"`.
Read only the trace portions needed to choose one reduction, including setup
and the qualifying turn. Record baseline SHA, runtime/settings, cost and the
selected removal here. If no reduction is supported, do not build a helper.
This paid probe owns native availability, fresh cost and opportunity uncertainty.

### 2. Simplify that path and keep only an observed improvement
Type: Behavior
Status: planned
Proof: unchanged/nonqualifying wakes preserve the block and partial work;
qualification continues once with final owned and independent proof; complete
blocked and unblocked comparisons meet the source's numerical criteria.

Implement the one selected reduction and remove its displaced procedure.
Walk the story's examples using AGENTS.md's skill behavior review. If a helper
is needed, protect its observable result and changed/missing-evidence behavior
with focused tests under the installed MakeMe convention; no configuration-only
assertions. Preserve shared host-neutral behavior without a new native adapter.

Commit the candidate for the harness. Run the maintained
[comparison](../../../Distribution/tests/native-comparison-baselines.md#compare-another-candidate-with-saved-evidence)
with `--case paused-supplier --baseline <same SHA> --candidate <candidate SHA>
--reuse-baseline <saved file> --require-usage --arms sequential --model
gpt-6.1-sol --effort xhigh`, declaring the source's gain/quality criteria.
Keep inputs/runtime fixed: an applicability miss automatically acquires another
baseline. Reserve up to two journeys before each comparison. If the blocked
comparison passes and two journeys remain, run **unblocked-supplier** with the
same baseline/candidate SHAs and settings, replacing `--reuse-baseline` with
`--fresh-pair --save-baseline <new file>`. This refreshes that baseline and
measures overhead together. Stop if the budget cannot cover the remaining
comparison. Do not modify the cases to favor the candidate.

Export candidate evidence with `--export-baseline <pair attempt> --arm candidate
--save-baseline <new file>`. Compare `.usage.totals.total_tokens` and
`.usage.responses | length`; report cached/uncached input, output and human
interventions separately. Gain/quality flags record intent, not numeric gates:
judge the thresholds explicitly. Retain a compact keep/stop result and usable
baselines at the case evidence locations. On a miss, revert candidate-owned
product changes, preserve evidence and stop without claiming improvement.

## Proof, premises and delivery

- On 2026-11-15 at `688f09b9f`, `PATH=/opt/homebrew/bin:$PATH
  Distribution/tests/native-comparison.sh --list` selected both supplier cases;
  local Node is 24.21.0 and Codex CLI 0.169.0. Native authentication and paid
  execution remain slice 1's probe, not assumed success.
- In this preparation checkout, `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
  Distribution/tests/native-comparison-paused-supplier.sh
  Distribution/tests/native-comparison-unblocked-supplier.sh` passed. These run
  controlled journeys that accept correct continuation and reject early
  publication, lost/rerouted work, duplicate continuation and missing proof.
  Native cost is unproved until the slices run. The runner forces all three
  wake events; this plan claims no suppressed wakes.
- Local gates: representative skill review and focused checks for changed
  behavior; reuse the above assessor proof while unchanged. Follow the maintained
  [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  start fully awake; on AC use `caffeinate -s -i` for long native runs; on battery
  plug in or use `caffeinate -i` with lid open and inspect the sleep log. Inspect
  load/memory before expensive runs and sequence these owned journeys.
- Apply [AGENTS.md's failure policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written to every delegation and repair. Independent post-change refactoring,
  focused proof, coordinator commit/publication and asynchronous CI repair use
  `dough-execute-plan`; stop after the bounded experiment rather than grow it.

Refinement was not needed: one paid opportunity probe and one cohesive change
with its keep/stop comparison. No remaining slice-boundary or design concern;
the paid premises are explicitly bounded by slice 1. Expected entry files are
at or below 250 lines (execution SKILL 247, dependency command 87, supplier
procedure 250); prefer removal, keeping any changed responsibility coherent.
