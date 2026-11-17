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
- **Evidence from the verification story's Codex redo (2026-11-17):** it
  narrowed rather than excluded: `expectNamedAdHocCall` delegated to a
  single-launch check of name, instruction and cwd, and the ad hoc spec's
  argv-length assertion became “no launch instruction”. Some of its exclusion
  reasons still cited “no changed-helper call”, a code-proximity reason.
- **Effort:** M, medium confidence, using SEED-345's shared-workflow band.
  **Depends on:** none. **Safe stop:** focused protective tests have value
  even if the verification story is not selected.

<a id="repeat-native-guidance-checks-on-real-story-examples"></a>

### 3. Repeat native guidance checks using focused examples

**Identity:** SEED-393#repeat-native-guidance-checks-on-real-story-examples
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **Focus / value:** maintainers select and repeat a known guidance check
  without reconstructing the experiment or confusing acceptance with comparison.
- **Outcome:** add a focused test/refactoring case derived from this effort
  replay to the existing collection. Retain the smallest context preserving
  the real judgment; define a few code/proof and refactoring criteria before
  runs. Demonstrate the same simple procedure with another existing case.
- **Naming:** use “Native guidance checks” consistently across maintained
  guidance, catalog descriptions, tool help and affected names/references.
  Acceptance judges one candidate; comparison judges it against a baseline.
  Keep A/B language where it genuinely denotes the two variants. Global
  renaming must preserve recorded identities and immutable historical evidence;
  retain Accepted ADR meanings and reconcile active callers when names move.
- **Assumption:** existing case, assessor, baseline and runner capabilities
  suffice. Current comparison runner qualification is Codex only; expanding
  hosts or creating another framework is not part of the first delivery.
- **Evaluation:** the selected case distinguishes focused protective tests
  from mechanical value updates and unsupported clean claims; a plausible
  bad outcome fails its assessment. Another case uses its own focused criteria,
  not a universal quality score. The repeat is explicitly selected, on demand.
- **Baseline boundary:** the existing A remains untouched. If extraction
  changes the task or context materially, this is a new case with its own
  stated baseline; do not silently compare its B with the old A.
- **Simplicity:** reuse the maintained native tools and one short case basis;
  avoid new report forms, setup machinery and automatic paid suites.
- **Effort:** M, medium confidence; case extraction and coherent renaming are
  the uncertainty. **Depends on:** none; current retained evidence can supply
  this example without story 4. **Safe stop:** one usable quality case has value.

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
