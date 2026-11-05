---
id: SEED-240
status: active
planted: 2026-11-05
planted_during: Terry Yin's review of the deployed SEED-232 traffic improvements and selection of three follow-up stories
trigger_when: Published-update connections fail repeatedly without freshness warning, or collapsed session entries fetch historical attribution
scope: epic
---

# SEED-240 — Recover dashboard updates reliably and read session details on demand

## Why This Matters

Terry reports that everyday loading and responsiveness have improved and that
GitHub service issues occur less often after SEED-232. Live production checks
on 2026-11-05 confirmed published updates over both loopback and Tailscale with
zero recurring browser revision polls during the sampled interval. Expanded
Running Cursor sessions made 11 requests in 12 seconds and stopped on collapse.

A connection-lifecycle defect can still undermine those gains: repeated failed
opens can leave a snapshot displayed without a freshness warning. Separately,
collapsed Session details starts historical assignment reads before the
developer asks for them. Remaining stories address those observed paths.

## Selected Stories

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
