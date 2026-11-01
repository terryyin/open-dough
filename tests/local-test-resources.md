# Local full-suite resource use

Only one full repository or dashboard suite runs at a time across this
repository's linked Git worktrees. `npm test` / `bash scripts/test.sh` with no
paths and unfiltered dashboard runs share admission, including direct Playwright
commands using `dashboard/playwright.config.ts`. The next full run waits before
starting its jobs or dashboard build. Named checks, dashboard path/grep/
project/shard/test-list selections, list-only runs, and explicit suite shares
remain independent. Independent repositories do not share admission.

Local defaults are four repository jobs and two dashboard workers, conservative
starting values for a shared development machine. Override them explicitly with
`OPEN_DOUGH_TEST_JOBS=6 npm test` or
`npm run test:dashboard -- --workers=4`. Worker overrides alone still select a
full suite. CI keeps its existing CPU-derived concurrency and takes no admission.
These bounds control peak concurrency; no elapsed-time improvement is claimed.

Admission lives in the common Git directory as the private
`refs/dough/local-test-suite` ref, outside branches and ordinary pushes. Nested
suite fixtures reuse a live ancestor's admission. Success, failure and signals
release it; after an abrupt owner death the next run atomically takes over and
retires surviving marked processes before it starts. No manual lock cleanup is
needed. Copied runner fixtures outside Git have no cross-worktree admission.
