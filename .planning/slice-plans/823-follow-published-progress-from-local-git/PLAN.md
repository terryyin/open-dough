# Follow published progress from local Git

**Source:** [SEED-430](../../seeds/SEED-430-read-published-project-data-from-local-git.md#follow-published-progress-from-local-git)

**Identity:** SEED-430#follow-published-progress-from-local-git

**Resplit:** On 2026-11-27 the former 8-slice plan exceeded the slice limit
once its slices were sized. Former slices 1, 3, 4 and 5 (branch deletion
cue) are slices 1, 3, 4 and 5 here. Former slice 6, slice 5's pin
retention and slice 8 went to
[plan 887](../887-read-board-records-at-published-pins/PLAN.md). Former
slices 2 and 7 went to
[plan 888](../888-share-one-refresh-across-board-and-review/PLAN.md).

## Goal and scope

See the source story. Included: automatic trunk observation through the
verified check and the durable confirmation record, verified story-branch
progress and confirmed deletion, and the failed-confirmation notice.
Excluded: record reads at pins and containment (plan 887), and sharing the
check with Review (plan 888). Readers still using REST keep their current
behavior until the plan that moves them.

## Current decisions

- Follow [Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads).
  [ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  makes origin authoritative and separates the Review repository from the
  execution checkout. [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  guides the shared domain model through the server, wire contract, and UI.
- Extend [SharedVerifiedOriginTrunk](../../../dashboard/server/sharedVerifiedOriginTrunk.ts)
  and its durable [confirmation record](../../../dashboard/server/boardConfirmation.ts)
  rather than adding a second observation. Reuse
  [SharedObservation](../../../dashboard/server/sharedObservation.ts) for
  lifetime, bounded waiters, and fresh demand. Publish only verified
  revisions, branch absence confirmed by a successful probe, and the
  corresponding time, atomically with their metadata. An in-progress fetch
  changes no visible pin or timestamp. Keep observation start time for
  accepted-launch reconciliation and report failed attempt time separately.
  Treat ambiguous transport failure as unavailable; an explicit refusal
  takes the established refusal path.
- When the server answers the former confirmation marked `unrecorded`, the
  client reports the read failure whatever revision it shows; a cold open
  shows the former confirmed view with that failure.
- Before editing [sourceRevisionStream.ts](../../../dashboard/server/sourceRevisionStream.ts)
  (255 lines), slice 2 separates per-subscriber SSE delivery and teardown
  from demand for the project observation. The stream registry,
  authenticated read boundary, and HTTP fallback keep their lifecycle and
  wire behavior.
- Follow North Star's
  [direct production test seams](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows),
  and [plain Vitest boundary](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e).
  Unit cases use a configured project and a real fixture Git repository,
  substituting an origin response only where a case controls timing or
  failure. Browser proof stays at user-visible transitions.

## Premises and available baselines

| Consuming operation | Observation | Remainder |
| --- | --- | --- |
| Git advertisement, exact fetch, and local object check | In an isolated bare origin on Apple Git 2.50.1, `ls-remote --refs origin refs/heads/main refs/heads/story/watched` reported both heads. Advancing the branch after the probe caused the exact fetch to land the newer head. After deletion a successful probe returned trunk alone while the old tracking ref and object remained. The object was still readable after removing the tracking ref in that run. An unreachable origin and loopback HTTP 401, 403, 404, and 503 all exited 128. | The transport and failure classification are settled in the seed's transport evidence. Slices 4–5 here exercise the race and deletion through the Dashboard; plan 887 owns retention of admitted pins. |
| Board's live progress and recovery cues | At `1c0272d6f`, `caffeinate -s -i npm run test:e2e -- auto-refresh-branches.spec.ts auto-refresh-recovery.spec.ts --workers=1 --reporter=line` passed 3 cases. The REST fixture advanced branch progress with trunk fixed and displayed the branch deletion cue. The Board preserved the last good snapshot during a failed check and recovered. | These cases establish current UI meanings. Slices 3–5 replace the provider fixture with the real-origin Board fixtures at the changed boundary and count Git operations against a real origin. |
| Board check request count | Plan 853 slice 4 (2026-11-27, Apple Git against a local-file bare origin, load ~19): a cold Board check reached origin twice (`ls-remote` probe, fetch into `refs/open-dough/board/<branch>`), about 150 ms (69 ms probe + 80 ms fetch); a warm check whose confirmation record matched the advertised head reached it once (probe only, 39–67 ms). | Counting baseline for "one advertised check per covered demand"; local-file transport, not GitHub HTTPS, so timings are indicative only. |

These observations are baseline proof. The slices below own discrimination
for new behavior. Use the
[consumer trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
before removing a REST path from Board observation or publication
reconciliation.

## Ordered slices

### 1. Report a failed confirmation whatever revision is shown

Type: Behavior
Status: planned
Correction from the [plan 853 retrospective](https://github.com/terryyin/open-dough/blob/07e7c56a89041f123d48d79a5dba7ddd23e72f7b/.planning/slice-plans/853-refresh-published-board-in-place/PLAN.md#execution-complete)
(SEED-430#refresh-published-board-in-place, `d56cd6957..e5fcbb39b`).

Behavior: A Board showing B after an automatic advance → Refresh whose
confirmation write fails (server answers `{revision: A, unrecorded}`) → the
Board keeps B and shows the existing read failure. A cold open answered
`unrecorded` shows A with the failure. Today
`dashboard/src/publishedWorkRead.ts` raises it only when the shown revision
equals the answer's.

Proof: `readPublishedWork` unit cases with an injected read source: shown B,
answer `{revision: A, unrecorded}` keeps B and reports the failure (fails with
the condition reverted); nothing shown reports the failure beside A; a later
time at the same revision advances. Then narrow
`e2e/observation/board-refresh-recovery.spec.ts`'s "cannot record its
confirmation" step and `board-refresh-unchanged.spec.ts` to what only a
browser journey proves, keeping the new unit and `board-confirmation.spec.ts`
cases.

### 2. Separate stream delivery from observation demand

Type: Structure
Status: planned

Change: split `sourceRevisionStream.ts` so per-subscriber SSE delivery and
teardown sit apart from the project's observation demand, with unchanged
wire behavior. Enables slice 3 to swap the demand onto the verified check.

Proof: existing `authenticated-read-revision-stream.spec.ts` and
`authenticated-read-revision-stream-setup-departure.spec.ts` pass unchanged.

### 3. Follow trunk automatically through the verified check

Type: Behavior
Status: planned

Behavior: Visible Board at A → origin trunk advances to B → the revision
stream or its HTTP fallback produces the same verified observation as
Refresh, recorded through the confirmation record; an unchanged origin
advances only the time. A departing tab releases its wait while a remaining
tab still receives its update. The interim `confirmedAt ?? retrievedAt` in
`publishedWorkRead.ts` retires.

Proof: the [revision stream boundary](../../../dashboard/backend-tests/observation/authenticated-read-revision-stream.spec.ts)
against a real origin: count project checks for overlapping subscribers and
the HTTP fallback, and a fresh demand during a running check joins the next
eligible check within its wait bound. The
[browser journey](../../../e2e/observation/revision-stream.spec.ts) shows B
without Refresh.

### 4. Follow published story-branch progress

Type: Behavior
Status: planned

Behavior: Taken story whose branch moves while trunk stays fixed → next
check → the Board shows the verified branch plan progress and commit time
with the execution checkout absent. A new trunk naming a new branch checks
that branch before reporting its head; a race or missing object exposes no
unverified head.

Proof: extend [automatic branch refresh](../../../e2e/observation/auto-refresh-branches.spec.ts)
with a real origin, same-trunk branch movement, and a branch newly named at
a new trunk. At the read boundary hold the transport between probe and
fetch and change the ref or withhold its objects; inspect the observed
revision, time, and remote operation count.

### 5. Report confirmed branch deletion

Type: Behavior
Status: planned

Behavior: Watched branch deleted on origin → a successful probe confirms
absence → the Board shows the branch is no longer published. A failed probe
keeps the last confirmed branch state and its time.

Proof: Board cue in `auto-refresh-branches.spec.ts` (deletion) and a
read-boundary case for the failed probe, both against a real origin.

## Plan review

Slice-plan refinement was not needed: the resplit left five slices with one
outcome each. Premises checked on 2026-11-27 at `b3af0ad76`: `publishedWorkRead.ts`
raises the failure only when `shown?.revision === revision` (slice 1);
`SharedVerifiedOriginTrunk.demand` already accepts `fresh` demand (slice 3);
branch heads still resolve through `gh` in `branchHeads.ts` (slices 4–5
replace it). This review found no remaining slice-specific concern.

## Local gate

Use slice-focused checks and Dashboard typecheck for the changed boundary.
Run long local checks fully awake under `caffeinate -s -i` on AC power.
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Apply the test conventions in [AGENTS.md](../../../AGENTS.md) before
authoring or changing proof.
