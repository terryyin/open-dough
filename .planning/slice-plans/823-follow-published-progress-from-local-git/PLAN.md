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
- Switch the two automatic delivery paths in order. Both use the existing
  shared Git observation once switched. The former HTTP path can still
  supply a revision without a durable time until its cutover. Preserve the
  current effect of a standing REST limit on each scheduler and keep REST
  branch reads until the branch cutover.
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
| Git advertisement, exact fetch, and local object check | In an isolated bare origin on Apple Git 2.50.1, `ls-remote --refs origin refs/heads/main refs/heads/story/watched` reported both heads. Advancing the branch after the probe caused the exact fetch to land the newer head. After deletion a successful probe returned trunk alone while the old tracking ref and object remained. The object was still readable after removing the tracking ref in that run. An unreachable origin and loopback HTTP 401, 403, 404, and 503 all exited 128. | The transport and failure classification are settled in the seed's transport evidence. Slices 9–10 exercise the race and deletion through the Dashboard; plan 887 owns retention of admitted pins. |
| Board's live progress and recovery cues | At `1c0272d6f`, `caffeinate -s -i npm run test:e2e -- auto-refresh-branches.spec.ts auto-refresh-recovery.spec.ts --workers=1 --reporter=line` passed 3 cases. The REST fixture advanced branch progress with trunk fixed and displayed the branch deletion cue. The Board preserved the last good snapshot during a failed check and recovered. | These cases establish current UI meanings. The cutover slices replace REST provider controls with real-origin Board fixtures and count Git operations at origin. |
| Board check request count | Plan 853 slice 4 (2026-11-27, Apple Git against a local-file bare origin, load ~19): a cold Board check reached origin twice (`ls-remote` probe, fetch into `refs/open-dough/board/<branch>`), about 150 ms (69 ms probe + 80 ms fetch); a warm check whose confirmation record matched the advertised head reached it once (probe only, 39–67 ms). | Counting baseline for "one advertised check per covered demand"; local-file transport, not GitHub HTTPS, so timings are indicative only. |

These observations are baseline proof. The slices below own discrimination
for new behavior. Use the
[consumer trace procedure](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
before removing a REST path from Board observation or publication
reconciliation.

## Execution context

Story Branch Mode in the `follow-published-progress-from-local-git` worktree
on `codex/follow-published-progress-from-local-git`, with `origin/main` as
trunk. The Take at `67ea32dc937aca15bbcce14f5066bf6811fc1fff` was accepted
on trunk and on the execution branch. The starting revision was
`111d8d6f96ed8a8090c2882a74f122eae7422546`, under publisher
`dashboard-territory.local-open-dough` as Honoka-chan.

Checkout readiness passed with repository-pinned Node 24.21.0, locked npm
dependencies, headless Chromium, and `npm run typecheck:dashboard`. The
Codex observer follows push workflow `ci.yml` on the execution branch
with coordinator `honoka-430-2bf89426`. The original mailbox
`/tmp/dough-ci-501/watch-McSdYZ` stopped at the investigation handoff.
The current mailbox is `/tmp/dough-ci-501/watch-PLfZVx`, PID 94061,
session 24540, cell `g768:7`.

## Ordered slices

### 1. Report a failed confirmation whatever revision is shown

Type: Behavior
Status: done
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

Accepted proof: the warm and cold regressions failed before the production
change. The candidate passed the three `published-work-confirmation` cases,
their six frontend consumer cases, both `board-confirmation` backend cases,
eight browser cases covering Board and launch recovery, and Dashboard
typecheck. The independent refactor reused the shared endpoint in the
unchanged-Board case, which passed again with typecheck. The browser proof
retains the warning and recovery through a real failed confirmation write.

CI repair: the frontend job in [run 46020043455](https://github.com/terryyin/open-dough/actions/runs/46020043455)
observed the blank Start test before its terminal presentation effect. This
branch imports the test fix from `c446520f5`, which waits for one presentation
and still checks the record, control, and focus. All four focused Chromium
cases and Dashboard typecheck passed. The full hosted frontend job passed
on `f93c21c4e`, and all jobs passed on `759d6c4d4`.

### 2. Separate stream delivery from observation demand

Type: Structure
Status: done

Change: split `sourceRevisionStream.ts` so per-subscriber SSE delivery and
teardown sit apart from the project's observation demand, with unchanged
wire behavior. Enables the stream cutover to the verified check.

Proof: existing `authenticated-read-revision-stream.spec.ts` and
`authenticated-read-revision-stream-setup-departure.spec.ts` pass unchanged.

Accepted proof: all 11 stream and setup-departure checks passed before and
after the extraction. Eight HTTP fallback cases, 17 browser stream and
fallback cases, and Dashboard typecheck also passed. The independent review
confirmed the ownership split and retained the proof without edits.

### 3. Keep the browser stream proof focused on the tabs

Type: Structure
Status: done

Each of the three journeys in `revision-stream.spec.ts` keeps its browser
promise: a quiet streaming page avoids the fallback, two open tabs show
the next published Board without Refresh, and hiding a slot holder lets a
checking tab stream. Replace provider-specific synchronization with the
page's observable requests, stream events or cues. Keep the independent
origin-operation and backlog-reuse observations at the backend while
preparing for slice 4.

Proof: all three Chromium journeys and the 11 unchanged backend stream and
departure cases. Confirm which backend observation covers the existing
single-backlog-read assertion before removing it from the browser.

Accepted proof: three Chromium cases and 11 existing boundary and
departure cases passed, with Dashboard typecheck. The boundary still proves
one listing per tick. The browser retains the exact single REST backlog
read at B until the stream's verified check supplies replacement proof.
The delivery review found no refactor candidate in the test-only change.

Hosted verification stopped at a frontend runner disconnect. See the
[diagnosis record](diagnosis-frontend-browser-connection.md) for the evidence
and the bounded attempt to identify its cause.

The developer authorized fixing the reproduced trigger and continuing.
The frontend Vitest config now suppresses Vite's HMR-disconnect reload
on the orchestrator page. The two-spec probe passed all five cases
after forcing HMR loss, and forcing Vitest API loss still failed with
the expected signature. Dashboard typecheck and a normal full run of
332 frontend files passed. The
[hosted frontend job](https://github.com/terryyin/open-dough/actions/runs/46085226701/job/140793121612)
also passed with this guard. The natural trigger in the original failed
job remains unattributed.

A separate [hosted backend failure](https://github.com/terryyin/open-dough/actions/runs/46085226701/job/140793121599)
found a file before the Codex daemon wrote its startup record. The
startup spec now waits for the complete record with the expected working
directory. The scratch open-before-write check, five startup cases, and
Dashboard typecheck passed. Hosted CI will check the startup spec under
the backend shard's ordinary concurrency.

### 4. Follow trunk through the verified revision stream

Type: Behavior
Status: done

Behavior: Visible Board at A → origin trunk advances to B → the revision
stream produces the same verified observation as Refresh, recorded through
the confirmation record. While origin stays unchanged, only the time
advances. Leaving one stream releases its wait while another tab still
receives the verified observation. Keep the existing HTTP fallback in
place until slice 8.

Proof: the [revision stream boundary](../../../dashboard/backend-tests/observation/authenticated-read-revision-stream.spec.ts)
against a real origin counts project checks for overlapping subscribers
and observes arrival, departure and the last close. The browser shows B
without Refresh, then shows later confirmation at unchanged B. Trace and
re-prove the affected stream-return, visibility, stopped, lost, and
setup-departure cases. Preserve credential refusal, unavailable and
failed-confirmation outcomes.

Accepted proof: two tabs advanced to B without Refresh and later showed
a new confirmation time with the same revision and retrieval time.
The real-origin boundary counted one shared cold probe and fetch, a
warm probe alone, and no new check after the last tab left. The
independent refactor replay passed 24 backend, 15 mounted frontend,
and 21 end-to-end cases with Dashboard typecheck. Its measured boundary
includes held setup, the handover from HTTP, failed confirmation writes,
credential refusal, and the watched branch's interim REST limit.

### 5. Move fallback proof to the behavior each case owns

Type: Structure
Status: done

Before the HTTP cutover, locate the cases that count or intercept the
REST listing. Keep delivery cadence, transport loss, project isolation and
recovery at the boundary that exhibits them. Prove REST-only limits,
cooldown, sharing and request turns through the detail or branch reads
that still use REST. A case about the origin check itself keeps its
provider observation until cutover. Leave the product paths unchanged.

Proof: the touched HTTP and browser cases pass with their intended
behavior on the existing routes. Trace the retained provider controls
and name the ones the HTTP cutover must replace.

Accepted proof: 42 backend cases passed with REST-only sharing, queue turns,
failure wording, cooldown and diagnostics exercised through pinned detail or
branch reads. Five Chromium cases passed for standing-limit recovery and
Board-known limits, with Dashboard typecheck. The test-only change uses
existing request and page controls. Its direct setup keeps the different
pin, path and wait expected by each case visible.

Cutover evidence: an independent pinned REST read can set a core cooldown
before the Board learns of it. The HTTP fallback currently learns it from
the local owner's held-back reply to the listing. `readingLimit.ts` holds
the later, Board-known wait used by both schedulers. Preserve both behaviors
without dispatching a REST listing for trunk. The request owner's scoped
`KeptAdmissions.refusal` is where the machine wait is decided; the current
connection can ask only for an actual operation, so it exposes no status
query. The three migrated browser cases distinguish this machine-only wait
from the two Board-known detail cases.

The remaining REST controls are in the revision-check, HTTP, branch watch,
shared listing, subprocess-lifecycle and retained-answer backend cases.
Move origin failures, holds and counts to Git where they prove origin
behavior. Keep listing-specific proof at the interim branch-watch route.
Browser cadence, visibility, project isolation, handover and recovery cases
need their REST origin controls replaced at the owning boundary. The browser
owner-refusal and owner-replacement cases need the relevant REST owner
failure to remain observable through a request the owner still serves.

### 6. Read the shared request owner's standing core cooldown locally

Type: Structure
Status: done

The current HTTP cutover crosses two independent boundaries. First make the
machine's existing core cooldown observable through the authenticated local
owner. Reuse its checked scope, refusal and retry time without reserving a
GitHub turn, dispatching a provider request, or introducing another clock
or record. Keep current Dashboard delivery and ordinary owner commands
unchanged. Existing owner protocol peers can still exchange their current
read and rerun operations. The caller distinguishes an unsupported query
or unavailable owner from a confirmed wait and from an observed clear state.

Proof: through an actual owner connection, a pinned core request establishes
a wait and another consumer reads its remaining time without an upstream
call. When it expires the query reports clear. A search-only limit does not
hold the core query. Keep the real request owner's admission and replacement
checks and exercise compatibility with a peer lacking the new operation.

Accepted proof: a second authenticated consumer observed three seconds
remaining after advancing the isolated owner's clock, then clear at the
original deadline. The hold file and provider request ledger showed no
write or dispatch from the query. Separate cases proved that a search wait
does not affect core and that scope and request shape are checked. An older
protocol 2 peer answered an ordinary read after reporting the query as
unsupported. Independent review passed 42 Distribution cases, nine
Dashboard REST cases, and Dashboard typecheck.

### 7. Prepare HTTP fallback cases for the Git cutover

Type: Structure
Status: planned

Prepare the remaining proof named in slice 5. Ground origin-dependent
fixtures in the routed bare Git origins. Make scheduler assertions on
cadence, fallback delivery and project isolation independent of REST
listing details. Keep provider-specific listing proof on watched branches
where the route still uses REST, and exercise request-owner refusal and
replacement through a real pinned detail. Keep the product unchanged.

Proof: focused backend and browser selections exercise the same workflow
observations on the current route. Identify the assertions that must change
with the HTTP wire's verified confirmation and the remaining Git failure
substitutes needed at cutover.

### 8. Follow trunk through the verified HTTP fallback

Type: Behavior
Status: planned

The fallback observes changed and unchanged trunk through the same
verified check and durable time as the stream and Refresh. It retains the
pace and visibility behavior and shows a current failure beside the
former confirmed view. Remove the inferred confirmation time in
`publishedWorkRead.ts` once both automatic delivery paths carry the real
time.

Proof: the read boundary counts one check across overlapping subscribers
and an HTTP fallback. Fresh demand during a running check joins the next
eligible check within its wait bound. A browser with stream delivery
unavailable shows B without Refresh and shows the later time at unchanged
B. Re-prove remaining affected confirmation, check-return, visibility,
project isolation, held read and recovery cases at their owning boundaries.

### 9. Follow published story-branch progress

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

### 10. Report confirmed branch deletion

Type: Behavior
Status: planned

Behavior: Watched branch deleted on origin → a successful probe confirms
absence → the Board shows the branch is no longer published. A failed probe
keeps the last confirmed branch state and its time.

Proof: Board cue in `auto-refresh-branches.spec.ts` (deletion) and a
read-boundary case for the failed probe, both against a real origin.

## Story obligations

### G1. HTTP fallback confirmation

Reported: slice 4 — "The HTTP revision-check route still uses its existing listing and ref fallback and original wire shape."
Story clause: "Automatic observation (the revision stream and its HTTP fallback) runs the same verified Git check as Refresh and publishes through the same durable confirmation record."
Disposition: receiving slice 8

### G2. Verified watched-branch progress

Reported: slice 4 — "The watched branch’s REST listing is still reachable and supplies branches only."
Story clause: "The Board follows trunk membership and priority, Preparing and Taken assignments, and branch-only plan progress, including the plan's commit time, from verified heads."
Disposition: interim until slices 9, 10

## Plan review

The first preparation found that `SharedVerifiedOriginTrunk.demand`
already accepts fresh demand, and that branch heads still resolve through
`gh` in `branchHeads.ts`.

Execution at `759d6c4d4` found a wider proof boundary than the original
slice 3 named. Both delivery paths use `performRevisionCheck`.
`authenticated-read-revision-check-failures.spec.ts`,
`authenticated-read-shared-listing.spec.ts`, and
`authenticated-read-cooldown.spec.ts` control or count REST listing.
The Board's automatic recovery, limit and return journeys also control
that path. A single cutover would invalidate their setup alongside
changing the product. Prepare and switch each delivery path in turn.
The original branch progress and deletion slices are now 9 and 10.
Execution of the HTTP cutover exposed two independent gates within the
current slice. The local owner does not expose its already-held core wait,
which the old revision listing implicitly asks it to enforce. The remaining
HTTP and browser proof also needs preparation at the affected boundaries.
The split gives both gates and the actual HTTP cutover separate proof loops.
This keeps the same behavior and examples and uses the ten-slice limit
for subdividing the current slice during execution.

## Local gate

Use slice-focused checks and Dashboard typecheck for the changed boundary.
Run long local checks fully awake under `caffeinate -s -i` on AC power.
Follow the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
Apply the test conventions in [AGENTS.md](../../../AGENTS.md) before
authoring or changing proof.
