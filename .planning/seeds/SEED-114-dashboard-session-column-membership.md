---
id: SEED-114
status: active
planted: 2026-10-06
planted_during: Terry's report of a just-started refinement session appearing in Recently done, followed by the requested placement of sessions without a story
trigger_when: A developer starts or marks done a dashboard session and reads Backlog, Taken, or Recently done
scope: story
---

# SEED-114: Dashboard session column membership

## Why This Matters

The dashboard's columns should help a developer distinguish current work from
completed work. Today Recently done also lists every retained local session,
including a refinement that has just started and is still Working. The same
session appears inside its Backlog story card and as a separate Recently done
entry, making the story association and the meaning of the column unclear.
A session started without a story also appears in Recently done immediately.

Terry requested one top-priority story combining both problems: keep open
story sessions with their stories, and show an open session without a story
in Taken until it is marked done.

## Story

<a id="session-column-membership"></a>

### Sessions appear with active work until marked done

**Identity:** SEED-114#session-column-membership
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"unselected","assessment":"not-ready","reasons":["An execution approach and slice plan have not been selected; slice planning is the next preparation step."],"basis":{"document":"97c40ab8f43c9870d063ba9ba8ca8deb877215629453af316e8949ca2b35bb30"}}
```

**Beneficiary:** A developer following story work and sessions started from
the dashboard on this machine.

**Goal:** The dashboard shows an open session where its current work belongs:
inside its visible story card, or in Taken when started without a story.
Recently done shows completed work rather than duplicating a newly started
session. Marking a session done moves its local entry to Recently done without
declaring its story complete.

**Scope:**

- An open refinement or execution session belonging to a Backlog or Taken
  story stays inside that story's card. It has no separate entry in Recently
  done while open. A published stage change carries that association to the
  story's new card.
- A session started with Start session and no story appears as a local session
  entry in Taken while it is open. Mark as done removes that entry from Taken
  and lists the same session in Recently done.
- Marking a story session done removes it from the active story card and
  retains it in Recently done. The story stays in its published stage until
  the project's published records change.
- Open means the session has not been marked done. Working, waiting for
  input, Ready for review, stopped, or unknown native activity alone does not
  move an open session to Recently done.
- Preserve the saved session identity, story association, terminal/report
  access, and Sessions sidebar navigation across placement changes and
  reloads. Successfully reopening a session restores its open placement.
- Taken's local session entries remain distinguishable from published Taken
  stories. Displaying a session there creates no canonical story or published
  Take. Column counts and navigation account for the entries actually shown.
- Published done-story cards retain their published meaning and group their
  retained sessions once. Sessions whose stories leave the active lists remain
  reachable; this change must not lose their saved records or access.
- Update the session-history contract and overlapping tests that currently
  prescribe all-session placement in Recently done to reflect this decision.

**Key examples:**

| Before | Action | Result |
| --- | --- | --- |
| Share repeated reads across dashboard observers is in Backlog. | Start refinement. | Its Working session is inside that Backlog card and accessible through Sessions; Recently done has no standalone entry for it. |
| A story is in Taken. | Start its execution session, or publish the Take of a Backlog story that already has an open session. | The open session is inside the Taken story card, with no standalone Recently done duplicate. |
| A project has no session started without a story. | Use Start session. | The new open session appears once as a local session entry in Taken and is accessible through Sessions; it is absent from Recently done. |
| A session without a story is in Taken. | Its host reports Ready for review, or its activity becomes unknown. | The session remains in Taken until marked done. |
| A session without a story is in Taken. | Mark as done, then reload. | The same saved session is in Recently done and absent from Taken and the open Sessions list. |
| A Backlog story has an open refinement session. | Mark that session done. | The story remains in Backlog; its closed session is retained in Recently done and no longer appears as an open session inside the story card. |
| A session without a story was marked done. | Successfully reopen its terminal. | That same session returns to Taken as open and is no longer a standalone Recently done entry. |

**Evidence and decision:** The supplied screenshot shows session
`776bbb43-0c9c-453c-800f-c9fa178d6a69` as Working both inside the Backlog card
for `SEED-113#share-repeated-observer-reads` and in Recently done. Its
association is intact; the duplication comes from the column's display rule.
[RecentlyDone](../../dashboard/src/RecentlyDone.tsx) filters out only sessions
already grouped inside a shown done-story card, with no open/done filter and
no exclusion for active story cards. The
[session-history contract](../../dashboard/AGENT-LAUNCH-HISTORY.md) explicitly
prescribes that current behavior. Terry's 2026-10-06 instruction replaces that
placement rule for active story sessions and sessions started without a story.

**Breadcrumbs:**

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Current card-session association](../../dashboard/src/agentLaunch.ts).
- [Current story-session journeys](../../dashboard/tests/agent-launch-card-sessions.spec.ts).
- [Current Recently done grouping journeys](../../dashboard/tests/recently-done-story-sessions.spec.ts).
- Terry's 2026-10-06 request to combine both placement problems and put this
  story first in Backlog list.
