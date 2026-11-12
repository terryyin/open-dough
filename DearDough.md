# DearDough Process Findings

The [shared finding catalog](docs/maintainer/finding-names.md) holds reconciled
evidence, former codes and response history. This log retains Open Dough
observations and context beyond those catalog records. See
[ProjectFindings.md](ProjectFindings.md) for repository-owned findings.

## Retention

- Highest allocated local number: 510. Removed numbers are never reused.
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
- Execution: SEED-320#open-terminal-only-without-a-custom-instruction (spent plan 597 recoverable at before-cleanup `f595336fb608dcfebfaa01685141db1b61fbcaf6`; first implementation `43782e67d4ae1a68a3d5e1cffaafbc13e2a588e6`)
  - Timestamp: unknown (2026-11-12, about 09:55–10:10+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: slice 1 changed `dashboard/tests/support/cursorSessionReading.ts` `openTakenCursorSession`. The implementation return listed its consumers as the Cursor session specs of the plan's premises table and ran those; the refactor agent's trace found `support/cursorSessionRecovery.ts` also calls it, reaching nine more specs (`cursor-session-recovery-wait`, `-restart`, `-replacement`, `cursor-runner-replacement`, `-controls`, `cursor-runner-helper-survival`, `cursor-session-scope-continuation`, `-noninterference`, `cursor-session-alerts`). The coordinator computed the transitive importers (22 specs) and ran them before publishing `43782e67d`.
  - Observed effect: one extra 7-minute local run before publication; no failure reached CI from this cause.
  - Inference: the implementer selected proof from the plan's list of failing specs, not from importers of the support module it changed; the consumer-trace output was dominated by plan-file matches.

- Execution: SEED-330#invoke-custom-ci-rebuilds (plan 606; first implementation `5bad29b07b263aa42a777fa8fbc1d24de03b102e`)
  - Timestamp: unknown (2026-11-12 CI event; exact occurrence time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.97 (checkout-bound installed VERSION at established claim `1117582709db72b2c3bc842ef4e388d9e6866a8d`)
  - Evidence: Slice 2 `b2899a8f5` extracted `ci-command-attempt.mjs`, imported by promoted `ci-proof-read.mjs`, without its payload declaration. CI run43235536671/1 failed four native evidence families. The repair reproduced both those omissions and actual installed `ERR_MODULE_NOT_FOUND`; `b51be060e2efde855d8cdb27d51bee0d7cd6667b` added the declaration and installed-reader proof in both roots after fresh install/update and unavailable release source. Plan606 source-review at that repair retains exact commands; 17 focused checks passed.
  - Observed effect: one owned published CI failure paused in-flight slice3, which was preserved and restored around an independent repair. Source transport/proof tests alone had not established installed dependency closure.
  - Inference: Matches the existing indirect-consumer omission: extracting a promoted runtime dependency immediately reaches the assembled payload and native fixture identity, regardless of the later documentation slice. No claim of measured isolated cost or released-user impact.


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

## ODF-158 — Disproportionate required reference reads <a id="odf-158"></a>

Former local code: DD-128. [Meaning, evidence and response](docs/maintainer/findings/ODF-158.md).

### Occurrences

- Execution: SEED-307#run-makeme-harness-once (plan 594; first implementation `67b8c207b174b90a30b6e2edf217d5b59b31b393`)
  - Timestamp: unknown (2026-11-11 execution, between Take `0cc07ac04` and the execution-complete record)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` at accepted Take `0cc07ac0443d5f9d1c807e4cc533cda165136426`)
  - Evidence: coordinator conversation: 19 `dough-execute-plan/references` files totalling 2,836 lines were read at their boundary rows for one planned slice whose product change was 64 lines in three files. The three delegated agents (source review, implementation, refactor) reported 42,579, 103,651 and 90,439 tokens. Paths read and not taken: CI failure repair and stash, rejected push, rebase conflict, interrupted publication, oversized slice and live-action proof.
  - Observed effect: no truncation, rework or error; each boundary read arrived as its own tool result as the ODF-264 response prescribes. Context was spent on procedures the managed start, delivery and completion commands carried out.
  - Inference: qualified. The coordinator read `execution-decisions.md`, `trunk-publication.md`, `story-obligations.md` and `ci-monitor.md` whole where a boundary row named one section, so part of the volume was its own choice. Cost only; this run shows no harm to quality.
- Execution: SEED-318#remove-unused-taken-comparison-navigation (plan 596; first implementation `d368840eedcab86a7090228751d27afaa4789bcb`)
  - Timestamp: unknown (2026-11-12, between Take `d9320ac4e` and the execution-complete record, about 09:20 to 09:50 +08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` in the execution checkout at Take `d9320ac4e`)
  - Evidence: coordinator conversation: 15 `dough-execute-plan/references` files, about 2,150 lines, were read at their boundary rows for one planned Structure slice whose product change deleted 28 lines in one test-support file. The three delegated agents (source review, implementation, refactor) reported 41,375, 68,672 and 53,704 tokens; the source review returned 19 commitment ids, each recorded with its own `observed:` cell. Paths read and not taken: CI failure repair, rejected push, rebase conflict, interrupted publication, oversized slice, live-action proof and one-shot starts.
  - Observed effect: no truncation, rework or error; the refactor pass returned no change. The preparation scratch had already run the same deletion with the same typecheck and journey.
  - Inference: qualified. `execution-decisions.md`, `story-obligations.md`, `trunk-publication.md` and `deliver-the-change.md` were again read whole where a row named a section. Cost only; the fixed procedure does not shrink with the change, so the ratio is at its widest on a deletion-only correction.

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

- Execution: SEED-310#show-trunk-test-scope-timing-history (plan581; first implementation `2e8d46e0ecfdca9183102690c26c34a075bde715`)
  - Timestamp: unknown (2026-11-11 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at accepted Take `4f52bca1`; no release marker retained in startup context)
  - Evidence: launch `5c494f68-0b89-4fd0-9561-2ebba78cc986`; coordinator consumer-trace read reported50595 original tokens with truncation, followed by a6059-token filtered result that also truncated. Targeted product/assertion reads and the implementation return recovered the needed evidence.
  - Observed effect: excessive generated output and repeated retrieval under existing disposable-research guidance; command handles and proof remained intact.
  - Inference: agent output-scoping deviation, not missing instructions; no isolated elapsed/token saving measured.

- Execution: SEED-325#review-junit-tests-in-intent (plan 600; first implementation `4980feb6d2aabb7fafc087942c1e28c8c2b86e04`)
  - Timestamp: unknown (2026-11-12 execution; exact read/trace-event times not retained)
  - Tool: Codex
  - Model: gpt-6.1-sol (execution profile)
  - Open Dough release: 0.3.97 (checkout-bound installed guidance at accepted claim `75c9981a0d5116d770c3e4eba3058a0f7cd9ddea`)
  - Evidence: dashboard launch `64396061-305e-4f4d-bc38-7f06de9b3f38`; coordinator first-delegation reference batch reported 11,733 original tokens with truncation; the complete consumer-trace read reported 60,774 original tokens with truncation, followed by bounded symbol/consumer and assertion reads. The trace is recoverable at the implementation revision above under `.planning/slice-plans/600-review-junit-tests-in-intent/consumer-trace.md`.
  - Observed effect: raw generated output and broad batches omitted passages and required targeted recovery; semantic proof and running-command ownership remained intact.
  - Inference: recurrence of an agent output-scoping deviation under existing retrieval guidance; isolated elapsed/token saving is unmeasured.

- Execution: SEED-300#express-review-test-intent-through-page-objects (plan582; first implementation `14d6f4e9f47ee91fdedadc28856ce0b50c38f777`)
  - Timestamp: unknown (2026-11-12 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at accepted Take750e9e4f2; no execution-time release marker retained)
  - Evidence: Dashboard launch39024964-857a-4f8a-9668-fb62a939fb7e: coordinator combined source/owner reads returned21,058original tokens with truncation; retrospective context batch returned17,041; a process-log match batch also truncated. The coordinator recovered selected story/owner and finding sections and parsed proof JSON fields before acceptance.
  - Observed effect: Repeated bounded retrieval recovered omitted text; command/session handles and actual proof verdicts were retained.
  - Inference: Matches the existing agent output-scoping deviation under targeted-retrieval guidance; no measured total-token/time saving or missing final observation is claimed.


- Execution: SEED-329#guard-scheduled-test-makeme-selection (plan 605; implementation `7ea0f13015410c406a75a78c7ccae46329f2ccf6`)
  - Timestamp: unknown (2026-11-12 execution; exact read-event times not retained)
  - Tool: Codex
  - Model: gpt-6.1-sol (execution profile)
  - Open Dough release: unknown (checkout-bound installed guidance at accepted claim `3fc68398c`)
  - Evidence: launch `d0933767-a8de-46d9-a9c2-9589c6cf4313`; initial delegation/context batches reported 14,543 and 13,044 original tokens with truncation; coordinator retrieved the missing source-review, execution-decisions, delegation and test-selection passages separately before delegation.
  - Observed effect: broad combined output omitted required passages and required targeted rereads; implementation and terminal proof were retained. Inference: recurrence of agent read-batching deviation under existing boundary/retrieval guidance, not missing instructions; isolated time/token saving is unmeasured.

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

- Execution: SEED-307#apply-shared-makeme-rules-per-entry (plan 589; first implementation `ec131e188ece02d28504c610a2812f0c325798d2`)
  - Timestamp: unknown (2026-11-11 slice-3 and slice-4 delivery; exact formatter-event times unavailable)
  - Tool: Codex
  - Open Dough release: 0.3.95 (installed `.agents/skills/dough-update/VERSION` at accepted Take `24f1647fb91aea54cced8e5ff5f0321579b29353`)
  - Evidence: `703fc242c84631550a54061cfd53ac8163f10da2:.planning/slice-plans/589-apply-shared-makeme-rules-per-entry/slice-3-evidence.md` and `slice-4-evidence.md`, fresh-preparation repair sections; coordinator tool results returned `operation: formatting` for no-param-reassign in changed-makeme.mjs, then SC1091/SC2016 on companion sourcing and intentionally literal shell text after the next slice's independent refactor.
  - Observed effect: the guards withheld commit/publication; a local constant and narrowly scoped ShellCheck annotations repaired the named operations. The changed-scope tests passed after the semantic-equivalent local-constant repair; annotation-only repairs reused unchanged runtime/observing assertions. No paid native repeat was required.
  - Inference: late authored-file lint feedback recurred under briefs reserving formatter and hook-owned lint to the coordinator. This establishes repair/preparation loops, not measured savings from an earlier read-only check.

<a id="dd-349--post-change-refactor-compressed-planmd-story-obligations-under-the-file-size-gate"></a>

- Execution: SEED-310#show-trunk-test-scope-timing-history (plan581; first implementation `2e8d46e0ecfdca9183102690c26c34a075bde715`)
  - Timestamp: unknown (2026-11-11 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at accepted Take `4f52bca1`; no release marker retained in startup context)
  - Evidence: slice1 guarded fresh formatting refused no-param-reassign on frontendServices.projects and require-await on an immediate rerun callback after passing browser/type proof and independent refactor. `2e8d46e0:.planning/slice-plans/581-show-trunk-test-scope-timing-history/slice-1-proof.md` retains the mechanical Object.assign/Promise.resolve repair and unchanged-proof rationale.
  - Observed effect: commit/publication were correctly withheld until the mechanical repair and preparation retry; authored-file lint feedback arrived at coordinator delivery. Earlier-check savings remain unmeasured.

- Execution: SEED-307#run-makeme-harness-once (plan 594; first implementation `67b8c207b174b90a30b6e2edf217d5b59b31b393`)
  - Timestamp: 2026-11-11T23:48:51+08:00
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` at accepted Take `0cc07ac0443d5f9d1c807e4cc533cda165136426`)
  - Evidence: coordinator tool results: after the runner proof and the independent refactor, the first guarded fresh returned `preparation-failed`, `operation: formatting`, ShellCheck SC2249 (no default `*)` case) on the new aggregate-exclusion `case` in `scripts/test-jobs.sh`. Both briefs forbade formatting and hook-owned lint. The coordinator moved `add_job` into a `*)` branch, reran six runner tests and retried.
  - Observed effect: commit and publication were withheld for one mechanical repair, proof and preparation loop of about two minutes before accepted `67b8c207b`.
  - Inference: late authored-file lint feedback recurred under briefs reserving the formatter and hook-owned lint to the coordinator. The saving from an earlier read-only check is unmeasured.

- Execution: SEED-316#select-and-copy-terminal-text-on-mobile (spent plan 591 recoverable at before-cleanup `ebaf16f6336d2d9111f95984b907a006b67f3c04`; first implementation `19442de208fdc14881c3ad75a77e321cd71441bf`)
  - Timestamp: unknown (2026-11-11, minutes before publication of `19442de20`, whose hosted run started 20:58:54+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION` at accepted Take `19e0e454a`)
  - Evidence: launch `1c7a1eb2-5a2b-46f1-b563-577760ee7210`; slice 1's first guarded fresh returned `preparation-failed`, `operation: formatting`, two `no-control-regex` errors in new `dashboard/tests/support/terminalSubstituteApplication.ts` after accepted proof and the independent refactor. Both briefs forbade hook-owned lint. The coordinator rebuilt the two patterns with `new RegExp`, reran the spec and typecheck, and the retry published. The slice 2 and 3 briefs then asked for a read-only `npx prettier --check` / `npx eslint` on owned files; neither slice's guarded fresh refused.
  - Observed effect: one mechanical repair, one 21-second proof rerun and one preparation retry before the first publication; none in the two later slices of the same execution.
  - Inference: within this one execution the read-only check coincided with no late refusal; two slices do not measure the saving.

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

- Execution: SEED-310#show-trunk-test-scope-timing-history (plan581; first implementation `2e8d46e0ecfdca9183102690c26c34a075bde715`)
  - Timestamp: unknown (2026-11-11 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at accepted Take `4f52bca1`; no release marker retained in startup context)
  - Evidence: after a staged-whitespace stop, fresh retry returned staging failure for already-staged deleted source dashboard/tests/intent/intent-scope-timing-history-reading.spec.ts (three frontend moves). Classifying those old sources as stagedPaths and existing/new files as ownedPaths accepted `2e8d46e0`; `/tmp/seed310-slice1-preparation.json` and `e37801b5:.planning/slice-plans/581-show-trunk-test-scope-timing-history/execution-context.md` retain recovery context.
  - Observed effect: one staging refusal and input-classification retry before publication, with no lost deletion/source/proof. Inference: same already-absent-index condition as the existing finding, not every unstaged deletion.

- Execution: SEED-287#fit-dashboard-journeys-in-default-timeout
  - Timestamp: unknown (2026-11-12 operation; exact staging-event time not separately retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound managed guidance inherited with maincaf48c6)
  - Evidence: `/tmp/seed287-completion-progress-delivery-20261112.json` returned staging128 for already-removed `.planning/agents/bastiaan-chan.json`; the corrected preparation retains18 deleted paths in stagedPaths and361 existing paths in ownedPaths, publishing `694e6d9192e388e1a702d151854b2e85486871fa`.
  - Observed effect: one pre-commit refusal and a manifest-only retry; formatter reran, no deletion or accepted65-attempt proof was lost. Same literal-add/already-absent-index condition as ODF-337, not evidence that unstaged deletions generally fail.

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
- Execution: SEED-310#show-trunk-test-scope-timing-history (plan581; first implementation `2e8d46e0ecfdca9183102690c26c34a075bde715`)
  - Timestamp: unknown (2026-11-11 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at accepted Take `4f52bca1`; no release marker retained in startup context)
  - Evidence: `e37801b5:.planning/slice-plans/581-show-trunk-test-scope-timing-history/slice-2-proof.md` records778 consumer dispositions (23 run,13 reused,742 lexical/unaffected exclusions), including generic field and planning terms; raw trace `/tmp/seed310-slice2-consumer-trace.md`. The later three-path private-prefix refactor used explicit --path inputs and69 dispositions; scopes differ, so this is no comparable savings measurement.
  - Observed effect: large planning/generic lexical tables required many exclusions beside useful real-consumer tracing. Wrap-up later found and repaired two active SEED-300 audit links still pointing to the moved integrated reading/units specs; all affected browser consumers were observed, and no missing runtime proof was established.
  - Inference: recurrence of planning-basename/generic-term noise; isolate record inputs from product effects while retaining semantic/enclosing consumer terms. No total cost reduction was measured.

- Execution: SEED-307#apply-shared-makeme-rules-per-entry (plan 589; first implementation `ec131e188ece02d28504c610a2812f0c325798d2`)
  - Timestamp: unknown (2026-11-11 slice-3 and slice-4 tracing; exact trace-event times unavailable)
  - Tool: Codex
  - Open Dough release: 0.3.95 (checkout-bound installed guidance at accepted Take `24f1647fb91aea54cced8e5ff5f0321579b29353`)
  - Evidence: `703fc242c84631550a54061cfd53ac8163f10da2:.planning/slice-plans/589-apply-shared-makeme-rules-per-entry/slice-3-evidence.md` records 454 consumer rows (8 run, 446 exclusions); `slice-4-evidence.md` records 782 (42 run, 15 reused, 725 exclusions). Their `/tmp/seed307-slice{3,4}-consumer-trace-dispositioned.md` tables derive generic PLAN.md/SKILL.md terms alongside meaningful runtime effects. The final assessor-only refactor used three explicit paths and guidanceReadCount, locating six consumers.
  - Observed effect: implementation acceptance required many concrete planning/history or unchanged-install exclusions beside real declaration, workflow and test consumers. All affected boundaries had proof; no missed consumer is established. The six-row refactor was a smaller three-helper scope, not an equivalent replacement for the whole-slice trace.
  - Inference: the same planning-basename expansion recurred. Separating record-reference discovery from product-effect tracing remains a candidate; isolated trace time/token cost and counterfactual savings were not measured.

- Execution: SEED-312#speed-up-touch-review-checks (plan 592; first implementation `205452d94e139561afe62ad7d3e65d42bba68063`)
  - Timestamp: unknown (execution 2026-11-11 20:44 to about 2026-11-12 01:30 +08:00; exact event time not retained)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: slice 2's implementation return reports a 611-row consumer trace of which 466 rows matched only `PLAN.md` / `source-review.md`; the slice 2, 3 and 4 refactor returns, run with `--base HEAD` while the coordinator's plan records were uncommitted, each report the same flood beside one real run consumer, `dashboard/tests/review/story-review-touch.spec.ts`. Accepted dispositions are recoverable in the plan's slice notes at `cd20723f7`.
  - Observed effect: four traces of a test-helper change were mostly planning-record rows that each needed an exclusion; no missed consumer is established.
  - Inference: recurrence of planning-basename noise in installed 0.3.96; the uncommitted plan and source review enter the trace's derived terms. Isolated cost is unmeasured.

- Execution: SEED-300#express-dashboard-test-intent-through-page-objects (plan581; first implementation `71d39d5965906dd4dcd28d4d3cd0c1ffcb0a4385`)
  - Timestamp: unknown (2026-11-12 G15 acceptance; exact classification event time not retained)
  - Tool: Codex
  - Open Dough release: 0.3.95 (checkout-bound installed guidance at G15 base3ef6; managed guidance unchanged through816db466)
  - Evidence: `28c1118c5:.planning/slice-plans/581-intent-test-reading/final-gate-evidence.md`; `/tmp/seed300-g15-selected-git-20261112/combined-consumer-trace.md`, `git-command-source-equivalence.json` and `consumer-evidence-normalization.json`. The final1078-row trace has31run/57reused/990excluded; generic PLAN.md and case-insensitive PATH/data-path matches supplied many lexical-only rows.
  - Observed effect: independent review found16 real Dashboard Git receivers excluded in the primary table but already covered by the95-receiver supplement, plus3 independent-Node rows needing consistent exclusion. All19 overlaps were normalized across artifacts before publication, with no source edit, runtime rerun or missed proof established. Bounded coordinator reads avoided the historical truncation symptom; isolated trace/normalization effort was not measured.
  - Inference: matches ODF-396's broad planning/generic-term noise; parallel effect records also needed manual consistency work. Narrow record/data matches away from executable effects and check shared path/effect dispositions together, while retaining real indirect consumers.

- Execution: SEED-325#review-junit-tests-in-intent (plan 600; first implementation `4980feb6d2aabb7fafc087942c1e28c8c2b86e04`)
  - Timestamp: unknown (2026-11-12 execution; exact read/trace-event times not retained)
  - Tool: Codex
  - Model: gpt-6.1-sol (execution profile)
  - Open Dough release: 0.3.97 (checkout-bound installed guidance at accepted claim `75c9981a0d5116d770c3e4eba3058a0f7cd9ddea`)
  - Evidence: `4980feb6d:.planning/slice-plans/600-review-junit-tests-in-intent/consumer-trace.md` has 832 lines and 23 direct consumers marked run, alongside generic PLAN.md/source-review.md/README.md terms and many historical/unchanged-install exclusions. The trace also led to a real regenerated standalone runtime and legacy MakeMe payload check.
  - Observed effect: many lexical-only dispositions surrounded useful selector/grammar consumers; acceptance needed bounded follow-up reads. All reached behavior had passing proof; no missed consumer was established.
  - Inference: same planning-basename expansion; separate record-reference discovery from product-effect tracing without weakening indirect proof. No counterfactual cost reduction was measured.

- Execution: SEED-330#invoke-custom-ci-rebuilds (plan 606; first implementation `5bad29b07b263aa42a777fa8fbc1d24de03b102e`)
  - Timestamp: unknown (2026-11-12 trace/read events; exact event times not retained)
  - Tool: Codex
  - Open Dough release: 0.3.97 (checkout-bound installed VERSION at established claim `1117582709db72b2c3bc842ef4e388d9e6866a8d`)
  - Evidence: Slice2 trace `/tmp/seed330-slice2-consumer-trace.md` had701 disposed rows; slice3 had550 (10 enclosing observations,540 exclusions), independent refactor3 had584, and slice4 had614. Automatically derived PLAN/source-review basenames and generic fields supplied many lexical/history exclusions. A coordinator whole slice1 trace read reported47,358 original tokens and truncation before targeted filtering; later traces were read by bounded purpose/path. Proof summaries/commands are recoverable at `7f85a3f8f10784c920207596922ad5e28c8c5c58:.planning/slice-plans/606-invoke-custom-ci-rebuilds/source-review.md`.
  - Observed effect: hundreds of exclusions and repeated targeted retrieval accompanied useful runtime/payload tracing. Later small refactor traces had18/108 consumers in narrower scopes; they are not equivalent replacement measurements.
  - Inference: Planning-basename noise recurred. Isolated trace effort/token savings are unmeasured, and this row does not claim a missed product consumer from that noise.


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

- Execution: SEED-312#speed-up-touch-review-checks (plan 592; first implementation `205452d94e139561afe62ad7d3e65d42bba68063`)
  - Timestamp: unknown (execution 2026-11-11 20:44 to about 2026-11-12 01:30 +08:00; exact event time not retained)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: acceptance recorded `observed:` cells and the plan's Surviving proof table by `file:line`. The slice 3 refactor, slice 4, and slice 4's returned correction each moved those lines in `storyReviewTouchContext.ts` and `storyReviewTouchJourney.ts`; the coordinator or the implementing agent renumbered the records each time (plan history `d7622bc2b`, `b9d7cb61a`).
  - Observed effect: three renumbering rounds in one five-slice execution, one of them delegated to the slice 4 agent; nothing stale was published.
  - Inference: the same gap in a wider form: any later slice, not only the refactor pass, invalidates line-located observations. Citing the named expectation or helper instead of a line would survive those moves.

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
- Execution: SEED-316#select-and-copy-terminal-text-on-mobile (spent plan 591 recoverable at before-cleanup `ebaf16f6336d2d9111f95984b907a006b67f3c04`; first implementation `19442de208fdc14881c3ad75a77e321cd71441bf`)
  - Timestamp: unknown (2026-11-11, before the first implementation delegation, about 20:30+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION` at accepted Take `19e0e454a`)
  - Evidence: Take base `19e0e454a` PLAN.md has `## Ordered slices and proof ownership`; `story-obligations.mjs list --slice 1` refused `unreadable-slices` and `unknown-slice`; published `19442de20` has `## Ordered slices`. Plans 589 and 590 at that base carry the same longer heading (`589-…/PLAN.md:92`, `590-…/PLAN.md:87`). The seed's recorded assessment was `ready`.
  - Observed effect: one refusal and a one-line plan edit before slice 1 delegation.
  - Inference: same reader contract as the singular-heading occurrence, reached through a descriptive suffix instead; matching rests on that shared contract.
- Execution: SEED-318#remove-unused-taken-comparison-navigation (plan 596; first implementation `d368840eedcab86a7090228751d27afaa4789bcb`)
  - Timestamp: unknown (2026-11-12, before the first implementation delegation, about 09:37 +08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` in the execution checkout at Take `d9320ac4e`)
  - Evidence: Take `d9320ac4e` PLAN.md has `## Ordered slice` for its single slice; `story-obligations.mjs list --slice 1` refused `unreadable-slices` and `unknown-slice`; published `d368840ee` has `## Ordered slices`. The seed's recorded assessment was `ready`.
  - Observed effect: one refusal and a one-line plan edit before slice 1 delegation.
  - Inference: third near-miss form of the same heading; a one-slice plan invites the singular, and readiness still does not run the reader execution uses.

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

## DD-489 — Generic wrap-up publication prose contradicts Story Branch integration

The closure-publication reference says every owned wrap-up commit targets trunk
and “Do not merge the execution branch”, while its explicit Story Branch section
requires a published final-closure branch tip followed by history-preserving
integration. The installed mode guard agrees with the specific branch procedure.

### Occurrences

- Execution: SEED-307#apply-shared-makeme-rules-per-entry (plan 589; first implementation `ec131e188ece02d28504c610a2812f0c325798d2`)
  - Timestamp: unknown (2026-11-11 wrap-up preflight; exact read-event time unavailable)
  - Tool: Codex
  - Open Dough release: 0.3.95 (installed guidance at accepted Take `24f1647fb91aea54cced8e5ff5f0321579b29353`; installed modules remained unchanged)
  - Evidence: `703fc242c84631550a54061cfd53ac8163f10da2:.agents/skills/dough-execute-plan/references/wrap-up-closure-publication.md`, opening paragraphs versus “Observe Story Branch integration”; the same revision's `.agents/skills/dough-story-wrap-up/SKILL.md` requires before-cleanup publication specifically in Trunk Mode. Coordinator and read-only closure preflight inspected the installed delivery guard, which enforces story-branch delivery to the recorded execution branch and refuses main.
  - Observed effect: two readers had to reconcile the generic wording against the mode-specific procedure and executable guard. They retained branch publication followed by history-preserving trunk integration, without changing the established mode or asking for new authority. No wrong-target push or integration failure is attributed to this discrepancy.
  - Inference: qualify the generic opening by its applicable mode and align it with the specific Story Branch sequence. This is a guidance-consistency proposal, distinct from ODF-333's trunk-before-execution-completion cycle; no guidance change is authorized by this review.

- Execution: SEED-300#express-review-test-intent-through-page-objects (plan582; first implementation `14d6f4e9f47ee91fdedadc28856ce0b50c38f777`)
  - Timestamp: unknown (2026-11-12 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at accepted Take750e9e4f2; no execution-time release marker retained)
  - Evidence: `6d0e0f14726045ecb548e737d22f89e87f765cdb:.agents/skills/dough-execute-plan/references/wrap-up-closure-publication.md`, generic opening versus Observe Story Branch integration; same revision story-wrap-up body limits before-cleanup trunk publication to Trunk Mode.
  - Observed effect: The coordinator compared the contradictory paths and retained the explicit established Story Branch sequence: published closure tip, then history-preserving integration. No mode change or wrong-target publication was made at this review boundary.
  - Inference: Same guidance-consistency issue, not new publication authority; align the generic opening with its mode-specific owner. No guidance edit is authorized by this review.


## DD-490 — Linking further commitments to an obligation leaves its Commitment field naming only the first

`story-obligations.mjs record --commitment <id> --obligation <entry>` with entry fields writes the entry and its `Commitment:` line for that one id. Later `record --commitment <other> --obligation <entry>` calls set the review rows but leave the entry's `Commitment:` line unchanged, so the next `list` refuses `mismatched-commitment` until the line is edited by hand.

### Occurrences

- Execution: SEED-316#select-and-copy-terminal-text-on-mobile (spent plan 591 recoverable at before-cleanup `ebaf16f6336d2d9111f95984b907a006b67f3c04`; first implementation `19442de208fdc14881c3ad75a77e321cd71441bf`)
  - Timestamp: unknown (2026-11-11, before the first implementation delegation, about 20:30+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION` at accepted Take `19e0e454a`)
  - Evidence: five `record` calls linked S1.7, S1.8, S1.9, X5.2 and X5.9 to O1, each returning `ok: true`; the plan then read `Commitment: S1.7` and `list --slice 1` returned four `mismatched-commitment` problems naming the other rows. The coordinator rewrote the line to list all five.
  - Observed effect: one refusal and one hand edit of the plan, the kind of edit the `record` operation exists to avoid.

## DD-491 — A proof limitation accepted at slice acceptance returned as a queued correction after Intent Coverage

At slice acceptance the coordinator returned the proof for the state the story's example names and explicitly let two further states the plan's decision enumerates stand as a named limitation. The wrap-up Intent Coverage check then confirmed that limitation as a missing test path, and closure had to create a correction story, a plan, a premise observation, a readiness record and a queue entry for it.

### Occurrences

- Execution: SEED-316#select-and-copy-terminal-text-on-mobile (spent plan 591 recoverable at before-cleanup `ebaf16f6336d2d9111f95984b907a006b67f3c04`; first implementation `19442de208fdc14881c3ad75a77e321cd71441bf`)
  - Timestamp: unknown (2026-11-11; acceptance about 20:50+08:00, Intent Coverage report 23:51+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION` at accepted Take `19e0e454a`)
  - Evidence: plan 591 decision 1 names `vt200`, `drag` and `any`; the coordinator's return of slice 1 asked for the `any` case and said `vt200` and `drag` "may stay as members of the same list without their own page opens"; the plan's slice 1 `Accepted:` text records it. Intent Coverage at `7981c2cce` removed `"vt200"`: maintained spec 2 passed, scratch witness failed. Closure wrote `SEED-316#prove-swipe-under-button-event-tracking` and plan 596 and ran one more scratch witness for `drag`.
  - Observed effect: a second planned work item for two page opens of an existing test, estimated by the returning agent at about four seconds each.
  - Inference: the coordinator weighed test run time and not the closure cost of an evidenced gap. Whether acceptance should hold every state a plan decision enumerates is a judgment this record does not settle.

## DD-492 — A plan promised an existing layout family would stay green without measuring the room a new pinned control needs

The plan's proof named the phone toolbar's measuring specs as preserved consumers and its premises observed selection, copying and scrolling, but no premise measured whether a fourth pinned key fits the narrowest proof viewport. Implementation found it does not, and the trade-off reached the developer only at the completion handoff.

### Occurrences

- Execution: SEED-316#select-and-copy-terminal-text-on-mobile (spent plan 591 recoverable at before-cleanup `ebaf16f6336d2d9111f95984b907a006b67f3c04`; first implementation `19442de208fdc14881c3ad75a77e321cd71441bf`)
  - Timestamp: unknown (2026-11-11, slice 2 implementation between about 21:15 and 22:30+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION` at accepted Take `19e0e454a`)
  - Evidence: plan 591 slice 2 "Preserved consumers: the `tests/terminals/agent-terminal-touch*` family"; the slice 2 return measured the lane before Enter at 228 pixels before and 172 after at a 390-pixel viewport, and unchanged `agent-terminal-touch-keys.spec.ts` failed "Down is cut by what clips it". The story fixes **Select** beside **Paste**, so the coordinator kept it, the keys spec gained two sideways strokes, and the plan and handoff carry the layout choice.
  - Observed effect: slice 2's implementation took about 77 minutes of agent time, part of it on this diagnosis and on timeouts from other worktrees' load; one existing spec was adapted; one product choice is left with the developer after delivery.
  - Inference: a width measurement in preparation, as cheap as the premises that were observed, would have put the choice before the developer at refinement. The share of the 77 minutes due to this premise is not separable from the load-related share.

## DD-493 — A source-only review numbers context and proof-method statements as commitments that each need an observation

The source-only reviewer returned every clause of the story's Goal, Scope, key examples, UI and scope limits as a numbered commitment, including a context sentence and statements about what automated proof covers. Each row needs an allocation and, before its slice's check passes, an `observed:` cell.

### Occurrences

- Execution: SEED-316#select-and-copy-terminal-text-on-mobile (spent plan 591 recoverable at before-cleanup `ebaf16f6336d2d9111f95984b907a006b67f3c04`; first implementation `19442de208fdc14881c3ad75a77e321cd71441bf`)
  - Timestamp: unknown (2026-11-11; review returned about 20:25+08:00, observations recorded at each of three acceptances)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION` at accepted Take `19e0e454a`)
  - Evidence: `source-review.md` beside plan 591 holds 112 rows for a three-slice story, among them U1 ("Context: the developer is reading on a small screen…"), nine X5 rows restating the story's automated-proof limit and seven trigger rows (K1.0–K7.0). The coordinator recorded one `observed:` per row through about 110 `record` invocations in three batches and re-recorded three rows when a later slice renamed a test helper.
  - Observed effect: every promise had an inspected location at acceptance, and the U11 row exposed one promise with no automated assertion. The context, trigger and proof-method rows added cells whose text restates setup or the story's own limit.
  - Inference: the reviewer brief asks for "trigger/journey examples and exclusions" beside commitments without separating which need an observation; the cost here is qualified, as no time was measured.
- Execution: SEED-320#open-terminal-only-without-a-custom-instruction (spent plan 597 recoverable at before-cleanup `f595336fb608dcfebfaa01685141db1b61fbcaf6`; first implementation `43782e67d4ae1a68a3d5e1cffaafbc13e2a588e6`)
  - Timestamp: unknown (2026-11-12; review returned before the first delegation, observations recorded at slice 2 acceptance)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: `source-review.md` beside plan 597 holds 44 rows for a two-slice story, among them 1.4 ("Reason for 1.3: a session started with nothing typed waits for the developer"), 3.3, 5.5 ("5.1 to 5.4 are existing behavior that is retained, not new behavior") and 9.3, which restate a reason or another row. The coordinator recorded 44 `observed:` cells in one batch; five (1.4, 5.5, 8.1, 8.2, 5.4) cite an unchanged product location because no assertion can observe a reason or an absence.
  - Observed effect: every promise had a location at acceptance; the reason and restatement rows added cells that repeat neighbouring rows.


- Execution: SEED-315#speed-up-provider-rate-limit-checks (plan 598; first implementation `9b471af203402da781472742b50c0bce1929689b`)
  - Timestamp: unknown (2026-11-12; review returned before the first delegation, observations recorded at two acceptances)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: `source-review.md` beside plan 598 holds 91 rows for a two-slice test-speed story, among them M7 and M8 (the Success measure's "Retained reference" figures), X2 ("They may adopt the same fixture later."), ten S3 rows for one "do not change" sentence and six S7 rows for one "No new … to obtain a saving" list. The coordinator recorded one `observed:` per row through about 90 `record` invocations in two batches.
  - Observed effect: every promise had an inspected location at acceptance. The reference-figure, permission and negated-means rows received cells that restate the diff's absence of a change or the plan's run table.
  - Inference: same cause as the first occurrence; cost qualified, no time measured.
- Execution: SEED-326#pass-later-proof-comparison-checks-under-load (spent plan 589 recoverable at before-cleanup `4368ce5b9d63f1de43040488fd110fe81bd9eeb2`; first implementation `2202c53fb2d3a4e26599b450d8bb00d9311f1ca3`)
  - Timestamp: unknown (2026-11-12; review returned before the first delegation, observations recorded at three acceptances)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: `source-review.md` beside plan 589 held 60 rows for a three-slice test story, among them four dated observation rows (O1–O3.2), S4.3 ("Terry named \"moderately high CPU load\" without a figure") and six restriction rows for one "no timeout overrides, `test.slow()`, sleeps, retries or skips" sentence.
  - Observed effect: every promise had a location at acceptance; the S2.3b row exposed one promise owned only by composition, recorded as an obligation. The observation, qualification and negated-means rows received cells restating the plan's premises or the diff's absence of a change.

- Execution: SEED-325#review-junit-tests-in-intent (plan 600; first implementation `4980feb6d2aabb7fafc087942c1e28c8c2b86e04`)
  - Timestamp: unknown (2026-11-12 execution; exact read/trace-event times not retained)
  - Tool: Codex
  - Model: gpt-6.1-sol (execution profile)
  - Open Dough release: 0.3.97 (checkout-bound installed guidance at accepted claim `75c9981a0d5116d770c3e4eba3058a0f7cd9ddea`)
  - Evidence: `4980feb6d:.planning/slice-plans/600-review-junit-tests-in-intent/source-review.md` retains 76 C/Q/J/X rows for one slice, including eight deferred-capability exclusions and separate no-fixed-Maven/no-fixed-Gradle qualifications. Coordinator accepted them through 76 sequential `record` operations; multiple rows cite the same inspected production diff or journey.
  - Observed effect: every source promise had an inspected location; qualification and exclusion rows also required observation cells restating existing selection or absence of deferred implementation. No missed source promise was found.
  - Inference: recurrence of the source-review extraction/observation-granularity issue; no isolated cost or benefit of a different grain was measured.


## DD-494 — A story's "still proves" example named a result the base's checks never asserted

Former branch-local code: DD-490 in `03dff46c0`; renumbered during integration to preserve the unrelated finding already published on trunk.

A test-speed story promised that its faster checks "still" prove a behavior.
The base's journey did not assert all of it, so the plan's rule that cases only
lose work could not satisfy the story's own example.

### Occurrences

- Execution: SEED-312#speed-up-touch-review-checks (plan 592; first implementation `205452d94e139561afe62ad7d3e65d42bba68063`)
  - Timestamp: unknown (execution 2026-11-11 20:44 to about 2026-11-12 01:30 +08:00; exact event time not retained)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: the story's key example reads "Rotating to landscape and back keeps the file, the comparison and both reading places"; its source evidence, `.planning/evidence/SEED-303-early-handoff/coverage-map.md` row 37, says "both pane positions"; at base `58442ace8` `keepReviewContextThroughTouch` compared only the code pane's place across rotation, Maximize and Restore. The source-only review's per-clause commitments 14d, 14f and 14g exposed the gap at slice 4 acceptance; the slice was returned and `expectKept` added in `b9d7cb61a`.
  - Observed effect: one returned slice, about an hour of agent time under machine load, and four added assertions the plan had ruled out; the product kept the place in every arrangement, so no defect was found.
  - Inference: refinement took the example's result from a coverage summary without a premise row checking the base assertion. Per-clause source-review ids caught it, but only at the last code slice.

## DD-495 — A planned step removal named no owner for a fault the step detected only in passing

Former branch-local code: DD-491 in `03dff46c0`; renumbered during integration to preserve the unrelated finding already published on trunk.

A plan removed a setup step after proving which assertion needed it, without
asking what else the step's presence had detected.

### Occurrences

- Execution: SEED-312#speed-up-touch-review-checks (plan 592; first implementation `205452d94e139561afe62ad7d3e65d42bba68063`)
  - Timestamp: unknown (execution 2026-11-11 20:44 to about 2026-11-12 01:30 +08:00; exact event time not retained)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: plan 592's premise row found that skipping the context journey's early commit choice fails the later Commits beat, so slice 4 moved the choice there and dropped the return to All changes. Neither the plan nor the first slice 4 return named an owner for "the chosen range survives leaving Commits", which the removed sequence had detected. At acceptance the coordinator returned the slice; fault FR failed the removed step on `d7622bc2b`, no touch case afterwards, and two desktop checks (`story-review-commit-ranges.spec.ts:80`, `story-review-commit-refresh.spec.ts:96`) found by running the review family (183 cases, 1,227 s at load 34–49).
  - Observed effect: one returned slice and a family run to find an owner the plan could have named; the same run surfaced five load-only failures in untouched review specs, recorded in `ProjectFindings.md` under DD-476.
  - Inference: the story's surviving-proof rule was applied to removed assertions and cases, not to behavior a removed step proved incidentally. Planning a removal could list each fault the step fails today, not only the assertion that motivated keeping part of it.

- Execution: SEED-314#speed-up-landed-ci-repeat-checks (plan 595; first implementation `ad78d86495a1e808da9d40fb164b66e4d883b402`)
  - Timestamp: unknown (execution 2026-11-11 23:35 to 2026-11-12 01:30 +08:00 for the slice concerned)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (installed `.claude/skills/dough-update/VERSION` in the execution checkout)
  - Evidence: plan 595's existing-solution finding for slice 2 said the page fixture's implicit dashboard server "collects nothing", from the fixture's default environment. Removing that implicit start also removed a second collector from `landed-ci-scope-pending-order.spec.ts`, which set the collection option for it, and the fixture's `serveOriginBaseCi` answerer from 53 cases. The implementer reported both after the proof runs; the coordinator returned the slice for a reach observation (59 cases instrumented, no call reached a default answer, one control spec showing the instrument fires), and the refactor pass removed the orphaned option.
  - Observed effect: one returned slice and a 329 s instrumented run to settle effects the plan could have listed; no consumer was affected.
  - Inference: the same omission for a fixture as for a journey step: the plan named the effect that motivated the removal, the server start, and not everything that start did.

- Execution: SEED-330#make-ci-follow-up-automatic (plan 604; first implementation `5987387021227f7a89b1520917dcd3100564b0aa`)
  - Timestamp: unknown (2026-11-12, about 19:00–20:05 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: plan 604 slice 1 listed setting-dedicated cases for deletion. The post-change refactor pass found that the deleted admission case "an unspent eligible receipt disabled while original jobs are unavailable…" was the only end-to-end observer of the "Original exact-attempt jobs are incomplete" card; the coordinator restored it as a case without setting steps before delivery. Wrap-up Intent Coverage at `5987387` then confirmed that the deleted "development mode and unsupported providers…" case had been the only one reaching the custom-adapter collection path: dropping the adapter guard let an admitted GitHub receipt rerun after an adapter was configured, and no maintained spec failed.
  - Observed effect: one restored case before delivery, a 29-minute Intent Coverage run whose finding was routed into the queued custom-trigger story's scope, and one development-guard scratch probe during the retrospective.
  - Inference: same omission for deleted test cases: the plan classified each case by the observation that motivated deletion (the retired setting) and not by the other behavior it was the only one to observe.

## DD-496 — An intermittent local failure in a journey the slice changed was attributed to machine load, and hosted CI failed it on a deterministic cause

A changed browser journey failed in some local runs at the 30 s test timeout while other, unchanged journeys timed out from fixture time under external load. Three agents classed it with them and the slice was published; the journey had its own defect.

### Occurrences

- Execution: SEED-320#open-terminal-only-without-a-custom-instruction (spent plan 597 recoverable at before-cleanup `f595336fb608dcfebfaa01685141db1b61fbcaf6`; first implementation `43782e67d4ae1a68a3d5e1cffaafbc13e2a588e6`)
  - Timestamp: 2026-11-12T02:17:28Z (hosted CI run of the failing job; local runs 09:10–10:10+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: slice 1's shared step `startedSessionTerminal` first waited for the session's Taken entry. `launches/agent-launch-start-session-touch.spec.ts:32` then failed locally in 2 of 4 implementer runs and both refactor-agent runs, each at that wait, under load averages 31–46; its trace showed fixtures taking 22–23 s. The plan Outcome, the refactor return and the coordinator's acceptance recorded it as load beside `responsive-session-access.spec.ts:44`. Hosted CI run 43139863774 failed only that journey at the same line. Cause: a terminal covering a narrow page sets `aria-hidden` on the page column (`dashboard/src/PageFrame.tsx`), so the role locator finds no entry while the terminal is shown; the wait passed only when the entry rendered first. Repair `b6f325ffb`.
  - Observed effect: one owned CI failure, a stash and restore of slice 2's uncommitted work, and one repair commit.
  - Inference: the failure's line was inside code the slice added, unlike the unchanged journeys that timed out in fixtures or polls; that difference was visible in the first failing log and was not used to separate it. The base-content comparison the coordinator ran for two other specs was not run for this one.

## DD-497 — A plan premise that two entry points share a component stood in for observing the second entry point's keyboard outcome

The plan settled "the page rule is one condition for Start session and Follow up alike" by noting that Follow up renders the same component, and promised the keyboard return for both. The second entry point sits inside a list with its own focus rescue.

### Occurrences

- Execution: SEED-320#open-terminal-only-without-a-custom-instruction (spent plan 597 recoverable at before-cleanup `f595336fb608dcfebfaa01685141db1b61fbcaf6`; first implementation `43782e67d4ae1a68a3d5e1cffaafbc13e2a588e6`)
  - Timestamp: unknown (2026-11-12, slice 2 implementation, about 10:15–10:40+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: plan 597's premises table: "The scratch condition typechecked and changed the outcome. `dashboard/src/FollowUp.tsx` renders the same `StartSession`." Its planning scratch run asserted no keyboard position after an instructed Follow up. In slice 2 the implementer's new assertion found the keyboard on the source entry: Recently done's held-entry rescue (`dashboard/src/recentlyDoneFocus.ts`, a layout effect) ran before the launcher's return (`dashboard/src/launchDialogLauncher.ts`, then an effect). The implementer stopped that path; the coordinator kept the story's example and the fix landed in `708ce1ab4`.
  - Observed effect: one implementer stop and resume, and a focus-timing change to every launch dialog that the plan had not sized.
  - Inference: shared rendering settles what is requested, not what surrounds the component; the keyboard promise depended on the surroundings.

## DD-498 — A coordinator's timing loop filtered runner output, so the one failed run left no evidence

To compare a changed test selection with its base under host load, the coordinator ran both in one shell loop and kept only the lines matching pass marks, totals and `real`. One run of the changed selection failed, and nothing recorded which case failed or why.

### Occurrences

- Execution: SEED-315#speed-up-provider-rate-limit-checks (plan 598; first implementation `9b471af203402da781472742b50c0bce1929689b`)
  - Timestamp: unknown (2026-11-12, during slice 1 acceptance)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: coordinator conversation, interleaved base/after loop piping `npm run test:dashboard` through `grep -E "✓|✘|passed|failed|^real"`; "after 2" printed `auto (31.4s)`, `a rate (22.8s)`, `1 failed`, `1 passed (1.9m)`, `real 116.78` at load 55. Eleven further runs with full logs and two under added load all passed; the plan's Execution state records the failure as explained, not observed.
  - Observed effect: about 20 minutes of repeat and added-load runs produced no reproduction, and the slice was accepted with a supported but unobserved explanation (a 30 s default timeout during a load spike). Later delegations were told to keep one full log per run.
  - Inference: a filtered measurement loop is a proof run like any other; the failure policy's diagnosis needs the output the filter discarded. Generality is unmeasured.

## DD-499 — An unrelated neighbor's load-induced timeout took a repair whose gain is below noise

A neighbor run at one worker on a saturated host timed out a case that does not use the changed fixture. The failure policy made its repair the executor's; the measured diagnosis put most of the cost in product behavior the executor may not change.

### Occurrences

- Execution: SEED-315#speed-up-provider-rate-limit-checks (plan 598; first implementation `9b471af203402da781472742b50c0bce1929689b`)
  - Timestamp: unknown (2026-11-12; neighbor run in slice 1, repair delegated after slice 2)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.96 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: slice 1 return, `intent-ci-comparison-pending-proof.spec.ts:31` "later proof recovers…" at 30.4 s, load about 70; repair return with phase timings (walk and `gh` starts about 10 s of 15.5 s at load 45) and `449a0b919889ea357dca764eb73075b7485fdf31`; `.planning/TEST-OPTIMIZATION-CANDIDATES.md` entry `later-comparison-walk-gh-starts`.
  - Observed effect: one implementation delegation of about 13 minutes and one refactor pass delivered a 1–2 s saving that end-to-end runs cannot show (the same case ran 4.4–17.7 s across loads 20–43). The remaining margin needs a product or suite-wide decision and is kept as a live candidate.
  - Inference: the diagnosis was necessary to learn where the time goes; whether a test-only repair should follow when the diagnosis names product cost is a judgment the policy leaves to the executor. One occurrence.

## DD-500 — A story promised an absolute case time at a load profile whose premises were measured only on a quiet host

The story's load example promised a slowest case body under 10 s at one-minute load 30–50. Its premises and baselines were observed at load 4–7, and the one loaded baseline was the case the story removes. The unchanged sibling cases were never timed at the promised load.

### Occurrences

- Execution: SEED-326#pass-later-proof-comparison-checks-under-load (spent plan 589 recoverable at before-cleanup `4368ce5b9d63f1de43040488fd110fe81bd9eeb2`; first implementation `2202c53fb2d3a4e26599b450d8bb00d9311f1ca3`)
  - Timestamp: 2026-11-12T14:19:27+08:00 (end of the diagnostic run)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: plan 589 "Decisive premises" ("one-minute load 4–7") and "Current decisions" ("The load range, the 10 s margin and the 1.5 ratio are refinement's figures"); slice 3's load observation at `3befd9f85`: 14.5 and 14.0 s for the two "equivalent" cases at load 36.8–38.3, with about 6 s in the shared `origin` fixture and 9–11 s in 20–33 `gh` starts, both excluded by the story's scope limits.
  - Observed effect: execution stopped for the developer after two delivered slices; the example was restated to 20 s, the source review was obtained again, and three counted runs then passed with a slowest body of 16.2 s. Two load-raising sessions of 30 helpers ran instead of one.
  - Inference: one loaded run of the unchanged file during refinement, as cheap as the premises that were observed, would have shown the floor before the figure was promised. One occurrence; the related cost in DD-499 came from the same file under load.

## DD-501 — A fresh source review after a one-clause amendment returned different ids for unchanged commitments

After the developer restated one key example, the required fresh source-only review renumbered the story's unchanged clauses, so every allocation and recorded observation had to be carried to a new id by hand.

### Occurrences

- Execution: SEED-326#pass-later-proof-comparison-checks-under-load (spent plan 589 recoverable at before-cleanup `4368ce5b9d63f1de43040488fd110fe81bd9eeb2`; first implementation `2202c53fb2d3a4e26599b450d8bb00d9311f1ca3`)
  - Timestamp: unknown (2026-11-12, between 14:25 and 14:45+08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: `source-review.md` beside plan 589 held 60 rows before the amendment and 66 after; the amended story differs in one example (10 s to 20 s). The second reviewer split or renamed rows whose text was unchanged (S2.1a→S2.1, S2.5a–d→S2.7–S2.10, X2.1→X2, R2.1–R2.5→R2–R6, E3→E3.1 and E3.2, new G0 and O0). The coordinator wrote a one-off mapping script; its first run failed on a cell-parsing error before writing.
  - Observed effect: 47 recorded observations and two obligation links were re-keyed; obligation ids G1 and G2 were renamed OB1 and OB2 because the new review used G1 and G2 for Goal clauses. No observation was lost.
  - Inference: the review brief gives the reviewer no prior ids, and the replacement rule has no path that keeps rows whose source text is unchanged. Cost is qualified; no time was measured. One occurrence.

## DD-502 — Named-sibling reconciliation entered Git before the backlog adapter

Originally DD-500 on the story branch at `3d0246825ae7a03cc0c0b7b2076c4b1cce7d531c`; assigned DD-502 during integration because trunk had independently allocated DD-500 and DD-501.

The coordinator ran a raw no-commit merge that combined the product backlog and done records, although the installed backlog guidance requires its Git adapter from the start. A later semantic check can establish the resulting bytes but cannot retroactively supply the skipped pre-commit gate. The existing adapter guidance is explicit; no defect in its reconciliation algorithm is evidenced here.

### Occurrences

- Execution: SEED-287#fit-dashboard-journeys-in-default-timeout
  - Timestamp: unknown (2026-11-12 reconciliation; exact invocation time not retained separately)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound managed guidance inherited with maincaf48c6)
  - Evidence: coordinator tool history used `git merge --no-commit --no-ff caf48c6fa41b6a45dcdad4eac35cda9a858b2047`; published composition `694e6d91` has parents08d2903c/caf48c6. Post-publication shared `mergeBacklogs(fd164,08d,caf)` produced exactly its backlog (15 entries,13 compatible transitions), `/tmp/seed287-published-backlog-merge-20261112/validation.json`; real catalog-done verified343 records already canonical.
  - Observed effect: the adapter was not the invocation path, despite a clean backlog result; no lost membership, priority, record or catalog is observed. Later integration uses the installed history-preserving publisher/backlog adapter.
  - Inference: the coordinator reached backlog-specific guidance after reconciliation, rather than at that Git boundary. Apply the existing adapter entry point before future combining operations; this one occurrence does not establish a general guidance or tooling defect.

## DD-503 — A load timeout in the checked journey was attributed and profiled before the coordinator looked for the Taken story that already owned it

During wrap-up, Intent Coverage left the restored run unverified after the probed journey hit the 30 s default under host load. The coordinator reran it, compared it against the base under the same load, and traced it. Only after that did it find that a Taken story names this journey and owns its fix under load.

### Occurrences

- Execution: SEED-327#strengthen-pending-take-protection-assertions (spent plan 601 recoverable at before-cleanup `d59553452a5ac800fec0acd60481cf37d0470098`; first implementation `93b411f88ab2d58021fda29e2a1d980d8f362c17`)
  - Timestamp: 2026-11-12T07:06:00Z (approximate; local reruns started 15:06+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: the Intent Coverage report's two restored runs of `responsive-session-reconciliation.spec.ts:44` timed out at 32.1 s and 32.0 s (load about 21–26). The coordinator then ran three reruns (one timeout), set up a base worktree at `aa8ac5f89`, ran six alternating base/exec runs (base 15.0–29.8 s; exec 13.7–31.6 s, one timeout) and one traced run, and only then read trunk's backlog. Taken SEED-287#fit-dashboard-journeys-in-default-timeout (plan 576; agent chaifeng-chan) names `responsive-session-reconciliation` under local load 20–30. Earlier, the slice 1 return had reported this journey at 28.8 s of its 30 s budget (load 36) and blamed a parallel typecheck; acceptance did not look for an owner.
  - Observed effect: about ten focused runs and one scratch worktree setup, roughly 10 minutes. The result was the coordination boundary the failure policy already names: no repair, owner reported.
  - Inference: the base comparison was still needed for attribution. Searching the backlog for the spec name could have found the owner first and saved the profiling. This has happened once.

## DD-504 — A plan's whole-suite gate named `npm test` for dashboard journeys it does not run

The plan justified one whole local suite run by the dashboard specs that render
the changed card, and named `npm test` for it. `npm test` runs only the node
and Bash checks; the dashboard browser suite is `npm run test:dashboard`. The
premise was not in the plan's decisive-premise table and was found only after
the run.

### Occurrences

- Execution: SEED-328#mark-recently-done-stories-as-reviewed (spent plan 602 recoverable at before-cleanup `7e7fbd0e7f0a2d247a01699942209c003c60f6a3`; first implementation `ecfaacce1e615526aa804d633946c88309b6afaa`)
  - Timestamp: 2026-11-12T08:55:56Z
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION`)
  - Evidence: plan 602 "Consumer trace and local gates": "Run the whole local suite (`npm test`, Homebrew Bash first on `PATH`) once … 132 dashboard specs render Recently done cards"; `package.json` `"test": "exec bash scripts/test.sh"` and a separate `test:dashboard`; no `dashboard/test-results` entry from the 16:55–17:19+08:00 run. That run (battery, load up to 36) ended with one `workspace-publication.test.mjs` TIMEOUT reported after 1357.8 s, which passed alone in 118 s.
  - Observed effect: about 23 minutes of a full node/Bash run on battery that observed none of the named dashboard journeys; the dashboard whole-suite verdict came only from branch CI's 13 shards, and the remaining battery forced wrap-up to stop before closure.
  - Inference: observing the command's coverage when writing the gate (one look at `package.json`) would have named `test:dashboard` or deferred the gate to CI. This has happened once.

## DD-505 — The file-size gate stopped delivery for a one-line link retarget in an already oversized seed

Moving a guide section, as the plan allowed, broke an anchor that an 874-line multi-story seed links to. Retargeting that one link put the seed in the change, and the post-change refactor's 250-line check stopped delivery for a developer exception. Related to ODF-362: in both, the generic line cap reaches a planning record rather than product code.

### Occurrences

- Execution: SEED-329#use-shared-test-guidance (spent plan 603 recoverable at before-cleanup `b7f0a0308ef615307f7865023f534575fec5fe2f`; first implementation `c1800ab36079b671a574b0ed3d18cd517b742695`)
  - Timestamp: 2026-11-12T10:12:46Z (dashboard attention receipt for the stop)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION` at Take `68c889b37`)
  - Evidence: plan 603 allowed extracting the journey guide's pilot "preserving incoming references" and sized only `AGENTS.md`, the two guides and the configuration. `.planning/seeds/SEED-300-dashboard-test-page-objects.md` line 186 linked `writing-journeys.md#what-the-pilot-earned`; the refactor return ended `## REFACTOR JIDOKA STOP` naming that seed at 874 lines; Terry replied "approve the exception".
  - Observed effect: one developer round trip and a dashboard attention report before the first commit. The refactor pass otherwise made two small de-duplication edits.
  - Inference: the plan could have named the oversized seeds its relocation touches and carried a decision for them, or the size check could treat a forced link retarget in a planning record differently. This record does not settle which.

## DD-506 — A configuration promise proved only by scratch observation became a correction after Intent Coverage

The plan proved that the `tests` Intent entry now selects MakeMe for runner-scheduled Node tests by running the installed selector over all scheduled sources in scratch. It added no maintained check, because "no new automated prose test" was needed for the routing links. The retrospective then flagged the missing guard as product advice, and Intent Coverage confirmed it: reverting the declaration left every maintained check passing. Closure wrote a correction story, plan, premise observation, readiness record and queue entry. Related to DD-491, where acceptance, rather than planning, let a gap stand.

### Occurrences

- Execution: SEED-329#use-shared-test-guidance (spent plan 603 recoverable at before-cleanup `b7f0a0308ef615307f7865023f534575fec5fe2f`; first implementation `c1800ab36079b671a574b0ed3d18cd517b742695`)
  - Timestamp: 2026-11-12T10:30:32Z (Intent Coverage report end clock)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION` at Take `68c889b37`)
  - Evidence: plan 603 "Selection matrix and local gates" chose existing fixture-based checks and scratch selector runs; Intent Coverage at `c1800ab36` reverted the `tests` entry and the four focused checks still passed; closure queued `SEED-329#guard-scheduled-test-makeme-selection` with plan 605. Its premise run shows the guard over `scripts/test-jobs.sh` costs about 154 ms.
  - Observed effect: a second planned work item for a check about as cheap as the scratch observation that proved the first.
  - Inference: the plan grouped a changed selection behavior with documentation links when it judged automated proof unnecessary. A change to a configuration that a shared mechanism reads may need its own maintained check of the repository's real configuration.

## DD-507 — A resource hold became a quiet-window prerequisite without an established target

After AC was restored, execution context required a quiet or coordinated CPU
window before completing browser proof. The developer clarified that moderate
CPU usage in a moderately busy context must work. Host observations did not
establish an idle-machine acceptance condition.

### Occurrences

- Execution: SEED-300#express-review-test-intent-through-page-objects (plan582; first implementation `14d6f4e9f47ee91fdedadc28856ce0b50c38f777`)
  - Timestamp: unknown (2026-11-12 execution; exact event time not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at accepted Take750e9e4f2; no execution-time release marker retained)
  - Evidence: `67bb91d5415c72cdd7c1252c4fcb180c45dcb4c9:.planning/slice-plans/582-review-test-intent/execution-context.md`, Resource stop/AC restoration and Moderate busy-machine target; prior unfinished dashboard reports and developer clarification in launch39024964-857a-4f8a-9668-fb62a939fb7e. The final current cohorts passed under ordinary concurrent work after concrete cold-fixture and accepted lifecycle-supplier changes.
  - Observed effect: Two resource-stop handoffs preceded clarification and resumed proof. The invalid quiet prerequisite was removed; wrap-up retains the supported moderate-busy expectation in tests/local-test-resources.md.
  - Inference: Battery10% and recurring30unowned CPU burners justified investigating resource limits; they do not prove that ordinary moderate concurrency needs an idle window or explain every timeout. Keep host evidence separate from the supported target and diagnose concrete setup/observation costs. This is an agent judgment issue, not an evidenced requirement in the skill.

## DD-509 — Measured figures were fixed before their floor was probed
A story fixed a per-case time and a speed ratio at preparation; only a probe after five delivered slices showed the fixed cost every case pays.

### Occurrences
- Execution: SEED-324#pass-landed-ci-repeat-checks-under-high-load (plan 599; first implementation `5fa058c0db92cd726fdc18c4b1c4c291451cf41f`)
  - Timestamp: unknown (2026-11-12 to 2026-11-13 execution)
  - Tool: Claude Code
  - Model: claude-fable-5-2, then claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION` at Take `095f2bff9`)
  - Evidence: plan 599 "First measured run", "Slice 6 record" and "Terry's decision, 2026-11-13"; seed amendments of key examples 1 and 8.
  - Observed effect: three developer stops, two scope amendments and a replan from slice 6 to 10.
  - Inference: a promised figure is a decisive premise; probing the fixed per-case cost (server start, fixture preparation, provider calls) first would have set an achievable figure.

## DD-510 — A CI failure on a long-behind branch was repaired before checking trunk
A story branch 81 commits behind trunk repaired a race that trunk had already repaired differently; the two repairs met in a merge conflict.

### Occurrences
- Execution: SEED-324#pass-landed-ci-repeat-checks-under-high-load (plan 599; first implementation `5fa058c0db92cd726fdc18c4b1c4c291451cf41f`)
  - Timestamp: 2026-11-13T00:23:43Z (failed attempt's test-results stamp)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (checkout-bound installed `.claude/skills/dough-update/VERSION` at Take `095f2bff9`)
  - Evidence: run 43258029149 on `681a187da`, `agent-completion-quiet.spec.ts:37`; trunk's `694c8dceb`; repair `6753ad5a0`, conflict resolved in `937da2b35`.
  - Observed effect: a diagnosis, a repair and a refactor pass before the duplicate was found; the merge kept both.
  - Inference: before repairing a CI failure on a branch well behind trunk, check trunk's history of the failing spec; merging first may already repair it.
