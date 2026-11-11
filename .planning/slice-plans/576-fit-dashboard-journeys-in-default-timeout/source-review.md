# Source-only review

Fresh reviewer: `/root/amended_source_review`, `fork_turns: none`, launched
2026-11-11 after the human amendment at44f3e0186. The launch supplied only
canonical Why context and Goal through end; no plan, implementation or proof.
Input: `/tmp/seed287-amended-source-review-input-20261111.md`, SHA256
`3170378dff3f53b8a7a5d7bf857e8caade0c96b9a3c9c86d40d1382d81b3711d`.
Actual verbatim return: `/tmp/seed287-amended-source-review-return-20261111.md`,
SHA256 `5879a8e462c390e495e7385cb22b0f1ba57245886aa566c35e03e135b48f6190`.
[Qualifications](source-review-qualifications.md) retain the review's other text.
Each numbered commitment below is verbatim; allocation/observation is subsequent
coordinator judgment. The former137-item review and proof remain recoverable at
`9739dd6eb603bf3f7a92d8593201d52f08044698:source-review.md` in this plan directory
and `/tmp/seed287-source-review-before-amendment-9739.md`; compatible proof remains.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C001 | Maintainers and agents get the same dashboard suite result under the machine’s usual parallel load and in hosted CI. | slice 13 | G1 |
| C002 | In-scope dashboard journeys finish with margin inside the default 30 s case budget. | slice 13 | G7 |
| C003 | In-scope observations finish with margin inside their 5 s budgets. | slice 13 | G18 |
| C004 | Achieve the outcome without the in-scope temporary case-local timeout allowances. | slice 13 | G1 |
| C005 | Preserve trustworthy local full-gate and hosted-shard verdicts without stretching deadlines. | slice 13 | G1 |
| C006 | Make the touch review reading case fit with margin. | slice 13 | G1 |
| C007 | Make first-in-worker journeys fit with margin, accounting for preparation cost. | slice 13 | G1 |
| C008 | Make `agent-launch-preparation-codex` fit with margin. | slice 13 | G1 |
| C009 | Make its retry case fit with margin. | slice 13 | G1 |
| C010 | Make `responsive-session-access` fit with margin. | slice 13 | G1 |
| C011 | Make `responsive-session-reconciliation` fit with margin. | slice 13 | G1 |
| C012 | Make `responsive-session-recovery-restart` fit with margin. | slice 13 | G1 |
| C013 | Make `side-panel-content-replacement` fit with margin. | slice 13 | G1 |
| C014 | Make `production-deployment` fit with margin. | slice 13 | G20 |
| C015 | Make `agent-completion-recovery` fit with margin. | slice 13 | G1 |
| C016 | Make the watcher family’s first-in-worker `beforeAll` fit with margin. | slice 13 | G20 |
| C017 | Make the watcher restart paths fit with margin. | slice 13 | G8 |
| C018 | Make the watcher policy-repair paths fit with margin. | slice 13 | G1 |
| C019 | Make the retained retired-closure journey fit with margin. | slice 13 | G1 |
| C020 | Address the shared margin problem in `story-review-completed`. | slice 13 | G1 |
| C021 | Address the shared margin problem routed through DD-473. | slice 13 | G1 |
| C022 | Address the shared margin problem routed through DD-476. | slice 13 | G1 |
| C023 | Address the shared margin problem routed through DD-479. | slice 13 | G1 |
| C024 | Address `story-review-touch-reading-strokes`, moved from SEED-284. | slice 13 | G1 |
| C025 | Address `production-deployment-pinned-build`, moved from SEED-284. | slice 13 | G1 |
| C026 | Address `hosted-margin-dashboard-journeys`, moved from SEED-284. | slice 13 | G1 |
| C027 | Remove the touch review allowance only after the case fits the default with margin. | slice 6 | observed: story-review-touch.spec.ts removes60s allowance after fit; touch-evidence.md three actual default30s passes at load20.629–25.571, every case16.508–23.085s |
| C028 | Remove the production-deployment allowance only after the case fits the default with margin. | slice 13 | G1 |
| C029 | Remove the agent-completion-recovery allowance only after the case fits the default with margin. | slice 13 | G1 |
| C030 | Remove the temporary watcher policy-repair allowance on main only after the case fits the default with margin. | slice 13 | G1 |
| C031 | Remove the temporary retired-closure allowance on main only after the case fits the default with margin. | slice 13 | G1 |
| C032 | Preserve every distinct behavioral promise at an observable boundary. | slice 13 | G1 |
| C033 | Establish surviving proof before deleting a test. | slice 13 | observed: Original survivor-before-deletion chronology in closure-evidence.md/comparison-evidence.md; incoming-watcher-evidence.md retains lower6 passing before browser port-step relocation. |
| C034 | Establish surviving proof before deleting a step. | slice 13 | observed: Closure survivor chronology in closure-evidence.md and current lower6 before occupied-port step relocation in incoming-watcher-evidence.md; distinct C/D/SIGHUP actions remain. |
| C035 | Establish surviving proof before deleting an assertion. | slice 13 | observed: Source-only137 mapping, closure/comparison evidence and current watcher lower6 before overlapping browser assertion relocation; incoming-watcher-evidence.md. |
| C036 | Cut repeated setup. | slice 13 | observed: source-ingestion-evidence.md paired complete snapshot commands and final-source-evidence.md actual closed-profile cold preparation reduction; no persistent source cache. |
| C037 | Cut redundant proof. | slice 13 | observed: closure-evidence.md real retired StoryBranch survivor plus installed CLI/HTTP/store recovery; incoming-watcher-evidence.md lower selection/rollback survival before redundant deployment steps. |
| C038 | Make the watcher family at least 10 s faster in median elapsed time, including moved work. | slice 4 | observed: Original matched three alternating32/31 commands preserve full cold work: shell medians156.893714 to136.400577 save20.493137s; source-ingestion-evidence.md. Current reconciled boundary31 includes moved lower/native proof and passes three times, shell median141.215330 (raw15.678384 below original32, power/load/date/cache qualified), incoming-watcher-evidence.md. No precise new causal saving claimed. |
| C039 | Keep the comparable local dashboard suite within its previous elapsed time. | slice 13 | G2 |
| C040 | Keep the slowest hosted shard within its previous elapsed time. | slice 13 | G3 |
| C041 | Consolidate the failure watcher journey onto one real deployment. | slice 3 | observed: production-watcher-failures.spec.ts: unavailable/recovered origin checks retain the original served C PID/page; no watcher/served reassignment before D failure. Three whole-family after runs passed31/31. |
| C042 | Prove that an unavailable origin leaves C serving. | slice 3 | observed: production-watcher-failures.spec.ts: unavailable origin emits ls-remote failure, exact Keeping C/address, and expectStillServing checks real C PID plus WORKING C page. |
| C043 | Prove that checks resume after the origin returns. | slice 3 | observed: production-watcher-failures.spec.ts: restore the same origin path, observe watcher.checks increase, reobserve live C, then actual D publication is read and attempted. |
| C044 | Continue into the failed candidate on that same live deployment. | slice 3 | observed: production-watcher-failures.spec.ts: after recovered-origin live C, publish D on the same watcher; appended output names actual D failure and absence of D activation. |
| C045 | Continue into the failed restoration on that same live deployment. | slice 3 | observed: production-watcher-failures.spec.ts: same live-C chain faults D and C restoration, observes restoring exact servedCommit also failed, exact2 fresh causes, exit1 and cleanup. |
| C046 | Move the real SIGHUP to the existing restart journey. | slice 3 | observed: production-watcher.spec.ts: existing stop case sends watcher.signal(SIGHUP), then awaits natural watcher.exited before stop. |
| C047 | Move its quiet-exit assertions to that restart journey. | slice 3 | observed: production-watcher.spec.ts: natural SIGHUP exit requires no Production dashboard could not run message before group retirement. |
| C048 | Move its cleanup assertions to that restart journey. | slice 3 | observed: production-watcher.spec.ts: SIGHUP case retains expectProductionEnded: served PID dead, HTTP unavailable and deployment directory empty. |
| C049 | Keep the restart journey restarting from current main. | slice 3 | observed: production-watcher.spec.ts: restart publishes Document restart, productionActivation requires its exact current SHA; output excludes pinned/next and checkout list equals current. |
| C050 | Keep the restart journey serving the expected page. | slice 3 | observed: production-watcher.spec.ts: restarted page title NEXT MAIN and source marker PINNED SOURCE remain independently observed alongside current-revision checks. |
| C051 | Preserve the same runner across restart. | slice 3 | observed: production-watcher.spec.ts: runner count1, address PID equals original runner, original process group remains separate from new preview after restart. |
| C052 | Preserve the same client across restart. | slice 3 | observed: production-watcher.spec.ts: attaches length1 and attached PID equals the original real held client after replacement and restart. |
| C053 | Accept input after restart. | slice 3 | observed: production-watcher.spec.ts: follow the saved session on restarted URL, send after-restart, observe it in cursor.input(original client PID). |
| C054 | Keep the active-build SIGTERM proof. | slice 3 | observed: productionUpdateJourney.ts: productionUpdateShutdown holds the actual next build by ordinal, observes its real PID, sends stop/SIGTERM and checks build/preview/deployment cleanup plus unchanged records/configuration; selected in every whole-family pass. |
| C055 | Keep the final SIGINT proof. | slice 3 | observed: production-watcher.spec.ts: final restart case signals SIGINT, awaits exited, checks quiet output and expectProductionEnded. |
| C056 | Keep both fatal preview outcomes. | slice 3 | observed: production-watcher-failures.spec.ts: failed D plus failed C restoration reports both exact causes/exit1; subsequent unexpected-preview SIGKILL reports its distinct fatal message/exit1. |
| C057 | Keep their cleanup. | slice 3 | observed: production-watcher-failures.spec.ts: both fatal-preview tests invoke expectProductionEnded for dead preview, unavailable HTTP and empty deployment directories. |
| C058 | Prove that the relocated check detects a watcher ignoring SIGHUP. | slice 3 | observed: Actual scratch no-op SIGHUP handler held natural exited for full30s; raw trace shows first case expectation only after post-timeout scratch SIGTERM. Root inspected ignored-hup-test.trace.json and interpretation at /tmp/seed287-watcher-20261110. |
| C059 | Prove that the restart check detects use of the previously served revision. | slice 3 | observed: Actual scratch resolvePublishedMain returned Document restart parent; original exact-current productionActivation rejected the actually served prior revision. Patch/log/trace retained under /tmp/seed287-watcher-20261110/stale-restart-artifacts. |
| C060 | Delete the standalone C reactivation only after the preceding preservation and detection obligations are established. | slice 3 | observed: production-watcher-failures.spec.ts: standalone post-hangup C-reactivation test deleted after relocated positive7/7 and both actual runtime faults; three whole-family after runs passed31 rather than32 cases. |
| C061 | Remove that standalone reactivation’s real install. | slice 3 | observed: production-watcher-failures.spec.ts: removed standalone startProductionWatcher/shownActivation for C, eliminating its real npm install while retaining original retry/restoration activations. |
| C062 | Remove that standalone reactivation’s real build. | slice 3 | observed: production-watcher-failures.spec.ts: removed standalone C activation eliminates its real Vite build; no prebuilt or substitute deployment added. |
| C063 | Remove that standalone reactivation’s real start. | slice 3 | observed: production-watcher-failures.spec.ts: removed standalone C activation eliminates its repeated real preview start; live C continues into D restoration failure. |
| C064 | Keep one full retired-closure journey. | slice 5 | observed: One combined retired StoryBranch retry/Done journey remains in agent-completion-quiet; separate Land/Trunk closure paths retained, duplicate browser recovery removed after survivors passed. |
| C065 | Preserve its proof of real Git worktree retirement. | slice 5 | observed: withInstalledCompletionClosure actual installed publication/integration/CI closure and worktree-retirement command observes remote main==final and workspace absent before StoryBranch callback; no retirement result planted. |
| C066 | Preserve its proof of installed reporting retry. | slice 5 | observed: After actual StoryBranch retirement, initial-server EIO consumes marker and installed completed report retains exact pending retry; that installed --retry runs from surviving origin.machine and returns durable receipt/Done. |
| C067 | Prove that the reporting retry does not repeat Git operations. | slice 5 | observed: countedGit proofEnv logs actual push and worktree remove before reporting; after failed submission, installed retry and duplicate retry, complete Git log bytes equal pre-report snapshot. |
| C068 | Prove that the reporting retry does not repeat native operations. | slice 5 | observed: Quiet StoryBranch observes no start/resume/interrupt, exactly1 native rename after reporting; duplicate installed retry returns same receipt and adds no rename/control operation. Distinct Trunk rename-refusal retry preserved. |
| C069 | Preserve visible Done. | slice 5 | observed: Same actual retired StoryBranch retry journey publishes final history and renders RecentlyDone/Done, native-working cue, no attention message, independent thread/read(includeTurns) final answer, and Done after reload. |
| C070 | Reuse the existing Story Branch Wrap Up journey where it can carry this proof. | slice 5 | observed: Existing StoryBranch WrapUp variant of agent-completion-quiet now carries actual retired/installretry/Git-native-idempotence/visibleDone together; it fit default30 in all focused passes. |
| C071 | Retain the different Land path. | slice 5 | observed: Existing Land variant retains its distinct actual installed retirement path and quiet reporting/native/UI observations in all3 full14-case passes and refactor4-case pass. |
| C072 | Retain the different Trunk Wrap Up path. | slice 5 | observed: Existing TrunkWrapUp variant retains its distinct installed trunk closure/retirement, refused native rename recovery and quiet/native/UI observations in all3 full14-case passes and refactor4-case pass. |
| C073 | Unavailable receiver. | slice 5 | observed: Tracked backend quiet-closure actually closes receiver; unacknowledgedCompletion runs installed CLI, fails withoutstdout and retains exact pending/message/retry guidance while Done remains absent. |
| C074 | Lost acknowledgement. | slice 5 | observed: Real proxy drops acknowledgement only after receiver persisted; helper observes failed child/no stdout, lost1, durable delivery/Done and same receipt through installed retry/concurrent duplicates. |
| C075 | Failed writes. | slice 5 | observed: Actual fs tmp-write EIO is consumed; failed CLI leaves completion/Done absent at backend, and full retired StoryBranch preserves previous kept completion/noDone. No expected report outcome planted. |
| C076 | Concurrent writers. | slice 5 | observed: Actual concurrent bindRecord/updateRecord after reserved-unapplied receipt do not import completion/Done; lostack races update and preserves exact Concurrent native evidence firstInput alongside durable receipt. |
| C077 | Reserved receipt isolation. | slice 5 | observed: completionRecoveryFaults observes actual reserved EIO receipt before late bind/update writers; stored completion/Done stay absent until real reporting recovery applies it. Existing identity/binding race owners also passed. |
| C078 | Message recovery after source deletion. | slice 5 | observed: Installed message submissions lose ack after persistence; original message files are deleted, then actual pending retries recover independent exact text/outcome. Covers newer attention and unfinished after manualDone. |
| C079 | A stale receipt preserves newer Done across restart. | slice 5 | observed: Backend quiet-closure restarts the actual receiver, then the original retained producer payload over HTTP returns its old receipt while preserving newer automatic Done. Fresh CLI deliveries, file recovery, concurrent CLI duplicates and final original installed retry after the second restart remain. Repaired backend1/1 and unchanged real retirement UI3/3 pass; final-validation-evidence.md retains the boundary change and pressure renewal owner13. |
| C080 | A stale receipt preserves manual Done across restart. | slice 5 | observed: Actual markDoneHTTP creates manualDone; fresh unfinished lostack/source-delete/retry preserves it; second real sameport receiverrestart plus originalretry preserves manualDone and latest heldreceipt/message. |
| C081 | Altered payload refusal. | slice 5 | observed: RawHTTP uses actual saved old submission UUID/reference with altered message and no payload origin; actual receiver returns409. |
| C082 | Post-deletion rejection. | slice 5 | observed: After real deleteRecord, original installed retry fails/no stdout, bindRecord rejects deleted reporting session, and persisted records length0. |
| C083 | Identify checks that already prove the recovery promises. | slice 5 | observed: Inspected and ran whole quiet-closure, identity, superseded, binding, early-recovery and attention owners with concrete request/store/native/UI expectations; unchanged helpers were reused, all250 consumer dispositions checked. |
| C084 | Add missing proof at the existing boundary. | slice 5 | observed: Missing EIO/concurrent/reserved/source-delete/stale-Done-restart/altered/postdelete variants now execute at existing real tracked CLI/HTTP/store boundary; successful receipts/Done come from actual actions, not setup. |
| C085 | Remove covered browser steps after identifying and completing the surviving boundary proof. | slice 5 | observed: First strict14-case pass established survivors before old recovery deletion; same14 passed twice afterward. Quiet/attention retain actual Done/message/markread/finalreport/manualDone/collapsedunfinished UI; lowlevel faults observed in durable store. |
| C086 | Wait for persisted collector results before comparing history reads. | slice 2 | observed: dashboard/backend-tests/intent/landed-ci-history-lifecycle.spec.ts persisted run43 summary and run41 unavailable proof before equal reads; gaps stops collector; three strict focused passes in execution-evidence.md |
| C087 | Let the first request finish before counting requests for a revisit. | slice 2 | observed: dashboard/tests/intent/intent-ci-proof-ancestor.spec.ts completed trunk/story proof and fresh revisit judgment precede counts; three strict focused passes in execution-evidence.md |
| C088 | Wait for the selected story to render before checking its state. | slice 2 | observed: dashboard/tests/intent/intent-ci-status-story.spec.ts and story-gaps selected heading/title precede state; ad hoc selected identity/title guarded; three strict passes in execution-evidence.md |
| C089 | Keep exact counts where avoiding duplicate work is the promise. | slice 13 | G19 |
| C090 | Inspect siblings sharing each affected setup. | slice 13 | G19 |
| C091 | Use the landed fixes as examples. | slice 2 | observed: Current guards checked against ad581992a, f1a992a75, fa274447d and ancestor f97907d27 repair patterns; execution-evidence.md |
| C092 | Make the landed CI repeat-admission cases hold their 5 s observations at local load 20–30 on 2 workers. | slice 13 | G19 |
| C093 | Keep those cases’ assertions. | slice 13 | G19 |
| C094 | Have the five cases of `landed-ci-repeat-admission.spec.ts` pass in three consecutive runs under those local conditions, retaining their 5 s observations. | slice 13 | G19 |
| E001 | The touch example is “chooses a comparison and file and reads within each pane”; its 2026-11-09 allowance is to be removed after it fits. | slice 6 | observed: story-review-touch.spec.ts removes60s allowance after fit; touch-evidence.md three actual default30s passes at load20.629–25.571, every case16.508–23.085s |
| E002 | The named overdue cases previously timed out or missed a 5 s observation; their outcome covers both kinds of deadline. | slice 13 | G1 |
| E003 | In repeat admission, “an unspent eligible receipt disabled while original jobs are unavailable stays old on re-enable” polls for a card or collected history for 5 s after the receipt. It missed the observation in both cited unchanged-main runs. | slice 13 | G19 |
| E004 | “eligible105-second receipt prepared before enablement stays old after acceptance” has the same described observation window. It missed in one of those runs. | slice 13 | G19 |
| E005 | “an otherwise eligible receipt for Taken work does not authorize a Done follow-up” missed a 5 s history poll once beside a scratch fixture change, and in no cited main run. | slice 13 | G19 |
| E006 | `landed-ci-history-no-proof-recovery.spec.ts:36` also missed once beside that scratch fixture change, and in no cited main run. | slice 13 | G19 |
| C095 | Use MakeMe for domain data. | slice 13 | G19 |
| C096 | Synchronize on observable events **or** a controlled clock. These are alternatives. | slice 13 | G19 |
| C097 | Refresh existing shard weights after removing work. | slice 13 | G11 |
| C098 | Use all 12 artifacts of a complete passing trunk run for that refresh. | slice 13 | G11 |
| C099 | Measure shard redistribution separately from summed test durations. | slice 13 | G11 |
| C100 | Keep the project default case timeout. | slice 13 | observed: dashboard/playwright.config.ts default30 is unchanged; current scoped whole68 and thin normal3x7 run default cases, no added timeout override. |
| C101 | Keep shard deadlines. | slice 13 | observed: Branch CI workflow deadlines remain320s shard/six-minute job. Incoming separately approved13-shard context retains those ceilings; hosted-evidence.md. |
| C102 | Do not permanently raise deadlines for these journeys. | slice 13 | G1 |
| C103 | Do not use sleeps to absorb load variance. | slice 13 | G19 |
| C104 | Do not use retries to absorb load variance. | slice 13 | G19 |
| C105 | Do not use skips to absorb load variance. | slice 13 | G1 |
| C106 | Do not use permanent CI jobs to absorb load variance. | slice 13 | observed: This branch CI workflow/job count is unchanged. Separately Terry-approved incoming13-shard decision is explicitly attributed in hosted-evidence.md, with redistribution held for G11. |
| C107 | Treat flaky or environment-dependent timeouts as defects until stable locally and in CI, under the referenced project policy. | slice 13 | G1 |
| C108 | Every retained change preserves its proof. | slice 13 | G1 |
| C109 | Every retained change measurably widens the affected cases’ margin. | slice 13 | G7 |
| C110 | Remove a case allowance only after the case fits the default with margin. | slice 13 | G1 |
| C111 | Drop experiments that add cost. | slice 13 | observed: Rejected full-dashboard config-loader/SDK-bridge experiment restored package.json/startLaunch.ts exactly to HEAD; failed costs retained in final-source/final-validation evidence. Renderer-only rewrite was rejected after diagnostic attribution. |
| C112 | Drop experiments that leave their proof unestablished. | slice 13 | G7 |
| C113 | Drop experiments that leave their speedup unestablished. | slice 13 | G7 |
| C114 | Compare focused before-and-after runs using the same selection. | slice 4 | observed: source-ingestion-evidence.md: original alternating whole-family32/31 commands use the same family selection, two workers and cold cache conditions at comparable load; entire shell elapsed includes moved SIGHUP, hooks, native/build/private-clone work. Current reconciled evidence is qualified separately in incoming-watcher-evidence.md. |
| C115 | Use the same workers in that comparison. | slice 4 | observed: source-ingestion-evidence.md: original alternating whole-family32/31 commands use the same family selection, two workers and cold cache conditions at comparable load; entire shell elapsed includes moved SIGHUP, hooks, native/build/private-clone work. Current reconciled evidence is qualified separately in incoming-watcher-evidence.md. |
| C116 | Use the same cache conditions. | slice 4 | observed: source-ingestion-evidence.md: original alternating whole-family32/31 commands use the same family selection, two workers and cold cache conditions at comparable load; entire shell elapsed includes moved SIGHUP, hooks, native/build/private-clone work. Current reconciled evidence is qualified separately in incoming-watcher-evidence.md. |
| C117 | Use comparable load. | slice 4 | observed: source-ingestion-evidence.md: original alternating whole-family32/31 commands use the same family selection, two workers and cold cache conditions at comparable load; entire shell elapsed includes moved SIGHUP, hooks, native/build/private-clone work. Current reconciled evidence is qualified separately in incoming-watcher-evidence.md. |
| C118 | Include replacement proof in the family measurement. | slice 4 | observed: source-ingestion-evidence.md: original alternating whole-family32/31 commands use the same family selection, two workers and cold cache conditions at comparable load; entire shell elapsed includes moved SIGHUP, hooks, native/build/private-clone work. Current reconciled evidence is qualified separately in incoming-watcher-evidence.md. |
| C119 | Check three consecutive focused passes for changed synchronization. | slice 13 | G19 |
| C120 | Then use the existing local gates. | slice 13 | G2 |
| C121 | Then use the existing hosted gates. | slice 13 | G3 |
| C122 | On macOS, run the full local gate from an awake machine. | slice 13 | G2 |
| C123 | Run that macOS gate on AC. | slice 13 | G2 |
| C124 | Use `caffeinate -s -i` under the maintained sleep guard. | slice 13 | G2 |
| C125 | Check the slowest hosted shard separately from summed test durations. | slice 13 | G3 |
| C126 | Check local full-suite elapsed time separately from summed test durations. | slice 13 | G2 |
| C127 | Recheck which costs from the 2026-11-09 diagnosis still occur before choosing another experiment. | slice 13 | G19 |
| C128 | Avoid repeating start-origin preparation. | slice 4 | observed: source-ingestion-evidence.md/final-source-evidence.md: one immutable first-demand source artifact is reused for private no-hardlink fixtures within the run; cold preparation remains in complete-command elapsed, no persistent cache. |
| C129 | Avoid repeating app-build preparation. | slice 4 | observed: source-ingestion-evidence.md/final-source-evidence.md: one immutable first-demand source artifact is reused for private no-hardlink fixtures within the run; cold preparation remains in complete-command elapsed, no persistent cache. |
| C130 | Include work moved outside the first case’s 30 s in suite elapsed measurement. | slice 13 | G2 |
| C131 | Answer fake Actions branch tips without a synchronous `git rev-parse` per answer. | slice 11 | observed: transport-evidence.md and ci-repair-evidence.md: shell/curl FD3 client removes per-answer Node/Git startup while preserving actual CLI auth/hold/pid/signal/gone-fake contracts; paired whole-client timings and 407+46 unit/CLI consumers retained. |
| C132 | Make fake `gh` calls cheaper. | slice 11 | observed: transport-evidence.md and ci-repair-evidence.md: shell/curl FD3 client removes per-answer Node/Git startup while preserving actual CLI auth/hold/pid/signal/gone-fake contracts; paired whole-client timings and 407+46 unit/CLI consumers retained. |
| C133 | Keep fake `gh` auth behavior. | slice 11 | observed: transport-evidence.md and ci-repair-evidence.md: shell/curl FD3 client removes per-answer Node/Git startup while preserving actual CLI auth/hold/pid/signal/gone-fake contracts; paired whole-client timings and 407+46 unit/CLI consumers retained. |
| C134 | Keep fake `gh` hold behavior. | slice 11 | observed: transport-evidence.md and ci-repair-evidence.md: shell/curl FD3 client removes per-answer Node/Git startup while preserving actual CLI auth/hold/pid/signal/gone-fake contracts; paired whole-client timings and 407+46 unit/CLI consumers retained. |
| C135 | Keep fake `gh` pid behavior. | slice 11 | observed: transport-evidence.md and ci-repair-evidence.md: shell/curl FD3 client removes per-answer Node/Git startup while preserving actual CLI auth/hold/pid/signal/gone-fake contracts; paired whole-client timings and 407+46 unit/CLI consumers retained. |
| C136 | Keep fake `gh` signal behavior. | slice 11 | observed: transport-evidence.md and ci-repair-evidence.md: shell/curl FD3 client removes per-answer Node/Git startup while preserving actual CLI auth/hold/pid/signal/gone-fake contracts; paired whole-client timings and 407+46 unit/CLI consumers retained. |
| C137 | Keep gone-fake behavior. | slice 11 | observed: transport-evidence.md and ci-repair-evidence.md: shell/curl FD3 client removes per-answer Node/Git startup while preserving actual CLI auth/hold/pid/signal/gone-fake contracts; paired whole-client timings and 407+46 unit/CLI consumers retained. |
| C138 | Check whether the hosted fixture’s roughly 66 sequential Git commands also affect in-scope cases. | slice 12 | observed: comparison-evidence.md/final-validation-evidence.md: canonical704-file comparison and actual CLI/Git preparation were inspected before selecting the thin Sort fixture; exact loops/source assertions survive, and qualified timing/consumer evidence is retained. |
| C139 | Cut the touch review journey’s gesture cost. | slice 6 | observed: touch-evidence.md: canonical four-column MakeMe fixture removes artificial 3000px padding while preserving real phone/tablet file/selection/reading/context/rotation gestures; independent desktop consumers and four loaded cases retained. |
| C140 | Preserve its reading proof. | slice 6 | observed: touch-evidence.md: canonical four-column MakeMe fixture removes artificial 3000px padding while preserving real phone/tablet file/selection/reading/context/rotation gestures; independent desktop consumers and four loaded cases retained. |
| X001 | The Intent CI comparison family belongs to `SEED-286#fast-intent-ci-comparison-tests`. | slice 13 | observed: Intent CI comparison membership remains SEED286; only owned failing whole-suite Sort/source proof and implicated shared harness reach are repaired, preserving exact704/loops/CLI. |
| X002 | Infrastructure acquisition is outside scope. | slice 13 | observed: No infrastructure acquisition or new branch CI resources. Current physical AC restoration is a measurement condition, not infrastructure work. |
| X003 | Unrelated branch defects are outside scope. | slice 13 | observed: No proactive unrelated branch repair; applicable local/published failures remain owned under the written AGENTS failure policy. |
| X004 | The separate collector lock repair is outside scope. | slice 13 | observed: No separate collector-lock implementation in this increment; current changes address named timing/settlement/source/watcher boundaries. |
| X005 | Other unnamed case-local allowances remain outside scope unless a harness change made by this story must keep those cases green. | slice 13 | observed: Unnamed allowances remain outside except actual necessary shared-harness consumers; final-observation-evidence.md retains outside-scoped larger options explicitly. |
| X006 | Recently-done ad-hoc session journeys are an explicit example of X005. | slice 13 | observed: Recently-done ad-hoc allowances are unchanged; only necessary affected consumers are checked, not a new allowance-removal scope. |
| X007 | Intent timing-history journeys are another explicit example of X005. | slice 13 | observed: Intent timing-history allowances are unchanged. Incoming scope-history product paths remain preserved for actual trunk reconciliation. |
| X008 | Causal attribution of every remaining CI flake beyond the named patterns is outside scope once the named journeys fit. | slice 13 | G1 |
| X009 | Automatic-repeat specs belong to SEED-314. | slice 13 | G19 |
| X010 | Verdict specs belong to SEED-314. | slice 13 | G19 |
| X011 | An Intent CI comparison timeout is not claimed as solved here. | slice 13 | observed: Intent CI comparison membership remains SEED286; only owned failing whole-suite Sort/source proof and implicated shared harness reach are repaired, preserving exact704/loops/CLI. |
| X012 | A collector lock failure is not claimed as solved by this margin work. | slice 13 | observed: No claim that current margin/settlement changes solve the separate collector-lock failure. |
| X013 | An infrastructure setup failure is not claimed as solved by this margin work. | slice 13 | observed: No claim that current margin changes solve an infrastructure setup failure. |
