# Independent source review

Fresh reviewer `/root/policy_source_contract`, fork_turns none, received only
the complete selected story Goal, Scope, Examples, Evaluation and Excluded text
pasted in its launch. It was instructed to read no files, change nothing and
derive individual source clauses without plan, product, proof or slice context.
Its actual return is retained below; bold emphasis is normalized to plain text.
The reviewer preserves surviving or replacement proof as alternatives, J05/J06
as alternative triggers, and examples without inventing a scenario count.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Reduce repeated full-app builds in production-watcher policy tests. | slice 1 | observed: productionUpdatePolicies folds F into E and relocates H rules; actual independent prefix assertions observe policy activations 5 to 3 and total successful watcher builds 8 to 6, plus unchanged held shutdown gate |
| C02 | Preserve coverage while reducing those builds. | slice 1 | observed: coverage-map.md original ledger; inspected watcher/qualifier implementation and all retained signals; replacement4 passes before narrowing; all ten old case identities pass in each eleven-case family run |
| C03 | Measure the effect on CI time. | slice 1 | G1 |
| C04 | Consolidate overlapping range coverage at the existing real-Git qualification boundary. | slice 1 | observed: real Git whole-range case plus new extra/docs/mixed/accumulated case, qualification-replacement.json 4 strict passes |
| C05 | Consolidate overlapping exclusion coverage at that boundary. | slice 1 | observed: new Git case checks exact extra exclusion and docs inclusion under original F policy, including dirty-local conflict; watcher D/G/T retain actual no-work observations |
| C06 | Consolidate overlapping published-policy rule coverage at that boundary. | slice 1 | observed: qualifyPublishedRange owns the published policy; existing selected-policy assertions remain and new exact F variant passes from real remote trees |
| C07 | Preserve the actual watcher observation that skipped changes perform no install. | slice 1 | observed: watcher D/G/T exact deploymentWork equality includes preparing count; inspected watch-dashboard starts stageDeployment/npm ci only after that preparation signal |
| C08 | Preserve the actual watcher observation that skipped changes perform no build. | slice 1 | observed: D/G/T exact work equality includes actual recorded build-gate count, with settled checks and live preview |
| C09 | Preserve the actual watcher observation that skipped changes perform no restart. | slice 1 | observed: D/G/T work equality includes activations/preview PIDs; actual PID remains alive and browser title retained |
| C10 | Preserve the observation that selected published policy wins over local edits. | slice 1 | observed: G extra path is excluded by published E and included by dirty original local workflow; real watcher skips with exact E baseline, no work, live PID/title |
| C11 | Preserve the observation that accumulated changes select the latest commit. | slice 1 | observed: E actual replacement serves MAIN E, omits intermediate application SHA, matches independent exact build prefixes and increments preparation once |
| C12 | Preserve the observation that unsupported policy retains the served baseline. | slice 1 | observed: P repeated exact error keeps E, no work/PID/title changes; Q workflow/docs ignored so real MAIN P activation requires retained P app paths |
| C13 | Preserve the observation that failed builds retain the served baseline. | slice 1 | observed: distinct R and S real build failures retain Q URL/PID and MAIN P; removing cause activates S with MAIN R |
| C14 | Preserve the observation that only successful activation advances the served baseline. | slice 1 | observed: Q/S successful replacements and T exact S-to-T skip/no-work/live PID/MAIN R; qualifier result controls one unchanged watcher branch and baseline advances only after activation |
| C15 | Keep real npm/Vite deployment proof. | slice 1 | observed: retained E/Q/S execute actual npm/Vite and preview; consumers.json 27 strict passes includes deployment/basic/update/failures/refusals/qualification |
| C16 | Keep pinned-serving proof. | slice 1 | observed: unchanged production-deployment selected checkout/dist/title assertions after main advances; existing B/C and S docs-only selected tree retain real browser pinning |
| C17 | Keep replacement proof. | slice 1 | observed: productionReplacement observes selected SHA/same URL/new PID/old PID stopped/new PID live at E/Q/S; all changed family passes |
| C18 | Keep recovery proof. | slice 1 | observed: P/Q and R/S remain separate; unchanged failed-preview restoration, unavailable-origin and fatal-restoration cases passed in 27-case consumers |
| C19 | Keep shared-records proof. | slice 1 | observed: original B/C shared-record API/bytes assertions and shutdown shared-file bytes/inode assertions unchanged and executed in each family run |
| C20 | Keep configuration proof. | slice 1 | observed: original update/config bytes and shutdown bytes/inode assertions unchanged and executed after new E/Q/S policy sequence |
| C21 | Keep process-cleanup proof. | slice 1 | observed: shutdown held-build/preview PID and HTTP refusal assertions retained; quiescence.json all five run identities have no processes; strict teardown passes |
| C22 | Keep check-out-cleanup proof. | slice 1 | observed: shutdown deployment/inspection roots empty; real qualification inspection empty after each call; owned fixture cleanup and five-run quiescence pass |
| Q01 | Every removed assertion needs an inspected equivalent observation before its predecessor narrows. | slice 1 | observed: coverage-map.md ledger maps every original assertion; new real-Git case passed before F/H narrowed; actual wrapper/qualifier/caller and observing signals inspected |
| Q02 | That equivalent may be a surviving observation or a replacement observation; these remain alternatives. | slice 1 | observed: ledger uses both inspected surviving real watcher observations and added real-Git observations, preserving the allowed alternatives |
| Q03 | Map original observations to surviving proof. | slice 1 | observed: coverage-map.md original setup-trigger/result-to-current assertion ledger, including repeated F/H built-title and prefix protection |
| Q04 | Compare the same normal local family before and after. | slice 1 | observed: local-family-comparison.json: exact same normal two-filter family, old ten names retained plus one new case, all strict pass |
| Q05 | Use identical filters for that local comparison. | slice 1 | observed: implementation-commands.txt and proof run.argv retain identical two filename filters before/after |
| Q06 | Use default workers for that local comparison. | slice 1 | observed: normal commands omit worker overrides; unchanged default capacity and runner configuration, Node24.21 on same16CPU host |
| Q07 | Use identical relevant environment for that local comparison. | slice 1 | observed: same locked dependencies, Node24.21 and env -u NO_COLOR; no clock/reporter/retry/worker config change; host-load variation disclosed |
| Q08 | Include replacement tests’ cost in that local comparison. | slice 1 | observed: normal candidate family includes the new Git case, extracted fixture, global setup/build and teardown; wall67.53/67.75/67.30 versus74.68 baseline |
| Q09 | Compare fresh full hosted CI. | slice 1 | G1 |
| Q10 | Identify the baseline revision by name. | slice 1 | observed: fresh baseline40825747965 at80678d4a (runtimeb8ad020a), all16jobs pass,1740selected/same4skips/zeroextraattempts; baseline-measured.json retains full identities |
| Q11 | Identify the candidate revision by name. | slice 1 | G1 |
| Q12 | Account for unchanged case verdicts. | slice 1 | G1 |
| Q13 | Account for intentional test moves. | slice 1 | G1 |
| Q14 | Account for unchanged platform skips. | slice 1 | G1 |
| Q15 | Account for unchanged platform retries. | slice 1 | G1 |
| Q16 | Account for real-build counts. | slice 1 | G1 |
| Q17 | Account for fixture costs. | slice 1 | G1 |
| Q18 | Account for queue time. | slice 1 | G1 |
| Q19 | Account for job time. | slice 1 | G1 |
| Q20 | Account for suite time. | slice 1 | G1 |
| Q21 | Account for runner variance. | slice 1 | G1 |
| Q22 | Retain only supported improvements. | slice 1 | G1 |
| Q23 | Report inconclusive measurements honestly. | slice 1 | G1 |
| J01 | Excluded-only ranges are decided from real published Git trees. | slice 1 | observed: real published-tree excluded-only equality in existing Git range case and live D/G/T watcher skips |
| J02 | Mixed ranges are a stated variant decided from real published Git trees. | slice 1 | observed: existing real Git mixed-range case plus new F-policy mixed exact changed/qualifying paths |
| J03 | Accumulated ranges are a stated variant decided from real published Git trees. J02 and J03 retain the source’s “mixed/accumulated” variants. | slice 1 | observed: existing real Git app-plus-docs accumulated range and new docs-plus-extra exact result; actual watcher E selects latest once |
| J04 | A candidate’s changed policy is used despite a different uncommitted local workflow. | slice 1 | observed: real G consumes conflicting dirty local policy; new Git F variant consumes same conflict for excluded extra and qualifying docs |
| J05 | Unsupported policy is one alternative trigger for the application-change retention journey. | slice 1 | observed: P unsupported published policy keeps real E preview and then Q recovers MAIN P; ignored workflow/docs repair makes application retention necessary |
| J06 | A failed build is the other alternative trigger for that journey. | slice 1 | observed: R real build fails, docs S also fails keeping Q preview; removing cause makes S serve unserved R application |
| J07 | Under either J05 or J06, a later documentation-only commit cannot hide the application change. | slice 1 | observed: P/Q and R/S independently retained; Q must include P application paths and S must include R paths; neither is claimed by a generic qualifier alone |
| J08 | After successful activation, a later excluded-only commit is skipped without deployment work. | slice 1 | observed: after S actual activation, docs T skips explicitly from S, with unchanged work/PID and added MAIN R browser assertion |
| X01 | Production behavior changes. | slice 1 | observed: aggregate implementation diff changes only three test/support files and coverage record; production files restored before planning and unchanged |
| X02 | Fake internal outcomes. | slice 1 | observed: unchanged qualifier/Git/npm/Vite/preview boundaries compute actual outcomes; only remote Git inputs and machine-local failure causes supplied |
| X03 | Shared mutable fixtures. | slice 1 | observed: same disposable per-journey origin/HOME and per-qualification private fixtures; extraction adds no cache or shared writable state |
| X04 | Weakened assertions. | slice 1 | observed: original ledger preserves every unique signal with inspected equivalent proof; new baseline and retained-page assertions strengthen recovery |
| X05 | Skips. | slice 1 | observed: no skip/config change; all local11 and broader27 execute as expected; hosted skip accounting stays G1 |
| X06 | Retries. | slice 1 | observed: no retry/config change; local proof records have zero retries; expected scratch failures are diagnostics, not passing retries |
| X07 | Second-server changes. | slice 1 | observed: second-server files untouched and not used to obtain savings |
| X08 | Clock changes. | slice 1 | observed: clock helpers/configuration/call sites unchanged |
| X09 | Additional workers. | slice 1 | observed: worker configuration unchanged; no command worker override |
| X10 | Additional shards. | slice 1 | observed: CI/shard configuration unchanged at twelve shards |
| X11 | Unrelated fixture optimization. | slice 1 | observed: only qualification setup extraction and selected policy assertions changed; origin/preview/global fixture optimization untouched |
| X12 | Releases. | slice 1 | observed: implementation changes no VERSION, CHANGELOG, tag or installed payload; unrelated main0.3.76 metadata is excluded from attributable patches |
| X13 | Guidance changes. | slice 1 | observed: no skill/rule/AGENTS or published guidance changes |
| X14 | Shard-weight refresh, expressly outside the selected priority. | slice 1 | observed: longest-first duration lists and allocation source unchanged |
