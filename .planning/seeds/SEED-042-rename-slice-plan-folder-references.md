---
id: SEED-042
status: active
planted: 2026-09-26
planted_during: Product backlog capture requested by the maintainer
trigger_when: Slice-plan folder references still use the legacy quick name
scope: small
---

# SEED-042: Name the slice-plan folder for its purpose

## Why This Matters

Developers and executing agents encounter `quick/` as the slice-plan folder
name. That legacy name suggests speed rather than the folder's purpose.
Use “Slice Plans” and the directory name `slice-plans/` consistently instead.

## Story Decomposition

<a id="rename-slice-plan-folder-references"></a>

### 1. Rename quick folder references to slice-plans

**Identity:** SEED-042#rename-slice-plan-folder-references
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** Developers and agents can recognize the slice-plan location
  by its purpose without interpreting a legacy “quick” label.
- **Goal:** Rename all current references to the slice-plan folder from
  `quick/` to `slice-plans/`, using “Slice Plans” where a display name is needed.
- **Scope:** Update the folder naming convention and references in maintained
  guidance, templates, examples, and relevant code and checks. For example,
  `.planning/quick/<plan>/PLAN.md` becomes
  `.planning/slice-plans/<plan>/PLAN.md` in the convention and examples.
  This is a folder-reference rename, not a change to execution behavior or
  unrelated uses of “quick.”
- **Evaluation:** Following the updated guidance creates and refers to slice
  plans under `slice-plans/`; current product references agree on that name.
  Checks exercising those references use the same convention.
- **Effort hypothesis:** S — a bounded naming change; migration is excluded.
- **Depends on:** None identified.
- **Safe stopping point:** The new convention and its references are consistent
  without adding any ongoing transition mechanism.

## Explicit Exclusions

- Migrating or physically renaming existing `quick/` folders and their contents
  in existing projects is outside this story.
- No migration scripts, automatic installer/update migration, compatibility
  aliases, dual-path fallback, or migration workflow is required.
- Existing projects handle their one-time folder rename and corresponding
  local links separately, when their developer asks an AI agent to do it.
- Historical records describing old paths retain their historical meaning;
  this story does not rewrite history or break links to unmigrated artifacts.

## Ordering and When to Surface

Place this story first in the queued product backlog, as explicitly requested.
This capture does not authorize implementation or rename any existing folder.

## Breadcrumbs

- Maintainer request on 2026-09-26: replace the legacy Quick/Quik folder name
  with Slice Plans; existing-project renaming is a trivial one-time task owned
  by those projects and is not part of this story.
- [Product backlog](../PRODUCT-BACKLOG.md).
