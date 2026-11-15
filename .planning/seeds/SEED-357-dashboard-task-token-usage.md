---
id: SEED-357
status: active
planted: 2026-11-14
planted_during: Terry requested token usage for tasks started from the dashboard
trigger_when: selected from the product backlog
scope: story
---

# SEED-357 — View token usage for dashboard-launched Codex tasks

<a id="keep-usage-history-within-a-small-disk-budget"></a>

### Keep usage history within a small disk budget

**Identity:** SEED-357#keep-usage-history-within-a-small-disk-budget
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/631-keep-usage-history-small/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0b8ae29bd60b1f8650f3a8482158bed0e715d2c149290a85b7eee1733678c427","plan":"0ab2a76cb68ea42676e3c672301c2dc23911be24ffb186982046c2bd965cbdda"}}
```

#### Goal

Terry, who views token usage on a machine with months of agent history, gets
the Usage view from a usage history that takes very little disk space. Usage
shows a few numbers per finished task, so what the dashboard keeps for it is
sized by the number of tasks and native sessions, in megabytes, and stays that
size however often usage is checked.

#### Scope

Measured on Terry's machine on 2026-11-15, read-only:
`~/.open-dough/dashboard/launch-history/usage.json.pages` holds 4.4 GB in
6,053 files. 2.8 GB of that (3,737 files) is referenced by nothing. The
1.6 GB in use is 0.99 GB of per-response observations and 0.49 GB of
per-response associations for 514,444 responses (641,591 measurements) from
9,719 native sessions in 12,513 files, against 16.6 MB for 2,925 tasks and
2.8 MB for 12,922 gaps. Grouped by task, model, effort, speed tier and root or
worker, those responses come to 3,207 totals. The native evidence the rows
were read from stays in the hosts' own session files and is not the
dashboard's to keep a second time.

**Budget.** The whole usage history for that present evidence takes at most
25 MB: the task catalog and coverage gaps as they are today (19.4 MB) and at
most 5 MB for session contributions (4.4 MB when built from the present store
with each session's file list included, which the history does not keep). A
new task adds under 10 KB. A check that finds no new evidence adds nothing.

Required behavior:

- The history keeps tasks with their attribution facts, coverage gaps, and
  one contribution per native session whose responses name a task: what
  those responses add to each task by model, effort and speed tier (response
  count, the four token categories, the responses missing each category, and
  latest activity). Whether a contribution is root or worker usage follows
  from its session and the task's. No per-response row is stored.
- Reading a session again replaces that session's earlier contribution, so a
  response is counted once however often it is read, by Refresh, by the
  offline import or by both in turn. A response that appears in several files
  of one session (observed for 301 Claude responses), or in a rollout that
  moved from live to archived, is counted once.
- A session whose native files have since been removed keeps its stored
  contribution, and its tasks keep their totals.
- The first Refresh or import with this story's dashboard converts the
  existing store: it carries over every task, gap and total, then removes
  `usage.json.pages` whole, including the unreferenced files. A failed or interrupted
  conversion leaves the earlier history readable, and the next check finishes
  the removal.
- A Refresh with no new rollout activity leaves the history's bytes
  unchanged and records only its check time. It finishes in the time it takes
  to see that no rollout changed, under 2 s on Terry's machine, in place of
  the 12–16 s the current writer spends. An import over unchanged evidence
  also leaves the history's bytes unchanged.
- Usage keeps showing the same tasks, Token index values, filters, "usage
  missing" coverage and "Outcome unknown" detail as before for the same
  native evidence. Conflicting measurements of one response still leave the
  affected category unknown with its gap, never a chosen or summed value.
- The same budget holds for every host whose usage this history records,
  including Claude Code usage from
  [SEED-359](SEED-359-claude-code-task-token-usage.md#view-claude-code-task-token-usage).
- The importer's result and its `read` command report tasks, gaps and totals
  from the history, and response-level counts from the evidence that import
  read. `dashboard/USAGE-HISTORY.md` describes the history as it then is.

Scope limits:

- Responses that belong to no task are not kept once read. The import result
  still counts them for the evidence it read; a later import assigns them
  only while their native files exist.
- Per-response inspection of the stored history ends with the per-response
  rows. An import can write the responses it read, with their measurements
  and task assignment, to a file the developer names; the native files stay
  the evidence.
- The task catalog's provenance (`fieldSources`, `fieldClaims`, `sources`
  and `assignmentEvidence`, 14.3 MB of the 16.6 MB) keeps its present form.
  Compacting it was considered and left out; the budget covers it.
- `import-reports/2026-11-15/` (42 MB) is one-off evidence of the
  2026-11-15 recovery that no dashboard code writes. Delivery of this story
  removes it from Terry's machine once and updates the
  [recovery receipt](../../docs/maintainer/usage-history-recovery-2026-11-15.md)
  that points at it. The dashboard gains no import-report writer or cleaner.
- The launch workflow a task stores, the "Checked" time after an import and
  the checking indication stay with
  [Keep usage task facts and freshness consistent across writers](#reuse-unchanged-usage-pages-on-repeated-writes).
  Until that story, an import and a Refresh in turn can still rewrite a
  launch task's workflow.

#### Key examples

- **Conversion.** A store like Terry's, 1.6 GB of referenced pages beside
  2.8 GB of unreferenced ones → the first Refresh → Usage shows the same tasks
  and Token index values as before, `usage.json.pages` is gone, and the
  history takes at most 25 MB.
- **Nothing new.** A converted history and no rollout activity since the last
  check → Refresh, twice → the history's bytes are identical after each, and
  only the "Checked" time moves.
- **New responses.** A finished task's rollout gains three responses →
  Refresh → the task's totals rise by exactly those three; a second Refresh
  and then an import change no value.
- **Evidence removed.** A task's rollout is deleted after it was read →
  Refresh, then import → the task keeps its totals and its point in the chart.
- **Moved rollout.** A rollout read under the live Codex sessions is archived
  → import → its responses are counted once.
- **Worker and second task.** One session carries two tasks and a worker
  session joins the first → after import and Refresh, each task's totals hold
  its own responses, with the worker's under the first task as worker usage.
- **Conflicting measurements.** One response is measured twice with different
  output counts → its task shows output as missing coverage, not a sum.
- **Growth.** One new finished task with a 400-response rollout → the history
  grows by under 10 KB.

#### Architecture

The unit of stored usage changes from the response to the **session
contribution**: what one native session, read whole from all its files, adds
to each task. Reading stays as it is. The host readers, lineage and
assignment still work on responses in memory and still reconcile repeated
rows and competing measurements there (`reconcileObservation`,
`reconcileMeasurements`). What changes is the write: the responses of each
session read are summed into that session's contribution, which replaces the
stored one. Task totals are the sum of contributions, which is what
`usageTaskSummary.ts` derives today from every response on each manifest
change. The summary keeps its place and its separate process, and now
derives from contributions without reading a response. The paged snapshot
and its partition reconciliation have one small successor. A contribution
keeps the candidate tasks its responses named, so a task that loses or
regains its assignment later still withdraws or regains its usage without
the native files. ADR 0008 holds: a
machine-local document under the existing lock, atomically replaced, no
database. Specs that assert per-response facts read them from the reader and
assignment result, not from the stored history.

<a id="reuse-unchanged-usage-pages-on-repeated-writes"></a>

### Keep usage task facts and freshness consistent across writers

**Identity:** SEED-357#reuse-unchanged-usage-pages-on-repeated-writes
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/630-reuse-unchanged-usage-pages/PLAN.md"}
```

**Goal.** A retrospective correction of the completed story View token usage
for dashboard-launched Codex tasks
(`git show 103b321ea58cb461e91669658db184b24ba48ee3:.planning/seeds/SEED-357-dashboard-task-token-usage.md`), for
Terry, who refreshes Usage and sometimes runs the offline import. A launch
task stores one workflow whichever writer wrote it last, so an import and a
Refresh in turn over unchanged evidence leave the usage history unchanged.
Usage's "Checked" time and checking indication also keep the freshness
promises of the corrected story.

**Scope.** A launch task stores its launch record's workflow in both the
importer and Refresh. "Checked" shows an offline import that wrote after the
last Refresh. Changing a filter during Refresh keeps the checking indication
until the Refresh ends. The usage fixture's recovered tasks record the skill
of their own workflow. This story follows
[Keep usage history within a small disk budget](#keep-usage-history-within-a-small-disk-budget),
which removed the paged store. That story's session contributions replace a
reread session's earlier usage, so the page-stability and tier-on-reread
corrections this story first carried are met there and are no longer part of
it. The [plan](../slice-plans/630-reuse-unchanged-usage-pages/PLAN.md) was
written before that change: its slice 1 is dropped, and the proofs of its
slices 2 to 4 that observe page files and manifest bytes are replanned
against the small history before execution. Its findings 2 to 5 and their
observations still describe this story.
