# Refuse frontend specs the Vitest-only runner would skip

**Identity:** SEED-413#refuse-non-vitest-frontend-specs

**Source:** [Refuse frontend specs the Vitest-only runner would skip](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#refuse-non-vitest-frontend-specs),
a retrospective correction of
[Run the entire dashboard frontend unit suite on Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-frontend-runner)
(plan 800, completed on `claude/run-the-entire-dashboard-frontend-unit-suite-on`).

## Provenance

Plan 800 started at Take `e63a4f2f3`. Its slices are commits `5655c0b4`,
`d77259f3`, `1883db7c`, `17ea0bd5`, `0e2b7139`, `2314f92f`, `a46b574a` and
`5c0f75ed`. An independent outcome review of `e63a4f2f3..5c0f75ed` found
no correctness bug in product or runner code, and these residues.

## Findings

1. **Silent skip.** `dashboard/frontend.vitest.config.mts:28-30` keeps
   only `isVitestFile` specs, and `scripts/dashboard-group-run.mjs:119-125`
   and `:192-194` drop non-Vitest files when the group has no Playwright
   config. A frontend spec without a Vitest import is neither run nor
   listed, and CI stays green. Before the cutover Playwright ran it and it
   failed loudly. Every current frontend spec imports Vitest, so nothing is
   skipped yet. The config comment at `:26` still names "the group's
   Playwright specs".
2. **Option ignored on an empty selection.** `dashboard-group-run.mjs:192-194`
   returns `noTests` before the native-option check at `:196-205`.
   `-- --retries 2 nomatch --pass-with-no-tests` exits 0 without refusing
   `--retries`, which a non-empty selection refuses.
3. **Duplicated runner kind.** `groupRunnerExamples.ts:4-12` adds `direct`
   and `project`. `direct` restates the absent `config` in
   `browserTestGroups.mjs:36-41`. `runner-ownership.spec.ts` branches on
   `runner.direct` at `:41`, `:86`, `:98` and `:131`.
4. **Failure output named a Playwright report.**
   `.github/workflows/browser-test-group.yml:183-191` uploads Vitest
   screenshots for `dashboard-frontend` as `<group>-playwright-report-N`,
   and its comment describes an HTML report.
5. **Stale comments.** `dashboard/test-support/support/dashboardBuild.ts:23`
   names a static server, and `runnerConfig.mjs:28` names a mixed frontend
   run.
6. **One-consumer fixture module.** `support/frontendStoryReviewFixtures.ts`
   is a 10-line id table used only by
   `frontend-tests/review/story-review-details.spec.ts:5`, in the
   Playwright support directory.

## Preserved promises and constraints

- Keep plan 800's delivered outcome: the frontend group lists, filters,
  runs and publishes CI proof on Vitest alone, with no path to
  `@playwright/test`. The backend group's two-engine path, shards, proof
  labels and timing artifacts stay unchanged.
- Keep the `No tests found` / `--pass-with-no-tests` policy for an empty
  selection.
- Follow [Plain Vitest for unit tests; Playwright only for E2E](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Keep default test timeouts and never use `test.slow()`.
- Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  as written.

## Current decisions

- A group without a Playwright config refuses any selected non-Vitest spec
  by path, with a nonzero exit, rather than filtering it out. The frontend
  Vitest config includes every group spec.
- The native-option check runs before the empty-selection policy.
- `direct` is derived from the group roster's `config`, so the runner kind
  is written once.
- The failure-output artifact takes a runner-neutral name for every group.
  CI consumers that read it by name change with it.
- Move the review id table into the spec that uses it.

## Slices

### 1. The frontend group refuses a spec it cannot run

Type: Behavior
Status: planned

Behavior: a frontend spec without a Vitest import, or a frontend
selection with an unsupported option and no match, → the group command
names the refused spec or option and exits nonzero (findings 1–2).

**Proof.** A scratch non-Vitest spec under `dashboard/frontend-tests/`
fails the group command by name in listing and run, and passes nothing
silently. `-- --retries 2 nomatch --pass-with-no-tests` is refused. Empty
selections keep exit 1, or 0 with `--pass-with-no-tests`. Run the
`runner-ownership` backend spec and the Distribution browser group tests.

### 2. The runner kind and failure output are named once

Type: Structure
Status: planned

Derive `direct` from the roster (finding 3), rename the failure-output
artifact and its comment with its readers (finding 4), fix the stale
comments (finding 5), and move the review id table into its spec
(finding 6).

**Proof.** Typecheck and lint pass. `runner-ownership`,
`story-review-details` and the Distribution CI-structure tests pass.
Branch CI uploads failure output under the new name and keeps both
frontend shards, timings and proof publication.

## Verification and delivery

- Run focused gates through their maintained runners; slice 2's branch CI
  checks the workflow rename.
