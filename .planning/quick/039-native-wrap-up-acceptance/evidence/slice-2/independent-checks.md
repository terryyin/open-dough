# Independent evaluator checks — slice 2 Cursor

Evaluator: this agent, not the native session. Exit 0 and wrap-up
self-report are not acceptance. Skill use is from the transcript; state is
from the fixture filesystem and Git.

Proof root: `/tmp/dough-wrap-up-039-s2.GVuKFo`.
Host: Cursor `2026.09.08-6caf4ff`. Sandbox enabled; Git commits succeeded
(no disabled retry). Installed wrap-up bytes matched source
`93d089e6f4e333c80d2dfacd082c8586fdbe7358995f7c5befde8ab3a47ee53d`.

## 1. Predecessor wrap-up (Trim names)

Transcript: `{"type":"result"}` present. Installed wrap-up skill read via
`readToolCall` of `.claude/skills/dough-story-wrap-up/SKILL.md` (installer
also wrote the matching `.agents` copy). Product-backlog skill also read.

Spent Trim names plan, evidence, seed section, queue entry, and DD-001
absent. Follow-up queued once first as a plan-identity link. HUMAN.md kept
the correction first; Formal titles advice was not applied. Correction plan
contents and planned slice preserved. Provenance rewritten to
`4fb462f8475fc430036de3bad32c95ec6a919930` plus predecessor paths.
`src/greet.mjs` still had `Hey Hello` (wrap-up did not execute the
correction). Direction bytes unchanged. Remaining Markdown links resolve.
`git show` recovers `planning/plans/trim-names.md` and the spent evidence
file. No invented seed.

## 2. Repeat predecessor wrap-up while follow-up active

Transcript: `{"type":"result"}` present. Wrap-up skill read again. HEAD
stayed `92007167d01a38ce8d0e11f3babbc8ee3feecf66`. Product hashes identical
to the post-predecessor snapshot. Follow-up still queued once first. Trim
names history not recreated. No invented seed.

## 3. Authored correction completion (not native)

Evaluator marked the correction slices done, recorded an empty
retrospective, removed the extra prefix in `src`/`test`, and made an
ordinary commit `e909a18060ba1a8a65cf1ac20258a87d25c0bae4`.

## 4. Correction wrap-up by plan identity

Transcript: `{"type":"result"}` present. Wrap-up skill read. Prompt named
`planning/plans/remove-extra-greeting-prefix.md`, not a seed. No seed
invented. Correction plan and evidence absent and recoverable from
`139b655c014dddd899b1aa0ffacaedd980a4fe87`. Formal titles is the remaining
queue entry. Direction, DD-002, and Formal titles seed section preserved.

## Outcome

pass
