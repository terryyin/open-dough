# Independent evaluator checks — slice 1 Codex

Evaluator: this agent, not the native session. Exit 0 and wrap-up self-report
are not acceptance. Skill use is from the transcript; state is from the
fixture filesystem and Git.

## Attempt 1 (initial)

Fixture HEAD before wrap-up: `49c2199117f91910c4930d0ec8e9eb1100015517`.
Transcript: `turn.completed` present. Installed wrap-up skill read via
`sed` of `.agents/skills/dough-story-wrap-up/SKILL.md`.

Spent plan, evidence files, Trim names seed section, Trim names queue entry,
and DD-001 absent. Formal titles, DD-002, `src/greet.mjs`, tests, and
near-future direction bytes preserved. Remaining Markdown links resolved. No
archive/tombstone/finished-list. `git show 49c2199:planning/plans/trim-names.md`
recovered the spent plan.

FAIL: README lacked assimilated lasting knowledge (tests already encoded trim
behavior; wrap-up left README unchanged).

## Attempt 2 (retry after fixture + skill correction)

Fixture HEAD before wrap-up: `f797bd44f5821dc06db3e687ab18cc13bc2472cd`.
Transcript: `turn.completed` present. Installed wrap-up skill read via
`sed` of `.agents/skills/dough-story-wrap-up/SKILL.md`. Product-backlog skill
also read.

Spent files absent:

- `planning/plans/trim-names.md`
- `planning/plans/trim-names/evidence/cli-run.txt`
- Trim names section in `planning/seeds/SEED-001-greeting.md`
- Trim names backlog entry
- DearDough DD-001

Preserved:

- Formal titles in `planning/seeds/SEED-001-greeting.md`
- Formal titles backlog entry
- DearDough DD-002
- `src/greet.mjs` and `test/greet.test.mjs` byte-identical to before
- Near-future direction bytes unchanged:
  `Keep the greeting CLI the only active product surface this week.`

Remaining Markdown links resolve; no live link to a removed path. No
archive, tombstone, finished-list, or replacement history summary.

Git recovery: wrap-up reported recovery commit
`f797bd44f5821dc06db3e687ab18cc13bc2472cd`. `git show` recovers
`planning/plans/trim-names.md` and the spent evidence file.

Lasting knowledge: README now states argument-sourced name, end-trim,
internal spaces, and Guest default, without story/plan identity or
retrospective judgments. Manual pass against SEED-011; see
`attempt-2/knowledge-judgment.md`. Cleanup commit `08e1ac6`.

Note: empty untracked directories `planning/plans/trim-names/evidence`
remained. No files inside. Skill asks to delete empty containers; leftover
empty dirs are recorded, not restored history.

## Repeat (already-closed fixture)

Transcript: `turn.completed` present. Installed wrap-up skill read again.
HEAD remained `08e1ac6860dec8aa0cb328f1936e6dac1f7c4aeb`. Full product-file
hashes identical to the post-closure snapshot. Spent plan and Trim names
section not recreated. README and backlog unchanged.

## Outcome

pass
