# Attribute every workflow session’s published changes

**Identity:** SEED-418#attribute-every-workflow-session-record
**Source:** [Attribute every workflow session’s published changes](../../seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record)
**Split from:** SEED-418#review-published-session-changes (plan 739 at `2d82175d5:.planning/slice-plans/739-review-published-session-changes/PLAN.md`) on 2026-11-21 at its delivered slice-2 boundary

## Goal and scope

A developer with another clone can use a session UUID to review each accepted
contribution of a refinement, execution, standalone Land, or ad hoc story
follow-up. The record carries the workflow, original close time, associated
story where present, and ordered, reachable Git comparisons. Close recovery
preserves the same record. Shared-checkout uncertainty is visible where it
affects a comparison. Records leave current review at 30 days and their files
are removed by a later authorized record publication.

Story-card session selection, cross-session comparisons, recovery of expired
records, and conveying a selected UUID to a follow-up stay with the linked
stories. The [recorded supplier agreement](../../seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record)
owns the standalone Land prerequisite. Keep plan 746's standalone review and
record-contract corrections as the starting point where they have landed.

## Current decisions

- Reuse the versioned record at `.planning/sessions/<uuid>.json`, or beside the
  project's configured backlog, and the [session-close publisher](../../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs).
  Keep single-range records readable, and extend that contract for a story
  identity, multiple ordered pairs and optional per-range uncertainty.
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
  keeps the durable association in Git and the originating launch and recovery
  evidence local.
- Extend the [publisher's candidate/base and containment evidence](../../../Distribution/src/skills/dough-execute-plan/references/publish-the-candidate.md)
  across publications by the same workflow session. Preserve the exact pair of
  each accepted increment. The Dashboard landing context still records only
  the first accepted trunk comparison. Its reference supplies the launch UUID,
  while subsequent publications can contribute to that session's record
  without another landing-context submission. Retain an explicit session UUID
  for a native start in the workflow's resume context. A fresh launch gets a
  separate identity even when it serves the same story and checkout.
- Seal reachable work comparisons and the timestamp before the first record
  publication attempt. Recover work acceptance and record acceptance separately
  with the existing publisher. An identical accepted record settles the close.
  A different record at the same UUID conflicts. Retain the first publisher's
  identity validation so a missing or contradictory identity cannot enter the
  record route. Preserve explicit local-only authority and existing workflow
  outcomes when there is no accepted contribution.
- Reuse the Dashboard's [pair admission](../../../dashboard/server/retainedReviewPair.ts)
  and [range selector](../../../dashboard/src/StoryReviewSessionRuns.tsx) for a
  published session. Review, diff and text requests use the same admitted
  record and selected comparison. Keep published close wording distinct from
  the local Default main comparison wording. Preserve the originating machine's
  single entry and native controls.
- Reuse [history-preserving integration](../../../Distribution/src/skills/dough-execute-plan/references/preserve-published-history.md)
  to make original accepted branch pairs reachable from trunk. Keep separately
  evidenced continuation or closure work. Where the integrated delivery
  encloses already recorded branch work, use it as acceptance evidence without
  adding the entire enclosing comparison a second time.
- Reuse the [Default main log interpretation](../../../dashboard/server/sessionCommitAttribution.ts)
  and [checkout overlap rule](../../../dashboard/server/sessionCheckoutShared.ts)
  from [SEED-379](../../seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md).
  Expose their Git observations and interval decision independently of local
  Done and pins. Use the workflow's retained Git evidence as the acceptance
  bound. Only record the resulting comparisons and uncertainty. Keep final
  Dashboard completion after publication, observation and retirement.
- Use one close-time expiry rule for reads and pruning. Pruning runs against
  the actual candidate base and is recomputed on publication retry. Follow
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution)
  and the [North Star on directly testable production code](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  Keep the workflow entry points as adapters around the existing publication,
  observation and comparison responsibilities.

## Decisive premises

Observations in the preparation checkout at `3569193c7`, using real temporary
Git repositories. The five Distribution specs below, under
`Distribution/tests/skills/`, passed together with Bash 5 and
`npm test -- <spec paths>`.

| Consuming operation | Result-bearing baseline |
| --- | --- |
| Land's work and record publisher, slice 1 | `dough-land/session-record-publication.test.mjs` observes the accepted pair in a second clone and no record for a refused work push. Recovery coverage must interrupt the record stage after work acceptance and assert that work publication happens once. |
| Published record admission and local overlap, slices 2, 6–7 | `npm run --silent test:dashboard:backend -- review/published-session-review review/published-session-listing review/done-kept-session-shared-checkout` passed 23 cases. The published routes read a recorded pair after trunk advances, reject a foreign comparison, and currently refuse a published run selector. Done capture detects concurrent and previously overlapping activity in the same checkout, distinguishes isolated and nonoverlapping sessions, and shows the existing warning. Its result establishes the local rule. Slice 6 owns its use before Done at an accepted close. |
| Accepted rerun evidence, slice 3 | `dough-execute-plan/execution-increment-comparison.test.mjs` observes candidate/base together after retry rewrites the suffix. `dough-story-wrap-up/trunk-closure-rebased-rerun.test.mjs` observes closure from the retained original request after a rebase and retirement without another push. |
| Story-branch reachability, slice 4 | `dough-execute-plan/history-preserving-landing-expectation.test.mjs` proves branch publication takes no first-trunk landing context and accepted integration takes it once. At `9efbd70c1`, the retained plan 739 Git probe pushed a branch, integrated both histories, retired the branch, and diffed the original pair from a default-branch-only clone. The wider merge pair included `unrelated.txt`. Slice 4 proves the same reachability and exclusion through the record and close. |
| Preparation release, slice 5 | `dough-story-refinement/preparation-assignment-land.test.mjs` reads the prepared facts and removal of only the closed assignment from the same accepted snapshot. Its simulated Land drives the release rule. The new proof must drive the installed publisher and observe the second snapshot carrying the session record. |

The Chromium run of `npm run --silent test:e2e -- e2e/sessions/recently-done-published-sessions.spec.ts --reporter=line` passed. The other machine’s UUID opened its recorded diff after trunk advanced, and the originating machine listed its own session once with native controls.

## Outside-in proof

| Promise | Owner and signal |
| --- | --- |
| Stable identity and retry, accepted work only | 1. Observe one work publication, one UUID file, immutable close time and ranges, and recovery without a repeated push. |
| Inspect all accepted comparisons from another machine | 2. Open a published record from a clone without launch state and select each comparison. Inspect the corresponding file diff and refuse a pair outside that UUID. |
| Earlier trunk and story-branch contributions | 3–4. Check accepted ranges from a fresh clone after intervening work and retirement. Check exact files and retained hashes for both execution modes. |
| Workflow and story association | 5. Land a refinement and follow-up, then read both UUIDs and the release from the remote. Slices 1, 3 and 4 cover standalone and execution. |
| Shared-checkout uncertainty and exclusions | 6. Inspect the affected published range from another checkout. Observe the warning and absence of pulled-only and unpublished edits. |
| 30-day expiry and pruning | 7–8. Check just before and at expiry. Publish against an advanced target, then inspect its live set and the old snapshot. |

## Ordered slices

### 1. Resume publishing the same close record

Type: Behavior
Status: planned

**Behavior.** A publishing Land session keeps its launch or native UUID and
resumes after work acceptance, record rejection, or lost acknowledgement.
The accepted record keeps its original time and comparisons even when trunk
advances. A conflicting UUID record is reported with the accepted work intact.

**Proof.** Drive Land's installed close publisher and recovery against a
temporary origin. Refuse the record push and simulate loss after acceptance,
then resume from retained production inputs. Assert work/record push counts,
record bytes, and same UUID for the native rerun. Preserve launch-reference
capture and verify a refused work push creates no record.

### 2. Inspect each published comparison

Type: Behavior
Status: planned

**Behavior.** Recently done opens a published UUID and offers the existing range
selector for its ordered comparisons. Each selection opens only its recorded
pair in the file review, with published close wording. A one-range record
still opens directly.

**Proof.** Extend the second-machine journey in
`e2e/sessions/recently-done-published-sessions.spec.ts` with actual disjoint
Git pairs and no local launch for the selected UUID. Switch pairs and read
both diffs. Extend the published-route checks for an invalid selection and a
foreign file pair. Keep local Done controls and the single-range journey.

### 3. Recover earlier trunk publications at wrap-up

Type: Behavior
Status: planned

**Behavior.** Trunk Mode accepts multiple increments, with another session
landing in between, and closes through Story Wrap-up. The final record uses
the accepted pairs, including the rewritten pair after retry. A record
publication follows work acceptance before the workflow's completion and
retirement. Existing observer duties apply to the final accepted delivery.

**Proof.** Drive the production execution increment and `trunk-closure.mjs
finish` boundaries with real Git and their existing controlled CI observer
fixture. A fresh clone reads both increments and the accepted close work,
with the other writer, refused candidates and the record commit absent.
Assert retirement only after the required receipt.

### 4. Keep story-branch comparisons after integration

Type: Behavior
Status: planned

**Behavior.** Story Branch Mode preserves its attributable branch comparisons
and separately evidenced later work when integration makes them reachable from
trunk. The record counts the original work once and survives branch deletion.

**Proof.** Drive branch delivery and the Story Branch wrap-up integration and
retirement against a temporary origin, with an intervening trunk change and a
separate accepted continuation. Read exact pairs and file diffs from a fresh
default-branch-only clone after retirement. Assert original branch hashes,
the continuation's edits, and absence of duplicate and intervening work.

### 5. Record refinement and follow-up through Land

Type: Behavior
Status: planned

**Behavior.** A refinement and a later ad hoc story follow-up use the same
Land close path with their own workflow and session identity. The story
association comes from the workflow context. The preparation and release
continue to be accepted in one snapshot.

**Proof.** Start, record and release a preparation in a temporary origin,
then land it through the installed publishers. Land the later follow-up
with the same story context. Read both records and the earlier preparation
snapshot from the origin. Verify distinct UUIDs, workflow values and
comparisons, the common story identity, and release of only that assignment.

### 6. Disclose ambiguity in a shared checkout

Type: Behavior
Status: planned

**Behavior.** When sessions overlap in one checkout, accepted comparisons that
may include either session's work display that uncertainty. Pulled-only and
unpublished edits stay outside the record. Isolated and nonoverlapping
activity produces a comparison without the warning.

**Proof.** Use two overlapping sessions with timed commits and a pull in a
real shared repository, and a control in an isolated checkout. Drive the
close path with observed checkout intervals and accepted Git pairs. Open
the published range from another clone and check its warning and files.
Keep the existing Done capture observations at their normal entry point.

### 7. Stop offering expired published records

Type: Behavior
Status: planned

**Behavior.** At 30 days from close the repository-backed entry leaves the
current listing and the current UUID route reports it unavailable, including
when its file still exists at the fetched revision.

**Proof.** Freeze the clock around the boundary with a published record on
the configured trunk. Observe listing and review immediately before and at
expiry. Check that the record’s close time controls the boundary
even when the Git commit time differs and that a local kept entry keeps its own lifecycle.

### 8. Prune expired records on authorized publication

Type: Behavior
Status: planned

**Behavior.** The next authorized close removes expired records from the
current snapshot while preserving live files, including a live record from a
writer that advances trunk during publication. The earlier snapshot retains
its record at the original path.

**Proof.** Use a controlled clock and a second writer on a real temporary
origin to force publisher reconciliation. Compare the accepted tree with the
earlier published snapshot and verify that the current close and the
concurrent live record survive, while only the expired session file is removed.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Follow [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md) when
  their test selection applies. Keep default timeouts and omit `test.slow()`.
  Apply [maintainer skill authoring](../../../.agents/skills/author-open-dough-skills/SKILL.md)
  before editing shipped workflow guidance.
- Use `caffeinate -s -i` on AC power for long local runs under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Use Bash 5 and `npm test -- <paths>` for the focused Distribution suites.
  Run affected Dashboard backend, frontend and E2E specs through their
  repository npm runners. Run `npm run typecheck:dashboard` when changing the
  typed review or publication contract, and apply the relevant lint and
  post-change refactoring gates.

## Plan review

Slice-plan refinement split the range reader from execution capture and the
expiry read from the pruning write. Land's association cases share one
publication and verification loop. Each slice has one main proof loop sized
for 15 active minutes. The sequence uses one accepted-comparison model across
workflows and keeps eight slices. The review found no remaining slice-specific
concern. The recorded supplier agreement remains the start prerequisite.
