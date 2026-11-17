# DearDough Process Findings

The [shared finding catalog](docs/maintainer/finding-names.md) holds reconciled
evidence, former codes and response history. This log retains Open Dough
observations and context beyond those catalog records. See
[ProjectFindings.md](ProjectFindings.md) for repository-owned findings.

## Retention

- Highest allocated local number: 568. Removed numbers are never reused.
- Recovery: `face6fd05b3f5c4f20159db9b41480afbe90d592:DearDough.md` holds the exact pre-maintenance log and its earlier recovery chain. The [catalog](docs/maintainer/finding-names.md) retains reconciled occurrences. The [project findings](ProjectFindings.md) and [review history](docs/maintainer/project-findings-history.md#review-and-recovery) retain the local CI issues (DD-529, DD-539).
- Occurrence history is partial.

## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. [Evidence and current response](docs/maintainer/findings/ODF-154.md).

## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>

Former local code: DD-259. [Meaning, evidence and response](docs/maintainer/findings/ODF-150.md).

### Occurrences

- Execution: SEED-371#run-and-maintain-native-evaluations-as-a-distinct-distribution-tool (first implementation 47478eacb64f35121d5cfafce24a87f391645db7; retained execution records at 3163559cf0f13169f136b0a195aeb4754bd63499:.planning/slice-plans/638-distribution-evaluation-tool/)
  - Timestamp: 2026-11-15T21:39:28.632625Z (full-gate finish)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at claim deba676495b2eb1b8c1f3d3f96b7a44cb1122eb4; no release inferred from product VERSION)
  - Evidence: slice8 repair 4856382 added a public retention check reading raw turn.completed. Mac/Linux public-entry and identity/retention consumer proof passed, but omitted the repository-wide native-stream guard. Slice9 full gate then failed that guard after 1099.8 s, with 640 of 641 jobs and all 2226 Node cases passing; slice9 evidence at 3163559 retains its exact verdict. Repair 33736a7 uses native_host_stream status, passes targeted full replay/public-entry on Mac and public-entry on Linux, then passes 641/2226 in the renewed full gate.
  - Observed effect: a new observation reached an unchanged global stream invariant outside the selected retention consumer checks; one later full-gate failure/correction cycle was required. Earlier same-execution stale fixture/cache-guard misses also required reached consumer repairs.
  - Inference: matches ODF-150's missed affected-consumer proof, including global validators. Earlier selection of the existing shared-stream guard could have exposed this before the whole gate; isolated time/token saving is unmeasured, and the required final full gate is not classified as waste.
- Execution: SEED-381#fixed-shards-for-browser-tests-and-on-demand-rebalancing (plan 656; first implementation 3ee71a8b9)
  - Timestamp: 2026-11-16T04:41:00Z (failed CI job end)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `7eb0efc50`; no release inferred from product VERSION)
  - Evidence: slice 4 (`cee9c1db2`) made each browser Playwright configuration read its job from `.github/workflows/ci.yml` at load. Its consumer trace and focused proof ran the shard, CI-proof and runner tests but not `local-test-suite*.test.mjs`, whose fixture `ci.yml` (`Distribution/tests/support/local-test-suite-checkout.mjs`) declared only `distribution-tests`. CI run 43805225551 failed Distribution Tests 3/3 ("no dashboard-integrated job"); repair `05f7ef4f0` declared the browser jobs in the fixture.
  - Observed effect: one CI failure and repair cycle on the branch; no trunk impact.
  - Inference: the changed effect was "configuration load reads the real workflow", whose consumers include every fixture that loads a configuration; tracing importers of the changed modules did not reach that fixture. Slice 1 and 2 returns had already listed `local-test-suite-checkout.mjs` as a consumer of the runner copy.
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

- Execution: SEED-334#move-intent-ci-proof-comparison-and-candidate-checks (plan 651; first implementation `e7aac254bbe59f5dc277d473386359dddf56132d`)
  - Timestamp: 2026-11-17T12:56:00Z (failed CI job, run 44090579516)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `9aa696980`)
  - Evidence: slice 8 (`87551c3b`) dropped the emptied `dashboard/tests/intent/**` share from `ci.yml` (`shards: "[1, 2, 3]"`) and ran only `browser-group-shards`, `ci-proof-frontend-report`, `ci-proof-scope` and `ci-proof-leads-table`. The `ci-proof` summary step's `expect` still declared `dashboard/tests=4:case`; `ci-proof-actions.test.mjs:71` and `ci-proof-declaration.test.mjs:97` failed in Distribution Tests 3/3. Repair `309dacb4` set 3; 1346 node tests reading `ci.yml` then passed.
  - Observed effect: one CI failure and repair cycle on the story branch after the execution-complete record; no trunk impact.
  - Inference: a matrix-length change reaches every declaration derived from that length in the same workflow; selecting tests by the shard concept missed the CI-proof declaration test that checks it.

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
- Execution: SEED-367#discard-time-after-an-ended-session (plan 668; first implementation `66ce0a60d6b5ae2f172667c174b0c1154ef6ba97`)
  - Timestamp: unknown (2026-11-16, first slice delivery before `66ce0a60d6`)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at Take `ad2e6f733dc41b7177bd39ab20fb7b0846f41146`)
  - Evidence: implementation and refactor briefs forbade hook-owned lint. Guarded fresh delivery refused formatting on six `no-param-reassign` errors in `slice-clock.mjs` and `slice-clock-slices.mjs`, after the independent refactor and 29-test proof. The coordinator used the existing `Object.assign` pattern, reran the 29 clock tests, and retried delivery successfully.
  - Observed effect: one withheld delivery and coordinator repair after the refactor reported complete; no failed candidate was committed or published.
  - Inference: another occurrence of ODF-329. Carrying the strict rule into the brief may avoid this rework; the installed workflow reserved lint for the coordinator. Extra cost was not measured.
- Execution: SEED-367#bound-diagnosis-in-evidence-rounds (plan 669; first implementation `cce82241194e3f8f5e58b84342dfcd92c51d63c8`)
  - Timestamp: unknown (2026-11-16 +08:00; slice 1 delivery, before commit `cce82241` at 19:02:58)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `2d69b6928`)
  - Evidence: the slice 1 implementation and refactor briefs forbade lint and named no strict rule, although the plan 667 and 668 rows above recorded the same two `no-param-reassign` sites in this clock. Guarded fresh delivery refused formatting on two `no-param-reassign` errors in the new `slice-clock-diagnosis.mjs`; the coordinator applied the `Object.assign`/destructure pattern, reran the 32 clock tests and retried successfully.
  - Observed effect: one withheld delivery and a coordinator repair after the refactor pass reported complete; nothing failed was committed.
  - Inference: the remedy recorded for plan 667 lived only in that execution's briefs, so it did not carry to the next execution on the same files.

- Execution: SEED-388#replace-native-reader-gaps-on-reread (first implementation `8e62635e227962d87359188b00f8a21f9c54aba1`)
  - Timestamp: unknown (2026-11-17, first delivery before implementation publication)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at established claim `bd2e79cd90df5d7481fcecc0dcf3703e55e82529`)
  - Evidence: implementation/refactor briefs reserved hook-owned lint for coordinator without a read-only authored-file check. Independent refactor returned `usageServer(...).refresh` as an unbound method; guarded fresh formatter refused on `@typescript-eslint/unbound-method` (`eb800c`). Coordinator retained the receiver in an arrow callback, reran all eight focused cases (7.3s), and retried successfully.
  - Observed effect: one preparation refusal and repair after refactor completion; no failing candidate was committed or published.
  - Inference: same concrete gap as ODF-329. The existing check prevented escape; extra agent effort was not measured.
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

## DD-540 — A strict all-runs keep rule cannot resolve a mid-size test speed-up under local noise

A test-optimization plan kept a change only when, over three alternating pairs at one worker, every after-run beat every before-run. Unchanged runs of the affected cases spread wider than the change's likely effect, so a consistent pairwise drop was undone.

### Occurrences

- Execution: SEED-380#speed-up-the-slowest-dashboard-frontend-unit-tests (first implementation 3b8848a2ab182d34b1b0034090ea2a2d8430fe74; retained execution records at 7bb49ed863be027a9cdb054c749ca4f95e714ab6:.planning/slice-plans/653-speed-up-the-slowest-dashboard-frontend-unit-tests/)
  - Timestamp: unknown (2026-11-16, slice 2)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at claim d9c35d51faedbdcd77f4ce68d833132d2a28d164)
  - Evidence: plan 653 slice 2 Result in 7bb49ed. 19 cases at `--workers=1`: before 33.2, 44.1, 35.7 s, after 29.4, 33.5, 28.8 s (−19% summed, every pair lower), refused because 33.5 > 33.2. The planning probe showed the same direction (every changed run lower).
  - Observed effect: the change (61 → 20 page round trips per revision check) was undone. It stays a live candidate in `.planning/TEST-OPTIMIZATION-CANDIDATES.md`.
  - Inference: with an 11 s spread among unchanged runs, "every after below every before" over three pairs rejects effects near 10–20%. A pairwise or more-pairs criterion might have kept it. Whether the gain is real stays unmeasured.

## DD-541 — Bounding removable cost from a trace before editing settles a speed experiment without an edit

A test-speed slice that first traced the unchanged cases, grouped by call, could bound the most the tactic could remove. When that bound was under the keep threshold, the slice ended without building or timing a change.

### Occurrences

- Execution: SEED-380#speed-up-the-slowest-dashboard-frontend-unit-tests (first implementation 3b8848a2ab182d34b1b0034090ea2a2d8430fe74; retained execution records at 7bb49ed863be027a9cdb054c749ca4f95e714ab6:.planning/slice-plans/653-speed-up-the-slowest-dashboard-frontend-unit-tests/)
  - Timestamp: unknown (2026-11-16, slices 3 and 5)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at claim d9c35d51faedbdcd77f4ce68d833132d2a28d164)
  - Evidence: plan 653 slice 3 Result (reads at most about 1 s against a 3.1 s bar, no edit) and slice 5 Result (waits about 0.35 s of 9.4 s; a trial measured −1.4%) in 7bb49ed.
  - Observed effect: slice 3 made no edit and was delivered as a records-only finding. Slice 5's measured trial matched its bound.
  - Inference: a useful practice for planned speed experiments. Slices 1 and 2 timed without such a bound first; whether one would have avoided their work is not established.

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
  - Evidence: plan 656 slice 6 named the duration-list mention in `SEED-300` (392 lines) and gave a seam decision only for `ProjectFindings.md`, `project-test-findings.md` and `project-findings-history.md`; the slice 6 refactor pass returned a jidoka stop; Terry chose "seam per story", recorded in slice 6 at `6348334e6`.
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

## DD-549 — Guarded delivery refuses a plan the slice left unedited

Guarded fresh delivery for a planned slice marks the slice done itself, but
refuses with "the plan must be included in ownedPaths" when the coordinator
lists only the files the slice changed and the plan has no edits of its own yet.

### Occurrences

- Execution: SEED-388#show-the-effort-a-launch-runs-with (plan 664; first implementation 535898511)
  - Timestamp: unknown (2026-11-16, slice 2 delivery)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.102 (guidance updated at starting revision `3b1479996`)
  - Evidence: `execution-increment-delivery.mjs fresh` for slice 2 returned `{"ok":false,"operation":"context","error":"the plan must be included in ownedPaths"}` with ownedPaths built from `git status`; adding the plan path succeeded and published `cc59ccb93`.
  - Observed effect: one refused call and a retry; nothing changed by the refusal.
  - Inference: the requirement is stated only implicitly in the fresh-increment field table ("Put the plan's other evidence … as your owned edit staged with it"); a coordinator deriving ownedPaths from the working tree misses it whenever a slice adds no plan edit. Minor cost.
- Execution: SEED-367#count-slice-active-time-deterministically (plan 667; first implementation `0c454d10b5826b5b9121f8ae7a9bb718579b5269`)
  - Timestamp: unknown (2026-11-16 +08:00; slice 5 delivery, shortly before commit `59352a5a3`)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: unknown (checkout-bound installed guidance at Take `f1bff2c54`)
  - Evidence: `execution-increment-delivery.mjs fresh` for slice 5 returned `{"ok":false,"status":"preparation-refused","operation":"context","error":"the plan must be included in ownedPaths"}`; the plan had no edits of its own because slice 5's observations went to `source-review.md`. Adding the plan path and retrying published the slice.
  - Observed effect: one refused delivery call; nothing was committed or lost.

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

## DD-555 — Coordinator acceptance continues after sufficient proof <a id="dd-555"></a>

Coordinator review continued into possible edge cases and broad consumer-match analysis after required observations were available. Existing return guidance already required a concrete expected/actual mismatch; its presence did not stop this run. The missing acceptance exit rule is a hypothesis to investigate alongside coordinator judgment, not an established sole cause. Refactoring remains intentionally unbounded.

### Occurrences

- Execution: SEED-348#collect-notes-for-story-follow-ups (plan 671; first implementation `ab91ef3234f6c1a496bf309932ba327ad09ebb44`)
  - Timestamp: unknown (2026-11-17; execution and closure record)
  - Tool: Codex
  - Open Dough release: 0.3.102 (checkout-bound installed guidance at claim `681002b3946be63b7f854c4a739dcf8517a26996`)
  - Evidence: Terry reported at least about 45 minutes for the current slice and asked about acceptance-analysis instructions; the coordinator acknowledged extending analysis beyond sufficient proof. [Retained incident and requested response](https://github.com/terryyin/open-dough/blob/74e279020ed97da59be4ff3a3956a9c4020cf55d/.planning/seeds/SEED-345-session-token-efficiency.md#reach-a-proof-decision-from-retained-evidence); launch `154b5180-ee1f-44b2-88e7-a70e47217593`, incident at `ab1acbbac33f0a82de40321121f1c086336ec301:.planning/seeds/SEED-345-session-token-efficiency/proof-decisions.md`, and slice-5 proof at `f918ecb54b55b45b53819208f4a6d568452107d1` preserve provenance.
  - Observed effect: developer interruption and an authorized priority increase for existing `SEED-345#reach-a-proof-decision-from-retained-evidence`, marked not-ready pending investigation. The 45 minutes is the developer's total elapsed estimate, not measured acceptance time.
  - Inference: start with simple stopping instructions: proceed once promises, affected consumers and gates have decisive observations; further investigation names a mismatch or specific evidence gap. Preserve required proof and unbounded refactoring; introduce no timing machinery first. Separate implementation, command waits, refactoring, CI repair and acceptance before making a measured causal claim.

## DD-556 — Case-differing sibling module basenames break TypeScript project-service lint on APFS <a id="dd-556"></a>

On a case-insensitive volume, a new `AttachStoryNotes.tsx` beside `attachStoryNotes.ts` made ESLint's TypeScript project service unable to resolve the component path, so lint failed while `tsc` still passed. Diagnosis chased tsconfig/buildinfo before the collision was renamed away.

### Occurrences

- Execution: SEED-348#attach-story-notes-to-follow-ups (plan 672; first implementation `49396e6d2af120da82111917647c1ff678abc49f`)
  - Timestamp: unknown (2026-11-17T14:59+08:00–15:14+08:00 coordinator wait; rename during slice 3)
  - Tool: Cursor
  - Open Dough release: 0.3.103 (checkout-bound installed guidance at Take `522e71f54ec31ae42d4da6558fb36d398524bfeb`)
  - Evidence: slice 3 agent `7decb47e-d94a-48a4-ac30-24170f147269` created `dashboard/src/attachStoryNotes.ts` with `AttachStoryNotes.tsx`; coordinator turns at ~14:59–15:13 +08 reported project-service unresolved-file lint after typecheck and a forced `tsc` rebuild; agent renamed words to `attachStoryNotesWords.ts`. Plan learning and publish `e25ae7b4b` record the rename. Slice clock paused at 13.7/15 active minutes; wall-clock lint churn is separate.
  - Observed effect: repeated lint failures and tsconfig/buildinfo investigation until the basename collision was removed; focused frontend proof and typecheck had already passed.
  - Inference: on macOS APFS, avoid same-basename `.ts`/`.tsx` siblings that differ only by case. A planning or authoring note for that filesystem would have skipped the chase; saving is unmeasured.

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

## DD-562 — Replay value is reconsidered only after reconstructing the paid-run setup

A planned full historical redo was prepared before its marginal value for a
two-sentence clarification was assessed. Terry then asked whether another long
run would benefit this change and accepted keeping the reviewed clarification
with agent behavior explicitly unverified. This is a proof-cost/value decision,
not evidence that native evaluation is generally unnecessary.

### Occurrences

- Execution: SEED-393#tests-ignore-unrelated-launch-changes-without-losing-proof (first implementation `c9b39e4b8300ec00a9cff1b95b659d44d8a22209`)
  - Timestamp: unknown (2026-11-17, after redo preparation and before closure)
  - Tool: Codex
  - Open Dough release: 0.3.104 (checkout-bound installed guidance at Take `c35afa491`)
  - Evidence: `56856821c:.planning/slice-plans/675-tests-protect-their-own-behavior/redo-launch.md` retains clone, dependency/browser setup and exact-input conflict; the slice clock paused preparation at 8.2 active minutes. The existing `fbfaa116b:.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/claude-metrics.md` recorded 104.49 minutes for the frozen Claude redo. Terry asked to evaluate whether another run would benefit this change, then accepted skipping it.
  - Observed effect: scratch setup was built but no paid participant run occurred. The accepted proof became the six-example wording review and existing payload link check; improved agent behavior and effort savings remain unverified.
  - Inference: deciding the marginal learning and acceptable cost before rebuilding a historical replay could avoid unused setup. The executor followed the then-required plan; no total saving or guidance-effect estimate is established. Distinct from DD-559’s CI-deadline feasibility issue.

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
- Execution: SEED-345#split-the-agent-effort-contract-guide (plan 682; implementation `23e338fd7`)
  - Timestamp: unknown (2026-11-17, before commit `23e338fd7` at 23:17:29 +08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.104 (checkout-bound installed guidance at Take `627b82320`)
  - Evidence: the single Structure slice moved three guide sections verbatim (both `diff`s empty) and repointed seven header comments. The coordinator implemented it locally. The fresh refactor agent used 56.1k tokens and returned `## REFACTOR COMPLETE` with no edits.
  - Observed effect: one no-edit refactor pass on a verbatim move with mechanical proof.
  - Inference: same rule cost as the deletion-only rows, here for a verbatim relocation rather than a deletion. Matching is by the step 1 exemption gap, not by change kind.

## DD-565 — Proof waiting defers read-only CI diagnosis through suite admission <a id="dd-565"></a>

A CI failure arrived when a local full gate launched. The proof-wait rule forbade other checks until the command finished or its expected window was exceeded; the first overdue inspection showed that almost the whole window had been suite-admission waiting. A bounded CI classification could be separate from checkout mutation while retaining the proof owner.

### Occurrences

- Execution: SEED-396#replace-evaluation-shell-checks (plan 679; first implementation `251af1f66bb8830227df0b59fbc2306a33df4c40`)
  - Timestamp: unknown (2026-11-17; first full evaluation and CI diagnosis)
  - Tool: Codex
  - Model: gpt-6.1-sol
  - Open Dough release: 0.3.104 (checkout-bound installation unchanged from claim `0ada9a1e3`)
  - Evidence: live coordinator tool history and `004d9915bbc222a4404e69531fcf62e005720014:.planning/slice-plans/679-evaluation-checks-state-facts-plainly/diagnosis-ci-share1-deadline.md`. CI run 44077311815/1 reported share 1 failure at local-gate launch. At the first bounded overdue check, the local command had existed for 16m17s while its test children had run for about 13s. Read-only CI logs then established the absolute share cutoff; a workflow-only repair preserved unfiltered evaluation selection while that proof continued.
  - Observed effect: CI classification was deferred roughly one admission window. The original local command stayed owned through its terminal result.
  - Inference: permit bounded read-only failure classification during a proof wait, with checkout mutations still held until safe. This is a triage-latency observation; no total wall-time or token saving is established.

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

## DD-567 — Guidance structure-test regexes that pin soft-wrap points break under file-size reflow <a id="dd-567"></a>

A new guidance-structure test asserted phrases with `\s+` across the soft-wrap
breaks that existed at write time. The post-change file-size reflow of
`executable-proof.md` to 250 lines rearranged those wraps, so the refactor pass
had to re-align wrap points (or would have needed a test update) before the
subject test stayed green.

### Occurrences

- Execution: SEED-345#reach-a-proof-decision-from-retained-evidence (plan 681; first implementation `9ecfd26602618771a60d89acca3ad1016b6e4d15`)
  - Timestamp: unknown (2026-11-17; refactor pass after slice-1 acceptance, before increment `9ecfd2660`)
  - Tool: Cursor
  - Open Dough release: unknown (checkout-bound installed guidance at Take `cc96c5515`; Distribution sources published at `9ecfd2660`)
  - Evidence: plan 681 Learnings (“Structure-test regexes that pin wrap points are brittle under file-size reflow”); refactor agent `8afc6ef3-96e3-4595-b23b-40b4171e0f52` (“Fixing wrap breaks so the structure-test regexes still match”; file 253→250 lines); subject test re-run exit 0 after reflow.
  - Observed effect: extra refactor edits and a subject-test rerun to keep wrap-sensitive assertions matching; no product wording change beyond layout.
  - Inference: structure tests that pin soft-wrap boundaries couple proof to physical line breaks the file-size check is allowed to change; contiguous asserted phrases (or updating the test with the reflow) avoids that churn. Total token/time cost unmeasured.

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
