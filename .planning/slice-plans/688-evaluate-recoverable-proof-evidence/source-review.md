# Source review

Launch: one fresh general-purpose reviewer on 2026-11-18, without conversation
inheritance, given only the selected story's heading, Goal, Scope, Scope
limits, Decision, Key examples and Baseline, told to read no project file and
change nothing. Its return numbered P1–P19; the returned source text is
retained per row.

Unnumbered source context as returned: the goal's beneficiaries and reason;
the 2026-11-18 baseline that v0.3.104 predates the revision; why hand-backs
are measured from the trace and why the trace is the source; no paid
comparison and no synthetic or replacement execution; one execution is the
sample; a revision is the follow-up story's work; the baseline figures; key
example figures are illustrations, not thresholds. The reviewer noted that
P12–P15 are mutually exclusive alternatives, and that the Decision gives no
precedence when triggers for different verdicts coincide.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P1 | The evaluation uses the first planned execution that qualifies. Scope: "The first planned execution, on any host and in any project on this machine, that started under an installed release containing `45ff02fee774a270826cd7507fee2ce1c9d077cc`, delegated at least one slice to a worker, and reached the coordinator's proof acceptance." Key examples 4 and 5. | slice 1 | observed: PLAN.md slice 1 Selected execution, release at Take 02e33c018, earlier candidates, and coordinator trace lines 9, 232, 434–443 |
| P2 | When nothing qualifies, the plan names what is missing. Scope: "When none qualifies, record what is missing in the plan". Key example 5: "the plan records what is missing". | slice 1 | observed: Git 25a24391b, plan 688 slice 1 Missing condition for the previous no-sample attempt. The current attempt has a qualifying sample. |
| P3 | When nothing qualifies, the story stays queued and other work continues. Scope: "leave the story queued, and continue with other work." Key example 5: "and the story stays queued." | slice 1 | observed: Git 25a24391b, PRODUCT-BACKLOG Backlog list after the previous no-sample attempt. The current attempt has a qualifying sample. |
| P4 | Total coordinator and worker effort comes from the retained effort command in task mode. Scope: "Take total coordinator and worker effort from the retained effort command" | slice 2 | observed: PLAN.md slice 2 Task effort, exact task-mode invocation, successful run, grouped partial token subtotals and report gaps |
| P5 | Each worker hand-back is measured in characters from the trace. Scope: "measure each worker hand-back the coordinator received in characters from the trace." Key examples 1 and 4. | slice 2 | observed: PLAN.md slice 2 Hand-back sizes, five SubagentHandback call and coordinator receipt pairs and replayable character count |
| P6 | What each acceptance decision read is established. Scope: "establish what each acceptance decision read (run record, log excerpt, full report or whole log)". Key examples 1 and 3. | slice 3 | |
| P7 | Each proof command rerun and its reason is established. Scope: "each proof command rerun and its reason". Key example 1. | slice 3 | |
| P8 | Each second round returned to a worker and its cause is established. Scope: "each second round returned to a worker with its cause." Key example 2. | slice 3 | |
| P9 | Later defects are included up to evaluation time. Scope: "Include what CI, the retrospective and later slices of the same execution found up to the time of evaluation" | slice 3 | |
| P10 | Checks that had not yet run are named as a limit. Scope: "name what had not yet run as a limit." | slice 3 | |
| P11 | One verdict is recorded in the plan with its evidence. Scope: "One of keep, revise, stop and rethink, or inconclusive, under the decision below, recorded in the plan with the trace references, the installed release, the figures and the limits." | slice 3 | |
| P12 | Keep under its conditions. Decision: "Keep when hand-backs are shorter than the baseline median, acceptance reaches its decisions from records, log excerpts and the report, and no proof is rerun merely to recover output." Key example 1. | slice 3 | |
| P13 | Revise under its conditions. Decision: "Revise when a second round is needed for a proof row the verdict dropped, or CI, the retrospective or a later slice finds a defect the full return would have shown." Key example 2. | slice 3 | |
| P14 | Stop and rethink under its conditions. Decision: "Stop and rethink when coordinators load whole reports or logs anyway." Key example 3. | slice 3 | |
| P15 | Inconclusive names the missing observation. Decision: "Inconclusive when the observations support none of these; say which observation was missing." | slice 3 | |
| P16 | A revise or stop verdict queues one follow-up story carrying the evidence. Scope: "A revise or stop verdict also queues one follow-up story carrying that evidence." Key examples 2 and 3. | slice 3 | |
| P17 | On a host without a baseline, sizes are reported without the median comparison and the missing baseline is a named limit. Key example 4. Baseline: "It covers Claude Code only". | slice 2 | observed: PLAN.md slices 1–2 establish the actual host as Claude Code with a host baseline. The other-host example is untriggered. |
| P18 | A comparison keeps the baseline's scope explicit. Baseline: "It covers Claude Code only and whole sessions, not single executions; keep that scope explicit when comparing." | slice 2 | observed: PLAN.md slice 2 describes the 315-hand-back whole-session Claude Code baseline and the limits of this sample |
| P19 | The evaluation changes no guidance or script. Scope limits: "The evaluation changes no guidance or script; a revision is the follow-up story's work." | slice 3 | |
