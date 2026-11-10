# Source-only review

**Launch:** Fresh general-purpose reviewer with no conversation inheritance;
instructions limited to the selected story Goal, Scope, key examples,
Evaluation, Architecture qualifications, and Deferred promises. No plan,
product, proof, or project files.

**Input:** SEED-258#make-intent-coverage-results-easier-to-act-on Goal through
Architecture and Deferred promises from
`.planning/seeds/SEED-258-dough-intent-coverage.md#make-intent-coverage-results-easier-to-act-on`.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reviewing an Intent Coverage result can choose whether to: | slice 1 | observed: src/skills/dough-intent-coverage/SKILL.md Return the result: four verdicts + separate next proof action (journey / assertion / gather evidence) |
| 1.1 | add proof for a missing journey, | slice 1 | observed: SKILL.md Confirmed missing test path → next action add journey proof |
| 1.2 | strengthen an existing assertion, or | slice 1 | observed: SKILL.md Assertion gap → next action strengthen observing assertion |
| 1.3 | gather more evidence. | slice 1 | observed: SKILL.md Insufficient evidence → next action gather named missing observation |
| 2 | Establish whether reusing a focused handoff earns its total cost before keeping that workflow change. | slice 2 | observed: trial/02-comparison-and-keep-decision.md keep decision + kept candidate handoff in src/skills |
| 3 | Add **Confirmed missing test path** when an independent scratch observation establishes that the fault causes the promised behavior to go wrong, while the relevant maintained checks pass and omit that path. | slice 1 | observed: SKILL.md Confirmed missing test path verdict criteria |
| 4 | For that finding: | slice 1 | observed: SKILL.md Confirmed missing finding requirements (checks, transition, evidence chain) |
| 4.1 | Name the checks examined. | slice 1 | observed: SKILL.md Name the checks examined |
| 4.2 | Name the omitted transition. | slice 1 | observed: SKILL.md Name the omitted transition |
| 4.3 | Preserve the passing baseline. | slice 1 | observed: SKILL.md Run and restore step 1 passing baseline |
| 4.4 | Preserve the faulted observation. | slice 1 | observed: SKILL.md Run and restore step 2 independent wrong-behavior observation |
| 4.5 | Preserve the exact restoration. | slice 1 | observed: SKILL.md Run and restore step 3 exact restoration |
| 4.6 | Preserve the restored pass. | slice 1 | observed: SKILL.md Run and restore step 3 restored checks pass |
| 5 | Bound the finding to the examined checks rather than claiming absence across the whole suite. | slice 1 | observed: SKILL.md Bound finding to examined checks; not whole suite |
| 6 | Keep **Assertion gap** for a maintained check that exercises the wrong behavior but whose assertion passes. | slice 1 | observed: SKILL.md Assertion gap verdict |
| 7 | Keep **Caught** for a maintained assertion that fails on that wrong behavior. | slice 1 | observed: SKILL.md Caught verdict |
| 8 | Identify the assertion that actually caught it, including an earlier helper assertion. | slice 1 | observed: SKILL.md Caught names actual assertion including earlier helper |
| 9 | Use **Insufficient evidence** when any of these remain unresolved: | slice 1 | observed: SKILL.md Insufficient evidence when unresolved |
| 9.1 | passing baseline, | slice 1 | observed: SKILL.md Insufficient evidence: missing passing baseline |
| 9.2 | reach, | slice 1 | observed: SKILL.md Insufficient evidence: missing reach |
| 9.3 | wrong behavior, or | slice 1 | observed: SKILL.md Insufficient evidence: missing wrong-behavior observation |
| 9.4 | restoration. | slice 1 | observed: SKILL.md Insufficient evidence: missing restoration |
| 10 | Merely finding no matching test does not confirm a missing path. | slice 1 | observed: SKILL.md Merely finding no matching test does not confirm missing path |
| 11 | The report gives the next proof action. | slice 1 | observed: SKILL.md State next proof action separately from verdict |
| 12 | The report distinguishes an already-planned repair from a new decision caused by the probe. | slice 1 | observed: SKILL.md Distinguish already-planned repair from new probe-caused decision |
| 13 | Reuse the following already established by review or execution (as suggestions): | slice 2 | observed: SKILL.md Choose the check: caller-supplied hints as suggestions |
| 13.1 | promise, | slice 2 | observed: Wrap Up + checker promise suggestion pass-through |
| 13.2 | plausible fault, | slice 2 | observed: Wrap Up + checker plausible fault suggestion |
| 13.3 | focused command, | slice 2 | observed: Wrap Up + checker focused command suggestion |
| 13.4 | fixture, | slice 2 | observed: Wrap Up + checker fixture suggestion |
| 13.5 | assertion. | slice 2 | observed: Wrap Up + checker assertion suggestion |
| 14 | The worker validates or revises those suggestions and explains a consequential change. | slice 2 | observed: SKILL.md validate/reuse/explain consequential revision; A2 revised assertion |
| 15 | Missing hints do not prevent a check. | slice 2 | observed: SKILL.md Missing hints do not prevent a check |
| 16 | Search for the narrowest relevant proof. | slice 2 | observed: SKILL.md search only for the narrowest relevant proof |
| 17 | State the remaining gap when proceeding would require a broad exploratory run. | slice 2 | observed: SKILL.md name remaining gap rather than broad sweep |
| 18 | Preserve: | slice 2 | observed: SKILL.md preserve one-promise / independent evidence / restoration (slice-1 text retained) |
| 18.1 | the one-promise check, | slice 2 | observed: one-promise check preserved in checker |
| 18.2 | independent behavior evidence, | slice 2 | observed: independent behavior evidence preserved |
| 18.3 | scratch restoration. | slice 2 | observed: scratch restoration preserved |
| 19 | Prospectively compare current and candidate workflows on the same revision and promise within each of two cases: | slice 2 | observed: trial paired A1/A2 and B1/B2 on same revision+promise |
| 19.1 | one search-heavy case, | slice 2 | observed: Recently done search-heavy pair |
| 19.2 | one already-focused case. | slice 2 | observed: Landed CI already-focused pair |
| 20 | Record: | slice 2 | observed: 01-decisions + arm reports + 02-comparison record before/after |
| 20.1 | the decision before the probe, | slice 2 | observed: 01-decisions-before-probes.md |
| 20.2 | the evidence returned, | slice 2 | observed: arms/*/report.md |
| 20.3 | the resulting decision, | slice 2 | observed: 02-comparison-and-keep-decision.md after column |
| 20.4 | what changed because of the probe, including no change. | slice 2 | observed: decision delta: no change on either case |
| 21 | Use the existing report and wrap-up disposition when available. | slice 2 | observed: existing free-text report + wrap-up disposition ownership unchanged |
| 22 | A retained report alone does not establish a changed repair decision. | slice 2 | observed: 02-comparison: retained report alone does not establish changed repair |
| 23 | Include: | slice 2 | observed: 02-comparison arm cost table |
| 23.1 | handoff preparation and probe/setup effort, | slice 2 | observed: handoff preparation + setup noted in 02-comparison |
| 23.2 | runner time, | slice 2 | observed: runner times in arm reports |
| 23.3 | complete invocation-to-report elapsed. | slice 2 | observed: invocation-to-report / host elapsed in 02-comparison |
| 24 | Distinguish extra wrap-up wait from elapsed and runner time. | slice 2 | observed: wrap-up wait distinguished; marked unavailable |
| 25 | Record unavailable observations with reasons rather than infer waiting from either elapsed or runner time. | slice 2 | observed: unavailable wrap-up wait / human effort with reasons |
| 26 | Keep human and agent costs separate. | slice 2 | observed: human vs agent costs separate in reports and 02-comparison |
| 27 | Measure or estimate those costs with their basis. | slice 2 | observed: measured or estimated with basis (stream tokens / tool counts) |
| 28 | Use comparable host token counters when already available. | slice 2 | observed: stream.jsonl token counters used when exposed |
| 29 | Absence of host token counters does not require new collection infrastructure. | slice 2 | observed: no new token collection tooling added |
| 30 | The evidence requirements prevent: | slice 1 | observed: SKILL.md Evidence protections in Run and restore / Return the result |
| 30.1 | a green but unexercised path from becoming an assertion verdict, | slice 1 | observed: SKILL.md Maintained check that never exercises wrong path ≠ assertion verdict |
| 30.2 | an unobserved fault from becoming a confirmed gap, | slice 1 | observed: SKILL.md No matching test without wrong-behavior observation ≠ confirmed gap |
| 30.3 | incomplete cleanup from becoming a successful probe. | slice 1 | observed: SKILL.md Incomplete cleanup is not a successful probe |
| 31 | Those requirements protect truthful action and scratch recovery. | slice 1 | observed: SKILL.md Scratch restore + leave repairs to caller; truthful action rules |
| 32 | Search boundedness limits the cost of this targeted check. | slice 2 | observed: SKILL.md bounds search; stop instead of broad sweep |
| 33 | Search boundedness does not forbid a separately authorized broader investigation. | slice 2 | observed: SKILL.md separately authorized broader investigation remains outside |
| 34 | Deferred promises (not in this story): |  | X1 |
| 34.1 | changing opt-in, |  | X1 |
| 34.2 | wrap-up’s join/disposition lifecycle, |  | X1 |
| 34.3 | Done storage or dashboard presentation, |  | X1 |
| 34.4 | repairing sampled product tests, |  | X1 |
| 34.5 | historical report backfill, |  | X1 |
| 34.6 | automatic token collection, |  | X1 |
| 34.7 | general benchmarking, |  | X1 |
| 34.8 | release and rollout. |  | X1 |
| 35 | The closure story keeps ownership of persistence and follow-up routing. |  | X2 |
| 36 | Shared files require reconciliation, not a blocking story dependency. | slice 2 | observed: Wrap Up request reconciled in src/skills only; no blocking dependency |
| 37 | Confirmed missing test path + planned correction recognition | slice 1 | observed: Behavior review Recently done example → Confirmed missing + planned correction |
| 37.1 | Classify as **Confirmed missing test path**. | slice 1 | observed: SKILL.md Confirmed missing test path classification |
| 37.2 | Name the omitted project-change transition and examined checks. | slice 1 | observed: SKILL.md Name omitted transition and examined checks |
| 37.3 | Next action: add journey proof. | slice 1 | observed: SKILL.md Next action add journey proof |
| 37.4 | Recognize the existing planned correction rather than claim a new repair decision. | slice 1 | observed: SKILL.md Recognize already-planned repair separately from new decision |
| 38 | Assertion gap | slice 1 | observed: Behavior review assertion-gap example against SKILL.md Assertion gap |
| 38.1 | Classify as **Assertion gap**. | slice 1 | observed: SKILL.md Assertion gap classification |
| 38.2 | Next action: strengthen the observing assertion. | slice 1 | observed: SKILL.md Strengthen observing assertion |
| 38.3 | Provide independent evidence of the wrong behavior. | slice 1 | observed: SKILL.md Independently observed wrong behavior required |
| 39 | Caught via earlier helper | slice 1 | observed: Behavior review helper-catch example against SKILL.md Caught |
| 39.1 | Classify as **Caught**. | slice 1 | observed: SKILL.md Caught classification |
| 39.2 | Name the actual catch. | slice 1 | observed: SKILL.md Name actual catch including earlier helper |
| 39.3 | Limit the claim to the observed path. | slice 1 | observed: SKILL.md Limit claim to observed path |
| 40 | Insufficient evidence | slice 1 | observed: Behavior review Side panel example against SKILL.md Insufficient evidence |
| 40.1 | Classify as **Insufficient evidence**. | slice 1 | observed: SKILL.md Insufficient evidence classification |
| 40.2 | Name the observation still needed. | slice 1 | observed: SKILL.md Name observation still needed |
| 40.3 | Also inconclusive when restoration is missing, or | slice 1 | observed: SKILL.md Missing restoration → Insufficient evidence |
| 40.4 | an unrelated failure occurs. | slice 1 | observed: SKILL.md Unrelated failure → Insufficient evidence |
| 41 | Focused handoff reuse on request | slice 2 | observed: A2/B2 candidate prompts + skill validate/reuse behavior |
| 41.1 | Validate and reuse them, or explain a better target. | slice 2 | observed: A2 revised assertion; B2 reused suggested fault/command |
| 41.2 | Avoid rediscovering equivalent setup. | slice 2 | observed: candidate arms avoided rediscovering equivalent setup relative to A1 discovery cost |
| 41.3 | Incomplete hints lead to bounded proof search, not an obligatory broad sweep. | slice 2 | observed: SKILL.md incomplete hints → bounded search not obligatory broad sweep |
| 42 | Keep-or-drop handoff by paired comparison | slice 2 | observed: 02-comparison keep decision from paired runs |
| 42.1 | Compare equally strong evidence and total effort including preparation. | slice 2 | observed: equal proof + total effort including preparation compared |
| 42.2 | Report the decision delta. | slice 2 | observed: decision delta reported (no change) |
| 42.3 | Report cost limits. | slice 2 | observed: cost table and limits recorded |
| 42.4 | Report any unobserved wait. | slice 2 | observed: unobserved wrap-up wait reported unavailable |
| 42.5 | An unsupported saving remains unknown. | slice 2 | observed: unsupported automatic-checking value remains unknown |
| 43 | Keep the clearer verdict if a reviewer can: | slice 1 | observed: SKILL.md Four-verdict rule + next actions enable clearer review choice |
| 43.1 | distinguish missing journey proof from inconclusive evidence, and | slice 1 | observed: SKILL.md Confirmed missing vs Insufficient evidence distinction |
| 43.2 | choose the appropriate action on the examples above. | slice 1 | observed: SKILL.md Next proof actions for each verdict |
| 44 | Keep the handoff change only if the paired comparison shows: | slice 2 | observed: keep criteria met in 02-comparison |
| 44.1 | lower total effort by avoiding an unnecessary broad run or equivalent setup, | slice 2 | observed: search-heavy lower effort A2 vs A1 |
| 44.2 | equally strong proof, and | slice 2 | observed: equally strong proof both pairs |
| 44.3 | no material extra preparation on the already-focused case. | slice 2 | observed: focused B2 not materially more expensive |
| 45 | Set the comparison basis before running. | slice 2 | observed: 00-freeze-and-basis.md set before probes |
| 46 | Disclose host/setup differences and unknowns. | slice 2 | observed: 02-comparison confounds/unknowns (order, cwd harness, rate limit) |
| 47 | If evidence falls short: | slice 2 | observed: keep path taken; negative/inconclusive branch unused |
| 47.1 | record the negative or inconclusive result, and | slice 2 | observed: N/A keep supported |
| 47.2 | simplify or retain the existing handoff under ADR 0010 — Definition of improvement. | slice 2 | observed: N/A keep supported; ADR 0010 keep recorded |
| 48 | The verdict can be retained independently of an unsuccessful handoff trial. | slice 2 | observed: slice-1 verdicts retained on HEAD; handoff keep independent |
| 49 | Neither result establishes the value of routine automatic checking. | slice 2 | observed: 02-comparison: neither result establishes routine automatic checking |
| 50 | The checker owns: | slice 1 | observed: SKILL.md Checker owns selection, restore, verdicts, report |
| 50.1 | verdicts, | slice 1 | observed: SKILL.md Return the result owns verdicts |
| 50.2 | proof search, | slice 2 | observed: checker owns proof search / hint validation text |
| 50.3 | restoration, | slice 1 | observed: SKILL.md Run and restore owns restoration |
| 50.4 | its report. | slice 1 | observed: SKILL.md Return finding + finish-report owns report |
| 51 | Wrap Up passes available context and owns the resulting disposition. | slice 2 | observed: Wrap Up passes available context; disposition ownership unchanged |
| 52 | Reuse these owners and the existing report finisher. | slice 2 | observed: reuse owners + finish-report.mjs unchanged API |
| 53 | No new worker service. | slice 2 | observed: no new worker service |
| 54 | No new report schema. | slice 1 | observed: SKILL.md Persist report as free text; no schema or verdict enum |
| 55 | Author runtime changes in `src/skills/` under maintainer guidance and ADR 0006. | slice 2 | observed: edits only under src/skills/ |
| 56 | The conventional skill review and the empirical workflow comparison serve different proof purposes under ADR 0005. | slice 2 | observed: behavior review vs empirical trial recorded separately (02-comparison + skill review) |
