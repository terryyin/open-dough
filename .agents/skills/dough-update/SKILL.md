---
name: dough-update
description: Refresh Open Dough guidance from a supplied repository's current default branch. Use when the user asks to update Open Dough or invokes dough-update.
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
   Record the clone's actual origin with `git remote get-url origin` and its exact
   commit with `git rev-parse HEAD`. Stop if the origin does not identify the
   supplied source or the commit cannot be resolved. These values identify the
   fetched default-branch source; they are not an installed version or a release
   selection.
4. Identify the running tool from the current host. Do not infer it from which
   skill directories exist, and do not use a compatibility directory that
   another host also reads. Select that tool's installer platform and native
   skill root:

   | Running tool | `--platform` | Native skill root |
   | --- | --- | --- |
   | Codex | `codex` (omitting `--platform` is equivalent) | `.agents/skills/` |
   | Cursor | `cursor` | `.cursor/skills/` |
   | Claude Code | `claude` | `.claude/skills/` |

5. Treat the following relative paths as the complete public payload allowlist:

   - `dough-update/SKILL.md`
   - `dough-adr-awareness/SKILL.md`
   - `dough-adr-awareness/RECOGNITION.md`

   Inspect the fetched `install.sh` and all three corresponding files under
   `src/skills/` before executing anything from the clone. Proceed only if the
   installer declares exactly this payload and every write is limited to these
   three paths under the selected native skill root in the captured target.
   Reject missing or extra managed paths, writes to another platform root, and
   writes elsewhere in the project or home directory. The installer may create
   the parent directories needed for these three paths. Capture enough pre-update
   state to verify that distributable source, unrelated project files, other
   tools' separate installations, and home guidance remain unchanged.
6. Run the fetched installer with
   `bash <clone>/install.sh --target <captured-project> --platform <tool> --force`,
   quoting both paths. Codex may omit `--platform`. Every update reapplies the
   fetched public payload to that running tool's native copy only.
7. Report success only after all three selected installed files byte-match their
   fetched `src/skills/` sources and the captured preservation checks pass. Say
   `Updated Open Dough guidance from <source-url> at <commit>.`, replacing both
   placeholders with the actual supplied URL and resolved commit. Name the
   running tool (Codex, Cursor, or Claude Code) and list all three installed
   paths, so a project with more than one integration can tell which copy
   changed. Tell the user to start a fresh session in the same tool to use the
   refreshed guidance. If fetching, validation, installation, or verification
   fails, report that failure without claiming an update succeeded.

An older installed updater may authorize only replacement of its own `SKILL.md`
and must refuse an installer that writes this expanded payload. Do not bypass or
reinterpret that refusal. Bootstrap explicitly: make a fresh shallow clone of the
supplied default branch, inspect the installer and the exact three-file allowlist
above, then run that fetched installer once with the selected `--platform` and
`--force`. Start a fresh session before invoking the newly installed updater.
