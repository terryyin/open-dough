# Follow published progress and read Board records from local Git

**Status:** awaiting story refinement — not ready for slice-plan refinement or execution

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#follow-published-progress-from-local-git)

**Identity:** SEED-430#follow-published-progress-from-local-git

**Split from:** SEED-430#read-published-project-data-from-local-git, whose
original slices 3–8 became slices 3–8 here, after two correction slices from plan 853's retrospective. That story opens and refreshes
the Board at verified trunk and moves Board-opening fixtures to real origins;
this plan builds on its observation.

## Goal and scope

See the source story. Callers still using REST retain their current behavior
until the slice that moves them or the follow-up that owns them.

## Current decisions

- Follow [Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
  [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  makes origin authoritative and separates the Review repository from the
  execution checkout. [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  guides the shared domain model through the server, wire contract, and UI.
- Extend [Review repository](../../../dashboard/server/reviewRepository.ts)
  and its [bounded Git fetch](../../../dashboard/server/gitTargetFetch.ts).
  Reuse [SharedObservation](../../../dashboard/server/sharedObservation.ts)
  for lifetime, bounded waiters, and fresh demand. Match a project and
  authorized origin, the required refs, and freshness before joining a check.
  Let an uncovered demand share the next eligible check. Publish only
  verified revisions, branch absence confirmed by a successful probe, and
  the corresponding time. Use the same observation through the Board and
  Review. The subscriber that disconnects releases only its own wait.
- Use [published story history](../../../dashboard/server/publishedStoryHistory.ts)
  and the existing Git reader seams for local objects. Keep the pinned
  reader contract and existing admission predicates at
  [authenticated reads](../../../dashboard/server/authenticatedRead.ts),
  [reachable paths](../../../dashboard/server/reachablePaths.ts),
  [branch reachability](../../../dashboard/server/branchReachability.ts),
  and [records beside the backlog](../../../dashboard/server/recordsBesideBacklog.ts).
  Use a source-authorized, verified observation to admit a pin. Keep that
  object available for the already-admitted read lifetime across successful
  deletion or rewrite and reuse the existing lifetime bounds.
- Keep each published observation atomic, including metadata. Use immutable
  commit IDs for reads and keep an in-progress fetch from changing any
  visible pin or timestamp. Advance the confirmation time on a successful
  unchanged probe. Keep observation start time for accepted-launch
  reconciliation and report failed attempt time separately. Treat ambiguous
  transport failure as unavailable. An explicit access refusal takes the
  established refusal path. Confirmed local object presence has no effect on
  authorization.
- Follow North Star's
  [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [plain Vitest boundary](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Extend the production seam or reuse existing fixtures. For focused unit
  cases, use a configured project, an admitted revision or required-ref
  demand, and a real fixture Git repository; substitute an origin response
  or provider only where the case must control timing or failure. Keep
  browser proof at user-visible transitions.
- Before editing [sourceRevisionStream.ts](../../../dashboard/server/sourceRevisionStream.ts)
  (255 lines), slice 3 separates per-subscriber SSE delivery and teardown
  from demand for the project observation. The stream registry,
  authenticated read boundary, and HTTP fallback keep their current
  lifecycle and wire behavior. The stream boundary and browser journey
  below protect the split.

## Premises and available baselines

| Consuming operation | Observation | Remainder |
| --- | --- | --- |
| Git advertisement, exact fetch, and local object check | In an isolated bare origin on Apple Git 2.50.1, `ls-remote --refs origin refs/heads/main refs/heads/story/watched` reported both heads. Advancing the branch after the probe caused the exact fetch to land the newer head. After deletion a successful probe returned trunk alone while the old tracking ref and object remained. The object was still readable after removing the tracking ref in that run. An unreachable origin and loopback HTTP 401, 403, 404, and 503 all exited 128. | The transport and failure classification are settled in the seed's transport evidence. Slices 4–5 exercise the race and retention through the Dashboard rather than relying on raw object persistence. |
| Published comparison open and exact file admission | At `1c0272d6f`, `caffeinate -s -i npm run test:dashboard:backend -- story-review-completed-shared-fetch.spec.ts story-review-completed.spec.ts story-review-published-taken.spec.ts --workers=1 --reporter=line` passed 14 cases. Two Done opens shared a fetch. A renamed execution checkout still allowed the comparison and files, and Taken named file reads stayed local while origin moved. An unpublished local commit and an unlisted file remained refused. | Slice 7 exercises coalescing across Board and Review, including their different deadlines and branch demand. Slice 5 exercises deletion and rewrite through the new pin admission path. |
| Board's live progress and recovery cues | At `1c0272d6f`, `caffeinate -s -i npm run test:e2e -- auto-refresh-branches.spec.ts auto-refresh-recovery.spec.ts --workers=1 --reporter=line` passed 3 cases. The REST fixture advanced branch progress with trunk fixed and displayed the branch deletion cue. The Board preserved the last good snapshot during a failed check and recovered. | These cases establish current UI meanings. Slices 3–5 replace the provider fixture, building on the real-origin Board fixtures the first story introduces, at the changed boundary and count Git operations against a real origin fixture. |
| Existing wire admission and downstream consumers | At `1c0272d6f`, `caffeinate -s -i npm run test:dashboard:backend -- authenticated-read-containment.spec.ts authenticated-read-done-catalog.spec.ts authenticated-read-boundary.spec.ts published-session-listing.spec.ts authenticated-read-revision-stream.spec.ts agent-launch-follow-up-story.spec.ts --workers=1 --reporter=line` passed 30 cases. The endpoint refused cross-site, invalid, and unlisted reads, preserved project scoping and exact session pins, and shared one SSE listing. The follow-up refused a missing or unreadable Done record and accepted admissible facts. | Slices 3, 6, and 8 replace the GitHub dependent parts of these observations with real origin evidence. The existing session unit cases still own malformed sessions and ordered ranges. |
| Board check request count | Plan 853 slice 4 (2026-11-27, Apple Git against a local-file bare origin, load ~19): a cold Board check reached origin twice (`ls-remote` probe, fetch into `refs/open-dough/board/<branch>`), about 150 ms (69 ms probe + 80 ms fetch); a warm check whose confirmation record matched the advertised head reached it once (probe only, 39–67 ms). | Counting baseline for "one advertised check per covered demand"; local-file transport, not GitHub HTTPS, so timings are indicative only. |

These observations are baseline proof. The slices below own discrimination
for new behavior and the relevant unchanged consumers. Use the
[consumer trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
when changing a reader or fixture. In particular, trace Board observation and
publication reconciliation, branch and comparison admission, Done follow-up,
and any shared fixture still serving an Intent or CI reader before removing
a path.

## Ordered slices (provisional)

### 1. Report a failed confirmation whatever revision is shown

Type: Behavior
Status: planned
Correction from the [plan 853 retrospective](../853-refresh-published-board-in-place/PLAN.md)
(SEED-430#refresh-published-board-in-place, `d56cd6957..e5fcbb39b`).
Behavior: When a verified check cannot record its confirmation, the server
answers the former confirmation marked `unrecorded`; the client raises the
existing read failure beside the shown view whatever revision it shows.
Today `dashboard/src/publishedWorkRead.ts` raises it only when the shown
revision equals the answer's, so after an automatic advance to B (which
records nothing on the server) a Refresh whose write fails silently moves
the Board back to A with A's old time. Decide with the story whether a cold
open with nothing shown also reports the failure beside the former view.

Proof: `readPublishedWork` unit cases with an injected read source: shown B,
answer `{revision: A, unrecorded}` keeps B and reports the failure (fails with
the condition reverted); a later time at the same revision advances. Then
narrow `e2e/observation/board-refresh-recovery.spec.ts`'s "cannot record its
confirmation" step and `board-refresh-unchanged.spec.ts` to what only a
browser journey proves, with the new unit and `board-confirmation.spec.ts`
cases surviving.

### 2. End stalled Review fetches through the owned transport

Type: Behavior
Status: planned
Correction from the same retrospective (pre-existing weakness that plan 853
slice 1 diagnosed for the Board check).
Behavior: Review's quiet sync (`dashboard/server/reviewRepositoryStorage.ts`)
and `fetchGitTarget` (`dashboard/server/gitTargetFetch.ts`) run remote
transfers through `fetchGitTransport`, so an aborted or stalled fetch ends
with its transport helpers and releases the repository's serialization slot.
`runGitUntilClosed` stays for local mutations only.

Proof: backend held-transfer cases for `syncedReviewRepository` and
`fetchGitTarget`, mirroring `dashboard/backend-tests/review/verified-origin-trunk-deadline.spec.ts`:
the gate process ends after the abort and the next sync starts; each fails
before the change.


### 3. Follow trunk automatically through the same check

Type: Behavior
Status: planned
Behavior: Given a visible Board and an origin trunk advance, the revision
stream or its HTTP fallback produces the same verified observation as
Refresh. Departing tabs release their wait while a remaining tab still
receives its update. Keep the existing pace and visibility behavior.

Proof: Exercise the [revision stream boundary](../../../dashboard/backend-tests/observation/authenticated-read-revision-stream.spec.ts)
and the [browser journey](../../../e2e/observation/revision-stream.spec.ts).
Count project checks for overlapping subscribers and HTTP fallback. Exercise
a fresh demand during an already-running check and verify that it joins
the next eligible check within its own wait bound.

### 4. Follow published story-branch progress

Type: Behavior
Status: planned
Behavior: Given a Taken story whose published branch moves while trunk
stays fixed, refresh and show the verified branch plan and commit time.
When a new trunk names a new branch, check that branch before reporting its
head. A race or missing required object cannot expose an unverified head.

Proof: Extend [automatic branch refresh](../../../e2e/observation/auto-refresh-branches.spec.ts)
with a real origin, same-trunk branch movement, and a branch newly named
at a new trunk. At the read boundary hold the transport between probe and
fetch and change the ref or withhold its objects. Inspect the observed
revision and time and the remote operation count. Expect local reads of the
admitted plan and time and refusal of an unrelated branch or path.

### 5. Report confirmed branch deletion and preserve open pins

Type: Behavior
Status: planned
Behavior: Given an admitted pinned detail, delete or rewrite its branch on
origin and refresh. The current Board shows the confirmed absence or new
head. Reopening the already-admitted detail during its read lifetime returns
the original revision. A failed probe leaves the last confirmed branch
state and the previous time.

Proof: Check Board cues and the pinned file boundary under deletion,
rewrite, and an ambiguous failure. A different revision merely present in
the bare repo is refused. Exercise retained pins even across the storage
cleanup the implementation permits. Use the same verified observation
model as slice 4.

### 6. Open the Board's published records at their pins

Type: Behavior
Status: planned
Behavior: Given a verified Board revision, open its reachable story
documents, assignment, Done details, or published session, and request a
follow-up from that Done record. Read the exact admitted records and honor
the existing missing, malformed, and unlisted outcomes.

Proof: Use one typed pinned tree and blob reader through the existing record
handlers. Exercise the Board journey and
[authenticated read](../../../dashboard/backend-tests/observation/authenticated-read-boundary.spec.ts),
[Done catalog](../../../dashboard/backend-tests/observation/authenticated-read-done-catalog.spec.ts),
[session listing](../../../dashboard/backend-tests/review/published-session-listing.spec.ts),
and [follow-up](../../../dashboard/backend-tests/launches/agent-launch-follow-up-story.spec.ts)
boundaries. After the sync, count zero remote operations and zero GitHub API
calls for these records. Check refusals and timing at the same boundary.
Keep provider calls for clients still using REST and remove only readers
or caches whose final caller moved.

### 7. Share a project refresh across Board and Review

Type: Behavior
Status: planned
Behavior: Given a Board check in progress and a Review open that needs the
same evidence, both use the verified result. A Review with an additional
required ref joins the first eligible check covering it. File switching
uses the admitted comparison locally and a failed refresh preserves the
readable comparison or explains cold unavailability.

Proof: Concurrently drive two Board tabs and opens of Taken and Done
reviews, including the existing landed and published session paths. Count
one advertised check per covered demand, fetch only changed or missing
objects, and keep comparison pins from the admitted observation. Compare
the established Review's case-specific status and timed-out origin behavior.
Assert zero remote operations for file switches inside and outside admission.
`story-review-offline-sync.spec.ts` timed out three cases at the 5 s
default under a full backend run at load 11–13, while passing alone in
2.3–3.2 s per case. Make its Review syncs independent of machine load at
this boundary without weakening its assertions.

From plan 853: the Board keeps `refs/open-dough/board/<branch>` plus its
confirmation record (`dashboard/server/boardConfirmation.ts`) while Review
keeps its tracking ref plus sync record; settle one record of what is
current. Retire `holdLaterTrunkTransfers`' `reviewOnly` process-ancestry
gate (`dashboard/test-support/laterTrunkTransfers.ts`) with the shared
check, and publish automatic observation through the same confirmation
record so the interim `confirmedAt ?? retrievedAt` in `publishedWorkRead.ts`
retires.

### 8. Confirm accepted publication at the shown revision

Type: Behavior
Status: planned
Behavior: Given an accepted publication and a confirmed Board revision,
check whether the shown commit contains the accepted publication. Reconcile
the local launch only from verified containment, with the existing
observation time and failure meanings.

Proof: Exercise the [containment boundary](../../../dashboard/backend-tests/observation/authenticated-read-containment.spec.ts)
with equal, descendant, behind, divergent, missing, and unreadable
evidence. Confirm the dependent pending-launch cue reconciles only when the
admitted revision contains the accepted SHA. Count zero provider comparison
calls. Remove the superseded comparison path if it has no other caller.

## Local gate

Use slice-focused checks and Dashboard typecheck for the changed boundary.
Run long local checks fully awake under
`caffeinate -s -i` on AC power.
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Apply the test conventions in [AGENTS.md](../../../AGENTS.md) before
authoring or changing proof.
