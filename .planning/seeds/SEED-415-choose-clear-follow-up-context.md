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
{"schemaVersion":1,"identity":"SEED-415#choose-clear-follow-up-context","dependencies":[{"supplier":{"identity":"SEED-418#review-published-session-changes","href":"seeds/SEED-418-review-published-session-changes.md#review-published-session-changes"},"implementation":"Published session UUID and attributable changes","rationale":"The receiving follow-up needs a published UUID to resolve a selected session’s commits on another machine.","condition":"The repository contains a JSON record with the stable UUID and attributable published changes for a session that published work.","state":"waiting","resolution":{"revision":"2d82175d5ba4b7cdaba48cfa8312cfa261de4816","path":".planning/seeds/SEED-418-review-published-session-changes.md#review-published-session-changes","summary":"Still waiting. No repository holds a published session record from a real session yet: the delivered Land route is unusable until SEED-418#correct-published-session-review (plan 746) slice 2 lands. Next action: re-judge after that correction is delivered and a real Land has published a record.\nCondition remains unresolved: The repository contains a JSON record with the stable UUID and attributable published changes for a session that published work.\nAccepted integration: 8be1d19835f1448ceb5a70342bf35fe122739408 on origin/refs/heads/main."}}]}
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
- When the published session JSON records a selected session's UUID, include the
  UUID in that session's section so the receiving session can find the related
  commits. Include the commit list or range there when it can be resolved from
  that UUID. Older sessions without a published UUID still contribute their retained
  context.

**Design reference.** The [interactive Follow up mockup](../evidence/SEED-415-follow-up-context.html)
opens on a diff-line request with all optional items unchecked. Select
**Syntax styling review** and **Line notes**, then use **Start session** to
inspect the example message in a simulated receiving session.

Carry this reference and its cleanup into the slice plan. At story wrap-up,
delete the mockup and remove its planning links.

**Related work.** [Richer Done follow-up card cues](SEED-395-richer-done-follow-up-card-cues.md#richer-done-follow-up-card-cues)
also discusses making earlier follow-ups available as context. This story
covers the developer's inclusion choices and the structure of the sent message.
