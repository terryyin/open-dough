# Invoke Dough Intent Coverage manually across test mixes

**Identity:** SEED-258#invoke-intent-coverage-manually

**Source:** [Selected story](../../seeds/SEED-258-dough-intent-coverage.md#invoke-intent-coverage-manually)
**Source review:** [Source commitments](source-review.md)

## Execution context

- Story Branch Mode in the dashboard-assigned linked worktree on
  `codex/invoke-dough-intent-coverage-manually-across-tes`. `origin/main` is
  the integration target. `origin`'s execution branch receives each slice.
- Publisher `dashboard-territory.local-open-dough`, agent `viktor-chan`,
  starting revision `915e70ae51a823ad5a7cbb82f9c1fb05b0090a0e`, and confirmed
  claim and first publication base `fd3c598112daf1871eb788afd4ac8d08b50c9131`.
- Codex observer `viktor-seed258`, GitHub Actions `ci.yml` (CI) on the
  execution branch of `terryyin/open-dough`, mailbox
  `/tmp/dough-ci-501/watch-iouCtG`, PID `36703`, session `97985`, cell `12`.

## Goal and boundaries

Deliver a manually invoked skill for one targeted scratch break check
during ordinary review. A developer identifies an important story promise
and can see whether an existing assertion catches one plausible fault.
Return the evidence and its cost to the caller. The caller owns persistence.
Test repairs, broader assessment, and automatic wrap-up are separate work.
[Terry's Narrow decision and pilot evidence](../../seeds/SEED-258-dough-intent-coverage.md#terrys-decision).

## Current decisions

- Author one shared Proposed skill at `src/skills/dough-intent-coverage/`.
  Use the project's recorded intent, maintained test commands, and scratch
  checkout conventions. The [execution retrospective](../../../src/skills/dough-execution-retrospective/SKILL.md)
  reviews story outcomes, [manual testing](../../../src/skills/dough-manual-testing/SKILL.md)
  plans exploratory observation, and [test optimization](../../../src/skills/dough-test-optimization/SKILL.md)
  measures suite performance. The selected check has its own result at the
  existing assertion boundary. Share its instructions across both examples.
- Report one of three observations. The intended assertion caught the
  fault, the assertion passed despite verified wrong behavior on its path,
  or the check could not establish either result. Cite the promise,
  revision, fault, fixture, assertion, observed reach, and restoration.
  Follow the [North Star cost direction](../../NORTH-STAR.md#intent-assessment-results-carry-their-cost)
  for elapsed time, test runtime, and supported effort evidence.
- Keep runtime instructions local to the project where the skill runs.
  Use a disposable tagged candidate to exercise installation. The maintainer
  selects promotion after review, and public availability follows the
  ordinary versioned release of the whole payload.
  [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) ·
  [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md) ·
  [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
- Use fresh native invocations to verify the skill's behavior. Reuse the
  representative installer and host evidence where the same mechanism
  applies. Record justified reuse for Codex, Cursor, and Claude Code and
  cover any remaining material host risk before release.
  [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md).

## Outside-in proof

| Promise | Owner | Required observation |
| --- | --- | --- |
| A targeted check in a browser and unit test project | Slice 2 | A fresh installed invocation in Open Dough selects the waiting-then-available Landed promise and one plausible fault. Compare its baseline, assertion failure, and restored pass with the focused run and trace. Check that the finding applies to the browser journey exercised. |
| Evidence limits | Slice 2 | In the representative behavior review, walk a missing story source, a failing baseline, an unreached assertion, and a green run with independently verified wrong behavior. Verify the request for the source, the stop on a failing baseline, the insufficient-evidence result for unreached behavior, and the reported gap when wrong behavior was observed. |
| Returned result and cost | Slices 2 and 3 | The result includes elapsed time, test runtime where observed, effort where supported, units, basis, and evidence labels. Unavailable figures are explicit. Compare the scratch diff before and after the invocation and verify that the result is returned to the caller. |
| The same check transfers to another stack | Slice 3 | A fresh installed invocation in Lizard uses the focused Nix and pytest case. The baseline passes, the duplicate-detector extension assertion catches the fault, and the restored run passes. The report identifies the extension boundary it observed. |
| Managed delivery | Slice 4 | Installer and update checks deliver the promoted standalone files through both managed roots. |

## Decisive premises

| Consuming operation | Observation | Result |
| --- | --- | --- |
| Slice 2's targeted browser check at Open Dough revision `1359d6fb76b8ff2b4295e2b4febe0e467ec72be1` | The 2026-11-07 pilot used the locked Playwright setup and `npm run test:dashboard -- --workers=1 --reporter=list 'intent-ci-comparison-cancelled-landing-gaps\.spec\.ts' --grep 'at the read trunk head waits'` in an isolated checkout of that revision. [Focused runs and trace](https://github.com/terryyin/open-dough/blob/72e0c2f318a4283bff32acd5767a27ecaa576ba8/.planning/slice-plans/498-compare-manual-intent-coverage/assessment-254.md#focused-runs). | Treating the waiting answer as immutable reached the second comparison and failed the assertion for the new Landed result. The restored edit had an empty diff and the identical test passed. |
| Slice 3's targeted pytest check at Lizard revision `32b61f5eb9b2e8d72c5e748d02b074e18e9a9dc4` | On 2026-11-08, ran `nix develop -c python -m pytest -q` with node ID `test/test_extensions/testDuplicateDesignatedInitializers.py::TestDuplicateDesignatedInitializers::test_designated_enum_initializer_table_is_not_duplicate` in an isolated clone at that revision. Temporarily reduced `_counts_as_data` to count literals alone. | The baseline passed. The edited run reached the empty-list assertion and reported a false duplicate block for consecutive rows. The restored file had an empty diff and the identical test passed. |
| Installer fixture and fresh native invocation for Slices 2 and 3 | On 2026-11-08 the maintained wrappers' `--list` reported the isolated update and fresh-use route for Codex, Cursor, and Claude Code. The deterministic declaration, install, and added-skill update checks passed at preparation revision `169b8b8ac`. | Slice 1 owns the remaining authenticated invocation probe. Slices 2 and 3 then exercise the new candidate and its returned result. |

## Slices

### 1. Establish authenticated native invocation

Type: Behavior

Status: done

Proof: In an isolated project, a fresh native session invokes an installed
representative skill and produces its expected result.

Use the maintained [native delivery wrappers](../../../tests/native-adr-awareness-wrappers.md#delivery-wrappers)
or retained observations that cover the chosen host profile. Where trust,
login, or permissions still need observation, run one disposable check
before authoring. If the profile refuses, record the specific blocker and
hold dependent slices until the route is available.

Accepted native observation on 2026-11-08 (local time), with AC power:

```sh
caffeinate -s -i bash tests/dough-adr-awareness-codex-delivery-to-use.sh --native --case delivery/updated-use --results-dir /tmp/dough-seed258-native.sjfrLgaV --deadline 240
```

Codex CLI 0.167.0 passed the maintained assessor. The update transitioned
v0.2.1 to v0.2.2 on the same disposable target, preserving source and
companion data. A distinct fresh session read the installed `.agents/skills`
skill and both authority records, cited the conflicting ARC-12 statuses,
and stopped for the human decision. The target and source snapshots were
unchanged by fresh use. The retained replay attempt is
`tests/fixtures/native-streams/codex/delivery/updated-use/20261107T235610-0195`.
This establishes the current authenticated Codex route. The new skill's
behavior is owned by the next two slices.

The fixture's streams, stage responses, and ordered command expectations
replayed successfully with `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash tests/native-stream-replay.sh`.
`caffeinate -s -i node --test tests/support/native-host-stream.test.mjs`
passed six reader tests. Independent refactor review found no changes needed.

### 2. Return one targeted check in Open Dough

Type: Behavior

Status: planned

Proof: A fresh invocation returns the targeted browser result and its cost.
Compare it to the pinned story, fixture, assertion, and baseline, broken,
and restored runs.

Write the Proposed skill and do the [representative behavior review](../../../AGENTS.md#behavior-review).
Use the [release fixture](../../../tests/helpers/release-fixture.bash) to
build and install a disposable tagged candidate into isolated Open Dough at
the pinned revision. Supply the story, revision, and concern about the waiting
answer. Verify the result against the actual observations. Check restoration
and the evidence limits in the representative review. Keep the source
Proposed while the second example is pending.

### 3. Verify the same check in Lizard

Type: Behavior

Status: planned

Proof: A fresh invocation uses Lizard's maintained test setup and returns
the result for the designated enum initializer promise with its cost.

Install the candidate in isolated Lizard at the pinned revision. Run the
focused pytest example and check that the result cites the extension path
reached and the restored pass. Use a different native host if doing so
closes a material delivery risk. Correct any project-specific assumption
exposed by this example in the shared instructions and recheck the Open
Dough result if the correction affects it.

### 4. Put the reviewed skill in the managed payload

Type: Behavior

Status: planned

Proof: Following maintainer promotion, the focused install and update
checks deliver the standalone skill through both managed roots.

Present the behavior and delivery evidence for maintainer selection before
editing `install.sh`'s `managed_files` declaration and the maintained
payload fixtures. Check that the resulting payload contains the skill's
runtime dependencies. The maintainer owns the separate release decision.

## Gates and refinement review

For payload changes, run
`npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh tests/update-adds-new-payload-skill.sh`.
Use focused project tests in the isolated probe checkouts. Start long runs
fully awake and use the maintained macOS
[sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos).
On AC use `caffeinate -s -i`. On battery start fully awake with the lid open
under `caffeinate -i` and inspect the sleep log afterwards. Broader hosted
checks follow the normal delivery path.

[Failing and flaky tests](../../../AGENTS.md#failing-and-flaky-tests) applies
as written.

Separate slice-plan refinement was unnecessary because native access, the
first check, its transfer, and managed delivery each have a distinct proof
boundary. The remaining authenticated observation is bounded by Slice 1.
