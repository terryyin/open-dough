# Remove redundant evaluation checks without losing observations

**Identity:** SEED-396#remove-redundant-evaluation-checks
**Source:** [Evaluation checks that restate data or enter below the family entry are removed](../../seeds/SEED-396-evaluation-javascript-tests.md#remove-redundant-evaluation-checks)

## Goal and scope

A maintainer maintains fewer redundant assertions with the same controlled
behavioral protection. Remove copied catalog/configuration expectations and
identical observations, using the real command for catalog behavior. Preserve
all distinct checks. A smaller assertion body is the gain; neither fewer
scheduled jobs nor faster CI is promised.

Included: the five bounded changes below and their proof. The audit changes the
unverified ten-file estimate: no whole file has yet met the removal gate.
Remove a whole file only if its remaining observations are genuinely redundant
under the source's rule; do not force that outcome.

Excluded: runtime and case changes, historical evidence, paid host sessions,
JavaScript migration, new frameworks, CI redistribution, and
`native-comparison-refresh.sh` (owned by [plan 677](../677-recovery-proof-covers-historical-case-paths/PLAN.md)).
The sibling [plan 679](../679-evaluation-checks-state-facts-plainly/PLAN.md)
owns the vocabulary and guideline. Preserve its compatible changes and facts;
this plan requires no new vocabulary or guideline implementation.

## Existing solutions and candidate decisions

PFE: the real `src/native-guidance-check.sh --list/--where` already consumes a
catalog rooted at its own checkout; copy its runtime into a disposable test
root with small owned `case.md` inputs. Reuse `scripts/test.sh`, its discovery,
the existing counterexample helper and corpus replay. No new scheduler,
fixture registry or alternate reader is needed. Repository-wide responsibilities
stay with their existing owners (`Distribution/tests` builders, evaluation
runtime/cases, and check-only support).

[ADR 0005 — Native validation](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
keeps this controlled proof distinct from native acceptance.
[ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
bounds the claim to reduced maintenance with preserved signals.
The existing North Star has no topic governing this local test cleanup; no new
shared responsibility or architecture direction is warranted.

| Candidate | Decision and reason | Owner |
| --- | --- | --- |
| `native-guidance-check.sh` and launch-command test's catalog prelude | Replace shipped names/traits with owned parser input; remove the copied launch-case selection assertion | Slice 1 |
| ADR `native-case-selection.sh` | Prune description/host-count inventories; keep quiet listing, read-only results, prior-evidence and invalid-selection behavior | Slice 2 |
| `delivery-evidence-native-routing.sh` | Prune the all-case and fixed scenario inventories; keep query state-preservation, refusal, dispatch, retention and installed-input behavior | Slice 3 |
| `guidance-native-entries.sh` | Keep: actual CLI dispatch, installed rejection, protected-byte mutation failure; not a copied entry manifest | Unchanged gate |
| `native-evidence-identity.sh` | Keep: listed-input changes affect hashes, additions reach supervised identities, and transitive imports are included; not just path existence | Unchanged gate |
| `native-journey-state.sh` | Remove only the identical `cursor-target` pass. Its observation assessor and failed-update/preservation counterexamples are distinct layer proof | Slice 4 |
| Comparison verdict counterexamples in `native-comparison-pairs.sh` | Keep the assessor contract/rejected cases; ordinary pair runs do not generate every rejection. Basis helper checks in refresh remain plan 677's | Unchanged gate |
| Watchdog cleanup and workspace isolation | Keep: the forced just-forked TERM-handler race and incomplete decode with an absent output parent have no established equivalent entry-level proof. Main workspace-deletion scenario already uses the real command | Unchanged gates |
| `native-stream-replay.sh` versus `native-host-stream.test.mjs` | Remove the repeated weekly-limit loop only; keep full corpus/ingestion/guard proof and JS output pairing, messages, exit codes, reads, tools and thread observations | Slice 5 |
| Four launch-command test files | Keep distinct fixture/backend, assessor, probe/restoration and failing initial E2E observations; only their copied catalog prelude goes | Slice 1 / unchanged gates |
| Four admission / three one-shot wrappers | Keep: scheduler lists each group once and excludes aggregate scripts. Existing source records comparable 201–204 s CI shares; no timing-based reason to fold them | Unchanged discovery |

Keeping a unique regression does not declare a supervisor helper a public
contract or claim its entry migration is complete. Apply the source's safety
gate rather than losing it. Naturally supported cases remain supported.

## Outside-in proof

| Source promise | Owner and observation |
| --- | --- |
| Catalog logic without copied shipped data | Slice 1: real command lists two owned cases, mixed-case conjunctive filters select one, no-match exits nonzero; ignored-filter fault fails |
| Data pruning retains listing safety | Slice 2: real wrappers remain host-free and scratch-free, accept read-only results for listing, reject invalid selection and mark planted evidence unreviewed; certification fault fails |
| Routing and identity behavior survives inventories going away | Slice 3: retained state-preservation and actual unknown-case refusal plus existing dispatch/artifact/input assertions; unchanged entry and identity checks in final evaluation suite |
| Identical scenario disappears, assessor protection stays | Slice 4: same `write_obs` input is assessed once; all distinct passing/conflict and rejected observations remain |
| Replay keeps status and zero-command protection | Slice 5: core corpus replay fails, naming each weekly-limit entry, under wrong terminal classification or an invented command; restored reader passes |
| Unique lower-level, launch and reader protections remain | No removal or weakening of the named retained gates; final evaluation suite includes them, with scheduler listing confirming no duplicate aggregate jobs |

## Decisive premises

All observations were in this owned workspace at `d42e1bbdd`, 2026-11-17,
with Bash 5 first on PATH. Scratch changes were reverted before record writes.

| Premise / consuming operation | Literal observation, form and profile | Result and limits |
| --- | --- | --- |
| Owned catalog reaches the real command (slice 1) | Copy `Distribution/evaluation/src` into an isolated checkout-shaped root; link unchanged `scripts`, `Distribution/tests`, and non-guidance case families for source-time dependencies; create alpha/beta `case.md` Selection sections. Run `bash <root>/Distribution/evaluation/src/native-guidance-check.sh --list`, then `--list --where hosts=CODEX --where workflow=BLOCK`, then `--list --where workflow=absent` | Exit 0 with alpha/beta; exit 0 with alpha; exit 1 with no cases. Initial incomplete roots exposed source-time dependencies; final root loads them all. Linked code is unchanged; catalog input is wholly owned, and listing invokes no linked native journey |
| Catalog proof discriminates filtering (slice 1) | In that isolated runtime, replace `[[ ${value,,} == *"${text,,}"* ]] || continue 2` with a no-op and repeat the combined-filter command | Fault returns alpha/beta instead of alpha; restoration returns alpha. No paid host or real catalog edit |
| Pruning preserves current consumers (slices 2–5) | `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=2 caffeinate -s -i bash scripts/test.sh` with `native-case-selection.sh`, `delivery-evidence-native-routing.sh`, `native-journey-state.sh`, `native-stream-replay.sh`, and `native-assessor-counterexample-guard.sh` at their evaluation paths, after scratch-pruning the named blocks | Exit 0. Final routing prune is narrower: retain one existing known-case query and its state-preservation assertions; the scratch also removed these, so it establishes no replacement for them |
| Listing still rejects certification after inventory pruning (slice 2) | Same pruned `native-case-selection.sh` through `bash scripts/test.sh Distribution/evaluation/tests/adr-awareness/native-case-selection.sh`; scratch-change producer's `prior-evidence: unreviewed %s` to `prior-evidence: certified %s` | Exit 1. Restored producer and test bytes afterwards; baseline focused run passed |
| Core replay owns the repeated loop's behavior (slice 5) | `caffeinate -s -i node Distribution/evaluation/tests/native-harness/support/native-stream-replay.mjs`, first changing reader's complete status to truncated, then separately appending a command only for an empty Claude command list | Each fault exits 1 and names both `20260923T044643-3342` and `20260923T062305-679c` with wrong status or `read 1 started commands, expected 0`; restored replay exits 0 |
| Other suspected duplicates have independent observations (retention decisions) | Read the actual setup/assertions of JS stream, four launch-command, identity, comparison, watchdog, workspace and journey checks. Run seven named checks through `scripts/test.sh`: catalog, journey-state, watchdog-cleanup, workspace-isolation, JS host-stream, ADR selection and delivery routing | Exit 0. This is a baseline, not evidence that another test can replace a retained check; no such equivalence is claimed |
| Wrappers do not duplicate jobs (unchanged scheduling) | `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_DIR=Distribution/evaluation/tests bash scripts/test-jobs.sh` | 74 jobs: 58 shell, 16 node. Seven wrappers appear; admission/one-shot aggregates do not. No CI runtime projection |

## Slices

### 1. Catalog expectations belong to the check's own input
Type: Behavior
Status: planned

Behavior: two owned case descriptions share a host and differ by workflow →
the real command lists both, intersects mixed-case filters correctly and fails
on no matches. Shipped catalog names/traits are absent from expected answers.
Replace `native-guidance-check.sh`'s current inventory and remove the copied
catalog-selection prelude in `native-guidance-check-launch-command-tests.sh`;
keep the latter's fixture/backend and change-retention observations.

Proof: run both named checks through `bash scripts/test.sh`. Repeat the
ignored-filter fault against the new owned catalog check: red under the
fault, green restored. Raw case.md bytes are the input under test, not copied shipped configuration.
Keep the CLI's actual source-time dependencies in the isolated test root, as
observed above.

### 2. Case listing tests behavior without repeating its inventory
Type: Behavior
Status: planned

Behavior: list each existing wrapper, including read-only results, then plant
an apparent passing record and list again → no host or scratch writes,
usage remains visible, planted evidence is unreviewed and the untouched case
has none. Invalid selections still fail before launch. Remove copied purpose,
setup/dependency prose, per-host inventory counts and repeated case records.

Proof: named `native-case-selection.sh`, its real `native-case-assert.sh`
observations, and the certification fault before/after pruning. Do not replace
inventories with a production-derived expected inventory or remove the
invalid-option/no-launch checks as mere configuration.

### 3. Routing proof keeps effects rather than a second case registry
Type: Behavior
Status: planned

Behavior: a known delivery case query leaves an already selected scenario and
pass basis intact, and an unknown case is refused by the real publication
entry. Existing retained artifact shapes, installed-input capture, amended
retention, host dispatch and unknown identity observations remain. Remove the
loop enumerating all registered cases and the two fixed drift scenario checks;
keep one already-covered known-case query to drive state-preservation assertions.

Proof: named `delivery-evidence-native-routing.sh`. Confirm the check no longer
enumerates the registered case names; the retained query-state and artifact
assertions are unchanged. No private call disappears on an unproved claim of
entry equivalence; move one only with a discriminating replacement in this
same slice, otherwise keep it.

### 4. Journey assessment runs the unchanged scenario once
Type: Behavior
Status: planned

Behavior: the same observation file content enters `native_journey_state_assess`
once for the ordinary success → it passes. Remove `cursor-target.txt` and its
second identical pass; keep the conflict success, failed update despite a valid
conflict, and all version/target/protected-write rejected cases.

Proof: named `native-journey-state.sh` and counterexample guard. Compare the
deleted `write_obs` call with the surviving one to confirm there is no target
or host variation. Do not delete this assessor check or the comparison verdict
counterexamples on the mistaken premise that every `src/` function is private.

### 5. Corpus replay owns the repeated weekly-limit observations
Type: Behavior
Status: planned

Behavior: the maintained replay runs each reviewed stream once, including the
two empty weekly-limit streams → wrong completion or command count fails with
the entry named. Remove their separate shell loop and fixture-specific weekly
limit wording check. Keep ingestion/refusal, counterexample, guard, corpus and
all distinct JavaScript reader observations.

Proof: named `native-stream-replay.sh` and `native-host-stream.test.mjs`.
Repeat both recorded faults against core replay with the loop gone, then
restore and pass. Retain the corpus expectations byte-for-byte.

## Current decisions and verification

- Each slice has one bounded proof loop and a 15-active-minute budget. The
  common rule removes copied data or repeated observations; it does not
  recognize more catalog cases or add a framework. Expected edited check
  files are 25–242 lines today; none requires oversized-file reorganization.
- Before authoring tests, rerun the installed test-entry selector for exact
  paths, including new ones. All seven named check paths were selected during
  preparation:
  `makeMe: true`, `pageObjects: false`; apply MakeMe. Use canonical builders
  for domain setup, explicit raw parser/stream input for the bytes under test,
  and existing harness owners for temporary resources. Recheck selection if
  paths change; changing browser specs is not planned.
- Trace removed files/symbols/literals and actual observers through the
  installed consumer-trace procedure when implementation has a diff. Preserve
  the runner, counterexample and stream guards' requirements; run affected
  consumers, rather than weakening their assertions to achieve removals.
- Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written. Local gate: each slice's named checks plus the counterexample
  guard through `bash scripts/test.sh`; keep default timeouts and never use
  `test.slow()`. Final local gate: `npm run test:evaluation` once, covering the
  retained proof owners across the pruned families and the shared guards.
- Run long local proof fully awake under the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  `caffeinate -s -i` on AC. Use shared suite admission and inspect current host
  headroom before the final run. Preparation used two focused jobs at natural
  load 28.88/23.11/20.04 on AC, with another worktree's lint active; no broad
  suite was launched. Reconsider concurrency at execution, preserving coverage.
- Execute through the project's independent refactoring, delivery and CI gates;
  planning supplies no execution authority. At completion report the actual
  removed assertions/scenarios and retained owners; make no fixed file-count,
  elapsed-time or native-host claim.

## Preparation review

Slice-plan refinement was not needed: five bounded slices with separate proof
loops, no speculative structure and no remaining slice-specific concern found.
The private-entry and CI-wrapper candidates have settled keep decisions, not
unproved equivalence assumptions. No coordinator decision is outstanding.
