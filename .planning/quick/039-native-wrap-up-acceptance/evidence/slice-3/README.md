# Slice 3 native Claude wrap-up

Date: 2026-09-10. One isolated boundary-to-closure journey on a single
fixture. Unfinished-retrospective and successful-closure each retried once
after an identified product or fixture correction.

## What ran

Disposable greeting-style Git fixture with Trim names starting unfinished
(slice 2 still `planned`), Formal titles already in the same seed with its
own plan linked from that story, shared DearDough, near-future direction,
and a local bare `origin`. Installed current Open Dough source via
`install.sh --platform claude --force`. Installed wrap-up bytes matched
`src/skills/` at each native launch.

Native host: Claude Code (`2.1.267`). Session bound: deadline 3600s, grace
15s, owned process group via `native_run_owned`. Invocation (Quick 032
throwaway-fixture pattern, not ADR-awareness `--allowedTools`):

```sh
claude --print --dangerously-skip-permissions --no-session-persistence --output-format stream-json --verbose "$PROMPT"
```

from the fixture cwd. Complete streams contain `{"type":"result"}`.

Prompt identifies the work and supplies project context only. Expected
answers are in the independent evaluator checks. Fresh native sessions for
each stage.

Proof root (disposable, not in this repo): `/tmp/dough-wrap-up-039-s3.CTmm5v`

## Candidate

Worktree HEAD `ab447d4cfbb1331696a85133cc22dbdf49aae968`, VERSION `0.3.6`.
Initial wrap-up source hash
`93d089e6f4e333c80d2dfacd082c8586fdbe7358995f7c5befde8ab3a47ee53d` matched
slice 1 attempt 2. Two uncommitted source clarifications in
`src/skills/dough-story-wrap-up/SKILL.md` were delivered with this slice
(see [wrap-up-skill.diff](wrap-up-skill.diff)). Final wrap-up source hash
`921971ba1fd0c4eb953a83e2c41e8a8c87210ab30137396562e67a04a6eb7c73`.
Managed installed copies in the Open Dough worktree were not edited.

## Stages

1. **Wrap up Trim names while a slice is still planned.** Skill used
   (`Skill` `dough-story-wrap-up`). Reported missing execution completion
   (slice 2 still `planned`; no Retrospective). Protected product bytes
   identical to before, including plan, seed, backlog, log, and `src`.
   Git HEAD unchanged `4d4f86d`. No deletion. No wrap-up-complete marker
   in the result.
2. **Author execution complete** (mark slices done, omit retrospective).
   Commit `b6456d8`. Not a native wrap-up.
3. **Fresh wrap-up with unfinished retrospective.** Attempt 1 used wrap-up
   but treated DearDough DD-001 as a finished review, deleted spent history,
   and emitted wrap-up-complete. Recorded as a product defect. Smallest
   source clarification: only the project's recorded retrospective-completion
   location counts; a process-log occurrence is not that record. Reinstall,
   restore to execution-complete, retry once. Attempt 2 used wrap-up,
   reported missing retrospective, left protected bytes identical, Git HEAD
   unchanged `f15e7d5`.
4. **Record completed empty retrospective** while keeping Formal titles as
   the existing feature-story follow-up. Commit `f8fbd45`. Not a native
   wrap-up.
5. **Fresh wrap-up of completed Trim names.** Attempt 1 used wrap-up,
   closed the story/queue/DD-001, preserved Formal titles as the single
   canonical home with its plan link and one queue entry, but kept the
   spent plan because the fixture said "Retain this plan at completion."
   Fixture wording plus a source clarification that execution-time retain
   does not keep spent history after wrap-up. Restore, reinstall, retry
   once. Attempt 2 used wrap-up, deleted spent history, preserved Formal
   titles as the single story-home queue entry, assimilated the
   plan-only name-source fact into README without story identity, and
   recovered the plan with `git show 38aeb7d:planning/plans/trim-names.md`.

## Independent checks

See [independent-checks.md](independent-checks.md). PLAN.md slice 3 is
marked done.

## Reuse and remaining coverage

Slice 1 empty-review / durable-knowledge / shared-content / history-absence
were observed again on this Claude closure (empty result, README
assimilation, Formal titles and DD-002 kept, spent history absent). Repeat
safety was not re-run on Claude; reuse that observation from slice 1 — the
new sentences clarify completion records and spent-plan deletion, not
repeat behavior.

Seedless follow-up native skill-use remains Cursor-owned. Claude reuse is
justified: slice 3's completion-record and spent-plan-deletion
clarifications do not change seedless queueing, human precedence, or
provenance rewrite, and Claude native skill-use was established on the
existing-story variant.

Unfinished execution/review refusal and existing-story follow-up are
Claude-owned and passed. Codex and Cursor may reuse those shared-source
observations (no wrap-up host adapter) while the clarified wrap-up bytes
stay the same; they were not natively re-run here.
