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

A developer reviewing a story in the dashboard gets syntax styling on more of
the files and changes they read, beyond what
`SEED-351#highlight-syntax-in-code-diffs` delivered. That story styled story
review diffs and Intent's source reading through one shared highlighter, for
paths whose extension names one of seven grammars (TypeScript, TSX,
JavaScript, Java, Python, shell, Gherkin). Every other file reads as plain
text.

Candidate scope, carried over from SEED-351's deferred promises. Refinement
chooses which of these this story owns and splits off the rest:

- Grammars beyond the seven, such as Markdown, JSON, CSS and YAML.
- Styling by a project's Intent `syntax` hint for a path whose extension names
  no grammar, such as this repository's `scripts/**/*.test` shell files.
- Emphasis of the changed words within a changed line.
- A control to turn styling off or choose a palette.

Every addition keeps SEED-351's constraints: one shared solution and
appearance for Intent's source reading and diffs, 4.5:1 token contrast on
every line background in both appearances, and unchanged markers, line
numbers, change backgrounds and copied text.
