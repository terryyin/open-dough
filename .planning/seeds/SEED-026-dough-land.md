---
id: SEED-026
status: active
planted: 2026-09-24
planted_during: Product backlog capture requested by the maintainer
trigger_when: A developer has reviewed changes retained in a worktree and wants to land them
scope: medium
---

# SEED-026: Land reviewed worktree changes with Dough Land

## Why This Matters

A developer reviews a refinement, plan, retrospective, or finished story while
its changes wait in an owned worktree. Getting them onto remote trunk today
means knowing the right phrase in the right session, and preparation keep and
wrap-up each describe their own commit, publish, refresh, and worktree
cleanup. The execution retrospective has no workspace rule at all, so it can
write `DearDough.md` straight into the default checkout.

## Alternatives and Decision

A shell alias would shorten invocation but carries no reconciliation, refresh,
or safe cleanup. Leaving the callers as they are keeps duplicate descriptions.
Pursue one public, explicitly invoked `dough-land` skill ("Dough Land"). "Land"
means getting a reviewed change onto trunk and retiring its branch; it was
chosen over "keep", which casual phrases could trigger by accident.

## Story Decomposition

<a id="keep-reviewed-worktree-changes"></a>

### Land reviewed worktree changes with Dough Land

**Identity:** SEED-026#keep-reviewed-worktree-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/088-dough-land/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"74952d94e1afd6ab412f27380819128cc991d6fe8a922969fec775aaa5be6f20","plan":"8d7998db8b4b85718e8114cb64b9c66ea2bef2d601fec663877702896cea4969"}}
```

**Status:** Refined on 2026-09-24; planning pending.

**Goal:** A developer who has reviewed an owned worktree invokes Dough Land
and sees everything in it on the authorized remote trunk, the default checkout
refreshed when safe, and the worktree retired. Preparation, the execution
retrospective, and wrap-up reach trunk through one coherent landing behavior,
with no duplicate description of it.

**Scope:**

- `dough-land` runs only on explicit invocation. It lands the worktree named by
  context (normally the current one) onto the recorded or authorized remote
  target. Missing or ambiguous worktree or target stops before any commit.
- It commits every change in that worktree, committed or not, publishes
  through the existing shared publisher (reconcile with fetched trunk, no
  force), attempts the safe default-checkout refresh, then removes the clean
  worktree and its local branch once the remote target contains its tip. A
  separately published branch is deleted remotely only after that containment.
- A rejected push, conflict, dirty default checkout, or unsafe cleanup keeps
  every resource recoverable and reports the exact unfinished step. Rerunning
  continues from that step without a duplicate commit or push.
- Preparation's keep instruction lands through Dough Land. Leave-unpublished
  and discard stay in preparation.
- Wrap-up keeps its completion judgment, knowledge assimilation, history
  cleanup, and CI completion gate, but its commit-publish-refresh-retire steps
  are Dough Land's (called or shared, whichever is more cohesive). No second
  description remains.
- The execution retrospective writes process findings and correction plans in
  the worktree from its invoking context, or else in an owned workspace under
  the preparation-workspace rule, never directly in the default checkout.
- Worktree ownership comes from context; no ownership tracking is added.

**Deferred:** discard, hosted-merge or pull-request flows (stop and report
only), worktree ownership records, and any new Git runtime the existing
publisher does not need.

**Key examples:**

1. A reviewed refinement has uncommitted seed edits in its worktree; another
   writer has since pushed a sibling story → Dough Land commits all edits,
   reconciles, publishes, refreshes the default checkout, removes the worktree
   and branch, and reports the accepted SHA, refresh, and cleanup separately.
2. Same, but the default checkout holds a pending human edit → publication
   succeeds, refresh is reported as deferred, and the worktree is still
   retired.
3. The push is rejected by an unresolvable conflict → nothing is removed; the
   report names the conflict; a rerun after resolution publishes once.
4. Invoked with no worktree in context, or from the default checkout itself →
   stops before committing and names the gap.
5. Wrap-up in Trunk Mode lands its closure; worktree retirement waits for the
   CI completion receipt, and a failed or unconfirmed shutdown keeps the
   worktree.
6. A retrospective after execution writes `DearDough.md` in the execution
   worktree; one started from the default checkout writes in an owned
   workspace; the default checkout is unchanged either way.

**Depends on:** The shared publication and default-checkout maintenance
guidance already delivered by
[SEED-008](SEED-008-worktree-branch-trunk-sync.md).

## Ordering and Scope Reduction

The maintainer placed this story first. It absorbs the SEED-008
preparation-keep and closure-adoption candidates, and the retrospective
worktree fix, which was too small to stand alone. If reducing investment, keep
the skill, preparation, and retrospective paths, and leave wrap-up's existing
publication text only if it already defers entirely to shared guidance.

## Open Decisions

None blocking planning. The planner chooses between wrap-up calling Dough Land
and both sharing one landing reference.

## When to Surface

When a reviewed worktree is ready to land.

## Breadcrumbs

- [Preparation keep](../../src/skills/dough-story-refinement/references/preparation-disposition.md)
- [Story wrap-up](../../src/skills/dough-story-wrap-up/SKILL.md)
- [Execution retrospective](../../src/skills/dough-execution-retrospective/SKILL.md)
- [Shared publication](../../src/skills/dough-execute-plan/references/publish-the-candidate.md)
- [Checkout maintenance](../../src/skills/dough-execute-plan/references/maintain-default-checkout.md)
- [Related branch and worktree stories](SEED-008-worktree-branch-trunk-sync.md)
- [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
- [ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
