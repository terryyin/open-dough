# DearDough Process Findings

The [shared finding catalog](docs/maintainer/finding-names.md) holds reconciled
evidence, former codes and response history. This log retains Open Dough
observations and context beyond those catalog records. See
[ProjectFindings.md](ProjectFindings.md) for repository-owned findings.

## Retention

- Highest allocated local number: 539. Removed numbers are never reused.
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
