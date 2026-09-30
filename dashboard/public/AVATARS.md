# Dashboard avatar assets

Taken and Preparing cards (`dashboard/src/AgentAssignmentFacts.tsx`) show these local assets as
decorative identity marks beside their text labels: the agent portraits beside
recorded agent names, and the mode symbols and tool marks beside their mode and
host labels. An unrecorded host gets no mark, and no mark implies that an agent
is present or active.

## Agent portraits

`agent-avatars/atlas-1.webp` through `atlas-5.webp` contain 29 original,
small illustrated portraits generated with the built-in image generation tool
and approved by the maintainer on 2026-09-25. The visual brief was: adult
editorial character portraits, loose resemblance to the people suggested by
the agent names, modest clothing, distinct muted backgrounds, and no text.
Each 600 × 600 atlas is a three-column, two-row grid. Tiles follow the
`agentNames` rotation in
`src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs`;
the final atlas has five portraits and an unused sixth tile. Keep that mapping
if displaying or moving the portraits. The atlases are intentionally sized for
small dashboard avatars; there is no external image dependency.

`agent-avatars/atlas-1-large.webp` through `atlas-5-large.webp` are the same
approved images at their original 1254 × 1254 generated resolution, with the
same tile layout. The enlarged portrait shown on hover uses them so it stays
sharp.

`agent-avatars/yui-gesture.webp` is Yui's wink, played once in the enlarged
portrait on hover. It is a horizontal strip of 18 frames, 418 × 418 each, shown
at 12 frames per second (1.5 seconds). Every frame is derived from Yui's tile
of `atlas-1-large.webp` (the 418 × 418 square at x 0, y 104): Claude Code
warped that tile's pixels with Python Pillow, NumPy, and SciPy, sliding the
upper lid of the eye on the image's left down onto the lower lid, lowering the
brow slightly, and reopening it; it used no external image or video
generation service, and the generator was not kept. The first and last frames
are the unaltered tile, so the gesture starts from and settles on the approved
portrait. The strip is lossy WebP (`cwebp -q 82`). The maintainer kept it
after review.

`agent-avatars/akiho-gesture.webp` is Akiho's 1.8-second hover reaction: a
small head tilt, smile, wink, and peace sign, followed by a return to her
original pose. Its illustrated poses were generated with the built-in image
generation tool on 2026-09-28, using her exact square crop from the approved
atlas as the identity and framing reference. The generated sheet was cut into
16 poses and packed between two copies of the original atlas tile, producing
an 18-frame horizontal strip, 418 × 418 per frame. Lossless WebP preserves the
original tile's pixels in the first and last frames. Like Yui's gesture, it
plays once per hover in the enlarged portrait and is disabled for reduced
motion. An overlay of the approved still eases out at the beginning and back
in during the settling pose, avoiding a snap between the generated drawings
and the original portrait.

`agent-avatars/yuma-gesture.webp` is Yuma's 2-second hover reaction: she
notices the pointer, turns to meet the viewer, smiles, blinks once, and
settles back into the pose she started from. The smile and the closed-eye
blink were drawn with the built-in image generation tool on 2026-09-28, using
her exact square crop from `atlas-1-large.webp` (the 418 × 418 square at
x 836, y 104) as the identity and framing reference. Those two drawings were
joined to that unaltered tile by optical-flow morphing (Python, OpenCV) into
a horizontal strip of 24 frames, 418 × 418 each. Lossless WebP preserves the
original tile's pixels in the first and last frames. Like the other gestures,
it plays once per hover in the enlarged portrait and is disabled for reduced
motion. The morph begins and ends on the approved still, so it needs no
overlay to hide a snap.

`agent-avatars/odd-e-nerds/<lowercase name>.jpg` are the photos of the Odd-e
nerds agents (`nerdAgentNames` in the same module), for example `stanly.jpg`.
They are local-only: the folder is git-ignored and the photos are never
committed or published until permission to do so is obtained. A card shows its
agent's photo as the portrait, enlarged on hover like the others; when the photo
file is absent it shows the name alone, with no portrait and no error.

## Tool marks

The files in `tool-avatars/` are official vendor assets saved locally for
small use beside their corresponding tool names. They must not cover an agent
portrait. Their names and marks belong to their respective vendors.

| Local file | Official source | Note |
| --- | --- | --- |
| `claude.png` | [Claude site icon](https://assets.claude.com/95a868946ac8a31e5ff832e2899f294aa368b836.png?w=32&h=32) served by [claude.com](https://claude.com/) | 32 × 32 PNG |
| `codex.png` | [OpenAI icon](https://developers.openai.com/favicon.png) served by the [Codex documentation](https://developers.openai.com/codex) | 48 × 48 PNG; official OpenAI mark used to identify Codex alongside its text label |
| `cursor.png` | [Cursor brand avatar pack](https://cursor.com/brand) (`Avatars/Circle/PNG/AVATAR_CIRCLE_2D_LIGHT.png`) | Official 2D circle avatar downsampled to 64 × 64 PNG |

The Codex documentation uses the OpenAI icon; refinement found no separate
downloadable Codex mark from an official source. Keep the `Codex` text label
visible so this generic vendor mark is unambiguous. Consult the vendors'
current brand guidance before replacing these assets.

## Execution mode symbols

`mode-icons/trunk.svg` and `mode-icons/story-branch.svg` are original, simple
line symbols designed for the dashboard. The straight line represents Trunk Mode;
the line diverging from a trunk represents Story Branch Mode. Place each
beside its mode name, never in place of that text. Both have a 24 × 24 viewBox
and use the dashboard's quiet dark-green stroke on its card background.
