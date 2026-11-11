# Run the slowest Dashboard checks together in under 30 seconds

**Identity:** SEED-303#speed-up-slowest-dashboard-checks

**Source:** [Refined story](../../seeds/SEED-303-speed-up-slowest-dashboard-checks.md#speed-up-slowest-dashboard-checks)

**Source review:** [Source-only review](source-review.md)

## Goal and scope

Protect the same behavior with fewer checks and bring the complete replacement
selection below 30 seconds elapsed. Time one local command using the normal
strict Playwright entry point with one worker. Include startup, preparation,
teardown and all proof replacing the original 45 cases. If an existing
lower-level runner owns replacement proof, include its normal focused command
inside the same timed envelope. Keep the [production cache findings
and starting selector](../../evidence/SEED-303-dashboard-test-timings.md) as
the historical evidence. Use the fresh combined baseline from slice 1 to
measure savings. The threshold is for the combined selection. CI case sums,
shard elapsed time and the sum of two exploratory commands describe different
measurements.

Use minimal domain facts and real public boundaries. Preserve discriminating
checks for every original promise, including integration behavior that depends
on real collaboration. Shared setup may serve distinct checks where it is
read-only or where a serial lifecycle is itself under test. Keep unrelated
suite modernization, manual exploratory testing and behavior changes outside
this story. Any cheaper proof used to replace an original check counts in the
timed selection, including pre-existing checks.

## Architecture and existing proof

[Architecture constraints and selected existing proof](proof-context.md).

## Outside-in proof ownership

| Promise | Slice and observation |
| --- | --- |
| Selection and elapsed comparisons follow the same intents through a changed test layout | 1 and 11. Strict runner transcript plus a mapping from every original case and distinct assertion to its maintained proof. |
| Pinning survives a main advance and preserves real build, preview, serving and shutdown boundaries | 2. Pinned content and real preview responses from the expected revision, with an actual isolated staged checkout and process. |
| Watcher keeps the working deployment through faults and follows the right baseline | 3–4. Real recovery and cleanup plus qualification, no-work, retry, pinning, replacement and failure distinctions at the appropriate Git or process boundary. |
| Provider pacing controls real admission and visible recovery | 5. Requests before and after controlled time, no early upstream call, correct settled snapshot and return to steady cadence. |
| Profile states and assets appear in the right card and viewport | 6. Real published profile data read through the Dashboard, with observable state and representative geometry, loading and accessibility. |
| Touch scrolls the intended panes and retains context | 7. Real touch and viewport changes, with the selected file, scroll positions, reading location and refresh behavior observed. |
| Cursor holds, revives, resumes and refuses with the correct scope | 8. Real runner and PTY evidence plus persisted scope and process-start observations, and a browser journey for its visible result. |
| A pending Take protects actions until the accepted snapshot is fully read | 9. Stale and unrelated reads, comparison failure and recovery, partial accepted read, final actions, and persisted reconciliation observed at the right boundaries. |
| A qualifying landing requests exactly one rerun and keeps an honest outcome | 10. Real receipt and collection with restart, plus independently discriminating threshold and provider outcome checks. |

## Decisive premises

| Premise | Observed result or consuming probe |
| --- | --- |
| The starting selector reaches the scoped proof | The original 45 project/file/title identities match the corrected frozen cohort: three strict 45/45 passes, 266.38/287.15/303.80 seconds, at Take 17a2f1205 plus the two necessary test corrections and canonical Cursor helper. Exact hashes and phase/load/cache evidence are in [comparable baseline](comparable-baseline.md); historical 40+5 exploration is separate. |
| Full staging and real rate-limit time are material even with an idle worker | The retained local profiling at 62f8c5162 exercised both paths. The watcher families issued 16 actual staging installs and builds, and the rate case took 21.594 seconds. Slices 2–5 remeasure after accepted changes and probe cheaper equivalent proof. |
| The current overlap and elapsed cost can change before execution | Slice 1 retained SEED-287 branch ownership/evidence without treating its unlanded watcher/touch/transport work as accepted trunk state. The one canonical heldCursorExecutions helper from committed 84afbf850 was explicitly reused for necessary setup and proved in the frozen cohort. Before later overlap, settle newly accepted source/ownership; the existing HUP/restart candidate requires its seven-case serial family. |
| The cheapest boundaries still catch the important regressions and can fit the time envelope | Slice 1 identifies each proof claim and orders the smallest executable probes. Slices 2–10 settle their own premise by observing the real boundary and a distinguishing failure where replacement is claimed. The effect of the untried changes remains open. A failed premise changes that slice and dependent work. |

## Ordered slices

### 1. Establish comparable timing and locate overlap
Type: Behavior

Status: done

Proof: Run the [45-case starting selection](../../evidence/SEED-303-dashboard-test-timings.md#reproduce-the-starting-selection) in one normal strict invocation with one worker. Take three comparable passing measurements. Record literal command, accepted revision, load, cache state, counts, elapsed and phase breakdown. Reconcile promises already moved by SEED-287. For each potential removal, name the observed behavior, its current proof, the candidate surviving check and a fault it must detect.

Behavior: A maintainer selects the original protections → measures the ordinary combined run and reviews the active overlap → the plan has a reproducible baseline, a coverage map, and a measured order for the experiments. Use the mapped overlap to estimate a materially lower count. This early probe owns the open measurement and coverage premises. It can reorder or amend the remaining experiments.

### 2. Keep one real pinned deployment with minimal preparation
Type: Structure

Status: done

Proof: Select the deployment pinning case by its title and run its affected deployment siblings. Observe real source, selected revision, fetch/build/serve and shutdown. Use a scratch comparison that serves the newer revision to verify the retained assertion catches the error. Compare elapsed phases including source and dependency preparation.

[Accepted measured experiment and negative control](pinning-evidence.md); [consumer dispositions](pinning-consumers.md).

Structure: Test the smallest source variation and supported reuse of identical preparation through the existing production deployment entry. Quantify the floor for a real build and preview before slice 3 spends it. Preserve independent distribution, isolation, and refusal promises at their existing real boundaries.

### 3. Keep watcher baselines with stateful real-Git proof
Type: Behavior

Status: done

Proof: Drive the production selection owner used by the real CLI against actual Git histories. Establish discriminating rejected, excluded, failed-candidate and successful-activation baselines before replacing detailed policy stages. Deliberate wrong-baseline controls must fail. Run one ordinary selection including every new state check and every retained watcher observation; count real installs/builds and cold/shared work, compare matched elapsed, and obtain three consecutive passes for changed asynchronous proof. The experiment predeclared an eight-second whole-family saving worth keeping. Preserve pin, drain, preview faults, native records and shutdown protection unchanged in the retained integration.

Behavior: Published changes are excluded, rejected, fail or activate → the real watcher consults its one production selection owner and real Git policy → subsequent comparisons retain the correct baseline with fewer detailed variants requiring full deployments. This is the bounded early probe for stateful selection reuse; a false premise stops policy-stage removal and changes dependent work. Keep only a measured improvement with equivalent fault detection.

[Measured selection substitution and controls](watcher-evidence.md); [consumer dispositions](watcher-consumers.md). The complete watcher family is still 95.47–99.18 seconds; slice 4 owns the unsupported lifecycle allocation.

### 4. Preserve preview lifecycles through genuine staged outputs
Type: Behavior

Status: planned

Proof: Before narrowing full-deployment variants, observe real drain/stop/start/restore over genuinely built A/B outputs through the production owner used by the CLI. Prove isolation and any immutable-preparation assumption in this paid early probe. Retain one actual watcher chain for stage failure, selected pin after main advance, accepted-start drain, shared native records/config and shutdown during build. Verify wrong restoration target, missing retry/restore, failed candidate replacing working preview and lost cleanup through discriminating controls. Include all new or pre-existing credited proof, actual stage/install/build counts, cold preparation and three strict focused passes; measure the complete watcher/pinning family and settle the remaining-gap checkpoint.

Behavior: A real staged candidate and working preview undergo failure or replacement → one production preview-lifecycle owner performs genuine process and serving transitions → working production is retained/restored or ends with the required cleanup, using fewer repeated installations/builds for detailed variants. This is a separate proof loop from Git selection. No fake stage/preview, test-only callback, parallel decision model or relaxed coverage is permitted. Co-own the pinning case only after every original source/build/distribution/origin/shutdown assertion is established in passing real integration proof; preserve its source commitment before deleting its former location. If the genuine minimum still cannot support thirty seconds, record the invalidated assumption and supported alternative or human decision before further experiments.

### 5. Exercise rate-limit deadlines with controlled time
Type: Behavior

Status: planned

Proof: Run the focused auto-refresh rate-limit and stream cases and the installed request-owner admission checks that consume the same timing rule. With time controlled, prove no upstream request immediately before each deadline, a request and restored snapshot at the deadline, and normal pace afterwards. The reset still extends beyond the normal cadence. Compare elapsed time with slice 1.

Behavior: A real request path receives provider-directed pacing → the test advances the time used by the actual admission owner and browser → the observable requests and Dashboard state transition without waiting out the deadline. Probe existing time inputs first. If a change to the released owner would require a new authority or wider runtime contract, stop that path for the human decision and continue independent work.

### 6. Prove Taken profile details with a smaller board
Type: Behavior

Status: planned

Proof: Focus the Taken profile and related asset or frontend checks credited with coverage. Distinguish correct ownership, absent and unreadable data, mode, branch, tool, model, accessible names and layout at the meaningful widths. Compare total elapsed of the selected proof and counts of card inspections and asset requests.

Behavior: A minimal published board has just the facts that distinguish the profile states → the Dashboard reads and renders them → one representative integrated journey and existing discriminating checks preserve the visible promises. Experiment with removing repeated card inspections and repeated geometry assertions before moving any proof.

### 7. Prove touch reading with a smaller comparison
Type: Behavior

Status: planned

Proof: Focus the touch review cases and any existing comparison or layout check absorbing their proof. Verify real touch can reach the end of an overflowing line, keeps the correct pane and file, and preserves the promised reading positions through rotation and controls. Compare elapsed, strokes, and fixture size at the affected widths.

Behavior: A small real Git comparison still forces the required overflow and layout conditions → touch and rotation exercise the same panes and controls → the reading and retention promises stay observable with fewer gestures and incidental files. Use the accepted SEED-287 baseline and keep genuine distinctions between viewports.

### 8. Preserve Cursor scope and revival with fewer full launches
Type: Structure

Status: planned

Proof: Focus the replacement and scope continuation cases plus the real backend or terminal checks credited with their proof. Observe distinct session IDs, scope paths, shared config, process identity, fresh reattach, refusal with no spawn, and automatic revival. Compare family elapsed including every surviving launch and fixture preparation.

Structure: First try a minimum real runner/session lifetime fixture for state needed before recovery, using accepted SEED-287 work when applicable. Keep an end-to-end proof for live PTY and UI behavior. Establish scope and replacement variants at the public runner or persisted session boundary when that catches their fault. Count a previously green replacement check in both coverage and elapsed.

### 9. Keep pending Take protection through the smallest snapshot sequence
Type: Behavior

Status: planned

Proof: Focus the pending Take case and the reconciler siblings credited with its proof. Observe actions protected through stale and unrelated reads and a partial accepted snapshot, then restored when the fully accepted snapshot settles. Verify failed comparison recovery and persisted reconciliation at the real boundary.

Behavior: A real accepted launch has only the facts needed to reproduce delayed reads → expose the relevant snapshots and finish their outstanding facts in order → the Dashboard shows the protected and settled states and retains reconciliation across reload. Try moving repeated launch or comparison preconditions to existing public record/HTTP proof where the browser assertion still discriminates the UI regression.

### 10. Prove repeat outcomes without recollecting the same history
Type: Structure

Status: planned

Proof: Focus automatic repeat and the receipt, admission and verdict checks credited with replacement. Observe exactly one rerun request, correct threshold, restart persistence, and distinct outcomes for recovery, failure, cancellation, partial proof, refusal and uncertainty. Measure the whole selected family including prior evidence preparation.

Structure: Keep one real receipt-to-repeat lifecycle. Try seeding independent outcome cases with the minimal canonical evidence that real collection leaves behind. Use the public verdict or ledger boundary where it distinguishes provider outcomes. Measure collector work and poll detection separately before tuning either.

### 11. Verify fewer checks and under 30 seconds together
Type: Behavior

Status: planned

Proof: Run the complete replacement selection three consecutive times with the same one-worker measurement protocol as slice 1. Every run strictly passes below 30 seconds elapsed. The number of distinct maintained checks meets the material reduction established from the coverage map. Reconcile strict transcripts with the coverage map, verify affected neighboring cases and obtain applicable hosted CI. Record suite and shard time as separate observations.

Behavior: The intended behavior remains mapped to maintained checks → run all scoped proof in one ordinary command → the developer receives equivalent, stable protection with fewer checks and the stated feedback time. If the threshold or coverage remains unmet, apply the checkpoint rule and leave the outcome open.

## Current decisions

- Each experiment starts with the measured cost, an expected worthwhile
  saving in combined elapsed time, the smallest testable hypothesis, the
  protection at risk, and a focused command. Measure before and after with
  matched conditions and include displaced work. Review recorded proof and
  the new total before keeping, revising, or reverting an experiment.
- The [corrected baseline](comparable-baseline.md) is 266.38–303.80 seconds (median 287.15), with all 45 cases. Current pinning alone costs 7.969–8.629 case seconds; the illustrative 8-second watcher-plus-pinning allocation is unproved. Slices 2–4 settle smaller genuine preparation and lifecycle boundaries before accepting that allocation.
- The canonical Cursor lifetime helper from committed SEED-287 source was reused at the same path and freshly proved here; [its provenance and proof](cursor-repair-evidence.md) distinguish this adoption from the other unlanded ownership leads.
- Slice 2 retained the [pinning source projection](pinning-evidence.md); its checkpoint keeps the combined target and smaller watcher-lifecycle premise open.
- Start with 30 distinct checks as a working count target, down from 45. Use
  the coverage map to revise that estimate as evidence warrants. Record the
  reduction and the equivalent protection on the final selection.
- After each kept change or failed premise, record the combined remaining
  gap, measured floors, coverage evidence, and which still-supported
  experiments could close it. Rewrite or reorder the unstarted slices here.
  A decisive shortfall records the invalidated assumption, affected slices,
  and either a supported alternative, independently valuable work still
  within scope, or the specific human decision needed. Keep the 30-second
  threshold and equivalent coverage binding.
- Before overlapping work, compare the accepted revisions and coordinate
  ownership with [SEED-287](../../slice-plans/576-fit-dashboard-journeys-in-default-timeout/PLAN.md).
  Reuse landed work and redirect its savings to the combined baseline.
  Independent families can proceed. Preserve any work still owned by that
  execution.
- Use real dependencies through their supported boundaries, controlled time
  for deadline logic, and existing external fixtures as inputs. Reject added
  internal mocks or brittle test-only routing, reductions in coverage, and
  apparent speedups obtained by hiding startup, moved proof, or shared work
  outside the timed command.

## Learnings

Slice 1 retains [historical probes and overlap](baseline-evidence.md), the [frozen corrected baseline](comparable-baseline.md), and the [45-check coverage map](coverage-map.md). Three consecutive strict 45/45 passes took 266.38/287.15/303.80 seconds, median 287.15, with unchanged measured inputs. Earlier passing and failed cohorts remain separate. The measured cost order and proposed next probes are recorded without claiming a saving, fewer checks or the under-30-second outcome. G1/G2 and source commitments remain coordinator-owned; no slice is marked done.

## Plan concern assessment

Refinement split the former watcher slice into stateful real-Git selection (3) and genuine preview lifecycle/integration (4), preserving completed slices and all source promises. Both owners serve the actual CLI; no parallel model is justified. Eleven slices remain, with no numeric sizing exception. Existing paid early probes bound minimum-cost and preparation assumptions. The opt-in request-owner clock choice, now slice 5, still awaits developer authority; independent authorized execution continues. Cumulative direction and the thirty-second target are unchanged.

## Execution notes

[Established execution identity, setup, observer and launch decision](execution-context.md)

- Local gates: use the focused strict runner selections and affected
  neighbors above. Include the installed request-owner checks if that
  runtime changes. Prove a changed asynchronous wait with three consecutive
  focused passes, and use the combined local gate for the final measurement.
  Start long macOS runs fully awake and on AC use caffeinate -s -i.
  On battery plug in or keep the lid open under caffeinate -i and inspect
  sleep logs. Follow [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- Carry the [failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written into every delegation and repair handoff. Use shared MakeMe
  for domain setup and keep the default timeout under the repository test
  rules. Keep raw timing output out of commits and record only the evidence
  needed to reproduce the decision.

## Story obligations

### G1. Repeat admission is not observed at its causal boundary
Reported: slice 1 — "The baseline recovered, cancelled and uncertain repeat variants failed at the five-second request-count poll after receipt ingestion; whether admission arrived late or never happened remains unproved."
Story clause: "Drive meaningful transitions through observable signals or controlled time."
Disposition: proved by slice 1: repeat-wait-evidence.md and comparable-baseline.md — the real POST-arrival callback precedes the independent request/outcome assertions; three focused 7/7 runs and three combined 45/45 runs passed. Original pressured latency remains unobserved; no latency claim or waiver is made.

### G2. Cursor setup exhausts the case before revival
Reported: slice 1 — "Run 4 timed out during the second initial Cursor launch before reaching revival; initial fixture and UI lifetime setup consumed the default case budget."
Story clause: "Each check should protect one coherent intent."
Disposition: proved by slice 1: cursor-repair-evidence.md and comparable-baseline.md — real scoped/Default execution preconditions, visible first input and the full unchanged revival observations passed three focused 2/2 runs and three combined 45/45 runs under the default case deadline.

### G3. Watcher lifecycle cost must replace the unsupported allocation
Reported: slice 2 — "The smallest observed pin case is 5.613 seconds; the illustrative eight-second watcher-plus-pin allocation has only 2.387 seconds left for every watcher distinction, and repeated full staging remains inconsistent with that allocation."
Story clause: "under 30 seconds of elapsed time"
Disposition: receiving slice 4

### G4. Replacement count and combined elapsed remain unmeasured after the change
Reported: slice 2 — "The source projection retains the same checks; no complete replacement selection, substantially lower maintained count or three under-thirty-second combined passes has been observed. The approximately 255-second estimated remaining gap is not a measured replacement run."
Story clause: "The replacement selection contains substantially fewer distinct maintained checks. Three consecutive comparable ordinary runs each pass in under 30 seconds, with a recorded mapping from every original promise to passing retained proof."
Disposition: receiving slice 11

### G5. Request-owner controlled time awaits its reserved authority
Reported: slice 2 — "Independent coordinator discovery during slice 1: KeptAdmissions refusal/answered and ReadAdmission turn settlement use the request process real clock; the observation-clock seam does not reach it. The developer question about an opt-in clock-file seam remains unanswered."
Story clause: "Advancing to just before and then to the deadline proves no upstream read before it, recovery at the deadline, and the return to steady pacing, including the reset that falls beyond the normal cadence."
Disposition: receiving slice 5
