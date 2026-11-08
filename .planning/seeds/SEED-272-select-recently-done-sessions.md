---
id: SEED-272
status: active
planted: 2026-11-08
scope: story
---

# Select recently done sessions from the dashboard sidebar

<a id="select-recently-done-sessions"></a>

### Select recently done sessions from the dashboard sidebar

**Identity:** SEED-272#select-recently-done-sessions
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/527-select-recently-done-sessions/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e5cfb31eacba9c4375116b7dccb312f523b2c98392dae8c2863c0f1d927bce27","plan":"bf2e552ad402cd9f31b5aef8a1187e307c57f510d17d7afb5d93b0db6030f56b"}}
```

**Goal.** A developer reviewing recent work can choose a completed story or
standalone session from **Recently done sessions** without losing their
perspective. They can open the session's terminal or final report when they
want to read it.

**Scope.** The row selects, and a distinct Open action uses the existing
terminal or final-report access when available. Both actions are reachable by
keyboard and touch. Selection stays set on repeat activation and has its own
visible and accessible indication, separate from the indication that the
Side panel is showing a session. Selecting keeps the current perspective and
leaves the Side panel as it was.

A published done record matching the session's project and story identity
establishes a linked done story. The local Done mark establishes session status.
A standalone row selects the retained session and preserves the Selected story.
In Development, selection brings the story card or standalone session into
view in its project's Board, extending the Recently done range as needed.
In Intent, a linked selection updates the selected story's lens in its project,
and a standalone selection keeps the current project and reading. An unread
or failed done-catalog read stays distinct from a confirmed absence. While
the link is unresolved, the developer can still use the row's session access
and keep reading where they are. The increment covers **Recently done sessions**.
Starting a follow-up is covered by
[SEED-273](SEED-273-follow-up-from-done.md#follow-up-from-done).

**Key examples.**

- While reading **Intent** with another session's report in the Side panel,
  selecting a row linked to a published done story shows that story in Intent
  and leaves the report open. Selecting the row again keeps the same story
  selected. For a linked story in another project, Intent shows that project's
  story and remains the current perspective.
- From **Development**, choosing a linked row brings its selected Story card
  into view. Choosing a standalone row brings the selected session into view
  in its project's Board, including when it is older than the initially shown
  entries. The Side panel stays as it was.
- While reading an Intent file for a selected story, choosing a standalone
  session in another project selects the session row and keeps the current
  project, file, story selection, and Side panel. This includes a locally Done
  session whose linked story is still in Taken with no published done record.
- With a row selected, choosing its explicit Open action opens the available
  terminal or final report through the existing session access.

**Interaction considered.** A file manager's Select and Open actions let a
reader identify an item before entering its content. Here the selected target
can be a published story or a retained session, and Open always targets the
session. Keeping Open as the primary action and adding secondary Select would
preserve the familiar gesture, with the same risk of leaving Intent when the
reader chooses a row out of habit.

**Architecture.** [ADR 0008 — Project dashboard domain and
architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
includes linked Recently done sessions rows among the triggers for the page's
one Selected story. The Board and Intent read that shared selection. Standalone
selection uses the retained session identity. Published completion and local
session status retain their separate sources, and the Side panel keeps its
existing session access and lifecycle.

See the [session history and sidebar navigation guidance](../../dashboard/AGENT-LAUNCH-HISTORY.md#recently-done-range)
for the distinction between published completion and retained session status.

<a id="prove-recently-done-check-supersession"></a>

### Prove Recently done selection's check rules and tidy its catalog read

**Identity:** SEED-272#prove-recently-done-check-supersession
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/529-prove-recently-done-check-supersession/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"95514be0d58fe3982d99b75db2a85a50d14af8f6a065df3c6d5e3ca889288d08","plan":"d83984bfb28cbf040d7e909eabda2a7bff9f4d33417591494dca9538e4abec7a"}}
```

**Goal.** A maintainer changing Recently done session selection gets a failing
test when a superseded or unreadable done-catalog check would move the
developer's reading, and finds one done-catalog reading and wording shared
with the Board.

**Scope.** Bounded retrospective correction of
[Select recently done sessions](#select-recently-done-sessions). Proof of the
existing check rules, consolidation of the duplicated catalog read and its gap
wording, and trimming of overlapping selection tests. No new product promise.
Plan: [529-prove-recently-done-check-supersession](../slice-plans/529-prove-recently-done-check-supersession/PLAN.md).
