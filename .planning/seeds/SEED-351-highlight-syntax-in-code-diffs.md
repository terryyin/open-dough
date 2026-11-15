---
id: SEED-351
status: active
planted: 2026-11-14
trigger_when: selected from the product backlog
scope: story
---

# SEED-351 — Syntax highlighting in code diffs

<a id="highlight-syntax-in-code-diffs"></a>

### Highlight syntax in code diffs

**Identity:** SEED-351#highlight-syntax-in-code-diffs
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/645-highlight-syntax-in-code-diffs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a3d91fdf6e09d606f3388b63840107ca0b6a549012004c53df8d467fdb74466f","plan":"5a86eed1fc6db6994203058a139d1d8510f0c468e4fc6a11b9d66cff5ee3e8c1"}}
```

#### Goal

A developer reviewing a story in the dashboard reads each file diff with its
code's syntax styled, so the structure of the code is quick to scan while the
change stays as easy to follow as it is today. Moving between Intent's source
reading and a diff presents the same syntax language and appearance.

#### Scope

A [story review](../../dashboard/STORY-REVIEW-FILES.md) file diff styles the
code of its lines with the token colours Intent's source reading uses
(`dashboard/src/sourceHighlight.ts`), for every comparison a review shows.

- **Shared solution and appearance.** Intent's source reading and story-review
  diffs use one syntax-highlighting solution: grammar loading, whole-text
  tokenization, token representation, rendering and token styling each have
  one shared owner. Matching code in the same language, lexical context and
  system appearance has the same token colours and syntax styles in both
  views, including added, removed and revealed lines. This prevents competing
  implementations and confusing colour meanings between readers. Any palette
  adjustment needed for readability applies to both views together.
- **Language.** The file's path selects the grammar among those the dashboard
  already loads: TypeScript (`.ts`, `.mts`, `.cts`), TSX (`.tsx`), JavaScript
  (`.js`, `.mjs`, `.cjs`, `.jsx`), Java (`.java`), Python (`.py`), shell
  (`.sh`, `.bash`) and Gherkin (`.feature`). A renamed file is styled by its
  new path. Any other file reads as plain text, as it does today.
- **Lines.** Added and unchanged lines, including revealed context lines, are
  styled as they read in the new file, and removed lines as they read in the
  old file, each from that side's whole text. A line inside a comment or
  string that opens outside the printed hunk is therefore styled as part of
  it.
- **Change kind.** Each line keeps its `+`, `-` or space marker, its line
  numbers and its added or removed background. Token colour never replaces
  them.
- **Readable colours.** Every token meets the
  [North Star](../../docs/dashboard-ux-ui-north-star.md)'s 4.5:1 text contrast
  against the composed background of its line, on added, removed and unchanged
  lines, in the light and the dark appearance. A system appearance change
  restyles the tokens already shown. Intent's source reading and diffs keep
  one token palette and style rule, with no diff-only token colour adjustment.
- **Arrival.** The diff shows as plain text first, as today. Styling arrives
  when the file's text and grammar are read, without moving the reading
  position, closing an open line menu, or collapsing revealed context. When
  either side's text or the grammar cannot be read, the affected lines stay
  plain, and styling adds no message of its own.
- **Unchanged.** Copied code, line-number controls and Follow up, context
  expansion and its Retry, the binary and no-textual-diff notes, and what
  assistive technology reads of each line.

Deferred promises:

- Grammars beyond the seven above, such as Markdown, JSON, CSS and YAML.
- Styling by a project's Intent `syntax` hint for a path whose extension names
  no grammar, such as this repository's `scripts/**/*.test` shell files.
- Emphasis of the changed words within a changed line.
- A control to turn styling off or choose a palette.

#### Key examples

- Intent and a diff show the same TypeScript code containing a keyword,
  identifier, string and comment. → Corresponding tokens have identical
  colours and syntax styles in source, unchanged, added and removed lines;
  switching the system appearance changes both readers together. The diff
  still retains its change markers, line numbers and change backgrounds.
- A modified `.ts` file's diff has added, removed and unchanged lines holding
  `const` and a quoted string. → On each kind of line the keyword and the
  string take different colours from each other and from plain identifiers;
  the added line keeps `+` and its ready background, the removed line `-` and
  its problem background.
- A hunk begins in the middle of a `/* … */` comment whose opening line is
  above the hunk. → Its first lines are styled as comment, not as code.
- A removed line read as a string in the old file, and the same position is
  code in the new file. → The removed line is styled as a string and the added
  line as code.
- The reviewer reveals 20 preceding lines above a hunk. → The revealed lines
  arrive styled, and the reading position holds as it does today.
- In the dark appearance, a comment on an added line. → Its colour reaches
  4.5:1 against that line's background; switching the system to light
  restyles it in place, again at 4.5:1.
- A `README.md` or a `.json` file's diff. → Plain text exactly as today.
- A file whose text at one tree cannot be read (context expansion shows its
  Retry). → The printed diff stays readable as plain text with no further
  message; after a successful Retry its lines are styled.
- A reviewer copies three styled lines. → The clipboard holds the same text
  as from the plain diff: markers and code, no line numbers.

#### UI

No new control, label or message. Change kind stays told by the marker and
the line's background, and syntax only by the colour of the code's
characters, so neither depends on the other.

#### Architecture

No Accepted decision is affected
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)).
Styling stays a browser presentation concern on the existing on-demand
highlighter and shared source-token rendering, fed by the two reads a diff
already makes: its printed hunks and both sides' file text. Only selecting the
old or new token line belongs to the diff. The server and its contracts gain
nothing. ADR 0008 gives “Highlight” to the selected Story card, so product words call this
“syntax styling”, as Intent's documentation does.

Measured during refinement, on Shiki 4.6.0 with the dashboard's colours:

- With today's github-light and github-dark palettes, tokens on added and
  removed lines fall to 2.4:1 (dark comments) and 2.5–3.7:1 (light keywords,
  comments and parameters); Intent's own comments read at 3.7:1 dark and
  4.45:1 light.
- Browser samples across all seven supported grammars: github-dark-high-contrast
  reaches at least 5.39:1 on source and all diff line backgrounds;
  github-light-high-contrast reaches at least 4.94:1 with its tokens mixed
  25% toward the text colour everywhere, including Intent source. The same
  shared foreground rule works without changing diff backgrounds.
- Tokenizing a 2,400-line TypeScript file takes about 0.2 s.
