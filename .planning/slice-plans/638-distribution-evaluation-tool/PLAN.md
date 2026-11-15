# Maintain native evaluations as a Distribution tool

**Source:** [selected story](../../seeds/SEED-371-distribution-evaluation-tool.md#run-and-maintain-native-evaluations-as-a-distinct-distribution-tool)
**Source review:** [independent commitments](source-review.md)
**Identity:** SEED-371#run-and-maintain-native-evaluations-as-a-distinct-distribution-tool

## Goal and scope

A maintainer finds and runs native acceptance and A/B evaluation tooling from
`Distribution/evaluation/`, and checks that tool independently with
`npm run test:evaluation`. Ordinary CI still proves both test sets under
Distribution Tests. Preserve the existing explicit native options, supported
hosts, isolation, outcomes, retention, replay and historical evidence.

The seed owns the six key examples. No new host, qualification, experiment,
performance claim, release, client-payload change or separate Intent entry is
included. No paid session is required or authorized by this preparation.
The queued [comparison corrections](../621-close-native-comparison-harness-gaps/PLAN.md)
keep their behavior and proof; this story only aligns their location references.

## Existing solution and direction

PFE: reuse the native families documented in
[`native-family-layers.md`](../../../Distribution/tests/native-harness/native-family-layers.md),
the one host-stream reader and replay corpus, supervision, identity and result
retention helpers, and the existing comparison entry, catalog, pair runner,
baseline archive and recovery implementation. Move their responsibilities;
add no parallel runner, host reader, case registry or scheduler.

Keep common execution, host adapters, observation, retention and comparison
orchestration in `evaluation/src/`. Keep reusable family scenarios, fixtures
and assessors in `evaluation/cases/`, with comparison cases together under
`cases/comparison/`. Test-only substitutes, counterexamples and replay inputs
belong with automated checks in `evaluation/tests/`. Classify by responsibility
and actual imports, not by a filename containing `native`. Shared repository,
installation and MakeMe builders remain one canonical implementation; reuse
their actual import closure rather than copying them into the tool.

[`scripts/test.sh`](../../../scripts/test.sh) remains the one scheduler.
Its named-path selection, alternate test root, reports, admission and split
allocator already serve the focused command. Extend default discovery to the
union of guidance and evaluation checks, with one deduplication/deal and the
existing Distribution CI producer and proof-fragment format.

[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) names the
evaluation home and shared group after Terry's 2026-11-15 approval.
[ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
keeps maintenance outside the declared payload.
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) keeps
deterministic checks distinct from native acceptance and paid comparisons.
No North Star topic is needed: the agreed layout and existing owners suffice.

## Proof ownership

| Final promise / key example | Owner and observable proof |
| --- | --- |
| Existing acceptance cases run from the tool home; example 3 | 4: migrated entry and real setup/observer/assessor/retention exercised with controlled hosts; replay, isolation, timeout and failure checks retain their verdicts. |
| Same comparison selection, outcomes and limits; example 4 | 5: catalog filters, substitute pairs, refusal and incomplete-run checks through the new comparison entry. |
| Earlier evidence remains recoverable; example 5 | 5: both original `20261114T045440-*.txt` records recover basis `9c20a8086fe48e2bd60f283f478607440a057216`; recovery prints original bytes. Frozen-baseline checks reassess after raw cleanup without changing archive integrity. |
| Focused checks and explicit native invocation; examples 1, 3 | 6: focused command runs only evaluation checks; disabled assessor fails it; a real-host launch tripwire is untouched. Controlled host substitutes stay allowed. |
| Combined Intent/CI proof, once per check; example 2 | 6: combined discovery equals the union of both roots across all shares; actual shell/file and Node-case outcomes from both roots reach the single Distribution proof summary. |
| Installed guidance and unrelated content unchanged; example 6 | 1–6: declared-payload enumeration and installed-byte checks remain green, including install-omits-internal and payload-declaration-links; final diff contains no installed-guidance or payload-declaration changes. |
| Callers, discovery and maintained instructions use the new home | Each moving slice: consumer trace and relevant consumers; 6: README commands and final stale-live-path search. Historical evidence keeps its paths. |

## Preparation evidence

[Original decisive premises, commands and observations](preparation-evidence.md)
remain applicable except for the sizing assumption corrected below.

## Ordered slices

### 1. Relocate the shared host-stream reader
Type: Structure
Status: planned
Proof: real retained-stream replay, Codex/session/ownership tests, input identity
and snapshot consumers through unchanged existing entries.

Move only `native-host-stream*.mjs`, `native-host-stream.sh` and
`native-codex-session.mjs` to `evaluation/src/`; keep shared shell host launch,
supervision, retention, observation and import-closure helpers in support until slice 3.
Rewire direct/transitive imports and identity input lists, guard ownership and
fixture snapshots. Exclude test-only substitutes/materializers/inventories.
Resolve deleted tracked snapshot entries now. This enables slice 2's ADR entry.
Reuse compatible reader repairs from attempt 2; preserve captured stream bytes.

### 2. Invoke ADR acceptance from the evaluation home
Type: Behavior
Status: planned
Proof: existing ADR context/use/delivery and installed-use adapters through
controlled hosts, replay/identity and payload checks.

Existing ADR case/host options → `evaluation/cases/adr-awareness/` entry → same
isolated setup, assessment, retention and cleanup. Move only the ADR family
and scenarios/assessors, separate routine test branches, keep all other families
at current paths. Reuse the reader and remaining support helpers. Add README
layout and ADR commands; ordinary tests stay at old locations until slice 6.

### 3. Relocate remaining shared native execution
Type: Structure
Status: planned
Proof: supervision/failure/timeout/isolation, retention, identity, comparison
snapshots, publication shim discovery and stable one-shot checks.

Move the remaining actual shared runtime modules to `evaluation/src/` using
attempt 2's classified map and compatible repairs, preserving slice1's reader.
Keep native identity source/inventory/supervision test inputs in support.
Update module-relative shell sources, copied-source fixture roots, import closure,
identity lists and executable-owner shim discovery. Diagnose and repair the
one-shot safety-deadline defect without relaxing timeout or dropping proof.
This immediately enables slice 4's remaining families from their final home.

### 4. Invoke remaining acceptance families from their home
Type: Behavior
Status: planned
Proof: all moved-family substitutes, rejection/replay, identity/lifecycle,
updated-use adapters, typecheck and declared-payload checks.

Existing case and host options → documented evaluation entry → same isolated
setup/observation/assessment/retention/cleanup. Move remaining reusable families
to `evaluation/cases/` using attempt 1's compatible edits, preserving ADR and
shared-runtime repairs. Separate automated branches; checks stay old until slice 6.
Update shell/generated sources, fixture closures, identities and guards together.
Keep comparison orchestration temporarily old. Complete acceptance commands.
Split oversized `native-publication.md`: acceptance-running guide under evaluation
and linked proof-scheduling scenarios/evidence in tests; both <=250 lines.

### 5. Run comparisons and recover earlier evidence
Type: Behavior
Status: planned
Proof: all credential-free comparison checks, both original recovered records
and byte comparisons of moved tracked records/archives.

Existing comparison selection/record → new comparison entry → same selection,
quality-first outcomes/limits, or original basis/record with no native launch.
Move orchestration to src and cases to cases/comparison; checks stay until slice 6.
Update snapshots, Git-basis enumeration and current-assessor lookup together.
Never rewrite task/basis inputs, archives, streams, hashes or historical paths.
Recover both `20261114T045440-*` records and reassess archives after raw cleanup
without modifying integrity or claiming applicability. Update live guides/findings
commands, retaining historical links. Align plan 621 paths only; move its dated
provenance/findings/PFE into a linked non-executable evidence reference so both
files stay <=250 lines. No queued correction behavior is implemented.

### 6. Check the tool independently and retain combined CI proof
Type: Behavior
Status: planned
Proof: focused command and broken-assessor/runner failure, native-host tripwire,
combined discovery/splits, mixed-root CI proof, Intent selection and final suite.

`npm run test:evaluation` → only tool checks; ordinary CI → guidance and tool
checks once under Distribution Tests. Move tool checks/test-only support to
feature groups in evaluation/tests; retain guidance checks in tests. Use one
scheduler: alternate root for focused checks and one union/deal for default CI.
Preserve named selection, substitute roots, admission, deadlines, silence,
reports and duration values. Extend Node manifests, exclusions and Distribution
Intent sources to executable checks only. Exercise shell/Node outcomes through
real CI fragments/summary including failures. Complete README prerequisites,
commands/evidence limits and live navigation. Run final suite and 3-share preview.

## Execution gates and current decisions

- Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written, including local/CI differences and failures predating this work.
- Apply AGENTS.md's test conventions and timeout rules. Use controlled hosts
  only at the external boundary; exercise real setup, Git, readers, assessors,
  retention, discovery and proof reporting. No browser behavior changes.
- Generate the installed consumer trace from each actual movement diff,
  including indirect shell sources, generated fixture scripts, import closure,
  corpus guards, hash inputs and historical recovery. Dispose of every listed
  consumer through proof or an evidenced exclusion. Follow transitive callers
  regardless of whether their filenames contain `native`.
- Local gate: focused affected checks per slice; final `npm test` is warranted
  by the cross-family runtime, fixture and discovery migration. Run the CI
  share preview at the current split count (currently 3), preserving existing
  duration values under renamed labels. Run required lint/hooks; if moved
  JavaScript fixtures reach dashboard TypeScript consumers, run
  `npm run typecheck:dashboard` and affected consumers. Keep normal post-change
  refactoring and delivery gates.
- Every long local gate follows the maintained
  [macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
  fully awake on AC, `caffeinate -s -i`; on battery plug in, or keep the lid
  open under `caffeinate -i` and inspect sleep logs afterwards. Respect shared
  full-suite admission; choose concurrency from current host headroom.
- Recheck trunk/overlap. Preserve silent supplier wait `ef93db6c` and findings;
  no harness change there. Plan 621 remains separate, location-only alignment.
  Shared filenames alone need no blocking supplier agreement.
- Each slice has one capability/proof loop and 15 active minutes excluding
  commands. Use existing seams; broader redesign triggers reassessment,
  never silently absorb the separate harness corrections.
- Cumulative design: one execution/observation/assessment implementation serves
  both acceptance and comparison; one scheduler serves focused and combined
  checks. Interim acceptance/comparison checks stay at their old test locations
  until slice 6, with imports updated in each moving slice; slice 6 removes
  that temporary layout. Every delivered boundary must pass CI.
- First attempt overran; [attempt and sizing evidence](attempt-1.md) preserves
  elapsed time, proof, failures and parked changes. Refined to four bounded
  slices initially; the second overrun triggered [story-boundary reassessment](attempt-2.md).
  Continue six bounded slices with unchanged scope and two immediate
  Structure/Behavior pairs; no delivered product outcome is discarded.

## Learnings

Physical-directory closure crosses independent proof loops; isolate reader, runtime and family movement, reusing compatible parked repairs.

## Execution context

Story Branch Mode in the launch's owned workspace/branch, agent Kirara-chan, publisher `dashboard-territory.local-open-dough`; origin/main, increments to `codex/run-and-maintain-native-evaluations-as-a-distinc`.
Starting revision `c124365d015aec64b5186160980db9205b11955a`; claim `deba676495b2eb1b8c1f3d3f96b7a44cb1122eb4`; records published at `a0ff105737b7cc71726f92715e907b779e8a230b`. Preserve existing planning authority (no explicit replan option).
Exact-checkout npm ci/typecheck passed with unchanged lock. Observer `kirara-638`, cell `g390:9`, session 35882, PID 75649, `/tmp/dough-ci-501/watch-NjF7jy`, `terryyin/open-dough`, execution branch, verified `ci.yml` (CI); claim trunk CI unobserved.
Shared Mac AC, initially 56% free/load 11.33; two jobs under `caffeinate -s -i`; reconsider contention/failure. Source freshness unchanged at trunk `3925a4ef8ca8cf4f0bf6f03b201a78c24d2ec0e8`, only incoming planning/agent records.

## Story obligations

### G1. Admission fixture path after relocation
Reported: slice 1 — "admission reuse fixture copies the old background CI native probe path"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: receiving slice 4

### G2. Counterexample assessor paths after relocation
Reported: slice 1 — "owned-context and one-shot counterexamples resolve assessors beside old support"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: receiving slice 4

### G3. Browser selection after relocation
Reported: slice 1 — "browser-group-shards reports zero selected actual specs for every browser group"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: return

### G4. Standalone comparison sourcing after relocation
Reported: slice 1 — "native-codex-owned-proof passes but prints missing paths because standalone comparison sourcing has no source_dir"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: receiving slice 3

### G5. Executable shim owners
Reported: slice 1 — "publication fixture shim discovery scans only old support, missing moved executable owners"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: receiving slice 3

### G6. Deleted tracked snapshot inputs
Reported: slice 1 — "admission snapshot enumeration attempts deleted old runtime paths"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: return

### G7. One-shot safety deadline
Reported: slice 1 — "one-shot aggregate hit the existing 180-second safety deadline during the broad selected gate"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: receiving slice 3
