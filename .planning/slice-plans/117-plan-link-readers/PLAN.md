# Read every plan link by its file

## Source

**Identity:** SEED-028#plan-link-readers

[Correction story](../../seeds/SEED-028-track-ad-hoc-work.md#plan-link-readers).
A bounded retrospective correction of the completed execution of
`SEED-028#plan-link-rule` under plan 116
(`.planning/slice-plans/116-plan-link-rule/PLAN.md`, all five slices done):
claim `c97afbb`, attributable commits `7af15d4`, `2567d65`, `91382b9`,
`9bf7393`, `6b3f02b` on branch `claude/116-plan-link-rule` (net diff
`c97afbb..6b3f02b`). That correction's outcomes stay as delivered; this
correction adds no feature promise. The retrospective authorized planning
only; execution needs its own authority.

## Goal and scope

Every reader of a plan link names the plan by its file, as take,
record-state, refresh own-home and startup already do through
`product-backlog-plan.mjs`. Four findings, each reproduced at `6b3f02b` by a
scratch probe.

### Current findings

- **F1 — listing clash misses an exactly equal anchored home (low-medium;
  regression from `2567d65` and `9bf7393`).** `planNamesHome`
  (`src/skills/dough-product-backlog/scripts/product-backlog-plan.mjs`)
  compares `planFileOf(target)` with the other entry's home as written, so a
  plan link `seeds/SEED-021-two-stories.md#first-story` no longer clashes
  with the queued entry homed at exactly that link: `take --plan` writes it,
  `parseBacklog` (`planOfOther`) accepts the backlog, and `add` of that home
  passes `requireUnlistedHome`. At `c97afbb` each was refused ("already lists
  the same work twice"). The dashboard bundles the same check.
- **F2 — `adopt` refuses a section plan link (low-medium; older code, made
  reachable by `2567d65`).** `product-backlog-adopt.mjs:64-65` opens
  `entry.plan.target` with `openHome`, reading `#ordered-slices` as a story
  anchor: a Taken entry linking `slice-plans/N/PLAN.md#ordered-slices` makes
  `adopt --all` refuse "has no story anchored at 'ordered-slices'" and record
  nothing, although `take` now writes that link.
- **F3 — the dashboard keeps a recorded plan's section (medium-low;
  regression from `9bf7393`).** `record-state` and startup accept
  `--plan E.md#e` (own home, anchored) and `--plan ../slice-plans/N/PLAN.md#x`;
  the dashboard's `recordedPlanPathFor` → `resolveBesideFile`
  (`dashboard/src/workEntryFacts.ts:51`) keeps the fragment, so
  `planPath === path` (`workEntryFacts.ts:82`, `preparationEnrichment.ts:158`)
  fails and `planAssociation.ts` reports a disagreement: readiness shows as
  unavailable or conflicting for stories the backlog and startup accept.
- **F4 — no purity guard for bundled backlog modules (low; older gap, riskier
  now).** `dashboard/src/publishedWork.ts` bundles
  `product-backlog-document.mjs`, which now imports `product-backlog-plan.mjs`;
  no lasting test walks their imports (existing guards cover story-state,
  home-reader, plan-reader and agent-profile via
  `tests/support/pure-module-imports.mjs`).

### Preserved promises and constraints

- Plan 116's promises stay: section links satisfy their plan; own-home plans
  stay unlinked; a different plan file is refused; continuation writes
  nothing; refusals keep their meaning and leave files unchanged.
- Listing clashes still compare another entry's home as written (its anchor
  names which story of a shared seed it is); this correction only adds the
  exact-equality case back.
- `product-backlog-plan.mjs` and `product-backlog-document.mjs` stay free of
  Node-only and filesystem imports. Test files stay at or below 250 lines.
- Installed copies under `.agents/skills/` and `.claude/skills/` are not
  hand-edited ([AGENTS.md](../../../AGENTS.md)). Follow
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  and the North Star topic
  [One backlog interpretation](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation):
  the backlog domain owns what a plan link names; the dashboard consumes it.

### Authorized cross-subsystem change

The backlog domain (`src/skills/dough-product-backlog/scripts/`), the
dashboard's plan reading (`dashboard/src/workEntryFacts.ts`,
`preparationEnrichment.ts`, `planAssociation.ts`, `repositoryPath.ts` as
needed) and their tests.

### Excluded

- Refresh repoint comparisons (`product-backlog-refresh.mjs`) and merge
  comparison in `product-backlog-version.mjs`.
- Consolidating overlapping own-home tests (owned by `dough-test-optimization`).
- Unifying the three declared-plan resolutions (backlog `separatePlan`,
  execute-plan `declaredPlan`, dashboard `recordedPlanPathFor`) into one
  module beyond sharing `planFileOf`; revisit only if a slice finds the
  shared predicate insufficient.

## Current decisions

- **The dashboard reads anchored recorded plans by file (retrospective
  recommendation, 2026-09-26; developer to confirm at wrap-up).** Follows plan
  116's developer-confirmed decision that section links are supported, and
  changes no promise record-state or startup already delivered. Rejected
  alternative: refuse `#fragment` in story-state `--plan` — would reverse
  delivered and tested behavior.
- **F1 rule.** A plan link names another entry's home when its file equals
  that home as written, or the link equals that home exactly.
- **Shared predicate.** The dashboard imports `planFileOf` from the pure
  `product-backlog-plan.mjs`, as it already imports the document model.

## Outside-in proof and verification

Reuse the real backlog CLI (`tests/support/`), the adoption fixture
(`tests/support/product-backlog-adoption-fixture.mjs`), the dashboard
readiness fixtures (`dashboard/tests/storyReadinessFixture.ts`), and
`tests/support/pure-module-imports.mjs`. No new framework.

Focused suites:

- `node --test tests/support/*.test.mjs`
- `node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-*.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-race.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-admission*.test.mjs`
- `npx playwright test --config dashboard/playwright.config.ts --reporter=line dashboard/tests/source-navigation.spec.ts dashboard/tests/preparation-legend.spec.ts dashboard/tests/story-readiness-accessible.spec.ts dashboard/tests/story-readiness-gaps.spec.ts dashboard/tests/story-readiness.spec.ts`
- `npm run typecheck:dashboard`

Each slice runs its focused commands after edits and independent post-change
refactoring, plus `git diff --check` and a line-count check on touched test
files. Keep ordinary delivery, CI observation, retrospective and wrap-up gates.

## Ordered slices

### 1. Refuse a plan link that exactly names another entry's anchored home
Type: Behavior
Status: planned
Proof: rows in `tests/support/product-backlog-plan-home.test.mjs`, real CLI:
`take --plan seeds/SEED-021-two-stories.md#first-story` for another story
while `SEED-021#first-story` is queued is refused; `add` of
`seeds/SEED-021-two-stories.md#first-story` while another entry links exactly
that as its plan is refused; a backlog listing both is refused at parse
("already lists the same work twice"); each byte-unchanged. Existing
plan-home and plan-link rows stay green.

Behavior: a plan link equal to another entry's anchored home → take, add,
parse → refused, nothing written.

Safe stop: independent of slices 2–4.

### 2. Adopt a backlog whose plan link names a section
Type: Behavior
Status: planned
Proof: a row in `tests/support/product-backlog-adopt.test.mjs` (or its
refusals sibling): a Taken entry linking `slice-plans/N/PLAN.md#ordered-slices`
is adopted like one linking the bare file, the plan's identity recorded once;
existing adoption tests stay green.

Behavior: section plan link → `adopt --all` → the plan file is opened and
adopted.

Safe stop: independent of slices 1, 3 and 4.

### 3. Read a recorded plan with a section by its file in the dashboard
Type: Behavior
Status: planned
Proof: a dashboard readiness spec case using `storyReadinessFixture.ts`: a
story recorded ready with `--plan ../slice-plans/N/PLAN.md#ordered-slices`
and one recorded with its own anchored home as plan both show ready with no
plan-association conflict; the existing readiness specs above stay green;
`npm run typecheck:dashboard` passes.

Behavior: recorded plan `…#section` → dashboard readiness → read by its file,
no conflict.

Safe stop: independent of slices 1, 2 and 4.

### 4. Guard the backlog modules the dashboard bundles
Type: Structure
Status: planned
Proof: a test using `tests/support/pure-module-imports.mjs` asserts that
importing `product-backlog-document.mjs` (and through it
`product-backlog-plan.mjs`) pulls in no `node:` or store module; temporarily
adding `import "node:path"` to `product-backlog-plan.mjs` makes it fail
(recorded here), then reverted.

Structure: keeps the dashboard's browser graph honest; behavior unchanged.

Safe stop: independent of slices 1–3.

## Promise coverage

| Finding / promise | Owner / decisive observation |
| --- | --- |
| F1 | 1: take, add and parse refusals, unchanged |
| F2 | 2: adopt of a section-linked plan |
| F3 | 3: dashboard readiness with anchored recorded plans |
| F4 | 4: import-graph purity test that bites |
| Plan 116 promises | 1–3: existing plan-link, plan-home, startup and readiness suites green |

## Plan review

Four slices, one proof loop each, all independent — each closes one reader
with its own observable proof, so none is a special case of another. They
share one rule: a plan link names the plan by its file, owned by
`product-backlog-plan.mjs`. No numeric slice target was supplied; each is a
small, cohesive change with focused proof.

## Learnings

None yet.
