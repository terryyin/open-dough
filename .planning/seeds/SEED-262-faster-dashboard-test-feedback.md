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

<a id="pilot-admission-native-evidence-reuse"></a>

### Pilot native evidence reuse for Git publication admission

**Identity:** SEED-262#pilot-admission-native-evidence-reuse

#### Goal

A maintainer deciding whether to rerun `publication/admission-investigation`
can tell whether a change to the installed payload affects the requirement
proved by a retained native result on that host. An unrelated skill edit or
release can leave that result eligible for reuse, saving a native rerun.

#### Scope

- Pilot this journey using the existing per-file input hashes. Preserve the
  full installation provenance and historical record bytes. Explain which
  changed inputs can affect the requirement, including referenced guidance and
  helpers, host discovery and hooks, and fixture and installer behavior.
  Verify that the prompt, assessment, and runtime conditions still support
  reuse on the same host.
- Demonstrate that an unrelated payload change leaves evidence eligible for
  reuse, a changed admission instruction or relevant host hook requires fresh
  proof, and missing inputs or uncertain impact leave proof pending. Judge
  historical records individually under
  [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md#5-assess-now-and-delete-spent-evidence).
- Record the reruns the pilot could avoid and the effort needed to make the
  reuse judgments. The [fixture identity guard](#guard-native-fixture-identity-inputs)
  covers completeness at capture. A reuse judgment requires sufficient
  provenance for the specific result.
