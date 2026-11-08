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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer can tell Intent which test files to show by publishing
configuration in their project. One location can group different kinds of
test source, and a new filename convention needs only a configuration change.

**Scope.** Document and deliver a declarative contract in
`.planning/open-dough.json` that selects files by patterns under one
repository-relative location. Allow an optional syntax hint for matched files.
Files with no usable hint open as plain text. Use the same selection for the
tree, opening files, and showing a selected story's changed tests. Keep
existing supported location declarations working with their current behavior.

Intent reads the published configuration and source at its reading revision.
The project runs its tests and supplies Proof through the existing CI summary
contract, using the location and file paths. This follows [ADR 0001 —
Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md) for
project-owned settings and [ADR 0008 — Project dashboard domain and
architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for repository-owned facts and the distinction between Purpose and Proof.

**Examples.**

- Donut declares one `scripts/` location with patterns for its Bash `.test`
  files and Node `.test.mjs` files. Both appear in the same tree and open at
  their repository paths, with shell and JavaScript highlighting when those
  hints are configured. A published CI summary for `scripts` still shows
  group and file results at those paths.
- A project declares `**/*.check` under a test location with no syntax hint.
  Intent lists matching files and opens them as plain text. A matching file
  added by a selected story appears in the same location, while a neighboring
  file outside the declared patterns stays outside Intent.
- A project with an existing Gherkin or TypeScript declaration can keep its
  configuration and browse the same files as before.

Publish the contract and make it available in the Intent reader Donut uses.
[Donut SEED-109](https://github.com/nerds-odd-e/doughnut/blob/d5c8e6e1b32318f53c0b2d57914c8daa57040791/.planning/seeds/SEED-109-complete-test-inventory-and-script-proof.md#complete-test-inventory-and-script-proof)
owns registering its locations and publishing its runners' results.
