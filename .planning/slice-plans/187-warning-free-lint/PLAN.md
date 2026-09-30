# Make npm run lint report no warnings or errors, consistently

## Source and authority

- **Identity:** SEED-065#warning-free-lint
- **Source:** [refined story](../../seeds/SEED-065-warning-free-lint.md#warning-free-lint)
  (Goal, Scope, Key examples, Confirmed cause).
- **Authority:** Terry asked on 2026-09-30 for a slice plan after accepting the
  refinement. Planning only; this plan grants no implementation, Take, or
  publication.
- **Preparation:** Owned workspace `.worktrees/refine-warning-free-lint`
  (branch `refine-warning-free-lint`), Preparing assignment published by
  `juacompe-chan`.

## Goal and scope

`npm run lint` and `npm run format` check exactly the files Git tracks plus
untracked files Git does not ignore, so ignored artifacts at any depth (a
nested `dashboard/dashboard/dist/` bundle, `.worktrees/` copies, test reports)
never produce findings, while new non-ignored source and real violations still
fail. A worktree is checked only when lint runs inside it. Existing deliberate
exclusions of tracked paths (`.planning/`) stay.

Excluded: lint rule changes, lint speed, fixing other worktrees' in-progress
code, and tolerating a missing lint tool (it stays a reported failure).

## Direction and existing solutions

No Accepted ADR is involved; the change stays inside the repository's lint
runner. No North Star topic.

**PFE outcome: reuse.** `scripts/lint.mjs` already lists files with
`git ls-files --cached --others --exclude-standard -z` and filters out missing
paths for its shell checks. ESLint and Prettier get their file lists from that
same listing, filtered by extension, instead of scanning `.` or a glob. That
honors every Git ignore source (nested `.gitignore`, `.git/info/exclude`,
global excludes) with no second ignore list. Rejected: copying `.gitignore`
patterns into `globalIgnores` (a second source that drifts again), and
`@eslint/compat`'s `includeIgnoreFile` (new dependency, root `.gitignore` only,
and Prettier would still differ).

## Current decisions

- ESLint receives the listed `*.{js,cjs,mjs,jsx,ts,mts,tsx}` files with
  `--no-warn-ignored`, so a listed file under a config ignore (`.planning/`)
  is skipped silently instead of warning; Prettier receives the listed
  `*.{js,cjs,mjs,jsx,ts,mts,tsx,json,jsonc}` files and keeps honoring
  `.prettierignore`. Both the check and `--fix` paths use these lists.
- A tool whose list is empty is not run (both tools fail on no input).
- `eslint.config.mjs` `globalIgnores` stays as it is; it still serves direct
  `eslint .` and editor integrations.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| The reported symptom comes from ESLint scanning Git-ignored paths | Slice 1 approach | `npm run lint` in the default checkout on 2026-09-30, errors grouped by file | Exit 1, 8,374 errors: 8,372 in `dashboard/dashboard/dist/assets/index-CFK-BzZ6.js`, 2 in `.worktrees/start-refinement-with-mechanical-preparation/dashboard/tests/agent-launch-preparation-start.spec.ts`; `git check-ignore -v` names `.gitignore:7:dist/` |
| ESLint on the Git-listed JS/TS files is clean on the same checkout, including typed rules | Slice 1 approach | Git listing filtered to JS/TS existing files (959), `xargs -0 npx eslint --max-warnings=0 --no-warn-ignored` | Exit 0, no output, ~10 s |
| Prettier on the Git-listed files is clean and still honors `.prettierignore` for explicit paths | Slice 1 approach | Same listing with JSON extensions into `npx prettier --check`; in the fixture, an unformatted `.planning/x.json` passed explicitly | "All matched files use Prettier code style!"; the ignored file was skipped |
| `--no-warn-ignored` silences a listed file under a config ignore | Slice 1 approach | Fixture: `eslint --max-warnings=0 .planning/q.mjs` with and without the flag | Without: 1 warning, exit 1; with: exit 0, no output |
| The argument list fits the OS limit | Slice 1 approach | Byte count of the Git-listed lintable paths | ~60 KB against macOS's 1 MB and Linux's 2 MB `ARG_MAX` |
| A temporary Git repository holding copies of `scripts/lint.mjs`, `eslint.config.mjs`, `.gitignore`, `.prettierignore`, and a symlinked `node_modules`, with `node_modules/.bin` on `PATH`, runs the real runner and reproduces the symptom | Slice 1 proof | Built in `$CLAUDE_JOB_DIR/tmp/fx` with an ignored `dashboard/dashboard/dist/assets/b.js` and `.worktrees/w/src/bad.mjs` using `var`, then `node scripts/lint.mjs`; then an untracked `src/new.mjs` using `var` | Exit 1 naming both ignored files (`no-var`), 0.75 s; the untracked file is reported by ESLint and Prettier |
| Nothing but CI and `package.json` calls the runner | Slice 1 scope | `git grep` for `lint.mjs`, `npm run lint`, `"lint"` outside `.planning/` | `package.json` `lint`/`format` scripts and `.github/workflows/ci.yml` `Run lint`; no test covers the runner today |
| New `tests/support/*.test.mjs` files are scheduled by the suite | Slice 1 proof | `tests/node-test-files` | Lists `tests/support/*.test.mjs` |

## Outside-in proof

| Promise (story example) | Owning slice | Observable proof |
| --- | --- | --- |
| Ignored nested build output produces no finding (1) | 1 | Fixture test: ignored `dashboard/dashboard/dist/assets/*.js` with a violation → runner exits 0, output names no problem |
| A worktree's violation does not affect the enclosing checkout, but fails inside it (2) | 1 | Fixture test: committed fixture, real `git worktree add .worktrees/w`, violation added there → runner in the fixture exits 0; the worktree's own runner exits 1 naming the file |
| New untracked source is still checked (3) | 1 | Fixture test: untracked `src/new.mjs` using `var` → exit 1 naming the file and `no-var` |
| Repeated runs agree (4) | 1 | Fixture test runs the clean case twice and compares exit status and output |
| No warnings on a clean checkout with ignored artifacts, on this repository | 1 | `npm run lint` in the workspace, with the stray bundle copied into `dashboard/dashboard/dist/` and a worktree present: exit 0, no warning or error; repeated once |

## Ordered slices

### 1. Lint checks only what Git would track

Type: Behavior
Status: done
Proof: new `tests/support/lint-file-set.test.mjs` (fixture above; clean,
worktree, untracked-violation, and repeat cases), run with
`bash scripts/test.sh tests/support/lint-file-set.test.mjs`; then
`npm run lint` and `npm run format` in this repository with ignored artifacts
present.

Behavior: a checkout with Git-ignored artifacts containing violations and a
nested worktree → `npm run lint` → exits 0 with no warning or error; a new
untracked file with a violation → it fails naming that file; inside the
worktree, its own violation fails.

The runner derives one listing, then gives ESLint and Prettier their
extension-filtered subsets in both check and fix modes, per Current decisions.
The test adds one short job; read the baseline with
`bash scripts/ci-test-times.sh` before pushing, per `tests/time-budget.md`.

Accepted proof: `bash scripts/test.sh tests/support/lint-file-set.test.mjs`
(three tests: ignored nested bundle with a repeat run, real worktree, untracked
violation; fails against the previous runner); `npm run format`, then
`npm run lint` twice with an ignored `dashboard/dashboard/dist/assets/x.js` and
`.worktrees/probe/src/bad.mjs` holding `var`: exit 0, identical output, no
warning or error. `bash scripts/ci-test-times.sh`: share 1 thin (430 of 470),
new job about 2 s, left to CI.

## Learnings

- A fixture that symlinks `node_modules` must exclude it separately:
  `.gitignore`'s `node_modules/` matches directories only.
- CI repair (run 36712853079, dashboard 1/2, on `96838533`): the dashboard
  helper `settled()` passed right after `page.reload()`, before any card
  rendered, so `agent-launch-card-delete.spec.ts` measured a card before a
  card above it grew. The helper now waits for a card first. Proof: a
  route-delay reproduction failed with CI's exact values without the fix;
  `--repeat-each=10` and all 18 `openStoryStagesJourney` specs pass with it.

## Execution complete

Product advice: No correction needed; the delivered runner meets every key
example. At wrap-up, update the lint paragraph in
`docs/installation-platforms-and-update-safety.md`, which describes Git-based
discovery only for shell scripts, to say that every check uses the Git listing.
DD-194's note about lint scanning ignored build output no longer applies. No
backlog change.
