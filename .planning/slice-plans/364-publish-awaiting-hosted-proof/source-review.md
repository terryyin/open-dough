# Source review — SEED-158#publish-awaiting-hosted-proof

**Launch:** Fresh general-purpose reviewer; source-only inputs (Goal, Scope,
Constraints, Deferred promises, Key examples, Evaluation, Completion). No plan,
implementation return, product files, or proof supplied. Second launch used the
complete seed examples after the first launch's coordinator prompt omitted
examples 3–4.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A coordinator whose planned slice needs its published source before hosted or external proof can be accepted can publish that authorized reviewed source through the existing guarded preparation, hook, credit, and exact-candidate publication path while the slice and its receiving obligations remain unfinished. | slice 1 | observed: execution-increment-fresh-progress.test.mjs "progress publication commits while receiving proof is pending without marking the slice done"; preparation `progress: true` in execution-increment-preparation.mjs |
| 2 | After that publication, once the observation exists, the coordinator can record accepted proof and complete the slice through the ordinary path. | slice 1 | observed: execution-increment-fresh-progress.test.mjs "ordinary fresh marks done after accepted observation and still refuses while it is missing" |
| 3.1 | Fresh guarded increment may publish without mutating selected slice to `done` when promised observation still depends on the published revision. | slice 1 | observed: progress test HEAD:PLAN.md unchanged; statuses stay unfinished for selected slice |
| 3.2 | Same without mutating to `done` when promised observation is another external observation that cannot honestly be claimed yet. | slice 1 | observed: same progress path; open receiving obligation fixture; fresh-increment.md progress field |
| 4.1 | Local prerequisites stay the same path. | slice 1 | observed: progress still runs generation/formatting before commit; failed formatting test refuses |
| 4.2 | Hooks stay the same path. | slice 1 | observed: progress test hookLog `commit` |
| 4.3 | Agent or ordinary commit credit stays the same path. | slice 1 | observed: "progress uses the same agent commit and exact-candidate resume" agent Yui-chan |
| 4.4 | Exact-candidate publication stays the same path. | slice 1 | observed: resume receipt.sha equals interrupted commit; pushCount 1 |
| 4.5 | Target authority stays the same path. | slice 1 | observed: no new target/authority fields; local-only fixture withhold remote until authorized delivery |
| 4.6 | Execution workspace ownership stays the same path. | slice 1 | observed: unchanged staging/ownership contract; no second publisher |
| 4.7 | Observer ownership stays the same path. | slice 1 | observed: no observer redesign in diff |
| 4.8 | Interrupted-publication / existing-candidate resume stays the same path. | slice 1 | observed: interrupted → resumeManagedExecutionIncrement without second prep; HEAD stable |
| 5 | After published source is observed, coordinator records accepted proof and finishes with ordinary fresh that marks `done`. | slice 1 | observed: ordinary fresh after proved disposition marks slice 4 done |
| 6 | Ordinary completion still refuses while receiving obligations are open or the promised observation is missing. | slice 1 | observed: ordinary fresh refuses open-obligation before proved; "ordinary open-obligation refusal for return dispositions stays on the done path" |
| 7 | Failed local prerequisites still publish nothing. | slice 1 | observed: "failed formatting on a progress attempt publishes nothing and leaves the plan unfinished"; withheld() |
| 8.1 | Progress publication does not close receiving obligations. | slice 1 | observed: HEAD:PLAN.md still has `Disposition: receiving slice 4` after progress |
| 8.2 | Progress publication does not invent accepted proof. | slice 1 | observed: plan bytes unchanged; no proved disposition invented |
| 8.3 | Progress publication does not authorize a later completion that skips the observation. | slice 1 | observed: ordinary path still refuses open-obligation; completing requires proved disposition |
| 9 | Ordinary fresh delivery that marks the slice done remains available when proof is already accepted. | slice 1 | observed: ordinary completion path after proved disposition |
| 10.1 | No new release authority. | slice 1 | observed: no release scripts/authority added in owned diff |
| 10.2 | No trunk-integration authority ahead of ordinary story integration. | slice 1 | observed: no early Dough Land / trunk-integration path added |
| 10.3 | No hosted merge. | slice 1 | observed: no merge-gate bypass added |
| 10.4 | No CI bypass. | slice 1 | observed: no CI skip/bypass added |
| 11 | An open receiving obligation is not treated as satisfied by publication alone. | slice 1 | observed: obligation remains open after progress; committing:false only for progress check, does not close entry |
| 12 | Accepted provisional candidate resumes as existing candidate rather than re-prepared. | slice 1 | observed: resumeManagedExecutionIncrement on interrupted.recovery; HEAD unchanged |
| 13 | Limits in 10–12 come from retained ODF-275 responsibility split, not example count. | slice 1 | observed: docs/maintainer/findings/ODF-275.md response draft cites SEED-158 and ODF-275 split |
| 14 | Early trunk integration or early Dough Land solely for a stable main checkout is not promised. |  | X1 |
| 15.1 | No second Git plumbing path is promised. |  | X2 |
| 15.2 | Manual agent-commit-plus-deliver as the supported contract is not promised. |  | X3 |
| 15.3 | No new observer is promised. |  | X4 |
| 15.4 | No broad redesign of story-obligation ownership is promised. |  | X5 |
| 16 | This preparation does not authorize implementation or a release. |  | X6 |
| 17 | Queueing is not resolution. |  | X7 |
| 18 | Example: hosted CI needs published source; progress publishes; unfinished; obligation open; fail prereq publishes nothing. | slice 1 | observed: progress + failed formatting tests; openReceiving fixture |
| 19 | Example: after receipts, ordinary fresh marks done only with proof; refuses while missing. | slice 1 | observed: ordinary fresh marks done after accepted observation test |
| 20 | Example: externally blocked hosted delivery; progress then ordinary; HEAD/index/status coherent across increments. | slice 1 | observed: progress then ordinary completion on same selected slice; statuses coherent |
| 21 | Example: evidence-only slice; progress without false done; later ordinary marks done; no invented early done / working-plan-not-at-HEAD refusal shape. | slice 1 | observed: progress leaves selected slice planned at HEAD; ordinary later marks done |
| 22.1 | Pending proof stays owned. | slice 1 | observed: receiving disposition remains after progress |
| 22.2 | Failed local prerequisites publish nothing. | slice 1 | observed: failed formatting progress test |
| 22.3 | Published SHA matches the reviewed source. | slice 1 | observed: result.commit.sha === HEAD after progress |
| 22.4 | Final completion refuses until promised observation exists. | slice 1 | observed: ordinary refuse then complete after proved |
| 23.1 | Preserve existing target authority. | slice 1 | observed: unchanged target contract in progress path |
| 23.2 | Preserve execution workspace / observer ownership. | slice 1 | observed: no ownership redesign |
| 23.3 | Preserve rerun recovery. | slice 1 | observed: exact-candidate resume test |
| 24 | Evaluation implies no new release, trunk integration authority, hosted merge, or CI bypass. | slice 1 | observed: same as 10.1–10.4 |
| 25.1 | ODF-275 retains actual response revisions. | slice 1 | observed: ODF-275.md Response revision draft with SHA placeholder until delivery commit |
| 25.2 | ODF-275 retains first containing release. | slice 1 | observed: ODF-275.md "First containing release: none yet" |
| 25.3 | ODF-275 retains proof/limits. | slice 1 | observed: ODF-275.md cites discriminating fixture coverage and limits |
| 25.4 | ODF-275 retains a checkable ordinary-use observation request. | slice 1 | observed: ODF-275.md Ordinary-use request paragraph |
