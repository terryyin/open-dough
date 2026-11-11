# Intent test reading preparation evidence

## Retained preparation observations

At `9779b93c1`, on 2026-11-11, the strict normal runner selected and passed 32
cases across the 16 files below. Inspected setup/observations are those files
and their existing comparison, history, source, recovery and follow-up owners.
This covers existing boundaries, not the future helper design or its benefit.
The literal command was:

```sh
caffeinate -s -i env OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-preparation-proof.json npm run test:dashboard -- tests/intent/intent-ci-comparison-adapter.spec.ts tests/intent/intent-ci-comparison-mounted-legacy.spec.ts tests/intent/intent-ci-comparison-mounted-units.spec.ts tests/intent/intent-ci-comparison-mounted-sort.spec.ts tests/intent/intent-summary-ci-proof-sort.spec.ts tests/intent/intent-read-recovery.spec.ts frontend-tests/intent-candidates-read-recovery.spec.ts tests/intent/intent-ci-status-kept.spec.ts tests/intent/intent-ci-wall-time-history-order.spec.ts tests/intent/intent-scope-timing-history-reading.spec.ts tests/intent/intent-code-browse-sources.spec.ts tests/intent/intent-purpose-case.spec.ts tests/intent/intent-story-changes.spec.ts tests/intent/intent-reading-place.spec.ts tests/intent/intent-ci-follow-up.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts --workers=1
```

The host had 16 logical CPUs, 48 GiB RAM and AC power. Load was 4.87 before the
32-case launch; concurrent work was visible, so the selection used one worker.
The strict transcript's `selectedCount` and terminal attempts both equal 32,
all passed with no retry (`/tmp/seed300-preparation-proof.json`, run
`c5dc48a3-6b5f-4d89-851c-fbec144ca45c`). Reuse this result while its covered
paths are unchanged; reconcile affected proof after a changed base.

A scratch replacement of the shared entry-table selector with a missing table
made both an integrated adapter case and a rendered legacy case fail at
`expectProofTableRows`: empty actual table versus caller-supplied expected
rows. This establishes that the shared reading path discriminates missing
semantics in both setups. The exact helper bytes were restored, with no
scratch product changes retained. The command was:

```sh
caffeinate -s -i npm run test:dashboard -- tests/intent/intent-ci-comparison-adapter.spec.ts tests/intent/intent-ci-comparison-mounted-legacy.spec.ts --grep 'done adapter|overall Counts and entry row' --workers=1
```

The restored rerun encountered a distinct 30-second integrated startup timeout
before comparison selection, while the page still said Reading published work.
No sleep occurred in its window. Host load was above 20 and SEED-287's explicit
pressure run was active. Its controller subsequently recorded all 20 pressure
workers joined at 08:09:36 UTC, with no remaining busy work. At the next launch,
load was 12.85 on 16 logical CPUs and the memory-pressure query reported 45%
free. This changed condition supplied the normal local profile for one bounded
diagnostic replay; it was not an unchanged retry until green.

Both restored cases passed with the same command and
`OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed300-reader-restored-normal-proof.json`.
The helper's bytes matched Git throughout the restored runs. No assertion,
timeout, production behavior or other owner's workload was changed. This
settles the normal local reading route, not stability under arbitrary external
pressure. Reuse the maintained headroom/sleep policy for future launches.
