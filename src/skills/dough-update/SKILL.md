---
name: dough-update
description: Apply the latest released Open Dough guidance from this project's recorded source, or from a supplied repository URL on first install. Use when the user asks to update Open Dough or invokes dough-update.
---

# Update Open Dough

Install and update the latest numeric Open Dough release for the running tool.
Pin that release with Git before any repository script runs, then call the
inspected snapshot's helper. Do not reimplement the helper's comparison or
installation decisions.

Local-guidance replacement is not supported by dough-update.
Do not inspect, assess, prepare, repair callers for, or remove an adopter's
local guidance. Do not fetch a source or run an installer for such a request. A
one-time adoption is project-specific work outside this reusable updater.
Ordinary Open Dough release updates remain available from the recorded source.

1. Capture the target project's absolute path before fetching anything. Use the
   current project unless the user supplied another target.
2. If the user asked to install or update a specific version, tag, or branch,
   stop. Say `Open Dough installs and updates the latest numeric release only.
   Requested-version updates are not supported.` Do not fetch or write.
3. Identify the running tool from the current host. Do not infer it from which
   skill directories exist, and do not use a compatibility directory that
   another host also reads. Select that tool's installer platform and write
   destination:

   | Running tool | `--platform` | Installed files |
   | --- | --- | --- |
   | Codex | `codex` (omitting `--platform` is equivalent) | `.agents/skills/` |
   | Cursor | `cursor` | `.cursor/skills/` |
   | Claude Code | `claude` | `.claude/skills/` |

   The complete public payload is `dough-update/SKILL.md` and
   `dough-adr-awareness/SKILL.md`. The numeric `VERSION` record and the
   recorded `SOURCE` live beside the selected `dough-update/SKILL.md`.
   Installation writes `SOURCE` from the supplied repository URL or local
   path, then `VERSION`. Ordinary updates reuse that recorded `SOURCE`. Source
   recognition records are maintainer material and are not installed. An
   obsolete recognition file from an earlier installation may remain until a
   later update retires it.

4. Resolve the Open Dough source from the selected root. If the selected
   updater destination already exists, use that root's recorded
   `dough-update/SOURCE`. If that record is missing or unusable, stop and
   report that ordinary update cannot establish the recorded baseline. Do not
   ask for a URL, do not treat the destination as a first install, and do
   not substitute the target project's remote or local working-tree content.
   If the destination does not exist, use the repository URL supplied by the
   user; if none was supplied, ask for it before proceeding. First
   installation and explicit force take a supplied source.
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
   c. Inspect that snapshot's `src/install/open-dough-release.sh`,
      `src/install/open-dough-release-apply.sh`, `install.sh`, and both
      public payload sources under `src/skills/`.
   d. Run the inspected helper, quoting paths. Codex may omit `--platform`.
      For an ordinary update of a recorded installation, run
      `bash <snapshot>/src/install/open-dough-release.sh apply --target
      <captured-project> --platform <tool> --checkout <snapshot>` and do not
      pass `--url`; the helper reads `SOURCE`. For a first installation, also
      pass `--url <source-url>`. Pass `--force` only when the user explicitly
      authorized a forced reinstall, and include `--url <source-url>` then.
      If apply reports that HEAD is not the pinned latest, stop. Do not fetch
      or check out replacement files after inspection. Proceed only if the
      inspected files write solely to the two declared public payload paths
      under the selected native skill root and the selected updater's `SOURCE`
      and `VERSION` records in the captured target project, preserving
      distributable source, unrelated project files, other tools' separate
      installations and records, and home guidance.
6. Trust the helper's comparison. Equal recorded versions must not invoke
   `install.sh` or write the selected files, even when untagged source or local
   skill text differs. An older recorded installation is compared to its saved
   release's managed files, then replaced with latest only when those files are
   unchanged. If ordinary update cannot establish that baseline — missing or
   unusable SOURCE or VERSION, an unavailable recorded tag or source, baseline
   metadata mismatch, or changed or missing managed files — refuse without
   writing, forcing, or treating the destination as a first install. A
   supplied-URL missing selected record advances directly to latest. A newer
   selected record is preserved with no downgrade. A malformed selected
   `VERSION` is an error, not unknown. Fetch, tag, and invalid-highest
   release failures must not write the target or fall back to a lower release
   or branch. If replacement starts and then fails, report that installed files
   may be incomplete, that the last successful record was left unchanged, and
   that explicit `--force` reinstall is the recovery path.
7. Report the helper's source URL, release tag and commit, running tool and
   native skill root, both installed payload paths, previous version or
   unknown, and actual outcome. After a replacement,
   tell the user to start a fresh session in the same tool, then invoke
   `/dough-update` in Cursor or Claude Code, or `$dough-update` in Codex, to
   use the updated guidance. Do not claim an update succeeded if fetching,
   validation, comparison, or installation failed. Manual reading of the tagged
   `CHANGELOG.md` is sufficient; do not print changelog text here.
