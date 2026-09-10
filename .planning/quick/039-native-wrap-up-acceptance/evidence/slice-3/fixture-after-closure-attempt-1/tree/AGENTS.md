# Greeting client

Repository root is this checkout.

This isolated client has one production subsystem, greeting, in `src/`. The
CLI `src/greet.mjs` is its public entry point. Domain terms: name and greeting.
Use native Node directly, no wrapper. Focused proof: `node --test test/greet.test.mjs`.
Whitespace check: `git diff --check`. No generated files or generation triggers.

Seeds live in `planning/seeds/`. Executable plans live in `planning/plans/`.
Product backlog is `planning/PRODUCT-BACKLOG.md`. Process log is `DearDough.md`
at the repository root.

Status vocabulary: `planned`, `in-progress`, `done`.

Retrospective completion is recorded in the selected plan's `## Retrospective`
section. `Status: complete` with an empty result is valid: the review finished
with nothing to act on. A project-recorded `## EXECUTION RETROSPECTIVE COMPLETE`
note in that plan also marks the review finished. Do not invent another review
artifact. Any planned or in-progress slice means execution is unfinished. A
missing retrospective completion is unfinished even when every slice is done.

Git commit conventions: ordinary short commit messages that describe the change.
Do not rewrite history, amend published commits, or force-push. Wrap-up may
commit spent history before deleting it, using these same conventions, so Git can
recover the files. Authorized remote `origin` is a local bare repository. Never
use a network remote.

Installed Open Dough skills live under `.claude/skills/` and `.agents/skills/`.
Closing a completed story after its plan execution and retrospective uses the
installed wrap-up skill.

Selective formatting is unused. Commit hook `.git/hooks/pre-commit` owns
check-only whitespace lint on staged files; do not run its lint independently.
