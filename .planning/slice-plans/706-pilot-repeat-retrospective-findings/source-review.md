# Source review for SEED-401#pilot-repeat-retrospective-findings

Codex launched the independent `/root/source_review` agent without inherited
conversation. Its input was the [selected seed section and shared comparison](../../seeds/SEED-401-retrospective-finding-pilots.md#pilot-repeat-retrospective-findings):
the goal, scope, key examples, replay cases and comparison terms, without the
plan or later historical assessment. The launch instructed it to use only
supplied text, read no other files, change nothing and number independently
observable outcomes. The returned ids and text are retained below, with slice
ownership assigned by the coordinator.

The reviewer retained the goal of seeing changes to priority, explanation or
response assessment without rereading harmless repeats. It treated matching,
numbering, one entry per execution, the distributed rule, collector and other
clients as the settled baseline. The sibling owns first reports. The replay
is exploratory and output length alone is insufficient. For DD-136, three
unrelated failures followed, and about 11.5 minutes covered the whole
implementer task. Doughnut's local DD-202 is distinct from the DD-202 mapped
to ODF-208. ODF-264 had 75 rows.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Install the trial wording. “One removable trial paragraph in Doughnut's and Pygardon's AGENTS.md replaces a single choice in the recording rule: what a new execution writes on a finding it matches.” | slice 3 | observed: PLAN.md, slice 3 published revision table and exact AGENTS-only trial diffs on both configured trunks |
| 2 | Record a material new effect in a full row. In ODF-200, “One publishes an unreviewed increment to trunk” and “that execution has a full row with the consequence.” The replay has “36 distinct executions,” most involving “lookup or refusal.” The published increment is the consequence that “must survive.” | slice 2 | observed: evaluation section, A1 current, trial and revised full rows retain the premature trunk publication, with earlier local rows and later frequency scoped |
| 3 | Record a cost that changes priority in a full row. “Earlier repeats each cost one extra call.” In ODF-325, “A new execution spends about 36,500 subagent tokens on the same mechanism” and “a full row records the cost, because it changes the case for intervention.” The replay covers “two one-call Clipboard deviations and two Open Dough launches with about 36,500 and 38,700 reported subagent tokens.” | slice 2 | observed: evaluation section, A3 through A6 retain both measured launches after the Group A rerun and show the two earlier one-call cases and snapshot chronology |
| 4 | Record “a newly affected workflow” in a full row. | slice 3 | observed: PLAN.md, controlled scratch-workflow full rows in both published-revision walks |
| 5 | Record “a corrected attribution” in a full row. | slice 3 | observed: PLAN.md, controlled scratch-attribution full rows preserve the corrected evidence in both walks |
| 6 | Record an adopted response succeeding or failing in a full row “when the entry names one.” In Pygardon DD-136, an execution that ran with the guidance “selects a directory and runs 168 scenarios where 23 were intended.” The “full row names the response, the execution's release and the effect, so the finding can be reopened.” The replay includes Doughnut’s local DD-202, which “likewise recurred after adoption when two executions wrote and removed assertions,” and ODF-264’s “verified Pygardon 0.3.76 recurrence after the 0.3.69 response.” | slice 2 | observed: evaluation section, A2, B1, B2, B3 and C2 full rows retain the response, effect and verified provenance where available |
| 7 | Record a full row when the reviewer is unsure. “A reviewer who cannot tell writes the full row.” | slice 3 | observed: PLAN.md, controlled scratch-uncertain full rows preserve the unresolved cost in both walks |
| 8 | Record a compact line for a repeat that teaches none of the listed things. The line contains “its execution identity, time, tool and Open Dough release.” When the Pygardon entry reads “One 0.3.60 execution” and a new execution has “the same mechanism with the same effect,” the entry “gains one line” with those fields and “No narrative is added.” In the ODF-264 replay, many rows “establish another retrieval without a measured cost or new loss of proof.” | slice 3 | observed: PLAN.md, one four-field scratch-repeat compact line under the 0.3.60 summary in both walks; historical C1 and C4 add no repeat narrative |
| 9 | Preserve frequency. In the Pygardon example, “two distinct executions can be counted.” In ODF-200, “The earlier lines still show how often the mechanism occurred” after the consequential execution gets a full row. | slice 3 | observed: PLAN.md, controlled walks retain the original occurrence and add one distinct compact repeat; replay A1 retains the full consequence and collector counts the distinct candidates |
| 10 | Preserve a byte-identical reread. “The same execution is reviewed again: the log is byte-identical.” | slice 2 | observed: evaluation section, both thirteen-log rereviews and six rerun rereviews preserve scratch log bytes |
| 11 | Give a different cause its own identity. When “A familiar symptom has a different cause,” “The new cause gets its own identity under the existing matching rule.” | slice 3 | observed: PLAN.md, separate DD-268 for stale branch-list mechanism in both controlled walks |
| 12 | Move evidence without adding an occurrence. When “evidence is moved from one finding to another, as with Lizard DD-012 and DD-010,” “The move adds no occurrence.” In the replay, “Lizard's OCaml example was restored from DD-012 to DD-010.” | slice 2 | observed: evaluation section, C3 and independent collection show the existing Lizard execution and zero added by the move |
| 13 | Keep recording a row for a Clipboard repeat during the pilot. “A Clipboard retrospective meets a repeat during the pilot. It records a row under the distributed rule.” | slice 3 | observed: PLAN.md, Clipboard control at 1a3ebb443 produces one full ODF-267 row for the unchanged repeat under its installed rule |
| 14 | Preserve ODF-200’s verified change in delivery behavior. The replay requires that “the verified change in delivery behavior must survive” alongside the published-increment consequence. | slice 2 | observed: evaluation section, A2 in all arms records refusal of missing mode and successful explicit retry under 0.3.57 |
| 15 | Write the comparison in advance. “Write the comparison and the keep and revise criteria before any run, using the shared comparison.” For each pilot, state it “before observing fresh runs.” | slice 1 | observed: docs/maintainer/empirical-process-control-research.md#repeat-finding-recording-pilot-2026-11-18, Decision basis and pinned replay inputs before any replay |
| 16 | Write the keep and revise criteria in advance. The criteria share the same “before any run” condition and use the shared comparison. | slice 1 | observed: docs/maintainer/empirical-process-control-research.md#repeat-finding-recording-pilot-2026-11-18, Keep and Revise criteria recorded before any replay |
| 17 | Complete the historical replay. “Replay the three case groups below once with each wording, each by a fresh reader shown only what was knowable at that execution.” Use “the same historical inputs for current and candidate wording, varying only the selected recording decision.” “Reveal later corrections, retirements and rejected remedies only when judging the decisions.” | slice 2 | observed: evaluation section, earlier case projections proved at 98f22f24, matched rule and inputs, separated answer note, disclosed whole-packet read order |
| 18 | Judge the fresh ordinary-work sample. Judge “the next five ordinary executions in each project after the trial rule lands,” “chosen from story, Git or CI history before opening the findings files,” and include “executions that reported nothing.” |  | G1 |
| 19 | Record provenance for each fresh observation. “Record the project, guidance revision and actual route used for each fresh observation.” |  | G1 |
| 20 | Check for missed first incidents. The shared comparison expressly says to “Check for missed first incidents.” |  | G1 |
| 21 | Check for accumulating costs. The shared comparison expressly includes “accumulating costs.” |  | G1 |
| 22 | Check for evidence about an earlier response. The shared comparison calls for “evidence for or against an earlier response.” |  | G1 |
| 23 | Count decisions changed. |  | G1 |
| 24 | Count consequential misses. |  | G1 |
| 25 | Count duplicate narratives reaching triage. |  | G1 |
| 26 | Compare writer effort. Use “available time, tool or token evidence.” “Keep active time, elapsed time and token counts distinct.” |  | G1 |
| 27 | Compare downstream reviewer effort. Include “checking skipped cases” and apply the same evidence and measurement conditions. |  | G1 |
| 28 | Record sample counts. | slice 4 | observed: Evaluation ordinary-work decision table, Doughnut 0/5 and Pygardon 3/5 |
| 29 | Record exposure. | slice 4 | observed: Evaluation ordinary-work decision, zero verified uses and dated client review settings |
| 30 | Record missing evidence. | slice 4 | observed: Evaluation ordinary-work decision, unknown recording effects and effort with no verified use |
| 31 | Record the result “with the existing evaluations.” “Use existing execution records and each pilot's assessment to avoid maintaining a ledger of rejected observations.” | slice 4 | observed: docs/maintainer/empirical-process-control-research.md#ordinary-work-decision-on-22-november-2026 |
| 32 | Give Terry a keep or revise decision. Judge “that recording choice” “against current practice under ADR 0010.” |  | G1 |
| 33 | Apply the keep conditions. “Keep if fewer repeat narratives reach triage and total effort falls while material changes, frequency and post-response counterexamples stay discoverable.” |  | G1 |
| 34 | Apply the revise conditions. “Revise if a compact line hides an escalation, the wrong mechanism is merged or split, or the maintainer has to reconstruct what a row would have said.” |  | G1 |
| 35 | Leave effectiveness open when there is no repeat. “A sample with no repeat leaves effectiveness open.” |  | G1 |
| 36 | Leave the failed-fix judgment open without a verified release. “An unverified execution release leaves the failed-fix judgment open.” |  | G1 |
| 37 | On keep, queue promotion. “On keep, queue promotion into the distributed rule.” |  | G2 |
| 38 | On keep, remove the trial paragraphs at installation of the promotion release. “That story removes the trial paragraphs when its release is installed.” |  | G2 |
| 39 | Otherwise, remove the trial paragraphs in this story. “Otherwise this story removes them.” | slice 5 | |
| 40 | Close the pilot as inconclusive on the exposure available under the current settings. | slice 4 | observed: Evaluation records Terry's inconclusive decision and its ordinary exposure limit |
| 41 | Remove the two installed trial paragraphs, one from each client. | slice 5 | |
| 42 | Retain the replay results. | slice 4 | observed: Evaluation preserves the existing historical replay byte-for-byte |
| 43 | Leave process retrospectives disabled. | slice 5 | |

The independent `close_source_review` reader received only the preceding scope,
the recommendation and Terry's approval. It returned commitments 40–43.
