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

#### Goal

A developer reviewing a story gets syntax styling on a diff whose path extension
names no grammar, when a project's Intent `syntax` hint supplies the language
(for example a `sources` entry such as `scripts/**/*.test` with
`syntax: "shell"`).

#### Scope

- Wire Intent locations into story review for language selection when
  `pathLanguage` finds no extension.
- Choose which settings revision pins the hint (comparison tree vs completion
  vs landing) before shipping.
- Keep path selection when the extension already names a grammar.

#### Notes

Deferred from SEED-377. Needs Intent locations in story review and a chosen
settings revision; current Intent `sources` already use extensions
`pathLanguage` covers.

<a id="emphasize-changed-words-in-diff-lines"></a>

### Emphasize the changed words within a changed line

**Identity:** SEED-387#emphasize-changed-words-in-diff-lines

#### Goal

A developer reviewing a story can see which words changed within a changed
diff line, not only which lines changed.

#### Scope

- Emphasis of changed words within a changed line.
- Keep markers, backgrounds and syntax token colours readable together.

#### Notes

Deferred from SEED-377. Helps reading changes rather than covering more file
types.

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
