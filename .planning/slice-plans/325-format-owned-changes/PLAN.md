# Format only the owned change during delivery

**Identity:** SEED-010#format-owned-changes
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#format-owned-changes)
**Finding:** [Project-owned DD-309](../../../docs/maintainer/project-test-findings.md#dd-309)

## Goal and scope

`npm run format` formats and rechecks only the current change: tracked files
whose index or working-tree content differs from `HEAD`, plus untracked files
Git does not ignore. Deleted paths are skipped, filenames with spaces survive,
and the ESLint and Prettier ignore lists drop files before any tool is chosen,
so a Markdown-only or planning-only change runs no tool and exits 0, even
without `node_modules`. Fixes are followed by the same recheck as today, and
remaining findings fail the command. An explicit option keeps the full-tree
formatting run; `npm run lint`, CI and the check-only `lint --staged` hook stay
as they are. The developer documentation describes the selection so the
delivery workflow's "selective formatting command" resolves to `npm run format`.

Excluded: Markdown formatting, an explicit path-list argument, an unloaded
speedup claim, and any change to shared or released guidance, installed skill
copies, or unrelated files. "Owned" means the checkout's change set; another
writer's unformatted eligible edits in the same checkout are selected too, as
the full-tree run already selects them today (source boundary assumption).

## Current decisions and reuse

- PFE: `scripts/lint.mjs` already owns selective behavior for the hook's
  `--staged` check: a NUL-separated Git listing, existence filtering (which
  drops deletions), and up-front `ignoredBy` filtering against
  `eslint.ignores.mjs` and `.prettierignore`. Extend that one owner: the
  default `--fix` listing becomes the change set (`git diff HEAD --name-only
  -z --diff-filter=d`, the cached diff, and
  `git ls-files --others --exclude-standard -z`), the
  up-front ignore filtering applies to every selective listing, and the
  full-tree listing moves behind an explicit option such as `--all`. Add no
  second script, lint-staged dependency, or path cache. The refusal of
  `--fix --staged` stays.
- Keep `npm run lint` (no flags) full-tree so CI and the documented check are
  unchanged; the hook's `lint --staged` and its `npm run format` pointer stay
  valid because a staged drift file is always in the change set.
- Reuse `tests/support/lint-runner-fixture.mjs` for a throwaway repository
  with this repository's runner and configs; the new proof lives beside
  `tests/support/lint-file-set.test.mjs` and runs through `scripts/test.sh`'s
  existing `node --test` scheduling without runner changes.
- Follow [AGENTS.md](../../../AGENTS.md): no edits to installed managed copies
  under `.agents/skills/` or `.claude/skills/`, and no change to
  `src/skills/` guidance, which already asks for the project's selective
  command. Accepted [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  motivates the low transaction cost; no other Accepted ADR governs local lint
  tooling, and no North Star topic or ADR change is warranted.

## Outside-in proof ownership

| Source promise | Slice | Observable result |
| --- | --- | --- |
| Example 1: Markdown-only or planning-only change | 1 | In a fixture repository with no linked `node_modules` and a PATH without the tools, `npm run format` exits 0, names no tool as missing, and prints no unrelated path. |
| Example 2: one edited script and one new eligible file | 1 | Exactly those two files change; a third unformatted-but-unchanged committed file and every other file stay byte-identical; a second run changes nothing; output names no unrelated path. |
| Example 3: deletion and a filename with a space | 1 | The run exits 0, the deleted path is not reported, and the spaced file is formatted. |
| Example 4: unfixable finding in a changed file | 1 | Exit 1 with the finding and "Format failed". |
| Example 5: hook refuses an unformatted staged file | 1 | Existing `tests/support/pre-commit-lint-hook.test.mjs` stays green unchanged. |
| Example 6: full-tree option and unchanged `npm run lint` | 1 | The explicit option formats an unformatted committed file the default run leaves alone; `npm run lint` without flags still fails on it; `tests/support/lint-file-set.test.mjs` stays green. |
| Documented entry | 1 | `docs/installation-platforms-and-update-safety.md` describes the change-set selection and the full-tree option. |
| Evaluation and DD-309 response | 2 | Measured paths, bytes and wall time with load average for the selective and full-tree runs on the three representative changes, recorded in DD-309 with the revision, without a speedup extrapolation. |

## Decisive premises and preparation observations

Named checkout:
`/Users/terryyin/git/open-dough/.worktrees/format-only-the-owned-change-during-delivery`,
base `37e50618e7d830564ec3a45481ea54436b70d450`, 2026-10-20, Node 24.21.0,
`/opt/homebrew/bin` first on PATH, `npm ci` completed.

- Listing premise: with a staged new file, an unstaged edit, an unstaged
  deletion and an untracked `scratch dir/with space.mjs`, `git diff HEAD
  --name-only -z --diff-filter=d` listed the staged file and the edit but not
  the deletion, and `git ls-files --others --exclude-standard -z` listed the
  spaced path intact. Scratch files were removed and edits restored before any
  record write. Settled.
- Ignore-filter premise: `git ls-files -ci -z --exclude-from=.prettierignore
  -- .planning/agents/jackson-chan.json tests/support/scratch-staged.mjs`
  listed only the planning record, so the existing `ignoredBy` drops it before
  Prettier is chosen. Settled.
- Baseline cost: on the clean worktree `npm run format` took 98.7 s wall,
  114 s user, at load average 11–13 with a concurrent whole-tree Prettier check
  from another worktree, and changed no file; `npm run lint -- --staged` with
  nothing staged took 0.15 s and needed no tool. Loaded figures; slice 2
  measures again beside the selective run.
- Existing proof premise: `node --test tests/support/lint-file-set.test.mjs
  tests/support/pre-commit-lint-hook.test.mjs` in this worktree: exit 0,
  13 tests, 13 pass, 0 fail, 8.7 s at load average about 11. The current hook
  and full-tree behaviors slice 1 must preserve are observed green. Settled.
- Tool presence: `node_modules/.bin/eslint` and `prettier` present after
  `npm ci`; `shellcheck` and `shfmt` on `/opt/homebrew/bin`.

## Execution context

- Established start: Story Branch Mode, publisher
  `dashboard-territory.local-open-dough`, agent `mrsn-chan`, execution checkout
  as named above, branch `codex/format-only-the-owned-change-during-delivery`.
  Reused owned worktree; originating/integration checkout is not supplied and
  is not mutated. Remote `origin`; trunk `main`; increments publish to the
  remote execution branch. Starting revision
  `a09612b577f39b287654264145884c0671b6c397`; accepted claim and first
  previously published base `97d33e15a99ecf6a86e7c3e2b6a53bae9d4c88fe`.
- Checkout setup reused the preparation's exact-checkout `npm ci` evidence:
  `package-lock.json` is unchanged since `37e50618`. On execution entry,
  `PATH=/opt/homebrew/bin:$PATH npm run typecheck:dashboard` exited 0.
  Slice 1 fixture proof later invalidated that reuse: checkout-local
  `node_modules/@eslint/js/package.json` was missing, while resolution from
  the checkout could fall through to the parent repository. The fixtures
  exposed the missing local dependency. A fresh checkout-local locked install
  and applicable command were required before proof resumed.
  `PATH=/opt/homebrew/bin:$PATH npm ci` then exited 0 (134 packages),
  `npm run typecheck:dashboard` exited 0 with the same PATH, local
  `@eslint/js` resolution stayed inside this checkout, and the lockfile stayed
  unchanged. The identical four-suite focused retry passed. After the CI repair,
  `PATH=/opt/homebrew/bin:$PATH node scripts/setup-native.mjs check` also exited 0.
  Check-only staged lint/typecheck hook inspected; coordinator owns formatting
  and agent commits. No numeric slice hard limit is configured; existing
  planned refinement authority remains.
- CI: GitHub Actions, `terryyin/open-dough`, verified selector `ci.yml`, name
  `CI`, push-triggered. Observe remote execution branch; the earlier trunk
  claim remains unobserved by this branch observer. Coordinator
  `format-owned-mrsn`, stream directory `/tmp/dough-ci-501/watch-jp7W0C`, PID
  `31036`, session `29045`, yielded cell `8`, bound to this execution checkout.

## Ordered slices

### 1. Format the change set by default and the whole tree on request
Type: Behavior
Status: done
Proof: A new `tests/support/format-changed-files.test.mjs` on the lint-runner
fixture observes examples 1–4 and 6, including a toolless planning-only run;
`tests/support/lint-file-set.test.mjs` and
`tests/support/pre-commit-lint-hook.test.mjs` stay green; the documentation
paragraph describes the selection.

Accepted proof: `PATH=/opt/homebrew/bin:$PATH npm test --
tests/support/format-changed-files.test.mjs tests/support/lint-file-set.test.mjs
tests/support/pre-commit-lint-hook.test.mjs
tests/support/pre-commit-typecheck-hook.test.mjs` exited 0 after local setup
repair and again after independent refactoring. Nine new npm-entry scenarios
observe all source examples, index-only divergence, anchored untracked ignores,
shell selection and the preserved staged-format refusal. Inspected fixture
setup supplies committed source/configs, not the formatting outcome; byte
snapshots observe exact changed paths and idempotence. Existing hook assertions
retain index/file preservation and downstream typechecking. Package entries,
CI plain lint, and automatic test discovery stay unchanged. Independent refactor
consolidated committed lint-repository setup and toolless PATH in the existing
fixture owner; no runtime behavior changed. `git diff --check` and coordinator
`PATH=/opt/homebrew/bin:$PATH npm run format` exited 0; only the six changed
eligible scripts were passed to tools. Story-obligations check passed, no gaps.

Behavior: Given a checkout with edits, new files, deletions and unrelated
unchanged files, when `npm run format` runs, only eligible paths in the change
set are fixed and rechecked, ignored or ineligible paths need no tool, and the
command exits 0 or reports remaining findings as today; with the explicit
full-tree option it behaves exactly as the pre-change command.

Change `scripts/lint.mjs` only: select the listing by mode (`--staged`,
default change set for `--fix`, full tree for plain `lint` and the explicit
option), apply the existing up-front ignore filtering to both selective modes,
and keep the tool invocations, fix-then-check sequence, messages and exit codes.
Keep the `lint` default full-tree so CI is unchanged. Update
`docs/installation-platforms-and-update-safety.md` where `npm run format` is
described. Run the three test files through `scripts/test.sh` with Bash 5 first
on PATH, or `node --test` on them directly, before delivery; hosted CI's `npm
run lint` stays unchanged and is not a local gate here beyond the changed files.

### 2. Measure the response and record it in DD-309
Type: Behavior
Status: done
Proof: DD-309's response names the landed revision and, for each of the three
representative changes, the paths listed, bytes changed, wall time and load
average of `npm run format` beside the full-tree option, with no speedup
extrapolated beyond the measured runs.

Accepted proof: the six `measure.mjs <markdown|scripts|shell-valid>
<selective|all>` invocations retained at `/tmp/dough-dd309-325-measure.uSvudR`
exited 0. Inspected actual npm entry/spawn observations, all metrics and
before/after byte manifests; each pair has identical preconditions and outputs,
only named scratch paths changed, and every run restored clean. DD-309 records
commands, revisions, load, paths, file sizes, limits and pending release.
Independent refactor made no edits; record-only `npm run format` exited 0.

Behavior: Given the slice 1 revision in this worktree, when the maintainer
prepares a Markdown-only change, a one-script-plus-one-new-file change and a
shell-script change in turn, the selective and full-tree runs are each timed
once with the load average noted, the selective run's listed paths and changed
bytes are compared with the full-tree run's, and DD-309 records the actual
response, revision, outcome evidence and that the containing release is pending.

Use scratch edits in this worktree and restore them before the record write.
Record the measurements in the finding only, not in product docs. Do not
release or update installed copies.

## Sizing and safe stopping

Two proof loops: slice 1 is the behavior with its fixture proof and
documentation, slice 2 the observational evaluation that depends on it. After
slice 1 the selective entry is usable and documented; stopping there leaves
DD-309 explicitly unresolved. Effort hypothesis S; no sibling story is a
prerequisite, and no numeric slice limit is supplied.

## Learnings

Preparation found that the hook's `--staged` path already implements selective
listing and ignore filtering, so the change is a listing-mode choice rather
than new machinery. Slice 1 identified one correction to the proposed Git
listing: `git diff HEAD` alone misses an index change when the working-tree
copy has returned to `HEAD`. Include the cached diff too, with deduplication
and existence filtering, to preserve the source's index-or-working-tree
promise; focused proof covers this state.
The existing `ignoredBy` listing also needs `--others`: tracked-only `-ci`
does not match untracked ignored planning files, while `-cio` does. Extend
that same owner and observe tracked plus untracked ignored inputs in the
toolless fixture.

Slice 1 published as `43ff9dde9762edf400703c2925210383057e8522` on the
execution branch. Hosted run `39361072552/1` exposed the new shell success
test's missing prerequisite: test jobs lack shfmt, while the lint job installs
it. The repair reuses the hook suite's optional-shell availability rule;
four focused suites pass with real tools and with a controlled missing-tool
PATH after reproducing the exact failure. Runtime code and the measured
Markdown pair are unaffected; slice 2 paused cleanly for this repair.

## Story obligations

### G1. Shell-format proof requires tools absent from hosted test jobs
Reported: slice 1 — "The new shell-format test requires shfmt, but hosted test jobs lack shell tools."
Story clause: "Preserve lint and format confidence through the existing lint and hook tests plus focused tests of the selection."
Disposition: proved by slice 1: `tests/support/format-changed-files.test.mjs` and the shared `shellToolsMissing` rule; the unchanged shell assertions execute with real tools, and four suites pass with tools absent after the original failure was reproduced. See the CI repair return and `/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-format-shell-JtqPJQ/before.log`.

### G2. Invalid first shell measurement setup
Reported: slice 2 — "shell selective run appended its test block after scripts/test.sh's existing exit"
Story clause: "compare the paths listed and bytes changed with the pre-change command"
Disposition: proved by slice 2: the corrected reachable block produced passing `shell-valid-{selective,all}` observations with identical preconditions and outputs; DD-309 discloses the excluded SC2317 trial and retains its evidence.

### G3. Future landing, release and usage evidence
Reported: slice 2 — "trunk landing, containing release and later usage remain unobserved."
Story clause: "On completion update DD-309 with the actual response, the repository revision, any containing release and the outcome evidence; queueing alone resolves nothing."
Disposition: proved by slice 2: DD-309 records the actual implemented response, both measured revisions, observed outcomes and pending release/landing. No integrated, released or later-use result is claimed; those future facts are not required to observe this implementation's response.
