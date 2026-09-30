---
id: SEED-064
status: active
planted: 2026-09-30
planted_during: Terry's request to add a story for generating avatars for the nerds agent
trigger_when: A developer sees or assigns agents from the Odd-e nerds collection and wants each to have its own avatar
scope: story
---

# SEED-064: Nerds agent avatars

## Why This Matters

Agents named for the Odd-e nerds are shown by each person's real photo, which is
local-only. A cartoon character per person gives every nerd agent a recognizable
avatar that resembles them without showing their actual photo.

## Story

<a id="generate-nerds-agent-avatars"></a>

### Generate cartoon avatars for the nerds agents from their photos

**Identity:** SEED-064#generate-nerds-agent-avatars
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer using the nerds agent collection sees a cartoon
  character resembling each person, instead of the raw photo or a name alone.
- **Evaluation:** For every nerds agent with a current photo, a generated
  cartoon character exists locally and resembles that person. Each is built from
  the face only; nothing else in the photo carries into the character. The
  generated avatars never appear in Git status, commits, or published output.
- **Scope:**
  - Generate one cartoonized character avatar for each nerds agent from the face
    in that agent's current local photo.
  - Capture only the face; the character resembles the person, not the rest of
    the photo.
  - Keep the generated avatars local to this machine and git-ignored, like the
    original photos. Do not add them to the repository.
  - The story needs no code change and no tracked-file change, so its agent
    works directly in the default checkout of main without touching Git state.
- **Boundary:** Local generation only. Does not commit, publish, or change how
  the dashboard displays avatars unless refined later.
- **Capture:** Terry requested this story as the first backlog item on
  2026-09-30 and described its intent on the same day.

## Open Decisions

- Where the generated avatars live locally and how the dashboard would prefer
  them over the photos, if at all.
- Which generation tool or model is used, and the consistent cartoon style.
- How a person's likeness is checked as resembling them.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Nerds agent collection](../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs).
- [Local avatar photos and their git-ignore rule](../../dashboard/public/AVATARS.md).
