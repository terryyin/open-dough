# Review a session’s published changes from another machine

**Identity:** SEED-418#review-published-session-changes
**Source:** [Review a session’s published changes from another machine](../../seeds/SEED-418-review-published-session-changes.md#review-published-session-changes)

## Goal and scope

A developer on a second machine can discover a standalone Done session in the
configured project and use **Review changes** to inspect what it published.
Refinement, execution and ad hoc story follow-ups also leave a UUID and
attributable Git comparisons for later story and follow-up consumers. Use the
source's 30-day window. Story-session selection, combining comparisons,
historical recovery and adding follow-up message context are separate stories.

## Current decisions

- The workflow owns a versioned JSON record per UUID beside the configured
  backlog. Use one record contract shared by workflow code and the Dashboard.
  Read it from the published revision of the configured project. The workflow
  keeps the UUID and enough accepted-publication evidence to retry a close
  before retiring its checkout. Use the existing launch correlation to bind
  Dashboard launches and their local records, with an explicit retained
  workflow identifier for native starts. Reusing a checkout or story identity
  conveys no session identity.
- Close records describe accepted contributions. Reuse the accepted
  candidate/base pairs and Git containment checks in the
  [publisher](../../../Distribution/src/skills/dough-execute-plan/references/publish-the-candidate.md)
  and [history-preserving integration](../../../Distribution/src/skills/dough-execute-plan/references/preserve-published-history.md).
  Preserve exact branch hashes and the order of independent ranges. Where
  integration repeats a branch contribution, represent that work once and
  retain separately attributable integration changes. Reuse the authorized
  publication path for the record commit after the work is accepted, with
  closure's existing refresh, CI, retirement and reporting owners. Each record
  publication can be retried independently from the work publication.
- The completed-story review shows how to resolve a configured project against
  published Git. The [retained comparison reader](../../../dashboard/server/retainedReviewPair.ts)
  already reads exact pairs and the standalone review already selects one
  retained comparison and checks file membership. Reuse these responsibilities
  for the published UUID subject. Local launch evidence can enrich the same
  entry; it remains the source of native controls. Read and validate a selected
  range through the configured project and require the literal changed path
  for file requests. Report missing evidence as unavailable.
- Reuse the checkout-log and overlap rules from
  [Default main session commits](../../seeds/SEED-379-review-changes-from-completed-ad-hoc-sessions.md).
  The [existing capture](../../../dashboard/server/doneCapture.ts) runs on
  local Done and writes local pins. Share its observation rules through a
  store-independent input so closure can settle published evidence before
  retirement, keeping local Done capture and final reporting separate. Every
  disclosed range needs published endpoints. Mark uncertainty where observed
  overlap makes individual attribution unavailable.
- Follow [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state),
  [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#5-use-a-clear-domain-model-and-map-directly-to-it-throughout-the-solution),
  and the [Architectural North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support).
  Keep typed boundaries narrow and avoid adding test-support wrappers. Preserve
  one comparison model for all workflow variants. Keep changes to the publication
  and observation entry points thin. If the currently 250-line
  `dashboard/server/performedRead.ts` needs a dispatch change in slice 2,
  move the published-record read responsibility behind its typed handler and
  keep the existing read route responses and authentication tests as proof.

## Decisive premises

Observed in the preparation workspace on 2026-11-20 at `9efbd70c1`. The
advance to `b216770db` adds another story's preparation and leaves the
relevant implementation paths untouched.

| Consuming operation | Observation |
| --- | --- |
| Accepted publication supplies the comparison used by slices 1, 3 and 4 | Ran distribution Node tests `execution-increment-comparison.test.mjs` and `trunk-closure-rebased-rerun.test.mjs` in the owned checkout. The real temporary Git remote accepted the retry's rewritten candidate with its new base. The pair diff contained just the increment. Closure resumed from the original request after acceptance and retired without replaying the publication. |
| Earlier branch comparisons survive integration and branch deletion in slice 5 | Ran `history-preserving-landing-expectation.test.mjs` against a temporary remote, confirming branch publication carries no one-time trunk landing and the first trunk integration captures once. Separately, with Apple Git 2.50.1, pushed a branch, merged it with both histories, published a sample UUID JSON on trunk and removed the branch. A `git clone --no-local --single-branch` could read the JSON and diff the original exact pair after retirement. Diffing the broader initial base through the merge included `unrelated.txt`. The scratch test exercised Git reachability, with record serialization and Dashboard wiring owned by the slices. |
| Current comparison and shared-checkout behavior to reuse in slices 2 and 6 | Ran `npm run --silent test:dashboard:backend -- review/ad-hoc-review-subject review/ad-hoc-review-file review/done-kept-session-shared-checkout`. All 17 cases passed in the Vitest profile. File reads admit the exact selected pair and rename path, and refuse a foreign path or pair. Two overlapping sessions in the same checkout show uncertainty; isolated and nonoverlapping sessions do not. Today's review rejects the same subject when local kept state is empty. Slice 2 changes that boundary for published UUIDs. |
| Focused Chromium selection for the Done-session journey in slice 2 | `npm run test:e2e -- --reporter=list --list e2e/sessions/recently-done-sessions-select-ad-hoc-development.spec.ts` selected one Chromium case. The listing verifies the runner route. The slice owns the new second-machine journey. |
| Refinement closure still releases the assignment with its accepted result in slice 7 | Ran `preparation-assignment-land.test.mjs` against a temporary remote. The accepted snapshot retained the queued story's recorded facts, removed only its own assignment and kept the other profiles. The new session record has its own acceptance after that snapshot. |

## Outside-in proof

| Promise | Owning slice and observation |
| --- | --- |
| One portable session record for an accepted standalone result | 1. Invoke the Land publication path with an authorized temp Git origin, then read the UUID JSON and diff its pair from an independent clone. Inspect the actual commit and file changes. |
| Discover and review on the second machine | 2. Browser journey through the standalone Done entry and existing review page using a second configured checkout and empty launch storage. Open the actual file diff after origin advances. Backend cases prove wrong project, unknown UUID, missing objects and off-comparison file handling. |
| Retry after work or record acceptance | 3. Interrupt record publication before acceptance and lose its response after acceptance in separate temp-origin cases. Resume at the first unfinished stage, with one work publication, one UUID file and an unchanged close time. |
| Include earlier trunk and story-branch work with faithful attribution | 4–5. Drive execution publication and wrap-up using real Git. Read every recorded comparison from a fresh clone and assert the first and later changes, the absence of an intervening writer's file, and resolvable branch hashes after retirement. |
| Shared changes carry visible uncertainty | 6. Publish overlapping shared-checkout runs separated by a pull. Review the same runs and their warning on the receiving machine. Assert that pulled-only and unpublished edits are absent. |
| Workflow and story association | 7. Close a refinement and ad hoc follow-up for the same story. The published tree contains independent UUIDs with the correct workflow and story association. Execution variants are proved in 4–5. |
| 30-day lifetime | 8. A controlled clock proves availability just before expiry and removal at expiry. An authorized publication prunes the aged JSON, preserves a live record and leaves the aged one in the earlier published commit. |

## Ordered slices

### 1. Publish the standalone session’s accepted comparison

Type: Behavior
Status: planned

**Behavior.** A standalone Land closes with an accepted owned suffix. A reader
cloning origin can resolve the session UUID and read the published file edit from
the recorded commit pair. A local-only or rejected work publication produces
no published record. Use the accepted publisher comparison, a kept close
identity and the authorized trunk route without requiring a Dashboard.

**Proof.** Distribution fixture invokes the production Land workflow boundary
and reads the record and its Git diff from a separate clone. Exercise the
work-publication refusal at the same boundary.

### 2. Open a published standalone comparison on a second machine

Type: Behavior
Status: planned

**Behavior.** Given a published record and a newer revision of trunk, a
configured second machine with empty launch history shows the standalone Done
entry and opens the original comparison and file diff. An originating machine
with matching local evidence shows one entry and retains its native controls.
Records resolve through the configured source. Off-comparison file requests
are refused and missing Git objects explain the gap.

**Proof.** An E2E case in `e2e/sessions/` uses actual published Git data and the
existing [review page object](../../../dashboard/test-support/reviewChangesPage.ts).
Use the existing backend review admission seam for the project, file and
missing-object checks. Preserve the kept-local and story review cases.

### 3. Resume publishing the same close record

Type: Behavior
Status: planned

**Behavior.** The work is accepted and the record publication fails or loses
its acknowledgement. The workflow can resume the record before retirement,
keeping the original UUID, time and ranges. A later target advance still
allows recognition of an accepted record. A conflicting record under the same
UUID is surfaced instead of replacing its evidence.

**Proof.** Use real remote acceptance and a refused or interrupted record
publication with the existing publication recovery entry point. Assert commit
counts and record bytes on the remote after retry as well as the independent
work and record outcomes.

### 4. Recover earlier trunk publications at wrap-up

Type: Behavior
Status: planned

**Behavior.** An execution session publishes separate trunk increments,
another session lands between them, and the first closes through Story Wrap-up.
Its UUID resolves its accepted ranges, including any accepted retry rewrite,
with neither the intervening commit nor the record commit in the comparison.
Keep per-publication evidence beyond the first trunk landing.

**Proof.** Use the distribution execution-increment and trunk-closure
entry points against one temp origin. From a fresh clone, inspect the record's
diffs and confirm both attributable edits and the absent intervening file.

### 5. Keep story-branch comparisons after integration

Type: Behavior
Status: planned

**Behavior.** Story Branch Mode publishes an earlier increment, integrates and
retires the branch. The close record preserves the attributable branch ranges
and any distinct landing changes. A second clone can inspect the original
published hashes without duplicating the merged contribution.

**Proof.** Drive the history-preserving integration and retirement boundary
against a real temp origin with an intervening trunk commit. Resolve the
record from a default-branch-only clone after the execution branch is gone,
and verify its exact edits and commit membership.

### 6. Disclose ambiguity in a shared checkout

Type: Behavior
Status: planned

**Behavior.** Two sessions share a checkout while producing published commits.
At close, the comparison lists the observed ranges and indicates which may
include shared work. If the log includes a pull or commits that remain local,
those stay out of the recorded contribution. Use the existing Default main
interpretation of checkout-log and overlap evidence at the close boundary.

**Proof.** Run the real shared-checkout log reader and authorized publication
through a focused fixture. Check the published record in a second checkout
and use the existing standalone comparison reader to observe the warning and
exact files. Preserve the current Done capture cases.

### 7. Publish refinement and ad hoc story follow-up associations

Type: Behavior
Status: planned

**Behavior.** A refinement closes through Land and a later ad hoc session
publishes a follow-up to the same story. Each publishes its own UUID and
correct workflow and story identity. The refinement keeps its normal
assignment release as part of the accepted preparation result.

**Proof.** Drive both closure paths and read the two records and the released
assignment from the accepted remote snapshot. The records resolve separate
comparisons even though their story identity is the same.

### 8. Expire current session records

Type: Behavior
Status: planned

**Behavior.** At 30 days, a published session leaves current review. The next
authorized session-record publication removes expired files from its current
snapshot while keeping live records. Reconciliation preserves a concurrent
writer's live file. The original accepted snapshot still contains the aged
record and UUID.

**Proof.** Use a controlled clock at the published read and close boundaries.
Read just before and at expiry, publish with contending temporary writers, then
compare the current and earlier remote snapshots.

## Local gates

- Apply the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  Use [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [Dough Page Objects](../../../.agents/skills/dough-page-objects/SKILL.md)
  when their test selection applies. Keep default timeouts and omit
  `test.slow()`. Apply the maintainer skill-authoring guidance if editing
  distributed workflow guidance.
- Use `caffeinate -s -i` on AC power for long macOS runs under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
  Put Bash 5 on `PATH` for the distribution test runner. Run the focused
  distribution checks using `npm test -- <paths>`, the changed Dashboard
  checks through the backend or frontend npm runner, and the focused browser
  journey with `npm run test:e2e -- <spec>`. Check Dashboard types after
  changing its contract or consumers. Run the relevant lint gate.

## Plan review

Slice-plan refinement was not needed. The initial record and its reader are
independently observable outcomes. Subsequent slices extend the same
comparison contract across retry, earlier publications, uncertainty, workflow
association and expiry, with their own end-to-end observations. No remaining
slice-specific concern was identified.
