# Native usage in launch history

Usage is machine-local evidence in the dashboard's existing
`~/.open-dough/dashboard/launch-history/` store. `usage.json` contains task units,
native response observations, task associations and coverage gaps. Monthly
`YYYY-MM.jsonl` launch records keep their existing format and reader. Ordinary
operational launch reads and writes do not scan native files or usage history.
There is no application database or new workflow authority (ADR 0008).

Run the offline importer with the Node version in `.node-version`, from this
repository:

```sh
node dashboard/server/importUsageHistory.ts import \
  --since '2026-09-16T00:00:00+08:00'
node dashboard/server/importUsageHistory.ts read
```

`--home <directory>` selects the machine home containing retained and operational
launch evidence. `--codex-root <directory>` selects an active Codex rollout root
and may be repeated; its defaults are `<home>/.codex/sessions` and
`<home>/.codex/archived_sessions`. Both plain `.jsonl` and zstd `.jsonl.zst`
rollouts are streamed. `--store <file>`
selects an explicit alternate usage document for both commands. `--since` uses
recorded response timestamps, including in-window responses of older sessions;
the default cutoff above is midnight Singapore time, not UTC midnight. `--claude-root <directory>` selects a Claude transcript root and may be repeated;
its default is `<home>/.claude/projects`. Native
inputs are read only. No API request, native session launch, billing lookup or
workflow mutation occurs. Use an isolated home/store for fixture experiments.

The retained-launch path reads active and archived Codex response usage,
including compressed rollouts and explicitly linked descendants, plus Claude
root and worker transcripts. It also reconstructs pruned tasks from native user
directives and the configured production project list, including hidden projects.
A retained task without an evidenced native turn boundary
keeps unavailable/unattributed usage; it is never assigned a conversation total.
An unsupported or unavailable source stays a coverage gap. An import report's
counts describe persisted evidence, not provider-wide accounting.

The containing rollout filename identifies its thread; copied ancestor metadata
and usage cannot claim ownership of that file. Workers join a retained task only
through an explicit parent-thread chain and the matching root turn. A worker
without task-turn evidence remains unassigned, even if its parent has only one
retained launch. Multiple task candidates and contradictory lineage remain
unassigned. Associations retain the supporting native metadata source locations.
Native response observations survive without a retained task for later recovery;
observations without a supported task boundary remain unassigned.

Damaged rows and compressed streams produce source-specific gaps while other
readable responses survive. A matching filename and response thread can retain
usage when session metadata is absent, with a metadata gap and unknown ancestry.
Legacy cumulative counters without reliable response usage produce an
`unsupported-response-counters` gap; metadata alone produces
`no-response-usage-evidence`. Referenced workers that are missing, incomplete or
ambiguous have explicit gaps. These local checks cannot prove auxiliary or
provider coverage beyond the retained files and references.

A retained task is a launch, identified by project, host, session and evidenced
initial turn (or retained launch time when that turn is unknown). A recovered
task uses host, session and native task turn; later metadata does not change its
identity. Matching retained turn or launch-reference evidence enriches that same
task, including Claude launches whose retained key uses launch time. Requested model,
effort, workflow options and policy stay on the task. Observed model, effort,
approval policy and sandbox stay on response observations, so settings may
change within one task without rewriting its launch request. Launch source
references point to operational or retained history files. The importer copies
no launch instructions, prompts or transcript bodies into usage records.

Recovered tasks have `kind: recovered`, nullable project/workflow/identity/title
and launch time, per-field `fieldSources`, and explicit gaps. A configured
repository, native cwd/common Git directory or recorded Git origin establishes
project membership; folder titles do not. Positively unrelated projects are
excluded with source gaps and `excludedUnrelatedTasks` /
`excludedUnrelatedObservations` report counts. Unknown project tasks stay separate.

Only an actual user workflow directive or supported host command wrapper supplies
workflow/story intent. Skill documents, fenced examples and incidental names do
not. The first user assignment can establish a task with unknown metadata;
ordinary later Claude follow-ups remain ambiguous. Native reporting references
establish dashboard origin, explicit native-origin evidence establishes native,
and other tasks have unknown origin. Recovery creates no operational launch.

Historical seed, plan, backlog and completion records are read from local Git at
the recorded session revision or a corroborated native Git read. An activity-time
reflog may support the native checkout's revision; a current default checkout
cannot substitute for a deleted worktree. Historical fields cite repository and
revision, including renamed/deleted stories. Unavailable objects and ambiguous
references stay unknown. Completion of a story is distinct from a task reporting
receipt: only a matching structured receipt supplies a recovered reported outcome.
A matching retained returned-to-backlog receipt adds an outcome `disposition`
without changing its explicit report kind. `attention` preserves message presence
without copying its text. Stale receipt markers supply no return disposition.
Last native activity and native turn completion never mark a task or story done.
Known field conflicts retain competing `fieldClaims` and an explicit gap instead
of selecting the latest value. New evidence can fill unknown values, and removing
native files does not erase previously imported facts.

A native response has one key: host, owning session/thread and response/message
ID. `observations` holds its native identifiers, timestamp, source file/line,
observed settings, measurements and normalized counters. `associations` names
at most one task for that key. Conflicting task candidates stay unresolved.
Repeated rows, files and later collector replay reconcile that same observation;
they never add its counters a second time. Source measurements remain inspectable.
Claude uses native `message.id`, never the shared request ID or streaming row
UUID, as the response identity. Repeated streaming rows preserve their first
and last recorded times; advancing timestamps do not contradict task lineage.
Claude input counters are already disjoint. Cache creation lifetime fields only
refine cache writes. A worker retains its native `agentId` and joins its root
through a recorded agent result and parent UUID chain. A native human input's
recorded dashboard reporting reference (or a retained native input UUID) binds
it to a launch. A repeated reference can continue that same launch; a different
launch reference selects another task in the same session. Unclassified human
follow-ups have an unknown task boundary and remain unassigned with a lineage
gap; their parent conversation alone does not establish continuing task scope.
Missing workers, root transcripts, unsupported message identities and auxiliary
work remain explicit coverage gaps.

Additional measurements may fill missing counters. Conflicting measured values
produce unknown affected counters and a `contradictory-measurements` gap rather
than choosing one value.

The distinct token categories are uncached input, cache reads, cache writes and
output. For Codex, reported input includes cached categories: uncached input is
input minus cache reads minus cache writes only when all components are known
and consistent. Missing values are `null`; explicit measured zero stays zero.
Reasoning output is a subset of output, not an additional total. Cache-write
lifetime fields refine cache writes, never add to them. Native total,
turn-cumulative, thread-cumulative, lifetime and compaction summaries are not
additional response charges. Each measurement preserves its original numeric
source fields and accounting definition.

`coverage: measured` means the response has all four core components;
`partial` means some are missing and `unavailable` means all are missing. It
never means complete provider or task coverage. `taskUsage(history, taskId)`
derives measured subtotals from uniquely associated responses. Each category
has a corresponding `unmeasured` count; no measured component yields `null`,
including a task with no attributable responses. Inspect gaps before interpreting
those subtotals.

Shared collectors and readers use `dashboard/server/usageHistory.ts`:

- `writeUsageHistory(batch, file?)` validates and reconciles `UsageBatch` from
  `usageRecords.ts`, holding the existing machine-document lock across its
  read/modify/atomic durable replacement. Pass native measurements, task facts
  and associations; do not increment previously stored totals. Response IDs
  must match `responseKey(host, sessionId, responseId)`.
- `readUsageHistory(file?)` reads imported facts without opening native files.
- `taskUsage(history, taskId)` derives one task's categorized usage on demand.

A failed write retains the prior readable document; retrying imports missing
facts once. An unreadable usage document is preserved and refuses automatic
overwrite. Importing and reading remain useful after native files disappear.

The import result includes `summary`, recomputed from a fresh persisted read.
`configuredWork` contains tasks with a configured project (including hidden
projects) and recorded start, last activity, or attributable response in the
window. `unknownProjectWork` and `outOfRosterWork` use separate task populations;
`unassignedUsage` contains responses with no uniquely supported task. Response
populations are disjoint. `files` counts every scanned native file, including
unrelated and older files; excluded unrelated task/response counts describe the
current scan and are never added to persisted usage totals.

Each population reports host counts, response/task coverage, four disjoint token
subtotals, and the count of responses missing each component. Missing task fields
are counted from their current values; `taskGapProvenance` and
`retainedGapProvenance` preserve earlier evidence limitations and may survive
later enrichment. `currentScanGaps` counts warnings encountered by this scan
across all sources/retained tasks; it is separate from those retained facts and
from the configured-work denominator. Coverage describes retained evidence.

`earliestTaskStart` preserves an older original start. `firstInWindowActivity`
is the earliest supported in-window start, recorded activity, or attributable
response; `earliestUsage` uses response timestamps only. Tasks with only known
older dates are `outsideWindowTasks` (no evidenced in-window activity); tasks
with neither supported dates nor in-window associations are
`unresolvedWindowTasks`. Undated response observations are counted separately
and excluded from dated token subtotals. A task with no attributable response has
unavailable usage, even when its activity date is known.

The [2026-11-15 recovery investigation](../docs/maintainer/usage-history-recovery-2026-11-15.md)
records current diagnostics; successful machine recovery and repeat reconciliation
remain unfinished.

Claude parent traversal retains exact response, human task-boundary and
worker-join source rows. Intermediate parent links cite their native files;
shared ancestors are visited once and cycles remain unresolved. Associations
cite the task's session/root-turn/reporting-reference join evidence. Descriptive
and last-activity provenance remains on the task, so long chains and shared
timestamps do not multiply those sources into every response association.
