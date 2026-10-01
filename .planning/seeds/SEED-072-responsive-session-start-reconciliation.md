---
id: SEED-072
status: active
planted: 2026-10-01
planted_during: Terry's request for responsive dashboard session startup and reconciled story state
scope: story
---

# SEED-072: Keep the dashboard responsive while session startup settles

## Why This Matters

A developer starting refinement, execution, or an unattached startup session
needs immediate feedback that Start has taken effect, without being able to
cancel work that has already begun. Launch processing should let the developer
continue using the dashboard while protecting the affected story from further
actions until its temporary local state and published state agree.

## Story

<a id="durable-startup-reconciliation"></a>

### Keep reconciled startups settled under one unresolved-attempt rule

**Identity:** SEED-072#durable-startup-reconciliation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/206-durable-startup-reconciliation/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"988dacb087a82905e4823108394288514deb5c374e46e980a4f8dd7ea89e6d23","plan":"b9e7fce42baff4a70a346e143df6a320df72dd6ca0852cd53abadceaaba1db16"}}
```

**Goal:** A developer who reopens, reloads, or restarts the dashboard after a
startup reconciled sees that story's normal actions and no stale recovery item,
and both the local launch service and the page refuse or protect exactly the
same unresolved attempts, with recovery wording that reads correctly where it
is shown. Recheck settles an uncertain Claude Code launch from `claude agents`
instead of leaving a possibly duplicating Continue as the only exit.

**Scope:** A bounded retrospective correction of
`SEED-072#responsive-session-start-reconciliation` (closed; recoverable at
`4cdf6120:.planning/seeds/SEED-072-responsive-session-start-reconciliation.md`). Keep a reconciled settled
attempt settled across pages, reloads and restarts as machine-local launch
evidence, never a story fact, including after its story leaves the published
snapshot; apply one unresolved-attempt rule to service admission and story
protection; form recovery wording where each answer is formed instead of
rewriting it in the page; and, by Terry's decision on 2026-10-01, have Recheck
verify an uncertain Claude Code story launch through `claude agents`. Preserve
every promise of the original story.

**Plan:** [bounded correction input and slices](../slice-plans/206-durable-startup-reconciliation/PLAN.md).

## Breadcrumbs

- Terry's direction in this chat, 2026-10-01: capture this UX/UI improvement
  first in the product backlog, directly on main, then commit and sync with
  origin. Disable Cancel immediately on launch, move startup to the background,
  show the story as read-only and processing, and recover its actions only after
  temporary dashboard state reconciles with authoritative `origin/main` state.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard session journey](SEED-052-start-agent-work-from-dashboard.md).
- [Composable session options](SEED-066-composable-lightweight-session-options.md).
- Session panel header controls (`60b6aa6b:.planning/seeds/SEED-071-session-panel-header-controls.md`).
