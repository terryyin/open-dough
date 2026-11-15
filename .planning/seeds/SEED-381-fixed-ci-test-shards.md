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

<a id="fixed-pattern-shards-for-the-distribution-suite"></a>

### Fixed pattern shards for the Distribution suite

**Identity:** SEED-381#fixed-pattern-shards-for-the-distribution-suite

**Goal:** Maintainers run and change the Distribution suite's CI shards by
reading one place, the `distribution-tests` matrix in
`.github/workflows/ci.yml`, without maintaining duration lists, budgets or a
dealing algorithm.

**Scope:**

- Each matrix entry names its share by intent entry and folder or file glob
  patterns. The last share runs every test that no earlier share claims, so a
  new folder or file always runs.
- One small check fails when a test file matches more than one share's
  patterns, naming the file and the shares. It is the only sharding
  automation that remains.
- Each CI job keeps a plain `timeout-minutes`. The normalized time budget
  (`time-budget`, per-job and total ceilings, runner factor) is removed.
- Each share keeps uploading its `test-times-<i>` artifact, retained long
  enough for later rebalancing (90 days), as the rebalancing input.
- Remove completely: `Distribution/tests/longest-first*`, the deal, preview,
  refresh and stale-list code in `scripts/` (`test-shares.mjs`,
  `share-deal.mjs`, the budget and recorded-speed parts of the runner and
  `ci-test-times.sh` where only the budget uses them), their tests and
  fixtures, and `test-shares.md`, `time-budget.md` and every passage that
  refers to them. Code the dashboard groups still use stays until the next
  story removes it.

**Outcome:** CI runs every Distribution test exactly once across the fixed
shares, with total wall time comparable to the current split, and no
remaining reference to duration lists, deals or the normalized budget in the
Distribution suite's code, tests or documents.

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
