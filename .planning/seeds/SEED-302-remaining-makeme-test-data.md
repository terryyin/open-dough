---
id: SEED-302
status: active
planted: 2026-11-11
planted_during: Terry queued the remaining MakeMe conversions after the line-linked audit
trigger_when: Maintainers still meet hand-built domain setup at audited test call sites
scope: story
---

# SEED-302: Remaining MakeMe test data

<a id="make-remaining-test-domain-setup-express-intent"></a>

### Make remaining test domain setup express intent

**Identity:** SEED-302#make-remaining-test-domain-setup-express-intent
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/583-make-remaining-test-domain-setup-express-intent/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"72c5a07ea53967a00ce7baac5d91b7f610f00abe57401ecfe76787ef25a27e2f","plan":"be34281a3638c336b68b35bc48bb0e85bcc0ed7f9eea50819ddcaa613598b346"}}
```

#### Goal

Maintainers reviewing a test can read the domain facts that distinguish its
scenario at the call site. Shared MakeMe builders supply incidental defaults and
produce the shapes the product consumes.

#### Scope

Use the [line-linked audit](../evidence/makeme-test-data-audit.md) as the
conversion list. It covers launch requests, saved and observed sessions,
project and launch-option configuration, published planning records, CI provider
and policy facts, and CI comparison and proof answers across the shell, Node,
and dashboard suites. Fix the shared fixture where it owns construction for
several callers. Reuse or extend the existing builders and use the production
shape or encoder for each boundary.

For each audited location, migrate the valid setup or record the specific
input shape the case needs to control. Preserve literal protocol, legacy,
or malformed inputs that the test exercises, captured evidence, real actions,
and independent assertions. Keep case-defining dates, identities, and choices
explicit, following the [test data architecture](../../tests/test-data-architecture.md).

This increment does not change product behavior, invent suite-local domain
models, convert browser page-object mechanics (SEED-300), or enforce first-layer
test-case length (SEED-301). Locations outside the audit are out of scope;
when converting a listed shared fixture, update its callers that share that
construction.

#### Key examples

- Pre: An unresolved Codex creation still builds workspace, endpoint, and
  request facts inline beside recovery shell arguments.
  Trigger: Convert that creation through shared construction.
  Result: The call site names the saved workspace, endpoint, and request through
  MakeMe. The recovery case keeps its exact shell-quoting arguments visible.
- Pre: A CI comparison assembles retained build, adapter attempt, and proof
  figures by hand at the test site.
  Trigger: Convert the comparison setup through the shared builders.
  Result: The test names the build revision, run or adapter attempt, and proof
  at the call site. The retained build and endpoint response come from their
  respective builders.
- Pre: A published story fixture hand-renders a seed and backlog entry with
  matching identity and title, plus purpose prose the dashboard must show.
  Trigger: Convert the membership facts through shared construction.
  Result: Seed and backlog entry share identity and title from MakeMe. The
  fixture still states the purpose text the dashboard is expected to show.
