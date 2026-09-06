---
name: dough-update
description: Apply the latest Open Dough guidance from a supplied repository URL to this project. Use when the user asks to update Open Dough or invokes dough-update.
---

# Update Open Dough

1. Capture the target project's absolute path before fetching anything. Use the
   current project unless the user supplied another target.
2. Use the repository URL supplied by the user. If none was supplied, ask for
   it before proceeding. Do not substitute the target project's remote or local
   working-tree content.
3. Make a fresh temporary directory and shallow-clone the supplied URL with
   `git clone --depth 1`, using its default branch without selecting a branch or
   release. Do this on every invocation, even when upstream content is unchanged.
4. Identify the running tool from the current host. Do not infer it from which
   skill directories exist, and do not use a compatibility directory that
   another host also reads. Select that tool's installer platform and write
   destination:

   | Running tool | `--platform` | Installed file |
   | --- | --- | --- |
   | Codex | `codex` (omitting `--platform` is equivalent) | `.agents/skills/dough-update/SKILL.md` |
   | Cursor | `cursor` | `.cursor/skills/dough-update/SKILL.md` |
   | Claude Code | `claude` | `.claude/skills/dough-update/SKILL.md` |

   Inspect the fetched `install.sh` and `src/skills/dough-update/SKILL.md`
   before executing anything from the clone.
   Proceed only if installation writes solely to the selected installed file in
   the captured target project, preserving distributable source, unrelated
   project files, other tools' separate installations, and home guidance.
5. Run the fetched installer with
   `bash <clone>/install.sh --target <captured-project> --platform <tool> --force`,
   quoting both paths. Codex may omit `--platform`. Every update reapplies the
   fetched skill to that running tool's copy only.
6. Report success only after installation succeeds and the selected installed
   file matches the fetched source. Say `Updated Open Dough guidance from
   <source-url>.`, replacing `<source-url>` with the actual supplied URL. Report
   the installed path and tell the user to start a fresh session in the same
   tool, then invoke `/dough-update` in Cursor or Claude Code, or `$dough-update`
   in Codex, to use the updated guidance. If fetching or installation fails,
   report that failure without claiming an update succeeded.
