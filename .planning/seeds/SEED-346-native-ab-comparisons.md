---
id: SEED-346
status: active
planted: 2026-11-14
planted_during: Terry asked for runnable A/B comparisons using labeled examples from the session-efficiency audit
trigger_when: selected from the product backlog for refinement
scope: story
---

# SEED-346 — Run native A/B comparisons on examples from real work

<a id="close-native-comparison-harness-gaps"></a>

### Close native comparison harness gaps

**Identity:** SEED-346#close-native-comparison-harness-gaps
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/621-close-native-comparison-harness-gaps/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"74f4f34454c1adc7fae61eefa64bc86a18bd8a3eb84fc8e079d14fa5a4eb62c8","plan":"caf6709f2ebcfd553ef758cebdcd8cc427a2afd975cfb77b6883d80bef85df56"}}
```

#### Goal

An Open Dough maintainer running native comparison cases gets arm services
cleaned up, free pair checks that test the working tree they are about to
commit, host selection that names only qualified hosts, and per-turn command
and harness facts the runner records once for every case, so the comparison
harness from the completed native A/B comparisons story
(SEED-346#run-native-ab-comparisons-on-real-work, recoverable at
`caeb237278b6dff869fb08e325d9d435e37e58c0:.planning/seeds/SEED-346-native-ab-comparisons.md`) behaves as that
story promises.

#### Scope

Bounded retrospective correction of that story's delivered harness: stop
arm-owned processes, both the services a case started and the arm's host
session, when materialization fails or a run is interrupted;
make the credential-free pair, refresh and incomplete journeys install payloads
from the working tree rather than the checkout's committed HEAD; and make
catalog host selection match qualified hosts only; and let the runner record
each turn's command count and harness inspection, as `unknown` when the
turn's stream cannot show them, instead of each case. Findings, provenance and
proof are in the [correction plan](../slice-plans/621-close-native-comparison-harness-gaps/PLAN.md).

<a id="reuse-native-comparison-baselines"></a>

### Save and reuse native A/B baselines

**Identity:** SEED-346#reuse-native-comparison-baselines
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

#### Goal

An Open Dough maintainer can compare successive candidates against the same
baseline without paying for another baseline session when the saved result
still answers the comparison question. The first saved results cover blocked
and ordinary unblocked execution so the maintainer can judge both savings and
overhead in the next blocked-work trial.

#### Current behavior

The [pair runner](../../Distribution/tests/support/native-comparison-pair.sh#L110)
starts both arms for every comparison. The [saved paused-supplier record](../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921.txt)
already contains the baseline revision, case input hashes, starting project
state, applied model and reasoning effort, host version, outcome and measured
effort. [`--recover`](../../Distribution/tests/native-comparison.md#keep-a-comparison-and-refresh-a-case)
recovers a retained record and its Git basis. A later pair has no path to use
that result as its baseline.

#### Scope

- Keep a compact baseline result with the case in the repository, with enough
  evidence to explain its outcome and reuse it after raw session artifacts are
  removed. Record the resolved payload revision, case and project inputs,
  applied model and reasoning effort, host/runtime conditions, outcome,
  decisive proof, and available effort measurements. Keep account-bearing raw
  sessions local under the [existing retention guidance](../../Distribution/tests/native-comparison.md#retain-and-remove-evidence).
- For an authorized comparison, reuse retained evidence when the baseline
  revision, relevant case inputs and runtime conditions match and the recorded
  result supports the current outcome and effort criteria. Identify the source
  record and its conditions in the new verdict. Judge outcome and proof before
  effort. Keep the distinction between a historical observation and a fresh
  matched pair when interpreting runtime or other variable measurements.
- Run a fresh baseline when the requested baseline or a material condition
  changes, or when saved evidence is missing, incomplete or insufficient for
  the comparison. Save the new observation when it provides a usable result
  and preserve earlier observations for their original conditions. Allow an
  explicitly requested fresh pair when the comparison needs both arms observed
  together.
- Qualify and tag two cases for the
  [blocked-work efficiency story](SEED-356-reduce-blocked-execution-effort.md#reduce-total-model-work-during-blocked-execution).
  Derive an event-driven variant from the
  [paused-supplier example](../../Distribution/tests/native-comparison/paused-supplier/case.md),
  retaining its task, starting state, supplier evidence, and proof. Deliver
  unchanged, nonqualifying, and qualifying evidence on a matched schedule and
  let the workflow determine which model turns occur. The assessor distinguishes
  an intentionally skipped wake from failed or unavailable observation and
  checks preserved work, exactly one qualifying continuation, and terminal
  proof. Keep the original forced-turn case for correctness and per-wake cost.
- Add a small, representative unblocked example that exercises the same
  execution workflow through final proof. Tag both cases by the behavior they
  represent, qualified host, environment, and observed duration. Save a fresh
  native baseline for each on the intended host, with its payload, settings,
  outcome, proof, and available coordinator and worker usage through completion.
  Record whether the blocked baseline already stays quiet. These baselines
  can be captured before the blocked-work candidate exists.

#### Key examples

1. The first comparison saves a usable baseline. A second comparison changes
   only the candidate and uses the same baseline revision, task, events,
   project context and runtime settings. It launches only the candidate and
   cites the saved baseline outcome and effort in its verdict.
2. The maintainer advances the baseline revision, or changes the model,
   reasoning effort, or another material condition. The next authorized pair
   runs and saves a baseline for that configuration. A later match can reuse
   the new observation, and the earlier one is still traceable.
3. A complete baseline missed the case's expected outcome. If its evidence
   answers the new comparison, the next run can reuse that observed failure.
   If the baseline stopped before the outcome could be judged, the next
   comparison obtains fresh baseline evidence.
4. A maintainer runs the new blocked and unblocked cases against the current
   workflow. Each produces a separately reusable baseline. The blocked result
   records actual model wakes and whether the workflow already stays quiet.
   The unblocked result records effort through passing proof. A later trial
   can reuse each matching result and still identify the original forced-turn
   result as evidence for a different run condition.

#### Decisions

- [ADR 0005 — Native validation and A/B testing](../../docs/adrs/0005-cross-tool-validation-accepted.md)
  permits reusing evidence under matching conditions and calls for retaining
  useful evidence while removing spent artifacts.
- [ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md)
  requires a stated baseline, relevant context, and disclosure of comparison
  limits before drawing an improvement conclusion.
