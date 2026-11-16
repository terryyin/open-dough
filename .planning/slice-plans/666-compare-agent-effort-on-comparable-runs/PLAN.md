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

Reuse Usage's native readers, reconciliation and ownership; derive report-only
observations without a new store. [Selected solution and ADR constraints](execution-evidence.md#existing-solution-and-architecture).

## Current decisions

[Selection, accounting, evidence and comparison decisions](execution-evidence.md#current-decisions) remain authoritative.

## Execution context

[Identity, setup and observer note](execution-evidence.md#execution-context).

## Proof and premises

[Retained proof mapping and preparation observations](execution-evidence.md)
remain authoritative for each slice. Its acceptance index links the retained
implementation proof for each delivered slice.

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
Status: done
Proof: `agent-effort-wakes.spec.ts`, including mixed results and missing evidence.

Behavior: select a run with retained wait/tool-result evidence → request-level
exposure counts and coverage under the stated rule; progress and unproved joins
cannot become idle-wake claims. Extend report-only observation, not task ownership.

### 4. Inspect Cursor effort through its retained workflow evidence
Type: Behavior
Status: done
Proof: `agent-effort-cursor.spec.ts`; actual Cursor sample's 15 / 8 counts.

Behavior: select a Cursor family → coordinator/worker workflow counts, bytes,
sources and gaps, with token/context/wake unavailability explicit. Reuse its
belonging-directory convention and parse recorded dynamic names without a new
usage-history host schema or a live runner dependency.

### 5. Finish outcome comparisons with independent input coverage
Type: Behavior
Status: done
Proof: actual CLI single-member group with complete input and partial wake
coverage; all agent-effort cases, typecheck and final lint. Reuse the retained
comparison, ownership, inclusive-input, family and audit proof when unchanged.

Completed compatible implementation and proof are safely parked in
`parked-attempt-5/`, inventoried by `parked-attempt-5.json` at base `a399f31a`.
Restore those exact files, then close G17: identical selected request input
retains the same per-agent peak coverage in a single report and one-member group,
even when wake classification is partial. Missing input/requests must still
qualify the peak as a lower bound. Preserve all comparison notes, deduplication,
per-host figures and no-winner behavior. This is one remaining proof loop within
15 active minutes; the previous attempt's 15 minutes remain in history.

The already implemented command/guide and all original audit, grouping and
later-turn examples remain obligations of this slice; none is dropped or moved.

## Concerns and cumulative design

The refined plan keeps five slices extending one derived report and the existing
ownership/normalization rule. Slices 1–4 are delivered; the parked comparison
implementation has proof. The remaining slice has one input/wake coverage proof
loop and preserves the same architecture, scope and outcome. No blocking
preparation concern or human decision remains.

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

Attempt 5 reached 15 active minutes; work was safely parked and the unchanged-scope
plan refined in place. The restored correction used about4 active minutes. See
[attempt, sizing, proof and G17 evidence](slice-5-evidence.md).

## Story obligations

### G1. Plain developer reply ownership awaits shared correction
Reported: slice 1 — "Task path only propagated candidate-linked gaps; empty-candidate later replies need an explicit ownership gap until the shared correction lands."
Story clause: "Failed, cancelled and later-turn work stays in its owning execution"
Disposition: proved by slice 5: agent-effort-ownership.spec.ts both-host actual CLI: reply11 plus root7 and failed/cancelled worker3 totals21/requests3, replayed copies once, next-task900 excluded
Commitment: 13


### G2. Peaks remain unavailable in first increment
Reported: slice 1 — "First increment intentionally reports per-agent peak input as unavailable until observation is added."
Story clause: "peak input per agent"
Disposition: proved by slice 2: agent-effort-settings.spec.ts inclusive maxima; agent-effort-peaks.spec.ts disjoint maxima and lower bounds; claude-sample-summary.json752562 coordinator peak, never summed
Commitment: 11
### G3. Wake classification remains unavailable in first increment
Reported: slice 1 — "First increment reports idle-wake evidence unavailable until conservative request-level observation is added."
Story clause: "observed idle-wake requests"
Disposition: proved by slice 3: agent-effort-wakes.spec.ts both-host actual CLI cases prove paired empty continuations/timeouts, replay deduplication, mixed/progress/unknown/clock exclusions and request coverage; source rule printed as exposure not savings
Commitment: 12
### G4. Cursor support belongs to host workflow slice
Reported: slice 1 — "First increment accepts Codex and Claude only; Cursor workflow reporting is not implemented yet."
Story clause: "Cursor reports token usage and unobservable wakes as unavailable"
Disposition: proved by slice 4: agent-effort-cursor.spec.ts actual CLI workflow counts and gaps with token/request/peak/wake metrics explicitly null/unavailable
Commitment: 28
### G5. Stored-only worker downgrades another agent's peak
Reported: slice 2 — "Independent refactor found that stored-only worker gaps downgrade a fully retained coordinator peak through the report-global missing-request policy."
Story clause: "peak input per agent"
Disposition: proved by slice 2: agent-effort-stored-worker.spec.ts retained coordinator maximum100, stored worker peak unavailable/input100 partial, combined200 partial and all gaps visible


### G6. Unsupported wake envelopes remain uncovered
Reported: slice 3 — "Unsupported wrappers and other TaskOutput formats remain unclassified; the retained Claude sample has no TaskOutput observation."
Story clause: "Missing ownership, native files, counters or wake evidence remains a named gap"
Disposition: proved by slice 3: agent-effort-wakes.spec.ts unsupported-wrapper and missing-pairing cases retain null/unavailable counts and named coverage; exact supported envelopes have primary sources and no actual-sample wake replay is claimed


### G7. Replayed Cursor tool identities double-charge workflow counts
Reported: slice 4 — "Acceptance found that Cursor increments workflow counters before deduplicating its known tool_use identities."
Story clause: "tool calls"
Disposition: proved by slice 4: agent-effort-cursor.spec.ts identity case deduplicates known IDs, excludes conflicts and qualifies ID-less occurrence counts; actual sample remains15/8 with identity gap

### G8. Cursor ambiguous family recovery lacks CLI proof
Reported: slice 4 — "Acceptance found no CLI observation of duplicate Cursor family identifiers, listing usable roots and selecting the intended root."
Story clause: "ambiguous matches are explained for correction rather than silently choosing the latest run"
Disposition: proved by slice 4: agent-effort-cursor-selection.spec.ts ambiguity case passes the emitted selected.root directly to --cursor-root and observes intended Read/PLAN evidence without missing-native gap

### G9. Cursor later task input lacks boundary proof
Reported: slice 4 — "Acceptance found no fixture containing a later task-starting user input in one Cursor transcript while retaining an explicitly whole-family boundary."
Story clause: "Selection identifies the task and its native turn boundary, or an explicitly bounded native session family"
Disposition: proved by slice 4: agent-effort-cursor-selection.spec.ts later-user-input case keeps both workflow calls in an explicitly whole-retained-family result and names requested-time/native-turn uncertainty


### G10. Cursor settings absence is not explicitly represented
Reported: slice 4 — "Source review applicability found no observed model/effort/service-tier representation for the newly supported Cursor host; refactor confirmed the missing named unknowns."
Story clause: "Name host, service tier"
Disposition: proved by slice 4: Cursor CLI JSON/readable assertions name unavailable model/effort/serviceTier overall and per agent, observed collection empty with unavailable coverage, requested settings separate


### G11. Explicit native family was filtered by project configuration
Reported: slice 5 — "Actual Codex audit with isolated home yielded zero because the shared scan excluded native family observations as unrelated projects."
Story clause: "or an explicitly bounded native session family"
Disposition: proved by slice 5: agent-effort-native-family.spec.ts unrelated project excluded by import but explicit family CLI retains request1/tokens13; actual audit2083 reproduced


### G12. Known Codex inclusive input is lost without cache breakdown
Reported: slice 5 — "Acceptance inspection confirmed report totals and peaks sum normalized components and can hide a known native inclusive input count when cache breakdown is absent."
Story clause: "total input"
Disposition: proved by slice 5: agent-effort-comparison.spec.ts known inclusive input123/total130 with cache fields unavailable and peak123 maximum
Commitment: 6

### G13. Group peak inherits incomplete coverage from only one selection
Reported: slice 5 — "Acceptance found that group agent peaks copy the largest member peak object even when another selection of the same agent has missing input, losing union coverage and lower-bound qualification."
Story clause: "peak input per agent"
Disposition: proved by slice 5: agent-effort-group-coverage.spec.ts narrow/wide/repeated selections yield union2, missingInput1 and peak100 lower bound


### G14. Stored and native selections can double-charge the same task
Reported: slice 5 — "Acceptance found that group totals can add stored-only and native counters from the same session when a canonical task selection repeats with different evidence roots."
Story clause: "Repeating a selection cannot double-charge its responses"
Disposition: proved by slice 5: agent-effort-group-coverage.spec.ts native/stored same session contributes once with disjoint worker, group50 not70 and named overlap gap; comparison stored repeats once; ownership copied responses once
Commitment: 14

### G15. Stored session identity is displayed as zero threads
Reported: slice 5 — "Acceptance found threads0 in stored-only reports despite recoverable stored requests and session identity, because only native response identities were counted."
Story clause: "Unavailable is not zero"
Disposition: proved by slice 5: agent-effort-coverage.spec.ts stored-only request/input counters with known session report threads1, native peaks unavailable


### G16. Cursor file aliases can double-charge one transcript
Reported: slice 5 — "Acceptance found lexical Cursor transcript paths as group identities, so real and symlinked roots can count the same physical transcript twice."
Story clause: "Repeating a selection cannot double-charge its responses"
Disposition: proved by slice 5: agent-effort-group-coverage.spec.ts real/symlink Cursor roots retain two executions and one transcript/Todo/agent


### G17. Wake uncertainty incorrectly changes input peak coverage
Reported: slice 5 — "Independent refactor and actual CLI reproduction found the same two known-input requests reported observed-maximum alone but observed-lower-bound in a one-member group solely because wake evidence was partial."
Story clause: "peak input per agent"
Disposition: proved by slice 5: agent-effort-group-coverage.spec.ts actual individual and one-member group CLI peaks10 maximum equal while wake1 partial and named gap retained; missing-input lower bound remains
