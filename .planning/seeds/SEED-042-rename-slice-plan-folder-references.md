---
id: SEED-042
status: active
planted: 2026-09-26
planted_during: Product backlog capture requested by the maintainer
trigger_when: Apply the Slice Plans folder convention consistently
scope: small
---

# SEED-042: Name the slice-plan folder for its purpose

## Story Decomposition

<a id="rename-slice-plan-folder-references"></a>

### 1. Rename quick folder references to slice-plans

**Identity:** SEED-042#rename-slice-plan-folder-references
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/111-slice-plan-folder-references/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"963aa5061b43594238046f3770e3b780d6218c60b07cc7f8786c5c4e0b09decc","plan":"d672dfc5c9c9d813cbe8568e52cfccb837912bfd2f40885de4d51a1c25e688af"}}
```

**Goal:** Developers and executing agents recognize the plan location by its
purpose: “Slice Plans,” with plans at `.planning/slice-plans/<plan>/PLAN.md`.

**Scope:** Apply the directory convention throughout maintained source guidance,
templates, examples, relevant code and test fixtures. Use existing path and
link handling. Preserve plan contents, identity rules and execution semantics.
Author shared guidance under `src/skills/` following [AGENTS.md](../../AGENTS.md).

**Mandatory authoring constraint — complete rename, positive contract:**
The delivered code, comments, guidance, examples and tests describe only the
current `slice-plans/` convention. Do not leave “formerly quick,” legacy-name
explanations, rename history, old-name warnings, or negation behind. Test names,
fixtures and assertions demonstrate the new path working; do not add assertions
that the old name is absent or rejected. This is a maintainer instruction for
execution, not text to copy into runtime guidance. Git retains change history.

**Key examples:**

1. An agent follows the planning guidance in a project using the convention:
   the created plan and its story link agree on `slice-plans/`.
2. A story references `../slice-plans/111-example/PLAN.md`: the existing reader
   resolves that plan, and displayed source links point to the same record.
3. A maintained test fixture uses `slice-plans/`: its assertions prove the
   resulting plan path, content or link directly using the new name.
4. Delivered prose explains where plans belong using current terminology;
   readers need no explanation of earlier naming.

**Scope exclusions:** Existing projects own their one-time physical folder
rename and corresponding local artifact links. Migration tooling, compatibility
aliases, dual-path fallback and historical-record rewriting are outside this
story. Actual links to unmigrated existing artifacts remain those projects'
responsibility; do not manufacture dangling links during this reference change.
Unrelated uses of “quick” for execution modes retain their meaning.

**Effort hypothesis:** Small, one cohesive naming change with existing proof.
**Depends on:** None identified.
**Safe stopping point:** Current product references agree on the convention and
relevant existing checks pass.

## Priority and preparation

Keep this story first in the queued backlog. Planning does not start execution.

## Breadcrumbs

- Maintainer instructions on 2026-09-26: use Slice Plans, exclude existing-project
  migration, and deliver current terminology with positive tests and no naming
  history or negation in product artifacts.
- [Product backlog](../PRODUCT-BACKLOG.md).
