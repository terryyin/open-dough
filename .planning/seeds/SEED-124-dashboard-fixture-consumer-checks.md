---
id: SEED-124
status: active
planted: 2026-10-09
planted_during: Terry's review of project-specific retrospective findings and priority selection
trigger_when: A commit changes a JavaScript module the dashboard's TypeScript check reads, and only CI's dashboard job would have caught the inferred-signature break
scope: story
---

# SEED-124: Local checks cover the dashboard's shared fixture imports

## Why This Matters

Open Dough maintainers change JavaScript fixtures that the dashboard's
TypeScript journeys import. Focused Node proof twice passed while those
imports failed only in the dashboard CI job, causing a repair cycle after
publication. A repository-local check should expose that consumer failure
before the change leaves the checkout.

## Story

<a id="check-dashboard-fixture-consumers-locally"></a>

### Catch shared fixture signature breaks in the dashboard's local checks

**Identity:** SEED-124#check-dashboard-fixture-consumers-locally
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/286-dashboard-typecheck-commit-gate/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ef016a985052998e7d68b385403536d809c62b44351e34f23ee2affeab844d75","plan":"481a7bedf0e54df7803c686dac36bd9a7d3e6d66c2465b74d3dcf67b4aa93a1b"}}
```

**Beneficiary:** An Open Dough maintainer or agent committing a change to a
JavaScript module that the dashboard's TypeScript check reads, such as the
shared test fixtures under `src/skills/*/scripts/` and `tests/support/`.

**Goal:** A commit that breaks the dashboard's inferred view of a shared
JavaScript module is refused in this checkout, with the dashboard's own
TypeScript diagnostic, before it can be published. Both recorded occurrences
passed the focused Node proof the agent chose, were committed, and failed only
CI's dashboard job, costing a red run and a repair cycle each. After this
story the failure surfaces at the commit, whatever proof was selected, and a
compatible change commits as it does today.

**Observed basis (refinement, 2026-10-10):** The tracked pre-commit hook runs
`npm run lint -- --staged` only; nothing local runs `npm run
typecheck:dashboard` unless a person names it. The dashboard's
`tsconfig.node.json` includes its tests and server with `allowJs`, and about
sixty imports in `dashboard/tests` and `dashboard/server` reach JavaScript
modules under `src/skills/*/scripts/` and `tests/support/`, so a signature
change in any of them, or in a module they import, can change what TypeScript
infers. Removing the default from `landWorktree`'s `identity` parameter
reproduces the finding today: `npm run typecheck:dashboard` fails with TS2345
at `dashboard/tests/preparingJourney.ts(101,38)` naming the missing property,
and passes again once the default is restored. A whole typecheck takes about
five seconds here. The hook's proof, `tests/support/pre-commit-lint-hook.test.mjs`,
already builds a fixture repository from this repository's hook and lint
files, with or without linked dependencies.

**Scope:**

- Decision: the consumer check joins the tracked pre-commit hook, not the
  test runner. The recurring path is a focused proof followed by a commit and
  a publication; a runner job runs only when the whole suite or that job is
  chosen, so it would not have caught either occurrence. The hook runs
  regardless of which proof the agent selected.
- When a commit stages a JavaScript or TypeScript source file, the hook runs
  the dashboard typecheck after the staged lint and refuses the commit when
  it fails, printing the typecheck's diagnostics so the maintainer sees the
  consumer file, position, and the TS error. Any staged script file triggers
  the check: dashboard sources, fixtures, and skill scripts alike. This is
  simpler than computing the typecheck's exact reach, and costs about five
  seconds only on commits that stage a script. Decision: a precise reach
  computed from the typecheck's own file list is excluded unless that delay
  proves troublesome; a hand-kept list of fixture paths is rejected because
  a newly imported module would reopen the gap.
- A commit that stages no script file, such as planning records, Markdown,
  JSON, or shell changes, runs no typecheck and gains no delay. The gate
  stays check-only: it never builds, fixes, restages, or stashes, and like
  the lint gate it checks the working tree that the staged files belong to.
- Without installed dependencies, a commit that stages a script file is
  refused naming the missing tool and `npm ci`, as the lint gate already
  does; a records-only commit still works in a worktree without
  `node_modules`.
- Keep the existing staged lint gate, its proof, CI's lint and dashboard
  typecheck steps, and the test suite's coverage unchanged. Add no runner job
  and no whole-suite run to any change.
- Document the gate where the pre-commit hook is described in
  `docs/installation-platforms-and-update-safety.md`, and name
  `npm run typecheck:dashboard` as the focused command to run by hand in
  `tests/README.md` where shared fixtures are discussed, so the documented
  local route is the gate itself rather than a command to remember.
- Prove the gate in the existing hook proof: a fixture repository with its
  own small JavaScript module, a TypeScript consumer, and a typecheck script,
  where a staged signature break is refused with the TS diagnostic and the
  restored signature commits. Record the repository-level red and green
  observation against DD-171 in `ProjectFindings.md` as the completion
  criterion requires, without committing or publishing the temporary break.
- Deferred, not rejected: covering fixture consumers in other TypeScript
  programs, should one appear, and any change to CI's job layout.

**Key examples:**

- A maintainer removes the default from a destructured parameter of
  `landWorktree` in `dough-land-test-fixtures.mjs`, runs the fixture's Node
  suite green, and stages the file → `git commit` → the commit is refused,
  the output shows TS2345 at the `preparingJourney.ts` call site naming the
  missing property, and HEAD is unchanged.
- The maintainer restores the default and stages the file → `git commit` →
  the typecheck passes and the commit succeeds; CI's dashboard typecheck
  passes on the same revision.
- A maintainer stages only a seed edit under `.planning/` and a Markdown
  guide → `git commit` → no lint tool and no typecheck runs; the commit
  succeeds at once, including in a worktree without `node_modules`.
- A maintainer stages a dashboard TypeScript file that calls a server helper
  with the wrong argument type → `git commit` → the same gate refuses the
  commit with that file's diagnostic; the fixture case is one instance of a
  general check.
- A maintainer stages a script file in a worktree where `npm ci` has not run
  → `git commit` → the commit is refused naming the missing tool and
  `npm ci`, not with a confusing typecheck failure.
- `git commit --no-verify` still skips the hook, as it skips lint today, and
  CI's dashboard job remains the last line.

**Evidence:** [DD-171](../../ProjectFindings.md#dd-171) records two distinct
executions (plans 146 and 191). Repairs `de81cb96` and `716c933b` fixed the
individual signatures; the missing local consumer gate remains. The generic
proof-selection issue is separately retained as ODF-150 in DearDough.md.

**Project boundary:** This story changes Open Dough's repository commit gate,
its proof, and test documentation. It changes no published skill or rule,
installer payload declaration, or generic guidance about consumer proof. A
JavaScript fixture living under `src/skills` does not make the dashboard's
local TypeScript-check wiring a published-runtime defect.

**Completion criterion:** Record the delivered check, implementation revision,
and red/green consumer evidence against DD-171 in ProjectFindings.md. Remove
the active finding only after that evidence confirms the local gate covers
the recurring mechanism; queued work and repaired individual signatures do
not establish resolution.

**Dependencies:** No blocking story prerequisite. The loaded-suite story
owns Playwright interference, not this typecheck gate.

## Breadcrumbs

- [Project retrospective findings](../../ProjectFindings.md#dd-171).
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Repository tests](../../tests/README.md),
  [native setup](../../tests/native-setup.md), and
  [dashboard test configuration](../../dashboard/tsconfig.node.json).
