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

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer starting a Dashboard Follow up can choose which
supporting context to send with the required story information. The receiving
session can tell what each included comment or note refers to, including
comments about a particular file or line.

**Current behavior.** The dialog lists the retained story and session context
as read-only lines and offers a separate checkbox for story notes. The sent
message uses text labels and bullets. File and line details can be hard to
associate with the comment or note they describe.

**Examples.**

- The developer clears every optional checkbox and sends the follow-up. The
  message still includes the story information and the developer's follow-up
  request.
- Available earlier follow-up messages, previous reports, notes, and other
  supporting context have labeled checkboxes with details collapsed by default.
  The developer can expand the details before deciding what to send. Expanding
  or collapsing details leaves the checkbox selection as it was. The message
  includes only the supporting context selected for this send.
- A line follow-up includes a new comment, a selected story-wide note, and a
  selected note on another line. The message uses clearly named XML opening and
  closing tags to group the story information, current follow-up, and each
  selected item by what it refers to. The current comment carries its file and
  line target, the story-wide note is identified as such, and the line note
  carries its own file, line, and diff side where applicable. A file-wide note
  carries its file path.

**Related work.** [Richer Done follow-up card cues](SEED-395-richer-done-follow-up-card-cues.md#richer-done-follow-up-card-cues)
also discusses making earlier follow-ups available as context. This story
covers the developer's inclusion choices and the structure of the sent message.
