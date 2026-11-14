# Execution design, premises and gate basis

Supporting appendix of [the same execution plan](PLAN.md); authoritative slice
status, execution identity and obligations remain there.

## Design and existing owners

- Extend the maintainer comparison entry and its frozen-arm, retention,
  basis/recovery, observer and outcome-first judge responsibilities. One
  applicability rule determines whether the explicitly supplied baseline is
  sufficient; known misses use the ordinary fresh path. Avoid a parallel judge
  or a repository-wide archive registry.
- Retain compact observations and decisive assessment inputs, rather than
  trusting a prior verdict. Keep original capture provenance immutable;
  corrections are traceable derived assessments. Use the existing
  `comparisons/` exclusion so adding evidence does not change case identity.
- Preserve full provenance separately from applicability. Match resolved
  baseline payload, agent-facing task/events/setup/project basis and material
  runtime/settings. A changed observer or assessor is not silent equivalence:
  replay only when the retained evidence supports the current criteria and
  explain the derived assessment. Otherwise obtain fresh evidence. Verify
  actual candidate settings before claiming comparability.
- A match remains one historical stochastic observation. Disclose dates,
  load, scheduling and other variable measurement limits; no concurrent-pair
  interpretation follows from reuse. Unknown proof/usage stays unknown.
- PFE: the admission family's `native-admission-reuse.md` separates capture,
  current assessment and applicability. Reuse that distinction and suitable
  shared native readers, not its admission-specific protocol. Available Codex
  usage is kept with native ownership/turn attribution; do not build a general
  cross-host accounting platform or sum duplicated history/cumulative prefixes.
- Applicable Accepted decisions:
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  (matching evidence, native qualification, outcome/proof first),
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  (declared criteria and bounded conclusions), and
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (one coherent responsibility and minimum complexity).
  [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps this design in
  intent documentation. Index/statuses agree; no conflict or successor was
  found. The existing North Star concerns dashboard responsibilities and adds
  no constraint here; no new temporary direction is warranted.

## Decisive premises and observations

Observed on 2026-11-14 in this preparation checkout at product source
`f8624a1332d52ed850b69003d96169a0867ddd3b`; subsequent edits before this plan
were planning records only. Disposable observations changed no product files.

| Premise / consuming operation | Form, observed result and remainder |
| --- | --- |
| Existing retained provenance can be recovered | `PATH=/opt/homebrew/bin:$PATH Distribution/tests/native-comparison.sh --recover Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T102744-1921.txt` returned 0, recovered 49 inputs at `764c4e0…`, found both payloads and `codex-cli 0.169.0`. This establishes provenance, not proof sufficiency. |
| An old summary alone is not replayable proof | Bash 5: source `native-observation.sh` and `paused-supplier/assess.bash`; `case_assess …/comparisons/20261114T102744-1921.txt` gave `fail`, `turn 1 did not complete (): the session did not yield`. The exporter must retain assessor inputs and their decisive support, not wrap the summary as a reusable pass. |
| The existing journey/observer can exercise the forced-turn case | Bash 5.3.20, existing `native-agent-paused-supplier.sh` first on PATH, `NATIVE_AGENT_PAUSED_SUPPLIER_RULE=completion native_comparison_run_case paused-supplier "$source_dir" "$work/run" "$work/results"`, deadline 120 and grace 5: pass, four completed turns, preserved work and one qualifying integration/filing with passing proof. This is substitute evidence only. |
| Publishing the supplier before turn 1 leaves the consumer's real task intact | Source the same runner/case; `case_materialize "$root" "$source_dir" codex`; `case_apply_event "$root" nonqualifying "$controller"`; `case_apply_event "$root" qualifying "$controller"`. Remote contained the completed supplier/done record; consumer reader remained absent, partial files present and integration/filing counts zero. One existing substitute turn plus `case_observe` produced preserved work, completed reader, one integration/filing, both proofs passed and unchanged remote. Substitute dependency stayed `waiting`: it does not qualify the new native behavior. Slice 3 corrects stale setup narration; Slice 4 observes real judgment. |
| Usage with coordinator/worker attribution is available historically | Replayed tracked `20261114T102744-1921-usage.jsonl.gz` by own `(threadId,responseId)` and root-turn ownership: 174 responses, baseline 80 / 8,386,947 tokens, candidate 94 / 13,434,290 across four native threads each. This agrees with the retained `…-tokens.md` method. It settles available historical counters, not every future runtime wire shape; missing future fields remain unknown. |
| This checkout reaches the native proof route's unpaid prefix | Bash 5 `native_comparison_preflight codex paused-supplier "$PWD" "$scratch"` passed; runtime `/Users/terryyin/.local/bin/codex`, `codex-cli 0.169.0`, jq and Node present. No session started. Authentication, native one-turn unblocked judgment and current usage completeness remain paid/native premises bounded by Slice 4. Recheck conditions there. |
| A single frozen baseline needs implementation | Current single-journey entry uses the working-tree payload; only pairs freeze requested commits. This is observed command selection in `native-comparison.sh`/`native-comparison-pair.sh`, not a claim that standalone frozen capture already works. Slice 1 adds it and proves installed payload content. |

## Verification, sizing and concern review

- Follow [AGENTS.md's failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  as written, including in every delegation brief and repair handoff.
- Test-entry selection on 2026-11-14 resolved MakeMe enabled and page objects
  disabled for the two intended new shell tests and existing pair, refresh,
  incomplete and paused-supplier tests. Follow the installed `dough-makeme`
  convention through the existing comparison fixture/builder boundary; keep
  scenario facts and assertions at the consuming test. Recheck new/changed
  paths before authoring. No browser test is planned. Never sleep, use
  `test.slow()` or add suite/file/group/hook timeout overrides.
- Unit proof starts at the supported maintainer command with real local
  collaborators and only the model host substituted. Native qualification is
  a separate observation, not an inference from substitute success. Existing
  tests preserve unchanged boundaries; new assertions must catch a named
  behavioral regression, not restate settings or fixture construction.
- Focused command as tests are added:
  `PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/tests/native-comparison-baselines.sh Distribution/tests/native-comparison-unblocked-supplier.sh Distribution/tests/native-comparison.sh Distribution/tests/native-comparison-pairs.sh Distribution/tests/native-comparison-refresh.sh Distribution/tests/native-comparison-incomplete.sh Distribution/tests/native-comparison-paused-supplier.sh Distribution/tests/native-comparison-doughnut-title-precedence.sh`.
  Omit not-yet-created tests until their owning slice. Trace shared native
  reader/runner changes through the installed consumer-trace script and run
  affected consumers beyond these cases. Reuse the original kept records and
  `--recover` to verify their immutable recovery after hash-bound edits.
- Run lint/formatting and preview new test-job shares with
  `node scripts/test-shares.mjs preview` at CI's current split count. New jobs
  affect this shared CI allocation; that justifies the preview, not a routine
  full-suite local run. Apply independent refactoring, commit/delivery and
  asynchronous CI repair through Execute Plan when execution is authorized.
- Local gate: focused checks above; no full-suite run is prescribed. Any long
  or full local run uses the maintained
  [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  on AC power use `caffeinate -s -i`; on battery plug in, or start fully awake
  with lid open under `caffeinate -i` and inspect the sleep log afterwards.
  Apply the same resource-admission guidance to expensive/native proof.
- Expected code edits are currently below 250 lines: entry 182, pair 200,
  retention 95, observer 90, basis 184, verdict 203, session extractor 128,
  shared Codex stream decoder 113, paused-supplier fixture 229. Keep new
  archive durability separate from pair orchestration and share fixture
  knowledge at its cohesive setup/observation seams. Recheck current sizes
  before editing and settle a cohesive reorganization before any changed
  checked file would exceed 250; no mechanical line split or size exception.
- Four Behavior slices each own one outcome/proof loop. The acquisition slice
  uses one sufficient-evidence rule for saved and fresh sources. The case
  changes initial supplier availability, not the execution task or outcome;
  separate assessment follows that real condition difference. No preparatory
  Structure or future-host/event-delivery framework is needed.
- Slice-plan refinement was not needed: the cumulative design has one archive,
  one applicability rule and the existing comparison judge, with bounded
  case/native proof. No remaining slice-specific concern was identified.
  Paid-only premises remain bounded by Slice 4 with failure stopping its
  dependent qualification/claims; no unresolved human scope decision remains.
