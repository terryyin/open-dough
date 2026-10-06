---
id: SEED-113
status: active
planted: 2026-10-06
planted_during: Terry's investigation of dashboard GitHub request volume and responsiveness
trigger_when: A developer waits for published dashboard facts or sees repeated GitHub requests during loads and refreshes
scope: unknown
---

# SEED-113: Dashboard GitHub responsiveness

## Why This Matters

A developer observing a project's dashboard needs published facts to appear
promptly and remain useful while GitHub is slow or limiting requests. Terry
reported frequent GitHub requests and an intermittently unresponsive dashboard.
The desired effect is timely reading with fewer redundant requests, preserving
the revision, provenance, and explicit gaps of the facts shown.

An isolated replay on 2026-10-06 used Open Dough's published planning records at
`522c6062e0a55b732a2643243766a24f701401d8` with simulated GitHub answers and an
available story branch at a distinct head. It made 32 API calls for a cold load,
3 for a warm reload, and 26 for a newly resolved trunk revision whose planning
records were unchanged. Two simultaneous cold reads of the same file made two
upstream calls, as did two simultaneous revision checks. A separate file-read
probe returned a rate-limit failure without preserving GitHub's directed
120-second wait. These establish request behavior, not production latency or
fixed acceptance budgets.

## Alternatives and Decision

The remaining selected stories, in priority order below, address repeated
reads, consistent rate-limit recovery, and reuse after publication. Each can be
delivered and evaluated without completing the others.

Deferring leaves the reported waiting and request duplication in place.
Reloading manually repeats reads and is a workaround rather than a dependable
reading experience. Slowing the polling interval is a smaller change, but it
delays fresh publications without removing cold-load dependencies, duplicate
reads, or requests for unchanged content. The dashboard's
[published reading contract](../../dashboard/PUBLISHED-OBSERVATION.md) makes
available fact groups usable independently. The remaining direction reduces
duplication, establishes consistent rate-limit recovery, and reduces reads after
new publications.

Existing behavior is the starting point: local `gh` authentication, published
Git evidence pinned to resolved revisions, conditional revision checks, and
explicit unavailable facts. Measurements belong to the stories they evaluate;
there is no separate metrics product or mandatory replacement API, database,
Git mirror, or authentication model selected here.

## Story Decomposition

Effort bands remain unassigned because the repository supplies no S/M/L
definitions. Each story records its principal sizing uncertainty. These are
candidates for refinement; no executable plan or readiness assessment is implied.

<a id="share-repeated-observer-reads"></a>

### Share repeated reads across dashboard observers

**Identity:** SEED-113#share-repeated-observer-reads
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/261-shared-observer-reads/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5bb601b3d586242220e2038f04230302d8071fa8269eea08ff8e6de7aec87f0d","plan":"e5166ea19c69a7c8447dd68d517cd6c9e5b315150d739de784d62141751cb108"}}
```

**Beneficiary:** A developer reopening a dashboard or observing the same project
in multiple tabs served by one dashboard process.

**Goal:** Observers served by one dashboard process stop paying GitHub twice for
the same answer. Reads that need the same GitHub answer while it is outstanding
share one request, and content already read at a resolved revision is reused,
so reopening a project asks only what could have changed. Each observer still
sees the published facts it would have read alone.

**Current baseline:** The process already keeps completed file text, directory
listings, commit times, and profile additions by resolved commit, so a detail
read once is not asked of GitHub again at that revision. Three costs remain.
Requests arriving while a read is outstanding each start their own, as the
[replay above](#why-this-matters) recorded for file reads and revision checks.
Opening a project always reads its backlog again, even at a revision whose
backlog this process holds. Each request owns its GitHub work, so a requester
that leaves ends that work.

**Scope — required behavior:**

- While a GitHub read is outstanding, every dashboard request that needs the
  same answer waits for that one read. What is shared is the question asked of
  GitHub, not the dashboard request: revision checks from pages showing
  different revisions or watching different story branches share one
  branch-head listing, and each receives the answer to its own question. This
  covers pinned content and history, the resolution of a project's configured
  ref and of a recorded story branch, and revision checks.
- Completed content at a resolved revision is reused by every later read in
  that process, now including the backlog a membership read needs. Opening or
  reloading a project still asks GitHub which commit its configured ref names,
  and which head each recorded story branch names; it reads the backlog only
  when this process has not read it at that commit. A record GitHub answered
  as missing at that revision is asked for again, like a failed read.
- A shared read belongs to the requests waiting for it. One observer closing
  its tab, hiding its page, switching projects, or reaching its wait bound
  leaves the read running for the others. When no request waits for it any
  longer the read ends, as an abandoned read does today. Closing the dashboard
  server ends every outstanding read.
- A failed shared read gives each waiting request that failure, including any
  wait GitHub directed. A failure is never kept: the next request asks GitHub
  again and can succeed.

**Scope — evidence and failure constraints:** Follow the
[existing published reading contract](../../dashboard/README.md) and
[visibility requirements](../../docs/project-visibility-requirements.md).

- Published facts are pinned to a resolved revision. A read for another
  repository, revision, path, or kind of fact is a different read and never
  answers this one.
- Which commit a ref or branch names can change at any time, and the contract
  promises newly published work within about 30 seconds and a fresh reading of
  the ref on reload. A completed answer to such a question is therefore never
  reused: sharing lasts only while the request is outstanding, and the shared
  answer carries the time GitHub was actually asked, which launch
  reconciliation judges by.
- Sharing begins after a request is admitted on its own terms: local origin,
  configured project, a path reachable from the pinned revision's records, and
  a branch head this boundary resolved. No request receives through sharing an
  answer it could not have read alone.
- Only a successful read establishes content or absence. The 30-second bound
  stays: no request waits longer for a shared read than it would alone, and
  later arrivals cannot keep one GitHub read outstanding beyond that bound.
- Visibility and publication observation are unchanged: the 15-second check
  pace per visible page, silence while hidden, one check at once when a page is
  seen again, and exactly the newly named commit read after a change.
- What the process keeps stays in memory and bounded, as today.
- The [request accounting](../../dashboard/GITHUB-REQUESTS.md) and the reading
  contract describe the resulting costs.

**Scope — deferred promises:** [Recovering from rate limits](#recover-consistently-from-rate-limits)
owns cooldowns and aggregate request concurrency; a burst of different reads
is as concurrent as today. [Reuse after publication](#reuse-unchanged-records-after-publication)
owns unchanged content at a new revision. This delivery adds no coordination
of polling between tabs, no reuse of a completed ref or branch-head answer, no
sharing between separately launched dashboard processes or across a restart,
and no request-count or latency budget. It does not keep that a record was
missing at a revision: GitHub answers a missing record and one it will not show
alike, and asking again is how a reload recovers today. Avatar images, which use no `gh`
allowance, carry no new commitment.

**Key examples:**

| Pre-condition and trigger | Result |
| --- | --- |
| No observer has read a seed at the shown revision. Two tabs ask for it while GitHub's answer is held. | GitHub is asked once. On release both tabs show the seed's facts at that revision. A third request afterwards asks GitHub nothing. |
| Two tabs open the same project at the same moment. | The ref is resolved once and its backlog read once. Both show the same revision with the same asked time. |
| Tab A shows an earlier revision and watches no branch; tab B shows the current one and watches a story branch. Their revision checks are outstanding together. | One branch-head listing is asked. A learns the ref names another commit and reads it; B learns its revision is current and the head of its branch. |
| A project was read at the revision its ref still names. The developer reloads the page, or returns to the project. | GitHub is asked which commit the ref names, and the head of each recorded story branch. Backlog and record content are not read again; the page shows the same facts under its own new observation. A record that was missing or unreadable there is asked for again. |
| The same reload, after a new commit was published. | The ref names the new commit, whose backlog and records are read as today. Nothing kept for the earlier revision answers for the new one. |
| A revision check has just been answered. Another page is seen again a moment later and checks at once. | GitHub is asked again; the earlier answer is not replayed. |
| Two tabs wait on one held read. One tab is closed, hidden, or switched to another project. | The read continues and the remaining tab receives its answer. The departed observer's view is unaffected by it. |
| The only tab waiting on a held read leaves. | The read ends. A later request for the same answer asks GitHub anew. |
| Two tabs wait on one read that GitHub refuses, with or without a directed wait. | Both report that failure and the same resume time, each keeping its earlier snapshot. The next read asks GitHub again and, when it succeeds, clears the problem as today. |
| GitHub leaves a shared read unanswered, and further requests keep joining it. | Each request stops waiting within 30 seconds of asking and shows its gap or read problem. The read ends within 30 seconds of starting, however many joined, and a later request starts a new one. |
| Two tabs show different projects, or one project at two revisions, and ask for the same path together. | Two GitHub reads; neither answers the other. |

**Architecture:** The story moves the ownership of outstanding GitHub work from
one dashboard request to the requests waiting for one question, and makes that
a single rule of the local read boundary rather than a property of each read
kind. The [Architectural North Star](../NORTH-STAR.md#one-github-read-serves-every-observer-that-needs-it)
records this design until the code explains it. Accepted
[ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md) keeps this feature-local
design with the feature, so no ADR is proposed.
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
high cohesion asks for one representation of the sharing rule, extending the
boundary's existing memo, revision-check, and branch-head owners. No Accepted
decision conflicts.

**Evaluation:** Hold GitHub's answers through the existing local read boundary
and count what reaches GitHub. Two observers asking for the same uncached
pinned file are answered from one read, as are simultaneous revision checks.
Reopening a read revision asks only its moving refs. The departure, failure,
bound, and distinct-read examples qualify that result. Request counts are
observed for these examples, not adopted as budgets.

**Value / learning:** Reduce duplicated work and request bursts without changing
which published facts the developer observes.

**Effort hypothesis:** Band pending project definitions; the main uncertainty is
moving the lifetime of GitHub work from one request to its waiters consistently
across every read kind, including the existing disconnect and shutdown proof.

**Depends on:** No blocking story prerequisite; this story does not require
independent rendering or caching across different commits.

**Open decisions:** None about the goal, scope, or examples. This story selects
the request-sharing lifetimes and cancellation behavior that the seed left for
refinement. The selected execution approach and proof design are in the
[slice plan](../slice-plans/261-shared-observer-reads/PLAN.md).

**Safe stopping point:** Simultaneous and repeated reads cost less even if every
new trunk revision still needs a fresh set of record reads.

<a id="recover-consistently-from-rate-limits"></a>

### Recover consistently from GitHub rate limits

**Identity:** SEED-113#recover-consistently-from-rate-limits
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer whose GitHub allowance is shared by dashboard reads
and other work, particularly while several observers or detail reads are active.

**Goal:** Every authenticated dashboard read respects a GitHub-directed cooldown.
The shown snapshot remains useful, the reason for waiting is visible, and reads
resume without a request burst. Aggregate request concurrency stays bounded
across the process rather than only within one browser's file-reading group.

**Evaluation:** A content, history, branch, or revision read receives a rate-limit
answer directing a wait: other authenticated dashboard reads through the same
login do not reach GitHub before that wait ends, including after switching
projects or opening another tab. The available snapshot and failed detail remain
honest about their evidence. When the wait ends, recovery is paced; a secondary
limit without a usable wait receives a conservative delay and backoff.

**Scope and safety:** Preserve existing local authentication and request
allowlisting. Do not treat ordinary permission failures as proof of a rate limit.
Cancellation, project switching, and server shutdown remain effective while work
waits. Request counts, cooldown timing, and aggregate concurrency provide the
proof; exact scheduling parameters are refinement decisions.

**Value / learning:** Prevent avoidable refusals and repeated waiting while
making service-imposed delays understandable.

**Effort hypothesis:** Band pending project definitions; the main uncertainty is
carrying failure and cooldown information consistently through all read groups.

**Depends on:** No blocking story prerequisite. Shared code is not a dependency
on the observer-sharing story.

**Safe stopping point:** Rate-limit recovery and bounded request demand remain
useful even if unchanged records are still fetched after new publications.

<a id="reuse-unchanged-records-after-publication"></a>

### Refresh published work without rereading unchanged files

**Identity:** SEED-113#reuse-unchanged-records-after-publication
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer watching a project whose trunk receives frequent
publications, including changes outside its planning records.

**Goal:** A new published revision reuses unchanged record content and fetches
changed records, so fresh observations do not repeat the same content reads
merely because the repository's commit changed.

**Evaluation:** Publish an unrelated code change with identical planning records:
the dashboard observes the new revision without rereading every unchanged seed,
plan, profile, setting, and done-record file. Then change a planning record:
the new facts appear at the observed revision. A changed story branch continues
to update the progress read from that branch.

**Scope and safety:** Reuse must be established from published evidence. Preserve
deletion, missing-record, and failure distinctions. Identical bytes do not by
themselves establish identical allocation history, credited human, or last-commit
time. A removed and re-added identical profile must not inherit the earlier
allocation's provenance. Keep memory and request demand bounded.

**Value / learning:** Make refresh cost follow changed published content rather
than the whole set of dashboard records.

**Effort hypothesis:** Band pending project definitions; proving unchanged
content without weakening revision and historical provenance is the main sizing
uncertainty. The content-index and cache approach remains for refinement.

**Depends on:** No blocking story prerequisite; this outcome can be delivered
against the existing published read boundary.

**Safe stopping point:** New publications need fewer content reads while all
published-evidence qualifications remain valid.

## Ordering and Scope Reduction

The selected order favors immediate responsiveness, then contained request
savings, consistent recovery, and the broader content-reuse change. This is
priority, not a chain of required dependencies. If scope is reduced, defer the
fourth story first, then the third; retain already delivered value and reassess
remaining priorities from the developer's observations.

## Open Decisions Before Refinement or Planning

- Select request-sharing lifetimes and cancellation behavior while preserving
  freshness and the existing local access boundary.
- Select cooldown and concurrency policies from the actual read contract.
- Select how published evidence establishes unchanged content without reusing
  historical provenance incorrectly.
- Establish production latency baselines during the relevant story's proof;
  the isolated replay above does not establish them.
- Define project S/M/L bands before assigning comparative estimates.

## When to Surface

Terry selected these four stories for backlog priorities 1–4 on 2026-10-06.
They remain queued for refinement and subsequent executable planning.

## Breadcrumbs

- Terry's dashboard GitHub-usage investigation and selection of these four
  stories in this conversation, 2026-10-06.
- [Dashboard reading contract](../../dashboard/README.md).
- [GitHub request accounting](../../dashboard/GITHUB-REQUESTS.md).
- [Project visibility requirements](../../docs/project-visibility-requirements.md).
- [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
