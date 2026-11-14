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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/622-save-and-reuse-native-ab-baselines/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"49192169e77b0747cfdd2ae05e08564c5004311b335858aeed7ce33e491d60ec","plan":"ee4d053fb934f94168783b0692da91368d1b57d1bc750552e85f30c5003c213a"}}
```

#### Goal

An Open Dough maintainer can compare successive candidates against the same
baseline without paying for another baseline session when the saved result
still answers the comparison question. The story retains forced-turn blocked
observations and saves ordinary unblocked execution so the maintainer can judge
per-wake cost and ordinary-task overhead in the next blocked-work trial.
Event-driven savings remain for that trial to observe on its actual delivery
path.

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
  decisive proof, and available effort measurements. Retain the observations
  and decisive assessment inputs themselves, including owned-worker proof
  attribution when used; proof filenames and a previous verdict alone do not
  establish a reusable outcome. Keep account-bearing raw
  sessions local under the [existing retention guidance](../../Distribution/tests/native-comparison.md#retain-and-remove-evidence).
- For an authorized comparison, reuse retained evidence when the baseline
  revision, relevant case inputs and runtime conditions match and the recorded
  result supports the current outcome and effort criteria. Identify the source
  record and its conditions in the new verdict. Judge outcome and proof before
  effort. Keep the distinction between a historical observation and a fresh
  matched pair when interpreting runtime or other variable measurements.
  Verify the candidate's applied conditions before claiming a match. Unknown
  usage stays unknown; when a current criterion needs evidence the saved
  observation lacks, obtain fresh evidence. Preserve an original record when
  correcting its assessment: retain the derived assessment, its provenance
  and the decisive evidence separately.
- Run a fresh baseline when the requested baseline or a material condition
  changes, or when saved evidence is missing, incomplete or insufficient for
  the comparison. Save the new observation when it provides a usable result
  and preserve earlier observations for their original conditions. Allow an
  explicitly requested fresh pair when the comparison needs both arms observed
  together.
- Retain usable forced-turn observations from the existing
  [paused-supplier example](../../Distribution/tests/native-comparison/paused-supplier/case.md)
  for correctness and per-wake cost under the reuse rules above. They do not
  establish suppressed wakes or event-driven savings. Deriving and qualifying
  an event-driven variant, including its genuine delivery path and a baseline
  that records whether the workflow already stays quiet, belongs to the
  [blocked-work efficiency story](SEED-356-reduce-blocked-execution-effort.md#reduce-total-model-work-during-blocked-execution).
- Add a small, representative unblocked example that exercises the same
  execution workflow through final proof: the supplier is already complete
  before the first session, while the consumer still owns the same partial
  work and remaining integration/proof. It needs no event wakes. Qualify it
  on Codex, the existing comparison host, and tag the cases by behavior,
  qualified host, environment and observed duration. Save a fresh native
  unblocked baseline with its frozen payload, settings, outcome, proof and
  available coordinator and worker usage through completion. These observations
  can be captured before the blocked-work candidate exists. Reuse sufficient
  forced-turn evidence; do not rerun it solely to fill the new archive format.

Deferred promises: event-driven case delivery, skipped-wake assessment and
capture of its baseline are owned by SEED-356. General accounting tooling and
other native hosts stay with their existing stories. Deferral does not require
rejecting a naturally supported saved observation from such a case.

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
4. The existing forced-turn observation has sufficient retained proof for the
   requested criteria, and the maintainer runs the new unblocked case against
   a frozen current payload. Both become separately reusable observations.
   The unblocked case discovers the already-completed supplier, integrates
   once, finishes the partial work and records effort through passing proof
   without event wakes. A later trial can reuse matching evidence while
   identifying the forced-turn result's different run condition; neither
   observation establishes an event-driven saving.

#### Architecture

Keep capture, assessment and applicability distinct. Extend the existing
case-local comparison record, basis/recovery, arm observer and outcome-first
judge; they already own provenance, complete versus incomplete observations,
and comparison. The admission family's
[evidence-reuse guidance](../../Distribution/tests/native-admission-reuse.md)
provides a useful precedent for separating these responsibilities, rather
than a second baseline schema to adopt. Store retained evidence under the
existing `comparisons/` exclusion so saving a result does not change the case
it describes. Preserve recorded input hashes even when a later assessment
corrects an observer defect.

The selected first interaction is an explicitly supplied saved observation
on the ordinary comparison command. Automatic archive discovery is deferred;
it adds a selection policy without being necessary for successive candidates
against a known baseline. This is a delivery boundary, not a requirement to
reject cases a simple matching rule naturally supports.

The useful borrowed mechanism is a content-addressed build cache: the action
key corresponds to payload, case/project inputs and material runtime
conditions; its retained artifact corresponds to the baseline observation;
a miss requires fresh authorized acquisition. The limit is consequential:
native execution is stochastic and load is variable. A match supplies one
historical observation, not a deterministic result or simultaneous pair.

#### Refinement evidence and alternatives

Observed on 2026-11-14 at `f8624a1332d52ed850b69003d96169a0867ddd3b`:

- `PATH=/opt/homebrew/bin:$PATH Distribution/tests/native-comparison.sh --recover Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921.txt`
  returned 0, recovered 49 inputs at `764c4e0fe0ce9f478750323de6a9f30c76a7e61a`,
  and found both payload commits with recorded/current `codex-cli 0.169.0`.
  Recovery does not rematerialize the project or qualify baseline reuse.
- The [pair writer](../../Distribution/tests/support/native-comparison-pair.sh)
  records proof filenames. The
  [retained assessor audit](../../Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921-tokens.md#outcome-and-assessor-audit)
  shows why retaining only the verdict is insufficient: the original baseline
  failure was corrected after observing its owned worker's passing proof.
  Replaying the account-free retained usage rows also reproduced 80 versus 94
  responses and 8,386,947 versus 13,434,290 processed tokens. Those are available
  historical measurements, not a new native observation or general saving.
- A credential-free Bash 5.3.20 journey sourced `native-comparison-run.sh`,
  placed the existing `native-agent-paused-supplier.sh` substitute first on
  `PATH`, and ran
  `NATIVE_AGENT_PAUSED_SUPPLIER_RULE=completion native_comparison_run_case paused-supplier "$source_dir" "$work/run" "$work/results"`
  with `native_case_deadline=120`, `native_case_grace=5` and private scratch
  directories. It passed with four completed turns, preserved partial work,
  and exactly one qualifying integration/filing with passing proof. Both
  unchanged and nonqualifying events forced model turns. Scratch was removed;
  no paid session ran. This proves the current runner's forced-turn route,
  not native event delivery.
- `codex exec --help` on 0.169.0 and the
  [CLI adapter](../../Distribution/tests/support/native-codex.sh) expose explicit
  execution/resume, not supplier-event delivery. The product's
  [Codex CI notification adapter](../../Distribution/src/skills/dough-execute-plan/references/ci-notify-codex.md)
  needs a yielded tool cell that this CLI runner does not supply. No supported
  supplier-event path was established. Neutral remote changes alone cannot
  prove qualifying continuation; having the controller select the qualifying
  wake would supply the decision the experiment is meant to measure.

| Direction | Result against the goal |
| --- | --- |
| Existing recovery and manual citation | Smallest change, but neither prevents a baseline launch nor qualifies saved evidence for the runner's verdict. |
| Explicit saved observation, applicability check and candidate-only run | Recommended smallest useful capability; keeps source selection reviewable and uses the existing comparison owners. |
| Automatic archive discovery and selection | More convenience, with additional selection and ambiguity policy; deferred from the first delivery. |

The strongest challenge is that storing a previous verdict can appear to
deliver reuse while reproducing an incorrect outcome after raw evidence is
gone. The retained-proof requirement above addresses that risk. The separate
event-driven premise belongs to SEED-356 after the scope decision below; the
current CLI observation does not establish it.

#### Scope decision

On 2026-11-14 Terry accepted the recommendation to defer event-driven capture
to SEED-356 while this story delivers reusable evidence, an unblocked baseline
and forced-turn observations. This avoids selecting the future blocked-work
solution inside comparison tooling. No human scope decision remains open.

#### Decisions

- [ADR 0005 — Native validation and A/B testing](../../docs/adrs/0005-cross-tool-validation-accepted.md)
  permits reusing evidence under matching conditions and calls for retaining
  useful evidence while removing spent artifacts.
- [ADR 0010 — Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md)
  requires a stated baseline, relevant context, and disclosure of comparison
  limits before drawing an improvement conclusion.
- [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  keeps each conceptual responsibility with one owner and favors the least
  complexity that delivers the outcome. This intent-specific design belongs
  here and in maintained comparison documentation under
  [ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md), not a new ADR. The index
  and these records agree on Accepted status; no conflict or supersession was
  found.
