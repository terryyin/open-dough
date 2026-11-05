---
id: SEED-240
status: active
planted: 2026-11-05
planted_during: Terry Yin's review of the deployed SEED-232 traffic improvements and selection of three follow-up stories
trigger_when: Published-update connections fail or depart during setup, or collapsed session entries fetch historical attribution
scope: epic
---

# SEED-240 — Recover dashboard updates reliably and read session details on demand

## Why This Matters

Terry reports that everyday loading and responsiveness have improved and that
GitHub service issues occur less often after SEED-232. Live production checks
on 2026-11-05 confirmed published updates over both loopback and Tailscale with
zero recurring browser revision polls during the sampled interval. Expanded
Running Cursor sessions made 11 requests in 12 seconds and stopped on collapse.

Two connection-lifecycle defects can undermine those gains. Repeated failed
opens can leave a snapshot displayed without a freshness warning, and a page
leaving during stream setup can leave GitHub checks running. Separately,
collapsed Session details starts historical assignment reads before the
developer asks for them. These stories address those three observed paths.

## Selected Stories

<a id="show-freshness-loss-across-stream-retries"></a>

### Show lost freshness across repeated revision-stream failures

**Identity:** SEED-240#show-freshness-loss-across-stream-retries
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/477-show-freshness-loss-across-stream-retries/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c39f878b8f74c8ac4ca74848e6ebaf42380fa51251b77bef867f58eb830c5e8c","plan":"184071b9ccaa8fc1ecf944ddbabaa14742ee3cd72d821f506cbd416aa05ab859"}}
```

**Goal.** A developer watching a streaming Board can tell when published
updates have stopped arriving, including when every connection attempt fails
before its first answer, and can see freshness recover. This keeps the shown
snapshot honest while revision streams carry the dashboard's live updates.

**Evidence.** At production revision `68f27aa69c40`, a browser with only revision
stream requests deliberately failed retained its snapshot through 52 seconds
and four failed opens, without a freshness warning. A controlled probe of the
current hook also made 12 opens over 165 seconds without reporting lost
freshness. The cause is in
[current retry handling](../../dashboard/src/revisionStreamSchedule.ts): each
open restarts both the silence timer and the time an unanswered error is
measured from, and closing a failed attempt clears the timer, so attempts
that fail within the 15-second pace never reach the 45-second bound. A
stream that answered and then fell silent or failed is already reported, as
[the lost-stream journey](../../dashboard/tests/revision-stream-lost.spec.ts)
proves.

**Scope.**

- *Required behavior.* While a page delivers by stream, the 45-second
  silence bound (one pace plus the read wait bound) counts from the last
  successful revision answer, or from when this observation began if none
  arrived yet. Connection attempts, failed or hung, neither restart nor
  postpone it. When it passes, the page shows the existing lost-freshness
  problem, keeping the shown revision, its retrieval time, and the
  automatic-check sentence.
- *Kept behavior.* Reopens keep the existing pace, rate-limited answers keep
  the directed wait and notice, and the first successful answer still clears
  the problem and catches up. A failure after an answer still reports at once.
- *Boundary.* An observation restart (the page seen again, a new shown
  revision after a read settles, a project switch, or the end of a rate-limit
  wait) starts a new bound. Hidden time does not count, consistent with the
  existing visibility lifecycle. The shown retrieval time remains the
  developer's evidence of age across such restarts.
- *Deferred.* Reporting the first failed open at once, as a failed revision
  check does, and falling back to revision checks after failed opens were
  considered. Both change the agreed 45-second bound or traffic, and neither
  is needed for the goal.
- No new wording or control. The problem names the stream as "closed or fell
  silent", which also describes an open that failed.

**Key examples.**

- A snapshot is shown and every stream open after it fails promptly before
  answering. At 45 seconds of page time from the observation start, the
  lost-freshness problem is visible with the snapshot's revision and
  retrieval time. Before 45 seconds it is not shown. Opens keep coming no
  more often than the 15-second pace, before and after the warning.
- A stream answers "unchanged", then every reopen fails promptly. The
  problem appears 45 seconds after that answer and stays across further
  failed reopens. The first successful answer clears it. When it names a new
  commit, the page reads and shows that commit.
- A rate-limited stream answer keeps today's notice and directed wait. The
  stream opens again when the wait ends, and a new bound starts then.

**Selected approach.** Watchdog instead of per-attempt timer. The idea comes
from a dead man's switch, which trips unless someone acts in time. Here only
a successful revision answer counts as acting; reconnecting does not. One
deadline per observation is armed at its start, re-armed by each successful
answer, and survives an attempt's close. A watchdog normally does not care
why it is reset, so this one is reset by the dashboard's existing restart
rules rather than by elapsed visible time. The change stays inside the
browser's stream schedule. It adds no server responsibility and touches no
Accepted decision.

**Prerequisite and safe stopping point.** No blocking story prerequisite.
The developer gets truthful freshness and recovery even while the setup
disconnect and session-details stories await delivery.

<a id="stop-revision-checks-after-setup-disconnect"></a>

### Stop revision checks when a page leaves during stream setup

**Identity:** SEED-240#stop-revision-checks-after-setup-disconnect
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/477-stop-revision-checks-after-setup-disconnect/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"50186b9bc96ece138201198bef56de53c48b3b4c98cae6a2ea4c0c4c90f024f0","plan":"a39243aa214fff766b63379a15011d4ba9c41613e4870b07fb46bea2087963a8"}}
```

**Beneficiary and goal.** A developer can hide or close a dashboard page while
its update connection is opening, and the abandoned connection asks GitHub
nothing further. The dashboard keeps the published observation contract's
promise that the last open stream for a project and scope ending also ends that
scope's paced observation, so request budget is spent only for pages that are
still watching.

**Evidence.** A controlled reproduction using the current server classes
paused request-owner scope resolution, closed the request and response, then
allowed setup to finish. One pace timer and two tracked controllers remained,
and a second upstream listing followed after the next 15-second pace. Code
reading on 2026-11-05 confirms why it never ends: the open's departure
listeners are attached only after scope resolution, so a close that fired
during resolution is never heard, and events written to the destroyed response
are silently skipped, so nothing removes that subscriber before the server
stops. A boundary closed during resolution has already emptied its streams and
tracked lifetimes, so the resumed open builds a fresh observation outside them.
[Asynchronous setup](../../dashboard/server/revisionStreamObservation.ts) ·
[Subscriber lifecycle](../../dashboard/server/sourceRevisionStream.ts) ·
[Boundary close](../../dashboard/server/authenticatedRead.ts).

Resolution is genuinely asynchronous when this process first establishes its
request-owner endpoint, after the stored `gh` login changes, and while the
endpoint cannot be established; it runs `gh auth token` locally, bounded at 10
seconds. Otherwise the cached answer settles before any close can be
delivered. Production frequency is unmeasured, but each occurrence keeps one
listing per pace running until the dashboard restarts, and keeps a shared
observation alive after its last real page leaves.

**Scope.**

- Required: an open whose page departs before setup finishes asks GitHub
  nothing for that open, starts no pace, and leaves no tracked lifetime.
- Required: a live page sharing the same source and scope keeps its shared
  observations, and the observation ends when that last live page leaves.
- Required: an open still in setup when the dashboard boundary closes acquires
  no observation, timer, or tracked lifetime and ends its response.
- Scope limit: the local scope lookup itself is not cancelled; it is shared and
  cached for the process and asks GitHub nothing.
- Scope limit: browser reconnect and freshness behavior belong to
  [Show lost freshness across repeated revision-stream failures](#show-freshness-loss-across-stream-retries);
  measuring production frequency is not undertaken.
- No user-visible change: a departed page shows nothing, and a live page's
  stream answers as today.

**Key examples.**

- Hold scope resolution for a source with no other subscriber, close the
  page's connection, then finish resolution. That open causes no listing, then
  or in later pace intervals.
- A second page is streaming the same source and scope. A third page's open
  departs during held resolution. The second page keeps one shared listing per
  pace; once it closes, no further listing is asked.
- Close the dashboard boundary while an open's scope resolution is held, then
  finish resolution. No listing, timer, or tracked lifetime follows.
- Boundary: a page that stays connected through a slow resolution receives
  its first answer at open and its paced answers as today.

**Architecture.** The departure must be observable from the moment the
boundary admits a stream, not from when its observation is joined: a close
event that fires before the listener exists is lost. Treating a pending open
as a member of the boundary's tracked lifetime, ended by its page's departure
or by the boundary's close, and joining an observation only while that lifetime
is still live, covers both departure and shutdown through the same mechanism
that already ends timers and listing waits. Rechecking only the response's
state after setup would cover a departed page but not a closed boundary,
which needs its own closed state. Consistent with
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md):
in-process observation, no database.

**Prerequisite and safe stopping point.** No blocking story prerequisite.
Abandoned opens stop consuming resources independently of browser warning
behavior and historical detail loading.

<a id="read-session-assignments-on-demand"></a>

### Read session assignment history when Session details opens

**Identity:** SEED-240#read-session-assignments-on-demand
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/478-read-session-assignments-on-demand/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"dd5a1298d8e503433dfb9d54f06750b170bc323468d216c879bd2d588d5746cd","plan":"4acb41933592bc563f99b23f93bfe27015c04a9ad4df06d7ef1f789299cd42c7"}}
```

**Beneficiary and goal.** A developer opening the Board, the Sessions
sidebar, or Recently done reads the overview without each collapsed Session
entry asking for historical assignment credit it does not show, and still gets
that session's original allocation credit when they open its Session details.
This keeps request cost tied to what the developer asks to see.

**Evidence.** Session entries mount Session details hidden rather than
unmounted, in story cards, the Sessions sidebar, and Recently done. The
assignment line's effect runs on mount and reads, at the session's saved
publication revision, the agent profile listing (`agents=profiles`) and, for
the matching profile, the commit that added its allocation (`committed=added`).
The server remembers pinned answers for its lifetime
([pinned memo](../../dashboard/server/pinnedTexts.ts)), so repeats cost the
browser requests and no further GitHub reads; a revision not yet remembered
costs one profile listing, profile reads, and a history walk. Nothing visible
while collapsed uses the answer: the summary's host and model repetition
compares the story card's current assignment, not this read.
[Collapsed details](../../dashboard/src/SessionEntry.tsx) ·
[Assignment read](../../dashboard/src/SessionAssignment.tsx) ·
[Profile reads](../../dashboard/src/authenticatedProfileRead.ts).

**Scope.**

- *Required behavior.* A Session entry asks for its historical assignment
  credit only while its Session details are open. Opening them reads that
  session's original allocation at its saved project, revision, agent, and
  work identity, as today, and shows it with the existing wording, including
  "Reading human developer…" while it is read.
- *Required behavior.* Closing Session details while the read is under way
  abandons that page's read; nothing it would have answered is shown later.
  Reopening asks again through the existing readers, so a remembered answer
  costs no further GitHub read and a failed one is asked again.
- *Kept behavior.* The Board's own profile read at its revision, which story
  cards use, is unchanged. Local launch facts in Session details render
  whether or not credit is readable. An unreadable or unrecorded history keeps
  today's "Human developer unknown" line. A line whose known original
  allocation the story card already shows is still omitted once that is known;
  until then it shows as reading.
- *Kept behavior.* A retained Recently done session still asks the page's
  history read when its details are opened; its credit is read once that full
  entry supplies the saved revision.
- *Documentation.* [GitHub request accounting](../../dashboard/GITHUB-REQUESTS.md)
  states that opening a Session details costs, at that session's saved
  revision, what a first read of that revision's profiles costs, unless the
  dashboard process already remembers it.
- *Deferred.* Distinguishing an unreadable history from an unrecorded one in
  the details' wording, keeping an answer in the page across close and reopen,
  and recording credit in the local launch record were considered. None is
  needed for the request saving, and the last would make machine-local
  evidence the home of a published assignment fact, which
  [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  assigns to the repository.
- No new control or wording.

**Key examples.**

- A Board shows a story card with three collapsed Session entries saved at
  three different publication revisions. After the overview settles, the page
  has asked for no profile listing or profile addition at any of those three
  revisions; the Board's own profile read at its revision still happened.
- The developer opens one entry's Session details. "Reading human
  developer…" shows, then that session's original allocator, even though a
  later assignment in the current project reuses the same agent name. The
  other two entries still have asked nothing.
- An entry whose original allocation matches the story card's current
  assignment is opened. Its assignment line shows as reading, then is omitted;
  the rest of its details stay.
- The developer opens an entry and closes it before the read answers. Nothing
  is shown later from that read. Reopening reads again; when the first read
  had reached GitHub, the second asks GitHub nothing more.
- The history cannot be read. The opened details show their launch facts and
  "Human developer unknown". Closing and reopening asks again.

**Selected approach.** Read on disclosure. The idea comes from lazily loaded
images, which a page fetches only when they come into view: here the hidden
credit is the image, opening Session details is coming into view, and the
local launch facts are the placeholder that is always there. The analogy
breaks in two places: nothing is fetched ahead of opening, and the shown
line can disappear after its answer when it duplicates the story card, where
an image placeholder never does. Reuse comes from the server's pinned memo,
not from a page cache. Alternatives considered: prefetching on hover or focus
adds reads the developer did not ask for; keeping the answer in the page
avoids a local request on reopen but adds page state and a failure-retry rule
for a request the server answers from memory; reusing the Board's profile
read when the revisions match saves nothing the memo does not. The change
stays in the browser's Session entry and touches no server responsibility.

**Prerequisite and safe stopping point.** No blocking story prerequisite.
Overview request savings and on-demand attribution are useful independently
of the two revision-stream corrections.

## Ordering and Preparation

Terry selected these three stories for the top of the backlog on 2026-11-05.
Freshness disclosure comes first, followed by stopping abandoned observation
work, then the overview traffic improvement. Each story has a separate
observable outcome. Refinement will establish the execution approach and
decisive examples. Comparative sizing remains unbanded because Open Dough has
no calibrated S/M/L definitions.

## Related Work

- [Completed published-update stream](../done/SEED-232_see-published-changes-over-sse.json).
- [Completed shared GitHub refreshes](../done/SEED-232_share-published-git-refreshes.json).
- [Published observation contract](../../dashboard/PUBLISHED-OBSERVATION.md).
- [GitHub request accounting](../../dashboard/GITHUB-REQUESTS.md).
- [Historical assignment credit](../../dashboard/src/SessionAssignment.tsx) and
  [on-demand retained session history](../../dashboard/src/retainedHistory.ts)
  have distinct reading responsibilities.
