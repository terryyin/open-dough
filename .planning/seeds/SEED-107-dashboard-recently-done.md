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

## Story

<a id="recently-done"></a>

### Dashboard shows recently done stories with their sessions

**Identity:** SEED-107#recently-done
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/253-dashboard-recently-done/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"df6e7a768ff63f62f1aa1b0e35c093129c52500f7e73a52f374823ad9e00f412","plan":"8a600dbf3271c78b1be1138d6d681f16e53635f8dd5ee3836a0b3f21a3b905c8"}}
```

**Beneficiary:** A developer watching a project's dashboard, on any machine,
who wants to see which stories were recently finished, who finished them, and
the sessions on this machine that did the work.

**Goal:** Completing a story publishes a short record of it beside the product
backlog, and the dashboard's Recent sessions column becomes **Recently done**:
one newest-first list of recently done stories, each showing its sessions
inside its card, together with the sessions that belong to no done story.

**Scope:**

- Completing a story through the product backlog's `complete` operation writes
  one done record for it, in the same change that removes its entry and
  releases its agent profile, so the record is committed and published with
  the closure and needs no extra wrap-up step or judgment.
- A done record keeps only what survives cleanup: the story's identity and
  title, when it was completed, the developer whose Git identity is configured
  in that workspace, and, when the story had an execution agent profile, its
  agent, host tool, and model. It links to no seed or plan.
- The same operation removes done records completed more than 30 days before.
  The dashboard also leaves out a published record older than 30 days, so a
  quiet project does not show old work as recent. The record's window and the
  dashboard's done-session retention are equal today and are separate rules.
- The column's heading and its describing text say Recently done; every place
  the dashboard or its documentation names the column follows.
- A done story's card shows its title, when it was done, the developer, and
  the agent with its host tool when recorded, and lists inside it every
  session this machine keeps for that story, open or marked done, newest
  first, each with the state and actions a session entry has today.
- A session whose story has no shown done record, and every session started
  without a story, keeps its current entry in the same list.
- One list, newest first: a done story is placed by its completion time and a
  session outside a done story by its launch time, as today.
- A session inside a done story's card stays reachable from the Sessions
  sidebar, and deleting an entry moves the keyboard as it does today.
- A project that publishes no done records shows its sessions as today, with
  no error. When done records cannot be read, the column says so and still
  lists the sessions.
- The product backlog and story wrap-up guidance describe the done record as
  part of completing work: it is committed with the entry's removal and stays
  in the project after the story's spent history is deleted.
- [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
  gains one sentence where it describes durable project state, in that
  section's own terms: completing work leaves a short published done record
  beside the backlog, which the dashboard reads like any other record. Its
  open-design list no longer names recently finished story views. Nothing
  else in the ADR changes, and it gains no section, concept row, or format
  detail.
- The [project visibility requirements](../../docs/project-visibility-requirements.md#recently-finished-stories)
  describe the done record beside agent profiles as a published record, and
  their retained question about completed-work views is answered there. The
  [session history](../../dashboard/AGENT-LAUNCH-HISTORY.md) and the dashboard
  documentation describe the column as built.

**Deferred promises:**

- Opening a done story's seed section or plan from its card. The record keeps
  no revision; the closure commit that added it is found from Git history.
- The developer's avatar on a done card. The record keeps a name only, with no
  email address or account.
- A done record for work that never had a backlog entry, such as a context-only
  instruction; `complete` does not run for it.
- Reconstructing stories completed before this story is installed.

**Boundary assumptions:**

- [SEED-106#paged-dashboard-columns](SEED-106-dashboard-paged-columns.md#paged-dashboard-columns)
  names the same column Recent sessions; whichever lands second uses the name
  then on trunk.
- [SEED-052#reconcile-recently-done-and-sessions](SEED-052-start-agent-work-from-dashboard.md#reconcile-recently-done-and-sessions)
  is an unqueued candidate for the same outcome that keeps Recent sessions as
  a separate list. This story replaces that list with the merged one and does
  not edit the candidate.

**Key examples:**

- Taken story “Card shows avatar”, executed by agent Yui-chan on Claude Code
  in Terry's workspace → wrap-up runs `complete` and lands → the published
  project holds a done record with the identity, title, completion time,
  Terry, Yui-chan, and Claude Code, and no backlog entry or agent profile for
  it.
- That record is published and this machine keeps two sessions for the story,
  one marked done and one still open → the developer opens the dashboard →
  Recently done shows one card for the story with both sessions inside, and
  neither session appears as a separate entry.
- Another developer opens the dashboard on a machine that launched none of
  that story's sessions → the same card shows with its title, time, developer,
  and agent, and no sessions.
- A story done at 10:00, an ad hoc session launched at 11:00, and a session of
  a still-queued story launched at 09:00 → the list reads: ad hoc session, done
  story, queued story's session.
- A session launched yesterday for a story done last week sits inside the done
  story's card, below today's entries; it does not lift the card.
- A done record from 31 days ago exists and a second story completes → the
  change that adds the new record removes the old one. Until then the
  dashboard leaves the old one out, and an open session of that story shows as
  its own entry again.
- A queued story is removed with `complete` and has no execution agent profile
  → its record names the developer and no agent or host; its card shows no
  agent.
- A project whose installed guidance writes no done records → the column is
  titled Recently done and lists sessions exactly as Recent sessions did.

**Architecture:** The design of the done record, and why it is a published
record of its own, is the
[Done stories as published records](../NORTH-STAR.md#done-stories-as-published-records)
topic. Delivery retires that topic into the code and the documents named in
Scope. No Accepted ADR conflicts; ADR 0008 is Proposed and binds nothing.

## Correction

<a id="recently-done-correction"></a>

### Recently done reads beside owners, keeps the session look, and closes completely

**Identity:** SEED-107#recently-done-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/257-recently-done-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"cd0e008757efb8c727ce04dd35826855e9797d6193a3be8263f933a16aea1f29","plan":"a9074f459065e6f9ebd96fa244dc802b6a9049495a958a3c42d8c142c99ee718"}}
```

**Goal:** A developer watching the dashboard sees owners, preparation, and
progress without waiting on the done records, sees a story's sessions set off
inside its card again, on a work card and a done card, and is told which done
records are unreadable; an agent closing a queued story in one shot commits
the done records `complete` wrote or removed. This corrects the delivered
[Recently done](#recently-done) story without adding to its promises.

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
