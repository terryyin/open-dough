# Source-only review

Launch: fresh isolated agent `/root/source_review`, `fork_turns: none`, on 2026-11-15.
Input: only the complete Goal, Scope, Key examples, and Evaluation and stopping rule from
[SEED-356](../../seeds/SEED-356-reduce-blocked-execution-effort.md#reduce-total-model-work-during-blocked-execution),
as supplied verbatim in the reviewer launch. No plan, implementation, proof, or suspected omission supplied.
The reviewer confirmed it read no files and changed nothing. The following is its complete
numbered extraction, retaining its ids, text, qualifications, journey examples and exclusions.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Significantly reduce complete-task model work for authorized execution waiting on a supplier. | slice 2 |  |
| C02 | Reduce retained context. | slice 2 |  |
| C03 | Preserve partial work. | slice 2 |  |
| C04 | Preserve applicable accepted proof. | slice 2 |  |
| C05 | Preserve correct supplier judgment. | slice 2 |  |
| C06 | Preserve one qualifying continuation. | slice 2 |  |
| Q01 | Added automation alone does not establish improvement. | slice 2 |  |
| C07 | Implement the smaller, simplification-first increment selected by Terry’s second-attempt instruction. | slice 2 |  |
| C08 | Select one reduction from a fresh baseline. |  | G1 |
| C09 | The reduction may remove repeated reading, reconstruction, or bookkeeping on the existing blocked continuation path. | slice 2 |  |
| C10 | Include blocked-path cost after supplier qualification. | slice 2 |  |
| Q02 | Prefer deletion and existing commands. | slice 2 |  |
| Q03 | A small script is justified only when it replaces observed repetitive mechanical work. | slice 2 |  |
| C11 | Such a script removes the corresponding agent procedure. | slice 2 |  |
| X01 | Do not retain both the script path and the corresponding agent procedure. | slice 2 |  |
| C12 | Use the updated paused-supplier forced-wake case. | slice 1 | observed: PLAN.md: Slice 1 observation; retained paused-supplier attempt 20261114T233920-362e, turns 1–3 and stopped turn 4 |
| C13 | Use the unblocked-supplier ordinary-work case. | slice 2 |  |
| Q04 | Evaluate cheaper handling of existing wakes. | slice 2 |  |
| X02 | Automatic supplier-event delivery is outside this increment. | slice 2 |  |
| X03 | Skipped-wake proof is outside this increment. | slice 2 |  |
| Q05 | Terry’s instruction replaces the earlier event-driven-variant requirement. | slice 2 |  |
| X04 | Do not add a daemon. | slice 2 |  |
| X05 | Do not add an enrollment protocol. | slice 2 |  |
| X06 | Do not add a second execution record. | slice 2 |  |
| X07 | Do not add a general accounting system. | slice 2 |  |
| X08 | Do not undertake a broad execution-guidance rewrite. | slice 2 |  |
| X09 | Running-verification efficiency remains with its existing sibling story. | slice 2 |  |
| X10 | General phase loading remains with its existing sibling story. | slice 2 |  |
| C14 | Preserve the exact supplier agreement. | slice 2 |  |
| C15 | Preserve execution ownership. | slice 2 |  |
| C16 | Preserve authority rules. | slice 2 |  |
| C17 | Preserve publication rules. | slice 2 |  |
| C18 | Preserve CI rules. | slice 2 |  |
| Q06 | Publication alone does not satisfy an unmet supplier agreement. | slice 2 |  |
| Q07 | A passing diagnostic alone does not satisfy an unmet supplier agreement. | slice 2 |  |
| C19 | Reassess honestly when evidence is missing. | slice 2 |  |
| C20 | Reassess honestly when evidence changes. | slice 2 |  |
| X11 | Retained context cannot justify stale supplier satisfaction. | slice 2 |  |
| X12 | Retained context cannot justify a duplicate writer. | slice 2 |  |
| C21 | Keep general guidance shared across Codex, Cursor, and Claude Code. | slice 2 |  |
| Q08 | Limit measured savings to the observed Codex case. | slice 2 |  |
| X13 | Do not claim cross-host savings. | slice 2 |  |
| J01 | Partial work is blocked, supplier evidence is unchanged, and the same session wakes. | slice 2 |  |
| J02 | Keep the partial work. | slice 2 |  |
| J03 | Remain blocked. | slice 2 |  |
| J04 | Reuse still-valid context instead of rebuilding execution history. | slice 2 |  |
| J05 | The supplier publishes an early implementation while agreed stability proof remains absent. | slice 2 |  |
| J06 | Reassess the changed evidence. | slice 2 |  |
| J07 | Remain blocked. | slice 2 |  |
| J08 | Do not reroute partial work around its supplier. | slice 2 |  |
| J09 | Qualifying supplier evidence arrives. | slice 2 |  |
| J10 | Continue the authorized slice once. | slice 2 |  |
| J11 | Integrate once. | slice 2 |  |
| J12 | Preserve applicable proof. | slice 2 |  |
| J13 | Finish with passing independent proof. | slice 2 |  |
| J14 | Finish with passing execution-owned proof. | slice 2 |  |
| J15 | Count the qualifying continuation’s cost. | slice 2 |  |
| J16 | The supplier already qualifies at entry. | slice 2 |  |
| J17 | Finish the same partial work once. | slice 2 |  |
| J18 | Add no blocked-path setup tax beyond the evaluation allowance. | slice 2 |  |
| E01 | Require at least 20% fewer total processed tokens. | slice 2 |  |
| E02 | Require no increase in model requests. | slice 2 |  |
| E03 | Require no increase in developer interventions. | slice 2 |  |
| E04 | Permit at most 5% token overhead. | slice 2 |  |
| E05 | Require no increase in model requests. | slice 2 |  |
| E06 | Require no increase in developer interventions. | slice 2 |  |
| E07 | Both arms must satisfy the current case assessors. | slice 2 |  |
| E08 | Both arms must satisfy decisive proof. | slice 2 |  |
| Q09 | Make a bounded keep/stop decision from one stochastic observation per arm, following ADR 0010. | slice 2 |  |
| X14 | Do not make a statistical claim. | slice 2 |  |
| X15 | Do not make a billing claim. | slice 2 |  |
| E09 | Freeze current pre-change source as the baseline. | slice 1 | observed: PLAN.md: literal baseline launch frozen at 45f965a1bb59f049f9828097971d7621c13c64d6 |
| E10 | Keep the task matched. | slice 2 |  |
| E11 | Keep events matched. | slice 2 |  |
| E12 | Keep the assessor matched. | slice 2 |  |
| E13 | Keep host and version matched. | slice 2 |  |
| E14 | Keep model and settings matched. | slice 2 |  |
| E15 | Keep publication authority matched. | slice 2 |  |
| E16 | Capture fresh baseline evidence. |  | G1 |
| X16 | Do not compare against the abandoned implementation. | slice 1 | observed: PLAN.md: baseline revision is current accepted claim, not abandoned implementation |
| E17 | Count coordinator model work. | slice 2 |  |
| E18 | Count owned-worker model work. | slice 2 |  |
| E19 | Count from setup through final proof and recovery. | slice 2 |  |
| E20 | Report model requests separately. | slice 2 |  |
| E21 | Report cached input separately. | slice 2 |  |
| E22 | Report uncached input separately. | slice 2 |  |
| E23 | Report output separately. | slice 2 |  |
| E24 | Report developer interventions separately. | slice 2 |  |
| Q10 | Unknown usage remains unknown. | slice 2 |  |
| Q11 | Unknown usage cannot support a token-saving verdict. | slice 2 |  |
| E25 | Use an initial hold followed by unchanged, nonqualifying, and qualifying wakes. | slice 2 |  |
| X17 | Make no claim about production block frequency. | slice 2 |  |
| E26 | Allow at most four native journeys: one baseline and one candidate per case. | slice 2 |  |
| E27 | Worker effort counts against the budget. | slice 2 |  |
| E28 | Automatic baseline reacquisition counts against the budget. | slice 2 |  |
| E29 | Invalid attempts count against the budget. | slice 2 |  |
| E30 | Run the blocked comparison first. | slice 2 |  |
| S01 | Stop before implementation if the fresh blocked baseline exposes no plausible worthwhile removal. | slice 1 | observed: PLAN.md: invalid baseline, unknown complete usage, 1/4 journeys consumed; optimization stopped before implementation |
| S02 | Stop the candidate on failed quality. | slice 2 |  |
| S03 | Stop the candidate on insufficient usage evidence. | slice 2 |  |
| S04 | Stop the candidate on a missed bar. | slice 2 |  |
| S05 | Stop the candidate on exhausted budget. | slice 2 |  |
| S06 | Retain observations. | slice 2 |  |
| S07 | Revert only candidate-owned product changes. | slice 2 |  |
| X18 | Do not expand the design. | slice 2 |  |
| X19 | Do not rerun for a favorable result. | slice 2 |  |
| Q12 | Treat a negative result as learning, not achieved improvement. | slice 2 |  |
| Q13 | Treat an inconclusive result as learning, not achieved improvement. | slice 2 |  |
| S08 | Further work requires a new decision. | slice 2 |  |
| E31 | Keep evaluation effort visible. | slice 2 |  |
| E32 | Keep implementation effort visible. | slice 2 |  |
