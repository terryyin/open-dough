# Share repeated reads across dashboard observers

**Identity:** SEED-113#share-repeated-observer-reads
**Source:** [refined story](../../seeds/SEED-113-dashboard-github-responsiveness.md#share-repeated-observer-reads).
**Prepared:** 2026-10-06. Planning only, in the story's existing preparation
workspace on `claude/share-repeated-reads-across-dashboard-observers`.

## Goal and boundaries

Observers served by one dashboard process stop paying GitHub twice for the same
answer. Requests that need the same GitHub answer while it is outstanding share
one request, and content already read at a resolved revision is reused, so
reopening a project asks only what could have changed. Each observer still sees
the published facts it would have read alone.

Include the story's sharing, reopening, departure, failure, bound, and
distinct-read examples, and its evidence constraints: per-request admission,
no reuse of a completed ref or branch-head answer, the time GitHub was asked,
the 30-second bound, and unchanged visibility and publication observation.

Rate-limit cooldown and aggregate request concurrency, reuse of unchanged
content at a new revision, coordination of polling between tabs, sharing
between separately launched processes or across a restart, and request-count or
latency budgets are deferred. Keeping that a record was missing at a revision
is deferred too. Avatar images carry no new promise.

## Existing solutions and current decisions

PFE searched the dashboard server and page for an owner of an outstanding read.

- `AvatarImages.image` (`dashboard/server/avatarImages.ts`) already has the
  same meaning for avatar fetches: concurrent displays share one fetch, a
  failure is not kept, the fetch has its own bound from its start, and closing
  the boundary ends it. It lacks only ending when nobody waits. **Decision:
  modularize.** Extract that sharing into one owner of an outstanding read and
  use it for avatar fetches and for `gh` calls, so the boundary has one
  representation of the rule.
- `PinnedTexts` (`dashboard/server/pinnedTexts.ts`) is the completed-answer
  memo and stays so. `RevisionChecks` keeps only the conditional hint, and
  `BranchHeads` only which heads this boundary resolved. None of them shares
  an outstanding read.
- `withTrackedGh` (`dashboard/server/trackedGh.ts`) owns one request's wait:
  its disconnect, its 30-second bound, and shutdown. It stays the waiter's
  owner; what its signal ends changes from the subprocess to that request's
  wait.
- `profileAdditionsAt` (`dashboard/src/authenticatedProfileRead.ts`) shares one
  page read's additions between a human and a clock. It belongs to one
  observation in one tab and stays as it is. `SavedSessionServices`, the Cursor
  runner's pending starts, and the Codex RPC's pending replies have unrelated
  meanings.

Follow the [Architectural North Star topic](../../NORTH-STAR.md#one-github-read-serves-every-observer-that-needs-it):
a read is a question asked of GitHub, completed pinned answers and outstanding
moving-ref answers have different lifetimes, and waiters own the read. These
choices constrain the slices:

- **Share where `gh` is invoked.** `execGh` in `dashboard/server/ghRead.ts` is
  the boundary's only `gh` invocation, and its fixed argument array is the
  question asked of GitHub, the conditional hint included. Sharing there gives
  every read kind one rule and leaves admission, reachability, and each
  request's interpretation untouched above it. Do not add a key or a sharing
  path per read kind.
- **Three endings.** A shared read ends when no request waits for it, when it
  has itself run for `readTimeoutMs`, or when the server closes. A request that
  leaves or reaches its own bound settles as an abandoned or timed-out request
  does today, without ending a read others wait for. A late joiner is told the
  read timed out when the read's own bound ends.
- **Asked time belongs to the read.** `performedRead.ts` stamps `askedAt`
  per request before resolving the ref, and `startupReconciliation.ts` judges a
  settled attempt by `shown.askedAt > settledAt`. A joiner that stamped its own
  later time could treat an answer asked before a settlement as asked after it.
  The membership answer carries when its shared ref resolution asked GitHub.
- **No completed moving-ref answer is kept.** The outstanding entry goes when
  the read settles; only `PinnedTexts` keeps answers, at a resolved commit or
  blob.
- **Avatar behavior is preserved, not extended.** Avatar fetches keep their
  10-second bound and today's lifetime.

Accepted [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps this
feature-local design with the feature.
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
high cohesion requires the one representation chosen above. The index and
record statuses agree: ADRs 0000–0006 are Accepted, 0007–0009 Proposed. No
supersession or conflict was found, and no new North Star topic is needed.

## Decisive premises and observations

All observations use product code at `21d91799e690e015b91cb6457c437571791a68e1`
with Node `v24.5.0` and dependencies from
`env -u NODE_ENV npm ci --ignore-scripts --offline`. Boundary probes start an
isolated dev server over real HTTP with the synthetic `gh`; the page probe uses
the built preview through `dashboardTest.ts`. Only GitHub's answers are
supplied. No live GitHub service is used.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| Simultaneous identical reads each reach GitHub today. | Slice 3's remedy and proof entry. | O1 held GitHub's answer and sent two requests. Two pinned backlog reads made two content calls; two revision checks with different `since` made two head listings and were answered `changed: false` and `changed: true`; two membership reads made two ref and two content calls. A third pinned read afterwards made no call. All cases passed as written, reproducing the duplication. |
| Two tabs of one browser on one dashboard server duplicate every question when opened together. | Slice 3's page journey. | O2 opened two pages in the fixture's browser context with one seed held. Sixteen calls reached GitHub before release, every question twice, including two reads of the held seed. Both pages then settled on the same membership. |
| Reopening rereads only the backlog; record detail already comes from the process memo. | Slice 1's remedy and size. | O1's two sequential membership reads made `ref, content, ref, content`. O2's reload after a settled read made exactly one ref resolution and one backlog read. |
| A failed pinned read is not kept. | Slices 3–4's recovery promise. | O1 answered a pinned read with HTTP 500, then published it: `502` then `200`, with a content call each time. |
| No existing journey depends on the backlog being read again at a revision the process already read, beyond asserting that it is. | Slice 1's size and regression set. | O4 applied the remedy temporarily (the membership read taking its backlog from `pinned.reader`) and ran all 319 dashboard specs. Three failed, each on an assertion that the backlog is asked again: `direction-disclosure.spec.ts:132` and `project-selection.spec.ts:160` expect four requests on returning to a project and saw three; `production-watcher-updates.spec.ts:195` expects a backlog content call on a second membership read. No journey republishes different content at a revision it already read. The change was reverted. |
| A reopen with recorded story branches asks each branch's head again, and nothing else but the ref and backlog. | Slice 1's expected reload calls. | **False as first written.** O5 settled `branch-slice-progress.spec.ts`'s fixture, reloaded, and listed the calls: the ref, the backlog, four branch heads, and two content reads GitHub had answered as missing, `.planning/open-dough.json` at the revision and a plan absent at its branch head. The boundary keeps only text it read, so a missing record is asked for again. The story and slice 1 now say so, and keeping absence is deferred. |
| `execGh` is the only place the boundary runs `gh`. | The decision to share there. | `grep -rn "execFile\|spawn(" dashboard/server/*.ts`: `gh` is run only in `ghRead.ts`. `runGh` and the two `--include` callers (`ghRevision.ts`, `containmentRead.ts`) reach it; `projectAddition.ts` also calls `runGh`. |
| Request disconnect, the request bound, and shutdown end an owned `gh` today, for every read kind. | Slices 3–4's preservation proof. | O3 ran `authenticated-read-subprocess-lifecycle.spec.ts` and `authenticated-read-plugin-hooks.spec.ts`; both passed. |
| Hidden pages, project switches, check pace, branch moves, directed waits, containment, avatars, and startup reconciliation behave as the reading contract says. | Slices 1–4's regression sets. | O3 ran the named specs below; all passed. |
| A test can know, by an event and without a product hook, that a second request is waiting on the shared read before it releases GitHub's answer. | Slices 3–4's proof of one call for moving refs, where a late joiner would ask again. | **A `gh` call reaching GitHub is not that event.** O6 sent two held requests and then a marker request, and counted the held requests' calls once the marker's call reached GitHub: in 40 rounds several saw one or none, because each `gh` is its own process. **A marker's HTTP response is.** O7, an isolated Node `v24.5.0` server whose handler counts a request after three microtask turns and then waits, answered a later marker request with the count: 2 in all 3,000 rounds. The boundary reaches `execGh` from a request with no I/O before it once the pinned reads it needs are kept, as reading `performedRead.ts`, `pinnedTexts.ts`, and `performedRevisionCheck.ts` shows. |
| Existing avatar specs protect the sharing that slice 2 extracts. | Slice 2's preservation proof. | **Only partly.** `authenticated-avatar.spec.ts` observes an image fetched once and then kept, a changed source fetched afresh, and a failed fetch asked again. No case has two displays waiting on one fetch, and the fake avatar host answers synchronously (`AvatarAnswerer` in `tests/support/fakeGitHub.ts`), so it cannot hold an image. Slice 2 adds that regression case and lets the fake host wait before extracting. |
| The harness can hold one answer, release it, count calls, abandon a request, and shorten the bound. | Proof design for slices 3–4. | O1 used `holdingAnswer`, `server.github.calls`, and `rawRequest`; O3's lifecycle spec uses `abandonedRequest`, `processAlive(server.ghPid())`, and `readTimeoutMs`. |

Literal observation commands, run from the preparation workspace:

```sh
# O1 and O2 — temporary probes, removed after the run
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- shared-reads-boundary-planning-probe.spec.ts shared-reads-page-planning-probe.spec.ts --workers=2

# O3 — passed, exit 0
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- authenticated-read-subprocess-lifecycle.spec.ts authenticated-read-plugin-hooks.spec.ts authenticated-read-revision-check.spec.ts authenticated-read-revision-check-failures.spec.ts authenticated-read-revision-backlog.spec.ts authenticated-read-boundary.spec.ts authenticated-read-containment.spec.ts auto-refresh-visibility.spec.ts auto-refresh-rate-limit.spec.ts auto-refresh-project-isolation.spec.ts project-read-isolation.spec.ts authenticated-avatar.spec.ts agent-roster-avatar.spec.ts responsive-session-reconciliation.spec.ts authenticated-read-listed-records.spec.ts authenticated-read-profile-addition.spec.ts authenticated-branch-read-boundary.spec.ts auto-refresh.spec.ts auto-refresh-branches.spec.ts project-add-boundary.spec.ts --workers=2

# O4 — the whole dashboard suite against a temporary, reverted change; exit 1 with the three failures above
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard

# O5 — temporary probe, removed after the run
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- branch-reload-planning-probe.spec.ts --workers=1

# O6 — temporary probe, removed after the run; failed as described
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- marker-order-planning-probe.spec.ts --workers=1

# O7 — temporary standalone script outside the repository; printed "v24.5.0 rounds=3000 wrong=0"
node order-probe.mjs
```

The O1 boundary probe passed. The O2 and O5 page probes each failed only on a
deliberately empty expectation used to print the calls; O2's held-read count
and reload calls matched. The probes waited a fixed half second to count
duplicate calls, which suits a baseline only: the slices' proof holds answers
instead.
These observations establish today's behavior and a usable proof route, not the
remedy.

## Promise and proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| Reopening or reloading asks which commit the ref and each recorded story branch name, and reads the backlog only when this process has not read it at that commit. A missing or unreadable record is asked for again. A new commit is read as today. | 1: boundary call lists and a reload journey at the same and at a new revision, with one record missing. |
| Requests needing the same outstanding GitHub answer share one request, whatever the dashboard request: pinned content and history, ref and branch-head resolution, and revision checks, each answered for its own question. | 3: held-answer boundary cases and a two-tab journey. |
| Completed pinned content is reused by later reads; a completed ref or branch-head answer is never reused. | 3: a later pinned request makes no call; a later check or open asks again. Existing revision-check specs keep asserting one listing per sequential check. |
| A shared ref answer carries the time GitHub was asked. | 3: two simultaneous membership reads answer the same `askedAt`; `responsive-session-reconciliation.spec.ts` stays green. |
| A shared read belongs to its waiters: a departing observer leaves it running, the last one ends it, and closing the server ends every read. | 3: abandon one of two held requests, then the other; existing lifecycle and plugin-hook specs for the single waiter and shutdown. |
| Different repositories, revisions, paths, and kinds of fact never answer one another. | 3: simultaneous reads differing in one of these make separate calls with their own answers. |
| A request is admitted on its own terms before it shares anything. | 3: `authenticated-read-refusal.spec.ts` and `authenticated-branch-read-boundary.spec.ts` stay green, refusing before any `gh` call. |
| A failed shared read fails each waiter alike, with any directed wait, and is never kept. | 4: two waiters on a refused read and on a rate-limited check; the next request asks again and succeeds. |
| No request waits past its bound for a shared read, and joiners cannot keep a GitHub read outstanding past the bound. | 4: a short-bound server with a stalled read and a late joiner. |
| Visibility and publication observation are unchanged; what the process keeps stays bounded. | 1 and 3: the existing auto-refresh, visibility, branch, and isolation journeys. Outstanding entries leave when their read settles, shown by the later-request cases. |
| The request accounting and reading contract describe the resulting costs. | 1 and 3: `dashboard/GITHUB-REQUESTS.md` and `dashboard/PUBLISHED-OBSERVATION.md`, each changed with the behavior it describes. |

## Ordered slices

### 1. Reopening a project asks only what could have changed

Type: Behavior
Status: done
Proof: New `dashboard/tests/reopened-project-reads.spec.ts` through
`dashboardTest.ts`, new cases in `authenticated-read-boundary.spec.ts`, the
three specs O4 found asserting a reread, and the existing `auto-refresh.spec.ts`,
`auto-refresh-detail-recovery.spec.ts`, `project-read-isolation.spec.ts`, and
`read-failure.spec.ts`.

Behavior: A project was read at the revision its configured ref still names.
The developer reloads the page or returns to the project: GitHub is asked which
commit the ref names, and the head of each recorded story branch. Backlog and
record content this process read is not read again, and the page shows the same
facts under its own new observation. A record GitHub answered as missing, or
whose read failed, is asked for again. After a new commit is published, the
same reload reads that commit's backlog and records as today, and nothing kept
for the earlier revision answers for it.

The membership read takes its backlog through the existing pinned memo after
resolving the ref. Keep the failure wording that names the backlog at the
resolved revision, and the `askedAt` it answers.

At the boundary, assert the call lists: two membership reads at one revision
make a ref resolution, one content read, and a ref resolution; a membership
read at a new revision reads that revision's backlog. In the journey, settle a
project with a seed, a plan, a Story Branch Mode entry, and one record missing
at the revision, note the calls, reload, and assert that only the ref
resolution, the branch-head resolution, and the missing record's read follow. Publish a new commit with changed content, reload, and observe the new
facts and source links. Switch to another project and back for the returning
case. Reword the three assertions O4 found to the new promise: the ref is
asked again and the kept backlog is not. Update the membership cost in
`GITHUB-REQUESTS.md` and the reload sentences in `README.md`.

Safe stop: Every reopen of an unchanged project costs one content read less,
with freshness and recovery as before.

Accepted proof: `env -u NODE_ENV npm run typecheck:dashboard`;
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- reopened-project-reads.spec.ts authenticated-read-boundary.spec.ts authenticated-read-revision-backlog.spec.ts direction-disclosure.spec.ts project-selection.spec.ts auto-refresh.spec.ts auto-refresh-detail-recovery.spec.ts auto-refresh-branches.spec.ts auto-refresh-unusable-branch.spec.ts project-read-isolation.spec.ts read-failure.spec.ts --workers=2`
(33 passed) and `... -- production-watcher-updates.spec.ts --workers=2` (1 passed).
The journey asserts exact reload and return call lists; the two membership-read
boundary cases live in `authenticated-read-revision-backlog.spec.ts`. Without
the remedy the journey fails on an extra backlog content call.

Learning: the reading contract's reload sentences live in
`dashboard/PUBLISHED-OBSERVATION.md`, not `dashboard/README.md`, which delegates
to it; slice 3 updates that file. `.planning/open-dough.json` counts as a
missing record on every reload when a project does not publish it.

### 2. One owner for an outstanding read

Type: Structure
Status: done
Proof: A new case in `authenticated-avatar.spec.ts`, written and passing
before the extraction: two reads of one avatar source while its image is held
make one image read and both receive it. Then that case,
`agent-roster-avatar.spec.ts`, and `agent-terminal-avatar.spec.ts` stay
green, with `npm run typecheck:dashboard`.

Internal change: Extract from `AvatarImages.image` the rule it already
implements into one owner of an outstanding read: requests for the same key
share one read, the entry leaves when the read settles, a failure is not kept,
the read has a bound from its start, and closing the boundary ends it.
`AvatarImages` keeps its images and its 10-second bound and uses the owner for
the fetch in flight. External behavior is unchanged. The fake avatar host
answers synchronously today; let its answerer wait so the new case can hold an
image.

Enables slice 3, which gives the same owner its waiters and uses it for every
`gh` call. Add no waiter handling, `gh` use, or option that avatars do not
need here.

Safe stop: Avatar reads behave as before through one named owner.

Accepted proof: `env -u NODE_ENV npm run typecheck:dashboard` and
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- authenticated-avatar.spec.ts agent-roster-avatar.spec.ts agent-terminal-avatar.spec.ts agent-roster-collection.spec.ts nerds-cartoon-portrait.spec.ts profile-addition-latency.spec.ts recently-done-read-latency.spec.ts --workers=2`
(28 passed). The new held-image case in `authenticated-avatar.spec.ts` passed
before extraction and fails with two image reads when sharing is disabled.
The owner is `OutstandingReads` in `dashboard/server/outstandingReads.ts`,
keyed by string, with one bound per owner; holds for `gh` and avatar answers
share `holding` in `dashboard/tests/support/heldGitHubAnswer.ts`.

Learning: no spec observes the avatar bound or closing the boundary ending a
fetch; slice 4's bound cases observe the owner's bound for `gh` reads.

### 3. Simultaneous reads share one GitHub request that its waiters own

Type: Behavior
Status: done
Proof: New `dashboard/tests/authenticated-read-shared.spec.ts` at the boundary,
new `dashboard/tests/shared-observer-reads.spec.ts` through `dashboardTest.ts`,
and the existing lifecycle, plugin-hook, refusal, branch-boundary,
revision-check, containment, listed-records, profile-addition, auto-refresh,
visibility, isolation, reconciliation, avatar, and `project-add-boundary.spec.ts`
specs observed in O3.

Behavior: While GitHub's answer is held, two requests that need it wait on one
`gh` call and both receive it. This holds for a pinned file, a directory
listing, and a history read; for two tabs opening one project, which resolve
the ref once, read the backlog once, and answer the same asked time; and for
revision checks from pages showing different revisions or watching different
branches, which share one head listing and each learn their own answer. A later
request for pinned content asks nothing; a later check or open asks again.
Reads differing in repository, revision, path, or kind stay separate. When one
of two waiting observers leaves, the read continues and the other is answered;
when the last one leaves, the `gh` process ends as an abandoned read's does
today. Closing the server ends every outstanding read.

Give the owner its waiters and use it in `execGh`, keyed by the argument array.
Each caller's signal becomes its own wait. Carry the read's asked time into the
membership answer. Admission, reachability, `PinnedTexts`, the conditional
hint, and each request's interpretation stay where they are.

Make coincidence deterministic. Hold GitHub's answer, send the participating
requests, then send a marker request that the boundary answers without `gh`,
such as a refused one, and release only after its response: O7 shows the
earlier requests' handlers have run by then. Warm any pinned read a request
makes before the shared one, so nothing but microtasks precedes its `gh`
call. In a page journey, wait for each tab's request to be sent before the
marker. Do not wait on `gh` calls reaching GitHub (O6), on elapsed time, or on
a product hook.

At the boundary, assert the calls that reached GitHub while held and after
release, the answers, and for departures `processAlive(server.ghPid())` before
and after each request is abandoned. In the journey, open two tabs with the
ref and a seed held, release each once both tabs wait on it, and assert that
the held questions and every pinned question reached GitHub once; then observe
both tabs' facts. Repeat with one tab closed, and with one switched to another
project, before the seed is released, and observe the remaining tab's facts.
With both tabs' revision checks held, hide one tab, which abandons its check,
and observe the other tab's check answered. Update the simultaneous-read and
check costs in `GITHUB-REQUESTS.md` and the reading contract in
`PUBLISHED-OBSERVATION.md`.

Interim: a refused or stalled shared read follows the owner's extracted rule,
unproved for several `gh` waiters until slice 4.

Safe stop: Simultaneous observers cost GitHub one request per question, and no
observer can end another's read.

Accepted proof: `env -u NODE_ENV npm run typecheck:dashboard`; the new
`authenticated-read-shared.spec.ts`, `authenticated-read-shared-waiters.spec.ts`
(the boundary proof split to stay under 250 lines), and
`shared-observer-reads.spec.ts` with the O3 regression set through
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <specs> --workers=2`
(110 passed); the new specs with `--repeat-each=10`; and the whole
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard`. Disabling
sharing fails every new spec; aborting the read on any departure fails the
departure cases.

Decisions and learnings:
- `execGh` waits through one process-wide `OutstandingReads` keyed by the
  argument array, so project addition's default-branch read is shared too;
  `project-add-validation.spec.ts` now expects one call for two concurrent
  additions of one repository.
- A shared read reaching its own bound fails every waiter as `GhFailure`
  timed-out (`ReadBoundReached`); `RevisionChecks` rethrows it instead of
  asking the ref, as a request-bound timeout already did.
- The shared `askedAt` is observed at the boundary only, not on the page.
- One departure's reaching the server before the next marker is shown by
  repetition, not by construction; the continuing cases cannot pass falsely.

### 4. A refused or stalled shared read ends for every waiter

Type: Behavior
Status: done
Proof: New `dashboard/tests/authenticated-read-shared-failures.spec.ts` at the
boundary, with `authenticated-read-revision-check-failures.spec.ts`,
`auto-refresh-rate-limit.spec.ts`, `auto-refresh-detail-recovery.spec.ts`, and
the lifecycle spec's bound cases.

Behavior: Two requests wait on one read that GitHub refuses: both report that
failure, and the next request asks GitHub again and succeeds. Two revision
checks wait on one listing answered with a rate limit that directs a wait: both
report the same wait. On a server with a short bound, a read stalls and a
second request joins it later: each request is answered as timed out within the
bound of its own asking, the `gh` process ends within the bound of the read's
start however many joined, and a later request starts a new read.

Exercise refusal through GitHub's answers and the bound through
`readTimeoutMs`, as the lifecycle spec does. Assert the reported wording and
`retryAfterSeconds`, that the process ended, and the call that follows. Correct
the owner or the waiter's wording only where these cases expose a defect; add
no retry or cooldown policy.

Safe stop: Sharing is honest when GitHub refuses or stalls, with today's
recovery for every waiting observer.

Accepted proof: no product change was needed. New
`authenticated-read-shared-failures.spec.ts` with
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- authenticated-read-shared-failures.spec.ts --workers=2 --repeat-each=10`
(and `--workers=6` under load), the slice-3 specs, the named regressions (31
passed), the whole suite (1156 passed), and typecheck. The stall cases use a
3-second bound and compare every answer and the `gh` exit with the joiner's own
deadline, half a bound after the read's; disabling the read's bound or sharing
fails them.

## Verification, sizing, and delivery

Each slice owns its product change, outside-in proof, and cleanup together.
Write behavior tests at the existing boundary and page seams; inject no
prepared snapshot and add no product test hook. The quiet reporter requires
silent passing journeys; clear conflicting color variables as in the observed
commands, and `NODE_ENV` in a dashboard-launched session.

At each slice, run its new spec and the named regressions it reaches:
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <spec files> --workers=2`.
Run `npm run typecheck:dashboard` for the changed server contracts, which
Playwright alone does not check. Slices 3 and 4 change the one `gh` invocation
every dashboard read and project addition reaches, so run the whole
`npm run test:dashboard` before delivering each of them.

Execution follows the installed post-change-refactoring and delivery workflow.
The local commit gate is the check-only `.githooks/pre-commit`, which runs
`npm run --silent lint -- --staged`. Hosted checks remain owned by execution's
publication and CI workflow. Keep the enduring reading behavior in the tests,
`dashboard/PUBLISHED-OBSERVATION.md`, and `dashboard/GITHUB-REQUESTS.md`. At wrap-up, retire
the North Star topic this plan follows.

No numeric slice target, hard limit, or S/M/L bands were supplied. Each slice
has one proof loop. Slice 3 is the largest: one rule at one invocation point
reaches every read kind at once, so splitting it by read kind would add
per-kind gates that the next slice removes. If execution disproves an observed
premise or the boundedness of a slice, stop safely and revise the remaining
plan within the same outcome; story-boundary changes stay with Terry.

## Execution complete

Product advice:
- The North Star topic `#one-github-read-serves-every-observer-that-needs-it`
  is fully built: `outstandingReads.ts`, `ghRead.ts`, `PUBLISHED-OBSERVATION.md`,
  and `GITHUB-REQUESTS.md` explain it. Retire it at wrap-up; if the late-joiner
  consequence should outlive it, add one sentence to the `ghRead.ts` header.
- SEED-113's first open decision (request-sharing lifetimes and cancellation)
  is settled by this story and can be removed at wrap-up.
- For "Recover consistently from GitHub rate limits": `execGh` with its
  process-wide `OutstandingReads` is now the one point every `gh` request
  passes, so a cooldown and aggregate concurrency belong there, in an owner of
  their own (`OutstandingReads` keeps no failure), with per-waiter waits ending
  on the request's signal, and any fallback rethrowing `timed-out` and
  `rate-limited` as `RevisionChecks` does.
- For "Refresh published work without rereading unchanged files": the
  membership backlog now goes through `PinnedTexts`, so blob-keyed reuse covers
  it too; records GitHub answered as missing (such as an unpublished
  `.planning/open-dough.json`) are still asked on every reload, the deferred
  cost of keeping absence.
- A bounded correction is planned, not queued:
  [SEED-113#shared-read-waiter-residue-correction](../../seeds/SEED-113-dashboard-github-responsiveness.md#shared-read-waiter-residue-correction)
  ([plan 263](../263-shared-read-waiter-residue-correction/PLAN.md)) rewords four
  comments that still describe per-request `gh` ownership and removes the
  imitated abort in `execGh`.
