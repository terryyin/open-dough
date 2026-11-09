---
id: SEED-289
status: active
planted: 2026-11-10
planted_during: Open Dough project findings maintenance in the combined feedback cycle of 2026-11-10
trigger_when: A node test job hangs or is cancelled without a named result, or a layout check passes in scripts/ci-container.sh but fails on the hosted runner
scope: epic
---

# SEED-289 — Named test results that match locally and in CI

## Why this matters

Two of this repository's test-harness gaps keep turning a test problem into
lost time and developer decisions without a named cause.

- `scripts/test.sh` has no per-job deadline. Its time budget is judged only
  after a CI run finishes. In [DD-426](../../ProjectFindings.md#dd-426) a slow
  hosted runner hit the node job's 6-minute `timeout-minutes` and was
  cancelled with no named test and no timing artifact. In
  [DD-476](../../ProjectFindings.md#dd-476) a merged-state `npm test` hung for
  47 minutes in one job while holding `refs/dough/local-test-suite`, which
  blocked every worktree's whole runs until it was ended by hand.
- `scripts/ci-container.sh` cannot reproduce the hosted runner's text widths.
  In [DD-435](../../ProjectFindings.md#dd-435) the same narrow-width check in
  `dashboard/tests/intent/intent-ci-proof.spec.ts` failed hosted CI twice
  (runs 42059477099 and 42379612785) after passing on macOS and in the
  container, costing two stash/repair/restore cycles and about 227k
  repair-agent tokens. The second repair forces Verdana inside the spec, a
  stand-in each new layout-measuring check must remember.

<a id="name-a-test-job-past-its-deadline"></a>

### End a node test job at its deadline with a named result

**Identity:** SEED-289#name-a-test-job-past-its-deadline
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/563-end-test-jobs-at-their-deadline/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"42e01225767dc66aa34ac1aa58457871b79fc36b36f017536cd8ef8282c0f0ab","plan":"5900107328626b7a26586592f3bd148dbf258a04b0709923e6f3d78c574c11d4"}}
```

**Goal.** Maintainers and agents running `scripts/test.sh` locally or in CI
receive a named, recorded failure when a check hangs or the CI run exhausts
its available test time. The deadline actively ends stuck work; detecting
slow tests or builds is not its purpose. An overrun must end without requiring
someone to kill the run and unblock every worktree's whole-suite admission. This addresses
DD-476's hung check and DD-426's unnamed hosted cancellation.

**Scope.**

- Give each runner job a 180-second wall-clock safety deadline, locally and in
  CI. A runner job means one Bash check or one `node --test` file, matching the
  runner's existing scheduler. Start its clock when that job starts, rather
  than while it is queued or waiting for suite admission.
- At expiry, stop the affected job and its owned process group with bounded
  cleanup, fail the run, and report the job's label, deadline reason, elapsed
  time, and useful captured output. A check ignoring TERM must not leave the
  deadline path waiting indefinitely. Deliberately detached workers retain
  their existing check-owned teardown contract.
- As with an ordinary failed check, other queued checks may continue after
  an individual job times out. The run still fails; an absolute CI cutoff
  instead stops the whole run so reporting has time to finish.
- Preserve timing and `passed`/`failed` outcome rows for jobs that started,
  including the timed-out job. A completed local whole run releases
  `refs/dough/local-test-suite` through its existing admission owner, so the
  next waiting worktree can enter.
- In CI, also bound the run against a 320-second absolute cutoff established
  before dependency setup, following the existing dashboard model. Slow setup or
  many uniformly slow checks must not defeat the report by reaching the
  outer six-minute cancellation first. Stop running work, identify unfinished
  jobs and work not started, and leave timing/outcome files available to the
  existing artifact and CI proof steps. Unstarted checks have an unfinished
  outcome and no invented execution time; CI proof must retain them as other,
  rather than present them as passing or omit them as though no work remained.
- Keep normal silent success, ordinary failure reporting, and signal handling.
  A completed check leaves no deadline worker that can later kill other work.
- Keep the existing normalized 64-second per-job and 694-job-second total
  performance budgets and their CI-only, post-run judgment unchanged. These
  measure performance at recorded runner speed; the safety deadline measures
  wall time and must remain a separate policy.
- The dashboard suite's deadline, performance-budget recalibration, hosted
  font parity, automatic retries, and changes to test-level timeouts are
  outside this increment.

**Key examples.**

1. A local whole run starts a check that announces readiness and then blocks.
   Its safety deadline expires. The run names that check and its elapsed
   time, records a failed outcome and timing, ends its owned processes, and
   admits a whole run waiting in another worktree once the run ends.
2. A check finishes silently before its deadline. Its outcome remains passed,
   and a later check remains alive when the first check's old deadline would
   have expired. Ordinary check failures retain their existing diagnostics.
3. CI setup consumes part of the available time; no single check has yet
   reached its own deadline when the absolute run cutoff arrives. The runner
   ends with named unfinished checks and retained reports before the hosted
   outer timeout. Checks not started are not reported as successes.
4. The CI cutoff has already passed when the runner starts. It fails naming
   the exhausted run deadline without starting checks, and leaves an honest
   unfinished report for the selected checks for the existing artifact consumers.

Proof advances a controlled clock or triggers an observable deadline event
after job readiness; it never waits for wall-clock time to pass. The local
deadline/report/admission journey is a useful safe stopping point before the
CI cutoff and artifact journey is added.

**Decision — Terry, 2026-11-10.** Accepted 180 seconds to actively stop a
never-ending check and identify the failure. This is not a new threshold for
detecting slow tests or builds. The CI cutoff follows the dashboard's existing
320-second allowance before the six-minute outer bound, preserving time to
save reports without changing either performance budget.

<a id="match-hosted-fonts-in-ci-container"></a>

### Give the local CI container the hosted runner's fonts

**Identity:** SEED-289#match-hosted-fonts-in-ci-container
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/564-match-hosted-fonts-in-ci-container/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"fae3beae79f8cfcb8b0a07ca9bf3988fe97af9995cfb76a6a94965e0d1b53d78","plan":"c71b0150d95f3e46780fc1d8c19ce61b958f833c2ef37f28266f97bdf09ced4e"}}
```

**Goal.** Maintainers and agents checking font-dependent dashboard layout in
`scripts/ci-container.sh` see the hosted Ubuntu runner's fallback-font layout
before publishing. The diagnostic image should expose the two narrow-width
failures in [DD-435](../../ProjectFindings.md#dd-435), rather than require
each new layout spec to supply a wider substitute font.

**Scope.**

- Supply the hosted `ubuntu-24.04` runner's font families in the diagnostic
  image, with the normal dashboard font stack resolving to the hosted
  fallback. Compare against an identified hosted image's published font
  inventory; package presence alone does not establish browser equivalence.
- Demonstrate both DD-435 failures on their pre-repair revisions, without a
  spec font override, and a passing narrow-width journey on current trunk
  under the same diagnostic font setup. Observe font selection and overflow,
  so an unrelated historical failure cannot count as reproduction.
- Extend `tests/ci-container.sh` to protect the hosted font-set contract and
  document its source and refresh procedure. Keep font changes in the image
  recipe so they invalidate its existing cache key.
- Retain the existing Verdana overrides: they still exercise wider text on
  native macOS. Container acceptance separately observes the application's
  normal font stack, without those overrides. Removing them is not needed
  to deliver the image correction.
- Preserve the diagnostic helper's existing invocation, native architecture,
  runtime/path refusals, user identity, checkout mounts, and isolated npm
  volumes. Normal local tests and hosted CI continue using their native
  environments.
- Other hosted-only differences, architecture emulation, screenshot or
  pixel-identical rendering guarantees, dashboard CSS repairs, and the
  test-deadline sibling are outside this increment. Naturally equivalent
  layouts need not be rejected for harmless rendering differences.

**Key examples.**

1. With the diagnostic image's hosted fonts and the dashboard's normal font
   stack, the narrow-width check on `0332f824ae60b9741732ba2c83e0db505645a805`
   (parent of `4ad55b56d`) exposes DD-435's sideways overflow. This revision's
   spec is `dashboard/tests/intent-ci-proof.spec.ts`.
2. The same check on `d146a05d95f62810da79bf653e5f0f98fa58fefc` (parent of
   `68e5f52b3`) exposes the later sortable-header overflow, with no injected
   Verdana. Its spec is `dashboard/tests/intent/intent-ci-proof.spec.ts`.
3. Current trunk's repaired table passes the narrow and zoomed journey with
   the normal fallback in the font-corrected container; the retained Verdana
   regression also passes. A maintainer need not change the next layout spec
   to get that default font environment.
4. Removing a required hosted font from the image recipe fails the maintained
   font contract. Updating that recipe builds a differently tagged image,
   while the normal cached run and the existing refusal/isolation contracts
   continue working.

The completed image change, its contract check, and its observed historical
and current browser results are a useful safe stopping point. Runtime
availability and actual fallback equivalence need an early execution probe;
preparation does not claim those browser results have already been observed.
