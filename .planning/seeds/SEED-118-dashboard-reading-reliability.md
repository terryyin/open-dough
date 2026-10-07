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

<a id="show-cards-before-expensive-cache-validation"></a>

### Show basic story cards without waiting for expensive cache validation

**Identity:** SEED-118#show-cards-before-expensive-cache-validation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer opening or refreshing a dashboard whose published
revision changed while comparison or commit-history requests are slow.

**Goal:** Once the published revision and its backlog can be read, basic story
membership and titles appear without waiting for comparison or history work
used to validate reuse of later facts.

**Scope:** Establish a prompt path to basic cards, with detail and reuse
validation completing independently where their evidence allows. Preserve
published revision provenance, explicit gaps, and the existing bounded request
demand. Do not weaken evidence for unchanged assignment attribution or hide a
failure by displaying another revision's facts. Refinement selects the reading
strategy after measuring its latency and request-count tradeoff.

**Key examples / evaluation:** The server holds records from revision A and the
ref moves to B. Hold comparison or intervening-commit responses while answering
B's backlog: B's basic cards appear, with unread detail labeled. Later answers
complete only facts valid for B. A failed comparison does not prevent basic
membership from being shown when the backlog itself is readable. Compare time
to first cards and total upstream calls with the current route for unchanged
planning records and changed assignments. Keep the actual ref or backlog being
unavailable visibly distinct from slow enrichment.

**Open questions for refinement:** The smallest basic-card facts, how to keep
reuse validation off their critical path, and the acceptable extra-request
tradeoff supported by measured journeys.

**Depends on:** No blocking story prerequisite. Shared read machinery alone
does not require the transient-recovery story to finish first.

**Safe stopping point:** Basic published work appears promptly even if some
details still fail or further request savings are deferred.

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
