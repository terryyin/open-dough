---
id: SEED-175
status: active
planted: 2026-10-29
planted_during: Terry's request to queue the Cursor Ready-for-review miss while owned CI was still running
trigger_when: A Cursor execution on the dashboard looks idle while that conversation still owns CI that is running
scope: dashboard Cursor session status
---

# SEED-175: Cursor session status while owned CI is running

## Why This Matters

A developer watching a Cursor execution needs the session status to say the
work is still running when that conversation still owns CI in progress.
On 2026-10-29 the Pygardon story "Remove Execute entry round and let approved
entries run automatically" showed **Ready for review** and asked for attention
while CI for commit `423b18053` was still running. The held screen was the
follow-up prompt, every belonging subagent transcript had ended, and the CI
mailbox `watch-tP5dqG` was owned by that conversation
(`ae8d2091-5757-4962-b22a-011937f5e8e3`). The status check treats an idle
composer as ready for review unless an unfinished subagent transcript says
otherwise, so owned CI never kept the session **Working**.

<a id="keep-cursor-session-working-while-its-ci-runs"></a>

### Keep a Cursor session Working while its CI is still running

**Identity:** SEED-175#keep-cursor-session-working-while-its-ci-runs
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected"}
```

**Beneficiary:** A developer watching a Cursor execution on the dashboard.

**Goal:** The session reads **Working**, and does not ask for review, while
that Cursor conversation still owns a fresh non-terminal CI revision. Once
that CI is terminal and the composer is idle, the session reads **Ready for
review** again.

**Scope:** Extend the follow-up-prompt reading in the Cursor session
observation. After a confirmed first instruction, an idle composer stays
**Working** when a CI mailbox owned by this conversation has a fresh pending
revision: the mailbox's own pending or queue observation within its freshness
window. Ownership is the mailbox owner claim for this repository, host
`cursor`, and this conversation. Keep the existing unfinished-subagent
reading. Read only the mailbox the worker has already written.

**Scope limits:** A live worker process is not evidence; this execution's
worker stayed up for the whole run, including while the agent was idle. A
missing, unreadable, or stale mailbox does not establish **Working**. Another
conversation's CI on the same repository does not change this session. Do not
start a worker or poll the CI provider from the dashboard. Do not change
**Ready for review** to mean wrap-up is unfinished: after owned CI is
terminal, an idle composer stays **Ready for review** even when the plan says
execution is complete and awaiting wrap-up.

**Key examples:**

1. The Pygardon session above, at the follow-up prompt, with mailbox
   `watch-tP5dqG` owned by that conversation and coverage for `423b18053`
   still pending and fresh, reads **Working** and does not count as needing
   review.
2. The same session, after that revision is `success` or `failure` and the
   composer is still idle, reads **Ready for review**.
3. An idle composer whose mailbox is missing, unreadable, or whose pending
   observation is older than the freshness window reads **Ready for review**.
4. An idle composer whose worker process is still alive, while every owned
   revision is terminal, reads **Ready for review**.
5. Pending CI owned by a different conversation on the same repository leaves
   this idle session **Ready for review**.

## Breadcrumbs

- Observed on the production dashboard at `http://127.0.0.1:4173/?project=pygardon`
  on 2026-10-29, about 17:43 Asia/Singapore. The card said **Ready for review**
  and **1 session needs attention**, and also **Execution complete, awaiting
  wrap-up**.
- Runner label at that time: `at the follow-up prompt`. Classification is
  `observeHeldCursorSession` in `dashboard/server/hosts/cursor/sessions.ts`.
- Mailbox owner file matched `observerOwner` for `/Users/terryyin/git/pygardon/.git`,
  host `cursor`, and session `ae8d2091-5757-4962-b22a-011937f5e8e3`. Coverage
  for `423b18053` was `pending` with `queue.state` `running` until 17:49, then
  `success`.
