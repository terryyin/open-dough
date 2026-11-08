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
- Codex observer `viktor-seed258`, GitHub Actions `ci.yml` on the story branch
  of `terryyin/open-dough`. The pre-approval mailbox `watch-iouCtG` stopped.
  Resumed at `/tmp/dough-ci-501/watch-N0lv82`, PID `32615`, session `71230`, cell `g15:3`.
- Accepted slices 1–3: `db92104dbf589a9cc9e53f7e1fd067054371b984`,
  `761599d9271a6e250a0fb060e29baef918275e0c`, `502069a1586f416be0a801b883f91f635f206ab3`.
- CI run `42430795390/1` exposed a fresh CI-proof read replacing the Summary during a layout assertion. The test now waits for the existing request-settlement signal before the preserved assertions. Five focused Chromium cases passed.

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

Codex CLI 0.167.0 passed the assessor. Ordinary update on the disposable target
moved v0.2.1 to v0.2.2 and preserved source and companion data. A distinct fresh
session read the `.agents/skills` skill and both conflicting ARC-12 records,
stopped for the human decision, and left target and source snapshots intact.
Retained replay attempt:
`tests/fixtures/native-streams/codex/delivery/updated-use/20261107T235610-0195`.

The fixture's streams, stage responses, and ordered command expectations
replayed successfully with `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash tests/native-stream-replay.sh`.
`caffeinate -s -i node --test tests/support/native-host-stream.test.mjs`
passed six reader tests. Independent refactor review found no changes needed.

### 2. Return one targeted check in Open Dough

Type: Behavior

Status: done

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

Disposable v0.3.89 (`845ab2c4da805a00064edfde63bb99a93ec6b442`) installed
the same skill bytes in both roots. Fixture and evidence:
`/tmp/dough-seed258-open-dough.wM6r9G0t/`. The first invocation stopped before
the fault with **Insufficient evidence** because macOS `/bin/ps` hit `EPERM`
in historical teardown. A direct check cleared it with a narrow `/bin/ps`
exception. The retry kept the candidate, pin, and timeouts, using
`caffeinate -s -i /opt/homebrew/bin/bash /tmp/dough-seed258-open-dough.wM6r9G0t/probe-ps.sh`.

Fresh Codex read the installed skill and selected one Chromium case at
`1359d6fb76b8ff2b4295e2b4febe0e467ec72be1`.

```sh
caffeinate -s -i npm run test:dashboard -- dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts --grep 'waits for a later trunk build and uses it once pushed' --workers=1 --reporter=list
```

The baseline passed. Removing `awaitingLaterBuild` from the cache guard in
`dashboard/server/intentCiComparisonAnswers.ts:38–42` froze the waiting answer.
After the fixture served run 403 and proof, the assertion at
`dashboard/tests/intent/intent-ci-comparison-cancelled-landing-gaps.spec.ts:112`
received stale waiting text. The restored run passed and snapshots matched.
The report returned **Caught** for that browser path, with 152.5 s through its
final clock read, case runtimes of 8.4, 10.9, and 9.3 s, and unavailable active
effort. Independent elapsed through the response was 166.987 s.

Representative review walked missing source, failed baseline, unreached
assertion, and green assertion with independently observed wrong behavior.
The first invocation corroborated the baseline stop. The consumer trace found
no active wrap-up or dashboard integration for the Proposed source.

### 3. Verify the same check in Lizard

Type: Behavior

Status: done

Proof: A fresh invocation uses Lizard's maintained test setup and returns
the result for the designated enum initializer promise with its cost.

Install the candidate in isolated Lizard at the pinned revision. Run the
focused pytest example and check that the result cites the extension path
reached and the restored pass. Use a different native host if doing so
closes a material delivery risk. Correct any project-specific assumption
exposed by this example in the shared instructions and recheck the Open
Dough result if the correction affects it.

Early Cursor reports mislabeled pre-report clocks. Prose separated the cost
figures but left inconsistent clock sampling across hosts. The product search
found test and diagnostic timing with no owner for this report interval. A
local Node finisher measures elapsed after writing the prepared body. The
installer already uses Node for host hook registration.

Final private tag `v0.3.92`, commit `2f5118ec9fd90f93ed6eb4ebcf9975a642887326`,
installed byte-identical `SKILL.md` and `finish-report.mjs` through both
managed roots. Controlled finisher proof checked UTF-8 body preservation,
write completion before the end clock, measured arithmetic, and unavailable
results for missing and invalid start times.

Fresh Cursor `2026.11.05-86047df` at Lizard
`32b61f5eb9b2e8d72c5e748d02b074e18e9a9dc4` ran:

```sh
nix develop -c python -m pytest test/test_extensions/testDuplicateDesignatedInitializers.py::TestDuplicateDesignatedInitializers::test_designated_enum_initializer_table_is_not_duplicate -v --tb=short
```

Removing designator/value handling from `_counts_as_data` made the passing
`noah` fixture report a false duplicate block at line 47's empty-list assertion.
The restored run passed and all snapshots matched. Cursor returned the finisher's
**Caught** report scoped to the extension path, with 68.677 s through production,
0.14 s pytest runtime, and unavailable human and agent effort. Host elapsed
through delivery was 73.648 s. Evidence: `/tmp/dough-seed258-finisher.vPuFC5Vr/`.

Fresh Codex 0.167.0 rechecked Slice 2 with a short writable temp root and the
isolated `/bin/ps` exception. Chromium passed, failed on stale Landed waiting
text, and passed after restoration. Snapshots matched. The installed finisher
supplied 156.000 s through report production, with test runtimes of 9.3, 11.9,
and 9.6 s and unavailable human and agent effort. Host elapsed through delivery
was 172.535 s. Evidence:
`/tmp/dough-seed258-open-dough.wM6r9G0t/finisher-hTsycpA0/`.

Host delivery evidence uses this story's fresh Codex and Cursor invocations.
Cursor also has native `.agents/skills` discovery evidence at
`b721e14fa:.planning/quick/004-versioned-updates/PLAN.md` (Leaf 6). Claude
Code's ordinary update and fresh use at
`f7ab0e4:.planning/quick/032-refuse-managed-hook-command-variants/evidence/claude-update-use/README.md`
cover the same `.claude/skills` installation mechanism.

### 4. Put the reviewed skill in the managed payload

Type: Behavior

Status: done

Proof: Following maintainer promotion, the focused install and update
checks deliver the standalone skill through both managed roots.

Terry approved promotion after review. `install.sh` lists the two reviewed
paths individually, preserving its parsed declaration despite the existing
file-size overage. Fresh install and ordinary tagged update verified exact
bytes in both roots. All three gates below and the related all-tools,
latest-release, and guidance-payload checks passed with Bash 5 on AC.

## Execution complete

Product advice: no change. Keep the North Star cost direction and the
sibling wrap-up story. Public availability remains the consumer's release
prerequisite under ADR 0003.

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
