# Slice 1 native Codex wrap-up

Date: 2026-09-10. Two native attempts; the second is the decisive closure.

## What ran

Disposable greeting-style Git fixture with a completed Trim names story,
unrelated Formal titles sibling, empty completed retrospective, spent DearDough
occurrence, lasting product knowledge only in the spent plan, and a local
bare `origin`. Installed current Open Dough source via
`install.sh --platform codex --force`. Installed wrap-up and product-backlog
bytes matched `src/skills/`.

Native host: Codex (`codex-cli 0.144.1`). Session bound: deadline 3600s,
grace 15s, owned process group via `native_run_owned`. Isolation:
`sandbox-exec` with the Open Dough worktree as protected source.

Prompt identifies the work and supplies project context only. Expected answers
are in the independent evaluator checks.

Proof roots (disposable, not in this repo):

- Attempt 1: `/tmp/dough-wrap-up-039.KeOIhE`
- Attempt 2 + repeat: `/tmp/dough-wrap-up-039-retry.HenGAU`

## Candidate

HEAD `de140179fbc1cb69466a77e515e2d6a49324a1ca`, VERSION `0.3.6`.

Attempt 1 used unmodified wrap-up source
(`af9f5610e40994af01d0392f56f6f299163eb8994c611332b58f754c955f026a`).
Attempt 2 installed the one product correction in
`src/skills/dough-story-wrap-up/SKILL.md` (uncommitted;
`93d089e6f4e333c80d2dfacd082c8586fdbe7358995f7c5befde8ab3a47ee53d`).
See [wrap-up-skill.diff](wrap-up-skill.diff) and
[candidate-identity-attempt-2.txt](candidate-identity-attempt-2.txt).

## Attempts

1. **Initial native session.** Skill was read
   (`.agents/skills/dough-story-wrap-up/SKILL.md`). Spent plan, story section,
   evidence, queue entry, and DD-001 were removed. Sibling story, DD-002,
   source/tests, and direction bytes were preserved. Git recovered the plan
   from wrap-up-ready `49c2199`. README was unchanged: wrap-up treated tests
   as already stating trim/Guest behavior. Recorded as a fixture-plus-skill
   gap (plan-only documentation fact was not distinct from tests; skill did
   not require writing that fact into maintained docs).
2. **Retry after correction.** Fixture plan gained a documentation-only name
   source fact. Skill now requires writing a spent-plan-only product fact into
   maintained documentation even when tests exercise related behavior. Fresh
   fixture, reinstall, one native retry. Closure, preservation, links, Git
   recovery (`f797bd44f5821dc06db3e687ab18cc13bc2472cd`), and README
   assimilation all held. See [knowledge-judgment.md](attempt-2/knowledge-judgment.md).
3. **Repeat on the already-closed fixture.** Fresh native session, same prompt
   and timeout. Skill read again. HEAD stayed `08e1ac6`. Product-file hashes
   identical. No spent history recreated, no duplicate edits.

Empty leftover directories `planning/plans/trim-names/evidence` remained on
disk with no files. Git never tracked them. Noted; not restored history.

## Independent checks

See [independent-checks.md](independent-checks.md). PLAN.md slice 1 was not
marked done.

## Reuse

Shared empty-review, durable-knowledge, shared-content, history-absence, and
repeat-safety observations may be reused on Cursor and Claude: wrap-up source
is shared, there is no wrap-up host adapter, and this Codex run showed no
host-specific wrap-up risk. This run does not prove Cursor or Claude native
skill-use.
