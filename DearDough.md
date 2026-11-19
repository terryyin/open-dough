# DearDough Process Findings

The [shared finding catalog](docs/maintainer/finding-names.md) holds reconciled
evidence, former codes and response history. This log retains Open Dough
observations and context beyond those catalog records. See
[ProjectFindings.md](ProjectFindings.md) for repository-owned findings.

## Retention

- Highest allocated local number: 588. Removed numbers are never reused.
- Recovery: `32a64ed10fa8cba776fc343e531c7bcb17642a82:DearDough.md` holds DD-555, removed to keep the SEED-409 row of ODF-150 under the 1000-line ceiling. `4a523c5f27fad2f21efba37925dfd1af65837654:DearDough.md` holds DD-585, removed for the SEED-409 row of ODF-150. `0cc3238b517a71413d40dc1e86cce6d1c140e272:DearDough.md` holds the ODF-150 SEED-382 and SEED-400 occurrences replaced by DD-585. `facd20535d6714db0ab4651c947bff2706b8d2dd:DearDough.md` holds the branch-local DD-582 evidence-path finding before renumbering to DD-584 on trunk merge; `d3e155dd924b5f62e540b65df9df5b040da95ee0:DearDough.md` holds DD-570, removed for DD-578; `3a703141f44d98968d20996da1abfeaedda68de4:DearDough.md` holds the ODF-150 SEED-371 occurrence, removed for the SEED-384 occurrence; `969f4924fcc0fceb6953b7c67bb45924dc122baa:DearDough.md` holds DD-556, removed for the SEED-400 rows of ODF-150 and DD-568; `593bb8ce105d3605acb86b7b5dbc41e51df64d7d:DearDough.md` holds DD-540 and DD-541, removed for DD-577; `face6fd05b3f5c4f20159db9b41480afbe90d592:DearDough.md` holds the exact pre-maintenance log and its earlier recovery chain. The [catalog](docs/maintainer/finding-names.md) retains reconciled occurrences. The [project findings](ProjectFindings.md) retain the local CI issue (DD-529). `fe04022a7f36772d930ba27e4853f34e8fce674b:DearDough.md` holds DD-576, removed for the SEED-379 row of DD-551. `834cad999c49999398a6fdd813576ffeb207b46a:DearDough.md` holds DD-549, removed for DD-580 and the SEED-401 row of ODF-368; it also holds the SEED-381 occurrence of ODF-150, removed for the same rows. `1d3b433bf7fdbd8e1858e0d62e623539f6d67b06:DearDough.md` holds the ODF-329 plan 668 and SEED-388 rows, removed for DD-581. `381a614c3720e323ca7b08c4a101b273dcd06e46:DearDough.md` holds the ODF-150 plan 651 occurrence, replaced by the SEED-379 occurrence. Plan 648 retains the repeated matrix declaration miss. `7740fc354ff8f89eb2a8de63243792950fd6c6d8:DearDough.md` holds DD-562 and DD-567, removed for DD-582, DD-583 and the SEED-404 row of DD-574.- Occurrence history is partial.

## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. [Evidence and current response](docs/maintainer/findings/ODF-154.md).

## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>

Former local code: DD-259. [Meaning, evidence and response](docs/maintainer/findings/ODF-150.md).

### Occurrences

- Execution: SEED-409#return-to-recently-selected-stories (plan 718; first implementation `e455747c9`)
  - Timestamp: unknown (2026-11-19 +08:00; first failing CI run 44472044000 on `e455747c9`; repair `4a523c5f2`)
  - Tool: Cursor
  - Open Dough release: 0.3.107 (Take `7c094775f` after guidance update `a7e8d3c96`)
  - Evidence: slice 1 added the banner Recent stories button and proved `recent-stories.spec.ts`, `dashboard-header.spec.ts` and `dashboard-header-compact.spec.ts`. Unchanged banner-composition consumers—`controlsBesideSessions` / `snapshotButtons`, `accessible-board-keyboard` / `accessible-board-announcements` tab order, and e2e compact project-label assertions—failed on every product tip through `63f64555` (diagnostic run [44484264152](https://github.com/terryyin/open-dough/actions/runs/44484264152); `open-dough/evidence/ci-diag-63f64555.json`) until owned repair `4a523c5f2`.
  - Observed effect: CI failures on all six product tips, then one owned repair publication; no trunk impact.
  - Inference: matches ODF-150 shared-layout consumers (aggregate button membership and exact keyboard order) omitted from the plan's named local gate.
- Execution: SEED-384#keep-review-changes-focused-on-the-diff (plan 695; first implementation `1b33fda6a`)
  - Timestamp: unknown (2026-11-18, CI run 44257937459 on `1b33fda6a`, delivered about 15:20 +08:00)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: unknown (checkout-bound installed guidance at Take `70a81c6ba`; no release inferred from product VERSION)
  - Evidence: slice 1 styled the new toolbar name with `text-overflow: ellipsis`. Its consumer trace (`--term "Hide files" --term "Show files"`) and focused proof ran `e2e/review` and `frontend-tests/review`, not `frontend-tests/navigation/side-panel-width-covering.spec.ts`, whose page-wide `notReadWhole` check (`dashboard/tests/pageLayout.ts`) flags any visible ellipsis-styled text. CI failed it ("not read whole: SPAN: All changes"); repair `5911f9ae7`. The occurrence follows the SEED-393 response.
  - Observed effect: one CI failure, writer pause and repair publication on the story branch; no trunk impact.
- Execution: SEED-391#redo-the-effort-story-under-the-test-focus-guidance (plan 668; first research publication 5ea5ca123ecc8b5b87321adb69a3920bcec8f732)
  - Timestamp: 2026-11-17T02:08:01.442516+00:00 (post-trial diagnostic completed)
  - Tool: Codex
  - Open Dough release: modified; replay patch 934a51a30 over historical 0.3.102 guidance
  - Evidence: [corrected comparison](https://github.com/terryyin/open-dough/blob/fbfaa116b961a445cc606fd05363bf75f6ecad5f/.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/claude-comparison.md), frozen product/test 8b9005acc, native completion 57f805ee2. Selected model/effort E2E gates omitted the unchanged empty-ad-hoc case; one post-trial run failed expected argv length 3 versus actual 5 including medium. Claude's wider replay had exposed the affected consumer family.
  - Observed effect: edited backend observations improved, but the whole Codex test migration was incomplete. The outer research review initially missed it and corrected its smaller-diff inference. Both trial trees stayed frozen.
  - Inference: selecting by edited files/new concept spelling can miss consumers coupled through old output shape. Queued response: SEED-393#proof-reaches-unchanged-consumers-of-changed-output; no all-clean or guidance-only effect claim.

- Execution: SEED-345#compare-agent-effort-on-comparable-runs (first implementation `4f2059948d26b900bd1adcf090c12a93c62bdd2d`)
  - Timestamp: unknown (2026-11-16 CI notification and repair)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound guidance at Take `f777c4aa2e9f3603a50603fb20e67c95ccbff290`)
  - Evidence: CI run43850728441/attempt1 on `c14a77abc` failed Distribution Tests2/3 because native-stream guard rejected the new canonical Cursor fixture writer. Retained `5a49ec2ceb85e7219607ab72f03aa6dcace190a4:.planning/slice-plans/666-compare-agent-effort-on-comparable-runs/slice-4-evidence.md` records reproduction, focused repair proof and accepted repair `a399f31a6`.
  - Observed effect: focused CLI/Usage proof passed, but adding a fixture that writes native-shaped rows reached an unchanged global validator outside that proof selection. One CI repair cycle added the exact writer registration and a production-reader rejection counterexample.
  - Inference: matches missed indirect/global validation coverage. No time/token saving is measured; the final full CI gate remains required.

- Execution: SEED-379#keep-own-branch-session-results-for-review (first implementation `1155d7cb944f8f1c50b1209402f4cf97ab23b580`)
  - Timestamp: unknown (2026-11-19 +08:00, story-branch run 44367653081, attempt 1)
  - Tool: Codex
  - Model: gpt-6.2-sol
  - Open Dough release: unknown (checkout-bound guidance at Take `fc73813d6`)
  - Evidence: slice 7 (`2b9d3cf1e`) proved successful declared branch landings and their retained references. The unchanged `ad-hoc-review-unavailable.spec.ts` asserted the whole response for a missing repository and missing comparison objects. [Backend shard 2/3](https://github.com/terryyin/open-dough/actions/runs/44367653081/job/135025622497) failed both cases because records without a launch reporting association gained the captured pair's reference. Repair `6ad31827a` reproduced the failures and passed proof for unavailable and successful replies.
  - Observed effect: one branch CI repair cycle and a pause and restore of slice 8.
  - Inference: when either path can return the same optional field, the unchanged assertions for the unavailable reply belong in the proof selection.

- Execution: SEED-334#move-navigation-checks-and-retire-integrated-ui-test (plan 648; first implementation `54dfebff2`)
  - Timestamp: 2026-11-17T15:27:58Z (first failed CI job, run 44113467112); 2026-11-17T16:36:00Z (second, run 44126356645)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `161830d70`)
  - Evidence: slice 3 (`e10d6698f`) dropped `board-*` from the integrated shard 1 and ran `ci-browser-groups` only; `browser-group-shards.test.mjs` "an integrated pattern matching no spec fails the configuration naming it" replaced that literal, silently edited nothing and failed Distribution Tests 3/3 (repair `d69851c43`). Slice 7 (`373ff581d`) shrank the matrix to `[1, 2]` and ran the shard tests; the `ci-proof` step's `expect` still declared `dashboard/tests=3:case`, failing `ci-proof-declaration.test.mjs:97` and `ci-proof-actions.test.mjs:71` (repair `40bba4d8e`). The plan's local gate named only the interim listing, `ci-browser-groups` and `runner-ownership`.
  - Observed effect: two CI failure and repair cycles on the story branch, the second after delivery of the last slice; no trunk impact.
  - Inference: the same missed declaration as plan 651's occurrence, one story later; running every `Distribution/tests/support` test that reads `ci.yml` (`node --test Distribution/tests/support/ci-*.test.mjs` plus the shard tests, 91 cases, under a second) after any `ci.yml` edit would have caught both.

- Execution: SEED-345#recover-decisive-verification-evidence (first implementation `126391de866d4a3a40e0303c3098df318946ae33`)
  - Timestamp: unknown (2026-11-18 +08:00; branch CI and repair)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at Take `ace536b5e`; source changes released separately)
  - Evidence: CI run [44128960353/1](https://github.com/terryyin/open-dough/actions/runs/44128960353/job/134200426222) failed `native-stream-replay.sh`: new `native-agent-return-inputs.sh:13` emitted a raw host-event literal. Public-entry transport and eight selected consumer checks had passed. Repair `45ff02fee774a270826cd7507fee2ce1c9d077cc` uses the documented jq construction, adds completed-execution/neutral-response facts, and passes guard plus 20 public scenarios; exact branch CI run 44132082409/1 then succeeds.
  - Observed effect: an unchanged repository-wide stream validator was omitted from the selected consumer proof, causing one CI failure and repair cycle before integration.
  - Inference: matches the existing global-validator form of ODF-150. Earlier guard selection could expose the defect before CI; isolated time or token saving is unmeasured.

## ODF-229 — Interrupted Cursor implementation loses its proof return <a id="odf-229"></a>

Former local code: DD-265. [Meaning, evidence and response](docs/maintainer/findings/ODF-229.md).

## ODF-158 — Disproportionate required reference reads <a id="odf-158"></a>

Former local code: DD-128. [Meaning, evidence and response](docs/maintainer/findings/ODF-158.md).

## ODF-264 — Broad startup reads lose required context to truncation <a id="odf-264"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-264.md).

### Occurrences

- Execution: SEED-010#review-independently-observable-promises (first implementation `8ac10364f82362f3dac2504304a52645ed661456`)
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: 0.3.101 (checkout-bound installed guidance at Take `7bb9992277410f6b5c3ba8da0b461c3c61939a84`)
  - Evidence: launch `44215ad1-8e39-454e-8b40-11990aced97d`, 2026-11-15 execution / 2026-11-16 automatic retrospective conversation and tool results. Initial coordinator batches reported 12,315 and 16,450 original tokens with truncation; this retrospective also batched long finding-search/replay reads beyond its output bound before retrieving the needed passages narrowly.
  - Observed effect: repeated context retrieval while execution and review continued. Narrow reads recovered the relevant guidance, source and process-record passages; no product or proof loss was established.
  - Inference: the installed boundary/targeted-retrieval instructions were available, but batching and broad single-line metadata results still exceeded the visible output budget. Total time and token cost of the recovery were not measured.

- Execution: SEED-334#move-intent-reading-and-review-checks (first implementation `cd02f6a5171cf066ef111a467e12fd7492339171`)
  - Timestamp: unknown (2026-11-16 +08:00, retrospective correction planning and wrap-up reads; exact tool-call times unavailable)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at `7d8f624816ca582126fbba760075163a0d2b3993`)
  - Evidence: dashboard launch `9503957a-a6a0-4b7b-9756-82de8bd4979c`; coordinator tool responses `cfcebc` and `77b299` truncated combined planning/reference reads, then repeated targeted premise, proof and workspace passages. A later whole-file catalog match read (`ca9cf5`) reported 26,091 original tokens and truncation.
  - Observed effect: requested passages were omitted and reread during correction planning and review. This is the same over-batching deviation; the record does not establish a missing guidance rule.
  - Inference: bound retrieval to the next required passages and account for the combined tool response budget before batching. No elapsed or total-token saving was measured. Earlier execution transcripts were unavailable in this continuation; no process claims about those turns are reconstructed from summaries.

- Execution: SEED-374#see-stale-test-duration-estimates; first implementation `02705787579d078863b1f7db65cc2616774cab54`
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: unknown
  - Evidence: coordinator execution/closure tool record, 2026-11-15–16; the whole consumer trace `/tmp/dough-slice3-consumer-trace.md` and batched closure-reference reads returned truncated output. Later bounded section reads recovered the needed context.
  - Observed effect: repeated reads were required; some reference text was still unavailable after the first read. Closure itself repeated broad batches after a context handoff.
  - Inference: reading the selected section and returning bounded fields would reduce repeated retrieval; token savings and active-agent cost were not measured.

- Execution: SEED-371#run-and-maintain-native-evaluations-as-a-distinct-distribution-tool (first implementation 47478eacb64f35121d5cfafce24a87f391645db7; retained execution records at 3163559cf0f13169f136b0a195aeb4754bd63499:.planning/slice-plans/638-distribution-evaluation-tool/)
  - Timestamp: unknown (2026-11-15/16 execution and wrap-up; exact read-event times not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at claim deba676495b2eb1b8c1f3d3f96b7a44cb1122eb4)
  - Evidence: coordinator launch a6f339d0-f7b7-4741-81af-665f3195db73 combined CI/delivery/fresh-increment guidance with runtime files in a tool result reporting 14823 original tokens and truncation; a later combined backlog/record-preparation/closure-publication result reported 11701 and truncation. Targeted code/reference reads subsequently recovered affected decisions. The automatic discovery probe independently caught the complete-root omission and restored cleanly (469635 ms invocation-to-report; 7.715 s all focused commands; agent/human effort unavailable).
  - Observed effect: broad outputs omitted requested passages and required bounded recovery, including in the closing review. Command handles, rejected measurements, exact reversion, CI completion and probe restoration remained recoverable.
  - Inference: recurrence of known output-scoping deviation under existing targeted-reading guidance. Mandatory reviews themselves are not called waste; the avoidable share and isolated elapsed/token saving are unmeasured.
- Execution: SEED-391#redo-the-effort-story-under-the-test-focus-guidance (plan 668; first research publication 5ea5ca123ecc8b5b87321adb69a3920bcec8f732)
  - Timestamp: unknown (2026-11-17 continuation and wrap-up)
  - Tool: Codex
  - Open Dough release: unknown (coordinator's checkout-bound installed guidance; native replay patch provenance is separate)
  - Evidence: this coordinator conversation/tool record. Combined skill/report reads exceeded the visible output budget; a broad search over the temporary consumer inventory reported about 79,676 original tokens. Later reads targeted the missing sections. The prior ODF-264 problem recurred during this review itself.
  - Observed effect: avoidable retrieval and context churn; narrower reads recovered the decision-relevant instructions. No extra native trial, product change or proof loss is attributed to truncation.
  - Inference: batch independent narrow reads, not unbounded inventories or several long references together. Token or monetary saving from that practice is not measured here.

- Execution: SEED-345#compare-agent-effort-on-comparable-runs (first implementation `4f2059948d26b900bd1adcf090c12a93c62bdd2d`)
  - Timestamp: unknown (2026-11-16 resumed execution and wrap-up reads)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound guidance at Take `f777c4aa2e9f3603a50603fb20e67c95ccbff290`)
  - Evidence: resumed coordinator tool results `74cc5e` and `836310` reported20,909 and20,012 original tokens with truncation while reading a whole consumer trace and recursively locating a temporary report. Narrow section/exact-path reads recovered the needed evidence.
  - Observed effect: broad retrieval repeatedly included lexical and parked-source matches, requiring follow-up reads. No product/proof loss was established. The retained aggregate trace and runtime proof were inspected separately.
  - Inference: same bounded-retrieval deviation as this finding; complete trace discovery does not require printing every matching row. Token and elapsed savings remain unmeasured.

- Execution: SEED-388#replace-native-reader-gaps-on-reread (first implementation `8e62635e227962d87359188b00f8a21f9c54aba1`)
  - Timestamp: unknown (2026-11-17 execution and retrospective)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at established claim `bd2e79cd90df5d7481fcecc0dcf3703e55e82529`)
  - Evidence: launch `13944fac-dbe2-454e-8f90-3736a968a501`, coordinator tool results `25d1bb` and `27d978`: broad maintainer search reported 37,782 original tokens; printing the complete annotated consumer trace reported 56,939, both truncated. Later reads recovered required references and bounded runtime-consumer rows.
  - Observed effect: avoidable output and repeated retrieval under existing targeted-retrieval guidance; no product or proof loss established.
  - Inference: recurrence of ODF-264. Full trace discovery does not require printing every record-name match; token/time saving remains unmeasured.

- Execution: SEED-348#collect-notes-for-story-follow-ups (plan 671; first implementation `ab91ef3234f6c1a496bf309932ba327ad09ebb44`)
  - Timestamp: unknown (2026-11-17; execution and closure record)
  - Tool: Codex
  - Open Dough release: 0.3.102 (checkout-bound installed guidance at claim `681002b3946be63b7f854c4a739dcf8517a26996`)
  - Evidence: launch `154b5180-ee1f-44b2-88e7-a70e47217593`; coordinator batches printed combined truncated output (14,296 original tokens), whole consumer records and later process-log queries also exceeded output limits. Targeted section reads recovered needed passages.
  - Observed effect: repeated retrieval and trace/report handling while proof and delivery continued; no product or proof loss established.
  - Inference: another ODF-264 output-scoping deviation under existing targeted-retrieval guidance. Complete discovery does not require displaying every generic/history match; avoidable elapsed/token cost is unmeasured.

## ODF-205 — Execution starts on a red trunk unannounced <a id="odf-205"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-205.md).

### Occurrences

- Execution: SEED-381#fixed-pattern-shards-for-the-distribution-suite (plan 654; first implementation `f8cb342e63ac25064fe6f3e54d8af8b8f164b5db`)
  - Timestamp: unknown (2026-11-16 +08:00; first branch failure run 43784934792)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at claim `25bee8ecdd2954ef50c6f71fb98f4d69470020eb`)
  - Evidence: trunk run 43779532830 at `93ef6ac50` (and two earlier main runs) already failed Distribution shares 2 and 3 with `OVER BUDGET` total ceilings before the claim. Branch runs 43784934792, 43785564567 and 43786295572 failed the same way; each needed a `ci-github-diagnostic.mjs` read. The plan, prepared on that red trunk, ordered the budget removal sixth; execution reordered it to slice 4 as the repair (`30523b21d`, first green run).
  - Observed effect: three branch failures to classify and a mid-execution plan reorder. The failing gate was the one this story removes, so ownership was clear and no developer decision was needed.
  - Inference: a red-trunk check at preparation or startup would have put the budget removal first. Elapsed and token savings were not measured.
- Execution: SEED-380#speed-up-the-slowest-dashboard-frontend-unit-tests (first implementation 3b8848a2ab182d34b1b0034090ea2a2d8430fe74; retained execution records at 7bb49ed863be027a9cdb054c749ca4f95e714ab6:.planning/slice-plans/653-speed-up-the-slowest-dashboard-frontend-unit-tests/)
  - Timestamp: unknown (2026-11-16, final completion)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at claim d9c35d51faedbdcd77f4ce68d833132d2a28d164)
  - Evidence: CI runs 43786112787, 43788508552, 43789763452 and 43792139474 failed only Distribution Tests on `OVER BUDGET` (933–1003 s against 926 s), as `main` runs did from 43774458324 on. SEED-381 closed at c4882f0c3 and removed the budget.
  - Observed effect: four failure notifications were classified as another owner's, then a developer stop and a watch for the other story's landing before wrap-up could resume.
  - Inference: the failure policy correctly avoided a duplicate repair; the claim was taken on a trunk already red on that gate, unannounced. The cost was waiting, not rework.

## ODF-329 — Delegation omits read-only lint before coordinator formatting <a id="odf-329"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-329.md).

### Occurrences

- Execution: SEED-381#fixed-pattern-shards-for-the-distribution-suite (plan 654; first implementation `f8cb342e63ac25064fe6f3e54d8af8b8f164b5db`)
  - Timestamp: unknown (2026-11-16 +08:00; slice 2 and slice 4 deliveries)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at claim `25bee8ecdd2954ef50c6f71fb98f4d69470020eb`)
  - Evidence: implementation and refactor briefs forbade separate lint. Guarded fresh delivery's `npm run --silent format` then refused slice 2 on shellcheck SC2312 in `test-runner-failure-report.sh` and slice 4 on SC2034 for `times_file` in `scripts/test.sh`. The coordinator repaired each, reran the focused check, and retried delivery (`ea744e9e7`, `30523b21d`).
  - Observed effect: two failed delivery attempts and coordinator-side repairs after refactor passes had reported complete.
  - Inference: same gap as ODF-329, for shell sources: a read-only shellcheck of the agent's own files in the brief would have caught both. Cost was a few minutes each; not measured.
- Execution: SEED-367#count-slice-active-time-deterministically (plan 667; first implementation `0c454d10b5826b5b9121f8ae7a9bb718579b5269`)
  - Timestamp: unknown (2026-11-16 +08:00; first delivery attempt, shortly before commit `eb5120217` at 17:07:25)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: unknown (checkout-bound installed guidance at Take `f1bff2c54`)
  - Evidence: the slice 2 implementation and refactor briefs forbade lint. Guarded fresh delivery's `npm run --silent format` refused on six ESLint errors (`no-param-reassign`, `no-return-assign`) in `slice-clock.mjs`, `slice-clock-record.mjs` and `slice-clock-fixture.mjs`. The coordinator repaired them, reran the spec and retried. Briefs for slices 3–5 named the two rules and allowed a read-only `npx eslint`; their four deliveries formatted clean.
  - Observed effect: one failed delivery attempt and a coordinator-side repair after the refactor pass had reported complete.
  - Inference: same gap as ODF-329, for JavaScript sources. Naming the project's strict rules and allowing a read-only lint in the brief removed it for the rest of the execution.
- Execution: SEED-367#bound-diagnosis-in-evidence-rounds (plan 669; first implementation `cce82241194e3f8f5e58b84342dfcd92c51d63c8`)
  - Timestamp: unknown (2026-11-16 +08:00; slice 1 delivery, before commit `cce82241` at 19:02:58)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `2d69b6928`)
  - Evidence: the slice 1 implementation and refactor briefs forbade lint and named no strict rule, although the plan 667 and 668 rows above recorded the same two `no-param-reassign` sites in this clock. Guarded fresh delivery refused formatting on two `no-param-reassign` errors in the new `slice-clock-diagnosis.mjs`; the coordinator applied the `Object.assign`/destructure pattern, reran the 32 clock tests and retried successfully.
  - Observed effect: one withheld delivery and a coordinator repair after the refactor pass reported complete; nothing failed was committed.
  - Inference: the remedy recorded for plan 667 lived only in that execution's briefs, so it did not carry to the next execution on the same files.

- Execution: SEED-393#guidance-check-participants-run-owning-proof (plan 676; first implementation `80ecc810a8de71bbdb448479ebae58e79b0880b2`)
  - Timestamp: unknown (2026-11-17 +08:00; slice 1 delivery, before commit `80ecc810a` at 20:54:57)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `9f75575475522e081a48b74d558dfa04510bae33`)
  - Evidence: implementation and refactor briefs reserved formatting and lint for the coordinator. The refactor pass ran shellcheck read-only, listed SC2015, SC2312, SC2034, SC2218 and SC2329 in its new files as "lint stays with you", and returned complete. Guarded fresh delivery's `npm run --silent format` refused on those findings; the coordinator restructured `case_environment_prepare`, added directives, reran two materializing checks and retried successfully.
  - Observed effect: one preparation refusal and a coordinator repair that changed setup code after the refactor pass, so its proof had to be renewed; nothing failed was committed.
  - Inference: same gap as ODF-329. Here the agent even saw the findings; the brief's "lint stays with the coordinator" was read as "leave findings unfixed". A few minutes of rework; not measured.

- Execution: SEED-348#collect-notes-for-story-follow-ups (plan 671; first implementation `ab91ef3234f6c1a496bf309932ba327ad09ebb44`)
  - Timestamp: unknown (2026-11-17; execution and closure record)
  - Tool: Codex
  - Open Dough release: 0.3.102 (checkout-bound installed guidance at claim `681002b3946be63b7f854c4a739dcf8517a26996`)
  - Evidence: guarded delivery withheld slice 6 for no-param-reassign after independent refactor, then slice 7 for three non-null assertions; briefs reserved hook-owned lint for the coordinator. Retained proof at `ab1acbbac33f0a82de40321121f1c086336ec301:.planning/slice-plans/671-capture-and-edit-story-notes-in-the-dashboard/slice-6-proof.md` and `slice-7-proof.md` records mechanical fixes and focused renewal.
  - Observed effect: two failed preparation attempts and coordinator repairs after refactor completion, with no failed commit/publication.
  - Inference: matches ODF-329; carrying strict project rules or permitted read-only checking into authoring may avoid this rework. Net saving is unmeasured; no guidance changed here.

- Execution: SEED-396#replace-evaluation-shell-checks (plan 679; first implementation `251af1f66bb8830227df0b59fbc2306a33df4c40`)
  - Timestamp: unknown (2026-11-17; slice 1 and 3 delivery)
  - Tool: Codex
  - Model: gpt-6.1-sol
  - Open Dough release: 0.3.104 (checkout-bound installation unchanged from claim `0ada9a1e3`)
  - Evidence: implementation and refactor briefs reserved formatter/hook-owned lint for the coordinator. Both refactor returns were clean; guarded fresh then refused slice 1 on SC2154/SC2016/SC2034 and slice 3 on SC1007/SC2094. Explicit initialization and narrow directives resolved the findings before publication (`251af1f66`, `1da6ffa75`).
  - Observed effect: two preparation refusals and coordinator mechanical repairs; no failed candidate was committed or published.
  - Inference: matches ODF-329. Earlier authored-file checking or carrying the strict shell rules may avoid this rework; effort saving is unmeasured.

- Execution: SEED-340#declare-every-worker-preparation-with-its-own-budget (plan 692; first implementation `df9c246dcf1d9bf242d93f8517d01c70cf858587`)
  - Timestamp: unknown (2026-11-18; slice 2 delivery)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.105 (checkout-bound installation at claim `b0763981528`)
  - Evidence: slice 1 and 2 implementation and refactor briefs forbade hook-owned lint and named no strict rule. Guarded fresh delivery of slice 2 refused on `@typescript-eslint/require-await` (three nested proof cases) and `no-unnecessary-condition`; the coordinator repaired them, reran the Backend spec and retried (`6c7b0461f`). Briefs for slices 3–7 allowed a read-only `npx eslint` and named both rules; their deliveries formatted clean.
  - Observed effect: one preparation refusal and a coordinator repair with one focused rerun; no failed candidate was committed or published.
  - Inference: matches ODF-329; allowing the read-only check in the brief again removed it for the rest of the execution.

- Execution: SEED-379#state-only-what-the-checkout-log-shows (plan 700; first implementation `c5a081fccc6319dd1d4f9bfa264c1e352affdd66`)
  - Timestamp: unknown (2026-11-18 +08:00; slice 1 and slice 5 delivery)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound guidance at Take `730571d29023631e33ef8bb8da3260fa6eb1fcd7`)
  - Evidence: guarded formatting refused on `no-unnecessary-condition` in `doneMarks.ts` and `no-param-reassign` in `launchRecordPins.ts` after both independent refactors. The coordinator separated the existing pre- and post-await checks, reran the Done and quiet rename specs, then used a local variable for the second repair.
  - Observed effect: two failed preparation attempts before publication. Neither failing candidate was committed.
  - Inference: the briefs left formatting and full lint with delivery and did not include an authored-file, read-only check. Both diagnostics were available before commit; net saving was not measured.

## ODF-169 — Stale replay base includes sibling commits <a id="odf-169"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-169.md).

### Occurrences

- Execution: SEED-301#serve-frontend-dashboard-answers-through-makeme (plan 655; first implementation `b03df3cbb`)
  - Timestamp: unknown (2026-11-16 +08:00; preparation landing between `f3de595a4` at 11:37:45 and `95301a62d` at 11:40:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `f6537a3a0`; no release inferred from product VERSION)
  - Evidence: coordinator run history. Trunk preparation landing via `fresh --mode trunk` reconciled onto moved trunk (`9f9f6e197`) and returned `needs-validation`. A `fresh --validated-candidate` rerun failed with "nothing to commit"; `deliver --validated-candidate` with the original base stopped `conflict`; rerunning with the reconciled tip `cb462d3c2` as base published.
  - Observed effect: two failed delivery attempts before the preparation landed; no wrong commit reached trunk.
  - Inference: same retry-base trap as ODF-169 (and its "fresh versus deliver" rerun choice). Cost a few minutes; not measured.

## DD-543 — Story Branch start reports a reused remote branch published without advancing it

`execution-start.mjs start` in Story Branch Mode returns `status: published` once the claim is on trunk, but `publishStoryBranch` (`workspace-publication-push.mjs`) pushes only when the remote story branch is absent. A reused session branch already on origin keeps its old tip, so the receipt's published SHA (the Take) is not the remote branch tip, and the first slice delivery given that SHA as `--previously-published-base` replays trunk history onto the stale branch.

### Occurrences

- Execution: SEED-301#serve-frontend-dashboard-answers-through-makeme (plan 655; first implementation `b03df3cbb`)
  - Timestamp: unknown (2026-11-16 +08:00; between Take `f6537a3a0` at 11:41:34 and slice 1 `b03df3cbb` at 11:51:08)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `f6537a3a0`; no release inferred from product VERSION)
  - Evidence: coordinator run history: the queued Take in the established worktree returned `status: published`, `created: false`, while `origin/claude/in-the-front-end-unit-tests-not-limited-to-this` stayed at the previous story's landed tip `8edd83a7b` (an ancestor of the Take). Slice 1 `execution-increment-delivery.mjs fresh --previously-published-base f6537a3a0` rebased onto `8edd83a7b` and stopped `conflict` with an interactive rebase in progress. After `git rebase --abort`, `deliver --previously-published-base 8edd83a7b --validated-candidate <full sha>` fast-forwarded. Installed `publishStoryBranch` returns early when `lsRemoteSha` finds the ref.
  - Observed effect: one conflicted delivery, a manual abort and diagnosis (about 5 minutes); no history was rewritten.
  - Inference: the start should fast-forward an existing remote story branch to the published Take (or refuse when it cannot), or report the remote tip as the published base. Distinct from ODF-169, whose stale base comes from a reconciliation receipt; here the start receipt itself names an unpublished base.

## DD-544 — Source-only review omits a promise stated outside Goal, Scope and Key examples

The coordinator gave the source-only reviewer the story's Goal, Scope (with
exclusions) and Key examples, as the review guidance names. The story's later
"UI and architecture" section held a further promise ("identifies each tool
through labeled series rather than color alone"). No commitment carried it,
so no slice owned it, and acceptance and refactor passes did not check it.

### Occurrences

- Execution: SEED-383#compare-codex-and-claude-code-token-usage (plan 658; first implementation `6cb3aac`)
  - Timestamp: 2026-11-16T12:29:00+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `650971b14`; no release inferred from product VERSION)
  - Evidence: coordinator extracted seed lines 22–70 (Goal through Key examples) for the reviewer; the `#### UI and architecture` section followed. Retrospective outcome review found colour-only Claude Code marks and a legend that matches neither tool; correction SEED-383#tell-compared-usage-tools-apart (plan 662).
  - Observed effect: a story promise was delivered unmet with all 66 commitments marked observed; only the independent retrospective review caught it.
  - Inference: related to ODF-339 (line-range extraction) and ODF-377 (incomplete inputs), but here the input followed the named sections; the gap is that promises can live in other story sections.

## DD-545 — A Behavior slice holding view state, controls, styling, specs and E2E migration overran

Slice 2 planned per-tool reads, a new tool control, union offerings, per-tool
summaries, trace styling, a new frontend spec, every affected Usage spec, three
E2E specs and the contract document in 15 active minutes.

### Occurrences

- Execution: SEED-383#compare-codex-and-claude-code-token-usage (plan 658, slice 2)
  - Timestamp: 2026-11-16T12:37:00+08:00
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `650971b14`; no release inferred from product VERSION)
  - Evidence: implementer returned at about 22 active minutes with E2E migration and contract document undone (E2E tools spec broken); the coordinator retained the slice and continued the same agent (about 8 more minutes); slice 2 "Overrun" note at `488cd602f:.planning/slice-plans/658-compare-codex-and-claude-code-token-usage/PLAN.md`.
  - Observed effect: about 30 active minutes against 15; no work was discarded; delivery stayed CI-green.
  - Inference: the plan named every consumer, but sizing did not count the E2E migrations as work; retained compatible work avoided waste. Cost is the agent's elapsed time only; tokens not measured.

## DD-546 — A plan's size decisions omit a long planning record its removal slice edits

A Structure slice that corrects passages across many records recorded a
reorganization decision for the oversized finding catalogs it edits, but not
for an oversized queued seed it also edits, so the refactor pass's 250-line
gate stopped for a human decision.

### Occurrences

- Execution: SEED-381#fixed-shards-for-browser-tests-and-on-demand-rebalancing (plan 656; first implementation 3ee71a8b9)
  - Timestamp: unknown (2026-11-16, after slice 6's full local suite)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `7eb0efc50`; no release inferred from product VERSION)
  - Evidence: plan 656 slice 6 named the duration-list mention in `SEED-300` (392 lines) and gave a seam decision only for `ProjectFindings.md` and `project-test-findings.md`; the slice 6 refactor pass returned a jidoka stop; Terry chose "seam per story", recorded in slice 6 at `6348334e6`.
  - Observed effect: one human question and a held slice 6 delivery; the two-word edit shipped after the decision.
  - Inference: planning checked size for files it reorganizes, not for every file a sweep of references edits; a sweep slice can list each over-limit file with its seam before readiness.

## DD-547 — A sibling story landed first on files this story's seed says it rewrites first

The selected story's seed said SEED-382 "follows" it because both rewrite the
browser jobs' configuration, but SEED-382 was taken and closed on trunk during
this execution.

### Occurrences

- Execution: SEED-381#fixed-shards-for-browser-tests-and-on-demand-rebalancing (plan 656; first implementation 3ee71a8b9)
  - Timestamp: unknown (2026-11-16; SEED-382 closed on trunk at `2371b6f58` before slice 6's delivery)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `7eb0efc50`; no release inferred from product VERSION)
  - Evidence: `.planning/seeds/SEED-382-browser-test-job-headroom-on-slow-runners.md` named this story as its predecessor; trunk changed `.github/workflows/ci.yml`, `browser-test-group.yml` and `dashboard/tests/shards.md`; the branch merged `main` at `d5e8ec4f2` with two conflicts and reran merged-state proof; source freshness absorbed SEED-382's closure amendment to this story's scope limit.
  - Observed effect: one mid-execution merge, two hand-resolved conflicts and a focused merged-state proof run; CI stayed green.
  - Inference: a "follows" note in a seed is not a blocking dependency, so the backlog let the sibling start; recording it as a prerequisite would have serialized them. Cost is modest here.
- Execution: SEED-334#move-story-reference-checks (plan 689; first implementation `2552c531`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `ac8d1fc21`)
  - Timestamp: unknown (2026-11-18, slice 8 briefing)
  - Evidence: SEED-382#run-the-integrated-group-as-one-ci-job closed on trunk (`175762614`) before this Take; plan 689 slice 8 still told the slice to set `dashboard-integrated` to one shard in `ci.yml`, `shards.md` and the shard check. The coordinator found them landed while briefing and aligned the plan text.
  - Observed effect: one inspection; no merge or conflict.

## DD-548 — Removal and CI-switch slices overran with proof complete

Two slices finished all planned proof but ran past 15 active minutes: the slice
switching every browser configuration and its consumers to the declared shards,
and the slice deleting the deal and correcting about 30 documents and records.

### Occurrences

- Execution: SEED-381#fixed-shards-for-browser-tests-and-on-demand-rebalancing (plan 656; first implementation 3ee71a8b9)
  - Timestamp: unknown (2026-11-16)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `7eb0efc50`; no release inferred from product VERSION)
  - Evidence: slice 4 return "about 20 minutes"; slice 6 return "about 25 minutes, not counting the 37-minute suite run"; both recorded in plan 656 Learnings at `6348334e6`.
  - Observed effect: no discarded work; both slices delivered with accepted proof.
  - Inference: like DD-545, sizing counted the core change but not the consumer and document sweep each slice owned; a sweep across many files may deserve its own slice.
- Execution: SEED-388#show-the-effort-a-launch-runs-with (plan 664; first implementation 535898511)
  - Timestamp: 2026-11-16T16:29:00+08:00 (slice 1 return; about 16:08–16:29 local)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.102 (guidance updated at starting revision `3b1479996`)
  - Evidence: plan 664's premise row ran its scratch default only over backend `launches/` (9 failures) and listed those nine consumers. Slice 1 also had to update about 20 more exact-argv or kept-start assertions in backend `sessions/`, shared test support and `e2e/`; a serial-mode spec hid a second failure behind the first. Slice 1 return reports about 21 minutes; plan 664 slice 1 Learning at `535898511`.
  - Observed effect: no discarded work; the slice delivered with accepted proof (374 + 256 + 54 passed).
  - Inference: same sizing gap as above, here seeded by a premise observation scoped to one test directory; a default that changes exact command-line output reaches every suite that pins that output, and serial-mode files undercount failures.

## DD-550 — Agents' own active-time estimates ran two to five times the measured time

Implementation and refactor agents that reported an estimated active time
named figures well above what the host recorded for their whole run. The
slices timed by the new slice clock had no such gap.

### Occurrences

- Execution: SEED-367#count-slice-active-time-deterministically (plan 667; first implementation `0c454d10b5826b5b9121f8ae7a9bb718579b5269`)
  - Timestamp: unknown (2026-11-16 +08:00, between 16:59 and 17:35)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: unknown (checkout-bound installed guidance at Take `f1bff2c54`)
  - Evidence: agent returns against the host's recorded run durations. Slice 2 implementer "about 11 minutes, estimated and not clock-measured" against 261 s. Refactor passes "roughly 10", "roughly 12", "6" and "roughly 6 minutes" against 113 s, 158 s, 70 s and 95 s. Slices 3–5 ran under the slice clock from source: 3.4, 3.7 and 1.7 active minutes, each matching its record's periods less its `run` intervals.
  - Observed effect: no overrun and no wrong stop here, since every slice was far inside 15 minutes. An estimate of this kind near the limit would report an overrun that did not happen, or support a split that was not needed.
  - Inference: one execution, one model and short slices; the direction on long slices is not observed. Earlier findings that quote an agent's own minutes (DD-545, DD-548) may overstate those overruns.
- Execution: SEED-391#redo-the-effort-story-under-the-test-focus-guidance (plan 668; first research publication 5ea5ca123ecc8b5b87321adb69a3920bcec8f732)
  - Timestamp: 2026-11-17T01:08:01.140Z (first Claude refactor return)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: modified; replay patch 934a51a30 over historical 0.3.102 guidance
  - Evidence: [readable refactor returns](https://github.com/terryyin/open-dough/blob/fbfaa116b961a445cc606fd05363bf75f6ecad5f/.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/claude-refactor.md). First return estimates 25 active minutes within a 00:58:57.197–01:08:01.140 UTC delegation window (9.07 elapsed minutes); later returns estimate 12, 10 and 15 minutes within approximately 3.79, 1.83 and 2.34 elapsed minutes.
  - Observed effect: self-estimates exceed even whole delegation elapsed time; the research does not use them as actual work time. Native usage, defined transcript proxies and unavailable exact active time remain separate.
  - Inference: changing host/model does not make a self-reported clock reliable; measured elapsed is an upper bound here, not an active-work measurement. No new runtime counter or story is selected from this occurrence.

- Execution: SEED-393#repeat-native-guidance-checks-on-real-story-examples (plan 674; first implementation d178ed635)
  - Timestamp: 2026-11-17T14:05:00+08:00 (approximate; slice 3 first return)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take cc72d082c)
  - Evidence: the slice 3 implementer returned "unfinished, only the basis text is written; time ran out", saying it had used "about 8" of 15 minutes. `slice-clock.mjs status` then reported 1.5 elapsed and 13.5 remaining, with no overrun.
  - Observed effect: a wrong stop. The coordinator checked the clock and resumed the same agent, which cost one extra delegation round.
  - Inference: a near-limit self-estimate now triggered a stop; checking the clock before accepting a time stop caught it.

- Execution: SEED-345#test-agent-effort-through-its-output-contract (plan 678; first implementation 849f72ca97d8c72e4173244f12d5558ff2679b60)
  - Timestamp: unknown (2026-11-17 +08:00, slice 3 first return)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take 30d3acfff)
  - Evidence: the slice 3 implementer returned "partial … I stopped near the 15-minute active clock limit (about 14 minutes used, estimated from the clock runs)". `slice-clock.mjs pause` then reported 3.8 elapsed and 11.2 remaining, no overrun. Resumed, the same agent finished at 11.8 clock minutes.
  - Observed effect: a second wrong stop on a self-estimate; one extra delegation round.
  - Inference: the agent counted time inside `run`, which the clock excludes. Checking the clock before accepting a time stop again caught it.

## DD-551 — A rule over retained history is accepted on fixtures before any real-history comparison

A changed attribution rule passed its fixture specs and full consumer suite and was published, but its first import over this machine's retained history dropped launches to zero. Only an every-record before/after comparison on a copy exposed it, and two more real-data defects followed.

### Occurrences

- Execution: SEED-388#count-claude-code-work-after-a-developer-reply (plan 665; first implementation dcd69ec7b)
  - Timestamp: 2026-11-16T16:55:00+08:00 (approximate; first copy import evaluated)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take 7de032b23)
  - Evidence: slice 1 accepted on 5 fixture cases and usage-history 98/98, published dcd69ec7b; slice 2's copy import made 17 of 424 Codex launches 0 (duplicate task on reimport, repaired 5145a57c3); the next run made 11 launches unpriced (turn-start compaction before its turn_context) and kept a `/dough-land` without `<command-args>` in its execution (both repaired 0a58de188). Each real-store import took 9–12.5 min at about 4 GB; a store already written with a defective rule had to be restored from backup because stored task turns only grow.
  - Observed effect: three repair cycles on the story branch, three full imports of real history plus a restore, and slice 2 over its active budget; no trunk impact.
  - Inference: the plan's decisive premises sampled simple shapes; a narrowed import of a few real sessions with a per-record comparison, run before accepting slice 1, would likely have found all three defects earlier. Saving is unmeasured.
- Execution: SEED-379#keep-default-main-session-changes-for-review (plan 693; first implementation 5cdf62a89)
  - Timestamp: unknown (2026-11-18; post-execution review of 5d4ce67ae..27664feb3)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: 0.3.106 (checkout-bound installation at Take 5d4ce67ae)
  - Evidence: the plan's premise tallied the real checkout's reflog kinds but the capture rule was accepted on planned journeys; after eight accepted slices the independent review, confirmed in scratch repositories, found an amended merge (`commit (amend)`, two parents), a continued cherry-pick (`commit (cherry-pick)`) and an autosquash (`rebase (fixup)`) misread; correction plan 700.
  - Observed effect: a merged run and false "made no commits" answers reached the story branch; a correction story and plan were queued.
  - Inference: same problem with matching uncertainty: the history was surveyed, not compared entry by entry against the rule's output. Running the rule over a real reflog window first would likely have shown the unplaced kinds.

## DD-552 — A slice grows a reference already at the 250-line limit that the plan did not size

The plan checked size for the script it reorganized, not for a guidance file
sitting exactly at the limit that its slice added lines to, so the split was
designed after implementation instead of in planning.

### Occurrences

- Execution: SEED-367#bound-diagnosis-in-evidence-rounds (plan 669; first implementation `cce82241194e3f8f5e58b84342dfcd92c51d63c8`)
  - Timestamp: unknown (2026-11-16 +08:00; slice 2 refactor pass, before commit `0f665967` at 19:10:23)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `2d69b6928`)
  - Evidence: plan 669 recorded `slice-clock.mjs` at 199 lines and a seam for it, and told slice 2 to edit `execution-decisions.md`, then exactly 250 lines. Slice 2 added four lines; the refactor pass reported 254. The coordinator moved the self-contained live-action section into `live-action-regression-proof.md`, retargeted two links and declared the file in the install payload.
  - Observed effect: an unplanned structural change inside a behavior slice's delivery; no human stop and no failed delivery.
  - Inference: the delegation rule triggers only on files already over the limit; a file at the limit that a slice grows needs the same seam decision at planning time. Related to DD-546, which concerns an over-limit file a sweep edits.
- Execution: SEED-334#move-story-reference-checks (plan 689; first implementation `2552c531`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `ac8d1fc21`)
  - Timestamp: unknown (2026-11-18, slice 1 refactor pass)
  - Evidence: plan 689 was 276 lines at Take and its gates recorded each slice's assertion map and scratch break "in this plan"; slice 1's refactor pass stopped at 316. The coordinator moved evidence to a sibling file, which passed 250 again at slice 5 and was split by reference kind.
  - Observed effect: two unplanned record reorganizations; no human stop.
- Execution: SEED-353#declare-trunk-review-authorship (plan 711; first implementation `61b3b48a2`)
  - Timestamp: 2026-11-19T09:12:00+08:00 (slice-4 refactor Jidoka stop)
  - Tool: Cursor
  - Open Dough release: unknown (checkout-bound installed guidance at Take `cd588fe73`)
  - Evidence: plan 711 File size claimed `storyReviewTrunkMode.ts` 216 and "Other expected edits stay under 250"; slice-4 refactor `1942ff8f` returned REFACTOR JIDOKA STOP (storyReviewTrunkMode 314, repository-history 267, repository-fixture.test 277) with no reorganization decision; coordinator authorized three seams; Learnings record the plan's under-250 expectation was wrong; seams landed in `07683c6d2`.
  - Observed effect: one mid-refactor Jidoka stop, an authorized reorganization round, and delayed slice-4 delivery until seams landed; no human owner question.
  - Inference: matching uncertainty with the at-limit DD-552 form — files started under 250 with an explicit stay-under claim, and planned Behavior content grew them past the gate. A planning-time seam for each Behavior-grown module would avoid discovering the split after implementation. Related ODF-516 family.

## DD-553 — A real-history premise is settled at an intermediate stage, not at the total it predicts

The plan treated "no other loss in the launch" as settled because a scratch replay of the real session showed every measurement reaching a root. The promised result was the launch total. The full real-store import showed a second loss that only task association reveals. A narrowed import of that one session, taking seconds, later reproduced it exactly. Related: [DD-551](#dd-551--a-rule-over-retained-history-is-accepted-on-fixtures-before-any-real-history-comparison).

### Occurrences

- Execution: SEED-388#count-nested-claude-background-agent-work (plan 670; first implementation 669216b05)
  - Timestamp: 2026-11-16T19:05:00+08:00 (approximate; first real-store import evaluated)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take 20c85d95a)
  - Evidence: The plan's premise row "No other loss affects SEED-334's launch" was "settled from the analysis". The preparation replay checked climb-to-root only. After the climb fix, the first full import (611 s) read 67.84M, not 74.03M. A scratch import of only session 50829ac2… showed 251 fork-replayed responses marked contradictory-lineage. After a developer decision and the fork-replay rule, the second full import (940 s) read 74.03M.
  - Observed effect: an extra full real-store import, a diagnosis, and a developer stop with an attention report before the slice could finish. There was no trunk impact.
  - Inference: settling a premise about a total by running the consuming operation narrowed to the affected sessions would have found the loss during preparation. The saving is about one full import plus a human round trip; the exact figure is unmeasured.

## DD-554 — A real-store prediction is settled on a scratch store that starts empty

The plan predicted the real store's remaining `malformed-native-row` count from a scratch import into an empty home. The real store already held those gaps, and how a write reconciles stored gaps was never exercised. The real-store import restored every response but kept all 3,316 gaps, because reader gaps carry no host and a reread never replaces them. Related: [DD-553](#dd-553--a-real-history-premise-is-settled-at-an-intermediate-stage-not-at-the-total-it-predicts).

### Occurrences

- Execution: SEED-388#read-claude-rows-with-unicode-line-separators (plan 667; first implementation a3553a7ad)
  - Timestamp: 2026-11-16T20:58:00+08:00 (approximate; real-store import evaluated)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take 485784b7d)
  - Evidence: plan 667's premise row "Reader change alone restores SEED-124's 15.42M" observed 30 → 0 gaps in a scratch home with copied launch records only, and its proof row read "remaining `malformed-native-row` count (expected 0)". The real import (16 min) left 3,316; `reconciledGaps` drops a stored gap only through `gapSessionKeys`, which needs `host`.
  - Observed effect: a diagnosis of about a dozen tool calls and a correction story (SEED-388#replace-native-reader-gaps-on-reread, plan 669). There was no trunk impact and no extra import.
  - Inference: seeding the scratch home with a copy of the real store, or the real store's gaps for the copied session, would have shown the retention during preparation. The saving is unmeasured.

## DD-557 — Launch-record delivery listeners planned for the dashboard process miss Cursor's runner process <a id="dd-557"></a>

A plan treated `replaceRecords` as the single confirmation seam and installed a delivery listener only on the dashboard launch boundary. Cursor confirms first input in `runnerMain`, so that write never saw the listener until the same install ran in the runner process.

### Occurrences

- Execution: SEED-348#attach-story-notes-to-follow-ups (plan 672; first implementation `49396e6d2af120da82111917647c1ff678abc49f`)
  - Timestamp: 2026-11-17T15:34:33+08:00 (slice 4 Cursor proof failure context folder)
  - Tool: Cursor
  - Open Dough release: 0.3.103 (checkout-bound installed guidance at Take `522e71f54ec31ae42d4da6558fb36d398524bfeb`)
  - Evidence: plan decisive premises (2026-11-17 at `2a206edf7`) confirmed Cursor `runnerKeep` writes through `replaceRecords` but did not name the runner process. Slice 4 agent `8f8d2082-f47f-4b57-bc6c-3f4b613b044f`: `.tmp/slice-4-proof/delivery.log` and `cursor-debug.log` / `cursor-debug2.log` failed “uncertain Cursor first input…” with `delivered` still `undefined` after `confirmed`; after `installStoryNoteDelivery()` in `hosts/cursor/runnerMain.ts`, `cursor-debug3.log` passed. Publish `b22bc615a` and plan Learnings record dual install + `launchRecordDelivery.ts`.
  - Observed effect: Claude delivery cases passed with boundary-only install; Cursor late confirmation left notes waiting until the runner also installed the listener. Two failed Cursor runs then a fix inside the same slice.
  - Inference: a shared file writer is not one process. Premises that settle “every confirmation reaches replaceRecords” still need which processes call it when side effects register in-process. Cost of the miss is the failed Cursor iterations; unmeasured in tokens.

## DD-558 — A plan's extraction source names a commit that is not on origin <a id="dd-558"></a>

The plan decided to extract a reusable case from a frozen commit and premised it as recoverable. Its premise table checked that a scratch bundle verified, but it did not check that the named commit was reachable on the remote a case fixture fetches from. Neither replay commit was on origin.

### Occurrences

- Execution: SEED-393#repeat-native-guidance-checks-on-real-story-examples (plan 674; first implementation d178ed635)
  - Timestamp: 2026-11-17T13:14:00+08:00 (approximate; slice 2 stop)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take cc72d082c)
  - Evidence: plan 674's Current decisions said "Extract the new case from frozen Codex B product/test `8b9005acc`". `git merge-base --is-ancestor 8b9005acc origin/main` failed and `git branch -r --contains` was empty. Only `4b75c2888` and `fbfaa116` were on origin.
  - Observed effect: slice 2 stopped at 2.5 active minutes with no changes. It was refined into two slices with a tracked overlay of 33 files. One extra delegation round was spent.
  - Inference: a one-line reachability check in the premise table would have shown this during preparation. The time saved is unmeasured.

## DD-559 — A planned controlled proof cannot fit the CI job deadline, and its cost was never estimated <a id="dd-559"></a>

The plan required a controlled end-to-end journey for each reference outcome, through real probes. Each probe pass starts Playwright five or six times, about 3 to 5 minutes per outcome. The CI job deadline is a fixed 180 s. Planning had no measurement or estimate of that cost.

### Occurrences

- Execution: SEED-393#repeat-native-guidance-checks-on-real-story-examples (plan 674; first implementation d178ed635)
  - Timestamp: 2026-11-17T14:40:00+08:00 (approximate; slice 3 second return)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take cc72d082c)
  - Evidence: slice 3 measured 280 s for one state's probe pass at load about 40. Reference qualification took 178–276 s per outcome at load 17–36. `scripts/test-job-deadline.bash` sets `JOB_DEADLINE_SECONDS=180`.
  - Observed effect: a mid-slice scope stop. The coordinator settled it, following the doughnut-title-precedence precedent, as a manual real-entry reference qualification plus stand-in CI tests. The slice took about 90 minutes of wall time.
  - Inference: when a plan names per-outcome proof through a costly runner, it should estimate one run against the CI job deadline. The saving is unmeasured.

## DD-560 — A consumer trace searched by a removed phrase misses its reworded restatements <a id="dd-560"></a>

An implementer changed a rule sentence and traced it with `--term` for the
removed wording only; two other references restating the same rule in other
words were not listed and kept the old rule until coordinator acceptance.

### Occurrences

- Execution: SEED-393#proof-reaches-unchanged-consumers-of-changed-output
  - Timestamp: unknown
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.103
  - Evidence: 2026-11-17, slice 1 before `7875763cc`; implementer trace `--term 'suite covering the changed surface'` (and other removed phrases) reported no other guidance reader; coordinator `git grep "changed surface"` found execute-plan `delegation.md:95` and `wrap-up.md:77` ("the changed surface's suite"), both then aligned in `7875763cc`.
  - Observed effect: the return claimed no remaining consumer; two restatements of the changed rule would have shipped contradicting it.
  - Inference: literal-phrase terms find quotations, not restatements; a term for the rule's concept (here "changed surface") reached them.

## DD-561 — First return drops required narrow keyboard proof when Side panel hides the Board <a id="dd-561"></a>

Plan and delegation required beyond-ten source reveal by keyboard on a narrow
reduced-motion viewport, keeping selection and Side panel. A covering Side panel
at narrow width makes the Board `aria-hidden`, so destination focus cannot be
observed with that panel open. The first return kept keyboard and panel at
1280×844 and left the narrow keyboard observation unobserved; acceptance
returned the uncommitted slice to split the cases. Matching to ODF-314 is
uncertain: the return disclosed unfinished work and the constraint, and the
correction found no product defect.

### Occurrences

- Execution: SEED-390#group-ad-hoc-follow-ups-with-their-done-story (plan 667; first implementation `7f17a6f0a4a3203918bd6c6139d45e5d65593b62`)
  - Timestamp: 2026-11-17T16:48:00+08:00 (acceptance return)
  - Tool: Cursor
  - Open Dough release: 0.3.104 (Take `e701ff22adecf4600641622ce561926486d5abed` after guidance update `a7a26b4ef`)
  - Evidence: plan 667 slice 2 Proof (“keyboard on a narrow reduced-motion viewport with a selected story and open Side panel kept”); implementer `4940154d-d8f9-4f75-8c74-da8d09fd06de` first return (5 frontend cases at 1280 only; P3 “Met with gap”); coordinator acceptance resume naming missing narrow keyboard; corrected return added 390×844 keyboard case without covering panel and kept 1280 panel case (6 passed). Slice 2 delivered at `1b59dccfe86cef48963b6441ccd4ebadbc80d418`; learning retained in plan Learnings.
  - Observed effect: one acceptance return on the same uncommitted slice before delivery; active time remained about 14 of 15 minutes after correction; no product-behavior change beyond adding the missing narrow observation.
  - Inference: possible kinship to ODF-314 (plan-owned observation missing until acceptance returned it), qualified because the return already named unfinished/gap status and the aria-hidden constraint. Split narrow keyboard from covering-panel preservation on first return when co-observation is impossible.

## DD-563 — Removing a copied-data assertion also drops the behavior it bundled <a id="dd-563"></a>

Assertion-removal slices were proved by a green focused run plus, where
planned, one named fault. Three removals also took out a non-data observation
bundled into the same assertion or loop, and a green run cannot show a lost
observation. Two were caught only by the independent refactor pass or
coordinator acceptance; the third surfaced only in wrap-up's Intent Coverage
probe.

### Occurrences

- Execution: SEED-396#remove-redundant-evaluation-checks (plan 680; first implementation `f2226ca4b`)
  - Timestamp: unknown (2026-11-17, about 19:36–20:50 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.104 (checkout-bound installed guidance at Take `1c7709ca7`)
  - Evidence: slice 1's rewrite filtered out the catalog's indented trait lines (refactor pass restored a full-listing assertion; a suppressed-trait fault failed it). Slice 2 removed `assert_record`, which also asserted the record labels (coordinator acceptance had the refactor pass add `assert_records_show_layout`; a dropped `setup:` line fails it). Slice 3 removed the 12-case `native_case_known` loop with no planned fault; the wrap-up probe refused `delivery-evidence/selection` in the router and all retained checks stayed green, while the pre-slice test failed.
  - Observed effect: two observations restored before delivery; one narrow per-case acceptance path left unprotected, accepted as restated registry data.
  - Inference: a removal slice may need to list what each removed assertion observes beyond the copied data, with one fault per removed observation, before the green run is accepted.

## DD-564 — Deletion-only slices still pay a full implementer and refactor-agent pair <a id="dd-564"></a>

Slices whose whole change was deleting three to six test lines each used a
fresh implementation agent and a fresh refactor agent. Two of the three refactor
passes on such slices made no edits.

### Occurrences

- Execution: SEED-396#remove-redundant-evaluation-checks (plan 680; first implementation `f2226ca4b`)
  - Timestamp: unknown (2026-11-17, slices 3–5, about 19:55–20:20 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.104 (checkout-bound installed guidance at Take `1c7709ca7`)
  - Evidence: subagent usage reports. Slice 4 (3-line deletion): implementer 47.7k tokens, refactor 49.3k tokens with no edits. Slice 3 (6-line change): implementer 73.1k, refactor 58.5k with no edits. Slice 5 refactor 60.5k with no edits.
  - Observed effect: about 290k subagent tokens across these passes; no defect found by the no-edit refactor passes.
  - Inference: delivery step 1 allows skipping the refactor spawn only for records-only changes or edits within an accepted refactor return. A pure test-line deletion with a clean consumer trace may deserve a similar disposition. Slice 2's refactor pass did find a real gap, so the saving is not unconditional.
- Execution: SEED-393#try-guidance-improvements-by-redoing-the-source-story (plan 680-try-an-unfamiliar-improvement…; first implementation `a2aa0a919`)
  - Timestamp: unknown (2026-11-17, slices 1 and 5, about 22:40–23:30 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.104 (checkout-bound installed guidance at Take `103754553`)
  - Evidence: subagent usage reports. Slice 1 (a new 32-line maintainer-doc section in `Distribution/evaluation/guidance-checks.md`): refactor 54.9k tokens, "none, already clean". Slice 5 (one 4-line paragraph in a maintainer skill): refactor 51.6k tokens, no edits. Slice 4's recipe correction used the within-accepted-return disposition and spawned none.
  - Observed effect: about 106k subagent tokens on two no-edit passes over small documentation additions; no defect found.
  - Inference: matched to this finding as the same concrete cost (a tiny non-records change pays a full no-edit refactor pass), though the changes here were documentation additions, not test deletions. A behavior review already walked each change, which may be what made the pass redundant.

## ODF-338 — Concurrent slices invalidate proof in one checkout <a id="odf-338"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-338.md).

### Occurrences

- Execution: SEED-334#move-intent-ci-proof-comparison-and-candidate-checks (plan 651; first implementation `e7aac254bbe59f5dc277d473386359dddf56132d`)
  - Timestamp: 2026-11-17T11:06:41Z (failed consumer run start)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `9aa696980`)
  - Evidence: the coordinator ran 130 Frontend `showColumn` consumers for a flake repair while the slice 5 implementer had a scratch break (`useSummarySorting` on `useState`) applied in the same checkout. `intent-summary-ci-proof-sort` failed with folder `aria-sort` empty, exactly that break; 3 of 3 passed on clean source. Record at `309dacb4:.planning/slice-plans/651-move-intent-ci-proof-comparison-and-candidate-checks/diagnosis-show-column-flake.md`.
  - Observed effect: one false failure, a rerun and an attribution check; later briefs forbade other proof while a break was active.
  - Inference: a scratch product break is a checkout-wide input; concurrent proof in that checkout is invalid while it is applied.

## DD-566 — A compound scratch break is accepted as proof that one guard is protected <a id="dd-566"></a>

Slice 8's implementer broke three things at once in `IntentCandidatesRecord.tsx`
(no abort signal, no stale-read guard, answered over kept) and reported the
held-answer test failing as proof that an old held answer cannot replace Show
latest. Acceptance took it. Wrap-up's Intent Coverage check removed only the
stale-read guards: the test passed 4 of 4, while an independent witness saw the
departed read show "could not be read at this revision" after Show latest.

### Occurrences

- Execution: SEED-334#move-intent-ci-proof-comparison-and-candidate-checks (plan 651; first implementation `e7aac254bbe59f5dc277d473386359dddf56132d`)
  - Timestamp: 2026-11-17T13:12:00Z (Intent Coverage report)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `9aa696980`)
  - Evidence: slice 8 Accepted note at `309dacb4` PLAN.md; Intent Coverage verdict "Assertion gap" at `309dacb4`; queued SEED-334#observe-no-stale-candidate-failure-after-show-latest.
  - Observed effect: an assertion gap shipped behind a passing scratch break; one queued test-strengthening story.
  - Inference: a scratch break that changes several mechanisms shows only that some of them matter; a single-mechanism break per promised guard would have exposed the gap at slice acceptance.

## ODF-443 — Refactor return reports an oversized module as within the 250-line limit <a id="odf-443"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-443.md).

### Occurrences

- Execution: SEED-345#test-agent-effort-through-its-output-contract (plan 678; first implementation 849f72ca97d8c72e4173244f12d5558ff2679b60)
  - Timestamp: unknown (2026-11-17 +08:00, slice 4 refactor return before 3ba88d70)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take 30d3acfff)
  - Evidence: the slice 4 refactor return said "All touched files are 250 lines or fewer (largest 170)". `dashboard/AGENT-EFFORT.md`, edited in every slice, was 253 lines at `3ba88d70` (145 at the Take). Each slice's refactor pass reported sizes for code files only, and coordinator acceptance ran no `wc -l` over the diff. The retrospective found it and drafted correction SEED-345#split-the-agent-effort-contract-guide.
  - Observed effect: an oversized guide was published on the branch, and a correction story and plan were needed.
  - Inference: the size check was applied to code files rather than to every file in the diff. A mechanical line count over all changed files at acceptance would have caught it.

## DD-568 — Consumer-trace output is dominated by planning-record matches, so agents fall back to plain search <a id="dd-568"></a>

When run with symbol terms over report modules, `consumer-trace.mjs` returned mostly
changed-path basename and loose sub-term matches in planning, findings and docs
records. Agents replaced it with a targeted `git grep` and said so.

### Occurrences

- Execution: SEED-345#test-agent-effort-through-its-output-contract (plan 678; first implementation 849f72ca97d8c72e4173244f12d5558ff2679b60)
  - Timestamp: unknown (2026-11-17 +08:00, slices 1–4)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take 30d3acfff)
  - Evidence: slice 1 implementer: run "dominated by changed-path basename matches (87KB of planning-file hits)". Slices 2–4 implementers: output "dominated by findings and planning noise" and "loose sub-terms (Peak, Wakes, AGENT-EFFORT)". Each then used targeted `git grep` for production and test consumers.
  - Observed effect: the scripted trace did not supply the disposition in any of the four slices. Agents' targeted searches found the consumers, and coordinator acceptance verified them.
  - Inference: possibly related to ODF-350 and ODF-352 (broad or data-derived terms), but here the noise came from path basenames and planning records with ordinary symbol terms. Token cost was not measured.
- Execution: SEED-334#move-navigation-checks-and-retire-integrated-ui-test (plan 648; first implementation `54dfebff2`)
  - Timestamp: unknown (2026-11-17/18 +08:00, slices 2–7 and refactor passes)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `161830d70`)
  - Evidence: slice 4, 6 and 7 implementers and the slice 1 refactor pass reported `consumer-trace.mjs` output as "the whole branch's changed paths", "noisy, unrelated matches" or "unfocused" for terms such as `publishCatalogProjects`, `longTitleLaunch` and `keepingStarts`, and each listed consumers with `git grep` instead.
  - Observed effect: the scripted trace supplied no disposition in those returns; targeted searches did, and later refactor passes with `--path` traces did.
  - Inference: same pattern as plan 678's row, on a long-running story branch whose many changed paths widen the basename matches. Token cost was not measured.

- Execution: SEED-345#recover-decisive-verification-evidence (first implementation `126391de866d4a3a40e0303c3098df318946ae33`)
  - Timestamp: unknown (2026-11-17 to 2026-11-18 +08:00; implementation and refactor hand-backs)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at Take `ace536b5e`; managed installed copies stayed unchanged)
  - Evidence: Codex session `01a1ea15-5252-7c92-bcc4-9324ac217a07`, launch `3d282d5b-8c78-4ff1-bccd-8097ca474ad9`: slice 1/2/3 traces listed 559/859/848 consumers. Refactor 4's 555-row trace reported 459 matches solely from generic `PLAN.md` metadata. Retained execution evidence at `45ff02fee774a270826cd7507fee2ce1c9d077cc:.planning/slice-plans/683-recover-decisive-verification-evidence/execution-evidence.md`; corresponding hand-backs identify the full trace files.
  - Observed effect: agents annotated hundreds of grouped planning/history exclusions; slice 1 also needed a return to fill blank dispositions. Targeted purpose inspection found the meaningful consumers while the broad trace remained required.
  - Inference: the same basename/record noise as DD-568 recurred, but agents completed rather than abandoned the scripted trace. Annotation and context cost are supported qualitatively; token/time saving is unmeasured.

- Execution: SEED-400#keep-freshness-with-a-valid-take (plan 696; first implementation `03b29b34ee3cfdbe109111b86aba327e0691c277`)
  - Timestamp: unknown (2026-11-18; slice 1 to 3 implementation returns)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: unknown (checkout-bound installed guidance at Take `3e19bc23e`)
  - Evidence: slice 1's return: "The trace output was 155 KB, mostly from the coordinator's `PLAN.md` terms, and is not saved"; slices 2 and 3 saved theirs and read them selectively.
  - Observed effect: the traces named the script's importers but not the size check over the edited reference (the ODF-150 row of this execution).

## DD-569 — Conversion acceptance takes a named existing owner without reading its assertion <a id="dd-569"></a>

Test-conversion slices map each interim assertion to a new case or to an
existing owner. The coordinator accepted one "owned elsewhere" claim from the
owner's file and test names; that owner asserted a neighbouring rule, so the
observation was lost until the retrospective read the assertion.

### Occurrences

- Execution: SEED-334#move-navigation-checks-and-retire-integrated-ui-test (plan 648; first implementation `54dfebff2`)
  - Timestamp: unknown (2026-11-17, slice 3 acceptance, between `c3249d594` and `e10d6698f`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `161830d70`)
  - Evidence: the interim `board-paging-side-panel` last step (a session arriving on a Backlog card keeps "Recently done 0 entries" and the paged view) was handed to `frontend-tests/sessions/recently-done-active-story-sessions.spec.ts`, which checks an arranged state at 54rem and never a session arriving while paged. Plan 648 slice 3 acceptance note recorded the hand-off (`a96f5dae9:.planning/slice-plans/648-move-navigation-checks-and-retire-integrated-ui-test/PLAN.md`); the outcome review found the gap; correction SEED-334#keep-navigation-conversion-proof-whole (plan 687) restores it. Slices 1, 4 and 6 first returns also listed unconverted assertions (revision moves, attach counts and selected file, header read counts) as gaps; the coordinator returned each and all got Frontend homes before acceptance.
  - Observed effect: one lost observation delivered and queued for correction; three first returns needed a second implementer round (about 3–5 slice-clock minutes each).
  - Inference: related to DD-563. Requiring each "owned elsewhere" claim to cite the owner's asserting line, and checking that line at acceptance, would have caught it; the cost is one read per claim.

## DD-571 — Local browser proof with the list reporter hides the strict reporter's output rule <a id="dd-571"></a>

Implementers ran focused Playwright proof with `--reporter=list`, which
replaces the project's strict reporter that fails any passing test writing
output. A new runtime spec's `console.log` passed locally and failed hosted CI.

### Occurrences

- Execution: SEED-340#keep-one-time-test-preparation-out-of-case-budgets (plan 685; first implementation 06eccefa7)
  - Timestamp: 2026-11-18T00:36:37+08:00 (repair commit; failure in run 44125679359)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take 5100215c8)
  - Evidence: run 44125679359 dashboard-backend shard 1/3 failed all three `test-preparation-budget.spec.ts` cases on the strict reporter; repair d7fbd57e1 moved the intervals to `test.info().attach`. The coordinator's own memory then still advised `--reporter=list` for single specs.
  - Observed effect: one stash/repair/publish cycle and one cancelled CI run; later briefs forbade `--reporter=list` and no recurrence followed.
  - Inference: local proof differing from CI's reporter is the cause; the saving of matching it is unmeasured.
- Execution: SEED-334#share-one-executing-agent-roster-arrangement (plan 694; first implementation 66cf068dd)
  - Timestamp: 2026-11-18T01:42:55Z (coordinator's counted rerun)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take 02e33c018)
  - Evidence: plan 694's slice 1 proof command named `--reporter=list`; the brief dropped it. The implementer then set `OPEN_DOUGH_DASHBOARD_PROOF_RECORD`, not the Frontend group's `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` (dashboard/tests/README.md proof record), so its passing runs left no selection count.
  - Observed effect: the coordinator ran the focused journeys once more with the group's proof record to see 8 selected, all expected.
  - Inference: plans still copy the list-reporter form, and the strict form's group prefix is easy to miss; about one extra minute of proof.

## DD-572 — A natural-load acceptance gates completion on machine state no agent controls <a id="dd-572"></a>

The story required first-case proof at natural one-minute load 30–50, and the
maintained resource guide says burners do not stand in for natural load. Natural
load stayed at 4–7, so the finished story waited until the developer directed
burner load instead.

### Occurrences

- Execution: SEED-340#keep-one-time-test-preparation-out-of-case-budgets (plan 685; first implementation 06eccefa7)
  - Timestamp: 2026-11-18 +08:00 (slice 5 wait to developer direction; exact time unknown)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take 5100215c8)
  - Evidence: obligation G1 in plan 685 ("Natural load stayed at 4.8–6.6"); background natural-load wait; developer: "Please proceed without waiting. Figure out other ways to increase the load." 36 nice-5 burners then gave load 32–47 and all three first cases passed with 21–27 s left. Intent Coverage later caught the removed preparation dependency by timeout in the nested proof at load 5–8.
  - Observed effect: completion was held with all slices otherwise delivered; the decisive protection came from the load-independent nested proof, not the loaded timing.
  - Inference: a load-independent discriminating proof plus optional loaded timing may serve such stories without an uncontrollable gate.

## DD-573 — A refactor pass removes support as dead after searching only the dashboard test folders <a id="dd-573"></a>

A post-change refactor pass judged support unused from a search limited to
`dashboard/tests` and `dashboard/frontend-tests`, removed it, then found
callers under `e2e/` and `dashboard/backend-tests/` and restored the files.

### Occurrences

- Execution: SEED-334#retire-integrated-ui-test-and-its-documents (plan 688; first implementation `c2f93725c`)
  - Timestamp: unknown (2026-11-18 +08:00, slice 3 refactor pass)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `0f5a7964c`)
  - Evidence: slice 3 refactor return: it removed `storyWorktree` and un-exported `openStoryReview` after the deletion of `dashboard/tests/navigation/story-destination-repeat-cue.spec.ts`, then restored both with `git show HEAD:<path> > <path>` once e2e and Backend callers turned up; `git status` clean afterwards. Slice 4's brief then required a whole-checkout grep, and its return complied.
  - Observed effect: no change reached a commit; one wasted edit-and-restore round inside the pass.
  - Inference: the dead-code check names no search scope; a test-folder search looks sufficient for test support but is not. Overlaps DD-568 (agents replace the scripted trace with their own search). Cost not measured.

## DD-574 — A planned scratch break cannot fail at the step's own position <a id="dd-574"></a>

The plan named a scratch break, "a paging reset on session arrival", for a
step that sits on Backlog, the Board's first position, where a reset changes
nothing. Planning settled the step's premise but never checked that the break
could fail there.

### Occurrences

- Execution: SEED-334#keep-navigation-conversion-proof-whole (plan 687; first implementation `41d93d114`)
  - Timestamp: unknown (2026-11-18 +08:00, slice 2)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `46aa7f7c0`)
  - Evidence: slice 2 report `s2-report.md` (story-branch evidence dir): runs `s2-break-a` to `s2-break-a10`; a–a3 crashed at startup, a5/a6 watched an attribute the cards lack, a4/a9 forward moves passed, a7 a 300 ms late move passed, only a10 with a fixed 1 s wait failed. Plan 687 slice 2 learning records the limit (`bc928d061:.planning/slice-plans/687-keep-navigation-conversion-proof-whole/PLAN.md`); P4 observed only the passing step.
  - Observed effect: ten break runs to establish that the break could not bite; the slice accepted the step with a recorded limitation.
  - Inference: checking a planned break's ability to fail, at the asserted state, while settling premises would have reworded or dropped it before execution. Run time sat outside the slice clock; slice active time was 5.8 min.

- Execution: SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed (plan 707; first implementation `91e716f20`)
  - Timestamp: unknown (2026-11-19 +08:00, slice 5)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `e8e01643a`)
  - Evidence: `7df4ade39:.planning/slice-plans/707-run-story-notes-checks-at-the-mounted-boundary/PLAN.md` slice 5 proof "Releasing the older read before the save in a scratch edit fails the older-read case"; `s5-discrimination` passed, and the implementer explained that a read answered before the save is not older; `s5-discrimination-guard` (removing `sequence <= shown`) failed instead.
  - Observed effect: one wasted scratch run; the substitute discrimination was accepted.

## DD-575 — A plan prescribes a new promise as a step of another behaviour's test <a id="dd-575"></a>

The plan said an existing paging test "gains its final step" for a separate
promise. The implementer followed it and lengthened the test's title; the
refactor checks forbid widening another behaviour's test, so the refactor pass
split it into its own test and renewed its proof.

### Occurrences

- Execution: SEED-334#keep-navigation-conversion-proof-whole (plan 687; first implementation `41d93d114`)
  - Timestamp: unknown (2026-11-18 +08:00, slice 2 refactor pass)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `46aa7f7c0`)
  - Evidence: plan 687 slice 2 Proof ("`board-paging-side-panel.spec.ts` gains its final step", `bc928d061:.planning/slice-plans/687-keep-navigation-conversion-proof-whole/PLAN.md`); slice 2 refactor return: new test in `board-paging-side-panel.spec.ts` at `251c507ae`, reruns `s2-refactor-specs` and `s2-refactor-break-b`.
  - Observed effect: one restructure and two renewed proof runs inside the refactor pass, which used its full 15 active minutes.
  - Inference: slice planning applied the interim journey's shape without the test-boundary check the refactor pass later applied. Cost beyond those reruns not measured.

## DD-577 — A conversion map records a narrowed interim negative and slice acceptance takes it <a id="dd-577"></a>

A test-conversion slice wrote, in its assertion map, that an interim "no call of any kind" check became "no Done read"; acceptance compared the map, not the narrowing's reason, and the retrospective found the lost observation.

### Occurrences

- Execution: SEED-334#move-story-reference-checks (plan 689; first implementation `2552c531`)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `ac8d1fc21`)
  - Timestamp: unknown (2026-11-18, slice 7 acceptance; corrected in `44a097ab` after the outcome review)
  - Evidence: interim `story-reference-done-recovery` asserted `githubFor(page).calls.slice(before)` equals `[]` after expired and unlisted references; the Frontend case counted only `done` reads. The same review found a refactor pass loosening `boundary-server.spec.ts`'s exact launch command.
  - Observed effect: one correction slice before the execution-complete record; no protection shipped lost.
  - Inference: related to DD-569 and DD-563. Requiring a reason for every narrowing in the map, checked at acceptance, would have caught it.

## DD-578 — A short-touch open helper is repaired twice before matching its sibling Board gate <a id="dd-578"></a>

A new frontend touch-height journey opened Taken review through a shared helper that
first hung on click stability, then failed because Review changes stayed
height-clipped on a one-column Board. The sibling open path already paged Taken
into view; the second repair copied that gate after a second CI round.

### Occurrences

- Execution: SEED-384#keep-review-toolbar-truthful-while-reading (plan 702; first implementation `97fa4134b`)
  - Timestamp: 2026-11-18T21:11:58+08:00 (open-helper settle/tap repair `7f42be69b`; clip/`showColumn` repair `d3e155dd9` at 21:26:25+08:00)
  - Tool: Cursor
  - Open Dough release: unknown (checkout VERSION 0.3.106 at Take `b34318530`; no guidance release inferred)
  - Evidence: diagnoses `.planning/slice-plans/702-keep-review-toolbar-truthful-while-reading/diagnosis-dashboard-frontend-touch-height-44308065717.md` and `diagnosis-dashboard-frontend-touch-height-clipped-44311355288.md`; CI runs 44308065717 and 44311355288; coordinator transcript `26fe99b1-d319-4499-894f-3be1078e76f7` L67–86; sibling `frontendSidePanelWidth.openReview` already called `showColumn(page, "Taken")`; repairs `7f42be69b` and `d3e155dd9` in `dashboard/tests/support/frontendStoryReviewOpen.ts`.
  - Observed effect: two diagnosis clocks (~6.9 and ~6.5 active minutes), stash/restore of slice 4, and two repair publications before the shared open helper matched the sibling Board gate.
  - Inference: when a new short-landscape touch open path is added, copying the sibling helper's Taken column and settle gates before first CI would avoid the second round; local proof had passed without the one-column clip.

## ODF-368 — A plan's slices sit under a heading the obligations and delivery reader refuses <a id="odf-368"></a>

The reader accepts only `## Slices` or `## Ordered slices`. A plan headed `## Ordered slices and outside-in proof` refused the first obligations listing until the coordinator renamed the heading. The [catalog](docs/maintainer/findings/ODF-368.md) holds earlier occurrences.

### Occurrences

- Execution: SEED-401#pilot-new-retrospective-findings (plan 706; first implementation `d6190e523`)
  - Timestamp: unknown (2026-11-18, before slice 1 delegation)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `ad8704e86`)
  - Evidence: `story-obligations.mjs list --slice 1` returned `unreadable-slices` and `unknown-slice` for the heading planned at `da8101ba4`. Renaming it to `## Ordered slices` gave `ok: true`. At that base, plan 704 (Taken, SEED-402) and plan 706-pilot-repeat carry the same longer heading.
  - Observed effect: one refused listing and a heading edit before delegation.
  - Inference: planning still writes headings outside the reader's accepted forms, so each such plan pays the same stop at its first boundary.

## DD-580 — A plan puts slices that wait for a week of post-landing ordinary work inside one Story Branch execution <a id="dd-580"></a>

The plan's slices 2–3 sampled ordinary Doughnut and Pygardon work in the seven days after the trial wording lands on trunk. A Story Branch execution lands only at wrap-up, so those slices could not start before their own execution finished.

### Occurrences

- Execution: SEED-401#pilot-new-retrospective-findings (plan 706; first implementation `d6190e523`)
  - Timestamp: 2026-11-18T15:22:38Z (unfinished-stop report after slice 1)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `ad8704e86`)
  - Evidence: plan 706 at `d6190e523` ("Ordinary-work protocol" and "Frozen trial", where the window starts at landing); the dashboard unfinished report; Terry: "split at slice 1 and land it"; split commit `834cad999`, which moves slices 2–4 to plan 709 behind a blocking dependency.
  - Observed effect: delivered slice 1 waited on an unfinished stop and a developer decision, followed by a mid-execution split, a second source-only review and backlog changes.
  - Inference: deciding at planning that time-gated observation of ordinary work is a separate dependent story would avoid the stop. Matching uncertainty with DD-572: both hold completion on a condition no agent controls, but DD-572 is a proof criterion on machine load, and here the plan structure itself is the cause.

## DD-581 — Delivery lint checks only changed files, so a narrowed shared type fails CI in unchanged consumers <a id="dd-581"></a>

A refactor narrowed a shared test-support return type. Guarded delivery's formatter and the staged-file hook passed because they lint only changed files; unchanged consumer specs then failed CI's full lint on now-unnecessary `??` fallbacks and guards.

### Occurrences

- Execution: SEED-353#declare-intent-comparison-histories (plan 643; first implementation `f52db9a6756441116edf76fd7930b275e12e7b1f`)
  - Timestamp: 2026-11-18T15:48:59Z (CI lint failure, run 44339614749)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at claim `525013d95dd4d501e07a7e9c2169e087ae851177`)
  - Evidence: slice 2's refactor made `publishCodeLandedBeforeCompletion` return `Required<Pick<…>>`; delivery `11239b2` passed formatting and the hook; CI "Lint and type-check" failed with four `no-unnecessary-condition` errors in three unedited specs; repair `eea3134`. Later briefs required full `npm run lint` after shared type or export changes, and no further lint failure reached CI.
  - Observed effect: one red CI run, a writer pause and stash of slice 3's work, a delegated repair and an extra publication.
  - Inference: a full check-only lint at delivery when a shared export or type changes would catch this before publication; the repair cycle cost about 10 minutes, not precisely measured.

## DD-582 — A moved case is planned from its arrangement while its journey crosses another service <a id="dd-582"></a>

The plan judged the retained-note case only on whether a fresh mount reads the same note. The case also saves that note from a review diff and asserts the recorded add, which needed a story-review answer the mounted board lacked.

### Occurrences

- Execution: SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed (plan 707; first implementation `91e716f20`)
  - Timestamp: unknown (2026-11-19 +08:00, slice 6)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `e8e01643a`)
  - Evidence: `7df4ade39:.planning/slice-plans/707-run-story-notes-checks-at-the-mounted-boundary/PLAN.md` "Slice 6 refinement" learning; the first port arranged the note and dropped `saveDiffNote` and the recorded add, so coordinator acceptance returned it; the second return stopped; slice 6 was split into a review-rule slice and slice 7 (`a1fa7a1d4`, `e3398ed26`).
  - Observed effect: two returns, a removed attempt and one extra slice; no observation was lost.
  - Inference: listing every service a moved case's journey touches while planning would have sized the review rule up front.

## DD-583 — A speed goal is sized from a probe that skipped the settling real cases need <a id="dd-583"></a>

The story promised a third of the story-notes time on the strength of phone-board cases at about 0.15 s and a two-case scratch probe. Real notes cases needed act settling across frames to avoid act warnings and a dialog that skipped `showModal`, and then took 0.5–1.5 s each.

### Occurrences

- Execution: SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed (plan 707; first implementation `91e716f20`)
  - Timestamp: unknown (2026-11-19 +08:00, slices 5 and 8)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `e8e01643a`)
  - Evidence: `7df4ade39:.planning/slice-plans/707-run-story-notes-checks-at-the-mounted-boundary/PLAN.md` "Observations used for sizing" (scratch probe of 82 ms, phone-board 7 cases) against slice 5 learning (`actSettled`) and the slice 8 comparison (0.80 and 0.86 of baseline); Terry changed the promise and queued `SEED-404#run-the-story-notes-checks-in-a-third-of-their-time`.
  - Observed effect: the goal was missed and a further story is needed.
  - Inference: a probe that holds answers and refreshes reads, as real cases do, would have exposed the settling cost before the third was promised. Close to DD-553 and DD-554 (premises settled on an unrepresentative stage).

## DD-584 — A CI-repair brief's abbreviated evidence path lands under the checkout root and breaks delivery formatting <a id="dd-584"></a>

Slice briefs named the absolute git-path evidence directory. The CI-repair brief abbreviated it as `…/evidence/ci-repair` / `evidence/ci-repair`, so the repair agent wrote under checkout-root `evidence/`. Selective format scanned those untracked files and refused delivery until the coordinator moved them into `$(git rev-parse --git-path open-dough/evidence)`.

### Occurrences

- Execution: SEED-353#declare-trunk-review-authorship (plan 711; first implementation `61b3b48a2`; repair `fa0db1362`)
  - Timestamp: unknown (2026-11-19 +08:00; repair delivery between repair return and `fa0db1362` at 09:37:15+08:00)
  - Tool: Cursor
  - Open Dough release: unknown (checkout-bound installed guidance at Take `cd588fe73`)
  - Evidence: repair brief `97ec84ef` (“evidence dir `…/evidence/ci-repair`”); return under worktree `evidence/ci-repair/REPORT.md`; coordinator moved it to git-path `open-dough/evidence/ci-repair/from-checkout-root` and published `fa0db1362`. Proof-evidence requires `git rev-parse --git-path open-dough/evidence`.
  - Observed effect: one guarded delivery refusal and a cleanup-plus-retry before the repair SHA published.
  - Inference: naming the same absolute git-path used for slice evidence would have kept artifacts outside format's change-set selection.

## DD-586 — A paid native probe reached delegation before qualifying proof artifact writes

### Occurrences

- Execution: SEED-345#get-long-verification-results-without-empty-wakes (plan 714, first trial publication `70f2434bca1a`, Codex 0.170.0, GPT-6.2 Sol xhigh, modified 0.3.106 guidance with the current source wait reference).
  - Evidence: At 2026-11-19T03:05:51.369641+00:00, app-server thread `01a1f1c3-5ab9-7e30-81b4-69e10e071b76` (turn `01a1f1c3-5d20-78f1-a1a9-ccbaaf8f89f5`) had reached delegation but the worker's Git evidence directory write was refused by workspace-write. The original verification never started. The qualified rerun used the historical full-access profile inside the existing outer macOS isolation. A non-model check of the exact required artifact path under the selected boundary could have exposed the mismatch before the paid turn. The possible saving is unmeasured.

## DD-587 — Story Notes speed work was abandoned as overcomplicated

An execution aimed at ~100 ms Story Notes cases shipped layered settle helpers, product dismiss changes, held-terminal attributes, Vitest optimizeDeps, Dist deadline expansion and measurement scaffolding. The developer judged that direction ugly and opposite the intent to simplify the tests, abandoned the implementation, and returned the story to the backlog.

### Occurrences

- Execution: SEED-407#run-the-story-notes-checks-at-about-100-ms-per-case (plan 717; Take `204dcb0f`; abandoned tip `bd4d74d6` on `cursor/run-the-story-notes-checks-at-about-100-ms-per-c`)
  - Timestamp: 2026-11-19 (developer abandon after slice-5 measurement shortfall handoff)
  - Tool: Cursor
  - Agent: Yumi-chan
  - Open Dough release: unknown (checkout-bound installed guidance at Take)
  - Evidence: abandoned branch commits through `bd4d74d6` (layout-only `actSettled`, dialog dismiss-before-close, `data-terminal-held`, `optimizeDeps.include`, Dist 320→420 s cutoff, plan G1 shortfall). Developer instruction: abandon, return to portal backlog, document failure, clean up, wrap up.
  - Observed effect: no trunk product change from the optimization; story returned to Backlog list; Yumi-chan profile released; execution branch and worktree retired without landing the abandoned tip.
  - Inference: for test-speed stories, prefer removing waits and simplifying the harness over adding opt-in settle modes, parallel observers, publish attributes and runner-phase scaffolding that grow complexity while the family sum stays far above the target.

## DD-588 — A missing Bash prerequisite surfaced as three admission timeouts

### Occurrences

- Execution: SEED-412#keep-dashboard-tests-off-the-developers-real-cursor-runner (plan 719, `944fdaeea`). Timestamp: 2026-11-19T18:45:52+08:00. Tool: Codex. Open Dough release: unknown (checkout-bound guidance at Take `a731e2e54`). Evidence: `local-test-suite-focused-runners.test.mjs` waits for the repository witness after the Dashboard owner closes. The nested `scripts/test.sh` exited at its Bash floor with macOS Bash 3.2 first on PATH. The three waits expired in a 190-second run. All 17 admission and shard cases passed with the installed Bash 5.3.20 first on PATH. Checking the same PATH before launching that proof would expose the prerequisite before the waits.
