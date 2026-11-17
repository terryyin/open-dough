---
id: SEED-393
status: active
planted: 2026-11-17
planted_during: Terry requested focused tentative improvements from the reconciled Codex and Claude effort replays
trigger_when: selected from the product backlog for refinement
scope: four stories
---

# SEED-393 — Improve guidance through focused tests and native evidence

## Goal and authority

For Open Dough maintainers, guidance should yield tests that protect their
promised behavior and verification that reaches the affected consumers.
Keep two directly supported improvements and two focused validation stories.
Terry selected all four for the top of the backlog. Their approaches remain
unselected; queueing authorizes no implementation or release.

Owned workspace: Aino-chan's existing SEED-391 checkout; integration checkout
`/Users/terryyin/git/open-dough`, eventual target `origin/main`.

## Reconciled evidence

The [original Codex assessment](https://github.com/terryyin/open-dough/blob/384713e45b7cf99110e5f7a506e5948248edb245/.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/guidance-result.md)
is qualified by the [corrected Codex/Claude comparison](https://github.com/terryyin/open-dough/blob/fbfaa116b961a445cc606fd05363bf75f6ecad5f/.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/claude-comparison.md).
Use the correction when judging the whole result, not only the earlier report.

| Finding across the trials | Retained response |
| --- | --- |
| Both readers narrow incidental observations; mixed feedback/status assertions and branches remain. Claude reaches more E2E cases; Codex narrows some backend cases further. | Improve actual test focus, preserving proof. No host-wide winner or all-clean claim. |
| A frozen unchanged Codex E2E case fails on old argv length despite correct medium behavior. Claude's planner misses other consumer groups and overstates counts. | Verify affected unchanged consumers and bound acceptance claims to observed proof. A smaller diff is not evidence of lower coupling. |
| Codex's clean return overlooks residue; Claude's reader guarantee exceeds its implementation, while one return explicitly names an older branch. | A short, accurate scope/residue statement is an acceptance condition of the two stories, not a separate reporting product. |
| Both P plans put Structure before default, but neither is executed; setup/evidence recovery creates additional work. | Drop standalone planning-order and comparison-setup improvements. Use existing guidance/tooling; the new validation stories address case reuse and first investigation, not a separate setup platform. |

Positive witnesses in absence tests and strict format/count/order assertions at
their owning boundary are useful proof, not smells to remove mechanically.
The conditional oversized-follow-up rule was not exercised; do not claim it
worked or failed. Current product repair `0724558d6` stays outside the frozen
trial; manually cleaning today's code alone does not validate future guidance.

## Keep the instructions simple

Prefer deleting, merging or replacing unclear existing wording to adding rules.
Use direct, concise instructions with one authoritative home, following
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Add an example only when it resolves a real ambiguity. Introduce no mandatory
report template, counters, parser framework or blanket full-suite run.
If the existing instruction is already sufficient, investigate why it was not
applied; a wording expansion is not a required outcome.

For each story, inspect the final code/proof and use an ordinary brief return
to name relevant residue or unverified scope. Do not infer completeness from a
helper extraction or a passing selected gate. This is acceptance of the actual
result, not a new reporting workflow.

## Evaluation of the two test-guidance improvements

- A never changes or reruns: product/test `4b75c2888..eda73008b`, completion
  `c741f265f`, transcript `fa9d77b7-c44c-4f51-9e03-d7b0073a5c6e`.
  The current Codex and Claude B results also stay frozen, including failures.
- Each selected story ends with one or more fresh B redos on the same
  historical task, judged against A. Pin the candidate guidance and settings;
  keep the participant blind to prior outcomes and the assessor's answers.
- Set a few concrete quality criteria before B runs. Judge code and decisive
  proof first; effort is secondary. Disclose host/context differences, unknown
  measurements and stops. A single replay does not isolate a guidance effect.
- If composing the two improvements into one B run, judge each hypothesis
  separately. A simplified task would be a different case; it cannot silently
  replace this comparison's task or reuse A as if the conditions matched.
- Further native runs require the selected story's authority. This draft
  starts none. No new plan, guidance adoption or backlog change is authorized.

## Stories

<a id="tests-ignore-unrelated-launch-changes-without-losing-proof"></a>

### 1. Tests protect their own behavior without incidental coupling

**Identity:** SEED-393#tests-ignore-unrelated-launch-changes-without-losing-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Focus / value:** maintainers change one launch default without repairing
  naming, instruction or notification tests unrelated to that value.
- **Outcome:** tests observe the behavior their intent promises. Use actual
  output readers where useful; separate genuinely different behaviors. Keep
  strict format/default proof at its owner and meaningful positive witnesses.
- **Assumption:** clearer, shorter guidance can improve the remaining mixed
  cases without weakening proof or duplicating journeys. Existing readers and
  builders may suffice; a new abstraction is not an acceptance requirement.
- **Boundary example:** a naming case survives an unrelated effort change;
  a wrong name still fails. A blank-input case proves no instruction while
  dedicated effort proof still detects a wrong default.
- **Final B redo:** inspect the actual tests against frozen A, including
  implicated mixed cases and branches. Use bounded counterexamples where
  needed to verify useful failure signals. Briefly identify retained residue;
  no all-clean claim unless the inspected result supports it.
- **Simplicity:** replace or shorten the existing rule first; reject extra
  instructions or helpers that make the code harder to understand.
- **Effort:** M, medium confidence, using SEED-345's shared-workflow band.
  **Depends on:** none. **Safe stop:** focused protective tests have value
  even if the verification story is not selected.

<a id="proof-reaches-unchanged-consumers-of-changed-output"></a>

### 2. Verification reaches affected consumers before completion is claimed

**Identity:** SEED-393#proof-reaches-unchanged-consumers-of-changed-output
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/674-verification-reaches-affected-consumers/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3d682676f9dbd8ce92f94e7b6893ee44d67fce238c2a1e6f0a2ce5597162b707","plan":"d3b3c2de1d580ca58b0e3ad809a94071417a7ad4c50205ea375bb3d4dcd6ff87"}}
```

**Goal:** Open Dough maintainers, and projects whose agents execute plans,
receive a change claimed complete only after its local proof has reached the
unchanged tests and helpers that observe the changed output. A stale consumer
then fails before publication rather than turning CI red after it, and the
return separates observed proof from inferred reach and unverified scope.

**Investigated basis.** Facts:

- Codex P settled its consumer premise by scratch-applying the default and
  running only backend `launches/` (319 passed, 9 failed). Its slice-1 trace
  listed `e2e/launches/agent-launch-ad-hoc.spec.ts` only through a comment
  cross-reference and excluded it: “journey asserts navigation, actions,
  options, lifecycle or supplied usage rather than the new default”. The
  unchanged `:120` asserts `argv` length 3 and receives 5. That trace held
  about 1,230 located rows, 982 excluded. Sources: retained bundle head
  `codex-B` (plan 664's decisive premises); scratch trace
  `/tmp/dough-effort-slice1-consumers.md`, which is not durable.
- The changed output is observed where the fake Claude Code records launches:
  `claudeLaunchCalls` and `expectNamedAdHocCall` are read by 45 backend,
  15 integrated-support and about 65 E2E files at `codex-B`. No trace in that
  run supplied either as a term.
- Claude P ran its scratch default against backend, frontend and E2E groups
  and reached those E2E consumers, but its counts disagree with its own logs
  (backend per-file figures sum to 26, not 25; “37 skipped” where 46 did not run).
- CI group `e2e` shard 1 runs `e2e/launches/agent-*`: in real delivery this
  miss appears as red CI after publication and a repair round.
- [Executable proof](../../Distribution/src/skills/dough-story-refinement/references/executable-proof.md)
  already allows exclusion only when the effect does not reach a boundary and
  requires inspecting assertions; [decisive premises](../../Distribution/src/skills/dough-slice-planning/references/settle-decisive-premises.md)
  asks for a scratch application and “one relevant test run”. Both were
  applied: “relevant” and “the suite covering the changed surface” were read
  as the suite nearest the changed code, and another subject was accepted as
  an exclusion reason.

Hypotheses: selecting by where the output is observed makes agents include the
E2E launch group (only the final B redo settles agent behavior); running the
observation point's suites costs a reasonable slice check (one CI shard; Claude
P ran it), measured during planning.

**Scope — required:**

- Replace, in their existing homes, the words that let reach follow the changed
  code: the scratch run and focused proof cover every suite whose tests read the
  changed output where it is observed (its stand-in, recorder, reader or
  rendered surface), including unchanged tests and helpers.
- An exclusion says why the effect does not reach that boundary. A consumer
  that still reads the changed output is affected even when its assertions are
  about another subject.
- This story's own return and the B redo's acceptance distinguish observed
  proof, inferred reach and unverified scope. Counts are optional; a reported
  count names its unit and matches the retained observation. Reuse existing
  claim-limiting wording when it suffices.
- Final B redo under the seed's evaluation section, judged against frozen A:
  first show that the selected proof fails on the old assumption (the frozen
  `agent-launch-ad-hoc.spec.ts:120` argv length).

**Scope limits:** no new consumer-trace field, script heuristic, record schema,
parser or blanket full-suite run; trace-record size is not addressed. How found
consumers are narrowed belongs to story 1. The delivery brief's “count of
tests edited outside its subject” clause briefs the refactor pass, not proof
reach; it stays outside this story.

**Key examples:**

1. A default joins the launch argv; the ad hoc spec never names effort but
   asserts argv length 3 → selection by the fake host's recorded launches
   includes E2E `launches/` → the scratch run fails at `:120` before
   publication, and the case is updated or narrowed rather than excluded.
2. The trace lists that spec through a comment → disposition “asserts
   navigation rather than the default” → not an exclusion, since the test reads
   the recorded argv; it is run.
3. A helper renamed within one file, with no shared output → focused proof
   stays; no further suites.
4. A run filtered by `--grep effort` is green → the return names the variants
   that ran and lists unrun output readers as unverified, not as covered.
5. A return says “25 backend failures” → it names the unit and matches the log
   (9 failed, 46 did not run), or it omits the count.

**Architecture:** executable proof stays the one home of how proof reach is
selected; the planning premise links to it rather than restating its own test
run selection ([ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md) §3).
Observation-point selection is judgment, not a script feature: the observation
point enters the existing trace as a `--term`. No Accepted decision conflicts;
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) keeps B
acceptance distinct from comparison and
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md) fixes
criteria before the run.

**Evaluation:** the B redo is a paid native run, triggered manually by Terry.
Recommended host: Codex, whose run showed the gap. Criteria before the run:
proof reaches the E2E launch consumers that read recorded argv; no consumer
that reads the changed output is excluded for its subject; the completion
return names any unrun affected group and its counts match. Effort is secondary.

- **Effort:** M, medium confidence in the problem, lower in selection cost.
  **Depends on:** none. **Safe stop:** more trustworthy verification has value
  even without a broader test refactor.

<a id="repeat-native-guidance-checks-on-real-story-examples"></a>

### 3. Repeat native guidance checks using focused examples

**Identity:** SEED-393#repeat-native-guidance-checks-on-real-story-examples
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/674-repeat-native-guidance-checks/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a84c13242c186b8e3687c9a35e82ca898da3c4d017e8bba234454569264efe21","plan":"619291dea348d7b3e07c52a10b0ad3536f6b5329a0ea962d1eecaa5d8a18c302"}}
```

#### Goal

Open Dough maintainers can select and repeat a known native guidance check
from real work, with enough retained context to judge useful code and proof
without reconstructing the experiment. Acceptance judges one candidate;
comparison judges it against a stated baseline. Neither a green selected gate
nor a clean-sounding return establishes refactoring quality.

#### Scope

- Add one focused test/refactoring case extracted from the retained effort
  replay to the existing case collection. Preserve the real launch-command
  observation, incidental consumers, owning proof and a meaningful refactoring
  decision. Use the smallest runnable context that preserves that judgment;
  retain more source when removal would turn it into a different exercise.
- Establish its brief basis before native runs: unrelated default changes
  should not break tests of naming or absent instructions; defects in those
  promises still fail; owning default/format proof stays strict. Inspect mixed
  cases and branches as well as any reader/helper. A mechanical value update,
  weakened proof or unsupported clean claim cannot pass the complete review.
- Demonstrate one short select → state criteria → pin inputs/settings → run
  → inspect code/proof → retain reusable evidence procedure for this case and
  the existing `unblocked-supplier` case, with its own completion/once/proof
  criteria. Repeats remain explicitly selected and on demand.
- Use **Native guidance checks** throughout active guidance, catalog and help,
  and reconcile affected entry names, callers and references. Comparison and
  A/B remain correct terms for actual two-variant comparisons. Preserve story
  identities, Accepted ADR meanings and immutable historical records/hashes;
  historical recovery must still reach the original inputs after names move.
- This extraction creates a new task/basis and therefore its own stated
  baseline. Historical A (`4b75c2888..eda73008b`, completion `c741f265f`) and
  both frozen Bs remain unchanged provenance, never its matched comparison
  arms. Reuse an observation only when task, context and runtime still match.

**Delivery limits:** maintainer tooling and Codex qualification only. No new
experiment engine, universal score, mandatory report form, automatic paid suite,
host expansion, runtime-guidance adoption or release. Improving test-focus or
consumer-selection instructions remains with stories 1 and 2; investigating an
unfamiliar finding remains with story 4. These limits do not require rejecting
naturally supported cases. Paid observations belong to explicitly authorized
execution, not this preparation.

#### Key examples

1. A maintainer selects the effort-derived case by its workflow/traits → runs
   its pinned neutral task → receives retained code and decisive observations
   that distinguish protective refactoring from changed expected values.
2. A result updates every incidental `medium` literal or drops the only useful
   assertion → independent default perturbation and promised-behavior faults
   are assessed → the inadequate result fails, even if its ordinary gate is
   green or its return says all tests are focused. Exact default/format checks
   at their owner and positive witnesses remain valid.
3. The maintainer selects `unblocked-supplier` → follows the same procedure →
   judges preserved partial work, one integration/filing and executed proof
   against that case's criteria, without a new harness or universal rubric.
4. A focused extraction differs from the historical whole-story task → a
   comparison is requested → it uses its own frozen baseline or obtains a new
   one; old A is neither rerun nor presented as matched. An interrupted run
   remains incomplete and is not retried into success.
5. Active umbrella names change → a maintainer recovers a kept historical
   record → original recorded bytes and input hashes remain recoverable, while
   current selection/help uses Native guidance checks.

#### Architecture

Reuse `Distribution/evaluation/`'s catalog, case fixture/observer/assessor,
native host, retention and baseline boundaries. Keep the neutral participant
apart from the assessor's answers. Deterministic controls establish tool and
assessor discrimination; actual native sessions establish host behavior.
Ordinary inspection owns semantic refactoring judgment that executable probes
cannot settle. Renaming hash-bound inputs changes a future basis, not the
historical observation: reconcile names before freezing qualification inputs.

This follows [ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md),
[ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
and [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
No new architecture boundary or ADR exception is needed.

**Effort:** M, medium confidence; extraction fidelity and coherent renaming
remain the delivery risks. **Depends on:** none. **Safe stop:** one qualified
quality case retains value, with remaining obligations explicit.

<a id="try-guidance-improvements-by-redoing-the-source-story"></a>

### 4. Try an unfamiliar improvement by redoing its source story

**Identity:** SEED-393#try-guidance-improvements-by-redoing-the-source-story
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Focus / value:** maintainers investigate a finding that no existing case
  covers before investing in a reusable example or adopting a proposed change.
- **Outcome:** finding → improvement hypothesis → replay of its source story
  → code/proof and behavior assessment → decision whether to extract a case.
  A catalog entry is optional at this stage, not a prerequisite or an automatic
  consequence of a successful run.
- **Assumption:** a pinned historical story and a fresh native participant can
  expose the relevant decision with a short investigation procedure. The
  assessor reuses context; the participant does not receive prior outcomes.
- **Evaluation:** demonstrate one finding outside existing case coverage:
  state the intended gain and a few concrete criteria, identify the observed
  baseline, pin candidate guidance/settings, run a bounded native redo and
  inspect actual output and decisive proof. Return keep/revise/drop, or an
  explicitly inconclusive result and the missing evidence; separately decide
  whether case extraction is worthwhile. Never require a winning candidate.
- **Boundary:** reuse an applicable saved A without changing it. Missing or
  mismatched baselines stay explicit. Choose the phase and host relevant to
  the hypothesis; no obligatory full-story, planning-plus-execution or host
  matrix. A first exploratory run is not automatically a controlled A/B result.
- **Simplicity:** a short recipe using existing native launch/evidence tools;
  no new experiment engine or compulsory case registration before learning.
- **Effort:** S initially, medium confidence for one host and one finding;
  broader shared-host support would need reassessment. **Depends on:** none;
  it can use current tools without story 3. **Safe stop:** an honest first
  decision is useful even when no reusable case is extracted.

## Reconciliation and scope reduction

Retain the original two identities; the new validation stories have new
anchors. Display numbers do not reallocate any earlier candidate identity.

- Earlier reporting candidate, `SEED-393#refactor-returns-account-for-applicable-residue`,
  is merged into the brief acceptance conditions above; it is no longer a
  separate candidate.
- Drop the earlier planning-order candidate,
  `SEED-393#planning-narrows-consumers-before-changing-shared-output`:
  lower priority, an unexecuted benefit with adequate existing instructions.
- Drop the earlier standalone comparison-setup candidate, `SEED-393#blind-comparisons-retain-decisive-evidence`:
  lower priority as standalone product work; reuse the existing native tooling
  and a small manual procedure. Preserve the observed limitations as evidence.

Recommend verification reach, then test focus for the immediate code-quality
work. Stories 3 and 4 are independent: repeat known cases versus investigate
unfamiliar findings. Three M hypotheses and one initially S hypothesis; these
are not time promises. Existing guidance plus closer manual acceptance remains
the smaller alternative; keep a no-wording-change result available.

Terry intends to release the currently reviewed guidance before these changes,
then release validated runtime-guidance improvements later. This records the
sequence, not release execution or a release-ready verdict. Maintainer-only
case tooling/renaming need not gate a client payload release. Selection,
planning and native run choice remain open. Queue order is verification reach,
test focus, repeatable examples, then unfamiliar-finding replays.

## Existing capabilities and constraints

Reuse [native cases/comparisons](../../Distribution/evaluation/comparison.md),
[saved baselines](../../Distribution/evaluation/baselines.md) and existing
case-specific assessors. Keep native acceptance distinct from comparison under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md); establish
quality before evaluating a run under
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
No Accepted decision is changed by the naming proposal.


Story 3 owns still-needed replay inputs at
`/Users/terryyin/open-dough-scratch/seed-391/retained/`: a verified Git bundle
of both frozen B histories, prompts/context and planning captures. Its README
records recovery and eventual extraction/disposal; original A is unchanged.
