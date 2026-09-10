# Pre-run assessment for native wrap-up acceptance

Date: 2026-09-10. Assessment lives with this plan's evidence, not in permanent
product docs.

## Candidate

- Worktree: `/private/tmp/open-dough-quick-039-native-wrap-up-acceptance`
- Branch: `worktree-quick-039-native-wrap-up-acceptance`
- Source revision: `ab447d4cfbb1331696a85133cc22dbdf49aae968` plus uncommitted
  wrap-up clarifications delivered with slice 3
- Recorded VERSION: `0.3.6` (`deecc7d`). Candidate is not a new release.
- Post-release wrap-up source still in HEAD: `81e9fbb` (seedless corrections
  through wrap-up) and related `fbbb1b2`. `src/skills/dough-story-wrap-up/SKILL.md`
  and `src/skills/dough-product-backlog/SKILL.md` differ from tagged `v0.3.6`.
- Slice 1 documentation-step correction is in HEAD. Wrap-up source hash
  `93d089e6f4e333c80d2dfacd082c8586fdbe7358995f7c5befde8ab3a47ee53d` matched
  slice 1 attempt 2 through slice 3's first native launch. Slice 3 then
  clarified completion-record location and spent-plan deletion; final hash
  `921971ba1fd0c4eb953a83e2c41e8a8c87210ab30137396562e67a04a6eb7c73`.
  Managed installed copies in this worktree were not edited.
- This repository's installed managed copies under `.agents/skills/` and
  `.claude/skills/` differ from current source. ADR 0003: do not edit them.
  Native fixtures must install from this source tree via `install.sh`.

## Prior evidence inspected

- [Quick 027 native integration](../../027-execution-native-acceptance/README.md):
  Codex/Cursor/Claude discovery, host adapters, execute-plan delivery. Shared
  installation/discovery mechanism is unchanged and may be reused. It does
  **not** establish wrap-up closure, preservation, follow-up, or refusal.
- [Wrap-up recognition](../../../../src/skills/dough-story-wrap-up/RECOGNITION.md):
  at start of this plan, native wrap-up acceptance was unfinished. No wrap-up
  native run was found in recovered 027/031/032 evidence. This plan now
  records that acceptance.
- Changelog 0.3.6: wrap-up shipped under an explicit native-acceptance
  exception. That exception is historical release context, not passing proof.

## Hosts and bounds

Chosen before first native launch:

| Host | Version command | Observed | Session timeout |
| --- | --- | --- | --- |
| Codex | `codex --version` | `codex-cli 0.144.1` | 3600s + 15s grace |
| Cursor | `cursor agent --version` | `2026.09.08-6caf4ff` | 3600s + 15s grace |
| Claude Code | `claude --version` | `2.1.267` | 3600s + 15s grace |

Native invocation examples: `tests/support/native-codex.sh` plus
`native_run_owned` in `tests/support/native-run-supervise.sh`. Claude wrap-up
needs write/git tools; follow Quick 032 throwaway-fixture
`--dangerously-skip-permissions` rather than the ADR-awareness read-only
`--allowedTools` set. One initial attempt per case; retry once only after an
identified fixture or product correction.

## Requirement / host mapping

| Requirement | Codex | Cursor | Claude |
| --- | --- | --- | --- |
| Native skill use + useful closure | pass slice 1 (attempt 2) | pass slice 2 | pass slice 3 (closure retry) |
| Empty review, durable knowledge, shared-content preservation, history absence, repeat safety | pass slice 1 | reuse confirmed; Cursor also observed these on this lifecycle | empty review, durable knowledge, shared-content, and history absence observed on Claude closure; repeat safety reused from slice 1 (not re-run) |
| Seedless follow-up, priority, human precedence, no duplicates, provenance, later correction closure | n/a (slice 2) | pass slice 2 | justified reuse; seedless native skill-use remains Cursor-owned |
| Unfinished execution/review refusal + existing-story follow-up | reuse after slice 3; see applicability below | reuse after slice 3; see applicability below | pass slice 3 |
| Recoverable deletion + remaining links | pass slice 1 Codex closure (`f797bd4`) | pass Cursor closures `4fb462f` and `139b655` | pass Claude closure `38aeb7d0b09416790e6dfb9ee6318f040ffee054` |
| Installation/update/coexistence | reuse 027/032; wrap-up skill edit does not invalidate install/update evidence | same | same |

## Slice 1 Codex results

Evidence: [slice-1/](slice-1/). Native skill use: transcript `sed` of
`.agents/skills/dough-story-wrap-up/SKILL.md` with skill body in
`aggregated_output`; `turn.completed`. Empty retrospective (`Status: complete`,
nothing to act on) closed without inventing review artifacts. Shared seed and
DearDough kept Formal titles and DD-002. Spent Trim names history is absent from
the current snapshot and recoverable with
`git show f797bd44f5821dc06db3e687ab18cc13bc2472cd:planning/plans/trim-names.md`.
Repeat hashes matched the closed tree.

Attempt 1 left README unchanged; retry after the skill/fixture correction
assimilated lasting knowledge into README without story/plan identity.

## Applicability of slice 1 shared observations to Cursor and Claude

Empty review, durable knowledge, shared-content preservation, history absence,
and repeat safety may be reused on Cursor and Claude. Wrap-up source and the
product-backlog skill it links are shared; there is no wrap-up host adapter.
This Codex run showed no host-specific wrap-up risk (Codex `sandbox-exec` is
an invocation isolation concern, not wrap-up behavior). Reuse applies only
while those source bytes and adapters stay the same.

Do **not** treat this Codex run as Cursor or Claude native skill-use. Those
hosts still need their slice-owned native journeys for skill-use, useful
closure, and (on each fresh closure) recoverable deletion plus remaining links.

## Slice 2 Cursor results

Evidence: [slice-2/](slice-2/). Native Cursor `2026.09.08-6caf4ff`, deadline
3600s, `--sandbox enabled`. Installed wrap-up matched source. Transcripts
contain `{"type":"result"}` and `readToolCall` of
`.claude/skills/dough-story-wrap-up/SKILL.md`.

Predecessor wrap-up queued
`[Remove extra greeting prefix](plans/remove-extra-greeting-prefix.md)`
once first, applied HUMAN.md, left Formal titles second, rewrote provenance
to `4fb462f8475fc430036de3bad32c95ec6a919930`, and recovered spent Trim
names with `git show`. Repeat while the follow-up was active did not
duplicate the queue or recreate history. Authored correction completion
`e909a18` is not a wrap-up native step. Correction wrap-up by plan identity
invented no seed, left Formal titles as the remaining queue entry, and
recovered the correction plan from `139b655c014dddd899b1aa0ffacaedd980a4fe87`.

Slice 1 reuse: wrap-up source unchanged vs attempt 2; Codex was not rerun.
Empty-review / durable-knowledge / shared-content / history-absence /
repeat-safety remain applicable. This slice still required native Cursor
skill-use, follow-up/provenance/correction-closure, and Git recovery on each
fresh Cursor closure; those passed.

## Slice 3 Claude results

Evidence: [slice-3/](slice-3/). Native Claude Code `2.1.267`, deadline 3600s,
`--dangerously-skip-permissions --no-session-persistence`. Installed wrap-up
matched source at each launch. Transcripts contain `{"type":"result"}` and
`Skill` `dough-story-wrap-up`.

Unfinished execution: skill used; planned slice reported; protected bytes
identical; HEAD `4d4f86d`. Unfinished retrospective attempt 1 treated DearDough
as a finished review (product defect). Retry after the completion-record
clarification refused, bytes identical, HEAD `f15e7d5`. Closure attempt 1
kept the spent plan because the fixture said to retain it at completion.
Retry after fixture wording plus spent-plan-deletion clarification closed
Trim names, left Formal titles as the single story-home queue entry with its
plan link, invented no seed, and recovered spent files from
`38aeb7d0b09416790e6dfb9ee6318f040ffee054`.

## Remaining-gap reconciliation (all three hosts)

- **Native skill-use and useful closure:** Codex, Cursor, and Claude each have
  a passing slice-owned native journey.
- **Empty review / durable knowledge / shared-content / history absence:**
  observed on all three hosts' closures. Repeat safety: observed Codex and
  Cursor; reused for Claude (not re-invoked after closure).
- **Seedless follow-up lifecycle:** Cursor-owned and passed. Justified reuse
  on Claude: slice 3's completion-record and spent-plan-deletion clarifications
  do not change seedless queueing, human precedence, or provenance rewrite, and
  Claude native skill-use was established on the existing-story variant of the
  same skill. Codex did not own that variant. Native seedless skill-use was
  not re-run on Claude.
- **Unfinished execution/review refusal + existing-story follow-up:**
  Claude-owned and passed. Codex and Cursor may reuse those shared-source
  observations (no wrap-up host adapter) while hash
  `921971ba1fd0c4eb953a83e2c41e8a8c87210ab30137396562e67a04a6eb7c73` stays
  current; they were not natively re-run.
- **Recoverable deletion + remaining links:** each fresh closure has a
  before-cleanup commit (Codex `f797bd4`, Cursor `4fb462f`/`139b655`, Claude
  `38aeb7d`).
- **No remaining pending native wrap-up requirement** for the hosts and
  promises in this plan. Slice 3 source clarifications are delivered with this
  slice's commit.
