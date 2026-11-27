# Prove published read admission in Node Vitest

**Source:** [Prove published read admission in Node Vitest](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#published-read-admission-via-vitest)

**Identity:** SEED-413#published-read-admission-via-vitest

## Execution context

Story Branch Mode in the owned worktree at
`/Users/terryyin/git/open-dough/.worktrees/prove-published-read-admission-in-node-vitest`
on `codex/prove-published-read-admission-in-node-vitest`. The starting
revision is `5e2e6e3553dfe051bf2856b34c5b12b7eb69c968`. Publisher
`dashboard-territory.local-open-dough` published the Take at
`effa82ff28ab1ed0080f263af4e875cd60be96d6` for Tsubomi-chan.
The integration checkout is `/Users/terryyin/git/open-dough`, with
`origin/main` as integration target. Ordinary increments publish to
the remote execution branch.

The Codex observer for `terryyin/open-dough` watches that branch using
GitHub Actions `ci.yml` (CI). Coordinator
`codex-published-read-bc80104e`, directory `/tmp/dough-ci-501/watch-ZQgD5X`,
PID 37392, shell session 42633, yielded cell `g708:11`.

Slice 3 CI run 45982087565, frontend job 140448265249, showed two failures
with active repair owners. The job's browser connection closed with
`VITEST_BROWSER_CONNECTION_CLOSED`, the defect Ai-chan owns in plan 881.
Its separate Done capture assertion missed the older run's location
request. Tsukasa-chan's exact repair `730fe3185` was already published on
`claude/choose-review-scope-from-a-compact-dropdown`. The containment writer
was quiescent when this ownership was confirmed and resumed in place.
No duplicate repair publication was needed. The CI diagnostic and job log
are retained under `ci-45982087565-*` in the checkout's Git proof directory.

Slice 4's CI Codex action failure was reproduced and repaired in
`abda7d2725059e5c18c61a9c7cdc0482dedd0fd9`. The
[diagnosis](diagnosis-codex-launch-done-action.md) records the failed
keypress during protected startup and the held-read before and after
checks. Slice 5's six paths were restored after repair publication.
The repair changes only a separate browser journey, so the focused
catalog, Board and Review evidence still applies.
The failed attempt's terminal inventory listed only that Codex failure.

## Goal and scope

Give Board and Review maintainers fast, direct proof of what an admitted
Dashboard read can return at the selected published revision and how the
reader learns about refusal, missing evidence and upstream failure. The
twelve observation specs below are the legacy selection. Every case needs
a named observable replacement or a maintained proof owner before removal.

The Board's verified Git open and the proof retargeting that preceded it
were delivered in [plan 856](https://github.com/terryyin/open-dough/blob/e4faafbdb/.planning/slice-plans/856-open-the-board-from-the-verified-git-trunk/PLAN.md)
and [plan 858](https://github.com/terryyin/open-dough/blob/bca2def1a/.planning/slice-plans/858-move-authenticated-read-proofs-off-the-board-ref-read/PLAN.md).
[Plan 823](../823-follow-published-progress-from-local-git/PLAN.md) owns
switching the remaining pinned Board reads and containment to local Git.
Refresh lifecycle, GitHub request ownership, Review comparisons, and new
provider behavior have separate owners.

## Current decisions

- [ADR 0002, Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  and the North Star topics [Make production code directly testable](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support)
  and [Plain Vitest for unit tests](../../NORTH-STAR.md#plain-vitest-for-unit-tests-playwright-only-for-e2e)
  govern the proof boundary. Exercise the production typed operation and its
  real policy and state, with a substitute only at the upstream service
  boundary or where a named fixture represents published input. Reuse the
  existing MakeMe repository and record builders. A Node HTTP proof in one
  focused spec keeps the real loopback, origin metadata, wire encoding, and
  request-close checks. Keep browser workflows with their existing E2E owners.
- [ADR 0008, Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  and [Share one refresh for published Dashboard Git reads](../../NORTH-STAR.md#share-one-refresh-for-published-dashboard-git-reads)
  keep origin authoritative and selected details pinned. The browser's
  `publishedWorkRead` calls the authenticated boundary. `requestedRead`
  chooses the typed read. `performedRead` routes its `PublishedSource` and
  pin to `reachablePaths`, `branchReachability`, `recordsBesideBacklog`,
  and the owning readers. Reuse those decisions and `PinnedTexts`,
  `BranchHeads` and `AvatarImages` where their state is under observation.
  Use the existing repository builder and real commits for bytes, history
  and membership that depend on Git. Use the current provider boundary to
  return those Git facts where the production operation still uses REST.
  Keep source-specific provider arguments, failures and call counts only
  where they witness an observable promise such as refusing before an
  upstream call or reading only changed blobs.
- Keep `performVerifiedTrunkRead` and the already-shared Git-open owner in
  place. Expose a typed operation from the existing dispatcher only where
  HTTP or unrelated collaborators obstruct direct proof. Narrow the
  collaborator types to the methods the operation consumes. Request
  tracking, error wording and response encoding keep their production
  owners. Pass the tracked signal into typed reads and let the adapter own
  request departure. Reuse each seam as slices reach it. Add no test-support
  wrapper or parallel admission rule. The likely production edit locations,
  including `authenticatedRead.ts` (243 lines), `performedRead.ts` (228),
  `requestedRead.ts` (233) and `pinnedMemo.ts` (247), are within the current
  250-line limit. Recheck before editing.
- Preserve the existing scope of each operation. Local request admission
  protects the launching user's authenticated credentials and processes.
  A configured source and its pinned publication determine scope, including
  which branch and path are eligible. Local object presence alone confers
  no admission. An unavailable answer is distinguishable from empty or
  absent published evidence. Profile attribution uses the published
  allocation and avatar lookup uses the usable source named for the
  matched account.

## Premises and baseline

The consuming operation was the maintained Dashboard Backend command in
this isolated preparation workspace at `8a2de0fff` on 27 November 2026.
Node 24.21.0, macOS on AC, one worker, default timeout, load about 28–31 on
16 logical CPUs. The exact legacy selection passed 84 Chromium cases in
31.49 s elapsed. The repeat below used the maintained proof reporter and
added the real-Git Node witness. It passed on the first attempt for all
90 cases, with 10.218 s summed legacy case time, 4.210 s summed Node case
time, and 39.90 s elapsed for the combined selection. See the legacy
counts below. The same command without `review/verified-origin-trunk\.spec\.ts$`
selects only the legacy family.

At the published Take above, the same command ran under
`/usr/bin/time -p` with the maintained `OPEN_DOUGH_DASHBOARD_BACKEND_PROOF_RECORD`.
On AC with Node 24.21.0, one worker and a launch load of 30.60/23.92/24.43
across 16 logical CPUs, all 90 selected cases passed on their first attempt
in 50.11 s wall time. The 84 Chromium cases summed to 10.884 s
(33 above 100 ms, maximum 1,255 ms). The six Node cold Git cases summed
to 4.883 s (all above 100 ms, maximum 1,876 ms). The twelve per-file
Chromium counts match the selection below. The checkout's Git proof
directory retains `start-baseline.json` and `start-baseline.log.run.json`.

```sh
caffeinate -s -i npm run test:dashboard:backend -- \
  'observation/authenticated-(avatar|branch-read-boundary|read-(boundary|containment|listed-records|refusal|committed-last|done-catalog(-gaps|-refusal)?|profile-addition(-refusal)?))\.spec\.ts$' \
  'review/verified-origin-trunk\.spec\.ts$' --workers=1
```

| Consuming operation | Observed result at the preparation revision | Plan consequence |
| --- | --- | --- |
| Board cold read and local Git proof | The canonical and branch specs opened the configured fixture origin, observed its revision and successfully read details. The six Node cases in `review/verified-origin-trunk.spec.ts` read exact backlog bytes, accepted a later probed commit, rejected a moved ref during transfer, and distinguished missing trunk, unreadable backlog, and refusal from unavailability. | Reuse Git origin/pin fixture setup and keep the named cold-open ownership. These Node cases cover the open itself. Later pinned record reads need their own proof. |
| Retargeted revision check and pins | `authenticated-read-boundary` observed the actionable login failure and sanitized diagnostic from the revision check, then exercised successful pinned bytes and provider encoding. `authenticated-branch-read-boundary` refused an unresolved head with 409, read the resolved plan, then admitted a head through a watched revision check. | Keep those check and read assertions with the stated slices. A cold-open-only proof cannot replace them. |
| Computation from pinned evidence | The refusal and commit-time specs distinguished unlisted paths from reachable files and their metadata. The containment group distinguished comparison direction, missing accepted commit, unavailable comparison and directed wait. Done reads distinguished an empty catalog, disagreement, a refused body and a failing or departed request. Profile and avatar cases distinguished repository selection, attribution, successful and failed image reads, reuse and refresh. | Convert the existing behavior, using each current spec's assertion as the starting obligation. Keep the checks for call avoidance, cancellation and caching where those are the behavior. |
| Git migration boundary | The same passed cases actually observed upstream content, branch, commit-time and comparison calls for pinned variants after the Git open, including the two mixed cold/open-and-pinned specs. | Preserve the current typed operations and upstream contract in this plan. Recheck the baseline if plan 823 lands first or changes a consuming path. |

## Ordered slices

Legacy paths are in `dashboard/backend-tests/observation/`. The parenthetical
counts are cases selected at the baseline, with expanded table rows counted
individually. Mixed files contribute to each named slice. Keep their remaining
cases running until the last successor is green. Each slice budgets 15 active
minutes or less and owns one proof loop. Keep any extraction within the
slice that first uses it. Apply the execution clock and split rule on overrun.

### 1. Admit an authenticated read from the local origin

Type: Behavior
Status: done

A request to the installed authenticated boundary reaches a configured
source only from its local origin and using the accepted method. Prove the
real socket and headers, including same-origin Fetch Metadata without
Origin, missing or foreign origin, an unknown source, and a rejected
method. Check that refusals make no upstream call. On an admitted revision
check that fails upstream, preserve no-store, actionable login guidance and
the omission of raw diagnostics. Use the installed HTTP adapter and a
controlled upstream failure only for these transport observations. Keep
request-shape refusals with the typed read variant they constrain.

Proof owners are the wire cases in `authenticated-read-refusal.spec.ts`
(22 across slices 1–3, 5–6) and the failure cases in
`authenticated-read-boundary.spec.ts` (4 across slices 1–2).
Reserve a single Node HTTP spec for genuine wire assertions. Move each
remaining typed case when its owning slice has proof.

Accepted proof. [authenticated-read-http.spec.ts](../../../dashboard/backend-tests/observation/authenticated-read-http.spec.ts)
mounts the production middleware on a loopback listener with the two
configured MakeMe projects and a controlled GitHub CLI. Foreign and missing
origin and cross-site Fetch Metadata return 403. Unknown source and POST
return 404 and 405. All five assert zero upstream requests. Same-origin
Fetch Metadata alone returns the configured source's revision with one
request. Missing login returns 502, no-store and actionable guidance for
the selected repository. Generic failure returns 502 after listing and
falling back to its ref. Both failure cases assert that raw diagnostics
are absent. These eight cases passed before removing their legacy copies.

```sh
caffeinate -s -i npm run test:dashboard:backend -- \
  'observation/authenticated-read-(http|boundary|refusal)\.spec\.ts$' \
  'review/verified-origin-trunk\.spec\.ts$' --workers=1
caffeinate -s -i npm run typecheck:dashboard
```

The focused run passed 32 cases (18 retained Chromium and 14 Node,
including the six cold Git cases) and typecheck passed. All passed on the
first attempt. The Node wire cases summed to 870 ms, with five refusals
at 12–33 ms and the three real request-owner cases at 242–286 ms. The
focused run took 12.54 s. Evidence is in `s1-return.md`, `s1-focused.json`
and the retained run records. All eight Node cases passed again in
`s1-lint-repair.log` after binding the middleware call and returning a
resolved provider fixture promise.
`caffeinate -s -i npm run test:dashboard:backend -- 'observation/authenticated-read-http\.spec\.ts$' --workers=1`.
The change touches only the subject specs and
plan, with no refactor candidate in the inspected middleware, fixtures or
remaining tests.

### 2. Read an admitted file and commit time at its pin

Type: Behavior
Status: done

Given a configured source and a revision whose backlog identifies a story
document, ask for the document or its last committed time. Return the exact
bytes and time even when a later commit differs. Reject an unlisted path
or a source whose own pin cannot reach it before fetching the path.
Preserve literal text and spaces through the provider adapter and reuse
pinned records or metadata at the same revision.

Proof uses the production file and commit-time read selected by
`RequestedRead`, with a `PublishedSource`, signal, `PinnedTexts` and
real MakeMe Git commits for the backlog, file and changed revision. Check
the actual provider path encoding where it is emitted. Preserve the
pinned cases in `authenticated-read-boundary.spec.ts` (slice 1 owns its
failure cases), `authenticated-read-committed-last.spec.ts` (2), and the
arbitrary-path case in `authenticated-read-refusal.spec.ts`.

Accepted proof. The existing dispatcher now calls
[performPinnedFileRead](../../../dashboard/server/performedPinnedFileRead.ts)
with the parsed read, source and tracked signal.
[authenticated-read-boundary.spec.ts](../../../dashboard/backend-tests/observation/authenticated-read-boundary.spec.ts)
drives that operation with the real parser, PinnedTexts and MakeMe Git
history. The older pin's exact bytes include a literal backslash-u escape
and its commit time precedes the later pin's changed value. The tests
assert one correctly encoded raw contents or commit-list call for repeated
reads at the same pin. Three refusal rows check an unlisted file, its commit
time and a listed profile's commit time before target lookup. A separate
origin with the same file path but without the backlog link gets a 404
using only its own pinned evidence. The replacement passed before retiring
the two canonical, two commit-time and one arbitrary-path Chromium cases.
The converted boundary spec keeps plan 823's forward proof link live.

```sh
caffeinate -s -i npm run test:dashboard:backend -- \
  'observation/authenticated-read-(boundary|refusal|http|revision-(backlog|reuse(-compared|-history)?))\.spec\.ts$' \
  'review/verified-origin-trunk\.spec\.ts$' 'intent/authenticated-read-intent-selection\.spec\.ts$' --workers=1
caffeinate -s -i npm run typecheck:dashboard
caffeinate -s -i npm run test:e2e -- \
  observation/authenticated-project-observation.spec.ts stories/taken-slice-clock.spec.ts --workers=1
```

All 53 backend cases passed (20 Node and 33 Chromium), including selected
revision reuse, Intent and Git witnesses. The four Board E2E cases passed
in 19.60 s and retain the real HTTP dispatch, canonical detail and Taken
clock observations. Typecheck passed. After shortening the refusal table,
all six typed cases and typecheck passed again at the final path. The six
summed to 634 ms in that run (five at 27–81 ms, the separate origin at
399 ms). See `s2-return.md`, the runner records and `s2-consumer-trace.md`
in the checkout's Git proof directory.

The independent refactor removed unused Intent admission re-exports and
made their module-local helpers private. Typecheck passed after those
visibility edits. The executed behavior and runtime proof still match.
The final six-case selection also passed after lint repairs to the test's
fixture cleanup, parameter binding and partial-object assertion. See
`s2-lint-repair.log.run.json`.

### 3. Admit the recorded branch and its resolved head

Type: Behavior
Status: done

At a pinned Taken entry, resolve the branch named by its recorded profile,
then read its plan at the resolved head. Refuse unrelated branch and path
choices and an unresolved head with the established meanings. A watched
revision check may admit the head it actually resolves. Malformed or mixed
branch and watch parameters stop at parsing before an upstream read.

Proof drives `performBranchHeadRead`, `performOnBranch` and the watched
`performRevisionCheck` through their production dispatch with a
`PublishedSource`, `BranchHeads`, pinned backlog/profile/plan from real
Git, and a controlled branch-head provider. Exercise the existing parser
for the branch/watch refusals. Keep the one multi-step case in
`authenticated-branch-read-boundary.spec.ts` and the branch/watch rows in
`authenticated-read-refusal.spec.ts`.

Accepted proof. [authenticated-branch-read-boundary.spec.ts](../../../dashboard/backend-tests/observation/authenticated-branch-read-boundary.spec.ts)
uses the parser, dispatched branch and revision reads, real BranchHeads and
PinnedTexts, and Git history with distinct trunk, resolved and advanced plan
bytes. A true origin branch absent from the Taken profile, and the Trunk
Mode profile, refuse with 404. The real Git head gives 409 until observed.
Both refusals leave provider calls empty. Resolution yields the exact
branch and head. An unrelated path is refused and the exact plan is read
at the resolved commit. Moving the branch with trunk held checks that a
watched read admits the new head with one listing and one pinned plan read.
[authenticated-read-branch-request.spec.ts](../../../dashboard/backend-tests/observation/authenticated-read-branch-request.spec.ts)
matches the parser's exact 400 outcomes for all four branch and five watch
input variants. The adapter returns each parser refusal before dispatch.
The ten replacements passed before the corresponding Chromium removals.

```sh
caffeinate -s -i npm run test:dashboard:backend -- \
  'observation/authenticated-(branch-read-boundary|read-(branch-request|refusal|http))\.spec\.ts$' \
  'review/verified-origin-trunk\.spec\.ts$' --workers=1
caffeinate -s -i npm run typecheck:dashboard
caffeinate -s -i npm run test:e2e -- \
  stories/branch-slice-progress.spec.ts observation/auto-refresh-branches.spec.ts --workers=1
```

Thirty backend cases passed (24 Node and six retained Chromium) in 13.88 s.
The nine parser cases summed to 2.57 ms. Typecheck and both Board E2E journeys passed.
The journeys retain visible branch detail and watched progress proof
through the installed dispatch, in 16.23 s total. See `s3-return.md`,
`s3-consumer-trace.md` and the retained runner records.

The independent refactor put the sole case's real Git fixture in its own
lifetime and shared the precise plan-read assertions. The focused branch
case and typecheck passed after that edit. The branch case took 729 ms
including Git materialization, which the earlier 64–130 ms samples
measured outside the case. See `s3-refactor-node.log.run.json` and
`s3-refactor-consumer-trace.md`.

### 4. Answer accepted-publication containment

Type: Behavior
Status: done

An admitted source and two full revisions yield containment for equality
and descendants and absence for behind, divergent and unknown accepted
commits. Unavailable or malformed provider answers carry the appropriate
failure and directed wait. Invalid request shape is refused before a compare.

Proof uses the production containment read and parser, with the typed
`ContainmentRead` and signal, published fixture history for the revision
relationships and a comparison-provider answer for failures. Inspect the
actual requested base, head and repository. Preserve all 3 cases in
`authenticated-read-containment.spec.ts` and the reader contract consumed
by `publicationContainment.ts` and `startupReconciliation.ts`.

Accepted proof. [authenticated-read-containment.spec.ts](../../../dashboard/backend-tests/observation/authenticated-read-containment.spec.ts)
uses the parser, typed read and real bare origin history for equality,
ahead, behind, divergence and an absent accepted commit. It asserts one
compare with the configured Pygardon repository, accepted base, shown
head and signal. The production CLI classifier and failure formatter
preserve the 120-second directed wait, transient connection failure and
malformed-answer failure. Ten malformed parameter cases assert refusal
before dispatch. The shared HTTP witnesses keep unknown-source 404 with
zero provider calls and 502 with directed-wait serialization. The 18
typed cases passed before replacing the three legacy Chromium cases.

```sh
caffeinate -s -i npm run test:dashboard:backend -- \
  'observation/authenticated-read-(containment|http|revision-check-failures)\.spec\.ts$' --workers=1
caffeinate -s -i npm run typecheck:dashboard
caffeinate -s -i npm run test:e2e -- \
  launches/responsive-session-reconciliation.spec.ts launches/responsive-session-reconciliation-kept.spec.ts \
  -g "a Take's older snapshot|a Take no page reconciled" --workers=1
```

All 30 backend cases passed in 9.93 s. The 18 containment cases summed
to 55 ms (maximum 15 ms), excluding shared Git setup. Typecheck and both
real-origin reconciliation journeys passed. The latter exercised negative,
failed and descendant answers through the browser in 23.89 s wall time.
See `s4-return.md`, `s4-consumer-trace.md` and the run records. The sole
changed subject spec introduces no new production representation, helper
or fixture API, and the inspected implementation has no refactor candidate.

### 5. Distinguish an empty Done catalog from missing or inconsistent evidence

Type: Behavior
Status: done

A Done catalog at a source's pin describes exactly the listed filenames
and blobs. No Done files yields an empty catalog. Missing, malformed, stale
or mismatched catalog evidence returns a gap. A listed unreadable record
remains listed. A request naming a record absent from the agreeing catalog
is refused before any body read. Verify project isolation at one revision.

Proof uses the `DoneCatalogRead` parser and `performDoneCatalogRead` with
pinned listings and blobs derived from the case's published files. Reuse the
shared Done catalog builder and agreement code. Preserve
`authenticated-read-done-catalog-gaps.spec.ts` (7), catalog and membership
cases in `authenticated-read-done-catalog.spec.ts` (4 across slices 5–6),
the Done-only request-shape rows in `authenticated-read-done-catalog-refusal.spec.ts`
(12 across slices 5–6), and the catalog rows in `authenticated-read-refusal.spec.ts`.

Accepted proof. [authenticated-read-done-catalog-gaps.spec.ts](../../../dashboard/backend-tests/observation/authenticated-read-done-catalog-gaps.spec.ts)
drives the production parser and pinned memo with published listings and
the shared Done catalog format. A missing directory and a stale catalog
with no records each yield the exact empty catalog. Five gap variants
assert their exact gap, refusal and no body fetch. An absent name, alone
or beside a listed name, is refused before reading it. The agreed catalog
keeps newest-first order and unreadable membership at the published blob
without a raw body call. Independent projects at one SHA get their own
catalogs. [authenticated-read-done-catalog-request.spec.ts](../../../dashboard/backend-tests/observation/authenticated-read-done-catalog-request.spec.ts)
covers eleven parser outcomes, including two pairs of equivalent legacy
rows. The replacements passed before case removal. The linked catalog
location still owns the three mixed body journeys until slice 6.

```sh
caffeinate -s -i npm run test:dashboard:backend -- \
  'observation/authenticated-read-(done-catalog(-[a-z]+)?|refusal|branch-request)\.spec\.ts$' --workers=1
caffeinate -s -i npm run typecheck:dashboard
caffeinate -s -i npm run test:e2e -- \
  stories/recently-done-stories.spec.ts review/story-review-follow-up.spec.ts \
  -g 'Recently done lists published Done stories|missing and malformed Done records|a Done story follows up its selected landed comparison' --workers=1
```

The focused 38 cases passed in 9.20 s (30 Node and eight Chromium retained
for slice 6). The 21 replacement cases summed to 19.53 ms, maximum 3.99 ms.
Typecheck and the ten affected catalog cases passed after narrowing a
fixture lookup to its observed value. The three Board and Review E2E cases
passed in 13.75 s. They check visible Done membership, gaps, and the
selected retained comparison in follow-up. See `s5-return.md`,
`s5-final-consumer-trace.md` and the retained runner records. The affected
subject specs and their shared scenario rows introduce no refactor candidate.

### 6. Read listed bodies once and release a departed reader

Type: Behavior
Status: done

An accepted body read returns the named Done or profile records at the pin,
with independent blobs read together, unchanged blobs reused and reads
kept within the existing batch and concurrency bounds. When one
read fails, identify its path. A departed reader releases its held request
and a later read can retrieve the body again.

Proof exercises `performListedRecordsRead` and the Done bodies variant of
`performDoneCatalogRead` through their shared `readListedTexts` path, with
the real pinned memo, named blobs, and a controlled upstream for ordering
and failure. Move the request departure to the Node HTTP witness from
slice 1, preserving observation of child exit and the later successful
request. Prove the profile request shape at the parser. Account for
`authenticated-read-listed-records.spec.ts` (4), body reuse in
`authenticated-read-done-catalog.spec.ts`, the remaining two cases in
`authenticated-read-done-catalog-refusal.spec.ts`, and the profile rows in
`authenticated-read-refusal.spec.ts`.

Accepted proof. [authenticated-read-done-catalog.spec.ts](../../../dashboard/backend-tests/observation/authenticated-read-done-catalog.spec.ts)
drives the real Done handler and memo against published listing and blob
facts. It checks the exact catalog and only named bodies, then one new
read for an overlap. At a new pin, only the catalog and changed or new
bodies are fetched. A removed name refuses, and the earlier pin still
returns its original bytes from the memo. The unreadable body's exact
published bytes round trip. Six held reads peak at four outstanding and
return exact bodies. Failed siblings name the failing path and pin in
both request orders. Slice 5's parser retains the 101-name batch refusal.
[authenticated-read-listed-records.spec.ts](../../../dashboard/backend-tests/observation/authenticated-read-listed-records.spec.ts)
checks two pins naming unchanged profiles and only a new listing and
settings fetch, and the three exact malformed profile refusals.

The single [Node HTTP witness](../../../dashboard/backend-tests/observation/authenticated-read-http.spec.ts)
holds one body request in an actual CLI child. The client closes after
that live PID is observed. The test sees its exit and SIGTERM, then a
retry returns HTTP 200, exact body bytes and one fresh upstream request.
The 19-case replacement run passed before retiring the final two mixed
Chromium refusal specs. The linked catalog path now selects Node.

```sh
caffeinate -s -i npm run test:dashboard:backend -- \
  'observation/authenticated-read-(listed-records|done-catalog(-[a-z]+)?|http|branch-request)\.spec\.ts$' \
  'review/published-session-listing\.spec\.ts$' --workers=1
caffeinate -s -i npm run typecheck:dashboard
caffeinate -s -i npm run test:e2e -- stories/taken-agent-profile.spec.ts --workers=1
caffeinate -s -i npm run test:dashboard:backend -- 'observation/authenticated-read-http\.spec\.ts$' --workers=1
```

All 56 focused cases passed in Node in 6.62 s, including the seven
published-session checks. The ten typed body and profile cases summed to
95.26 ms. Dashboard typecheck passed and the profile Board journey passed
in 13.41 s wall. After grouping equivalent HTTP refusals, all nine wire
cases passed in 5.46 s, with native departure at 434 ms. The Board/Review
proof from slice 5 still applies. See `s6-return.md`, the final consumer
trace and the runner records. The Done and HTTP specs project to 250
formatted lines, so the avatar wire changes will also need to make room
within the single HTTP spec.
The independent pass updated three proof-owner comments and confirmed no
executable caller of the retired HTTP wrapper or refusal specs. The accepted
observations still apply. See `s6-refactor-consumer-trace.md`.

### 7. Attribute the currently allocated profile

Type: Behavior
Status: done

Given a listed profile at a pin, return the addition of its current
allocation, the credited commit and its matched account. Distinguish
changed history, the existing bounded walk, no addition and unlisted or
foreign profile input. Reuse commit data when multiple profiles traverse it.

Proof uses `parseAdditionRead` and `performAdditionRead` with the typed
`AdditionRead`, configured source, pinned listings and history, and the
real history walk and memo. Use Git fixture history where file changes and
pinning determine the result. Supply provider account metadata at its
boundary. Preserve `authenticated-read-profile-addition.spec.ts` (3) and
`authenticated-read-profile-addition-refusal.spec.ts` (7).

Accepted proof. [authenticated-read-profile-addition.spec.ts](../../../dashboard/backend-tests/observation/authenticated-read-profile-addition.spec.ts)
uses the real parser, attribution walk and PinnedTexts at MakeMe Git
commits. Vacate, re-add, edit and removal history identifies the exact
current allocation's SHA, date, committer and matched login. The repeated
read makes no provider call. Blank committer and absent match keep the
attribution with null names. A vacated pin refuses before history lookup.
An older addition beyond ten actual later changes returns null and asks
for exactly the ten most recent details. Changed and omitted-file
provider replies distinguish continuing from ending the walk. Two
profiles with a shared addition fetch that commit detail once.
[authenticated-read-profile-addition-refusal.spec.ts](../../../dashboard/backend-tests/observation/authenticated-read-profile-addition-refusal.spec.ts)
asserts six exact parameter refusals. The shared HTTP guard still asserts
unknown-source 404 and zero calls before read selection. All thirteen
Node replacements passed before the legacy copies were retired.

```sh
caffeinate -s -i npm run test:dashboard:backend -- \
  'observation/authenticated-read-(profile-addition(-refusal)?|listed-records|boundary|http)\.spec\.ts$' --workers=1
caffeinate -s -i npm run typecheck:dashboard
caffeinate -s -i npm run test:e2e -- stories/agent-roster-avatar.spec.ts --workers=1
```

All 32 focused backend cases passed in Node in 8.88 s. The 13 attribution
and parser cases summed to 871 ms, with real-history cases at 143, 169
and 438 ms. Typecheck passed. The retained roster journey passed in
13.98 s wall and exercises exact visible credit, initials and gaps,
later allocation and source isolation. See `s7-return.md`,
`s7-consumer-trace.md` and the terminal run records. The two subject specs
reuse the existing product and fixture owners and need no refactor pass.

### 8. Serve the credited account's bounded avatar

Type: Behavior
Status: planned

When the requested profile and pin resolve a usable matched-account avatar,
serve the exact bounded image, share concurrent fetches, retain a successful
image and fetch a changed source. No match or unusable source yields no
avatar and no fetch. Failure reports unavailability and allows a later retry.

Proof uses the typed source, revision and profile path from the existing
avatar parser, the real avatar controller and `AvatarImages`, and controlled
attribution and fetch answers. Preserve rejection of foreign input,
unsupported, oversized or redirected images and failed fetches. The slice 1 HTTP witness
keeps the image headers and cross-origin refusal. Maintain the visible
[roster avatar journey](../../../e2e/stories/agent-roster-avatar.spec.ts)
at its existing owner. Account for all 15 cases in `authenticated-avatar.spec.ts`.

## Local gate and delivery

- Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) selection
  to each changed or new test before writing it and
  [page-object selection](../../../.agents/skills/dough-page-objects/SKILL.md)
  if browser tests change. Follow [AGENTS.md](../../../AGENTS.md) for
  default timeouts and awake macOS on AC under `caffeinate -s -i` for
  long local checks. Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to every check.
- Run the focused maintained backend selection for each modified read and
  `npm run typecheck:dashboard` when typed seams change. Apply
  [consumer tracing](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  to changed types, handlers and removed support. Start with the Board
  pinned details, branch observation and startup reconciliation readers,
  the Done record readers shared with Review and follow-up, and the roster
  profile/avatar readers. Run the affected readers at their existing test
  boundaries. Keep the real Git cold witness in the affected selection if
  shared dispatch or pin setup changes.
- Recount on the execution starting revision and record the final exact
  maintained one-worker command. Record runner counts, per-case times
  against the campaign's roughly 100 ms target, summed case time, wall time,
  conditions and any E2E proof owner/cost. Require zero legacy Chromium
  cases for this family. For each retired case show the replacement setup,
  observed result and a check that distinguishes the promised behavior
  before deleting its only witness. Group equivalent assertions with
  their owner. Observe host load before timing and use comparable
  one-worker conditions. See the [campaign comparison](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#backend-vitest-replacement-coverage).

## Plan review

The provisional grouping was expanded during planning around the actual
entry points and independent proof loops. A separate slice-plan refinement
pass was unnecessary because the eight bounded slices carry the observed
refusals and transitions and identify the mixed proof owners. The shared
model is a configured source, a selected pinned operation and its typed
outcome. Actual wire departure, commit-history comparison and image
fetching use their own existing production boundaries. No slice-specific
concern remains on the observed basis.
