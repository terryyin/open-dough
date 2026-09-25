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
