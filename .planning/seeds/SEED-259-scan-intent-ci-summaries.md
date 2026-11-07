---
id: SEED-259
status: active
planted: 2026-11-07
scope: story
---

# Scan CI summaries in dashboard Intent

<a id="scan-intent-ci-summaries"></a>

### Scan CI summaries in dashboard Intent

**Identity:** SEED-259#scan-intent-ci-summaries
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer reviewing test evidence in dashboard Intent can find
the rows they care about and understand counts, execution times, and gaps at
a glance across CI status and the entry and folder summaries.

**Evaluation.**

- Activate a column header in an Intent data table to sort by that field, for
  example numerically by count or by type where shown. Activate it again to
  reverse the order. The current sort and direction are visible and available
  to assistive technology, and the headers work with a keyboard.
- Open an entry summary and drill down into a folder. Both use the same
  breakdown table and sort controls. The selected scope's overall figures
  appear above the table and stay there when the breakdown rows are sorted.
  Child rows still open their corresponding folders or files. This layout
  works for both single-run proof and story comparisons.
- Read a summary with partial timing. A short label such as `Part 2 untimed`
  makes the gap clear without a sentence. Measured zero, partial timing, and
  unavailable timing remain distinguishable.
- Scan a summary with run or comparison evidence. Short labels, clear
  grouping, and accessible icons where helpful make the key figures and
  evidence status easy to recognize, with less explanatory prose. The reader
  can still identify the build and understand any gap that affects the figures.

[Current Intent behavior](../../docs/dashboard-development-intent.md).
