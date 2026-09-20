# Installation and updates

Open Dough installs one project-local client payload into two physical skill
roots: `.agents/skills/` (shared by Codex and Cursor) and `.claude/skills/`.
Each release's [`managed_files` declaration in `install.sh`](../install.sh)
is the complete payload for each root; every declared path resolves under that
release's `src/skills/`. Inspect the declaration in the pinned snapshot using
the procedure below, rather than assuming a fixed list of skills or dependencies.
Installation preserves unrelated project files, home-level guidance, and any
other tool's separate installation.

Installation and ordinary update register the managed host-hook entries from the
execution skill fragments into `.cursor/hooks.json` and `.claude/settings.json`
when those fragments ship, preserving unrelated settings. Before asynchronous
CI observation, follow the installed
`dough-execute-plan/references/runtime-setup.md` to select this project's
workflow and verify host-bridge readiness; execute-plan starts and stops the
observer without writing host settings. Missing readiness is reported as
unavailable coverage and does not authorize settings changes.

Projects using another CI service can optionally read the installed standalone
manual at `.agents/skills/dough-execute-plan/manuals/custom-ci.md` or
`.claude/skills/dough-execute-plan/manuals/custom-ci.md`. Skills do not load or
link to this human-facing adapter-authoring guide during ordinary execution.

## Optional process-review preference

The target project's optional process-review preference is project-owned and
shared by Codex, Cursor, and Claude Code. It lives at
`.planning/open-dough.json`.
That path is in the project being installed or updated, not in an installed
skill directory and not in the Open Dough source checkout. The file is not part
of the release-declared managed payload.

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
   - `src/install/open-dough-register-hooks-fragments.mjs`

   Then inspect every source named by that snapshot's `managed_files` declaration,
   including supporting references, scripts, manuals, and hook fragments. After
   reading the helper above, use its `read_managed_files_declaration` function
   to list the complete inspection set without executing the installer:

   ```bash
   (
     set -euo pipefail
     source "${snapshot}/src/install/open-dough-release-version.sh"
     declared=$(read_managed_files_declaration "${snapshot}/install.sh")
     while IFS= read -r managed_file; do
       source_path="${snapshot}/src/skills/${managed_file}"
       if [[ ! -f "${source_path}" ]]; then
         printf 'Missing declared payload source: %s\n' "${source_path}" >&2
         exit 1
       fi
       printf '%s\n' "${source_path}"
     done <<< "${declared}"
   )
   ```

   A failed listing stops inspection and installation. Read every listed file
   before proceeding; listing paths alone is not a review of their contents.

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

For host-specific commands, the updater safety contract, and local validation,
continue with [Platform use, update safety, and contributor checks](installation-platforms-and-update-safety.md).
