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

**Plan:** [Session column membership](../slice-plans/262-dashboard-session-column-membership/PLAN.md).

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/262-dashboard-session-column-membership/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0dbf8cd30cfee3cf7f3f310cd2e612826bc2a6723d0e0c0aaf9e33b8e181b435","plan":"a32dd88e7b231906471e2d162093056d40cea6678fcafc59a4de17bc6a60ec29"}}
```

**Beneficiary:** A developer following story work and sessions started from
the dashboard on this machine.

**Goal:** A developer reading the dashboard can tell which work is still open
and which has been marked done. An open story session stays with its visible
Backlog or Taken story card; an open session started without a story appears
in Taken. Closing a session moves its local entry to Recently done while its
story keeps the membership published by the project.

**Scope:**

- Use the saved session's done mark to determine whether it is open. Native
  Working, Needs input, Ready for review, stopped, unavailable, or unknown
  activity does not close it. Mark as read does not close it either. The
  existing manual and automatic paths that record or clear a done mark keep
  their meaning; this story changes placement, not completion policy.
- Apply the placement below to retained sessions with confirmed identities,
  within their selected project. Each session appears once across the three
  columns; its separate appearance in the open Sessions sidebar is navigation.

| Saved session | Published story membership | Column placement |
| --- | --- | --- |
| Open refinement or execution | Story is in Backlog or Taken | Nested inside that story's card, with no standalone column entry. |
| Open session started without a story | No story identity was supplied | Standalone local session entry in Taken, absent from Recently done. |
| Marked done | A recent done-story card for that identity is shown | Nested once inside that done-story card in Recently done. |
| Marked done | No recent done-story card is shown | Standalone session entry in Recently done, even when the story remains in Backlog or Taken. |
| Open story session | Story is in neither Backlog nor Taken | Standalone local session entry in Taken, retaining the story reference, even when a recent done-story card is shown. |

- When published membership moves a story between Backlog and Taken, its open
  sessions follow the story card. The association uses project and story
  identity, and the session remains the same host-qualified native session.
  A session is not turned into an ad hoc session because its story disappears.
  A recent done-story card holds marked-done sessions only; an open session
  whose story has completed has its own active entry in Taken. If that story
  returns to an active list, the open session moves inside its story card.
- A successful done mark removes the session from its active placement and
  from the open Sessions list. A refused mark leaves placement unchanged.
  Recorded local Done still controls placement when native stop or rename is
  unconfirmed; show that problem and any observed Working truthfully.
- Successfully reopening a session, or another existing operation clearing
  its done mark, restores open placement from its current story membership.
  A failed reopen preserves the done mark and Recently done placement.
- Preserve session attribution, reports, terminal or final-report access,
  record actions, and the existing 30-day retention after a done mark. Reading
  a report, an expired published done-story card, or a missing workspace does
  not itself close a session.
- Keep unresolved launch or conversation-creation evidence reachable and
  explicitly uncertain. Such evidence is not a confirmed session and must
  not be counted as one. Changing startup and reconciliation policy is
  outside this story.
- Update the maintained session-history contract and overlapping journeys
  that currently require every local session to appear in Recently done.

**UI:**

- Taken keeps published story cards in their recorded order, followed by its
  standalone local session entries in newest-launch-first order. A local
  session retains its title, host, state, and local-launch wording, with its
  story reference when one exists. It has no invented story priority,
  preparation state, or slice progress.
- Recently done keeps published done-story ordering by story completion time
  and the existing newest-launch-first ordering for standalone retained
  sessions. Later session activity does not move a done-story card.
- Heading and column-edge counts count top-level entries: a story card counts
  once, its nested sessions add nothing, and a standalone session counts once.
  For example, one Taken story with two nested sessions plus one standalone
  session means two Taken entries. Empty-column wording follows that same
  set of entries.
- Distinguish sessions still being read from no sessions kept. Do not present
  an incomplete combined count as complete or infer a missing story from an
  unread backlog. Done-record loading or failure does not lose retained
  closed-session access; when a matching done card is read, the same closed
  session can move inside it without appearing twice.
- Selecting an open session in Sessions reveals its current column entry or
  story card, including Taken for a session without a story. Terminal/report
  highlighting and keyboard return follow the same session after a placement
  change; moving an entry does not reopen or detach its terminal.

**Published and local meaning:** Taken's standalone session entries are
machine-local work, distinguishable from published Taken stories. Adding,
closing, or reopening them creates no canonical story, published Take, or
story-completion record. Published story membership continues to come from
the project's Git records. This follows
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
which keeps story membership and other workflow facts separate and gives
each fact one authoritative record.

**Key examples:**

| Before | Action | Result |
| --- | --- | --- |
| Share repeated reads across dashboard observers is in Backlog. | Start refinement. | The Working session is nested only in its Backlog card across the columns, with Sessions navigation. Recently done has no entry for it. |
| That Backlog story has an open session. | The project publishes its Take. | The same session is nested in the Taken story card; moving the story does not create a session or close its existing terminal. |
| A Taken story has an open session. | Its story completes or otherwise leaves both active lists. | The same session appears as a local entry in Taken with its story reference. A published done-story card may appear in Recently done, but does not also contain that open session. |
| Taken has no published stories. | Start session without a story. | Taken shows one local session entry and no empty-column message; the session is in Sessions and absent from Recently done. |
| Taken has one story with two nested sessions and one session without a story. | Read the column or reveal it using the edge control. | Both counts report two entries; selecting the standalone session in Sessions reveals Taken and opens that same session. |
| A session without a story is open in Taken. | Its host reports Ready for review, or an attention report is marked read. | The session stays in Taken; neither action records local Done. |
| That open session is Working. | Confirm Mark as done; local Done is saved but native stop is unconfirmed. | It moves to Recently done and leaves the open Sessions list; the native Working reading and stop problem remain truthful. |
| A Backlog story has an open refinement session. | Mark that session done, then reload. | The story remains in Backlog without that open session; the same saved session is retained in Recently done. |
| A marked-done session is in Recently done. | Reopen successfully, then contrast with a refused reopen of another marked-done session. | The successfully reopened session returns to its active story card, or Taken when it has no story; the refused one stays marked done in Recently done. |
| A marked-done session is shown before its published done records finish loading. | Read its matching recent done-story card. | The same session is nested once in that card, with its reports and access intact. |
| A recent done-story card contains a closed session. | The story's published done record passes the existing display window while the local session is still retained. | The closed session becomes a standalone Recently done entry until its own retention expires. |

**Refinement assumption:** The requested separation of open and done work
applies when a story completes or disappears as well. An open session without
a Backlog or Taken story card therefore appears in Taken, with its saved story
reference; a done-story card groups only marked-done sessions. The question
about this boundary was sent on 2026-10-06 without an answer before drafting
finished. This is the agent's stated default for review, not a recorded human
answer. It replaces the initial seed's preservation of all sessions inside a
done-story card and resolves the otherwise inconsistent open-session placement.

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
