# Version-2 source-only review

Fresh /root/trial_v2_source_review, fork_turns=none. Input was only selected seed
Goal/Scope/Examples/Evaluation/constraints and the developer's explicit revision
and execution instruction; no plan/product/proof/history supplied or read.
Native launch 2026-10-29T07:18:05.145Z, return 2026-10-29T07:19:01.746Z. Inspectable native log:
rollout-2026-10-29T11-05-41-01a1859e-d3e3-7c23-8604-f8c32d3210d7.jsonl, lines2306 and2320, chat01a1859e-d3e3-7c23-8604-f8c32d3210d7.
Original v1 return remains in v1-source-review.md. IDs/text below retained verbatim
apart from Markdown emphasis. Existing source examples reuse unchanged calibration.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Commitment: Revise the trial for a realistic audit allowance and complete timing collection, then execute version 2. | slice 3 |  |
| 2 | Commitment: Give the maintainer a bounded prospective comparison of current and compact consumer-tracing handoffs. | slice 3 |  |
| 3 | Commitment: Measure missed consumers. | slice 3 |  |
| 4 | Commitment: Measure useful discoveries. | slice 3 |  |
| 5 | Commitment: Measure review effort before deciding whether to change the mechanism. | slice 3 |  |
| 6 | Commitment: Conduct four paired shadow reviews of ordinary Open Dough shared-contract changes. | slice 3 | G4 |
| 7 | Commitment: Give paired reviewers the same frozen evidence. | slice 2 | observed: PRE-REVIEW-RECEIPT.json and archive hashes: same67 common inputs |
| 8 | Commitment: Use independent reviewers. | slice 2 | observed: Native launches X/Y fork_turns=none and masked independent SCORES.md |
| 9 | Commitment: Retain the full trace. | slice 2 | observed: common.tar.gz retains both full populations and97 union paths |
| 10 | Commitment: Retain every required per-consumer disposition. | slice 2 | observed: common archive union-index.json retains every disposition and membership |
| 11 | Commitment: Compare presentation and navigation. | slice 2 | observed: A/B hashes and identical facts with B navigator only; unchanged candidate |
| 12 | Commitment: Use the existing ODF-150 assessment to calibrate scoring. | slice 1 | observed: CALIBRATION-SCORING.md; retained unchanged known-example calibration |
| 13 | Commitment: First run one fully timed fixed-case replay to verify version 2’s observation method. | slice 2 | observed: v2/replay/RESULT.md and timing.json establish fully timed replay and independent scoring |
| 14 | Commitment: Recruit the first four eligible changes within 14 days of an explicitly authorized start. | slice 3 | G4 |
| 15 | Commitment: Perform seven-day later-effect checks. | slice 3 | G4 |
| 16 | Commitment: Reach a final decision within 21 days. | slice 3 |  |
| 17 | Commitment: Cap incremental observation work at 120 agent task-minutes. | slice 3 |  |
| 18 | Commitment: Cap incremental observation work at 30 human minutes. | slice 3 |  |
| 19 | Commitment: Apply a threshold of no candidate misses. | slice 3 |  |
| 20 | Commitment: Apply a threshold of no lost useful baseline discoveries. | slice 3 |  |
| 21 | Commitment: Require at least 20% lower median paired review time. | slice 3 |  |
| 22 | Commitment: Also require at least one minute lower median paired review time. | slice 3 |  |
| 23 | Commitment: Require at least 10% lower total tracing/handoff/review effort. | slice 3 |  |
| 24 | Commitment: Allow twelve minutes per independent audit. | slice 2 | observed: timing.json audit371.719s+scoring238.269s=609.988s under720s |
| 25 | Commitment: Allow eight minutes per review. | slice 2 | observed: timing.json R_A379.230s and R_B352.974s under480s |
| 26 | Commitment: Allow four minutes per presentation task. | slice 2 | observed: timing.json P_A97.009s/P_B_task86.597s, attributed B183.606s under240s |
| 27 | Commitment: Measure each of C, P_A, P_B and R as a complete task from native dispatch to return. | slice 2 | observed: timing.json native complete C/P_A/P_B/R boundaries; prerequisite B cost explicit |
| 28 | Commitment: Include reading, drafting, tools and queue time in those task measurements. | slice 2 | observed: Native boundaries include reading/drafting/tools/queue, not first-tool/write spans |
| 29 | Commitment: Freeze I0 before tracing begins. | slice 2 | observed: Archive I0 freeze07:27:36.230658 precedes fresh-trace-command and old proof access |
| 30 | Commitment: Obtain the required prospective observations from each case’s ordinary work. | slice 3 | G4 |
| 31 | Commitment: Include version 2’s replay and controller work in its 120-minute budget. | slice 3 |  |
| 32 | Commitment: Retain version 1’s costs separately. | slice 2 | observed: TRIAL-LEDGER.md and v1-source-review.md preserve v1 costs/unknowns separately |
| 33 | Commitment: Never silently erase an unsuccessful case. | slice 3 |  |
| 34 | Commitment: Never silently retry an unsuccessful case. | slice 3 |  |
| 35 | Qualification: The plan supplies denominators, uncertainty treatment, stop rules and exact comparisons; this source does not specify their contents. | slice 2 | observed: PLAN.md frozen definitions/gates and v2/replay/SCORES.md purpose sets |
| 36 | Qualification: The numerical thresholds govern this trial; they are neither project-wide policy nor established benchmarks. | slice 2 | observed: RESULT.md applies trial thresholds only; no runtime guidance changed |
| 37 | Qualification: Reconstructed historical durations remain unknown. | slice 2 | observed: RESULT.md and common archive retain original costs as unknown |
| 38 | Qualification: The replay does not count among the four prospective cases. | slice 2 | observed: RESULT.json prospective_enrolled=0; fixed replay remains separate |
| 39 | Qualification: Version 1 does not count among the four prospective cases. | slice 2 | observed: case-01/ and TRIAL-LEDGER.md remain separate from v2 and cohort |
| 40 | Qualification: The ODF-150 assessment supplies calibration, not trial outcomes. | slice 2 | observed: Existing CALIBRATION-SCORING.md unchanged; ODF assessment is not a prospective case |
| 41 | Qualification: The developer amendment authorizes the version-2 protocol and replay. | slice 2 | observed: Selected seed developer amendment and protocol096af9 precede all v2 measurements |
| 42 | Qualification: It also authorizes prospective collection within the stated bounds. | slice 3 | G4 |
| 43 | Trigger/journey example: When a source owner is found but its observing test is omitted, the reviewer must identify that specific gap; otherwise that outcome is a missed consumer. | slice 1 | observed: CALIBRATION-SCORING.md 411/430 caught and omitted observer walks |
| 44 | Trigger/journey example: When tracing justifies additional proof, count the new useful purpose once, even when several matching files or assertions express it. | slice 1 | observed: CALIBRATION-SCORING.md deduplicated purpose P example |
| 45 | Trigger/journey example: When a quicker compact summary hides an earlier relevant lead, reject that summary despite its time saving. | slice 1 | observed: CALIBRATION-SCORING.md lost-purpose P rejects faster B |
| 46 | Trigger/journey example: Missing timing leaves the result inconclusive. | slice 3 |  |
| 47 | Trigger/journey example: An unaudited case leaves the result inconclusive. | slice 3 |  |
| 48 | Trigger/journey example: Insufficient recruitment leaves the result inconclusive. | slice 3 |  |
| 49 | Trigger/journey qualification: Those inconclusive conditions are not recorded as zero cost. | slice 3 |  |
| 50 | Trigger/journey qualification: Those inconclusive conditions are not recorded as a successful trial. | slice 3 |  |
| 51 | Exclusion: Do not compare different product implementations. | slice 3 |  |
| 52 | Exclusion: Do not change authority between the compared handoffs. | slice 3 |  |
| 53 | Exclusion: Do not change proof standards between the compared handoffs. | slice 3 |  |
| 54 | Preserved responsibility: Ordinary execution remains responsible for delivery, tests, CI and safety. | slice 3 |  |
| 55 | Exclusion: Neither experimental review authorizes publication. | slice 3 |  |
| 56 | Exclusion: Neither experimental review suppresses a needed correction. | slice 3 |  |
| 57 | Exclusion: Do not change tracing code. | slice 3 |  |
| 58 | Exclusion: Do not change installed skills. | slice 3 |  |
| 59 | Exclusion: Do not change published guidance. | slice 3 |  |
| 60 | Exclusion: Do not change other projects. | slice 3 |  |
| 61 | Exclusion: Do not change standing automation. | slice 3 |  |
| 62 | Exclusion: This authorization does not permit permanent adoption. | slice 3 |  |
