---
id: SEED-065
status: active
planted: 2026-09-30
planted_during: Terry's request to add a story making npm run lint produce no warnings, consistently
trigger_when: A maintainer runs npm run lint and sees findings unrelated to their change
scope: story
---

# SEED-065: Warning-free lint

## Why This Matters

`npm run lint` is the repository's quality gate: it checks the files Git would
track and fails on any warning. A gate that fails for reasons outside the
change, or that a commit can bypass, teaches maintainers and agents to ignore
it and leaves CI to catch what a local check should have stopped.

## Story

<a id="pre-commit-lint-hook"></a>

### Stop a commit that fails lint before it leaves the machine

**Identity:** SEED-065#pre-commit-lint-hook
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/190-pre-commit-lint-hook/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c10c508b92e5f9540cadaa93c035d9bcb4557030a6fb8bf0e613addf43b0cbda","plan":"9025e6c7435c35c4de594383f5a42c7e328631a6144ed985f9ef2050e656b435"}}
```

#### Goal

Maintainers and executing agents committing in this repository, and everyone
waiting on CI after them, stop publishing commits that fail lint. A commit
whose staged files fail the repository's lint or formatting checks is refused
locally, so a masked or skipped `npm run format` (a status hidden by `| tail`
or `;`) no longer reaches CI as an extra push, failed `lint` job, and repair
commit.

#### Scope

- **Required:** a Git pre-commit hook, tracked in this repository, checks the
  staged JavaScript, TypeScript, JSON, and shell files with the same rules,
  ignores, and tools as `npm run lint`, and refuses the commit with the
  findings and a pointer to `npm run format` when any check fails.
- **Required:** the hook only checks. It never fixes, restages, or otherwise
  changes files or the index.
- **Required:** `npm ci` enables the hook for the checkout and every worktree
  sharing its repository; nothing else needs a manual step.
- **Required:** a lint tool missing for a staged file that needs it is a
  reported failure naming the tool, never a silent pass.
- **Required:** a commit staging no file that lint would check succeeds
  without invoking any lint tool, so Markdown-only and `.planning/`-only
  commits (seeds, backlog, agent profiles, which lint's ignores exclude) still
  work in worktrees without `node_modules`, shellcheck, or shfmt.
- **Unchanged:** `npm run lint` and CI's `lint` job keep checking every
  Git-listed file; CI stays the backstop.
- **Boundary assumption:** the hook checks the working-tree copy of each staged
  path, as `npm run lint` sees it. A partially staged file is therefore checked
  as its working-tree version.
- **Deferred:** checking exact staged (index) content of partially staged
  files; findings a change causes in files it did not stage (for example a
  type-aware rule in a dependent file), which CI still catches; merge commits
  Git records without a pre-commit hook; commits made with `--no-verify`.

#### Key examples

1. **Hidden format failure is stopped.** An agent runs
   `npm run format 2>&1 | tail -2; git add -A && agent-commit …` after adding
   a spec with an unused variable. Format fails but the chain continues;
   `git commit` is refused, printing the ESLint `no-unused-vars` finding and
   "Run npm run format…". No commit exists to deliver.
2. **Formatting-only drift is refused, not fixed.** A staged `.mjs` file is
   not Prettier-formatted. The commit is refused with Prettier's check output;
   the file and index are exactly as before, and `npm run format` then
   `git add` lets the next commit pass.
3. **Clean staged change commits.** Staged `.ts`, `.json`, and `.sh` files all
   pass lint; the commit succeeds with no change to the staged content.
4. **Unrelated local files do not block.** An untracked scratch `.mjs` file
   with lint findings is not staged; committing a clean staged change
   succeeds.
5. **Records-only commit needs no tools.** In a fresh worktree without
   `node_modules`, a preparation announcement commits only
   `.planning/agents/<name>.json`, or a refinement commits only a seed
   Markdown file; both commits succeed.
6. **Missing tool is reported.** A staged `.sh` file on a machine without
   `shfmt`: the commit is refused with a message naming the missing tool.
7. **Installation covers worktrees.** After `npm ci` in the main checkout, a
   commit in any existing or new worktree of that repository whose checkout
   contains the hook runs it; a worktree still on a revision without the hook
   commits as before until it includes it.

#### Evidence

[ODF-100](../../DearDough.md#odf-100--a-piped-lint-failure-did-not-stop-publication)
in `DearDough.md` (a formatter piped through `tail` let delivery continue),
with lint-only repair commits such as `235583f7` and `57505b5d`.

#### Completion

After delivery, update ODF-100's follow-up in `DearDough.md` under
[finding status](../../docs/maintainer/finding-names.md#retained-evidence).

## Open Decisions

None.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Lint runner](../../scripts/lint.mjs) and [ESLint configuration](../../eslint.config.mjs).
