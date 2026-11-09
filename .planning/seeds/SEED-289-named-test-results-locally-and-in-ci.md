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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** Maintainers and agents running `scripts/test.sh` locally or in
  CI learn which job overran, instead of a silent job cancel or a hung local
  run that holds every worktree's whole-suite admission.
- **Evaluation.** A job that runs past its deadline is ended; the run fails
  naming that job and its elapsed time, still writes its timing and outcome
  files, and releases `refs/dough/local-test-suite`. In CI the same report
  appears before the job's `timeout-minutes`. Proof uses an observable event
  or a controlled clock, not a wall-clock wait.
- **Boundary.** The existing per-job and total budgets and their CI-only
  judgment stay as they are; changing a budget is a separate decision. The
  dashboard suite's existing deadline is out of scope.
- **Value / learning.** Turns DD-426's unnamed cancel and DD-476's 47-minute
  admission hold into one named failure.
- **Safe stopping point.** A deadline that names the job and releases
  admission locally is useful before the CI timing artifact is added.

<a id="match-hosted-fonts-in-ci-container"></a>

### Give the local CI container the hosted runner's fonts

**Identity:** SEED-289#match-hosted-fonts-in-ci-container
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** An agent checking a layout-measuring dashboard spec in
  `scripts/ci-container.sh` gets the hosted runner's result before publishing.
- **Evaluation.** In the container, the `intent-ci-proof.spec.ts:150`
  narrow-width check measures the hosted widths: it fails on the two
  pre-repair revisions DD-435 records (parents of `4ad55b56d` and of
  `68e5f52b3`, without the spec's Verdana override) and passes on current
  trunk. `tests/ci-container.sh` checks the font set against the hosted
  runner's.
- **Boundary.** Whether to remove the per-spec Verdana override once the
  container matches is decided in refinement. Other hosted-only differences
  stay out of scope.
- **Value / learning.** Removes a recurring CI-only failure class for each new
  narrow-width check.
- **Safe stopping point.** The image change alone, with its check, is
  complete.
