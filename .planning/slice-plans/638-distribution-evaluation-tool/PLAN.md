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
| Existing acceptance cases run from the tool home; example 3 | 2: migrated entry and real setup/observer/assessor/retention exercised with controlled hosts; replay, isolation, timeout and failure checks retain their verdicts. |
| Same comparison selection, outcomes and limits; example 4 | 3: catalog filters, substitute pairs, refusal and incomplete-run checks through the new comparison entry. |
| Earlier evidence remains recoverable; example 5 | 3: both original `20261114T045440-*.txt` records recover basis `9c20a8086fe48e2bd60f283f478607440a057216`; recovery prints original bytes. Frozen-baseline checks reassess after raw cleanup without changing archive integrity. |
| Focused checks and explicit native invocation; examples 1, 3 | 4: focused command runs only evaluation checks; disabled assessor fails it; a real-host launch tripwire is untouched. Controlled host substitutes stay allowed. |
| Combined Intent/CI proof, once per check; example 2 | 4: combined discovery equals the union of both roots across all shares; actual shell/file and Node-case outcomes from both roots reach the single Distribution proof summary. |
| Installed guidance and unrelated content unchanged; example 6 | 1–4: declared-payload enumeration and installed-byte checks remain green, including install-omits-internal and payload-declaration-links; final diff contains no installed-guidance or payload-declaration changes. |
| Callers, discovery and maintained instructions use the new home | Each moving slice: consumer trace and relevant consumers; 4: README commands and final stale-live-path search. Historical evidence keeps its paths. |

## Preparation evidence

[Original decisive premises, commands and observations](preparation-evidence.md)
remain applicable except for the sizing assumption corrected below.

## Ordered slices

### 1. Relocate shared native execution and observation
Type: Structure
Status: planned
Proof: replay, stream guards, identity, supervision/failure/timeout/isolation,
retention and affected family consumers through existing entries.

Move only shared native execution, host adapters, stream readers, supervision,
identity and retention into `evaluation/src/`. Keep acceptance family modules
and mixed entries at their existing locations for this boundary; rewire their
shared-helper imports. Keep test substitutes and canonical MakeMe/repository
builders in tests. Update guards, fixture snapshots, import closure and identity
lists for the moved shared modules. Preserve explicit options and all outcomes.
This immediately enables slice 2 to invoke acceptance families from their home.
Reuse the parked attempt's settled path repairs where they match this boundary;
prove any newly changed import/fixture boundary and resolve every reached consumer.

### 2. Run acceptance cases from the evaluation home
Type: Behavior
Status: planned
Proof: native-family controlled-host journeys, replay and lifecycle checks
through moved cases; payload checks and dashboard typecheck where imported.

Existing case and host options → documented evaluation entry → the same isolated
setup, observation, assessment, retention and terminal cleanup. Move reusable
acceptance families/scenarios/assessors into `evaluation/cases/`; separate routine
automated branches from explicit native entries. Keep ordinary checks at old
paths until slice 4. Reuse shared runtime from slice 1, including comparison
callers temporarily remaining at their old home. Preserve retained streams.
Update transitive shell sources, generated fixture scripts, copied import closure,
identity lists, shim discovery and guards together. Add README acceptance commands.
Split oversized `native-publication.md` by its cohesive seam: acceptance-running
guidance under evaluation, proof-scheduling scenarios/evidence in its linked
maintained topic; both under 250 lines. The parked attempt contains these edits.

### 3. Run comparisons and recover their earlier evidence
Type: Behavior
Status: planned
Proof: every credential-free comparison check; both original recovered records;
byte comparisons for moved tracked records and immutable archives.

Existing comparison selection or retained record → new comparison entry → same
selection and quality-first outcome, or original recovered basis/record with no
native launch. Move orchestration to `src/`, cases to `cases/comparison/`, checks
remain until slice 4. Update snapshot inputs, Git-basis enumeration and current
assessor lookup together. Never rewrite task/basis inputs, archives, streams,
recorded hashes or historical paths. New runs name new committed bases.
Recover both `20261114T045440-*` records and reassess immutable baselines after raw
cleanup without modifying their integrity or claiming applicability. Update live
guides/findings commands, retaining pinned historical GitHub links. Align plan
621 locations only; move its provenance/findings/PFE/dated premises into a linked
non-executable evidence reference so both files stay under 250 lines.

### 4. Check the tool independently and retain combined CI proof
Type: Behavior
Status: planned
Proof: focused command and broken-assessor/runner failure, real-host tripwire,
combined discovery/splits, mixed-root CI proof, Intent selection and final suite.

`npm run test:evaluation` → only tool checks; ordinary CI → guidance and tool
checks once each under Distribution Tests. Move tool checks/test-only support
into feature groups in `evaluation/tests/`; retain guidance checks in tests.
Use existing scheduler's alternate root for focused command and one discovery
union/deal for ordinary runs. Preserve named selections, substitute roots,
admission, deadlines, silent-pass rules, reports and duration values. Extend
Node manifests, aggregate exclusions and Distribution Intent source patterns
to actual executable checks, never case/runtime scripts. Exercise real shell
and Node outcomes through CI fragments/summary, including failures. Complete
README prerequisites/commands/evidence limits, navigation and maintained callers.
Historical evidence retains its paths. Run final `npm test` and 3-share preview.

## Execution gates and current decisions

- Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written, including local/CI differences and failures predating this work.
- Before editing tests, apply AGENTS.md's MakeMe and applicable page-object
  selection. No browser behavior is changed by the plan. Use controlled hosts
  only at the external host boundary; exercise real setup, Git, readers,
  assessors, retention, discovery and proof reporting. No `test.slow()` or
  suite/file/group/hook timeout override.
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
- Recheck fetched trunk and overlapping work before execution. The silent
  supplier wait landed at `ef93db6c` without evaluation-harness changes;
  retain its installed behavior and findings. Plan 621's correction remains
  separate, with location-only alignment here. No blocking supplier agreement
  is needed merely because paths overlap.
- Each slice is one usable capability and proof loop, sized for 15 active
  minutes excluding commands. Use existing responsibility seams and mechanical
  path rewiring; if actual consumers require broader redesign, stop and resize
  rather than silently absorb the separate harness corrections.
- Cumulative design: one execution/observation/assessment implementation serves
  both acceptance and comparison; one scheduler serves focused and combined
  checks. Interim acceptance/comparison checks stay at their old test locations
  until slice 4, with imports updated in each moving slice; slice 4 removes
  that temporary layout. Every delivered boundary must pass CI.
- First attempt overran; [attempt and sizing evidence](attempt-1.md) preserves
  elapsed time, proof, failures and parked changes. Refined to four bounded
  slices: one shared-runtime Structure immediately before acceptance Behavior,
  followed by comparison and focused/combined checks. No story-scope change.

## Learnings

First attempt: physical-directory closure crossed shared runtime and family
modules. Separate their movement boundaries; reuse compatible parked repairs.

## Execution context

Story Branch Mode; established owned workspace and branch from the launch.
Starting revision `c124365d015aec64b5186160980db9205b11955a`; claim and first
published base `deba676495b2eb1b8c1f3d3f96b7a44cb1122eb4`, publisher
`dashboard-territory.local-open-dough`, agent Kirara-chan. Origin trunk is main;
increments target `codex/run-and-maintain-native-evaluations-as-a-distinc`.
No explicit overrun-replanning option; preserve the existing planning authority.
Checkout-bound `npm ci` and `npm run typecheck:dashboard` passed 2026-11-15.
Observer: coordinator `kirara-638`, cell `g390:9`, session 35882, PID 75649,
directory `/tmp/dough-ci-501/watch-NjF7jy`; GitHub `terryyin/open-dough`,
execution branch above, verified workflow `ci.yml` (CI). Claim trunk CI is unobserved.
Local proof: AC power, 56% free memory, natural load 11.33 on the shared Mac;
use two runner jobs under `caffeinate -s -i`, reconsider on contention/failure.
Fetched trunk adds only Mana-chan's profile; no overlapping behavior changed.

## Story obligations

### G1. Admission fixture path after relocation
Reported: slice 1 — "admission reuse fixture copies the old background CI native probe path"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: receiving slice 2

### G2. Counterexample assessor paths after relocation
Reported: slice 1 — "owned-context and one-shot counterexamples resolve assessors beside old support"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: receiving slice 2

### G3. Browser selection after relocation
Reported: slice 1 — "browser-group-shards reports zero selected actual specs for every browser group"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: return

### G4. Standalone comparison sourcing after relocation
Reported: slice 1 — "native-codex-owned-proof passes but prints missing paths because standalone comparison sourcing has no source_dir"
Story clause: "Update affected callers, discovery, documentation and evidence-recovery paths."
Disposition: return
