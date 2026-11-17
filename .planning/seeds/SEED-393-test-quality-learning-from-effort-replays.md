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

## Stories

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

<a id="guidance-check-participants-run-owning-proof"></a>

### 5. Guidance-check participants can run their owning proof

**Identity:** SEED-393#guidance-check-participants-run-owning-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/676-guidance-check-participants-run-owning-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"df24369a027e199684a41fd07ad43898fc55965bcb7dbcf4ab6e5dad80f25659","plan":"02c923c2c1f9caa825cd478c4e869affdb6b07c08544279312fe04bbebe845d0"}}
```

**Goal:** a maintainer repeating the `launch-command-tests` Native guidance
check gives its participant an environment in which the owning backend and
E2E proof can run, so environment failures no longer obscure whether the
participant verifies its change.

**Scope:** correct the case's fixture paths and inherited process environment,
including startup and teardown, with credential-free proof through its real
materialization and native sandbox wrapper. Preserve the task, frozen project
and overlay, observer, probes, assessor, and committed baseline. This does not
change how participant proof is assessed, repair the historical product or
tests, qualify another host, or authorize a paid native session. The plan owns
the correction findings, examples, decisions, and proof. Retrospective correction of
the completed SEED-393#repeat-native-guidance-checks-on-real-story-examples. Plan:
[676](../slice-plans/676-guidance-check-participants-run-owning-proof/PLAN.md).

<a id="recovery-proof-covers-historical-case-paths"></a>

### 6. Recovery proof covers historical case paths

**Identity:** SEED-393#recovery-proof-covers-historical-case-paths
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/677-recovery-proof-covers-historical-case-paths/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"49a291af60ae3c627554f7c398751569693a5bfd79ceb96bebc57e5476081a8f","plan":"996b95af2b679bdc18df7a71bb9afe861c3099082cad524dfae6d992e9cf0d13"}}
```

**Goal:** a maintainer can trust that the maintained recovery test protects
recovery of kept records whose inputs were saved under an earlier collection
path. Today a regression there passes that test.

**Scope:** the credential-free refresh and recovery test only. Intent
Coverage correction of
the completed SEED-393#repeat-native-guidance-checks-on-real-story-examples. Plan:
[677](../slice-plans/677-recovery-proof-covers-historical-case-paths/PLAN.md).

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

The frozen Codex B product and test bytes that later work needs are tracked
in the `launch-command-tests` guidance-check case's `overlay/`. The
assessments remain recoverable at `fbfaa116b`; original A is unchanged.
