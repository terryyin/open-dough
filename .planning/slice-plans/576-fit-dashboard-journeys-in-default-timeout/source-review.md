# Source-only review

Reviewer: `/root/source_review`, fresh `fork_turns: none` general-purpose agent.
Launch and original input: conversation `collaboration.spawn_agent` call named
`source_review` on 2026-11-10. It supplied only the original selected story Goal,
Scope, restrictions, exclusions, safe stopping, and key examples, with instructions
to read no files and change nothing. The returned decomposition below is retained
verbatim per numbered item; allocation is the coordinator’s subsequent mapping.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Local parallel runs and hosted CI give maintainers and agents the same dashboard suite result. | slice 12 |  |
| C02 | The scoped dashboard journeys finish with margin inside the default 30 s case budget. | slice 12 |  |
| C03 | Their observations finish with margin inside their 5 s budgets. | slice 12 |  |
| C04 | Each temporary case-local allowance is removed after its case fits the default with margin. | slice 12 |  |
| C05 | Every distinct behavioral promise survives at an observable boundary. | slice 12 |  |
| C06 | Surviving proof is established before deleting a test. | slice 12 |  |
| C07 | Surviving proof is established before deleting a step. | slice 12 |  |
| C08 | Surviving proof is established before deleting an assertion. | slice 12 |  |
| C09 | Repeated setup is reduced. | slice 12 |  |
| C10 | Redundant proof is reduced. | slice 12 |  |
| C11 | The watcher family becomes at least 10 s faster in median elapsed time. | slice 4 | observed: Three alternating ORIGINAL32/CHANGED31 case commands all strictpassed retry0. Whole shell medians156.893714 to136.400577s save20.493137s; runner20.346132s. Same command2workers/host/cache, before-after loads overlap and after not quieter; thirdpair8.583s retained. Both consolidation and source snapshot included. See source-ingestion-evidence.md and /tmp/seed287-source-ingestion-20261110/paired-summary.json. |
| C12 | The comparable local dashboard suite stays within its previous elapsed time. | slice 12 |  |
| C13 | The slowest hosted shard stays within its previous elapsed time. | slice 12 |  |
| C14 | The failure watcher journey uses one real deployment. | slice 3 | observed: production-watcher-failures.spec.ts: unavailable/recovered origin checks retain the original served C PID/page; no watcher/served reassignment before D failure. Three whole-family after runs passed31/31. |
| C15 | An unavailable origin leaves C serving. | slice 3 | observed: production-watcher-failures.spec.ts: unavailable origin emits ls-remote failure, exact Keeping C/address, and expectStillServing checks real C PID plus WORKING C page. |
| C16 | Checks resume after the origin returns. | slice 3 | observed: production-watcher-failures.spec.ts: restore the same origin path, observe watcher.checks increase, reobserve live C, then actual D publication is read and attempted. |
| C17 | Failed-candidate proof continues on that same live deployment. | slice 3 | observed: production-watcher-failures.spec.ts: after recovered-origin live C, publish D on the same watcher; appended output names actual D failure and absence of D activation. |
| C18 | Failed-restoration proof continues on that same live deployment. | slice 3 | observed: production-watcher-failures.spec.ts: same live-C chain faults D and C restoration, observes restoring exact servedCommit also failed, exact2 fresh causes, exit1 and cleanup. |
| C19 | The real SIGHUP moves to the existing restart journey. | slice 3 | observed: production-watcher.spec.ts: existing stop case sends watcher.signal(SIGHUP), then awaits natural watcher.exited before stop. |
| C20 | Its quiet-exit assertions move to that restart journey. | slice 3 | observed: production-watcher.spec.ts: natural SIGHUP exit requires no Production dashboard could not run message before group retirement. |
| C21 | Its cleanup assertions move to that restart journey. | slice 3 | observed: production-watcher.spec.ts: SIGHUP case retains expectProductionEnded: served PID dead, HTTP unavailable and deployment directory empty. |
| C22 | The restart journey restarts from current main. | slice 3 | observed: production-watcher.spec.ts: restart publishes Document restart, productionActivation requires its exact current SHA; output excludes pinned/next and checkout list equals current. |
| C23 | It serves the expected page. | slice 3 | observed: production-watcher.spec.ts: restarted page title NEXT MAIN and source marker PINNED SOURCE remain independently observed alongside current-revision checks. |
| C24 | It preserves the same runner. | slice 3 | observed: production-watcher.spec.ts: runner count1, address PID equals original runner, original process group remains separate from new preview after restart. |
| C25 | It preserves the same client. | slice 3 | observed: production-watcher.spec.ts: attaches length1 and attached PID equals the original real held client after replacement and restart. |
| C26 | It accepts input after restart. | slice 3 | observed: production-watcher.spec.ts: follow the saved session on restarted URL, send after-restart, observe it in cursor.input(original client PID). |
| C27 | The active-build SIGTERM proof remains. | slice 3 | observed: productionUpdateJourney.ts: productionUpdateShutdown holds the actual next build by ordinal, observes its real PID, sends stop/SIGTERM and checks build/preview/deployment cleanup plus unchanged records/configuration; selected in every whole-family pass. |
| C28 | The final SIGINT proof remains. | slice 3 | observed: production-watcher.spec.ts: final restart case signals SIGINT, awaits exited, checks quiet output and expectProductionEnded. |
| C29 | Both distinct fatal-preview outcomes remain proved. | slice 3 | observed: production-watcher-failures.spec.ts: failed D plus failed C restoration reports both exact causes/exit1; subsequent unexpected-preview SIGKILL reports its distinct fatal message/exit1. |
| C30 | Their cleanup remains proved. | slice 3 | observed: production-watcher-failures.spec.ts: both fatal-preview tests invoke expectProductionEnded for dead preview, unavailable HTTP and empty deployment directories. |
| C31 | The relocated check detects a watcher ignoring SIGHUP. | slice 3 | observed: Actual scratch no-op SIGHUP handler held natural exited for full30s; raw trace shows first case expectation only after post-timeout scratch SIGTERM. Root inspected ignored-hup-test.trace.json and interpretation at /tmp/seed287-watcher-20261110. |
| C32 | The restart check detects reuse of the previously served revision. | slice 3 | observed: Actual scratch resolvePublishedMain returned Document restart parent; original exact-current productionActivation rejected the actually served prior revision. Patch/log/trace retained under /tmp/seed287-watcher-20261110/stale-restart-artifacts. |
| C33 | The standalone C-reactivation journey is deleted after the required surviving proof is established. | slice 3 | observed: production-watcher-failures.spec.ts: standalone post-hangup C-reactivation test deleted after relocated positive7/7 and both actual runtime faults; three whole-family after runs passed31 rather than32 cases. |
| C34 | Its real install is removed. | slice 3 | observed: production-watcher-failures.spec.ts: removed standalone startProductionWatcher/shownActivation for C, eliminating its real npm install while retaining original retry/restoration activations. |
| C35 | Its real build is removed. | slice 3 | observed: production-watcher-failures.spec.ts: removed standalone C activation eliminates its real Vite build; no prebuilt or substitute deployment added. |
| C36 | Its real start is removed. | slice 3 | observed: production-watcher-failures.spec.ts: removed standalone C activation eliminates its repeated real preview start; live C continues into D restoration failure. |
| C37 | One full retired-closure journey remains. | slice 5 | observed: One combined retired StoryBranch retry/Done journey remains in agent-completion-quiet; separate Land/Trunk closure paths retained, duplicate browser recovery removed after survivors passed. |
| C38 | That journey proves real Git worktree retirement. | slice 5 | observed: withInstalledCompletionClosure actual installed publication/integration/CI closure and worktree-retirement command observes remote main==final and workspace absent before StoryBranch callback; no retirement result planted. |
| C39 | It proves installed reporting retry. | slice 5 | observed: After actual StoryBranch retirement, initial-server EIO consumes marker and installed completed report retains exact pending retry; that installed --retry runs from surviving origin.machine and returns durable receipt/Done. |
| C40 | Reporting retry does not repeat Git operations. | slice 5 | observed: countedGit proofEnv logs actual push and worktree remove before reporting; after failed submission, installed retry and duplicate retry, complete Git log bytes equal pre-report snapshot. |
| C41 | Reporting retry does not repeat native operations. | slice 5 | observed: Quiet StoryBranch observes no start/resume/interrupt, exactly1 native rename after reporting; duplicate installed retry returns same receipt and adds no rename/control operation. Distinct Trunk rename-refusal retry preserved. |
| C42 | It proves visible Done. | slice 5 | observed: Same actual retired StoryBranch retry journey publishes final history and renders RecentlyDone/Done, native-working cue, no attention message, independent thread/read(includeTurns) final answer, and Done after reload. |
| C43 | The existing Story Branch Wrap Up journey carries this proof where it can. | slice 5 | observed: Existing StoryBranch WrapUp variant of agent-completion-quiet now carries actual retired/installretry/Git-native-idempotence/visibleDone together; it fit default30 in all focused passes. |
| C44 | The different Land path remains. | slice 5 | observed: Existing Land variant retains its distinct actual installed retirement path and quiet reporting/native/UI observations in all3 full14-case passes and refactor4-case pass. |
| C45 | The different Trunk Wrap Up path remains. | slice 5 | observed: Existing TrunkWrapUp variant retains its distinct installed trunk closure/retirement, refused native rename recovery and quiet/native/UI observations in all3 full14-case passes and refactor4-case pass. |
| C46 | Recovery proof covers an unavailable receiver. | slice 5 | observed: Tracked backend quiet-closure actually closes receiver; unacknowledgedCompletion runs installed CLI, fails withoutstdout and retains exact pending/message/retry guidance while Done remains absent. |
| C47 | Recovery proof covers lost acknowledgement. | slice 5 | observed: Real proxy drops acknowledgement only after receiver persisted; helper observes failed child/no stdout, lost1, durable delivery/Done and same receipt through installed retry/concurrent duplicates. |
| C48 | Recovery proof covers failed writes. | slice 5 | observed: Actual fs tmp-write EIO is consumed; failed CLI leaves completion/Done absent at backend, and full retired StoryBranch preserves previous kept completion/noDone. No expected report outcome planted. |
| C49 | Recovery proof covers concurrent writers. | slice 5 | observed: Actual concurrent bindRecord/updateRecord after reserved-unapplied receipt do not import completion/Done; lostack races update and preserves exact Concurrent native evidence firstInput alongside durable receipt. |
| C50 | Recovery proof covers reserved-receipt isolation. | slice 5 | observed: completionRecoveryFaults observes actual reserved EIO receipt before late bind/update writers; stored completion/Done stay absent until real reporting recovery applies it. Existing identity/binding race owners also passed. |
| C51 | Recovery proof covers message recovery after source deletion. | slice 5 | observed: Installed message submissions lose ack after persistence; original message files are deleted, then actual pending retries recover independent exact text/outcome. Covers newer attention and unfinished after manualDone. |
| C52 | A stale receipt preserves newer Done across restart. | slice 5 | observed: After distinct fresh quiet receipt creates newer automaticDone, real receiver closes/restarts at sameport; original installed retry returns originalreceipt while latest completion and doneAt still equal newer quietReceipt. |
| C53 | A stale receipt preserves manual Done across restart. | slice 5 | observed: Actual markDoneHTTP creates manualDone; fresh unfinished lostack/source-delete/retry preserves it; second real sameport receiverrestart plus originalretry preserves manualDone and latest heldreceipt/message. |
| C54 | Altered payloads are refused. | slice 5 | observed: RawHTTP uses actual saved old submission UUID/reference with altered message and no payload origin; actual receiver returns409. |
| C55 | Post-deletion requests are rejected. | slice 5 | observed: After real deleteRecord, original installed retry fails/no stdout, bindRecord rejects deleted reporting session, and persisted records length0. |
| C56 | Existing checks proving these recovery promises are identified. | slice 5 | observed: Inspected and ran whole quiet-closure, identity, superseded, binding, early-recovery and attention owners with concrete request/store/native/UI expectations; unchanged helpers were reused, all250 consumer dispositions checked. |
| C57 | Missing recovery proof is added at the existing boundary. | slice 5 | observed: Missing EIO/concurrent/reserved/source-delete/stale-Done-restart/altered/postdelete variants now execute at existing real tracked CLI/HTTP/store boundary; successful receipts/Done come from actual actions, not setup. |
| C58 | Covered browser steps are then removed. | slice 5 | observed: First strict14-case pass established survivors before old recovery deletion; same14 passed twice afterward. Quiet/attention retain actual Done/message/markread/finalreport/manualDone/collapsedunfinished UI; lowlevel faults observed in durable store. |
| C59 | History comparison waits for persisted collector results. | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts persisted run43 summary and run41 unavailable proof before equal reads; gaps stops collector; three strict focused passes in execution-evidence.md |
| C60 | Revisit request counting waits for the first request to finish. | slice 2 | observed: dashboard/tests/intent/intent-ci-proof-ancestor.spec.ts completed trunk/story proof and fresh revisit judgment precede counts; three strict focused passes in execution-evidence.md |
| C61 | A story-state check waits for the selected story to render. | slice 2 | observed: dashboard/tests/intent/intent-ci-status-story.spec.ts and story-gaps selected heading/title precede state; ad hoc selected identity/title guarded; three strict passes in execution-evidence.md |
| C62 | Exact counts remain where avoiding duplicate work is the promise. | slice 2 | observed: dashboard/tests/intent/intent-ci-proof-ancestor.spec.ts exact two artifact calls and unchanged revisit count retained; spy uses exact per-request linked-file list; execution-evidence.md |
| C63 | Siblings sharing each affected setup are inspected. | slice 2 | observed: Inspected history-collection, scope-proof lifecycle/completion, project-visit-selection and ad hoc check/review sibling guards; unchanged; execution-evidence.md |
| C64 | Landed fixes serve as examples. | slice 2 | observed: Current guards checked against ad581992a, f1a992a75, fa274447d and ancestor f97907d27 repair patterns; execution-evidence.md |
| C65 | Domain data uses MakeMe. | slice 12 |  |
| C66 | Synchronization uses observable events or a controlled clock. | slice 12 |  |
| C67 | Existing shard weights are refreshed after work is removed. | slice 12 |  |
| C68 | Shard redistribution is measured separately from summed test durations. | slice 12 |  |
| C69 | The project default case timeout remains unchanged. | slice 12 |  |
| C70 | Shard deadlines remain unchanged. | slice 12 |  |
| C71 | These journeys receive no permanent deadline increases. | slice 12 |  |
| C72 | Sleeps do not absorb load variance. | slice 12 |  |
| C73 | Retries do not absorb load variance. | slice 12 |  |
| C74 | Skips do not absorb load variance. | slice 12 |  |
| C75 | Permanent CI jobs do not absorb load variance. | slice 12 |  |
| C76 | Flaky or environment-dependent timeouts remain defects until stable locally. | slice 12 |  |
| C77 | They remain defects until stable in CI. | slice 12 |  |
| C78 | Each retained change preserves its proof. | slice 12 |  |
| C79 | Each retained change measurably widens the affected cases’ margin. | slice 12 |  |
| C80 | Experiments that add cost are dropped. | slice 12 |  |
| C81 | Experiments whose proof remains unestablished are dropped. | slice 12 |  |
| C82 | Experiments whose speedup remains unestablished are dropped. | slice 12 |  |
| Q01 | The specified local pressure is load 20–30 on 2 workers. | slice 12 |  |
| Q02 | The hosted comparison includes a shard about 1.5× slower overall. | slice 12 |  |
| Q03 | Watcher-family elapsed time includes moved work. | slice 4 | observed: Complete family command elapsed includes all hooks, private clones, actual installs/builds/starts and moved SIGHUP. Each changed run pays first-demand cold snapshot3.532/3.352/3.461s, exactly1 preparation3requests; no prewarm or cost outside elapsed. Artifact trace confirms removal after everyrun. |
| Q04 | Allowance removal is conditional on that particular case fitting the default with margin. | slice 12 |  |
| Q05 | Standalone C reactivation is deleted only after the preceding preservation and detection obligations are satisfied. | slice 3 | observed: Relocated restart positive7/7 and actual ignored-HUP/stale-revision fault probes completed before deletion; root inspected setup and trace chronology. Exact parked/restored bytes and complete after-family passes retained in watcher-evidence.md. |
| Q06 | Story Branch Wrap Up reuse is conditional on its ability to carry the required closure proof. | slice 5 | observed: StoryBranch reuse proved able to carry the entire actual retirement+installedretry+no repeatedGit/native+Done example under default30; separate Land/Trunk variants remain. |
| Q07 | Recovery variants belong at the existing real CLI, HTTP, and store boundary; the source does not require every variant independently at all three boundaries. | slice 5 | observed: Detailed variants run at existing actual CLI/HTTP/store boundary appropriate to each promise; no demand or parallel suite repeats every variant at all3. |
| Q08 | Exact-count preservation applies where avoiding duplicate work is the behavioral promise. | slice 2 | observed: dashboard/tests/intent/intent-ci-proof-ancestor.spec.ts duplicate-avoidance exact counts unchanged and passed three times; execution-evidence.md |
| Q09 | Weight refresh uses all 12 artifacts from a complete passing trunk run. | slice 12 |  |
| Q10 | The restrictions protect trustworthy gate meaning; omitted examples do not become rejection rules. | slice 12 |  |
| Q11 | Other allowances remain outside unless a harness change made by this story must keep those cases green. | slice 12 |  |
| Q12 | The remaining-flake exclusion applies once the named journeys fit. | slice 12 |  |
| Q13 | “Margin” is required, but the source supplies no additional numerical margin threshold. | slice 12 |  |
| Q14 | Observable events and controlled clocks are alternatives, not cumulative requirements. | slice 12 |  |
| J01 | Touch review: “chooses a comparison and file and reads within each pane.” | slice 6 |  |
| J02 | First-in-worker preparation cost. | slice 12 |  |
| J03 | `agent-launch-preparation-codex`. | slice 12 |  |
| J04 | Its retry. | slice 12 |  |
| J05 | `responsive-session-access`. | slice 12 |  |
| J06 | `responsive-session-reconciliation`. | slice 12 |  |
| J07 | `responsive-session-recovery-restart`. | slice 12 |  |
| J08 | `side-panel-content-replacement`. | slice 12 |  |
| J09 | `production-deployment`. | slice 12 |  |
| J10 | `agent-completion-recovery`. | slice 12 |  |
| J11 | Watcher-family first-in-worker `beforeAll`. | slice 12 |  |
| J12 | Watcher restart paths. | slice 3 | observed: production-watcher.spec.ts: complete real current-main restart with unchanged runner/client, actual post-restart input and final SIGINT/cleanup passed in all3 changed-family selections. |
| J13 | Watcher policy-repair paths. | slice 12 |  |
| J14 | Retired closure. | slice 5 | observed: Retired StoryBranch closure retains actual installed Git retirement, durable reporting retry and visible Done; other distinct closure paths retained. |
| J15 | `story-review-completed`. | slice 12 |  |
| J16 | DD-473 routes. | slice 12 |  |
| J17 | DD-476 routes. | slice 12 |  |
| J18 | DD-479 routes. | slice 12 |  |
| J19 | The three candidates moved from SEED-284; the source does not name them individually. | slice 12 |  |
| J20 | Touch review’s 2026-11-09 case-local allowance is removed after it fits. | slice 6 |  |
| J21 | The production-deployment allowance is removed after it fits. | slice 12 |  |
| J22 | The agent-completion-recovery allowance is removed after it fits. | slice 12 |  |
| J23 | The temporary watcher policy-repair allowance on main is removed after it fits. | slice 12 |  |
| J24 | The temporary retired-closure allowance on main is removed after it fits. | slice 12 |  |
| J25 | The watcher example proceeds from origin unavailability, through origin recovery, into failed candidate and failed restoration on one deployment. | slice 3 | observed: production-watcher-failures.spec.ts: unavailable origin keeps actual C alive; restored origin resumes checks and same-C serving; D candidate/restoration then fails with exact2 new causes on that watcher. |
| J26 | The restart example detects ignored SIGHUP. | slice 3 | observed: Actual ignored-SIGHUP runtime fault blocks natural exit until the default case deadline; teardown continuation is distinguished by raw trace timing. See C31 and watcher-evidence.md. |
| J27 | The restart example detects reuse of the previously served revision. | slice 3 | observed: Actual old-parent restart runtime fault serves a different SHA and fails exact current activation. See C32 and watcher-evidence.md. |
| J28 | The retained closure example combines real retirement, reporting retry without repeated Git/native work, and visible Done. | slice 5 | observed: Same StoryBranch test combines actual retirement, installed retained retry with Git log byteequality/native idempotence and visibleDone; independent refactor focused4case pass confirms renamed links. |
| J29 | The history example waits for persistence before comparing reads. | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts retainedHistory proof waits precede expectCollectedScopePoints; three focused passes in execution-evidence.md |
| J30 | The revisit example waits for first-request completion before counting. | slice 2 | observed: dashboard/tests/intent/intent-ci-proof-ancestor.spec.ts trunk proof finishes before baseline count and revisit judgment before no-new-proof count; execution-evidence.md |
| J31 | The selected-story example waits for rendering before checking state. | slice 2 | observed: dashboard/tests/intent/intent-ci-status-story.spec.ts selected branch and story title assertions before state; three strict focused passes in execution-evidence.md |
| X01 | The Intent CI comparison family belongs to SEED-286. | slice 12 |  |
| X02 | Infrastructure acquisition is outside. | slice 12 |  |
| X03 | Unrelated branch defects are outside. | slice 12 |  |
| X04 | The separate collector-lock repair is outside. | slice 12 |  |
| X05 | Other unnamed case-local allowances are outside, subject to Q11. | slice 12 |  |
| X06 | Recently-done ad-hoc session journey allowances are specifically outside, subject to Q11. | slice 12 |  |
| X07 | Intent timing-history journey allowances are specifically outside, subject to Q11. | slice 12 |  |
| X08 | Causal attribution of every remaining CI flake beyond the named patterns is outside once the named journeys fit. | slice 12 |  |
| X09 | Margin work does not establish that a collector-lock failure has been solved. | slice 12 |  |
| X10 | Margin work does not establish that an infrastructure setup failure has been solved. | slice 12 |  |
