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

<a id="recover-consistently-from-rate-limits"></a>

### Recover consistently from GitHub rate limits

**Identity:** SEED-113#recover-consistently-from-rate-limits
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/264-rate-limit-recovery/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a0cc376ed545ac1b197ba897046a619f49ad3d8484d144e4c9d135aa02ef4236","plan":"8352e2b813c27f7e4669567958345bf0a9594d226596942dd009167b7d4d98c6"}}
```

**Beneficiary:** A developer whose GitHub allowance is shared by dashboard reads
and other work, particularly while several observers or detail reads are active.

**Goal:** When GitHub limits the local login, the dashboard stops asking until
GitHub allows it again, whichever read met the limit and whichever tab or
project asks next. What is shown stays useful and says why reading waits and
until when. When the wait ends, each page reads what the limit withheld without
a reload and without a burst. The reads one dashboard process has under way at
GitHub stay bounded across its tabs and projects.

**Current baseline:** Only a revision check and a commit comparison learn the
wait GitHub directed; a refused content, listing, history, or ref read reports a
rate limit without it, as the [replay above](#why-this-matters) recorded. The
wait is kept by the one page whose check or membership read was refused, and
only postpones that page's checks: another tab, a reload, or another project
asks GitHub again at once. A detail the limit refused is a gap like any failed
read, and returns only on reload or a later publication. Reads are bounded four
at a time within each of a page's file-read groups and each listed-record read,
while those groups, clock evidence, and credited humans run together, and
every tab adds its own.

**Human attribution intent (2026-10-07):** Terry reports frequent "Human
developer unknown" and wants dependable assignment credit with fewer redundant
requests. A rate-limited profile-history read is a withheld human credit, not
evidence that the assignment has no human developer. At today's unchanged
revision, periodic checks do not retry that detail. This story owns its
automatic recovery after the limit; delivered [reuse after publication](../../dashboard/GITHUB-REQUESTS.md)
avoids history reads for unchanged assignments. The reported failing
response has not been captured, so this does not classify every unknown label
as a rate-limit defect. Ordinary connection failures and timeouts remain a
follow-up to reassess after these two deliveries; they are not added to this
story's recovery scope.

**Scope — required behavior:**

- **Every read learns GitHub's direction.** A refusal GitHub marks as a rate
  limit, on any authenticated read, establishes the wait it directed
  (`Retry-After`, or `X-RateLimit-Reset` once `X-RateLimit-Remaining` is `0`),
  validated and bounded to one hour as today. This covers content, directory
  listings, history, ref and branch-head resolution, revision checks, commit
  comparison, and the check made when a project is added.
- **One cooldown for the process.** The local `gh` login has one allowance, so
  the wait belongs to the dashboard process, not to a page, project, or kind of
  read. Until it ends no authenticated read reaches GitHub: a request from any
  tab or project, including one waiting for its turn, is answered at once as
  limited, with the same resume time, and says it was not asked. A read already
  at GitHub when the refusal arrived keeps its own answer. A further refusal
  moves the resume time only later.
- **A limit that directs no usable wait** starts a 60-second cooldown. Each
  further such refusal with no successful read between doubles it, up to the
  one-hour bound; a successful read ends the doubling. This is GitHub's own
  guidance for secondary limits: wait at least a minute, then exponentially
  longer.
- **Paced resumption.** When a cooldown ends, the first read goes to GitHub
  alone. Once it is answered the rest proceed under the bound below. If it is
  refused, the cooldown starts again and nothing else was asked.
- **Bounded demand.** One dashboard process has at most eight reads under way
  at GitHub, whatever the number of tabs, projects, and kinds of read. A
  request waits its turn in order of arrival, and that waiting counts toward
  its 30-second bound. Eight lets one page's load proceed about as it does
  today while further observers add no concurrency.
- **One recovery on the page.** A page whose read or check was limited keeps
  what it shows and says that GitHub limited requests and when reading resumes,
  in the same way whichever read was limited. A detail the limit withheld is
  labeled as withheld by the limit. Until the resume time the page asks
  nothing. Then a visible page reads on its own what the limit withheld: the
  project when nothing is shown, the withheld details of a shown snapshot, and
  its revision check. Content already read is not asked again. A hidden page
  does so when it is seen again. This includes a profile's credited human:
  even if trunk has not moved, its withheld history is read after the wait,
  and a successfully established name replaces "Human developer unknown" on
  its card, detail, and roster without a reload. Human credit and the Take's
  slice clock continue to share one addition read.

**Scope — evidence and failure constraints:** Follow the
[existing published reading contract](../../dashboard/PUBLISHED-OBSERVATION.md)
and [visibility requirements](../../docs/project-visibility-requirements.md).

- Only a rate limit starts a cooldown. A `401`, `403`, or `404` that GitHub does
  not mark as a rate limit, a timeout, or an unreachable GitHub is reported as
  today, with today's recovery, and holds back no other read. An ordinary
  permission refusal is not evidence of a limit.
- A read the cooldown held back establishes neither content nor absence, and is
  never reported as GitHub's answer. The shown snapshot keeps its own revision
  and retrieval time, and a withheld detail is never filled from an older one.
- Local authentication and request admission are unchanged. A request the
  boundary refuses on its own terms is refused as today and takes no turn.
- The 30-second bound stays: no request waits longer for its turn and its
  answer together. A requester that disconnects, hides its page, or switches
  projects gives up its turn without reaching GitHub, and closing the dashboard
  server ends every waiting and outstanding read.
- Visibility and publication observation are unchanged outside a cooldown: the
  15-second check pace per visible page, silence while hidden, and one check at
  once when a page is seen again.
- The cooldown and the turns live in the process's memory. A restarted process
  asks GitHub again and learns a standing limit from its first refusal.
- The reading contract and the
  [request accounting](../../dashboard/GITHUB-REQUESTS.md) describe the result.

**Scope — deferred promises:** [Sharing repeated reads](#share-repeated-observer-reads)
owns one request for identical simultaneous reads; here a read counts once
however many requests wait for it. Delivered [reuse after publication](../../dashboard/GITHUB-REQUESTS.md)
owns unchanged content at a new revision. This delivery learns a limit only
from refusals of the dashboard's own reads: it does not read the remaining
allowance, slow down ahead of a limit, show the allowance, or coordinate with
separately launched dashboard processes, a restart, or the developer's other
`gh` use. It does not retry a refused read inside the request that asked, give
any kind of read priority over another, or adopt a request-count or latency
budget. Gaps left by other failures keep today's recovery by reload. Avatar
images, which use no `gh` allowance, carry no new commitment.

**Key examples:**

| Pre-condition and trigger | Result |
| --- | --- |
| A page is loading a project's detail. GitHub refuses one seed's content read with `Retry-After: 120`. | That seed is labeled as withheld by the limit and the details still waiting are not asked. The page keeps its snapshot and revision and says reading resumes in two minutes. |
| GitHub limits one profile's history or addition-commit read. Its card says "Human developer unknown", and trunk stays at the shown revision through the directed wait. | The detail and roster explain the limit and resume time. After the wait the credited human appears without a reload or new publication, and the same recovered addition supplies its slice clock. Successful cached reads are not repeated; the history and each walked commit are asked once however many views need them. |
| During that wait the developer reloads the page, opens a second tab, or selects another project. | GitHub is asked nothing. The page says GitHub limited requests and when reading resumes; with no snapshot it says none has been read. At that time it reads on its own. |
| A second tab shows a complete snapshot and has met no refusal itself. Its next check falls inside the wait. | The check is answered as limited without reaching GitHub. The snapshot stays, and the tab says checks resume at the same time. Hidden and seen again before then, it asks nothing. |
| The wait ends with three visible tabs waiting. | One read reaches GitHub alone. Once it is answered the others proceed, at most eight under way. Each tab fills what the limit withheld; content already read is not asked again, and each problem clears as today. |
| The first read after the wait is refused with a new directed wait. | Nothing else was asked. Every tab shows the new resume time. |
| GitHub refuses a read as a secondary rate limit and directs no wait. | Reading resumes 60 seconds later with one read. Refused the same way again, the wait is 120 seconds, then 240. After a successful read, the next such refusal waits 60 seconds. |
| GitHub answers a read `403` with allowance remaining and no rate-limit marking, or `404`. | The read problem or gap is reported as today, with its access advice. No cooldown starts and other reads still reach GitHub. |
| Two reads are at GitHub when a third is refused with a directed wait. One is then answered, the other refused with a later time. | The answered read is shown as read. The resume time is the later one. |
| Two tabs open different projects cold while GitHub answers slowly. | At most eight reads are under way; the rest take their turn as each is answered. A request still waiting 30 seconds after it asked shows its gap or read problem as today. |
| One of those tabs is closed, or switches projects, while its reads wait their turn. | Those reads never reach GitHub. The other tab's reads take the freed turns. |
| The dashboard server is closed during a cooldown and started again. | Every waiting read ends with the server. The new process asks GitHub; if the limit still stands, its first refusal starts the cooldown again. |

**Architecture:** The story moves two rules from the page to the dashboard
process. The directed wait is held today by one page's check schedule, and the
bound on concurrent reads by each read group separately. Both become one
admission rule where the local read boundary invokes `gh`, the only place every
tab, project, and kind of read passes. GitHub's direction is likewise learned
once for every read, generalizing what the revision check and commit comparison
learn today. The page keeps only the resume time it is told and one way to show
it and recover. The [Architectural North Star](../NORTH-STAR.md#one-owner-admits-reads-to-github)
records this design until the code explains it. Accepted
[ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md) keeps this feature-local
design with the feature, so no ADR is proposed.
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
high cohesion asks for one owner of GitHub demand and one representation of a
limit and its recovery. No Accepted decision conflicts.

**Evaluation:** Simulate GitHub's answers through the existing local read
boundary and observe what reaches GitHub and when. After a directed refusal of
a content, history, branch, or revision read, no read from any tab or project
reaches GitHub before the wait ends; one read goes first afterwards, and the
pages recover what was withheld on their own. A limit without a usable wait
backs off as described, and an ordinary permission failure starts no cooldown.
With GitHub's answers held, the reads under way never exceed the bound across
two observers. The departure, bound, and shutdown examples qualify that result.
Request counts and timings are observed for these examples, not adopted as
budgets.

Include the unchanged-revision human-credit journey: limit a profile's history
or addition commit, then answer it with a usable committer after the directed
wait. Assert the credit on the card, detail, and roster, its shared Take clock,
the limit explanation before recovery, and the exact requests since refusal.
No-addition, unnamed-committer, and ordinary non-limit failures retain their
own explanations; an avatar failure does not make a known human unknown.

**Value / learning:** Prevent avoidable refusals and repeated waiting while
making service-imposed delays understandable.

**Effort hypothesis:** Band pending project definitions; the main uncertainty is
learning GitHub's direction from every kind of read through `gh`, and giving
the page one recovery for reads it reports today in three ways: a read problem,
a check problem, and a gap.

**Depends on:** No blocking story prerequisite. Shared code is not a dependency
on the observer-sharing story.

**Open decisions:** None about the goal, scope, or examples. This story selects
the cooldown and concurrency policies the seed left for refinement: a held-back
read is answered at once rather than kept waiting, a limit without a usable
wait backs off from 60 seconds, one read goes first after a cooldown, eight
reads at most are under way, and a page recovers on its own what a limit
withheld.

**Safe stopping point:** Rate-limit recovery and bounded request demand remain
useful even if unchanged records are still fetched after new publications.

<a id="reuse-evidence-merge-correction"></a>

### Reuse evidence names every path a merge between changed

**Identity:** SEED-113#reuse-evidence-merge-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/269-reuse-evidence-merge-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f50e0e8c4c64f056854b0b41942a444a6d6dd7a5fc86f61a39af12de647affb3","plan":"7c3689cd10246f2e4e83348570d40266335f8878c5af175532d829eae4cdd411"}}
```

**Goal:** A developer watching a project whose trunk receives merges sees, at
a newly found commit, the records that changed since the revision last read,
never text held from that earlier revision. This corrects the delivery of
refreshing published work without rereading unchanged files (story and
plan 266 at `962c717c`, commits 945857c9, 81b24c14, d6192d89); it adds no feature promise.

**Scope:** The touched paths between two revisions also include the files
GitHub's comparison of them names, from the comparison already asked, so a
merge whose own change list omits a path it changed cannot leave that path
reused; a comparison that may not list them all establishes nothing. The
story's untested examples of a failing commit read and a rename gain proof,
and the reuse tests' load-fragile or misleading support is corrected. The
intermittent `shared-observer-reads.spec.ts` failure seen under load during
that execution is fixed so it gives the same result locally and in CI. Every
promise of that story is preserved.

**Plan:** [269-reuse-evidence-merge-correction](../slice-plans/269-reuse-evidence-merge-correction/PLAN.md)

## Ordering and Scope Reduction

The selected order favors immediate responsiveness, then contained request
savings, consistent recovery, and the broader content-reuse change. This is
priority, not a chain of required dependencies. If scope is reduced, defer the
fourth story first, then the third; retain already delivered value and reassess
remaining priorities from the developer's observations.

## Open Decisions Before Refinement or Planning

- Select cooldown and concurrency policies from the actual read contract.
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
