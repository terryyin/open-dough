# Stop a commit that fails lint before it leaves the machine

## Source and authority

- **Identity:** SEED-065#pre-commit-lint-hook
- **Source:** [refined story](../../seeds/SEED-065-warning-free-lint.md#pre-commit-lint-hook)
  (Goal, Scope, Key examples 1–7), evidence
  [ODF-100](../../../DearDough.md#odf-100--a-piped-lint-failure-did-not-stop-publication).
- **Authority:** Terry asked on 2026-09-30 for a slice plan after the
  refinement. Planning only; this plan grants no implementation, Take, or
  publication.
- **Preparation:** Owned workspace `.worktrees/refine-pre-commit-lint-hook`
  (branch `claude/refine-pre-commit-lint-hook`), Preparing assignment published
  by `joseph-chan`.

## Goal and scope

A tracked pre-commit hook, enabled by `npm ci` for the checkout and every
worktree sharing its repository, runs the repository's lint and formatting
checks on the staged JavaScript, TypeScript, JSON, and shell files and refuses
the commit with the findings and the `npm run format` pointer when any check
fails. It only checks. A missing tool a staged file needs is a reported
failure; a commit staging nothing lint would check succeeds without any tool.
`npm run lint`, `npm run format`, and CI's `lint` job keep their current file
set and behavior.

Excluded (story deferrals): exact index-content checking of partially staged
files, findings in unstaged dependent files, merge commits Git records without
a pre-commit hook, and `--no-verify`. Also excluded: lint rule changes and
installing shellcheck or shfmt.

## Direction and existing solutions

No Accepted ADR or North Star topic is involved; the change stays in this
repository's maintainer tooling (`scripts/`, `package.json`, a root hooks
directory), none of which the installer ships from `src/`.

**PFE outcome: reuse.** `scripts/lint.mjs` already owns file selection by
extension and shebang, the ESLint/Prettier/shellcheck/shfmt invocations, the
warnings-fail options, per-tool failure reporting (`<tool>: spawnSync <tool>
ENOENT` for a missing tool), and the "Run npm run format" pointer. The hook
reuses it through a staged-selection mode rather than a second runner.
Rejected: husky or lint-staged (new dependencies; lint-staged restages and
stashes, which the story forbids), and a hook script with its own tool calls
(a second copy of the rules that drifts from CI).

## Current decisions

- `scripts/lint.mjs --staged` takes its file list from the staged paths that
  still exist (`git diff --cached --name-only --diff-filter=ACMR -z`) instead
  of the Git listing, then applies the same extension/shebang selection and
  checks the working-tree copies (story boundary assumption). `--staged`
  never fixes.
- A file every applicable tool ignores is dropped before tools run, so a tool
  runs, and is required, only when a checked file remains. `.planning/` is in
  both `.prettierignore` and ESLint's `globalIgnores`; Git can match staged
  paths against `.prettierignore` without Prettier
  (`git ls-files -ci --exclude-from=.prettierignore -- <paths>`). Execution
  chooses how to express ESLint's ignore without ESLint, keeping one source
  per tool's ignore list.
- A missing tool keeps lint's existing per-tool report; slice 2 makes that
  line name the tool and the `npm ci` remedy rather than only `ENOENT`.
- The hook lives in a tracked root directory (for example `.githooks/`), and
  the `prepare` script sets the repository's common `core.hooksPath` to that
  relative path, writing only when the value differs. A relative
  `core.hooksPath` resolves in each worktree to that worktree's own copy, so a
  worktree on a revision without the hook commits as before (seed example 7).
- The hook runs lint through `npm run --silent lint -- --staged`, which puts
  `node_modules/.bin` on `PATH` as `npm run lint` does; npm and node exist in
  worktrees without `node_modules`.

## Decisive premises

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| `npm ci` runs the root `prepare` script | Slice 3 approach | `$CLAUDE_JOB_DIR/tmp/p/r`: dependency-free package whose `prepare` runs `git config core.hooksPath .githooks && echo PREPARED`; `npm install`, unset the key, `npm ci` | Printed `PREPARED`; `core.hooksPath` read back `.githooks` |
| A relative `core.hooksPath` in the common config applies in a linked worktree, resolved to that worktree's copy, also with `extensions.worktreeConfig=true` (set in this repository) | Slice 3 approach, seed example 7 | Same repo: hook absent from the committed revision → `git worktree add ../w`, commit; then hook committed → `git worktree add ../w2`, set `extensions.worktreeConfig true`, commit | `w`: commit succeeded, no hook ran; `w2`: printed `HOOK in …/w2`, exit 1 |
| Git can tell a staged `.planning/` JSON file is Prettier-ignored without Prettier | Slice 2 approach | `git ls-files -ci --exclude-from=.prettierignore -- .planning/agents/akiho-chan.json README.md` in the default checkout | Listed only the `.planning/` file |
| The preparation announcement commits only `.planning/agents/<name>.json` with `git commit` (hooks run) in a worktree that may lack `node_modules` | Slice 2 example 5 | `preparation-assignment-start.mjs` lines 60–84; this workspace has no `node_modules` | `git add -- <profile>` then `git commit --quiet --author=…`, no `--no-verify` |
| Agent commits run hooks | Slice 1 example 1 | `src/skills/dough-execute-plan/references/agent-commits.md:27` | "hooks run as usual. Never add `--no-verify`" |
| Lint reports a missing tool and fails | Slice 2 approach | `PATH=/usr/bin:/bin:<node dir> node scripts/lint.mjs` in the default checkout | `eslint: spawnSync eslint ENOENT`, `prettier: spawnSync prettier ENOENT`, "Lint failed. Run npm run format…" |
| A fixture repository copying `scripts/lint.mjs`, the ESLint/Prettier configs, and a symlinked `node_modules` runs the real runner | Slices 1–3 proof | Existing `tests/support/lint-file-set.test.mjs` (`lintFixture`) | Passing suite test; `tests/node-test-files` schedules `tests/support/*.test.mjs` (plan 187) |
| `npm ci` inside `scripts/ci-container.sh` can run Git on, and write, the mounted common Git configuration | Slice 3 approach | Temporary read-only `prepare` probe in this workspace (`git rev-parse --git-common-dir`, `git config --get core.hooksPath`, `test -w <common>/config`), `scripts/ci-container.sh tests/support/lint-file-set.test.mjs`, `package.json` restored | Exit 0; `PROBE common=/Users/terryyin/git/open-dough/.git hooksPath=unset`, `PROBE writable`; the container's `prepare` therefore sets the same host value, which write-only-when-different leaves untouched once set |

## Outside-in proof

A new `tests/support/pre-commit-lint-hook.test.mjs` builds a fixture repository
like `lintFixture` plus the hooks directory and `package.json`, and commits
through real `git commit`.

| Promise (story example) | Owning slice | Observable proof |
| --- | --- | --- |
| A staged lint violation refuses the commit with the finding and the format pointer, and no commit is made (1) | 1 | Fixture: staged `.mjs` with `no-unused-vars` → `git commit` exits non-zero, output names the rule and "npm run format", `HEAD` unchanged |
| Formatting drift is refused and nothing is changed (2) | 1 | Fixture: staged unformatted `.mjs` → refused with Prettier check output; file bytes and `git diff --cached` identical before and after |
| Clean staged `.ts`, `.json`, and `.sh` files commit unchanged (3) | 1 | Fixture: commit succeeds; committed blobs equal the staged ones |
| An unstaged lint-failing file does not block (4) | 1 | Fixture: untracked violating `.mjs` plus a clean staged change → commit succeeds |
| A records-only commit needs no tools (5) | 2 | Fixture with no `node_modules` and a `PATH` without the lint tools: staging only `.planning/agents/x.json` or a Markdown seed → commit succeeds |
| A missing tool for a staged file is refused naming the tool (6) | 2 | Same toolless fixture: staged `.sh` (and staged `.mjs`) → refused, output names `shfmt`/`eslint` and `npm ci` |
| `npm ci` enables the hook for the checkout and worktrees containing it (7) | 3 | Fixture runs the real `prepare` script → `core.hooksPath` set; a violating commit in the checkout and in a new linked worktree is refused; rerunning `prepare` leaves the config file unchanged. One `npm ci` in the executing worktree shows the setting |
| `npm run lint`, `npm run format`, and CI lint are unchanged | 1, 3 | Existing `tests/support/lint-file-set.test.mjs` stays green; `npm run lint` in the executing worktree exits 0 |

Broader local check: slice 3 runs `npm test` once, because `core.hooksPath` is
repository-wide and every commit in this repository then runs the hook; the
suite's commit fixtures should be separate temporary repositories, and one full
run shows none reaches this repository's hook.

## Slices

### 1. Refuse a commit whose staged files fail lint

Type: Behavior
Status: done
Proof: `npm test -- tests/support/pre-commit-lint-hook.test.mjs tests/support/lint-file-set.test.mjs`
(examples 1–4), then `npm run lint`.

Behavior: a repository whose `core.hooksPath` points at the tracked hooks
directory, with staged JS/TS/JSON/shell files → `git commit` → the commit is
refused with each tool's findings and the "Run npm run format" pointer when any
staged file fails, and succeeds otherwise; files and index are unchanged either
way, and unstaged files are not checked.

Adds `--staged` to `scripts/lint.mjs` and the tracked `pre-commit` hook. The
fixture sets `core.hooksPath` directly; slice 3 owns installation.

Accepted proof: `PATH=/opt/homebrew/bin:$PATH node --test
tests/support/pre-commit-lint-hook.test.mjs tests/support/lint-file-set.test.mjs`
(7 of 7 pass: the four hook tests for examples 1–4 and the three existing
lint-file-set tests) and `npm run lint` (clean). Learnings: `--staged` with
`--fix` exits 2; the fixture helpers shared with `lint-file-set.test.mjs` live in
`tests/support/lint-runner-fixture.mjs`; `npm test` needs Bash 5 on `PATH`
(`/opt/homebrew/bin`) on this machine and prints no test names.

### 2. Commit records without lint tools and report a missing one

Type: Behavior
Status: planned
Proof: `npm test -- tests/support/pre-commit-lint-hook.test.mjs` (examples 5
and 6), then `npm run lint`.

Behavior: a worktree without `node_modules` and without shellcheck or shfmt on
`PATH` → commit staging only ignored records (`.planning/` JSON or Markdown) →
succeeds without invoking a tool; commit staging a `.sh` or `.mjs` file →
refused with a line naming the missing tool and `npm ci`.

Drops paths every applicable tool ignores before tools run, and clarifies the
missing-tool line (shared by `npm run lint`).

### 3. Enable the hook with npm ci for the checkout and its worktrees

Type: Behavior
Status: planned
Proof: `npm test -- tests/support/pre-commit-lint-hook.test.mjs` (example 7);
`npm ci` in the executing worktree, then `git config --get core.hooksPath`;
`scripts/ci-container.sh tests/support/pre-commit-lint-hook.test.mjs`;
`npm test`; `npm run lint`.

Behavior: a checkout without `core.hooksPath` → `npm ci` (its `prepare`
script) → `core.hooksPath` names the tracked hooks directory, commits in the
checkout and in any linked worktree containing the hook run it, and a repeat
leaves the configuration untouched.

Adds the `prepare` script. Completion also updates ODF-100's follow-up in
`DearDough.md` per the story's Completion note, at wrap-up.
