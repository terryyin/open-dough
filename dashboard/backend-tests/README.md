# Dashboard Backend Test

Focused dashboard server and test-runtime tests live here, beside [Dashboard Test Support](../test-support/)
and `../frontend-tests/`. They prove server behavior, its variants and
failures in this process through typed handlers and their request
admission, without a started server or a browser workflow. Older cases
still enter at HTTP, WebSocket, stored-file and command boundaries until
their family is renovated.

Their product collaborators are the boundary under test, real Git origins,
and the installed start. Only external boundaries are substituted, and each
spec names its substitutes: GitHub through the synthetic `gh` and
`FakeGitHub`, agent hosts through the synthetic `claude`, `codex` and
`cursor`, and the notification sender through the synthetic
`terminal-notifier`. A case that needs a browser to observe a product rule
belongs to a representative workflow in [`../../e2e/`](../../e2e/README.md),
and a presentation case in `../frontend-tests/`.

## Which entry a case uses

Call the typed handler in this process on plain Node Vitest, in a spec that
imports its `test` from `vitest`. When a handler accepts a store file, give
each case a private file and use the store's document format, such as
`makeMe.aStoredStoryNotesDocument` for Story Notes. The adapter's request
admission is a unit case too: it takes the request as typed values (method,
URL, body reader) and any process-wide lookup as a function, and the case
passes plain values. A new case never starts a server, mounts a boundary or runs on
Playwright. A behavior that truly needs a started server or a browser is an
end-to-end journey in [`../../e2e/`](../../e2e/README.md); the boundary's
shared origin, method, caching and status framing stay with their own
existing cases.

Story Notes is the reference family: `review/story-notes.spec.ts` calls
`storyNotes(file, project, change?)` from `dashboard/server/storyNotes.ts`, and
`review/story-notes-request.spec.ts` calls its request admission,
`admittedStoryNotesRequest`. Dashboard Test Support is frozen: new cases add
only MakeMe builders to `../test-support/`.

The ad hoc review family is the second reference, and adds three rules.
A handler takes the state it reads as typed input, and only its adapter
reads process-wide stores: `storyReview` (`dashboard/server/storyReview.ts`)
and `reviewedFileDiff` and `reviewedFileText`
(`dashboard/server/storyReviewFileResponse.ts`) take a `ReviewInput`
(`dashboard/server/storyReviewInput.ts`) that carries the published source
and selected range or literal file fields. The shared adapter admits the
requested story and any named published session of that story. The
`review/published-session-review.spec.ts` and
`review/ad-hoc-review-landed.spec.ts` specs prove exact comparisons against
configured Git. `review/published-session-review-request.spec.ts` checks
query admission and the refusal of standalone selectors.
The branch result and its handoff are independent producer tests:
`review/ad-hoc-branch-result-supersession.spec.ts`,
`review/ad-hoc-session-branch-entry.spec.ts` and
`review/ad-hoc-branch-cursor-recovery.spec.ts` call `setRecordDoneAt`,
`recordSessionBranchEntry`, `replaceKeptSession`, `bindRecord` and
`deleteRecord` in this process on MakeMe kept records and real Git. A
declared branch is a MakeMe launch record composed with its entry at the
case's base through `withDeclaringLaunch`; the rest of the arrangement comes
from the Done fixture below.
[`branch-entry-proposal.spec.ts`](review/branch-entry-proposal.spec.ts)
checks that composed entry against the full entry `proposeBranchEntry`
proposes for an open launch on the same fresh worktree.

[`ad-hoc-session-commits-done.spec.ts`](review/ad-hoc-session-commits-done.spec.ts)
and
[`ad-hoc-session-quiet-done-receipts.spec.ts`](review/ad-hoc-session-quiet-done-receipts.spec.ts)
call typed completion delivery and Done marks and read the saved session.
[`done-kept-session-commits.spec.ts`](review/done-kept-session-commits.spec.ts)
checks Done leaves the working tree and unpublished commit intact.
[`kept-commits-release.spec.ts`](review/kept-commits-release.spec.ts) calls the
kept-record store for deletion and expiry, and
[`default-launch-start-facts.spec.ts`](review/default-launch-start-facts.spec.ts)
reads the start from the execution checkout.

The Done family states each case as one value from
[`aDoneCaptureCase()`](support/doneCaptureCaseBuilder.ts): a checkout whose
history predates the case, its named launches with their times, and dated
`makeMe.aCheckoutWork`, in minutes before the case's clock (`at`). Its
machine-store effects, such as `keep` and `markDone`, stay in
[`doneCaptureCase.ts`](support/doneCaptureCase.ts).
Compose an already-Done launch with `makeMe.aLaunchRecord` when the Done
producer is outside the case. Mark Done through a private launch store and
[`setRecordDoneAt`](../server/recordDoneAt.ts) when proving a delivery candidate or Done settlement. Observe the saved
record, checkout and delivery refs.

Delivery observation cases pass composed Done records to
[`observedSessionDeliveries`](../server/observedSessionDeliveries.ts), with
real Git for one exact delivery and substituted head reads and inspections
for the rest. The
[adapter cases](review/ad-hoc-manual-landing-observation.spec.ts) give
`sessionLandingObservations` an explicit `ObservedLandingStore` and observe
the landing pins a kept, changed or failed write leaves.

Older cases still prove the boundary the server mounts on Playwright, as
below. They are not a pattern for new cases: each moves to a unit case or, if
essential, to an end-to-end journey when its family is renovated.

Prove the boundary the server mounts, in this process. Call that boundary's
exported install, mounted on an HTTP server the test owns
(`../test-support/support/inProcessBoundaryHttp.ts`). The authenticated-read
fixture (`../test-support/support/inProcessAuthenticatedRead.ts`) is that mount
with a private `HOME` and a synthetic `gh`. The request stays a loopback
HTTP request, so origin refusal, status, body, and response headers are the
boundary's. Give the process the private `HOME` and the synthetic hosts the
case names. A case that needs a clean slate installs a new boundary. One
install shared across cases is a choice, as one server shared across cases
is today.

To mount the dashboard's local boundaries together, call
`startDashboardServer({ mode: "boundary", mountBoundary: true })`. This
uses the test worker's HTTP server and a Cursor runner stand-in. The mount
owns the worker's server environment until it closes. Only one dashboard
can mount in a worker at a time.

`startDashboardServer` defaults to the live server. Set `liveServer` on the
start that requires it and name the reason:

- a separate process: its environment, a preload, a pid, a signal, a
  process group, or that a child did or did not start, including a restart
  that must be a new process
- a connection the handler does not own: a WebSocket upgrade, a stream held
  open on the socket, or the server closing while that connection is up
- the server program: that dev, preview, and the boundary server mount the
  same boundaries, or how that process reports its address and closes

Cursor host tests require a separate process with the real runner. Use the
live option with a specific reason when a fixture needs it, such as a
synchronous child that sends an HTTP request to the dashboard. Child
commands inherit the worker's environment while a mount is open unless the
case supplies their environment explicitly.

A lower function is the entry when its result is the whole fact the case
adds, and a boundary case already covers the admission once. The function
needs a stable domain result, such as whether a path matches a declared
location. A case whose facts are a status, a body, or that a host was not
asked stays on the boundary. Looking below the boundary is the usual result
of making a suite cheaper. A faster call that drops the admission is a
different case.

The test runtime's own contracts are proved here too, in `runtime/`: the
runners' reporter, selection, settings, output and cleanup, which run
Playwright itself on substitute specs (`../test-support/fixtures/`), and the shared
page fixture's drain, settled-page wait and held-read observation, whose
boundary is a page the harness opens rather than a product workflow.

## Running

`npm run test:dashboard:backend` runs only this group. Specs that import
`vitest` run on Vitest in Node (`../backend.vitest.config.mts`); the
rest run on Playwright from its own configuration
(`../backend.playwright.config.ts`). Playwright's global setup
(`../test-support/support/backendGlobalSetup.ts`) runs the fixture executables once,
gives the run a GitHub request root that admits no owner, and registers only
the artifacts backend specs request: the server bundle, the app build a
preview or static server serves, the installed start origins, the published
main sources and the story-columns history. A spec requesting any other run
artifact fails naming it. The run reads its own
`OPEN_DOUGH_DASHBOARD_BACKEND_SPLIT`, `_TIMES`, `_PROOF_RECORD` and
`_DEADLINE_MS`, keeps a failed run in `test-results/<start time>/` here, and
takes local full-suite admission only when unfiltered. Select files or tests
as with any group, for example
`npm run test:dashboard:backend -- sessions/ --grep 'alert'`; a direct
`npx playwright test --config <repository>/dashboard/backend.playwright.config.ts`
runs the Playwright specs the same way from any working directory.

CI runs this group as its own producer, the `dashboard-backend` job's shards
(`.github/workflows/ci.yml`), and publishes its cases under the
**Dashboard Backend Test** entry.

## Placement

Every backend `*.spec.ts` and case-definition module belongs to one service
feature folder. Choose the feature whose behavior the test proves,
irrespective of an older filename prefix. Harness fixtures that several
groups share stay in Dashboard Test Support. The browser suite's feature folders reuse
the same domain vocabulary where it still names protected service behavior.

| Folder | Responsibility |
| --- | --- |
| `configuration/` | Project registration, machine settings, credentials and preferences. |
| `launches/` | Work initiation, startup choices, reconciliation and automatic triggers. |
| `sessions/` | Session discovery, status, recovery, completion, reports and history. |
| `terminals/` | Interactive attachment, input, dictation, resizing and reconnection. |
| `review/` | Story comparisons, diffs, commit ranges and landed runs. |
| `intent/` | Purpose browsing, Proof, CI judgments, timing and optimization candidates. |
| `observation/` | Published-source consistency, freshness, refresh and read recovery. |
| `runtime/` | Serving, production updates and test harness operation. |
