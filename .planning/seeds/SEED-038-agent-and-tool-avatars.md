---
id: SEED-038
status: active
planted: 2026-09-25
planted_during: Product backlog capture requested by the maintainer
trigger_when: Improving how the dashboard presents recorded agents, tools, and execution modes
scope: unknown
---

# SEED-038: Recognize agents, tools, and execution modes in the dashboard

## Why This Matters

For a developer scanning Taken work in the Open Dough dashboard, agent names,
host tool names, and execution modes appear as text in each recorded owner
summary. Small identity marks can make those facts easier to spot and
distinguish across stories.
This is a lower-priority presentation improvement; the current text remains a
usable way to identify them.

## Alternatives and Decision

Keeping text alone is the simpler choice and already conveys the recorded
facts. Pursue portraits and small marks as optional visual aids because the
maintainer wants agents, tools, and modes recognizable at a glance. The marks
must represent identity or workflow mode only: they must not imply that an
agent is present, online, or active,
in keeping with the [dashboard visual direction](../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction).

## Story Decomposition

<a id="recognize-agents-and-tools-by-avatar"></a>

### 1. Recognize agents, tools, and execution modes at a glance

**Identity:** SEED-038#recognize-agents-and-tools-by-avatar
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../quick/097-agent-tool-mode-identities/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0d69c00101db026064375edd82da002f07bddbd4d4382fadad8c8a373f579e54","plan":"111df3130e1fca3e2827fee3e74d5743a4b84fb4da3a4c26746ea61f54023152"}}
```

**Status:** Refined and queued on 2026-09-25; [slice plan](../quick/097-agent-tool-mode-identities/PLAN.md) prepared; not Taken.

- **Goal:** A developer scanning Taken work recognizes the recorded agent,
  host tool, and execution mode quickly, while the text still provides their
  exact identities.
- **Scope:** Use the approved set of 29 original, small illustrated agent
  portraits stored in `dashboard/public/agent-avatars/`, mapped to the fixed
  agent-name rotation. They may loosely resemble the people suggested by the
  names, but are original illustrations. Show the portrait beside the agent's
  name. Use the locally stored official marks in
  `dashboard/public/tool-avatars/` for Claude Code, Codex, and Cursor. Show
  each tool mark immediately beside its tool name, separate from the portrait;
  never place it over the agent's face. Use the two original, simple SVGs in
  `dashboard/public/mode-icons/`: a straight trunk line for Trunk Mode and a
  diverging line for Story Branch Mode. Show each immediately beside its mode
  name. Keep all names and other recorded owner facts as text. Icons
  communicate identity only, not presence or activity.
- **Key examples:**
  - A Taken card with `Akiho-chan` and `Claude Code` shows Akiho's portrait
    beside `Akiho-chan`, the straight-line SVG beside `Trunk Mode`, and the
    Claude icon beside `Claude Code`.
  - A Story Branch Mode card shows the diverging-line SVG beside `Story Branch
    Mode`; the recorded execution branch remains explicit text.
  - A card with a recorded agent but no host shows the agent portrait and
    `host not recorded`, without a tool icon.
  - A Taken entry with no readable agent profile keeps its explicit missing or
    unreadable-owner message, without a guessed avatar.
- **Deferred:** GitHub commit-author avatars and changing commit identities
  are outside this dashboard story.
- **Depends on:** Existing recorded agent and host tool facts. The approved
  local assets are already in the repository for future implementation.
- **Safe stopping point:** The dashboard remains understandable through text,
  and avatars do not suggest agent activity.

## Asset decisions

The portrait atlases were created with the built-in image generation tool and
approved by the maintainer on 2026-09-25. The vendor marks and their source
URLs are recorded in [dashboard avatar assets](../../dashboard/public/AVATARS.md).
The two mode symbols are original SVGs designed for this story, also recorded
there. They are decorative aids to the existing mode names.
The Codex mark is the official OpenAI icon served by the Codex documentation
site; no separate downloadable Codex mark was found in the official sources
reviewed during refinement.

## Ordering and When to Surface

Keep this story near the lower-priority end of the product backlog, after the
currently queued work. Revisit when dashboard identity presentation is being
improved; refinement does not authorize implementation.

## Breadcrumbs

- Maintainer request on 2026-09-25 to add avatars for agents and tools.
- Maintainer approval of the illustrated portraits and direction to place tool
  icons beside tool names, not on portraits, on 2026-09-25.
- Maintainer request on 2026-09-25 for simple Trunk Mode and Story Branch Mode
  SVGs, completed refinement, and a slice plan.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard owner presentation](../../dashboard/src/TakenOwnerFacts.tsx).
