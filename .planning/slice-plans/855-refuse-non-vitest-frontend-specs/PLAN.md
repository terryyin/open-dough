# Refuse frontend specs the Vitest-only runner would skip

**Identity:** SEED-413#refuse-non-vitest-frontend-specs

**Source:** [Refuse frontend specs the Vitest-only runner would skip](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#refuse-non-vitest-frontend-specs),
a retrospective correction of
[Run the entire dashboard frontend unit suite on Vitest](https://github.com/terryyin/open-dough/blob/2294ce3f9f4fa243024941f689e862ee01b7d0bf/.planning/seeds/SEED-413-renovate-dashboard-unit-tests.md#retire-legacy-dashboard-frontend-runner)
(completed plan at
[`2294ce3f9`](https://github.com/terryyin/open-dough/blob/2294ce3f9f4fa243024941f689e862ee01b7d0bf/.planning/slice-plans/800-run-the-entire-dashboard-frontend-unit-suite-on-vitest/PLAN.md)).

## Provenance

Plan 800 started at Take `e63a4f2f3`. Its slices are commits `5655c0b4`,
`d77259f3`, `1883db7c`, `17ea0bd5`, `0e2b7139`, `2314f92f`, `a46b574a` and
`5c0f75ed`. An independent outcome review of `e63a4f2f3..5c0f75ed` found
no correctness bug in product or runner code, and these residues.

## Findings

1. **Silent skip.** `dashboard/frontend.vitest.config.mts:43-45` keeps
   only `isVitestFile` specs, and `scripts/dashboard-group-run.mjs:110-125`
   and `:192-194` drop non-Vitest files when the group has no Playwright
   config. A frontend spec without a Vitest import is neither run nor
   listed, and CI stays green. Before the cutover Playwright ran it and it
   failed loudly. All 330 frontend specs import Vitest (observed at
   `906348957`), so nothing is skipped yet. The config comment at `:41-42`
   still names "the group's Playwright specs".
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
   `Distribution/tests/ci/ci-container.md:118` reads it by that name.
5. **Stale comments.** `dashboard/test-support/support/dashboardBuild.ts:23`
   names a static server, and `support/runnerConfig.mjs:28` names a mixed
   frontend run.
6. **One-consumer fixture module.** `support/frontendStoryReviewFixtures.ts`
   is a 10-line id table used only by
   `frontend-tests/review/story-review-details.spec.ts:5`, in the
   Playwright support directory.

## Preserved promises and constraints

- Keep plan 800's delivered outcome: the frontend group lists, filters,
  runs and publishes CI proof on Vitest alone, with no path to
  `@playwright/test`. The backend group's two-engine path, shards, proof
  labels and timing artifacts stay unchanged.
- `dashboard/frontend.vitest.config.mts` also holds a temporary hosted
  disconnect capture (`40d40ac51`, cutoff 2026-11-29) owned by its own
  diagnosis. Leave it as trunk has it when this work runs.
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
Status: done

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
Status: done

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
- Run long macOS gates on an awake machine on AC power with `caffeinate -s -i`.

## Execution context

- Story Branch Mode uses the established worktree and publishes increments to
  `origin/refs/heads/codex/refuse-frontend-specs-the-vitest-only-runner-wou`.
  The Take and first published base are `3e9f40ab1ddfbdc19c4593dbb2e6d31326401894`.
  Trunk integration targets `origin/refs/heads/main`.
- Branch CI source is GitHub Actions `ci.yml` for `terryyin/open-dough`.
  Codex observer `maria-chan-855` uses `/tmp/dough-ci-501/watch-v2A8i1`,
  PID `19370`, session `23218`, cell `g627:8`.
- The locked npm installation, Chromium prerequisite and frontend listing all
  passed in the execution checkout.

### Slice 1 accepted proof

- Before the change, list and run silently accepted a scratch non-Vitest spec
  with `--pass-with-no-tests`, and the no-match `--retries` command exited 0.
- After the change, the same list and run exited 1 and named the spec. A
  listing selecting both that spec and a valid one emitted only the refusal.
  The unsupported option exited 1 naming `--retries`. A valid empty selection
  exited 1, or 0 with `--pass-with-no-tests`.
- Direct Vitest file discovery listed the scratch spec. The backend group
  passed `runner-ownership` and listed both engines in a mixed selection.
  A native-only list accepted `--retries=0`. Distribution shard and group
  checks and dashboard typecheck passed. The independent refactor pass found
  no changes needed.
- Slice 1 was accepted on the story branch at
  `a406894e2aa56de31304653464b7730390c570c0`.

### Slice 2 local proof

- The four backend `runner-ownership` cases and three mounted frontend
  `story-review-details` cases passed at first attempt. The seven focused
  Distribution CI-structure files and dashboard typecheck passed.
- A deliberately failing scratch Vitest case kept its `vitest.json` under
  `dashboard/frontend-tests/test-results/`. Both shard inputs in the actual
  reusable workflow resolve to that path under `dashboard-frontend-failure-output-1`
  and `dashboard-frontend-failure-output-2`. The independent refactor pass
  found no changes needed.

### Slice 2 hosted proof

- [Branch CI run 45825587181, attempt 1](https://github.com/terryyin/open-dough/actions/runs/45825587181/attempts/1)
  passed for `370efdc845e45530cd1ba4519b8a4d16180ccdac`, including lint and
  typecheck. Both frontend shard jobs executed the browser suite, kept per-spec
  timing, published proof fragments and ran the renamed upload step.
- GitHub retained both `dashboard-frontend-times-*` files and both frontend
  proof fragments for attempt 1, plus the consolidated CI proof summary and
  frontend test proof. Retained diagnostics included
  `dashboard-frontend-failure-output-1`, all three backend `failure-output`
  artifacts and all six E2E `failure-output` artifacts.
