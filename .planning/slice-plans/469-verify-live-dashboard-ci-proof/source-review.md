# Source review: SEED-234#verify-live-dashboard-ci-proof

Launch: a fresh general-purpose subagent (no conversation inheritance, no
fork), 2026-11-05, during slice 1 acceptance. Input: only the selected story's
Goal, Scope, Key examples and Architecture text from
`.planning/seeds/SEED-234-verify-live-dashboard-ci-proof.md`, with the
instruction to read no project files, change nothing, and return numbered
commitments, qualifications, examples and exclusions. No plan, return,
product or proof was supplied. The returned ids and texts are below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | A developer opening Intent → CI status for Open Dough in the live dashboard can trust the Proof shown | slice 1 | observed: PLAN.md Accepted proof: tab and artifact agree |
| G1.1 | The Proof shown is the summary the shown run published | slice 1 | observed: PLAN.md Accepted proof: Tab run 41951088108 attempt 1 b4ec1c8 = artifact |
| G1.2 | Same counts as that summary | slice 1 | observed: PLAN.md Accepted proof: per-row counts equal |
| G1.3 | Same parts as that summary | slice 1 | observed: PLAN.md Accepted proof: 12 of 12, 3 of 3, 3 of 3 = artifact parts present |
| G1.4 | A run without a usable summary says so, instead of reading as a CI failure | slice 1 | observed: PLAN.md Accepted proof: No-summary project doughnut Passed with reason line |
| G2 | Closes CI proof adoption with observed evidence rather than fixture-only proof | slice 1 | observed: PLAN.md Accepted proof: live observation, not fixtures |
| S1 | One observation of the live dashboard and one of the shown trunk run's summary artifact | slice 1 | observed: PLAN.md Accepted proof: Artifact and Tab bullets |
| S1.q1 | Live dashboard is the deployed production dashboard at http://127.0.0.1:4173, reading with the developer's own gh | slice 1 | observed: PLAN.md Accepted proof: Tab bullet, 127.0.0.1:4173 |
| S1.q2 | The artifact is the one published by the trunk run the tab shows | slice 1 | observed: PLAN.md Accepted proof: run 41951088108 in both |
| S1a.1 | Compare repository | slice 1 | observed: PLAN.md Accepted proof: terryyin/open-dough artifact; tab run link terryyin/open-dough |
| S1a.2 | Compare run | slice 1 | observed: PLAN.md Accepted proof: 41951088108 both |
| S1a.3 | Compare attempt | slice 1 | observed: PLAN.md Accepted proof: attempt 1 both |
| S1a.4 | Compare revision | slice 1 | observed: PLAN.md Accepted proof: b4ec1c8a469f… / b4ec1c8 |
| S1b.1 | Compare the dashboard/tests row | slice 1 | observed: PLAN.md Accepted proof: 2042/0/8, 12 of 12 |
| S1b.2 | Compare the tests row | slice 1 | observed: PLAN.md Accepted proof: 196/0/0, 3 of 3 |
| S1b.3 | Compare the src/skills row | slice 1 | observed: PLAN.md Accepted proof: 291/0/0, 3 of 3 |
| S1c.1 | Compare passed count | slice 1 | observed: PLAN.md Accepted proof: 2042, 196, 291 both |
| S1c.2 | Compare failed count | slice 1 | observed: PLAN.md Accepted proof: 0 in artifact; tab names no failures |
| S1c.3 | Compare other count | slice 1 | observed: PLAN.md Accepted proof: 8, 0, 0 both |
| S1c.4 | Compare present parts | slice 1 | observed: PLAN.md Accepted proof: 12, 3, 3 present both |
| S1d.1 | Record the run link | slice 1 | observed: PLAN.md Accepted proof: run 41951088108 link |
| S1d.2 | Record both observations | slice 1 | observed: PLAN.md Accepted proof: Artifact and Tab bullets |
| S1d.3 | Record the verdict | slice 1 | observed: PLAN.md Accepted proof: Verdict bullet |
| S2 | Observe, live, a project whose shown run published no summary | slice 1 | observed: PLAN.md Accepted proof: No-summary project bullet, doughnut |
| S2.1 | Confirm the tab keeps the run's verdict | slice 1 | observed: PLAN.md Accepted proof: doughnut Passed at 61c0a9a |
| S2.2 | Confirm the tab gives the one reason line under Proof | slice 1 | observed: PLAN.md Accepted proof: This run published no CI proof summary. |
| S2.q1 | Failed-verdict-without-summary stays proven by dashboard/tests/intent-ci-proof-reasons.spec.ts | slice 1 | observed: dashboard/tests/intent-ci-proof-reasons.spec.ts unchanged |
| S2.x1 | No failing run is provoked to observe it live | slice 1 | observed: no run provoked; slice 1 commit is records-only |
| S3 | When the comparison disagrees, repair the path from published summary to rendered tab | slice 1 | observed: PLAN.md Accepted proof: Verdict agree, repair not triggered |
| S3.1 | After repair, observe again | slice 1 | observed: PLAN.md Accepted proof: Verdict agree, no repair to reobserve |
| X1 | No recurring or automated live reconciliation | slice 1 | observed: slice 1 commit is records-only; scratch script deleted |
| X2 | No change to the workflow's entries, parts or retention | slice 1 | observed: slice 1 commit is records-only |
| X2.1 | Story-branch CI status is not compared | slice 1 | observed: PLAN.md Accepted proof: trunk run only |
| X2.2 | Other projects' adoption is not compared | slice 1 | observed: PLAN.md Accepted proof: doughnut observed only for the no-summary line |
| X3 | No new wording | slice 1 | observed: slice 1 commit is records-only |
| B1 | The dashboard stays a reader of the workflow's published evidence (ADR 0008) | slice 1 | observed: no dashboard change |
| B2 | The run shown at execution time may be newer than the refinement-time run | slice 1 | observed: PLAN.md Accepted proof: newest completed run still 41951088108 |
| B2.1 | Any retained run whose summary has not expired serves | slice 1 | observed: PLAN.md Accepted proof: artifact expires 2026-12-05 |
| E1 | Trunk's latest completed run published ci-proof-summary-attempt-1; developer opens Intent → CI status | slice 1 | observed: PLAN.md Accepted proof: Artifact bullet |
| E1.1 | Proof names the same run, attempt and short revision | slice 1 | observed: PLAN.md Accepted proof: Attempt 1 of run 41951088108 at b4ec1c8. |
| E1.2 | Each row's counts and n of n parts present equal the artifact's | slice 1 | observed: PLAN.md Accepted proof: Tab rows |
| E1.r | Refinement-time observation 2026-11-05 09:02: run 41951088108, 2042/0/8 12 of 12; 196 3 of 3; 291 3 of 3 | slice 1 | observed: PLAN.md Accepted proof: same values at 09:11 |
| E2 | A project's shown run published no summary | slice 1 | observed: PLAN.md Accepted proof: doughnut run 41948058190 |
| E2.1 | The tab keeps that run's verdict | slice 1 | observed: PLAN.md Accepted proof: Passed at 61c0a9a |
| E2.2 | The tab shows This run published no CI proof summary. under Proof | slice 1 | observed: PLAN.md Accepted proof: reason line |
| E2.3 | The tab shows no counts | slice 1 | observed: PLAN.md Accepted proof: no counts |
| E2.r | Refinement-time observation for doughnut, terry-talks, lizard, clipboard | slice 1 | observed: PLAN.md Accepted proof: doughnut again at 09:11 |
| E3 | Disagreement or an unavailable reason with a readable artifact triggers repair | slice 1 | observed: PLAN.md Accepted proof: Verdict agree, not triggered |
| E3.t1 | The shown run's summary disagrees with the tab | slice 1 | observed: PLAN.md Accepted proof: no disagreement |
| E3.t2 | The tab shows an unavailable reason while the artifact is readable | slice 1 | observed: PLAN.md Accepted proof: tab shows rows, no reason |
| E3.1 | Repair the reader or the workflow's publication | slice 1 | observed: PLAN.md Accepted proof: not triggered |
| E3.2 | Observe example 1 again | slice 1 | observed: PLAN.md Accepted proof: not triggered |
| A1 | No new architecture | slice 1 | observed: slice 1 commit is records-only |
| A2 | ADR 0008: distinguish missing evidence from an explicit negative result | slice 1 | observed: PLAN.md Accepted proof: doughnut Passed with missing-summary line |
| A2.1 | Example 2 is that rule's live observation | slice 1 | observed: PLAN.md Accepted proof: No-summary project bullet |
