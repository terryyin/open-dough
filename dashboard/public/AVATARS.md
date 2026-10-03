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

`agent-avatars/sola-gesture.webp` is Sola's 2-second hover reaction: she
tilts her head a little further toward her raised arm, blinks once, and
settles back. Claude Code made every frame on 2026-09-30 by warping her
unaltered tile of `atlas-1-large.webp` (the 418 × 418 square at x 0, y 731)
with Python OpenCV: a Gaussian-weighted rotation about the neck moves the
head, and each upper lid slides down onto its lower lid for the blink. No
image generation was used. The strip is 24 frames, 418 × 418 each, in
lossless WebP; the first and last frames are the unaltered tile.

`agent-avatars/yua-gesture.webp` is Yua's 2-second hover reaction: resting
her chin on her hands, she sways her head to one side, blinks, sways briefly
the other way, and settles back. It was made the same way as Sola's, from her
tile of `atlas-1-large.webp` (the 418 × 418 square at x 418, y 731): 24
lossless WebP frames, first and last unaltered.

`agent-avatars/ai-gesture.webp` is Ai's 2-second hover reaction: she nods
twice, winks, and settles back. It was made the same way as Sola's, from her
tile of `atlas-1-large.webp` (the 418 × 418 square at x 836, y 731): 24
lossless WebP frames, first and last unaltered.

`agent-avatars/kirara-gesture.webp` is Kirara's 2-second hover reaction: she
leans her head into her hand, blinks twice, and settles back. It was made the
same way as Sola's, from her tile of `atlas-2-large.webp` (the 418 × 418
square at x 0, y 104): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/mana-gesture.webp` is Mana's 2-second hover reaction: she
wiggles her head happily from side to side, blinks, and settles back. It was
made the same way as Sola's, from her tile of `atlas-2-large.webp` (the 418 ×
418 square at x 418, y 104): 24 lossless WebP frames, first and last
unaltered.

`agent-avatars/tsubomi-gesture.webp` is Tsubomi's 2-second hover reaction: she
lowers her head slightly, gives a slow blink, and settles back. It was made
the same way as Sola's, from her tile of `atlas-2-large.webp` (the 418 × 418
square at x 836, y 104): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/yumi-gesture.webp` is Yumi's 2-second hover reaction: she lifts
her chin with a curious tilt, blinks, and settles back. It was made the same
way as Sola's, from her tile of `atlas-2-large.webp` (the 418 × 418 square at
x 0, y 731): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/julia-gesture.webp` is Julia's 2-second hover reaction: she
rolls her head toward her raised hand, gives a slow blink, and settles back.
It was made the same way as Sola's, from her tile of `atlas-2-large.webp` (the
418 × 418 square at x 418, y 731): 24 lossless WebP frames, first and last
unaltered.

`agent-avatars/tsukasa-gesture.webp` is Tsukasa's 2-second hover reaction: she
dips her head shyly, blinks twice, and settles back. It was made the same way
as Sola's, from her tile of `atlas-2-large.webp` (the 418 × 418 square at x
836, y 731): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/kaoru-gesture.webp` is Kaoru's 2-second hover reaction: she
tilts her head warmly, gives a slow blink, and settles back. It was made the
same way as Sola's, from her tile of `atlas-3-large.webp` (the 418 × 418
square at x 0, y 104): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/nao-gesture.webp` is Nao's 2-second hover reaction: she tilts
her head curiously to one side, blinks, glances the other way, and settles
back. It was made the same way as Sola's, from her tile of
`atlas-3-large.webp` (the 418 × 418 square at x 418, y 104): 24 lossless WebP
frames, first and last unaltered.

`agent-avatars/maria-gesture.webp` is Maria's 2-second hover reaction: she
turns a little toward the viewer, blinks, and settles back. It was made the
same way as Sola's, from her tile of `atlas-3-large.webp` (the 418 × 418
square at x 836, y 104): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/mihiro-gesture.webp` is Mihiro's 2-second hover reaction: she
gives two bouncy nods, blinks twice happily, and settles back. It was made the
same way as Sola's, from her tile of `atlas-3-large.webp` (the 418 × 418
square at x 0, y 731): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/aino-gesture.webp` is Aino's 2-second hover reaction: she tilts
her head with a gentle smile, blinks, and settles back. It was made the same
way as Sola's, from her tile of `atlas-3-large.webp` (the 418 × 418 square at
x 418, y 731): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/rio-gesture.webp` is Rio's 2-second hover reaction: she lowers
her head a little, gives a slow blink, and settles back. It was made the same
way as Sola's, from her tile of `atlas-3-large.webp` (the 418 × 418 square at
x 836, y 731): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/airi-gesture.webp` is Airi's 2-second hover reaction: she tilts
her head softly, blinks, and settles back. It was made the same way as Sola's,
from her tile of `atlas-4-large.webp` (the 418 × 418 square at x 0, y 104): 24
lossless WebP frames, first and last unaltered.

`agent-avatars/shunka-gesture.webp` is Shunka's 2-second hover reaction:
resting her cheek on her hand, she sways thoughtfully, gives a slow blink, and
settles back. It was made the same way as Sola's, from her tile of
`atlas-4-large.webp` (the 418 × 418 square at x 418, y 104): 24 lossless WebP
frames, first and last unaltered.

`agent-avatars/eimi-gesture.webp` is Eimi's 2-second hover reaction: she tilts
her head with a soft smile, blinks, and settles back. It was made the same way
as Sola's, from her tile of `atlas-4-large.webp` (the 418 × 418 square at x
836, y 104): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/hitomi-gesture.webp` is Hitomi's 2-second hover reaction: she
lowers her lifted chin a little, gives a slow blink, and settles back. It was
made the same way as Sola's, from her tile of `atlas-4-large.webp` (the 418 ×
418 square at x 0, y 731): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/hibiki-gesture.webp` is Hibiki's 2-second hover reaction:
resting her chin on her hand, she tilts her head, winks, and settles back. It
was made the same way as Sola's, from her tile of `atlas-4-large.webp` (the
418 × 418 square at x 418, y 731): 24 lossless WebP frames, first and last
unaltered.

`agent-avatars/maki-gesture.webp` is Maki's 2-second hover reaction: she leans
slightly toward her raised hand, gives a slow blink, and settles back. It was
made the same way as Sola's, from her tile of `atlas-4-large.webp` (the 418 ×
418 square at x 836, y 731): 24 lossless WebP frames, first and last
unaltered.

`agent-avatars/nana-gesture.webp` is Nana's 2-second hover reaction: she turns
a little toward the viewer, blinks, and settles back. It was made the same way
as Sola's, from her tile of `atlas-5-large.webp` (the 418 × 418 square at x 0,
y 104): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/honoka-gesture.webp` is Honoka's 2-second hover reaction: she
gives two cheerful nods, blinks, and settles back. It was made the same way as
Sola's, from her tile of `atlas-5-large.webp` (the 418 × 418 square at x 418,
y 104): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/anri-gesture.webp` is Anri's 2-second hover reaction: she tilts
her head further, blinks, and settles back. It was made the same way as
Sola's, from her tile of `atlas-5-large.webp` (the 418 × 418 square at x 836,
y 104): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/koharu-gesture.webp` is Koharu's 2-second hover reaction: she
tilts her head to one side, blinks, glances the other way, and settles back.
It was made the same way as Sola's, from her tile of `atlas-5-large.webp` (the
418 × 418 square at x 0, y 731): 24 lossless WebP frames, first and last
unaltered.

`agent-avatars/rina-gesture.webp` is Rina's 2-second hover reaction: she tilts
her head softly, blinks twice, and settles back. It was made the same way as
Sola's, from her tile of `atlas-5-large.webp` (the 418 × 418 square at x 418,
y 731): 24 lossless WebP frames, first and last unaltered.

`agent-avatars/odd-e-nerds/cartoon/<lowercase name>.webp` are cartoon avatars of the
Odd-e nerds agents (`nerdAgentNames` in the same module), for example `stanly.webp`.
Each was generated with OpenAI image editing (`gpt-image-1.5`) from the face in that
person's local photo (`agent-avatars/odd-e-nerds/<lowercase name>.jpg`), using one shared
style prompt: adult editorial cartoon portrait, head and shoulders, distinct muted
background, no text, and no clothing or background carried over from the photo. They
remain git-ignored and are never committed. Production startup and update builds
copy only the local cartoon WebP files into the isolated production checkout before
building, making them available on the production server without publishing them
through Git. Raw source photos and other local files are excluded from that copy.
A card shows its
agent's cartoon avatar as the portrait, enlarged on hover like the others; when the
avatar file is absent it shows the name alone, with no portrait and no error. The
photos themselves are not displayed.

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
