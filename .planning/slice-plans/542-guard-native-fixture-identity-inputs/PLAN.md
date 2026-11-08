# Guard native fixture identity inputs against drift

**Source:** [Guard native fixture identity inputs against drift](../../seeds/SEED-262-faster-dashboard-test-feedback.md#guard-native-fixture-identity-inputs)

**Identity:** SEED-262#guard-native-fixture-identity-inputs

## Provenance and findings

Correction of
[SEED-262#migrate-git-publication-native-fixtures](../../seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-git-publication-native-fixtures)
(plan 534), from its execution retrospective. Reviewed commits: `e33993231`,
`7d62c61b5`, `b5851b452`, `b8bce3969`, `cd5b0ddb0`, `970bfbb5f`.

1. `git_publication_installer_input_hash_lines` in
   [the fixture identity](../../../tests/support/git-publication-native-fixture-identity.sh)
   lists twelve `src/install/*.sh` files and two `.mjs` closure roots by hand.
   Today it covers every tracked `src/install` file. About ten installer
   helpers were added between 2026-09-06 and 2026-10-13. The family checks in
   `tests/git-publication-fixture-identity.sh` sample two installer inputs, and
   the closure-completeness check in `tests/native-evidence-identity.sh`
   follows only `.mjs` imports. A new sourced helper would leave every family
   identity looking complete while omitting a fresh-install input. The
   original story promises that each identity covers the inputs its fixture
   uses and that a failed read cannot yield an apparently complete identity.
2. `withoutTemplateText` in
   [the closure tool](../../../tests/support/native-import-closure.mjs) is
   covered only by the one-shot notes case in
   `tests/git-publication-fixture-identity.sh`. Valid JavaScript such as
   `const x = i++ / 2;` makes the tool exit 1 with "unterminated / literal",
   which fails any identity whose closure reaches such a module.
3. `tests/git-publication-fixture-identity.sh` rechecks hash sensitivity for
   four `src/` inputs that `tests/native-evidence-identity.sh` already
   changes and checks for every family. This duplication costs code only.

## Goal and scope

Keep each fixture family identity complete for installer inputs as they are
added, and keep the closure tool from failing valid modules. Preserve the
current identity rows for unchanged inputs, generated template text staying
data, loud failure on unreadable or genuinely unterminated input, and the
historical records under `tests/fixtures/native-streams`. Excluded: the
payload-hashing breadth and normalized repository keys, which remain
[SEED-262](../../seeds/SEED-262-faster-dashboard-test-feedback.md) direction
questions.

## Current decisions

- Derive the installer shell inputs from the tracked `src/install` files
  rather than a literal list, keeping `.mjs` files under the import closure.
  The installed source choice and payload declaration reading stay the same.
- Guard completeness in `tests/git-publication-fixture-identity.sh`: every
  tracked `src/install` file appears in each family identity.
- Fix the lexer's division context for postfix `++`/`--` and add a
  `node:test` file beside the tool. Keep it dependency-free, because the
  identity checks copy only `tests` and `src` into scratch.
- Remove the four duplicated `src/` sensitivity checks from
  `tests/git-publication-fixture-identity.sh` and keep its two `tests/` input
  checks.

## Local gates

Follow [test automation](../../../AGENTS.md#test-automation) and the
[failing and flaky tests policy](../../../AGENTS.md#failing-and-flaky-tests)
as written. Run focused checks through `bash scripts/test.sh` with Bash 5 first
on `PATH`, under `caffeinate -s -i` on AC power
([machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).
Keep both identity checks within the 64 s CI per-job ceiling in
`tests/time-budget`, judged against their `tests/longest-first` entries scaled
by a local base run. Run `npm run lint` before committing.

## Slices

### 1. Every family identity covers each installer input

Type: Behavior

Status: planned

Behavior: A tracked `src/install` file is added or changed → every startup,
admission, one-shot and owned-context identity hashes it, and the family
check fails when an identity omits one.

Proof: `tests/git-publication-fixture-identity.sh` asserts each tracked
`src/install` file is in each family identity. In scratch, add a sourced
`src/install` shell helper and observe it hashed. Restore the literal list in
scratch and observe the new assertion fail. Run both identity checks and
`tests/git-publication-native.sh`.

### 2. The closure tool reads valid division and regular-expression forms

Type: Behavior

Status: planned

Behavior: A reached module uses division after a postfix operator, a regular
expression after a keyword, a regular expression with a backtick or `/` in a
character class, nested or escaped template text → the tool lists its real
imports and none inside template text; a genuinely unterminated literal still
exits non-zero.

Proof: a new `tests/support/native-import-closure.test.mjs` covering each
shape, failing first on `i++ / 2`. Run it, both identity checks and
`tests/native-stream-replay.sh`.

## Decisive premises

| Premise | Consuming operation and result |
| --- | --- |
| The literal installer list covers every tracked `src/install` file today. | `git ls-files src/install` at `970bfbb5f` lists twelve `.sh` files, all in the literal list, and four `.mjs` files reached from `open-dough-payload-bytes.mjs` and `open-dough-register-hooks.mjs`. |
| Valid postfix division fails the closure. | `node tests/support/native-import-closure.mjs <dir> <dir>/post.mjs` on `let i = 0; const x = i++ / 2; import { a } from "./a.mjs";` exited 1 with `unterminated / literal … post.mjs:2`. |

## Concern evidence

Refinement was unnecessary: each slice owns one proof boundary and one
outcome. This review identified no remaining slice-specific concern.
