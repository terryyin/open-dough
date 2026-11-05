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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and goal.** A developer can hide or close a dashboard page while
its update connection is opening, and its abandoned connection releases its
GitHub observation demand.

**Evidence.** A controlled reproduction using the current server classes
paused request-owner scope resolution, closed the request and response, then
allowed setup to finish. One pace timer and two tracked controllers remained,
and a second upstream listing followed after the next 15-second pace. This
reproduces the code path in isolation. Production frequency is unmeasured.
[Asynchronous setup](../../dashboard/server/revisionStreamObservation.ts) ·
[Subscriber lifecycle](../../dashboard/server/sourceRevisionStream.ts).

**Outcome and evaluation.** A connection that departs before asynchronous
setup finishes creates no continuing revision checks when setup resumes.
Once the last live subscriber leaves, the source's periodic observation ends
and its owned resources are released. Another live page retains its updates.
Server shutdown also prevents an unfinished open from starting new demand.

**Key examples.**

- Hold scope resolution for a source with no other subscriber, close the
  page's connection, then finish resolution. Subsequent observation intervals
  start no GitHub checks for that departed page.
- Repeat with another live subscriber. That subscriber keeps receiving the
  shared observations, and closing it ends future periodic checks.
- Close the dashboard boundary while setup is pending, then allow setup to
  finish. The closed boundary acquires no new observation demand.

**Prerequisite and safe stopping point.** No blocking story prerequisite.
Abandoned opens stop consuming resources independently of browser warning
behavior and historical detail loading.

<a id="read-session-assignments-on-demand"></a>

### Read session assignment history when Session details opens

**Identity:** SEED-240#read-session-assignments-on-demand
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and goal.** A developer opening the Board or its session entries
can read the overview with fewer requests, and obtain historical assignment
attribution when they expand the relevant Session details.

**Evidence.** Session entries mount Session details while collapsed. The
assignment component immediately reads profiles and allocation history at the
session's saved publication revision. This starts historical work before the
developer opens the details. [Collapsed details](../../dashboard/src/SessionEntry.tsx) ·
[Assignment read](../../dashboard/src/SessionAssignment.tsx).

**Outcome and evaluation.** Collapsed entries initiate zero historical
assignment, profile or allocation-history reads solely for their hidden
details. Expanding one entry loads its attribution from its saved project,
revision and work identity, while useful local session facts remain available
if that read fails. Compare browser requests and actual GitHub reads with the
current overview and single-entry expansion on the same session data.
Distinguish normal Board profile reads from historical detail-only reads.

**Key examples.**

- Open a Board containing several collapsed session entries with different
  saved publication revisions. Its ordinary overview appears and the hidden
  historical attributions trigger no reads.
- Expand one entry. Its original assignment is read and displayed for that
  session, even if the current project has reused the developer's agent name.
  Other collapsed entries continue to demand no historical attribution.
- Attribution cannot be read. The expanded details keep their useful local
  facts and explain the attribution gap. Closing and reopening an entry can
  reuse a valid answer through the existing readers and their scope rules.

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
