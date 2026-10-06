---
id: SEED-107
status: active
planted: 2026-10-06
planted_during: Terry's request to turn the dashboard's Recent sessions column into a Recently done column backed by a published record of done stories
trigger_when: A developer wants to see which stories were recently finished, and by whom, after story wrap-up has removed them from the product backlog
scope: story
---

# SEED-107: Dashboard recently done

## Why This Matters

When a story is wrapped up, it is removed from the product backlog and its
seed section and plan are deleted. Nothing in the project's current state says
what was recently finished. The dashboard's Recent sessions column shows only
local session records from one machine, so it cannot tell a developer which
stories the team completed, and it shows sessions as a flat list without the
stories they served.

## Correction

<a id="recently-done-correction"></a>

### Recently done reads beside owners, keeps the session look, and closes completely

**Identity:** SEED-107#recently-done-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/257-recently-done-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d91d51d13c2d35ba2a9822c2b7ed751dea8ea61b6830c11d9bb9688cbe36d61d","plan":"8607f5546c7964a986c806a7758af5f15f4ca0ec54af60f800cab7e6d9c0c578"}}
```

**Goal:** A developer watching the dashboard sees owners, preparation, and
progress without waiting on the done records, sees a story's sessions set off
inside its card again, on a work card and a done card, and is told which done
records are unreadable; an agent closing a queued story in one shot commits
the done records `complete` wrote or removed. This corrects the delivered
Recently done story (`SEED-107#recently-done`, recoverable at
`1f929859:.planning/seeds/SEED-107-dashboard-recently-done.md`) without
adding to its promises.

**Scope:**

- The done-record read stops delaying or failing the rest of the published
  read, and done records are read concurrently and not reread at a new
  revision when unchanged; the agent-profile read shares the same listed read.
- The panel background of session entries inside a work card and a done card
  is restored; only the local-launch note stays quiet.
- The one-shot guidance for completing a queued story says the result commit
  includes the done records `complete` wrote or removed.
- Unreadable done records are proved as the column lists them, and the failed
  read's journey step is named for what it proves.

**Plan:** [257-recently-done-correction](../slice-plans/257-recently-done-correction/PLAN.md)
