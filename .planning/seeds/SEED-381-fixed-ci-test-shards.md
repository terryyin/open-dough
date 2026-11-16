---
id: SEED-381
status: active
planted: 2026-11-16
planted_during: Developer request to replace automatic test sharding with fixed CI shards
trigger_when: selected from the product backlog
scope: story
---

# SEED-381 — Fixed CI test shards

Open Dough maintainers currently keep an automatic, duration-driven deal of
tests into CI shares: committed `longest-first` duration lists, the deal and
preview scripts, a normalized time budget with runner factors, stale-list
detection, and the tests and documents for all of it. The lists churn with
every refresh, and the machinery is far larger than the decision it serves.
Replace it with fixed shards declared in the CI configuration by folder and
file patterns, and rebalance them only on request.

Both stories remove the replaced behavior completely: code, data, fixtures,
tests and documentation. The result keeps no historical record of the former
deal and no text describing what no longer exists. Git history is the only
record.

<a id="fixed-shards-for-browser-tests-and-on-demand-rebalancing"></a>

### Fixed shards for browser tests and on-demand rebalancing

**Identity:** SEED-381#fixed-shards-for-browser-tests-and-on-demand-rebalancing

**Goal:** Maintainers rebalance every CI test group's shards only when they
choose to, from recent CI evidence, with every remaining shard declared as
fixed configuration.

**Scope:**

- Convert the `e2e`, `dashboard-integrated`, `dashboard-frontend` and
  `dashboard-backend` groups to fixed shards declared by spec patterns or
  Playwright projects, with the same "last shard runs the rest" rule and the
  same overlap check.
- Remove completely what remains of the automatic deal: `e2e/longest-first*`,
  `dashboard/*.longest-first*`, the remaining deal, preview, refresh,
  deadline-continuation and sizing code, their tests and fixtures, and the
  passages in `dashboard/tests/shards.md` and other documents that describe
  them.
- Add a private maintainer skill under `.agents/skills/`, not distributed by
  the installer, backed by one script. On request it reads `test-times`
  artifacts from the last successful `main` runs for a chosen group, prints
  each shard's total, flags notably slow tests, and proposes the smallest
  pattern move that evens the shards out as a diff to `ci.yml`.

**Outcome:** No duration list or dealing code remains in the repository. A
maintainer can rebalance any group by invoking the skill and reviewing its
proposed `ci.yml` change.
