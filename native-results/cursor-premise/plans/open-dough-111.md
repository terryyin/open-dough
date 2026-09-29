# Rename quick folder references to slice-plans

## Source

**Identity:** SEED-042#rename-slice-plan-folder-references

[Refined story](../../seeds/SEED-042-rename-slice-plan-folder-references.md#rename-slice-plan-folder-references).
Planning-only authorization in a disposable checkout; implementation, commit,
push, and publication are not authorized by this plan.

## Goal and scope

Developers and executing agents recognize the plan location by its purpose:
“Slice Plans,” with plans at `.planning/slice-plans/<plan>/PLAN.md`.

Apply that directory convention throughout maintained source guidance under
`src/skills/` (per [AGENTS.md](../../../AGENTS.md)), templates, examples,
relevant code and test fixtures, and this repository’s own `.planning` plan
tree and live plan links. Reuse existing relative path and link handling.
Preserve plan contents, identity rules, and execution semantics.

**Authoring constraint (maintainer instruction for execution):** delivered
code, comments, guidance, examples, and tests describe only the current
`slice-plans/` convention. Do not leave “formerly quick,” legacy-name
explanations, rename history, old-name warnings, or negation behind. Tests
demonstrate the new path working; do not assert that the old folder name is
absent or rejected. Git retains change history.

**Excluded:** existing client projects’ one-time physical folder rename and
local artifact link updates; migration tooling; compatibility aliases;
dual-path fallback; rewriting historical SHA-qualified paths or other
historical records (for example `DearDough.md` execution breadcrumbs and
seed notes that pin a past revision path); renaming unrelated “quick”
execution-mode vocabulary.

## Context and architecture

Follow [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md) for
purpose-named language and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
plus [AGENTS.md](../../../AGENTS.md) for shared guidance authored under
`src/skills/`. No new North Star topic or ADR is warranted: this is a naming
alignment of an existing plan-root convention, not a new product boundary.

### Existing solutions and their intended use

| Responsibility | Existing owner / change |
| --- | --- |
| Plan path resolution beside a canonical home | `product-backlog-story-state-home.mjs` (`planPathBesideHome`); reuse as-is — relative links already resolve any folder name |
| Plan presence relative to the backlog | `product-backlog-plan.mjs` / plan readers; reuse; only fixture and example paths change |
| Shared agent guidance examples | `src/skills/**` prose and examples; replace plan-root folder name with `slice-plans/` |
| Maintained proof fixtures | `tests/support/**`, skill-local `scripts/*fixtures*`, `dashboard/tests/**`; plant and assert `slice-plans/` paths positively |
| This project’s plan tree and live links | `.planning/quick/` → `.planning/slice-plans/`; update PRODUCT-BACKLOG, seed plan links, and story-state `--plan` paths for current plans |

Do not add a plan-root constant, dual-path resolver, or migration command.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| Established executable-plan root is `.planning/quick/<NNN>-<slug>/PLAN.md`; highest allocated entry is `110` | Listed `.planning/quick/` (`107-cut-test-work-and-ci-wait`, `110-track-ad-hoc-work`); candidate `111-rename-slice-plan-folder-references` absent under `quick/` and `slice-plans/` | Plan number `111` under current root layout |
| Plan loading resolves a path relative to the canonical home, not a hard-coded `quick` segment | Read `src/skills/dough-product-backlog/scripts/product-backlog-story-state-home.mjs` (`planPathBesideHome` = `resolve(dirname(canonicalPath), plan)`); confirmed `../slice-plans/111-example/PLAN.md` resolves beside a seed home | Existing handling supports the rename without new path logic |
| Maintained fixtures and guidance still name `quick/` as the plan folder | Ripgrep of plan-root path patterns across `src/skills`, `tests/support`, skill scripts, and `dashboard/tests` (excluding `CHANGELOG.md` / `DearDough.md`) | Dozens of files still plant or assert `quick/…/PLAN.md` |
| No dual-path or compatibility alias for the plan folder exists in product path code | Searched `src` for dual-path / legacy / `slice-plans` plan-root handling beyond unrelated “alias” uses | Gap is naming in references and this tree, not missing resolver behavior |
| “Quick” as execution mode is distinct vocabulary to preserve | Skills and backlog take/usage prose use “quick story,” “quick execution,” etc., separate from `.planning/quick/` paths | Edits must target plan-folder paths only |

## Outside-in proof

| Example | Observable signal |
| --- | --- |
| Planning guidance creates a plan under the convention | Delivered `src/skills` planning/backlog guidance names `.planning/slice-plans/…`; story ↔ plan links agree on `slice-plans/` |
| Story references `../slice-plans/…/PLAN.md` | Existing reader/recorder resolves that plan; displayed source links use the same path |
| Maintained fixture uses `slice-plans/` | Focused tests plant and assert the resulting plan path, content, or link with the new name |
| Prose uses current terminology only | Delivered guidance/examples/tests explain plan location without rename history or old-name negation |

## Ordered slices

### 1. Apply slice-plans as the plan folder convention
Type: Behavior
Status: planned
Proof: Focused existing suites that already own plan-path planting and link/display assertions pass after fixtures and guidance use `slice-plans/`; this repository’s live plan tree and backlog/seed plan links agree on `.planning/slice-plans/`. Prefer `node --test` on the touched story-state and product-backlog support files and skill-local publication/preparation fixtures, plus the dashboard Playwright specs that assert plan paths in source navigation / published work. Do not add “old name absent” assertions. Reason for including dashboard path assertions: those fixtures and expectations are distributed consumers of the same plan-folder strings.

Behavior: Pre-condition → maintained source, fixtures, and this project’s `.planning` plan tree still use `quick/` as the plan-folder name, while path resolution is already relative. Trigger → apply the `slice-plans/` directory convention across that maintained surface (including renaming this project’s `.planning/quick/` tree to `.planning/slice-plans/` and updating live plan links and story-state plan paths for current plans, relocating this plan with that tree). Postcondition → agents following delivered guidance create and link plans under `slice-plans/`; readers resolve `../slice-plans/…/PLAN.md`; fixtures prove the new path directly; delivered prose uses only current terminology; unrelated “quick” execution-mode language and historical SHA-qualified paths remain unchanged.

## Current decisions

- Plan file allocated as `.planning/quick/111-rename-slice-plan-folder-references/PLAN.md` under the established root and next number; the Behavior slice relocates it with the tree rename to `.planning/slice-plans/111-rename-slice-plan-folder-references/PLAN.md` and updates the story’s plan association in the same delivery.
- Author shared guidance only under `src/skills/`; do not hand-synchronize installed `.agents/skills` or `.claude/skills` copies (release payload owns those).
- One Behavior slice owns the cohesive naming outcome; no Structure slice — existing relative resolution needs no preparatory redesign.
- No numeric slice target or hard limit was supplied for this story; boundedness is the single proof loop above.

## Learnings

_(none yet)_

## Preparation workspace

- **Owned workspace (reused):** `/private/tmp/cursor-premise-20260929/open-dough` on branch `main` at starting revision `eaa10232` — disposable checkout supplied by the planning-only instruction; not created by this preparation; do not leave this repository.
- **Originating / integration checkout:** same path (no separate integration checkout).
- **Target selection:** omitted — explicit no publish / no commit / no push.
- **Preparation assignment:** not announced (explicit instruction not to publish or commit).
