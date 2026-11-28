# Read Board records at their published pins

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#read-board-records-at-published-pins)

**Identity:** SEED-430#read-board-records-at-published-pins

**Split from:** SEED-430#follow-published-progress-from-local-git
([plan 823](https://github.com/terryyin/open-dough/blob/00f50db1827d870ecd899ba2e3cde097f7c38300/.planning/slice-plans/823-follow-published-progress-from-local-git/PLAN.md)) on
2026-11-27: its former slice 6, slice 5's pin retention, and slice 8. The
slices below are provisional input for this story's refinement.

## Current decisions (carried from plan 823)

- Use [published story history](../../../dashboard/server/publishedStoryHistory.ts)
  and the existing Git reader seams for local objects. Keep the pinned
  reader contract and admission predicates at
  [authenticated reads](../../../dashboard/server/authenticatedRead.ts),
  [reachable paths](../../../dashboard/server/reachablePaths.ts),
  [branch reachability](../../../dashboard/server/branchReachability.ts),
  and [records beside the backlog](../../../dashboard/server/recordsBesideBacklog.ts).
  Admit a pin only from a source-authorized, verified observation; keep that
  object available for the already-admitted read lifetime across deletion or
  rewrite. Local object presence has no effect on authorization.

## Premises and available baselines (carried from plan 823)

| Consuming operation | Observation | Remainder |
| --- | --- | --- |
| Existing wire admission and downstream consumers | At `1c0272d6f`, `caffeinate -s -i npm run test:dashboard:backend -- authenticated-read-containment.spec.ts authenticated-read-done-catalog.spec.ts authenticated-read-boundary.spec.ts published-session-listing.spec.ts authenticated-read-revision-stream.spec.ts agent-launch-follow-up-story.spec.ts --workers=1 --reporter=line` passed 30 cases. The endpoint refused cross-site, invalid, and unlisted reads, preserved project scoping and exact session pins, and shared one SSE listing. The follow-up refused a missing or unreadable Done record and accepted admissible facts. | Slices 1, 2, and 4 replace the GitHub dependent parts of these observations with real origin evidence. The existing session unit cases still own malformed sessions and ordered ranges. |

## Ordered slices (provisional)

### 1. Open trunk records at the verified pin

Type: Behavior
Status: planned
Behavior: Given a verified Board revision, open reachable stories, plans,
requests, documents, and assignments; read the exact admitted records with
zero remote operations and zero GitHub API calls, honoring the existing
missing, malformed, and unlisted outcomes.
Proof: one typed pinned tree and blob reader through the existing record
handlers, at the [authenticated read](../../../dashboard/backend-tests/observation/authenticated-read-boundary.spec.ts)
boundary and the Board journey.

### 2. Open Done records and published sessions at the pin

Type: Behavior
Status: planned
Behavior: Open the Done catalog and bodies and a published session, and
request a follow-up from the pinned Done record, read locally.
Proof: [Done catalog](../../../dashboard/backend-tests/observation/authenticated-read-done-catalog.spec.ts),
[session listing](../../../dashboard/backend-tests/review/published-session-listing.spec.ts),
and [follow-up](../../../dashboard/backend-tests/launches/agent-launch-follow-up-story.spec.ts)
boundaries; zero GitHub API calls; remove only readers or caches whose final
caller moved.

### 3. Keep admitted branch pins through deletion or rewrite

Type: Behavior
Status: planned
Behavior: An admitted branch detail keeps returning its original revision
during its read lifetime after the branch is deleted or rewritten; a
different revision merely present locally is refused.
Proof: pinned file boundary under deletion and rewrite, including across the
storage cleanup the implementation permits.

### 4. Confirm accepted publication at the shown revision

Type: Behavior
Status: planned
Behavior: Check whether the shown commit contains an accepted publication and
reconcile the local launch only from verified containment.
Proof: [containment boundary](../../../dashboard/backend-tests/observation/authenticated-read-containment.spec.ts)
with equal, descendant, behind, divergent, missing, and unreadable evidence;
zero provider comparison calls; remove the superseded comparison path if it
has no other caller.
