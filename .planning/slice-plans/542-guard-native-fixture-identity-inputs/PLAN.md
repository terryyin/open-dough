# Guard native fixture identity inputs against drift

**Source:** [Guard native fixture identity inputs against drift](../../seeds/SEED-262-faster-dashboard-test-feedback.md#guard-native-fixture-identity-inputs)

**Identity:** SEED-262#guard-native-fixture-identity-inputs

**Source review:** [source-only commitments](source-review.md)

## Execution context

- Established story-branch execution in this worktree on
  `codex/guard-native-fixture-identity-inputs-against-dri`, agent `viktor-chan`,
  publisher `dashboard-territory.local-open-dough`; origin target `main`.
- Starting revision `ca082e09ffec4b551a8389265305f469de2208a5`; accepted claim
  `a328505ac31b8da3f972b6eb6c47840170d90e80` on origin/main and the story branch.
  No second claim. The story-branch observer does not cover the trunk claim.
- Checkout setup: exact Node 24.21.0, locked npm setup, browser setup and
  Chromium prerequisite check passed in this worktree on 2026-11-09.
- Replanning authority remains the selected planned execution; no numeric slice
  target or hard limit supplied. Each slice keeps one behavior/proof loop.
- Local proof decision: this macOS host has AC power, no swap or memory pressure,
  load about 4.2, other Node work with no known competing owned heavy proof.
  Run only named checks with the default four slots under `caffeinate -s -i`,
  Bash 5 first on PATH. Reconsider on contention or unexplained timing failure.
- CI: GitHub Actions `ci.yml` has push coverage for the story branch. The
  workflow diagnostic was held by GitHub's directed rate-limit wait. One live
  checkout-bound Codex stream is armed: coordinator `viktor-chan-262`, cell
  `g10:22`, session `18974`, directory `/tmp/dough-ci-501/watch-Yfc4hu`, PID
  `99839`, repository `terryyin/open-dough`, target
  `codex/guard-native-fixture-identity-inputs-against-dri`.
  It reported `CI_MONITOR_THROTTLED` and resumes automatically at
  `2026-11-09T00:08:55.816Z`; coverage verdicts remain pending.
- After that directed wait, workflow diagnostic verified active `ci.yml`,
  workflow ID `351271804`, display name `CI`.
- Slice 1 delivery accepted `fc234b7f9c8ae40d8c1a60ecd5e1440ec32a0e3e`
  on the remote story branch, suffix base
  `a328505ac31b8da3f972b6eb6c47840170d90e80`; the same observer was reused.
  Formatting, full lint and check-only commit hooks passed. No trunk
  publication or default-checkout refresh occurs for this increment.
- Pre-change proof passed at the claim revision:
  `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_TIMES=/tmp/seed262-guard-identity-baseline-times caffeinate -s -i bash scripts/test.sh tests/git-publication-fixture-identity.sh tests/native-evidence-identity.sh`.
  Local times: family check 11.7 s; native evidence check 17.4 s.
  `tests/longest-first` records only the native evidence check (34.5 s),
  giving a local/recorded factor of 17.4/34.5. Use that factor for both
  checks against the unchanged 64 s ceiling; do not invent a missing entry.

## Provenance and findings

Correction of
SEED-262#migrate-git-publication-native-fixtures
(`f40a29409bd3baf728caf54c50690448a88c6b1c:.planning/seeds/SEED-262-faster-dashboard-test-feedback.md#migrate-git-publication-native-fixtures`;
plan `f40a29409bd3baf728caf54c50690448a88c6b1c:.planning/slice-plans/534-migrate-git-publication-native-fixtures/PLAN.md`), from its execution retrospective. Reviewed commits: `e33993231`,
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

Status: done

Behavior: A tracked `src/install` file is added or changed → every startup,
admission, one-shot and owned-context identity hashes it, and the family
check fails when an identity omits one.

Proof: `tests/git-publication-fixture-identity.sh` asserts each tracked
`src/install` file is in each family identity. In scratch, add a sourced
`src/install` shell helper and observe it hashed. Restore the literal list in
scratch and observe the new assertion fail. Run both identity checks and
`tests/git-publication-native.sh`.

Accepted observations (2026-11-09):

- `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_TIMES=/tmp/seed262-guard-identity-slice1-final-times caffeinate -s -i bash scripts/test.sh tests/git-publication-fixture-identity.sh tests/native-evidence-identity.sh tests/git-publication-native.sh /tmp/seed262-guard-identity-slice1-proof.sh`
  passed. The scratch proof compares unchanged input-hash rows against the
  original literal writer for all four families (excluding the deliberately
  changed writer's own hash), and the old writer fails the added-helper
  completeness assertion in every family.
- After extending failed-read coverage to the new installer probe and empty
  stdout, the affected check passed again:
  `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_TIMES=/tmp/seed262-guard-identity-slice1-family-final-times caffeinate -s -i bash scripts/test.sh tests/git-publication-fixture-identity.sh`.
  Missing imported, tracked installer and payload inputs all fail without a
  partial identity; retained startup failure keeps artifacts and no record.
- Observed times: native evidence 31.8 s / baseline factor = 63.1 s;
  final family check 14.7 s / factor = 29.1 s, each below the unchanged 64 s
  ceiling. No historical records or timing catalogs changed.
- Consumer trace artifacts `/tmp/seed262-guard-identity-slice1-consumers.md`
  and `/tmp/seed262-guard-identity-slice1-all-consumers.md`: evidence writer
  reached through both identity checks and retained startup journeys; timing
  record reused; historical/descriptive/generic path matches excluded because
  no changed identity or scratch-source contract executes there.
- Source freshness: unchanged against origin/main
  `82fc915034f4262553561a1c79de876040738677`. Source commitments 1, 2, 3 and 9
  observed in the linked review; no gaps.
- One earlier proof launch lost its terminal observation and was not counted;
  its processes ended before the fully observed proof above.
- Independent post-change refactor `/root/refactor1`: none — already clean;
  no edits or invalidated proof, `git diff --check` passed, all changed code
  files below 250 lines. `REFACTOR COMPLETE` received.
- Fresh preparation stopped before commit on ShellCheck SC2016 for intentionally
  literal scratch script text. Added a local explanatory suppression; formatting
  changed only layout. These already-traced mechanical changes preserve all
  accepted proof boundaries and require no test rerun.

### 2. The closure tool reads valid division and regular-expression forms

Type: Behavior

Status: done

Behavior: A reached module uses division after a postfix operator, a regular
expression after a keyword, a regular expression with a backtick or `/` in a
character class, nested or escaped template text → the tool lists its real
imports and none inside template text; a genuinely unterminated literal still
exits non-zero.

Proof: a new `tests/support/native-import-closure.test.mjs` covering each
shape, failing first on `i++ / 2`. Run it, both identity checks and
`tests/native-stream-replay.sh`.

Accepted observations (2026-11-09):

- Red first: `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash scripts/test.sh tests/support/native-import-closure.test.mjs`
  failed exactly the postfix `++` and `--` cases with `unterminated / literal`;
  the five-line token fix makes all nine direct CLI tests pass.
- `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=1 OPEN_DOUGH_TEST_TIMES=/tmp/seed262-guard-identity-slice2-times caffeinate -s -i bash scripts/test.sh tests/support/native-import-closure.test.mjs tests/git-publication-fixture-identity.sh tests/native-evidence-identity.sh tests/native-stream-replay.sh`
  passed. Exact closure assertions retain real expression imports and spawned
  modules while ignoring nested/escaped template text; keyword/class regex
  stays readable. Missing modules and unterminated template, regex, string and
  comment inputs fail with diagnostics and empty stdout.
- Current host load rose to 10.2 on AC, so the same named coverage ran with
  one slot. Native identity 18.3 s (36.3 scaled), family 10.1 s (20.0 scaled),
  replay 9.8 s, direct tests 0.4 s. No timeout or budget changes.
- Trace `/tmp/seed262-guard-identity-slice2-consumers.md` disposes every
  consumer: both identity checks exercise evidence writers; the take identity
  writer's three closure roots were separately observed below; generic names
  and historical/descriptive path matches do not execute this contract.
- `git diff --name-only -- tests/fixtures/native-streams` is empty; replay
  passed. Source freshness unchanged against origin/main `82fc915034f4262553561a1c79de876040738677`.
  Source commitments 4–8 and 10–12 observed; no gaps.
- Independent refactor `/root/refactor2`: none — already clean, no edits,
  proof unchanged, whitespace check passed; `REFACTOR COMPLETE` received.
- GitHub directed a further observation wait until `2026-11-09T01:08:56.082Z`.
  The same live observer remains armed; CI is pending, with no failure delivered.

Additional take-writer proof, terminal exit 0 from this checkout:

```sh
PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash -c 'set -euo pipefail
source_dir=$PWD
source tests/support/product-backlog-native-take.sh
take_write_evidence_inputs > /tmp/seed262-guard-identity-take-inputs
for module in tests/support/render-published-backlog.mjs tests/support/native-host-stream.mjs src/skills/dough-product-backlog/scripts/product-backlog.mjs; do
  awk -v module="$module" '\''$3 == module { found = 1 } END { exit !found }'\'' /tmp/seed262-guard-identity-take-inputs
done'
```

## Decisive premises

| Premise | Consuming operation and result |
| --- | --- |
| The literal installer list covers every tracked `src/install` file today. | `git ls-files src/install` at `970bfbb5f` lists twelve `.sh` files, all in the literal list, and four `.mjs` files reached from `open-dough-payload-bytes.mjs` and `open-dough-register-hooks.mjs`. |
| Valid postfix division fails the closure. | `node tests/support/native-import-closure.mjs <dir> <dir>/post.mjs` on `let i = 0; const x = i++ / 2; import { a } from "./a.mjs";` exited 1 with `unterminated / literal … post.mjs:2`. |

## Concern evidence

Refinement was unnecessary: each slice owns one proof boundary and one
outcome. This review identified no remaining slice-specific concern.

## Execution retrospective

Reviewed only published implementation `fc234b7f9` and `f6e84827f` against the
original correction; intervening trunk claims/preparation concern other stories.
Source commitments and consumer proof are complete. No product defect, refactor
residue, architecture conflict or additional correction was found. ADR 0002's
cohesion, ADR 0005's deterministic/native proof distinction and ADR 0010's
evidence limits hold; timing is a ceiling check, not a claimed speedup.
Process review enabled: existing ODF-264, ODF-322 and ODF-329 gained this
execution's supported occurrences in DearDough.md (802 physical lines, no
retention removal). Product advice: no change. Final CI remains pending.

## Execution complete

Product advice: no change
