---
id: SEED-302
status: active
planted: 2026-11-11
scope: story
---

# SEED-302: Remaining MakeMe test data

<a id="make-remaining-test-domain-setup-express-intent"></a>

### Make remaining test domain setup express intent

**Identity:** SEED-302#make-remaining-test-domain-setup-express-intent

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

#### Examples

- An unresolved Codex creation states the saved workspace, endpoint, and
  request through shared construction. The recovery case keeps its exact
  shell-quoting arguments visible.
- A CI comparison names the build revision, run or adapter attempt, and proof
  at the test site. The retained build and endpoint response use their
  respective shared builders.
- A published story's seed and backlog entry use the same identity and title.
  The fixture still states the purpose text the dashboard is expected to show.
