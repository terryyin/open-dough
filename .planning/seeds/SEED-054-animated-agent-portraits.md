---
id: SEED-054
status: active
planted: 2026-09-28
planted_during: Maintainer request to probe what Claude Code can produce for dashboard portrait animation
trigger_when: Deciding whether agent portraits should gain short hover animations
scope: small
---

# SEED-054: Animated agent portraits

## Why This Matters

Hovering an agent portrait on a Taken or Preparing card already enlarges it to
the high-resolution image (see [AVATARS.md](../../dashboard/public/AVATARS.md)).
A brief, characterful gesture could make agents feel more alive. Before
investing in every portrait, the maintainer wants to see how good a
Claude Code–produced animation can be for a single character.

## Stories

<a id="animate-first-agent-portrait"></a>

### Animate the first agent's enlarged portrait on hover

**Identity:** SEED-054#animate-first-agent-portrait
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/147-animate-first-agent-portrait/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0413c694a1455297d168cb144179ff2136a794830b0fd6bde74a90037a8a0057","plan":"64e0de092dd1d929e10e4de07ab6ce68aac0b4e4bc3c666480b2f27948480dea"}}
```

**Goal:** A developer hovering Yui's portrait, Yui being the first agent in the
rotation, sees the enlarged high-resolution portrait come briefly to life with
one small gesture. The maintainer learns how convincing a character animation
Claude Code can produce from an approved portrait before deciding whether
other agents should get one. The broader ambition of animating every agent is
not this story's outcome.

**Scope:**

- Hovering Yui's portrait, wherever it appears (Taken and Preparing cards and
  the agent roster), shows the existing enlargement playing one gesture of one
  to two seconds, such as a wink, tidying hair, or a smile. The gesture starts
  from and settles on the approved still portrait, which stays shown for the
  rest of the hover.
- Each new hover plays the gesture again from its start; leaving mid-gesture
  hides the enlargement as today.
- Claude Code produces the animation itself in this repository from Yui's
  approved high-resolution portrait, with locally available tools and no
  external image or video generation service, because the story's purpose is
  to learn what Claude Code can do. Yui stays recognizably the approved
  portrait. The animation is a local asset recorded with the other avatar
  assets' provenance in `dashboard/public/AVATARS.md`.
- An agent plays an animation only when one is available for that agent. Only
  Yui has one; every other portrait keeps its current still enlargement, with
  no placeholder, error, or empty frame.
- Rejection constraint: with reduced motion requested, Yui's enlargement shows
  the still portrait without the gesture, as the portrait already suppresses
  its enlargement transition for reduced motion (`dashboard/src/agent-portrait.css`).
- The small card and roster portraits stay still; the animation stays
  decorative under the portrait's existing `aria-hidden` treatment.
- Deferred: animations for other agents, a choice among several gestures,
  keyboard-focus enlargement, and any animation framework.
- Assumption: this decorative gesture is an explicitly requested experiment
  outside the UX North Star's statement that dashboard animation explains
  navigation or observed changes; it adds no navigation meaning.

**Key examples:**

1. A Taken card recorded for Yui → the developer hovers Yui's portrait → the
   enlargement appears, Yui winks (or makes a similar small gesture) within about
   two seconds, and the still approved portrait remains while the pointer stays.
2. The developer moves away and hovers Yui's portrait again → the gesture plays
   again from its start.
3. A Preparing card recorded for Akiho → the developer hovers Akiho's portrait
   → the still enlargement appears exactly as before, with no animation.
4. The roster is open → the developer hovers Yui's larger roster portrait → the
   same gesture plays in its enlargement.
5. The browser requests reduced motion → the developer hovers Yui's portrait →
   the still enlargement appears without the gesture.

**Safe stopping point:** Yui's animated enlargement works while every other
portrait behaves as before.
