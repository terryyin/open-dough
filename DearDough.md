# DearDough Process Findings

The [shared finding catalog](docs/maintainer/finding-names.md) holds reconciled
evidence, former codes and response history. This log retains Open Dough
observations and context beyond those catalog records. See
[ProjectFindings.md](ProjectFindings.md) for repository-owned findings.

## Retention

- Highest allocated local number: 606. Removed numbers are never reused.
- Recovery: `04614e9d065f8ce9c6d6d292fe40fd8a33e22c2f:DearDough.md` holds the branch-local plan 748 DD-604 and DD-605 findings before renumbering to DD-605 and DD-606 on trunk merge. `68745734e22d71fa7973b971cc1a51ca19163da2:DearDough.md` holds DD-564, removed for DD-605, DD-606 and the plan 748 row of ODF-443. `8a18711cbc5c585481913cc47b92de41f505518b:DearDough.md` holds the ODF-329 plan 722 occurrence, replaced by the four-refusal plan 749 occurrence. `8be1d19835f1448ceb5a70342bf35fe122739408:DearDough.md` holds the ODF-329 plan 723 matcher occurrence, removed for DD-604 and the plan 743 row of DD-594. Plan 730 retains the same matcher failure and read-only lint response. `be03d5643a8ca220e8e479d32e3a5602d70d3a0b:DearDough.md` holds the ODF-329 plan 692 occurrence, removed to keep DD-600 to DD-603 under the 1000-line ceiling; plans 667, 676, 722, 723, 730 and 741 retain the lint gap. `68c2371449bf62fb9a0f681bd89f80bd6cc738d2:DearDough.md` holds the SEED-391 plan 668 occurrences of ODF-150 and DD-550 and the SEED-393 plan 680 occurrence of DD-564, removed for the SEED-418 findings, now DD-600 to DD-603, and the SEED-418 row of ODF-150. `380aa6b5ee753e45931e07a02b2a80de57cbbea9:DearDough.md` holds the branch-local DD-596 to DD-599 SEED-418 findings before renumbering to DD-600 to DD-603 on trunk merge. `de7da7c0cd7f05b06ac159dc27d7b1ccf8373e14:DearDough.md` holds the ODF-329 plan 671 and plan 700 occurrences, removed for DD-599; `09a9cdc240e286ed17507122f823833dbb077c1d:DearDough.md` holds the branch-local DD-598 completing-slice report-overrun finding before renumbering to DD-599 on trunk merge. `6ff2b1d9ca8eb435fd60e97aa09e035821f3d759:DearDough.md` holds DD-587, removed for DD-596 and the plan 734 row of DD-591. `744390aaa31461f8b9e5dac5996501e269893d68:DearDough.md` holds the ODF-150 SEED-391 plan 668 and SEED-379 occurrences, removed for the plan 735 rows of DD-591 and DD-594 and DD-597; both stay in [ODF-150](docs/maintainer/findings/ODF-150.md). `fd378d80897fd61c9741cf2ee5d139ab788694dc:DearDough.md` holds DD-578, removed for DD-594, DD-595 and the plan 730 row of ODF-329. `758e195d3e40e29099689e84addce4411f97bb99:DearDough.md` holds the ODF-150 SEED-345#compare-agent-effort-on-comparable-runs and SEED-345#recover-decisive-verification-evidence occurrences, removed for the SEED-414 occurrence. `920864ce77e15e21870114421e44196ea3fcdfb4:DearDough.md` holds DD-586, removed for DD-592. `454ce2e806d9f2b4739e7974e05508f325fba772:DearDough.md` holds DD-588, removed for DD-591. `65d2adf21cbcabc849e721d12c2bf9d28bdf5083:DearDough.md` holds the ODF-264 SEED-334 occurrence, removed on merging DD-589 and DD-590 to keep the 1000-line ceiling. `89c95b6e2ee893d35938191dd29b5beea7455fd2:DearDough.md` holds the ODF-264 SEED-374, SEED-391, SEED-345 and SEED-388 occurrences, removed for DD-589 and DD-590. `32a64ed10fa8cba776fc343e531c7bcb17642a82:DearDough.md` holds DD-555, removed to keep the SEED-409 row of ODF-150 under the 1000-line ceiling. `4a523c5f27fad2f21efba37925dfd1af65837654:DearDough.md` holds DD-585, removed for the SEED-409 row of ODF-150. `0cc3238b517a71413d40dc1e86cce6d1c140e272:DearDough.md` holds the ODF-150 SEED-382 and SEED-400 occurrences replaced by DD-585. `facd20535d6714db0ab4651c947bff2706b8d2dd:DearDough.md` holds the branch-local DD-582 evidence-path finding before renumbering to DD-584 on trunk merge; `d3e155dd924b5f62e540b65df9df5b040da95ee0:DearDough.md` holds DD-570, removed for DD-578; `3a703141f44d98968d20996da1abfeaedda68de4:DearDough.md` holds the ODF-150 SEED-371 occurrence, removed for the SEED-384 occurrence; `969f4924fcc0fceb6953b7c67bb45924dc122baa:DearDough.md` holds DD-556, removed for the SEED-400 rows of ODF-150 and DD-568; `593bb8ce105d3605acb86b7b5dbc41e51df64d7d:DearDough.md` holds DD-540 and DD-541, removed for DD-577; `face6fd05b3f5c4f20159db9b41480afbe90d592:DearDough.md` holds the exact pre-maintenance log and its earlier recovery chain. The [catalog](docs/maintainer/finding-names.md) retains reconciled occurrences. The [project findings](ProjectFindings.md) retain the local CI issue (DD-529). `fe04022a7f36772d930ba27e4853f34e8fce674b:DearDough.md` holds DD-576, removed for the SEED-379 row of DD-551. `834cad999c49999398a6fdd813576ffeb207b46a:DearDough.md` holds DD-549, removed for DD-580 and the SEED-401 row of ODF-368; it also holds the SEED-381 occurrence of ODF-150, removed for the same rows. `1d3b433bf7fdbd8e1858e0d62e623539f6d67b06:DearDough.md` holds the ODF-329 plan 668 and SEED-388 rows, removed for DD-581. `381a614c3720e323ca7b08c4a101b273dcd06e46:DearDough.md` holds the ODF-150 plan 651 occurrence, replaced by the SEED-379 occurrence. Plan 648 retains the repeated matrix declaration miss. `7740fc354ff8f89eb2a8de63243792950fd6c6d8:DearDough.md` holds DD-562 and DD-567, removed for DD-582, DD-583 and the SEED-404 row of DD-574. `2b858d95899f43e92272253e623f146966c6900b:DearDough.md` retains the ODF-329 plan 679 shell-lint occurrence, replaced by direct browser-test lint evidence from plan 722. Earlier shell-lint cases remain in ODF-329. `89401655ab84526ec5256e9fbe503dffcf9656f3:DearDough.md` holds the ODF-264 SEED-374 occurrence, removed for the SEED-413 plan 724 row of DD-583. `8ec510292a0369a61d79804c620a7990f03236af:DearDough.md` retains the ODF-329 plan 654 shell-lint occurrence. Plan 676 retains the shell mechanism, and plan 723 adds current Vitest matcher evidence. `23ac9a5df32995aedb25380b507ca7796a26e354:DearDough.md` holds the ODF-329 plan 669 occurrence, replaced by the plan 741 Codex browser-test occurrence. The plan 667 occurrence retains the same clock-rule evidence.
- Occurrence history is partial.

## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. [Evidence and current response](docs/maintainer/findings/ODF-154.md).

## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>

Former local code: DD-259. [Meaning, evidence and response](docs/maintainer/findings/ODF-150.md).

### Occurrences

- Execution: SEED-418#review-published-session-changes (plan 739; first implementation `77e2ef738`). Timestamp: 2026-11-21T00:08:10Z (CI run 44841049977 on `5ead3495e` concluded failure). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: 0.3.109 (installed `.claude/skills/dough-update/VERSION` at Take `953a8a123`, unchanged through `68c237144`). Evidence: slice 6 (`5ead3495e`) made the page read the `sessions=published` listing once per snapshot; its proof did not select the unchanged `dashboard/frontend-tests/navigation/dashboard-header.spec.ts`. [Run 44841049977](https://github.com/terryyin/open-dough/actions/runs/44841049977) failed dashboard-frontend 1/2 there on exact opening-read counts (`Expected: 20, Received: 21`; `5` versus `6`), and the shared `frontendAuthenticatedReadSubstitute.ts` answered the unknown read with the backlog body. Repair `4707bf8a3` (worktree evidence `ci-repair-1-report.md`). Observed effect: one story-branch CI failure and repair cycle; no trunk impact. Inference: read-counting journeys and the shared read substitute are indirect consumers of any new page read; the repair's own trace named seven more read-counting specs.
- Execution: SEED-414#review-done-sessions-on-open-story-cards (plan 728; first implementation `4f7b65f0c`)
  - Timestamp: 2026-11-20T08:40:36Z (CI run 44704447238 on `4f7b65f0c`); 2026-11-20T09:46:45Z (CI run 44713586020 on `a7f578415`)
  - Tool: Cursor
  - Open Dough release: 0.3.109
  - Evidence: slice 1 (`4f7b65f0c`) moved Done sessions onto unfinished cards and gated `agent-launch-story-card-done`, `recently-done-returned-sessions` and sibling frontend Recently-done specs; CI run [44704447238](https://github.com/terryyin/open-dough/actions/runs/44704447238) failed four e2e shards on unchanged specs still locating Done under Recently done (e.g. `agent-completion-cursor`, `agent-launch-done-listing`); repair `fb448cfb9` retargeted ~29 e2e/support files. Slice 2 (`a7f578415`) added scan-emphasis CSS and proved `story-card-scan-emphasis`; CI run [44713586020](https://github.com/terryyin/open-dough/actions/runs/44713586020) failed `expectSessionEntrySetOff` in `agent-launch-story-card-sessions` and quiet-Reviewed colour in `recently-done-review-cue`; repair `758e195d3` aligned `pageColours.ts` / `doneStoryReviewPage.ts`. Cancelled CI on `fb448cfb9` superseded; completion succeeded on `758e195d3`.
  - Observed effect: two story-branch CI failure and repair cycles (~9 minutes wait each); no trunk impact.
  - Inference: Board-home and shared card-surface consumers outside the named local gate; adopted consumer-trace response did not prevent either miss.
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
- Execution: SEED-334#move-navigation-checks-and-retire-integrated-ui-test (plan 648; first implementation `54dfebff2`)
  - Timestamp: 2026-11-17T15:27:58Z (first failed CI job, run 44113467112); 2026-11-17T16:36:00Z (second, run 44126356645)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `161830d70`)
  - Evidence: slice 3 (`e10d6698f`) dropped `board-*` from the integrated shard 1 and ran `ci-browser-groups` only; `browser-group-shards.test.mjs` "an integrated pattern matching no spec fails the configuration naming it" replaced that literal, silently edited nothing and failed Distribution Tests 3/3 (repair `d69851c43`). Slice 7 (`373ff581d`) shrank the matrix to `[1, 2]` and ran the shard tests; the `ci-proof` step's `expect` still declared `dashboard/tests=3:case`, failing `ci-proof-declaration.test.mjs:97` and `ci-proof-actions.test.mjs:71` (repair `40bba4d8e`). The plan's local gate named only the interim listing, `ci-browser-groups` and `runner-ownership`.
  - Observed effect: two CI failure and repair cycles on the story branch, the second after delivery of the last slice; no trunk impact.
  - Inference: the same missed declaration as plan 651's occurrence, one story later; running every `Distribution/tests/support` test that reads `ci.yml` (`node --test Distribution/tests/support/ci-*.test.mjs` plus the shard tests, 91 cases, under a second) after any `ci.yml` edit would have caught both.

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

- Execution: SEED-371#run-and-maintain-native-evaluations-as-a-distinct-distribution-tool (first implementation 47478eacb64f35121d5cfafce24a87f391645db7; retained execution records at 3163559cf0f13169f136b0a195aeb4754bd63499:.planning/slice-plans/638-distribution-evaluation-tool/)
  - Timestamp: unknown (2026-11-15/16 execution and wrap-up; exact read-event times not retained)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound installed guidance at claim deba676495b2eb1b8c1f3d3f96b7a44cb1122eb4)
  - Evidence: coordinator launch a6f339d0-f7b7-4741-81af-665f3195db73 combined CI/delivery/fresh-increment guidance with runtime files in a tool result reporting 14823 original tokens and truncation; a later combined backlog/record-preparation/closure-publication result reported 11701 and truncation. Targeted code/reference reads subsequently recovered affected decisions. The automatic discovery probe independently caught the complete-root omission and restored cleanly (469635 ms invocation-to-report; 7.715 s all focused commands; agent/human effort unavailable).
  - Observed effect: broad outputs omitted requested passages and required bounded recovery, including in the closing review. Command handles, rejected measurements, exact reversion, CI completion and probe restoration remained recoverable.
  - Inference: recurrence of known output-scoping deviation under existing targeted-reading guidance. Mandatory reviews themselves are not called waste; the avoidable share and isolated elapsed/token saving are unmeasured.
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

- Execution: SEED-367#count-slice-active-time-deterministically (plan 667; first implementation `0c454d10b5826b5b9121f8ae7a9bb718579b5269`)
  - Timestamp: unknown (2026-11-16 +08:00; first delivery attempt, shortly before commit `eb5120217` at 17:07:25)
  - Tool: Claude Code
  - Model: claude-fable-5-2
  - Open Dough release: unknown (checkout-bound installed guidance at Take `f1bff2c54`)
  - Evidence: the slice 2 implementation and refactor briefs forbade lint. Guarded fresh delivery's `npm run --silent format` refused on six ESLint errors (`no-param-reassign`, `no-return-assign`) in `slice-clock.mjs`, `slice-clock-record.mjs` and `slice-clock-fixture.mjs`. The coordinator repaired them, reran the spec and retried. Briefs for slices 3–5 named the two rules and allowed a read-only `npx eslint`; their four deliveries formatted clean.
  - Observed effect: one failed delivery attempt and a coordinator-side repair after the refactor pass had reported complete.
  - Inference: same gap as ODF-329, for JavaScript sources. Naming the project's strict rules and allowing a read-only lint in the brief removed it for the rest of the execution.
- Execution: SEED-393#guidance-check-participants-run-owning-proof (plan 676; first implementation `80ecc810a8de71bbdb448479ebae58e79b0880b2`)
  - Timestamp: unknown (2026-11-17 +08:00; slice 1 delivery, before commit `80ecc810a` at 20:54:57)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `9f75575475522e081a48b74d558dfa04510bae33`)
  - Evidence: implementation and refactor briefs reserved formatting and lint for the coordinator. The refactor pass ran shellcheck read-only, listed SC2015, SC2312, SC2034, SC2218 and SC2329 in its new files as "lint stays with you", and returned complete. Guarded fresh delivery's `npm run --silent format` refused on those findings; the coordinator restructured `case_environment_prepare`, added directives, reran two materializing checks and retried successfully.
  - Observed effect: one preparation refusal and a coordinator repair that changed setup code after the refactor pass, so its proof had to be renewed; nothing failed was committed.
  - Inference: same gap as ODF-329. Here the agent even saw the findings; the brief's "lint stays with the coordinator" was read as "leave findings unfixed". A few minutes of rework; not measured.

- Execution: SEED-413#arrange-done-ad-hoc-observation-and-publication (plan 730; first implementation `77d845a623a6227cab6393803fc01644d733b620`)
  - Timestamp: 2026-11-20T17:42:51+08:00 (slice 2 guarded delivery refusal)
  - Tool: Claude Code; Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `3c7d21aaa68c0feb6055f4aef47908083da3e818`)
  - Evidence: slice 1 and 2 implementation and refactor briefs forbade `npm run lint` and named no Vitest matcher rule. Guarded formatting refused `ad-hoc-manual-landing-observation.spec.ts:124` on `@typescript-eslint/no-unsafe-assignment`, the same `expect.stringContaining` rule the plan 723 row above records one day earlier in the same seed. Briefs for slices 3–8 named the rule and allowed read-only `npx eslint <files>`; the later deliveries formatted clean.
  - Observed effect: one withheld delivery and a coordinator repair before `d4d41f4f1`. Inference: a recurrence within one seed; the plan 723 remedy again lived only in that execution's briefs.

- Execution: SEED-413#mount-story-review-diff-reading (plan 741; first implementation `c87a616154910043189fe0f8a2cb58b482b8e0ce`)
  - Timestamp: 2026-11-20T23:35:41+08:00 and 2026-11-21T00:07:59+08:00 (guarded delivery receipts)
  - Tool: Codex
  - Open Dough release: unknown (checkout-bound guidance at Take `4e991ea00`)
  - Evidence: after independent reviews, guarded formatting refused the mounted menu's unnecessary optional chain and the adjacent fixture's unused callback parameter. The mechanical repairs are in `30eb1f3f9` and `0c5a4889c`.
  - Observed effect: two withheld preparations. The coordinator reran the three mounted arrival cases after the first repair and compared every generated fixture byte after the second.
  - Inference: a read-only lint check on authored files could expose both before delivery. The time saving was not measured.

- Execution: SEED-413#mount-system-settings-sections-and-usage-charts (plan 749, first implementation `657c7e2a8fd8e2eb284e30f12cae999735e3166f`)
  - Timestamp: unknown (guarded delivery attempts on 2026-11-21 +08:00)
  - Tool: Codex
  - Model: gpt-6.2-sol
  - Open Dough release: unknown (checkout-bound guidance at claim `0759aff061bdf15d18ed216fe045454f4b5d67d4`)
  - Evidence: the briefs reserved lint for delivery. After separate implementation and refactor proof, guarded formatting refused slices 1, 2, 4 and 5 on `require-await`, `unbound-method`, `no-unnecessary-condition`, `no-unsafe-assignment` and `no-unused-vars`. The corresponding delivery commits were `657c7e2a8`, `b64c72844`, `c449b9655` and `efcfa53ab`.
  - Observed effect: four withheld preparations, four coordinator repairs and four renewed focused runs. Slice 5 also repeated the one affected late-refusal scratch check.
  - Inference: project lint rules found issues outside the passing type and behavior checks. A read-only check of the authored files before return could expose them earlier. Time saved is unmeasured.

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
- Execution: SEED-413#mount-story-review-changes-panel (plan 748; first implementation `277d5717c67aed5babc1806881797d52a0ec8235`). Timestamp: unknown (2026-11-21 +08:00, slice 6 refactor return before `5a6b3f667` at 13:24:29). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: 0.3.109 (installed `.claude/skills/dough-update/VERSION` at Take `17fe6c2c4`, unchanged through `68745734e`). Evidence: the slice 6 refactor return said "`storyReviewTestData.mjs` (253 before this change, unchanged by me)", yet slice 6's implementation had edited it (added `renaming(oldPath, path)`) and it was 239 lines at slice 6's base `cd4f309fa`. Coordinator acceptance returned it; the refactor agent split it into `storyReviewTestData.mjs` (212) and `storyReviewCompletedTestData.mjs` (83) before `5a6b3f667`. Observed effect: one extra refactor round; nothing oversized was published. Inference: same concrete problem (a refactor return's size claim exempts an over-limit file in the change); the claim here was a pre-existing exemption rather than "within the limit", and acceptance's own check caught it before publication.

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

- Execution: SEED-413#ad-hoc-done-lifecycle (plan 731; first implementation `5be28ff56`)
  - Timestamp: 2026-11-20T09:30:11Z (failed lint step)
  - Tool: Codex
  - Model: gpt-6.2-sol
  - Open Dough release: unknown (checkout-bound guidance at Take `18b9a405b`)
  - Evidence: `NativeDoneMarks.reported` began returning its continuation. Format, the staged hook, typecheck and focused behavior passed. [CI lint](https://github.com/terryyin/open-dough/actions/runs/44710919350/job/136202075605) flagged three ignored promises in unchanged callers. Targeted ESLint reproduced all three; `52be56f13` explicitly discarded the returns and passed the same lint and eight focused cases.
  - Observed effect: slice 2 paused and was restored around one repair publication. The consumer trace had named the callers. Its proof covered behavior and types, leaving typed lint on those files to CI. Targeting those callers with the read-only lint would have found this before publication.

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

- Execution: SEED-413#renovate-remaining-dashboard-frontend-unit-tests (plan 724; first implementation `22cb4e62b`)
  - Timestamp: unknown (2026-11-19 +08:00, slice 5 family finish)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `9a78cd913`)
  - Evidence: plan 724 premise "five passes in 2.07 s" from a scratch probe against the family finish: five moved cases summed 6.97–8.00 s mounted against 6.28 s built-app; a profile put 60–75% of each case in browser clicks (~150 ms) and the `actSettled` frame round (~85 ms).
  - Observed effect: a recurrence; the family delivered no case-time gain, and the comparison and a candidate settle change went to the later families' story.

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

## DD-589 — A unit-test approach states a whole machine instead of the input its handler reads <a id="dd-589"></a>

Plan 721's readiness-approved approach had each in-process case state a machine home through MakeMe stored documents and mount the project list through `mountProjectConfiguration`, which the plan called a production function though only test support called it. No planning or readiness check asked whether a case builds only the data its handler reads. The typed input later proposed in its place was again stated from the adapter's reads and named a source nothing under the handler reads.

### Occurrences

- Execution: SEED-413#renovate-dashboard-backend-unit-tests (plan 721; first implementation `42a8f2f96`)
  - Timestamp: unknown (2026-11-19 +08:00, slice 2, between `42a8f2f96` at 21:37:01 and `8cafad2fc` at 23:31:12)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.108 (installed by `f9c22bd89`); the slice 2 refactor checks were modified; revision `d49d119a5`; base 0.3.108
  - Evidence: `42a8f2f96^:.planning/slice-plans/721-prove-ad-hoc-review-reads-in-process/PLAN.md` Approach ("Machine state through MakeMe", `mountProjectConfiguration(environment)`) and proof map ("project list mounted through its production function"); SEED-413#renovate-dashboard-backend-unit-tests amendment ("*Amended 2026-11-19 by Terry during execution*", then "Narrowed the same day to the kept launch records alone … nothing under the session handler reads the published source"); plan 721 Approach "Typed kept state, read only by the adapter" and slice 2 Current decision; redo `8cafad2fc`; trunk `d49d119a5` "Define production code testability in refactoring guidance".
  - Observed effect: slice 2 as planned was returned once by the coordinator (275-line spec; trunk advanced through test-support Git helpers), then stopped by the refactor pass (JIDOKA) on about 60 repeated setup lines per spec. The developer rejected deferral, a test-support exception and a production machine mount, and amended the story to typed handler input. The coordinator proposed "the published source and the kept launch records" without tracing the handler; the next refactor pass found the source unused and stopped for a second amendment. Slice 2 took three implementation attempts, two stopped refactor passes, two amendments and two fresh source reviews.
  - Inference: both the plan's approach and the proposed contract defined test input from what the server or adapter reads, not from what the handler reads. A planning or readiness check that a unit case constructs only its handler's input would likely have caught both. The developer then added "Design production code for testability" to the refactor checks (`d49d119a5`), which apply after implementation, not at planning. Related to ODF-074 (the "production function" premise was unverified); no shared cause established.

## DD-590 — Acceptance records a "carries only what it reads" commitment from one type while sibling shapes carry more <a id="dd-590"></a>

Slice acceptance recorded source-review commitment 3.1 ("a handler's typed contract carries only the data its responsibility reads") as observed, citing `KeptSessionState = { records }`. The session variants of the typed read shapes still accepted story-only fields. Only the retrospective's independent outcome review found it.

### Occurrences

- Execution: SEED-413#renovate-dashboard-backend-unit-tests (plan 721; first implementation `42a8f2f96`)
  - Timestamp: unknown (slice 4 acceptance, between `e964711a7` at 2026-11-19T23:41:41+08:00 and `1a54cf72c` at 2026-11-20T00:06:35+08:00)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: 0.3.108 (installed by `f9c22bd89`); refactor checks modified; revision `d49d119a5`; base 0.3.108
  - Evidence: plan 721 Current decisions, slice 2 (`KeptSessionState = { records }`) and slice 4 (`ReviewInput<R>`); plan 721 Execution complete ("the session read shapes still accept story-only fields"); correction SEED-413#narrow-ad-hoc-review-handler-contracts (plan 725, item 1: a session review read accepts `reference`, `completed` and `historical`; a session file read accepts `completion`).
  - Observed effect: a commitment was recorded observed while the delivered result was narrower; one correction plan was queued after the execution-complete record. The fresh independent outcome review was the practice that caught it.
  - Inference: the observation covered the kept-state half of the contract, not the read shapes, and the source-review rules treat a narrower result as a mismatch. Related to ODF-420 and ODF-469 (acceptance observing less than the commitment); the shape differs, so no shared cause is established.

## DD-591 — A test-support repair added code the plan's cited North Star topic forbids, and no gate before wrap-up caught it <a id="dd-591"></a>

### Occurrences

- Execution: SEED-413#refuse-story-launch-session-file-reads (plan 726, `39baced58`). Timestamp: 2026-11-20T12:18:00+08:00. Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `e4970798e`). Evidence: the broad gate's load-induced timeouts went to a diagnosis brief. That brief carried the failure policy but not plan 726's cited topic "Make production code directly testable instead of growing test support", which allows test-support changes outside builders and page objects only to remove code. The repair added `claudeSessionBecomes(session, "done-live")` to `markAdHocDone` in `dashboard/test-support/support/adHocReview.ts`. Proof acceptance and the refactor pass ("follows the existing pattern") accepted it. The coordinator noticed only during wrap-up's North Star retirement check, which forced correction `SEED-413#remove-ad-hoc-done-helper` (plan 727, 25 call sites). Inference: briefs for repair and diagnosis work started mid-slice did not inherit the plan's cited direction, and the refactor checks do not test a test-support diff against that topic.
- Execution: SEED-413#split-branch-entry-proposal-from-store (plan 735, `bdfe9b08d`..`f6cfe454a`). Timestamp: 2026-11-20T22:03:17+08:00 (slice 1 commit) to 22:32:50+08:00 (removal in slice 3). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `10ace0630`). Evidence: the slice 1 and slice 2 refactor passes added `addAdHocWorktree` and `sessionBranchPinnedObjects` to `dashboard/test-support/support/adHocBranchRefs.ts` (in `bdfe9b08d` and `040982b70`); their briefs named the plan but not SEED-413's "test support only shrinks" direction. The coordinator noticed while settling slice 3's C13 gap and had slice 3's refactor pass remove both (`4e8cec828`); later briefs carried the direction and added nothing. Observed effect: two delivered commits violated the cited topic; one extra refactor scope and seven spec rewrites. Inference: caught mid-execution rather than at wrap-up because the coordinator reread the seed's direction for an unrelated gap; briefs still do not inherit the cited topic by default.
- Execution: SEED-413#split-done-mark-decision-from-store (plan 734, `f5e3a956d`..`0d1560004`). Timestamp: 2026-11-21 (slices 4–7 accepted between about 22:55 +08:00 on 11-20 and 00:45 +08:00). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `fd05ea2d2`). Evidence: every brief carried the cited topic, yet refactor passes added `aDoneSession`, `aDoneBranch`, `keptAsDone`, `keptAsDoneAfterRetirement` and a `pinned` switch to `doneCaptureReview.ts`/`doneBranchObservation.ts`; the coordinator noted the conflict at slice 4 and accepted it as "a later story folds it". Only the retrospective's independent review tied two of them to lost adapter proof (correction SEED-413#restore-done-capture-proof-after-composed-reviews, plan 743). Inference: carrying the topic in the brief is not enough; acceptance needs a check that new test support composes through MakeMe and writes no production state by hand.

## DD-592 — A testability correction's plan named no tests it retires <a id="dd-592"></a>

### Occurrences

- Execution: SEED-413#narrow-ad-hoc-review-handler-contracts (plan 725, `b32001e74`..`699f5fdcf`). Timestamp: 2026-11-20 (developer review after close `ae8a10e9d`). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `1e1f2e08d`). Evidence: the story narrowed handler contracts for testability, yet its only test change added `ad-hoc-review-file-signal.spec.ts` (5 cases). Its Structure slices proved "existing specs pass unchanged". It excluded the redundant wire specs to a sibling story, which deleted them later in `65b89f789`. The close record did not point to that story. One added case repeated the diff-versus-text admission path and was removed afterward. The developer asked: "I see only new test cases added, but no test case, old test cases removed … It should replace some of the existing tests, right?" Inference: neither slice planning nor wrap-up asked a testability change to name the tests it retires, or where that retirement went.

## DD-596 — Moves to composed state are accepted on assertion counts while the setup skips the step they proved <a id="dd-596"></a>

### Occurrences

- Execution: SEED-413#split-done-mark-decision-from-store (plan 734, `93cc82cf7`..`0d1560004`). Timestamp: 2026-11-21T01:05+08:00 (retrospective review; slices accepted 2026-11-20 22:55 to 2026-11-21 00:45 +08:00). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `fd05ea2d2`). Evidence: the plan's proof for "every replaced case keeps its assertions" was before/after `expect(` counts per spec; slices 4–7 passed it. The retrospective's read-only review found five cases whose composed records now supply what the adapter or real capture used to produce (`sessionCommits.shared`, the branch entry's Default main tip, a prepared-receipt guard, a kept delivery, Git's own reflog action text), so their unchanged assertions can no longer fail on that path. Intent Coverage at `6ff2b1d9c` confirmed one: dropping `shared` in `settleSessionCommits` passed every maintained check. Observed effect: correction plan 743 queued first. Inference: a move from action to composed state needs, per moved case, the production step its assertion observed and where that step is now proved, not a count. Related to DD-563 (removed assertions); here the assertions stay and the setup moves.

## DD-594 — Cases moved into Vitest's 5 s default were planned without per-case margin at routine local load <a id="dd-594"></a>

### Occurrences

- Execution: SEED-413#arrange-done-ad-hoc-observation-and-publication (plan 730, `77d845a62`..`fd378d808`). Timestamp: 2026-11-20T17:56:06+08:00 (slice 3 refactor stop) to 19:05:36+08:00 (slice 8 G1). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `3c7d21aaa`). Evidence: `fd378d808:.planning/slice-plans/730-arrange-done-ad-hoc-observation-and-publication/PLAN.md` premise records only a six-spec Playwright sum (11 cases, 20.71 s) without load or per-case times. Slice 1 learning: 1.2–2.2 s per case at load 8–13, one 5.1 s timeout at load 32. The slice 3 refactor pass stopped (JIDOKA) on two timeouts at load 12.4; the coordinator checked the `/usr/bin/git` launcher (no difference) and CI (0.2–0.8 s per case), recorded the exposure as awaiting Terry, and kept delivering slices 4–7. Slice 8's ADR 0010 comparison timed out two or three cases in three of five runs at load 14–16, raised as G1. Terry accepted the timing and queued SEED-413#optimize-done-capture-family-cases. Observed effect: a refactor stop, repeated load classification across five slices, and a late human decision. Inference: measuring the slowest moved case at the machine's routine load during planning would have surfaced the margin before slice 1; the human decision came about 70 minutes after the exposure was first recorded. Related to DD-583 (premise on an unrepresentative stage); the cause differs.
- Execution: SEED-413#split-branch-entry-proposal-from-store (plan 735, `bdfe9b08d`..`f6cfe454a`). Timestamp: 2026-11-20T22:45:00+08:00 (slice 4 focused proof at load 32–36) to 2026-11-21T00:43:00+08:00 (ADR 0010 runs). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `10ace0630`). Evidence: plan 735 premises record a baseline of 28 cases without load or per-case times. Slice 1 timed out ten 3–5 s cases at load 19–23; slices 4–6 timed out every Git-heavy case, including untouched ones, at load 18–47 from other worktrees. The coordinator waited twice on load (up to 30 minutes) and then published slices 4–6 with `progress: true` so hosted CI proved each revision before done. The final interleaved comparison at load 15–23 showed 0 timeouts against 6 at base, with five cases still at 4.1–4.6 s. Observed effect: about 1 hour of load waits and three progress-then-done publication pairs. Inference: hosted-CI progress proof kept delivery moving without weakening proof; the margin itself stays with SEED-413#optimize-done-capture-family-cases.
- Execution: SEED-413#restore-done-capture-proof-after-composed-reviews (plan 743, first implementation `0d4666c3f`). Timestamp: unknown (slice 5 refactor proof on 2026-11-21 around 09:00 +08). Tool: Codex. Open Dough release: unknown (checkout-bound guidance at Take `44d066285`). Evidence: the newer-Done supersession case took 5.079 s at the unchanged five-second default while one-minute load rose from 24.23 to 27.71 on 16 logical CPUs. `0c95fce81:.planning/slice-plans/743-restore-done-capture-proof-after-composed-reviews/PLAN.md` records the repair and the 1.643 s observed pass after moving two Review reads to saved-state assertions with load 20.86 to 20.02. Observed effect: the focused timeout moved that small part of slice 6 into slice 5 and required renewed proof. Inference: fewer full reads leave more headroom. The load difference also affects elapsed time.

## DD-595 — A sibling story's trunk landing on shared test support parks mid-slice work outside Git <a id="dd-595"></a>

### Occurrences

- Execution: SEED-413#arrange-done-ad-hoc-observation-and-publication (plan 730, merge `46ab47e39`). Timestamp: 2026-11-20T18:49:37+08:00 (park) to 18:56:10+08:00 (reapply). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `3c7d21aaa`). Evidence: sibling SEED-413#ad-hoc-branch-result-handoff landed on trunk changes to `doneCaptureCase.ts` and `ad-hoc-branch-entry-attribution.spec.ts` while slice 7 was uncommitted. The coordinator's trial merge conflicted; it aborted, saved slice 7 as a patch and a copied spec in the job tmp directory, reverted the worktree, delegated the reconciliation, published the merge, then reapplied with `git apply --3way`, resolved a conflict in `declaredPublisherBranch.ts` and repaired imports before rerunning the refactor proof. Observed effect: about 8 minutes of coordinator time plus a reconciliation agent; slice 7's only copy lived outside Git for 7 minutes. Inference: two Takes from one seed edited the same support module with no recorded prerequisite; a temporary WIP commit would have kept the parked work Git-recoverable. Related to DD-547 (sibling landing first on shared files).

## DD-597 — Acceptance recorded commitments as observed from cases that never asserted them <a id="dd-597"></a>

Slice acceptance recorded C9 ("repeating the handoff leaves the kept entry's pins in place") as observed by a case that reads pins only before the repeat. It recorded C20 ("every replaced assertion is preserved") as observed after slice 6 moved an expiry ahead of a held inspection's release, which dropped the race the case proved. Only the retrospective's independent outcome review found both.

### Occurrences

- Execution: SEED-413#split-branch-entry-proposal-from-store (plan 735, `bdfe9b08d`..`f6cfe454a`). Timestamp: 2026-11-21T00:43:00+08:00 (C20 recorded) to 00:53:48+08:00 (correction slice 7 `f6cfe454a`). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: unknown (checkout-bound guidance at Take `10ace0630`). Evidence: the slice 6 report said the lifecycle expiry "is now an explicit write while the inspection is held", and the coordinator accepted it. The slice 1 implementer mapped C9 to the adapter case, and the coordinator recorded it without reading for a post-repeat pin read. The retrospective reviewer cited `ad-hoc-manual-landing-observation-lifecycle.spec.ts:112-113` and `ad-hoc-session-branch-entry.spec.ts:72-91`. Observed effect: slice 7 (obligations G1 and G2) was added before the execution-complete record; the bypass discrimination then failed as expected. Inference: acceptance took the implementer's promise mapping as the observation location; related to DD-590, but the cause here is a restructured setup and a missing final read, not a narrower type.

## DD-598 — A speed promise over every touched file covered renamed files the premises never timed <a id="dd-598"></a>

The plan's premises timed only the files its regex `intent/intent-.*-comparison-mounted` selected, but the 500 ms promise covered every file the rename touched. That left `intent-source-target-recovery-mounted` (583–1017 ms, mount-bound) to fail at the last slice.

### Occurrences
- Execution: SEED-413#reduce-review-diff-reading-to-logic-cases (plan 744; first implementation `f4e5da6e2`)
  - Timestamp: 2026-11-21 (slice 5 returns; exact time unknown)
  - Tool: Claude Code
  - Model: claude-opus-5-5
  - Open Dough release: unknown (checkout-bound installed guidance at Take `87f8e8397`)
  - Evidence: plan 744 Premises row "Intent `-mounted` Playwright per-case times"; slice 5 Result; obligation G3; story Amendment; two slice 5 returns and a developer question.
  - Observed effect: the last slice stopped twice, and the developer had to narrow the speed bar to new or changed cases.

## DD-599 — A completing slice finishes code and proof within 15 minutes, then overruns while writing its multi-commitment return report <a id="dd-599"></a>

The final slice carried 12 of the story's 21 source-review commitments, including whole-story commitments allocated to the completing slice. Implementation, the scratch break, consumer trace and all seven `--clock` runs finished at 14.5 active minutes; writing the 161-line return report ran outside `--clock` and triggered `overrun: true` at 16.0–16.8 active minutes with zero unfinished changes, where `oversized-slice.md`'s `reverted and refined` path conflicts with `problem-decomposition.md`'s rule to preserve compatible completed work and proof.

### Occurrences

- Execution: SEED-413#prove-ad-hoc-review-handoffs-with-typed-handlers (plan 742; first implementation `412b2d8fa`)
  - Timestamp: 2026-11-21T01:58:48.298Z (`overrunDetectedAt: 1795224728298` on slice 4; paused at 2026-11-21T01:59:37.656Z)
  - Tool: Cursor
  - Model: gemini-4-carbon
  - Open Dough release: unknown (checkout-bound installed guidance at Take `9889c9925`; no release inferred from product VERSION)
  - Evidence: `144fc9308:.planning/slice-plans/742-prove-ad-hoc-review-handoffs/PLAN.md` slice 4 and `144fc9308:.planning/slice-plans/742-prove-ad-hoc-review-handoffs/source-review.md` (12 commitments `1c`, `4a`–`9b` on slice 4); worktree `open-dough/slice-clock` (`startedAt: 1795223724231`, 7 `--clock` commands ending `1795224639632` at 14.48 active min, `overrunDetectedAt: 1795224728298` on `Write` of `slice-4-report.md`, `endedAt: 1795224777656` at 16.8 active min).
  - Observed effect: `storyOverruns: 1` recorded with all code and proof already green; coordinator preserved the completed work, recorded the elapsed time in `PLAN.md`, and completed refactor, CI (`dd406eb69`) and Intent Coverage (`Caught` on `doneMarks.ts:171`) with zero rework.
  - Inference: distinct from DD-548 (broad multi-file sweeps); allocating whole-story commitments to the completing slice concentrates return-report prose at the end of its active budget, and `oversized-slice.md` names no completed-work overrun path beside `reverted and refined`.

## DD-600 — Planned slices bundle hidden preparation, so implementers stop four times for in-place splits <a id="dd-600"></a>

### Occurrences

- Execution: SEED-418#review-published-session-changes (plan 739; first implementation `77e2ef738`). Timestamp: unknown (2026-11-20 23:52 to 2026-11-21 07:47 +08:00, by the stopped slices' report files). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: 0.3.109 (installed `.claude/skills/dough-update/VERSION` at Take `953a8a123`, unchanged through `68c237144`). Evidence: Split notes for slices 2, 3, 5 and 6 and the Plan review in `68c237144:.planning/slice-plans/739-review-published-session-changes/PLAN.md`. Original slice 2 stopped after 4.4 active minutes: the review subject `{source, host, session}` needed a published variant and the Done listing built only from local launches. Old slice 3 stopped after about 3 minutes of reading with no edits (its report lists four separately deliverable outcomes, including a move out of the 250-line `performedRead.ts`). Old slice 5 stopped after about 2 minutes with no edits. Old slice 6 stopped after 1.9 minutes with no edits: it needed the page subject, the snapshot read and e2e support for real published records. The 8-slice plan was resplit (`e18740c25`) into 5 slices plus remainder plan 747, then grew back to 8, its maximum; Terry approved the resplit and the second split. Coordinator record: the pre-execution readiness review found "No remaining slice-specific concern". Observed effect: four stopped attempts (about 11 active minutes), two human approvals, one resplit and a remainder story. Little work was discarded: three attempts stopped before edits and slice 2's partial work was kept. Inference: planning and readiness sized each slice by its visible outcome without reading the seams it crosses. The implementers' early stop before edits kept the waste small. Related to ODF-281 (disproved sizing) and ODF-252 (ready story still needs preparation); neither has this early-stop shape.

## DD-601 — The coordinator left the slice clock running through a human question and recorded a false overrun <a id="dd-601"></a>

### Occurrences

- Execution: SEED-418#review-published-session-changes (plan 739; first implementation `77e2ef738`). Timestamp: unknown (2026-11-21; old slice 3 stop report written 00:11 +08:00, resplit `e18740c25` committed 06:46:04 +08:00). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: 0.3.109 (installed `.claude/skills/dough-update/VERSION` at Take `953a8a123`, unchanged through `68c237144`). Evidence: `68c237144:.planning/slice-plans/739-review-published-session-changes/PLAN.md` slice 3: "The slice clock shows 389.7 minutes for that slice only because the coordinator left it running while waiting on a human question"; the slice 3 report says "about 3 active minutes, spent reading". Coordinator record: an AskUserQuestion waited on Terry with the clock running, and the clock reported `storyOverruns=1`. Installed `oversized-slice.md` says to `pause` when the implementer returns or execution stops for a human. Observed effect: one false overrun in the clock record, one short of the reassess threshold of 2; the plan needed a note to explain it. Inference: `pause` is a manual step that is easy to miss before a blocking question. Clock records from this execution overstate slice 3 by about 387 minutes.

## DD-602 — A CI repair's refactor pass turned exact read budgets into relative checks, and repair acceptance kept them <a id="dd-602"></a>

### Occurrences

- Execution: SEED-418#review-published-session-changes (plan 739; first implementation `77e2ef738`). Timestamp: unknown (2026-11-21, between the repair report at 08:28 +08:00 and repair commit `4707bf8a3` at 08:32:06 +08:00). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: 0.3.109 (installed `.claude/skills/dough-update/VERSION` at Take `953a8a123`, unchanged through `68c237144`). Evidence: `ci-repair-1-report.md` raised the header journeys' exact counts (20 to 21, 5 to 6) and said "The assertions are no weaker". Published `4707bf8a3` instead compares later reads with `openingReads` taken from the same run (`git show 4707bf8a3 -- dashboard/frontend-tests/navigation/dashboard-header.spec.ts`); the coordinator attributes the change to the repair's refactor pass. The exact budget came from correction 687 at `41d93d114`. Intent Coverage at `68c237144` found that a duplicated opening read passes; correction plan 746 finding 6, slice 8. Observed effect: the opening-read budget went unprotected on the published branch; one correction slice was queued. Inference: the loosening came after the repair return, and repair acceptance's check for a loosened distinguishing assertion did not see it; only wrap-up Intent Coverage did. Related to ODF-442 (a refactor drops an asserted condition, caught by acceptance) and DD-563 (a removal drops a bundled observation); here the loosening came from a CI repair's refactor pass.

## DD-603 — Publication proof stopped at the producer script, so acceptance kept a Land route no real Land can use <a id="dd-603"></a>

### Occurrences

- Execution: SEED-418#review-published-session-changes (plan 739; first implementation `77e2ef738`). Timestamp: unknown (2026-11-20, slice 1 accepted before `77e2ef738` at 22:42:59 +08:00). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: 0.3.109 (installed `.claude/skills/dough-update/VERSION` at Take `953a8a123`, unchanged through `68c237144`). Evidence: plan 739 slice 1 Proof named "the production Land workflow boundary". Its Accepted proof, `session-record-publication.test.mjs`, calls `publishSessionClose` directly and records "a retained `sessionId` for a native start"; slice 7's e2e also publishes through `publishSessionClose`. The independent outcome review found 7 defects (plan 746). Finding 1: `publish-reviewed-checkout.md` routes a native start with a `sessionId` that no shipped guidance supplies, the producer then stops with `session-identity-missing`, Land's `SKILL.md` and `dashboard-completion.md` never mention the route, the guidance writes `workflow: "standalone"` where the Dashboard uses `"ad-hoc"`, and Land never passes `backlogPath`. Observed effect: all eight slices were accepted with green CI, yet no real Land publishes a record, so the second-machine review has no data outside tests. Correction plan 746 is queued ahead of the remainder. Inference: acceptance took a script-level boundary in place of the named workflow boundary, and no slice checked the guidance's inputs against their suppliers. Related to ODF-294 (proof short of the named path) and ODF-254 (setup performs the product action); neither matches decisively.

## DD-604 — Static test listings undercount loop-generated cases <a id="dd-604"></a>

The Dashboard backend list reported one declaration for a test loop. Live Vitest collection expanded each row. Case-count audits need live collection for Vitest and the native listing for Playwright.

### Occurrences

- Execution: SEED-413#restore-done-capture-proof-after-composed-reviews (plan 743, first implementation `0d4666c3f`). Timestamp: 2026-11-21T01:53:36.018Z (candidate declaration listing). Tool: Codex. Open Dough release: unknown (checkout-bound guidance at Take `44d066285`). Evidence: the first matched audit at `0747fb0a2` listed 125 and 120 declarations. `vitest list --no-staticParse` with the same roster counted 135 and 133 runtime cases, and each side had four native Chromium cases. The integrated audit in `706285f9e:.planning/slice-plans/743-restore-done-capture-proof-after-composed-reviews/PLAN.md` records 148 and 146 actual cases on the shared `be03d5643` basis. Observed effect: treating declaration counts as the denominator initially suggested five fewer cases on the preliminary basis. Live collection narrowed that difference to two. Inference: the static listing serves source navigation. Its total can misstate a proof-cost claim when rows change.

## DD-605 — Moved-case conversions drop or self-supply distinct assertions on first return despite the brief's preserve rule <a id="dd-605"></a>

Briefs said "Preserve each distinct assertion". In four of six moving slices the first return dropped an assertion or replaced a production input with one the case supplied; coordinator acceptance returned each before delivery.

### Occurrences

- Execution: SEED-413#mount-story-review-changes-panel (plan 748; first implementation `277d5717c67aed5babc1806881797d52a0ec8235`). Timestamp: unknown (2026-11-21 +08:00, slice 2 to 6 acceptance, between `277d5717c` at 11:22:29 and `5a6b3f667` at 13:24:29). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: 0.3.109 (installed `.claude/skills/dough-update/VERSION` at Take `17fe6c2c4`, unchanged through `68745734e`). Evidence: slice 2's refused-read case never checked the problem was gone after retry; slice 3 dropped the eye tooltip on hover and vertical centring; slice 4's another-story case keyed its own rerender instead of the production `storyReviewPanelKey`, so a remount-key break would pass (the implementer reported it as a gap); slice 6 reduced the comparison description read-back after closing Notes to the toolbar name. Each was fixed on the same uncommitted slice. Wrap-up Intent Coverage at `68745734e` on "the eye reveals and hides details without moving the reading place" returned Caught (`story-review-details.spec.ts:64`); the hide-only path was not separately probed. Observed effect: four acceptance returns at 1–2 extra active minutes plus a resumed agent turn each; no observation shipped lost. Inference: matching is uncertain against DD-563, DD-569, DD-577, DD-597 and ODF-505, where a removal or acceptance let a loss through; here acceptance caught every loss and the recurring cost sits in the first-return conversion. Whether a per-assertion map in each return would prevent it is untested.

## DD-606 — Recording an observation with a Story obligation entry clears the commitment's Slice cell <a id="dd-606"></a>

`story-obligations.mjs record` with `--observed` and entry fields but no `--slice` wrote the entry and the observation, reported success, and left the source-review row's Slice cell empty.

### Occurrences

- Execution: SEED-413#mount-story-review-changes-panel (plan 748; first implementation `277d5717c67aed5babc1806881797d52a0ec8235`). Timestamp: unknown (2026-11-21 +08:00, slice 6 acceptance before `5a6b3f667` at 13:24:29). Tool: Claude Code. Model: claude-opus-5-5. Open Dough release: 0.3.109 (installed `.claude/skills/dough-update/VERSION` at Take `17fe6c2c4`, unchanged through `68745734e`). Evidence: `record --plan <PLAN> --commitment 18d --observed '<loc>' --entry-id G1 --title … --reported-slice 6 --reported … --story-clause … --disposition 'proved by slice 6: …'` left `| 18d | "…" |  | observed: … |`. The coordinator saw it by grepping the row, restored it with `record --commitment 18d --slice 6`, and the next `check` passed; `5a6b3f667:.planning/slice-plans/748-mount-story-review-changes-panel/source-review.md` row 18d reads `slice 6`. Read-only inspection of installed `story-obligation-source-review-record.mjs` (`recordStoryCommitment`): `current.slice` is carried forward only in the branch `else if (!(hasObligation || request.entry))`, so any entry-bearing record without `--slice` drops it. Observed effect: one silently unallocated commitment, repaired before commit. Inference: unnoticed, the row would have stayed unallocated for a later check to refuse or be published mis-recorded. Related to ODF-510 and ODF-514 (the same recorder discards existing link state by default); the field and code path differ, so it is not matched to either.
