---
id: SEED-262
status: active
planted: 2026-11-08
scope: epic
---

# Faster dashboard test feedback

Developers running dashboard checks should get a result sooner while keeping
the integration proof that makes each check worth running. Start with
[`agent-launch-attention.spec.ts`](../../dashboard/tests/sessions/agent-launch-attention.spec.ts).
Both cases passed in 12.02–13.01s wall with two local workers. That profile
separated run startup, shared hooks, and test bodies. Use it to find other
consumers of each cost and prove savings across the affected family.
[Profiling evidence](../TEST-OPTIMIZATION-CANDIDATES.md#card-attention-launch-and-origin-setup)

For each story, compare the same ordinary test selection before and after
under comparable conditions. Include the starting example where it bears the
cost and a second consumer or representative selection. Report elapsed time,
executed cases, and the phase or operation each story changes. Keep the
surviving proof explicit and include its runtime when coverage moves to another
tier. Follow the project's
[test automation rules](../../AGENTS.md#test-automation),
[failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests),
[macOS test gate](../../tests/local-test-resources.md#machine-sleep-on-macos),
and [definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Story decomposition

<a id="guard-native-fixture-identity-inputs"></a>

### Guard native fixture identity inputs against drift

**Identity:** SEED-262#guard-native-fixture-identity-inputs
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/542-guard-native-fixture-identity-inputs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"866b36dd068088b35ba3148aea888c0d998079a0ddeb2840683af145ebe0c6ad","plan":"cc604926bba35b97b323f59048b9147d80e07d6442d2dd6870994354d43c6ea5"}}
```

Correction of SEED-262#migrate-git-publication-native-fixtures
(`f40a29409bd3baf728caf54c50690448a88c6b1c:.planning/seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-git-publication-native-fixtures`).

#### Goal

A maintainer assessing retained Git publication native evidence can rely on
each fixture family's identity to stay complete as installer helpers are
added. Its closure tool treats valid modules as readable instead of failing
them.

#### Scope

- Each fixture family identity covers every installer file the fresh install
  reads, and a check fails when one is missing.
- The import closure keeps generated template text as data and reads valid
  division and regular-expression forms without a spurious failure. Direct
  tests document those forms.
- Plan: [542-guard-native-fixture-identity-inputs](../slice-plans/542-guard-native-fixture-identity-inputs/PLAN.md)

<a id="share-done-catalog-record-reading"></a>

### Read done records for the catalog through one product rule

**Identity:** SEED-262#share-done-catalog-record-reading
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/542-share-done-catalog-record-reading/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"b36c44e0064e5d3634b4374bd22bd82e836ba2626bcc9075b6c0db977faebca6","plan":"3d70f573d0a2802571218b52b086003646a1a1cba612bce9d5a43747cc835178"}}
```

#### Goal

A maintainer changing how the done catalog selects, orders or hashes record
files changes it in one product place, and every test fixture that publishes
a catalog follows. Bounded correction of SEED-262#declare-fake-github-planning-data
(`ca9edef63:.planning/seeds/SEED-262-faster-dashboard-test-feedback.md#declare-fake-github-planning-data`).

#### Scope

- The product's done-record reading for the catalog (record-name filter, name
  order, text and Git blob hash) becomes one pure operation over named record
  bytes; the directory rebuild and the test renderer's catalog both use it.
- Test helpers that compute a Git blob hash for a published file use the
  product's hash instead of a copy.
- No change to catalog bytes, record bytes, served paths or product behavior.

Plan: [542-share-done-catalog-record-reading](../slice-plans/542-share-done-catalog-record-reading/PLAN.md)

<a id="reuse-immutable-git-histories"></a>

### Speed up Git fixture construction behind the builder

**Identity:** SEED-262#reuse-immutable-git-histories
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/535-reuse-story-columns-git-history/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"31827b90916904e7b13e06db6bcbc4f29d09ea9d2390dfc43ee52ae88ea10031","plan":"13209d29934e2ea3ae1e31e2e70711019fcc915381442e0cd0646c8699f791c3"}}
```

#### Goal

Developers running dashboard checks get a result sooner when workers can
reuse equivalent Git history from the same MakeMe setup. The attention journey
and the other consumers of its story-columns history are the first place to
prove the gain. Keep the real Git and dashboard observations each case uses.
[Original profile and migration baseline](../TEST-OPTIMIZATION-CANDIDATES.md#card-attention-launch-and-origin-setup)

#### Scope

- Reuse the common queued, preparing, and taken history of the
  [story-columns fixture](../../dashboard/tests/launchJourney.ts) within one
  dashboard run. Its completion revision can differ by worker. Preserve the
  exact declared bytes, branch and checkout identities, authorship, ancestry,
  and named revision results. Keep reuse and the private copy inside the
  [shared materializer](../../tests/support/repository-fixture.mjs), with each
  returned fixture owning its mutable origin, refs, config, index, and working
  state. The ordinary per-process path covers requests without a suitable
  shared prefix.
- Compare the same attention and second-consumer selections before and after.
  Record cold build, warm reuse, and two-worker elapsed time alongside the
  executed cases and verdicts. Lower construction time must translate to
  faster test feedback on the affected selection. Both workers can still
  wait for one cold build, so count the wait and the copies in that comparison.
- Defer reuse across runs and additional families until these measurements
  justify their cost. The installed StartOrigin fixture already shares its
  default and queued origins through the run owner. Use its existing
  measurements and the readiness family's as comparison context.

#### Key examples

1. Two workers request the same first three revisions and different
   completion timestamps. Each builds its fixture through MakeMe. The common
   history is built once, and each origin answers its own completion record
   with the right ancestry, refs, and file contents.
2. Two requests materialize from the same prefix. One advances its branch,
   changes its local config and index, or is removed. The peer and a later
   request still read their own pristine state. Removing the shared source
   after materialization leaves both returned copies usable.
3. A request has different declared facts or runs without the dashboard
   owner. The materializer builds the requested history through its existing
   local route. If registered preparation fails mid-build, its callers get
   the setup failure, and a fresh run can build the history again.

#### Architecture

The dashboard run owns the lifetime of a completed snapshot through its
[artifact owner](../../dashboard/tests/support/runArtifacts.ts). The
materializer owns deciding whether the prefix matches and copying it before
applying a caller's suffix. This borrows the immutable-base idea from
container image layers. The Git copy has to remain usable after the shared
base disappears, so Git alternates and writable hardlinks are unsuitable.
Direct MakeMe domain facts and deterministic isolated proof follow
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
and [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
The timing comparison and cost of the shared machinery follow
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md).
