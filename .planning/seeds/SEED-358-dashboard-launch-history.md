---
id: SEED-358
status: active
planted: 2026-11-14
planted_during: Terry asked to evaluate permanent launch history as a separate story
trigger_when: selected from the product backlog
scope: story
---

# SEED-358 — Dashboard launch history follow-ons

Machine-local launch history lives under
`~/.open-dough/dashboard/launch-history/` as
[AGENT-LAUNCH-HISTORY](../../dashboard/AGENT-LAUNCH-HISTORY.md) describes.

<a id="close-launches-returned-to-the-backlog"></a>

### Close launches returned to the backlog

**Identity:** SEED-358#close-launches-returned-to-the-backlog
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer sees work that stopped early as a finished launch
instead of an open session.

A confirmed early wrap-up that returns the story to the backlog ends that
launch with a returned-to-backlog outcome. Count the finished launch once in
Recently done while the story remains queued. A later start for the story has
its own record. An unfinished update from an ongoing task or a queue move by
itself establishes no end to a launch.

Today only `place --return` moves Taken work back to the queue, and a tracked
execution's quiet report closes only once the published backlog no longer lists
the story ([closure gate](../../dashboard/server/completionClosure.ts)). The
signal that confirms an early return is undecided: a completed report plus the
published backlog listing the story in the queue, or a new explicit reporting
outcome.

#### Key examples

- An execution wraps up early and returns its story to the backlog. Its session
  appears in Recently done as returned to backlog, once. A new launch for the
  story coexists with that finished record. An interim unfinished report from
  the new launch leaves it open.
