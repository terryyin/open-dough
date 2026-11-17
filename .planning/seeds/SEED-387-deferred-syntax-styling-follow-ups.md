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
