# Extract-guidance manual example

`project/` is a small, self-contained Acme source for a manual extraction
demonstration. Its skill has one reusable readiness workflow, one deliberately
local work-item convention (`ACME-NNN`), and an explicit human decision boundary.

## How to use it

1. Work in a disposable Open Dough checkout that includes the revised
   `.agents/skills/extract-guidance/SKILL.md` and `AGENTS.md`.
2. Follow the extraction instructions on
   `project/.agents/skills/acme-change-readiness/SKILL.md`.
3. Expect direct output at `src/skills/dough-acme-change-readiness/SKILL.md`
   plus a concise `RECOGNITION.md` beside it (maintainer recognition; the
   installer does not ship recognition).
4. Compare the Acme source contents before and after; they must be unchanged.
5. For behavior review, supply client project convention `TASK-NNN` and a proposal
   carrying `TASK-123` (for example: add CSV export for report users; risk is
   excessive export time; rollback when an export exceeds the agreed
   response-time threshold). Confirm the readiness brief names user, outcome,
   risk, rollback, and missing context, and leaves approval with a human.

Generated skills under `src/skills/` from this demo are proof artifacts for the
active extraction story; keep or discard them as the maintainer decides. Do not
treat the fixture itself as installable public payload.
