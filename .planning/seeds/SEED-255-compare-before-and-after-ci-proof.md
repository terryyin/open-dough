---
id: SEED-255
status: active
planted: 2026-11-07
scope: story
---

# Before-and-after CI proof in Intent

## Story

<a id="compare-before-and-after-ci-proof"></a>

### Compare before-and-after CI proof in Intent

**Identity:** SEED-255#compare-before-and-after-ci-proof

**Beneficiary:** A developer reviewing how a selected story changed test
counts and execution time.

**Goal:** A developer can scan the overall CI change on the Intent homepage,
then see which test entries and files account for the observed differences.

**Scope:**

- Design the overall and per-entry before-and-after comparison on Intent's
  **CI status** homepage as one coherent experience. A starting layout is an
  overall summary above the entry table, with labelled before and after
  builds and signed deltas. Compare Baseline with Branch or Landed when
  available, and use the same active comparison in the table and sidebar.
  Preserve the build identities and show when proof comes from an ancestor.
- Show the overall test count and CI wall time when comparable, and each
  entry's test count and cumulative test execution time. Make before and after
  values and deltas readable as text. Preserve the distinction between a
  measured zero, a missing measurement, and partial proof. Present timing
  deltas as observations from the named builds.
- In both the proof table and the sidebar test-file list, use a border for
  count changes, green for fewer tests and red for more. Use a background
  tint for duration changes, green for faster and red for slower. Consider
  darker shades for larger count changes and larger percentage changes in
  duration where the baseline supports a percentage. Use consistent meanings
  and text equivalents so the cues work without relying on color alone.
- Keep the sidebar's selected file and keyboard focus recognizable when either
  or both change cues apply. An inset edge for count, a tinted fill for
  duration, and a distinct selection outline are a starting point to evaluate
  against the existing selected-file style.

**Examples:**

- An entry drops from 12 to 10 tests and takes 12 seconds instead of 8. The
  table and its test-file row, when both have those measurements, show a green
  border, red fill, and readable `−2 tests` and `+4 s (+50%)` deltas. The
  cues stay visible when the file is selected.
- A file has the same count and runs 25% faster. It gets the green duration
  tint and a neutral count border. A file with no comparable timing explains
  the gap and uses a neutral timing style.

Build on the [existing Intent proof views](../../docs/dashboard-development-intent.md)
and the distinction between observed results and expected behavior in
[ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md).
