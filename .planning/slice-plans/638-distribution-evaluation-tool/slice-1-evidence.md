# Reader relocation proof

Slice 1; base `cc8ce00967a8a0b9c1668619d47d1917d07ece02`.
Six shared reader/session modules moved to evaluation/src; no family, remaining
runtime, scheduler, Intent or payload change. Runtime bodies compare equal to
base after replacing documented old paths; sibling imports keep the same graph.
Test-only inputs, substitutes and canonical MakeMe builders remain in tests.

## Commands and observations

All shell proof uses `PATH=/opt/homebrew/bin:$PATH`, two runner jobs and
`caffeinate -s -i`; four total jobs briefly across the two independent gates.
Shared Mac was awake on AC, natural load 6.56, initial memory 56% free; no other
owned heavy proof. Reconsider on contention/failure. No real or paid host ran.

1. Terminal pass:
```sh
OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- Distribution/tests/native-harness/native-stream-replay.sh Distribution/tests/native-harness/native-stream-completeness.sh Distribution/tests/native-harness/native-evidence-identity.sh Distribution/tests/support/native-host-stream.test.mjs Distribution/tests/support/native-codex-session.test.mjs Distribution/tests/support/native-codex-owned-proof.test.mjs Distribution/tests/support/native-codex-wait-receipts.test.mjs Distribution/tests/support/native-comparison-archive-usage.test.mjs Distribution/tests/support/native-admission-reuse.test.mjs Distribution/tests/support/browser-group-shards.test.mjs
```
Replay reads every retained corpus stream through the real reader and publication
field/assessor functions, checks reviewed expectations and hidden-event variants.
Completeness drives context wrappers with controlled truncated/missing streams,
observing retained nonpass outcomes. Host-stream assertions observe commands,
outputs, tools, thread identity and terminal status from captured native streams.
Session fixtures write actual Codex rollout wire shapes; assertions observe
settings, worker lineage and missing-thread refusal. Owned-proof/wait-receipt
cases assert current ownership, completed/failed/unknown terminal proof.
Identity materializes real fixture sources and mutates inputs to check hashes
and imported closure. Admission reuse exercises real Git snapshots, identity
comparison, evidence preservation and refusal; source enumeration now includes
evaluation/src and filters absent tracked paths, closing G6. Browser-group
shard assertions enumerate actual specs, each exactly once plus new-spec preview,
closing G3. Setup supplies corpus/wire/start state, never the asserted verdict.

2. Direct consumer gate reached terminal pass:
```sh
OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- Distribution/tests/adr-awareness/dough-adr-awareness-codex-use.sh Distribution/tests/delivery-evidence/delivery-evidence-amended.sh Distribution/tests/delivery-evidence/native-delivery-updated-use.sh Distribution/tests/delivery-evidence/native-delivery-updated-use-adapters.sh Distribution/tests/installation/dough-update-local-guidance-rejection.sh Distribution/tests/makeme/makeme-native-use.sh Distribution/tests/native-harness/native-result-retention.sh Distribution/tests/support/git-publication-native-stream-fields.test.mjs Distribution/tests/support/makeme-native-harness.test.mjs Distribution/tests/support/makeme-native-refactor-harness.test.mjs Distribution/tests/git-publication/execution-worktree-preparation-native.sh Distribution/tests/product-backlog/product-backlog-native-take-fixture.sh Distribution/tests/product-backlog/product-backlog-native.sh Distribution/tests/native-comparison/native-comparison-pairs.sh Distribution/tests/native-comparison/native-comparison-baselines.sh Distribution/tests/native-comparison/native-comparison-incomplete.sh
```
Actual existing entries/assessors use the moved reader through rewired shell/ESM
sources. Routine native wrappers keep controlled-host setup and original outcome
assertions; retention checks immutable records and cleanup. Publication fields,
MakeMe and preparation assessors observe real reader-derived state. Comparison
fixtures copy current runtime and commit it, exercising real pair verdicts,
archive reassessment and incomplete-run refusal. No fixture supplies its verdict.

3. Terminal pass after dynamic-consumer repairs:
```sh
OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- Distribution/tests/native-comparison/native-comparison-baseline-readers.sh Distribution/tests/native-comparison/native-comparison-supplier-watch.sh
```
Baseline-readers mutates each relocated reader in a copied committed source and
asserts two fresh arms, fresh acquisition and unchanged prior archive bytes.
Supplier-watch exercises the saved-session lookup from its case directory.

4. Terminal pass after normalizing sibling imports in moved modules:
```sh
OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i npm test -- Distribution/tests/support/native-host-stream.test.mjs Distribution/tests/native-harness/native-stream-replay.sh
```
Same reader graph/body and expectations; direct imports and corpus replay pass.
`npm run typecheck:dashboard` also reached terminal 0 after fixture import rewiring.

## Consumer trace

Installed trace command reached terminal 0:
```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout . --base cc8ce00967a8a0b9c1668619d47d1917d07ece02 --term Distribution/tests/support/native-host-stream.mjs --term Distribution/tests/support/native-host-stream.sh --term Distribution/tests/support/native-codex-session.mjs
```
Raw `/tmp/seed371-reader-consumers-final.md`; every located row disposed in
`/tmp/seed371-reader-consumers-disposed.md`. It found dynamic baseline mutation
and supplier-watch lookups, both repaired and proved above. Current reader guides
are updated. Other matches are retained history or unchanged API/field names
derived from entire relocated bodies; no host event, field, message, condition,
assessor verdict or API changed. Old paths inside captures/archives/bases remain
byte-for-byte. Direct/transitive shell sources, copied source roots and identity
inputs now resolve the same modules at their new location.

Test selection is `/tmp/seed371-reader-test-selection.json`; selected checks
apply MakeMe, none page objects. No missing proof is silently deferred to CI.
The separately recorded G4/G5/G7 remain owned by slice 3, where remaining shell
runtime moves; they are not introduced or waived at this reader-only boundary.
