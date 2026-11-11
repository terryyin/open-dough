# DearDough Process Findings

The [shared finding catalog](docs/maintainer/finding-names.md) holds reconciled
evidence, former codes and response history. This log retains Open Dough
observations and context beyond those catalog records. See
[ProjectFindings.md](ProjectFindings.md) for repository-owned findings.

## Retention

- Highest allocated local number: 488. Removed numbers are never reused.
- Recovery: `abc1e0a2cee4912f1c87fb15f929772f6c52ce0e:DearDough.md` contains the full pre-cleanup log and links to earlier recovery revisions.
- Occurrence history is partial.

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

- Execution: SEED-285#retry-a-slow-landed-ci-build (plan 569; first implementation `8aeda2ade7baf09656cd6823e3031ebbf1a797ce`)
  - Timestamp: unknown (2026-11-10 execution)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed guidance)
  - Evidence: CI run 42800107133/1 at `8aeda2ade` failed native identity from a new shared MakeMe runtime import of the dashboard timing marker. Native fixture roots intentionally copy tests and src. Repair `0fb7f0226` removed that runtime dependency and retained independent test-domain timing facts; plan 569 `ci-repair-1.md` preserves diagnostics and native proof. Later owned runs42832244638/1 and42845502760/1 exposed the enclosing settings touch journey's last-fact/action adjacency assumption after the new follow-up setting; plan569 `ci-repair-3.md` retains the exact failing baseline and seven-case repaired proof with unchanged strict touch checks.
  - Observed effect: an owned published failure required pause, independent repair/proof and restoration of in-flight slice 2. No installation boundary was widened.
  - Inference: shared builders' fixture-materialization consumers belong in the changed import contract's proof; full dashboard timing proof could not expose the absent dashboard tree.


- Execution: SEED-307#apply-shared-page-object-rules-per-entry (plan 590; first implementation `48fd7667f08c15e5121be38593e11fb659f20298`)
  - Timestamp: unknown (2026-11-11 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.95 (checkout-bound installed VERSION at accepted Take `80d20ed9e`)
  - Evidence: Published slice 2 `f31723244` linked delegation to new `test-entry-rules.md` before declaring that reference/runtime closure; CI run43010890708/1 test3/3 failed `tests/payload-declaration-links.sh`. Repair `e2806cc5e` added the complete closure and ran real install/update plus grouped/historical declaration readers. Recover proof at `fd9612e2891d4ca12bfc6bbd83718ec6b51326cb:.planning/slice-plans/590-apply-shared-page-object-rules-per-entry/ci-repair-observations.md`.
  - Observed effect: one owned dependency-closure CI failure, paused next-slice work and an independent repair before resuming. The same run's watcher teardown budget defect had a separate accepted solution; it is not attributed to this omission.
  - Inference: linking promoted runtime prose makes its delivery inventory an immediate consumer; a later installation slice does not postpone that compatibility proof. Matches ODF-150's indirect-consumer omission; no new framework or duplicate finding is needed.

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
- Execution: SEED-261#map-installation-and-native-test-data (plan 549; first implementation `8c305d2f0f90d0d7f553680612040ae5a8346e77`)
  - Timestamp: unknown (2026-11-10–11 execution; exact read-event times not retained) · Tool: Codex · Open Dough release: unknown
  - Evidence: launch `fe6a6be5-9d73-4381-bd97-0f4cbfa8092f`; tool result `3b31cb` reported 302426 original output tokens after recursive enumeration of Playwright cache/trace artifacts, while a later bounded latest-trace query sufficed. The retrospective combined North Star/history read reported 5112 original tokens with truncation; the missing direction passage was retrieved by range.
  - Observed effect: excessive diagnostic output and truncated context required bounded follow-up retrieval; command handles and semantic proof results remained available.
  - Inference: recurrence of agent output/read scoping deviation under existing guidance, not a missing instruction. No total-token or elapsed-time saving was measured.

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

- Execution: SEED-285#retry-a-slow-landed-ci-build (plan 569; first implementation `8aeda2ade7baf09656cd6823e3031ebbf1a797ce`)
  - Timestamp: unknown (2026-11-10 execution)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed guidance)
  - Evidence: slice 3 fresh preparation withheld commit on 79 typed-lint errors, including the case-only ciFollowUp.ts/CiFollowUp.tsx collision and unbounded store inference; `4f9cdebb9:.planning/slice-plans/569-retry-a-slow-landed-ci-build/slice-3-preparation-proof.md` records fixes and renewed proof. Slice 4's first fresh formatting also refused one unused test parameter before accepted `9befabc42`.
  - Observed effect: independent implementation/refactor and behavior proof preceded coordinator repair loops. All publication gates held; renewed affected browser/native/type proof passed. The actual saving from an earlier read-only check is unmeasured.

- Execution: SEED-261#map-ci-proof-test-data (plan577; first implementation `fc2edb326ee9dbcfb5e9ec6db1fc9eaf76f24969`)
  - Timestamp: unknown (2026-11-10, slice3 delivery)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed VERSION at established claim `efc80fb31`)
  - Evidence: launch `4f1ead35-9023-4e92-8337-36d4fd67ce26`; after105 browser/backend tests,19 collector comparisons and independent refactor, fresh formatting found four no-unsafe-assignment errors in two TS harnesses. `0dd938e1a:.planning/slice-plans/577-map-ci-proof-test-data/slice-3-typing-repair.md` retains the correction and emitted-JavaScript comparison.
  - Observed effect: commit/publication were withheld; narrow opaque return typing, typecheck/affected Node proof and preparation retry settled the gate. Browser proof stayed applicable because emitted JavaScript was identical.
  - Inference: late authored-file lint feedback recurred under coordinator-owned formatter/hook instructions; an earlier read-only lint's counterfactual saving remains unmeasured.

- Execution: SEED-305#keep-ci-wall-time-history-readable-across-dashboard-updates (plan 581; first implementation `c9c6c06453f04b8b6144a34a563fbda1327cc960`)
  - Timestamp: unknown (2026-11-11 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed dough-update/VERSION at accepted Take cbed76e81)
  - Evidence: launch cf7e0024-2e9e-4725-83d5-51fda295de55; first guarded fresh returned formatting failure for an unused callback parameter and forbidden non-null assertion in ci-history-reader-compatibility.spec.ts after green focused proof and independent refactor; coordinator corrected them and reran that spec.
  - Observed effect: One mechanical repair/proof/preparation loop preceded publication; formatter and hook ownership were honored. Earlier lint savings remain unmeasured.

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

## ODF-333 — Story Branch proof requires trunk before closure <a id="odf-333"></a>

Former local code: DD-387. Former local code: DD-401. Former local code: DD-394 (`6c354905e`), renumbered in merge `966aad8b1`. Two local facets enter this gate: closure commitments owned by completion or wrap-up but allocated to the last slice must be observed before its done transition (DD-387), and a Story Branch rollout slice released from trunk without a step landing the earlier slices (DD-401). [Meaning, evidence and response](docs/maintainer/findings/ODF-333.md).

### Occurrences

- Execution: SEED-304#show-one-ci-proof-row-per-location (plan 582; first related implementation `a6efa3d48ea6acd5d6682b769e2fd135710a728b`)
  - Timestamp: 2026-11-11T09:44:00+08:00
  - Tool: Cursor
  - Open Dough release: 0.3.94
  - Evidence: Plan Existing solutions required Trunk Mode (`--trunk`) so production deployment needed no branch landing checkpoint; established start was `mode: story-branch` on `cursor/show-one-ci-proof-row-per-location`. Slice 2 pre-condition needs `origin/main`. Coordinator transcript `2dce1ff7-595f-4119-8243-6da1ce9127bb` turn 58 unfinished handoff; owner authorized land; merge `28cf896d38d64aaff6af0f7c3954704ff360f169`.
  - Observed effect: One mid-execution human stop and `--keep-worktree` land before live production observation; slice 1 branch CI left unobserved when that stop closed its observer.
  - Inference: Plan Trunk Mode prose did not change the Take's story-branch mode or name a retained-landing checkpoint, so the trunk-before-completion gate recurred. Distinct from lifecycle-commitment allocation (DD-387 facet).


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

## ODF-396 — Planning basenames overwhelm a test-local consumer trace

Former local code: DD-404. [Evidence and current response](docs/maintainer/findings/ODF-396.md).

### Occurrences

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

- Execution: SEED-285#retry-a-slow-landed-ci-build (plan 569; first implementation `8aeda2ade7baf09656cd6823e3031ebbf1a797ce`)
  - Timestamp: unknown (2026-11-10 execution)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed guidance)
  - Evidence: final slice 3 refactor traced 963 consumers; slice 4 implementation/refactor disposition tables `/tmp/seed285-slice4-4f9cde-consumer-dispositions.md` and `/tmp/seed285-refactor4-4f9cde-consumer-dispositions.md` contain 847 and 849 nonempty per-file dispositions, including generic planning-name matches. Accepted product proof is retained at `9befabc42:.planning/slice-plans/569-retry-a-slow-landed-ci-build/`.
  - Observed effect: coordinator checked every disposition and repeatedly retrieved targeted passages after large combined reads truncated. No missed product consumer is established; isolated trace time/token cost is unmeasured.

- Execution: SEED-261#map-ci-proof-test-data (plan577; first implementation `fc2edb326ee9dbcfb5e9ec6db1fc9eaf76f24969`)
  - Timestamp: unknown (2026-11-10 execution)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed VERSION at established claim `efc80fb31`)
  - Evidence: slice1's generated trace was731 lines; slice3 reported687 located rows and slice4 reported980, deriving dirty PLAN/source-review basenames beside explicit fragment/count/factory terms. `a0357d569:.planning/slice-plans/577-map-ci-proof-test-data/` retains literal focused commands and function-level consumer dispositions; raw traces stayed under `/tmp/slice*-consumer-trace.md`.
  - Observed effect: broad lexical/record matches required many exclusions and a truncated combined coordinator read. Later bounded inspection and function-level impact selection retained actual indirect consumers, including two additional browser journeys; no missed consumer is established.
  - Inference: planning-basename/generic-term noise recurred alongside useful tracing. Isolated time/token cost and savings from a narrower search were not measured.

- Execution: SEED-305#keep-ci-wall-time-history-readable-across-dashboard-updates (plan 581; first implementation `c9c6c06453f04b8b6144a34a563fbda1327cc960`)
  - Timestamp: unknown (2026-11-11 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed dough-update/VERSION at accepted Take cbed76e81)
  - Evidence: launch cf7e0024-2e9e-4725-83d5-51fda295de55; /tmp/seed305-consumer-dispositions.md and /tmp/seed305-direct-consumer-dispositions.md; combined coordinator read reported 81,029 original tokens before output truncation, including PLAN.md/source-review.md and broad schema matches.
  - Observed effect: Targeted follow-up reads recovered actual response, hook and browser consumers; every affected consumer passed. No missed consumer is established; isolated trace cost is unmeasured.


- Execution: SEED-307#apply-shared-page-object-rules-per-entry (plan 590; first implementation `48fd7667f08c15e5121be38593e11fb659f20298`)
  - Timestamp: unknown (2026-11-11 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.95 (checkout-bound installed VERSION at accepted Take `80d20ed9e`)
  - Evidence: Final slice-4 trace at `fd9612e2891d4ca12bfc6bbd83718ec6b51326cb:.planning/slice-plans/590-apply-shared-page-object-rules-per-entry/slice-4-makeme-integration.md#independent-controls-correspondence-and-disposition` recorded815 dispositions:27 run,21 reused,767 excluded. Automatically derived `PLAN.md`, `source-review.md`, `SKILL.md` and `convention.md` appeared beside concrete product-effect terms. The independent refactor reused the same disposition set and made no edits.
  - Observed effect: hundreds of lexical-only exclusions and repeated coordinator inspection were required alongside useful runtime/payload tracing. No missed product consumer or isolated time/token saving is established.
  - Inference: same generic source-basename expansion cost as ODF-396. Separating record/basename noise from meaningful effect leads is a proposal for later judgment, not authorization to weaken indirect proof.

## ODF-427 — A Story Branch keep-worktree landing hand-writes its publication script

Former local code: DD-425. [Evidence and current response](docs/maintainer/findings/ODF-427.md).

### Occurrences

- Execution: SEED-304#show-one-ci-proof-row-per-location (plan 582; first related implementation `a6efa3d48ea6acd5d6682b769e2fd135710a728b`)
  - Timestamp: 2026-11-11T09:48:53+08:00
  - Tool: Cursor
  - Open Dough release: 0.3.94
  - Evidence: Coordinator transcript `2dce1ff7-595f-4119-8243-6da1ce9127bb` turns 71–76: `history-preserving-publication.mjs integrate --help` then inline `node --input-type=module` calling `publishHistoryPreservingCandidate` with `onFetchedTarget`/`affectedCheck`; land accepted as merge `28cf896d38d64aaff6af0f7c3954704ff360f169`.
  - Observed effect: Keep-worktree landing required a hand-written publication wrapper again before slice 2 could observe production.
  - Inference: Same CLI/callback gap as prior ODF-427; not resolved by 0.3.94.


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

<a id="dd-442--a-shallow-historical-checkout-still-inherited-the-host-git-object-store"></a> DD-442 — A shallow historical checkout still inherited the host Git object store. [Project evidence](docs/maintainer/project-maintenance-findings.md#dd-442).

<a id="dd-445--timeout-headroom-judged-from-one-hosted-run-missed-run-to-run-variance"></a> DD-445 — Timeout headroom judged from one hosted run missed run-to-run variance. [Project evidence](docs/maintainer/project-test-findings.md#dd-445).

<a id="dd-450"></a><a id="dd-450--a-plans-identical-step-tree-proof-did-not-account-for-a-per-run-random-value"></a> [DD-450 moved to ODF-074](docs/maintainer/findings/ODF-074.md).

<a id="dd-452--a-shell-check-gained-a-browser-its-ci-job-did-not-install"></a> DD-452 — A shell check gained a browser its CI job did not install. [Project evidence](docs/maintainer/project-findings-history.md#dd-452).

## ODF-434 — Coordinator sends an unsubstituted placeholder to a delegated agent <a id="odf-434"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-434.md). This facet: the implementation brief, not the source-only reviewer.

<a id="dd-463"></a> DD-463 — A reverse import-closure selection silently dropped importers. [Project findings](ProjectFindings.md#dd-463).

<a id="dd-465"></a> DD-465 — An empty focused path list ran the whole local suite. [Project findings](ProjectFindings.md#dd-465).

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
- Execution: SEED-305#keep-ci-wall-time-history-readable-across-dashboard-updates (plan 581; first implementation `c9c6c06453f04b8b6144a34a563fbda1327cc960`)
  - Timestamp: unknown (2026-11-11 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.94 (checkout-bound installed dough-update/VERSION at accepted Take cbed76e81)
  - Evidence: launch cf7e0024-2e9e-4725-83d5-51fda295de55; guarded fresh returned preparation-failed at staged whitespace, PLAN.md:89, +Status: done. The original plan used a two-space Markdown hard break; selected-slice-status.mjs:59 replaces planned only and retains that suffix.
  - Observed effect: One records-only whitespace repair and preparation retry; no commit or push occurred on refusal. Same status-writer/whitespace-gate mismatch remains in installed 0.3.94.
