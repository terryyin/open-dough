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
- Scope limit: browser reconnect and freshness behavior belong to the
  completed Show lost freshness across repeated revision-stream failures
  story (`git show 6fce1ed12:.planning/seeds/SEED-240-reliable-dashboard-updates-and-session-details.md`);
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
