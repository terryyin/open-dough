---
id: SEED-070
status: active
planted: 2026-10-01
planted_during: Terry's request for follow-up CI and test optimization after concurrent story branches land
trigger_when: Active concurrent story branches (SEED-066, SEED-052 Codex dashboard support, SEED-067) have completed and landed on trunk
scope: story
---

# SEED-070: Re-optimize CI feedback and test wall time after concurrent story branches land

## Why This Matters

Prompt, trustworthy CI feedback is critical for smooth trunk-based collaboration.
During the initial CI optimization pass in `SEED-068` (plan `193`), several other
tasks were actively executing in their own story branches (`SEED-066` composable
session options, `SEED-052` Codex dashboard sessions, and `SEED-067` Codex
refinement reliability).

As those branches progressed and integrated into trunk, they introduced new
tests, additional browser fixtures, and asynchronous host workflows. After the
first integration merge into `main`, trunk CI wall time was already observed to be
longer than on the isolated optimized branch (with `dashboard (4/4)` taking
~2m57s and overall duration increasing). Once all these concurrent in-flight
branches have completed and landed on trunk, another targeted optimization pass is
needed to restore and maintain fast feedback (<2.5m, targeting ~2m).

## Alternatives and Decision

- **Optimize immediately before in-flight branches finish:** Rejected. Concurrent
  branches are actively adding and modifying tests; optimizing before they land
  would leave new tests unprofiled and require yet another pass.
- **Rely solely on increasing runner hardware or timeout budgets:** Rejected. Does
  not address structural test bottlenecks, fixture bloat, or execution imbalance.
- **Perform targeted CI and test optimization once concurrent branches land:**
  Selected. Wait until active story branches (`SEED-066`, `SEED-052`, `SEED-067`)
  are landed, then profile the integrated suite on trunk and execute targeted
  optimizations using the proven tactics from `SEED-068`.

## Story

<a id="reoptimize-ci-test-wall-time"></a>

### Re-optimize CI feedback and test wall time after concurrent story branches land

**Identity:** SEED-070#reoptimize-ci-test-wall-time
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/198-reoptimize-ci-test-wall-time/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"04610083082c7d2d77763dfdedbff6273e979310eba9623db6767f19d77aa52b","plan":"e2e26120e8afd9e226eead914628fb302a68837b9e8bbaa2a75f6671e1d7b80e"}}
```

**Goal:** Developers and agents collaborating on trunk get CI feedback on each
published revision within 2.5 minutes again (aiming for about 2 minutes), so
waiting for CI does not slow trunk-based collaboration now that the Codex
dashboard, composable session, and Codex refinement work have added tests to
the suite. This restores the speed achieved by `SEED-068` for the integrated
suite; it does not set up ongoing CI-time monitoring.

**Scope:**

- **Start condition (met):** `SEED-066#composable-lightweight-session-options`,
  `SEED-052#use-codex-from-dashboard`, and
  `SEED-067#resolve-codex-refinement-launch-failures` have closed and landed on
  `main` (observed 2026-10-01). Stories taken since then do not hold this
  story back; their tests are measured as they stand on trunk at execution.
- **Baseline (trunk, 2026-10-01, runs `36827199430`–`36835182175`):** run
  duration 2m41s–3m11s. `dashboard (4/4)` is the critical path in every run
  (2m37s–3m03s); `dashboard (1/4)`, which also type-checks, reaches 2m06s–3m01s
  while shards 2 and 3 finish in 1m43s–2m09s. `test` shares take 0m53s–1m39s
  and `lint` 0m38s–1m05s.
- **Required outcome:** the CI run for the delivered trunk revision, and two
  reruns of that same revision, each complete in under 2m30s. No single job is
  left as an outlier that ordinary runner variance pushes past the target.
- **Means:** whatever the profile of the integrated suite shows is needed,
  using the `SEED-068` playbook: download trunk timing and Playwright report
  artifacts, find the critical-path job and slow test families, apply
  `dough-test-optimization` (for example rightsizing inflated fixtures or
  splitting sequential multi-suite files), rebalance matrix shares and
  Playwright shards (shard count may change), and refresh
  `tests/longest-first`. These are tactics, not individual delivery promises.
- **Preserved constraints:**
  - Behavioral coverage stays whole: no test is skipped or deleted, and no
    assertion is weakened, unless an optimization replaces it with
    equivalent coverage that `dough-test-optimization` justifies.
  - Diagnostic artifacts (`playwright-report`, `test-results`,
    `test-times-*`) and per-job failure reporting keep working.
  - `.github/workflows/ci.yml` changes keep satisfying `tests/ci-container.sh`
    (dashboard `run:` steps after `npm ci` match `scripts/ci-container.sh`).
  - The target is met by changing tests and job structure; faster runners or
    longer timeouts alone do not count (see Alternatives and Decision).
  - Unit and shell tests still split across all `test` shares with no
    duplicate or missing test (`scripts/test-jobs.sh`).
- **Deferred:** keeping CI under target as later stories add tests, automated
  CI-duration alerts or budgets, and local full-suite wall time beyond what
  these changes naturally give.

**Key examples:**

- *Critical-path shard:* `dashboard (4/4)` takes about 3m on trunk while
  shards 2 and 3 finish near 1m45s → after rebalancing and optimizing its slow
  specs, every dashboard shard finishes well within the 2m30s run target.
- *Fixture rightsizing (precedent):* `accessibleOverview.ts` rendered 40
  queued cards to prove overflow → 16 cards still overflow and scroll, the spec
  keeps its assertions, and it renders 24 fewer cards.
- *Sequential file (precedent):* `tests/git-publication-native.sh` ran the
  admission journeys after its other suites → moving them to
  `tests/git-publication-native-admission.sh` let both run in parallel shares
  and the slow share dropped from 69s to 27s.
- *Delivery proof:* the delivered trunk revision's CI run takes 2m10s and two
  reruns take 2m05s and 2m20s → met. A rerun taking 2m40s → not met; keep
  optimizing or report the remaining bottleneck.
- *No regression:* all unit, shell, and Playwright tests pass in each of those
  runs, and the uploaded artifacts are still present.

**Depends on:** nothing remaining; the start condition is met.

**Effort hypothesis:** S to M, reusing the `SEED-068` playbook and tooling.

**Reference from `SEED-068` / plan `193`:** commits `28df8eb9` (4 dashboard
shards, Chromium cache), `d38a45ab` (3 test shares, `tests/longest-first`),
`4e79272c` (admission publication split), `45b3c53c` (`queuedCount: 16`),
`09dbcfa1` (6-minute timeouts), `0e28f831` (background polling in
`agent-launch-host-identity.spec.ts`); recoverable plan
`.planning/slice-plans/193-reduce-ci-wall-time/PLAN.md` at `0c4f3178`.

**Capture:** Terry requested this follow-up on 2026-10-01 so a second pass
happens after the concurrent branches land.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [CI workflow](../../.github/workflows/ci.yml).
- [Initial CI optimization effort](../../docs/maintainer/finding-names.md) (`SEED-068` / plan `193` in commit `0c4f3178`).
- [Test optimization skill](../../src/skills/dough-test-optimization/SKILL.md).
- [Test harness and runner](../../tests/README.md).
