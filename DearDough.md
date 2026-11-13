# DearDough Process Findings

The [shared finding catalog](docs/maintainer/finding-names.md) holds reconciled
evidence, former codes and response history. This log retains Open Dough
observations and context beyond those catalog records. See
[ProjectFindings.md](ProjectFindings.md) for repository-owned findings.

## Retention

- Highest allocated local number: 512. Removed numbers are never reused.
- Recovery: `f0dd36f7f59b4deb1b09616edc422c012af3dad5:DearDough.md` contains the exact log before the latest retention (including DD-490 and DD-482's SEED-318 occurrence, removed then); `9f56540bd83b175a2ab974aad8d6ce1e9f8c66ec:DearDough.md` contains the log before the retention before it (including the three oldest ODF-150 occurrences replaced then) and its recovery link to earlier revisions.
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
- Execution: SEED-300#express-board-test-intent-through-page-objects (plan 584; first implementation `7bb1e73355fdb4b9c4d0c729f8df17892dfeb128`)
  - Timestamp: unknown (2026-11-13, slice 9 delivery about 08:30+08:00; CI failure reported about 09:50+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (installed `.claude/skills/dough-update/VERSION` at Take `6d102beae`)
  - Evidence: slice 9 made `dashboard/playwright.config.ts` import the new `tests/support/browserArgs.ts`. Its consumer trace listed `innerPlaywright.ts`, `proofRecordRun.ts` and backend runner specs as out of scope, but did not reach `tests/support/local-test-suite-checkout.mjs`, which copies the config together with a fixed list of its imports. CI run 43349861593 job "test (2/3)" failed `tests/support/local-test-suite.test.mjs:125` with ERR_MODULE_NOT_FOUND for `browserArgs.ts`; repair `974e2b7f` added the path to that list.
  - Observed effect: one failed CI run and one repair publication after the slice was published.
  - Inference: the trace was run from the changed module's importers; a file that reads the config as text and copies its relative imports is not an importer, so path-based tracing missed it.

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
- Execution: SEED-333#spot-completed-stories-that-need-review (plan 608; first implementation `1d95951e0e7457dcd3620eecf6568067b097a3fc`)
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: 0.3.98 (installed `.agents/skills/dough-update/VERSION` at accepted Take `7eae86d553974c1b60bfe997df6c826ed73ac4ef`; installed guidance unchanged)
  - Evidence: 2026-11-13 launch `275cb85a-0cce-40c2-8c58-23ce07cea95e`; coordinator startup guidance and ADR batches reported 11,961 and 11,011 original tokens with truncation; a combined proof-map/consumer/doc read reported 15,155 and truncated. Missing decision/status and map passages were retrieved separately before dependent acceptance.
  - Observed effect: broad whole-file/generated-output batches needed targeted recovery; source promises, command handles and terminal proof were retained.
  - Inference: recurrence of agent output-scoping deviation under existing anchored/targeted-retrieval rules, not missing guidance. Isolated elapsed/token saving is unmeasured.

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
- Execution: SEED-333#spot-completed-stories-that-need-review (plan 608; first implementation `1d95951e0e7457dcd3620eecf6568067b097a3fc`)
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: 0.3.98 (installed `.agents/skills/dough-update/VERSION` at accepted Take `7eae86d553974c1b60bfe997df6c826ed73ac4ef`; installed guidance unchanged)
  - Evidence: 2026-11-13 launch `275cb85a-0cce-40c2-8c58-23ce07cea95e`; `40e6e66c06afe45f7034d89522bb74e5f7a32c83:.planning/slice-plans/608-spot-completed-stories-that-need-review/PLAN.md` slice-2 Refactor paragraph retains the guarded-formatting failure after 56 passing cases and six independent-refactor cases: unbound subscription method, no-param-reassign and unused callback argument. The coordinator's suggested this:void repair then hit no-invalid-void-type; a stable arrow subscription, equivalent element alias and identical index construction settled it.
  - Observed effect: both failed preparation attempts withheld commit/publication; mechanical repairs and retries preceded accepted slice 2. Runtime/observing behavior stayed equivalent and final hook/typecheck passed.
  - Inference: same late authored-file lint feedback and coordinator repair churn as existing ODF-329, including its prior this:void example. Briefs reserved formatter/hook-owned lint to the coordinator; no saving from earlier lint is measured.

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

<a id="dd-481"></a>

## ODF-482 — Freshness chooses a pre-Take merge base despite another base containing the accepted Take

Former local code: DD-481.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-482.md#odf-482).

<a id="dd-482"></a>

## ODF-483 — Ready plan used singular `## Slice`, so obligations could not list slices

Former local code: DD-482.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-483.md#odf-483).

<a id="dd-488"></a>

## ODF-484 — Guarded slice delivery rejects its retained Markdown hard break

Former local code: DD-488.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-484.md#odf-484).

<a id="dd-489"></a>

## ODF-485 — Generic wrap-up publication prose contradicts Story Branch integration

Former local code: DD-489.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-485.md#odf-485).

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

<a id="dd-493"></a>

## ODF-481 — A source-only review numbers context and proof-method statements as commitments that each need an observation

Former local code: DD-493.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-481.md#odf-481).

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

<a id="dd-495"></a>

## ODF-435 — A planned step removal named no owner for a fault the step detected only in passing

Former local code: DD-495.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-435.md#odf-435).

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

The dashboard test-helper defect and its repair are recorded in [ProjectFindings.md](ProjectFindings.md#dd-496).

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

<a id="dd-498"></a>

## ODF-108 — A coordinator's timing loop filtered runner output, so the one failed run left no evidence

Former local code: DD-498.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-108.md#odf-108).

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

<a id="dd-501"></a>

## ODF-383 — A fresh source review after a one-clause amendment returned different ids for unchanged commitments

Former local code: DD-501.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-383.md#odf-383).

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

<a id="dd-504"></a>

## ODF-495 — A plan's whole-suite gate named `npm test` for dashboard journeys it does not run

Former local code: DD-504.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-495.md#odf-495).

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

<a id="dd-510"></a>

## ODF-490 — A CI failure on a long-behind branch was repaired before checking trunk

Former local code: DD-510.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-490.md#odf-490).

<a id="dd-511"></a>

## ODF-491 — A coordinator offered a suite-wide setting with an understated reach, and the human approved that description

Former local code: DD-511.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-491.md#odf-491).

## DD-512 — Sibling stories of one family built parallel owners for the same test controls while running concurrently

Three SEED-300 stories (review, Terminal, Board) landed on trunk while this story ran on its branch, and each built its own owner for shared session and report controls. Source freshness compares only the story and plan records, and the plan named no sibling for coordination, so the overlap surfaced only in the retrospective's whole-product review.

### Occurrences

- Execution: SEED-300#express-session-test-intent-through-page-objects (plan 585; claim `2467be8a5`; first implementation `70c34e8c5`)
  - Timestamp: unknown (2026-11-13, retrospective outcome review before the first trunk merge)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.97 (installed `.claude/skills/dough-update/VERSION` at Take `2467be8a5`)
  - Evidence: trunk `67bb91d54` added `sessionEntryAccess.ts` and `2137dfd0d` `terminalScreenPage.ts` while the branch built `openTerminalOf`/`readFinalReportOf` in `dashboardParts.ts`; merging `68bdc4f10` conflicted in 77 files and the Board landing `4f7214879` in 13; `source-freshness.mjs check` returned `unchanged` at every slice; plan 585 recorded shared code as "no blocking story dependency".
  - Observed effect: a developer decision, two added reconciliation slices (7, 8) with a full dashboard run, and three CI repairs for trunk-introduced test races that the merged revision exposed.
  - Inference: when a family is split into concurrently runnable stories over shared test owners, owner allocation at split time or named-sibling coordination in each plan would surface the overlap per slice; record freshness alone does not.
