---
id: SEED-082
status: active
planted: 2026-10-02
planted_during: Terry's request for explicit retrospective follow-up disposition
scope: story
---

# SEED-082: Settle retrospective follow-ups during wrap-up

## Why This Matters

Developers need retrospective follow-up work to remain visible and prioritized
after its predecessor closes, with no unlisted plan silently left behind.

## Story

<a id="wrap-up-follow-up-disposition"></a>

### Settle retrospective follow-ups during wrap-up

**Identity:** SEED-082#wrap-up-follow-up-disposition
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Goal:** Wrap-up queues an existing retrospective follow-up first by default,
or drops it only on explicit human instruction, settling its disposition before
closing its predecessor.

**Scope:** Update the shared wrap-up guidance and its backlog reconciliation
consumer. Preserve canonical story/plan identity, duplicate prevention, unrelated
queue order, and the existing missing-input stop. Do not change installed copies
or release a new version.

**Key examples:**

- A retrospective leaves a valid follow-up plan, with no further instruction →
  wrap-up queues its canonical home first and preserves its execution inputs.
- The human explicitly says to drop the follow-up → wrap-up preserves Git
  recovery, removes its owned plan/story and any backlog entry, and reports it.
- The follow-up cannot be queued because required input is missing → wrap-up
  keeps the work intact and stops before predecessor cleanup.
- Main gains another first item while the follow-up is being integrated → the
  follow-up takes first place, retaining the other item and unrelated order.
- Wrap-up repeats → it creates no duplicate and leaves no unlisted follow-up.

**Verification:** Walk queue, explicit-drop, missing-input, repeat, and competing
top-item examples against the authored guidance and reconciliation reference;
check Markdown links and whitespace. This is a conventional guidance change,
not an installation or update change.

**Authority:** Terry authorized capturing this item, making the bounded change
directly on main, pushing to origin/main, and synchronizing with origin.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Story wrap-up](../../src/skills/dough-story-wrap-up/SKILL.md).
- [Backlog reconciliation](../../src/skills/dough-product-backlog/references/merge-conflicts.md).
