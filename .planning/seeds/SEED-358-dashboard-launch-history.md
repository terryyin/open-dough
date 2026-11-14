---
id: SEED-358
status: active
planted: 2026-11-14
planted_during: Terry asked to evaluate permanent launch history as a separate story
trigger_when: selected from the product backlog
scope: story
---

# SEED-358 — Dashboard launch history follow-ons

One remaining story: reconstruct earlier Codex and Claude Code work with its
token usage. Keep-dashboard launch history is delivered; machine-local history lives
under `~/.open-dough/dashboard/launch-history/` as
[AGENT-LAUNCH-HISTORY](../../dashboard/AGENT-LAUNCH-HISTORY.md) describes.

<a id="reconstruct-codex-and-claude-code-usage-history"></a>

### Reconstruct Codex and Claude Code usage history

**Identity:** SEED-358#reconstruct-codex-and-claude-code-usage-history
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-358#reconstruct-codex-and-claude-code-usage-history","dependencies":[{"supplier":{"identity":"SEED-358#keep-dashboard-launch-history","href":"seeds/SEED-358-dashboard-launch-history.md#keep-dashboard-launch-history"},"implementation":"Imports persist recovered task entries and usage alongside retained launch history and read both retained and operational launch evidence.","rationale":"The supplier owns the permanent launch-history store and lossless transfer out of operational records. Recovery must target that delivered store rather than compete with its active owner or introduce a second history; shared direction alone does not supply durable retained launch evidence.","condition":"Dashboard launch records leaving operational storage are preserved in a separately readable file-based history, once per project and session, including their original record and removal provenance.","state":"satisfied","resolution":{"revision":"3463243925b666be7b7c6065a03cee85f8c09b6e","path":".planning/seeds/SEED-358-dashboard-launch-history.md#keep-dashboard-launch-history","summary":"Delivered on origin/main at f5c1adff32830a9f4e4992913fd7b8a9f72cfc83. Preserved plan .planning/slice-plans/623-keep-dashboard-launch-history/PLAN.md has both Behavior slices done and an execution-complete record; retained backend proof passed 11/11 for aged-out and removed history, duplicate retry and failure retention, and delete behavior. Inspected dashboard/server/launchHistory.ts and launchRecordDocument.ts on accepted main: append precedes operational replacement, reader deduplicates project/session, retains original records and leftAt/reason. Consumer import and schema evolution remain this story's work.\nCondition satisfied: Dashboard launch records leaving operational storage are preserved in a separately readable file-based history, once per project and session, including their original record and removal provenance.\nAccepted integration: f5c1adff32830a9f4e4992913fd7b8a9f72cfc83 on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/624-reconstruct-codex-and-claude-code-usage-history/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"355b12d73ce22b80d7b497128e848e56ae4019bd245bd43bdee3ffd92b287d4f","plan":"69b71fa0b98ae580fe8e7fe4244f61b2691901721bed38e4c422ba83c2cb6f45"}}
```

#### Goal

A developer can account for the Codex and Claude Code work and
token usage in the dashboard's projects since Open Dough became stable on
2026-09-16, including launches whose dashboard records were pruned.

#### Scope

Define the dashboard-owned usage record in the
[launch history](../../dashboard/AGENT-LAUNCH-HISTORY.md) store. Tie each usage
observation to its launch, native session and turn lineage, identity, source,
scope, and coverage. Store model and effort when known, and keep uncached input,
cache reads, cache writes, and output distinct. Represent missing or partial
measurements explicitly. Later host collectors and usage views use the same
records.

The unit is a launch or recovered task, not a story-wide or conversation-wide
total. A conversation can contain successive tasks. Attribute responses and
workers only where native turn lineage or other recorded evidence supports
the task boundary; retain ambiguous observations with an unresolved association
instead of charging them to several tasks. Keep requested settings separate
from observed settings, including changes during the task.

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

Use recorded activity times for the recovery window; an older conversation can
contribute attributable work within it without including its earlier usage.

Historical references use the repository and revision that support the field,
including renamed or deleted stories. A current title, a similar folder name,
or the presence of an Open Dough skill alone does not establish the earlier
story or a dashboard launch. Recovered history does not create an operational
session, mark a story done, or change backlog or assignment facts.

Keep observations readable without the native sources after import. A later
scan may add evidence or fill a gap; replaying the same native response through
another file or a later collector must not increase its usage. Missing files,
unsupported older formats, incomplete workers and ambiguous joins remain
explicit coverage gaps. A missing measurement is not a measured zero, and a
coverage label describes retained evidence rather than promising provider-wide
accounting.

Cursor is not reconstructed: its local history holds no token usage. Make the
import repeatable, including when later live collection overlaps it. Terry
approved delivering this without a new usage UI. Verify by reading the stored
records and repeating the import, and report the earliest recovered date, counts
by host and coverage, and material gaps. The
[historical recovery research](../../docs/maintainer/dashboard-task-usage-research.md#recovering-earlier-launches)
records the sources and their limits.

Scope limits: no live collection scheduling, new usage or history UI, pricing
or billing reconciliation, Cursor reconstruction, or recovery from unavailable
native sources. Required restrictions protect attribution and privacy: do not
invent counters, origin or metadata, duplicate a response across tasks, or copy
raw prompts and transcripts into recovered records.

#### Key examples

- An old Codex slice-planning session whose launch record was pruned gains a
  history entry with its workflow, recoverable story metadata, and usage from
  its own responses and linked workers. With uncertain origin, it stays out of
  dashboard-launch counts.
- A Claude Code execution kept in launch history gains usage from its session
  and worker transcripts, with each API message counted once.
- Repeating the import leaves the same records and usage counts.
- Two tasks share a Codex conversation. Responses with known turn boundaries
  belong to their respective tasks once; an unresolved worker stays explicitly
  unattributed rather than appearing in both totals.
- An archived compressed Codex session has copied ancestor history and its own
  responses. Only its own response IDs count for it; an older file with no
  reliable response counters records unavailable usage, not zero.
- A recovered workflow names a story whose seed was later deleted. Its title
  and identity cite historical Git evidence. If that evidence cannot settle the
  reference or launch origin, those fields remain unknown. The record remains
  readable after native files are removed.
