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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and goal.** A developer watching published work can tell when
updates have stopped arriving, including when every connection attempt fails
before its first answer, and can see when freshness recovers.

**Evidence.** At production revision `68f27aa69c40`, a browser with only revision
stream requests deliberately failed retained its snapshot through 52 seconds
and four failed opens, without a freshness warning. Current stream handling
resets its 45-second silence timer on every open. A controlled probe of the
current hook also made 12 opens over 165 seconds without reporting lost
freshness. [Current retry handling](../../dashboard/src/revisionStreamSchedule.ts).

**Outcome and evaluation.** While a page is visible and eligible for updates,
continuous lack of a successful revision observation reaches the existing
45-second freshness bound across connection attempts. The page then explains
the loss of freshness and retains the shown revision and retrieval time.
Retries follow the existing pace and GitHub-directed waits. A successful
observation clears the problem and restores the normal freshness deadline.

**Key examples.**

- A snapshot is shown and each stream fails promptly before answering. After
  the existing silence bound, the snapshot is still usable and the freshness
  warning is visible. Reopening the connection cannot postpone that warning.
- A stream that previously answered loses connectivity. Continued failed
  reconnects retain the warning, and the first successful revision answer
  clears it and catches up with published work.
- Hiding the page, switching projects and waiting out a directed rate limit
  follow their existing observation lifecycles.

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
