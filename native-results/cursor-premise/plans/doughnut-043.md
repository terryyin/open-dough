# Commit a finished slice while other slices are still in progress

Work item: **SEED-043#story-1**.
Source: [refined story](../../seeds/SEED-043-commit-gate-checks-committed-changes.md#story-1)
(owner decisions 2026-09-26; DD-121 correction).

## Goal and scope

A coordinator or contributor can format and commit a finished, staged frontend
change while other agents’ unfinished edits sit unstaged or untracked in the
same checkout. When staged paths select the frontend, the pre-commit gate runs
Biome and `vue-tsc` against a temporary copy of the index (always), leaves the
working tree and index unchanged, and cleans up the copy. The frontend `format`
script runs Biome only (`vue-tsc` leaves it). Committed content stays as strict
as today.

Excluded (see the story): backend, CLI, mcp-server, test-fixtures, root and
OpenAPI still check the working tree; `format:changed` file selection and Biome
rewriting other slices’ files; CI check set; shared concurrent-slice rule and
other shared-checkout findings; making `vue-tsc` faster or caching it.

## Architecture

- **PFE:** Reuse `scripts/quality_changed.sh` (component selection from staged
  paths for lint; `pnpm <component>:lint|format` today) and the existing Bach
  harnesses in `scripts/test/quality_changed.test` and
  `scripts/test/pre-commit.test`. The gate entry remains
  `scripts/git-hooks/pre-commit` → `pnpm lint:changed`. Do not invent a second
  commit hook or a stash-based isolation path (owner rejected stash).
- **Frontend lint on the index:** For lint mode when `frontend` is selected,
  materialize the index with `git checkout-index` into a disposable directory,
  give the tools the repo’s installed dependencies without copying ignored
  trees into Git state (symlink `node_modules` from the real checkout as needed),
  run Biome check and `vue-tsc --noEmit` against that tree, then delete the
  directory. Other components keep today’s working-tree `pnpm …:lint`.
- **Format:** Only `frontend/package.json` `format` drops `vue-tsc`;
  `frontend:lint`, `frontend:build`, and CI `lint:all` keep typechecking
  (DD-073 preserved).
- **No North Star / ADR:** Script-local gate behavior; no domain or product
  boundary change.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| `frontend` `format` and `lint` both run `vue-tsc --noEmit` today | Read `frontend/package.json` scripts | `format`: `biome check --write . && vue-tsc --noEmit`; `lint`: `biome check . && vue-tsc --noEmit` |
| Lint mode selects from the index and runs component lint in the repo root working tree | Read `scripts/quality_changed.sh` | Staged-only file list; `pnpm frontend:lint` runs with `cd "$REPO_ROOT"` |
| Pre-commit only invokes `lint:changed` and must leave tree/index unchanged | Read `scripts/git-hooks/pre-commit`; Bach `scripts/test/pre-commit.test` | `exec ./scripts/run.sh pnpm lint:changed`; success and lint-failure scenarios assert unchanged status/index/worktree |
| Component selection and staged-vs-working-tree behavior already have Bach proof | Read `scripts/test/quality_changed.test` | Fake `pnpm` asserts format sees unstaged/untracked; lint sees only staged components |
| Index materialization yields HEAD+staged content without unstaged/untracked or ignored `node_modules` | `git checkout-index -a --prefix=<tmpdir>/` in this checkout | Exit 0; ~1.0 s; `frontend/package.json` and tracked `packages/generated/donut-backend-api` present; `frontend/node_modules` absent |
| A cold `vue-tsc` on such a copy is acceptable and works without untracked generated files | Story cost measurement 2026-09-26 (owner accepted) | Copy 0.8 s, Biome 0.8 s, cold `vue-tsc` 19.5 s; copy type-checked without untracked generated files |
| Exact dependency wiring (which `node_modules` links, whether to call `pnpm -C frontend lint` vs direct biome/`vue-tsc`) for a green copy lint | Cheap parts above only; this disposable checkout has no installed `node_modules` | Unsettled cheaply here → early probe slice 2; failure stops slice 3 and revises the plan |

## Key examples → proof

| Promise (story key example) | Slice | Proof |
| --- | --- | --- |
| 2. Unstaged TS error no longer stops `format:changed` | 1 | `frontend/package.json` `format` is Biome-only; existing `quality_changed` format selection still calls `frontend:format` |
| 1. Unstaged Biome error does not block commit of staged frontend | 3 | Extend `scripts/test/quality_changed.test` (lint + frontend staged, unstaged format-broken file) |
| 3. Staged type or format error still rejects | 3 | Same Bach suite: staged broken content → non-zero |
| 4. Staged removal breaks an unchanged committed consumer → reject | 3 | Bach scenario with index containing broken program |
| 5. Staged import of export that exists only unstaged → reject | 3 | Bach scenario: copy lacks unstaged export |
| 6. Pass or fail leaves working tree/index unchanged; no copy left | 3 | Assert status/index/worktree unchanged and temp path gone (pattern from `pre-commit.test`) |
| Probe: copy + linked deps can run Biome and `vue-tsc` | 2 | One local run in an execution checkout that has `node_modules` |

## Slices

### 1. Frontend format runs Biome only
Type: Behavior
Status: planned
Proof: `frontend/package.json` `format` is `biome check --write .` with no
`vue-tsc`. `pnpm frontend:lint` / `build` still typecheck. No new product
behavior beyond story example 2’s format half.

Behavior: a coordinator running `format:changed` that selects frontend no
longer fails on another slice’s unstaged type errors; formatting still rewrites
via Biome as today.

### 2. Probe frontend checks on an index copy
Type: Structure
Status: planned
Proof: In a checkout with installed dependencies, materialize the index to a
temp dir, link the dependency roots the tools need, run Biome check and
`vue-tsc --noEmit` for frontend against that tree, and remove the temp dir.
Record the exact commands and link layout in this plan’s Learnings. On failure,
stop; do not start slice 3 until the plan’s copy approach is revised.

Enables: slice 3’s gate behavior. Preserves external gate behavior until
slice 3 lands (probe must not change the hook’s production path yet, or must
revert if abandoned).

### 3. Frontend lint:changed checks the index copy
Type: Behavior
Status: planned
Proof: Extend `scripts/test/quality_changed.test` (and `pre-commit.test` if the
hook path needs an extra unchanged-state case) for key examples 1 and 3–6:
staged-only frontend content is what Biome/`vue-tsc` see; unstaged/untracked
noise does not fail a clean staged tree; staged defects and “export only in
unstaged” still fail; repository state and temp cleanup hold. Run
`bash scripts/test/quality_changed.test` and `bash scripts/test/pre-commit.test`
(via the project’s usual script-test runner when required).

Behavior: when lint mode selects `frontend`, `quality_changed.sh` always runs
frontend Biome and `vue-tsc` against a temporary index copy using the recipe
from slice 2, then deletes the copy. Working tree and index stay untouched.
Other components unchanged. Align `linting_formating` skill wording if it still
implies the frontend gate typechecks the working tree.

## Current decisions

- Plan path is `.planning/quick/043-…` (next after highest allocated `042` in
  this checkout). The seed’s earlier `045-…` link was a pre-write path and is
  updated to this plan; numbers 043/044 were not occupied here.
- Always use an index copy for frontend lint in `lint:changed`, not only when
  the worktree differs (owner decision).
- Do not stash; do not check only staged file paths in isolation for
  typechecking (owner decisions).
- Local proof is the Bach script tests above; CI `lint:all` remains the hosted
  full check and is not a local gate for this change.

## Learnings

None yet.
