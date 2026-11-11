# Run MakeMe harness checks once by default

**Identity:** SEED-307#run-makeme-harness-once
**Source:** [Minimal correction story](../../seeds/SEED-307-shared-test-pattern-rules.md#run-makeme-harness-once)

## Goal and scope

Keep all seven MakeMe assessment controls while removing their second execution
from the default suite. Preserve both direct Node jobs and explicit aggregate
and native invocation. Change default discovery only; no rule/runtime, host,
installation, opt-in, paid proof or unrelated suite cleanup is included.

## Provenance and current finding

The completed [MakeMe execution](https://github.com/terryyin/open-dough/blob/e56729e06262e913110cb98ebc0f9fa579f52a58/.planning/seeds/SEED-307-shared-test-pattern-rules.md#apply-shared-makeme-rules-per-entry)
published `ec131e188ece02d28504c610a2812f0c325798d2`,
`4bb85bbbeb341d41b74c21580089aa6c45fbb7d5`,
`3940c9d798a60bfd047456b31b4243a07730c768` and
`e56729e06262e913110cb98ebc0f9fa579f52a58`; the preceding Take is provenance only.
The wrapper and first harness arrived in the first commit; the second harness
arrived in the fourth. No intervening unrelated branch commits are attributed.

At the reviewed fourth commit, `scripts/test-jobs.sh` discovers the top-level
`tests/makeme-native-use.sh` shell job and both harness files through
`tests/node-test-files`' `tests/support/*.test.mjs` pattern. The wrapper's
zero-argument branch runs those same two files with `node --test`. Different job
labels prevent the scheduler's label deduplication from removing that overlap.
One extra route repeats ordinary fixture/assessment work, the refactor fixture's
real public installation and baseline commit, and child mutation tests.
No retained timing supports a seconds-saving claim; the evidenced cost is
duplicate executions and setup, not a measured speedup.

## Decisions and preserved proof

- Reuse the existing aggregate-exclusion responsibility in `scripts/test-jobs.sh`
  and its actual full/split/explicit-discovery assertions in
  `tests/test-runner-selection.sh`. The one-shot native aggregate already uses
  this seam. No new registry or discovery mechanism is needed.
- The surviving directly scheduled harness files own the same four ordinary
  and three refactor controls: baseline rejection, actual guidance/selection,
  mutation discrimination, convention-read count and owned Codex expansion.
  Keep their assertions intact and keep the explicit wrapper available.
- Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  supports one representation of test work. [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  supports deterministic controls once without redundant native matrices.
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  bounds the gain to equivalent protection with one less aggregate route and
  no new machinery. Current North Star topics add no runner direction.
- Expected edits are `scripts/test-jobs.sh` (130 lines) and the maintained
  runner selection test (120 lines); both are below 250. Keep all edited files
  below that limit. No cohesive reorganization is currently required.

## Decisive premises

| Premise and consuming observation | Result and remainder |
| --- | --- |
| Default discovery at the fourth commit: retained `env PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_DIR=tests bash scripts/test-jobs.sh` terminal-zero NUL inventory, `/tmp/seed307-slice4-default-jobs.nul`; inspect the wrapper and both Node labels | Each route is scheduled once among 609 jobs. The wrapper's unchanged zero-argument command names both directly scheduled files; label dedup cannot combine their work. No premise about elapsed saving is asserted. |
| Explicit wrapper reaches the same controls: accepted `env PATH=/opt/homebrew/bin:$PATH npm test -- tests/makeme-native-use.sh` at the fourth commit, followed by independent refactor renewal | All seven controls pass. Direct Node discovery runs those exact files; no distinct wrapper-only behavioral assertion is lost. Reuse is valid while those controls and wrapper remain unchanged. |
| Existing selection proof can observe aggregate routing | `tests/test-runner-selection.sh` drives actual full, three-share and explicit `scripts/test-jobs.sh` listings and checks aggregate exclusion/group membership. Extend that public assertion for MakeMe; no claim that its present one-shot-only assertions already detect this defect. |

## Ordered slices

### 1. Discover MakeMe harness controls once without losing explicit use
Type: Behavior
Status: planned
Proof: Extend the existing public runner selection check so full default
discovery and the union of its three shares contain each of the two MakeMe Node
harness files exactly once and omit the aggregate wrapper. Explicitly naming
that wrapper must still produce exactly its one shell job. First observe the
new aggregate-absence assertion fail on the current inventory, then correct
default discovery and run
`env PATH=/opt/homebrew/bin:$PATH npm test -- tests/test-runner-selection.sh tests/test-runner-split.sh`.

Behavior: Default suite discovery currently produces the wrapper and both Node
jobs → select the direct harness jobs as the only default route → all seven
controls remain covered once, including across CI shares. Explicit aggregate
and native entrypoints keep their current behavior. Reuse accepted harness
proof if its code and invocation remain unchanged; rerun affected cheap controls
only if implementation changes those boundaries. No paid native run is needed.

## Verification and delivery gates

Follow [AGENTS.md — Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests)
as written, including repair ownership for local/CI and pre-existing failures.
Use shared MakeMe domain setup, with runner actions and independent expectations
outside builders. No wall-clock sleeps, `test.slow()` or suite/hook timeouts.
Run the maintained wrapper, `git diff --check`, independent post-change refactor,
selective formatting and normal agent-commit/publication/CI completion gates.
For long macOS verification, use the maintained
[machine sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC run under `caffeinate -s -i`; on battery plug in or use
the documented open-lid condition. Inspect load and memory before expensive work.

## Plan concern assessment

Refinement was not needed: one bounded discovery outcome uses one existing
aggregate-selection seam and one proof loop. No remaining slice-specific concern
was found. This correction is planned only; it grants no Take or execution.
