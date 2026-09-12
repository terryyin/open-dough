# Installation and updates

Open Dough installs one project-local client payload into two physical skill
roots: `.agents/skills/` (shared by Codex and Cursor) and `.claude/skills/`.
The payload in each root is exactly:

- `dough-update/SKILL.md`
- `dough-adr-awareness/SKILL.md`
- `dough-product-backlog/SKILL.md`
- `dough-maintain-findings/SKILL.md`
- `dough-story-decomposition/SKILL.md`
- `dough-story-decomposition/references/problem-decomposition.md`
- `dough-story-decomposition/references/seed-format.md`
- `dough-story-refinement/SKILL.md`
- `dough-story-refinement/references/planning.md`
- `dough-resplit-story/SKILL.md`
- `dough-slice-planning/SKILL.md`
- `dough-slice-planning/references/architectural-thinking.md`
- `dough-pfe/SKILL.md`
- `dough-slice-plan-refinement/SKILL.md`
- `dough-execute-plan/SKILL.md`
- `dough-execute-plan/assets/claude-hooks.json`
- `dough-execute-plan/assets/cursor-hooks.json`
- `dough-execute-plan/references/ci-monitor.md`
- `dough-execute-plan/references/ci-notify-codex.md`
- `dough-execute-plan/references/ci-notify-hosts.md`
- `dough-execute-plan/references/delegation.md`
- `dough-execute-plan/references/destructive-later-outcome-check.md`
- `dough-execute-plan/references/disposable-research.md`
- `dough-execute-plan/references/execution-decisions.md`
- `dough-execute-plan/references/runtime-setup.md`
- `dough-execute-plan/references/wrap-up.md`
- `dough-execute-plan/scripts/ci-failures.mjs`
- `dough-execute-plan/scripts/ci-host-hook.mjs`
- `dough-execute-plan/scripts/ci-mailbox-store.mjs`
- `dough-execute-plan/scripts/ci-mailbox-worker-process.mjs`
- `dough-execute-plan/scripts/ci-mailbox.mjs`
- `dough-execute-plan/scripts/ci-observer-stream.mjs`
- `dough-execute-plan/scripts/ci-runs.mjs`
- `dough-execute-plan/scripts/watch-ci-execution.mjs`
- `dough-execute-plan/scripts/watch-ci.mjs`
- `dough-post-change-refactor/SKILL.md`
- `dough-post-change-refactor/references/refactor-checks.md`
- `dough-execution-retrospective/SKILL.md`
- `dough-execution-retrospective/references/bounded-process-log.md`
- `dough-story-wrap-up/SKILL.md`

The source files live under `src/skills/`. Recognition records, extraction reviews, source checksums, and test fixtures
are source-only maintenance material and are not installed. Installation preserves
unrelated project files, home-level guidance, and any other tool's separate
installation. During this interim release boundary, an obsolete recognition
file from an earlier installation may remain until a later update retires it.

Installation and ordinary update register the managed host-hook entries from the
execution skill fragments into `.cursor/hooks.json` and `.claude/settings.json`
when those fragments ship, preserving unrelated settings. Before asynchronous
CI observation, follow the installed
`dough-execute-plan/references/runtime-setup.md` to select this project's
workflow and verify host-bridge readiness; execute-plan starts and stops the
observer without writing host settings. Missing readiness is reported as
unavailable coverage and does not authorize settings changes.

## Optional process-review preference

The target project's optional process-review preference is project-owned and
shared by Codex, Cursor, and Claude Code. It lives at
`<established-planning-directory>/open-dough.json`, defaulting to
`.planning/open-dough.json` when no different planning directory is established.
That path is in the project being installed or updated, not in an installed
skill directory and not in the Open Dough source checkout. The file is not part
of the managed payload listed above.

A project opts in by creating the file. The installer does not prompt, merge,
or create a default. The JSON contract — including defaults, invocation
overrides, and invalid-file handling — lives once in
[Select reviews](../src/skills/dough-execution-retrospective/SKILL.md#select-reviews).
A project that wants to skip process retrospectives uses that skill's example:

```json
{ "skipProcessRetrospective": true }
```

Ordinary installation and update preserve an existing file byte-for-byte,
including unrecognized keys, and leave the path absent when the project has not
created it. Explicit `--force` replacement of managed skills does the same.

## Common installation flow

The installing agent follows this procedure in stages, keeping the same captured
values and owned temporary directory across inspection and execution. Do not put
inspection and execution into an unattended one-shot command.

1. Capture `target_project` as the existing client project's absolute path before
   fetching. Use the user's supplied `source_url`. If a specific version, tag, or
   branch was requested, stop before fetching or writing: Open Dough installs the
   latest numeric release only; requested-version installation is unsupported.
   Identify the running tool from the host, not from existing skill directories.
   It is an entry-context hint only; each successful install/update writes both
   physical roots:

   | Running tool | `platform` | Native skill root |
   | --- | --- | --- |
   | Codex | `codex` | `.agents/skills/` |
   | Cursor | `cursor` | `.agents/skills/` (shared with Codex) |
   | Claude Code | `claude` | `.claude/skills/` |

2. Create a fresh temporary `install_dir` and use `snapshot="${install_dir}/release"`.
   Own cleanup from this point until the workflow ends, including failures during
   pinning or inspection. A persistent shell can register
   `trap 'rm -rf -- "${install_dir}"' EXIT`; when tool calls use separate shells,
   retain the absolute directory path and explicitly clean it in the final cleanup
   step on every outcome. Keep the original failure status and report cleanup
   failures. Do not rely on a trap in a shell that exits before inspection.

3. Use only Git to select and pin the release before executing repository code:
   - Run `git ls-remote --tags -- "${source_url}"`. Keep only
     `vMAJOR.MINOR.PATCH` tags with three decimal components. Compare components
     as decimal strings: strip leading zeros, compare lengths, then compare equal
     lengths lexically. Do not use shell arithmetic, tag dates, or lexical sorting
     of entire versions. No usable numeric tag means stop without a branch or
     lower-release fallback.
   - Capture `selected_tag`, `selected_version` (the tag without `v`), and
     `selected_commit`. For an annotated tag use its peeled `^{}` commit, not
     the tag object. Run `git init "${snapshot}"`, then
     `git -C "${snapshot}" fetch --depth 1 "${source_url}" "${selected_commit}"`
     and `git -C "${snapshot}" checkout --detach FETCH_HEAD`. Confirm
     `git -C "${snapshot}" rev-parse HEAD` equals `selected_commit`.
     Never run a helper or installer from an unpinned clone or the default branch.

4. Read and inspect these files from that snapshot before executing any of them:
   - `install.sh`
   - `src/install/open-dough-release.sh`
   - `src/install/open-dough-release-apply.sh`
   - `src/install/open-dough-platform.sh`
   - `src/install/open-dough-release-version.sh`
   - `src/install/open-dough-release-resolve.sh`
   - `src/install/open-dough-register-hooks.sh`
   - `src/install/open-dough-register-hooks.mjs`
   - `src/install/open-dough-register-hooks-merge.mjs`
   - `src/skills/dough-update/SKILL.md`
   - `src/skills/dough-adr-awareness/SKILL.md`
   - `src/skills/dough-product-backlog/SKILL.md`
   - `src/skills/dough-maintain-findings/SKILL.md`
   - `src/skills/dough-story-decomposition/SKILL.md`
   - `src/skills/dough-story-decomposition/references/problem-decomposition.md`
   - `src/skills/dough-story-decomposition/references/seed-format.md`
   - `src/skills/dough-story-refinement/SKILL.md`
   - `src/skills/dough-story-refinement/references/planning.md`
   - `src/skills/dough-resplit-story/SKILL.md`
   - `src/skills/dough-slice-planning/SKILL.md`
   - `src/skills/dough-slice-planning/references/architectural-thinking.md`
   - `src/skills/dough-pfe/SKILL.md`
   - `src/skills/dough-slice-plan-refinement/SKILL.md`
   - `src/skills/dough-execute-plan/SKILL.md`
   - `src/skills/dough-post-change-refactor/SKILL.md`
   - Every supporting reference, script, and hook fragment in the payload
     enumeration above, resolved under `src/skills/`.

   Check that this executable call chain writes only the declared client
   payload files and their `SOURCE` then `VERSION` records under both captured
   target native roots, plus the managed host-hook registrations in
   `.cursor/hooks.json` and `.claude/settings.json` when those fragments ship
   with the release. Preserve source, unrelated guidance, unrelated settings
   entries, and home guidance. Stop if the payload is incomplete or the
   inspected behavior exceeds this scope. Bash, Git, and Node (for hook merge)
   suffice; no package installation is needed.

5. After inspection, run the following in a Bash subshell with the captured
   values available. Propagate any nonzero status; stop on a changed selection,
   metadata mismatch, or validation failure without fetching replacement code,
   repinning, calling the installer, or writing the target:

   ```bash
   (
     set -euo pipefail
     resolved=$(bash "${snapshot}/src/install/open-dough-release.sh" resolve-url "${source_url}")
     IFS=$'\t' read -r tag commit version <<< "${resolved}"
     head=$(git -C "${snapshot}" rev-parse HEAD)
     if [[ "${tag}" != "${selected_tag}" || "${commit}" != "${selected_commit}" ||
       "${version}" != "${selected_version}" || "${head}" != "${selected_commit}" ]]; then
       echo 'Release selection changed after inspection; not replacing inspected files or installing.' >&2
       exit 1
     fi
     source_version=$(bash "${snapshot}/src/install/open-dough-release.sh" \
       validate-checkout "${snapshot}")
     if [[ "${source_version}" != "${selected_version}" ]]; then
       echo 'Pinned source version does not match the selected release; refusing installation.' >&2
       exit 1
     fi
     bash "${snapshot}/install.sh" --target "${target_project}" \
       --source "${source_url}" --platform "${platform}"
   )
   ```

   Ordinary installation uses `install.sh` directly; `apply` has different
   existing-installation semantics. If either managed skill already exists, stop
   before changing managed files. Explain that `--force` replaces all managed
   contents, including local edits, and append it to the installer command only
   when the user explicitly authorized that overwrite. The installer does not
   merge changes or replace other skills.

6. Verify all installed payload files byte-for-byte against this same snapshot, the
   installed `dough-update/SOURCE` against the supplied source, and
   `dough-update/VERSION` against `selected_version`; review the target diff
   for unrelated changes. Report the source URL, tag, exact commit, running
   tool, both installed paths, source and version records, and actual installer
   outcome. A failed install is not success: if replacement started, report any
   incomplete files and the unchanged last successful record (or absent fresh
   record), with explicit `--force` reinstall as recovery. Do not promise rollback.
   Clean the owned temporary checkout on success and failure, after any necessary
   verification, preserving the failure status. Commit or push only when authorized.

## Codex

Follow the [shared installation procedure](#common-installation-flow) above.

The default platform is Codex; `--platform codex` is equivalent. Installation
writes the client payload under `.agents/skills/` and records the supplied
source and release in `.agents/skills/dough-update/SOURCE` then
`.agents/skills/dough-update/VERSION`. Open Dough's own tracked Codex
installation lives there too, separately from the distributable source.
See [Codex skill discovery](https://learn.chatgpt.com/docs/build-skills).

Start a fresh Codex session in the client project and invoke:

> $dough-update https://github.com/terryyin/open-dough.git

## Cursor

Follow the [shared installation procedure](#common-installation-flow) above.

Cursor shares the client payload and records under `.agents/skills/` with
Codex. See
[Cursor skills](https://cursor.com/docs/skills). Start a fresh Cursor session in
the client project and invoke:

> /dough-update https://github.com/terryyin/open-dough.git

## Claude Code

Follow the [shared installation procedure](#common-installation-flow) above.

Installation writes the client payload under `.claude/skills/` and records
the supplied source and release in `.claude/skills/dough-update/SOURCE` then
`.claude/skills/dough-update/VERSION`. See
[Claude Code skills](https://code.claude.com/docs/en/skills). Start a fresh
Claude Code session in the client project and invoke:

> /dough-update https://github.com/terryyin/open-dough.git

## Updater safety contract

Ordinary updates of a recorded installation read that root's `SOURCE` and do
not require a URL. First installation takes a supplied cloneable repository
URL. Explicit `--force` uses the recorded SOURCE when present; otherwise it
takes a supplied `--url`. Never infer the client's Git remote or use a
working-tree helper. The updater:

1. Captures the client project before fetching.
2. Resolves the recorded or supplied source's highest numeric release tag,
   fetches its exact commit into a fresh temporary checkout, and validates
   matching `VERSION` and changelog metadata without falling back to a branch
   or lower release.
3. Records the actual source URL, tag, and exact commit.
4. Uses the running tool only as an entry-context hint, then verifies every
   existing native root and adds missing roots.
5. Validates the fetched installer against the release-declared client payload.
6. Compares every existing updater's `VERSION` record. An ordinary update
   without a supplied URL fetches each tagged baseline as data without
   executing it and compares the complete managed payload before skipping,
   preserving, or replacing. Missing siblings are added; a conflicting source,
   newer root, or missing/edited/unverifiable managed root refuses the whole
   operation before writing. It does not infer the client remote or treat an
   existing destination as a clean first install.
   The baseline installer declaration determines which paths were managed; a
   file present only in release source was not installed. Newly declared paths
   must be absent locally before an ordinary update can add them; collisions
   are preserved and refused. An unreadable or unrecognized baseline declaration
   refuses comparison.
7. Verifies that all installed payload files byte-match the fetched sources in every
   native root and that distributable source, unrelated project files, and home
   guidance remain unchanged. Optional
   `<established-planning-directory>/open-dough.json` is unrelated project
   configuration: preserve its exact bytes when present, and do not create it
   when absent. See [Optional process-review preference](#optional-process-review-preference).

An equal recorded version that still matches its recorded release produces no
installed-file writes. An older unchanged installation advances to the selected
release. Ordinary update without a supplied URL refuses when the recorded
baseline cannot be established, including missing or malformed SOURCE or
VERSION, an unavailable tag or source, baseline metadata mismatch, and changed
or missing managed files, even when the recorded version equals latest. A
supplied-URL missing record still advances to the selected release. A verified
newer record is preserved without a downgrade; an unverifiable newer record is
unsupported without writes. A malformed VERSION is refused. Explicit `--force`
skips that comparison and replaces the selected installation with the
inspected latest payload, then `SOURCE` and `VERSION`, including edited,
incomplete, equal, or newer files. It does not merge changes or commit
automatically. Review a resulting diff and start a fresh session in the same
tool to use replaced guidance.

## Legacy bootstrap

An older installed updater may authorize only replacement of its own `SKILL.md`
and must refuse the expanded multi-skill installer. Do not bypass or reinterpret
that refusal as success. A known older installation that lacks `SOURCE` needs
one inspected supplied-source `--force` bootstrap. Follow the
[same safe installation procedure](#common-installation-flow), then run the
inspected helper `apply --url <source-url> --target <project> --platform
<tool> --checkout <snapshot> --force` with the invoking-tool hint. That writes
the payload plus `SOURCE` then `VERSION` in all roots. Afterward ordinary helper calls omit
`--url` and resolve the release from the `SOURCE` that force wrote.
The old updater cannot perform a migration it correctly refuses. Start a fresh
session before invoking the newly installed updater.

## Contributor checks

To run all script tests from a source checkout, run `npm test` (requires npm) or
`bash scripts/test.sh`. No npm dependencies need to be installed. The runner
discovers all `.sh` files under `tests/` and reports failure if any test fails.

GitHub Actions runs `npm run lint` and `npm test` independently on every push and
pull request, and can also be started manually. CI uses Node.js 24 and installs
the locked npm dependencies and shell lint tools. New shell tests under `tests/`
run automatically without workflow changes. When adding another test framework,
include it in `npm test` so the same command remains the complete suite locally
and in CI.

For development checks, use Node.js 20.19+, 22.13+, or 24+ and install the locked
npm dependencies with `npm ci`. Install ShellCheck 0.11+ and shfmt 3.14+ on your
PATH as well (`brew install shellcheck shfmt` on macOS).

- `npm run lint` checks JavaScript with ESLint, code and JSON
  formatting with Prettier, and shell scripts with ShellCheck and shfmt.
- `npm run format` applies ESLint fixes, Prettier formatting, ShellCheck's
  available patch fixes, and shfmt formatting, then runs all checks again. It
  exits unsuccessfully and prints remaining findings if anything cannot be
  fixed automatically or a tool fails.

JavaScript uses ESLint's recommended rules plus strict equality, brace, unused
argument, mutation, and unsafe-construct checks. [ShellCheck](https://github.com/koalaman/shellcheck)
enables every optional check and reports every severity; ESLint allows zero
warnings. Shell discovery includes tracked and untracked files, honors Git
ignores, and recognizes `.sh`, `.bash`, `.ksh`, `.bats`, and shell shebangs on
extensionless files. JavaScript and JSON checks exclude dependencies, build
output, coverage, and planning metadata.
