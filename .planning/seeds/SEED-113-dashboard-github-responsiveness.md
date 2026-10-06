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

Terry selected four independently useful stories, in the order below, and
requested them as the first four entries in the product backlog. Each can be
delivered and evaluated without completing the others.

Deferring leaves the reported waiting and request duplication in place.
Reloading manually repeats reads and is a workaround rather than a dependable
reading experience. Slowing the polling interval is a smaller change, but it
delays fresh publications without removing cold-load dependencies, duplicate
reads, or requests for unchanged content. The selected direction first makes
available facts usable, then reduces duplication, establishes consistent
rate-limit recovery, and reduces reads after new publications.

Existing behavior is the starting point: local `gh` authentication, published
Git evidence pinned to resolved revisions, conditional revision checks, and
explicit unavailable facts. Measurements belong to the stories they evaluate;
there is no separate metrics product or mandatory replacement API, database,
Git mirror, or authentication model selected here.

## Story Decomposition

Effort bands remain unassigned because the repository supplies no S/M/L
definitions. Each story records its principal sizing uncertainty. These are
candidates for refinement; no executable plan or readiness assessment is implied.

<a id="show-available-facts-promptly"></a>

### Show available dashboard facts promptly

**Identity:** SEED-113#show-available-facts-promptly
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/260-available-dashboard-facts/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e79fff9c35c53832059c037e4cebd7e0b669d9e9bf2375e6ecc4779138a1d32f","plan":"dc2e7924000d8463fe175b366bbc21a8a260b803226d875edbe230ebbc72c031"}}
```

**Beneficiary:** A developer reading published work while one group of GitHub
reads is slow or unavailable.

**Goal:** Once the published backlog's membership is known, a developer can use
each completed group of facts without waiting for unrelated groups. Earlier
assignments, preparation facts, and recently done stories make the dashboard
useful while the rest of the observation is still being read.

**Current baseline:** Slow done records already leave owners, preparation, and
slice clocks usable. The remaining wait is mutual: preparation and assignments
are withheld until both groups finish, and completed done records wait for that
same point. The existing slow-done behavior remains a regression example.

**Scope — required behavior:**

- Read and interpret the complete backlog before showing its membership and
  direction. After that, preparation facts, profile assignments, and done
  stories appear independently when their own required evidence has been read.
  Preparation includes the purpose, readiness, dependencies, and plan facts
  already shown; assignments include Taken owners, queued preparers, and the
  roster. This applies on opening, returning to a project, and reading a newly
  observed published revision.
- Keep an unfinished group's existing loading indication while completed
  groups become usable. A later update adds its facts to the same observation
  without removing or returning already read facts to loading. Preserve the
  existing independent arrival of credited humans and slice clocks.
- Respect actual evidence dependencies. For example, a slice clock still needs
  its plan and allocation evidence, and Story Branch Mode progress still needs
  the published assignment that identifies its branch. Completion of an
  unrelated group is never evidence that those dependent facts are known.
- Keep inspection and project switching usable. When the same story and control
  remain present, arrival of another group's facts retains the selected column
  page, keyboard focus, and open inspection, without resetting the reader to
  the overview or the top of the page. Existing launch and reconciliation rules
  continue to require their own evidence; showing a partial observation does
  not mean every detail has finished reading.

**Scope — evidence and failure constraints:** Follow the
[existing published reading contract](../../dashboard/README.md) and
[visibility requirements](../../docs/project-visibility-requirements.md).
All membership, preparation, profile, and done facts belong to the selected
project and the same pinned backlog revision. Story-branch progress retains its
own published source qualification. Missing evidence stays loading or explicitly
unavailable; it is never reported as an empty set, absent assignment, or fact
borrowed from a previous revision. Only a successful read can establish absence.

Keep the existing 30-second read bound and recovery rules. A failed or timed-out
detail leaves its explicit gap while independently completed facts remain
visible; retain the existing distinction between a project read problem and a
detail's own gap. A failure before membership is read keeps the prior snapshot,
if any, under its own revision. Project switching and replacement reads abandon
the previous observation, whose late answers cannot change the selected view.

**Scope — deferred promises:** The other three stories own observer request
sharing, consistent rate-limit recovery, and content reuse after publication.
This delivery makes no request-count reduction or new polling, concurrency,
authentication, retry, cache, layout, or launch-policy commitment. It does not
require showing each file or story separately before its read group finishes;
naturally supported finer updates remain possible.

**Key examples:**

| Pre-condition and trigger | Result while the delayed answer is still held |
| --- | --- |
| Backlog membership is shown; profile assignments finish while preparation records are held. | Taken owners, queued preparers, and the roster show the read assignments. Preparation remains loading. Credited humans remain qualified by their own read state. |
| Backlog membership is shown; preparation finishes while profile records are held. | Read purpose, preparation, readiness, dependencies, and plan facts appear. Assignments remain loading, without an inference that no agent is assigned. Progress that needs the missing assignment remains qualified as pending. |
| Done records finish while preparation or profile records are held. | Recently done shows its published stories without waiting for either unrelated group. The group's loading or failure state does not replace the read done facts. |
| Done records are held while preparation, assignments, and the required clock evidence finish. | Those facts and available slice clocks appear as they do today. Releasing the done answer fills Recently done without taking those facts away. |
| Preparation is still unread at the existing wait bound while assignments and done records have finished. | Unread preparation details become explicit gaps with the existing read-problem qualification where applicable. The read assignments and done stories remain useful. An ordinary detail failure has the same isolation from completed groups. |
| A newer backlog revision has been read after an earlier snapshot was shown; only the new revision's assignments have finished. | New membership and assignments are shown at the new revision. Preparation and done facts from the earlier revision are not carried over as if read at the new one. A late answer from the replaced read changes nothing. |
| A developer changes from project A to project B while A has outstanding detail reads. | B starts its own observation and stays selectable and readable. A's late answers cannot replace B's facts, loading state, failure, or focus. |
| A developer has paged to and focused a still-present story, or opened its inspection, while another group finishes. | Its available detail updates in place; the selected page, valid focused control, and open inspection remain. |

**Evaluation:** Hold the relevant GitHub answers through the existing local read
boundary and observe the dashboard. Completion is demonstrated by useful facts
appearing before the unrelated held answer is released, then by that answer
joining the same observation without losing read facts or reader context. The
failure, replacement, and switching examples qualify that result. No invented
production latency threshold or API-call budget is required; production timing
can inform the evaluation without replacing these observable examples.

**Value / learning:** Test whether removing the shared loading wait materially
improves the developer's time to useful information.

**Effort hypothesis:** Band pending project definitions; the main uncertainty is
preserving coherent partial observations and focus through independent updates.

**Depends on:** No blocking story prerequisite.

**Open decisions:** None about the goal, scope, or examples. The selected
execution approach and proof design are in the
[slice plan](../slice-plans/260-available-dashboard-facts/PLAN.md).

**Safe stopping point:** The developer benefits from earlier available facts even
if request sharing and caching across commits are never implemented.

<a id="share-repeated-observer-reads"></a>

### Share repeated reads across dashboard observers

**Identity:** SEED-113#share-repeated-observer-reads
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** A developer reopening a dashboard or observing the same project
in multiple tabs served by one dashboard process.

**Goal:** Identical outstanding reads share one upstream request, and completed
immutable content at the same revision is reused on subsequent reads. Reopening
the same revision does not unnecessarily fetch its backlog content again.

**Evaluation:** Two observers request the same uncached pinned file while its
answer is held: both receive it from one GitHub read. The same applies to
equivalent simultaneous revision checks. Reopening a previously read revision
reuses its content while still establishing the required freshness of moving refs.

**Scope and safety:** Different repositories, revisions, paths, and materially
different reads stay distinct. One observer leaving cannot cancel a read another
still needs. Failures leave a useful recovery path. Preserve current visibility
and publication-observation behavior, including checks when a page is seen again.

**Value / learning:** Reduce duplicated work and request bursts without changing
which published facts the developer observes.

**Effort hypothesis:** Band pending project definitions; cancellation ownership
and equivalent checks across observers are the main sizing uncertainties.

**Depends on:** No blocking story prerequisite; this story does not require
independent rendering or caching across different commits.

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
