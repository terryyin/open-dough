---
id: SEED-118
status: active
planted: 2026-10-07
planted_during: Terry's follow-up review of dashboard GitHub responsiveness
trigger_when: A temporary GitHub failure leaves the dashboard empty or incomplete, or repeated observations reread the same published facts
scope: unknown
---

# SEED-118: Reliable dashboard reading after temporary GitHub failures

## Why This Matters

A developer observing published work needs the dashboard to recover from a
temporary service failure without repeatedly reloading the page. Terry still
sees the 30-second "Published work could not be read" message and reports
occasional GitHub CLI 403 responses after most of the original responsiveness
improvements have shipped.

The review on 2026-10-07 found independent fact arrivals, shared outstanding
reads, and reuse after publication in production. Consistent rate-limit
recovery was implemented on a separate branch and is expected to land soon.
That story, SEED-113#recover-consistently-from-rate-limits, explicitly excludes
ordinary timeout and connection-failure recovery. These follow-ups preserve
its cooldown and demand-admission behavior.

The reported timeout happened before backlog membership appeared. Initial
failure leaves no shown revision to drive refresh checks; failed details also
remain missing when a later check finds an unchanged revision.
Successful cached answers are held in memory and disappear on server replacement;
separate dashboard processes do not share them. Cards render a shared snapshot,
while collecting its profiles, histories, and other records still makes
individual requests.

One live GitHub ref read succeeded in 0.17 seconds and the running dashboard's
initial endpoint succeeded in 0.36 seconds during the review. Those samples did
not reproduce the earlier failure or establish a cold-load baseline. The
failing response was not captured, and a generic 403 does not establish a rate
limit. The selected work must distinguish observed causes from hypotheses.

## Selected Stories

<a id="recover-from-temporary-github-failures"></a>

### Recover automatically from temporary GitHub failures

**Identity:** SEED-118#recover-from-temporary-github-failures
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/273-temporary-github-recovery/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a00c79f5f6c7931c411136f10b674fb65264e750679331e0a7ca941cd4d6135a","plan":"75e21892bbce55326c72d652145cfb224abcecaa0409b7e97b9d72fdf038be58"}}
```

**Beneficiary:** A developer whose dashboard initially fails to read published
work or leaves assignment, human-credit, or progress details unavailable after
a temporary GitHub failure.

**Goal:** Once GitHub answers again, the visible dashboard recovers the failed
initial read or missing details without a reload or a new publication, while
retaining successfully read facts and explaining any continuing failure. This
restores useful observation of published work; it does not promise a faster
first read or establish the cause of Terry's uncaptured timeout or 403.

**Scope — required behavior:**

- **Recognize an eligible failure from evidence.** Retry a read that reached
  its wait bound, a recognized temporary connectivity failure (such as a DNS
  lookup failure, unavailable network, or dropped, reset, or refused
  connection), or HTTP 408, 500, 502, 503, or 504. A GitHub-marked rate limit
  uses the rate-limit policy instead, whatever its HTTP status. Cancellation
  on hiding, project switching, disconnect, or shutdown is not a retryable
  failure. An unknown CLI failure, invalid answer, invalid published record,
  authentication problem, permission refusal, or unmarked 403 is not presumed
  temporary. Report the established category and a useful next action; do not
  automatically repeat an unclassified or access-refused read.
- **Pace recovery for the selected project.** After an eligible failed read
  settles, wait 15 seconds before retrying; after successive failed recovery
  attempts, wait 30 and then 60 seconds. A continuing outage thereafter gets
  at most one recovery attempt per minute while the page is visible. These
  waits begin when the preceding attempt settles, and every attempt retains
  the existing 30-second read bound. There is no retry loop inside a single
  boundary request. Recovery remains automatic during a longer outage; it
  does not exhaust a finite budget and strand the page. A successful unrelated
  detail or unchanged-ref check does not reset the backoff for a remaining
  failure; recovery of the failed work or selecting another project does.
- **Recover membership and detail.** Recovery works with no shown snapshot,
  and for failed preparation records, profiles and assignments, profile
  history and human credit, plans and progress, Take clocks, and done records
  in a shown snapshot. An unchanged ref is not evidence that a failed detail
  has healed: that eligible unread detail is asked again. A fresh observation
  may reuse successful answers under the existing cache evidence, and does
  not request successfully read immutable facts again merely to recover a gap.
  A read established as missing or non-retryable does not enter a retry loop
  merely because another detail failed temporarily.
- **Keep evidence coherent.** Keep successfully shown membership and detail
  during recovery. Each answer belongs to the revision or recorded story
  branch head it describes; no failure establishes absence. If the ref moves
  during recovery, a new snapshot replaces the old one under the published
  reading contract. A late answer from the older observation cannot fill its
  gaps into the new snapshot or another project. A successful ref check alone
  neither clears a detail gap nor claims that the whole read succeeded.
- **Respect visibility and existing demand policy.** Hidden pages initiate no
  recovery attempts or revision checks. Hiding cancels the pending recovery
  timer and gives up that page's outstanding recovery wait without ending a
  shared read another page needs. On return, recover once when due, or wait
  for the remaining backoff or cooldown; do not replay missed attempts or
  reset the backoff by toggling visibility. Project switching abandons the
  old recovery, and shutdown ends its waiting reads. Recovery and ordinary
  revision checks do not overlap or bypass one another's recovery wait.
  Preserve outstanding-read sharing and the rate-limit story's single
  process-wide admission, eight-read bound, and paced resumption. Ordinary
  transient failures do not start a login-wide cooldown or hold back another
  project's reads. When a rate limit intervenes, nothing retries before its
  resume time, and its wait takes precedence over a shorter transient backoff.
- **Explain the continuing failure.** The existing read status and affected
  gaps say what is unavailable, that automatic recovery is pending or under
  way, and when the next attempt is due. Access or configuration failures say
  what to correct before reading again. Keep the last snapshot's revision and
  retrieval evidence visible. Recovered facts clear their own gaps; a
  continuing failure stays visible even if other facts recover. Enrichment
  preserves the selected columns, story inspection, and focus as today.
- **Retain bounded safe diagnostics on the launching machine.** The dashboard
  server retains its latest 100 failed upstream reads in memory, evicting the
  oldest. A maintainer can inspect them through a read-only local diagnostic
  response under the same origin/access protections as the read boundary.
  Each shared upstream read produces one failure record, not one per waiter.
  Records contain time, project identifier, fixed request category, pinned
  revision when known, failure classification, elapsed time, HTTP status,
  GitHub request ID, and validated rate-limit limit/remaining/reset/resource
  and Retry-After values when available. Values have fixed bounds; credentials,
  request or response bodies, raw CLI output, and arbitrary headers are never
  retained or returned. A read held back by admission is distinguishable from
  an upstream failure and invents neither an HTTP status nor request ID.
  Browser/boundary timeouts without an upstream answer remain distinguishable
  in the visible failure; unavailable metadata is left unknown.

**Scope — deferred promises:** Faster basic cards, reducing reads across tabs
or server replacement, persistent diagnostic history, a diagnostics screen,
metrics export, proactive quota management, automatic login or permission
repair, and retries of publication or other mutating commands. These are not
rejection rules for behavior the current product already supports.

**Key examples / evaluation:**

1. The initial ref or backlog read times out and no cards are shown. GitHub
   answers the next eligible attempt: cards appear without reload, with the
   temporary failure and recovery timing explained while waiting.
2. At revision A, one profile-history read times out while membership and
   unrelated details succeed. GitHub still names A and later answers that
   history: human credit and its shared Take clock recover in the card,
   inspection, and roster where applicable. The successful content is not
   fetched again, and the shared addition is not requested separately for
   credit and clock. Other eligible detail gaps recover the same way.
3. Successive attempts receive 503. With promptly settled failures, observe
   waits of 15, 30, 60, then 60 seconds between attempts, with no simultaneous
   retry/check and no immediate request loop. Later success recovers the page;
   each unanswered attempt still ends at the ordinary read bound.
4. A page is hidden during a recovery wait or shared read. It asks nothing
   while hidden; another waiting tab may finish that shared read. On reveal
   the page performs one due recovery, or waits for a still-future due time.
   Repeated hiding/revealing creates neither extra attempts nor a fresh budget.
5. Recovery first receives a GitHub-marked rate limit. Another tab or project
   cannot bypass the process cooldown; a cached successful answer does not
   lift it. Recovery resumes under the existing paced admission after the
   directed time, even when the snapshot revision remains unchanged.
6. A read receives an unmarked 403, 401, or 404, or fails because `gh` is not
   logged in. It explains the observed refusal and access check without
   calling the repository absent or repeatedly retrying it. Recovering an
   unrelated temporary gap does not repeatedly ask for the refused fact.
7. Snapshot A is shown when a detail fails. Recovery discovers B, or the
   developer switches projects before A's late answer arrives. Successfully
   read A facts remain useful until replacement, but the late answer never
   supplies B's facts or changes the other project's view.
8. A maintainer inspects a timeout, an unmarked 403, and a rate-limit refusal.
   Diagnostics distinguish their request categories, elapsed times, statuses
   and available GitHub IDs/headers without secrets or raw output. After 101
   failed upstream reads, only the latest 100 remain; concurrent waiters add
   one record for their shared read. A server restart has no retention promise.

Exercise these journeys through the dashboard's actual read boundary with
controlled GitHub answers, observing upstream calls and displayed recovery.
Use those observations to prove the behavior rather than treating the reported
but uncaptured production failure as an established cause.

**Policy basis:** GitHub's
[troubleshooting guidance](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api)
distinguishes timeouts, rate limits, and insufficient permissions; its
[best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api)
require respecting directed waits and addressing repeated errors. The
15/30/60-second recovery pace and 100-record diagnostic limit are this story's
selected defaults, not GitHub requirements. Follow the
[published reading contract](../../dashboard/PUBLISHED-OBSERVATION.md) and
[visibility requirements](../../docs/project-visibility-requirements.md).
Under [ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md), recovery design
stays with the feature; [ADR 0002's high-cohesion principle](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires extending the existing read/recovery owners rather than duplicating
the same policy per kind of read. No Accepted-ADR conflict was found.

**Depends on:** No blocking story prerequisite. Reuse and reconcile with the
rate-limit recovery owner rather than introducing a competing recovery policy.

**Safe stopping point:** Temporary failures heal without reload even if the
initial reading path and request savings remain as they are.

<a id="reduce-repeated-reads-across-tabs-and-deployments"></a>

### Reduce repeated GitHub reads across tabs and deployments

**Identity:** SEED-118#reduce-repeated-reads-across-tabs-and-deployments
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/275-retained-answers-across-processes/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"9710f0593ca93659842f16747345dd8ff8ae37314193f54d935e499cbc18b70c","plan":"0f670ffdacd596f30b05c73e0fba284895d6b38f91356b8b93fb671cadf316b9"}}
```

**Beneficiary:** A developer who keeps observing the same published project
while the dashboard server is replaced, or who runs more than one dashboard
process on the same machine, and whose GitHub allowance those processes share
with every agent `gh` command on that machine.

**Goal:** Once a dashboard process on this machine has read a published fact
at a resolved commit, a later process on the same machine does not ask GitHub
for it again: a page that outlives a server replacement, or a second process
reading the same revision, costs only the fresh revision evidence. Publication
freshness, the revision each answer belongs to, and the access boundary stay
as they are. This story does not promise fewer requests from one tab, a faster
first read of a never-read revision, or an explanation of the reported 403.

**What was observed (2026-10-08, refinement):** Facts, each with its source;
hypotheses are listed after them.

- A conditional branch-head listing that GitHub answers `304 Not Modified`
  charges nothing against the primary `core` allowance, while a `200` charges
  one request (observed with `gh api` and the `X-RateLimit-Used` header). The
  server already keeps the listing's ETag per source
  (`dashboard/server/revisionChecks.ts`), so every visible page's 15-second
  check at an unchanged project is a `304`. Staggered visible tabs therefore
  cost HTTP requests and `gh` processes, not allowance; and only one tab per
  browser window is visible, hidden pages checking nothing.
- A first visit to Open Dough at its current size, read through the actual
  boundary on a freshly started server with a counting `gh` wrapper, cost 67
  charged requests: 14 done records, 12 plans, 10 history listings, 9 seeds,
  7 profile-addition commits, 7 profiles, 3 story-branch heads, two directory
  listings, the backlog, the project file, and the ref. A reload at the same
  revision cost the ref plus one per recorded story branch (4). Everything
  else was answered from the process's memo (`dashboard/server/pinnedMemo.ts`),
  which holds at most 500 texts in memory and dies with the process.
- The production watcher (`scripts/watch-dashboard.mjs`) replaces the server
  whenever origin/main gains a commit outside the CI push exclusions
  (`.planning/**`, `docs/**`); in the seven days before refinement such
  commits landed in 380 distinct five-minute windows. Each replacement costs
  every connected page a first visit of its project.
- During a one-minute sample, dashboard processes launched from two sibling
  worktrees (development and preview servers of other agent sessions) made
  their own `gh` reads of the same repository, each with an empty memo. All of
  them, and every agent's own `gh` commands, draw on one allowance: it showed
  2,142 of 5,000 used before the observation with no production page
  connected, and 3,086 three minutes later.
- Nothing in production records upstream request counts; the recovery
  sibling's diagnostics record failures only.

Hypotheses this leaves open: how many visible windows Terry keeps and how
often a replacement lands while he is observing (unobserved; two Safari
connections to the production server were seen once); whether the reported
403s are secondary limits from first-visit bursts or primary exhaustion by
agent commands (the recovery sibling's diagnostics will show); and whether a
`304` counts toward GitHub's secondary limits (not safely observable).

**Selected mechanism:** Retain immutable GitHub answers in a disposable store
under this machine's dashboard home (the directory that already holds launch
and deployment records, owner-only), read and written by every dashboard
process of this user through the existing memo owner rather than a second
cache layer. An answer is retained only under a key that names exactly one
text: file text and directory listings at a commit sha, a blob's text by its
blob sha, a commit's own change list, a comparison of two commits, a
profile's addition commit, and a plan's last commit time at a commit. The
revision at which a source's backlog was last answered may be retained as a
comparison input, since the comparison itself is always asked of GitHub.
Rejected: handing the memo from the old production server to its replacement,
which covers neither sibling processes nor a crashed server and adds a
protocol; and browser-side storage, which covers one browser profile only and
would make the browser a source of repository text. Sharing revision
observation across tabs is deferred, Terry deciding so on 2026-10-08: the
measurement above shows it would save `gh` processes, not allowance, and the
recovery and basic-cards siblings already change the check path.

**Scope — required behavior:**

- **Answers survive the process.** A fact read at a resolved commit by one
  dashboard process of this user is answered to a later or concurrent process
  on the same machine without asking GitHub, under the same reuse rules the
  running process applies today, including reuse at a newer revision through
  GitHub's own account of what changed.
- **Fresh revision evidence every time.** Which commit the configured ref and
  each recorded story branch names, every revision check, and every comparison
  and commit change list used to reuse across revisions are asked of GitHub
  as today. A retained answer serves only a revision that the current process
  has itself heard GitHub name in this run, so a login GitHub now refuses fails
  at the ref before any retained text is shown, and the shown revision and
  retrieval time remain GitHub's.
- **Never durable: anything but a successful immutable answer.** Failures,
  missing records, timeouts, rate-limit waits, and branch-head hints are not
  retained; a retained store that is absent, unreadable, or malformed is
  treated as empty and rebuilt, and deleting it loses nothing but requests.
- **Bounded and private.** The store has a fixed byte budget (this story's
  default: 64 MiB), evicting the least recently used revision's answers first;
  an eviction costs at most a first visit. Retained text is readable only by
  this user, is served only through the existing local boundary under its
  origin and access protections, and never reaches the browser other than as
  today's answers. Tests and separately configured homes use their own store,
  resolved the way the project list is.
- **Preserved contracts.** Shared outstanding reads, the eight-under-way
  bound, hidden-page rules, project switching, the rate-limit admission and
  cooldown, and the 30-second bound are unchanged. The request accounting and
  the published reading contract state what survives a process and what does
  not.

**Scope — deferred promises:** Sharing one revision observation across visible
tabs, retaining answers across machines, a store shared with agent `gh`
commands, proactive quota management, and request counting or metrics in
production. These are not rejection rules for behavior the product already
supports.

**Key examples / evaluation:**

1. A page shows Open Dough at revision A, read by process P1 (67 upstream
   requests on a first visit). The watcher replaces P1 with P2 while the ref
   still names A. The page's next check or reload against P2 asks GitHub for
   the ref and the three recorded branch heads only; every card, credit,
   clock, and done record is as before, with a fresh retrieval time.
2. After the replacement the ref names B, one commit after A that touched one
   seed. P2 asks the ref, the backlog at B, the comparison of B with A, that
   commit, and the touched seed; untouched records, histories, additions, and
   plans are B's own from the retained answers, as a running process reuses
   them today.
3. A second dashboard process on the same machine (a development server, or
   a test harness pointed at its own home) opens the same project at A after
   P1 read it: it asks the ref and branch heads, and nothing else; its own
   home retains nothing from P1 when the homes differ.
4. At A, one profile history timed out and one done record was missing in
   P1. P2 asks both again; it does not inherit the gap or the absence. A
   rate-limit wait P1 was observing is not inherited either: P2 asks at once,
   as a newly started dashboard does today.
5. `gh` is logged out between P1 and P2. P2's ref resolution fails and the
   page shows the read problem with no snapshot; no retained text appears
   under A merely because the store holds it.
6. The store exceeds its budget after many revisions. The least recently
   used revision's answers go first; a later first visit to that revision
   costs what it costs today, and the current revision stays cheap.
7. Two visible windows observe one project on one process: each still makes
   its own `304` check every 15 seconds, as today, and neither rereads
   content (unchanged behavior, demonstrating the deferred contributor).

Prove examples 1–6 through the dashboard's actual read boundary with
controlled GitHub answers, starting a second boundary process against the
same temporary home and counting upstream calls per process. Confirm
relevance once with one bounded production observation across a watcher
replacement, counting `gh` invocations as this refinement did, without
treating the uncaptured 403 as explained.

**Policy basis:** The
[project visibility requirements](../../docs/project-visibility-requirements.md)
allow fetching or caching remote Git data and disposable cache storage while
forbidding a persistent project-state store; the retained answers are
rebuildable from origin and never a source of what is published. Under
[ADR 0002's high-cohesion principle](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
extend the existing memo owner so reuse keeps one representation; under
[ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md), the store is
feature-local design, not an ADR. ADR 0008 (Proposed) informs the same
boundary and binds nothing. No Accepted-ADR conflict was found.

**Architecture:** This story adds one responsibility, machine-local retention
of immutable upstream answers across dashboard processes, and places it with
the memo that already decides reuse. Its qualities are immutability of every
retained key, concurrent access by several processes of one user (atomic
writes; a torn or foreign file is a miss), a bound that keeps the store
disposable, and the rule that a process never shows a retained text for a
revision it has not heard GitHub name in this run. The store holds private
repository text on the launching machine with owner-only access, as the `gh`
configuration already does; revoking GitHub access does not purge it, which
the developer owns by deleting the directory.

**Depends on:** No blocking story prerequisite. Reconcile with the recovery
sibling's plan where both touch the memo: its reuse of successful answers and
its diagnostics stay in process memory, and retained answers never become
failure or diagnostic records.

**Safe stopping point:** A page outliving one production replacement costs
only revision evidence, even if sibling-process sharing or the bound's
tuning is deferred.

## Ordering and Scope Reduction

Terry selected these as production backlog priorities on 2026-10-07.
Recovering from temporary failures comes first because the reported timeout can
leave the page empty indefinitely. Measured request savings follows and is the
first work to defer if scope is reduced.
Diagnostics belong to the recovery story, not a separate metrics product.

The recovery story has recorded refinement and an associated Slice Plan. The
request-savings story has recorded refinement and an associated Slice Plan.
Both remain queued. Preparation records do not authorize implementation.

## Breadcrumbs

- Terry's screenshot and report of recurring timeout and CLI 403 messages,
  follow-up review, and explicit selection of the three stories, 2026-10-07.
- Refinement observation of 2026-10-08: a `304` branch listing charged no
  allowance; a first visit to Open Dough cost 67 `gh` requests on a fresh
  server; sibling worktree dashboards read GitHub on their own.
- [Dashboard request accounting](../../dashboard/GITHUB-REQUESTS.md).
- [Published reading contract](../../dashboard/PUBLISHED-OBSERVATION.md).
- [Project visibility requirements](../../docs/project-visibility-requirements.md).
- [GitHub API troubleshooting](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api).
- [GitHub API best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api).
