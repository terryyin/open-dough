# Animate the first agent's enlarged portrait on hover

## Source and authority

- **Identity:** SEED-054#animate-first-agent-portrait.
- **Source:** [story](../../seeds/SEED-054-animated-agent-portraits.md#animate-first-agent-portrait),
  added and refined on 2026-09-28 at Terry's request to test what Claude Code
  can produce for a short character animation.
- **Authority:** Terry asked to refine the story and, with no open question,
  write this slice plan. This plan is planning only. It grants no Take,
  implementation, or publication.
- **Preparation workspace:** `.worktrees/animate-first-agent-portrait`
  (branch `claude/animate-first-agent-portrait`, from `origin/main` at
  `454814d5`). No Preparing assignment was announced: the story was not yet
  queued on `origin/main`, so the announcement would refuse `not-queued`.

## Goal and scope

Hovering Yui's portrait (first in the agent rotation) plays one one-to-two
second gesture in the existing high-resolution enlargement, starting from and
settling on the approved still. Every other agent's enlargement is unchanged.
Reduced motion shows the still. The story's Scope lists the full boundaries;
this plan adds none.

**Excluded:** animations for other agents, several gestures, keyboard-focus
enlargement, a committed image-generation pipeline, and any animation
framework.

**Assumption:** the gesture is a wink. Yui is already smiling in the approved
portrait, so a closing eye is the clearest visible change on a 100–150 px
enlargement. If the probe step below finds a hair tidy or a broader smile
reads better, it may choose that instead and record why under Learnings.

## Current decisions

- **Asset:** one horizontal sprite strip,
  `dashboard/public/agent-avatars/yui-gesture.webp`, built from Yui's tile of
  `atlas-1-large.webp` (the 418 × 418 square at x 0, y 104). About 12 frames
  per second over 1.2–1.8 s. The first and last frames are the unaltered tile.
- **Production:** Claude Code builds the frames in this session with the
  locally available Python Pillow 11.3 and `img2webp`/`cwebp`, painting and
  warping pixels of the approved tile. It uses no external generation service.
  The generator is a session-local tool and is not committed. `AVATARS.md`
  records the method, source tile, and maintainer approval status.
- **Playback:** CSS only, extending the existing `::after` enlargement in
  `dashboard/src/agent-portrait.css`. On hover, the sprite is the top
  background layer, stepped with `steps()` and played once. Because the
  animation exists only while `:hover` matches, each new hover restarts it.
  With no fill, the enlargement returns to the still layers underneath
  afterwards. `prefers-reduced-motion: reduce` removes the animation.
- **Availability:** `AgentPortrait` looks up an optional gesture strip by
  rotation name. Only Yui has one. It sets a custom property that the CSS
  gesture rule requires, so agents without a strip keep today's exact layers.
  There is no placeholder and no per-agent CSS.

## Decisive premises

| Premise | Observation | Result |
| --- | --- | --- |
| The enlargement is a CSS `::after` layered over the large atlas and shown on `:hover`, in cards and the roster | Read `dashboard/src/agent-portrait.css`, `AgentPortrait.tsx`, `AgentRoster.tsx:113`, `AgentAssignmentFacts.tsx:76` | Confirmed; both surfaces render `AgentPortrait` |
| Yui is rotation index 0, on atlas 1 at tile (0, 0) | `sed -n 8,12p src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs` | `"Yui"` first |
| The high-resolution tile is 418 px square at y 104 of the 1254 px atlas | Pillow crop of `atlas-1-large.webp`, viewed | Yui's face, correctly framed, static single frame |
| Local frame tools exist | `which ffmpeg img2webp cwebp python3`; `import PIL` | All present; Pillow 11.3.0 |
| Reduced motion is already honoured and testable | `agent-portrait.css:59`; `emulateMedia({ reducedMotion: "reduce" })` in `preparation-legend.spec.ts:34` | Confirmed |
| The roster lists every rotation agent, including Yui, with portraits | `AgentRoster.tsx:101–113`; `rosterParts` in `dashboard/tests/dashboardPage.ts:41` | Confirmed; no current test hovers Yui |
| Existing enlargement proof asserts exact layers for other agents | `expectEnlargedSharply` in `dashboard/tests/agentPortrait.ts` | Stays green unchanged for non-Yui agents |
| A convincing gesture can be produced this way | Only the probe step can observe it | Bounded by slice 1's first step |

## Outside-in proof

| Promise (story example) | Owner | Signal |
| --- | --- | --- |
| Yui's enlargement plays one 1–2 s gesture and rests on the still (1, 4) | Slice 1 | Playwright: open the roster and hover Yui. `document.getAnimations()` shows one running animation on the portrait's `::after` with duration 1000–2000 ms and iteration count 1. The sprite layer is served as `image/webp`. After it finishes, the layers are the still large/small atlas pair |
| Each new hover restarts the gesture (2) | Slice 1 | Playwright: move away, hover again, and a fresh animation starts at `currentTime` near 0 |
| Other agents are unchanged (3) | Slice 1 | Same journey: hovering Akiho has no animation and exactly today's two layers. The existing `taken-agent-profile.spec.ts` `expectPortrait` checks stay green |
| Reduced motion shows the still (5) | Slice 1 | Playwright with `reducedMotion: "reduce"`: hovering Yui has no animation |
| Yui stays recognizably the approved portrait; the gesture looks natural | Slice 1 | The executor views the first, middle, and last frames, and first and last are pixel-identical to the tile. A browser recording of a card and the roster hover is handed to Terry, whose judgment is the learning outcome, not a pass gate |
| Asset provenance recorded | Slice 1 | `dashboard/public/AVATARS.md` names the strip, source tile, method, and approval status |

Card-surface hover is covered by the same component and CSS rule as the
roster, plus the recording. It gets no separate card fixture.

## Slices

### 1. Yui winks in the enlarged portrait on hover

Type: Behavior
Status: planned
Proof: the new Playwright journey
`npm run test:dashboard -- --grep 'portrait gesture'`, plus the unchanged
`npm run test:dashboard -- --grep 'agent profile|agent roster'`,
`npm run typecheck:dashboard`, `npm run lint`, and the recording above.

Behavior: the dashboard shows Yui's portrait → a developer hovers it → the
enlargement plays the gesture once and rests on the still. Other agents are
unchanged, and reduced motion shows the still.

Order within the slice:

1. **Probe:** crop the tile, build the frames, and view first, middle, and
   last. Stop and report to Terry with the frames if no attempt reads as a
   natural gesture that keeps Yui recognizable. That finding is the story's
   learning. Do not wire an unconvincing asset.
2. Encode the strip (lossy WebP, kept under about 400 KB) and record it in
   `AVATARS.md`.
3. Add the availability lookup and CSS gesture rule, then the Playwright
   journey (a new `dashboard/tests/agent-portrait-gesture.spec.ts` reusing
   the roster fixture and `rosterParts`).
4. Record the card and roster hover in the running dashboard for Terry.

## Learnings

None yet.
