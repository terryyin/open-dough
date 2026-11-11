# CI repair observations

Published revision `f31723244f11c12be23e10bc2aa9c1d577e99fbd`, CI run
43010890708 attempt 1. Same execution identity, branch and observer as PLAN.
Follow [AGENTS failure policy](../../../AGENTS.md#failing-and-flaky-tests).

## Diagnosed failures and repair

- Test shard 3/3: reproduced `npm test -- tests/payload-declaration-links.sh`
  exit 1 for promoted delegation linking undeclared test-entry-rules.md. Complete
  dependency closure is declared. The plan's data-only execution group extraction
  ran early: one assembled managed_files declaration, shared read-only inspection,
  grouped current and inline historical versions, fixtures and inspection readers.
- Dashboard shard 1/13: all 173 original tests passed, but final test finished less
  than 680 ms before the whole-suite deadline, leaving insufficient teardown time.
  The long watcher chain consumed 176.6 s. This is a repository suite-budget defect,
  not a passing suite or an infrastructure disposition.
- Reused accepted watcher solution from c3b6cbd5e, 44e8554d0, 3bbfccce7 and
  554eb5247. All 25 imported product/test paths match pinned accepted trunk
  77b044c814a79489dcddddf7df2bffc8de8a7b28, including one deletion. No spent
  story records imported. Attribution and exact 36 repair paths are retained in
  `/tmp/page-object-307-repair-return.json`. No timeout or coverage relaxation.

## Proof and observations

Repository checks passed through `PATH=/opt/homebrew/bin:$PATH npm test --`
with these concrete selected files (in focused batches):

- `tests/payload-declaration-links.sh`
- `tests/install-public-payload.sh`
- `tests/update-adds-new-payload-skill.sh`
- `tests/story-payload-update.sh`
- `tests/support/repository-release.test.mjs`
- `tests/update-removes-dropped-files.sh`
- `tests/pin-and-inspect.sh`
- `tests/execution-payload-update.sh`
- `tests/product-backlog-payload-update.sh`
- `tests/retrospective-reference-payload.sh`
- `tests/compare-payload.sh`
- `tests/self-installation-baseline.sh`
- `tests/install-preserves-open-dough-json.sh`
- `tests/install-all-tools.sh`
- `tests/install-ci-host-hooks.sh`
- `tests/install-ci-background-hook.sh`
- `tests/dough-update-guidance-payload.sh`
- `tests/support/test-entry-rules-standalone.test.mjs`
- `tests/git-publication-fixture-identity.sh`
- `tests/support/repository-fixture.test.mjs`
- `tests/support/native-admission-reuse.test.mjs`
- `src/skills/dough-execute-plan/scripts/ci-github-acquisition.test.mjs`

Real isolated install/update and preservation, complete bytes and reference
closure, grouped/legacy historical leftovers, source inspection and MakeMe release
fixture consumers are observed by these checks. `tests/payload-declaration-links.sh`
compares literal assembly, fragmented inspection and legacy inline inspection
under `/bin/bash 3.2.57`; rejects a missing fragment and executable array content.
The acquisition reader regression now uses the shared declaration helper.

Dashboard checks passed through `PATH=/opt/homebrew/bin:$PATH npm run test:dashboard --`
with these concrete selected specs (in focused batches):

- `dashboard/tests/runtime/production-watcher-failures.spec.ts`
- `dashboard/tests/runtime/production-watcher-updates.spec.ts`
- `dashboard/tests/runtime/production-watcher.spec.ts`
- `dashboard/backend-tests/runtime/production-watcher-preview.spec.ts`
- `dashboard/backend-tests/runtime/production-watcher-refusals.spec.ts`
- `dashboard/backend-tests/runtime/production-deployment.spec.ts`
- `dashboard/backend-tests/runtime/production-publication-fixture.spec.ts`
- `dashboard/backend-tests/launches/dashboard-update-drain.spec.ts`
- `dashboard/backend-tests/sessions/cursor-runner-helper-repair-shapes.spec.ts`
- `dashboard/backend-tests/runtime/production-qualification.spec.ts`
- `dashboard/backend-tests/runtime/production-update-selection.spec.ts`

Existing MakeMe-described watcher/preview/lifecycle fixtures preserve update,
refusal, qualification, rollback and admission observations. Typecheck and
`git diff --check` passed. No test command remained running at return.

Exact current shard 1/13: 170 selected/current cases passed in 148.639 s
(149.246 s wrapper), under the original 257.907 s allowance with four workers.
Accepted watcher consolidation and moved rollback proof account for the three-case
count difference; affected watcher/backend specs above passed. Current watcher
failures spec cost 22.3 s. `/tmp/page-object-307-shard-local-proof.json` retains
strict runner verdict, commands, selection and timing. This local observation does
not establish CI runner capacity: final registered repair CI remains required.

Run window 11:35:04.838Z–11:37:34.084Z on battery, lid open, fully awake under
`caffeinate -i`. Post-run sleep log has no sleep/wake in the window, retained at
`/tmp/page-object-307-repair-sleep-events.txt`.

Inspected consumer dispositions: `/tmp/page-object-307-refactor-payload-consumers.md`
(105), `/tmp/page-object-307-refactor-watcher-consumers.md` (36), and
`/tmp/page-object-307-refactor-comment-consumers.md` (63). Initial implementation
trace copies had blank disposition cells and were replaced by these annotated
independent-review copies; no uncovered consumers remain. Ordinary installed guidance remains
standalone; no managed installed copy changed. Slice 4 receives the payload,
install/update, inspection and historical-reader proof; final native correspondence
and G2's real MakeMe authored outcomes remain owed.

## Independent refactoring

Two comments now describe assembled declaration ownership and current/legacy
inspection. No executable boundary changed. All accepted proof remains reusable;
fresh whitespace and size checks passed. Existing accepted watcher design and
all 25 corresponding paths were preserved. REFACTOR COMPLETE.
