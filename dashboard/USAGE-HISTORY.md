# Native usage in launch history

Usage is machine-local evidence in the dashboard's existing
`~/.open-dough/dashboard/launch-history/` store. `usage.json` is one document,
`{ format: "usage-history-v2", tasks, sessions, gaps }`: task units, session
contributions and coverage gaps, and no response; the native files stay that
evidence. Monthly `YYYY-MM.jsonl` launch records keep their format and reader.
Ordinary operational launch reads and writes do not scan native files or usage
history. There is no application database or new workflow authority (ADR 0008).

Run the offline importer from this repository with the `.node-version` Node:

```sh
node dashboard/server/importUsageHistory.ts import \
  --since '2026-09-16T00:00:00+08:00'
node dashboard/server/importUsageHistory.ts read
```

`--home <directory>` selects the machine home containing retained and
operational launch evidence. `--codex-root <directory>` selects an active Codex
rollout root and may be repeated; its defaults are `<home>/.codex/sessions` and
`<home>/.codex/archived_sessions`. Both plain `.jsonl` and zstd `.jsonl.zst`
rollouts are streamed. `--store <file>` selects an explicit alternate usage
document for both commands. `--since` uses recorded response timestamps,
including in-window responses of older sessions; the default cutoff above is
Singapore midnight, not UTC. `--claude-root <directory>` selects a Claude
transcript root and may be repeated; its default is `<home>/.claude/projects`.
`--responses <file>` also writes the responses an import read to that file:
`observations` and `associations`, keyed by response, hold each response once
with its measurements and resolved task; nothing reads it back. Native inputs
are read only. No API request, native session launch, billing lookup or
workflow mutation occurs. Use an isolated home/store for fixture experiments.

The retained-launch path reads active and archived Codex response usage,
including compressed rollouts and explicitly linked descendants, plus Claude
root and worker transcripts. It also reconstructs pruned tasks from native user
directives and the configured production project list, including hidden projects.
A retained task without an evidenced native turn boundary
keeps unavailable/unattributed usage; it is never assigned a conversation total.
An unsupported or unavailable source stays a coverage gap. An import report's
counts describe the history and the evidence read, not provider-wide accounting.

The containing rollout filename identifies its thread; copied ancestor metadata
and usage cannot claim ownership of that file. Workers join a retained task
only through an explicit parent-thread chain and the matching root turn. A
worker without task-turn evidence remains unassigned, even if its parent has
only one retained launch. Multiple task candidates and contradictory lineage
remain unassigned. A response that names no task is not kept once read: the
import result counts it, and a later import assigns it only while its native
files exist.

Damaged rows and compressed streams produce source-specific gaps while other
readable responses survive. A matching filename and response thread can retain
usage when session metadata is absent, with a metadata gap and unknown ancestry.
Legacy cumulative counters without reliable response usage produce an
`unsupported-response-counters` gap; metadata alone produces
`no-response-usage-evidence`. Referenced workers that are missing, incomplete or
ambiguous have explicit gaps. These local checks cannot prove auxiliary or
provider coverage beyond the retained files and references.

A retained task is a launch, identified by project, host, session and evidenced
initial turn (or retained launch time when unknown). A recovered task uses host,
session and native task turn; later metadata does not change its identity.
Matching retained turn or launch-reference evidence enriches that same task,
including Claude launches keyed by launch time. Launch workflow evidence wins
in both import and Refresh; recovered evidence fills a missing launch workflow,
and recovered-only tasks keep their skill. Requested model, effort, options and
policy stay on the task. Observed model, effort and service tier (Codex
`service_tier`, Claude `speed`) group session contributions, so settings may
change without rewriting launch requests. Launch sources name operational or
retained files; records copy no instructions, prompts or transcript bodies.

Recovered tasks have `kind: recovered`, nullable project/workflow/identity/title
and launch time, per-field `fieldSources`, and explicit gaps. A configured
repository, native cwd/common Git directory or recorded Git origin establishes
project membership; folder titles do not. Positively unrelated projects are
excluded with source gaps and `excludedUnrelatedTasks` /
`excludedUnrelatedObservations` report counts. Unknown project tasks stay separate.

Only an actual user workflow directive or supported host command wrapper supplies
workflow/story intent. Skill documents, fenced examples and incidental names do
not. The first user assignment can establish a task with unknown metadata;
later plain inputs continue the active task. Host-injected plugin lists,
AGENTS instructions, environment, skill and system context are classified by
content part before detecting assignments; genuine text in a mixed message
survives. A native task-start event alone proves lineage, not human intent.
`assignmentEvidence` retains supported/rejected native turn, exact source row,
timestamp when available and a bounded reason, without text. Explicit rejection
can withdraw a matching wrapper-derived start, while genuine assignment and
retained launch facts preserve eligibility and authoritative launch timing.
Legacy assignment-derived sources also survive when their native row disappears;
missing files alone never reject a task. A wrapper-only catalog entry remains
inspectable with unknown start and an `unsupported-task-assignment` gap. It is
excluded from claimed task populations and attribution; the report counts it as
`unsupportedAssignmentTasks`. Its sessions' contributions keep it as their
candidate after charges are withdrawn, also when read again. Correction
persists across replay and source removal; later positive assignment or launch
evidence returns that usage to the task, without the native files.

Native reporting references establish dashboard origin, explicit native-origin
evidence establishes native, and other tasks have unknown origin. Recovery
creates no operational launch.

Historical seed, plan, backlog and completion records are read from local Git at
the recorded session revision or a corroborated native Git read. An activity-time
reflog may support the native checkout's revision; a current default checkout
cannot substitute for a deleted worktree. Historical fields cite repository and
revision, including renamed/deleted stories. Unavailable objects and ambiguous
references stay unknown. A numeric `dough-execute-plan` argument selects only a
unique numbered quick or slice plan in that revision, following its recorded
source, including older “Source and outcome” sections. A labelled identity in
the same user message's Established start or Established preparation can supply
intent; it must agree with any explicit invocation reference. Later argumentless
invocations do not inherit prior intent, and incidental tool reads supply none.
Fenced examples and injected context cannot manufacture these references.
Completion of a story is distinct from a task reporting
receipt: only a matching structured receipt supplies a recovered reported outcome.
A matching retained returned-to-backlog receipt adds an outcome `disposition`
without changing its explicit report kind. `attention` preserves message presence
without copying its text. Stale receipt markers supply no return disposition.
Last native activity and native turn completion never mark a task or story done.
Known field conflicts retain competing `fieldClaims` and an explicit gap instead
of selecting the latest value. New evidence can fill unknown values, and removing
native files does not erase previously imported facts.

A native response has one key: host, owning session/thread and response/message
ID. While a session is read, its observation holds native identifiers,
timestamp, source file/line, observed settings, measurements and normalized
counters; its association names at most one task. Conflicting task candidates
stay unresolved. Repeated rows and files of one read reconcile into that
observation and never add its counters a second time. Neither record is stored;
`--responses` output shows them. Claude uses native `message.id`, never the
shared request ID or streaming row UUID, as the response identity. Repeated
streaming rows preserve their first and last recorded times; advancing
timestamps do not contradict task lineage. Claude input counters are already
disjoint. Cache creation lifetime fields only refine cache writes. A worker
retains its native `agentId` and joins its root through a recorded agent result
and parent UUID chain. A native human input's recorded dashboard reporting
reference (or a retained native input UUID) binds it to a launch. A repeated
reference can continue that same launch; a different launch reference selects
another task in the same session. A plain developer input adds its turn to the
active task's `nativeTurns`, even after a completion receipt, until a workflow
invocation or reporting context starts another task. Missing workers,
root transcripts, unsupported message identities and auxiliary work remain
explicit coverage gaps. Additional measurements may fill missing counters.
Conflicting measured values produce unknown affected counters and a
`contradictory-measurements` gap rather than choosing one value.

Claude measurements retain bounded `completion.stopReason` metadata: explicit
`null` identifies progressive output, recognized stop reasons identify a terminal
API response, and absent or unsupported markers remain unclassified. Only terminal
or unclassified measurements contribute final output and reasoning subsets;
explicit progressive-only output stays unknown with an `incomplete-output` gap.
Terminal output can settle earlier explicitly progressive snapshots for the same
message without adding snapshots or choosing the latest or largest value.
Conflicting terminal or unclassified facts still leave affected counters unknown.
A reread replaces the session's contribution with what its files then say;
measurements of an earlier read are not kept to compare. Inputs and cache
counters keep their existing definitions. Neither a native stop reason nor
`usage.iterations` supplies additional usage or completes the owning task or
story. The provider documents
[cumulative streaming usage](https://platform.claude.com/docs/en/build-with-claude/streaming)
and [response stop reasons](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons).

The distinct token categories are uncached input, cache reads, cache writes and
output. For Codex, reported input includes cached categories: uncached input is
input minus cache reads minus cache writes only when all components are known
and consistent. Missing values are `null`; explicit measured zero stays zero.
Reasoning output is a subset of output, not an additional total. Cache-write
lifetime fields refine cache writes, never add to them. Native total,
turn-cumulative, thread-cumulative, lifetime and compaction summaries are not
additional response charges. Each measurement preserves its original numeric
source fields and accounting definition.

`coverage: measured` means the response has all four core components; `partial`
means some are missing and `unavailable` means all are missing. It never means
complete provider or task coverage. A session contribution is what one native
session, read whole from all its files, adds to each task. Its entries group
its responses by sorted candidate tasks, observed model, effort, service tier
and contradictory lineage (`unresolved`), each keeping the response count, four
token subtotals, the five-minute and one-hour cache writes while every response
split them, the responses `missing` each category, those `unmeasured` and the
latest activity; no file list. An entry belongs to a task when exactly one
candidate's assignment holds, as root usage when its session is the task's,
else worker usage. `taskUsage(history, taskId)` sums a task's entries: each
category has an `unmeasured` count, and no measured component yields `null`,
even with no attributable responses. Inspect gaps before reading subtotals.

`writeUsageHistory(batch, file?)` in `dashboard/server/usageHistory.ts`
validates `UsageBatch` from `usageRecords.ts` and reconciles it with the stored
document under `<file>.lock`, replacing it atomically and durably. Pass every
response and gap of each session read, with its association: the write replaces
each such session's contribution with their sum and its gaps with the batch's,
so a session read again by import or Refresh counts once, with only the gaps it
still reports; other sessions keep theirs, native files gone or not. Response
IDs must match `responseKey(host, sessionId, responseId)`.
`readUsageHistory(file?)` reads without opening native files. The document is
serialized in one order (tasks and gaps as first recorded, sessions and entries
sorted), so equal content gives equal bytes. After normalization, alternating
import and Refresh over unchanged evidence keep history bytes and totals. Failed replacements keep prior history readable; retries count each response once. An unreadable document is preserved and refuses automatic overwrite. `read` prints the document. An earlier dashboard's store, a version 1
history or a manifest naming page files in `usage.json.pages/`, is read as the
starting history, its response rows summed into contributions. The first write,
an import's or a Refresh's, stores the document in its place, then removes
`usage.json.pages/` whole; a failed removal is finished by the next write. Back
up `usage.json` alone. A task's stored turns only grow across writes, so to apply
a changed turn rule, restore that backup and import once. System settings → Usage reads its derived `usage-task-summary.json`: a separate process rebuilds it when absent or
the document changes, without writing history. Current launch records say whether a launch finished. Refresh (`server/usageRefresh.ts`)
rereads, with the import's readers, every file of each known Codex or Claude session (`<session>/subagents/` workers included) one of
whose files changed since `usage-check.json`, or writes only its check record. Checked shows a later history write, otherwise the recorded
Refresh start time; the record's mtime distinguishes Refresh's own history write from a later import. The view keeps Checking active through
filter loads and Refresh's current-cohort reread. A failure retains the selected chart and Checked time beside its error, then enables Refresh.

The import result counts tasks and gaps from the history, and responses, also
in `summary`, from the evidence this import read. `configuredWork` contains
tasks with a configured project (including hidden projects) and recorded start,
last activity, or attributable response in the window. `unknownProjectWork` and
`outOfRosterWork` use separate task populations; `unassignedUsage` contains
responses with no uniquely supported task. Response populations are disjoint.
`files` counts every scanned native file, including unrelated and older files;
excluded unrelated task/response counts describe the current scan and are never
added to stored usage totals.

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

The [2026-11-15 recovery receipt](../docs/maintainer/usage-history-recovery-2026-11-15.md)
records the completed machine recovery, repeat reconciliation, categorized counts
and material coverage limits.

Claude parent traversal retains exact response, human task-boundary and
worker-join source rows. Intermediate parent links cite their native files;
shared ancestors are visited once and cycles remain unresolved. Associations
cite the task's session/root-turn/reporting-reference join evidence. Descriptive
and last-activity provenance remains on the task, so long chains and shared
timestamps do not multiply those sources into every response association.
