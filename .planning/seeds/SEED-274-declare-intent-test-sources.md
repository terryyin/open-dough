---
id: SEED-274
status: active
planted: 2026-11-08
scope: story
---

# Let projects declare which tests Intent shows

<a id="declare-intent-test-sources"></a>

### Let projects declare which tests Intent shows

**Identity:** SEED-274#declare-intent-test-sources
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/528-declare-intent-test-sources/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5340f5feecddee672379bc7e839a27ba5f17bc1905b4c54362aced9124b33d32","plan":"c99ae8492555094b3ca361ba052d61c2a5852a2ae5006d02cc7165279311ab1b"}}
```

**Goal.** A developer can tell Intent which test files to show by publishing
configuration in their project. One location can group different kinds of
test source, and a new filename convention needs only a configuration change.
Donut, whose `scripts/` folder holds Bash `.test` files beside Node
`.test.mjs` files, can then read all of its tests in Intent without Open Dough
learning Donut's naming.

**Scope.**

Required behavior:

- A location in `.planning/open-dough.json` may declare its files as a list of
  source entries instead of a `kind`, each with a non-empty `include` list of
  patterns relative to the location (the existing `*`/`**` rules) and an
  optional `syntax` hint, for example
  `{ "path": "scripts", "sources": [{ "include": ["**/*.test"], "syntax": "shell" }, { "include": ["**/*.test.mjs"], "syntax": "javascript" }] }`.
  A file belongs to the location when any entry's pattern matches it; no
  extension filter applies.
- A file takes the hint of the first entry, in declaration order, whose
  pattern matches it. Hints use the existing kind names (`gherkin`,
  `typescript` with `.tsx` still highlighted as TSX, `javascript`, `python`,
  `shell`). A file whose entry has no hint, or a hint Intent has no grammar
  for, opens as plain text and stays listed.
- The same selection serves the tree, opening a file (`file-at` admission),
  and placing a selected story's changed tests, so a story's added matching
  file appears and a non-matching neighbor stays out.
- Existing `kind`/`include` declarations keep their current behavior,
  including the `unsupported-kind` explanation for an unknown `kind`.
- Document the contract where the existing one is documented
  (`dashboard/PROJECT-CONFIGURATION.md`, Intent guidance) and land it on
  `main`; the production dashboard serves published `main`, which is the
  Intent reader Donut uses.

Unchanged boundary: Intent reads the published configuration and source at its
reading revision. The project runs its tests and supplies Proof through the
existing CI summary contract, keyed by location path and file paths. This
follows [ADR 0001 — Ubiquitous
language](../../docs/adrs/0001-ubiquitous-language-accepted.md) for
project-owned settings introduced for a demonstrated need and [ADR 0008 —
Project dashboard domain and
architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for repository-owned facts and the distinction between Purpose and Proof.

Deferred promises:

- New grammars (for example Java for Donut's `backend/src/test/java`); such
  files can already be shown as plain text through source entries.
- Migrating this repository's or Donut's existing declarations; Donut's
  [SEED-109](https://github.com/nerds-odd-e/doughnut/blob/d5c8e6e1b32318f53c0b2d57914c8daa57040791/.planning/seeds/SEED-109-complete-test-inventory-and-script-proof.md#complete-test-inventory-and-script-proof)
  owns registering its locations and publishing its runners' results.
- Exclude patterns and per-entry labels or grouping inside a location.

Considered and not chosen: reinterpreting `kind` as only a hint whenever
`include` is present (smaller, but widens existing declarations whose patterns
reach beyond their kind's extensions); repeating a location path once per kind
(splits one CI-proof identity into two tree entries and still cannot select
`.test`).

**Architecture.** The shared selection rule in
`dashboard/src/intentLocationSelection.ts` (server listing, `file-at`
admission, story overlay) becomes the one place that answers both whether a
location selects a path and which hint that path takes. The location answer
carries its declared source entries so the reading pane resolves a file's
syntax by that same rule rather than from the location's `kind`. No Accepted
ADR conflicts: settings stay project-owned and read at the reading revision,
and Proof stays the project's published CI summary.

**Examples.**

- Donut declares one `scripts` location with source entries for
  `**/*.test` (`shell`) and `**/*.test.mjs` (`javascript`).
  `scripts/test/worktree_setup.sh.test` and
  `scripts/ci/ci-proof-outcomes.test.mjs` appear in the same tree and open at
  those paths with shell and JavaScript highlighting. A published CI summary for `scripts` still shows
  group and file results at those paths.
- A location declares one entry `**/*.check` with no hint. Intent lists
  `checks/a.check` and opens it as plain text; a selected story that adds
  `checks/b.check` shows it inserted as added, while `checks/notes.md` stays
  outside Intent.
- Entries `**/*.test.mjs` (`javascript`) then `**/*.test*` (`shell`):
  `x.test.mjs` highlights as JavaScript and `y.test` as shell. An entry with
  hint `java` lists `FooTest.java` as plain text.
- This repository's existing `typescript`, `shell` and `javascript`
  declarations, and a Gherkin declaration with no `include`, list and
  highlight the same files as before; a `kind: "java"` declaration still
  reports an unsupported kind.
