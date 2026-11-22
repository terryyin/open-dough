# Attribute every workflow session’s published changes

**Identity:** SEED-418#attribute-every-workflow-session-record
**Source:** [Attribute every workflow session’s published changes](../../seeds/SEED-418-review-published-session-changes.md#attribute-every-workflow-session-record)
**Source review:** [source-review.md](source-review.md)
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
owns the standalone Land prerequisite. Start from the delivered corrections of
SEED-418#correct-published-session-review (closed at `e115dcdd4`): Land's
session-close route, one shared record contract and one record path.

## Current decisions

- Reuse the versioned record at `.planning/sessions/<uuid>.json`, or beside the
  project's configured backlog, and the [session-close publisher](../../../Distribution/src/skills/dough-execute-plan/scripts/session-record-publication.mjs).
  Keep single-range records readable, and extend the [shared record contract](../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs),
  which the producer and the Dashboard both read, for a story
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
- Keep each execution's accepted pairs and session identity locally in one
  per-worktree file at `git rev-parse --git-path open-dough/session-record`
  holding the session UUID, workflow, story and ordered ranges, like the slice
  clock's record and ADR 0008's local evidence. Increment delivery appends each
  accepted pair. A Dashboard launch's landing-context reference names the
  session. A fresh native claim or admission starts a new native UUID, and a
  resumed start keeps the file. A new launch reference replaces an unclosed
  earlier session's evidence.
- At trunk wrap-up, publish the record as a separate commit after the final
  closure is accepted. Its ranges include the closure pair, because closure is
  separately evidenced session work and a commit cannot name its own hash.
  Completion and retirement keep observing the accepted closure SHA, the final
  accepted delivery. The record commit carries only the record, like the
  closure commit. `finish` publishes it after the closure, any consumer visit
  and the closure's completion receipt settle, because visit deliveries,
  observer recovery and integrated-state completion all name the closure.
  It stops before retirement until the record publication is accepted, and retirement treats the record commit as
  contained. A `finish` rerun resumes the record stage through
  `resumeSessionClose`.
- Story Branch integration has one script boundary, `history-preserving-publication.mjs
  integrate`, which runs before the integrated SHA's completion receipt and the
  consumer visit. Its record stage is therefore a separate wrap-up adapter
  (`story-branch-session-record.mjs record`), run after the final completion
  receipt and consumer visit and before retirement, mirroring Trunk Mode. Its
  ranges are the original branch pairs and the continuation's pairs. The
  integration merge pair is acceptance evidence only. The integration's launch
  reference renames an unclosed native session and keeps its ranges.

## Decisive premises

Observations in the preparation checkout at `3569193c7`, using real temporary
Git repositories. The five Distribution specs below, under
`Distribution/tests/skills/`, passed together with Bash 5 and
`npm test -- <spec paths>`.

| Consuming operation | Result-bearing baseline |
| --- | --- |
| Land's work and record publisher, slice 1 | `dough-land/session-record-publication.test.mjs` observes the accepted pair in a second clone and no record for a refused work push. Recovery coverage must interrupt the record stage after work acceptance and assert that work publication happens once. |
| Published record admission and local overlap, slices 2, 8–9 | `npm run --silent test:dashboard:backend -- review/published-session-review review/published-session-listing review/done-kept-session-shared-checkout` passed 23 cases. The published routes read a recorded pair after trunk advances, reject a foreign comparison, and currently refuse a published run selector. Done capture detects concurrent and previously overlapping activity in the same checkout, distinguishes isolated and nonoverlapping sessions, and shows the existing warning. Its result establishes the local rule. Slice 8 owns its use before Done at an accepted close. |
| Accepted rerun evidence, slices 3–5 | `dough-execute-plan/execution-increment-comparison.test.mjs` observes candidate/base together after retry rewrites the suffix. `dough-story-wrap-up/trunk-closure-rebased-rerun.test.mjs` observes closure from the retained original request after a rebase and retirement without another push. |
| Story-branch reachability, slice 6 | `dough-execute-plan/history-preserving-landing-expectation.test.mjs` proves branch publication takes no first-trunk landing context and accepted integration takes it once. At `9efbd70c1`, the retained plan 739 Git probe pushed a branch, integrated both histories, retired the branch, and diffed the original pair from a default-branch-only clone. The wider merge pair included `unrelated.txt`. Slice 6 proves the same reachability and exclusion through the record and close. |
| Preparation release, slice 7 | `dough-story-refinement/preparation-assignment-land.test.mjs` reads the prepared facts and removal of only the closed assignment from the same accepted snapshot. Its simulated Land drives the release rule. The new proof must drive the installed publisher and observe the second snapshot carrying the session record. |

At `107ac15cb`, after the shared record contract and path refactor, the
Land publisher spec passed its four cases again under `node --test`.

The Chromium run of `npm run --silent test:e2e -- e2e/sessions/recently-done-published-sessions.spec.ts --reporter=line` passed. The other machine’s UUID opened its recorded diff after trunk advanced, and the originating machine listed its own session once with native controls.

## Outside-in proof

| Promise | Owner and signal |
| --- | --- |
| Stable identity and retry, accepted work only | 1. Observe one work publication, one UUID file, immutable close time and ranges, and recovery without a repeated push. |
| Inspect all accepted comparisons from another machine | 2. Open a published record from a clone without launch state and select each comparison. Inspect the corresponding file diff and refuse a pair outside that UUID. |
| Earlier trunk and story-branch contributions | 3–6. Check accepted ranges from a fresh clone after intervening work and retirement. Check exact files and retained hashes for both execution modes. |
| Workflow and story association | 7. Land a refinement and follow-up, then read both UUIDs and the release from the remote. Slices 1, 3–6 cover standalone and execution. |
| Shared-checkout uncertainty and exclusions | 8. Inspect the affected published range from another checkout. Observe the warning and absence of pulled-only and unpublished edits. |
| 30-day expiry and pruning | 9–10. Check just before and at expiry. Publish against an advanced target, then inspect its live set and the old snapshot. |

## Ordered slices

### 1. Resume publishing the same close record

Type: Behavior
Status: done

**Behavior.** A publishing Land session keeps its launch or native UUID and
resumes after work acceptance, record rejection, or lost acknowledgement.
The accepted record keeps its original time and comparisons even when trunk
advances. A conflicting UUID record is reported with the accepted work intact.

**Proof.** Drive Land's installed close publisher and recovery against a
temporary origin. Refuse the record push and simulate loss after acceptance,
then resume from retained production inputs. Assert work/record push counts,
record bytes, and same UUID for the native rerun. Preserve launch-reference
capture and verify a refused work push creates no record.

**Accepted.** `resumeSessionClose` in `session-record-publication.mjs` resumes from a sealed record or, when the work result was lost, from the retained session and work coordinates through `resumeInterruptedPublication`. A record commit rebased onto an advanced target keeps the publisher's `needs-validation` stop, so a resume reruns with `validatedCandidate`. Proof: `npm test -- Distribution/tests/skills/dough-land/session-record-publication.test.mjs Distribution/tests/skills/dough-land/session-close-resume.test.mjs` (10 cases). Later slices extend this same sealed-record and resume route.

### 2. Inspect each published comparison

Type: Behavior
Status: done

**Behavior.** Recently done opens a published UUID and offers the existing range
selector for its ordered comparisons. Each selection opens only its recorded
pair in the file review, with published close wording. A one-range record
still opens directly.

**Proof.** Extend the second-machine journey in
`e2e/sessions/recently-done-published-sessions.spec.ts` with actual disjoint
Git pairs and no local launch for the selected UUID. Switch pairs and read
both diffs. Extend the published-route checks for an invalid selection and a
foreign file pair. Keep local Done controls and the single-range journey.

**Accepted.** Published records carry one or more ordered ranges; the published review takes an optional `run` position, refuses an unknown one (409) and admits a file only on an exact recorded pair. The Dashboard's "Published ranges" switch reuses the comparison choices. Proof: E2E "Recently done reviews each published range of another machine's session" in `e2e/sessions/recently-done-published-sessions.spec.ts`, and backend `review/published-session-review`, `review/published-session-review-request`, `review/published-session-listing`.

### 3. Keep each accepted increment's pair under its session

Type: Behavior
Status: done

**Behavior.** Each accepted execution increment adds its exact accepted
base/candidate pair, in order, to the execution's local session evidence
under the session's identity. A retry that rewrites the suffix keeps the
rewritten accepted pair, and a refused or unaccepted candidate adds nothing.
A Dashboard launch's reference names the session; a fresh native start gets
its own UUID, and resuming the same execution keeps it.

**Proof.** Drive the production execution increment delivery with real Git
against a temporary origin: two increments with another writer between them
and one rejected-then-rewritten publication. Read the local session evidence
and assert the exact ordered pairs, the absence of refused candidates and the
other writer, the launch-reference identity, and a native UUID that survives
resume but differs for a fresh start.

**Accepted.** `execution-session-evidence.mjs` keeps the per-worktree session evidence; increment delivery appends each accepted pair under the launch reference, and a newly published claim or admission begins a native session. Proof: `execution-session-evidence-delivery.test.mjs` and `execution-session-evidence-start.test.mjs` under `Distribution/tests/skills/dough-execute-plan/`.
CI repair (run 44903981736): execution start must not load landing modules, which older or incomplete installs lack, so `resolveLaunchLanding` lives beside the landing-context resolver. Proof: `dashboard/backend-tests/launches/agent-launch-incomplete-reporting-settlement.spec.ts`.
The same repair met `dashboard/backend-tests/launches/declared-blank-launch-publication.spec.ts:23` timing out at load ~25 (5088 ms; 515 ms in CI), from about 61 git starts on a path this story does not change. On 2026-11-21 Terry chose to queue its repair as SEED-421#stop-repeating-git-work-in-shared-publication, first in the Backlog list at `72d22311d`, instead of a per-test timeout or a split.

### 4. Publish the session record at trunk wrap-up

Type: Behavior
Status: done

**Behavior.** After the final closure is accepted and any consumer visit
settles, `finish` seals the record
from the session evidence plus the accepted closure pair and stores it locally.
After the completion receipt for the accepted closure SHA, it publishes the
record as a separate commit through `resumeSessionClose`, then retires.
Retirement stops until the record publication is accepted, including when the
worktree is already gone, and it treats the record commit as contained. A rerun after a refused record push publishes the stored
record without another closure push. Existing closure tests follow the record
commit at the trunk tip.

**Proof.** Drive `trunk-closure.mjs finish` with real Git and its existing
controlled CI observer fixture. Assert the record lands after the closure,
completion names the closure SHA, and retirement happens only after the record
is accepted. Then refuse the record push and rerun: one record is published
and the closure is pushed once. Keep every existing `trunk-closure*` test
passing with the new tip.

**Accepted.** `trunk-closure-session-record.mjs` seals and publishes the records-only record commit after the closure's completion receipt. The default-checkout refresh follows the record, and retirement treats the record commit as contained. The record push passes `landingContext: null`, which the resolver reads as "not a landing", so a Dashboard launch's open landing expectation stays with the closure. Proof: `Distribution/tests/skills/dough-story-wrap-up/trunk-closure-session-record.test.mjs`, every `trunk-closure*` suite, and `e2e/sessions/agent-completion-quiet.spec.ts`. Trunk since `0648ff017` changed publication validation and confirmation (`6d6cbebcf`, `9b3e40a36`), so integration needs merged-state proof of these suites.
CI repair (run 44962527796): the owned-context closure evaluation now gives its fixture repository a commit identity and requires the record commit directly on the closure. A record commit or publication failure after completion stops `finish` at `step: "record"` with rerun recovery. Proof: `Distribution/evaluation/tests/git-publication/git-publication-native-owned-context.sh` and `trunk-closure-session-record.test.mjs`.

### 5. Read every trunk contribution of a wrapped-up session

Type: Behavior
Status: done

**Behavior.** A Trunk Mode session publishes two increments, with another
writer's change between them, and a retried increment, then wraps up. Its
published record lists the workflow, the original close time and the accepted
comparisons in order. The comparisons are the increments and the closure,
excluding the other writer, refused candidates and the record commit.

**Proof.** Produce the increments through production delivery against a
temporary origin and close through `finish`. From a fresh default-branch-only
clone, read the record, check every range's commits are present and its file
diffs are exact, and confirm the other writer's change, refused candidates and
the record commit are absent.

**Accepted.** `trunk-closure-session-record-contributions.test.mjs` reads a native session's record from a default-branch-only clone. Every range's commits are present there, so G3 is harmless for Trunk Mode records.

### 6. Keep story-branch comparisons after integration

Type: Behavior
Status: done

**Behavior.** Story Branch Mode preserves its attributable branch comparisons
and separately evidenced later work when integration makes them reachable from
trunk. The record counts the original work once and survives branch deletion.

**Proof.** Drive branch delivery and the Story Branch wrap-up integration and
retirement against a temporary origin, with an intervening trunk change and a
separate accepted continuation. Read exact pairs and file diffs from a fresh
default-branch-only clone after retirement. Assert original branch hashes,
the continuation's edits, and absence of duplicate and intervening work.

**Accepted.** `story-branch-session-record.mjs record` shares Trunk Mode's record stage and runs after the final completion receipt and visit, before retirement. The record push now bases on the record commit's parent, which a Story Branch rerun needs. Proof: `Distribution/tests/skills/dough-story-wrap-up/story-branch-session-record.test.mjs`; the integrated SHA's completion receipt keeps its existing proof.

### 7. Record refinement and follow-up through Land

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

### 8. Disclose ambiguity in a shared checkout

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

### 9. Stop offering expired published records

Type: Behavior
Status: planned

**Behavior.** At 30 days from close the repository-backed entry leaves the
current listing and the current UUID route reports it unavailable, including
when its file still exists at the fetched revision.

**Proof.** Freeze the clock around the boundary with a published record on
the configured trunk. Observe listing and review immediately before and at
expiry. Check that the record’s close time controls the boundary
even when the Git commit time differs and that a local kept entry keeps its own lifecycle.

### 10. Prune expired records on authorized publication

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
workflows. Execution split the trunk wrap-up slice into increment capture (3) and record publication at `finish` (4), giving nine slices. It then split record publication at `finish` (4) from its outside-in proof across increments (5), because every existing closure fixture now publishes a record and moves the trunk tip those tests assert. That gives ten slices. The review found no remaining slice-specific
concern. The recorded supplier agreement remains the start prerequisite.

## Story obligations

### G1. Sealed record lost when the record stage throws
Reported: slice 1 — "Acceptance found publishSessionClose returns the sealed record only when the record stage returns; a throw from fetch, commit or publication loses it."
Story clause: "A close retry keeps the original record and resumes its first unfinished step."
Disposition: proved by slice 1: Distribution/tests/skills/dough-land/session-close-resume.test.mjs "a record stage that throws after work acceptance returns the sealed record, and resuming it publishes the work once" (hook-refused record commit returns the sealed record; resume pushes work once, record once, original bytes)

### G2. No record after the work push loses its acknowledgement
Reported: slice 1 — "Not covered: a crash after the work is accepted but before the record is sealed."
Story clause: "A close retry keeps the original record and resumes its first unfinished step."
Disposition: proved by slice 1: Distribution/tests/skills/dough-land/session-close-resume.test.mjs "a close whose accepted work push lost its result resumes from the retained work and publishes the record once" (resume confirms work with pushCount 0 via resumeInterruptedPublication, then seals and publishes one record; no earlier record existed, so its seal time is the original close time)

### G3. One unreadable range hides every range of the record
Reported: slice 2 — "If one range's commits aren't in this machine's Git, the whole review shows unavailable with no range switch, so the other ranges can't be reached from the UI."
Story clause: "Include earlier accepted trunk and story-branch work when its comparison becomes reachable from trunk."
Disposition: proved by slice 6: Distribution/tests/skills/dough-story-wrap-up/story-branch-session-record.test.mjs (git cat-file -e succeeds for every range commit in a default-branch-only clone after Dough Land retirement deleted the branch) and Distribution/tests/skills/dough-story-wrap-up/trunk-closure-session-record-contributions.test.mjs for Trunk Mode

### G4. The range switch disappears while another range loads
Reported: slice 2 — "The switch disappears briefly while another range loads."
Story clause: "A developer on another machine can review what an individual publishing session contributed."
Disposition: no user cost "A developer on another machine can review what an individual publishing session contributed.": the switch returns with the loaded range and its selection, so every range stays selectable (observed in the E2E journey switching to range 2 and reading its diff)

### G5. A Dashboard-launched story-branch execution keeps its native UUID
Reported: slice 3 — "A story-branch first publication carries no landing context, so its evidence keeps the native UUID; that is left for slice 5."
Story clause: "Use the launch UUID when supplied"
Disposition: proved by slice 6: Distribution/tests/skills/dough-story-wrap-up/story-branch-session-record.test.mjs launch-reference case (record UUID is the integration launch reference and keeps the earlier branch ranges via adoptLaunchReference)

### G6. A resumed interrupted increment adds no pair
Reported: slice 3 — "resumeManagedExecutionIncrement never calls recordAcceptedIncrement. If an interrupted publication is resumed and then accepted, its pair is not added to the session evidence."
Story clause: "ordered comparisons for that session's accepted work"
Disposition: proved by slice 3: Distribution/tests/skills/dough-execute-plan/execution-session-evidence-delivery.test.mjs "an increment whose push response was lost joins the session evidence once, in order, when resumed and accepted" (production resumeManagedExecutionIncrement accepts with pushCount 0; ranges deep-equal [trunk→first, first→interrupted] after a second resume)

### G7. Story Branch record proof bypasses its production entries
Reported: slice 6 — "Branch pairs are recorded by pushing and calling recordAcceptedIncrement directly, not through deliverManagedExecutionIncrement to a branch target. Retirement is just deleting the remote branch ref, not Dough Land retire. The tests call the library function, so the CLI's argument parsing is not exercised."
Story clause: "Include earlier accepted trunk and story-branch work when its comparison becomes reachable from trunk."
Disposition: proved by slice 6: Distribution/tests/skills/dough-story-wrap-up/story-branch-session-record.test.mjs (branch increments through deliverManagedExecutionIncrement story-branch mode, record stage through the installed story-branch-session-record.mjs CLI, Dough Land worktree-retirement.mjs retire holding on an unpublished record and succeeding with the published record.sha)
