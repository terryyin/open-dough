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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer reviewing a story in the dashboard can scan a
  file diff and distinguish code syntax while following what changed.
- **Evaluation.** Open a diff for a supported language with added, removed,
  and unchanged lines. Keywords and strings are visually distinct on each
  kind of line, and additions and removals remain identifiable. A diff for a
  file whose language is unsupported remains readable as plain text.
