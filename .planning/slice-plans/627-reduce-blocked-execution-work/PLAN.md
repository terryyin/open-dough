# Reduce blocked execution work

**Identity:** SEED-356#reduce-total-model-work-during-blocked-execution
**Source:** [refined story](../../seeds/SEED-356-reduce-blocked-execution-effort.md#reduce-total-model-work-during-blocked-execution)

**Source review:** [source-only commitments](source-review.md)

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

### 1. Probe a fresh baseline and select one removal or stop with evidence
Type: Behavior
Status: done
Proof: a passing paused-supplier assessment and complete coordinator/worker usage
support one plausible whole-task saving; otherwise retain the invalid/inconclusive
observation, repair a discovered test defect under AGENTS.md's failure policy,
and stop the optimization without claiming a passing baseline or improvement.
Deterministic repair proof must preserve rejection of real harness inspection.

Freeze the execution's current pre-change SHA. Use the maintained
[baseline capture](../../../Distribution/tests/native-comparison-baselines.md#save-one-frozen-baseline)
with `--case paused-supplier --baseline <SHA> --model gpt-6.1-sol --effort xhigh`
and a new `--save-baseline` path. Inspect
`.capture.originalAssessment == "pass"` and `.usage.status == "complete"`.
Read only the trace portions needed to choose one reduction, including setup
and the qualifying turn. Record baseline SHA, runtime/settings, cost and the
selected removal here. If no reduction is supported, do not build a helper.
This paid probe owns native availability, fresh cost and opportunity uncertainty.
The invalid observation below settles that probe's stop branch; the missing
usable baseline and selection stay owned by G1 and slice 2, which cannot start
without a new budget decision. Do not rerun the native probe in this execution.

### 2. Simplify that path and keep only an observed improvement
Type: Behavior
Status: planned
Proof: unchanged/nonqualifying wakes preserve the block and partial work;
qualification continues once with final owned and independent proof; complete
blocked and unblocked comparisons meet the source's numerical criteria.

**Stopped before implementation:** the invalid baseline consumed one of four
journeys. The complete remaining comparison needs four journeys, exceeding the
remaining three. No removal was selected; no product optimization was started.
A new human decision is required before this slice or any further native run.
G1 requires a passing, complete fresh baseline before selecting a reduction.

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

## Execution context

Established 2026-11-15: story-branch; owned execution workspace
`/Users/terryyin/git/open-dough/.worktrees/reduce-total-model-work-during-blocked-execution`,
branch `codex/reduce-total-model-work-during-blocked-execution`; originating and
integration checkout `/Users/terryyin/git/open-dough` (preserve other owners).
Publisher `dashboard-territory.local-open-dough`, agent `darren-chan`; starting
revision `81146589ef7832d100f1f0a4557f5169d01b9f07`, accepted claim and pre-change
baseline `45f965a1bb59f049f9828097971d7621c13c64d6`, confirmed on `origin/main`
and the execution branch. Authorized target is `origin/main`; ordinary delivery
uses the remote execution branch. No second Take. No numeric slice limit supplied;
retain the source's four-journey hard budget and existing planning authority.

Checkout-owned locked npm and browser setup plus native prerequisite check and
`npm run typecheck:dashboard` passed with Node 24.21.0 and Chromium 158.0.8127.18.
Selective formatting is `npm run format`; `.githooks/pre-commit` checks staged lint
and typechecks script changes without mutation.

CI observer: GitHub `terryyin/open-dough`, `ci.yml` (CI, id 351271804), target
`codex/reduce-total-model-work-during-blocked-execution`, coordinator `seed356-darren`,
resumed cell `g318:3`, session `86745`, directory `/tmp/dough-ci-501/watch-uhj6iR`, PID 67905;
the prior observer stopped cleanly. Checkout-bound runtime; claim CI is unobserved
on trunk and must not be registered on this branch observer.

Expensive-proof decision: Territory.local, AC, fully awake, natural load 4.98/4.67/3.80,
48 GiB RAM with memory_pressure reporting 65% free. Codex 0.169.0; run one
paused-supplier baseline under `caffeinate -s -i`, then only sequential owned
journeys within budget. Other active worktrees belong to SEED-354 and SEED-357;
no known heavy proof at this boundary. Native journey historical duration ~22 min;
authentication, usage completeness and opportunity remain slice 1's probe.
Owner: slice 1 worker through terminal result. Reconsider on contention, failure,
missing usage, or before another journey. No optimization implementation until baseline judgment.

## Slice 1 observation — invalid native baseline, 2026-11-15

The one authorized baseline froze `45f965a1bb59f049f9828097971d7621c13c64d6`
(not the abandoned implementation), with native Codex 0.169.0, Node 24.21.0,
`gpt-6.1-sol` / `xhigh`, AC power and `caffeinate -s -i`. Prelaunch load was
4.35/4.45/3.84 with 65% memory free; recorded journey load was 4.15/4.41/3.83
to 6.23/5.54/4.65. Literal launch:

```sh
env PATH="/opt/homebrew/bin:$PATH" TMPDIR=/Users/terryyin/tmp/native-comparison \
  caffeinate -s -i Distribution/tests/native-comparison.sh --native codex \
  --case paused-supplier --baseline 45f965a1bb59f049f9828097971d7621c13c64d6 \
  --model gpt-6.1-sol --effort xhigh \
  --save-baseline Distribution/tests/native-comparison/paused-supplier/comparisons/seed356-20261114T233327Z-baseline.json \
  --results-dir /Users/terryyin/tmp/seed356-native-results
```

Terminal exit 2; no usable baseline was exported. The
[case-local stop record](../../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T233920-362e-stop.md)
retains the outcome, exact false-positive commands, partial usage and budget
judgment. Raw attempt:
`/Users/terryyin/tmp/seed356-native-results/codex/native-comparison/paused-supplier/20261114T233920-362e`.
Turns 1–3 held correctly; ordinary absolute workspace reads matched the bare
`native-comparison` detector. No harness source was read. The failed observation
stays unchanged. The coordinator stopped the exact owned Codex group with
`owned_process_group_terminate 97955 97955 15`; the controller retained the
interrupted turn 4, exporter refused it, and all owned PIDs ended.

Whole-task usage is unknown (`retainedUsage.status: unknown`, `totals: null`);
26 observed responses total 1,468,842 partial tokens, not a complete-task result.
No optimization/helper was started and no saving is supported. One invalid
journey of four is consumed; a fresh blocked pair plus unblocked pair need four
more, exceeding three remaining. Stop before any further native run or selection;
a new human budget decision is required. The discovered detector defect is
repaired only with deterministic proof below.

### Accepted deterministic repair proof

The new `Distribution/tests/native-harness-inspection.sh` failed before repair
with `turn 1 inspected the native harness`. Its controlled host actually reads
installed guidance by absolute workspace path. After narrowing the runner's
generated detector to literal controller/source roots and relative harness paths,
the four-turn legitimate-read journey passes; six source/controller/relative/mixed
inspection journeys are rejected by the unchanged observer/assessors.

Passing terminal command (session 82047, exit 0):

```sh
env PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh \
  Distribution/tests/native-harness-inspection.sh \
  Distribution/tests/native-comparison-paused-supplier.sh \
  Distribution/tests/native-comparison-unblocked-supplier.sh \
  Distribution/tests/native-comparison-doughnut-title-precedence.sh \
  Distribution/tests/native-comparison-pairs.sh \
  Distribution/tests/native-comparison-baselines.sh
```

Coordinator inspection confirms `check_journey` observes the actual assessor
verdict and inspection rejection reason. The shared detector API, task/events,
assessors and runtime guidance remain unchanged. Consumer trace:
`/tmp/seed356-inspection-consumer-trace.md`, all 23 consumers dispositioned.
The changed runner's three case families, pair and baseline entry points are
covered by the above checks; the owned-proof-only caller never reaches the
changed pattern construction. Historical archives stay byte-identical.
The [case-local stop record](../../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T233920-362e-stop.md)
retains the bounded result and visible evaluation costs.

Independent refactor returned `## REFACTOR COMPLETE`: one literal-root escape
pass and shared relative-path suffix, with no API or assertion change. All six
checks above passed again (session 68295, exit 0), using
`env PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i bash scripts/test.sh`
with the same six paths. Territory.local was on AC at natural load 16.71/9.65/6.64,
62% memory free; reduced concurrency preserved coverage. Trace:
`/tmp/seed356-refactor-consumer-trace.md`. Refactor elapsed approximately six
minutes; no further native journey. `git diff --check` passed.

CI run `43655558326/1` found inline stream encoding and rejection-helper guard
violations in the new test. Repair reuses the shared substitute encoder and
`native_assessor_rejects_observed`, without guard/detector/assessor changes.
Terminal proof (session 99864, exit 0, fourteen checks):
`env PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh Distribution/tests/native-harness-inspection.sh Distribution/tests/native-stream-replay.sh Distribution/tests/native-assessor-counterexample-guard.sh Distribution/tests/native-comparison-*.sh`.
Trace `/tmp/seed356-ci-guard-consumer-trace.md` covers shared fixture defaults and faults.

## Story obligations

### G1. No usable fresh baseline or supported reduction
Reported: slice 1 — "The native baseline was invalidated by a false-positive harness-inspection detector and stopped; complete-task usage and a worthwhile removal remain unproved."
Story clause: "Unknown usage remains unknown and cannot support a token-saving verdict."
Disposition: receiving slice 2
Commitment: C08, E16
