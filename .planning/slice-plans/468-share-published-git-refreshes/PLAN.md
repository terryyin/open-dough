# Keep the same project fresh across views with fewer GitHub requests

**Identity:** SEED-232#share-published-git-refreshes
**Source:** [selected story](../../seeds/SEED-232-reduce-dashboard-refresh-traffic.md#share-published-git-refreshes)
in SEED-232, refined 2026-11-04 with explore, borrow, challenge, clarify, investigate and
architecture.
**Source review:** [source-review.md](./source-review.md)
**Prepared:** 2026-11-04. Planning only, in the story's established workspace
(branch `claude/keep-the-same-project-fresh-across-views-with-fe`, agent terry-chan), continuing the
refinement in the same session.

## Goal and boundaries

A developer following one published project from several visible pages of one dashboard process sees
newly published work within the current refresh pace while that process asks GitHub for one
branch-head listing per pace for that project, not one per page. The story's seven key examples and
its evaluation basis are the acceptance: N staggered visible pages cost four listings a minute
instead of 4N, and publication-to-display stays within the pace, with one page's bounded extra delay
(example 3) the permitted trade-off.

Included: the dashboard server's revision checks answering a page's check from the listing it last
settled for that project and request-owner scope when that listing is younger than the reuse window,
joining an outstanding one otherwise, and asking GitHub only when neither exists; a listing left by
every page still settling; failures, rate limits and timeouts keeping no settled answer; the two
documents that account for checks. Excluded, as the story records: sharing settled listings across
separately launched dashboard processes; delivering updates without the page's recurring local check
(the SSE story); fewer requests for a single page; an immediate shared check on a known publication
event; any change to the request owner's protocol, to reload's fresh ref resolution, or to what a
page shows.

Apply this repository's [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
throughout. Local full suites follow `tests/local-test-resources.md`: Bash 5 on PATH, and on AC
power `caffeinate -s -i` around the run ([machine sleep on
macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos)).

## Direction and PFE

- **Reuse the server's shared observation.** `SharedObservation` (`dashboard/server/sharedObservation.ts`) already serves one settled result for a reuse window, joins a running observation, keys demands by their inputs, keeps nothing from a failure, and lets a departed waiter leave the observation to settle. Host status uses it with `reuseMs: () => checkReuseMs` (`hostStatusObservation.ts`, `checkReuseMs` from `revisionCheckSchedule.ts`); machine sessions use its `fresh` demand. Revision checks adopt it the same way: `RevisionChecks` (`dashboard/server/revisionChecks.ts`) keeps one `SharedObservation` per catalog source beside its `304` hint, bounded by the catalog as the hint is, keyed by the request owner's scope, with that same window. No new cache, scheduler or owner protocol.
- **Keep each page's own answer.** `performRevisionCheck` (`dashboard/server/performedRevisionCheck.ts`) compares the shared listing with each request's own `since` and watched branches after `checks.check`, so one listing still answers every page its own way; nothing moves there.
- **Key by scope with one accessor.** `GitHubRequests` (`src/skills/dough-execute-plan/scripts/github-requests.mjs`) keys outstanding calls by `OwnerLink.scope()` (host and login, no secret) and `ghRead.ts` holds the one instance; a `scope()` passthrough on `GitHubRequests`, exported beside `execGh`, gives the checks their key. A check whose scope cannot be established (undefined) shares nothing.
- **Own the listing's lifetime.** The observation runs under its own `AbortController`, registered in the boundary's `tracked` set so closing the boundary (`authenticatedRead.ts`) aborts it; a requester's signal ends only its wait. This is the story's boundary assumption: a listing every page left still settles and serves the next check within the window, where today `OutstandingReads` aborts it with the last waiter.
- **Bound the wait as today.** `demand` waits `readWaitLimitMs` (`src/authenticatedReadRules.ts`, 30 s); `unanswered` is reported as the timed-out check is today, and `departed` as the aborted one.
- **Documentation.** `dashboard/PUBLISHED-OBSERVATION.md` (the paragraph "Pages served by one dashboard process share what they ask GitHub", and the hidden-page sentence that a check under way is abandoned) and `dashboard/GITHUB-REQUESTS.md` ("at most four a minute per visible page", "a finished ref, branch-head, or check answer is never reused") say what changes: a page's check is answered from a listing younger than the window that this process settled for the project under the same login, so staggered pages cost one listing per pace; a reload or return still resolves the ref afresh; separately launched dashboards still share only outstanding requests.

Accepted decisions: the derived view stays rebuildable from origin, caching remote Git data is
compatible, and no daemon, database or scheduler is added ([ADR
0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)); the
evaluation basis is stated before the observed run and the trade-off is explicit ([ADR
0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)); reuse before new machinery
([ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)). No ADR
conflict; no North Star topic is needed.

## Decisive premises

| Premise | Consuming operation, observed form, revision | Result | Unverified remainder |
| --- | --- | --- | --- |
| Today a later check asks again, a check from another page at another `since` or watched branch shares only an outstanding listing, and the two-tab journey route runs in this checkout | `env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list dashboard/tests/boundary/authenticated-read-shared.spec.ts dashboard/tests/shared-observer-reads.spec.ts` at `7bb589e58` after `npm ci`, 2026-11-04 | True: 8 passed, including "checks of different revisions and of different watched branches share one head listing, each learning its own answer; a later check asks again" and "revision checks from two tabs share one head listing" | — |
| Two staggered visible tabs of one project cost one listing per check today | Scratch journey (deleted) on `openSettledAtA`, a second tab opened 7 s of page time later, 45 s of page time in 250 ms steps, counting `headsChecks` against the fake GitHub, 2026-11-04 | True: tab checks 2 + 2, listings 4; the second tab's checks at 22 s and 37 s each reached `gh` although the first tab's had settled | After slice 1 the same journey counts 2 listings; slice 2's proof asserts it |
| `SharedObservation` serves a demand under the same key within the window from the settled result, starts afresh past it, serves nothing under another key, keeps nothing from a failure, and a departed last waiter leaves the running observation to settle and serve the next demand | Scratch `node --test` over the module transpiled with esbuild, `Date.now` substituted, keys `["open-dough", scope]`, window 14 s, 2026-11-04 | True: second demand 7 s later observed once; demand 15 s later started a second observation; another project and another scope each started their own; a failing observation ran twice for two demands; a waiter that aborted left the observation to settle, and the next demand was answered from it without another observation | The window and keys are the plan's own choice; slice 1's spec pins them on `RevisionChecks` |
| Each request interprets the shared listing itself (`since`, watched branches) after `checks.check` | `performRevisionCheck` read at `7bb589e58`; the first premise's boundary spec observes two checks at different revisions answered differently from one listing | True | — |
| The request owner's scope is reachable for the key | `GitHubRequests.request` keys by `await this.#owner.scope()`; `ghRead.ts` holds the one instance privately; no accessor exists | Presence: slice 1 adds the passthrough and its spec observes a scope change asking again | — |
| A conditional `304` leaves GitHub's primary allowance unchanged, so the gain is `gh` invocations, owner turns and outage exposure | `gh api -i repos/terryyin/open-dough/git/matching-refs/heads/` then the same with `If-None-Match`, three pairs, 2026-11-04 | True in two pairs (`X-RateLimit-Used` unchanged after the `304`); the third pair's increment coincided with the running production dashboard's own traffic; each `304` took about 0.5 s through `gh` | Changes the evaluation words only, already in the story |

## Outside-in proof

| Story example | Owning slice | Observable signal |
| --- | --- | --- |
| 1 staggered pages share the pace (boundary) | 1 | Boundary spec: two sequential checks of one source after the first settled cost one `matching-refs` invocation; with the window at zero the second costs another |
| 1 staggered pages share the pace (page), 3 a new commit still arrives | 2 | Journey: the second tab's checks at 22 s and 37 s cost no listing; a commit published before the first tab's next check is shown by both tabs within one pace, with one backlog read |
| 2 each page learns its own answer | 1 | Boundary spec: checks at different `since` and watched branches answered from one settled listing each report their own `changed` and heads (extends the existing shared-reads case) |
| 4 seen again | 2 | Journey: a hidden tab revealed after the other tab's listing settled checks at once and costs no listing |
| 5 last page gone | 1 | Boundary spec: a check whose requester left before the listing settled lets it settle; the next check within the window costs nothing; closing the boundary aborts a running listing |
| 6 failure is not reused | 1 | Boundary spec: a `504` listing (ref fallback answered) then a check costs another listing; a rate-limited listing keeps nothing |
| 7 separate credentials | 1 | Boundary spec: a settled listing under one scope does not answer a check under another scope |
| Evaluation basis | 3 | Real throwaway dev server: two headless tabs staggered, `gh` wrapper count over one minute at the landed revision against the baseline above |

Local gates: for slice 1, the boundary specs named in its proof plus
`dashboard/tests/boundary/authenticated-read-revision-check.spec.ts`,
`authenticated-read-revision-check-failures.spec.ts`, `authenticated-read-shared.spec.ts`,
`authenticated-read-shared-waiters.spec.ts`, `shared-observation.spec.ts`, and
`PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh
src/skills/dough-execute-plan/scripts/github-requests.test.mjs` for the accessor; for slice 2, the
focused auto-refresh journeys (`dashboard/tests/auto-refresh*.spec.ts`,
`shared-observer-reads.spec.ts`, `limit-recovery-check.spec.ts`,
`transient-recovery-currentness.spec.ts`, `reopened-project-reads.spec.ts`) through `env -u NO_COLOR
-u FORCE_COLOR npx playwright test --config dashboard/playwright.config.ts --reporter=list <specs>`;
`npm run --silent typecheck:dashboard` and `npm run --silent format` before each commit; the
consumer trace (`node .claude/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout "$PWD"
--base <revision> --term 'never reused' --term 'abandons a check'`) for each slice. Run the whole
dashboard suite once before publishing slice 2, since every auto-refresh journey passes through the
changed check path (`tests/local-test-resources.md`, with the sleep guard named above). Hosted CI
runs the full suites after publication and its failures stay owned under the policy above.

## Ordered slices

### 1. The boundary answers a project's checks from one listing per window
Type: Behavior
Status: done
Proof: `GitHubRequests.scope()` passthrough with a unit case in
`github-requests.test.mjs`; `RevisionChecks` holds one `SharedObservation` per source keyed by
scope, window `checkReuseMs` read on each demand and injectable for the spec, the listing under its
own tracked controller; a new boundary spec beside `authenticated-read-shared.spec.ts` (split under
the file-size limit into listing and listing-failures) through real HTTP and the synthetic `gh`
asserts examples 1, 2, 5, 6 and 7 at the boundary: sequential checks of one source cost one listing
while the second is within the window and two at window zero; different `since` and watched branches
each answered their own way from the settled listing; a requester gone before settlement leaves the
listing to settle and the next check free; a `504`, a timeout and a rate limit keep nothing; another
scope asks again; closing the boundary aborts a running listing. The existing revision-check, shared
and waiter boundary specs stay green, with only the "a later check asks again" expectation rewritten
to "asks again past the window".
Behavior: A visible page's scheduled check reaches the boundary → it is
answered from the listing this process settled for that project under the same login within the
window, joins the outstanding one, or asks GitHub, and reports its own `changed` and watched heads.

### 2. Staggered tabs see published work with one listing per pace
Type: Behavior
Status: done
Proof: `shared-observer-reads.spec.ts` (or a sibling journey) opens a second
tab 7 s of page time after the first settled, lets 45 s of page time pass and counts two listings
where the deleted scratch journey counted four; then publishes a new commit before the first tab's
next check and shows it on both tabs within one pace with one backlog read; a hidden tab revealed
after the other's listing settled checks at once without a listing. The focused auto-refresh
journeys stay green. `PUBLISHED-OBSERVATION.md` and `GITHUB-REQUESTS.md` state the reuse, its
window, its per-login and per-process bounds, and that reload still resolves the ref afresh. The
whole dashboard suite once before publication.
Behavior: Two visible tabs show one project at staggered times → over a
quiet minute GitHub receives four listings for it, and a published commit appears on both within the
pace.

### 3. The gain is observed on a real dashboard
Type: Behavior
Status: done
Proof: A throwaway dev server from this checkout at the revision that landed
slice 2 (private HOME with a one-project list, `GH_TOKEN="$(gh auth token)"`, a private
`DOUGH_GITHUB_REQUEST_OWNER_ROOT`, a `gh` wrapper on PATH appending each invocation to a log), two
headless Playwright pages of the Open Dough project opened about seven seconds apart and kept
visible for one minute of quiet origin: the log counts about four `matching-refs` invocations,
against eight expected from the documented baseline of four per visible page, recorded here as a
learning with the revision, the count and the two pages' check times. No production dashboard is
restarted. A count that does not fall is a defect to diagnose under the plan, not a result to report
and move on from.
Behavior: The landed dashboard with two real visible pages → GitHub receives
one listing per pace for the project.

## Current decisions

- The reuse window is `checkReuseMs` (one second under the check pace), shared with host status, so a page's own pace is never answered from its previous listing while two pages at the pace share one.
- The key is the catalog source and the request owner's scope; an undefined scope shares nothing. Separately launched dashboards share only outstanding requests, as the story defers cross-process sharing.
- A page's reload or return keeps resolving the ref afresh; the shared listing serves scheduled and revealed checks only.
- A listing every requester left still settles under the boundary's own controller; closing the boundary aborts it. The documents state listing reuse and listing lifetime (G1 proved by slice 2).
- Specs inject `DOUGH_REVISION_CHECK_REUSE_MS` (including zero); `configuredLimit` rejects zero, so that injection stays a dedicated reader.
- Slices 1 and 2 are a safe stopping point: the saving and the freshness promise hold with fixture proof; slice 3 adds the real observation the evaluation basis names.

## Learnings

- **Slice 3 real-dashboard observation (2026-11-05):** At landed slice-2 revision
  `37e16d3fb767ac2a4367f2b9e3cf741d593453b4`, a throwaway Vite dev server (private HOME with a
  one-project Open Dough list, `GH_TOKEN` from `gh auth token`, private
  `DOUGH_GITHUB_REQUEST_OWNER_ROOT` mode `0700`, `gh` wrapper on PATH logging every invocation)
  opened two headless Playwright pages of Open Dough about seven seconds apart and kept them
  visible for one quiet minute after both settled. The wrapper counted **4** `matching-refs`
  invocations in that minute (baseline eight = four per visible page); three of the four were
  conditional `If-None-Match` asks. Page A check times (UTC): `01:18:21.152Z`, `01:18:36.705Z`,
  `01:18:52.340Z`, `01:19:08.013Z`. Page B check times (UTC): `01:18:25.813Z`, `01:18:40.870Z`,
  `01:18:55.923Z` (three in the minute; B settled ~8 s after A). Quiet window
  `01:18:10.323Z`–`01:19:10.325Z`. Both pages kept their snapshot with no problem alert. No product
  source changed for this observation; production on `:4173` was not restarted for the proof.

## Slice 1 accepted proof (reuse)

- Boundary listing reuse/failure specs: `authenticated-read-shared-listing.spec.ts`, `authenticated-read-shared-listing-failures.spec.ts`, plus existing revision-check, shared, waiter, and `shared-observation` suites.
- `github-requests.test.mjs` for `scope()`.
- `npm run --silent typecheck:dashboard`.
- consumer-trace terms `never reused` / `abandons a check`: G1 proved by slice 2 docs and `shared-observer-check-reuse.spec.ts`; listing lifetime covered by the listing specs.

## Concern evidence

Slice-plan refinement was not needed: each slice owns one proof loop, the one structural addition
(the scope accessor) is part of the Behavior it serves, and the sequence reuses the server's
existing shared observation rather than a second sharing rule. No slice-specific concern remains.
Between slices 1 and 2 the documents still described the old rule while the boundary already
reused listings; slice 2 replaced them.

## Story obligations

### G1. Documents still describe finished-answer never reused
Reported: slice 1 — "PUBLISHED-OBSERVATION.md and GITHUB-REQUESTS.md still say a finished ref, branch-head, or check answer is never reused and that a check under way is abandoned, while the boundary already reuses settled listings within the window."
Story clause: "A page's scheduled revision check is answered from the branch-head listing this dashboard process last settled for that project when that listing is younger than the check pace"
Disposition: proved by slice 2: dashboard/PUBLISHED-OBSERVATION.md and dashboard/GITHUB-REQUESTS.md state listing reuse within checkReuseMs; shared-observer-check-reuse.spec.ts

### G-excl-deferred. Deferred promises stay deferred
Reported: slice 1 — "Deferred promises named in the story remain out of this delivery."
Story clause: "Deferred promises: sharing settled listings across separately launched dashboard processes, decided from those servers' measurements (see Open Decisions); delivering updates to pages without their recurring local check (the SSE story); fewer requests for a single page; an immediate shared check on a known publication event."
Disposition: excluded "Deferred promises: sharing settled listings across separately launched dashboard processes, decided from those servers' measurements (see Open Decisions); delivering updates to pages without their recurring local check (the SSE story); fewer requests for a single page; an immediate shared check on a known publication event."
Commitment: D1, D2, D3, D4

### G-excl-limits. Scope limits unchanged
Reported: slice 1 — "No change to what a page shows or when it reads content; no new daemon, database, or scheduler; no change to the request owner's protocol."
Story clause: "Scope limits: no change to what a page shows or when it reads content; no new daemon, database, or scheduler; no change to the request owner's protocol."
Disposition: excluded "Scope limits: no change to what a page shows or when it reads content; no new daemon, database, or scheduler; no change to the request owner's protocol."
Commitment: E1, E2, E3, E4, E5, E6

## Execution complete

Product advice: reasoned no-change. The delivery matches the story's shared-listing
outcome; near-future direction stays with existing SEED-232 siblings (SSE, Running
Cursor sessions) for deferred follow-ons. Nothing new to queue from this delivery.
