# Speed up the ordinary local suite again

Status: done; measured and committed on the execution branch.

## Source and outcome

Identity: `.planning/quick/073-parallel-test-feedback/PLAN.md`

Provenance: continued `dough-test-optimization` after
`.planning/quick/072-faster-payload-install-checks/PLAN.md`. No separate
feature story. Starting revision `9c0759723c9c5b97daa8ebbe4994487bb24e0bb4`.

A developer waiting on `npm test` gets the same shell checks in a few times
less wall time. Surviving checks still install the real public payload into
both skill roots, compare a tagged skill tree byte for byte, and fail the
suite when an installed story link is missing.

## Preserved behavior and constraints

- Each check keeps a private temporary directory.
- Codex and Cursor still share `.agents/skills`. One install still writes both
  `.agents/skills` and `.claude/skills`, and the public-payload check compares
  every declared file in both roots.
- A missing installed story dependency still fails the suite and names the
  referring file and missing target. A valid payload still passes in
  `tests/story-payload-update.sh`.
- Eight concurrent shell checks stay out of the default. That load starved the
  15-second CI file wait. The slot count stays at most four.
- Node publication suites keep `--test-concurrency=1` so they do not nest
  another worker pool under the shell slots.

## Baseline

- Revision: `9c0759723c9c5b97daa8ebbe4994487bb24e0bb4`
- Command: `PATH="/opt/homebrew/bin:$PATH" npm test`
- Runner: `scripts/test.sh`, one shell file at a time, Bash 5.3.20, Node v24.5.0
- Wall time: 506.57s, 57 discovered files, exit 0
- Target: at least two to three times faster than that wall time

## Ordered slices

### 1. Run independent shell checks together

Type: Structure
Status: done

`scripts/test.sh` runs up to four discovered checks at once, then prints each
log in launch order and fails the suite if any check failed.

Proof:

```text
command: PATH="/opt/homebrew/bin:$PATH" bash tests/test-runner-bash.sh
boundary: the runner copied into a fixture
result: exit 0. Unsupported Bash 3.2 stops before checks. A failing assertion
  is reported as FAIL: tests/assertion.sh. A passing check prints test-passed
  and self-check-ran.
```

### 2. Keep one observation for each repeated payload proof

Type: Behavior
Status: done

One public-payload install compares both skill roots. Tagged skill trees are
compared with one archive and one byte match. Fixture skill copies use one
copy. The story-link failure is one nested suite run.

Proof:

```text
command: PATH="/opt/homebrew/bin:$PATH" bash tests/install-public-payload.sh
command: PATH="/opt/homebrew/bin:$PATH" bash tests/dough-adr-awareness-context.sh
boundary: real install of the declared public payload; tagged skill bytes
result: both exit 0. The public-payload check reports that Cursor receives the
  complete declared client payload. The context check reports that clean Codex,
  Cursor, and Claude Code targets receive the exact tagged client payload.
```

### 3. Re-profile the ordinary local suite

Type: Behavior
Status: done

Proof:

```text
command: PATH="/opt/homebrew/bin:$PATH" /usr/bin/time -p npm test
boundary: the ordinary local suite after slices 1 and 2
result: real 106.27, user 168.76, sys 187.15, exit 0, 55 discovered files.
  About 4.8 times faster than 506.57s.
```

## Current decisions

- Default slot count is four. `OPEN_DOUGH_TEST_JOBS` may select 1 through 4.
- Do not remove `--test-concurrency=1` from the publication Node suites in this
  pass. Eight shell slots already starved the CI file wait; nesting Node
  workers under four shell slots was not measured as safe.

## Remaining candidates

- `tests/execution-ci-runtime.sh`, `tests/closure-publication.sh`, and
  `tests/workspace-publication-callers.sh` still force Node
  `--test-concurrency=1`. Isolated execute-plan tests were about 11s at the
  Node default versus about 62s at concurrency 1. Raising that concurrency
  under the shell pool needs a measurement that the 15-second CI file wait
  still passes. Date: 2026-09-22.
