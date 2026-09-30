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
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

- **Goal:** A developer using the nerds agent collection sees a cartoon
  character resembling each person, instead of the raw photo or a name alone,
  so every nerd agent has a recognizable avatar without showing the person's
  real photo.
- **Evaluation:** For every nerds agent with a current photo, a generated
  cartoon character exists locally and, in the maintainer's review of photo and
  cartoon pairs, resembles that person. Each is built from the face only;
  nothing else in the photo carries into the character. The generated avatars
  never appear in Git status, commits, or published output.
- **Scope:**
  - Generate one cartoonized character avatar for each nerds agent
    (`nerdAgentNames`) from the face in that agent's current local photo.
  - Use OpenAI image editing with the photo as the identity reference and one
    shared style prompt for all avatars: adult editorial cartoon portrait, head
    and shoulders, distinct muted background, no text, and no clothing or
    background carried over from the photo. This matches the approved brief in
    [the avatar assets note](../../dashboard/public/AVATARS.md). Generation
    costs money, so the developer starts it.
  - Store each as `dashboard/public/agent-avatars/odd-e-nerds/cartoon/<lowercase
    name>.webp`, inside the folder that is already git-ignored, so no tracked
    file changes and no new ignore rule is needed.
  - Review with the maintainer on a contact sheet of photo and cartoon pairs.
    Each pair is accepted or marked redo; a redo regenerates only that person.
    There is no automated likeness check.
  - A missing or very small photo (`terry.jpg` is 72 × 72) is still attempted,
    and the maintainer's review decides. A person whose avatar fails review is
    reported as a gap and does not block the others.
  - The story needs no code change and no tracked-file change, so its agent
    works directly in the default checkout of main without touching Git state.
- **Deferred:** Making the dashboard prefer the cartoon over the photo, and
  documenting the cartoon folder in the avatar assets note, are separate work.
- **Boundary:** Local generation only. Does not commit, publish, or change how
  the dashboard displays avatars. A photo with no matching nerds agent
  (`matthias.jpg`) gets no avatar.
- **Key examples:**
  - `stanly.jpg` exists → generate → `odd-e-nerds/cartoon/stanly.webp` exists
    and resembles Stanly; his clothing and background are not copied; `git
    status` stays clean.
  - An agent has no photo → no avatar is generated for it and the gap is
    reported; the dashboard keeps showing the name alone as it does today.
  - `matthias.jpg` exists with no nerds agent → no avatar is generated.
  - The maintainer marks one avatar redo → only that person's avatar is
    regenerated; the others are untouched.
- **Capture:** Terry requested this story as the first backlog item on
  2026-09-30 and described its intent on the same day. Refined with Terry on
  2026-09-30; the story is to be executed without a plan.

## Open Decisions

None.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Nerds agent collection](../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs).
- [Local avatar photos and their git-ignore rule](../../dashboard/public/AVATARS.md).
