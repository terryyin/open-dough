# Build Done capture cases from MakeMe launch steps

**Identity:** SEED-413#fold-done-capture-launches-into-makeme
**Source:** [Build Done capture cases from MakeMe launch steps](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#fold-done-capture-launches-into-makeme)

## Goal and scope

Dashboard maintainers read the checkout, launch records and dated work as one
MakeMe scenario, then see the operation and the assertions at the call site.
Cover Default main, isolated and declaring launches, manually merged Done
branches, declared and reported publication, and quiet completion. Preserve the
real Git, retention, native-race and publisher observations that now protect
these cases. Each supplier owns its production seam, and the
[runtime target](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#optimize-done-capture-family-cases)
belongs to the subsequent optimization.

The seed records the four supplier agreements. Their delivered contracts are
the starting inputs. At execution start, map any renamed or relocated cases to
their current observers, review the delivered builder chain and capture the
post-supplier baseline. Use that baseline for the comparison and preserve any
supplier evidence that still covers the same boundary and assertion.

## Key examples and proof

| Scenario | Observer and owner |
| --- | --- |
| Work predating, overlapping or following a Default main launch | Real dated Git and typed review show which commits belong, their separate runs and the shared-checkout cue. Launch start records readable Git facts. Slice 1. |
| Work arrives around the Done cutoff or a record is removed | The captured tip and pending Done refusals come from the real operation under test. Deletion, expiry and repeated Done observe actual refs and the surviving record. Slice 2. |
| Default main declares a dirty worktree | Entry observes the recorded tip, tree, distinct Default main tip and retry. Review answers both comparisons. Foreign, wrong-branch and second-place requests retain their refusals and Cursor replacement retains entry ownership. Slice 3. |
| Isolated branch work, retirement and supersession | Saved commit and dirty tree remain independently reviewable. Missing and empty results differ. Held, newer and deleted Done operations retain their assertions on the actual pin set. Slice 4. |
| Manual merge before and after publication | Compare the saved dirty branch with the actual trunk resolution. Other-branch acceptance, unrelated changes, unobserved parents and squash leave their existing results and explanations. Slice 5. |
| Publisher has a declared or reported isolated branch | The installed entry prepares the exact pair that is accepted, records after Done, retries with the original launch and retains the correct file pair after retirement. Real cleanup still owns pin removal. Slice 6. |
| A quiet completion arrives while native Done is pending | Actual receipt and native rename ordering choose the kept commit run, with the existing resume, retry and previous-run assertions. Slice 7. |
| Setup is readable and imports are narrower | Review the launch and Done time at each meaningful call site, the one case value, the branch-entry spec's helper/import boundary, and the support import and lines comparison. Each slice retires its migrated setup, and slice 7 closes the comparison. |

## Decisions and existing owners

- Follow the [test support North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Dashboard domain ADR](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [improvement ADR](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Launch, repository and reporting values use their existing domain types.
  One plain case value holds the built checkout, named records, and stated
  timeline. A builder may arrange and materialize preconditions through the
  fixture. Keep product calls, expected observations, timers, test teardown
  and temporary machine-store effects at their existing boundaries.
- Extend the launch recipe layer returned by `makeMe.aLaunchRecord`, near
  `LaunchReviewedSessionBuilder`. Reuse `inDefaultCheckout`,
  `startingInDefaultCheckout`, `inIsolatedWorkspace`, `launchedAt` and
  the delivered evidence steps. The base `launchTestData.mjs` and
  `launchAttemptTestData.mjs` were already 250 lines at preparation. Keep
  launch recipes in the derived recipe layer and reuse the delivered attempt
  API. If a supplier reorganized a file, use the new owner and recheck the size
  of expected edits before working on it.
- Put the shared base history on `makeMe.aRepository`. Reuse its named
  revisions and `withWorkspace`, the existing local/origin materializers,
  and `aCheckoutWork` with `performCheckoutWork` for real dated operations.
  Resolve canonical worktree and common Git paths from the materialized
  fixture. Use a second named workspace for the branch mismatch cases and a
  separate real clone for the foreign-repository refusal. Expose any needed
  workspace path from the existing fixture without duplicating its layout.
- Keep a single explicit clock basis per case and retain relative order,
  including whole-second Git dates. Keep the shared history's stable base
  date. The branch of a started isolated session, the branch declared
  after Default main launch, and the branch accepted on trunk are separate
  existing facts in that same model. Reuse `aPublishedSource` for the
  explicit project/ref and `aSessionReviewRead` for typed review. Publisher,
  observation and quiet-report arrangements combine the same record and
  checkout with their own typed inputs.

## Decisive premises observed

Preparation base `7a66496f9df9`, 2026-11-20, this owned worktree, AC power,
Node 24.21.0, and `npm ci`. Prefix local commands here with
`caffeinate -s -i env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR`.
The backend command is `npm run --silent test:dashboard:backend -- --workers=1 <spec paths>`.
The slice rows supply the literal selector basenames (append `.spec.ts`).

| Consuming operation | Observation and result | Limit and consequence |
| --- | --- | --- |
| Current launch, Git and review inputs reach each family boundary | Ran the 28 paths listed by slices 1–7. At one worker all 75 cases passed in 136.18 s, including both timing cases below. At two workers 73 of 75 passed. | The one-worker profile reaches all current outcomes. Supplier evidence and the post-supplier rerun own changes to their input shape. |
| Initial dirty entry and Cursor expiry observe real pin effects (slice 3) | Branch-entry preparation at `9784452bd:.planning/slice-plans/735-propose-branch-entry-from-typed-inputs/PLAN.md` recorded the expected ref assertion failures with entry pinning or expiry cleanup bypassed, then both checks passed after restoration. The current branch-entry and Cursor specs also passed in this preparation. | Preserve those real actions and pin assertions in their delivered owners. |
| Manual merge and reported comparison both finish with native Git and the installed/typed entries (slices 5 and 6) | At two workers the first `ad-hoc-manual-landing` case and the `ad-hoc-session-comparisons` case hit 5 s. The one-worker diagnostic ran `npm run --silent test:dashboard:backend -- ad-hoc-manual-landing.spec.ts ad-hoc-session-comparisons.spec.ts --workers=1` with `GIT_TRACE2_EVENT` set. All 7 cases passed at load 17–18. The two cases took 3.68 s and 3.14 s. Git traced 425 top-level calls across the seven cases, with none exceeding 127 ms. | The passing serial run reaches the final text and rejection assertions. Parallel timeout margin remains a defect. At the post-supplier baseline, identify which timeout persists, then diagnose and repair it in the owning slice using the failure policy. Preserve assertions and the default timeout. |

## Slices

### 1. Dated Default main cases show which work belongs

Type: Behavior
Status: planned

Introduce the shared case arrangement through the existing MakeMe owners.
Migrate Default main and established-launch setups, naming start and Done
when those times determine the result. Keep the shared-checkout overlap and
separate sessions explicit. Use the launched-at fact when arranging the
pre-launch revision and work during and outside the session.

**Proof.** Run `default-launch-start-facts`,
`done-kept-session-commit-runs`, `done-kept-session-commit-rewrites`,
`done-kept-session-rebased-runs`, `done-kept-session-shared-checkout` and
`done-kept-session-unavailable`. Inspect the start, run, time-bound, shared
and absence assertions and the removal of preset imports.

### 2. Dated Done and record removal use the same Default main case

Type: Behavior
Status: planned

Arrange kept and pending captures from the case's records and timing. Call
the real capture, deletion or expiry where it owns the outcome, with its
fixture-local store. Keep the intervening Git work and removal observable.

**Proof.** Run `done-kept-session-commits`, `done-kept-commit-refs-release`,
`kept-commits-release` and `ad-hoc-session-commits-pending-done`. Verify the
tip cutoff, refusal, survivor and ref assertions.

### 3. A declaring launch names its worktrees in MakeMe

Type: Behavior
Status: planned

Use named worktrees with the established Default main case and explicit
entry facts. Move the four setup helpers out of the branch-entry spec by
composing preconditions through MakeMe and calling the supplier's proposal
or persistence entry at the point each variant proves. Retain the actual
dirty tree, canonical paths, repo mismatch and Cursor replacement.

**Proof.** Run `ad-hoc-session-branch-entry`, `ad-hoc-branch-entry-attribution`
and `ad-hoc-branch-cursor-recovery`. Keep the separate review pairs, rejection,
attribution and ref observations. Inspect the branch-entry spec for zero
local setup helpers and at most one case-builder binding from the old support.

### 4. Isolated launch cases show the recorded and working branch state

Type: Behavior
Status: planned

Reuse the case timeline with isolated launches and real branch commits and
working trees. Keep capture and retention operations in the cases that
prove them. Move setup verbs out of scope as their last caller migrates.

**Proof.** Run `ad-hoc-branch-attribution`, `ad-hoc-branch-result`,
`ad-hoc-branch-result-supersession` and `ad-hoc-branch-worktree-result`.
Keep ambiguity, empty/missing, retirement, supersession and pin observations.

### 5. A manual delivery case shows the merge and both Done times

Type: Behavior
Status: planned

Move the manual-landing presets and visible timeline onto the isolated
case, preserving real conflict resolution, publication and undo. Keep the
same before/after behavior and review pairs. Investigate any remaining
timeout with the post-supplier timing evidence before accepting this slice.

**Proof.** Run `ad-hoc-manual-landing`. Keep both distinct text comparisons,
the remote/ref restriction and all negative delivery cases.

### 6. Publisher cases share the launch and its reporting context

Type: Behavior
Status: planned

Use the delivered builders for a declared or reported isolated branch,
matching attempt, landing authority and context. Leave submission,
preparation, acceptance, retries and retirement at the entry that owns
each effect. Retire setup from the two publisher preset modules. Diagnose
any remaining comparison timeout in the post-supplier profile in this slice.

**Proof.** Run `declared-blank-launch-publication`,
`declared-worktree-publication`, `ad-hoc-prepared-landing-done` and
`ad-hoc-session-comparisons`. Observe the publisher's accepted pair,
exact retry, distinct file comparisons and pin release.

### 7. Quiet completion cases show the launch, receipt and Done sequence

Type: Behavior
Status: planned

Make the report and its dated launch and completion preconditions from
the same case. Keep the real native Done owner and the named rename
collaborator in the tests. Retire remaining setup from
`reportedDoneCase.ts` and `doneCaptureCase.ts` and check their last callers.

**Proof.** Run `ad-hoc-session-commits` and `ad-hoc-session-commits-done`.
Check the receipt-time capture, rename, reopen and retry assertions. Run
the family roster updated to the supplier-delivered homes and record the
import and line comparison.

## Local gates and review

- Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) to the selected
  backend specs and the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to every failure. Keep default test timeouts and never use `test.slow()`.
  On AC power use `caffeinate -s -i` under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Run `npm run typecheck:dashboard` for shared builder and consumed type
  changes. Re-run the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  over the changed code and retired symbols in each slice. Run all reached
  consumers, including shared fixture readers outside the family if their
  input changes. The pre-change trace over the old presets found the 28
  specs above and eight support files, including the installed publisher
  and review adapter. Those helpers are reached through those specs.
  Guidance links referencing retired current setup need reconciliation.
  Historical backlog evidence and the Intent UI's unrelated trunk endpoint
  remain outside the fixture change.
- Preparation comparison at `7a66496f9df9`: 28 specs, 3,432 spec lines, 70
  imports with 255 named bindings from eight family support modules
  (795 lines including the review adapter and installed publisher bridge).
  Recount at the execution base and after migration on the same case roster,
  counting moved or added builder lines and any remaining support by path.
  Compare readable scenario facts, retained assertions and the total cost.
- Slice-plan refinement was unnecessary after separating manual delivery,
  observation, publication and native completion proof. The same checkout,
  launch records and timeline drive each slice. The observed timeout margin
  belongs to slices 5 and 6 and is tracked in their proof.
