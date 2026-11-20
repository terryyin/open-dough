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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/728-review-done-sessions-on-open-story-cards/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0754c1704fea916889104148a3ed652c1e0f2fc2052784e696da8688a9e8faa6","plan":"cae28ac5afb34426b7df7c00313a6918d662f344ec70aa5b595de9aa91920a29"}}
```

**Goal.** A dashboard developer can scan an unfinished story for its progress,
current work, and next action, and review completed sessions in the context of
the story they belong to.

**Scope.** In Development, the Board groups a story's retained sessions marked
Done under that project's Backlog or Taken card while the story is unfinished.
The card starts with its history collapsed and shows the number of sessions it
holds. A developer can open the history and use each session's existing actions,
including access to the terminal or final report and Follow up when offered.
Story-level Review changes keeps its existing comparison and availability.

Each session has one home on the Board so the Recently done count describes
entries a developer can find there. An unfinished card takes its own sessions,
including sessions labelled **Returned to backlog**. Without an unfinished
card, the published done card holds them when listed. Without either card the
session is standalone. The Sessions sidebar retains its history and selection
behavior. When an existing sidebar action directs the Board to a specific
session inside an unfinished card, that session is revealed in its new home.
Changes to session retention, ad hoc follow-up grouping and review semantics
are outside this story.

**Key examples.**

- A Backlog or Taken story has two Done sessions and one current session.
  On first reading the card, the developer sees the current work and a
  collapsed **Done** row with a count of two. Opening it reveals both sessions
  and their actions. Closing it hides them from view and keyboard navigation.
  Recently done has neither session as a standalone entry.
- A story with no Done sessions has no disclosure. Marking its last current
  session Done adds a **Done** count of one to the same card. The session is
  available on expansion and no longer counts as current work for Start
  eligibility. Story placement continues to follow the published backlog.
- If the published snapshot shows an unfinished card and a historical done
  card for one story, its own retained sessions appear once, on the unfinished
  card. When the story is completed and has only its published done card, that
  card holds the retained sessions. A retained session whose story has neither
  card is available as a standalone Recently done entry.

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

**Architecture.** Card membership comes from the published project snapshot.
Session ownership and disposition come from the machine's retained launch
evidence, matched by project and story identity. The Board derives placement
from both. The sidebar's session history uses the retained evidence directly.
This follows [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state).
