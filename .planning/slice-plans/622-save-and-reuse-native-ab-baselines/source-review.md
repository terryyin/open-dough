# Independent source review

Fresh reviewer launch: `collaboration.spawn_agent`, task `/root/source_review`,
`fork_turns: none`, on 2026-11-14. The actual launch and returned numbered
commitments are retained in that task's conversation. The input supplied only
the selected story's original Goal, Scope, Deferred promises and Key examples,
with linked references rendered as their ordinary names. No plan, product,
proof, implementation return or suspected gap was supplied. The reviewer was
instructed to read no files, change nothing, split compound commitments and
preserve qualifications and alternatives without inventing rejection rules.

Returned qualification: The examples illustrate supported journeys; they do
not add rejection rules beyond the stated matching, evidence-sufficiency, and
material-condition requirements.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Keep a compact baseline result alongside its case in the repository. | slice 1 | observed: Distribution/tests/native-comparison-baselines.sh baseline_archive writes into copied case comparisons/; subsequent pair export succeeds without changing case identity |
| 2 | Retain enough evidence to explain the result after raw session artifacts are removed. | slice 1 | observed: Distribution/tests/native-comparison-baselines.sh final raw-removal block reassesses baseline and owned archives with stable original hash |
| 3 | Record the baseline’s resolved payload revision. | slice 1 | observed: Distribution/tests/support/native-comparison-archive.mjs exportBaseline payload; native-comparison-baselines.sh pinned payload.revision and actual installed quiet commands |
| 4 | Record its case inputs. | slice 1 | observed: Distribution/tests/support/native-comparison-archive.mjs exportBaseline inputs from retained input-hash manifest; case-local archive followed by fresh pair |
| 5 | Record its project inputs. | slice 1 | observed: Distribution/tests/support/native-comparison-archive.mjs exportBaseline projectBasis from native-comparison-retain.sh project-basis record |
| 6 | Record its applied model. | slice 1 | observed: Distribution/tests/support/native-comparison-archive.mjs conditions.settings from actual codex-turn-settings, retained by comparison native session reader |
| 7 | Record its applied reasoning effort. | slice 1 | observed: Distribution/tests/support/native-comparison-archive.mjs conditions.settings includes applied model_reasoning_effort from saved settings |
| 8 | Record its host/runtime conditions. | slice 1 | observed: Distribution/tests/support/native-comparison-retain.sh observed-at/machine; archive conditions host/route/version/settings/load |
| 9 | Record its observed outcome. | slice 1 | observed: Distribution/tests/native-comparison-baselines.sh passing capture and shortcut completed failed archive both reassessed correctly |
| 10 | Retain its decisive proof. | slice 1 | observed: Distribution/tests/native-comparison-baselines.sh missing executed proof refusal, supported owned proof retention and replay after raw deletion |
| 11 | Record available effort measurements; availability does not imply complete accounting. | slice 1 | observed: Distribution/tests/native-comparison-baselines.sh own response dedup total60 and five responses; missing measurements unknown/null |
| 12 | Retain the observations themselves. | slice 1 | observed: Distribution/tests/support/native-comparison-archive-evidence.mjs safeObservations retained; baseline journey final raw-removal reassessment |
| 13 | Retain the decisive inputs used to assess those observations. | slice 1 | observed: Distribution/tests/native-comparison-doughnut-title-precedence.sh retained normalized run facts correct original green fault summary after raw deletion |
| 14 | Retain owned-worker proof attribution when the assessment uses it. | slice 1 | observed: Distribution/tests/native-comparison-baselines.sh literal owned-worker receipt/turn/root ownership retained, unowned copied usage excluded |
| 15 | Do not treat proof filenames alone as sufficient reusable evidence. | slice 1 | observed: Distribution/tests/native-comparison-baselines.sh removes executed proof item and export refuses despite claimed original pass |
| 16 | Do not treat a previous verdict alone as sufficient reusable evidence. | slice 1 | observed: Distribution/tests/native-comparison-baselines.sh unsupported old assessment cannot replace executed proof; Doughnut current replay uses test runs |
| 17 | Keep account-bearing raw sessions local under the existing retention guidance. | slice 1 | observed: Distribution/tests/native-comparison-baselines.sh deliberate account metadata/raw output markers and local paths do not escape export |
| 18 | During an authorized comparison, reuse sufficient retained baseline evidence when its baseline revision matches. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh matching frozen payload/current task/runtime captures then actual session count +1 and preserved verdict; applicability checks material manifest and current assessor support |
| 19 | Require the relevant case inputs to match before claiming reuse under matching conditions. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh matching frozen payload/current task/runtime captures then actual session count +1 and preserved verdict; applicability checks material manifest and current assessor support |
| 20 | Require the relevant runtime conditions to match before claiming reuse under matching conditions. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh matching frozen payload/current task/runtime captures then actual session count +1 and preserved verdict; applicability checks material manifest and current assessor support |
| 21 | Require the retained result to support the current outcome criteria. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh matching frozen payload/current task/runtime captures then actual session count +1 and preserved verdict; applicability checks material manifest and current assessor support |
| 22 | Require the retained result to support the current effort criteria. |  | G2 |
| 23 | Identify the reused source record in the new verdict. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh saved source/date/conditions/outcome/effort and historical non-concurrent limit in verdict; separate current assessment retains sourceIntegrity |
| 24 | Identify that record’s conditions in the new verdict. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh saved source/date/conditions/outcome/effort and historical non-concurrent limit in verdict; separate current assessment retains sourceIntegrity |
| 25 | Judge outcome before interpreting effort. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh cheaper shortcut candidate yields regressed and effort-standing not a gain; same outcome-first judge remains owner |
| 26 | Judge proof before interpreting effort. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh cheaper shortcut candidate yields regressed and effort-standing not a gain; same outcome-first judge remains owner |
| 27 | Distinguish a historical observation from a fresh matched pair when interpreting runtime or other variable measurements. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh saved source/date/conditions/outcome/effort and historical non-concurrent limit in verdict; separate current assessment retains sourceIntegrity |
| 28 | Verify the candidate’s applied conditions before claiming a match. | slice 2 | observed: Distribution/tests/native-comparison-baseline-conditions.sh actual unexpected applied model yields not-comparable/no effort difference after one candidate launch; incomplete test retains unavailable settings |
| 29 | Preserve unknown usage as unknown. | slice 1 | observed: Distribution/tests/native-comparison-baselines.sh unavailable usage remains unknown with null totals; known own responses deduplicated |
| 30 | Obtain fresh evidence when a current criterion requires evidence absent from the saved observation. | slice 2 | observed: Distribution/tests/native-comparison-baseline-conditions.sh missing current assessor input launches two fresh sessions; complete own usage satisfies explicit --require-usage; baseline-misses.sh absent required usage launches fresh then remains not-comparable/no delta |
| 31 | When correcting an assessment, preserve the original record. | slice 1 | observed: Distribution/tests/native-comparison-doughnut-title-precedence.sh correction block preserves capture.originalAssessment fail, original green observation and archive hash |
| 32 | Retain the derived assessment separately. | slice 1 | observed: Distribution/tests/native-comparison-doughnut-title-precedence.sh separate derived-assessment.json after raw removal returns current pass |
| 33 | Retain the derived assessment’s provenance. | slice 1 | observed: Distribution/tests/native-comparison-doughnut-title-precedence.sh derived sourceIntegrity names exact original archive; assessBaseline hashes current assessor/evidence |
| 34 | Retain the decisive evidence supporting the correction separately. | slice 1 | observed: Distribution/tests/native-comparison-doughnut-title-precedence.sh retained normalized test-run facts support corrected assessment after raw removal |
| 35 | Run a fresh baseline when the requested baseline changes. | slice 2 | observed: Distribution/tests/native-comparison-baseline-misses.sh changed payload/model/effort/task and missing/truncated saved input launch two real sessions via fresh acquisition |
| 36 | Run a fresh baseline when a material condition changes; the examples explicitly include model and reasoning effort. | slice 2 | observed: Distribution/tests/native-comparison-baseline-misses.sh changed payload/model/effort/task and missing/truncated saved input launch two real sessions via fresh acquisition |
| 37 | Run a fresh baseline when saved evidence is missing. | slice 2 | observed: Distribution/tests/native-comparison-baseline-misses.sh changed payload/model/effort/task and missing/truncated saved input launch two real sessions via fresh acquisition |
| 38 | Run a fresh baseline when saved evidence is incomplete. | slice 2 | observed: Distribution/tests/native-comparison-baseline-misses.sh changed payload/model/effort/task and missing/truncated saved input launch two real sessions via fresh acquisition |
| 39 | Run a fresh baseline when saved evidence is insufficient for the current comparison. | slice 2 | observed: Distribution/tests/native-comparison-baseline-conditions.sh missing current assessor input launches two fresh sessions; complete own usage satisfies explicit --require-usage; baseline-misses.sh absent required usage launches fresh then remains not-comparable/no delta |
| 40 | Save a new observation when it provides a usable result. | slice 2 | observed: Distribution/tests/native-comparison-baseline-misses.sh fresh changed-payload baseline saved then used by next candidate-only comparison; original archive hash unchanged |
| 41 | Preserve earlier observations for their original conditions. | slice 2 | observed: Distribution/tests/native-comparison-baseline-misses.sh fresh changed-payload baseline saved then used by next candidate-only comparison; original archive hash unchanged |
| 42 | Allow an explicitly requested fresh pair when the comparison needs both arms observed together. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh explicit --fresh-pair creates two sessions and new baseline without editing old archive |
| 43 | Retain usable observations from the existing paused-supplier forced-turn example for correctness assessment, subject to the reuse rules. | slice 4 | |
| 44 | Retain those usable forced-turn observations for per-wake cost assessment, subject to the reuse rules. | slice 4 | |
| 45 | Do not interpret those forced-turn observations as establishing suppressed wakes. | slice 4 | |
| 46 | Do not interpret those forced-turn observations as establishing event-driven savings. | slice 4 | |
| 47 | Reuse sufficient forced-turn evidence without rerunning solely to populate the new archive format. | slice 4 | |
| 48 | Add a small, representative unblocked example. | slice 3 | observed: Distribution/tests/native-comparison/unblocked-supplier/case.md and case.bash: same extracted smallest Node/Git execution project, one-turn schedule; native qualification explicitly pending |
| 49 | Exercise the same execution workflow through final proof in that example. | slice 3 | observed: Distribution/tests/native-comparison-unblocked-supplier.sh real materialization/installed workflow context and completed final proof through case boundary; external model substituted, native judgment remains G3 |
| 50 | Have the supplier already complete before its first session. | slice 3 | observed: Distribution/tests/native-comparison-unblocked-supplier.sh before-model remote done record and completed narration assertions; local reader absent |
| 51 | Preserve the consumer’s same partial work. | slice 3 | observed: Distribution/tests/native-comparison-unblocked-supplier.sh original partial files match before session and turn-1-partial-work remains preserved afterward; reroute/lost counterexamples fail |
| 52 | Preserve the consumer’s remaining integration responsibility. | slice 3 | observed: Distribution/tests/native-comparison-unblocked-supplier.sh pre-session absent reader/zero continuations followed by one completed supplier integration |
| 53 | Preserve the consumer’s remaining proof responsibility. | slice 3 | observed: Distribution/tests/native-comparison-unblocked-supplier.sh starting independent proof fails, then independent and executed proof both pass; missing-proof counterexamples rejected |
| 54 | Make the unblocked example work without event wakes. | slice 3 | observed: Distribution/tests/native-comparison-unblocked-supplier.sh only turn1 completed, no turn event/second-turn artifact; claim-only and duplicate results rejected |
| 55 | Qualify the unblocked example on Codex, the existing comparison host. |  | G3 |
| 56 | Tag cases by behavior. | slice 3 | observed: Distribution/tests/native-comparison/unblocked-supplier/case.md Selection behavior and paused-supplier/case.md forced-turn conditions; scheduling separate from shared fixture |
| 57 | Tag cases by qualified host. | slice 4 | |
| 58 | Tag cases by environment. | slice 3 | observed: Distribution/tests/native-comparison/unblocked-supplier/case.md Selection environment/prerequisites: small Node project, isolated local Git remote, no services |
| 59 | Tag cases by observed duration. |  | G3 |
| 60 | Save a fresh native unblocked baseline with its frozen payload and the applicable retained record details above. |  | G3 |
| 61 | Capture available coordinator usage through completion for that unblocked baseline. |  | G3 |
| 62 | Capture available worker usage through completion for that unblocked baseline. |  | G3 |
| 63 | Permit these observations to be captured before the blocked-work candidate exists. | slice 4 | |
| 64 | In the candidate-only-change journey, launch only the candidate when the saved baseline revision, task, events, project context, runtime settings, and required evidence remain sufficient. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh matching frozen payload/current task/runtime captures then actual session count +1 and preserved verdict; applicability checks material manifest and current assessor support |
| 65 | In that journey, cite the saved baseline outcome in the verdict. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh saved source/date/conditions/outcome/effort and historical non-concurrent limit in verdict; separate current assessment retains sourceIntegrity |
| 66 | In that journey, cite the saved baseline effort in the verdict, preserving any unknown measurements. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh saved source/date/conditions/outcome/effort and historical non-concurrent limit in verdict; separate current assessment retains sourceIntegrity |
| 67 | After a baseline revision or material-condition change, make the newly saved observation reusable by a later matching comparison while preserving traceability to the earlier observation. | slice 2 | observed: Distribution/tests/native-comparison-baseline-misses.sh fresh changed-payload baseline saved then used by next candidate-only comparison; original archive hash unchanged |
| 68 | Permit reuse of a completed baseline that missed the expected outcome when its retained evidence answers the new comparison; observed failure does not itself invalidate reuse. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh completed failed baseline reused for improved outcome; baseline-misses.sh missing/incomplete evidence uses fresh, baselines.sh refuses an unjudged interrupted export |
| 69 | Obtain fresh baseline evidence when the previous baseline stopped before its outcome could be judged. | slice 2 | observed: Distribution/tests/native-comparison-baseline-reuse.sh completed failed baseline reused for improved outcome; baseline-misses.sh missing/incomplete evidence uses fresh, baselines.sh refuses an unjudged interrupted export |
| 70 | In the unblocked example’s illustrated journey, discover the already-completed supplier. | slice 3 | observed: Distribution/tests/native-comparison-unblocked-supplier.sh completed remote with stale local refs before session; completed supplier reader integrated by observed one-turn controlled journey |
| 71 | In that journey, integrate once. | slice 3 | observed: Distribution/tests/native-comparison-unblocked-supplier.sh turn1 integration/filing counts exactly1; real duplicate continuation and mutated integration count rejected |
| 72 | In that journey, finish the consumer’s partial work. | slice 3 | observed: Distribution/tests/native-comparison-unblocked-supplier.sh preserved partial slice reaches filed result with both proofs; unfinished-stage counterexample rejected |
| 73 | In that journey, record effort through passing proof. | slice 4 | |
| 74 | Keep forced-turn and unblocked observations separately reusable under their respective conditions. | slice 4 | |
| 75 | When later using forced-turn evidence, identify its different run condition. | slice 4 | |
| 76 | Do not interpret the unblocked observation as establishing an event-driven saving. | slice 4 | |
| 77 | Leave derivation and qualification of the event-driven variant to SEED-356. | slice 4 | |
| 78 | Leave establishment of that variant’s genuine delivery path to SEED-356. | slice 4 | |
| 79 | Leave capture of a baseline that observes whether the workflow already stays quiet to SEED-356. | slice 4 | |
| 80 | Leave skipped-wake assessment to SEED-356. | slice 4 | |
| 81 | Leave general accounting tooling with its existing stories. | slice 4 | |
| 82 | Leave qualification of other native hosts with their existing stories. | slice 4 | |
| 83 | Do not use those deferrals to reject an otherwise naturally supported saved observation from such a case. | slice 2 | observed: Distribution/tests/support/native-comparison-baseline-applicability.mjs generic case/input/runtime/evidence sufficiency; no forced-turn/event-delivery trait rejection; existing host launcher capability unchanged |
