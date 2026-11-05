---
id: SEED-238
status: active
planted: 2026-11-05
planted_during: Terry Yin's request to remove local proof across maintained projects
trigger_when: An Open Dough developer maintains proof collection, published guidance, or Intent
scope: story
---

# SEED-238: Remove local proof from Open Dough

<a id="remove-local-proof"></a>

### Remove local proof from Open Dough

**Identity:** SEED-238#remove-local-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** An Open Dough developer maintains a smaller repository and published
payload, with CI as the source of published execution observations. Delete the
local proof feature completely, including its stored records, collection and
persistence capability, and everything dedicated to producing or consuming it.

**Requirements:**

- Delete local proof artifacts, snapshots and retained historical observations
  from the maintained tree, including `tests/proof` and
  `dashboard/tests/proof`. Delete local-proof-only copies and fixture records;
  keep no archive or replacement history store.
- Delete the local collection and persistence implementation: recorders,
  reporters, stores, refresh and merge code, locking, opt-in environment
  variables, commands, runner wiring and configuration. Remove the local
  `proof` and `proofGeneration` settings and the code and schemas that read or
  explain them. Follow exclusive dependencies through helpers, packages and
  lockfiles until no orphaned local-proof support remains.
- Remove the dashboard's reading of committed local proof and every UI,
  summary, duration/cost view, endpoint, parser, data model and configuration
  path that exists solely for that evidence. Preserve Purpose/test-source
  browsing and story selection. Per-case views based only on local snapshots
  are removed with their source; adding equivalent CI detail is not a
  prerequisite or a promise of this removal.
- Remove all dedicated tests, fixtures, mocks and test helpers. Delete the
  feature rather than switching it off, hiding it, retaining compatibility
  readers, or replacing its tests with assertions that it is absent. Use a
  one-time whole-product sweep as an acceptance reading, separately from
  tests of surviving behavior.
- Remove the published local-proof guidance and its distribution entries,
  including the Cucumber, pytest, Vitest, Node test and Playwright proof
  recording references under `src/skills/dough-test-optimization/references/`.
  Remove local-proof-specific skill content, examples, templates, links,
  rules, installer/update manifests and payload tests. Preserve shared skill
  responsibilities such as test optimization and CI proof publication. Author
  the payload source in `src/skills/`; released installation/update must
  remove the retired managed files for Codex, Cursor and Claude Code.
- Remove local-proof documentation, comments, requirements and obsolete
  planning material, including the consolidation work in
  `SEED-233#consolidate-proof-recording-guidance` and local-proof-only parts of
  SEED-192. Maintained code, guidance and docs describe the resulting product
  directly, with no tombstones, historical feature narrative or migration
  guide. Spent removal planning is cleaned up when the story closes.
- Preserve ordinary local test execution, its diagnostics and failure
  semantics. Preserve CI proof collection, fragments, summaries, artifacts,
  run/attempt/revision identity checks, CI adapters and the dashboard's
  **Intent → CI status → Proof** reading. Where a report or helper serves CI
  as well as local proof, retain only the responsibility needed by surviving
  test execution or CI; remove the local-proof entry points and persistence.

**Evaluation:** Review the complete deletion diff and a one-time search of
the whole product and released payload for local-proof feature references,
classifying shared CI uses by their actual consumers. Run the appropriate
surviving tests for ordinary execution, Purpose browsing, CI proof production
and CI proof reading, including GitHub Actions and CI-adapter paths. Verify
released update cleanup on all three supported hosts using the existing
installation/update checks. Do not create a permanent removal checker.

**Architectural context:** [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
distinguishes verification procedures from observed results and leaves proof
storage and representation open. Tests and CI proof remain maintained product
capabilities; repository snapshots are not required by that decision.

**Boundary:** This story owns Open Dough's product, source guidance and
released payload. Project-owned implementations in Donut, Pygardon and Lizard
have their own removal stories. This is deletion work, with no new proof
archive, CI history product or expansion of CI detail required.
