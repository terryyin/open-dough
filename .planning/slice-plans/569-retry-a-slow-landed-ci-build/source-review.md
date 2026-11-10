# Source-only review

Reviewer: fresh isolated `/root/source_review`, launched without inherited
conversation. Input: the original selected story in
`../../seeds/SEED-285-landed-ci-timing-history.md#retry-a-slow-landed-ci-build`,
Goal, Scope, key examples/exclusions and Terry's accepted Decisions of
2026-11-10. No plan, implementation, proof or suspected omissions supplied;
reviewer read no other project files and changed no project state.
The canonical refined return is retained below without changing its ids/text;
reviewer's temporary JSON output: `/tmp/seed285-source-review.json`.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C001 | Recently done lets a developer distinguish a slow landed CI measurement that returned to range after one full repeat from one that still needs investigation. | slice 3 |  |
| C002 | Preserve the original and repeat as distinct, reviewable attempts. | slice 4 |  |
| C003 | Preserve each attempt's revision. | slice 4 |  |
| C004 | Preserve each attempt's workflow identity. | slice 4 |  |
| C005 | Preserve each attempt's run identity. | slice 4 |  |
| C006 | Preserve each attempt's timing. | slice 4 |  |
| C007 | Preserve each attempt's proof completeness. | slice 4 |  |
| C008 | Preserve each attempt's build links. | slice 4 |  |
| C009 | Accepted Decision (Terry, 2026-11-10): automatic follow-up is off by default. | slice 3 |  |
| C010 | Accepted Decision (Terry, 2026-11-10): require explicit per-project enablement. | slice 3 |  |
| C011 | Accepted Decision (Terry, 2026-11-10): one designated production dashboard machine per project has action authority. | slice 3 |  |
| C012 | Accepted Decision (Terry, 2026-11-10): enablement applies only to newly recorded landing receipts, avoiding a historical batch. A landing retained before enablement remains readable but requests no repeat; a newly recorded landing can qualify. | slice 3 |  |
| C013 | The allowance follows the original landing: duplicate Done delivery or a new representation of that landing grants no additional allowance. | slice 3 |  |
| C014 | Changing workflow configuration grants no additional allowance. | slice 3 |  |
| C015 | The chosen workflow remains part of the original request's evidence. | slice 3 |  |
| C016 | The chosen run remains part of the original request's evidence. | slice 3 |  |
| C017 | Development dashboards gain no action authority merely by reading the project and issue no automatic requests. | slice 3 |  |
| C018 | Other machines gain no action authority merely by reading the project. | slice 3 |  |
| C019 | Preparation does not enable a real project; the threshold's learning question also grants no authority to enable one. | slice 3 |  |
| C020 | Disabling follow-up stops new requests; disabled projects issue none. | slice 3 |  |
| C021 | Existing request evidence remains reviewable after disabling. | slice 4 |  |
| C022 | An enabled project has an allowance for only one automatic repeat of the landing. | slice 3 |  |
| C023 | The requested repeat is a full repeat of the original observed workflow run. Equivalent-build reuse or a confirmed skip supplies no qualifying run of this landing's own; an incremented attempt number alone is insufficient because partial manual reruns can carry forward earlier jobs. | slice 3 |  |
| C024 | The repeat uses the exact recorded landed revision; a later trunk build may contain later changes and does not qualify as that landing's own observed run. | slice 3 |  |
| C025 | Only a successful original measurement can trigger repetition. | slice 3 |  |
| C026 | Only a complete original measurement can trigger repetition; missing or incomplete evidence cannot establish the trigger. | slice 3 |  |
| C027 | Accepted Decision (Terry, 2026-11-10): use the provisional 5% trigger. The original qualifies at or above 105 seconds against a 100-second reference; 104 seconds does not qualify, and equality at 105 is eligible. | slice 3 |  |
| C028 | The comparable prior-build reference must have sufficient history; too few comparable samples cannot establish the trigger. | slice 3 |  |
| C029 | The reference average must be positive to supply a percentage trigger. A zero reference retains its elapsed comparison but supplies no percentage trigger. | slice 3 |  |
| C030 | The trigger rule is deterministic. | slice 3 |  |
| C031 | The provisional trigger rule is visible. | slice 3 |  |
| C032 | Do not describe the threshold as statistically calibrated or validated. | slice 3 |  |
| C033 | Reuse the preceding comparison story's completeness rules. | slice 3 |  |
| C034 | Reuse the preceding comparison story's sample rules. | slice 3 |  |
| C035 | Reuse the preceding comparison story's exclusion rules. | slice 3 |  |
| C036 | Reuse the preceding comparison story's provenance rules. | slice 3 |  |
| C037 | Freeze the actual prior sample when deciding to repeat. | slice 3 |  |
| C038 | Freeze the prior average when deciding to repeat. | slice 3 |  |
| C039 | Freeze the timing basis when deciding to repeat. | slice 3 |  |
| C040 | Freeze the trigger rule when deciding to repeat. | slice 3 |  |
| C041 | Judge the original and repeat against that same frozen reference. Newer landings changing today's average do not change either card or comparison; reference eviction and newer landings do not rewrite a completed follow-up decision. | slice 3 |  |
| C042 | Expose the fixed reference in the comparison so the shared basis for both measurements is reviewable. | slice 4 |  |
| C043 | All baseline samples must use the same timing basis as the two observations; a consistent original/repeat pair alone is insufficient. Differently measured samples cannot establish the threshold merely because both are labelled wall time. | slice 1 | observed: tests/support/ci-attempt-wall-time-basis.test.mjs unknown/workflow-creation exclusions; landed-ci-attempt-start.spec.ts shared reference evidence120000ms and unavailable exclusion |
| C044 | Accepted Decision (Terry, 2026-11-10): use provider-reported attempt start as the start of both observations and every baseline sample. | slice 1 | observed: baseCiRevisionNearest.ts attemptTimesOf(run); first/repeat/missing-start contracts and GitHub/adapter collector specs |
| C045 | Accepted Decision (Terry, 2026-11-10): use completion as the end of both observations and every baseline sample. | slice 1 | observed: same direct and collector assertions retain provider completion and120000ms interval; existing comparison consumer gate |
| C046 | Accepted Decision (Terry, 2026-11-10): this increment does not promise every queue phase or full queue-inclusive timing. | slice 1 | observed: docs/dashboard-development-intent-ci-comparison.md Timing defines attempt start through completion without promising every queue phase |
| C047 | Accepted Decision (Terry, 2026-11-10): recompute retained samples measured on another basis from authoritative bounds where possible, including samples formerly measured from workflow creation. | slice 1 | observed: landed-ci-attempt-start.spec.ts available exact original41/1 refresh while faster41/2 is listed; adapter original first:1 migration |
| C048 | Accepted Decision (Terry, 2026-11-10): otherwise exclude retained samples measured on another basis, with an explanation. | slice 1 | observed: landed-ci-attempt-start.spec.ts unavailable authoritative bounds remain timing-basis gap and excluded reference; direct unknown/other-basis contracts |
| C049 | Accepted Decision (Terry, 2026-11-10): keep the original observation as that landing's sample in later averages, once under ordinary completeness/filter rules. A 120-second original remains the sample even when its repeat takes 100 seconds; do not selectively substitute the faster repeat. | slice 3 |  |
| C050 | Accepted Decision (Terry, 2026-11-10): keep the selectively requested repeat as separate evidence, not another baseline sample. | slice 3 |  |
| C051 | For an observed queued or running repeat, the Done card shows **CI rerun in progress**. | slice 3 |  |
| C052 | A complete successful repeat at or above the chosen threshold shows **Possible CI slowdown**. Against a fixed 100-second reference, a complete successful 106-second repeat after a qualifying original illustrates persistence. | slice 3 |  |
| C053 | The **Possible CI slowdown** indicator is red. | slice 3 |  |
| C054 | The **Possible CI slowdown** indicator includes text. | slice 3 |  |
| C055 | The indicator provides a route to the original timing. | slice 4 |  |
| C056 | The indicator provides a route to the repeat timing. | slice 4 |  |
| C057 | The indicator provides a route to the fixed comparison. | slice 4 |  |
| C058 | A complete successful repeat below the threshold says timing returned to range. A complete 104-second repeat is judged against its saved 100-second reference even when newer landings have changed today's average; a 120-second original repeating in 100 seconds likewise illustrates recovery against its saved reference. | slice 3 |  |
| C059 | A refused request has its particular unverified explanation. | slice 3 |  |
| C060 | A failed repeat has its particular unverified explanation. | slice 3 |  |
| C061 | A cancelled repeat has its particular unverified explanation. | slice 3 |  |
| C062 | An incomplete measurement or incomplete comparable proof has its particular unverified explanation. | slice 3 |  |
| C063 | Uncertain request acceptance has its particular unverified explanation. | slice 3 |  |
| C064 | None of those unverified outcomes establishes recovery. | slice 3 |  |
| C065 | None of those unverified outcomes establishes persistent slowness. | slice 3 |  |
| C066 | Retain the original evidence when confirmation is unavailable. | slice 3 |  |
| C067 | The story remains Done through follow-up and unverified outcomes. | slice 3 |  |
| C068 | **Possible CI slowdown** warns about two observed timings. | slice 3 |  |
| C069 | The warning does not prove a regression. | slice 3 |  |
| C070 | The warning does not prove a cause. | slice 3 |  |
| C071 | Dashboard restart preserves the one-repeat cap and the existing request. | slice 3 |  |
| C072 | Keep request intent distinguishable from request acceptance. | slice 3 |  |
| C073 | Keep request acceptance distinguishable from the CI outcome. | slice 3 |  |
| C074 | An unreadable allowance record must not be treated as a fresh allowance, because forgetting it could authorize a duplicate. | slice 3 |  |
| C075 | Consume the allowance atomically. | slice 3 |  |
| C076 | Accepted Decision (Terry, 2026-11-10): durably record the consumed request before submission. | slice 3 |  |
| C077 | Accepted Decision (Terry, 2026-11-10): never automatically resend after ambiguous acceptance, including a crash between the durable write and submission. The cap takes precedence over guaranteed delivery. | slice 3 |  |
| C078 | Accepted Decision (Terry, 2026-11-10): reconcile what CI can establish about an existing request rather than grant another allowance. | slice 3 |  |
| C079 | Accepted Decision (Terry, 2026-11-10): retain an unverified outcome when CI cannot establish the request's outcome. | slice 3 |  |
| C080 | Production processes on the designated machine share the cap; a second process and duplicate delivery still issue only one request. | slice 3 |  |
| C081 | Accepted Decision (Terry, 2026-11-10): cross-machine coordination and a global cross-machine cap are deferred; a global cap would require a different coordination design. | slice 3 |  |
| C082 | Background collection owns acquisition. | slice 3 |  |
| C083 | Background collection owns follow-up observation. | slice 3 |  |
| C084 | Opening cards does not itself request another build. | slice 4 |  |
| C085 | Opening Intent does not itself request another build. | slice 4 |  |
| C086 | Opening retained history does not itself request another build. | slice 4 |  |
| C087 | Done-card and Intent presentation read the same follow-up evidence. | slice 4 |  |
| C088 | Workflow publication remains with its existing owner. | slice 3 |  |
| C089 | Story completion remains with its existing owner. | slice 3 |  |
| C090 | CI's verdict remains with CI. | slice 3 |  |
| C091 | Accepted Decision (Terry, 2026-11-10): deliver GitHub Actions full reruns first. | slice 2 | observed: ci-github-actions.mjs repeatGitHubWorkflow; ci-github-workflow-repeat.test.mjs exact full POST target and typed result; transport cases prove no resend, original GET and shared source/dashboard reads preserved |
| C092 | Accepted Decision (Terry, 2026-11-10): other providers retain their existing reading behavior; deferred capabilities do not prohibit that reading. | slice 3 |  |
| C093 | Accepted Decision (Terry, 2026-11-10): explain when automatic follow-up is unavailable for a provider. | slice 3 |  |
| C094 | Accepted Decision (Terry, 2026-11-10): generic CI-adapter mutation is deferred; this increment adds no generic mutation contract, which would require its own agreed action contract. | slice 2 | observed: fixedWorkflowRerun is GitHub-only fixed operation; generic fixedRequest still rejects mutation; no CI adapter operation changed, existing lead/proof adapter consumers passed |
| C095 | A confirmed skip can still reuse equivalent evidence. | slice 3 |  |
| C096 | For equivalent-build reuse, resolution to a later trunk build, incomplete proof, or too few comparable samples, retain existing evidence and the reason without triggering this landing's repeat; browsing that evidence issues no repeat request. | slice 3 |  |
| C097 | Do not replace uncertainty with an invented success. | slice 3 |  |
| C098 | Do not replace uncertainty with an invented failure. | slice 3 |  |
| C099 | Do not replace uncertainty with an invented elapsed value; missing evidence is never zero or a recovered timing. | slice 3 |  |
| C100 | Causal attribution is deferred. | slice 4 |  |
| C101 | A statistical confidence claim is deferred. | slice 4 |  |
| C102 | Adaptive multiple repeats are deferred. | slice 4 |  |
| C103 | Configurable thresholds are deferred. | slice 4 |  |
| C104 | New historical backfill is deferred. | slice 4 |  |
| C105 | Treat the stated restrictions as protections for comparison meaning and the request cap; do not turn omitted examples into additional rejection rules. | slice 4 |  |
| C106 | Accepted Decision (Terry, 2026-11-10): the provisional threshold's usefulness remains a learning question. | slice 4 |  |
| C107 | That learning question does not authorize changing the rule. | slice 4 |  |
| C108 | Accepted Decision (Terry, 2026-11-10): no product decision remains open for preparation. | slice 4 |  |
| C109 | Execution depends on the preceding comparison story's recorded supplier outcome; the Scope does not authorize assuming its comparison implementation has shipped. | slice 1 | observed: .planning/seeds/SEED-285-landed-ci-timing-history.md satisfied supplier at79463598346c4f74221711aabc47be51e29246cb; ciWallTimeReference.ts reuses ciPriorBuildReference.ts with focused existing reference boundary proof |
