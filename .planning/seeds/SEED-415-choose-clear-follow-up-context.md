---
id: SEED-415
status: active
planted: 2026-11-20
planted_during: Requested Dashboard Follow up clarity and optional context
trigger_when: selected from the product backlog
scope: one story
---

# SEED-415 — Choose clear follow-up context

<a id="choose-clear-follow-up-context"></a>

### Choose clear follow-up context

**Identity:** SEED-415#choose-clear-follow-up-context
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-415#choose-clear-follow-up-context","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session UUID and attributable changes","rationale":"The receiving follow-up needs a published UUID to resolve a selected session’s commits on another machine.","condition":"The repository contains a JSON record with the stable UUID and attributable published changes for a session that published work.","state":"satisfied","resolution":{"revision":"2d82175d5ba4b7cdaba48cfa8312cfa261de4816","path":".planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes","summary":"Verified .planning/sessions/b68c8a3e-617d-4277-8da6-5ad5952a9b43.json on origin/main, published by 6c69e07c320fc2c1f8fd08f6d14da0c98732e632. The Dashboard record parser accepts it at its UUID path. The record names the completed SEED-413 frame and navigation proof session. All 13 attributable ranges are reachable from origin/main with each base an ancestor of its candidate.\nCondition satisfied: The repository contains a JSON record with the stable UUID and attributable published changes for a session that published work.\nAccepted integration: 8be1d19835f1448ceb5a70342bf35fe122739408 on origin/refs/heads/main."}}]}
```

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/808-choose-clear-follow-up-context/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"24120b647e8cb251330208066e0e6acc8c03ed58f52b90d8d1816881b9c52c0a","plan":"da2e921a927f3f0097daa47ca6cf411f624d9fa4fbb9eecef88444c77a926557"}}
```

#### Goal

A developer continuing work from Dashboard Follow up can send just the
context the next session needs. The receiving session can recover the exact
published comparison the developer followed up and tell which file or line
each comment or note describes, even after the source checkout retires.

#### Scope

- Carry the source story and the exact published comparison from Intent.
  Preserve the reviewed session identity when it supplies the comparison.
  A file or line follow-up carries its target in the current request, with
  both paths for a rename and the line and side for a line target.
- Use the review scope to identify the involved sessions. Give each session
  a separately labeled checkbox and show its available details on demand.
  Give the available waiting line notes one checkbox and one disclosure.
  Where a story or file note is available through the same attachment flow,
  retain its own scope in the message. Optional selections start unchecked
  and details start collapsed. Opening or closing details preserves the
  developer's selections. The story and current request are always included.
- Group the sent message with paired tags for the story, the current request,
  each selected session, and the attached notes. Keep the contents plain
  text and make the boundaries distinguishable even when a developer pastes
  text with a literal section tag. Give each note its own recorded target.
  For each selected published session, include its UUID and the attributable
  commit list or ranges the published record supplies. Include retained
  request and report text when available for a selected session.
- Preserve existing launch and retry behavior. An unchecked item supplies no
  optional text. An unavailable optional item leaves the core follow-up
  usable. An unavailable required comparison calls for an explanation and a
  chance to return to review, since substituting another comparison can point
  the receiver at different code.

#### Key examples

- A developer follows up on a Done story's published file and leaves all
  optional boxes clear. Start sends the story and current request with the
  file and the exact Git comparison. No optional section is sent.
- Intent is showing a recorded range of one published session. The developer
  opens Follow up on an old-side line and leaves the optional session box
  clear. The current request still names the published source session, exact
  range, old-side path and line. Checking that session adds its separate
  context, including its UUID and available published ranges, even on a
  machine with no retained request or report for it.
- A developer follows up on a new-side line of a whole-story comparison.
  Of two involved sessions, they select one and attach waiting notes. They
  open and close each disclosure and see the same selections. Start sends
  only that session and the notes. A note on an old-side line and another on
  a different file each keep their own path, comparison, line and side.
- A developer pastes a quoted snippet containing a line that looks like a
  closing tag. The receiving message still shows where the current request
  and each attached section end.

#### Architecture

Treat the reviewed comparison as source evidence and optional attachments as
choices for this send. The comparison stays pinned through admission and is
available without local launch history. The Dashboard can add locally retained
requests, reports and waiting notes, while published Git records supply session
identity, story association and attributable changes. Resolve admitted inputs
from those sources and retain the resolved message for retry. This keeps the
story, session, comparison and optional context explicit across review and
launch.
[ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
[ADR 0002, Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution).

The published record `b68c8a3e-617d-4277-8da6-5ad5952a9b43` at `097bdf38f`
has a story identity and thirteen attributable ranges reachable from trunk.
The current Dashboard record parser reads the ranges and drops the story
field. Existing file Follow up accepts a story's published completion or a
landed-run reference. The published-session review instead identifies a UUID
and a recorded range. Reuse the published comparison and association work in
[SEED-427](SEED-427-review-published-changes.md#review-published-changes) and
[SEED-426](SEED-426-start-ad-hoc-work-under-a-story.md#start-ad-hoc-work-under-a-story)
for their respective review and launch responsibilities.

#### Scope decision

The developer agreed to cover published whole-story comparisons and individual
published session ranges here. Follow up from a combined multi-session diff
belongs with the [combined review](SEED-418-review-published-session-changes.md#review-selected-sessions-together),
which owns recovering that exact diff and line when intervening changes are
excluded. Optional attachments may still include several sessions.

**Design reference.** The [interactive Follow up mockup](../evidence/SEED-415-follow-up-context.html)
opens on a diff-line request with all optional items unchecked. Select
**Syntax styling review** and **Line notes**, then use **Start session** to
inspect the example message in a simulated receiving session.

Carry this reference and its cleanup into the slice plan. At story wrap-up,
delete the mockup and remove its planning links.

**Related work.** [Richer Done follow-up card cues](SEED-395-richer-done-follow-up-card-cues.md#richer-done-follow-up-card-cues)
also discusses making earlier follow-ups available as context. This story
covers the developer's inclusion choices and the structure of the sent message.
