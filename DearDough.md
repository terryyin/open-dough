# DearDough Process Findings

Shared occurrence evidence and response history live in the linked
[catalog](docs/maintainer/finding-names.md). [Project findings](ProjectFindings.md)
retain local facets. The full source before this compaction is
`cf1ea1debbd50eac9cfe73a2e6a6782597764fdf:DearDough.md`. Earlier source recovery is in that revision.

## Retention

- Highest allocated local number: 488. Removed numbers are never reused.
- Recovery: `220026a4e1b8409ffa81f50cd8e3130945ff8472:DearDough.md` holds the full source before the 2026-11-10 compaction; its occurrences are retained at the linked findings, including rows removed earlier at `ecb5ddd89` and `f184ecd2b`. DD-462 and Doughnut's DD-443 were pruned as successful practice; DD-462 is cited at the scope watch.
- Recovery: `c0e3574f02300414ddb4d3b5688ba7d5a4b72fdf:DearDough.md` holds the pre-integration SEED-285 review and its ODF-329 retention choice; its additional ODF-322 occurrence and DD-481 are retained below.
- Recovery: `e155eb11b71a410f93793a889b3c713aa9691272:DearDough.md` preserves the ODF-074 SEED-286 analyzer-endpoint occurrence pruned during SEED-298 integration; current required-preview/CI repair evidence was retained over this already-corrected observation that caused no additional test run.
- Recovery: `53fd020780ae447e7ee00363e2ab49a9f055f2f0:DearDough.md` holds DD-483 before this SEED-278 ODF-154 occurrence retention prune.
- Recovery: `a0357d569ac3bd2fc4d866d511fdf354963881bc:DearDough.md` preserves the catalog-only ODF-238/253/262/263 stubs removed to retain current ODF-329/396 recurrence evidence; their meaning/evidence remain in the maintained finding catalog.
- Recovery: `536dcf13218bae15339ffbd1288464649940047e:DearDough.md` preserves DD-487, removed to retain the recurring DD-488 publication defect and ODF-264 context-loss evidence; DD-487 was a disclosed plan-local trial confound with no shipped defect.
- Occurrence history is partial.

## ODF-087 — Skipped preparation gates <a id="odf-087"></a>

Former local code: DD-089. [Evidence and current response](docs/maintainer/findings/ODF-087.md).

## ODF-059 — Interrupted agent handoffs <a id="odf-059"></a>

Former local code: DD-057. [Meaning, evidence and response](docs/maintainer/findings/ODF-059.md).

## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. [Evidence and current response](docs/maintainer/findings/ODF-154.md).

### Occurrences

- Execution: SEED-278#dashboard-dark-theme (plan 578; first related implementation `53fd020780ae447e7ee00363e2ab49a9f055f2f0`)
  - Timestamp: 2026-11-10T14:30:36.369Z
  - Tool: Cursor
  - Open Dough release: 0.3.94
  - Evidence: Deliver receipt in terminal `818682.txt` for accepted `53fd020780ae447e7ee00363e2ab49a9f055f2f0` on `refs/heads/cursor/give-the-dashboard-a-dark-theme`: `observation.state: unobserved`, `pendingCi: unobserved`, reason `Cursor conversation identity is unavailable: CURSOR_CONVERSATION_ID is unset and no --session-json was supplied…`; deliver `--session-json` carried only `observerDirectory` `/tmp/dough-ci-501/watch-prFFAc`. Coordinator transcript `4df873ee-74e0-4b1a-bd17-30a37a4c6a18` started that observer before deliver.
  - Observed effect: Publication accepted; hosted CI coverage for the increment stayed unobserved/unidentified despite a started observer directory.
  - Inference: Post-release recurrence of missing Cursor conversation identity. Native verification of ODF-154 proved the identity path when `CURSOR_CONVERSATION_ID` is set; this coordinator Shell left it unset and did not pass `conversation_id` in `--session-json`. Distinct from a failed released deliver-path when the ID is present.

## ODF-074 — Unverified planning premises <a id="odf-074"></a>

Former local code: DD-450. Former local code: DD-470 (plan 533 only). Former local code: DD-121. Former local code: DD-206. Former local code: DD-238. Former local code: DD-271. Former local code: DD-285. Former local code: DD-307. Former local code: DD-400. Former local code: DD-393 (`6c354905e`), renumbered in merge `966aad8b1`. DD-400's facet: a decisive premise probe proved the capability, not the story's restriction it settled. [Meaning, evidence and response](docs/maintainer/findings/ODF-074.md).

## ODF-110 — Incomplete readiness replays <a id="odf-110"></a>

Former local code: DD-124. Former local code: DD-213. Former local code: DD-228. Former local code: DD-274. Former local code: DD-282. Former local code: DD-284. [Evidence and current response](docs/maintainer/findings/ODF-110.md).

## ODF-157 — Identifier-only conceptual searches <a id="odf-157"></a>

Former local code: DD-127. [Evidence and current response](docs/maintainer/findings/ODF-157.md).

## ODF-158 — Disproportionate required reference reads <a id="odf-158"></a>

Former local code: DD-128. [Evidence and current response](docs/maintainer/findings/ODF-158.md).

## ODF-106 — Colliding plan numbers <a id="odf-106"></a>

Former local code: DD-155. [Meaning, evidence and response](docs/maintainer/findings/ODF-106.md).

## ODF-141 — Fixed refactor cost on small accepted slices <a id="odf-141"></a>

Former local code: DD-192. [Meaning, evidence and response](docs/maintainer/findings/ODF-141.md).

## ODF-204 — Interrupted delegated agent keeps running and publishes <a id="odf-204"></a>

Former local code: DD-215. [Evidence and current response](docs/maintainer/findings/ODF-204.md).

## ODF-205 — Execution starts on a red trunk unannounced <a id="odf-205"></a>

Former local code: DD-217. [Evidence and current response](docs/maintainer/findings/ODF-205.md).

## ODF-152 — File-size gate conflicts with approved intermediate scope <a id="odf-152"></a>

Former local code: DD-219. Former local code: DD-478 (SEED-284 plan 552 only). [Evidence and current response](docs/maintainer/findings/ODF-152.md).

## ODF-209 — Concurrent CI reproduction overloads slice proof <a id="odf-209"></a>

Former local code: DD-221. [Meaning, evidence and response](docs/maintainer/findings/ODF-209.md).

## ODF-210 — Removal proof omits an existing user capability <a id="odf-210"></a>

Former local code: DD-234. [Evidence and current response](docs/maintainer/findings/ODF-210.md).

## ODF-211 — Admission is ambiguous for an unlanded story correction <a id="odf-211"></a>

Former local code: DD-237. [Evidence and current response](docs/maintainer/findings/ODF-211.md).

## ODF-217 — Unverified refactor proof effects <a id="odf-217"></a>

Former local code: DD-239. Former local code: DD-248. Former local code: DD-450 (private fixture branch only, `a8cc402fd`). [Evidence and current response](docs/maintainer/findings/ODF-217.md).

## ODF-218 — Formatting invalidates a pre-format size check <a id="odf-218"></a>

Former local code: DD-241. [Evidence and current response](docs/maintainer/findings/ODF-218.md).

## ODF-219 — Background coordinator implements outside the local-slice condition <a id="odf-219"></a>

Former local code: DD-245. [Evidence and current response](docs/maintainer/findings/ODF-219.md).

## ODF-100 — Masked formatter failure <a id="odf-100"></a>

Former local code: DD-251 (plans 264 and 271 only). [Meaning, evidence and response](docs/maintainer/findings/ODF-100.md).

## ODF-097 — Publishing after a failed check <a id="odf-097"></a>

Former local code: DD-251 (plan 273 only). [Evidence and current response](docs/maintainer/findings/ODF-097.md).

## ODF-222 — Post-commit managed delivery stalls at an unknown stage <a id="odf-222"></a>

Former local code: DD-253 (Cursor plan 273 only). [Evidence and current response](docs/maintainer/findings/ODF-222.md).

## ODF-184 — Unbounded Git transport stalls managed delivery <a id="odf-184"></a>

Former local code: DD-253 (Claude Code plan 274 only). [Evidence and current response](docs/maintainer/findings/ODF-184.md).

## ODF-220 — Code-level planning findings become stale on trunk <a id="odf-220"></a>

Former local code: DD-254. [Evidence and current response](docs/maintainer/findings/ODF-220.md).

## ODF-221 — CI repair misses a sibling with the diagnosed cause <a id="odf-221"></a>

Former local code: DD-255. [Evidence and current response](docs/maintainer/findings/ODF-221.md).

## ODF-224 — Native replay changes the retained acceptance checkpoint <a id="odf-224"></a>

Former local code: DD-258. [Evidence and current response](docs/maintainer/findings/ODF-224.md).

## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>

Former local code: DD-259. [Meaning, evidence and response](docs/maintainer/findings/ODF-150.md).

### Occurrences

- Execution: SEED-289#name-a-test-job-past-its-deadline (plan 563; first implementation `15ebf14d3dba2c231ec7a6269364121ba21e9ea5`)
  - Timestamp: 2026-11-10T00:28:28Z
  - Tool: Cursor
  - Open Dough release: 0.3.92 (installed `.agents/skills/dough-update/VERSION`)
  - Evidence: Slice 1 `15ebf14d` made `native-run-supervise.sh` / `native-run-watchdog.sh` source `scripts/owned-process-group.bash` and listed that path in `native_run_supervision_inputs`, but identity/admission harness trees still copied without `scripts/`. CI run 42727924512 failed `tests/support/native-admission-reuse.test.mjs` (`…/scripts/owned-process-group.bash: No such file or directory`). Repair `e985d394` added `tests/support/native-supervision-inputs.mjs` and materializes uncovered supervision roots into those trees.
  - Observed effect: One owned CI failure and repair commit before slice 2 could finish; coordinator stashed then restored in-flight slice 2 work around the repair.
  - Inference: Harness trees that materialize supervision inputs are callers of the supervision-input contract. Extending that list needs those materializers in the same proof set; a focused deadline suite alone cannot see them. Distinct from ODF-225: the stash parked uncommitted next-slice work; no invalidated still-running proof was recorded.
- Execution: SEED-288#reuse-adapter-equivalent-timing (plan 565; first related implementation `dfc059a11daa8b175577b5f42ac67f442446ecb5`)
  - Timestamp: 2026-11-10T09:41:14+08:00
  - Tool: Cursor
  - Open Dough release: 0.3.94
  - Evidence: CI repair `9a6fd5e2e3ffbfebbd6b8614f90f28b96a81a1f9` changed `dashboard/server/landedCiCollectedProof.ts` so settled GitHub `none` was no longer collectable (`proofPending: false`) to stop history re-asks after slice 1. Focused repair proof centered on `landed-ci-history-collection.spec.ts` (coordinator brief run 42734721396). Ancestor CI run 42737573329 failed `landed-ci-scope-proof-recovery.spec.ts` (`an exact passed attempt resumes none proof in the same collector`). Repair `53709f0253613421426c8abb2354879299e2c4fa` restored `none` collectability/pending while keeping same-write `proofRetainedWith`. Coordinator transcript `dc823cbc-021e-44e2-89e0-059fef36d090` L64–L88.
  - Observed effect: one owned CI failure on the repaired SHA and a second repair before applicable tip CI settled; exact-attempt `none`→summary recovery was broken until `53709f025`.
  - Inference: Matches ODF-150 — repair proof followed the history-collection symptom and missed an existing consumer of the same collectability rule. Distinct from ODF-221 sibling-spec race search: the missed journey owns a different product contract (scope-proof recovery), not the same race in a sibling of the failing history-collection assertion.
- Execution: SEED-261#map-github-actions-ci-test-data (plan 553; first related implementation `d9b19d637500c73d39b25d8a7959e939ff65aeec`)
  - Timestamp: 2026-11-10T08:18:35Z
  - Tool: Cursor
  - Open Dough release: 0.3.94 (installed `.agents/skills/dough-update/VERSION`)
  - Evidence: Slice 1 published shared `githubCiRunFacts` / `aCiRun` / `aRevisionCiRun` construction (`d9b19d637`) while plan required shared-seam callers stay compatible and traced even when conversion was later. Accepted slice-1 focused proof named status/nearest/proof selections, not `backend-tests/intent/ci-comparison-taken.spec.ts`. Hosted run 42781560636 job dashboard (7/12) failed that spec at line 106 (`startedAt` expected `2026-11-09T00:00:00Z`, received `2026-11-09T00:00:00.000Z`). Slice 2 `eb4e66109` aligned `createdAt`↔`startedAt` in `githubCiRunFacts` before a dedicated repair commit; coordinator later proved the case green at HEAD. Same run's production-watcher timeout is separate SEED-287 ownership, not this row.
  - Observed effect: one owned CI failure on the slice-1 SHA from an unconverted comparison consumer of the shared run builder; no separate repair commit was required after slice 2 landed the alignment.
  - Inference: Matches ODF-150 — changing the shared MakeMe run construction reaches comparison `aRevisionCiRun` / taken-attempt consumers immediately; deferring their conversion does not defer their compatibility proof. Distinct from the production-watcher timeout on the same run and from ODF-225 stash invalidation (later OO4F1m stash parked unfinished slice 5 with no invalidated still-running proof).

- Execution: SEED-298#insert-common-prompts-in-the-dashboard-terminal (plan 574; first implementation `0e258a2f7441b8a253f54860f0b9e56ed56a984d`)
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: 0.3.94
  - Evidence: Original delivery added two dashboard specs without the pre-push shard preview required by `dashboard/tests/shards.md`. Final trunk CI run 42807295291, shard 4, hit its suite deadline after 371 passed tests; three cases never started. The maintained preview revealed 102 unrecorded specs. An unpublished refresh candidate used passing main run 42803799326; publication then found `f06b46597` had refreshed from a failed partial source. Reconciliation preserves its product changes and refreshes all 960 current specs from all twelve artifacts of its successful main run 42808747192, with exact-once selection. The two new specs were on shards 8/9, so they are not attributed as the direct failure cause.
  - Observed effect: one owned CI failure and a reconciled timing-record repair before closure; focused terminal proof missed the suite-discovery/allocation consumer. Shard 4 also had a broad 1.740 median slowdown; neither infrastructure nor the refresh as its sole cause was claimed. Final hosted margin remained a required CI gate before closure.

## ODF-225 — Repair stash invalidates a still-running proof <a id="odf-225"></a>

Former local code: DD-260. [Evidence and current response](docs/maintainer/findings/ODF-225.md).

## ODF-121 — Transient transport failure ends observation <a id="odf-121"></a>

Former local code: DD-261. [Meaning, evidence and response](docs/maintainer/findings/ODF-121.md).

## ODF-226 — Proof reporter override weakens the configured verdict <a id="odf-226"></a>

Former local code: DD-262. [Meaning, evidence and response](docs/maintainer/findings/ODF-226.md).

## ODF-227 — Repair delegation deletes the only regression proof <a id="odf-227"></a>

Former local code: DD-263. [Evidence and current response](docs/maintainer/findings/ODF-227.md).

## ODF-228 — Long proof starts without checking shared-host headroom <a id="odf-228"></a>

Former local code: DD-264. [Evidence and current response](docs/maintainer/findings/ODF-228.md).

## ODF-229 — Interrupted Cursor implementation loses its proof return <a id="odf-229"></a>

Former local code: DD-265. [Meaning, evidence and response](docs/maintainer/findings/ODF-229.md).

### Occurrences

- Execution: SEED-290#publish-frontend-test-proof (plan 567; first related implementation `85a494d276d277daeb205e9e7bfa0ea4a5a9c5c7`)
  - Timestamp: 2026-11-10T14:50:00+08:00
  - Tool: Cursor
  - Open Dough release: 0.3.94
  - Evidence: Coordinator transcript `0f1a429c-95c5-42c1-90f3-34dcc99a4615` L30–L40: first slice-1 Task `bbd17e64-071d-4489-a9dd-d70541ffa072` started 2026-11-10T10:41+08:00, explored CI proof surfaces with zero product edits, and never returned; after the developer's continue at 14:50+08:00 the coordinator recovered the interrupted delegation and launched replacement Task `d9a4a8e5-65a5-4920-b277-aba999c83366`, which delivered the product change. Checkout held only the coordinator's source-review files across the stall.
  - Observed effect: multi-hour wait with no agent return; one empty-tree interruption recovery and one replacement implementer before acceptance; no dual-writer conflict or unauthorized publish.
  - Inference: Matches ODF-229 empty-tree recurrence (interrupted Cursor implementation Task, no return, no product edits). Distinct from ODF-204 (no commit/push by the stalled agent) and ODF-059 (implementation Task, not a refactor handoff).
- Execution: SEED-258#finish-opted-in-stories-with-intent-coverage (plan 572; first related implementation `93f5b5bd8611cd1e529de025490fee4e8366b7b9`)
  - Timestamp: 2026-11-10T17:29:00+08:00
  - Tool: Cursor
  - Model: auto
  - Open Dough release: 0.3.94
  - Evidence: Coordinator transcript `bb3c5d04-c060-415e-b558-61ea996fd885` L56–L84: slice-2 Task `7a3a0ba5-c436-4c08-88d6-9d569db5c804` started 2026-11-10T17:16+08:00, left uncommitted guidance/test edits mid-reorganization with no proof return; developer continue at 17:29 recovered interruption. After owned CI stash/restore around timeout repair `476a9c007`, focused structural tests still failed; completion Task `9297fc23-a7d3-4964-86f6-719f8ca839e3` finished the slice before `d347ad037`.
  - Observed effect: one interrupted implementation Task with edits present; coordinator re-established proof from the checkout after repair restore, then one completion implementer before acceptance; no dual-writer publish.
  - Inference: Matches ODF-229 edits-present recurrence (interrupted Cursor implementation Task, no return). Distinct from ODF-059 (implementation Task) and ODF-225 (stash parked unfinished next-slice work; no invalidated still-running proof recorded).
- Execution: SEED-258#make-intent-coverage-results-easier-to-act-on (plan 573; first related implementation `be07058e3550a5527ed77bba00b3d7be4b1f4f2a`)
  - Timestamp: unknown
  - Tool: Cursor
  - Open Dough release: 0.3.94
  - Evidence: Coordinator transcript `f76bda0d-27fc-4051-8594-682e74b6d232`: slice-2 implementation Task interrupted twice while `trial/run-arm.sh` Claude arms kept running; developer continues at 2026-11-10T18:12:00+08:00 (A2 live; coordinator waited, then replacement Task for B arms) and 2026-11-10T18:30:00+08:00 (B1 done, B2 live; coordinator waited, summarized B2, wrote `trial/02-comparison-and-keep-decision.md`, delivered `f0e813bf1`). Checkout already held candidate skill edits matching `trial/skills-candidate/`; remote matched HEAD across both recovers.
  - Observed effect: two interrupted Cursor implementation returns; orphaned native arms continued to completion; one replacement writer for remaining B arms; coordinator finished the keep decision after B2; no dual-writer conflict, unexpected commit, or lost trial evidence.
  - Inference: Matches ODF-229 with a native-subprocess facet: interrupted Task return does not stop already-launched supervised host arms. Recovery waited on live `run-arm`/`claude` processes before replacement writers or acceptance. Distinct from ODF-204 (no unauthorized publish by the stalled Task) and ODF-059 (implementation Task, not a refactor handoff).

## ODF-230 — Planned proof relies on a forbidden shared installation <a id="odf-230"></a>

Former local code: DD-266. [Evidence and current response](docs/maintainer/findings/ODF-230.md).

## ODF-231 — Setup gate misses the project’s exact runtime pin <a id="odf-231"></a>

Former local code: DD-267. [Evidence and current response](docs/maintainer/findings/ODF-231.md).

## ODF-187 — Planned observations cannot detect regressions <a id="odf-187"></a>

Former local code: DD-268. [Evidence and current response](docs/maintainer/findings/ODF-187.md).

## ODF-232 — Acceptance publishes an explicitly unobserved host fact <a id="odf-232"></a>

Former local code: DD-270. [Evidence and current response](docs/maintainer/findings/ODF-232.md).

## ODF-233 — A plan forbids the representation its promised behavior needs <a id="odf-233"></a>

Former local code: DD-272. [Evidence and current response](docs/maintainer/findings/ODF-233.md).

## ODF-234 — Journey acceptance omits the next state its own guidance promises <a id="odf-234"></a>

Former local code: DD-273. [Evidence and current response](docs/maintainer/findings/ODF-234.md).

## ODF-223 — A gap disposition substitutes reasoning for its actual guided path <a id="odf-223"></a>

Former local code: DD-277. [Evidence and current response](docs/maintainer/findings/ODF-223.md).

## ODF-235 — New candidate ownership leaves old failure cleanup unreviewed <a id="odf-235"></a>

Former local code: DD-281. [Evidence and current response](docs/maintainer/findings/ODF-235.md).

## ODF-236 — Refactoring removes a deliberate caller behavior difference <a id="odf-236"></a>

Former local code: DD-286. [Evidence and current response](docs/maintainer/findings/ODF-236.md).

## ODF-237 — Unattached launch planning assumes an incompatible capture contract <a id="odf-237"></a>

Former local code: DD-289. [Evidence and current response](docs/maintainer/findings/ODF-237.md).

<a id="dd-288"></a>

## ODF-248 — Refactor reruns unchanged consumer proof <a id="odf-248"></a>

Former local code: DD-292. [Evidence and current response](docs/maintainer/findings/ODF-248.md).

## ODF-249 — Whole-suite proof runs before the refactor that invalidates it <a id="odf-249"></a>

Former local code: DD-293. [Evidence and current response](docs/maintainer/findings/ODF-249.md).

## ODF-250 — A plan's proof table omits an answer state its story scopes in <a id="odf-250"></a>

Former local code: DD-294. [Evidence and current response](docs/maintainer/findings/ODF-250.md).

## ODF-251 — An open Story Branch execution has no guided path to queue a correction it discovers <a id="odf-251"></a>

Former local code: DD-298. [Evidence and current response](docs/maintainer/findings/ODF-251.md).

## ODF-252 — A story recorded ready still needs developer choices and fixtures before its first slice <a id="odf-252"></a>

Former local code: DD-299. [Evidence and current response](docs/maintainer/findings/ODF-252.md).

## ODF-254 — Accepted proof let a test setup step perform an action the story requires of the product <a id="odf-254"></a>

Former local code: DD-301. [Evidence and current response](docs/maintainer/findings/ODF-254.md).

## ODF-255 — A slice's refactor widens a seam that a later slice of the same plan removes <a id="odf-255"></a>

Former local code: DD-304. [Evidence and current response](docs/maintainer/findings/ODF-255.md).

## ODF-256 — Managed delivery accepts a `--repo` that does not match the workspace's remote <a id="odf-256"></a>

Former local code: DD-305. [Evidence and current response](docs/maintainer/findings/ODF-256.md).

## ODF-169 — Stale replay base includes sibling commits <a id="odf-169"></a>

Former local code: DD-306. [Evidence and current response](docs/maintainer/findings/ODF-169.md).

## ODF-139 — Reported defect dismissed without checking the story <a id="odf-139"></a>

Former local code: DD-308. [Meaning, evidence and response](docs/maintainer/findings/ODF-139.md).

## ODF-257 — Test runs leave detached product children after timed-out teardowns, and the developer found them first <a id="odf-257"></a>

Former local code: DD-310. [Evidence and current response](docs/maintainer/findings/ODF-257.md).

## ODF-258 — A re-plan decision flagged by the first slice reached the developer only with the last <a id="odf-258"></a>

Former local code: DD-311. [Evidence and current response](docs/maintainer/findings/ODF-258.md).

## ODF-259 — The CI observer's budget expires inside a long execution <a id="odf-259"></a>

Former local code: DD-313. [Evidence and current response](docs/maintainer/findings/ODF-259.md).

## ODF-260 — A nine-slice story ran about twenty hours without a split <a id="odf-260"></a>

Former local code: DD-314. [Evidence and current response](docs/maintainer/findings/ODF-260.md).

## ODF-261 — Focused test filter matches the execution checkout path <a id="odf-261"></a>

Former local code: DD-315. [Evidence and current response](docs/maintainer/findings/ODF-261.md).

## ODF-303 — Native JSON hid an existing source-only reviewer <a id="odf-303"></a>

Former local code: DD-318. [Meaning, evidence and response](docs/maintainer/findings/ODF-303.md).

## ODF-304 — Coordinator behavior edits after the refactor pass skipped independent review <a id="odf-304"></a>

Former local code: DD-321. [Meaning, evidence and response](docs/maintainer/findings/ODF-304.md).

## ODF-305 — A new cross-host action's focused proof missed the spec pinning the other hosts' entries <a id="odf-305"></a>

Former local code: DD-322. [Meaning, evidence and response](docs/maintainer/findings/ODF-305.md).

## ODF-264 — Broad startup reads lose required context to truncation <a id="odf-264"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-264.md).

### Occurrences

- Execution: SEED-289#match-hosted-fonts-in-ci-container (plan 564; first product implementation `fa8eba6b9f26038388ef96b471c74f07a23b62fb`)
  - Timestamp: unknown (2026-11-10 execution; exact read-event times unavailable)
  - Tool: Codex
  - Open Dough release: 0.3.92 (checkout-bound installed version at established claim `c6467c381`)
  - Evidence: dashboard launch `def96917-5b2c-44f1-a2ea-005183e658da`; first-delegation reference batch returned 11,478 original tokens and delivery batch 17,001 with truncation; the coordinator then retrieved missing passages. During acceptance it also sent a complete consumer trace plus `head` of a minified report, producing a 395,412-token original-output warning, then correctly parsed only report stats. Retrospective repeated an oversized findings read.
  - Observed effect: omitted requested passages, repeated targeted retrieval and excessive raw diagnostic output; terminal command handles and semantic results remained intact.
  - Inference: this is an agent deviation under existing boundary/targeted-retrieval guidance. Keep individual required passages and parse large generated evidence before emitting it; no total-token or elapsed-time saving is measured.
- Execution: SEED-294#opt-in-to-intent-coverage-at-wrap-up (plan 571; implementation `92c060c8efe3a38b0ceb43ea1bec83603b550f4a`)
  - Timestamp: unknown (2026-11-10 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed guidance at claim `d5a3da31f`)
  - Evidence: launch `ee3cee74-5c29-456a-b16c-eb4336e7011c`; startup setup/plan read reported 14,032 original tokens with truncation, and first-delegation guidance batch reported 12,088 with truncation; coordinator retrieved missing plan and decision passages separately.
  - Observed effect: broad combined output lost needed passages and required targeted rereads before delegation. Dependent execution waited for the missing context.
  - Inference: recurrence of agent read-batching deviation under existing targeted-retrieval rules; no isolated time or token saving measured.

- Execution: SEED-296#prove-repeat-destination-cue-restarts (plan 579; implementation `536dcf13218bae15339ffbd1288464649940047e`)
  - Timestamp: unknown (2026-11-10 execution; exact read-event times not retained)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed guidance at claim `579604374`)
  - Evidence: launch `cd709693-c387-4de7-8e97-2c96d9d47ed2`; first-delegation batch reported 11,904 original tokens with truncation; retrospective ADR/direction batch reported 10,825 and findings batch 7,895 with truncation. Missing passages were retrieved by heading/range.
  - Observed effect: repeated loss and recovery of requested context under existing targeted-retrieval guidance; no measured token/time saving. Inference: recurring agent read-batching deviation, not missing instructions.

## ODF-306 — A delegated native probe ended a pending consent prompt and recorded a refusal <a id="odf-306"></a>

Former local code: DD-323. [Meaning, evidence and response](docs/maintainer/findings/ODF-306.md).

## ODF-307 — Coordinator screen probes competed with the developer's live desktop <a id="odf-307"></a>

Former local code: DD-324. [Meaning, evidence and response](docs/maintainer/findings/ODF-307.md).

## ODF-314 — An implementation return omits delegated proof rows and needs a second round <a id="odf-314"></a>

Former local code: DD-257. [Meaning, evidence and response](docs/maintainer/findings/ODF-314.md).

### Occurrences

- Execution: SEED-291#select-story-completed-in-ad-hoc-session (plan 568; Take `bcca33e08de6f9e1850a2e479ea8210acc74576c`; accepted increment `786bd1254191070e0c4ce65a3438994429f580df`)
  - Timestamp: 2026-11-10T11:59:00+08:00
  - Tool: Cursor
  - Model: auto
  - Open Dough release: 0.3.94
  - Evidence: coordinator transcript `265298f6-2b46-41e1-9d94-e276c3e9968d`; implementer `2599a454-dc5d-4680-86e6-1cabd1f55637` first return claimed focused proof green while plan outside-in already owned dual-candidate uniqueness and Side-panel preservation (source 18a.4); acceptance resume at 11:59+08:00 named those missing observations; second return added `two independently matching completed-story candidates stay absent` and opened/asserted Final report on the ad-hoc Intent journey (also `unavailable` vs `absent`, no blanket `done=bodies`) before refactor/delivery
  - Observed effect: one acceptance resume on the same uncommitted slice before acceptance; added discriminating proofs passed with no product-behavior change for those gaps
  - Inference: match to ODF-314. Plan-owned proof rows were already in the outside-in table and source-review; the first return still omitted their distinguishing observations until coordinator comparison returned the gaps

## ODF-322 — A projected delivery result drops the running command's handle <a id="odf-322"></a>

Former local code: DD-325. The coordinator reduced a guarded delivery call to its output text, dropping the live command's session handle; the terminal receipt was recovered through checkout inspection and an exact-candidate resume. [Evidence and current response](docs/maintainer/findings/ODF-322.md).

### Occurrences

- Execution: SEED-285#trace-landed-proof-timing (plan 554; first implementation `d4130605530aa4aed22c3d2be0e7ff5ff89ad968`)
  - Timestamp: 2026-11-09T12:04:47.771Z
  - Tool: Codex
  - Model: gpt-6.1-sol
  - Open Dough release: 0.3.92 (installed `.agents/skills/dough-update/VERSION` at `fcf4c0041`; no managed-copy edit)
  - Evidence: Native session `01a1beb7-a487-7fd0-989e-e7d2ab99461d`, call `call_b85c30cb82d9477eb3b8bec9c4bd9415`: `text((await tools.exec_command(...yield_time_ms:1000)).output)` emitted only the parking summary while history-preserving integration still ran. Calls at 12:04:59Z and 12:05:32Z inspected PID 87564 and `/tmp/trace-proof-285-main-integration.json`.
  - Observed effect: Two bounded process/receipt inspections recovered accepted `8a9c7ed156bf73241cc394ee77551be76ea352ed` after its session handle was discarded; publication was not repeated.
  - Inference: Exact caller-output projection recurrence; this was not a demonstrated publisher/transport stall. Preserve the full result and follow its session to terminal evidence.

## ODF-324 — Native checks keep asking the developer after attribution is established <a id="odf-324"></a>

Former local code: DD-327. Former branch-local code: DD-325 for SEED-144#branded-alert-click-automation only. Native acceptance kept requesting interactive developer rounds after attribution was established, including a full replay for a message-only change, until the developer withdrew. [Evidence and current response](docs/maintainer/findings/ODF-324.md).

## ODF-323 — A caller-written plan-status mutation survives a later delivery refusal <a id="odf-323"></a>

Former local code: DD-328. Former branch-local code: DD-326 for SEED-144#branded-alert-click-automation only. A guarded delivery's caller-written status update stayed applied after a later preparation refusal; its unbounded retry advanced the next slice. Related DD-326 (a failed updater contained before publication) is retained there as counterevidence. [Evidence and current response](docs/maintainer/findings/ODF-323.md).

## ODF-325 — Coordinator launched an empty agent while waiting on delegated work

Former local code: DD-329. Former local code: DD-408. [Meaning, evidence and response](docs/maintainer/findings/ODF-325.md).

## ODF-326 — A second source-only review repeated unchanged inputs

Former local code: DD-331. [Meaning, evidence and response](docs/maintainer/findings/ODF-326.md).

## ODF-327 — Preparation left an evaluation's criteria for execution while the evaluated run was imminent

Former local code: DD-332. [Meaning, evidence and response](docs/maintainer/findings/ODF-327.md).

## ODF-328 — A fresh delivery refused the obligation its own plan update would close

Former local code: DD-333. [Meaning, evidence and response](docs/maintainer/findings/ODF-328.md).

## ODF-329 — Implementation returns failed the delivery formatter's lint

Former local code: DD-334. [Meaning, evidence and response](docs/maintainer/findings/ODF-329.md).

### Occurrences

- Execution: SEED-289#match-hosted-fonts-in-ci-container (plan 564; first product implementation `fa8eba6b9f26038388ef96b471c74f07a23b62fb`)
  - Timestamp: unknown (2026-11-10 delivery, before product commit at 08:57:27+08:00)
  - Tool: Codex
  - Open Dough release: 0.3.92 (checkout-bound installed version at established claim `c6467c381`)
  - Evidence: after shell/browser proof and independent refactor, guarded fresh preparation returned `preparation-failed`, `operation: formatting`, ShellCheck SC2312 on `user=$(id -u):$(id -g)` in `tests/ci-container.sh`. Both implementation/refactor briefs forbade hook-owned lint. The coordinator separated uid/gid substitutions, reran the focused maintained shell check and retried fresh preparation.
  - Observed effect: commit/publication were correctly withheld; one mechanical repair/proof/preparation loop preceded accepted `fa8eba6b9`. Browser evidence stayed applicable.
  - Inference: another late lint-feedback occurrence; the record does not establish the counterfactual saving of an earlier read-only check.

- Execution: SEED-286#fast-intent-ci-comparison-tests (plan 556; first implementation `2d1c966890a2c8ebf0b552275200655b8d036b22`)
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: `6a6392eddcc15044413ce9c663bac9e72f2926f6:.planning/slice-plans/556-fast-intent-ci-comparison-tests/client-owner-evidence.md`, Independent refactor and actual preparation; raw `slice8-format.log`, `slice8-format-repaired.log`, `slice8-format-final.log` and `slice8-final-lint-commands.json` under `/tmp/seed286-execution-20261109/`.
  - Observed effect: Implementation/refactor briefs reserved formatter and hook lint for the coordinator without settling read-only authored-file lint. The first actual formatter found nine lint errors after green proof/refactoring. The coordinator's intermediate this:void repair introduced three further lint errors; stable arrow subscriptions and the remaining mechanical repairs passed formatting, 18 affected tests and typecheck. This is one execution occurrence, including coordinator-introduced repair churn.
  - Inference: Matches the existing delegation ambiguity; earlier read-only lint's possible saving remains unmeasured.

- Execution: SEED-261#map-ci-proof-test-data (plan577; first implementation `fc2edb326ee9dbcfb5e9ec6db1fc9eaf76f24969`)
  - Timestamp: unknown (2026-11-10, slice3 delivery)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed VERSION at established claim `efc80fb31`)
  - Evidence: launch `4f1ead35-9023-4e92-8337-36d4fd67ce26`; after105 browser/backend tests,19 collector comparisons and independent refactor, fresh formatting found four no-unsafe-assignment errors in two TS harnesses. `0dd938e1a:.planning/slice-plans/577-map-ci-proof-test-data/slice-3-typing-repair.md` retains the correction and emitted-JavaScript comparison.
  - Observed effect: commit/publication were withheld; narrow opaque return typing, typecheck/affected Node proof and preparation retry settled the gate. Browser proof stayed applicable because emitted JavaScript was identical.
  - Inference: late authored-file lint feedback recurred under coordinator-owned formatter/hook instructions; an earlier read-only lint's counterfactual saving remains unmeasured.

## ODF-330 — Hand-built preparation input dropped the plan from ownedPaths

Former local code: DD-335. [Meaning, evidence and response](docs/maintainer/findings/ODF-330.md).

<a id="dd-337--preparation-recorded-measured-allocations-without-their-full-sort-key"></a>

## ODF-355 — Preparation recorded measured allocations without their full sort key

Former local code: DD-337. [Meaning, evidence and response](docs/maintainer/findings/ODF-355.md).

<a id="dd-338--a-direct-formatter-command-in-fresh-delivery-lacked-the-packages-binaries"></a>

## ODF-356 — A direct formatter command in fresh delivery lacked the package's binaries

Former local code: DD-338. [Meaning, evidence and response](docs/maintainer/findings/ODF-356.md).

<a id="dd-340--preparation-observations-recorded-results-their-own-commands-contradict"></a>

## ODF-357 — Preparation observations recorded results their own commands contradict

Former local code: DD-340. [Meaning, evidence and response](docs/maintainer/findings/ODF-357.md).

<a id="dd-341--coordinator-wrote-subagent-completion-notices-in-its-own-turn"></a>

## ODF-358 — Coordinator wrote subagent completion notices in its own turn

Former local code: DD-341. Former local code: DD-337 on the claude/accept-original-source-promises-when-a-plan-narr branch at `f29e9fff5daed9d384bee60b9edbd34b6ea65157`; reassigned during integration to resolve a concurrent local-code collision. [Meaning, evidence and response](docs/maintainer/findings/ODF-358.md).

<a id="dd-342--a-developer-run-observation-inside-a-slices-proof-cannot-be-delivered-with-that-slice"></a>

## ODF-359 — A developer-run observation inside a slice's proof cannot be delivered with that slice

Former local code: DD-342. Former local code: DD-338 on the claude/accept-original-source-promises-when-a-plan-narr branch at `f29e9fff5daed9d384bee60b9edbd34b6ea65157`; reassigned during integration to resolve a concurrent local-code collision. [Meaning, evidence and response](docs/maintainer/findings/ODF-359.md).

<a id="dd-344--a-new-installed-command-assumed-a-writable-system-temp-directory-that-host-sandboxes-refuse"></a>

## ODF-360 — A new installed command assumed a writable system temp directory that host sandboxes refuse

Former local code: DD-344. [Meaning, evidence and response](docs/maintainer/findings/ODF-360.md).

<a id="dd-348--an-implementation-agent-met-a-file-line-limit-by-joining-wrapped-lines"></a>

## ODF-361 — An implementation agent met a file line limit by joining wrapped lines

Former local code: DD-348. [Meaning, evidence and response](docs/maintainer/findings/ODF-361.md).

<a id="dd-349--post-change-refactor-compressed-planmd-story-obligations-under-the-file-size-gate"></a>

## ODF-362 — Post-change refactor compressed PLAN.md Story obligations under the file-size gate

Former local code: DD-349. [Meaning, evidence and response](docs/maintainer/findings/ODF-362.md).

### Occurrences

- Execution: SEED-288#refresh-pending-landed-evidence (plan 558; first implementation `7ba5764de6ee78801f9fe4fd8132f1d4cfa6de37`)
  - Timestamp: unknown (2026-11-09 UTC execution; exact compaction-event time unavailable)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance)
  - Evidence: coordinator/refactor1 conversation; current-diff 250-line check included the 313-line executable plan. The coordinator moved resume/acceptance evidence into linked source-review.md and compacted preparation prose. An intermediate heading acquired a leading space; story-obligations check returned entryCount 0 and C05's G3 missing until the heading was restored. Accepted plan/records are recoverable at `7ba5764de`.
  - Observed effect: the file-size pass triggered planning-record rearrangement and a transient structured-obligation refusal before delivery. All obligations and proof were preserved and the check passed after repair.
  - Inference: the generic line cap included a structured execution record; the malformed heading was the coordinator's editing error, not required by guidance. Distinguishing record preservation from code-size cleanup would avoid this pressure without weakening product refactoring.

## ODF-377 — Source-only review launched without the full seed examples

Former local code: DD-364. [Meaning, evidence and response](docs/maintainer/findings/ODF-377.md).

## ODF-378 — Story-branch increment publish blocked by trunk-targeted open first-landing expectation

Former local code: DD-366. [Meaning, evidence and response](docs/maintainer/findings/ODF-378.md).

## ODF-379 — Delegated dashboard proof omitted its required sandbox wrapper

Former local code: DD-367. [Meaning, evidence and response](docs/maintainer/findings/ODF-379.md).

## ODF-380 — Bounded CI diagnostics omit earlier failed-test identities

Former local code: DD-368. Former local code: DD-373. [Meaning, evidence and response](docs/maintainer/findings/ODF-380.md).

## ODF-381 — Source-review put obligation IDs in the Slice column

Former local code: DD-369. Former local code: DD-392. [Meaning, evidence and response](docs/maintainer/findings/ODF-381.md).

## ODF-382 — First-pass helper-gone proof used address drift instead of a deleted wire helper

Former local code: DD-372. [Meaning, evidence and response](docs/maintainer/findings/ODF-382.md).

## ODF-383 — A deletion-only story amendment mid-execution forced a full source re-review and re-allocation

Former local code: DD-375. [Meaning, evidence and response](docs/maintainer/findings/ODF-383.md).

## ODF-384 — CI layout repair iterates successive assertions without one full-journey check

Former local code: DD-377. [Meaning, evidence and response](docs/maintainer/findings/ODF-384.md).

## ODF-142 — Abbreviated validated candidate stops delivery as candidate-mismatch

Former local code: DD-385. [Evidence and current response](docs/maintainer/findings/ODF-142.md).

## ODF-398 — Story Branch CI failure already repaired on trunk has no named path

Former local code: DD-386. [Evidence and current response](docs/maintainer/findings/ODF-398.md).

## ODF-333 — Story Branch proof requires trunk before closure <a id="odf-333"></a>

Former local code: DD-387. Former local code: DD-401. Former local code: DD-394 (`6c354905e`), renumbered in merge `966aad8b1`. Two local facets enter this gate: closure commitments owned by completion or wrap-up but allocated to the last slice must be observed before its done transition (DD-387), and a Story Branch rollout slice released from trunk without a step landing the earlier slices (DD-401). [Meaning, evidence and response](docs/maintainer/findings/ODF-333.md).

## ODF-367 — Source-only review arrived after the first slice was delegated

Former local code: DD-388. Former local code: DD-379 (`6085b6eed`), renumbered in merge `073e95d2d`. [Evidence and current response](docs/maintainer/findings/ODF-367.md).

## ODF-399 — Post-change refactor left a production module empty before delivery

Former local code: DD-389. [Evidence and current response](docs/maintainer/findings/ODF-399.md).

## ODF-337 — Fresh delivery ownedPaths cannot stage a deleted rename source

Former local code: DD-391. [Evidence and current response](docs/maintainer/findings/ODF-337.md).

### Occurrences

- Execution: SEED-286#fast-intent-ci-comparison-tests (plan 556; first implementation `2d1c966890a2c8ebf0b552275200655b8d036b22`)
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: slice9 `fresh` returned `preparation-failed`, operation `staging`, `fatal: pathspec '.planning/agents/bas-chan.json' did not match any files`; `slice9-progress-delivery-repaired.log` and `slice9-merge-staging-classification.json` under `/tmp/seed286-execution-20261109/`; classifying195 working paths as ownedPaths and13 already staged merge deletions as stagedPaths published `76015682179bcf87353da6c1cbbc6da5b86e11ca`.
  - Observed effect: one staging refusal before commit/publication, then a preparation-input correction and retry; formatting reran, no tested source or deletion was lost.
  - Inference: Same already-absent-index/literal-add condition as ODF-337. This confirms that condition for merge-staged deletions, not that every unstaged deletion fails; the publication boundary contained the mistaken path classification.

## ODF-400 — Foreign unpublished commits on an execution tip block story-branch publish

Former local code: DD-398. [Evidence and current response](docs/maintainer/findings/ODF-400.md).

## ODF-401 — Multi-done planning-only slices force temporary Status mutation for ordered delivery

Former local code: DD-399. [Evidence and current response](docs/maintainer/findings/ODF-401.md).

## ODF-402 — Stopping a CI observer mailbox can crash with an unhandled ENOENT

Former local code: DD-402. Former local code: DD-395 (`6c354905e`), renumbered in merge `966aad8b1`. [Evidence and current response](docs/maintainer/findings/ODF-402.md).

## ODF-403 — Absorbed mid-flight plan amendment plus execution evidence reports freshness conflict

Former local code: DD-403. [Evidence and current response](docs/maintainer/findings/ODF-403.md).

## ODF-396 — Planning basenames overwhelm a test-local consumer trace

Former local code: DD-404. [Evidence and current response](docs/maintainer/findings/ODF-396.md).

### Occurrences

- Execution: SEED-288#refresh-pending-landed-evidence (plan 558; first implementation `7ba5764de6ee78801f9fe4fd8132f1d4cfa6de37`)
  - Timestamp: unknown (2026-11-09 UTC execution; exact trace-event time unavailable)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance)
  - Evidence: coordinator conversation and `/tmp/seed288-slice2-refactor-return.md`; final slice-2 trace `/tmp/seed288-slice2-refactor-consumer-trace.md` and dispositions contain 624 located files, including 371 new matches caused only by dirty `PLAN.md`; slice-1 trace contained 651 per-file dispositions.
  - Observed effect: implementation/refactor owners repeatedly dispositioned unrelated planning, guidance and historical paths alongside meaningful runtime consumers. All affected proof was retained; no missed consumer was established.
  - Inference: automatically derived planning basenames materially enlarge a bounded dashboard trace even when explicit effect terms are supplied. The second refactor reported about ten minutes total, but isolated trace time or token cost was not measured. Preserve indirect proof while reducing generic derived-path noise.
- Execution: SEED-010#hold-delivery-on-freshness-before-expensive-proof (plan 561; first implementation `931d31c108c97bee3a60076fad331f47bf66f486`)
  - Timestamp: unknown (2026-11-10, slice-1 acceptance)
  - Tool: Codex
  - Open Dough release: 0.3.92 (checkout-bound `.agents/skills/dough-update/VERSION`)
  - Evidence: implementation and refactor returns retain a whole-checkout trace against `14c211d14` with 732 consumers, including generic derived PLAN/SKILL/source-review terms. The initial consumer record was about 780 lines; the coordinator's combined read truncated at 12,943 original tokens. At `931d31c10`, `.planning/slice-plans/561-settle-trunk-freshness-before-proof/consumer-trace.md` retains 17 run, 13 reused and explicit grouped exclusions in 92 lines.
  - Observed effect: broad enumeration required a second read and record compaction; actual guidance/CLI/replay consumers were inspected and passed focused proof. No missed consumer is established.
  - Inference: automatic planning-basename noise recurred; exact time attributable to it is unmeasured. Grouped dispositions preserved relevant proof without the raw list.

- Execution: SEED-281#no-count-difference-across-gaps (plan 566; first implementation `6217de68c3af5dc2b63ecfd91a2fa5a65b5d2956`)
  - Timestamp: unknown (2026-11-10 execution; exact original trace-event time unavailable)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance)
  - Evidence: `/tmp/count-gaps-consumers-adopted-disposition.md` derives `PLAN.md` and `source-review.md` and exceeds 1,900 lines; `/tmp/count-gaps-board-consumer-trace.md` lists 481 matches with 381 excluded, including basename collisions with `dashboardPage.ts`. Execution proof and trace locators are retained at `6217de68c:.planning/slice-plans/566-no-count-difference-across-gaps/verification.md`.
  - Observed effect: implementation, refactor and coordinator passes repeatedly classified unrelated planning/history/text matches alongside actual rendered, indirect and test consumers. Required observations were retained and all current dispositions settled; no missed consumer was established by this noise.
  - Inference: automatic planning-basename and substring noise recurred. Disposition volume is observed; isolated time/token cost is unmeasured. Later repair traces using explicit changed paths and narrow effect terms stayed bounded.
- Execution: SEED-281#keep-unit-gaps-and-names-visible (plan 557; first implementation `b7e35aa83838aa1eeefdafac8ad726b5c4dbecd7`)
  - Timestamp: unknown (2026-11-10 UTC, slice-2 implementation and independent refactor)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance)
  - Evidence: slice-2 agent returns and coordinator conversation; /tmp/seed281-slice2-final-consumer-trace.md enumerated 590 consumers, and /tmp/seed281-slice2-refactor-consumer-trace.md enumerated 627 across four disposition parts. The latter explicitly derives PLAN.md, execution-history.md and source-review.md basenames; its PLAN term matched 2,257 files. Published implementation 3c3c1da7 retains the shared mapper and affected proof locations.
  - Observed effect: implementation and refactor owners dispositioned unrelated planning, guidance and historical matches alongside the actual four comparison and four adapter caller files; all 17 affected cases passed, and no missed consumer was established.
  - Inference: the existing planning-basename noise recurred. Refactoring reported about 15 minutes total, including edits, workload sequencing and proof; isolated trace cost was not measured.
- Execution: SEED-294#opt-in-to-intent-coverage-at-wrap-up (plan 571; implementation `92c060c8efe3a38b0ceb43ea1bec83603b550f4a`)
  - Timestamp: unknown (2026-11-10 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed guidance at claim `d5a3da31f`)
  - Evidence: `/tmp/seed294-consumer-trace-reviewed.md` and the implementation return enumerate 786 classified rows (16 run, 770 excluded), deriving generic `PLAN.md`, `source-review.md` and `SKILL.md` terms; plan proof is recoverable at the implementation revision above.
  - Observed effect: a two-file guidance change required broad per-file dispositions. The trace also found a real dashboard unconditional-copy consumer, which was corrected and passed focused browser proof.
  - Inference: generic basename noise recurred alongside useful effect tracing; isolated trace cost is unmeasured, and no missed consumer is established.

- Execution: SEED-285#compare-landed-timing-with-recent-builds (plan 555; first implementation `e714c02f52de8f85fdc404317d2a75b41fdd27c5`)
  - Timestamp: unknown (2026-11-10 slice-3 acceptance; exact trace-event time unavailable)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound `.agents/skills/dough-update/VERSION`)
  - Evidence: `/tmp/seed285-slice3-consumer-trace.md` and its dispositions each contain 758 physical lines, including automatically derived PLAN/PLAN.md/source-review terms and unrelated historical/guidance matches. The coordinator's combined acceptance read was truncated. The independent presentation-refactor trace `/tmp/seed285-refactor3-consumer-trace.md` uses product paths/effect terms and contains 64 lines with 12 located consumers; all reached browser consumers were run.
  - Observed effect: the broad trace required repeated targeted reads and numerous lexical-only exclusions beside meaningful runtime consumers. Current proof covers the affected references and enclosing journeys; no missed consumer was established.
  - Inference: planning-basename expansion recurs in ordinary feature execution. The narrower refactor trace supports separating record paths from product-effect searches while preserving indirect proof; isolated time/token savings were not measured.

- Execution: SEED-261#map-ci-proof-test-data (plan577; first implementation `fc2edb326ee9dbcfb5e9ec6db1fc9eaf76f24969`)
  - Timestamp: unknown (2026-11-10 execution)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed VERSION at established claim `efc80fb31`)
  - Evidence: slice1's generated trace was731 lines; slice3 reported687 located rows and slice4 reported980, deriving dirty PLAN/source-review basenames beside explicit fragment/count/factory terms. `a0357d569:.planning/slice-plans/577-map-ci-proof-test-data/` retains literal focused commands and function-level consumer dispositions; raw traces stayed under `/tmp/slice*-consumer-trace.md`.
  - Observed effect: broad lexical/record matches required many exclusions and a truncated combined coordinator read. Later bounded inspection and function-level impact selection retained actual indirect consumers, including two additional browser journeys; no missed consumer is established.
  - Inference: planning-basename/generic-term noise recurred alongside useful tracing. Isolated time/token cost and savings from a narrower search were not measured.

## ODF-404 — Concurrent Taken sibling rewrote the active story mid-execution

Former local code: DD-405. [Evidence and current response](docs/maintainer/findings/ODF-404.md).

## ODF-405 — Full local suite wall includes waiting for repository-wide admission

Former local code: DD-406. [Evidence and current response](docs/maintainer/findings/ODF-405.md).

**Responsibility (2026-11-03):** the shared facet stays here: measurement
guidance names no repository admission or queue among wall-time distortions.
This repository's gate and its missing note are the local facet, repaired at
`ad8b1f3af` and kept once in [ProjectFindings.md](ProjectFindings.md#dd-406).

## ODF-406 — A plan's local gate names the hook-owned lint that delivery forbids running

Former local code: DD-407. [Evidence and current response](docs/maintainer/findings/ODF-406.md).

## ODF-407 — An implementation return claimed a bound its own constants contradict

Former local code: DD-409. [Evidence and current response](docs/maintainer/findings/ODF-407.md).

## ODF-408 — An agent-operable evaluation slice was handed to the developer

Former local code: DD-410. [Evidence and current response](docs/maintainer/findings/ODF-408.md).

## ODF-409 — CI diagnostic reports an empty complete inventory for a cancelled job whose suite step failed

Former local code: DD-411. [Evidence and current response](docs/maintainer/findings/ODF-409.md).

**Responsibility (2026-11-03):** the inventory that omits a cancelled job with
a failed step is shared (`ci-failures.mjs`) and stays here. The shard's
deadline breach under slow runner setup is this repository's CI exposure,
kept once as a DD-279 occurrence in
[project test findings](docs/maintainer/project-test-findings.md#dd-279).

DD-412 moved to [the project test findings](docs/maintainer/project-test-findings.md#dd-412).

DD-420, DD-421, DD-428, DD-429 and DD-430 moved to [the project test findings](docs/maintainer/project-test-findings.md#dd-420).

DD-432 (a container run took a live host run's local-suite admission) is recorded in [the project test findings](docs/maintainer/project-test-findings.md#dd-432).

DD-433 (an artifact upload stall cancelled two passing dashboard shards at the job cap) is recorded in [the project test findings](docs/maintainer/project-test-findings.md#dd-433).

## ODF-410 — An implementation agent handed back while its own background work kept running

Former local code: DD-413. [Evidence and current response](docs/maintainer/findings/ODF-410.md).

## ODF-420 — Acceptance observed a class commitment at text listing only its examples

Former local code: DD-415. [Evidence and current response](docs/maintainer/findings/ODF-420.md).

## ODF-421 — A real observation passed only because the producer happened to supply the promised order

Former local code: DD-416. [Evidence and current response](docs/maintainer/findings/ODF-421.md).

## ODF-422 — A subordinate project's publication went unobserved by the owning execution

Former local code: DD-417. [Evidence and current response](docs/maintainer/findings/ODF-422.md).

## ODF-423 — A push the remote refused for permission returned `needs-validation` without its reason

Former local code: DD-418. [Evidence and current response](docs/maintainer/findings/ODF-423.md).

## ODF-424 — Exclusion story-clause recording still needs hand-matched exact substrings

Former local code: DD-422. [Evidence and current response](docs/maintainer/findings/ODF-424.md).

## ODF-425 — A refactor renamed a helper while its verification was running

Former local code: DD-423. [Evidence and current response](docs/maintainer/findings/ODF-425.md).

## ODF-426 — Required fresh refactor blocked by host agent authentication failure

Former local code: DD-424. [Evidence and current response](docs/maintainer/findings/ODF-426.md).

## ODF-427 — A Story Branch keep-worktree landing hand-writes its publication script

Former local code: DD-425. [Evidence and current response](docs/maintainer/findings/ODF-427.md).

## ODF-428 — A refactor moved tests after acceptance had cited them, leaving source-review observations stale

Former local code: DD-431. [Evidence and current response](docs/maintainer/findings/ODF-428.md).

### Occurrences

- Execution: SEED-289#name-a-test-job-past-its-deadline (plan 563; first implementation `15ebf14d3dba2c231ec7a6269364121ba21e9ea5`)
  - Timestamp: 2026-11-10T08:23:03+08:00
  - Tool: Cursor
  - Open Dough release: 0.3.92 (installed `.agents/skills/dough-update/VERSION`)
  - Evidence: Slice 1 acceptance recorded observations against the deadline proof files; the post-change refactor split continuation cases into `test-runner-deadline-continuation.test.mjs` before publish `15ebf14d`. Slice 2 acceptance then recorded cutoff rows; its refactor split `test-runner-deadline-cutoff-proof.test.mjs` / helpers before publish `968d5cde`. Coordinator transcripts show “Updating observations for the split proof files” / plan verification updates before each delivery.
  - Observed effect: Two retargeting rounds in one execution; nothing stale was published because the coordinator rewrote the citations before each increment.
  - Inference: Same structural gap as prior ODF-428 rows — acceptance writes `observed:` paths before the required refactor pass, so proof-file splits invalidate them unless retargeted at delivery.

## ODF-429 — An overlapping sibling story landed on trunk mid-execution and surfaced only at the final done-mark

Former local code: DD-434. [Evidence and current response](docs/maintainer/findings/ODF-429.md).

## ODF-430 — Story integration moved another active agent profile into done

Former local code: DD-436. [Evidence and current response](docs/maintainer/findings/ODF-430.md).

<a id="dd-437"></a><a id="dd-437--near-zero-execute-plan-boundary-row-headroom-forced-structural-packing-on-an-ordinary-guidance-story"></a>

## ODF-446 — Near-zero Execute Plan boundary-row headroom forced structural packing on an ordinary guidance story

Former local code: DD-437. [Evidence and current response](docs/maintainer/findings/ODF-446.md).

<a id="dd-438"></a><a id="dd-438--source-review-commitment-ids-used-en-dash-ranges-the-recorder-refuses"></a>

## ODF-447 — Source-review commitment Ids used en-dash ranges the recorder refuses

Former local code: DD-438. [Evidence and current response](docs/maintainer/findings/ODF-447.md).

<a id="dd-439"></a><a id="dd-439--prepared-plans-empty-story-obligations-prose-failed-the-execution-obligations-reader"></a>

## ODF-292 — Prepared plan's empty Story obligations prose failed the execution obligations reader

Former local code: DD-439. [Evidence and current response](docs/maintainer/findings/ODF-292.md).

<a id="dd-440"></a><a id="dd-440--story-branch-coordinator-started-a-trunk-observer-that-managed-delivery-then-replaced"></a>

## ODF-448 — Story Branch coordinator started a trunk observer that managed delivery then replaced

Former local code: DD-440. [Evidence and current response](docs/maintainer/findings/ODF-448.md).

<a id="dd-441"></a><a id="dd-441--acceptance-credited-a-surface-commitment-through-a-shared-endpoint-the-surface-never-showed"></a>

## ODF-449 — Acceptance credited a surface commitment through a shared endpoint the surface never showed

Former local code: DD-441. [Evidence and current response](docs/maintainer/findings/ODF-449.md).

<a id="dd-442--a-shallow-historical-checkout-still-inherited-the-host-git-object-store"></a> DD-442 — A shallow historical checkout still inherited the host Git object store. [Project evidence](docs/maintainer/project-maintenance-findings.md#dd-442).

<a id="dd-443"></a><a id="dd-443--a-shared-tracking-ref-update-interrupted-confirmation-after-a-successful-push"></a>

## ODF-450 — A shared tracking-ref update interrupted confirmation after a successful push

Former local code: DD-443. [Evidence and current response](docs/maintainer/findings/ODF-450.md).

<a id="dd-444"></a><a id="dd-444--a-siblings-done-catalog-conflict-resolution-moved-an-active-executions-agent-profile-into-the-done-records"></a>

## ODF-451 — A sibling's done-catalog conflict resolution moved an active execution's agent profile into the done records

Former local code: DD-444. [Evidence and current response](docs/maintainer/findings/ODF-451.md).

<a id="dd-445--timeout-headroom-judged-from-one-hosted-run-missed-run-to-run-variance"></a> DD-445 — Timeout headroom judged from one hosted run missed run-to-run variance. [Project evidence](docs/maintainer/project-test-findings.md#dd-445).

<a id="dd-446"></a><a id="dd-446--report-clock-changes-replayed-already-proved-scratch-journeys"></a>

## ODF-452 — Report-clock changes replayed already-proved scratch journeys

Former local code: DD-446. [Evidence and current response](docs/maintainer/findings/ODF-452.md).

<a id="dd-447"></a><a id="dd-447--a-refactor-pass-replaced-a-plan-named-repeated-proof-with-one-run"></a>

## ODF-453 — A refactor pass replaced a plan-named repeated proof with one run

Former local code: DD-447. [Evidence and current response](docs/maintainer/findings/ODF-453.md).

<a id="dd-448"></a><a id="dd-448--the-coordinator-delegated-a-lookup-the-implementation-brief-already-required"></a>

## ODF-454 — The coordinator delegated a lookup the implementation brief already required

Former local code: DD-448. [Evidence and current response](docs/maintainer/findings/ODF-454.md).

<a id="dd-449"></a><a id="dd-449--a-same-ref-cancelled-ci-run-reached-the-coordinator-as-unexplained-incomplete"></a>

## ODF-455 — A same-ref cancelled CI run reached the coordinator as unexplained incomplete

Former local code: DD-449. [Evidence and current response](docs/maintainer/findings/ODF-455.md).

<a id="dd-450"></a><a id="dd-450--a-plans-identical-step-tree-proof-did-not-account-for-a-per-run-random-value"></a> [DD-450 moved to ODF-074](docs/maintainer/findings/ODF-074.md).

<a id="dd-451"></a><a id="dd-451--the-coordinators-source-review-input-cut-the-storys-last-line"></a>

## ODF-339 — The coordinator's source-review input cut the story's last line

Former local code: DD-451. [Evidence and current response](docs/maintainer/findings/ODF-339.md).

<a id="dd-452--a-shell-check-gained-a-browser-its-ci-job-did-not-install"></a> DD-452 — A shell check gained a browser its CI job did not install. [Project evidence](docs/maintainer/project-findings-history.md#dd-452).

## ODF-456 — Ready plan used an unsupported slice status

[Evidence and current response](docs/maintainer/findings/ODF-456.md).

## ODF-457 — A refactor pass's scripted spec split dropped a moved test <a id="odf-457"></a>

Former local code: DD-457. [Evidence and current response](docs/maintainer/findings/ODF-457.md).

## ODF-458 — A reported limitation left without an obligation became a retrospective correction <a id="odf-458"></a>

Former local code: DD-458. [Evidence and current response](docs/maintainer/findings/ODF-458.md).

## ODF-434 — Coordinator sends an unsubstituted placeholder to a delegated agent <a id="odf-434"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-434.md). This facet: the implementation brief, not the source-only reviewer.

## ODF-459 — Obligations record doubled a supplied `observed:` prefix <a id="odf-459"></a>

Former local code: DD-459. [Evidence and current response](docs/maintainer/findings/ODF-459.md).

## ODF-460 — A coordinator's prose brief narrowed a key example the attached source review still carried <a id="odf-460"></a>

Former local code: DD-460. [Evidence and current response](docs/maintainer/findings/ODF-460.md).

## ODF-461 — A hidden-fact break check missed a helper that writes the fact <a id="odf-461"></a>

Former local code: DD-461. [Evidence and current response](docs/maintainer/findings/ODF-461.md).
<a id="dd-463"></a> DD-463 — A reverse import-closure selection silently dropped importers. [Project findings](ProjectFindings.md#dd-463).

## ODF-470 — Sequential before and after timings could not judge a no-slowdown promise <a id="odf-470"></a>

Former local code: DD-464. [Evidence and current response](docs/maintainer/findings/ODF-470.md).
<a id="dd-465"></a> DD-465 — An empty focused path list ran the whole local suite. [Project findings](ProjectFindings.md#dd-465).

## ODF-462 — A plan's consumer inventory came from a narrower search than the story's rule <a id="odf-462"></a>

Former local code: DD-468. [Evidence and current response](docs/maintainer/findings/ODF-462.md).

## ODF-463 — A trunk merge's proof selected changed specs, not consumers of the changed contract <a id="odf-463"></a>

Former local code: DD-469. [Evidence and current response](docs/maintainer/findings/ODF-463.md).

## ODF-464 — A baseline trace in hand already showed the request timing that made the planned lazy build neutral <a id="odf-464"></a>

Former local code: DD-471. [Evidence and current response](docs/maintainer/findings/ODF-464.md).

## ODF-465 — Final full suites ran before the named-sibling check, so a sibling landing forced a second whole run <a id="odf-465"></a>

Former local code: DD-472. [Evidence and current response](docs/maintainer/findings/ODF-465.md).

## ODF-338 — Concurrent slices invalidate proof in one checkout <a id="odf-338"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-338.md).

## ODF-466 — A trunk merge interpolated a converted fixture into a string, and the record claimed lint passed with it <a id="odf-466"></a>

Former local code: DD-474. [Evidence and current response](docs/maintainer/findings/ODF-466.md).

## ODF-467 — A CI repair duplicated a fix another active execution had in progress <a id="odf-467"></a>

Former local code: DD-475. [Evidence and current response](docs/maintainer/findings/ODF-467.md).

## ODF-468 — Briefs required whole-suite runs longer than the host's foreground cap, gated on a load that rarely fell <a id="odf-468"></a>

Former local code: DD-477. [Evidence and current response](docs/maintainer/findings/ODF-468.md).

## ODF-469 — A last slice holding most whole-story commitments was accepted with narrower observations <a id="odf-469"></a>

Former local code: DD-480. [Evidence and current response](docs/maintainer/findings/ODF-469.md).

## DD-481 — Freshness chooses a pre-Take merge base despite another base containing the accepted Take

The source-freshness gate takes one `git merge-base` as the Take. After published-sibling integration created multiple best bases, it selected the sibling's pre-Take base and rejected a valid ongoing execution before comparing its source.

### Occurrences

- Execution: SEED-285#trace-landed-proof-timing (plan 554; first implementation `d4130605530aa4aed22c3d2be0e7ff5ff89ad968`)
  - Timestamp: 2026-11-09T10:32:44.223Z
  - Tool: Codex
  - Model: gpt-6.1-sol
  - Open Dough release: 0.3.92 (installed source-freshness command; unchanged managed guidance)
  - Evidence: Native session `01a1beb7-a487-7fd0-989e-e7d2ab99461d`, terminal call `call_1d5dbd7a47274ae6ad7c75c7303c324e` returned `refused/not-taken-at-base` at `db8ca909986425b77080466a47ba4ff8079040b0`. At 10:34:10Z, `git merge-base --all HEAD origin/main` (the preserved graph is `50f4f4f1` versus `1c784a6d6`) returned that SHA and accepted Take `8554eb19e1b0944f7261120ff38af38de5f40ab0`; trunk `1c784a6d6` and the Take both held this Taken story. Current source-freshness.mjs still uses one merge-base.
  - Observed effect: The gate withheld the done boundary; read-only graph/backlog inspection diagnosed the mismatch. Published-main integration `fcf4c0041` made trunk the common base; the 11:03:46Z receipt returned unchanged for story/plan. No guard bypass or managed-copy edit occurred.
  - Inference: A merge base is not necessarily the accepted Take when history-preserving sibling imports produce several best bases. Use the retained claim context or resolve all bases safely; do not waive source drift checking. Diagnosis/recovery are observed; later V2-contract proof renewal is not attributed solely to this false refusal. Distinct from ODF-403's already-absorbed text conflict and ODF-169's stale publication suffix.

## DD-482 — Ready plan used singular `## Slice`, so obligations could not list slices

A Take-ready plan headed its only slice under `## Slice`. The obligations / plan-progress reader accepts only `## Slices` or `## Ordered slices`, so the first list refused until the coordinator renamed the heading. Matching uncertainty: same reader contract as ODF-368, but the plan had a near-miss heading rather than slices nested under Current decisions with no section.

### Occurrences

- Execution: SEED-292#show-an-unreadable-preparation-continuation (spent plan 570 recoverable at before-cleanup `0f220c1aed85478a174b5c60ac601ac49edf22af`; first related implementation `8fa1b522026463305d46ad493f13628c1b2f5298`)
  - Timestamp: 2026-11-10T12:05:00+08:00
  - Tool: Cursor
  - Open Dough release: 0.3.94 (installed `.agents/skills/dough-update/VERSION`)
  - Evidence: Take base `921ad3c98` PLAN.md has `## Slice`; published tip `8fa1b522` has `## Slices`. Coordinator transcript `058c51db-7e9f-4095-86f9-2783c98271b9` renamed the heading before the successful `story-obligations.mjs list --slice 1`. Reader regex: `^## +(?:Ordered slices|Slices) *$`. Sibling Taken plan 568 still has `## Slice` at line 112.
  - Observed effect: one allocation stop and a one-line plan edit before slice 1 delegation; no product or CI effect.
  - Inference: Readiness / Take did not run the same slices-section parser execution uses. Distinct from lettered-slice ODF-431 and pending-status ODF-456.

## DD-484 — New Node test files placed outside suite discovery

Discriminating renderer tests were added under `scripts/`, which this project's Intent/CI discovery roots do not include, so the full suite would not have run them until acceptance relocated the file.

### Occurrences

- Execution: SEED-290#publish-frontend-test-proof (plan 567; first related implementation `85a494d276d277daeb205e9e7bfa0ea4a5a9c5c7`)
  - Timestamp: unknown
  - Tool: Cursor
  - Open Dough release: 0.3.94
  - Evidence: Coordinator transcript `0f1a429c-95c5-42c1-90f3-34dcc99a4615` L54 after the replacement implementer's return and before refactor Task `4189beda-8fb9-4666-8cb9-d804d8e3a88c` (2026-11-10T15:07+08:00): `scripts/frontend-test-proof.test.mjs` was moved to `tests/support/frontend-test-proof.test.mjs` because renderer tests under `scripts/` are not in CI discovery. `.planning/open-dough.json` Intent locations cover `tests`, `dashboard/*/tests`, and `src/skills`, not top-level `scripts/*.test.mjs`.
  - Observed effect: one acceptance-time relocation before publication; focused proof then passed; no hosted CI miss of that suite.
  - Inference: Place new Node test files under a discovered root (or extend discovery) before claiming suite coverage; acceptance caught this before push. Distinct from ODF-150 (missed indirect consumer of a changed contract after publish).

## DD-485 — Selective formatter preparation without npm PATH

Fresh preparation invoked `node scripts/lint.mjs --fix` directly; eslint and prettier were not on PATH, so formatting failed before commit.

### Occurrences

- Execution: SEED-295#inspect-project-configuration-in-dashboard (plan 570; first related implementation `65faeae3602e04fc924a7d86b21da5d2aa559720`)
  - Timestamp: 2026-11-10T08:45:00Z
  - Tool: Cursor
  - Open Dough release: 0.3.94
  - Evidence: `execution-increment-delivery.mjs fresh` returned `preparation-failed`, `operation: formatting`, with `eslint: not found on PATH` / `prettier: not found on PATH`. Retry with `npm run format` succeeded.
  - Observed effect: one preparation refusal and retry; no owned edits lost.
  - Inference: This project's selective formatter expects `npm run format` (or equivalent PATH including `node_modules/.bin`), not a bare `node scripts/lint.mjs --fix`.

## DD-486 — Playwright-only focused proof missed TypeScript test errors

Focused Playwright configuration selection passed; the commit hook's typecheck then refused `getByRole("textarea")` and possibly-undefined settings payload indexing.

### Occurrences

- Execution: SEED-295#inspect-project-configuration-in-dashboard (plan 570; first related implementation `65faeae3602e04fc924a7d86b21da5d2aa559720`)
  - Timestamp: 2026-11-10T08:50:00Z
  - Tool: Cursor
  - Open Dough release: 0.3.94
  - Evidence: `execution-increment-delivery.mjs fresh` returned `commit-failed` with TS2345 on `system-settings-client-configuration.spec.ts` (`"textarea"` role) and TS2532 on `system-settings.spec.ts`. Prior focused command `npx playwright test tests/configuration/system-settings-client-configuration.spec.ts tests/configuration/system-settings.spec.ts` had passed. Repairs then typechecked and the focused Playwright selection passed again before successful delivery.
  - Observed effect: one commit refusal after green Playwright; repairs stayed local and were included in the accepted increment.
  - Inference: When editing TypeScript test files, include `npm run typecheck:dashboard` (or the project's equivalent) in focused proof before guarded delivery, not only Playwright.

## DD-488 — Guarded slice delivery rejects its retained Markdown hard break

Former branch-local code: DD-487 in `39c075087`; renumbered during integration to preserve the unrelated finding already published on trunk.

Guarded fresh delivery formats the plan, changes its selected `Status: planned`
to `Status: done`, then rejects the inherited two-space Markdown hard break in
its own staged whitespace check. A normal executable plan can therefore require
a manual records-only repair before its first slice commit.

### Occurrences

- Execution: SEED-298#insert-common-prompts-in-the-dashboard-terminal (plan 574; first implementation `0e258a2f7441b8a253f54860f0b9e56ed56a984d`)
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: 0.3.94 (installed `.agents/skills/dough-update/VERSION`)
  - Evidence: This execution's first guarded `fresh` result on 2026-11-10 returned `preparation-failed`, operation `staged whitespace`, `PLAN.md:69: trailing whitespace`, `+Status: done`. Installed `selected-slice-status.mjs` replaces only `planned` with `done`, preserving the line suffix; `execution-increment-preparation.mjs` formats before mutation and later runs `git diff --cached --check`. The prepared plan originally used the conventional two-space hard break after its status.
  - Observed effect: no commit or push occurred; the coordinator removed that hard break and retried preparation. A later independent hook lint repair was separate.
  - Inference: The status writer and staged-whitespace gate disagree on an accepted Markdown representation. Retaining or normalizing a compatible status shape before staging could remove this repair loop; no guidance/runtime fix is authorized by this retrospective.
- Execution: SEED-296#prove-repeat-destination-cue-restarts (plan 579; implementation `536dcf13218bae15339ffbd1288464649940047e`)
  - Timestamp: unknown (2026-11-10 execution; precise refusal time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed guidance at claim `579604374`)
  - Evidence: launch `cd709693-c387-4de7-8e97-2c96d9d47ed2`; first guarded fresh returned `preparation-failed`, operation `staged whitespace`, `PLAN.md:91: trailing whitespace`, `+Status: done`; removing only that inherited hard break allowed the same guarded operation to publish `536dcf132`.
  - Observed effect: one mechanical refusal/repair/retry, no commit or publication on refusal. Inference: recurrence of the same retained-status-suffix mismatch; no runtime repair authorized here.
