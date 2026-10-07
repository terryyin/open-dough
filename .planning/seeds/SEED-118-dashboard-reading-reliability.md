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
remain missing when a later check finds an unchanged revision. Cache validation
can compare revisions and read intervening commits before answering the backlog.
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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer observing the same published project in multiple
tabs or continuing observation after the dashboard server is replaced.

**Goal:** Repeated observation of the same published facts makes measurably
fewer upstream requests while preserving useful publication freshness and
trustworthy revision evidence.

**Scope:** Measure staggered visible-tab checks and reads after server
replacement, then improve the contributors whose avoidable cost is established.
Consider sharing revision observation across tabs and retaining successful
immutable answers across deployments. Select mechanisms and lifetime policies
during refinement; no new storage service, Git mirror, or authentication model
is prescribed. Preserve hidden-page behavior, access boundaries, and the
rate-limit admission contract. Moving refs still need fresh evidence, and failed
or missing answers must not become durable facts.

**Key examples / evaluation:** Observe one tab and several staggered tabs on an
unchanged project, then publish a change and compare request counts and time to
visibility. Replace the server between reads of the same pinned revision and
measure which immutable facts are reread. After the selected improvement,
repeat those journeys and demonstrate the reduction without hiding changed
membership or attribution. Count HTTP requests separately from primary-quota
charges, since authenticated conditional 304 responses can avoid the latter.
Use controlled replay for attribution of savings and bounded production
observations to establish relevance.

**Open questions for refinement:** Which contributor matters most after the
earlier deliveries, observation-sharing lifetime, cache ownership and access
invalidation across replacements, and whether the two contributions warrant
separate stories once measured.

**Depends on:** No blocking story prerequisite. Its lower priority reflects
user value and learning order, not a required implementation dependency.

**Safe stopping point:** A demonstrated reduction for the selected costly
journey remains useful without expanding into all GitHub consumers or other
machines.

## Ordering and Scope Reduction

Terry selected these as production backlog priorities 1–3 on 2026-10-07.
Recovering from temporary failures comes first because the reported timeout can
leave the page empty indefinitely. Faster basic cards comes next. Measured
request savings follows and is the first work to defer if scope is reduced.
Diagnostics belong to the recovery story, not a separate metrics product.

The recovery story has recorded refinement and an associated Slice Plan; its
siblings await refinement and execution-approach selection. All three remain
queued. Preparation records do not authorize implementation.

## Breadcrumbs

- Terry's screenshot and report of recurring timeout and CLI 403 messages,
  follow-up review, and explicit selection of the three stories, 2026-10-07.
- [Dashboard request accounting](../../dashboard/GITHUB-REQUESTS.md).
- [Published reading contract](../../dashboard/PUBLISHED-OBSERVATION.md).
- [Project visibility requirements](../../docs/project-visibility-requirements.md).
- [GitHub API troubleshooting](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api).
- [GitHub API best practices](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api).
