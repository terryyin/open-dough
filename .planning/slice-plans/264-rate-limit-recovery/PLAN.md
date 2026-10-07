# Recover consistently from GitHub rate limits

**Identity:** SEED-113#recover-consistently-from-rate-limits
**Source:** [refined story](../../seeds/SEED-113-dashboard-github-responsiveness.md#recover-consistently-from-rate-limits).
**Prepared:** 2026-10-06. Planning only, in the story's existing preparation
workspace on `claude/recover-consistently-from-github-rate-limits`.

## Goal and boundaries

When GitHub limits the local login, the dashboard stops asking until GitHub
allows it again, whichever read met the limit and whichever tab or project asks
next. What is shown stays useful and says why reading waits and until when.
When the wait ends, each page reads what the limit withheld without a reload
and without a burst. The reads one dashboard process has under way at GitHub
stay bounded across its tabs and projects.

Include the story's six required behaviors, its evidence and failure
constraints, and its twelve key examples, including human attribution withheld
by a limit at an unchanged trunk revision.

**Intent clarified on main, 2026-10-07:** Terry's frequent "Human developer
unknown" report makes assignment-history recovery an explicit acceptance
journey. Preserve the existing execution identity, completed-slice proof, and
scope; the additional proof belongs to remaining slices 6–7. A successful
read after the directed wait must fill credit without requiring a reload or
publication. Ordinary network-failure and timeout retries remain deferred,
and the report's specific failure cause is not yet established.

Reading the remaining allowance, slowing down ahead of a limit, showing the
allowance, coordination between separately launched processes or across a
restart or with the developer's other `gh` use, a retry inside the request that
asked, priority among kinds of read, request-count or latency budgets, and
automatic recovery of gaps left by other failures are deferred. Avatar images
carry no new promise.

## Base this plan is written against

This plan builds on the sharing story's delivered code: `execGh` with its
process-wide `OutstandingReads` (`dashboard/server/outstandingReads.ts`).
Every observation below ran on that story's head,
`3301c9c202531ae51275f8b3ee837f22c15d6ede`, which trunk contains since its
landing (`9dec1035`) and wrap-up. The queued correction
[SEED-113#shared-read-waiter-residue-correction](../../seeds/SEED-113-dashboard-github-responsiveness.md#shared-read-waiter-residue-correction)
removes `execGh`'s imitated abort and rewords comments; no slice here depends
on either state.

## Existing solutions and current decisions

PFE searched the dashboard server, page, and test support for owners of a
limit's direction, a wait, a bound on reads, and their test routes.

- **Recognizing a limit and its direction.** `directedWaitSeconds`
  (`server/rateLimitDirection.ts`), `limitedAsDirected` (`server/ghRevision.ts`),
  `parseIncluded` (`server/includedAnswer.ts`), and the `/rate limit/` test in
  `classify` (`server/ghRead.ts`) together already mean "this refusal is a rate
  limit, and here is its wait". Only the head listing and the commit comparison
  use the first three, because only they pass `--include`. **Decision: change.**
  Every `gh api` call includes GitHub's status and headers, and the one
  invocation in `ghRead.ts` recognizes a limit and its wait for all of them.
  The two callers stop classifying a limit themselves.
- **Owning a read that reaches GitHub.** `OutstandingReads` starts one `gh`
  call per question and ends it when no request waits, at its bound, or when
  the boundary closes. **Decision: reuse.** Admission sits inside what it
  starts (`spawnedGh`), so a shared read is admitted, refused, or kept waiting
  once for all its waiters, and a turn-waiting read ends by the lifetime that
  owner already gives it. Add no second waiter ownership.
- **A cooldown and a count of reads under way.** Nothing owns either.
  `OutstandingReads` keeps no failure by design, and `mapPool`
  (`src/boundedPool.ts`) bounds one fixed list for one caller and stops it at
  its first failure. A search for a backoff, queue, or semaphore in
  `dashboard/server`, `dashboard/src`, and `scripts` found none. **Decision:
  gap.** Add one admission owner beside `outstandingGh` in the process: the
  time before which nothing is asked, the backoff step, and the turns.
- **The per-group pools.** `fileReadConcurrency` (`src/repositoryFileReads.ts`)
  and `listedReadConcurrency` (`server/listedRecordsRead.ts`) each order one
  group's own requests and stop that group at its first failure. **Decision:
  keep.** They stay as they are; the process bound is the only rule across
  groups, tabs, and projects.
- **The page's wait.** `useObservationAttempt`'s `checksResumeAt`
  (`src/observationAttempt.ts`) is set only by a failed membership read or
  check, postpones only that page's checks (`src/revisionCheckSchedule.ts`),
  and is said by `PublishedReadFailure`. **Decision: change.** It becomes the
  page's one record of the login's limit, set where the browser's only boundary
  request (`authenticatedGet`, `src/authenticatedGet.ts`) is answered.
- **Gap wording.** `detailGapProblem` (`src/readWaitBound.ts`) already passes a
  read problem's own wording into a gap for humans, slice clocks, and done
  records. Record-file gaps (`loadRepositoryTexts`) and the profiles gap
  (`readAssignments`) use fixed wording. **Decision: reuse** it for those two
  when the read was limited; their wording for other failures stays.
- **Shortening a bound for proof.** `readTimeoutMs()` reads
  `DOUGH_READ_TIMEOUT_MS`, and `startDashboardServer` passes it. **Decision:
  reuse the pattern** for the 60-second backoff base, the only wait here that a
  test cannot choose through GitHub's own answer.
- **Test routes.** `rateLimitedAnswer` (`tests/originAnswers.ts`),
  `holdingAnswer` (`tests/support/heldGitHubAnswer.ts`), `readAt`,
  `refusedMarker`, `askedSince`, and `servedHolding`
  (`tests/support/sharedReads.ts`), `abandonedRequest`, and the auto-refresh
  journey helpers exist. Missing: releasing held answers one at a time, and the
  most `gh` calls unanswered at once. Slice 4 adds both to the fake GitHub.

Follow the [Architectural North Star topic](../../NORTH-STAR.md#one-owner-admits-reads-to-github),
added in refinement: admission precedes a read, a cooldown is one fact of the
process, the direction is learned once, turns bound demand, admission counts
reads and not waiters, and the page has one recovery. Sharing itself is
built, and `outstandingReads.ts`, `ghRead.ts`, and the reading contract explain
it. These choices constrain the slices:

- **One admission point.** A read reaches GitHub only through `spawnedGh`.
  There, in order: a standing cooldown refuses it; it waits its turn; a
  cooldown that started meanwhile refuses it; it runs; its answer may start or
  extend the cooldown. Add no gate per read kind, and none above `execGh`.
- **A held-back read is a failure of its own kind.** It carries the whole
  seconds left and says the read was not asked. It is never GitHub's status,
  never `404`, and never kept by `PinnedTexts`. `RevisionChecks`' fallback
  rethrows it as it rethrows `rate-limited`.
- **Reported waits are whole seconds, rounded up**, so a page that waits as
  told never asks before the process allows it.
- **The cooldown ends only at its time.** No answer lifts it early. On the
  page, an answer from the process's memo during a cooldown must not lift the
  page's wait either, so the page's limit also ends only at its time.
- **Process state, test isolation.** The cooldown outlives a request, so a
  boundary case that starts one uses its own server or lets the wait pass.
  Page journeys already start a server each (`dashboardTest.ts`).
- **Waiting for a reported time is not an arbitrary sleep.** The server's
  clock is real. A case that must see reading resume directs a wait of one or
  two seconds and waits until the time the boundary reported; a page journey
  with a paused clock lets that real time pass first, then passes page time. A
  case that must see reads held back directs a long wait and never waits it
  out.

Accepted [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps this
feature-local design with the feature.
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
high cohesion requires the one admission owner and the one page record chosen
above. ADRs 0000–0006 are Accepted, 0007–0009 Proposed; no supersession or
conflict was found.

## Decisive premises and observations

All product observations use the sharing story's head
`3301c9c202531ae51275f8b3ee837f22c15d6ede`, now on trunk, in a temporary
detached worktree,
with Node `v24.5.0` and dependencies from
`env -u NODE_ENV npm ci --ignore-scripts --offline`. Boundary probes start an
isolated dev server over real HTTP with the synthetic `gh`; only GitHub's
answers are supplied. O2 alone asked the real GitHub, read-only, three times.

| Premise | Consumed by | Observation and result |
| --- | --- | --- |
| A refused content read loses GitHub's directed wait today, and a directed refusal holds back no later read. | Slices 1–2's remedy and proof entry. | O1 answered one seed's content read `403` with `Retry-After: 120`: the boundary answered `502` with "Wait before reloading the page." and no `retryAfterSeconds`. A check answered `429` with `Retry-After: 120` carried `retryAfterSeconds: 120`; the content read and the check sent next both reached GitHub. Reproduced. |
| Nothing bounds the reads one process has at GitHub. | Slice 4's remedy and proof entry. | O1 held every content answer and sent twelve different pinned reads: all twelve reached GitHub while held, and all answered `200` on release. Reproduced. |
| The real `gh api --include` prints GitHub's status line and headers before the body for every call shape the boundary uses, and exits as without it. | Slice 1's one way of reading every answer. | O2, `gh` 2.76.2: with `--jq .sha` a `200` printed the head, the rate-limit headers, a blank line, then the filtered value, exit 0; a `404` with `--jq` printed the head and the raw JSON body, exit 1, stderr `gh: Not Found (HTTP 404)`; a raw-media content read printed the head then the file text. |
| The synthetic `gh` answers `--include` the same way for every request kind. | Slices 1–5's boundary proof. | `asGhReply` (`tests/support/ghReply.ts`) adds the head whenever the arguments contain `--include`, filters a successful body with `--jq`, and prints a refused body unfiltered; `parseRequest` finds the endpoint wherever it stands. O5 ran the whole suite with `--include` on every call. Every spec passed except the fourteen argument assertions in the next row, so the fake answers every request kind with its head. |
| Which existing tests state `gh`'s exact arguments. | Slice 1's size and regression set. | O5 failed fourteen cases in twelve files, each on an equality assertion over the arguments with only `--include` added: `authenticated-branch-read-boundary.spec.ts`, `authenticated-project-overview.spec.ts`, `authenticated-read-boundary.spec.ts`, `authenticated-read-profile-addition.spec.ts`, `authenticated-read-revision-backlog.spec.ts`, `authenticated-read-revision-check-failures.spec.ts:138`, `production-watcher-updates.spec.ts`, `project-add-validation.spec.ts`, `project-add.spec.ts`, `project-configuration.spec.ts`, `project-remove.spec.ts`, and `published-work.spec.ts`. The shared helpers `catalogProjectRecords.ts` and `revisionCheckBoundary.ts` hold some of those literals. |
| Which existing journeys rely on a read reaching GitHub after a rate-limit refusal, or on more than eight reads under way. | Slices 2–4's size and regression sets. | O4 ran all dashboard specs against a temporary, reverted change in `spawnedGh`: a process cooldown from a directed wait, 60 seconds for an undirected rate limit, and eight turns. Nine failed and all nine pass without it (O4b). Directed wait, slice 2: `authenticated-read-containment.spec.ts:97`, `authenticated-read-shared-failures.spec.ts:91`, and `auto-refresh-rate-limit.spec.ts:39`, whose page clock passes 120 seconds while the server's does not. Undirected limit used as a passing failure, slice 3: `direction-disclosure.spec.ts:64`, `responsive-session-recovery.spec.ts:111`, `responsive-session-reconciliation.spec.ts:39`, `story-readiness-accessible.spec.ts:30`, and `story-readiness-gaps.spec.ts:37`. Both: `authenticated-read-revision-check-failures.spec.ts`, a serial group on one server that stopped at its first case (`:43`, undirected) and directs waits in its later ones. None failed for the eight turns. The crude change approximates slices 2 to 4 only, so each slice still runs the whole suite. |
| The sharing story's promise that the request after a refused shared read asks GitHub again holds for a directed rate limit only until this story. | Slice 2's rework of `authenticated-read-shared-failures.spec.ts:91`. | That case asserts a second listing call after two checks were refused with `Retry-After: 120`; under O4 it was held back. The sharing story defers cooldowns to this one, so the case keeps "both waiters report the same wait" and moves "asks again" to after the wait. |
| Admission can sit inside the read `OutstandingReads` starts, with that owner ending a turn-waiting read. | Slices 2, 4, 5. | Reading `ghRead.ts` and `outstandingReads.ts` at the observed head: `execGh` is the only caller of `spawnedGh`, through `outstandingGh.waitFor`; the signal `spawnedGh` receives aborts when no request waits, at the read's bound from its start, and when the boundary closes its requests. O4's crude turns waited on that signal and the lifecycle, plugin-hook, and sharing specs passed. |
| `execFile("gh")` in `ghRead.ts` is the only place the dashboard runs `gh`. | One admission point. | `grep -rln '"gh"' dashboard/server dashboard/src`: `ghRead.ts` only. Project addition reaches it through `runGh`. |
| A boundary spec's cases share one server, and a page journey starts its own. | Test isolation for process state. | Reading the boundary specs' `beforeAll(startDashboardServer)` and `dashboardTest.ts`'s per-test `dashboard` fixture. O4's serial group stopping at its first case shows the consequence. |
| Page journeys pause the page clock; the server's clock is real. | Proof design for slices 2, 6, 7. | `pausePageClock` in `tests/autoRefreshJourney.ts`; O4's `auto-refresh-rate-limit.spec.ts:39` failure at the page's 120th second. |
| A page whose detail read is limited shows only a generic gap, and a reload during the directed wait asks GitHub again. | Slices 6–7's remedy and proof entry. | O6 opened a page on a project whose one seed read answers `403` with `Retry-After: 120`: its card said "The canonical record could not be read for preparation facts.", the page showed no alert and no mention of a limit, and a reload asked GitHub for the ref and that seed again. Reproduced. |
| Every published read the page makes goes through `authenticatedGet`. | Slice 6's one page record. | `grep -rn "authenticatedReadEndpoint\|authenticatedGet(" dashboard/src`: the endpoint is fetched only in `authenticatedGet.ts`, called by the membership, check, file, listed-record, profile, branch, and containment readers. Avatars use another endpoint and no `gh`. |
| A limited detail read reaches its gap with its cause only for some details. | Slice 6's gap labels. | Reading the gap producers: `detailGapProblem` passes a read problem's wording for humans, slice clocks, and done records; `loadRepositoryTexts` and `readAssignments` discard the error for fixed wording; a branch plan gap already uses the read problem's wording. |
| A fresh in-page read of an unchanged project asks GitHub only what could have changed or was not read. | Slice 7's "content already read is not asked again". | The sharing story's `reopened-project-reads.spec.ts` asserts it for a reload and for returning to a project, and passed in O4. `readAfresh` in `src/publishedObservation.ts` is that in-page read. |
| Disconnect, the bound, and shutdown end waiting and outstanding reads today. | Slices 4–5's preservation proof. | `authenticated-read-subprocess-lifecycle.spec.ts`, `authenticated-read-plugin-hooks.spec.ts`, and `authenticated-read-shared-waiters.spec.ts` passed in O4 with the crude turns in place. |
| GitHub's guidance for a limit without a usable wait is at least one minute, then exponentially longer. | Slice 3's parameters. | GitHub's REST rate-limit documentation, fetched 2026-10-06: "Otherwise, wait for at least one minute before retrying", and for a continuing secondary limit "wait for an exponentially increasing amount of time between retries". Both limits answer `403` or `429`. |

Literal observation commands, run from the temporary worktree:

```sh
# O1 — temporary boundary probe, removed after the run; passed, printing the answers above
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- limit-recovery-planning-probe.spec.ts --workers=1

# O2 — the real gh, read-only
gh api --include repos/terryyin/open-dough/commits/main --jq .sha
gh api --include repos/terryyin/open-dough/contents/no-such-file-for-planning-probe --jq .sha
gh api --include -H "Accept: application/vnd.github.raw" "repos/terryyin/open-dough/contents/VERSION?ref=main"

# O4 — the whole dashboard suite against the temporary cooldown and turns; nine failures, 6m44s
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard

# O4b — the nine failing spec files with the change reverted; exit 0
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- authenticated-read-containment.spec.ts authenticated-read-revision-check-failures.spec.ts authenticated-read-shared-failures.spec.ts auto-refresh-rate-limit.spec.ts direction-disclosure.spec.ts responsive-session-reconciliation.spec.ts responsive-session-recovery.spec.ts story-readiness-accessible.spec.ts story-readiness-gaps.spec.ts --workers=2

# O5 — the whole dashboard suite with --include added to every api call and the head removed before callers read it; fourteen failures, 6m48s
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard

# O6 — temporary page probe through dashboardTest.ts, removed after the run; passed, printing the card, alert count, and reload calls
env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- limit-page-planning-probe.spec.ts --workers=1
```

These observations establish today's behavior, the reach of the change, and a
usable proof route, not the remedy.

## Promise and proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| A rate-limit refusal of any authenticated read establishes the wait GitHub directed, validated and bounded to one hour. | 1: each read kind refused with `Retry-After`, and one with a reset time, answers that wait at the boundary. |
| Only a rate limit starts a cooldown; an ordinary `401`, `403`, or `404`, a timeout, or an unreachable GitHub is reported as today and holds back nothing. | 1: an unmarked `403` and a `404` report no wait. 2: after each, the next read reaches GitHub. |
| Until the cooldown ends no authenticated read reaches GitHub from any tab or project; each is answered at once as limited with the same resume time and says it was not asked. A read already at GitHub keeps its own answer; a further refusal moves the time only later. | 2: boundary cases counting what reached GitHub, across two projects, read kinds, and project addition. |
| A held-back read establishes neither content nor absence. | 2: after the wait, the held-back path is read and answered; a held-back optional record is not answered as missing. |
| The cooldown lives in the process's memory; a restarted process asks again. | 2: a second server on the same fake GitHub asks at once. |
| A limit that directs no usable wait waits 60 seconds, doubling while no read succeeds, up to one hour; a successful read ends the doubling. | 3: reported waits across consecutive refusals with a shortened base, the production base reported by an unshortened server, and one hour reported for a base beyond it. |
| At most eight reads are under way at GitHub from one process; requests take turns in arrival order; waiting counts toward the 30-second bound. | 4: held answers released one at a time with the most unanswered at once observed, and a short-bound server. |
| A requester that leaves gives up its turn without reaching GitHub; closing the server ends every waiting read; a request refused on its own terms takes no turn. | 4: abandoned turn-waiters, the existing lifecycle and plugin-hook specs, and a refused request answered while every turn is taken. |
| After a cooldown the first read goes alone; answered, the rest proceed under the bound; refused, the cooldown starts again and nothing else was asked. A read waiting its turn when a cooldown starts is answered as limited. | 5: three requests after a passed wait with the first refused, and with the first held then answered. |
| A limited page keeps what it shows and says that GitHub limited requests and when reading resumes, the same way whichever read was limited; a withheld detail is labeled as withheld by the limit; until then the page asks nothing. | 6: journeys limiting a detail read, a membership read, and a check, with a second tab, a reload, and a project switch during the wait. |
| When the wait ends a visible page reads on its own what the limit withheld, content already read is not asked again, and a hidden page does so when seen again. | 7: journeys from each limited state through the reported time. |
| Human attribution withheld by a rate limit recovers even while trunk is unchanged; its card, detail, and roster show the established committer, and its Take clock shares that addition. | 6–7: limit a profile-history or addition-commit read, observe the limit reason and resume time, let the wait pass with no publication, and assert the recovered human and clock plus exact history/commit call counts. |
| Visibility and publication observation are unchanged outside a cooldown. | 2, 6, 7: the existing auto-refresh, visibility, branch, isolation, and recovery journeys. |
| The reading contract and request accounting describe the result. | 2, 3, 4, 5, 6, 7: `dashboard/PUBLISHED-OBSERVATION.md` and `dashboard/GITHUB-REQUESTS.md`, each changed with the behavior it describes. |

## Ordered slices

### 1. Every refused read reports the wait GitHub directed

Type: Behavior
Status: done
Proof: New `dashboard/tests/authenticated-read-directed-wait.spec.ts` at the
boundary, the literal `gh` arguments in the test files O5 lists, and the
existing `authenticated-read-revision-check-failures.spec.ts`,
`authenticated-read-containment.spec.ts`,
`authenticated-read-shared-failures.spec.ts`, and `read-failure.spec.ts`.

Behavior: GitHub refuses a content read, a directory listing, a history read,
a ref resolution, or a branch-head resolution with a rate limit that directs a
wait. The boundary's answer says GitHub asked to wait that long and carries the
wait, as a refused revision check and commit comparison do today, whether the
direction is `Retry-After` or a reset time with nothing remaining, validated
and bounded to one hour. A rate limit that directs nothing, an unmarked `403`,
and a `404` are reported as today, without a wait.

Pass `--include` on every `gh api` call where the boundary invokes `gh`, and
read status, headers, and body there once. Callers receive the body they
receive today; the head listing still sees its `304` and entity tag, and the
comparison its status. Recognize a rate limit and its wait in that one place
from the answer's status and headers, falling back to what `gh` printed when
no headers came, and remove the two callers' own recognition. Keep `--jq`
filters: O2 shows the real `gh` prints the head before a filtered body, and
the raw body after a refusal.

At the boundary, refuse one read of each kind with `Retry-After: 120` and
assert the wording and `retryAfterSeconds`; repeat one with
`X-RateLimit-Remaining: 0` and a reset time; assert an unmarked `403` and a
`404` carry no wait and keep their access advice. Update the literal argument
arrays O5 found to the included form.

Interim: a directed wait is reported but holds back nothing until slice 2.

Safe stop: Whichever read is refused, the page and the developer learn how
long GitHub asked to wait.

Done: `execGh` (`server/ghRead.ts`) adds `--include` after `api` on every
call, so the shared-read key is the included argument list; `readAnswer` in
the new `server/ghAnswer.ts` (formerly `includedAnswer.ts`) reads status,
headers, and body once and owns `limitedAsDirected` and `classify`. Accepted
proof: the three cases of `authenticated-read-directed-wait.spec.ts` with the
named regressions and every argument-literal file, and the typecheck. Learnings:
that spec's cases share one server and limit reads for 120 seconds, so slice 2
must separate them; slice 2's cooldown can start from `GhAnswer.failure` in
`spawnedGh`. The whole suite also failed `shared-observer-reads.spec.ts:199`
and `story-readiness.spec.ts:40` (the agent-settings read reaches GitHub after
the page counts as settled; also fails on the base) and once
`production-watcher-updates.spec.ts:33` under load; they are fixed before
slice 2, since slices 6–7 rely on "settled".

### 2. One cooldown holds back every read of the process

Type: Behavior
Status: done
Proof: New `dashboard/tests/authenticated-read-cooldown.spec.ts` at the
boundary, the specs O4 found relying on a read reaching GitHub after a directed
refusal, and the existing `auto-refresh-rate-limit.spec.ts`,
`auto-refresh-visibility.spec.ts`, `project-read-isolation.spec.ts`,
`project-add-boundary.spec.ts`, and `authenticated-read-subprocess-lifecycle.spec.ts`.

Behavior: GitHub refuses one read with a directed wait. Until that time, a
request for any read, of any project, is answered at once as limited: it says
GitHub limited requests and that this read was not asked, carries the whole
seconds left, and nothing reaches GitHub. Adding a project in that time is not
asked of GitHub either and says requests are limited. A read that was already
at GitHub is answered as GitHub answers it; if that answer is a refusal with a
later time, the later time stands, and an earlier one never shortens it. An
unmarked `403`, a `404`, a timeout, or an unreachable GitHub starts no
cooldown: the next read reaches GitHub. Once the time has passed, the read
that was held back is asked and answered, and a record that was held back was
never answered as missing. A second dashboard process asks GitHub at once.

Add the admission owner with its cooldown inside the read `OutstandingReads`
starts, and the held-back failure with its own wording. `RevisionChecks`
rethrows it as it rethrows a rate limit. Project addition words a limited
check as limited instead of advising to check access.

At the boundary, direct a long wait and assert that the reads which follow,
across two projects and every read kind, add nothing to
`server.github.calls` and answer the same resume time within a second's
rounding. Hold two reads, refuse a third, then answer one held read as
published and the other with a later refusal, and assert the first is
answered as read and the later time stands. For resumption direct a
one-second wait and wait until the reported time. Rework `auto-refresh-rate-limit.spec.ts` to
waits the server's real clock can pass, keeping every promise it makes today:
no check before the directed time even when the page is seen again, the check
at that time reads B, a reset time directs the next wait, and the steady pace
returns. Rework the cases O4 lists so each starts its cooldown on a server of
its own or lets the wait pass. Update the directed-wait sentences in
`PUBLISHED-OBSERVATION.md` and `GITHUB-REQUESTS.md`.

Interim: a limit that directs no usable wait still starts no cooldown, until
slice 3. Reads resume all at once, until slice 5. A page's own wait can still
be lifted by an answer from the process's memo, after which its next request
is held back and it waits again, until slice 6.

Safe stop: After a directed refusal the whole process leaves GitHub alone
until the time GitHub named.

Done: `ReadAdmission` (`server/readAdmission.ts`) is the admission owner;
`spawnedGh` asks `heldBack` before running `gh` and passes every answer to
`answered`. A held-back read is the `held-back` failure kind with whole
seconds left; `rateLimitStop` (`server/ghRead.ts`) names "GitHub's limit
stopped this read" for the failure wording, `RevisionChecks`, project addition,
and the setting file, which now fails with a limit instead of answering
absent. Accepted proof: `authenticated-read-cooldown.spec.ts` and
`authenticated-read-cooldown-reach.spec.ts` (ten cases) with the reworked
directed cases and the named regressions, and the typecheck. Whole-suite runs
under load 30–45 failed different launch and Codex-observation specs each time
at 5-second bounds; none meets a limit or runs `gh`, they pass alone and on the
base, and CI is green on the base. Learnings: directed cases use
`onServerOfItsOwn` or `ownRevisionCheckBoundary` and `untilReported`
(`tests/support/directedWait.ts`); slices 3–5 may place new cases in either
cooldown spec. Slice 3 must separate the undirected step of the setting-file
case and the five O4 journeys, and `revision-check-failures`' first,
undirected case on its shared server. A page journey sees a directed check
time below the 15-second pace only after a reveal.

### 3. A limit that directs no wait backs off

Type: Behavior
Status: done
Proof: New cases in `authenticated-read-cooldown.spec.ts`, and the journeys O4
found using an undirected rate limit as a passing failure.

Behavior: GitHub refuses a read as a rate limit and directs no usable wait.
The process cools down for 60 seconds, reported and held as a directed wait is.
The first read after it, refused the same way, starts a 120-second cooldown,
then 240, doubling up to one hour. After a read succeeds, the next such
refusal waits 60 seconds again.

The admission owner keeps the backoff step. Let the environment shorten the
base as `DOUGH_READ_TIMEOUT_MS` shortens the bound, and pass it through
`startDashboardServer`.

With a one-second base, assert the reported waits 1 and 2 across two
refusals, each after waiting until the reported time, then a success, then 1
again. On a server with no shortened base, assert one undirected refusal
reports 60 seconds; on one whose base is set beyond an hour, assert it reports
one hour. For each journey O4 lists that uses `rateLimitedAnswer()`
only as some failure followed by recovery at the check pace, either answer
another failure there or let it follow the backoff, whichever keeps the
promise that journey is about. Update the rate-limit wording that says "Wait
before reloading the page", and the two documents.

Safe stop: A secondary limit is followed by a growing pause instead of
repeated refusals.

Done: `ReadAdmission` keeps the backoff step and is the only place a rate
limit gets its wait (`readAnswer` yields a `GhPrintedFailure`; after
admission every `rate-limited` failure carries `waitSeconds`). The base comes
from `DOUGH_LIMIT_BACKOFF_MS`, set by `startDashboardServer`'s
`limitBackoffMs`. A success or a `304` resets the step; a refusal while a wait
stands reports what is left without doubling (no dedicated case). Accepted
proof: `authenticated-read-backoff.spec.ts` (1 then 2, success, 1 again; 60
on the production base; 3600 beyond an hour), the reworked boundary specs, and
the O4 journeys, which now answer `noConnection` where they needed only some
failure. Learnings: a boundary case meeting any rate limit needs a server of
its own with `limitBackoffMs: 1_000` and `untilReported`; a journey needing
only a failure answers `noConnection`.

### 4. One process has at most eight reads under way at GitHub

Type: Behavior
Status: done
Proof: New `dashboard/tests/authenticated-read-turns.spec.ts` at the boundary,
a two-tab case through `dashboardTest.ts`, and the existing
`authenticated-read-subprocess-lifecycle.spec.ts`,
`authenticated-read-plugin-hooks.spec.ts`, `authenticated-read-refusal.spec.ts`,
`authenticated-read-shared.spec.ts`, `authenticated-read-shared-waiters.spec.ts`,
`authenticated-read-listed-records.spec.ts`, and `observation-measurements.spec.ts`.

Behavior: Twelve different reads are requested while GitHub answers none.
Eight reach GitHub and four wait. Each answer lets the next in arrival order
begin. A waiting request that is abandoned never reaches GitHub, and the next
one takes its place. A request the boundary refuses on its own terms is
answered at once while every turn is taken. On a server with a short bound, a
request still waiting its turn at the bound is answered as timed out, and its
read never reaches GitHub. Closing the server ends the waiting reads with the
outstanding ones. Two tabs opening different projects while GitHub's answers
are held never have more than eight reads there together, and both settle on
their facts once the answers are released.

Add the turns to the admission owner: a count of reads under way and the
reads waiting, each leaving when the signal `OutstandingReads` gives it ends.
The read's bound already runs from before its turn, so waiting counts toward
it. Leave the per-group pools as they are.

Let the fake GitHub hold every answer and release them one at a time, and
report the most `gh` calls it has had unanswered at once. At the boundary,
hold all twelve, wait until eight have arrived, release one at a time waiting
for each next arrival, and assert the arrival order and that the most
unanswered at once was exactly eight: a call beyond the bound would stay
unanswered and be counted. Warm any pinned read a request makes before the
held one, as the sharing specs do. For departures use `abandonedRequest` and
assert the abandoned paths are absent from `server.github.calls` at the end.
State the bound in `GITHUB-REQUESTS.md` and the reading contract.

Safe stop: Further tabs and projects add waiting, not concurrent demand.

Done: `ReadAdmission.turn(signal)` gives at most eight turns in arrival order.
`spawnedGh` refuses on a standing cooldown, waits its turn, never runs a read
whose signal ended meanwhile, refuses on a cooldown that started meanwhile
(slice 5 proves it), runs, and passes its answer to `answered` before the turn
ends; boundary close relies on that order because `execFile` calls back
synchronously on abort. Fake GitHub gained `observeUnanswered` and
`heldInTurn`. Accepted proof: `authenticated-read-turns.spec.ts` (twelve held
reads with exactly eight unanswered at most, an abandoned waiter never asked, a
short-bound waiter timed out unasked, close ending waiters) and
`read-turns-across-tabs.spec.ts` (two contexts peak at eight and settle); a
temporary limit of 100 failed both; whole suite green. Untested: a read's own
bound reached while waiting (a sub-millisecond race behind the request bound),
and a killed outstanding `gh` briefly overlapping the next turn. Learnings:
assert arrival order by waiting for each arrival; one browser context shares
six connections per host, so more page reads need a second context.

### 5. Reading resumes with one read first

Type: Behavior
Status: done
Proof: New cases in `authenticated-read-cooldown.spec.ts`, with
`authenticated-read-turns.spec.ts` and `authenticated-read-shared-failures.spec.ts`.

Behavior: A cooldown has ended and three requests for different reads arrive
together. One read reaches GitHub. When GitHub refuses it with a new directed
wait, all three requests are answered as limited with the new resume time,
and only that one read reached GitHub. When GitHub answers it instead, the
other two are then asked and all three are answered. While turns are taken
and other reads wait, a refusal that starts a cooldown answers every waiting
read as limited, and none of them reaches GitHub.

After a cooldown the admission owner gives out one turn until that read is
answered, then reopens the rest. A read whose turn comes while a cooldown
stands is refused there.

Direct a one-second wait, wait until the reported time, then send three
requests. With the first refused, wait for all three answers and assert
exactly one new call: a second read let through would have had to reach
GitHub to be answered. With the first held, assert one arrival, send the
marker, release, and assert three calls and three answers. For the waiting
reads, fill the eight turns with held reads, queue two more, answer one held
read with a directed refusal, and assert the two queued paths never arrive.
Describe paced resumption in the two documents.

Safe stop: A still-standing limit costs one refused read per wait, however
many tabs were waiting.

Done: any rate-limit answer, directed or backed off, sets `ReadAdmission`'s
`resuming`; while set, one turn is open, and it clears only when a read asked
after the wait ended is answered by GitHub without a limit. While a cooldown
stands, waiting reads are handed turns at once and refused by `spawnedGh`'s
post-turn re-check, never reaching GitHub. Accepted proof:
`authenticated-read-resumption.spec.ts` (first read refused, directed and
backed off: one call, all three limited; first read held: one arrival, then
three; eight under way and two queued when a wait starts: the queued are held
back unasked), with mutations of the one turn, the re-check, and the hand-out
each failing; whole suite green. Untested: a first read that GitHub never
answers (unreachable, aborted, timed out) keeps one turn open until some read
is answered. Learnings: after any wait a page's first reads go one first;
`answeringFirst` (`tests/support/heldGitHubAnswer.ts`) refuses or answers the
next picked call once.

### 6. A limited page says so once and asks nothing until reading resumes

Type: Behavior
Status: done
Proof: New `dashboard/tests/limited-reading-*.spec.ts` through `dashboardTest.ts`,
with `auto-refresh-rate-limit.spec.ts`, `auto-refresh-recovery.spec.ts`,
`auto-refresh-detail-recovery.spec.ts`, `read-failure.spec.ts`,
`auto-refresh-visibility.spec.ts`, and `project-selection.spec.ts`.

Behavior: A page is loading a project's detail when GitHub refuses one seed's
read with a directed wait. The page keeps its snapshot, revision, and
retrieval time, labels that seed and each detail the limit then withheld as
withheld by the limit, and says once that GitHub limited requests and when
reading resumes. It says the same, with the same time, when the refused read
was the membership read or a revision check. Until that time the page asks
the boundary nothing: not a check, not when it is hidden and seen again, not
for a detail. A second tab showing a complete snapshot learns the limit from
its next check, keeps its snapshot, and says the same resume time. A reload,
or selecting another project, during the wait shows that no published work
has been read, the same limit and time, and asks GitHub nothing.

Keep the page's limit in one record set where `authenticatedGet` is answered
as limited, moved only later by a further limited answer, ended only by its
time, and kept across project selection. While it stands `authenticatedGet`
answers a read as limited itself. The check schedule and the notice read that
record in place of `checksResumeAt`. Show the notice whenever the record
stands, with or without a failed attempt, and word its recovery for the three
cases: a snapshot, a snapshot with withheld detail, and nothing shown. Use the
limit's wording for record-file and profile gaps when their read was limited.

Include a limited profile-history or addition-commit read: its scan view may
say "Human developer unknown", but the detail and roster identify the rate
limit and resume time. Do not describe withheld history as a missing addition
or an unnamed committer. Keep another successfully credited assignment useful.

In the journeys, direct a long wait and assert the notice, the resume time
against the failure time, the labeled gaps, the kept revision and retrieval
time, and that `githubFor(page).calls` gains nothing while page time passes,
through hiding and revealing, a reload, and a project switch. Open the second
tab in the same browser context as the sharing journey does. Replace the
reading contract's sentences on a rate-limited check, on "reloading the page
reads again" when nothing is shown, and on a later success lifting the wait.

Interim: a page with withheld detail or nothing shown still needs a reload
after the wait, and says so, until slice 7.

Safe stop: Every tab says the same thing about a limit and none of them asks
during it.

Done: the page's one record is `src/readingLimit.ts`, set where
`authenticatedGet` meets `retryAfterSeconds`, moved only later, ended only by
its time, and kept across project selection; while it stands
`authenticatedGet` refuses locally. `ReadProblem.resumesAt` replaces
`retryAfterSeconds`, `checksResumeAt` is gone, and the check schedule keeps the
time it asked under (`askedUnder`) so a limited check does not abort itself.
`ReadingLimitNotice` words three recoveries; `limitGapProblem` labels limited
record-file and profile gaps; `snapshotRetrieval.ts` marks a snapshot
`withheld` when a limit was met during its read. Accepted proof: the four
`limited-reading-*.spec.ts` journeys (detail, membership, check, profile
history listing with human credit), each through `whileTheLimitStands` (hide
and reveal, second tab, project switch, reload) with no GitHub call; disabling
the local refusal failed all four; the named regressions. Gaps: "withheld" is
page-wide (a limited sidebar or containment read marks it); the addition-commit
refusal and done-record wording are left to slice 7's proof; a held-back detail
gap reads "Reading resumes in N seconds. Limited until T." Learnings:
`useStandingLimit` re-renders when the time ends, the place to trigger
recovery; `limitedReadingJourney.ts` and `limitNotice.ts` hold the journey
support.

### 7. A page reads on its own what the limit withheld

Type: Behavior
Status: planned
Proof: New `dashboard/tests/limit-recovery.spec.ts` through `dashboardTest.ts`,
with `limited-reading-*.spec.ts`, `auto-refresh-rate-limit.spec.ts`,
`reopened-project-reads.spec.ts`, `auto-refresh-visibility.spec.ts`, and
`responsive-session-reconciliation.spec.ts`.

Behavior: The wait ends on a visible page. A page showing nothing reads the
project. A page whose snapshot has detail the limit withheld reads the project
again while its snapshot stays shown, fills that detail, and clears the
notice; GitHub is asked which commit the ref and each recorded story branch
name and for the withheld records, and for no content already read. A page
with nothing withheld makes its revision check as today. A page that is
hidden when the wait ends does this when it is seen again. With two tabs
recovering together, both fill what was withheld and each question reaches
GitHub once. Detail that failed for another reason stays a gap until reload,
as today.

The page's limit record notes whether a read other than a check was withheld
during the shown observation. When its time passes on a visible page, that
page asks the fresh read launch reconciliation already uses, or else its
check.

In the journeys, direct a two-second wait from each state of slice 6, let the
reported time pass, pass page time, and assert the facts shown, the cleared
notice, and the calls since the refusal: the ref, the branch heads, and the
withheld paths only. Include the human-credit case from slice 6 with trunk
unchanged: after the wait, show the credited committer on its card, detail,
and roster, and the Take clock derived from the same recovered addition.
Count the profile-history listing and each needed addition commit once across
these consumers, with no request for successfully cached attribution. Cover
both a refused history listing and a refused commit during the walk; cached
successful steps before the refusal are reused. Missing additions, unnamed
committers, and ordinary non-limit failures keep their own explanations;
an unavailable avatar keeps the known name. Hide the page across the reported
time and assert no call until it is revealed. Leave one record failing for another reason and
assert its gap stays. Replace the reading contract's recovery sentences and
the wording slice 6 left about reloading, and complete the request
accounting.

Safe stop: A limit costs the developer a wait, not a reload of every tab.

## Verification, sizing, and delivery

Each slice owns its product change, outside-in proof, and cleanup together.
Write behavior tests at the existing boundary and page seams; inject no
prepared snapshot and add no product test hook beyond the shortened backoff
base, which follows the existing bound's environment setting. The quiet
reporter requires silent passing journeys; clear conflicting color variables,
and `NODE_ENV` in a dashboard-launched session.

At each slice, run its new spec and the named regressions it reaches:
`env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- <spec files> --workers=2`.
Run `npm run typecheck:dashboard` for the changed server and page contracts.
Slices 1 to 5 change the one `gh` invocation every dashboard read and project
addition reaches, so run the whole `npm run test:dashboard` before delivering
each of them; slices 6 and 7 change the one request every page read makes, so
run it before delivering them too.

Execution follows the installed post-change-refactoring and delivery workflow.
The local commit gate is the check-only `.githooks/pre-commit`, which runs
`npm run --silent lint -- --staged`. Hosted checks remain owned by execution's
publication and CI workflow. Keep the enduring behavior in the tests,
`dashboard/PUBLISHED-OBSERVATION.md`, and `dashboard/GITHUB-REQUESTS.md`. At
wrap-up, retire the North Star topic this plan follows.

No numeric slice target, hard limit, or S/M/L bands were supplied. Each slice
has one proof loop. Slice 2 reaches the most existing journeys, because a
cooldown outlives the request that met the limit; O4 names them. If execution
disproves an observed premise or the boundedness of a slice, stop safely and
revise the remaining plan within the same outcome; story-boundary changes stay
with Terry.
