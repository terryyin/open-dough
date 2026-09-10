# Slice 6 behavior walkthrough

Candidate payload after adding `dough-execution-retrospective/SKILL.md` and
`dough-story-wrap-up/SKILL.md`. Date: 2026-09-10. No version selected. This
repository's installed managed copies were not updated.

## Candidate install

`install.sh`, `src/install/open-dough-release-version.sh`, and
`tests/helpers/public-payload-fixture.bash` declare the two new runtime files.
Runtime links from wrap-up to product-backlog, and from execute-plan /
planning / retrospective to wrap-up, resolve inside that payload.

Focused checks (all pass):

- `bash tests/install-all-tools.sh`
- `bash tests/story-payload-update.sh`
- `bash tests/install-omits-internal.sh`
- `bash tests/install-refuses-unsafe-topology.sh`

A disposable `install.sh --platform cursor` target received both skills in
`.agents/skills/` and `.claude/skills/`, omitted `RECOGNITION.md`, and left
this worktree's `.agents/skills/` and `.claude/skills/` without wrap-up copies.

## Fresh use of the installed skill

The Slice 1 fixture was wrapped using the installed `dough-story-wrap-up`
entrypoint. Spent markers were absent afterward;
`git show <before>:.planning/quick/001-widget-status/PLAN.md` recovered the
plan. Required runtime references (`dough-product-backlog`) were present
beside wrap-up.

## Native host proof

Installation uses the same copy-to-native-roots mechanism as existing payload
skills. That integration evidence is reused, not re-run as a new harness.

Native wrap-up behavior on Codex, Cursor, and Claude Code is still required
before release: one fresh session per host that invokes Story Wrap-Up on the
standalone closure case and inspects the target snapshot and Git recovery.
Those sessions were not available as passing evidence in this turn. Missing
native proof remains unfinished under ADR 0005; this slice does not claim
release readiness.

## Behavior review

1. **Invocation context.** Candidate install is ordinary Open Dough install;
   wrap-up remains a manually invoked skill.
2. **Required context.** Undeclared files are not depended on; recognition
   stays source-only.
3. **Useful outcome.** Installed candidate sources are coherent; native
   host wrap-up is explicitly pending.
