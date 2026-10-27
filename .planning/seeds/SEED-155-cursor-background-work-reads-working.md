---
id: SEED-155
status: active
planted: 2026-10-27
planted_during: Terry's report that a Cursor execution with a running background agent read Ready for review
trigger_when: A Cursor parent session sits at the follow-up prompt while a background agent for that session is still working
scope: small
---

# SEED-155: A Cursor session with background work reads Working

## Why This Matters

A developer watching the dashboard needs **Ready for review** only when the
Cursor session actually needs their attention. That label means the parent
screen is at the follow-up prompt after a confirmed first instruction. On
2026-10-27, Yuma-chan's Doughnut execution of
SEED-002#story-1 (`c6df5a96-3f57-48ff-8b44-d6fbe2faba34`) delegated slice work
to a background Task, ended the parent turn, and stayed at the follow-up
prompt while the subagent kept implementing. The dashboard showed Ready for
review and asked for attention; nothing was ready for the developer to review.

SEED-147#running-cursor-session-reads-working already made a live parent
`ctrl+c to stop` screen read Working. It does not cover parent-idle screens
whose delegated background work is still running. The developer does not need
to know about that delegation; the reading must not claim review while work
continues.

## Selected Stories

<a id="cursor-background-work-reads-working"></a>

### A Cursor session with background work reads Working

**Identity:** SEED-155#cursor-background-work-reads-working
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/361-cursor-background-work-reads-working/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"921ec1a110f6fdf78d87b3d5510cc8a88565589ba1c2d5fe5c51e70f3869d9cf","plan":"26653fc4470196f5ed491cb4622b9dee93956a71a5523013dfeb005dd1a4e9dc"}}
```

**Beneficiary:** A developer using the dashboard to decide when a Cursor
session needs review or input.

**Goal:** While any background agent belonging to a held Cursor session is
still working, that session reads Working (no Ready-for-review attention).
Ready for review appears only when the parent is at the follow-up prompt and
no background work for that session remains.

**Scope:** Extend Cursor session observation so a held session whose parent
screen is the ordinary follow-up prompt still reads the shared `working`
activity when that session has any belonging background subagent whose
machine-local transcript has not recorded completion. Belonging and
incompletion use Cursor's on-disk transcripts under
`~/.cursor/projects/<workspace-slug>/agent-transcripts/<sessionId>/subagents/`:
a `*.jsonl` there belongs to the held session, and a terminal
`{"type":"turn_ended",...}` record proves that subagent finished. Preserve
Working for a live parent stop hint (SEED-147), Needs input for proved
clarifying questions, and Ready for review for a true idle follow-up with no
unfinished belonging subagents after a confirmed first instruction. When that
transcript tree is missing or unreadable, keep the parent-screen reading;
missing local evidence does not invent Working. Do not invent a
story-complete or Mark as done signal from this reading. Do not add a new
shared activity or durable project record. Other hosts stay as they are.

Deferred: reclaiming Ready for review when an unfinished belonging transcript
is abandoned without ever writing `turn_ended`; reading background work from
the parent screen alone; generalizing this observation beyond Cursor.

**Key examples / evaluation:** A held Cursor session whose parent screen is
the follow-up prompt, with a belonging `subagents/*.jsonl` that has no
`turn_ended` record, reads Working and does not raise Ready-for-review
attention. When every belonging subagent transcript ends with `turn_ended`
and the parent remains at the follow-up prompt, it reads Ready for review. A
parent screen that itself shows the live stop hint stays Working regardless
of background agents. An idle follow-up with no belonging subagent files, or
with only completed ones, stays Ready for review after a confirmed first
instruction. A held follow-up whose agent-transcripts tree cannot be read
keeps the ordinary follow-up reading rather than inventing Working.

**Architecture:** Cursor host observation gains a second machine-local
evidence source beside the held parent screen: the session's subagent
transcripts under the workspace's Cursor project directory. The workspace
slug observed for path lookup is the continuation workspace path with `/` and
`.` removed into one segment (for example
`/Users/…/doughnut/.worktrees/…` →
`Users-…-doughnut-worktrees-…`). Classification still emits only shared
normalized activities; unfinished belonging background work maps to existing
`working`, which the readings already show as Working without attention.
This stays local operational evidence at the host boundary and does not
author durable workflow state
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
machine-local evidence supplements the view; missing observation does not
invent activity; the dashboard observes without owning agent cooperation).
No Accepted ADR conflict; [ADR 0007](../../docs/adrs/0007-software-development-lifecycles.md)
remains Proposed and is not relied on.

**Depends on:** none.

**Safe stopping point:** False Ready-for-review attention during delegated
Cursor work stops; further host generalization can wait.

## Breadcrumbs

- Terry's report on 2026-10-27 for Doughnut SEED-002#story-1 / Yuma-chan:
  session appeared to run normally while the dashboard said Ready for review.
- Parent transcript ended after spawning background Task
  `262cb71f-a956-40a7-9e01-a56942d3e8ea`; subagent continued afterward.
- Investigation (2026-10-27, this preparation): runner still held
  `c6df5a96-…` at `at the follow-up prompt` while
  `agent-transcripts/…/subagents/218e47f0-….jsonl` had no `turn_ended` and
  was minutes old; completed siblings carried `turn_ended` with
  `status: success`. Parent-screen classification alone cannot see that case
  (runner ships screen text only for waiting labels; follow-up without
  `ctrl+c to stop` already maps to review). Shared activity `working`
  already labels Working without attention. Absence of `turn_ended` alone is
  common on abandoned historical transcripts; this story scopes the predicate
  to belonging files of the held session and defers abandoned-without-completion
  reclaim.
- Prior related repair: SEED-147#running-cursor-session-reads-working
  (live parent stop hint outside the classifier window).
- Cursor observation:
  [dashboard/server/hosts/cursor/sessions.ts](../../dashboard/server/hosts/cursor/sessions.ts),
  [idleScreen.ts](../../dashboard/server/hosts/cursor/idleScreen.ts),
  [nativeSessionShown.ts](../../dashboard/src/nativeSessionShown.ts).
- Cursor docs: background subagents continue after the parent returns;
  transcripts nest under the parent conversation's `agent-transcripts/…/subagents/`.
