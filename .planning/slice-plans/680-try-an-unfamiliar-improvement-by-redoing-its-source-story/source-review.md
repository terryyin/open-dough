# Source review

Launch: 2026-11-17, a fresh general-purpose Claude Code subagent with no
conversation inheritance, from the coordinator of this execution. Input: one
file holding the story section text of
SEED-393#try-guidance-improvements-by-redoing-the-source-story, from
**Goal.** through the **Effort:** line, with no amendments; instruction to read
nothing else, change nothing, and number independently observable promises.
The reviewer noted the input ended at the **Depends** line.

Unnumbered context the reviewer kept: the goal rationale, the Direction table
and pilot analogy, the restriction's reason, the scope limits, the
architecture notes, the planning decisions and the effort line.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A short recipe section in Native guidance checks for a finding no case covers, reusing the procedure wording where it fits, maintainer guidance outside the installed payload | slice 1 | observed: Distribution/evaluation/guidance-checks.md#redo-the-source-phase-for-an-uncovered-finding: section after Procedure, opening sentence scopes it to a finding no case covers; guide is outside Distribution/src |
| 2a | Recipe: before the run, state the intended gain, two to four concrete criteria, the wrong outcome and the moment the session must reach | slice 1 | observed: Distribution/evaluation/guidance-checks.md recipe step 1 |
| 2b | Recipe: name the baseline (source commits and returns, or a saved baseline, unchanged) and list each mismatch (host, model, effort, release, task) | slice 1 | observed: Distribution/evaluation/guidance-checks.md recipe step 2 |
| 2c | Recipe: build a scratch clone outside the repository at the pinned source revision with a local bare remote; commit the candidate into the installed copies that revision's host reads, re-expressed for that revision | slice 1 | observed: Distribution/evaluation/guidance-checks.md recipe step 3 |
| 2d | Recipe: start one fresh native session with the source phase's own instruction under a stated deadline and send it nothing afterwards | slice 1 | observed: Distribution/evaluation/guidance-checks.md recipe step 4 |
| 2e | Recipe: read first whether the moment was reached, then the produced files and proof against the criteria | slice 1 | observed: Distribution/evaluation/guidance-checks.md recipe step 5 |
| 2f | Recipe: return keep, revise or drop, or inconclusive with the missing evidence; separately say whether extracting a case is worthwhile | slice 1 | observed: Distribution/evaluation/guidance-checks.md recipe step 6 |
| 2g | Recipe: record the result as the finding's follow-up note and remove the scratch clone and raw session | slice 1 | observed: Distribution/evaluation/guidance-checks.md recipe step 7 |
| 3a | Verdict strength: revise or drop when the wrong outcome appears under the candidate | slice 1 | observed: Distribution/evaluation/guidance-checks.md verdict paragraph after step 7: revise or drop |
| 3b | Verdict strength: inconclusive when the moment is not reached or a mismatch decides the reading | slice 1 | observed: Distribution/evaluation/guidance-checks.md verdict paragraph after step 7: inconclusive |
| 3c | Verdict strength: keep means a predicted benefit within the observed context under ADR 0010, not an observed improvement | slice 1 | observed: Distribution/evaluation/guidance-checks.md verdict paragraph after step 7: keep is a predicted benefit under ADR 0010 |
| 4 | The recipe is followed once on ODF-361 (hypothesis: the limit counts normally wrapped lines), giving one first decision and a separate yes or no on extracting a case | slice 3 | observed: docs/maintainer/findings/ODF-361.md#redo-of-the-plan-451-refactor-pass-2026-11-17: Verdict keep and separate Extract a case? No |
| 5 | The demonstration's verdict names each baseline mismatch and says which reading each limits | slice 3 | observed: docs/maintainer/findings/ODF-361.md#redo-of-the-plan-451-refactor-pass-2026-11-17: Mismatches and what they limit |
| 6 | Moment not reached: inconclusive, the note names the starting state that would reach it, no second session starts | slice 3 | observed: docs/maintainer/findings/ODF-361.md#redo-of-the-plan-451-refactor-pass-2026-11-17: Moment reached, so the not-reached condition did not occur; no second session started (plan Learnings slice 2 run) |
| 7 | Session stops with a question: the question is quoted, the run recorded as stopped there, nobody answers it | slice 3 | observed: docs/maintainer/findings/ODF-361.md#redo-of-the-plan-451-refactor-pass-2026-11-17: Session returned REFACTOR COMPLETE with no question, so the question condition did not occur |
| 8 | After the run the recipe is corrected to what the run needed; if setup or evidence recovery outgrew the run, the return says so and the recipe is shortened or withdrawn, the decision still standing | slice 4 | observed: Distribution/evaluation/guidance-checks.md recipe steps 1, 3, 4 and 7 corrected after the run; docs/maintainer/findings/ODF-361.md note Recipe: kept, nothing outgrew the run |
| 9 | When kept, one sentence in triage-retrospective-findings Rank and propose names the recipe with a link as the evidence step for a finding whose response changes guidance wording and whose moment no case exercises | slice 5 | |
| 10 | Triage offers the recipe for no other finding: one answered by a deterministic check or covered by a case is proposed without it | slice 5 | |
| 11 | A withdrawn recipe gets no link | slice 5 | |
| 12 | The participant receives no prior outcome, finding text or comparison purpose | slice 2 | observed: PLAN.md Learnings slice 2 run: instruction file holds only the skill name and the local-only line |
| 13 | The scratch clone has no real remote, so the redo can publish nothing | slice 2 | observed: PLAN.md Learnings slice 2 run: remote -v lists only the bare remote.git; ls-remote origin unchanged |
| 14 | The paid native session runs only under the execution instruction's authorization, once, never from a test command or CI | slice 2 | observed: PLAN.md Learnings slice 2 run: one hand-started codex exec under this execution, exit 0, no relaunch; no test command or CI |
| 15 | The saved baseline and the source execution's records are not edited | slice 3 | observed: git diff 6039e7c9a: only the ODF-361 Follow-up line and the appended note change; occurrences and evidence blocks and Distribution/evaluation baselines untouched |
