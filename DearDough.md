# DearDough Process Findings

The [shared finding catalog](docs/maintainer/finding-names.md) holds reconciled
evidence, former codes and response history. This log retains Open Dough
observations and context beyond those catalog records. See
[ProjectFindings.md](ProjectFindings.md) for repository-owned findings.

## Retention

- Highest allocated local number: 539. Removed numbers are never reused.
- Recovery: `face6fd05b3f5c4f20159db9b41480afbe90d592:DearDough.md` holds the exact pre-maintenance log and its earlier recovery chain. The [catalog](docs/maintainer/finding-names.md) retains reconciled occurrences. The [project findings](ProjectFindings.md) and [review history](docs/maintainer/project-findings-history.md#review-and-recovery) retain the local CI issues (DD-529, DD-537, DD-539).
- Occurrence history is partial.

## ODF-154 — Missing Cursor coordinator identity <a id="odf-154"></a>

Former local code: DD-095 (plan 126 Cursor occurrence only). Former local code: DD-231. [Evidence and current response](docs/maintainer/findings/ODF-154.md).

## ODF-150 — Implementation proof misses indirect consumers <a id="odf-150"></a>

Former local code: DD-259. [Meaning, evidence and response](docs/maintainer/findings/ODF-150.md).

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

## ODF-314 — An implementation return omits delegated proof rows and needs a second round <a id="odf-314"></a>

Former local code: DD-257. [Meaning, evidence and response](docs/maintainer/findings/ODF-314.md).

## ODF-322 — A projected delivery result drops the running command's handle <a id="odf-322"></a>

Former local code: DD-325. The coordinator reduced a guarded delivery call to its output text, dropping the live command's session handle; the terminal receipt was recovered through checkout inspection and an exact-candidate resume. [Evidence and current response](docs/maintainer/findings/ODF-322.md).

<a id="dd-536"></a><a id="dd-536--implementers-left-lint-to-delivery-so-the-delivery-formatter-failed-on-findings-they-could-have-seen"></a>

## ODF-329 — Implementation returns failed the delivery formatter's lint

Former local code: DD-536. Former local code: DD-334. [Meaning, evidence and response](docs/maintainer/findings/ODF-329.md).

<a id="dd-349--post-change-refactor-compressed-planmd-story-obligations-under-the-file-size-gate"></a>

## ODF-362 — Post-change refactor compressed PLAN.md Story obligations under the file-size gate

Former local code: DD-349. [Meaning, evidence and response](docs/maintainer/findings/ODF-362.md).

<a id="dd-535"></a><a id="dd-535--a-plans-native-validation-slice-needed-trunk-but-named-no-landing-checkpoint"></a>

## ODF-333 — Story Branch proof requires trunk before closure <a id="odf-333"></a>

Former local code: DD-535. Former local code: DD-387. Former local code: DD-401. Former local code: DD-394 (`6c354905e`), renumbered in merge `966aad8b1`. Two local facets enter this gate: closure commitments owned by completion or wrap-up but allocated to the last slice must be observed before its done transition (DD-387), and a Story Branch rollout slice released from trunk without a step landing the earlier slices (DD-401). [Meaning, evidence and response](docs/maintainer/findings/ODF-333.md).

## ODF-330 — Hand-built delivery inputs omit an unchanged plan from ownedPaths

[Meaning, retained unchanged-plan evidence and current response](docs/maintainer/findings/ODF-330.md).

## ODF-337 — Fresh delivery ownedPaths cannot stage a deleted rename source

Former local code: DD-391. [Evidence and current response](docs/maintainer/findings/ODF-337.md).

## ODF-396 — Planning basenames overwhelm a test-local consumer trace

Former local code: DD-404. [Evidence and current response](docs/maintainer/findings/ODF-396.md).

### Occurrences
- Execution: SEED-010#review-independently-observable-promises (first implementation `8ac10364f82362f3dac2504304a52645ed661456`)
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: 0.3.101 (installed tracer at Take `7bb9992277410f6b5c3ba8da0b461c3c61939a84`; the candidate Distribution guidance was modified in this execution)
  - Evidence: 2026-11-15 implementation/refactor returns; `10cebdb8e804c52626805b1e42164985229680e4:.planning/slice-plans/616-review-independently-observable-promises/replays/{small-consumers.md,acceptance-consumers.md,refactor-contract-consumers.md}` retain 575, 561 and 174 per-file dispositions. Both base traces automatically included the coordinator-owned `PLAN.md` and its generic basename; the second did so even with an explicit guide `--path`. The first inventory was 644 lines before its responsibility split.
  - Observed effect: 1,310 disposition rows across three trace records, including repeated paths, for changes to two guidance pages. The file-size check required splitting the first inventory into an index and seven responsibility files; the second inventory also used seven disposition files. Refactor handbacks reported about 5 and 10 active minutes for their complete reviews; trace cost was not separately isolated. Actual source-review CLI and payload-link proof passed, with no missed consumer established.
  - Inference: auto-derived execution-record terms and additive `--path` selection reproduced this finding's broad-path bookkeeping. Keep indirect proof, but distinguish the changed behavioral surface from unrelated record matches and make path-selection semantics explicit.


## ODF-427 — A Story Branch keep-worktree landing hand-writes its publication script

Former local code: DD-425. [Evidence and current response](docs/maintainer/findings/ODF-427.md).

## ODF-428 — A refactor moved tests after acceptance had cited them, leaving source-review observations stale

Former local code: DD-431. [Evidence and current response](docs/maintainer/findings/ODF-428.md).

<a id="dd-442--a-shallow-historical-checkout-still-inherited-the-host-git-object-store"></a> DD-442 — A shallow historical checkout still inherited the host Git object store. [Project evidence](docs/maintainer/project-maintenance-findings.md#dd-442).

<a id="dd-445--timeout-headroom-judged-from-one-hosted-run-missed-run-to-run-variance"></a> DD-445 — Timeout headroom judged from one hosted run missed run-to-run variance. [Project evidence](docs/maintainer/project-test-findings.md#dd-445).

<a id="dd-450"></a><a id="dd-450--a-plans-identical-step-tree-proof-did-not-account-for-a-per-run-random-value"></a> [DD-450 moved to ODF-074](docs/maintainer/findings/ODF-074.md).

<a id="dd-452--a-shell-check-gained-a-browser-its-ci-job-did-not-install"></a> DD-452 — A shell check gained a browser its CI job did not install. [Project evidence](docs/maintainer/project-findings-history.md#dd-452).

## ODF-434 — Coordinator sends an unsubstituted placeholder to a delegated agent <a id="odf-434"></a>

[Meaning, evidence and response](docs/maintainer/findings/ODF-434.md). This facet: the implementation brief, not the source-only reviewer.

<a id="dd-463"></a> DD-463 — A reverse import-closure selection silently dropped importers. [Project findings](ProjectFindings.md#dd-463).

<a id="dd-465"></a> DD-465 — An empty focused path list ran the whole local suite. [Project findings](ProjectFindings.md#dd-465).

<a id="dd-481"></a><a id="dd-481--freshness-chooses-a-pre-take-merge-base-despite-another-base-containing-the-accepted-take"></a>

## ODF-482 — Freshness chooses a pre-Take merge base despite another base containing the accepted Take

Former local code: DD-481.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-482.md#odf-482).

<a id="dd-482"></a><a id="dd-482--ready-plan-used-singular--slice-so-obligations-could-not-list-slices"></a>

## ODF-368 — Ready plan used singular `## Slice`, so obligations could not list slices

Former local code: DD-482.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-368.md#odf-368).

<a id="dd-488"></a><a id="dd-488--guarded-slice-delivery-rejects-its-retained-markdown-hard-break"></a>

## ODF-484 — Guarded slice delivery rejects its retained Markdown hard break

Former local code: DD-488.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-484.md#odf-484).

<a id="dd-489"></a><a id="dd-489--generic-wrap-up-publication-prose-contradicts-story-branch-integration"></a>

## ODF-485 — Generic wrap-up publication prose contradicts Story Branch integration

Former local code: DD-489.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-485.md#odf-485).

<a id="dd-491"></a><a id="dd-491--a-proof-limitation-accepted-at-slice-acceptance-returned-as-a-queued-correction-after-intent-coverage"></a>

## ODF-496 — A proof limitation accepted at slice acceptance returned as a queued correction after Intent Coverage

Former local code: DD-491. [Evidence and response](docs/maintainer/findings/ODF-496.md).

<a id="dd-492"></a><a id="dd-492--a-plan-promised-an-existing-layout-family-would-stay-green-without-measuring-the-room-a-new-pinned-control-needs"></a>

## ODF-074 — A plan promised an existing layout family would stay green without measuring the room a new pinned control needs

Former local code: DD-492. [Evidence and response](docs/maintainer/findings/ODF-074.md).

<a id="dd-493"></a><a id="dd-493--a-source-only-review-numbers-context-and-proof-method-statements-as-commitments-that-each-need-an-observation"></a>

## ODF-481 — A source-only review numbers context and proof-method statements as commitments that each need an observation
Former local code: DD-493.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-481.md#odf-481).

<a id="dd-494"></a>

## DD-494 — A story's "still proves" example named a result the base's checks never asserted

The retained planning observation already identifies the missing assertion as the unverified premise. [Retained evidence](docs/maintainer/findings/ODF-074.md).

<a id="dd-495"></a><a id="dd-495--a-planned-step-removal-named-no-owner-for-a-fault-the-step-detected-only-in-passing"></a>

## ODF-435 — A planned step removal named no owner for a fault the step detected only in passing
Former local code: DD-495.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-435.md#odf-435).

<a id="dd-496"></a><a id="dd-496--an-intermittent-local-failure-in-a-journey-the-slice-changed-was-attributed-to-machine-load-and-hosted-ci-failed-it-on-a-deterministic-cause"></a>

## ODF-497 — An intermittent local failure in a journey the slice changed was attributed to machine load, and hosted CI failed it on a deterministic cause

Former local code: DD-496. [Retained evidence](docs/maintainer/findings/ODF-497.md).

<a id="dd-497"></a>

## DD-497 — A plan premise that two entry points share a component stood in for observing the second entry point's keyboard outcome

The retained occurrence records the decisive caller omitted from the one-entry-point planning probe. [Retained evidence](docs/maintainer/findings/ODF-074.md).

<a id="dd-498"></a><a id="dd-498--a-coordinators-timing-loop-filtered-runner-output-so-the-one-failed-run-left-no-evidence"></a>

## ODF-108 — A coordinator's timing loop filtered runner output, so the one failed run left no evidence
Former local code: DD-498.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-108.md#odf-108).

<a id="dd-500"></a>

## DD-500 — A story promised an absolute case time at a load profile whose premises were measured only on a quiet host

The retained occurrence records that the settled timing premise used the wrong load profile. [Retained evidence](docs/maintainer/findings/ODF-074.md).

<a id="dd-501"></a><a id="dd-501--a-fresh-source-review-after-a-one-clause-amendment-returned-different-ids-for-unchanged-commitments"></a>

## ODF-383 — A fresh source review after a one-clause amendment returned different ids for unchanged commitments

Former local code: DD-501.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-383.md#odf-383).

<a id="dd-502"></a><a id="dd-502--named-sibling-reconciliation-entered-git-before-the-backlog-adapter"></a>

## ODF-397 — Named-sibling reconciliation entered Git before the backlog adapter

Former local code: DD-502. [Retained evidence](docs/maintainer/findings/ODF-397.md).

<a id="dd-503"></a><a id="dd-503--a-load-timeout-in-the-checked-journey-was-attributed-and-profiled-before-the-coordinator-looked-for-the-taken-story-that-already-owned-it"></a>

## ODF-498 — A load timeout in the checked journey was attributed and profiled before the coordinator looked for the Taken story that already owned it

Former local code: DD-503. [Retained evidence](docs/maintainer/findings/ODF-498.md).

<a id="dd-504"></a><a id="dd-504--a-plans-whole-suite-gate-named-npm-test-for-dashboard-journeys-it-does-not-run"></a>

## ODF-495 — A plan's whole-suite gate named `npm test` for dashboard journeys it does not run
Former local code: DD-504.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-495.md#odf-495).

<a id="dd-505"></a><a id="dd-505--the-file-size-gate-stopped-delivery-for-a-one-line-link-retarget-in-an-already-oversized-seed"></a>

## ODF-152 — The file-size gate stopped delivery for a one-line link retarget in an already oversized seed

Former local code: DD-505. [Retained evidence](docs/maintainer/findings/ODF-152.md).

## DD-506 — A configuration promise proved only by scratch observation became a correction after Intent Coverage

SEED-329#use-shared-test-guidance. Claude Code / claude-opus-5-5, 0.3.97. A scratch selection-matrix result stood in for a maintained configuration guard. Intent Coverage found the gap. The ~154 ms scheduled-source guard [completed](.planning/done/SEED-329_guard-scheduled-test-makeme-selection.json). [Original occurrence and provenance](https://github.com/terryyin/open-dough/blob/face6fd05b3f5c4f20159db9b41480afbe90d592/DearDough.md#L574).

## DD-507 — A resource hold became a quiet-window prerequisite without an established target

SEED-300#express-review-test-intent-through-page-objects. Codex / gpt-6.1-sol, release unknown. The coordinator required a quiet machine after AC returned and sent two resource stops. The developer restored the moderately busy target, and the updated cohorts passed. The environmental judgment is qualified. [Original occurrence and provenance](https://github.com/terryyin/open-dough/blob/face6fd05b3f5c4f20159db9b41480afbe90d592/DearDough.md#L589).

<a id="dd-509"></a>

## DD-509 — Measured figures were fixed before their floor was probed

The retained occurrence records the fixed case cost that was first measured after implementation. [Retained evidence](docs/maintainer/findings/ODF-074.md).

<a id="dd-510"></a><a id="dd-510--a-ci-failure-on-a-long-behind-branch-was-repaired-before-checking-trunk"></a>

## ODF-490 — A CI failure on a long-behind branch was repaired before checking trunk
Former local code: DD-510.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-490.md#odf-490).

<a id="dd-511"></a><a id="dd-511--a-coordinator-offered-a-suite-wide-setting-with-an-understated-reach-and-the-human-approved-that-description"></a>

## ODF-491 — A coordinator offered a suite-wide setting with an understated reach, and the human approved that description
Former local code: DD-511.

[Retained occurrence and follow-up](docs/maintainer/findings/ODF-491.md#odf-491).

<a id="dd-512"></a>

## DD-512 — Sibling stories of one family built parallel owners for the same test controls while running concurrently

Related evidence already retained. The plan named no sibling for the delivered check to evaluate. [Retained evidence](docs/maintainer/findings/ODF-429.md).

<a id="dd-513"></a><a id="dd-513--acceptance-observed-a-cross-view-same-reading-promise-through-the-shared-component-while-the-views-words-differed"></a>

## ODF-499 — Acceptance observed a cross-view "same reading" promise through the shared component while the views' words differed

Former local code: DD-513. [Retained evidence](docs/maintainer/findings/ODF-499.md).

<a id="dd-514"></a><a id="dd-514--a-migrations-preparation-sized-its-slices-by-spec-and-case-counts-without-classifying-what-each-spec-proves"></a>

## ODF-500 — A migration's preparation sized its slices by spec and case counts without classifying what each spec proves

Former local code: DD-514. [Retained evidence](docs/maintainer/findings/ODF-500.md).

<a id="dd-515"></a><a id="dd-515--test-and-ci-mailbox-waits-that-relied-only-on-macos-fswatch-failed-under-load"></a>

## ODF-501 — Test and CI mailbox waits that relied only on macOS `fs.watch` failed under load

Former local code: DD-515. [Retained evidence](docs/maintainer/findings/ODF-501.md).

## DD-516 — Delegated agents ran Git and process commands their briefs forbade

SEED-334#run-and-observe-product-wide-end-to-end-tests. Claude Code, 0.3.98. A prohibited reset unstaged 309 owned renames, then they were restaged. A broad process pattern matched no other run. The host blocked the reserved planning edit. Related to ODF-285 and ODF-338 with separate mechanisms still possible. [Original occurrence and provenance](https://github.com/terryyin/open-dough/blob/face6fd05b3f5c4f20159db9b41480afbe90d592/DearDough.md#L695).

<a id="dd-517"></a>

## DD-517 — Exact hosted proof before slice completion

[Qualified ordinary-use observation for ODF-418](docs/maintainer/findings/ODF-418.md#ordinary-use-candidate--open-dough--dd-517).

<a id="dd-518"></a><a id="dd-518--an-unavailable-load-gate-outlasted-metric-and-evaluation-priority-clarification"></a>

## ODF-502 — An unavailable load gate outlasted metric and evaluation-priority clarification

Former local code: DD-518. [Retained evidence](docs/maintainer/findings/ODF-502.md).

<a id="dd-519"></a><a id="dd-519--an-isolation-obligation-was-closed-as-proved-from-its-normal-path-cleanup-only"></a>

## ODF-503 — An isolation obligation was closed as proved from its normal-path cleanup only

Former local code: DD-519. [Retained evidence](docs/maintainer/findings/ODF-503.md).

<a id="dd-520"></a><a id="dd-520--a-trunk-merge-was-proved-before-it-was-committed-and-head-cloning-fixtures-tested-the-old-layout"></a>

## ODF-504 — A trunk merge was proved before it was committed, and HEAD-cloning fixtures tested the old layout

Former local code: DD-520. [Retained evidence](docs/maintainer/findings/ODF-504.md).

## DD-521 — Practice: retained raw native streams let observer defects found after paid runs be re-derived instead of rerun

SEED-346#run-native-ab-comparisons-on-real-work and SEED-356#reduce-total-model-work-during-blocked-execution. Claude Code / 0.3.98 and Codex / release unknown. Retained raw streams supported re-derivation of observer fields after two paid journeys (~22 and ~14 min) and one usage export without another paid attempt. One run lacked raw per-test records. Matching capture, observation and manifest hashes preserve original accounting provenance. No counterfactual token or billing saving was measured. [Original occurrence and provenance](https://github.com/terryyin/open-dough/blob/face6fd05b3f5c4f20159db9b41480afbe90d592/DearDough.md#L776).

## ODF-248 — Refactor reruns unchanged consumer proof

Former local code: DD-292. [Meaning and retained evidence](docs/maintainer/findings/ODF-248.md).

<a id="dd-522"></a>

## DD-522 — Full-corpus persistence capacity was first exercised after fixture-sized acceptance

Scale was a decisive premise. Fixture observation did not exercise actual corpus ancestry or serialized size. Execution confirmed both limits, then repaired the product and reverified the full import. [Retained evidence](docs/maintainer/findings/ODF-074.md).

## DD-523 — A new store writer's real-store observation measured time and memory but not store growth

SEED-357#view-token-usage-for-dashboard-launched-tasks. Claude Code / 0.3.99. The real-store observation measured elapsed time and memory but left write growth out. A clone revealed about 1 GB of superseded pages per refresh. The [size-budget story completed](.planning/done/SEED-357_keep-usage-history-within-a-small-disk-budget.json). The process observation remains qualified. [Original occurrence and provenance](https://github.com/terryyin/open-dough/blob/face6fd05b3f5c4f20159db9b41480afbe90d592/DearDough.md#L828).

<a id="dd-524"></a><a id="dd-524--a-slice-sizing-probe-sampled-only-small-cases-and-later-batches-overran-agent-context"></a>

## ODF-512 — A slice-sizing probe sampled only small cases, and later batches overran agent context

Former local code: DD-524. [Retained evidence](docs/maintainer/findings/ODF-512.md).

<a id="dd-525"></a><a id="dd-525--relocation-acceptance-trusted-the-implementers-mapping-table-and-a-dropped-server-side-assertion-surfaced-only-at-wrap-up"></a>

## ODF-505 — Relocation acceptance trusted the implementer's mapping table, and a dropped server-side assertion surfaced only at wrap-up

Former local code: DD-525. [Retained evidence](docs/maintainer/findings/ODF-505.md).

## DD-526 — A plan promised specs would pass unchanged while its own premise row listed them as dependents of the removed storage

SEED-357#keep-usage-history-within-a-small-disk-budget. Claude Code / 0.3.99 at Take. The premise table already named a storage consumer that the proof table called unchanged. Four specs required edits after two coordinator rulings. Related to ODF-074. [Original occurrence and provenance](https://github.com/terryyin/open-dough/blob/face6fd05b3f5c4f20159db9b41480afbe90d592/DearDough.md#L870).

## DD-527 — A plan decision that stored candidates keep assignment corrections working was proved only without a reread between loss and regain

SEED-357#keep-usage-history-within-a-small-disk-budget. Claude Code / 0.3.99 at Take. A rejection followed by a reread dropped the stored candidate when native files were absent. The implementation and maintained check were corrected at `5756f0a28`. Planning omitted the intervening reread. [Original occurrence and provenance](https://github.com/terryyin/open-dough/blob/face6fd05b3f5c4f20159db9b41480afbe90d592/DearDough.md#L884).

<a id="dd-528"></a>

## DD-528 — A latency premise timed one suspected cost, and the promised figure failed on a cost nobody had measured

The same unobserved-decisive-premise mechanism affected the complete latency target. Timing only file listing did not exercise matching in the actual operation. [Retained evidence](docs/maintainer/findings/ODF-074.md).

<a id="dd-529"></a><a id="dd-529--a-hosted-suite-deadline-cutoff-named-no-failing-test-and-a-group-left-without-margin-by-sibling-conversions-failed-on-an-unrelated-storys-merge"></a>

## ODF-506 — A hosted suite-deadline cutoff named no failing test, and a group left without margin by sibling conversions failed on an unrelated story's merge

Former local code: DD-529. [Retained evidence](docs/maintainer/findings/ODF-506.md).

<a id="dd-530"></a><a id="dd-530--trunk-rewrote-tests-an-accepted-uncommitted-slice-had-edited-and-the-coordinator-improvised-the-reconciliation"></a>

## ODF-507 — Trunk rewrote tests an accepted, uncommitted slice had edited, and the coordinator improvised the reconciliation

Former local code: DD-530. [Retained evidence](docs/maintainer/findings/ODF-507.md).

## DD-531 — A cloned home changed the measured store size because stored sources carry the home's absolute path

SEED-357#keep-usage-history-within-a-small-disk-budget. Claude Code / 0.3.99 at Take. The literal APFS clone measured 26,033,157 bytes because absolute home paths duplicated sources for 1,021 tasks. With cloned source paths rewritten the store measured 24,277,565 bytes. A pure conversion measured 22,871,902. The accepted budget used the corrected figure. [Original occurrence and provenance](https://github.com/terryyin/open-dough/blob/face6fd05b3f5c4f20159db9b41480afbe90d592/DearDough.md#L948).

<a id="dd-532"></a><a id="dd-532--a-plan-described-a-commands-inputs-as-refs-optional-paths-without-saying-which-ref-each-path-narrows"></a>

## ODF-508 — A plan described a command's inputs as "refs, optional paths" without saying which ref each path narrows

Former local code: DD-532. [Retained evidence](docs/maintainer/findings/ODF-508.md).

<a id="dd-533"></a><a id="dd-533--a-reported-gap-was-closed-as-no-user-cost-on-a-window-estimated-in-seconds-and-the-retrospective-found-it-spans-the-whole-judgment"></a>

## ODF-509 — A reported gap was closed as "no user cost" on a window estimated in seconds, and the retrospective found it spans the whole judgment

Former local code: DD-533. [Retained evidence](docs/maintainer/findings/ODF-509.md).

<a id="dd-534"></a><a id="dd-534--recording-several-commitments-to-one-obligation-leaves-an-incomplete-reverse-link"></a>

## ODF-510 — Recording several commitments to one obligation leaves an incomplete reverse link

Former local code: DD-534. [Retained evidence](docs/maintainer/findings/ODF-510.md).

<a id="dd-538"></a><a id="dd-538--a-carried-one-family-per-slice-sizing-note-left-the-next-recently-done-batch-oversized"></a>

## ODF-511 — A carried one-family-per-slice sizing note left the next recently-done batch oversized

Former local code: DD-538. [Retained evidence](docs/maintainer/findings/ODF-511.md).
