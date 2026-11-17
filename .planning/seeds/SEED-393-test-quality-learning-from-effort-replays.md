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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/680-try-an-unfamiliar-improvement-by-redoing-its-source-story/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1925237f7e0ed42eb848cc20282e396c822115405b6786d86821d570fff6b4db","plan":"18132370d4490865190ec98caa53dba6a5f52e3ab2347867bd315932378f1b4c"}}
```

**Goal.** An Open Dough maintainer holding a retained finding that no
guidance-check case exercises gets a first, honestly bounded decision on a
proposed guidance change from one short native redo of the phase where the
finding occurred, before paying for a reusable case or adopting the change.
The story's own outcome is one such decision on one finding plus the short
recipe that produced it; a reliable effect estimate stays with a matched
comparison.

**Direction.** Compared against the same goal:

| Way | Assessment |
| --- | --- |
| Whole-story blind redo, as plan 668 did | Reaches every moment, but its participants alone ran 74 and 104 minutes and its assessment took 18 records and five obligations. Too heavy for a first look. |
| Walk-through and wait for the next real use | Free, but gives a predicted benefit only, and the [scope-limit watch](../../docs/maintainer/near-term-watch-list.md#scope-limits-and-required-restrictions) has waited for a first relevant use since `v0.3.75`. |
| Extract a case first | Reusable and scripted, but pays fixture and assessor cost before anyone knows the moment reproduces. |
| **Phase-bounded redo read as a pilot (selected)** | One fresh session from the pinned state just before the finding's moment, in the size of a case journey, with no case to build. |

Borrowed from a pilot study before a trial: the first reading is feasibility
(did the session reach the moment the finding concerns?) and only then the
outcome. The analogy breaks at the population: a pilot samples the trial's own
population, while a redo's host, model and guidance release may differ from
the source run, so every such difference is a named baseline mismatch.

**Scope — required behavior**

- **Recipe.** One short section in
  [Native guidance checks](../../Distribution/evaluation/guidance-checks.md),
  for a finding no case covers, reusing that guide's procedure wording where
  it already fits:
  1. Before the run, state the intended gain, two to four concrete criteria,
     the wrong outcome, and the moment the session must reach.
  2. Name the baseline: the source execution's recorded commits and returns,
     or an applicable saved baseline, unchanged, with each mismatch (host,
     model, effort, release, task) listed.
  3. Build a scratch clone outside this repository at the pinned source
     revision with a local bare remote, the candidate guidance committed into
     the installed skill copies that revision's host reads.
  4. Start one fresh native session with the source phase's own instruction,
     under a stated deadline, and send it nothing afterwards.
  5. Read whether the moment was reached, then the produced files and proof
     against the criteria.
  6. Return keep, revise or drop for the hypothesis, or inconclusive with the
     missing evidence; separately say whether extracting a case is worthwhile.
  7. Record the result as the finding's follow-up note and remove the scratch
     clone and raw session.
- **Demonstration.** The recipe is followed once on
  [ODF-361](../../docs/maintainer/findings/ODF-361.md) (a file line limit met
  by joining wrapped lines; hypothesis: the
  [limit](../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md)
  counts normally wrapped lines), and the recipe text is corrected to what the
  run actually needed.
- **Verdict strength.** One run supports revise or drop when the wrong outcome
  appears under the candidate, and inconclusive when the moment is not reached
  or a mismatch decides the reading. Keep means worth carrying forward within
  the observed context: a predicted benefit under
  [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md), not
  an observed improvement.

**Scope — required restrictions**

- The participant receives no prior outcome, finding text or comparison
  purpose; otherwise the redo observes a prompted answer, not the guidance.
- The scratch clone has no real remote, so a redo can publish nothing.
- The native session is paid: it runs only under the execution instruction's
  explicit authorization, once, never from a test command or CI.
- A saved baseline and the source execution's records are never edited.

**Scope limits (not undertaken here)**

- A second arm, second host, rerun after an inconclusive result, or a matched
  comparison.
- A script, assessor, case registration, report template or triage-skill link.
- Adopting the candidate wording: the candidate exists only in the scratch
  clone, and a keep verdict feeds the finding's ordinary follow-up.
- Findings whose response is a deterministic check need no redo and are not
  the recipe's subject.

**Key examples**

- Basis stated, session reaches a file over the limit and shortens it with
  normal wrapping → keep within the observed context, mismatches named, and a
  separate yes or no on extracting a case.
- Session finishes without any checked file exceeding the limit → inconclusive:
  the moment was not reached; the note names the starting state that would
  reach it; no second session starts.
- Session joins lines under the candidate wording → revise or drop the
  hypothesis; the recipe has still done its job.
- Source run used Claude Code at 0.3.72, redo uses Codex at today's defaults →
  host, model and release are listed as mismatches and the verdict says which
  reading they limit.
- Session stops with a question → its question is quoted, the run is recorded
  as stopped there, and nobody answers it.
- Setup or evidence recovery outgrows the run itself → the return says so and
  the recipe is shortened or withdrawn; an honest first decision still stands.

**Architecture.** The recipe is maintainer guidance beside the case procedure
it precedes, outside the installed payload
([ADR 0004](../../docs/adrs/0004-client-installation-and-update-accepted.md)).
It adds no runtime responsibility. It applies
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) §4–5 (gain
and criteria before the run, pinned payload, judge outcome and proof, delete
spent evidence) and ADR 0010 (basis before the run, limits disclosed) without
changing either. One system fact constrains the scratch step: a historical
revision's host reads its installed copies, at paths that have moved since
(`src/skills` then, `Distribution/src/skills` now), so the candidate is
re-expressed for that revision, not applied as today's diff.

**Decisions for planning and Take**

- ODF-361 and Codex are the recommended target and host (two occurrences
  across both hosts, a mechanically readable outcome, and Codex started in a
  scratch clone where Claude Code first refused trust). Terry may name another
  finding or host before Take.
- Planning chooses which ODF-361 occurrence supplies the starting state:
  plan 360 slice 2 at `c01a7b8a^` holds its plan in a commit but is a whole
  behavior slice; plan 451's refactor pass before `7466db35` is the shorter
  phase but its pre-refactor state must be shown recoverable.

**Effort:** S, medium confidence, for one host and one finding. **Depends
on:** none. **Safe stop:** an honest first decision is useful even when no
case is extracted and the recipe is withdrawn.


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
