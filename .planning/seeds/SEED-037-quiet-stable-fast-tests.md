---
id: SEED-037
status: active
planted: 2026-09-25
planted_during: Product backlog capture requested by the maintainer
trigger_when: The full local test suite is run or tests run in CI
scope: unknown
---

# SEED-037: Get quiet, stable, fast test feedback

## Why This Matters

For an Open Dough developer running the tests locally or reading CI results,
routine test output and warnings obscure failures, time-based waits make tests
slow and flaky, and the full suite takes too long to provide feedback. The
desired result is a quiet successful run, useful diagnostics on failure,
repeatable results, and a measured full-suite local run at least four times
faster than the comparable pre-optimization baseline.

## Alternatives and Decision

Silencing the runner alone would shorten logs but leave warnings, flaky tests,
and long waits in place. Retrying failed tests would hide instability. A set
of isolated micro-optimizations could make individual tests faster without
meaningfully shortening the full run. Treat output, stability, and total local
feedback time as one end-to-end outcome, using `dough-test-optimization` to
profile related test families, experiment, preserve behavioral proof, and
re-profile the complete local scope.

## Story Decomposition

<a id="fourfold-local-suite"></a>

### 2. Bring the complete local suite to a quarter of its original time

**Identity:** SEED-037#fourfold-local-suite

**Status:** Not refined. Split on 2026-09-25 from the delivered story that made the suite quiet,
stable, and twice as fast, at its plan's decisive checkpoint, with the evidence
below.

**Goal:** An Open Dough developer gets complete local test feedback
(`npm test` then `npm run test:dashboard`) in at most a quarter of the
pre-optimization time, while keeping the suite's quiet output, stable results,
and behavioral coverage.

**Measure:** paired and relative, as settled on the maintainer's
instruction: alternate the pre-optimization start revision (`bad3717`) and the
candidate under the same load, three runs each, and compare medians. When the twofold result
was delivered the pair was 242.6 s against 121.6 s (ratio 0.50); the target is 0.25.

**Evidence for scope (decisive checkpoint, 2026-09-25):**

- Every job alone sums to about 632 s; at 16 slots effective parallelism is
  about 6. Reaching 0.25 needs roughly a 58% cut in total work with no single
  job over about 15 s alone.
- Installer and updater runs dominate the long shell checks (about 30
  `apply`/`install.sh` runs in `story-payload-update.sh`, 24 of them a
  Cursor-only protection matrix). Fewer runs per promise, or a faster
  installer, is the only lever of the needed size. Coverage rules from
  this seed apply: a promise keeps an observable proof at its boundary.
- **In scope (maintainer decision, 2026-09-25): the CI observer checks
  immediately when a push is registered.** Today `watch-ci-execution.mjs`
  polls every 30 s (`pollMs = 30_000`) and `register-push` does not wake the
  worker, so a revision whose CI already finished waits up to 30 s for a
  verdict that already exists. Users re-publishing a covered revision hit
  it, and `execution-payload-update.sh` pays it on some runs (30.05 s
  against 0.40 s when the first poll comes after registration).
- On macOS `/usr/bin/git` is a launcher stub costing about 7.5 ms per call;
  the Command Line Tools git first on `PATH` measured −7.4% locally.
- `assert_payload` compares files with one `cmp` per file (about 3 s per
  calling check).
- Release-fixture reuse and repository-copy setup were measured and are not
  worth doing (about 1 s and 4–5 s of wall).

- **Value / learning:** halves local feedback time again, and learns whether
  the payload and update checks can prove the same promises with fewer
  installer runs.
- **Effort hypothesis:** M–L, provisional.
- **Depends on:** none; the quiet, stable, twofold suite is delivered.

## Ordering and Scope Reduction

Place this story first as requested by the maintainer. Investigate shared
setup, redundant cases, fixture cost, synchronization, and runner overhead as
related test families. Prefer changes that reduce the complete local feedback
path, and keep measured experiments that preserve confidence. Do not count a
quiet log, fewer cases, or a faster isolated test as the fourfold result.

## Open Decisions

None. Refinement on 2026-09-25 settled the complete local suite (`npm test`
followed by `npm run test:dashboard`) and which time-driven behavior needs a
controlled clock or event-based proof.

## When to Surface

Immediately, as the first item in the product backlog.

## Breadcrumbs

- Maintainer request on 2026-09-25 for no-news-is-good-news output, strict CI
  output enforcement, stable event-synchronized tests, and a measured fourfold
  local full-suite speedup.
- `scripts/test.sh`, `tests/README.md`, `dashboard/tests/`, and
  `.github/workflows/ci.yml` identify the current test and CI surfaces.
- The installed `dough-test-optimization` skill owns profiling, measured
  experiments, preservation of proof, and final re-profiling during execution.
