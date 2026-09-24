---
id: SEED-026
status: active
planted: 2026-09-24
planted_during: Product backlog capture requested by the maintainer
trigger_when: A developer has reviewed changes retained in a worktree and wants to keep them
scope: unknown
---

# SEED-026: Keep reviewed worktree changes with Dough Keep

## Why This Matters

A developer may review a refinement, slice plan, or completed story while its
changes wait in an owned worktree. Keeping those changes currently requires
several workflow-specific instructions for committing, publishing to remote
trunk, refreshing local main, and retiring the worktree and branch. Wrap-up
also contains much of this Git lifecycle. Repeating it makes the developer's
simple keep decision harder to invoke and lets the paths drift apart.

## Alternatives and Decision

Leaving the existing preparation and wrap-up instructions in place requires no
new skill, but retains two descriptions of the same Git outcome. A shell alias
would shorten invocation without carrying ownership checks, publication
evidence, and safe cleanup across projects and supported hosts. Pursue one
public `dough-keep` skill ("Dough Keep") for the shared operation, and let
preparation and wrap-up call it at their authorized keep boundary. Keep their
distinct decisions about *what* is ready to retain outside this skill.

## Story Decomposition

<a id="keep-reviewed-worktree-changes"></a>

### Keep reviewed worktree changes with Dough Keep

**Identity:** SEED-026#keep-reviewed-worktree-changes
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Status:** Captured and queued on 2026-09-24; refinement and planning pending.

- **For / why:** A developer who approves changes waiting in an owned worktree
  can invoke Dough Keep and see the approved work safely reach the project's
  authorized remote trunk, with the local main checkout refreshed when safe
  and the finished workspace retired.
- **Evaluation:** Given reviewed refinement or slice-plan changes in an owned
  worktree, keep commits only those changes, reconciles with current remote
  trunk, publishes an accepted revision, then attempts to advance and sync
  local main without overwriting other local work. A completed story can invoke
  the same keep behavior through wrap-up after its own closure obligations.
  When the owned branch was published separately, remove it from the remote
  only after its tip is verified integrated. Remove the local worktree and
  branch only when ownership, cleanliness, and remote containment make that
  safe. A rejected push, conflict, dirty checkout, or ambiguous ownership
  leaves recoverable resources and reports the exact unfinished step.
- **Value / learning:** Gives developers one explicit keep action after review
  and tests whether preparation and wrap-up can share the Git delivery and
  resource-cleanup behavior without duplicating it.
- **Effort hypothesis:** Unestimated; the existing publication and cleanup
  contracts need a focused boundary review before sizing.
- **Depends on:** The existing shared publication and checkout-maintenance
  contracts. Reuse them rather than introducing another Git protocol.
- **Boundary:** Keep does not decide whether a story is complete, perform
  wrap-up's product-knowledge and history cleanup, Take a story, or authorize a
  push that the caller or project has withheld. Respect branch protection and
  review policies. No force push or deletion of unrelated work.
- **Safe stopping point:** The public skill and its preparation caller provide
  a useful reviewed-record keep; wrap-up then delegates its shared Git portion
  while preserving its distinct completion and CI requirements in the same
  story.

## Ordering and Scope Reduction

The maintainer placed this story first in the queue. It absorbs the queued
preparation-publication and closure-publication adoption candidates in
[SEED-008](SEED-008-worktree-branch-trunk-sync.md); neither remains an
independent backlog item. The single story must preserve both caller journeys
and one shared Git behavior. Avoid extending Dough Keep into discard, execution,
semantic closure, or a general worktree manager.

## Open Decisions

- At refinement, establish the exact callable interface and how a caller passes
  its approved change set, target, and existing completion evidence.
- Confirm the project's safe local-main refresh and remote-branch deletion
  behavior for branch-protected or hosted-merge targets.

## When to Surface

When a reviewed worktree is ready to keep, including preparation or wrap-up.

## Breadcrumbs

- [Preparation keep](../../src/skills/dough-story-refinement/references/preparation-disposition.md)
- [Story wrap-up](../../src/skills/dough-story-wrap-up/SKILL.md)
- [Shared publication](../../src/skills/dough-execute-plan/references/publish-the-candidate.md)
- [Checkout maintenance](../../src/skills/dough-execute-plan/references/maintain-default-checkout.md)
- [Related branch and worktree stories](SEED-008-worktree-branch-trunk-sync.md)
- [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
- [ADR 0006 — Write skills for executing agents](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
