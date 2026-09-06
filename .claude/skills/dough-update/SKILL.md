---
name: dough-update
description: Apply the latest released Open Dough guidance from a supplied repository URL to this project. Use when the user asks to update Open Dough or invokes dough-update.
---

# Update Open Dough

Install and update the latest numeric Open Dough release for the running tool.
Pin that release with Git before any repository script runs, then call the
inspected snapshot's helper. Do not reimplement the helper's comparison or
installation decisions.

If the developer asks only to assess whether installed Open Dough ADR guidance
could replace an existing local practice, read
`../dough-adr-awareness/RECOGNITION.md` from this updater's native skill root and
follow its **Assessment before replacement** section. Do not begin the install
or update flow, fetch a source, or call an installer for an assessment-only
request. Assessment permission is not cleanup authorization. Report a current
installed version separately from optional cleanup that may still be pending.

1. Capture the target project's absolute path before fetching anything. Use the
   current project unless the user supplied another target.
2. Use the repository URL supplied by the user. If none was supplied, ask for
   it before proceeding. Do not substitute the target project's remote or local
   working-tree content.
3. If the user asked to install or update a specific version, tag, or branch,
   stop. Say `Open Dough installs and updates the latest numeric release only.
   Requested-version updates are not supported.` Do not fetch or write.
4. Identify the running tool from the current host. Do not infer it from which
   skill directories exist, and do not use a compatibility directory that
   another host also reads. Select that tool's installer platform and write
   destination:

   | Running tool | `--platform` | Installed files |
   | --- | --- | --- |
   | Codex | `codex` (omitting `--platform` is equivalent) | `.agents/skills/` |
   | Cursor | `cursor` | `.cursor/skills/` |
   | Claude Code | `claude` | `.claude/skills/` |

   The complete public payload is `dough-update/SKILL.md`,
   `dough-adr-awareness/SKILL.md`, and
   `dough-adr-awareness/RECOGNITION.md`. The numeric `VERSION` record lives
   beside the selected `dough-update/SKILL.md`.

5. Make a fresh temporary directory. Using only Git, pin the highest numeric
   release before any repository script runs. Do not clone the default
   branch, and do not execute `install.sh` or `open-dough-release.sh` from
   the working tree or from an unpinned clone.

   a. Run `git ls-remote --tags -- <source-url>`. Keep `vMAJOR.MINOR.PATCH`
      tags. When both a tag object and a peeled `^{}` line exist, use the
      peeled commit. Select the highest version by comparing each component
      as a decimal integer string; do not use shell arithmetic.
   b. `git init` the work directory, `git fetch --depth 1 <source-url>
      <commit>`, and check out that commit detached. Confirm
      `git rev-parse HEAD` equals the peeled commit.
   c. Inspect that snapshot's `src/install/open-dough-release.sh`, `install.sh`,
      and all three public payload sources under `src/skills/`.
   d. Run `bash <snapshot>/src/install/open-dough-release.sh apply --url
      <source-url> --target <captured-project> --platform <tool>
      --checkout <snapshot>`, quoting both paths. Codex may omit
      `--platform`. Pass `--force` only when the user explicitly authorized a
      forced reinstall. If apply reports that HEAD is not the pinned latest,
      stop. Do not fetch or check out replacement files after inspection.
      Proceed only if the inspected files write solely to the three declared
      public payload paths under the selected native skill root and the selected
      updater's `VERSION` record in the captured target project, preserving
      distributable source, unrelated project files, other tools' separate
      installations and records, and home guidance.
6. Trust the helper's comparison. Equal recorded versions must not invoke
   `install.sh` or write the selected files, even when untagged source or local
   skill text differs. An older or missing selected record advances directly to
   latest. A newer selected record is preserved with no downgrade. A malformed
   selected `VERSION` is an error, not unknown. Fetch, tag, and invalid-highest
   release failures must not write the target or fall back to a lower release
   or branch. If replacement starts and then fails, report that installed files
   may be incomplete, that the last successful record was left unchanged, and
   that explicit `--force` reinstall is the recovery path.
7. Report the helper's source URL, release tag and commit, running tool and
   native skill root, all three installed payload paths, previous version or
   unknown, and actual outcome. After a replacement,
   tell the user to start a fresh session in the same tool, then invoke
   `/dough-update` in Cursor or Claude Code, or `$dough-update` in Codex, to
   use the updated guidance. Do not claim an update succeeded if fetching,
   validation, comparison, or installation failed. Manual reading of the tagged
   `CHANGELOG.md` is sufficient; do not print changelog text here.
