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

- Starting Follow up from the shared Intent review carries the story or
  session and the exact published comparison as the source. The dialog uses
  the review's selected sessions to identify relevant context. The developer
  still makes a separate choice about which optional material to send.
- The developer clears every optional checkbox and sends the follow-up. The
  message still includes the story information and the developer's follow-up
  request.
- Each involved session has its own checkbox. Its details show retained context,
  such as the original request or earlier follow-up and the final report. One
  checkbox includes the available line notes together. Expanding or collapsing
  either kind of detail leaves the checkbox selection as it was. Details start
  collapsed.
- A developer follows up on a new-side line and selects one of two involved
  sessions and the line notes. Paired tags mark the boundaries of the story,
  current follow-up, each selected session, and the line notes. The content
  inside each section is plain text. The current request and each note identify
  their own file, line, and diff side.
- For a selected published session, include its UUID and any commit list or
  range resolved from the published session record. Optional session context
  can include retained requests and final reports.

**Design reference.** The [interactive Follow up mockup](../evidence/SEED-415-follow-up-context.html)
opens on a diff-line request with all optional items unchecked. Select
**Syntax styling review** and **Line notes**, then use **Start session** to
inspect the example message in a simulated receiving session.

Carry this reference and its cleanup into the slice plan. At story wrap-up,
delete the mockup and remove its planning links.

**Related work.** [Richer Done follow-up card cues](SEED-395-richer-done-follow-up-card-cues.md#richer-done-follow-up-card-cues)
also discusses making earlier follow-ups available as context. This story
covers the developer's inclusion choices and the structure of the sent message.
