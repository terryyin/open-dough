# Wire migrated publication suites into the default runner

Status: planned; execution has not started.

## Source and outcome

Identity: bounded retrospective correction from
SEED-008#migrate-git-branching-and-integration /
`.planning/quick/070-integration-through-origin/PLAN.md`
("Integration through origin").

Provenance: first related implementation commit
`a8eab76edb1df66ab618af5b09c6411b975dbbe7`; tip reviewed
`1044dd0969c419faa0c23b17a9a6f844015c4bc8`.

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

## Ordered slices

### 1. Discover and run the migrated caller suites from scripts/test.sh

Type: Behavior
Status: planned

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
command: PATH="/opt/homebrew/bin:$PATH" bash <new-or-extended-tests-sh>
boundary: regression discovery for migrated R/B/ownership Git suites
setup: none beyond ordinary checkout dependencies
observations: all four suites execute and PASS; a temporary assertion
  flip in one suite fails the runner and is restored
result: (record on execution)
```

Sizing: one wiring gate, high confidence. Safe stopping point: ordinary
`npm test` regresses R, B, and workspace-ownership lifecycle proof.
