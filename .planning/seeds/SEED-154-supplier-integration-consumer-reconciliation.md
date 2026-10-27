---
id: SEED-154
status: active
planted: 2026-10-27
planted_during: Terry's report of a stale Pygardon prerequisite after supplier completion
trigger_when: A supplier is integrated while other branches have added or changed dependent stories
scope: Supplier completion and reconciliation of current dependent stories
---

# SEED-154: Reconcile current dependents after supplier integration

## Why This Matters

A developer should be able to start a prepared story once its actual supplier
prerequisite has been delivered and verified. In Pygardon, the dashboard kept
blocking entry-round latency attribution after entry-round reconciliation was
complete on trunk. The dependency agreement still said `waiting`, although the
story's preparation assessment was `ready`. Terry requested the instance repair,
then selected an Open Dough fix as the first queued story, preserving what this
investigation established.

This closes an observed process loop: supplier delivery must reach every
current consumer agreement, including consumers added on trunk while the
supplier was being developed on a separate branch.

## Selected Story

<a id="reconcile-current-consumers-after-supplier-integration"></a>

### Reconcile current dependent stories after supplier integration

**Identity:** SEED-154#reconcile-current-consumers-after-supplier-integration
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/359-reconcile-current-supplier-consumers/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"310fcd1cce5d71ba2a86fca1fc2c182d70c74331176198ec347fdbbac18ccc2b","plan":"ba31f9177d9c337981670814c20112657484dcc5fa1a7b537ef8942c26062c22"}}
```

**Beneficiary:** A developer completing a supplier story or starting one of
its dependent stories through Open Dough.

**Goal:** After accepted supplier integration, every current dependent story
has an evidenced resolution or an explicit unresolved disposition, so an
otherwise eligible story does not remain blocked because completion used an
outdated view of the dependents.

**Scope:**

- Discover consumers again from the current integrated project after accepted
  supplier integration/publication. A discovery result from the supplier branch
  before integration cannot establish coverage of the integrated project.
- Establish that the checkout used for discovery and consumer writes contains
  the accepted supplier integration and the fetched target's current content.
  An accepted publication receipt does not establish that the checkout advanced.
  Keep this work in the owned workspace; an optional default checkout's local
  changes must not be required, included, or overwritten.
- Judge every current agreement against the supplier's delivered outcome and
  recoverable proof. Use the existing guarded resolution and publication path;
  retain the distinction between the before-cleanup evidence revision and the
  accepted integration revision.
- Include the existing discovery surface: queued, Taken, prepared but unqueued
  stories, sibling sections, and canonical corrections. Preserve unrelated
  dependencies, story scope, plan status, readiness judgments, and queue order;
  apply the existing rules for separately justified reconciliation or spent
  readiness reasons.
- Finish the current-consumer visit and publish its owned resolutions before
  successful wrap-up/resource retirement, or explicitly retain unresolved work,
  evidence, discovery gaps, and next actions in the existing active context.
  Rejudge changed agreements rather than applying a stale discovery or decision.
- Cover the Story Branch path that failed here and keep supplier-resolution
  behavior coherent with Trunk Mode and selected-supplier landing. The owning
  completion path must reach fresh discovery before completing its visit and
  retiring resources; do not rely on a caller remembering an extra scan after
  a completion command has already retired the workspace.

**Boundary:** Current means the fetched, integrated content used for the visit,
including changes incorporated by a publication retry. If reconciliation brings
in another consumer or changes an agreement or its relevant intent, revisit that
affected work before claiming coverage. This is a bounded completion visit, not
a permanent monitor of future consumers or a lock on other writers. Persistent
contention keeps the ordinary publication stop and explicit recovery action.

**Outside scope:** Automatically satisfying agreements from a Done entry alone,
changing the dashboard's dependency grammar, starting consumer execution,
inventing a reverse dependency registry, or changing consumer product promises.
The Pygardon instance is already repaired; this story prevents recurrence.

**Key examples / evaluation:**

1. A supplier branch starts before a latency consumer exists. Trunk gains that
   consumer with a waiting prerequisite, then accepts the completed supplier.
   Completion discovers the new consumer after integration, verifies its
   condition, publishes its resolution, and the shared reader/dashboard report
   no dependency blocker when the remaining eligibility conditions hold.
2. An older consumer was already resolved, while a second consumer was added
   concurrently. Completion handles both current records; replay preserves the
   older resolution and its evidence without duplicate receipts.
3. A new consumer needs behavior the completed supplier did not deliver, or
   presents an unresolved product choice. It stays waiting or decision-needed
   with the concrete missing behavior/decision and next action. Other justified
   consumers can still be resolved independently.
4. Discovery encounters an unreadable or ambiguous home, or an agreement
   changes before resolution. Completion reports and retains the affected work;
   it cannot claim complete coverage from the earlier successful scan.
5. Supplier source and plans have been cleaned up. Resolution still uses the
   preserved historical identity, outcome, completed plan/proof and accepted
   integration; it neither recreates the supplier nor infers fulfillment from
   its absence. A repeated completion visit is safe.
6. Integration succeeds but returns to the old supplier branch, while the
   optional default checkout has unrelated edits. Completion brings its own
   clean workspace onto current accepted target content before discovery. Both
   current consumers are visited and the default checkout's edits are preserved.

The regression must exercise a consumer added on trunk during supplier branch
execution through the relevant completion boundary. Existing command tests
alone do not prove that the workflow invokes fresh discovery at that boundary.

**Selected direction:** Reuse the shared supplier procedure, canonical-home
discovery, guarded resolver and publication mechanics. Make the integration to
current-consumer visit an explicit, command-backed handoff owned by completion,
then retain agent judgment for fulfillment and human-owned product decisions.
Keep resolution evidence in existing consumer agreements and recovery facts in
the active context; no second dependency or completion registry is needed.

The smaller alternative, adding “rediscover” beside the existing post-integration
link, is insufficient: the publication helper restores the old branch, and
completion/retirement can precede that link's continuation. Correct the checkout
and ordering together. The existing resolver needs no new satisfaction policy.

## Preserved Investigation Evidence

### Verified Pygardon history

Repository: `terryyin/pygardon`; observed on 2026-10-27.

- Consumer identity: `SEED-145#story-entry-round-latency`, canonical home
  `.planning/seeds/SEED-145-entry-round-latency.md#story-entry-round-latency`,
  plan `.planning/slice-plans/431-entry-round-latency/PLAN.md`.
- Supplier identity: `SEED-145#story-entry-round-reconciliation`, historical
  home `.planning/seeds/SEED-145-entry-round-reconciliation.md#story-entry-round-reconciliation`.
- Consumer preparation was published in
  [92df0121a97aba6d59f3d7cb448cd75c78943b5f](https://github.com/terryyin/pygardon/commit/92df0121a97aba6d59f3d7cb448cd75c78943b5f)
  at 07:43 Singapore time. Its recorded condition required the authorized
  reconciliation outcome on trunk, including a one-cycle reconciliation
  operation and service-owned follow-up lifecycle with existing stop/cleanup.
- The supplier closure tip
  `b13c9ca84fa0290b748f18e960c76f55fc8273f7` did not contain the latency seed;
  the other merge parent, `55e741ebfe79f468544a5b43a429154a28bdcfdd`, did.
  Supplier integration was
  [3d58fd80da082d06e60f78571696c511f8c1dd34](https://github.com/terryyin/pygardon/commit/3d58fd80da082d06e60f78571696c511f8c1dd34)
  at 12:06 Singapore time.
- The subsequent
  [2e91f65211942e8860eab9022959813da8b83056](https://github.com/terryyin/pygardon/commit/2e91f65211942e8860eab9022959813da8b83056)
  at 12:15 resolved only `SEED-145#story-unattended-entry-operation` against
  that same supplier. The latency consumer remained `waiting`.
- Running the installed `discover-consumers` for the supplier found both
  consumers with no discovery problems. `read-state` for latency reported a
  `ready` assessment, unchanged review basis, and `startEligibility: blocked`
  solely because of that waiting dependency.

### Instance repair and recoverable supplier proof

The instance repair is published in Pygardon commit
[51ddbafefa304d0c46c7ba0fe501d16262bea384](https://github.com/terryyin/pygardon/commit/51ddbafefa304d0c46c7ba0fe501d16262bea384).
It used the installed `resolve-dependency` command with the observed agreement
basis, `origin/main`, accepted integration `3d58fd80da082d06e60f78571696c511f8c1dd34`,
and recoverable before-cleanup revision
`ba4163ec1b80165802e7cff266d2e85472e43a25`.

That revision retains the supplier home above and completed proof in
`.planning/slice-plans/430-entry-round-follow-up/PLAN.md` and
`.planning/slice-plans/432-entry-round-follow-up-correction/PLAN.md`.
The delivered `follow_up_entry_round` operation is in
`pygardon/auto_trading/entry_round_follow_up.py`; the loop is in
`pygardon_service/entry_round_follow_up_wake.py`, owned by `service_lifespan`
and cancelled/awaited through `shutdown_service_background`. The retained
plans record accepted cycle, wake, stop, protection, expiry, unknown-read and
lifecycle proof. The repair changed only the dependency state and resolution
evidence. Verification returned `startEligibility: eligible`, no blockers,
and an unchanged preparation assessment/basis; the commit's lint hook passed.

### Open Dough findings and remaining uncertainty

At inspected Open Dough revision `3901d3ac8ddd5717744a0af36d53160033595add`:

- [Wrap-up](../../src/skills/dough-story-wrap-up/SKILL.md#commit-closure-inputs-and-preserve-git-recovery)
  calls for consumer discovery before deletion, while the supplier branch can
  still lack consumers added elsewhere.
- [Story Branch integration](../../src/skills/dough-story-wrap-up/references/story-branch-integration.md)
  says to resolve and publish consumers after accepted integration, linking
  directly to the recording/publication stage. It does not explicitly require
  rediscovery against the integrated project.
- [The shared supplier procedure](../../src/skills/dough-product-backlog/references/supplier-dependencies.md)
  already owns discovery, per-consumer judgment, guarded resolution, evidence,
  replay and publication. Reuse that behavioral source.
- [The shared dependency reader](../../src/skills/dough-product-backlog/scripts/product-backlog-story-dependencies.mjs)
  derives blockers from recorded dependency states; the dashboard consumes
  that interpretation through `dashboard/src/storyDependencies.ts`.
- Relevant existing proof includes
  `tests/support/supplier-dependency-completion.test.mjs`, its supplier fixture,
  and the `workspace-publication` dependency/startup tests under
  `src/skills/dough-execute-plan/scripts/`.

The history proves the missed consumer and the guidance gap. It does not prove
which discovery commands the original agent ran. An outdated pre-integration
consumer list is the supported failure hypothesis, not a recovered execution
trace. No automated regression for this exact completion sequence was written
or run during diagnosis. Refinement must settle how the fresh visit is made
reliable and how its owning workflow proves it; merely adding another reminder
may not be sufficient.

## Breadcrumbs

- Terry's report, instance-repair request, and instruction to queue the Open
  Dough fix first while preserving known evidence, 2026-10-27.
- [Maintainer guidance](../../AGENTS.md): author shared behavior under
  `src/skills/`, preserve the executing-agent audience, and perform the
  representative behavior review. Installed copies change through a release.
- [Backlog dependency contract](../../src/skills/dough-product-backlog/SKILL.md#record-a-necessary-blocking-dependency).
