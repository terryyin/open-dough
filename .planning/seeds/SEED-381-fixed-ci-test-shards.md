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
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/654-fixed-pattern-shards-for-the-distribution-suite/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7eea2763807bbe42c26503035d6cc0d744af5450df422c839070ce4cbd4f9850","plan":"96245b41b4d36332a7ae162b1d36b02bc7ef5c098e09174056182fd7d9e292cc"}}
```

**Goal:** Maintainers run and change the Distribution suite's CI shares by
reading one place, the `distribution-tests` matrix in
`.github/workflows/ci.yml`, without maintaining duration lists, budgets or a
dealing algorithm.

**Scope:**

- Each matrix entry keeps its share number and names the tests it runs as
  repository-relative folder or file glob patterns over the checks the runner
  already discovers for the Distribution intent entry. The last entry names no
  pattern and runs every discovered check that no earlier share claims, so a
  new folder or file always runs. Job names, CI proof parts and the
  `test-times-<i>` artifact names stay as they are.
- The starting shares are `Distribution/tests/skills/dough-execute-plan/**`,
  `Distribution/evaluation/**`, and the rest. They are tuned once from the
  story's own CI runs and then left alone.
- One small check fails when a check file matches more than one share's
  patterns, naming the file and the shares, or when a pattern matches no
  check, naming the pattern. It is the only sharding automation that remains.
- A share is reproducible locally by its number. A run that selects no share
  runs every check, in bytewise path order.
- Each CI job keeps its plain `timeout-minutes`, its 320-second run cutoff and
  the 180-second per-check safety deadline. The normalized time budget
  (`time-budget`, per-job and total ceilings, runner factor, `OVER BUDGET`
  failures) is removed.
- Each share keeps uploading its `test-times-<i>` artifact, retained for 90
  days, as the rebalancing input.
- Remove completely everything only the Distribution suite uses:
  `Distribution/tests/longest-first*`, `Distribution/tests/time-budget`, the
  `share` and `runner-factor` commands, the Distribution preview with its
  budget headroom, trunk inventory and stale-list report,
  `scripts/test-budget.sh`, `scripts/time-budget.bash`,
  `scripts/ci-test-times.sh`, their tests and fixtures, `test-shares.md`,
  `time-budget.md`, every passage that refers to them, and the maintainer
  findings entries that describe the deal or the budget as the current
  response.

**Scope limits:**

- What the dashboard groups still use stays until the next story removes it:
  the deal and duration-list modules, the list refresh, and the `--spec-dir`
  preview, with their tests and `dashboard/tests/shards.md`.
- No command reports recent per-check CI seconds between this story and the
  next. The retained `test-times-<i>` artifacts are read with `gh run
  download`; `scripts/ci-job-times.sh` keeps reporting each share's distance
  from its run cutoff.
- Released `CHANGELOG.md` entries and the done-story catalog are release and
  identity records, not descriptions of current behavior, and stay.

**Key examples:**

- A maintainer adds `Distribution/tests/new-area/first.sh` and changes nothing
  else → CI runs it once, in the last share.
- A maintainer adds
  `Distribution/tests/skills/dough-execute-plan/new-case.test.mjs` → CI runs it
  once, in the share whose pattern names that folder; no list or preview step
  precedes the push.
- A maintainer gives the second share the pattern
  `Distribution/tests/skills/**` while the first keeps
  `Distribution/tests/skills/dough-execute-plan/**` → the check fails naming
  one overlapping file and both shares, before any share's result is trusted.
- A maintainer renames `Distribution/evaluation` and leaves the pattern
  behind → the check fails naming the pattern that matches no check, instead
  of the folder silently joining the last share.
- A check takes 70 seconds on CI where the removed per-job ceiling was 64 →
  the share passes; only the 180-second safety deadline or the 320-second run
  cutoff fails a share for time.
- A maintainer moves one folder pattern from the last share to the first in
  `ci.yml` → the next CI run follows it, with no other file to edit.

**Architecture:**

- The matrix is the one owner of share membership. The runner's selection and
  the overlap check read the shares from the workflow file through one small
  module, and the runner is told only which share number to run. No Accepted
  ADR constrains this; the repository has no YAML parser, so the matrix entry
  form must stay readable by that module.
- Share balance has no automatic owner. Wall time per share tracks its
  job-seconds divided by the runner's four CPUs (main run 43773156778: 927,
  947 and 619 job-seconds ran in 233, 238 and 155 seconds). The starting
  shares total about 743, 845 and 905 job-seconds on that run, so the slowest
  is predicted near 226 seconds against the 238 measured today and the
  320-second cutoff. A share that grows past its cutoff fails that share; the
  drift before then is visible only through `scripts/ci-job-times.sh` or the
  job durations.

**Considered:**

- First match wins in matrix order, as a routing table with a default route
  does, would make an overlap impossible and need no check. The story keeps
  the developer's overlap check so each share's patterns say what it runs
  without reading the earlier entries. The same analogy's limit shapes the
  shares: a default route carries no load, but the last share receives every
  new folder, so it grows without anyone editing it.

**Outcome:** CI runs every Distribution check exactly once across the fixed
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
