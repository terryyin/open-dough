---
id: SEED-377
status: active
planted: 2026-11-16
planted_during: Restoring SEED-351's deferred promises after its wrap-up deleted them
trigger_when: selected from the product backlog
scope: story
---

# SEED-377 — Extend syntax styling in code diffs

<a id="extend-syntax-styling-in-code-diffs"></a>

### Extend syntax styling in code diffs

**Identity:** SEED-377#extend-syntax-styling-in-code-diffs
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/660-extend-syntax-styling-in-code-diffs/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"10a473fa653e3b7658c77e67c95bf8d46de57f9725e02b5b69532697cc7fc772","plan":"fb21cf50184e9f48280c9c8f32681d511aa39c8adbbce361300d37a6db321969"}}
```

#### Goal

A developer reviewing a story in the dashboard gets syntax styling on Markdown,
JSON, CSS and YAML file diffs — languages
`SEED-351#highlight-syntax-in-code-diffs` left plain — through the same shared
highlighter and appearance Intent's source reading already uses, so more of the
files they read scan as structured text without making changes harder to follow.

#### Scope

Extend the shared on-demand highlighter
(`dashboard/src/sourceHighlight.ts`) so story-review file diffs style four
further languages by path, keeping every SEED-351 constraint.

- **Languages added.** The file's path selects among Markdown (`.md`), JSON
  (`.json`), CSS (`.css`) and YAML (`.yaml`, `.yml`), in addition to the seven
  grammars SEED-351 already loads. A renamed file is still styled by its new
  path. Any other file whose extension names none of those grammars stays
  plain text.
- **Shared solution and appearance.** Intent's source reading and story-review
  diffs keep one highlighter, token model, rendering and style rule. The new
  grammars load through that same owner. When Intent's `syntax` hint names one
  of the new languages, Intent's source reading styles with it; diffs keep
  selecting by path. Matching code in the same language, lexical context and
  system appearance has the same token colours in both views.
- **Change kind and copy.** Each line keeps its `+`, `-` or space marker, its
  line numbers and its added or removed background. Copied code stays the
  plain markers and text. Token colour never replaces them.
- **Readable colours.** Every token meets the
  [North Star](../../docs/dashboard-ux-ui-north-star.md)'s 4.5:1 text contrast
  against the composed background of its line, on added, removed and unchanged
  lines, in light and dark. A system appearance change restyles tokens already
  shown. No diff-only palette.
- **Arrival.** The diff shows as plain text first. Styling arrives when the
  file's text and grammar are ready, without moving the reading position,
  closing an open line menu, or collapsing revealed context. When text or
  grammar cannot be read, affected lines stay plain with no new message.
- **Unchanged.** Line Follow up, context expansion and Retry, binary and
  no-textual-diff notes, and what assistive technology reads of each line.
  No new control, label or message.

**Scope limits (deferred promises):**

- Styling a story-review diff by a project's Intent `syntax` hint when the
  path's extension names no grammar (for example a `sources` entry such as
  `scripts/**/*.test` with `syntax: "shell"`, as
  [project configuration](../../dashboard/PROJECT-CONFIGURATION.md) documents).
  Diffs still select language by path only. Wiring hints needs Intent
  locations in story review and a chosen settings revision; this repository's
  current Intent `sources` already use extensions `pathLanguage` covers.
- Emphasis of the changed words within a changed line.
- A control to turn styling off or choose a palette (would need a single
  shared control for Intent and diffs to keep one appearance).

#### Key examples

- A modified `README.md` whose added line holds a Markdown heading and whose
  removed line holds a fenced code marker. → The heading takes a colour
  distinct from plain text and from the fence; under the shared high-contrast
  themes the fence may match plain. The added line keeps `+` and its ready
  background, the removed line `-` and its problem background.
- A `config.json` diff adds a property name and a string value on one line. →
  The name and the string take different colours from each other and from
  punctuation; markers and change backgrounds stay.
- A `.css` file's removed rule holds a property and a colour value, read from
  the old whole file. → Property and value colours differ; switching system
  appearance restyles both readers' tokens together at 4.5:1 on that line's
  background.
- A renamed `settings.yaml` → `settings.yml` diff. → Styled as YAML by the
  new path.
- Intent opens a file whose `syntax` hint is `markdown` (or `json`, `css`,
  `yaml`). → Intent's source reading uses the same new grammar and appearance
  as a `.md` / `.json` / `.css` / `.yaml` or `.yml` diff.
- A `.ts` diff and a path with no mapped extension (for example
  `scripts/setup.test` with no Intent-hint wiring). → Unchanged from today:
  TypeScript still styled; the unmapped path stays plain.
- A reviewer copies three styled JSON lines. → Clipboard matches the plain
  diff: markers and code, no line numbers.

#### UI

No new control, label or message. The reviewer only sees syntax styling on
paths that were plain under SEED-351 when those paths are Markdown, JSON, CSS
or YAML. Change kind stays told by marker and line background; syntax only by
the colour of the code's characters.

#### Architecture

No Accepted decision is affected. Styling stays a browser presentation concern
on the existing shared highlighter
([ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps “Highlight” for the selected Story card; product words stay “syntax
styling”). Extending `languageLoaders`, path mapping and Intent hint mapping
in one module preserves
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
one representation for this conceptual solution. The server and its contracts
gain nothing. Story review does not load Intent locations for language
selection in this story.

#### Alternatives considered

- **Extend path grammars only (selected).** Smallest coverage increase that
  meets the goal; reuses SEED-351's path selection; no Intent coupling.
- **Intent-hint fallback in diffs.** Would style custom-extension sources the
  way Intent already does, but story review has no Intent locations today, and
  which revision's settings to pin (comparison tree vs completion vs landing)
  is unsettled. Deferred.
- **Word-level change emphasis.** Helps reading *changes*, not *more files*;
  different capability. Deferred.
- **Styling on/off or palette control.** Preference UI, not coverage; a
  second appearance would break the one-shared-appearance rule unless both
  readers change together. Deferred.

Borrowed mechanism: an editor's extension→language registry (path selects
grammar; a language-mode override is the Intent hint). The override side is
the deferred hint-in-diffs path; this story only extends the registry.
