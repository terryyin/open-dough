---
name: dough-update
description: Apply the latest Open Dough guidance from a supplied repository URL to this project. Use when the user asks to update Open Dough or invokes dough-update.
---

# Update Open Dough

Install and update the latest numeric Open Dough release for the running tool.
Do not implement a second release-selection algorithm; call the fetched helper.

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
   | Codex | `codex` (omitting `--platform` is equivalent) | `.agents/skills/dough-update/SKILL.md` and `VERSION` |
   | Cursor | `cursor` | `.cursor/skills/dough-update/SKILL.md` and `VERSION` |
   | Claude Code | `claude` | `.claude/skills/dough-update/SKILL.md` and `VERSION` |

5. Make a fresh temporary directory. Clone the supplied URL only far enough to
   inspect `src/install/open-dough-release.sh` and `install.sh`. Then run
   `bash <clone>/src/install/open-dough-release.sh apply --url <source-url>
   --target <captured-project> --platform <tool>`, quoting both paths. Codex
   may omit `--platform`. Pass `--force` only when the user explicitly
   authorized a forced reinstall. Inspect the helper, installer, and
   `src/skills/dough-update/SKILL.md` from the operation's pinned release
   before those executables run. Proceed only if they write solely to the
   selected `SKILL.md` and `VERSION` in the captured target project, preserving
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
   path, previous version or unknown, and actual outcome. After a replacement,
   tell the user to start a fresh session in the same tool, then invoke
   `/dough-update` in Cursor or Claude Code, or `$dough-update` in Codex, to
   use the updated guidance. Do not claim an update succeeded if fetching,
   validation, comparison, or installation failed. Manual reading of the tagged
   `CHANGELOG.md` is sufficient; do not print changelog text here.
