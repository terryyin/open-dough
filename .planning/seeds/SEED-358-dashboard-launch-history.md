---
id: SEED-358
status: active
planted: 2026-11-14
planted_during: Terry asked to evaluate permanent launch history as a separate story
trigger_when: selected from the product backlog
scope: story
---

# SEED-358 — Dashboard launch history follow-ons

Two remaining stories, in backlog order: reconstruct earlier Codex and Claude
Code work with its token usage, and close launches whose story returned to the
backlog. Keep-dashboard launch history is delivered; machine-local history lives
under `~/.open-dough/dashboard/launch-history/` as
[AGENT-LAUNCH-HISTORY](../../dashboard/AGENT-LAUNCH-HISTORY.md) describes.

<a id="reconstruct-codex-and-claude-code-usage-history"></a>

### Reconstruct Codex and Claude Code usage history

**Identity:** SEED-358#reconstruct-codex-and-claude-code-usage-history
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why.** A developer can account for the Codex and Claude Code work and
token usage in the dashboard's projects since Open Dough became stable on
2026-09-16, including launches whose dashboard records were pruned.

Define the dashboard-owned usage record in the
[launch history](../../dashboard/AGENT-LAUNCH-HISTORY.md) store. Tie each usage
observation to its launch, native session and turn lineage, identity, source,
scope, and coverage. Store model and effort when known, and keep uncached input,
cache reads, cache writes, and output distinct. Represent missing or partial
measurements explicitly. Later host collectors and usage views use the same
records.

Import usage for launches that history and the operational records hold. Read
Codex response usage from active and archived rollouts, including compressed
files, using thread and turn lineage to include attributable workers. Read
Claude Code usage from session and worker transcripts, counting each API
message ID once.

For sessions since 2026-09-16 without a dashboard record, reconstruct a history
entry from the native session and corroborating project history. Recover the
project, workflow or task, story identity and title at the time, tool, model,
effort, launch settings, timing, outcome, and usage where supported. Use recorded
workflow invocations and historical seed, plan, backlog, or completion records
to resolve story references. Keep source references for reconstructed fields
and leave unresolved values unknown. Record dashboard, native, or unknown origin
based on the evidence; count a session as a dashboard launch only with a native
launch reference or comparable evidence. Store recovered metadata and counters
without copying raw prompts or transcripts.

Cursor is not reconstructed: its local history holds no token usage. Make the
import repeatable, including when later live collection overlaps it. Terry
approved delivering this without a new usage UI. Verify by reading the stored
records and repeating the import, and report the earliest recovered date, counts
by host and coverage, and material gaps. The
[historical recovery research](../../docs/maintainer/dashboard-task-usage-research.md#recovering-earlier-launches)
records the sources and their limits.

#### Key examples

- An old Codex slice-planning session whose launch record was pruned gains a
  history entry with its workflow, recoverable story metadata, and usage from
  its own responses and linked workers. With uncertain origin, it stays out of
  dashboard-launch counts.
- A Claude Code execution kept in launch history gains usage from its session
  and worker transcripts, with each API message counted once.
- Repeating the import leaves the same records and usage counts.

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
