# Retire an established session's isolated worktree after its result lands

**Identity:** SEED-066#retire-established-session-worktree
**Source:** [correction story](../../seeds/SEED-066-composable-lightweight-session-options.md#retire-established-session-worktree)

## Source and provenance

Bounded correction from the native observation of
[SEED-066#unattached-session-native-observation](../../seeds/SEED-066-composable-lightweight-session-options.md#unattached-session-native-observation)
(plan 301), run on 2026-10-13 in the Lizard project with installed release
`0.3.60` and dashboard deployment `e40d6854c99b`. Terry accepted planning this
correction the same day.

## Current findings

Each journey was Start session · Isolated workspace · Automatically land,
then one-shot execution of a queued story. All landed correctly; they differed
only at retirement.

| Host | Retirement call | Result |
| --- | --- | --- |
| Claude Code 2.1.296 (launch `68dc053f`) | `worktree-retirement.mjs retire … --identity <story>` | `ok: false`, “reused, host-owned, or unrecorded workspace, not created for this work”; worktree and branch kept |
| Codex 0.162.1 (launch `3226e1cf`) | `… --identity <story> --created-for-work --contained <sha>` | worktree and branch removed |
| Cursor 2026.10.01 (launch `2d5ab090`) | `… --identity <story> --contained <sha>` | kept; reported “preserved (`created: false` / host-owned established session workspace)” |
| Claude Code, review then `/dough-land` (launch `9d835c6c`) | through Dough Land | worktree and branch removed |

Cause, read from the released sources, unchanged on trunk at `52a4f6e9`:

- The dashboard's identity-free start creates the session worktree, so no
  creation ref names the later story, and the invoked workflow's own start
  answers `created: false`.
- [worktree-retirement.md](../../../src/skills/dough-land/references/worktree-retirement.md)
  allows `--created-for-work` only from a recorded `created: true` or when
  “the caller or developer states the worktree was created for this work”.
- [established-session.md](../../../src/skills/dough-execute-plan/references/established-session.md)
  calls an `isolated` workspace “an owned worktree created for this session”
  and says it is “retired once trunk contains its work” only in its Dough Land
  paragraph. Nothing tells a one-shot workflow that the block is that caller
  statement, so two hosts read `created: false` as decisive and one did not.

## Goal and scope

Make the block's `workspace role: isolated` the stated creation fact for a
workflow that retires after landing in that session, so every host retires the
session worktree after an auto-land one-shot result. Guidance only.

Preserved: `default-checkout` sessions retire nothing; review results stay
until landing is requested; tracked work keeps its own lifecycle; the
retirement command's containment gate, creation-ref gate and refusal for
“created for other work” are unchanged; `--created-for-work` is still never
inferred from a clean directory, a claim or a preparation assignment.

Excluded: recording a creation ref from the dashboard start, changing
`execution-start.mjs` receipts, dashboard changes, and the Cursor trust
prompt, whose correction is complete and recoverable at
`4bd36244a6eb0d9227500b488d19dd58aec202b6:.planning/slice-plans/305-cursor-trust-prompt-at-session-start/PLAN.md`.

## Current decisions

- Guidance, not a new creation record. The retirement reference already
  accepts a caller statement; the block is that statement and only needs to be
  named as one. A script-recorded session creation fact would add a second
  ownership mechanism for a case the existing one covers. Revisit only if the
  native re-observation still diverges.
- State the rule once in `established-session.md` and link to it from the
  retirement reference's `--created-for-work` bullet and from one-shot
  [Retire the workspace](../../../src/skills/dough-execute-plan/references/one-shot.md#retire-the-workspace).
  Follow [AGENTS.md](../../../AGENTS.md) and
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  write for the agent in the session; edit `src/skills/` only.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  requires native evidence per affected host. As in plan 301, that evidence
  needs the released payload installed, so slice 2 follows a release Terry
  authorizes; this plan performs no release.

## Outside-in proof ownership

| Promise | Owning slice and observation |
| --- | --- |
| A workflow in an `isolated` established session is told to retire with the created-for-work fact after landing | 1: the guidance test reads the three references for the rule and its links |
| `default-checkout` and “created for other work” stay retained | 1: the same test keeps the existing statements; `retirement-checks` tests stay green |
| Claude Code and Cursor retire the session worktree after an auto-land one-shot execution | 2: native journeys; `git worktree list`, local and remote branches, and the retirement receipt in each transcript |

## Ordered slices

### 1. The established session block states who created an isolated workspace
Type: Behavior
Status: planned
Proof: `node --test src/skills/dough-execute-plan/scripts/established-session-guidance.test.mjs`
extended with the rule and both links, then `npm test`.

Behavior: an agent in a session whose block says `workspace role: isolated`
finishes a one-shot landing and reads retirement guidance → it finds that the
block states the worktree was created for this session's work, and passes
`--created-for-work` with the landed revision as `--contained`. With
`workspace role: default-checkout` it finds that nothing is retired.

### 2. Claude Code and Cursor retire the session worktree natively
Type: Behavior
Status: planned
Proof: one paid native journey per host, manually triggered or explicitly
authorized, in a project whose installed release carries slice 1: Start
session · Isolated workspace · Automatically land, then one-shot execution of
a queued trivial story.

Behavior: after the result lands, the session worktree and its branch are
gone and the transcript holds a retirement receipt with `removed`. Record the
host, version, model, installed release, launch and observed result in this
plan, and in plan 301 where its slices 1 and 3 wait on this evidence. Codex's
2026-10-13 pass is reused only if the released wording leaves its path
unchanged; otherwise observe it again.
