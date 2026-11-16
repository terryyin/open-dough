---
id: SEED-387
status: active
planted: 2026-11-16
planted_during: Retaining SEED-377 deferred promises at wrap-up so they are not deleted with that seed
trigger_when: selected from the product backlog
scope: story
---

# SEED-387 — Deferred syntax styling follow-ups

Retained from SEED-377#extend-syntax-styling-in-code-diffs scope limits after that
story delivered path grammars for Markdown, JSON, CSS and YAML.

<a id="intent-hint-language-for-story-review-diffs"></a>

### Style story-review diffs by Intent syntax hint when the path has no grammar

**Identity:** SEED-387#intent-hint-language-for-story-review-diffs
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/663-intent-hint-language-for-story-review-diffs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"17f051f388ba6e63529379b9cdffc581407db60b4825851b72c3629b124fa0c5","plan":"997a8bdda9ce71eb5ef6b7068320c9fe06d512de68d0e1867ac3d3cb41fc6542"}}
```

#### Goal

A developer reviewing a story in the dashboard gets syntax styling on a
story-review file diff whose path extension names no grammar, when that file
belongs to a project's Intent locations and a `syntax` hint there supplies a
language the shared highlighter already knows (for example a `sources` entry
such as `scripts/**/*.test` with `syntax: "shell"`). Diffs whose path already
names a grammar, and paths outside Intent or with an unfamiliar hint, stay as
they are today.

#### Scope

- **Path first, Intent hint only as fallback.** Language selection for a
  story-review diff still starts with `pathLanguage`. Only when that finds no
  grammar does the diff look up the file in Intent locations (same membership
  and first-matching `sources` / kind rules Intent source reading already uses)
  and map a known `syntax` hint through `sourceLanguage`. A known path grammar
  is never replaced by a hint.
- **Where it applies.** The same rule covers **Review changes** and Intent
  Purpose when it shows a story change through the shared `FileDiff`. Unchanged
  Intent source reading already styles by hint and is out of scope.
- **Settings revision that pins the hint.** Intent locations for this language
  lookup use the same revision Intent already uses for that review context:
  a published Done review at its completion, a landed Done review at its
  landing revision, live Intent at its reading revision (behind Show latest),
  and a Review-changes workspace snapshot that has no Intent reading state at
  the comparison's `tree`. Intent Purpose reuses the locations it already
  shows for that story rather than reading a second, different revision.
- **Shared highlighter and appearance.** Styling still goes through the shared
  on-demand highlighter, token model, rendering and style rule Intent and
  diffs already share. Markers, line numbers, change backgrounds, copy, arrival
  (plain first, then tokens), assistive-technology text, and the North Star
  4.5:1 contrast rule stay as SEED-351 / SEED-377 left them. No new control,
  label, or message.
- **Plain when the hint cannot style.** A path with no grammar that is outside
  Intent locations, whose entry has no hint, or whose hint `sourceLanguage`
  does not map, stays plain text with no new explanation.
- **Scope limits (deferred promises).** Emphasis of changed words within a
  changed line. A shared control to turn styling off or choose a palette
  (SEED-387 siblings). Changing this repository's own Intent `sources` so they
  use custom extensions is not required: Open Dough's current Distribution
  entries already use `.sh` and `.test.mjs`, which `pathLanguage` covers;
  proof uses fixture patterns such as `**/*.test` / `**/*.bats`.

#### Key examples

- A project's Intent locations include
  `{ "path": "scripts", "sources": [{ "include": ["**/*.test"], "syntax": "shell" }] }`.
  A modified `scripts/setup.test` is opened in **Review changes**. → The diff's
  code is token-coloured as shell; markers and change backgrounds stay.
- The same file is opened as a story change under Intent Purpose. → The same
  shell styling; Intent's already-shown locations supply the hint.
- A modified `notes.txt` (or any path with no mapped extension) that no Intent
  location selects. → Stays plain, as today.
- A `sources` entry matches `scripts/odd.check` with `syntax: "unfamiliar-language"`.
  → Listed for Intent, but the diff stays plain.
- A renamed `legacy/run` → `scripts/setup.test` under the shell `**/*.test`
  entry. → Styled as shell by the new path and the hint; the old path is not
  consulted for language.
- A modified `app.ts` (path grammar TypeScript) that somehow also matches an
  Intent entry hinted `shell`. → Still styled as TypeScript; the hint does not
  override the path.
- A Done published review whose completion settings hinted `scripts/**/*.test`
  as shell, while trunk tip later changed that hint to javascript. → The review
  still styles those diffs as shell from the completion settings.
- An Open Dough Distribution `*.sh` or `*.test.mjs` diff under today's Intent
  `sources`. → Unchanged from SEED-377: styled by path alone; this story adds
  nothing observable for those paths.

#### UI

No new control, label, or message. The reviewer only sees syntax styling appear
on diffs that were plain because their path named no grammar, when Intent's
hint supplies a known language. Change kind stays told by marker and line
background; syntax only by the colour of the code's characters.

#### Architecture

No Accepted decision is overturned. Styling remains a browser presentation
concern on the existing shared highlighter
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps “Highlight” for the selected Story card; product words stay “syntax
styling”). Reusing Intent's location selection (`sourceEntryOfRepositoryPath`)
and `sourceLanguage` in the diff token path preserves
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
one representation for this conceptual solution. The server and its contracts
gain nothing new for language selection.

Consequential coupling: **Review changes** loads Intent locations for language
fallback (it does not today), pinned as under Scope. Intent Purpose already
holds locations and must feed the same fallback into `FileDiff` / 
`useDiffLineTokens` without a second pin. Path selection stays the primary
rule so diffs outside Intent and ordinary extension-mapped files do not depend
on configuration.

#### Alternatives considered

- **Path-first, Intent-hint fallback (selected).** Meets the deferred SEED-377
  promise; keeps path as the default; reuses Intent membership and hint mapping;
  settles the settings revision by aligning with Intent's existing historical
  and reading-revision rules rather than inventing a fourth pin.
- **Intent hint always overrides path for Intent-selected files.** Would restyle
  `.ts` / `.mjs` when a hint disagrees with the extension; conflicts with
  keeping path selection when the extension already names a grammar.
- **Only style hint-backed diffs inside Intent Purpose.** Avoids loading
  locations into Review changes, but leaves the primary story-review surface
  plain for the same files.
- **Extend `pathLanguage` for more extensions (`.bats`, bare `.test`).** Cannot
  honestly assign one grammar to ambiguous extensions; the documented Intent
  `syntax` hint exists for that case.

Borrowed mechanism: an editor's language-mode override / `files.associations`
(path registry first; explicit association when the extension is silent or
wrong). Limit: editors often persist a per-user override; here the override is
project Intent configuration at a pinned revision, not a personal preference.

Challenge retained: this repository's live Intent `sources` already use
extensions `pathLanguage` covers, so Open Dough itself gains no new styled
paths until a project (or a proof fixture) uses a custom pattern. That does
not shrink the product goal; proof must use such a fixture rather than
dogfooding today's Distribution entries.

<a id="emphasize-changed-words-in-diff-lines"></a>

### Emphasize the changed words within a changed line

**Identity:** SEED-387#emphasize-changed-words-in-diff-lines
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/663-emphasize-changed-words-in-diff-lines/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d08af5f77903cbb84c4f52365fc95c389d4afacb5fa18b014142f25bbd4bc118","plan":"6d75eeeb1c04204e441ec32f1051237feb1962113657c70f0b9fb6ad273cb91b"}}
```

#### Goal

A developer reviewing a story in the dashboard's story review sees, within each
changed block of a file diff, which words were removed and which were added —
not only which lines changed — so a one-word edit in a long code line or a
reflowed Markdown paragraph reads at a glance instead of by comparing lines
character by character. This serves the review's purpose of judging what the
story actually changed.

#### Scope

- **Changed block.** A run of removed lines followed directly by added lines
  inside one hunk is compared as one stream of words, so emphasis follows the
  words and not the line positions. A line break reads as whitespace there, so
  words or spaces that only moved across a line break by rewrapping are not
  emphasized. A pure addition, a pure removal, an unchanged line and revealed
  context get no word emphasis.
- **Words.** A word is a run of letters, digits and underscores, a run of
  whitespace, or one other character. A whole changed word is emphasized;
  changed whitespace, such as re-indentation, is emphasized like any word.
- **Rewrites stay line-level.** When a block shares too little with its
  counterpart for emphasis to point anywhere useful, none of its words is
  emphasized and its lines read as today. Reason: emphasizing nearly every
  word, or scattered shared punctuation, adds noise and suggests a
  relationship that is not there.
- **Responsive.** Opening a diff with very large changed blocks stays as quick
  as today; a block too large to compare promptly shows line-level change
  only. Reason: the comparison runs in the browser while the reviewer waits.
- **Appearance.** On a removed line its removed words, and on an added line its
  added words, are underlined in that line's own change colour over a light
  tint of it — the blackline's mark. The underline tells emphasis apart without
  relying on hue (the
  [North Star](../../docs/dashboard-ux-ui-north-star.md#visual-and-accessibility-direction)'s
  reading without colour perception, and its 3:1 for non-text marks against
  the line background). Syntax token colours, markers and line backgrounds
  stay; every token keeps the North Star's 4.5:1 text contrast against the
  tinted background too, in light and dark, and a system appearance change
  restyles both together. Removed words are not struck through: the `-`
  marker already says the line is removed, and struck code reads worse.
  Emphasis shows on plain-text lines too, before tokens arrive and on paths
  with no grammar, and stays on the same words when tokens arrive.
- **Text carries it.** Emphasized words are marked as deletions on removed
  lines and insertions on added lines for assistive technology (the North
  Star's "Text must carry every status conveyed by color"). Copied code and
  the text assistive technology reads stay the line's plain markers and code.
- **Unchanged.** Line Follow up, context expansion and Retry, line numbers,
  binary and no-textual-diff notes, and the reading position when styling
  arrives. No new control, label or message.

**Scope limits (deferred promises):**

- Emphasis of changed characters within a word (`limit1` → `limit2` emphasizes
  the whole word).
- Relating changes across separate blocks, such as detecting moved lines.
- A side-by-side or merged inline word-diff view.
- A control to turn emphasis off; the shared styling control
  ([SEED-387#shared-syntax-styling-control](#shared-syntax-styling-control))
  may later cover it.

#### Key examples

- `const limit = 20;` is replaced by `const limit = 25;`. → `20` is emphasized
  on the removed line and `25` on the added line; `const limit =` and `;` are
  not; the number keeps its syntax colour, and `-`/`+` markers and line
  backgrounds stay. In greyscale the underline still shows which words
  changed.
- A hard-wrapped Markdown paragraph of three lines gains one word in its first
  line, so the rewrap changes all three lines and adds a fourth. → Only the
  inserted word is emphasized, on its added line; words pushed onto the next
  line are not.
- A call `run(a, b);` becomes two lines `run(a, b,` and `  c);`. → The added
  `,`, line-leading spaces and `c` are emphasized; `run(a, b` and `);` are not.
- `return cached;` is replaced by `throw new Error("stale");`. → No word is
  emphasized; both lines keep only their change backgrounds.
- `  run();` is re-indented to `    run();`. → The indentation is emphasized on
  both lines; `run();` is not.
- A `.txt` file's changed line (no grammar), or a `.ts` line before its tokens
  arrive. → Its changed words are emphasized on plain text; when tokens arrive,
  the same words stay emphasized in their token colours.
- A reviewer copies an emphasized added line. → The clipboard holds `+` and
  the line's code, nothing more; a screen reader reaches the line's code with
  the added words exposed as insertions.
- A block of a whole generated file rewritten in one hunk, hundreds of lines
  long. → The diff opens as quickly as today; that block shows line-level
  change.

#### UI

The reviewer is a developer reading a story's file diff in the story review,
on a desktop or phone, in light or dark appearance. They see one more layer on
modified lines only: the words that changed are underlined in the line's own
red or green over a light tint of it. Nothing new to decide or operate; markers and line
backgrounds still tell the change kind first.

#### Architecture

No Accepted decision is affected, and nothing found is consequential enough for
a design section: the comparison is a browser presentation concern over the
printed diff lines the story review already parses (`dashboard/src/unifiedDiff.ts`),
composed with the per-line syntax tokens the diff already holds
(`dashboard/src/diffLineTokens.ts`). The server and its contracts gain
nothing. Intent's shared token renderer keeps its behaviour for Intent.
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
reserves "Highlight" for the selected Story card, so the product word is
"emphasis".

#### Alternatives considered

Observed on this repository's last 300 non-merge commits: of change blocks
mixing removed and added lines, unequal line counts were 55% in
`dashboard/src` TypeScript (2,156 of 3,893) and 33% in Markdown (495 of 1,506).

- **Compare each changed block as one word stream (selected).** Covers equal
  and unequal blocks and rewrapped prose alike. A block's similarity decides
  whether emphasis helps; 67% of the unequal TypeScript blocks and 40% of the
  unequal Markdown blocks kept at least half their words.
- **Pair removed and added lines by position when counts match.** Simplest,
  but leaves every unequal block — most TypeScript change blocks — without
  emphasis, and mispairs rewrapped prose.
- **Align lines by similarity, then compare each pair.** Covers unequal code
  blocks, but a sentence rewrapped across lines matches no single line.
- **Ask Git for a word diff on the server.** Same stream idea, but a second
  diff request and format per file to map back onto lines the browser already
  has.
- **A stronger tint alone, as many diff viewers show.** Observed with the
  dashboard's high-contrast token palettes on sample code in all eleven
  grammars: any tint of `--ready` or `--problem` above about 20% drops some
  token below 4.5:1 in light or dark, and a hue-shifted pastel that keeps
  4.5:1 differs from the line background by hue alone (luminance ratio
  1.01–1.10 in light). The underline in the line's colour keeps at least
  4.35:1 against the line and its tint.
- **A merged inline or side-by-side view.** Changes the line model that line
  numbers and line Follow up rely on. Deferred.

Borrowed mechanism: a legal blackline (document compare) reads both versions
as running text regardless of line or page breaks, marks only inserted and
deleted words, and shows a substantially rewritten clause as a whole
replacement rather than word confetti — the block stream and the rewrite rule
above. Where it breaks: a blackline merges both versions into one text, while
here removed and added words stay on their own lines; and code whitespace and
punctuation carry meaning prose comparison may ignore.

<a id="shared-syntax-styling-control"></a>

### Share one control to turn syntax styling off or choose a palette

**Identity:** SEED-387#shared-syntax-styling-control

#### Goal

A developer can turn syntax styling off or choose a palette once for Intent
source reading and story-review diffs, keeping one shared appearance.

#### Scope

- One shared control for Intent and diffs.
- No second, diff-only palette.

#### Notes

Deferred from SEED-377. A second appearance would break the one-shared-appearance
rule unless both readers change together.
