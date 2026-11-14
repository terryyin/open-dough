---
id: SEED-358
status: active
planted: 2026-11-14
planted_during: Terry asked to evaluate permanent launch history as a separate story
trigger_when: selected from the product backlog
scope: story
---

# SEED-358 — Keep dashboard launch history

Three stories, in backlog order: keep launch records instead of deleting them,
reconstruct earlier Codex and Claude Code work with its token usage, and close
launches whose story returned to the backlog. Terry split the second and third
out on 2026-11-14 so the first stays an internal change.

<a id="keep-dashboard-launch-history"></a>

### Keep dashboard launch history

**Identity:** SEED-358#keep-dashboard-launch-history

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/623-keep-dashboard-launch-history/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"3650502c5c1d335c261c452d83eee49cc49ea6d8e1c1991820c23ae4cc03b364","plan":"6c17f397a0be4dff13bac60c64a747f012243f91400cf1a725ed6de9dac09e10"}}
```

**For / why.** A developer can later account for each task the dashboard
launched, after its session ages out of the recent views or is removed.

Stop deleting launch records. A record that leaves the dashboard's operational
records, because it was marked done more than 30 days ago or because the
developer removed its session, moves to a dashboard-owned launch history
instead. History keeps the record as it was recorded, its project, and when and
why it left. A record leaves the operational records only after history holds
it, and moving it again adds no second entry.

Visible behavior stays as it is. Recently done and its count still cover the 30
days after a session was marked done, a removed session still disappears, and
the retirement of host-local state on removal (such as Cursor configuration
scopes and landing pins) still runs. Routine dashboard reads and writes do not
read or rewrite history. History is readable without native session files.
Wording that says done sessions are kept for 30 days says they are listed for
30 days instead.

Scope limits: no history view, no token usage, and no recovery of records
already pruned before delivery; the
[reconstruction story](#reconstruct-codex-and-claude-code-usage-history) owns
the last two. Temporary launch attempts, landing retries, and other dashboard
files keep their own retention.

#### Architecture

Today `~/.open-dough/dashboard/agent-launches.json` holds every project's
records in one document that each dashboard read parses and each write
rewrites atomically ([record document](../../dashboard/server/launchRecordDocument.ts)).
On 2026-11-14 it held 1,333 records from 30 days in 8.4 MB. Keeping records
there permanently would grow every read and write by about 8 MB a month, so
history is a separate, append-only, file-based store beside it under
`~/.open-dough/dashboard/`. The 30-day write-time drop and explicit deletion
([deletion](../../dashboard/server/launchRecordDeletion.ts)) become moves into
that store. [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
rules out an application database and keeps workflow facts in Git. Launch
history is machine-local session evidence, so files fit both rules. Later
usage records and the
[backup story](SEED-361-dashboard-data-backup.md#back-up-and-restore-dashboard-data)
build on this store.

#### Key examples

- A session marked done 31 days ago is out of Recently done and its count, as
  today. After the next record write and a dashboard restart, history holds its
  record once, and the operational records no longer do.
- A session marked done 29 days ago stays in Recently done and its count, and
  history does not hold it yet.
- The developer removes a session. It disappears from the dashboard and its
  host-local state is retired as before, and history holds its record, marked
  as removed.
- A write that moves records fails before history holds them. The records stay
  in the operational records, and a later write moves them once.

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
[launch history](#keep-dashboard-launch-history) store. Tie each usage
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
