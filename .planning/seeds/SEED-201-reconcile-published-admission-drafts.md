---
id: SEED-201
status: active
planted: 2026-10-31
planted_during: Terry's shared admission draft repair request
trigger_when: Admission publishes a story drafted in the default main checkout
scope: shared admission source draft reconciliation
---

# SEED-201: Reconcile published admission drafts

## Why This Matters

Independent test optimization passes leave their seed draft untracked in the
default checkout even after admission commits it remotely. That draft then
prevents refresh and survives story closure.

## Selected Stories

<a id="reconcile-published-admission-drafts"></a>

### Reconcile published admission drafts without losing local edits

**Identity:** SEED-201#reconcile-published-admission-drafts
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Successful shared admission leaves no redundant uncommitted published
seed draft in the default main checkout while preserving unrelated or subsequent
edits.

**Scope:** Repair admission's successful publication and recovery paths. Reconcile
only the exact admitted story/plan content proven published. Preserve unrelated
files, sibling story edits, staged content, and edits made after admission read
its source. Failed or unconfirmed publication must preserve drafts. Keep remote
acceptance independent of checkout maintenance. Update source guidance and prove
the behavior through the startup boundary with local disposable repositories.

**Key examples:**

1. A clean main checkout gains only a new seed draft; successful admission
   publishes it and leaves main refreshed and clean.
2. An unrelated pending edit survives byte for byte; the admitted draft does not
   remain as an uncommitted duplicate.
3. A subsequent draft change, staged change, or unadmitted sibling edit survives
   admission and recovery. Refused or unconfirmed admission leaves drafts intact.

## Breadcrumbs

- Terry's investigation and repair request in this conversation, 2026-10-31.
- Existing startup reproduction: admission returns `published` with maintenance
  `deferred/pending-edit` and leaves `?? .planning/seeds/N.md`; published closure
  still leaves that original draft unchanged.
