# Slice 1 implementation return

Outcome: uncommitted collector/converter fixture conversion. No production changes. `fragment` / `fragmentOf` exports and the adapterFragment local wrapper are removed. Valid arranged fragments now call `makeMe.aCiProofFragment` with entry, part/of, attempt/revision, unit and counts visible. Runner wrappers delegate construction to `makeMe.aDashboardProofRecord`; only a thin adaptation of existing call-site facts remains. Fragment converter expectations now use literal independent values rather than the same builder as the arranged fragments. Negative and string durations, invalid units/identities, legacy JSON and malformed fragments remain explicit at test sites. Added explicit protection that an undeclared outcomes path under `dashboard/tests` stays legacy checks.

Owned files (all under src/skills/dough-test-optimization/scripts/): ci-proof-attempt.test.mjs, ci-proof-collect.test.mjs, ci-proof-duration.test.mjs, ci-proof-fragments.test.mjs, ci-proof-legacy-results.test.mjs, ci-proof-outcomes.test.mjs, ci-proof-test-fixtures.mjs, ci-proof-unit-declarations.test.mjs. Root's planning files are preserved and not owned by this return.

No new builder API needed: existing fragment/record builders already own the canonical shape. Removed duplicate duration-test CLI/temporary-dir harness construction in favor of existing ci-proof-cli-fixtures. No new domain representation, API, clock, schema, protocol, dependency or timeout change.

## Proof commands and terminal results

Run from /Users/terryyin/git/open-dough/.worktrees/make-ci-proof-evidence-test-setup-map-directly-t, Node24.21.0. Each completed exit0.

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh src/skills/dough-test-optimization/scripts/ci-proof-unit-declarations.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-units.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-units-cli.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-outcomes.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-fragments.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-legacy-results.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-collect.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-summary.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-duration.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-breakdown.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-breakdown-summary.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-attempt.test.mjs tests/support/ci-proof-actions.test.mjs src/skills/dough-test-optimization/scripts/ci-proof-breakdown-summary-cli.test.mjs tests/support/dashboard-ci-proof-units-read.test.mjs

env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" npm run typecheck:dashboard

env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/native-evidence-identity.sh

git diff --check
```

First selection comprises every 13 named slice-1 suite plus indirect changed-helper dashboard units reader and breakdown CLI. No filter selected fewer cases. The shared-record consumers are all selected: breakdown, breakdown-summary, fragments, summary, units, units CLI, duration, unit-declarations, ci-proof-actions and dashboard-ci-proof-units-read. CLI fixtures import only unchanged `revision`; their relevant summary, units CLI, duration and breakdown CLI consumers are included. No browser product or dashboard fixture imports this changed test helper.

Resource choice confirmed immediately before focused launch: local AC-powered Mac, load9.81, memory free52%; no known competing owned heavy run. Retained sequential one-job selection and caffeinate -s -i; no full suite, timeout override or sleeps. No failing/flaky observations occurred. Failure policy: AGENTS.md#failing-and-flaky-tests remains applicable through coordinator/final CI.

## Source commitment observations

- C07,C08,C14,C20,Q01,Q02: collector, attempt, duration and declaration tests arrange valid fragments via existing shared fragment builder. `ci-proof-collect` "two dashboard shards..." independently deep-equals the entire summary and checks absent duration; "missing part..." checks missing/ambiguous statuses and excluded counts. Production `summarize` remains the action under proof.
- C18,C26,C29,Q11: ci-proof-test-fixtures `playwrightRecord` / `locatedRecord` delegate to shared record builder; the consumers still call real `fragmentFromPlaywrightRecord` or CLI fragment. No recorded fragment substitutes for conversion. Existing builder satisfies needs without speculative methods.
- C41,C42,J01-J07: `ci-proof-unit-declarations` first test starts from a completed MakeMe-owned Playwright record and literal undeclared outcomes, checks independent case/legacy/checks/count tuples. `ci-proof-outcomes` new "an outcomes path never declares a unit..." explicitly covers dashboard/tests, dashboard/backend-tests and tests, all independently expected legacy checks. `ci-proof-units` "five cases..." uses a Playwright record under tests/check.test.mjs and checks case vs file, never six results. `ci-proof-fragments` partitioning test asserts every returned unit=case across dashboard and backend paths.
- J08-J11: `ci-proof-unit-declarations` "a fragment no declaration..." arranges case/file/legacy fragments via MakeMe, and independently asserts exclusions with source names and unchanged file and legacy statuses/counts. No relabeling.
- C43,C44,J12-J15,J20-J22: `ci-proof-collect` two-shard summary deep-equal includes runId41776408979, runAttempt2, revision a5b0489..., and both present parts; "missing part..." checks missing and ambiguous uncounted. `ci-proof-attempt` excludes earlier GitHub attempts, alternate adapter IDs and different revisions by independent notes and missing part. Adapter summary checks its exact identity and independently expected counts.
- C52,C53,C61,C62,C64: converter/collector/CLI calls stay real; builder calls only arrange stored fragments or starting proof records. Fragment builder uses production contract constructor; independent fragment/summary validator assertions remain. Legacy exact JSON, deliberate invalidity and raw outcomes/times text remain outside MakeMe.

A scratch before/after comparison loaded HEAD's original helper into /tmp/slice1-original-fixtures.mjs and compared wrappers on expected/unexpected/flaky/skipped/unfinished outcomes with zero, omitted and retry durations. Canonical JSON differs only by `run` added to unlocated records and `selectedCount` added to located records. Tests' existing record facts otherwise match. Eight real converter comparisons (one/two entries, byFile true/false, located/unlocated) returned identical fragments; no unit or time inference changed. The scratch comparison passed exit0. No durable test added that merely mirrors builder internals.

## Consumer trace and acceptance state

Installed trace command:

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout "$PWD" --base HEAD --term aCiProofFragment --term aDashboardProofRecord --term fragmentOf --term fragment --term locatedRecord --term playwrightRecord --term adapterFragment --term ci-proof-test-fixtures > /tmp/slice1-consumer-trace.md
```

The 731-line generated trace has a run or reasoned excluded disposition on every located row. Generic fragment-token matches, installed runtime copies, docs/configuration and unchanged shared-builder uses have no dependency path to the changed test-only helper. Shared helpers' actual importing suites and their concrete observations are enumerated above and ran. No changed contract consumers remain unrun.

Current source line counts and read-only Prettier projections are all <=250; largest projection ci-proof-collect233, duration232. No selective formatting, hook-owned lint, refactor pass, commit, push, plan evidence/status edit or observer operation performed. Root owns those boundaries. No uncovered slice-1 source commitments, untested changed consumers, unresolved failures or changed premises. Later story scopes remain for slices2-4.

## Coordinator acceptance

Source freshness unchanged at af23ca1e5ff11ef31378e45c175e4cfc9d49e8e1; incoming trunk changes only dark-theme preparation, no named sibling product change. Inspected converter, collector, declaration, attempt, duration and legacy setup/independent assertions and all actual fixture importers. Shared wrapper consumers are in the 15-path run; similarly named dashboard helpers have separate import paths and are unchanged. Canonical incidental record additions preserve real converter output. No gap identified.

Independent post-change refactor `/root/refactor_1`: none — already clean; ## REFACTOR COMPLETE. No edits or invalidated proof; whitespace/size checks passed. Final source freshness unchanged at af23ca1e5; named sibling disposition remains unchanged.
