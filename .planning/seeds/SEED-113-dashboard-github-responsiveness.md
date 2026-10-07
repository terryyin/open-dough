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

<a id="shared-read-waiter-residue-correction"></a>

### Shared GitHub reads say and signal only what their waiters own

**Identity:** SEED-113#shared-read-waiter-residue-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/263-shared-read-waiter-residue-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"f75cdd5cedfaaae10a4e455973c448f5e60ab52b6fca35a8e87b360e071c7152","plan":"a3c72342eae2a0b582620b4133164bd75bfdc64845b512db368034c01a0f3ed9"}}
```

**Goal:** A maintainer of the dashboard's local read boundary finds one account
of who owns a `gh` call: each request owns only its wait. This corrects the
shared observer reads delivery (SEED-113#share-repeated-observer-reads,
`572faa6f:.planning/seeds/SEED-113-dashboard-github-responsiveness.md`); it adds
no feature promise.

**Scope:** Comments that still say a request owns its `gh` subprocess are
reworded, and `execGh` stops imitating an aborted subprocess for a request that
stopped waiting, with the guards that existed only for it. Every promise of the
shared observer reads story is preserved.

**Plan:** [263-shared-read-waiter-residue-correction](../slice-plans/263-shared-read-waiter-residue-correction/PLAN.md)

<a id="rate-limit-recovery-residue-correction"></a>

### Rate-limit recovery waits, resumes, and labels as promised

**Identity:** SEED-113#rate-limit-recovery-residue-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/271-rate-limit-recovery-residue-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"8f9b12c20f0c6e88649bcfa994c4bd77cee0a1b77b665a4903f2317f222bb4b9","plan":"dcc5e977b2b29a445c3a798c260c8e001c9148f2c15cc6487f8bf27d7551839b"}}
```

**Goal:** A developer whose dashboard meets GitHub's rate limit gets the
recovery the rate-limit recovery story
(recoverable at `11c71766:.planning/seeds/SEED-113-dashboard-github-responsiveness.md#recover-consistently-from-rate-limits`) promised: a limit naming a time already passed waits instead of making pages
re-read in a burst, reading reopens after a wait whose first read ends without
a limit, and a detail the limit withheld is labeled one way. This corrects
that story's delivery (plan 264, through commit adc41a56); it adds no feature
promise.

**Scope:** A directed wait of zero or a time already passed is treated as no
usable wait; the first read after a wait that ends without a limit reopens the
turns; withheld-detail labels come from one page builder naming what was read
and when the limit ends, with one "not asked" sentence; a stale comment and a
duplicated test helper go. Every promise and key example of the rate-limit
recovery story is preserved.

**Plan:** [271-rate-limit-recovery-residue-correction](../slice-plans/271-rate-limit-recovery-residue-correction/PLAN.md)

<a id="reuse-unchanged-records-after-publication"></a>

### Refresh published work without rereading unchanged files

**Identity:** SEED-113#reuse-unchanged-records-after-publication
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/266-reuse-unchanged-records-after-publication/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bec838944958a80b9c819cb5d7c0f9d8072ae2626a490a9152cf6b91ef9d6670","plan":"c0e7493d2a23f3c29f5ae5a4bf6d1592601003df798f292d4cc8ed544edfe4e3"}}
```

**Beneficiary:** A developer watching a project whose trunk receives frequent
publications, most of which change nothing among its planning records, and
whose GitHub allowance each refresh of that project spends.

**Goal:** When the configured ref names a new commit, the dashboard shows that
commit by reading only what GitHub's own account of the commits since the
revision this dashboard process last read shows to have changed. Unchanged
backlog, seed, plan, profile, setting, and done-record text is reused as the
new revision's own; changed records are read at the new revision; and a
profile's allocation history or a plan's last commit time is reused only when
no commit between the two revisions touched it. The observation keeps every
revision, provenance, and gap qualification of a full read.

**Current baseline:** At a newly found commit the boundary remembers text only
by commit, so the backlog and every seed and plan the backlog names are read
again, as are every profile's history listing and, for each Taken entry, its
plan's and its profile's last commit time. Profiles and done records are
already reused by the Git blob their directory listing names, and what each
walked commit changed about a profile is remembered by commit. The
[replay above](#why-this-matters) measured 26 requests for a trunk revision
whose planning records were unchanged, against 3 for a warm reload.

**Human attribution intent (2026-10-07):** Terry reports frequent "Human
developer unknown" and asks whether fetching developers and their humans
makes unnecessary requests. At local revision `69f22b57`, all seven readable
profiles have a current addition committed by Terry Yin. Code and local
history imply about 14 cold attribution API calls (one history listing and
one addition commit per profile), another seven history listings after an
unrelated trunk publication, and none for successful cached attribution at
the same revision. These are estimates excluding profile-content, backlog,
plan, branch, and historical-session reads, not a live traffic capture or an
acceptance budget. Lookup is per assignment, not per distinct human, because
one person's separate assignments can have different addition commits. This
story must retain established credit without new history requests when
published evidence proves the assignment unchanged; [rate-limit recovery](../../dashboard/PUBLISHED-OBSERVATION.md)
owns recovery of credit the limit withheld.

**Scope — required behavior:**

- **Unchanged records are reused on commit evidence.** A read at the new
  revision of a path that no commit between it and the revision last read
  changed is answered from what this process holds at that earlier revision,
  without a `gh` call, and is kept as the new revision's own for the later
  detail reads and reachability checks that consult it. This covers the
  backlog, the seeds and plans it names, the listings of the agent profile and
  done record directories, the profiles and the project setting file, and the
  done records. A listed profile or done record keeps today's reuse by the
  blob id its listing names, whatever the evidence.
- **Changed records are read at the new revision.** A path a commit between
  the two revisions changed, or that the evidence does not cover, is read at
  the new revision as today, and its facts appear at the observed revision.
- **History facts need commit evidence.** Which commit added a profile's
  current allocation, who committed it and when, and when a plan was last
  committed are reused from a revision already read only with published
  evidence that the new revision descends from that revision and that no
  commit between them changed that path. Without it they are read as today.
  Identical text is never that evidence.
  In particular, an unrelated publication keeps an established human's name
  and allocation on cards, details, and the roster without asking again for
  that profile's history or addition commits. Equal human names or profile
  blobs alone never justify sharing different assignments' attribution.
- **Evidence cost does not grow with the number of records.** Learning what
  changed at a new revision costs one comparison of the two revisions and one
  read of each commit between them, each commit's answer remembered so that
  no commit is asked about twice, not a request per record. Beyond a small
  bound on the commits between, or when a commit changed more files than
  GitHub lists in one answer, nothing is reused on that evidence. Planning
  sets the bound.
- **Observation is otherwise unchanged.** The page reads the new commit,
  replaces the whole view with it, and keeps today's revision, retrieval time,
  group arrival, and gap reporting. A reload, a second tab, or a return to a
  revision already read costs what it costs today.

**Scope — evidence and failure constraints:** Follow the
[existing published reading contract](../../dashboard/PUBLISHED-OBSERVATION.md)
and the [request accounting](../../dashboard/GITHUB-REQUESTS.md).

- Only GitHub's own account establishes reuse: its comparison of two revisions
  the configured ref named, each listed commit's own change list, and the blob
  ids a listing reports. The ref's name, elapsed time, bytes a reread would
  compare, a comparison that is not ahead, one beyond the bound, or a change
  list GitHub did not give whole establish nothing.
- Absence stays absence. A record the backlog names that the new revision
  lacks is reported as missing, a profile or done record its listing no longer
  names is gone, and a directory the revision lacks lists nothing; text held
  from an earlier revision never fills any of them.
- A profile removed and re-added with identical text reuses that text and
  nothing of its earlier allocation: the addition walk runs for the new
  revision, so the credited human and allocation time are the new addition's.
- When evidence cannot be established, the affected records and history facts
  are read as today, and nothing held is served for them. A comparison that is
  not ahead, beyond the bound, or with a change list GitHub did not give whole
  is remembered as no evidence between those two revisions, since commits do
  not change. A comparison or commit read that fails is not remembered and
  does not fail the read that needed it; that read proceeds as today.
- Memory stays bounded as today's memo is: an evicted text or fact costs a
  read, never wrong content. Nothing is stored outside the process's memory.
- A limited evidence read recovers as
  [rate-limit recovery](../../dashboard/PUBLISHED-OBSERVATION.md) delivers; this
  story adds no second recovery.

**Scope — deferred promises:** Reads at a story branch head keep today's cost:
a head that moved costs one plan read and one last-commit time there. This
delivery does not share held text across separately launched dashboard
processes or across a restart, adopt a request-count or latency budget, change
the commit comparison launch settlement makes, or change avatar reads.
Cooldowns and bounded demand belong to the rate-limit story.

**Key examples:**

| Pre-condition and trigger | Result |
| --- | --- |
| A page shows revision A, read in full. A commit that changes only product code is published as B. | The check finds B and the page shows B with the same facts. GitHub is asked to compare A with B and what that one commit changed; no backlog, seed, plan, profile, setting, or done-record text or listing is read, and no profile history or last-commit time is asked, because no commit between A and B touched them. |
| At A seven readable assignments credit the same human. One unrelated commit publishes B, with no profile changed. | All seven retain their own credited human and allocation, including on the roster. The new revision adds zero profile-history or addition-commit requests beyond the shared change evidence, regardless of how many views show the credit. |
| After A, one profile is modified and the other six are untouched. All seven still name the same human. | Only the touched profile's allocation history is read at B; the other six retain their own credit on commit evidence. The touched profile's addition is established by its walk, never by another profile's matching human name. |
| At B one seed's story section changed. | That seed alone is read at B and its new facts appear at the observed revision B. Every other record is reused. |
| At B the backlog queues a new story whose seed is new. | The backlog and the new seed are read at B; the other seeds and plans are reused. |
| At B a done record is added and a plan gains a done slice. | The done directory's listing is read and the new record read; the changed plan is read with its last commit time; nothing else is. |
| Between A and B an agent profile was removed by one commit and re-added by another with identical text. | The profile's text is reused. Its allocation history is walked at B, so the credited human and allocation time are the re-adding commit's, never the earlier allocation's. |
| At B a profile that A listed is gone. | The profile directory's listing is read at B, the profile is not shown, and its text at A is not served for B. |
| At B the backlog still names a seed that B lacks. | That seed is reported as missing at B, as today. The text read at A does not stand in for it. |
| A publication moved the configured ref to a commit that does not descend from A. | The comparison says so and nothing is reused on it: the backlog, seeds, plans, listings, histories, and last-commit times are read at B as today, and a listed profile or done record whose blob id names held text is reused as today. |
| More commits lie between A and B than the bound, or one of them changed more files than GitHub lists whole. | Nothing is reused on that evidence and B is read as today; the pair is not asked about again. |
| The comparison, or a commit's change list, fails to be read, for any reason but a rate limit. | The read that needed it proceeds as today and the failure is not remembered. The page shows B as a full read shows it. |
| The configured ref moves from A to B and on to C before a check finds it. | The comparison is of A with C, and the commits between are read; what none of them changed is reused from A. |
| The dashboard server is restarted, then a page opens the project at B. | Nothing is held, so B is read in full as a cold load is today. |
| A second tab opens the project after the first tab already observed B. | It costs what a reload costs today: the ref and branch heads, plus any record that was missing or failed at B. |

**Architecture:** The boundary's memo gains one fact per new revision: what
the commits between the revision last read and the new one changed, learned
from GitHub's comparison and each commit's own change list, which the addition
walk already reads and which becomes remembered whole, by commit, rather than
for one path. Every read at the new revision consults that fact before asking
GitHub, so text, listings, history facts, and last-commit times are recalled
through one rule, beside the blob reuse listed records already have. Accepted
[ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md) keeps this feature-local
design with the feature, so no ADR is proposed, and
[ADR 0002](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)'s
high cohesion asks for one memo and one representation of change evidence
rather than a cache per kind of read. No Accepted decision conflicts.

**Evaluation:** Through the existing simulated GitHub, read a project at A,
then publish B as a commit that changes only files outside the planning
records: the check finds B, the page shows B unchanged, and the `gh` calls
GitHub received are the check, the comparison, and that commit's change list
alone. Then change one seed at
C: the calls add only that seed's read and its facts appear at C. Remove and
re-add a profile between revisions: its history is walked again and the new
addition is credited. Publish a non-descendant revision and fail the evidence
read: every record and history is read as today and the shown snapshot is
untouched. Request counts are observed for these examples, not adopted as
budgets.

For human credit, use several profiles and count history and commit requests
separately from comparison evidence and avatar image reads. Observe unchanged
credit on cards, details, and the roster after an unrelated commit, then touch
one profile and show that only its history is read. An avatar failure keeps
the known name. A real missing addition, unusable committer, or failed history
read keeps its own explanation instead of guessing a human from another
assignment or an older allocation.

**Value / learning:** Make refresh cost follow changed published content
rather than the whole set of dashboard records.

**Effort hypothesis:** Band pending project definitions; the main uncertainty
is folding the reads of records, listings, histories, and last-commit times at
a new revision into one consultation of the commit evidence without changing
what each read answers or refuses today.

**Depends on:** No blocking story prerequisite; this outcome can be delivered
against the existing published read boundary.

**Open decisions:** None about the goal, scope, or examples. This story selects
how published evidence establishes unchanged content, which the seed left for
refinement: GitHub's account of the commits between two revisions of the
configured ref, remembered by commit, for text, listings, and history facts
alike, beside the blob reuse listed records already have.

**Safe stopping point:** New publications need fewer content reads while all
published-evidence qualifications remain valid.

## Ordering and Scope Reduction

The selected order favors immediate responsiveness, then contained request
savings, consistent recovery, and the broader content-reuse change. This is
priority, not a chain of required dependencies. If scope is reduced, defer the
fourth story first, then the third; retain already delivered value and reassess
remaining priorities from the developer's observations.

## Open Decisions Before Refinement or Planning

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
