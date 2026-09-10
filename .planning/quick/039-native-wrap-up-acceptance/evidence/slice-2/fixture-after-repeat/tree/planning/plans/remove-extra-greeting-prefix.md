# Remove extra greeting prefix

## Source and provenance

Source: Trim names retrospective finding that `src/greet.mjs` prints an
unrequested `Hey ` prefix before `Hello`.
Provenance locator: before-cleanup commit
`4fb462f8475fc430036de3bad32c95ec6a919930`, repository-relative paths
`planning/plans/trim-names.md` and
`planning/plans/trim-names/evidence/cli-run.txt`.

## Beneficiary and bounded outcome

Beneficiary: A CLI user who asked only for trimmed names.
Bounded outcome: The greeting line is `Hello, {name}!` with no extra prefix.

## Current findings and scope

Finding: Trim names accidentally left `Hey ` in the printed greeting.
Scope: Remove that prefix from `src/greet.mjs` and align tests. No other CLI
changes. Do not add Formal titles work in this correction.

## Preserved promises and genuine constraints

Preserve trim of surrounding whitespace, internal spaces, Guest default, and the
first-argument-only name source. Genuine constraint: no `--formal` flag in this
correction. Executable later-work note: keep the Guest default and first
command-line argument as the only name source after the prefix is removed.

## Observable proof ownership

`node --test test/greet.test.mjs` owns: no-argument default ("Hello, Guest!"),
leading/trailing whitespace trim ("  Ada  " → "Hello, Ada!"), internal spaces
preserved ("Ada Lovelace" → "Hello, Ada Lovelace!").

## Current decisions

Keep this plan as the canonical active home. Do not create a seed. Do not
replan Formal titles here.

## Slices

### 1. Print Hello without an extra prefix

Type: Behavior
Status: planned
Behavior: CLI receives a name → prints `Hello, {name}!` with no `Hey ` prefix;
trim, internal spaces, and Guest default remain.
Proof:
  command: node --test test/greet.test.mjs
  covers: no-argument default ("Hello, Guest!"), trim ("  Ada  " → "Hello, Ada!"), internal spaces ("Ada Lovelace" → "Hello, Ada Lovelace!"), extra prefix absent
  result: pending
