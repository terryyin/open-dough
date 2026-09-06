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
4. Inspect the fetched `install.sh` and `src/skills/dough-update/SKILL.md` before
   executing anything from the clone. Proceed only if installation writes solely
   to `.agents/skills/dough-update/SKILL.md` in the captured target project,
   preserving distributable source, unrelated project files, and home guidance.
5. Run the fetched installer with `bash <clone>/install.sh --target <captured-project> --force`,
   quoting both paths. Every update reapplies the fetched skill.
6. Report success only after installation succeeds and the installed file
   matches the fetched source. Report the installed path and tell the user to
   start a fresh Codex session to use the updated guidance. If fetching or
   installation fails, report that failure without claiming an update succeeded.
