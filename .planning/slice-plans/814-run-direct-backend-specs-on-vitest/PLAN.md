# Run the backend specs that already call production code directly on Vitest

**Identity:** SEED-413#run-direct-backend-specs-on-vitest
**Source:** [direct specs story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#run-direct-backend-specs-on-vitest)

## Goal and scope

Move the Playwright-selected backend specs that already enter production
code directly to the Node Vitest engine by one scripted rewrite of their
engine import. A spec qualifies when it sits outside `usage-history/`,
takes no Playwright fixture, starts or mounts no server, reaches no
`@playwright/test` import at runtime, and passes on Vitest under the
default timeout with only that rewrite. Cases, assertions, arrangement
and production entries stay unchanged. Specs that fail a condition stay
with the [later families](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families);
the usage family moves with the
[typed importer story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#prove-usage-import-through-typed-importer).

## Current decisions

- Follow the North Star for [plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  and [directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support):
  the rewrite adds nothing to `dashboard/test-support/`.
- The rewrite is one disposable script, kept outside the repository. For
  each file in [`direct-cohort.txt`](direct-cohort.txt) (paths under
  `dashboard/backend-tests/`) it replaces the `expect` and `test` import
  from `test-support/support/pageTest.ts` with one from `vitest`, turns
  `test.describe(` into `describe(` and `test.beforeAll`, `test.afterAll`,
  `test.beforeEach` and `test.afterEach` into Vitest's hooks, and removes
  `test.describe.configure(...)` lines. Vitest already runs a file's
  cases in order.
- The cohort list is the trial's result at `4283cb8d4`. Regenerate
  membership at execution: drop a listed spec that changed entry since,
  and add no spec the conditions do not cover.
- A spec that fails on Vitest after the rewrite returns to Playwright
  unchanged and stays in the later families' inventory. Apply the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to a case that passes on one engine and fails on the other for a reason
  other than the timeout: it is a defect to explain, not a spec to skip.
- Apply the same fallback when the engine import alone fails the required
  typecheck or lint. Keep the original cohort file as the baseline denominator
  and verify the final engine for every file.
- Keep the default Vitest timeout. A case near it is listed under
  premises; one that exceeds it locally or in CI leaves the cohort.

## Decisive premises and baseline

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| The listed specs pass on Vitest with only the engine import changed | Slices 1–3 run them through `backend.vitest.config.mts` | At `4283cb8d4`, 24 November 2026, Node 24.21.0, macOS, load average about 27: scratch rewrite of 207 fixture-free specs, `npx vitest run` with a scratch config of the same `environment: "node"` and disposable home, `--maxWorkers 4` | 164 files and 596 of 667 cases passed in 4 min 40 s; all 76 listed files passed, none reaching Playwright or server-starting support through imports |
| The maintained runner selects a rewritten spec for Vitest and runs it | Every slice's `npm run test:dashboard:backend -- <files>` | Same revision: scratch rewrite of `configuration/notifier-setup` and `configuration/project-input`, `npm run test:dashboard:backend -- notifier-setup project-input --workers=2` | Both listed under Vitest; 9 cases passed, 1 platform skip |
| No listed case needs more than the default timeout | Slices 1–3 under the 5 s default | The trial's case times | Three `configuration/notifier-setup` cases ran 3.5–4.3 s under that load; every other listed case ran under 2.5 s |

The scratch config differed from the maintained one only in its include
list, so the first row needs no rerun before execution. The trial ran
under unusual load; slice 1 measures the baseline on comparable
conditions.

Trial failures outside the list, for the later families: 29 files
exceeded the default timeout, 6 call `test.beforeAll` inside support that
still imports Playwright, and the rest reach a server through
`sharedReads.ts`, `acceptedAttempts.ts`, `serverTimeControls.ts`,
`launchLanding.ts` or `proofRecordRun.ts`.

## Slices

### 1. Intent's direct specs run on Vitest

Type: Behavior
Status: done
Proof: the backend runner lists the qualifying `intent/` files under the Node engine and the original 29 files' cases pass

Before editing, run the whole list on Playwright with a proof record and
keep per-case times as the baseline:
`npm run test:dashboard:backend -- $(sed 's|^|backend-tests/|' direct-cohort.txt) --workers=2`.
Write the rewrite script and apply it to the `intent/` entries. Run those
files through the runner. Behavior: a listed `intent/` spec on Playwright →
rewrite → the same cases pass under Vitest with unchanged assertions.

At `228ad3213`, the pre-edit runner passed all 296 cases
in the 76-file Playwright cohort in 23.095 s elapsed and 27.230 s summed
case time. The first Node Vitest run passed all 105 cases in the 29 Intent
files in 13.636 s, with matching file paths and expanded case titles.
The required linter then found Vitest's `expect.stringContaining` returns
`any` in two existing assertions. Keep `ci-comparison-client-identity.spec.ts`
and `ci-proof-memory-github-gaps.spec.ts` on Playwright so their assertions
keep their original form. The same 29-file selection passed all 105 cases
again after restoring the two files, with 97 cases on Node and eight on
Playwright.
The seven cases in `intent-shared-reads.spec.ts` ran in the same file
order. The runner's static listing counts parameterized declarations
once, so use the execution record for case parity. The checkout-bound
evidence directory holds `baseline.proof.json`, `slice1-run.proof.json`,
`slice1-fallback.proof.json`, and the shared disposable rewrite script.

### 2. Launch and session direct specs run on Vitest

Type: Behavior
Status: done
Proof: the runner lists qualifying `launches/` and `sessions/` files under the Node engine and all 30 original files' cases pass

Apply the script to those entries and run them. Check each file that used
`test.describe.configure` still passes when its cases run in file order.

The maintained runner passed all 136 cases with exact
baseline file and expanded-title parity. In the final selection, 27 files
and 115 cases ran on Node Vitest, and three files and 21 cases ran on
Playwright. Focused lint and Dashboard typecheck passed. None of these
30 originals used an explicit serial directive.

Two launch files stay on Playwright because the asymmetric matchers in
their assertions fail lint under Vitest. The direct backend subprocess in
`runner-ownership.spec.ts` also needs `agent-launch-options-rules.spec.ts`
on Playwright. With the specimen rewritten, its direct Playwright selection
reported `No tests found`. The runner-ownership case passed after its
restoration. See `slice2-final-run.proof.json` and
`slice2-runner-ownership.proof.json` in the execution evidence directory.

### 3. The remaining direct specs run on Vitest

Type: Behavior
Status: done
Proof: the runner lists the qualifying `configuration/`, `observation/`, `review/`, `runtime/` and `terminals/` files under the Node engine and all 17 original files' cases pass

Apply the script to the rest. Run `notifier-setup` three times; if a case
exceeds the default timeout, return that file to Playwright and record it
for the later families.
Check that the platform skip in `notifier-setup.spec.ts` also works under
Vitest with the prescribed rewrite before including it in the migration.

All 55 cases passed with exact baseline file and expanded
title parity. Node Vitest ran 50 cases across 16 specs. Playwright ran the
five notifier cases. The three `file-content-cache-budget.spec.ts` cases
ran in the same order after the serial directive was removed. The final
candidate passed focused lint and Dashboard typecheck.

The notifier's existing `test.skip(condition, description)` declaration
failed Dashboard typecheck under Vitest with TS2769. Restoring the original
spec preserved the macOS skip and made the timeout repetitions unnecessary
for the eligibility decision. See `slice3-candidate-typecheck.log` and
`slice3-run.proof.json` in the execution evidence directory.

### 4. The group reports the moved cohort and its times

Type: Behavior
Status: done
Proof: one full-list run through the runner on the baseline's conditions, with typecheck and lint green

Run the whole list again with a proof record and compare with slice 1:
file and case counts, summed case time, elapsed time, and every case
against the campaign's ~100 ms aim. Run Dashboard typecheck and lint.
Check `rg -l "@playwright/test|pageTest" $(sed 's|^|dashboard/backend-tests/|' direct-cohort.txt)`
returns nothing. Update the
[later families' recount](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-backend-unit-test-families)
with the runner's Playwright-selected count and any file returned to
Playwright. After publication, read the `dashboard-backend` shards' times
from CI; if one shard lost most of its share, use
[rebalance-ci-shards](../../../.claude/skills/rebalance-ci-shards/SKILL.md).

All 296 cases across the original 76 paths passed with
exact expanded file and title parity. Vitest ran 262 cases across 70
files and Playwright ran 34 cases across six byte-identical retained
files. The direct rewrite accounts for 67 specs and the sibling accounts
for the other three migrated cohort specs. The migrated paths contain no
Playwright import or `pageTest` reference. Dashboard typecheck and full
lint passed. [Per-case timing measurements](case-times.tsv).

At two workers with the macOS sleep guard and one-minute loads of 23–27,
paired command elapsed was 36.842 s on Playwright and 40.582 s after the
migration. Summed case time went from 37.308 s to 31.758 s, and cases over
100 ms went from 41 to 34. The original load-10 run took 23.633 s elapsed.
The paired baseline used a clean checkout of that same pre-edit revision.

The published product revision's backend shards ran in 191, 226 and 191 s.
Recent main medians were 188, 241 and 198 s, so each shard kept a similar
share. [Branch CI](https://github.com/terryyin/open-dough/actions/runs/45391759092).

## Concern evidence

Refinement was not needed: the four slices apply one rewrite rule to
disjoint file sets and each has its own runner proof. The slices are
split by folder only to keep each within its active-time limit and to
isolate a failing group. No remaining slice-specific concern was
identified.

The [landed CI attempt story](../../done/SEED-413_renovate-landed-ci-attempt-evidence.json)
integrated at `0e22b4b58` before slice 3 was published. It had already moved
`ci-proof-extraction.spec.ts`, `ci-time-without-adapter-runner-waits.spec.ts`,
and `ci-time-without-runner-waits.spec.ts` to Vitest and revised their setup.
The story-branch merge kept the exact landed versions. The focused runner
passed all 23 cases under Vitest in `slice3-sibling-proofs.proof.json`.
Those three files count toward the final cohort and the sibling owns their
test revisions.

## Story obligations

### G1. Two Intent specs require assertion edits to satisfy lint on Vitest

Reported: slice 1 — "Required ESLint rejects unsafe assignments from Vitest's `expect.stringContaining` in `ci-comparison-client-identity.spec.ts` and `ci-proof-memory-github-gaps.spec.ts`."
Story clause: "its cases pass on Vitest under the default timeout with only the engine import changed."
Disposition: excluded "Cases, assertions, arrangement and the production entry stay as they are."

### G2. Two launch specs require assertion edits to satisfy lint on Vitest

Reported: slice 2 — "Required ESLint rejects unsafe assignments from Vitest's asymmetric matchers in `launch-attempt-admission-close.spec.ts` and `settled-attempt-reconciliation.spec.ts`."
Story clause: "its cases pass on Vitest under the default timeout with only the engine import changed."
Disposition: excluded "Cases, assertions, arrangement and the production entry stay as they are."

### G3. One launch spec is a direct Playwright runner specimen

Reported: slice 2 — "`runner-ownership.spec.ts` exercises direct Playwright with `agent-launch-options-rules.spec.ts`. Rewriting it made the direct selection empty. Restoring it preserved the runner-ownership proof."
Story clause: "Move, by one scripted rewrite, every Playwright-selected backend spec outside `usage-history/` that meets all of these at execution"
Disposition: excluded "with only the engine import changed"

### G4. The notifier's Playwright platform-skip overload does not typecheck on Vitest

Reported: slice 3 — "Dashboard typecheck rejects `test.skip(condition, description)` in `notifier-setup.spec.ts` under Vitest with TS2769. The original Playwright spec passed all five macOS cases after restoration."
Story clause: "its cases pass on Vitest under the default timeout with only the engine import changed."
Disposition: excluded "Cases, assertions, arrangement and the production entry stay as they are."

## Verification and delivery

- Execution runs on `codex/run-the-backend-specs-that-already-call-producti`
  in the established worktree, with Story Branch Mode and `origin/main`
  as the integration target. The accepted Take is `228ad321390efff29dd145228fe0a50bcfc6e69c`.
- The Codex observer watches the remote story branch with `ci.yml`,
  coordinator `akiho-seed413-plan814`, directory `/tmp/dough-ci-501/watch-rCoPB7`,
  PID `52188`, shell session `84146`, and cell `g161:13`.
- Local gate: use the maintained [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)
  with `caffeinate -s -i` on AC power for the measured runs in slices 1
  and 4. Keep the default timeout and apply the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Run each slice's files with
  `env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR npm run test:dashboard:backend -- <files> --workers=2`
  and capture `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD`. The full
  backend group is not a local gate for this change: only the listed
  files change, and no support module or production code does. Hosted CI
  runs the group after publication.
