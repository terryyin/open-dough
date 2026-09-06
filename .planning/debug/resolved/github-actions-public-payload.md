---
status: resolved
trigger: "fix https://github.com/terryyin/open-dough/actions/runs/34025182357/job/101464769662"
created: 2026-09-06
updated: 2026-09-06
---

# GitHub Actions public payload failures

## Symptoms

- Expected behavior: the linked GitHub Actions test job passes.
- Actual behavior: four installer payload tests fail while the remaining suite passes.
- Error messages: `install-cursor-public-payload.sh`, `install-claude-public-payload.sh`, `install-codex-public-payload.sh`, and `install-repeat-force-public-payload.sh` report `FAIL` without further diagnostics in the aggregate runner.
- Timeline: observed on commit `93c7a6582073c7cfde9708c03eb64deee01e5842` in run `34025182357`.
- Reproduction: run `npm test`, or the four failing shell tests individually.

## Current Focus

- hypothesis: Confirmed: Bash 3.2 masked false `[[ ... ]]` assertions that Bash 5 correctly treated as failures; two fixtures no longer constructed the prerequisite state their assertions described.
- test: Run all tests with Bash 5.3 and GNU coreutils/findutils, then run lint.
- expecting: The three platform payload tests and repeat/force test pass under CI-like command semantics.
- next_action: resolved

## Evidence

- timestamp: 2026-09-06
  observation: The linked Ubuntu job failed the Codex, Cursor, Claude public-payload tests and the repeat/force test, while the aggregate runner hid the failed assertion.
- timestamp: 2026-09-06
  observation: The same tests appeared to pass with macOS Bash 3.2 because a false standalone `[[ ... ]]` did not trigger `set -e` there.
- timestamp: 2026-09-06
  observation: Bash 5.3 plus GNU tools reproduced the missing-helper failure and the incorrect first-collision assertion.
- timestamp: 2026-09-06
  observation: The complete suite and lint pass after correcting the fixtures.

## Eliminated

## Resolution

- root_cause: The incomplete-source fixture omitted installer helpers, VERSION, and CHANGELOG, so it failed before reaching its intended missing-payload check. The repeat/force fixture created `dough-update` before asserting that `dough-adr-awareness` was the first collision. A non-canonical macOS temporary path also made its success-message assertion platform-dependent.
- fix: Supply all non-payload installer prerequisites in the incomplete-source fixture; create the first managed directory only after the later-collision assertion; canonicalize the temporary target before deriving expected paths.
- verification: All repository tests pass with Bash 5.3 and GNU coreutils/findutils; lint passes; Codex, Cursor, and Claude payload cases each pass.
- files_changed: tests/support/assert-public-payload-install.sh, tests/install-repeat-force-public-payload.sh
