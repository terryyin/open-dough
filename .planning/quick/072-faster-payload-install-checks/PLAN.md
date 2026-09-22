# Speed up declared-payload install checks

Status: done; measured and committed on the execution branch.

## Source and outcome

Identity: `.planning/quick/072-faster-payload-install-checks/PLAN.md`

Provenance: `dough-test-optimization` on the ordinary local suite. No separate
feature story. Baseline revision `6d7f3cc0b238613a6faaf661ed65452128af12a1`
(clean `main`).

A developer waiting on `npm test` spends less time in install and update
checks. Those checks still install the real declared payload, refuse edited
or partial trees, and stop a replacement that cannot finish copying.

## Preserved behavior and constraints

- Install, skip, force, and verify outcomes stay the same, including incomplete
  replacement reports and unchanged SOURCE/VERSION when a copy or record write
  fails.
- Overwriting an existing payload file keeps that file's mode, as `cp` does.
  A new file still receives the source mode.
- A checkout without Node still compares and copies with `cmp` and `cp`.
- Do not drop scenarios to make the suite shorter.

## Baseline

- Revision: `6d7f3cc0b238613a6faaf661ed65452128af12a1`, clean tree
- Command: `PATH="/opt/homebrew/bin:$PATH" npm test`
- Runner: `scripts/test.sh`, one shell file at a time, Bash 5.3.20, Node v24.5.0
- Wall time: 820.49s, 57 discovered files, exit 0
- Family: install/update/payload shell tests were about 516s of that wall time
- Unit cost before the change: one cursor install was about 1.5s, of which
  per-file `cmp` was about 0.78s (468 processes), `cp` about 0.45s (234), and
  `mkdir` about 0.39s (234)

Focused sample immediately before the edit, same command style:

| File | Wall |
| --- | --- |
| tests/install-all-tools.sh | 42.33s |
| tests/story-payload-update.sh | 38.21s |
| tests/update-skip-verified.sh | 17.21s |
| tests/install.sh | 10.39s |
| tests/install-reports-real-copy-failure.sh | 6.99s |

## Ordered slices

### 1. Copy and compare the declared payload in one process

Type: Structure
Status: done

`src/install/open-dough-payload-bytes.mjs` matches or copies the declared file
list in declaration order. The installer skips byte comparison when force is
set or the install records already differ, creates each destination directory
once, and still reports a mid-copy failure after earlier files have been
replaced. The copy-failure proof makes the second declared file unwritable
instead of replacing the `cp` command.

Proof:

```text
command: PATH="/opt/homebrew/bin:$PATH" bash tests/install-reports-real-copy-failure.sh
command: PATH="/opt/homebrew/bin:$PATH" bash tests/install.sh
command: PATH="/opt/homebrew/bin:$PATH" bash tests/install-all-tools.sh
command: PATH="/opt/homebrew/bin:$PATH" bash tests/story-payload-update.sh
command: PATH="/opt/homebrew/bin:$PATH" bash tests/update-skip-verified.sh
boundary: real install.sh payload install, skip, force, and failed replacement
result: all five exit 0. Focused wall times after the change: 1.16s, 2.18s,
  17.88s, 19.03s, and 15.21s (sample sum 115.13s to 55.46s).
```

### 2. Re-profile the ordinary local suite

Type: Behavior
Status: done

Proof:

```text
command: PATH="/opt/homebrew/bin:$PATH" npm test
boundary: same runner, Bash, and Node as the baseline, dirty worktree with this change
result: exit 0, 57 files, wall 506.57s
```

Install- and update-named files account for 238s of the 314s wall drop.
Other files account for 75s. That second part is not attributed to this
change: `tests/closure-publication.sh` stayed 27.6s to 27.1s and
`tests/execution-ci-runtime.sh` stayed 64.2s to 61.8s, while
`tests/native-stream-completeness.sh` moved from 55.8s to 37.1s in the suite
and still took 48.7s when rerun on unchanged `main`.

## Current decisions

- Keep per-file fixture copies in `tests/helpers/release-fixture.bash` for a
  later pass. A single current-payload copy was about 0.7s; that is real, and
  smaller than the installer spawn cost already removed.
- Do not treat the 820s to 507s suite drop as a pure code speedup. Use the
  focused install sample and the stable controls above.

## Learnings

- Currency checks were comparing every managed file even when the install
  records already forced a replace. Skipping that compare is behavior-neutral
  and was part of the saving.
- `copyFileSync` on macOS replaces an existing file's mode. Restoring the
  previous mode keeps `cp` overwrite behavior.

## Remaining candidates

- `tests/helpers/release-fixture.bash` `copy_current_release_files`: per-file
  `mkdir` and `cp` of 117 managed files, about 0.7s per call. Unique protection
  is fixture construction, not install behavior. Date: 2026-09-22.
- `tests/execution-ci-runtime.sh`: about 62s, stable across this change, one
  `node --test --test-concurrency=1` process for execute-plan script tests.
  No removed-work hypothesis yet. Date: 2026-09-22.

## Execution identity

- Mode: Story Branch Mode
- Originating checkout: `/Users/terryyin/git/open-dough` on `main`
- Execution checkout: `/Users/terryyin/git/open-dough-worktrees/072-faster-payload-install-checks`
- Execution branch: `cursor/072-faster-payload-install-checks`
- Authorized remote target: `origin/main` (not published in this pass)
