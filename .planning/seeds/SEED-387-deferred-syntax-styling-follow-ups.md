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

<a id="further-word-emphasis-follow-ups"></a>

### Further word-emphasis follow-ups

**Identity:** SEED-387#further-word-emphasis-follow-ups

#### Goal

A developer reviewing a story-review file diff can see finer or differently
shaped change emphasis when whole-word block comparison is not enough: changed
characters inside a word, related changes across separate blocks, or an
optional side-by-side or merged inline word-diff reading.

#### Scope

- Emphasis of changed characters within a word (`limit1` → `limit2` marks the
  changed characters, not only the whole word).
- Relating changes across separate blocks, such as detecting moved lines.
- A side-by-side or merged inline word-diff view that preserves line numbers and
  line Follow up where those views still apply.
- Turning emphasis off may be covered by
  [SEED-387#more-syntax-styling-choices](#more-syntax-styling-choices)
  rather than a separate control.

#### Notes

Whole-word block emphasis in story-review diffs is already available; these
items remain for finer or differently shaped emphasis.

<a id="more-syntax-styling-choices"></a>

### Offer more syntax styling choices beyond Off and Default

**Identity:** SEED-387#more-syntax-styling-choices
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer who needs more than Off or Default can choose additional named
syntax-styling palettes, and where needed a placement or scope for that choice,
without breaking the one-shared-appearance rule Intent and story-review diffs
already share.

#### Scope

Deferred from SEED-387#shared-syntax-styling-control after Off/Default shipped:

- Additional named palettes beyond Default (contrast against dashboard surfaces
  and change-line backgrounds must be settled before offering them).
- Turning word emphasis off from this control (the
  [emphasize-changed-words](#emphasize-changed-words-in-diff-lines) story may
  later fold that in).
- A per-project or per-browser override of the machine-local choice.
- An in-reader control on Intent or a diff.
