---
id: SEED-414
status: active
planted: 2026-11-19
planted_during: Terry asked to prioritize completed-session history and review a quieter story-card design before implementation
trigger_when: selected from the backlog for slice planning
scope: one story
---

# SEED-414 — Review done sessions on open story cards

<a id="review-done-sessions-on-open-story-cards"></a>

### Review done sessions on open story cards

**Identity:** SEED-414#review-done-sessions-on-open-story-cards
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A dashboard developer can scan an unfinished story for its progress,
current work, and next action, and review completed sessions in the context of
the story they belong to.

**Current behavior.** The board's Recently done column can list completed
sessions from a story that still has an active card. The developer has to look
away from that card to find its history. The card already gives similar visual
weight to several kinds of status and actions, so adding more rows would make
it harder to scan.

**Examples.**

- A Taken or Backlog story has two done sessions and one current session.
  The card shows the current session and a collapsed **Done** row with a
  count of two. Expanding the row reveals both completed sessions and their
  existing review actions. Collapsing it hides the session rows again.
  Neither session appears as a standalone entry in the board's Recently
  done column while its story has an unfinished card.
- A story with no done sessions has no **Done** row. A story with completed
  sessions and no current session can still show its **Done** row.
- When the story is completed, its published done card in Recently done
  holds its session history under the existing completed-story behavior.
  Completed sessions without a visible unfinished or completed story card
  remain available through their existing Recently done entries.

**Approved card design.** Lead with the story title and compact slice
progress. Give the current session and its action the most visual emphasis.
Keep the Done count and secondary story actions quiet. Preserve the existing
assignment display and roster behavior. Show the agent with its portrait
and name, and the credited human developer with their smaller avatar and
name when available.

Use the interactive [story-card mockup](../evidence/SEED-414-story-card.html)
as the visual reference for the collapsed and expanded states. Link to this
copy from the slice plan and carry forward its cleanup. Delete the mockup
and its planning links at story wrap-up once execution is complete.

**Scope.** The dashboard board, its unfinished story cards, and session
placement in its Recently done column. The Sessions sidebar has a separate
history view.
