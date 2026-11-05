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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/474-remove-local-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0cdbab6687ee351dec9cd6cb71520438e723774932e45c31a10f2e2b9ee0c187","plan":"e47cd75e13eb81f88508be1e861de1ffde710e965f2c8eff7a6184ebca73a015"}}
```

**Goal:** An Open Dough developer maintains a smaller repository and published
payload, with CI as the only source of published execution observations. The
local proof feature is deleted completely: its committed records, its
collection and persistence, the dashboard's reading of them, its published
guidance, and everything that exists only to produce, consume, test or
explain it. This contributes to keeping Open Dough's product and guidance
focused on capabilities that are maintained and used.

**Scope:**

- **Required:**
  - Delete the committed local proof stores `tests/proof` and
    `dashboard/tests/proof`, and local-proof-only copies and fixture records.
    Keep no archive or replacement history store.
  - Delete local collection and persistence: recorders, reporters, stores,
    refresh and merge code, locking, the `RECORD_NODE_TEST_PROOF` and
    `RECORD_PLAYWRIGHT_PROOF` opt-ins, commands, runner wiring and
    configuration. Remove the Intent location `proof` and `proofGeneration`
    settings, including this repository's entries in `.planning/open-dough.json`,
    and the code, schemas and documentation that read or explain them. Follow
    exclusive dependencies through helpers, packages and lockfiles until no
    orphaned local-proof support remains.
  - Remove the dashboard's reading of committed local proof and every UI,
    summary, duration/cost view, endpoint, parser, data model and
    configuration path that exists solely for it, including proof generation
    prompts and last-successful-proof summaries. Per-case views based only on
    local snapshots go with their source.
  - Remove dedicated tests, fixtures, mocks and test helpers. Delete the
    feature rather than switching it off, hiding it, keeping compatibility
    readers, or replacing its tests with assertions that it is absent.
  - Remove the published local-proof guidance: the Cucumber, pytest, Vitest,
    `node:test` and Playwright proof references under
    `src/skills/dough-test-optimization/references/`, their links, rules,
    examples and templates in other skills, and their installer/update
    manifest and payload-test entries. Released installation and update remove
    the retired managed files for Codex, Cursor and Claude Code.
  - Remove local-proof documentation, comments and obsolete planning material:
    drop `SEED-233#consolidate-proof-recording-guidance` and its backlog entry
    completely, and drop SEED-192's local-proof-only parts, including the
    queued `SEED-192#read-shell-check-proof`, whose retained shell-check
    evidence would be a new local producer. Maintained code, guidance, docs and
    finding records describe the resulting product directly, with no
    tombstones, historical feature narrative or migration guide.
- **Required restrictions (preserved behavior):**
  - Ordinary local test execution keeps its diagnostics, timing, selection and
    strict failure semantics.
  - CI proof keeps working end to end: fragments, summaries, artifacts,
    run/attempt/revision identity checks, CI adapters and the dashboard's
    **Intent → CI status → Proof** reading. Where a report serves CI as well as
    local proof, keep only the responsibility CI or surviving test execution
    needs. The dashboard run record (`OPEN_DOUGH_DASHBOARD_PROOF_RECORD`,
    `dashboard/tests/proof-record.md`) feeds CI's Playwright fragments and
    survives, described as the CI input it is.
  - Purpose/test-source browsing, story selection, shard and longest-first
    scheduling from CI test times, and the shared test-optimization and CI
    proof publication responsibilities stay.
- **Scope limits:**
  - Project-owned implementations in Donut, Pygardon and Lizard have their own
    removal stories.
  - No new proof archive, CI history product, or added CI per-case detail.
  - This repository's installed copies under `.agents/skills/` and
    `.claude/skills/` change only through a released payload, not by hand.
  - No permanent removal checker. A one-time whole-product sweep is an
    acceptance reading, separate from tests of surviving behavior.
  - Spent removal planning is cleaned up at story close.

**Key examples:**

1. A developer opens Intent for `tests` or `dashboard/tests` → Purpose and test
   source still browse, and the **CI status → Proof** tab shows the run's CI
   proof; no last-successful-proof summary, duration/cost view or proof
   generation prompt appears, and the read returns no local proof field.
2. A project's `open-dough.json` location still contains an old `proof` or
   `proofGeneration` key → it is treated like any other unrecognized location
   key; no documentation, schema or compatibility reader names it.
3. A developer runs `bash scripts/test.sh <file>` or
   `npm run --silent test:dashboard -- <spec>` with `RECORD_NODE_TEST_PROOF=1`
   or `RECORD_PLAYWRIGHT_PROOF=1` set → the run behaves exactly as without it:
   same output and exit, and no proof directory is written.
4. CI runs on a published revision → the test shares still write
   `test-outcomes.txt`, dashboard shards still write their run record, and the
   `ci-proof` job publishes a summary the dashboard reads, as before.
5. A client project at the previous release updates to the release containing
   this removal on Codex, Cursor or Claude Code → the five runner proof
   references disappear from its installed `dough-test-optimization`, while
   `ci-proof-summary.md` and the rest of the skill remain.
6. The acceptance sweep finds `proof` in `tests/proof-scheduling-native.sh` and
   `tests/support/dough-adr-awareness-proof.sh` → these are verification
   vocabulary, not the local proof feature, and stay; a hit in a CI proof
   module is kept after confirming its consumer is CI.

**Evaluation:** Review the complete deletion diff and the one-time sweep of
the whole product and released payload for local-proof references, classifying
shared CI uses by their actual consumers. Run the surviving tests for ordinary
execution, Purpose browsing, CI proof production and CI proof reading,
including GitHub Actions and CI-adapter paths, and verify released update
cleanup on all three hosts with the existing installation/update checks.

**Architectural context:** [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
distinguishes verification procedures from observed results and leaves proof
storage and representation open. Tests and CI proof remain maintained product
capabilities; repository snapshots are not required by that decision.
