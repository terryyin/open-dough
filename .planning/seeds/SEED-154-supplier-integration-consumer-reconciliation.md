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

## Follow-up Correction

<a id="harden-supplier-visit-trigger-and-settlement"></a>

### Visit consumers of every completed selected story and settle on its last publication

**Identity:** SEED-154#harden-supplier-visit-trigger-and-settlement
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/360-harden-supplier-visit-trigger-and-settlement/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7b50dfea602943d9bfe2edd7eaee9b0fbfeff8b7f282a0b3480248a1d4ea1fe2","plan":"22d34751a0cf13eb56df1151e4566f190d5a818bf2db06df4f0bc442c9da8e39"}}
```

**Goal:** A developer completing any selected story through Story Branch
wrap-up, Trunk closure or a selected-work landing gets the current-consumer
visit without the agent first judging that consumers exist, and Trunk
completion and retirement cannot skip the last consumer publication's CI
completion. This bounded correction follows the execution retrospective of
SEED-154#reconcile-current-consumers-after-supplier-integration
(recoverable at `75c6949cfeb43b7ba8a6ec57e5e62e6c06eddcf5:.planning/seeds/SEED-154-supplier-integration-consumer-reconciliation.md`);
it adds no feature promise.

**Scope:** Make every completion entry point pass the completed selected work's
identity to the existing visit, let Trunk `finish` continue in one call after a
clean zero-consumer visit, refuse a `--visit-settled` SHA earlier than this
closure's last registered consumer publication, name one completion target in
guidance, and resolve the small cleanup findings the plan lists. The selected
story's promises and exclusions stay unchanged. Findings, proof and decisions
live in [the correction plan](../slice-plans/360-harden-supplier-visit-trigger-and-settlement/PLAN.md).

## Breadcrumbs

- Terry's report, instance-repair request, and instruction to queue the Open
  Dough fix first while preserving known evidence, 2026-10-27.
- [Maintainer guidance](../../AGENTS.md): author shared behavior under
  `src/skills/`, preserve the executing-agent audience, and perform the
  representative behavior review. Installed copies change through a release.
- [Backlog dependency contract](../../src/skills/dough-product-backlog/SKILL.md#record-a-necessary-blocking-dependency).
