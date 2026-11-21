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

The four supplier agreements are satisfied on trunk and their delivered
contracts are the starting inputs. Preparation at `866a1f88a` mapped the
post-supplier roster: 35 specs import the four family modules. The 22 specs
from the original roster remain. `ad-hoc-session-commits` was folded into
`ad-hoc-session-commits-done`, and the observation specs were consolidated.
Twelve consumers were added by the suppliers or moved onto the presets:
`branch-entry-proposal`, `ad-hoc-session-branch-handoff`, `branch-landing-handoff`,
`ad-hoc-branch-result-race`, `ad-hoc-manual-landing-precedence`,
`ad-hoc-manual-landing-observation`, `observed-session-deliveries`,
`observed-session-delivery-witnesses`, `published-session-listing`,
`published-session-review`, `ad-hoc-review-request` and
`server/landingRecordPersistence`. `composedLandingStores.ts` and
`doneCaptureReview.ts` are also support consumers. The slices below assign each
consumer to a slice so that every preset ends with one owner. Preserve supplier
evidence that still covers the same boundary and assertion.

## Key examples and proof

| Scenario | Observer and owner |
| --- | --- |
| Work predating, overlapping or following a Default main launch | Real dated Git and typed review show which commits belong, their separate runs and the shared-checkout cue. Launch start records readable Git facts. Slice 1. |
| Work arrives around the Done cutoff or a record is removed | The captured tip and pending Done refusals come from the real operation under test. Deletion, expiry and repeated Done observe actual refs and the surviving record. Slice 2. |
| Default main declares a dirty worktree | Entry observes the recorded tip, tree, distinct Default main tip and retry. Review answers both comparisons. Foreign, wrong-branch and second-place requests retain their refusals and Cursor replacement retains entry ownership. Slice 3. |
| Isolated branch work, retirement and supersession | Saved commit and dirty tree remain independently reviewable. Missing and empty results differ. Held, newer and deleted Done operations retain their assertions on the actual pin set. Slice 4. |
| Manual merge before and after publication | Compare the saved dirty branch with the actual trunk resolution. Other-branch acceptance, unrelated changes, unobserved parents and squash leave their existing results and explanations. Slice 5. |
| Publisher has a declared or reported isolated branch | The installed entry prepares the exact pair that is accepted, records after Done, retries with the original launch and retains the correct file pair after retirement. Real cleanup still owns pin removal. Slice 6. |
| A declared branch is handed off and its landing is prepared | The handoff binds the original checkout's branch or the named session, and keeps its refusals. The saved context coexists with newer evidence and a concurrent Done, and late preparations keep the saved and replacement records. Slice 7. |
| A quiet completion arrives while native Done is pending | Actual receipt and native rename ordering choose the kept commit run, with the existing resume, retry and previous-run assertions. Slice 8. |
| Setup is readable and imports are narrower | Review the launch and Done time at each meaningful call site, the one case value, the branch-entry spec's helper/import boundary, and the support import and lines comparison. Each slice retires its migrated setup, and slice 8 closes the comparison. |

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
| Current launch, Git and review inputs reach each family boundary | Post-supplier base `866a1f88a`, 2026-11-21, AC power, load 22–27. Ran the 35 roster specs named by slices 1–8 at one worker in 199.5 s: 120 of 121 cases passed. `ad-hoc-branch-result-race` timed out at 5 s. Rerun alone three times at load 27–30, it timed out once and passed in 3.13 s and 2.61 s. Cases over 3.4 s were `observed-session-deliveries` (4.75 s), `declared-worktree-publication` (4.71 s), `ad-hoc-branch-attribution`, `ad-hoc-manual-landing`, `ad-hoc-session-comparisons`, `ad-hoc-branch-cursor-recovery` and `branch-entry-proposal` (3.49–3.98 s). | The one-worker profile reaches every current outcome except the race case's margin. Under the failure policy, the race timeout is a defect that slice 4 diagnoses and repairs. Slices 5 and 6 recheck their slowest cases near the limit. Preserve assertions and the default timeout. |
| Initial dirty entry and Cursor expiry observe real pin effects (slice 3) | Branch-entry preparation at `9784452bd:.planning/slice-plans/735-propose-branch-entry-from-typed-inputs/PLAN.md` recorded the expected ref assertion failures with entry pinning or expiry cleanup bypassed, then both checks passed after restoration. The current branch-entry and Cursor specs also passed in this preparation. | Preserve those real actions and pin assertions in their delivered owners. |
| Manual merge and reported comparison both finish with native Git and the installed/typed entries (slices 5 and 6) | Pre-supplier, at two workers, the first `ad-hoc-manual-landing` case and `ad-hoc-session-comparisons` hit 5 s. A one-worker `GIT_TRACE2_EVENT` diagnostic traced 425 top-level Git calls across the seven cases, none above 127 ms. Post-supplier at one worker and load 22–27, both passed in 3.81 s and 3.80 s. | No Git call dominates, so the margin is spent in setup volume. Slices 5 and 6 compare their slowest cases before and after migration and repair any recurring timeout under the failure policy. |

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
`done-kept-session-rebased-runs`, `done-kept-session-shared-checkout`,
`done-kept-session-unavailable`, `published-session-listing`,
`published-session-review` and `ad-hoc-review-request`. Inspect the start,
run, time-bound, shared, published-pair and absence assertions and the
removal of preset imports.

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

**Proof.** Run `ad-hoc-session-branch-entry`, `branch-entry-proposal`,
`ad-hoc-branch-entry-attribution` and `ad-hoc-branch-cursor-recovery`. Keep the separate review pairs, rejection,
attribution and ref observations. Inspect the branch-entry spec for zero
local setup helpers and at most one case-builder binding from the old support.

### 4. Isolated launch cases show the recorded and working branch state

Type: Behavior
Status: planned

Reuse the case timeline with isolated launches and real branch commits and
working trees. Keep capture and retention operations in the cases that
prove them. Move setup verbs out of scope as their last caller migrates.
Diagnose and repair the `ad-hoc-branch-result-race` timeout recorded in the
premise table before accepting this slice.

**Proof.** Run `ad-hoc-branch-attribution`, `ad-hoc-branch-result`,
`ad-hoc-branch-result-supersession`, `ad-hoc-branch-result-race` and
`ad-hoc-branch-worktree-result`. Keep ambiguity, empty/missing, retirement,
supersession, quiet-Done precedence and pin observations.

### 5. A manual delivery case shows the merge and both Done times

Type: Behavior
Status: planned

Move the manual-landing presets and visible timeline onto the isolated
case, preserving real conflict resolution, publication and undo. Keep the
same before/after behavior and review pairs. Before accepting this slice,
compare the slowest `ad-hoc-manual-landing` and `observed-session-deliveries`
cases with the recorded baseline.

**Proof.** Run `ad-hoc-manual-landing`, `ad-hoc-manual-landing-precedence`,
`ad-hoc-manual-landing-observation`, `observed-session-deliveries` and
`observed-session-delivery-witnesses`. Keep both distinct text comparisons,
the remote/ref restriction, the early quiet Done pair, exact delivery without
pin writes and all negative delivery cases.

### 6. Publisher cases share the launch and its reporting context

Type: Behavior
Status: planned

Use the delivered builders for a declared or reported isolated branch,
matching attempt, landing authority and context. Leave submission,
preparation, acceptance, retries and retirement at the entry that owns
each effect. Retire setup from the two publisher preset modules. Before
accepting this slice, compare the `declared-worktree-publication` and
`ad-hoc-session-comparisons` cases with the recorded baseline.

**Proof.** Run `declared-blank-launch-publication`,
`declared-worktree-publication`, `ad-hoc-prepared-landing-done` and
`ad-hoc-session-comparisons`. Observe the publisher's accepted pair,
exact retry, distinct file comparisons and pin release.

### 7. Branch handoff and landing record cases share the declaring launch

Type: Behavior
Status: planned

Arrange the handoff and landing-record cases from the declaring-launch case
of slice 3 and the publisher values of slice 6, including
`composedLandingStores.ts`. Keep the handoff request, context save and late
prepare as the operations under test, with their fixture-local stores and
races.

**Proof.** Run `ad-hoc-session-branch-handoff`, `branch-landing-handoff` and
`landingRecordPersistence`. Keep the bound branch, the refusals, the saved
publisher file, the concurrent Done and changed-entry answers, and both late
prepare survivors.

### 8. Quiet completion cases show the launch, receipt and Done sequence

Type: Behavior
Status: planned

Make the report and its dated launch and completion preconditions from
the same case. Keep the real native Done owner and the named rename
collaborator in the tests. Retire remaining setup from
`reportedDoneCase.ts` and `doneCaptureCase.ts` and check their last callers.

**Proof.** Run `ad-hoc-session-commits-done`.
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
  input changes. The post-supplier trace over the four preset modules found
  the 35 specs above and six support files: the four modules,
  `doneCaptureReview.ts` and `composedLandingStores.ts`. The installed
  publisher and review adapter are reached through those specs.
  Guidance links referencing retired current setup need reconciliation.
  Historical backlog evidence and the Intent UI's unrelated trunk endpoint
  remain outside the fixture change.
- Post-supplier comparison at `866a1f88a`: 35 specs, 5,131 spec lines.
  The specs have 110 imports from support modules with 304 named bindings.
  Of those, 39 imports with 229 bindings come from the four preset modules,
  which hold 507 lines; with `doneCaptureReview.ts` and
  `composedLandingStores.ts` the six support files hold 613 lines. Recount after
  migration on the same roster. Count moved or added builder lines and any
  remaining support by path, and compare readable scenario facts, retained
  assertions and the total cost.
- Slice-plan refinement ran at `866a1f88a`. The twelve new consumers joined
  the slices that prove the same behavior, and branch handoff and landing
  record persistence became slice 7, giving eight slices, at the plan limit.
  The same checkout, launch records and timeline drive each slice. No other
  slice-specific concern remains. Slice 4 owns the race timeout, and slices 5
  and 6 own the rechecks of their near-limit cases.
