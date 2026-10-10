# Catch shared fixture signature breaks in the dashboard's local checks

**Identity:** SEED-124#check-dashboard-fixture-consumers-locally
**Source:** [refined story](../../seeds/SEED-124-dashboard-fixture-consumer-checks.md#check-dashboard-fixture-consumers-locally).
**Prepared:** 2026-10-10, planning only, in the established preparation
workspace `/Users/terryyin/git/open-dough/.worktrees/catch-shared-fixture-signature-breaks-in-the-das`
on `claude/catch-shared-fixture-signature-breaks-in-the-das`, under the
preparation assignment for `stanly-chan` (published `1867a0b4`). Publication
target: `origin/main`; integration checkout: `/Users/terryyin/git/open-dough`.

## Goal and boundaries

A commit that breaks the dashboard's inferred view of a shared JavaScript
module is refused in this checkout, with the dashboard's own TypeScript
diagnostic, before it can be published. The failure surfaces at the commit
whatever proof the agent selected, and a compatible change commits as it does
today.

In scope, from the story: the tracked pre-commit hook runs
`npm run typecheck:dashboard` after the staged lint whenever a commit stages a
JavaScript or TypeScript source file, and refuses the commit on failure with
the typecheck's diagnostics; a commit staging no script file runs no typecheck;
the gate stays check-only; without installed dependencies a staged script is
refused naming the missing tool and `npm ci`, and a records-only commit still
works; the gate is documented where the hook is described and
`npm run typecheck:dashboard` is named as the focused by-hand command where
shared fixtures are discussed; the gate is proved in the existing hook proof;
the repository-level red and green observation is recorded against DD-171 in
`ProjectFindings.md`.

Material exclusions, from the story:

- No runner job and no whole-suite run on any change; CI's lint and dashboard
  typecheck steps, the existing staged lint gate, and its proof stay as they
  are.
- No precise reach computed from the typecheck's file list, and no hand-kept
  list of fixture paths: any staged script file triggers the check.
- No coverage of fixture consumers in other TypeScript programs, and no
  change to CI's job layout.
- `git commit --no-verify` still skips the hook.

## Published baseline and integration context

Origin was fetched at the start of planning; the highest allocated plan on
origin and locally is `285-bound-managed-git-transport`, and
`286-dashboard-typecheck-commit-gate` was free immediately before this write.
This workspace holds the refined seed (uncommitted) and the announced
assignment. No North Star topic governs repository commit gates, and no
Accepted ADR is affected: this is repository test tooling and documentation,
not a published skill, rule, or payload. This plan adds no North Star topic.

This workspace's `node_modules` holds only `.tmp`; tools resolve from the
integration checkout's `node_modules` by directory walk-up. The hook proof
links the test root's own `node_modules` into its fixture
(`copyRepositoryFiles` in `tests/support/lint-runner-fixture.mjs`), so
execution runs `npm ci` in this workspace before the first proof
(`tests/native-setup.md`).

## Existing solutions and selected approach

PFE, within this repository's commit tooling:

- **Change** `.githooks/pre-commit`: it is the one local gate every commit in
  the checkout and its worktrees passes, already check-only, already
  documented, and already run first through `npm run lint -- --staged`. The
  typecheck step follows the lint step in the same script, so the lint gate's
  existing missing-tool refusal (`eslint: not found on PATH` with `npm ci`,
  from `scripts/lint.mjs`) covers the no-dependencies case before the
  typecheck can run. Selecting staged script files uses the same Git listing
  `lint.mjs` uses (`git diff --cached --name-only --diff-filter=ACMR`) with
  the same extension set; nothing is extracted from `lint.mjs`, which stays
  the lint runner for CI and by-hand runs.
- **Reuse** `tests/support/pre-commit-lint-hook.test.mjs` and its
  `hookFixture`: a committed throwaway repository built from this
  repository's hook, lint runner, and configs, with linked dependencies or
  none, and a tool-less `PATH` variant. The fixture already writes a
  `tsconfig.json` (for typed ESLint) and stages `src/*.ts` files, so the
  typecheck joins it by giving the fixture a `typecheck:dashboard` script over
  its own tiny JavaScript module and TypeScript consumer.
- **Not changed:** `package.json`'s `typecheck:dashboard`, `dashboard/tsconfig*.json`,
  `scripts/test.sh`, and `.github/workflows/ci.yml`.

## Outside-in proof

| Promise (story key example) | Owning slice | Observable proof |
| --- | --- | --- |
| A staged signature break that passes Node proof is refused with TS2345 naming the consumer; HEAD unchanged | 1 | hook proof: fixture consumer `src/consumer.ts` calls `src/fixture.mjs` without a parameter whose default was removed; commit refused, output matches the TS2345 line naming `src/consumer.ts` and the property; HEAD equal to before |
| The restored signature commits; CI's dashboard typecheck passes on that revision | 1 | hook proof: the default restored and staged commits with status 0; CI `dashboard` job's type-check step on the published revision |
| Records-only and Markdown commits run no typecheck and succeed without `node_modules` | 1 | existing test "a records-only commit succeeds without lint tools" (tool-less `PATH`, no dependencies: a typecheck run would fail there) |
| A staged dashboard TypeScript type error is refused by the same gate | 1 | hook proof: a staged `src/*.ts` with a wrong argument type is refused with its own TS diagnostic (the fixture case is one instance of the general check) |
| A staged script without `npm ci` is refused naming the tool and `npm ci` | 1 | existing test "a staged file whose tool is missing is refused naming the tool and npm ci" stays green with the typecheck step present |
| Clean staged TypeScript, JSON, and shell files still commit unchanged; the gate stays check-only | 1 | existing tests "clean staged … commit unchanged", "staged formatting drift is refused and nothing is changed", and the prepare/linked-worktree test stay green |
| Documented local route is the gate itself; focused command named | 1 | `docs/installation-platforms-and-update-safety.md` hook paragraph and `tests/README.md` fixtures section read as the story scope states |
| Repository-level red and green evidence recorded against DD-171; the finding resolved | 2 | `ProjectFindings.md` DD-171 entry carries the refused-commit output (TS2345 at `preparingJourney.ts`) and the green commit revision; the active entry moves to the resolved list with a recovery reference |

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| Removing the default from `landWorktree`'s `identity` parameter fails `npm run typecheck:dashboard` with TS2345 at the journey call site, and restoring it passes | slice 2's demonstration; the story's first two examples | Refinement, 2026-10-10: edited `dough-land-test-fixtures.mjs`, ran `env -u NODE_ENV npm run --silent typecheck:dashboard`, restored with `git checkout --` | Red: `dashboard/tests/preparingJourney.ts(101,38): error TS2345 … Property 'identity' is missing`; green after restore, exit 0; checkout clean |
| A minimal `allowJs` program reproduces red and green under this repository's `tsc`, so the hook fixture can own the proof without the dashboard | slice 1's fixture design | Planning, 2026-10-10: `tsconfig.json` `{strict, module esnext, target esnext, moduleResolution bundler, allowJs, checkJs false, noEmit, include src}` with `src/fixture.mjs` (`land({ worktree, identity = undefined })`) and `src/consumer.ts` (`land({ worktree: "w" })`); `node <typescript>/bin/tsc -p tsconfig.json` | Green exit 0 with the default; red exit 2 `src/consumer.ts(2,38): error TS2345 … Property 'identity' is missing` without it |
| The hook's lint step runs first and already refuses a staged script without tools, so the typecheck step needs no missing-tool handling | slice 1's hook shape and the no-dependencies example | Read `.githooks/pre-commit` (`exec npm run --silent lint -- --staged`), `scripts/lint.mjs` `run()` ENOENT branch, and the existing test "a staged file whose tool is missing…" with `toolless` `PATH` and `dependencies: false` | The lint step exits 1 naming `eslint: not found on PATH` and `npm ci` before any later step; the typecheck step is reached only with dependencies installed, where `typescript` 6.0.3 is a locked devDependency |
| The records-only test stages no script file, so it observes that the gate skips the typecheck | slice 1's "no script, no typecheck" proof | Read the existing test: stages `.planning/agents/x.json` and `.planning/seeds/SEED-1.md` under a `PATH` of node, npm, git, env, sh with no `node_modules` | A typecheck run there would fail (`tsc` absent), so the test staying green proves the skip |
| The fixture's typed ESLint accepts a `src/*.ts` consumer | slice 1's fixture additions | Read `eslint.config.mjs` (`projectService: true` for `**/*.{ts,mts,tsx}`) and the existing test "clean staged TypeScript and JSON files commit unchanged" staging `src/a.ts` under the fixture's `tsconfig.json` `include: ["src"]` | Consumer files under `src/` are linted through the fixture's own tsconfig today |
| Added `tsc` runs fit the hook proof's budget | slice 1's timing step | `bash scripts/ci-test-times.sh tests/support/pre-commit-lint-hook.test.mjs`, 2026-10-10 | Job 9.1–15.3 s, ceiling 71 s, headroom 55.7, spread 6.2, **wide**; share totals thin (project from 372.6, 354.3, 355.3 against 470) |
| The whole dashboard typecheck costs about five seconds here | the story's cost decision | Refinement: two timed runs of `npm run --silent typecheck:dashboard` | 4.8 s and 4.6 s wall |

The job line is wide, so slice 1 pushes without local timing of the job
itself. The share totals are thin, so slice 1 runs one paired A/B of the hook
proof under current load (`OPEN_DOUGH_TEST_TIMES`, before and after the
change), applies the ratio to the job's recent highest (15.3 s), and adds that
increase to each share's recent highest; a projection at or over 470 splits
the test file in the same slice (`tests/time-budget.md`).

## Ordered slices

### 1. The pre-commit hook refuses a staged script change that fails the dashboard typecheck
Type: Behavior
Status: done
Accepted proof: `npm test -- tests/support/pre-commit-lint-hook.test.mjs
tests/support/pre-commit-typecheck-hook.test.mjs` exit 0, 13 tests (10
existing, 3 new), and `npm run format` clean. The refactor pass moved
`hookFixture`, `head`, and `stage` to `tests/support/pre-commit-hook-fixture.mjs`
and the three new tests to `tests/support/pre-commit-typecheck-hook.test.mjs`,
which runs as its own job; it also moved the README's native host streams
section to `tests/native-host-streams.md` for the file-size check. Red
check: the new tests against the previous hook fail (a) and (c) only.
Timing, five interleaved pairs of the hook proof under load (before/after
seconds): 10.6/16.5, 9.3/25.2, 14.9/23.2, 20.8/19.9, 12.5/25.4; ratio of sums
1.62 projects the job at 24.8 s (ceiling 71) and the shares at 382.1, 363.8,
364.8 (ceiling 470); the worst pair (2.71) projects 398.8 at most. No split
for budget.
Proof: `npm test -- tests/support/pre-commit-lint-hook.test.mjs` (every test,
existing and new) and `npm run lint`. New tests in that file, on the
extended `hookFixture`: (a) the fixture's `src/fixture.mjs` default removed
and staged → commit refused, output matches `src/consumer.ts` with
`TS2345` and the missing property, HEAD unchanged, index and working tree
unchanged; (b) the default restored and staged → commit succeeds; (c) a
staged `src/*.ts` with a wrong argument type → refused with its own TS
diagnostic. Existing tests prove the records-only skip, the missing-tool
refusal, clean commits, check-only behavior, and the linked-worktree hook.
Timing: the paired A/B projection above, recorded here with its numbers.

Behavior: a commit stages at least one `.js`, `.cjs`, `.mjs`, `.jsx`, `.ts`,
`.mts`, or `.tsx` file and the staged lint passes → the hook runs
`npm run --silent typecheck:dashboard` from the checkout root → on failure the
commit is refused with the typecheck's diagnostics printed, and nothing is
built, fixed, restaged, or stashed; on success the commit proceeds. A commit
staging no such file runs only the lint step as today.

Changes: `.githooks/pre-commit` (POSIX sh, ShellCheck- and shfmt-clean: lint
step, then the staged-script test with the Git listing above, then the
typecheck); `tests/support/pre-commit-lint-hook.test.mjs` (`hookFixture`
gains a `typecheck:dashboard` script in its `package.json`, `allowJs`,
`checkJs: false`, `noEmit`, and `moduleResolution: "bundler"` in its
`tsconfig.json`, `src/fixture.mjs`, and `src/consumer.ts`; the new tests;
the `prepare` test stays as is); `docs/installation-platforms-and-update-safety.md`
(the hook paragraph states the typecheck step, its trigger, and that a
records-only commit still needs no tool); `tests/README.md` (the fixtures
paragraph names `npm run typecheck:dashboard` as the by-hand check for a
shared fixture consumed by `dashboard/tests` and that the commit gate runs
it). The slice's own commit stages a script file, so its success is the first
real green pass through the new gate.

### 2. DD-171 records the repository-level red and green evidence and is resolved
Type: Behavior
Status: done
Accepted proof: on `b78500a4` with a clean checkout, the staged default
removal in `dough-land-test-fixtures.mjs` was refused by `git commit` (exit
1) with `dashboard/tests/preparingJourney.ts(101,38): error TS2345` naming
the missing `identity` property; HEAD unchanged; the file restored and
`git status --porcelain` empty; `npm run typecheck:dashboard` exit 0 after
the restore. Green: slice 1's commit `b78500a4` passed the gate, and CI run
`38025090499` completed the `dashboard (9/9)` job's type-check step with
success. `ProjectFindings.md` holds the resolved entry under the kept
`dd-171` anchor, with recovery reference `b78500a4`.
Proof: in this workspace, after slice 1 is committed: remove the default from
`landWorktree`'s `identity` parameter, stage the file, run `git commit`
(expected: refused; output holds
`dashboard/tests/preparingJourney.ts(101,38): error TS2345` and the missing
property; HEAD unchanged), then `git restore --staged --worktree` the file
and confirm `git status --porcelain` shows only this slice's edits. Keep the
refused output verbatim for the record. The green evidence is slice 1's
commit (a staged script file passed the gate) and the CI `dashboard` job's
type-check step on the published revision, named by run id once published.

Behavior: `ProjectFindings.md` → this slice's edit → DD-171's entry records
the delivered check (`.githooks/pre-commit` typecheck step), the
implementation revision (slice 1's commit), the refused-commit output above,
and the green commit; the entry then leaves the active findings for the
"Resolved or mitigated entries" list dated 2026-10-10 with a recovery
reference to the revision that last held the active entry, following that
file's existing convention; the priority assessment's second item and the
"Local checks miss the dashboard's typed fixture imports" section are updated
or removed consistently so no active entry or follow-up link to a queued
story remains for DD-171. Nothing in `DearDough.md` changes; ODF-150 keeps
the generic proof-selection concern there. The temporary break is never
committed or published.

## Current decisions

- The gate lives in the hook, not the runner or `lint.mjs`; any staged script
  file triggers the whole dashboard typecheck (story decision).
- The fixture's typecheck script is named `typecheck:dashboard` because the
  hook invokes that script name; the fixture's program is its own tiny
  module and consumer, not the dashboard.
- Lint runs before the typecheck so the missing-tool refusal stays the lint
  runner's one message.

## Learnings

- A parameter destructured in plain JavaScript infers as `any`, so the
  wrong-argument-type example needs a TypeScript-typed function; the fixture
  module can show only the missing-property break.
- "Default restored and staged" equals HEAD unless the break was committed,
  so the restored-signature test commits the break with `--no-verify` first.
