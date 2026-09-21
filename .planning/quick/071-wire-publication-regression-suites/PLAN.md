# Wire migrated publication suites into the default runner

Status: done; all slices delivered.

## Source and outcome

Identity: bounded retrospective correction from SEED-008#migrate-git-branching-and-integration
(spent history recoverable at
`52a7e630037aa0bca1295a3399758aba15aba29e:.planning/quick/070-integration-through-origin/PLAN.md`,
"Integration through origin").

Provenance: first related implementation commit
`a8eab76edb1df66ab618af5b09c6411b975dbbe7`; tip reviewed
`1044dd0969c419faa0c23b17a9a6f844015c4bc8`; before-cleanup
`52a7e630037aa0bca1295a3399758aba15aba29e`.

A developer running this project's ordinary `npm test` /
`scripts/test.sh` regression path exercises the migrated preparation
publication (R), bug-triage retention (B), and shared workspace-ownership
lifecycle suites that plan 070 accepted as maintained proof, so a later
edit cannot silently drop those Git outcomes.

## Current findings and scope

Plan 070's proof conventions required wiring maintained deterministic
suites into the existing test runner as they landed. At tip
`1044dd0`, these suites exist and pass under focused `node --test`
commands recorded in Accepted proof blocks, but no `tests/*.sh` entry
invokes them, so `scripts/test.sh` (which only discovers `tests/*.sh`)
never runs them:

- `src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs`
- `src/skills/dough-story-refinement/scripts/preparation-publication-resume.test.mjs`
- `src/skills/dough-bug-fixing/scripts/retained-artifacts.test.mjs`
- `src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs`

Already covered without this correction: `dough-execute-plan/scripts/*.test.mjs`
via `tests/execution-ci-runtime.sh`; closure via `tests/closure-publication.sh`;
credential-free native harness via `tests/git-publication-native.sh`.

## Preserved behavior and constraints

- Do not change publication, preparation, retention, or ownership product
  behavior. Only regressability of existing Git-mechanics proof.
- Do not invent a second test framework. Reuse `node --test` and a thin
  `tests/*.sh` wrapper discovered by `scripts/test.sh`.
- Do not expand into live native host acceptance, CI-observer repair, or
  renaming `publication-test-fixtures.mjs` (cross-subsystem; separate
  decision).
- Preserve ADR 0005's distinction: mechanical suite wiring is not native
  agent evidence.

## Key examples

1. **Ordinary regression:** From a clean checkout at a revision that
   includes these suites, `PATH` with Bash 4+ and `npm test` /
   `bash scripts/test.sh` runs a discovered `tests/*.sh` entry that
   executes the four suites above; they PASS.
2. **Break detection:** A deliberate flip of one observable assertion in
   `preparation-publication.test.mjs` (or sibling) makes that same runner
   entry FAIL; restoring it PASSes.
3. **No product drift:** Diff touches only the runner wiring (and, if
   needed, a one-line comment pointing at R/B inventory labels). No
   skill guidance or runtime module behavior changes.

## Execution identity

- Mode: Story Branch Mode
- Originating / integration checkout: `/Users/terryyin/git/open-dough` on `main`
- Authorized remote target: `origin/main`
- Execution checkout: `/Users/terryyin/git/open-dough-worktrees/071-wire-publication-regression-suites`
- Execution branch: `claude/071-wire-publication-regression-suites`
- Claim published revision: `736d5de031a163d61c4cd57db52ab1024273d4a3` (trunk claim; Story Branch `pendingCi: unobserved`)
- Retained published revisions (this execution): `736d5de031a163d61c4cd57db52ab1024273d4a3`
- CI observer: `/tmp/dough-ci-501/watch-ka1DKK` observing `terryyin/open-dough` branch `claude/071-wire-publication-regression-suites` (GitHub Actions workflow `ci.yml` / `CI`)
- Replanning permission: existing planning authority retained (no `--no-replan`); `--skip-retro` requested

## Current decisions

- The wrapper globs `*.test.mjs` per skill directory, like
  `tests/execution-ci-runtime.sh`, instead of listing the four files, so a
  suite added to those directories is not orphaned. At delivery the globs
  resolve to exactly the four suites above.
- The wrapper is capability-named (`tests/workspace-publication-callers.sh`)
  and carries no comment pointing at R/B inventory labels: those are spent
  plan-070 planning vocabulary.
- Considered and excluded as unapproved scope: a guard failing when any
  tracked `*.test.mjs` is unreachable from `scripts/test.sh`.

## Ordered slices

### 1. Discover and run the migrated caller suites from scripts/test.sh

Type: Behavior
Status: done

Add one thin `tests/*.sh` entry (or extend an existing same-purpose
runner if one already owns these skills) that invokes:

```text
node --test --test-concurrency=1 \
  src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs \
  src/skills/dough-story-refinement/scripts/preparation-publication-resume.test.mjs \
  src/skills/dough-bug-fixing/scripts/retained-artifacts.test.mjs \
  src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs
```

Ensure `scripts/test.sh`'s `find tests -name '*.sh'` discovers it.
Reuse existing fixture helpers already imported by those suites. Do not
re-implement publication behavior.

Proof:

```text
command: PATH="/opt/homebrew/bin:$PATH" bash tests/workspace-publication-callers.sh
boundary: regression discovery for migrated R/B/ownership Git suites
setup: none beyond ordinary checkout dependencies
observations: all four suites execute and PASS; a temporary assertion
  flip in one suite fails the runner and is restored
result: pass under Bash 5.3.20 — exit 0, 14 tests / 14 pass; with the
  `maintenanceFromInspection(...) "deferred"` assertion in
  `preparation-publication.test.mjs` temporarily flipped, exit 1 with
  13 pass / 1 fail; restored, exit 0. `scripts/test.sh`'s
  `find tests -type f -name '*.sh' ! -path 'tests/support/*'` lists the
  wrapper. Post-change refactor: no edits.
```

Sizing: one wiring gate, high confidence. Safe stopping point: ordinary
`npm test` regresses R, B, and workspace-ownership lifecycle proof.
