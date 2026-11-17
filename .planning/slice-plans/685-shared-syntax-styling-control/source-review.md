# Source-only review: SEED-387#shared-syntax-styling-control

**Launch:** fresh general-purpose reviewer, no plan/product/proof inheritance.
**Input:** Goal, Scope (including deferred limits), Key examples, UI, and
Architecture from
`.planning/seeds/SEED-387-deferred-syntax-styling-follow-ups.md#shared-syntax-styling-control`
only.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | System settings → General holds a single labelled Off/Default syntax-styling choice beside Terminal theme, with a short note that Intent source reading and story-review diffs share it; neither surface has its own palette or off switch; no new control on Intent or in a file diff | slice 1 | observed: SystemSettings.tsx mounts SyntaxStylingSettings after TerminalThemeSettings; SyntaxStylingSettings.tsx labelled Off\|Default with shared-note; system-settings-syntax-styling.spec.ts:29-38 |
| 2 | The choice is saved on this machine like the terminal theme; after a full page reload the saved choice remains; with Off saved, Intent and a newly opened diff both open plain | slice 2 | |
| 3 | Intent source reading and story-review file diffs both follow the single choice so they share one appearance; preference consumed via the shared source highlighter path | slice 2 | |
| 4 | Default is today's shared GitHub high-contrast light/dark palettes, following system appearance without re-tokenization; with Default saved, Intent and a story-review diff of the same code show the same token colours as today; under Default, light↔dark appearance flips restyle both without losing place or re-reading the file | slice 2 | |
| 5 | Off shows the same plain text both readers already use when a path has no grammar or tokens have not arrived: markers, line backgrounds, line numbers, and reading place stay; only token colours leave; choosing Off makes open Intent and open diff go plain immediately with chrome staying | slice 2 | |
| 6 | Changing the choice restyles every open Intent reading and every open story-review diff together; choosing Default again shows token colours on both without a navigation | slice 2 | |
| 7 | A `.txt` path (no grammar) under Default is still plain; Off does not change it further | slice 2 | |
| 8 | Grammars and path/hint mapping remain unchanged | slice 2 | |
| 9 | Copied and assistive-technology text (plain markers and code) remain unchanged | slice 2 | |
| 10 | Word emphasis remains unchanged when that story's delivery is present | slice 2 | |
| 11 | Terminal theme remains unchanged | slice 1 | observed: terminal theme modules and TerminalThemeSettings.tsx untouched; SystemSettings still mounts TerminalThemeSettings before SyntaxStylingSettings |
| 12 | System appearance itself remains unchanged | slice 2 | |
| 13 | The server and its contracts gain only the setting read/save; Intent and review contracts otherwise stay | slice 1 | observed: syntaxStylingBoundary.ts + localBoundaries dough-syntax-styling entry only; useSourceHighlight unwired; Intent/review contracts unchanged |

## Unnumbered source context

- Identity: SEED-387#shared-syntax-styling-control.
- Rationale: keeps SEED-377 one-shared-appearance while allowing plain reading when token colours get in the way.
- Architecture baseline: no Accepted decision affected; shared highlighter path
  `dashboard/src/sourceHighlight.ts`, `dashboard/src/useSourceHighlight.ts`;
  preference in the terminal-theme / `localSettingRequest` family.
- Deferred limits (not commitments): additional named palettes; turning word
  emphasis off from this control; per-project or per-browser override; in-reader
  control on Intent or a diff.
