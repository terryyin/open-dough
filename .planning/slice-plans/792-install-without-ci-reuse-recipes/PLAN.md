# Install without the CI reuse recipes

**Identity:** SEED-423#install-without-ci-reuse-recipes
**Source:** [Install without the CI reuse recipes](../../seeds/SEED-423-shrink-the-installed-distribution.md#install-without-ci-reuse-recipes)

## Goal and scope

A developer who installs or updates Open Dough no longer receives the opt-in
CI reuse recipes. The five `ci-reuse-*.mjs` scripts, the manuals `reuse-ci.md`
and `custom-reuse-ci.md`, their payload declarations, the guidance that links
to them, and the tests and test data that exist only for them are removed.
Every other CI behavior is unchanged, including the integrated-state journeys
that today borrow the recipe's runnable adapter.

Excluded: the custom CI adapter interface
([next story](../../seeds/SEED-423-shrink-the-installed-distribution.md#install-without-the-custom-ci-adapter)),
`not_required` path applicability, the Dashboard, and any retirement
mechanism for dropped files. This repository's own installed copies under
`.claude/skills` and `.agents/skills` change at the next release update, not
in this story.

## Decisions and existing owners

- **Retirement already exists.** `dough-update` deletes installed files a
  release drops; `27c47b235` (Update Open Dough guidance to 0.3.111) removed
  `ci-observer-stream.mjs` and `retained-artifacts.mjs` from the installed
  skills that way. Add nothing for it.
- **Integrated-state keeps its proof with a test-owned adapter.** The
  integrated-state journeys (`ci-integrated-state-*.test.mjs`) and the
  wrap-up cases (`closure-story-integrated-state-cases.mjs`,
  `trunk-closure-integrated-state-cases.mjs`) run
  `ci-reuse-custom-example.mjs adapter` as the project's `ciAdapter`, import
  its `customAdapterResponse` and `discoveredAttempts`, and build their
  covered check commands through `createReuseCheckCommands`,
  `ignoreInstalledSkills` and `makeMe.aCiReusePolicy`. They prove integrated
  state, not reuse. Give them a test-owned command adapter that schedules and
  runs covered commands and answers discovery, with no reuse gate or reuse
  policy. Keep each test-support file under the 250-line limit by
  responsibility.
- **Shared CI code stays.** `ci-revisions.mjs` and `ci-github-actions.mjs`
  keep every export that a remaining caller uses; drop only exports left
  without one.
- Apply [`dough-makeme`](../../../.agents/skills/dough-makeme/SKILL.md) when
  removing builders from `ciMakeMe.mjs` and building the adapter's test data.

## Decisive premises

| Consuming operation | Observation and result |
| --- | --- |
| Integrated-state and wrap-up journeys need no reuse decision from the adapter | Scratch edit in this workspace at `327c59cd9`: `ci-reuse-custom-example.mjs` target scheduling skipped the gate (`if (false && mode === "target")`), so every attempt ran its commands. `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES node --test` over `ci-integrated-state-{custom,journey,replaced-basis,ineligible,stop}.test.mjs`, `dough-story-wrap-up/closure-story-integration.test.mjs` and `trunk-closure.test.mjs`: 34 tests, 34 pass. Control with the same edit: `ci-reuse-custom-journey.test.mjs` 11 tests, 9 fail, so the edit disabled reuse. Edit reverted. |
| No project calls the recipes | `git grep -E 'ci-reuse\|reuse-ci'` in the tracked files of Doughnut, Pygardon, Terry Talks, Lizard and Clipboard at their 2026-11-23 checkouts under `~/git`, excluding installed skill directories: no match. In Open Dough, the only callers outside the recipes are the guidance links, the payload declaration and tests listed above. |
| Dropped installed files leave client installs on update | Cited retained observation: `27c47b235` deleted the earlier dropped scripts from both installed skill roots through `dough-update`. |

## Slices

### 1. Integrated-state journeys run against a test-owned custom adapter

Type: Structure
Status: done

Move the integrated-state journeys and wrap-up cases off the recipe: a
test-owned adapter (the journal, scheduling, `customAdapterResponse` and
`discoveredAttempts` without the gate) and covered check commands built
without `aCiReusePolicy`. `ci-integrated-state-custom-test-fixtures.mjs` and
`ci-integrated-state-journey-test-fixtures.mjs` import nothing from
`ci-reuse-*` files. External behavior is unchanged. Enables slice 2, which
can then delete the recipe and its fixtures without losing integrated-state
proof.

**Proof.** The 34 cases named in the first premise pass with
`bash scripts/test.sh` over the same seven test files. A search shows no
`ci-reuse` import or path in integrated-state or wrap-up test files.

**Accepted.** The test-owned adapter is `ci-custom-command-adapter.mjs`,
installed by `ci-integrated-state-custom-provider-test-fixtures.mjs`; covered
commands come from `ci-check-command-test-fixtures.mjs`. After the refactor,
the seven files plus the traced `customProvider` consumers
(`ci-background-{lifecycle,handoff}`, `ci-reuse-{resource,trunk}-journey`)
passed 56 of 56; the recipe-side consumers passed earlier, 41 of 41.

### 2. A fresh install and an update carry no CI reuse recipe

Type: Behavior
Status: done

Pre-condition: the release source with this story. Trigger: install, or
update a project installed from the previous release. Result: no
`ci-reuse-*.mjs` script and no `reuse-ci.md` or `custom-reuse-ci.md` manual
under `dough-execute-plan`. `ci-monitor.md`, `custom-ci.md` and
`wrap-up-closure-publication.md` link to no reuse guidance, and no installed
guidance or script names `ci-reuse` or `reuse-ci`. GitHub Actions and custom
adapter observation are unchanged.

Remove the scripts, manuals and their lines in
`src/install/open-dough-execution-payload.sh`; the guidance paragraphs; the
`ci-reuse-*` tests and fixtures, `installed-ci-reuse-fixture.bash`,
`ciReusePolicyTestData.mjs` and its `ciMakeMe.mjs` properties; the reuse
paragraph of `Distribution/tests/ci/ci-test-data.md`; and
`assert_installed_ci_reuse` in `execution-payload-update.sh`. Drop exports in
shared CI code left without a caller.

Slice 1 left two `ci-reuse-*` re-export shims
(`ci-reuse-check-command-test-fixtures.mjs`, `ci-reuse-journey-test-fixtures.mjs`)
for the recipe's own tests; delete them with those tests. Then strip from
`ci-check-command-test-fixtures.mjs` what only reuse fixtures use: the `labels`
parameter and its defaults, the covered script's `DOUGH_CI_DIRECT` line,
`targetOnlyCommand` and `runTargetOnly`. `ci-reuse-resource-journey.test.mjs`
and `ci-reuse-trunk-retention-cases.mjs` also use `customProvider`; they go
with the recipe, while `ci-background-test-fixtures.mjs` keeps it.

**Proof.** `execution-payload-update.sh` asserts the updated install lacks the
recipe scripts and manuals and still passes its other installed-runtime
checks. `payload-declaration-links.sh` and `install-public-payload.sh` pass.
`git grep -E 'ci-reuse|reuse-ci' -- Distribution src install.sh` returns
nothing. Slice 1's integrated-state cases stay green. The consumer trace with
`--term ci-reuse --term reuse-ci --term aCiReusePolicy` shows every reached
consumer run or removed.

**Accepted.** The update check finds no `*reuse*` file in either installed
`dough-execute-plan` root; the same predicate finds the seven recipe files in
the earlier installed layout. All 28 installation scripts passed. After the
refactor, twelve integrated-state, judge, background and wrap-up files passed
72 of 72, and the moved `anIntegratedStatePolicy` and `anAnsweredCiRun`
builders' dashboard consumer passed. `runtime-setup.md` also lost its reuse
clause.

## Verification and delivery

- Local gate follows the [macOS sleep guard](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Run from the owned checkout under `caffeinate -s -i` on AC. On battery,
  plug in, or start fully awake with the lid open under `caffeinate -i` and
  inspect the sleep log. Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
- Use Node from `.node-version`. Run focused checks with
  `bash scripts/test.sh <paths>`: the seven integrated-state and wrap-up test
  files, `Distribution/tests/installation/`, and every test the consumer
  trace reaches. Run the installed
  [consumer trace](../../../.claude/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  against each slice's diff.
- Refactor and verify at each slice boundary through the installed
  [execution workflow](../../../.claude/skills/dough-execute-plan/SKILL.md).

## Readiness review

Dedicated slice-plan refinement was not needed. Slice 1 is the only
preparation slice 2 needs, and slice 2 is one removal with one install
proof. This review found no remaining slice-specific concern.
