# Source-only review

Fresh reviewer `/root/source_only` ran with no inherited conversation. Its
launch input in this execution contains only the selected SEED-258 story's
Goal, Scope, and Key examples, with the original comparison basis confirmed
on 2026-11-07. It received no plan, proposed proof, current-slice scope, or
implementation. The numbered commitments below are its returned review.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G01 | Compare a short AI intent assessment with the ordinary review already performed on the same completed stories. | slice 3 | |
| G02 | Compare verified decisions about protecting story intent. | slice 3 | |
| G03 | Compare consequential misses. | slice 3 | |
| G04 | Compare unsupported claims. | slice 3 | |
| G05 | Compare total effort. | slice 3 | |
| G06 | An equivalent useful outcome at lower total effort can qualify under ADR 0010. | slice 3 | |
| G07 | Terry decides whether to proceed with, narrow, or stop a public intent-coverage skill. | slice 3 | |
| G08 | The comparison remains useful on its own if Terry declines public delivery. | slice 3 | |
| G09 | Any resulting test decisions also stand on their own if Terry declines public delivery. | slice 3 | |
| B01 | Use the cases Terry confirmed in Plan 498 on 2026-11-07. | slice 1 | observed: comparison.md, Ordinary review introduction and three selected case sections |
| B02 | Use the ordinary-review source he confirmed there. | slice 1 | observed: comparison.md, Ordinary review case links pinned to the confirmed revisions |
| B03 | Use the effort budgets he confirmed there. | slice 2 | observed: assessment-254.md, assessment-256.md and assessment-257.md, Effort start and cutoff, all three within 600 seconds |
| B04 | Use the decision criteria he confirmed there. | slice 3 | |
| B05 | A subsequent change to that basis requires Terry’s decision. | slice 3 | |
| B06 | Disclose a subsequent change with the result. | slice 3 | |
| C01 | Use three recent completed stories. | slice 1 | observed: comparison.md, SEED-254, SEED-256 and SEED-257 sections |
| C02 | Each case’s recorded execution retrospective must be recoverable from Git. | slice 1 | observed: comparison.md, all three pinned retrospective and source-review links |
| C03 | Each case’s host session must be on this machine. | slice 1 | observed: comparison.md, Timestamp and token evidence, three identified local sessions |
| C04 | Include `SEED-254#use-later-ci-proof-for-cancelled-landings`. Its retrospective found the running-after-proofless defect. | slice 1 | observed: comparison.md, SEED-254 story-attributable finding and Plan 497 |
| C05 | Include `SEED-256`. Its retrospective advised no change. | slice 1 | observed: comparison.md, SEED-256 product advice |
| C06 | Include `SEED-257`. Its retrospective advised no change. | slice 1 | observed: comparison.md, SEED-257 product advice |
| O01 | Use the execution retrospective that already ran for each case. | slice 1 | observed: comparison.md, each case cites its original recorded retrospective |
| O02 | Include its product advice. | slice 1 | observed: comparison.md, each case's product advice |
| O03 | Include any correction it planned. | slice 1 | observed: comparison.md, SEED-254 correction Plan 497 and two no-change dispositions |
| O04 | Include its source review. | slice 1 | observed: comparison.md, each case's linked independent source review |
| O05 | Derive ordinary-review agent time from recorded host session timestamps when available. | slice 1 | observed: comparison.md, Ordinary-review effort and exact local timestamp boundaries |
| O06 | Record ordinary-review agent time as unknown when the timestamps cannot establish it. | slice 1 | observed: comparison.md, Ordinary-review effort, active agent time and unrecorded subagent spans explicitly unavailable |
| O07 | Terry rereads each retrospective result. | slice 3 | |
| O08 | Time Terry’s reading of each retrospective result. | slice 3 | |
| O09 | Time Terry’s verification of each retrospective result. | slice 3 | |
| O10 | Credit the pre-existing unavailable-slot retry issue to ordinary review. | slice 1 | observed: comparison.md, SEED-254 pre-existing finding credited to ordinary review |
| O11 | Exclude that issue from story-attributable comparison counts. | slice 1 | observed: comparison.md, SEED-254 pre-existing finding explicitly outside story-attributable counts |
| A01 | Use a fresh agent for each case. | slice 2 | observed: each case report, Case provenance and Effort, three distinct fresh assessor records |
| A02 | Give the assessment a fresh context. | slice 2 | observed: each case report, Case provenance, fork_turns none |
| A03 | Have the plan write the assessment brief. | slice 2 | observed: assessment-brief.md, Method supplied to every assessor |
| A04 | Limit the brief to historical inputs. | slice 2 | observed: assessment-brief.md, Method supplied to every assessor, and each report's neutral historical case inputs |
| A05 | Assess the last attributable implementation revision, before the execution-complete record. | slice 2 | observed: each case report, Case provenance and detached checkpoint HEAD under Store and restoration checks |
| A06 | Before starting, verify that the checkpoint is readable with inherited Git object alternates cleared. | slice 2 | observed: each case report, Store and restoration checks, alternates cleared and checkpoint object exit 0 before dispatch |
| A07 | Before starting, verify that the case’s execution-complete commit is unavailable from that same store. | slice 2 | observed: each case report, Store and restoration checks, exact later execution record failed cat-file with exit 128 before dispatch |
| A08 | Allow ten minutes per story. | slice 2 | observed: each case report, Effort, 600-second absolute cutoff |
| A09 | Charge setup against that budget. | slice 2 | observed: each case report, Effort, clock begins before attribution and Git setup |
| A10 | Charge test runs against that budget. | slice 2 | observed: each case report, Effort and guarded focused commands between case start and return |
| A11 | Charge report writing against that budget. | slice 2 | observed: each case report, Effort, scratch report timestamp and returned-report receipt before cutoff |
| A12 | Trace story promises to production paths. | slice 2 | observed: each case report, production route or path and promise verdicts |
| A13 | Trace story promises to maintained tests. | slice 2 | observed: each case report, promise verdicts and selected maintained proof setup and assertions |
| A14 | Run the relevant existing tests. | slice 2 | observed: each case report, Focused runs or Commands and results with terminal results and selection |
| A15 | Allow at most one selective break check per story. | slice 2 | observed: each case report, one selective break check with its reached assertion |
| A16 | Return brief verdicts. | slice 2 | observed: each case report, Verdicts or Promise verdicts |
| A17 | Source the verdicts. | slice 2 | observed: each case report, pinned historical proof, source, fixture and assertion locations |
| A18 | Allow `protected` as a verdict. | slice 2 | observed: assessment-brief.md, available verdicts, and each case report's protected verdicts |
| A19 | Allow `protected and break-checked` as a verdict. | slice 2 | observed: assessment-brief.md, available verdicts, and each case report's single reached break check |
| A20 | Allow `gap` as a verdict. | slice 2 | observed: assessment-brief.md, available verdicts, and all three promise verdict tables |
| A21 | Allow `unknown` as a verdict. | slice 2 | observed: assessment-brief.md, unknown for unavailable proof, and assessment-257.md, live examples unknown |
| A22 | Identify promises left unassessed when the time limit is reached. | slice 2 | observed: each case report, limits and unassessed boundaries in verdicts or effort disposition |
| A23 | Run assessment agents inside the executing session. | slice 2 | observed: assessment-brief.md, in-session rule, and distinct assessor task start and completion records |
| A24 | Treat those runs as distinct from paid native host runs. | slice 2 | observed: assessment-brief.md, coordinator boundary identifies in-session subagent runs |
| A25 | Make break-check edits in local scratch. | slice 2 | observed: each case report, scratch path and selective break check edit |
| A26 | Revert those edits. | slice 2 | observed: each case report, restoration exit results and exact HEAD after the check, independently rechecked |
| A27 | Run break-check tests under the project’s failure policy. | slice 2 | observed: assessment-brief.md, historical failure-policy requirement, and each case report's policy correspondence and guarded proof |
| V01 | Terry has ten minutes per case to read both reviews and verify findings. | slice 3 | |
| V02 | Time reading separately. | slice 3 | |
| V03 | Time verification separately. | slice 3 | |
| V04 | Use one entry per distinct finding. | slice 3 | |
| V05 | Credit a verified match when both reviews identify the same failure path with evidence. | slice 3 | |
| V06 | Keep unknown verdicts distinct. | slice 3 | |
| V07 | Keep unsupported claims distinct. | slice 3 | |
| V08 | Keep findings still unverified at the time limit distinct. | slice 3 | |
| V09 | Count a consequential miss when one review fails to identify a specific consequential finding verified in the other. | slice 3 | |
| V10 | Terry records decisions on verified findings. | slice 3 | |
| V11 | Terry applies the confirmed criteria. | slice 3 | |
| T01 | Show measured end-to-end wall-clock time in each assessment report. | slice 2 | observed: each case report, Effort, measured end-to-end seconds |
| T02 | Show that time in the comparison for each case and review. | slice 3 | |
| T03 | Measure from start to returned result. | slice 2 | observed: each case report, Effort, case-start timestamp and report-ready receipt |
| T04 | Include setup in the elapsed time. | slice 2 | observed: each case report, Effort, attribution and Git setup as a subset of elapsed time |
| T05 | Include test runs in the elapsed time. | slice 2 | observed: each case report, Effort, focused command observations included in elapsed span |
| T06 | Show test runtime separately when observed. | slice 2 | observed: each case report, Effort, printed test durations or explicitly unavailable runner figures |
| T07 | Show human effort where evidence exists. | slice 3 | |
| T08 | Show agent effort separately where evidence exists. | slice 2 | observed: each case report, Effort, assessor span and token counters, with active effort unavailable |
| T09 | Give each effort figure its unit. | slice 2 | observed: each case report, Effort, seconds and host tokens |
| T10 | Give each effort figure its basis. | slice 2 | observed: each case report, Effort, timestamps, log rows, and runner output as measurement bases |
| T11 | Label available figures measured or estimated. | slice 2 | observed: each case report, Effort, evidence labels |
| T12 | Show figures that cannot be observed as unavailable, with their place retained and no zero substituted. | slice 2 | observed: each case report, Effort, unavailable active effort, human effort, and unavailable runner durations where applicable |
| T13 | Report elapsed time separately from effort. | slice 2 | observed: each case report, Effort, end-to-end time distinct from assessor elapsed, test runner durations and tokens |
| T14 | Give reviewer reading time its own comparison figure. | slice 3 | |
| T15 | Give reviewer verification time its own comparison figure. | slice 3 | |
| T16 | Keep both reviewer figures separate from assessment runtime. | slice 3 | |
| T17 | Use counts in place of rates. | slice 3 | |
| T18 | Label the ordinary-review side exploratory because it is historical. | slice 1 | observed: comparison.md, Ordinary review (exploratory) |
| T19 | Claim lower total effort only with comparable cost evidence. | slice 3 | |
| T20 | Apply the Architectural North Star guidance on carrying cost with intent-assessment results. | slice 3 | |
| R01 | Keep the comparison record with the plan. | slice 1 | observed: comparison.md beside Plan 498 |
| R02 | Record Terry’s decision in the story. | slice 3 | |
| R03 | Record his reasons there. | slice 3 | |
| R04 | Link the comparison record from the story. | slice 3 | |
| R05 | Carry the decision forward at wrap-up. | landing | |
| R06 | Carry a pinned comparison link forward at wrap-up. | landing | |
| R07 | The wrap-up destination can be surviving context or the next story’s dependency resolution. | landing | |
| X01 | Implementing test changes arising from the decisions is separate queued work. | slice 3 | |
| X02 | Further `SEED-258` test follow-ups are separate queued work. | slice 3 | |
| X03 | A new skill is out of scope. | slice 3 | |
| X04 | A new script is out of scope. | slice 3 | |
| X05 | A new dashboard view is out of scope. | slice 3 | |
| X06 | Seeded-fault calibration of either review is out of scope. | slice 2 | observed: assessment-brief.md and all case reports, one exploratory protection probe per case within the observed method |
| X07 | Rerunning the ordinary retrospective is out of scope. | slice 1 | observed: comparison.md, recovered historical records and local timestamps without rerunning the historical reviews |
| X08 | Cursor-hosted cases without local session timing are out of scope. | slice 1 | observed: comparison.md, SEED-254 Claude Code and SEED-256 and SEED-257 Codex records |
| X09 | Statistical estimates of total gaps are out of scope. | slice 3 | |
| E01 | For the known `SEED-254` finding, the specific path is a forward walk that passes a proofless build and then meets a running build, after which Landed says no later trunk build has finished. | slice 1 | observed: comparison.md, SEED-254 expired-proof-then-running path, original product advice and Plan 497 |
| E02 | Credit the blinded assessment for that finding when it identifies the sequence and supports it. | slice 3 | |
| E03 | An `unknown` on that path remains unresolved. | slice 3 | |
| E04 | If the assessment leaves the verified path unresolved, count a consequential assessment miss. | slice 3 | |
| E05 | If it rates that verified path protected, count a consequential assessment miss. | slice 3 | |
| E06 | If it omits that verified path, count a consequential assessment miss. | slice 3 | |
| E07 | If the assessment independently spots the cached unavailable comparison that Check again could not recover, record that observation with the existing retry story. O11 governs the counts. | slice 3 | |
| E08 | In the assessment-only example, a no-change case has a fixture giving two compared runs identical displayed values. The selective substitution reaches the formatter and the test still passes. | slice 3 | |
| E09 | That evidenced substitution verifies the gap. | slice 3 | |
| E10 | In the example, count the verified gap as an ordinary-review miss. | slice 3 | |
| E11 | Terry decides whether to strengthen the test. | slice 3 | |
| E12 | When the injected fault fails to reach the intended path, record the probe as failing to reach it. A fixture bypassing the changed function is one example. | slice 2 | observed: assessment-brief.md, report unreached probes, and three case reports with specific reached assertions so the unreached branch was inapplicable |
| E13 | After an unreached probe, retain only the verdict supported by source and passing tests. | slice 2 | observed: assessment-brief.md, source-and-passing-proof verdict rule for unreached probes, and all three reached probes |
| E14 | If the assessment calls a promise unprotected and Terry finds a maintained test exercising it, count the finding as unsupported. | slice 3 | |
| E15 | Include the time spent reading that claim in cost. | slice 3 | |
| E16 | Include the time spent verifying that claim in cost. | slice 3 | |
| E17 | If the historical checkpoint cannot run the relevant tests, use `unknown` instead of inferring a verdict from source. Native setup failure is one example. | slice 2 | observed: assessment-brief.md, unknown verdict rule, and assessment-257.md, unrun live Pygardon proof kept unknown |
| E18 | If the store still resolves the execution-complete commit with alternates cleared, delay the assessment until a store without that object is in place. | slice 2 | observed: assessment-brief.md, failed blinding stops dispatch, and each case report's prior absent-object check |
| E19 | With the counts and effort table, Terry can proceed on verified added value at justified cost. | slice 3 | |
| E20 | Alternatively, he can proceed on equivalent useful decisions at demonstrably lower total effort. | slice 3 | |
| E21 | If the assessment adds a useful break check and misses a consequential gap, Terry can narrow the method to that technique. | slice 3 | |
| E22 | The next story’s dependency records the scope Terry authorizes. | landing | |
| E23 | After a stop, that dependency remains waiting. | landing | |
