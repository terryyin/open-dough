# Independent source review

Fresh reviewer `/root/source_review` was launched without conversation inheritance
with the original user request and accepted story text. It was instructed to
read no files, change nothing, and derive individual source commitments rather
than acceptance or slice ownership. Its returned clauses are retained below.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | When the nearest CI check is still running, retain the running status. | slice 1 | observed: dashboard/tests/agent-launch-base-ci-completed-history.spec.ts running heading and Continue assertions |
| 2 | Alongside that notice, show the nearest ancestor with a completed CI result. | slice 1 | observed: dashboard/tests/agent-launch-base-ci-completed-history.spec.ts nearest completed success/failure assertions |
| 3 | Identify the commit associated with that completed result. | slice 1 | observed: dashboard/tests/agent-launch-base-ci-completed-history.spec.ts completed.head short SHA and subject assertion |
| 4 | Show whether that completed result passed or failed. | slice 1 | observed: dashboard/tests/agent-launch-base-ci-completed-history.spec.ts parameterized passed/failed assertion |
| 5 | Include the completed result's run link. | slice 1 | observed: dashboard/tests/agent-launch-base-ci-completed-history.spec.ts completed-base link visibility |
| 6 | Search commit ancestry for historical evidence. | slice 1 | observed: dashboard/server/baseCiNearest.ts parent traversal; browser merge fixture rejects unrelated sibling link |
| 7 | Report unavailable historical evidence truthfully. | slice 1 | observed: dashboard/tests/agent-launch-base-ci-completed-history.spec.ts no completed ancestor readable-history message |
| 8 | Preserve existing launch choices. | slice 1 | observed: dashboard/tests/agent-launch-base-ci.spec.ts and running-unread/adapter specs Back, Continue, no premature start |
| 9 | Preserve existing CI ownership. | slice 1 | observed: dashboard/server/baseCiJudgment.ts read-only acquisition; no observer/ownership changes in diff |
| 10 | The historical result must be completed. | slice 1 | observed: dashboard/server/baseCiNearest.ts newestRunFor completedOnly; browser pending-rerun excluded |
| 11 | Select the nearest completed result, whether passed or failed; do not prefer an older success over a nearer failure. | slice 1 | observed: dashboard/tests/agent-launch-base-ci-completed-history.spec.ts nearer failure versus older-pass link absence |
| 12 | The intended outcome is to help the developer judge the session's starting revision. | slice 1 | observed: dashboard/src/LaunchBaseCi.tsx visible revision, outcome, run link alongside running judgment |
| 13 | Trigger: a new session presents a notice that the nearest base CI check is still running. | slice 1 | observed: dashboard/tests/agent-launch-base-ci-completed-history.spec.ts Start execution opens focused running warning |
| 14 | Example: a running base check, a nearer unchecked commit, and an older successful run produce both the running notice and the historical success. | slice 1 | observed: dashboard/tests/agent-launch-base-ci-completed-history.spec.ts unchecked merge head, running parent, older completed success |
| 15 | Example: a nearest completed failure is shown even when an older success exists. | slice 1 | observed: dashboard/tests/agent-launch-base-ci-completed-history.spec.ts completed failure selected ahead of older success |
| 16 | Unrelated branch history is outside the historical search. | slice 1 | observed: dashboard/tests/agent-launch-base-ci-completed-history.spec.ts merged sibling result excluded; discriminating mutation failed |
| 17 | No release changes are requested. | slice 1 | observed: git diff contains no VERSION, CHANGELOG, or release changes |
| 18 | No installation changes are requested. | slice 1 | observed: git diff contains no installation or managed skill payload changes |
